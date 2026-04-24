-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable PostGIS for advanced geospatial (optional but recommended)
create extension if not exists postgis;

-- FIELDS TABLE
create table public.fields (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  polygon_json jsonb not null,         -- array of {latitude, longitude} objects
  area_hectares numeric(10, 4),
  variety      text,
  season       text,
  notes        text,
  color        text default '#4CAF50',
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
