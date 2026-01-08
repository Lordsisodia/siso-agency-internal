/**
 * 🚀 Light Work Tasks Hook - OFFLINE-FIRST PWA VERSION
 */

import { useState, useCallback, useEffect } from 'react';
import { useClerkUser } from '@/lib/hooks/useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/lib/supabase-clerk';
import { isBrowserOnline } from '../../_shared/utils/network';
import { syncService } from '@/services/offline/syncService';
import {
  loadLightWorkTasksFromCache,
  cacheSupabaseLightWorkTasks,
  mapSupabaseLightWorkTask,
  markLightWorkTaskSynced,
} from './lightWork/lightWorkTaskCache';
import {
  persistOptimisticLightTask as persistLightWorkTask,
  queueLightWorkTask,
} from './lightWork/lightWorkTaskSync';
import { formatLocalDate, formatLocalDateOrUndefined } from '../../_shared/utils/dateUtils';

export interface LightWorkTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  originalDate: string;
  currentDate: string;
  taskDate?: string;
  estimatedDuration?: number;
  rollovers: number;
  tags: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  startedAt?: string;
  actualDurationMin?: number;
  timeEstimate?: string;
  dueDate?: string;
  subtasks: LightWorkSubtask[];
}

export interface LightWorkSubtask {
  id: string;
  taskId: string;
  title: string;
  text: string;
  completed: boolean;
  priority?: string;
  dueDate?: string;
  estimatedTime?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface UseLightWorkTasksProps {
  selectedDate: Date;
}

const optimisticNow = () => new Date().toISOString();

export function useLightWorkTasksSupabase({ selectedDate }: UseLightWorkTasksProps) {
  const { user, isSignedIn } = useClerkUser();
  const supabase = useSupabaseClient();
  const internalUserId = useSupabaseUserId(user?.id || null);

  const [tasks, setTasks] = useState<LightWorkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateString = selectedDate?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0];

  const replaceTaskInState = useCallback((updatedTask: LightWorkTask) => {
    setTasks(prev => prev.map(task => (task.id === updatedTask.id ? updatedTask : task)));
  }, []);

  const persistTask = useCallback(async (task: LightWorkTask, markForSync = true) => {
    await persistLightWorkTask(task, markForSync);
    replaceTaskInState(task);
  }, [replaceTaskInState]);

  const loadTasks = useCallback(async () => {
    if (!isSignedIn || !internalUserId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('📊 Loading Light Work tasks (offline-first)...');

      const cachedTasks = await loadLightWorkTasksFromCache(dateString);
      if (cachedTasks.length > 0) {
        const statusLabel = isBrowserOnline() ? 'online' : 'offline';
        console.log(`⚡ INSTANT: Loaded ${cachedTasks.length} tasks from IndexedDB (${statusLabel})`);
        setTasks(cachedTasks);
      }

      setLoading(false);

      if (!supabase || !isBrowserOnline()) {
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('light_work_tasks')
        .select(`
          *,
          subtasks:light_work_subtasks(*)
        `)
        .eq('user_id', internalUserId)
        .eq('completed', false)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.warn('⚠️ Supabase sync failed (using cached data):', fetchError.message);
        return;
      }

      const syncedTasks = await cacheSupabaseLightWorkTasks(data ?? []);
      console.log(`✅ Synced ${syncedTasks.length} Light Work tasks from Supabase`);
      setTasks(syncedTasks);
    } catch (loadError) {
      console.error('❌ Error loading Light Work tasks:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load tasks');
      setLoading(false);
    }
  }, [isSignedIn, internalUserId, dateString, supabase]);

  const createTask = useCallback(async (taskData: Partial<LightWorkTask>) => {
    if (!internalUserId) return null;

    const now = optimisticNow();
    const taskId = `light-${Date.now()}`;

    const optimisticTask: LightWorkTask = {
      id: taskId,
      userId: internalUserId,
      title: taskData.title || '',
      description: taskData.description,
      priority: (taskData.priority as LightWorkTask['priority']) || 'MEDIUM',
      completed: false,
      originalDate: dateString,
      currentDate: dateString,
      estimatedDuration: taskData.estimatedDuration,
      timeEstimate: taskData.timeEstimate,
      dueDate: taskData.dueDate,
      rollovers: 0,
      tags: taskData.tags ?? [],
      category: taskData.category,
      createdAt: now,
      updatedAt: now,
      subtasks: [],
    };

    await persistTask(optimisticTask, true);
    setTasks(prev => [...prev, optimisticTask]);

    if (!supabase || !isBrowserOnline()) {
      await queueLightWorkTask('create', optimisticTask);
      return optimisticTask;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('light_work_tasks')
        .insert({
          id: taskId,
          user_id: internalUserId,
          title: taskData.title ?? '',
          description: taskData.description,
          priority: taskData.priority || 'MEDIUM',
          original_date: dateString,
          task_date: dateString,
          completed: false,
          rollovers: taskData.rollovers ?? 0,
          tags: taskData.tags ?? [],
          category: taskData.category,
          estimated_duration: taskData.estimatedDuration,
          time_estimate: taskData.timeEstimate ?? null,
          due_date: taskData.dueDate ?? null,
        })
        .select(`
          *,
          subtasks:light_work_subtasks(*)
        `)
        .single();

      if (insertError || !data) {
        throw insertError ?? new Error('Failed to create Light Work task in Supabase');
      }

      const syncedTask = mapSupabaseLightWorkTask(data);
      await persistTask(syncedTask, false);
      await markLightWorkTaskSynced(syncedTask.id);
      replaceTaskInState(syncedTask);
      return syncedTask;
    } catch (supabaseError) {
      console.warn('⚠️ Supabase create failed, queued for sync:', supabaseError);
      await queueLightWorkTask('create', optimisticTask);
      return optimisticTask;
    }
  }, [internalUserId, dateString, supabase, persistTask, replaceTaskInState]);

  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask) return null;

    const now = optimisticNow();
    const optimisticTask: LightWorkTask = {
      ...currentTask,
      completed: !currentTask.completed,
      completedAt: !currentTask.completed ? now : undefined,
      updatedAt: now,
    };

    await persistTask(optimisticTask, true);

    if (!supabase || !isBrowserOnline()) {
      await queueLightWorkTask('update', optimisticTask);
      return optimisticTask;
    }

    try {
      const { data, error: updateError } = await supabase
        .from('light_work_tasks')
        .update({
          completed: optimisticTask.completed,
          completed_at: optimisticTask.completed ? now : null,
          updated_at: now,
        })
        .eq('id', taskId)
        .select(`
          *,
          subtasks:light_work_subtasks(*)
        `)
        .single();

      if (updateError || !data) {
        throw updateError ?? new Error('Failed to toggle Light Work task in Supabase');
      }

      const syncedTask = mapSupabaseLightWorkTask(data);
      await persistTask(syncedTask, false);
      await markLightWorkTaskSynced(taskId);
      replaceTaskInState(syncedTask);
      return syncedTask;
    } catch (supabaseError) {
      console.warn('⚠️ Supabase toggle failed, queued for sync:', supabaseError);
      await queueLightWorkTask('update', optimisticTask);
      return optimisticTask;
    }
  }, [tasks, supabase, persistTask, replaceTaskInState]);

  const deleteTask = useCallback(async (taskId: string) => {
    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask) return null;

    setTasks(prev => prev.filter(task => task.id !== taskId));

    if (!supabase || !isBrowserOnline()) {
      await queueLightWorkTask('delete', currentTask);
      return true;
    }

    try {
      const { error: deleteError } = await supabase
        .from('light_work_tasks')
        .delete()
        .eq('id', taskId);

      if (deleteError) {
        throw deleteError;
      }

      await markLightWorkTaskSynced(taskId);
      return true;
    } catch (deleteError) {
      console.error('❌ Error deleting Light Work task:', deleteError);
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete task');
      await persistTask(currentTask, true);
      return null;
    }
  }, [tasks, supabase, persistTask]);

  const pushTaskToAnotherDay = useCallback(async (taskId: string, newDate: string) => {
    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask) return null;

    const now = optimisticNow();
    const optimisticTask: LightWorkTask = {
      ...currentTask,
      currentDate: newDate,
      updatedAt: now,
    };

    await persistTask(optimisticTask, true);

    if (!supabase || !isBrowserOnline()) {
      await queueLightWorkTask('update', optimisticTask);
      return true;
    }

    try {
      const { error } = await supabase
        .from('light_work_tasks')
        .update({
          task_date: newDate,
          updated_at: now,
        })
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      await persistTask(optimisticTask, false);
      await markLightWorkTaskSynced(taskId);
      return true;
    } catch (supabaseError) {
      console.warn('⚠️ Supabase reschedule failed, queued for sync:', supabaseError);
      await queueLightWorkTask('update', optimisticTask);
      return true;
    }
  }, [tasks, supabase, persistTask]);

  const updateTaskDueDate = useCallback(async (taskId: string, dueDate: Date | null) => {
    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask) return null;

    const now = optimisticNow();
    const dueDateString = formatLocalDateOrUndefined(dueDate);
    const optimisticTask: LightWorkTask = {
      ...currentTask,
      dueDate: dueDateString,
      updatedAt: now,
    };

    await persistTask(optimisticTask, true);

    if (!supabase || !isBrowserOnline()) {
      await queueLightWorkTask('update', optimisticTask);
      return optimisticTask;
    }

    try {
      const { data, error } = await supabase
        .from('light_work_tasks')
        .update({
          due_date: dueDateString ?? null,
          updated_at: now,
        })
        .eq('id', taskId)
        .select(`
          *,
          subtasks:light_work_subtasks(*)
        `)
        .single();

      if (error || !data) {
        throw error ?? new Error('Failed to update task due date in Supabase');
      }

      const syncedTask = mapSupabaseLightWorkTask(data);
      await persistTask(syncedTask, false);
      await markLightWorkTaskSynced(taskId);
      replaceTaskInState(syncedTask);
      return syncedTask;
    } catch (supabaseError) {
      console.warn('⚠️ Supabase due date update failed, queued for sync:', supabaseError);
      await queueLightWorkTask('update', optimisticTask);
      return optimisticTask;
    }
  }, [tasks, supabase, persistTask, replaceTaskInState]);

  const updateTaskPriority = useCallback(async (taskId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask) return null;

    const now = optimisticNow();
    const normalized = priority.toUpperCase() as LightWorkTask['priority'];

    const optimisticTask: LightWorkTask = {
      ...currentTask,
      priority: normalized,
      updatedAt: now,
    };

    await persistTask(optimisticTask, true);

    if (!supabase || !isBrowserOnline()) {
      await queueLightWorkTask('update', optimisticTask);
      return optimisticTask;
    }

    try {
      const { data, error } = await supabase
        .from('light_work_tasks')
        .update({
          priority: normalized,
          updated_at: now,
        })
        .eq('id', taskId)
        .select(`
          *,
          subtasks:light_work_subtasks(*)
        `)
        .single();

      if (error || !data) {
        throw error ?? new Error('Failed to update task priority in Supabase');
      }

      const syncedTask = mapSupabaseLightWorkTask(data);
      await persistTask(syncedTask, false);
      await markLightWorkTaskSynced(taskId);
      replaceTaskInState(syncedTask);
      return syncedTask;
    } catch (supabaseError) {
      console.warn('⚠️ Supabase priority update failed, queued for sync:', supabaseError);
      await queueLightWorkTask('update', optimisticTask);
      return optimisticTask;
    }
  }, [tasks, supabase, persistTask, replaceTaskInState]);

  const updateTaskTimeEstimate = useCallback(async (taskId: string, timeEstimate: string | null) => {
    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask) return null;

    const now = optimisticNow();

    const optimisticTask: LightWorkTask = {
      ...currentTask,
      timeEstimate: timeEstimate ?? undefined,
      updatedAt: now,
    };

    await persistTask(optimisticTask, true);

    if (!supabase || !isBrowserOnline()) {
      await queueLightWorkTask('update', optimisticTask);
      return optimisticTask;
    }

    try {
      const { data, error } = await supabase
        .from('light_work_tasks')
        .update({
          time_estimate: timeEstimate,
          updated_at: now,
        })
        .eq('id', taskId)
        .select(`
          *,
          subtasks:light_work_subtasks(*)
        `)
        .single();

      if (error || !data) {
        throw error ?? new Error('Failed to update task time estimate in Supabase');
      }

      const syncedTask = mapSupabaseLightWorkTask(data);
      await persistTask(syncedTask, false);
      await markLightWorkTaskSynced(taskId);
      replaceTaskInState(syncedTask);
      return syncedTask;
    } catch (supabaseError) {
      console.warn('⚠️ Supabase time estimate update failed, queued for sync:', supabaseError);
      await queueLightWorkTask('update', optimisticTask);
      return optimisticTask;
    }
  }, [tasks, supabase, persistTask, replaceTaskInState]);

  const updateTaskActualDuration = useCallback(async (taskId: string, actualDurationMin: number | null) => {
    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask) return null;

    const now = optimisticNow();

    const optimisticTask: LightWorkTask = {
      ...currentTask,
      actualDurationMin: actualDurationMin ?? undefined,
      updatedAt: now,
      completedAt: currentTask.completedAt ?? (actualDurationMin ? now : undefined),
    };

    await persistTask(optimisticTask, true);

    if (!supabase || !isBrowserOnline()) {
      await queueLightWorkTask('update', optimisticTask);
      return optimisticTask;
    }

    try {
      const { data, error } = await supabase
        .from('light_work_tasks')
        .update({
          actual_duration_min: actualDurationMin,
          completed_at: optimisticTask.completedAt ?? null,
          updated_at: now,
        })
        .eq('id', taskId)
        .select(`
          *,
          subtasks:light_work_subtasks(*)
        `)
        .single();

      if (error || !data) {
        throw error ?? new Error('Failed to update Light Work task actual duration in Supabase');
      }

      const syncedTask = mapSupabaseLightWorkTask(data);
      await persistTask(syncedTask, false);
      await markLightWorkTaskSynced(taskId);
      replaceTaskInState(syncedTask);
      return syncedTask;
    } catch (supabaseError) {
      console.warn('⚠️ Supabase actual duration update failed, queued for sync:', supabaseError);
      await queueLightWorkTask('update', optimisticTask);
      return optimisticTask;
    }
  }, [tasks, supabase, persistTask, replaceTaskInState]);

  const updateTaskTitle = useCallback(async (taskId: string, newTitle: string) => {
    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask) return null;

    const now = optimisticNow();
    const optimisticTask: LightWorkTask = {
      ...currentTask,
      title: newTitle,
      updatedAt: now,
    };

    await persistTask(optimisticTask, true);

    if (!supabase || !isBrowserOnline()) {
      await queueLightWorkTask('update', optimisticTask);
      return true;
    }

    try {
      const { data, error } = await supabase
        .from('light_work_tasks')
        .update({
          title: newTitle,
          updated_at: now,
        })
        .eq('id', taskId)
        .select(`
          *,
          subtasks:light_work_subtasks(*)
        `)
        .single();

      if (error || !data) {
        throw error ?? new Error('Failed to update Light Work task title in Supabase');
      }

      const syncedTask = mapSupabaseLightWorkTask(data);
      await persistTask(syncedTask, false);
      await markLightWorkTaskSynced(taskId);
      replaceTaskInState(syncedTask);
      return true;
    } catch (updateError) {
      console.error('❌ Error updating Light Work task title:', updateError);
      setError(updateError instanceof Error ? updateError.message : 'Failed to update task title');
      await queueLightWorkTask('update', optimisticTask);
      return false;
    }
  }, [tasks, supabase, persistTask, replaceTaskInState]);

  const addSubtask = useCallback(async (taskId: string, subtaskTitle: string, priority = 'MEDIUM') => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('light_work_subtasks')
        .insert({
          task_id: taskId,
          title: subtaskTitle,
          text: subtaskTitle,
          completed: false,
          priority,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newSubtask: LightWorkSubtask = {
        id: data.id,
        taskId: data.task_id,
        title: data.title,
        text: data.text || data.title,
        completed: data.completed,
        priority: data.priority,
        dueDate: data.due_date,
        estimatedTime: data.estimated_time,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        completedAt: data.completed_at,
      };

      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, subtasks: [...task.subtasks, newSubtask] }
          : task,
      ));

      return newSubtask;
    } catch (subtaskError) {
      console.error('❌ Error adding subtask:', subtaskError);
      setError(subtaskError instanceof Error ? subtaskError.message : 'Failed to add subtask');
      return null;
    }
  }, [supabase]);

  const deleteSubtask = useCallback(async (subtaskId: string) => {
    if (!supabase) return null;

    try {
      const { error } = await supabase
        .from('light_work_subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) {
        throw error;
      }

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId),
      })));

      return true;
    } catch (subtaskError) {
      console.error('❌ Error deleting subtask:', subtaskError);
      setError(subtaskError instanceof Error ? subtaskError.message : 'Failed to delete subtask');
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
        .from('light_work_subtasks')
        .update({
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subtaskId);

      if (error) {
        throw error;
      }

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask =>
          subtask.id === subtaskId
            ? { ...subtask, completed: newCompleted, completedAt: newCompleted ? new Date().toISOString() : undefined }
            : subtask,
        ),
      })));

      return true;
    } catch (subtaskError) {
      console.error('❌ Error toggling subtask completion:', subtaskError);
      setError(subtaskError instanceof Error ? subtaskError.message : 'Failed to toggle subtask');
      return null;
    }
  }, [supabase, tasks]);

  const updateSubtaskDueDate = useCallback(async (subtaskId: string, dueDate: Date | null) => {
    if (!supabase) return null;

    try {
      const { error } = await supabase
        .from('light_work_subtasks')
        .update({
          due_date: dueDate ? formatLocalDate(dueDate) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subtaskId);

      if (error) {
        throw error;
      }

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, dueDate: formatLocalDateOrUndefined(dueDate) } : subtask,
        ),
      })));

      return true;
    } catch (subtaskError) {
      console.error('❌ Error updating subtask due date:', subtaskError);
      setError(subtaskError instanceof Error ? subtaskError.message : 'Failed to update subtask due date');
      return null;
    }
  }, [supabase]);

  const updateSubtaskTitle = useCallback(async (subtaskId: string, newTitle: string) => {
    if (!supabase) return null;

    try {
      const { error } = await supabase
        .from('light_work_subtasks')
        .update({
          title: newTitle,
          text: newTitle,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subtaskId);

      if (error) {
        throw error;
      }

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, title: newTitle, text: newTitle } : subtask,
        ),
      })));

      return true;
    } catch (subtaskError) {
      console.error('❌ Error updating subtask title:', subtaskError);
      setError(subtaskError instanceof Error ? subtaskError.message : 'Failed to update subtask title');
      return null;
    }
  }, [supabase]);

  const updateSubtaskPriority = useCallback(async (subtaskId: string, priority: string) => {
    if (!supabase) return null;

    try {
      const { error } = await supabase
        .from('light_work_subtasks')
        .update({
          priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subtaskId);

      if (error) {
        throw error;
      }

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, priority } : subtask,
        ),
      })));

      return true;
    } catch (subtaskError) {
      console.error('❌ Error updating subtask priority:', subtaskError);
      setError(subtaskError instanceof Error ? subtaskError.message : 'Failed to update subtask priority');
      return null;
    }
  }, [supabase]);

  const updateSubtaskEstimatedTime = useCallback(async (subtaskId: string, estimatedTime: string) => {
    if (!supabase) return null;

    try {
      const { error } = await supabase
        .from('light_work_subtasks')
        .update({
          estimated_time: estimatedTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subtaskId);

      if (error) {
        throw error;
      }

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, estimatedTime } : subtask,
        ),
      })));

      return true;
    } catch (subtaskError) {
      console.error('❌ Error updating subtask estimated time:', subtaskError);
      setError(subtaskError instanceof Error ? subtaskError.message : 'Failed to update subtask estimated time');
      return null;
    }
  }, [supabase]);

  const updateSubtaskDescription = useCallback(async (subtaskId: string, description: string) => {
    if (!supabase) return null;

    try {
      const { error } = await supabase
        .from('light_work_subtasks')
        .update({
          text: description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subtaskId);

      if (error) {
        throw error;
      }

      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, text: description } : subtask,
        ),
      })));

      return true;
    } catch (subtaskError) {
      console.error('❌ Error updating subtask description:', subtaskError);
      setError(subtaskError instanceof Error ? subtaskError.message : 'Failed to update subtask description');
      return null;
    }
  }, [supabase]);

  const refreshTasks = useCallback(() => {
    setLoading(true);
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    syncService.setActiveUser(internalUserId ?? null);
  }, [internalUserId]);

  return {
    tasks,
    loading,
    error,
    createTask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    addSubtask,
    deleteTask,
    deleteSubtask,
    updateTaskTitle,
    updateTaskDueDate,
    updateTaskPriority,
    updateTaskTimeEstimate,
    updateSubtaskTitle,
    updateSubtaskPriority,
    updateSubtaskEstimatedTime,
    updateSubtaskDescription,
    updateSubtaskDueDate,
    updateTaskActualDuration,
    pushTaskToAnotherDay,
    refreshTasks,
  };
}
