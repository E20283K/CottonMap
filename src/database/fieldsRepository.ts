import { supabase } from '../lib/supabase';
import { Field } from '../types';

export const fieldsRepository = {
  async getAll() {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Field[];
  },

  async create(field: Omit<Field, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('fields')
      .insert({ ...field, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data as Field;
  },

  async update(id: string, updates: Partial<Field>) {
    const { data, error } = await supabase
      .from('fields')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Field;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('fields')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
