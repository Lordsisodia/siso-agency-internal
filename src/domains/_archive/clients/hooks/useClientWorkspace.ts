import { useClientDeepWorkTasks } from '@/domains/client/hooks/useClientDeepWorkTasks';
import { ClientData, ClientTask } from '@/types/client.types';
import { useMemo } from 'react';
import { supabase } from '@/services/integrations/supabase/client';
import { useClientDetails } from '@/domains/client/hooks/useClientDetails';
import { useClerkUser } from '@/lib/hooks/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import type { DeepWorkTask } from '@/domains/tasks/hooks/useDeepWorkTasksSupabase';

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

const isUuid = (value: string | null | undefined) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const generateLocalId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `local-${Math.random().toString(36).slice(2, 11)}`;
};

// Convert DeepWorkTask to ClientTask for compatibility
const convertDeepWorkTaskToClientTask = (task: DeepWorkTask): ClientTask => ({
  id: task.id,
  user_id: task.userId,
  client_id: task.clientId ?? '',
  title: task.title,
  description: task.description ?? null,
  priority: task.priority === 'URGENT' ? 'high' : task.priority === 'HIGH' ? 'high' : task.priority === 'MEDIUM' ? 'medium' : 'low',
  due_date: task.dueDate ?? null,
  completed: task.completed,
  subtasks: task.subtasks.map(st => ({
    id: st.id,
    title: st.title,
    completed: st.completed,
  })),
  created_at: task.createdAt,
  updated_at: task.updatedAt,
  completed_at: task.completedAt ?? null,
});

export function useClientWorkspace(clientId: string | null): ClientWorkspaceState {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);

  const {
    clientData,
    loading,
    error,
    updateClient,
    isUpdating,
  } = useClientDetails(clientId || null);

  const {
    tasks: deepWorkTasks,
    loading: tasksLoading,
    refresh: refreshTasks,
    updateTasks,
  } = useClientDeepWorkTasks({ clientId: clientId || '' });

  const sampleMode = !isUuid(clientId);

  // Convert deep work tasks to client tasks format for UI compatibility
  const tasks = useMemo(() =>
    deepWorkTasks.map(convertDeepWorkTaskToClientTask),
    [deepWorkTasks]
  );

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
    await refreshTasks();
  };

  const handleCreateTask = async (payload: Partial<ClientTask>) => {
    if (!clientId) return;

    const now = new Date().toISOString();
    const taskId = `deep-${Date.now()}`;

    // Map client task priority to deep work priority
    const priorityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = {
      low: 'LOW',
      medium: 'MEDIUM',
      high: 'HIGH',
    };

    // Sample mode: Create task in local state only
    if (sampleMode) {
      const newTask: DeepWorkTask = {
        id: taskId,
        userId: internalUserId || 'sample-user',
        clientId: clientId,
        title: payload.title ?? 'New task',
        description: payload.description ?? null,
        priority: priorityMap[payload.priority ?? 'medium'],
        completed: payload.completed ?? false,
        originalDate: now.split('T')[0],
        currentDate: now.split('T')[0],
        dueDate: payload.due_date ?? null,
        focusBlocks: 4,
        breakDuration: 15,
        interruptionMode: false,
        rollovers: 0,
        tags: [],
        category: undefined,
        createdAt: now,
        updatedAt: now,
        subtasks: [],
      };

      updateTasks((current) => [newTask, ...current]);
      return;
    }

    // Real mode: Save to database
    if (!internalUserId) return;

    await supabase.from('deep_work_tasks').insert({
      id: taskId,
      user_id: internalUserId,
      client_id: clientId,  // Auto-set client_id
      title: payload.title ?? 'New task',
      description: payload.description ?? null,
      priority: priorityMap[payload.priority ?? 'medium'],
      original_date: now.split('T')[0],
      task_date: now.split('T')[0],
      completed: payload.completed ?? false,
      due_date: payload.due_date ?? null,
      focus_blocks: 4,
      break_duration: 15,
      interruption_mode: false,
      rollovers: 0,
      tags: [],
    });

    await refreshTasks();
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<ClientTask>) => {
    const now = new Date().toISOString();

    // Sample mode: Update local state
    if (sampleMode) {
      updateTasks((current) =>
        current.map((task) => {
          if (task.id !== taskId) return task;

          const priorityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = {
            low: 'LOW',
            medium: 'MEDIUM',
            high: 'HIGH',
          };

          return {
            ...task,
            title: updates.title ?? task.title,
            description: updates.description ?? task.description ?? undefined,
            dueDate: updates.due_date ?? task.dueDate,
            priority: updates.priority ? priorityMap[updates.priority] : task.priority,
            completed: updates.completed ?? task.completed,
            completedAt: updates.completed ? now : task.completedAt,
            updatedAt: now,
          };
        })
      );
      return;
    }

    // Real mode: Update database
    const updatePayload: Record<string, unknown> = { updated_at: now };

    if (typeof updates.title !== 'undefined') updatePayload.title = updates.title;
    if (typeof updates.description !== 'undefined') updatePayload.description = updates.description;
    if (typeof updates.due_date !== 'undefined') updatePayload.due_date = updates.due_date;

    // Map priority
    if (typeof updates.priority !== 'undefined') {
      const priorityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = {
        low: 'LOW',
        medium: 'MEDIUM',
        high: 'HIGH',
      };
      updatePayload.priority = priorityMap[updates.priority];
    }

    // Handle completion
    if (typeof updates.completed !== 'undefined') {
      updatePayload.completed = updates.completed;
      updatePayload.completed_at = updates.completed ? now : null;
    }

    if (Object.keys(updatePayload).length <= 1) {  // Only updated_at
      return;
    }

    await supabase.from('deep_work_tasks').update(updatePayload).eq('id', taskId);

    await refreshTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    // Sample mode: Remove from local state
    if (sampleMode) {
      updateTasks((current) => current.filter((task) => task.id !== taskId));
      return;
    }

    // Real mode: Delete from database
    await supabase.from('deep_work_tasks').delete().eq('id', taskId);
    await refreshTasks();
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
      refreshTasks,
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
