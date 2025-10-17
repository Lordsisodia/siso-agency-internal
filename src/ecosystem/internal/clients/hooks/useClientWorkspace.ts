import { useClientDetails } from '@/shared/hooks/client/useClientDetails';
import { useClientTasks } from '@/shared/hooks/client/useClientTasks';
import { ClientData, ClientTask } from '@/types/client.types';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TimelineEvent {
  id: string;
  title: string;
  occurred_at: string;
  category: string;
  summary?: string | null;
}

interface ClientDocument {
  id: string;
  title: string;
  updated_at: string;
  content: string | null;
  document_type?: string | null;
}

interface ClientWorkspaceState {
  client: ClientData | null;
  tasks: ClientTask[];
  timeline: TimelineEvent[];
  documents: ClientDocument[];
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
  mutations: {
    updateClient: (updates: Partial<ClientData>) => Promise<void>;
    refreshAll: () => Promise<void>;
    refreshTasks: () => Promise<void>;
    createTask: (payload: Partial<ClientTask>) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<ClientTask>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    createEvent: (payload: Partial<TimelineEvent>) => Promise<void>;
    updateEvent: (eventId: string, updates: Partial<TimelineEvent>) => Promise<void>;
    deleteEvent: (eventId: string) => Promise<void>;
    createDocument: (payload: Partial<ClientDocument>) => Promise<void>;
    updateDocument: (docId: string, updates: Partial<ClientDocument>) => Promise<void>;
    deleteDocument: (docId: string) => Promise<void>;
  };
}

export function useClientWorkspace(clientId: string | null): ClientWorkspaceState {
  const {
    clientData,
    loading,
    error,
    updateClient,
    isUpdating,
  } = useClientDetails(clientId || null);

  const {
    tasks,
    mutate: mutateTasks,
    isLoading: tasksLoading,
  } = useClientTasks(clientId || undefined);

  const timeline: TimelineEvent[] = useMemo(() => {
    // Placeholder until dedicated timeline data exists.
    if (!clientData) return [];
    const baseEvents: TimelineEvent[] = [];

    if (clientData.created_at) {
      baseEvents.push({
        id: `${clientData.id}-created`,
        title: 'Client added to SISO',
        occurred_at: clientData.created_at,
        category: 'milestone',
        summary: 'Client onboarding record created.',
      });
    }

    if (clientData.updated_at && clientData.updated_at !== clientData.created_at) {
      baseEvents.push({
        id: `${clientData.id}-updated`,
        title: 'Latest update',
        occurred_at: clientData.updated_at,
        category: 'activity',
        summary: 'Client data received recent updates.',
      });
    }

    return baseEvents.sort(
      (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
    );
  }, [clientData]);

  const documents: ClientDocument[] = useMemo(() => {
    // Placeholder dataset until docs hook is wired.
    return [
      {
        id: `${clientId}-brief`,
        title: 'Client Brief Template',
        updated_at: clientData?.updated_at ?? new Date().toISOString(),
        content: clientData?.brief ?? null,
        document_type: 'brief',
      },
    ];
  }, [clientId, clientData]);

  const handleUpdateClient = async (updates: Partial<ClientData>) => {
    await updateClient(updates);
  };

  const handleRefresh = async () => {
    await mutateTasks();
  };

  const handleCreateTask = async (payload: Partial<ClientTask>) => {
    if (!clientId) return;

    await supabase.from('client_onboarding_tasks').insert({
      client_id: clientId,
      user_id: client?.user_id ?? null,
      title: payload.title ?? 'New task',
      description: payload.description ?? null,
      priority: payload.priority ?? 'medium',
      due_date: payload.due_date ?? null,
      completed: payload.completed ?? false,
      subtasks: payload.subtasks ?? [],
    });

    await mutateTasks();
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<ClientTask>) => {
    const updatePayload: Record<string, unknown> = {};

    if (typeof updates.title !== 'undefined') updatePayload.title = updates.title;
    if (typeof updates.description !== 'undefined') updatePayload.description = updates.description;
    if (typeof updates.priority !== 'undefined') updatePayload.priority = updates.priority;
    if (typeof updates.due_date !== 'undefined') updatePayload.due_date = updates.due_date;
    if (typeof updates.completed !== 'undefined') updatePayload.completed = updates.completed;
    if (typeof updates.subtasks !== 'undefined') updatePayload.subtasks = updates.subtasks;

    if (Object.keys(updatePayload).length === 0) {
      return;
    }

    await supabase.from('client_onboarding_tasks').update(updatePayload).eq('id', taskId);

    await mutateTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    await supabase.from('client_onboarding_tasks').delete().eq('id', taskId);
    await mutateTasks();
  };

  const noop = async () => {
    return Promise.resolve();
  };

  return {
    client: clientData,
    tasks: tasks ?? [],
    timeline,
    documents,
    isLoading: loading || tasksLoading,
    isUpdating,
    error,
    mutations: {
      updateClient: handleUpdateClient,
      refreshAll: handleRefresh,
      refreshTasks: async () => {
        await mutateTasks();
      },
      createTask: handleCreateTask,
      updateTask: handleUpdateTask,
      deleteTask: handleDeleteTask,
      createEvent: noop,
      updateEvent: noop,
      deleteEvent: noop,
      createDocument: noop,
      updateDocument: noop,
      deleteDocument: noop,
    },
  };
}
