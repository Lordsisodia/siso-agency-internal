/**
 * Client-filtered Deep Work Tasks Hook
 *
 * Fetches deep work tasks filtered by client_id
 * Uses the same offline-first architecture as useDeepWorkTasksSupabase
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { isBrowserOnline } from '@/domains/task-ui/utils/network';
import type { DeepWorkTask } from '@/domains/task-ui/hooks/useDeepWorkTasksSupabase';
import {
  mapSupabaseDeepWorkTask,
  type DeepWorkTaskRow
} from '@/domains/task-ui/hooks/deepWork/deepWorkTaskCache';

export interface UseClientDeepWorkTasksProps {
  clientId: string;
}

// Check if value is a valid UUID
const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export function useClientDeepWorkTasks({ clientId }: UseClientDeepWorkTasksProps) {
  const { user, isSignedIn } = useClerkUser();
  const supabase = useSupabaseClient();
  const internalUserId = useSupabaseUserId(user?.id || null);

  const [tasks, setTasks] = useState<DeepWorkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!isSignedIn || !internalUserId || !clientId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // Sample mode: non-UUID client IDs (e.g., "13" for sample data)
      if (!isUuid(clientId)) {
        console.log(`📊 Sample mode: skipping Deep Work tasks query for non-UUID client: ${clientId}`);
        setTasks([]);
        setLoading(false);
        return;
      }

      console.log(`📊 Loading Deep Work tasks for client: ${clientId}...`);

      if (!supabase || !isBrowserOnline()) {
        // Offline mode - could load from cache filtered by clientId
        // For now, return empty array
        setTasks([]);
        setLoading(false);
        return;
      }

      // Fetch client-specific deep work tasks from Supabase
      const { data, error: fetchError } = await supabase
        .from('deep_work_tasks')
        .select(`
          *,
          subtasks:deep_work_subtasks(*)
        `)
        .eq('user_id', internalUserId)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const mappedTasks = (data as DeepWorkTaskRow[]).map(mapSupabaseDeepWorkTask);
      setTasks(mappedTasks);
      setLoading(false);
    } catch (loadError) {
      console.error('❌ Error loading client Deep Work tasks:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load tasks');
      setLoading(false);
    }
  }, [isSignedIn, internalUserId, clientId, supabase]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const urgent = tasks.filter(t => t.priority === 'URGENT' && !t.completed).length;
    const nextDeadline = tasks
      .filter(t => !t.completed && t.dueDate)
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))[0]?.dueDate;

    return {
      total: tasks.length,
      completed,
      urgent,
      nextDeadline,
    };
  }, [tasks]);

  // Allow manual updates for sample mode
  const updateTasks = useCallback((updater: (tasks: DeepWorkTask[]) => DeepWorkTask[]) => {
    setTasks(updater);
  }, []);

  // ========== MUTATION METHODS (matching useDeepWorkTasksSupabase interface) ==========

  const createTask = useCallback(async (taskData: Partial<DeepWorkTask>) => {
    if (!internalUserId) return null;

    const now = new Date().toISOString();
    const taskId = `deep-${Date.now()}`;

    const optimisticTask: DeepWorkTask = {
      id: taskId,
      userId: internalUserId,
      clientId: clientId,
      title: taskData.title || '',
      description: taskData.description,
      priority: (taskData.priority as DeepWorkTask['priority']) || 'MEDIUM',
      completed: false,
      originalDate: now.split('T')[0],
      currentDate: now.split('T')[0],
      dueDate: taskData.dueDate ?? null,
      estimatedDuration: taskData.estimatedDuration,
      focusBlocks: taskData.focusBlocks ?? 4,
      breakDuration: taskData.breakDuration ?? 15,
      interruptionMode: taskData.interruptionMode ?? false,
      rollovers: taskData.rollovers ?? 0,
      tags: taskData.tags ?? [],
      category: taskData.category,
      createdAt: now,
      updatedAt: now,
      subtasks: [],
    };

    // Optimistically update local state
    setTasks(prev => [optimisticTask, ...prev]);

    if (!isUuid(clientId)) {
      // Sample mode: task created locally
      return optimisticTask;
    }

    // Real mode: Save to database
    if (!supabase) return optimisticTask;

    try {
      const { data, error: insertError } = await supabase
        .from('deep_work_tasks')
        .insert({
          id: taskId,
          user_id: internalUserId,
          client_id: clientId,
          title: taskData.title ?? '',
          description: taskData.description,
          priority: taskData.priority || 'MEDIUM',
          original_date: now.split('T')[0],
          task_date: now.split('T')[0],
          completed: false,
          rollovers: taskData.rollovers ?? 0,
          tags: taskData.tags ?? [],
          category: taskData.category,
          estimated_duration: taskData.estimatedDuration,
          focus_blocks: taskData.focusBlocks ?? 4,
          break_duration: taskData.breakDuration ?? 15,
          interruption_mode: taskData.interruptionMode ?? false,
        })
        .select(`
          *,
          subtasks:deep_work_subtasks(*)
        `)
        .single();

      if (insertError || !data) {
        throw insertError ?? new Error('Failed to create task');
      }

      const syncedTask = mapSupabaseDeepWorkTask(data as DeepWorkTaskRow);
      setTasks(prev => prev.map(t => t.id === taskId ? syncedTask : t));
      return syncedTask;
    } catch (error) {
      console.error('❌ Error creating task:', error);
      return optimisticTask;
    }
  }, [internalUserId, clientId, supabase]);

  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask) return null;

    const now = new Date().toISOString();
    const optimisticTask: DeepWorkTask = {
      ...currentTask,
      completed: !currentTask.completed,
      completedAt: !currentTask.completed ? now : undefined,
      updatedAt: now,
    };

    setTasks(prev => prev.map(task => task.id === taskId ? optimisticTask : task));

    if (!isUuid(clientId) || !supabase) {
      return optimisticTask;
    }

    try {
      const { data, error } = await supabase
        .from('deep_work_tasks')
        .update({
          completed: optimisticTask.completed,
          completed_at: optimisticTask.completed ? now : null,
          updated_at: now,
        })
        .eq('id', taskId)
        .select(`
          *,
          subtasks:deep_work_subtasks(*)
        `)
        .single();

      if (error || !data) {
        throw error ?? new Error('Failed to toggle task completion');
      }

      const syncedTask = mapSupabaseDeepWorkTask(data as DeepWorkTaskRow);
      setTasks(prev => prev.map(task => task.id === taskId ? syncedTask : task));
      return syncedTask;
    } catch (error) {
      console.error('❌ Error toggling task completion:', error);
      return optimisticTask;
    }
  }, [tasks, clientId, supabase]);

  const deleteTask = useCallback(async (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));

    if (!isUuid(clientId) || !supabase) {
      return true;
    }

    try {
      const { error } = await supabase
        .from('deep_work_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      return false;
    }
  }, [clientId, supabase]);

  const updateTaskTitle = useCallback(async (taskId: string, newTitle: string) => {
    if (!supabase) return null;

    try {
      const { error } = await supabase
        .from('deep_work_tasks')
        .update({
          title: newTitle,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, title: newTitle, updatedAt: new Date().toISOString() } : task
      ));

      return true;
    } catch (error) {
      console.error('❌ Error updating task title:', error);
      return null;
    }
  }, [supabase]);

  const updateTaskDueDate = useCallback(async (taskId: string, dueDate: Date | null) => {
    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask) return null;

    const now = new Date().toISOString();
    const dueDateString = dueDate ? dueDate.toISOString().split('T')[0] : null;
    const optimisticTask: DeepWorkTask = {
      ...currentTask,
      dueDate: dueDateString,
      updatedAt: now,
    };

    setTasks(prev => prev.map(task => task.id === taskId ? optimisticTask : task));

    if (!isUuid(clientId) || !supabase) {
      return optimisticTask;
    }

    try {
      const { data, error } = await supabase
        .from('deep_work_tasks')
        .update({
          due_date: dueDateString,
          updated_at: now,
        })
        .eq('id', taskId)
        .select(`
          *,
          subtasks:deep_work_subtasks(*)
        `)
        .single();

      if (error || !data) throw error ?? new Error('Failed to update due date');

      const syncedTask = mapSupabaseDeepWorkTask(data as DeepWorkTaskRow);
      setTasks(prev => prev.map(task => task.id === taskId ? syncedTask : task));
      return syncedTask;
    } catch (error) {
      console.error('❌ Error updating due date:', error);
      return optimisticTask;
    }
  }, [tasks, clientId, supabase]);

  const updateTaskPriority = useCallback(async (taskId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    if (!supabase) return null;

    const normalized = priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

    try {
      const { error } = await supabase
        .from('deep_work_tasks')
        .update({
          priority: normalized,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, priority: normalized, updatedAt: new Date().toISOString() } : task
      ));

      return true;
    } catch (error) {
      console.error('❌ Error updating task priority:', error);
      return null;
    }
  }, [supabase]);

  const updateTaskTimeEstimate = useCallback(async (taskId: string, timeEstimate: string | null) => {
    if (!supabase) return null;

    try {
      const { error } = await supabase
        .from('deep_work_tasks')
        .update({
          time_estimate: timeEstimate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, timeEstimate: timeEstimate ?? undefined, updatedAt: new Date().toISOString() } : task
      ));

      return true;
    } catch (error) {
      console.error('❌ Error updating time estimate:', error);
      return null;
    }
  }, [supabase]);

  const addSubtask = useCallback(async (taskId: string, subtaskTitle: string, priority = 'MEDIUM') => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('deep_work_subtasks')
        .insert({
          task_id: taskId,
          title: subtaskTitle,
          text: subtaskTitle,
          completed: false,
          priority,
        })
        .select()
        .single();

      if (error) throw error;

      const newSubtask: import('@/domains/tasks/hooks/useDeepWorkTasksSupabase').DeepWorkSubtask = {
        id: data.id,
        taskId: data.task_id,
        title: data.title,
        text: data.text || data.title,
        completed: data.completed,
        priority: data.priority,
        dueDate: data.due_date,
        estimatedTime: data.estimated_time,
        requiresFocus: data.requires_focus ?? false,
        complexityLevel: data.complexity_level ?? 1,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        completedAt: data.completed_at,
      };

      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, subtasks: [...task.subtasks, newSubtask] } : task
      ));

      return newSubtask;
    } catch (error) {
      console.error('❌ Error adding subtask:', error);
      return null;
    }
  }, [supabase]);

  const deleteSubtask = useCallback(async (subtaskId: string) => {
    if (!supabase) return null;

    try {
      const { error } = await supabase
        .from('deep_work_subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId),
      })));

      return true;
    } catch (error) {
      console.error('❌ Error deleting subtask:', error);
      return null;
    }
  }, [supabase]);

  const toggleSubtaskCompletion = useCallback(async (taskId: string, subtaskId: string) => {
    if (!supabase) return null;

    const currentTask = tasks.find(task => task.id === taskId);
    const targetSubtask = currentTask?.subtasks.find(subtask => subtask.id === subtaskId);
    if (!targetSubtask) return null;

    try {
      const newCompleted = !targetSubtask.completed;
      const { error } = await supabase
        .from('deep_work_subtasks')
        .update({
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subtaskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask =>
          subtask.id === subtaskId
            ? { ...subtask, completed: newCompleted, completedAt: newCompleted ? new Date().toISOString() : undefined }
            : subtask
        ),
      })));

      return true;
    } catch (error) {
      console.error('❌ Error toggling subtask completion:', error);
      return null;
    }
  }, [supabase, tasks]);

  const updateSubtaskDueDate = useCallback(async (subtaskId: string, dueDate: Date | null) => {
    if (!supabase) return null;

    try {
      const { error } = await supabase
        .from('deep_work_subtasks')
        .update({
          due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subtaskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined } : subtask
        ),
      })));

      return true;
    } catch (error) {
      console.error('❌ Error updating subtask due date:', error);
      return null;
    }
  }, [supabase]);

  const updateSubtaskTitle = useCallback(async (subtaskId: string, newTitle: string) => {
    if (!supabase) return null;

    try {
      const { error } = await supabase
        .from('deep_work_subtasks')
        .update({
          title: newTitle,
          text: newTitle,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subtaskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, title: newTitle, text: newTitle } : subtask
        ),
      })));

      return true;
    } catch (error) {
      console.error('❌ Error updating subtask title:', error);
      return null;
    }
  }, [supabase]);

  const updateSubtaskPriority = useCallback(async (subtaskId: string, priority: string) => {
    if (!supabase) return null;

    try {
      const { error } = await supabase
        .from('deep_work_subtasks')
        .update({
          priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subtaskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, priority } : subtask
        ),
      })));

      return true;
    } catch (error) {
      console.error('❌ Error updating subtask priority:', error);
      return null;
    }
  }, [supabase]);

  const updateSubtaskEstimatedTime = useCallback(async (subtaskId: string, estimatedTime: string) => {
    if (!supabase) return null;

    try {
      const { error } = await supabase
        .from('deep_work_subtasks')
        .update({
          estimated_time: estimatedTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subtaskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, estimatedTime } : subtask
        ),
      })));

      return true;
    } catch (error) {
      console.error('❌ Error updating subtask estimated time:', error);
      return null;
    }
  }, [supabase]);

  const updateSubtaskDescription = useCallback(async (subtaskId: string, description: string) => {
    if (!supabase) return null;

    try {
      const { error } = await supabase
        .from('deep_work_subtasks')
        .update({
          text: description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subtaskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, text: description } : subtask
        ),
      })));

      return true;
    } catch (error) {
      console.error('❌ Error updating subtask description:', error);
      return null;
    }
  }, [supabase]);

  const refreshTasks = useCallback(() => {
    setLoading(true);
    loadTasks();
  }, [loadTasks]);

  // ========== RETURN INTERFACE (matching useDeepWorkTasksSupabase) ==========

  return {
    tasks,
    loading,
    error,
    createTask,
    deleteTask,
    toggleTaskCompletion,
    updateTaskDueDate,
    updateTaskTitle,
    updateTaskPriority,
    updateTaskTimeEstimate,
    toggleSubtaskCompletion,
    addSubtask,
    deleteSubtask,
    updateSubtaskDueDate,
    updateSubtaskTitle,
    updateSubtaskPriority,
    updateSubtaskEstimatedTime,
    updateSubtaskDescription,
    refreshTasks,
  };
}
