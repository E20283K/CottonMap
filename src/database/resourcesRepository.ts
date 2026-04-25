import { supabase } from '../lib/supabase';
import { NewTransaction } from '../types/resources';

export const resourcesRepository = {
  // Resource Types
  async getResourceTypes() {
    const { data, error } = await supabase
      .from('resource_types')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async createResourceType(type: Partial<any>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('resource_types')
      .insert({ ...type, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateResourceType(id: string, updates: Partial<any>) {
    const { data, error } = await supabase
      .from('resource_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteResourceType(id: string) {
    const { error } = await supabase
      .from('resource_types')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Field Inventory
  async getFieldResources(fieldId: string) {
    const { data, error } = await supabase
      .from('field_resources')
      .select(`
        *,
        resource_type:resource_types(*)
      `)
      .eq('field_id', fieldId)
      .order('last_updated', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAllFieldsResourceSummary() {
    const { data, error } = await supabase
      .from('field_resources')
      .select(`
        *,
        field:fields(id, name, color),
        resource_type:resource_types(name, unit, icon, color, low_stock_threshold)
      `)
      .order('low_stock_alert', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Transactions
  async getTransactions(fieldId: string, resourceTypeId: string) {
    const { data, error } = await supabase
      .from('resource_transactions')
      .select(`*, resource_type:resource_types(name, unit, icon)`)
      .eq('field_id', fieldId)
      .eq('resource_type_id', resourceTypeId)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addTransaction(transaction: NewTransaction) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('resource_transactions')
      .insert({ ...transaction, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTransaction(transactionId: string, fieldId: string, resourceTypeId: string) {
    const { error } = await supabase
      .from('resource_transactions')
      .delete()
      .eq('id', transactionId);
    if (error) throw error;
    
    // Manually recalculate balance after deletion because triggers usually only fire on INSERT
    await this.recalculateBalance(fieldId, resourceTypeId);
  },

  async recalculateBalance(fieldId: string, resourceTypeId: string) {
    const { data } = await supabase
      .from('resource_transactions')
      .select('transaction_type, quantity')
      .eq('field_id', fieldId)
      .eq('resource_type_id', resourceTypeId);

    if (!data) return;

    const balance = data.reduce((sum, tx) =>
      tx.transaction_type === 'incoming'
        ? sum + Number(tx.quantity)
        : sum - Number(tx.quantity), 0);

    const { data: typeData } = await supabase
      .from('resource_types')
      .select('low_stock_threshold')
      .eq('id', resourceTypeId)
      .single();

    const lowStockAlert = typeData ? balance <= typeData.low_stock_threshold : false;

    await supabase
      .from('field_resources')
      .update({ 
        current_balance: balance, 
        low_stock_alert: lowStockAlert,
        last_updated: new Date().toISOString() 
      })
      .eq('field_id', fieldId)
      .eq('resource_type_id', resourceTypeId);
  },
};
