import useSWR from 'swr';
import { supabase } from '@/integrations/supabase/client';
import { ClientTask } from '@/types/client.types';
import { sampleClients } from '@/data/sampleClients';

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task-${Math.random().toString(36).slice(2, 11)}`;
};

const mapSampleTodosToTasks = (clientId: string): ClientTask[] => {
  const sampleClient = sampleClients.find((client) => client.id === clientId);
  if (!sampleClient?.todos?.length) {
    return [];
  }

  return sampleClient.todos.map((todo) => ({
    id: todo.id ?? generateId(),
    user_id: 'sample-user',
    client_id: clientId,
    title: todo.text,
    description: null,
    completed: Boolean(todo.completed),
    priority: (todo.priority ?? 'medium') as ClientTask['priority'],
    due_date: todo.due_date ?? null,
    subtasks: todo.subtasks ?? [],
    created_at: sampleClient.created_at,
    updated_at: sampleClient.updated_at,
    completed_at: todo.completed ? sampleClient.updated_at : null,
  }));
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const fetchClientTasks = async (clientId: string): Promise<ClientTask[]> => {
  if (!isUuid(clientId)) {
    return mapSampleTodosToTasks(clientId);
  }

  const { data, error } = await supabase
    .from('client_onboarding_tasks')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Failed to load client tasks from Supabase', error);
    return mapSampleTodosToTasks(clientId);
  }

  if (!data || data.length === 0) {
    return mapSampleTodosToTasks(clientId);
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
