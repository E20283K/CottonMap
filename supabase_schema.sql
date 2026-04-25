-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable PostGIS for advanced geospatial (optional but recommended)
create extension if not exists postgis;

-- FIELDS TABLE
create table public.fields (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  label        text,
  field_type   text check (field_type in ('sector', 'block')) not null default 'block',
  parent_id    uuid references public.fields(id) on delete cascade,
  polygon_json jsonb not null,         -- array of {latitude, longitude} objects
  area_hectares numeric(10, 4),
  variety      text,
  season       text,
  notes        text,
  color        text default '#4CAF50',
  centroid_lat numeric,
  centroid_lng numeric,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- TASKS TABLE
create table public.tasks (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  field_id     uuid references public.fields(id) on delete cascade not null,
  title        text not null,
  task_type    text,
  priority     text check (priority in ('low', 'medium', 'high')) default 'medium',
  status       text check (status in ('pending', 'in_progress', 'done')) default 'pending',
  due_date     timestamptz,
  assigned_to  text,
  notes        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- AUTO-UPDATE updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger fields_updated_at
  before update on public.fields
  for each row execute function update_updated_at();

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function update_updated_at();

-- ROW LEVEL SECURITY (each farmer sees only their own data)
alter table public.fields enable row level security;
alter table public.tasks enable row level security;

create policy "Users manage own fields" on public.fields
  for all using (auth.uid() = user_id);


create policy "Users manage own tasks" on public.tasks
  for all using (auth.uid() = user_id);


-- RESOURCE TYPES (global catalog, shared across all fields)
create table public.resource_types (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  name          text not null,              -- e.g. "Fertilizer", "Gasoline"
  unit          text not null,              -- e.g. "kg", "liters", "bags", "tons"
  icon          text default 'cube',        -- icon name from MaterialCommunityIcons
  color         text default '#4CAF50',     -- hex color for UI
  low_stock_threshold numeric default 0,   -- warn when balance <= this
  created_at    timestamptz default now()
);

-- FIELD RESOURCE INVENTORY (current balance per resource per field)
create table public.field_resources (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  field_id          uuid references public.fields(id) on delete cascade not null,
  resource_type_id  uuid references public.resource_types(id) on delete cascade not null,
  current_balance   numeric(12, 3) default 0,   -- auto-maintained by trigger
  low_stock_alert   boolean default false,        -- true when balance <= threshold
  last_updated      timestamptz default now(),
  unique(field_id, resource_type_id)             -- one record per resource per field
);

-- RESOURCE TRANSACTIONS (every in/out movement)
create table public.resource_transactions (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  field_id          uuid references public.fields(id) on delete cascade not null,
  resource_type_id  uuid references public.resource_types(id) on delete cascade not null,
  transaction_type  text check (
                      transaction_type in ('incoming', 'outgoing')
                    ) not null,
  quantity          numeric(12, 3) not null check (quantity > 0),
  balance_after     numeric(12, 3),         -- snapshot of balance after this tx
  unit_price        numeric(12, 2),         -- optional cost per unit
  total_cost        numeric(12, 2),         -- quantity × unit_price
  supplier          text,                   -- incoming: who supplied it
  applied_by        text,                   -- outgoing: worker who applied it
  reason            text,                   -- outgoing: why used (e.g. "1st irrigation")
  notes             text,
  transaction_date  timestamptz default now(),
  created_at        timestamptz default now()
);

-- TRIGGER: auto-update field_resources.current_balance after every transaction
create or replace function update_resource_balance()
returns trigger as $$
declare
  v_balance numeric;
  v_threshold numeric;
begin
  -- Calculate new balance
  select
    coalesce(sum(case when transaction_type = 'incoming' then quantity else -quantity end), 0)
  into v_balance
  from resource_transactions
  where field_id = NEW.field_id
    and resource_type_id = NEW.resource_type_id;

  -- Get low stock threshold
  select low_stock_threshold into v_threshold
  from resource_types where id = NEW.resource_type_id;

  -- Upsert the inventory record
  insert into public.field_resources
    (user_id, field_id, resource_type_id, current_balance, low_stock_alert, last_updated)
  values
    (NEW.user_id, NEW.field_id, NEW.resource_type_id,
     v_balance, v_balance <= v_threshold, now())
  on conflict (field_id, resource_type_id)
  do update set
    current_balance = v_balance,
    low_stock_alert = v_balance <= v_threshold,
    last_updated = now();

  -- Write balance snapshot to the transaction row
  update resource_transactions
  set balance_after = v_balance
  where id = NEW.id;

  return NEW;
end;
$$ language plpgsql;

create trigger trg_update_resource_balance
  after insert on public.resource_transactions
  for each row execute function update_resource_balance();

-- ROW LEVEL SECURITY
alter table public.resource_types        enable row level security;
alter table public.field_resources       enable row level security;
alter table public.resource_transactions enable row level security;

create policy "Users manage own resource types"
  on public.resource_types for all using (auth.uid() = user_id);

create policy "Users manage own field resources"
  on public.field_resources for all using (auth.uid() = user_id);

create policy "Users manage own transactions"
  on public.resource_transactions for all using (auth.uid() = user_id);
