export interface ResourceType {
  id: string;
  user_id: string;
  name: string;
  unit: string;
  icon: string;
  color: string;
  low_stock_threshold: number;
  created_at: string;
}

export interface FieldResource {
  id: string;
  field_id: string;
  resource_type_id: string;
  current_balance: number;
  low_stock_alert: boolean;
  last_updated: string;
  resource_type: ResourceType;
  field?: { id: string; name: string; color: string };
}

export interface ResourceTransaction {
  id: string;
  field_id: string;
  resource_type_id: string;
  transaction_type: 'incoming' | 'outgoing';
  quantity: number;
  balance_after: number;
  unit_price?: number;
  total_cost?: number;
  supplier?: string;
  applied_by?: string;
  reason?: string;
  notes?: string;
  transaction_date: string;
  resource_type?: ResourceType;
}

export interface NewTransaction {
  field_id: string;
  resource_type_id: string;
  transaction_type: 'incoming' | 'outgoing';
  quantity: number;
  unit_price?: number;
  supplier?: string;
  applied_by?: string;
  reason?: string;
  notes?: string;
  transaction_date: string;
}
