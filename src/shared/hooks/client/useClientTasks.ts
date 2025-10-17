import useSWR from 'swr';
import { supabase } from '@/integrations/supabase/client';
import { ClientTask } from '@/types/client.types';

const fetchClientTasks = async (clientId: string): Promise<ClientTask[]> => {
  const { data, error } = await supabase
    .from('client_tasks')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Failed to load client tasks from Supabase', error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((task) => ({
    ...task,
    description: task.description ?? null,
    priority: (task.priority ?? 'medium') as ClientTask['priority'],
    subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
  }));
};

export function useClientTasks(clientId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    clientId ? ['client-tasks', clientId] : null,
    () => fetchClientTasks(clientId!)
  );

  return {
    tasks: data ?? [],
    error,
    isLoading,
    mutate,
  };
}
