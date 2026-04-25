import { create } from 'zustand';
import { resourcesRepository } from '../database/resourcesRepository';
import { ResourceType, FieldResource, ResourceTransaction, NewTransaction } from '../types/resources';
import { supabase } from '../lib/supabase';

interface ResourcesState {
  resourceTypes: ResourceType[];
  fieldResources: Record<string, FieldResource[]>; // keyed by fieldId
  transactions: Record<string, ResourceTransaction[]>; // keyed by `${fieldId}-${resourceTypeId}`
  allSummary: FieldResource[];
  loading: boolean;

  fetchResourceTypes: () => Promise<void>;
  fetchFieldResources: (fieldId: string) => Promise<void>;
  fetchTransactions: (fieldId: string, resourceTypeId: string) => Promise<void>;
  fetchAllSummary: () => Promise<void>;
  addTransaction: (tx: NewTransaction) => Promise<void>;
  deleteTransaction: (txId: string, fieldId: string, resourceTypeId: string) => Promise<void>;
  subscribeToChanges: () => () => void;
}

export const useResourcesStore = create<ResourcesState>((set, get) => ({
  resourceTypes: [],
  fieldResources: {},
  transactions: {},
  allSummary: [],
  loading: false,

  fetchResourceTypes: async () => {
    set({ loading: true });
    try {
      const types = await resourcesRepository.getResourceTypes();
      // Deduplicate by name for clean UI
      const uniqueTypes = types.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
      set({ resourceTypes: uniqueTypes });
    } catch (error) {
      console.error('Error fetching resource types:', error);
    } finally {
      set({ loading: false });
    }
  },

  addResourceType: async (type: { name: string, unit: string, icon: string, low_stock_threshold: number }) => {
    try {
      const newType = await resourcesRepository.createResourceType(type);
      set(state => ({ resourceTypes: [...state.resourceTypes, newType] }));
      return newType;
    } catch (error) {
      console.error('Error adding resource type:', error);
      throw error;
    }
  },

  updateResourceType: async (id: string, updates: any) => {
    try {
      const updated = await resourcesRepository.updateResourceType(id, updates);
      set(state => ({
        resourceTypes: state.resourceTypes.map(t => t.id === id ? updated : t)
      }));
      return updated;
    } catch (error) {
      console.error('Error updating resource type:', error);
      throw error;
    }
  },

  deleteResourceType: async (id: string) => {
    try {
      await resourcesRepository.deleteResourceType(id);
      set(state => ({
        resourceTypes: state.resourceTypes.filter(t => t.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting resource type:', error);
      throw error;
    }
  },

  fetchFieldResources: async (fieldId: string) => {
    try {
      const resources = await resourcesRepository.getFieldResources(fieldId);
      set((state) => ({
        fieldResources: { ...state.fieldResources, [fieldId]: resources }
      }));
    } catch (error) {
      console.error('Error fetching field resources:', error);
    }
  },

  fetchTransactions: async (fieldId: string, resourceTypeId: string) => {
    try {
      const txs = await resourcesRepository.getTransactions(fieldId, resourceTypeId);
      set((state) => ({
        transactions: {
          ...state.transactions,
          [`${fieldId}-${resourceTypeId}`]: txs
        }
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  },

  fetchAllSummary: async () => {
    set({ loading: true });
    try {
      const summary = await resourcesRepository.getAllFieldsResourceSummary();
      set({ allSummary: summary });
    } catch (error) {
      console.error('Error fetching all summary:', error);
    } finally {
      set({ loading: false });
    }
  },

  addTransaction: async (tx: NewTransaction) => {
    try {
      await resourcesRepository.addTransaction(tx);
      // Triggers update the balance automatically, so we just refresh
      get().fetchFieldResources(tx.field_id);
      get().fetchTransactions(tx.field_id, tx.resource_type_id);
      get().fetchAllSummary();
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  deleteTransaction: async (txId: string, fieldId: string, resourceTypeId: string) => {
    try {
      await resourcesRepository.deleteTransaction(txId, fieldId, resourceTypeId);
      get().fetchFieldResources(fieldId);
      get().fetchTransactions(fieldId, resourceTypeId);
      get().fetchAllSummary();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  subscribeToChanges: () => {
    const channel = supabase
      .channel('resource-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'resource_transactions' },
        (payload) => {
          const tx = payload.new as ResourceTransaction;
          if (tx && tx.field_id) {
            get().fetchFieldResources(tx.field_id);
            if (tx.resource_type_id) {
               get().fetchTransactions(tx.field_id, tx.resource_type_id);
            }
          }
          get().fetchAllSummary();
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'field_resources' },
        (payload) => {
          const fr = payload.new as FieldResource;
          if (fr && fr.field_id) {
            get().fetchFieldResources(fr.field_id);
          }
          get().fetchAllSummary();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}));
