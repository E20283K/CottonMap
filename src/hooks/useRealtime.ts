import { useEffect } from 'react';
import { subscribeToFields } from '../store/useFieldsStore';
import { subscribeToTasks } from '../store/useTasksStore';

export const useRealtime = () => {
  useEffect(() => {
    const unsubFields = subscribeToFields();
    const unsubTasks = subscribeToTasks();

    return () => {
      unsubFields();
      unsubTasks();
    };
  }, []);
};
