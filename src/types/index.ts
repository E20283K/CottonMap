export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Field {
  id: string;
  user_id: string;
  name: string;
  polygon_json: LatLng[];
  area_hectares: number;
  variety?: string;
  season?: string;
  notes?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  field_id: string;
  title: string;
  task_type?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'done';
  due_date?: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
