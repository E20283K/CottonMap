import { create } from 'zustand';
import { Field } from '../types';
import { fieldsRepository } from '../database/fieldsRepository';
import { supabase } from '../lib/supabase';

interface FieldsStore {
  fields: Field[];
  loading: boolean;
  error: string | null;
  fetchFields: () => Promise<void>;
  addField: (field: Field) => void;
  updateField: (field: Field) => void;
  removeField: (id: string) => void;
}

export const useFieldsStore = create<FieldsStore>((set, get) => ({
  fields: [],
  loading: false,
  error: null,
  fetchFields: async () => {
    set({ loading: true, error: null });
    try {
      const fields = await fieldsRepository.getAll();
      set({ fields, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  addField: (field) => set((state) => ({ fields: [field, ...state.fields] })),
  updateField: (field) =>
    set((state) => ({
      fields: state.fields.map((f) => (f.id === field.id ? field : f)),
    })),
  removeField: (id) =>
    set((state) => ({
      fields: state.fields.filter((f) => f.id !== id),
    })),
}));

// Real-time subscription setup
export const subscribeToFields = () => {
  const channel = supabase
    .channel('public:fields')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'fields' },
      (payload) => {
        const { addField, updateField, removeField } = useFieldsStore.getState();
        if (payload.eventType === 'INSERT') {
          addField(payload.new as Field);
        } else if (payload.eventType === 'UPDATE') {
          updateField(payload.new as Field);
        } else if (payload.eventType === 'DELETE') {
          removeField(payload.old.id);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
