import { create } from 'zustand';
import { Task } from '../types';
import { tasksRepository } from '../database/tasksRepository';
import { supabase } from '../lib/supabase';

interface TasksStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (id: string) => void;
}

export const useTasksStore = create<TasksStore>((set) => ({
  tasks: [],
  loading: false,
  error: null,
  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await tasksRepository.getAll();
      set({ tasks, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
}));

export const subscribeToTasks = () => {
  const channel = supabase
    .channel('public:tasks')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks' },
      (payload) => {
        const { addTask, updateTask, removeTask } = useTasksStore.getState();
        if (payload.eventType === 'INSERT') {
          addTask(payload.new as Task);
        } else if (payload.eventType === 'UPDATE') {
          updateTask(payload.new as Task);
        } else if (payload.eventType === 'DELETE') {
          removeTask(payload.old.id);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
