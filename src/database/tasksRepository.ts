import { supabase } from '../lib/supabase';
import { Task } from '../types';

export const tasksRepository = {
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Task[];
  },

  async getByField(fieldId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('field_id', fieldId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Task[];
  },

  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  },

  async update(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
