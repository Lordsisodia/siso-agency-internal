/**
 * Generic Task Hook Factory
 * Consolidates useLightWorkTasksSupabase and useDeepWorkTasksSupabase into a single factory pattern
 */

import { useState, useCallback, useEffect } from 'react';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { isBrowserOnline } from '../utils/network';
import { syncService } from '@/services/offline/syncService';
import { formatLocalDate, formatLocalDateOrUndefined } from '../utils/dateUtils';

// ============================================================================
// TYPES
// ============================================================================

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface BaseSubtask {
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

export interface BaseTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
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
  timeEstimate?: string | null;
  dueDate?: string | null;
  subtasks: BaseSubtask[];
}

export interface UseTaskHookProps {
  selectedDate: Date;
}

export interface TaskHookState<T extends BaseTask> {
  tasks: T[];
  loading: boolean;
  error: string | null;
}

export type TaskAction = 'create' | 'update' | 'delete';

// ============================================================================
// CACHE INTERFACE
// ============================================================================

export interface TaskCacheAdapter<T extends BaseTask> {
  loadFromCache: (date?: string) => Promise<T[]>;
  cacheSupabaseTasks: (rows: any[]) => Promise<T[]>;
  saveToCache: (task: T, markForSync?: boolean) => Promise<void>;
  markTaskSynced: (taskId: string) => Promise<void>;
  buildQueuePayload: (task: T) => any;
}

export interface TaskSyncAdapter<T extends BaseTask> {
  persistOptimisticTask: (task: T, markForSync?: boolean) => Promise<void>;
  queueTask: (action: TaskAction, task: T) => Promise<void>;
}

// ============================================================================
// FACTORY CONFIGURATION
// ============================================================================

export interface TaskHookFactoryConfig<
  T extends BaseTask,
  S extends BaseSubtask = BaseSubtask,
> {
  /** Unique identifier for this task type (e.g., 'light', 'deep') */
  taskType: string;

  /** Supabase table names */
  tables: {
    tasks: string;
    subtasks: string;
  };

  /** Cache store name in offline DB */
  cacheStoreName: string;

  /** Cache adapter for loading/saving tasks */
  cacheAdapter: TaskCacheAdapter<T>;

  /** Sync adapter for optimistic updates and queuing */
  syncAdapter: TaskSyncAdapter<T>;

  /** Generate a new task ID */
  generateTaskId: () => string;

  /** Create default/empty subtasks array */
  getDefaultSubtasks?: () => S[];

  /** Transform Supabase row to task type */
  mapSupabaseTask: (row: any) => T;

  /** Transform Supabase row to subtask type */
  mapSupabaseSubtask: (row: any) => S;

  /** Build Supabase insert payload from partial task data */
  buildInsertPayload: (taskData: Partial<T>, internalUserId: string, dateString: string) => any;

  /** Build optimistic task from partial data */
  buildOptimisticTask: (taskData: Partial<T>, internalUserId: string, dateString: string, now: string) => T;

  /** Optional: Additional fields to select from Supabase (comma-separated) */
  additionalSelectFields?: string;

  /** Optional: Custom update operations */
  customUpdateOperations?: CustomUpdateOperations<T>;

  /** Optional: Fields that should be included in update operations */
  updatableFields?: string[];
}

export interface CustomUpdateOperations<T extends BaseTask> {
  [key: string]: (
    task: T,
    value: any,
    now: string,
  ) => { optimisticTask: T; supabasePayload: any } | null;
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createTaskHook<T extends BaseTask, S extends BaseSubtask = BaseSubtask>(
  config: TaskHookFactoryConfig<T, S>,
) {
  return function useTaskHook({ selectedDate }: UseTaskHookProps) {
    const { user, isSignedIn } = useClerkUser();
    const supabase = useSupabaseClient();
    const internalUserId = useSupabaseUserId(user?.id || null);

    const [tasks, setTasks] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const dateString = selectedDate?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0];

    const optimisticNow = () => new Date().toISOString();

    // ============================================================================
    // STATE HELPERS
    // ============================================================================

    const replaceTaskInState = useCallback((updatedTask: T) => {
      setTasks(prev => prev.map(task => (task.id === updatedTask.id ? updatedTask : task)));
    }, []);

    const persistTask = useCallback(async (task: T, markForSync = true) => {
      await config.syncAdapter.persistOptimisticTask(task, markForSync);
      replaceTaskInState(task);
    }, [replaceTaskInState]);

    // ============================================================================
    // LOAD TASKS
    // ============================================================================

    const loadTasks = useCallback(async () => {
      if (!isSignedIn || !internalUserId) {
        setLoading(false);
        return;
      }

      try {
        setError(null);

        const cachedTasks = await config.cacheAdapter.loadFromCache(dateString);
        if (cachedTasks.length > 0) {
          setTasks(cachedTasks);
        }

        setLoading(false);

        if (!supabase || !isBrowserOnline()) {
          return;
        }

        const { data, error: fetchError } = await supabase
          .from(config.tables.tasks)
          .select(`
            *,
            subtasks:${config.tables.subtasks}(*)
            ${config.additionalSelectFields ? `,${config.additionalSelectFields}` : ''}
          `)
          .eq('user_id', internalUserId)
          .eq('completed', false)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.warn(`⚠️ Supabase sync failed for ${config.taskType} tasks (using cached data):`, fetchError.message);
          return;
        }

        const syncedTasks = await config.cacheAdapter.cacheSupabaseTasks(data ?? []);
        setTasks(syncedTasks);
      } catch (loadError) {
        console.error(`❌ Error loading ${config.taskType} tasks:`, loadError);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load tasks');
        setLoading(false);
      }
    }, [isSignedIn, internalUserId, dateString, supabase]);

    // ============================================================================
    // CREATE TASK
    // ============================================================================

    const createTask = useCallback(async (taskData: Partial<T>) => {
      if (!internalUserId) return null;

      const now = optimisticNow();
      const taskId = config.generateTaskId();

      const optimisticTask = config.buildOptimisticTask(taskData, internalUserId, dateString, now);
      (optimisticTask as any).id = taskId;

      await persistTask(optimisticTask, true);
      setTasks(prev => [...prev, optimisticTask]);

      if (!supabase || !isBrowserOnline()) {
        await config.syncAdapter.queueTask('create', optimisticTask);
        return optimisticTask;
      }

      try {
        const insertPayload = config.buildInsertPayload(taskData, internalUserId, dateString);
        insertPayload.id = taskId;

        const { data, error: insertError } = await supabase
          .from(config.tables.tasks)
          .insert(insertPayload)
          .select(`
            *,
            subtasks:${config.tables.subtasks}(*)
            ${config.additionalSelectFields ? `,${config.additionalSelectFields}` : ''}
          `)
          .single();

        if (insertError || !data) {
          throw insertError ?? new Error(`Failed to create ${config.taskType} task in Supabase`);
        }

        const syncedTask = config.mapSupabaseTask(data);
        await persistTask(syncedTask, false);
        await config.cacheAdapter.markTaskSynced(syncedTask.id);
        replaceTaskInState(syncedTask);
        return syncedTask;
      } catch (supabaseError) {
        console.warn(`⚠️ Supabase create failed for ${config.taskType} task, queued for sync:`, supabaseError);
        await config.syncAdapter.queueTask('create', optimisticTask);
        return optimisticTask;
      }
    }, [internalUserId, dateString, supabase, persistTask, replaceTaskInState]);

    // ============================================================================
    // TOGGLE TASK COMPLETION
    // ============================================================================

    const toggleTaskCompletion = useCallback(async (taskId: string) => {
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) return null;

      const now = optimisticNow();
      const optimisticTask: T = {
        ...currentTask,
        completed: !currentTask.completed,
        completedAt: !currentTask.completed ? now : undefined,
        updatedAt: now,
      };

      await persistTask(optimisticTask, true);

      if (!supabase || !isBrowserOnline()) {
        await config.syncAdapter.queueTask('update', optimisticTask);
        return optimisticTask;
      }

      try {
        const { data, error: updateError } = await supabase
          .from(config.tables.tasks)
          .update({
            completed: optimisticTask.completed,
            completed_at: optimisticTask.completed ? now : null,
            updated_at: now,
          })
          .eq('id', taskId)
          .select(`
            *,
            subtasks:${config.tables.subtasks}(*)
            ${config.additionalSelectFields ? `,${config.additionalSelectFields}` : ''}
          `)
          .single();

        if (updateError || !data) {
          throw updateError ?? new Error(`Failed to toggle ${config.taskType} task in Supabase`);
        }

        const syncedTask = config.mapSupabaseTask(data);
        await persistTask(syncedTask, false);
        await config.cacheAdapter.markTaskSynced(taskId);
        replaceTaskInState(syncedTask);
        return syncedTask;
      } catch (supabaseError) {
        console.warn(`⚠️ Supabase toggle failed for ${config.taskType} task, queued for sync:`, supabaseError);
        await config.syncAdapter.queueTask('update', optimisticTask);
        return optimisticTask;
      }
    }, [tasks, supabase, persistTask, replaceTaskInState]);

    // ============================================================================
    // DELETE TASK
    // ============================================================================

    const deleteTask = useCallback(async (taskId: string) => {
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) return null;

      setTasks(prev => prev.filter(task => task.id !== taskId));

      if (!supabase || !isBrowserOnline()) {
        await config.syncAdapter.queueTask('delete', currentTask);
        return true;
      }

      try {
        const { error: deleteError } = await supabase
          .from(config.tables.tasks)
          .delete()
          .eq('id', taskId);

        if (deleteError) {
          throw deleteError;
        }

        await config.cacheAdapter.markTaskSynced(taskId);
        return true;
      } catch (deleteError) {
        console.error(`❌ Error deleting ${config.taskType} task:`, deleteError);
        setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete task');
        await persistTask(currentTask, true);
        return null;
      }
    }, [tasks, supabase, persistTask]);

    // ============================================================================
    // PUSH TASK TO ANOTHER DAY
    // ============================================================================

    const pushTaskToAnotherDay = useCallback(async (taskId: string, newDate: string) => {
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) return null;

      const now = optimisticNow();
      const optimisticTask: T = {
        ...currentTask,
        currentDate: newDate,
        updatedAt: now,
      };

      await persistTask(optimisticTask, true);

      if (!supabase || !isBrowserOnline()) {
        await config.syncAdapter.queueTask('update', optimisticTask);
        return true;
      }

      try {
        const { error } = await supabase
          .from(config.tables.tasks)
          .update({
            task_date: newDate,
            updated_at: now,
          })
          .eq('id', taskId);

        if (error) {
          throw error;
        }

        await persistTask(optimisticTask, false);
        await config.cacheAdapter.markTaskSynced(taskId);
        return true;
      } catch (supabaseError) {
        console.warn(`⚠️ Supabase reschedule failed for ${config.taskType} task, queued for sync:`, supabaseError);
        await config.syncAdapter.queueTask('update', optimisticTask);
        return true;
      }
    }, [tasks, supabase, persistTask]);

    // ============================================================================
    // UPDATE TASK DUE DATE
    // ============================================================================

    const updateTaskDueDate = useCallback(async (taskId: string, dueDate: Date | null) => {
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) return null;

      const now = optimisticNow();
      const dueDateString = dueDate ? formatLocalDate(dueDate) : null;
      const optimisticTask: T = {
        ...currentTask,
        dueDate: dueDateString as any,
        updatedAt: now,
      };

      await persistTask(optimisticTask, true);

      if (!supabase || !isBrowserOnline()) {
        await config.syncAdapter.queueTask('update', optimisticTask);
        return optimisticTask;
      }

      try {
        const { data, error } = await supabase
          .from(config.tables.tasks)
          .update({
            due_date: dueDateString,
            updated_at: now,
          })
          .eq('id', taskId)
          .select(`
            *,
            subtasks:${config.tables.subtasks}(*)
            ${config.additionalSelectFields ? `,${config.additionalSelectFields}` : ''}
          `)
          .single();

        if (error || !data) {
          throw error ?? new Error(`Failed to update ${config.taskType} task due date in Supabase`);
        }

        const syncedTask = config.mapSupabaseTask(data);
        await persistTask(syncedTask, false);
        await config.cacheAdapter.markTaskSynced(taskId);
        replaceTaskInState(syncedTask);
        return syncedTask;
      } catch (supabaseError) {
        console.warn(`⚠️ Supabase due date update failed for ${config.taskType} task, queued for sync:`, supabaseError);
        await config.syncAdapter.queueTask('update', optimisticTask);
        return optimisticTask;
      }
    }, [tasks, supabase, persistTask, replaceTaskInState]);

    // ============================================================================
    // UPDATE TASK TITLE
    // ============================================================================

    const updateTaskTitle = useCallback(async (taskId: string, newTitle: string) => {
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) return null;

      const now = optimisticNow();
      const optimisticTask: T = {
        ...currentTask,
        title: newTitle,
        updatedAt: now,
      };

      await persistTask(optimisticTask, true);

      if (!supabase || !isBrowserOnline()) {
        await config.syncAdapter.queueTask('update', optimisticTask);
        return true;
      }

      try {
        const { data, error } = await supabase
          .from(config.tables.tasks)
          .update({
            title: newTitle,
            updated_at: now,
          })
          .eq('id', taskId)
          .select(`
            *,
            subtasks:${config.tables.subtasks}(*)
            ${config.additionalSelectFields ? `,${config.additionalSelectFields}` : ''}
          `)
          .single();

        if (error || !data) {
          throw error ?? new Error(`Failed to update ${config.taskType} task title in Supabase`);
        }

        const syncedTask = config.mapSupabaseTask(data);
        await persistTask(syncedTask, false);
        await config.cacheAdapter.markTaskSynced(taskId);
        replaceTaskInState(syncedTask);
        return true;
      } catch (updateError) {
        console.error(`❌ Error updating ${config.taskType} task title:`, updateError);
        setError(updateError instanceof Error ? updateError.message : 'Failed to update task title');
        await config.syncAdapter.queueTask('update', optimisticTask);
        return false;
      }
    }, [tasks, supabase, persistTask, replaceTaskInState]);

    // ============================================================================
    // UPDATE TASK PRIORITY
    // ============================================================================

    const updateTaskPriority = useCallback(async (taskId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) return null;

      const now = optimisticNow();
      const normalized = priority.toUpperCase() as TaskPriority;

      const optimisticTask: T = {
        ...currentTask,
        priority: normalized,
        updatedAt: now,
      };

      await persistTask(optimisticTask, true);

      if (!supabase || !isBrowserOnline()) {
        await config.syncAdapter.queueTask('update', optimisticTask);
        return optimisticTask;
      }

      try {
        const { data, error } = await supabase
          .from(config.tables.tasks)
          .update({
            priority: normalized,
            updated_at: now,
          })
          .eq('id', taskId)
          .select(`
            *,
            subtasks:${config.tables.subtasks}(*)
            ${config.additionalSelectFields ? `,${config.additionalSelectFields}` : ''}
          `)
          .single();

        if (error || !data) {
          throw error ?? new Error(`Failed to update ${config.taskType} task priority in Supabase`);
        }

        const syncedTask = config.mapSupabaseTask(data);
        await persistTask(syncedTask, false);
        await config.cacheAdapter.markTaskSynced(taskId);
        replaceTaskInState(syncedTask);
        return syncedTask;
      } catch (priorityError) {
        console.error(`❌ Error updating ${config.taskType} task priority:`, priorityError);
        setError(priorityError instanceof Error ? priorityError.message : 'Failed to update task priority');
        await config.syncAdapter.queueTask('update', optimisticTask);
        return optimisticTask;
      }
    }, [tasks, supabase, persistTask, replaceTaskInState]);

    // ============================================================================
    // UPDATE TASK TIME ESTIMATE
    // ============================================================================

    const updateTaskTimeEstimate = useCallback(async (taskId: string, timeEstimate: string | null) => {
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) return null;

      const now = optimisticNow();

      const optimisticTask: T = {
        ...currentTask,
        timeEstimate: timeEstimate as any,
        updatedAt: now,
      };

      await persistTask(optimisticTask, true);

      if (!supabase || !isBrowserOnline()) {
        await config.syncAdapter.queueTask('update', optimisticTask);
        return optimisticTask;
      }

      try {
        const { data, error } = await supabase
          .from(config.tables.tasks)
          .update({
            time_estimate: timeEstimate,
            updated_at: now,
          })
          .eq('id', taskId)
          .select(`
            *,
            subtasks:${config.tables.subtasks}(*)
            ${config.additionalSelectFields ? `,${config.additionalSelectFields}` : ''}
          `)
          .single();

        if (error || !data) {
          throw error ?? new Error(`Failed to update ${config.taskType} task time estimate in Supabase`);
        }

        const syncedTask = config.mapSupabaseTask(data);
        await persistTask(syncedTask, false);
        await config.cacheAdapter.markTaskSynced(taskId);
        replaceTaskInState(syncedTask);
        return syncedTask;
      } catch (estimateError) {
        console.error(`❌ Error updating ${config.taskType} task time estimate:`, estimateError);
        setError(estimateError instanceof Error ? estimateError.message : 'Failed to update time estimate');
        await config.syncAdapter.queueTask('update', optimisticTask);
        return optimisticTask;
      }
    }, [tasks, supabase, persistTask, replaceTaskInState]);

    // ============================================================================
    // UPDATE TASK ACTUAL DURATION
    // ============================================================================

    const updateTaskActualDuration = useCallback(async (taskId: string, actualDurationMin: number | null) => {
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) return null;

      const now = optimisticNow();

      const optimisticTask: T = {
        ...currentTask,
        actualDurationMin: actualDurationMin ?? undefined,
        updatedAt: now,
        completedAt: currentTask.completedAt ?? (actualDurationMin ? now : undefined),
      };

      await persistTask(optimisticTask, true);

      if (!supabase || !isBrowserOnline()) {
        await config.syncAdapter.queueTask('update', optimisticTask);
        return optimisticTask;
      }

      try {
        const { data, error } = await supabase
          .from(config.tables.tasks)
          .update({
            actual_duration_min: actualDurationMin,
            completed_at: optimisticTask.completedAt ?? null,
            updated_at: now,
          })
          .eq('id', taskId)
          .select(`
            *,
            subtasks:${config.tables.subtasks}(*)
            ${config.additionalSelectFields ? `,${config.additionalSelectFields}` : ''}
          `)
          .single();

        if (error || !data) {
          throw error ?? new Error(`Failed to update ${config.taskType} task actual duration in Supabase`);
        }

        const syncedTask = config.mapSupabaseTask(data);
        await persistTask(syncedTask, false);
        await config.cacheAdapter.markTaskSynced(taskId);
        replaceTaskInState(syncedTask);
        return syncedTask;
      } catch (supabaseError) {
        console.warn(`⚠️ Supabase actual duration update failed for ${config.taskType} task, queued for sync:`, supabaseError);
        await config.syncAdapter.queueTask('update', optimisticTask);
        return optimisticTask;
      }
    }, [tasks, supabase, persistTask, replaceTaskInState]);

    // ============================================================================
    // SUBTASK OPERATIONS
    // ============================================================================

    const addSubtask = useCallback(async (taskId: string, subtaskTitle: string, priority = 'MEDIUM') => {
      if (!supabase) return null;

      try {
        const { data, error } = await supabase
          .from(config.tables.subtasks)
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

        const newSubtask = config.mapSupabaseSubtask(data);

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
          .from(config.tables.subtasks)
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
          .from(config.tables.subtasks)
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
          .from(config.tables.subtasks)
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
          .from(config.tables.subtasks)
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
        console.error(`❌ Error updating ${config.taskType} subtask title:`, subtaskError);
        setError(subtaskError instanceof Error ? subtaskError.message : 'Failed to update subtask title');
        return null;
      }
    }, [supabase]);

    const updateSubtaskPriority = useCallback(async (subtaskId: string, priority: string) => {
      if (!supabase) return null;

      try {
        const { error } = await supabase
          .from(config.tables.subtasks)
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
        console.error(`❌ Error updating ${config.taskType} subtask priority:`, subtaskError);
        setError(subtaskError instanceof Error ? subtaskError.message : 'Failed to update subtask priority');
        return null;
      }
    }, [supabase]);

    const updateSubtaskEstimatedTime = useCallback(async (subtaskId: string, estimatedTime: string) => {
      if (!supabase) return null;

      try {
        const { error } = await supabase
          .from(config.tables.subtasks)
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
        console.error(`❌ Error updating ${config.taskType} subtask estimated time:`, subtaskError);
        setError(subtaskError instanceof Error ? subtaskError.message : 'Failed to update subtask estimated time');
        return null;
      }
    }, [supabase]);

    const updateSubtaskDescription = useCallback(async (subtaskId: string, description: string) => {
      if (!supabase) return null;

      try {
        const { error } = await supabase
          .from(config.tables.subtasks)
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
        console.error(`❌ Error updating ${config.taskType} subtask description:`, subtaskError);
        setError(subtaskError instanceof Error ? subtaskError.message : 'Failed to update subtask description');
        return null;
      }
    }, [supabase]);

    // ============================================================================
    // REFRESH
    // ============================================================================

    const refreshTasks = useCallback(() => {
      setLoading(true);
      loadTasks();
    }, [loadTasks]);

    // ============================================================================
    // EFFECTS
    // ============================================================================

    useEffect(() => {
      loadTasks();
    }, [loadTasks]);

    useEffect(() => {
      syncService.setActiveUser(internalUserId ?? null);
    }, [internalUserId]);

    // ============================================================================
    // RETURN
    // ============================================================================

    return {
      tasks,
      loading,
      error,
      createTask,
      deleteTask,
      toggleTaskCompletion,
      pushTaskToAnotherDay,
      updateTaskDueDate,
      updateTaskTitle,
      updateTaskPriority,
      updateTaskTimeEstimate,
      updateTaskActualDuration,
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
  };
}

// Export types for consumers
export type TaskHookReturnType<T extends BaseTask> = ReturnType<ReturnType<typeof createTaskHook<T>>>;
