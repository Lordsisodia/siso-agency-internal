/**
 * 🚀 Deep Work Tasks Hook - OFFLINE-FIRST PWA VERSION
 *
 * Architecture:
 * 1. IndexedDB (offlineDb) - Primary storage, works offline
 * 2. Supabase - Cloud sync when online
 * 3. Auto-sync queue when offline
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { offlineDb } from '@/shared/offline/offlineDb';
import { diff, logDiff } from '@/shared/utils/diff';

export interface DeepWorkTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  originalDate: string;
  currentDate: string;
  taskDate?: string;
  dueDate?: string | null;
  estimatedDuration?: number;
  focusBlocks: number;
  breakDuration: number;
  interruptionMode: boolean;
  rollovers: number;
  tags: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  startedAt?: string;
  actualDurationMin?: number;
  timeEstimate?: string;
  subtasks: DeepWorkSubtask[];
}

export interface DeepWorkSubtask {
  id: string;
  taskId: string;
  title: string;
  text: string;
  completed: boolean;
  priority?: string;
  dueDate?: string;
  estimatedTime?: string;
  requiresFocus: boolean;
  complexityLevel?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface UseDeepWorkTasksProps {
  selectedDate: Date;
}

export function useDeepWorkTasksSupabase({ selectedDate }: UseDeepWorkTasksProps) {
  const { user, isSignedIn } = useClerkUser();
  const supabase = useSupabaseClient();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const [tasks, setTasks] = useState<DeepWorkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncQueueLength, setSyncQueueLength] = useState(0);
  const syncRequests = useRef(0);

  const refreshSyncMetadata = useCallback(async () => {
    try {
      const stats = await offlineDb.getStats();
      setSyncQueueLength(stats.pendingActions);
      setLastSync(stats.lastSync ?? null);
    } catch (metadataError) {
      console.warn('⚠️ Failed to load Deep Work sync metadata:', metadataError);
    }
  }, []);

  const beginSync = useCallback(() => {
    syncRequests.current += 1;
    setIsSyncing(true);
  }, []);

  const endSync = useCallback(() => {
    syncRequests.current = Math.max(0, syncRequests.current - 1);
    if (syncRequests.current === 0) {
      setIsSyncing(false);
    }
  }, []);

  const recordLastSync = useCallback(async () => {
    const now = new Date().toISOString();
    try {
      await offlineDb.setSetting('lastSync', now);
    } catch (persistError) {
      console.warn('⚠️ Failed to persist Deep Work last sync timestamp:', persistError);
    }
    setLastSync(now);
  }, []);

  const runMutation = useCallback(
    async <T,>(
      mutator: () => Promise<T>,
      options: { updateLastSync?: boolean } = {}
    ): Promise<T> => {
      const { updateLastSync = true } = options;
      beginSync();
      try {
        const result = await mutator();
        if (updateLastSync) {
          await recordLastSync();
        }
        return result;
      } finally {
        await refreshSyncMetadata();
        endSync();
      }
    },
    [beginSync, endSync, recordLastSync, refreshSyncMetadata]
  );

  const dateString = selectedDate?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0];

  // Load deep work tasks - INSTANT CACHE + BACKGROUND SYNC
  const loadTasks = useCallback(async () => {
    await refreshSyncMetadata();

    if (!isSignedIn || !internalUserId) {
      setLoading(false);
      return;
    }

    try {
      // Don't show loading for cached data!
      setError(null);

      console.log('🧠 Loading Deep Work tasks (instant cache)...');

      // 1. Load from IndexedDB INSTANTLY (no loading state)
      const localTasks = await offlineDb.getDeepWorkTasks(dateString);

      if (localTasks && localTasks.length > 0) {
        console.log(`⚡ INSTANT: Loaded ${localTasks.length} tasks from IndexedDB (${navigator.onLine ? 'online' : 'offline'})`);
        // Transform and set local tasks IMMEDIATELY (no loading!)
        const transformedLocal = localTasks.map(task => ({
          id: task.id,
          userId: task.user_id,
          title: task.title,
          description: task.description,
          priority: task.priority || 'MEDIUM' as const,
          completed: task.completed,
          originalDate: task.original_date,
          currentDate: task.task_date || task.original_date,
          dueDate: task.task_date || null,
          estimatedDuration: task.estimated_duration,
          focusBlocks: task.focus_blocks || 4,
          breakDuration: 15,
          interruptionMode: false,
          rollovers: 0,
          tags: [],
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          completedAt: task.completed_at,
          timeEstimate: (task as any).time_estimate || null,
          subtasks: []
        }));
        setTasks(transformedLocal);
        setLoading(false); // Instant load complete!
      } else {
        setLoading(false); // No local data, load complete
      }

      // 2. If online, sync with Supabase in BACKGROUND (doesn't block UI)
      if (navigator.onLine && supabase) {
        try {
          await runMutation(async () => {
            const { data: tasksData, error: tasksError } = await supabase
              .from('deep_work_tasks')
              .select(`
                *,
                subtasks:deep_work_subtasks(*)
              `)
              .eq('user_id', internalUserId)
              .eq('completed', false)
              .order('created_at', { ascending: false });

            if (tasksError) {
              throw new Error(tasksError.message);
            }

            // Transform Supabase data and cache locally
            const transformedTasks: DeepWorkTask[] = tasksData?.map(task => ({
              id: task.id,
              userId: task.user_id,
              title: task.title,
              description: task.description,
              priority: task.priority,
              completed: task.completed,
              originalDate: task.original_date,
              currentDate: task.task_date || task.original_date,
              dueDate: task.due_date,
              estimatedDuration: task.estimated_duration,
              focusBlocks: task.focus_blocks || 4,
              breakDuration: task.break_duration || 15,
              interruptionMode: task.interruption_mode || false,
              rollovers: task.rollovers || 0,
              tags: task.tags || [],
              category: task.category,
              createdAt: task.created_at,
              updatedAt: task.updated_at,
              completedAt: task.completed_at,
              startedAt: task.started_at,
              actualDurationMin: task.actual_duration_min,
              timeEstimate: task.time_estimate,
              subtasks: task.subtasks?.map((subtask: any) => ({
                id: subtask.id,
                taskId: subtask.task_id,
                title: subtask.title,
                text: subtask.text || subtask.title,
                completed: subtask.completed,
                priority: subtask.priority,
                dueDate: subtask.due_date,
                estimatedTime: subtask.estimated_time,
                requiresFocus: subtask.requires_focus || false,
                complexityLevel: subtask.complexity_level || 1,
                createdAt: subtask.created_at,
                updatedAt: subtask.updated_at,
                completedAt: subtask.completed_at
              })) || []
            })) || [];

            for (const task of tasksData || []) {
              await offlineDb.saveDeepWorkTask({
                id: task.id,
                user_id: task.user_id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                completed: task.completed,
                original_date: task.original_date,
                task_date: task.task_date || task.original_date,
                estimated_duration: task.estimated_duration,
                due_date: task.due_date,
                time_estimate: task.time_estimate,
                focus_blocks: task.focus_blocks,
                created_at: task.created_at,
                updated_at: task.updated_at,
                completed_at: task.completed_at,
                _needs_sync: false,
                _sync_status: 'synced'
              }, false);
            }

            console.log(`✅ Loaded ${transformedTasks.length} Deep Work tasks from Supabase + cached locally`);
            setTasks(transformedTasks);
          });
        } catch (syncError) {
          console.warn('⚠️ Supabase sync failed (using offline data):', syncError instanceof Error ? syncError.message : syncError);
        }
      }

    } catch (error) {
      console.error('❌ Error loading Deep Work tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tasks');
      setLoading(false);
    }
    // No finally block - loading is set false immediately after IndexedDB load
  }, [isSignedIn, internalUserId, dateString, supabase]);

  // Create new deep work task - OFFLINE-FIRST
  const createTask = useCallback(async (taskData: Partial<DeepWorkTask>) => {
    if (!internalUserId) return null;

    try {
      console.log('➕ Creating Deep Work task (offline-first)...');

      const taskId = `deep-${Date.now()}`;
      const now = new Date().toISOString();

      // 1. Create task in offlineDb FIRST (always works)
      const localTask = {
        id: taskId,
        user_id: internalUserId,
        title: taskData.title || '',
        description: taskData.description,
        priority: taskData.priority || 'HIGH',
        original_date: dateString,
        task_date: dateString,
        due_date: null as string | null,
        completed: false,
        focus_blocks: taskData.focusBlocks || 4,
        estimated_duration: taskData.estimatedDuration,
        time_estimate: taskData.timeEstimate || null,
        created_at: now,
        updated_at: now,
        _needs_sync: true,
        _sync_status: 'pending' as const
      };

      await offlineDb.saveDeepWorkTask(localTask, true);
      console.log('✅ Task saved to IndexedDB');
      await refreshSyncMetadata();

      const newTask: DeepWorkTask = {
        id: localTask.id,
        userId: localTask.user_id,
        title: localTask.title,
        description: localTask.description,
        priority: localTask.priority as any,
        completed: localTask.completed,
        originalDate: localTask.original_date,
        currentDate: localTask.task_date,
        dueDate: null,
        estimatedDuration: localTask.estimated_duration,
        focusBlocks: localTask.focus_blocks || 4,
        breakDuration: 15,
        interruptionMode: false,
        rollovers: 0,
        tags: [],
        createdAt: localTask.created_at,
        updatedAt: localTask.updated_at,
        timeEstimate: null,
        subtasks: []
      };

      // 2. If online, sync to Supabase in background
      if (navigator.onLine && supabase) {
        runMutation(async () => {
          const { error } = await supabase
            .from('deep_work_tasks')
            .insert({
              id: taskId,
              user_id: internalUserId,
              title: taskData.title,
              description: taskData.description,
              priority: taskData.priority || 'HIGH',
              original_date: dateString,
              task_date: dateString,
              due_date: null,
              completed: false,
              focus_blocks: taskData.focusBlocks || 4,
              break_duration: 15,
              interruption_mode: false,
              rollovers: 0,
              tags: taskData.tags || [],
              category: taskData.category,
              estimated_duration: taskData.estimatedDuration,
              time_estimate: taskData.timeEstimate || null
            });

          if (error) {
            throw new Error(error.message);
          }

          console.log('✅ Task synced to Supabase');
          await offlineDb.markTaskSynced(taskId, 'deepWorkTasks');
        }).catch(syncError => {
          console.warn('⚠️ Supabase sync failed (queued for retry):', syncError instanceof Error ? syncError.message : syncError);
        });
      }

      console.log(`✅ Created Deep Work task in Supabase: ${newTask.title}`);
      setTasks(prev => [...prev, newTask]);
      return newTask;

    } catch (error) {
      console.error('❌ Error creating Deep Work task in Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task in Supabase');
      return null;
    }
  }, [internalUserId, dateString, supabase, refreshSyncMetadata, runMutation]);

  // Toggle task completion in Supabase
  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`🔄 Toggling Deep Work task completion in Supabase: ${taskId}`);

      // Get current task state
      const currentTask = tasks.find(t => t.id === taskId);
      if (!currentTask) return null;

      const newCompleted = !currentTask.completed;
      const now = new Date().toISOString();

      const data = await runMutation(async () => {
        const { data, error } = await supabase
          .from('deep_work_tasks')
          .update({
            completed: newCompleted,
            completed_at: newCompleted ? now : null,
            updated_at: now
          })
          .eq('id', taskId)
          .select()
          .single();

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        return data;
      });

      const updatedTask: DeepWorkTask = {
        ...currentTask,
        completed: data.completed,
        completedAt: data.completed_at,
        updatedAt: data.updated_at
      };

      console.log(`✅ Toggled Deep Work task completion in Supabase: ${taskId} -> ${newCompleted}`);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      return updatedTask;

    } catch (error) {
      console.error('❌ Error toggling Deep Work task completion in Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to toggle task in Supabase');
      return null;
    }
  }, [tasks, supabase, runMutation]);

  // Add subtask to task in Supabase
  const addSubtask = useCallback(async (taskId: string, subtaskTitle: string, priority = 'HIGH') => {
    if (!supabase) return null;
    
    try {
      console.log(`➕ Adding subtask to Deep Work task in Supabase: ${taskId}`);

      const data = await runMutation(async () => {
        const { data, error } = await supabase
          .from('deep_work_subtasks')
          .insert({
            task_id: taskId,
            title: subtaskTitle,
            text: subtaskTitle,
            completed: false,
            priority,
            requires_focus: true,
            complexity_level: 1
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        return data;
      });

      const newSubtask: DeepWorkSubtask = {
        id: data.id,
        taskId: data.taskId,
        title: data.title,
        text: data.text,
        completed: data.completed,
        priority: data.priority,
        due_date: data.dueDate,
        requiresFocus: data.requiresFocus,
        complexityLevel: data.complexityLevel,
        createdAt: data.createdAt,
        updatedAt: data.updated_at,
        completedAt: data.completed_at
      };

      console.log(`✅ Added subtask to Deep Work task in Supabase: ${taskId}`);
      
      // Update tasks state to include new subtask
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, subtasks: [...task.subtasks, newSubtask] }
          : task
      ));
      
      return newSubtask;

    } catch (error) {
      console.error('❌ Error adding Deep Work subtask in Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to add subtask in Supabase');
      return null;
    }
  }, [supabase, runMutation]);

  // Delete task from Supabase
  const deleteTask = useCallback(async (taskId: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`🗑️ Deleting Deep Work task from Supabase: ${taskId}`);

      await runMutation(async () => {
        const { error } = await supabase
          .from('deep_work_tasks')
          .delete()
          .eq('id', taskId);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
      });

      console.log(`✅ Deleted Deep Work task from Supabase: ${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return true;

    } catch (error) {
      console.error('❌ Error deleting Deep Work task from Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete task from Supabase');
      return null;
    }
  }, [supabase, runMutation]);

  // Delete subtask from Supabase
  const deleteSubtask = useCallback(async (subtaskId: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`🗑️ Deleting Deep Work subtask from Supabase: ${subtaskId}`);

      await runMutation(async () => {
        const { error } = await supabase
          .from('deep_work_subtasks')
          .delete()
          .eq('id', subtaskId);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
      });

      console.log(`✅ Deleted Deep Work subtask from Supabase: ${subtaskId}`);
      
      // Update tasks state to remove deleted subtask
      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
      })));
      
      return true;

    } catch (error) {
      console.error('❌ Error deleting Deep Work subtask from Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete subtask from Supabase');
      return null;
    }
  }, [supabase, runMutation]);

  // Toggle subtask completion
  const toggleSubtaskCompletion = useCallback(async (taskId: string, subtaskId: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`🔄 Toggling Deep Work subtask completion: ${subtaskId}`);
      
      // Find current subtask state
      const currentTask = tasks.find(t => t.id === taskId);
      const currentSubtask = currentTask?.subtasks.find(s => s.id === subtaskId);
      if (!currentSubtask) return null;
      
      const newCompleted = !currentSubtask.completed;
      const now = new Date().toISOString();
      
      await runMutation(async () => {
        const { error } = await supabase
          .from('deep_work_subtasks')
          .update({
            completed: newCompleted,
            completed_at: newCompleted ? now : null,
            updated_at: now
          })
          .eq('id', subtaskId);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
      });
      
      console.log(`✅ Toggled Deep Work subtask completion: ${subtaskId} -> ${newCompleted}`);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? {
              ...task,
              subtasks: task.subtasks.map(subtask => 
                subtask.id === subtaskId 
                  ? { ...subtask, completed: newCompleted, completedAt: newCompleted ? now : null }
                  : subtask
              )
            }
          : task
      ));
      
      return true;
      
    } catch (error) {
      console.error('❌ Error toggling Deep Work subtask completion:', error);
      setError(error instanceof Error ? error.message : 'Failed to toggle subtask');
      return null;
    }
  }, [tasks, supabase, runMutation]);

  // Update task title
  const updateTaskTitle = useCallback(async (taskId: string, newTitle: string) => {
    if (!supabase) return null;

    try {
      console.log(`✏️ Updating Deep Work task title: ${taskId}`);
      
      await runMutation(async () => {
        const { error } = await supabase
          .from('deep_work_tasks')
          .update({
            title: newTitle,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
      });
      
      console.log(`✅ Updated Deep Work task title: ${taskId}`);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, title: newTitle }
          : task
      ));
      
      return true;
      
    } catch (error) {
      console.error('❌ Error updating Deep Work task title:', error);
      setError(error instanceof Error ? error.message : 'Failed to update task title');
      return null;
    }
  }, [supabase, runMutation]);

  const updateTaskPriority = useCallback(async (taskId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    if (!supabase) return null;

    try {
      console.log(`🎯 Updating Deep Work task priority: ${taskId} -> ${priority}`);

      const normalizedPriority = priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

      await runMutation(async () => {
        const { error } = await supabase
          .from('deep_work_tasks')
          .update({
            priority: normalizedPriority,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
      });

      console.log(`✅ Updated Deep Work task priority: ${taskId}`);

      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, priority: normalizedPriority }
          : task
      ));

      return true;
    } catch (error) {
      console.error('❌ Error updating Deep Work task priority:', error);
      setError(error instanceof Error ? error.message : 'Failed to update task priority');
      return null;
    }
  }, [supabase, runMutation]);

  const updateTaskTimeEstimate = useCallback(async (taskId: string, timeEstimate: string | null) => {
    if (!supabase) return null;

    try {
      console.log(`⏱️ Updating Deep Work task time estimate: ${taskId} -> ${timeEstimate}`);

      await runMutation(async () => {
        const { error } = await supabase
          .from('deep_work_tasks')
          .update({
            time_estimate: timeEstimate,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
      });

      console.log(`✅ Updated Deep Work task time estimate: ${taskId}`);

      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, timeEstimate: timeEstimate || null }
          : task
      ));

      return true;
    } catch (error) {
      console.error('❌ Error updating Deep Work task time estimate:', error);
      setError(error instanceof Error ? error.message : 'Failed to update task time estimate');
      return null;
    }
  }, [supabase, runMutation]);

  // Push task to another day (reschedule)
  const pushTaskToAnotherDay = useCallback(async (taskId: string, newDate: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`📅 Rescheduling Deep Work task: ${taskId} to ${newDate}`);
      
      await runMutation(async () => {
        const { error } = await supabase
          .from('deep_work_tasks')
          .update({
            task_date: newDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
      });
      
      console.log(`✅ Rescheduled Deep Work task: ${taskId} to ${newDate}`);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, currentDate: newDate, isPushed: true }
          : task
      ));
      
      return true;
      
    } catch (error) {
      console.error('❌ Error rescheduling Deep Work task:', error);
      setError(error instanceof Error ? error.message : 'Failed to reschedule task');
      return null;
    }
  }, [supabase, runMutation]);

  // Update task due date (works on both tasks and subtasks)
  const updateTaskDueDate = useCallback(async (taskOrSubtaskId: string, dueDate: Date | null) => {
    if (!supabase) return null;
    
    try {
      console.log(`📅 Updating Deep Work due date in Supabase: ${taskOrSubtaskId}`);
      
      // Format date for database
      const dateString = dueDate ? dueDate.toISOString() : null;
      
      const updateResult = await runMutation(async () => {
        const { error: subtaskError } = await supabase
          .from('deep_work_subtasks')
          .update({
            due_date: dateString,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskOrSubtaskId);

        if (!subtaskError) {
          return { updated: 'subtask' as const };
        }

        const { error: taskError } = await supabase
          .from('deep_work_tasks')
          .update({
            due_date: dateString,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskOrSubtaskId);

        if (taskError) {
          throw new Error(taskError.message);
        }

        return { updated: 'task' as const };
      }, { updateLastSync: true });

      if (updateResult.updated === 'subtask') {
        console.log(`✅ Updated Deep Work subtask due date: ${taskOrSubtaskId}`);

        setTasks(prev => prev.map(task => ({
          ...task,
          subtasks: task.subtasks.map(subtask =>
            subtask.id === taskOrSubtaskId
              ? { ...subtask, dueDate: dateString }
              : subtask
          )
        })));

        return true;
      }

      console.log(`✅ Updated Deep Work task due date: ${taskOrSubtaskId}`);

      setTasks(prev => prev.map(task =>
        task.id === taskOrSubtaskId
          ? { ...task, dueDate: dateString }
          : task
      ));

      return true;
      
    } catch (error) {
      console.error('❌ Error updating Deep Work due date:', error);
      setError(error instanceof Error ? error.message : 'Failed to update due date');
      return null;
    }
  }, [supabase, runMutation]);

  // Update subtask title in Supabase
  const updateSubtaskTitle = useCallback(async (subtaskId: string, newTitle: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`✏️ Updating Deep Work subtask title: ${subtaskId} -> ${newTitle}`);

      await runMutation(async () => {
        const { error } = await supabase
          .from('deep_work_subtasks')
          .update({
            title: newTitle,
            text: newTitle, // Update both title and text fields
            updated_at: new Date().toISOString()
          })
          .eq('id', subtaskId);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
      });

      console.log(`✅ Updated Deep Work subtask title: ${subtaskId}`);
      
      // Update local state
      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, title: newTitle, text: newTitle }
            : subtask
        )
      })));
      
      return true;
      
    } catch (error) {
      console.error('❌ Error updating Deep Work subtask title:', error);
      setError(error instanceof Error ? error.message : 'Failed to update subtask title');
      return null;
    }
  }, [supabase, runMutation]);

  // Update subtask priority in Supabase
  const updateSubtaskPriority = useCallback(async (subtaskId: string, priority: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`🎯 Updating Deep Work subtask priority: ${subtaskId} -> ${priority}`);

      await runMutation(async () => {
        const { error } = await supabase
          .from('deep_work_subtasks')
          .update({
            priority: priority,
            updated_at: new Date().toISOString()
          })
          .eq('id', subtaskId);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
      });

      console.log(`✅ Updated Deep Work subtask priority: ${subtaskId}`);
      
      // Update local state
      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, priority: priority }
            : subtask
        )
      })));
      
      return true;
      
    } catch (error) {
      console.error('❌ Error updating Deep Work subtask priority:', error);
      setError(error instanceof Error ? error.message : 'Failed to update subtask priority');
      return null;
    }
  }, [supabase, runMutation]);

  // Update subtask due date in Supabase (dedicated function for subtasks only)
  const updateSubtaskDueDate = useCallback(async (subtaskId: string, dueDate: Date | null) => {
    if (!supabase) return null;
    
    try {
      console.log(`📅 Updating Deep Work subtask due date: ${subtaskId} -> ${dueDate}`);

      const dateString = dueDate ? dueDate.toISOString() : null;
      
      await runMutation(async () => {
        const { error } = await supabase
          .from('deep_work_subtasks')
          .update({
            due_date: dateString,
            updated_at: new Date().toISOString()
          })
          .eq('id', subtaskId);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
      });

      console.log(`✅ Updated Deep Work subtask due date: ${subtaskId}`);
      
      // Update local state
      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, dueDate: dateString }
            : subtask
        )
      })));
      
      return true;
      
    } catch (error) {
      console.error('❌ Error updating Deep Work subtask due date:', error);
      setError(error instanceof Error ? error.message : 'Failed to update subtask due date');
      return null;
    }
  }, [supabase, runMutation]);

  // Update subtask description (text field) in Supabase
  const updateSubtaskDescription = useCallback(async (subtaskId: string, description: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`📝 Updating Deep Work subtask description: ${subtaskId}`);

      await runMutation(async () => {
        const { error } = await supabase
          .from('deep_work_subtasks')
          .update({
            text: description,
            updated_at: new Date().toISOString()
          })
          .eq('id', subtaskId);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
      });

      console.log(`✅ Updated Deep Work subtask description: ${subtaskId}`);
      
      // Update local state
      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, text: description }
            : subtask
        )
      })));
      
      return true;
      
    } catch (error) {
      console.error('❌ Error updating Deep Work subtask description:', error);
      setError(error instanceof Error ? error.message : 'Failed to update subtask description');
      return null;
    }
  }, [supabase, runMutation]);

  // Update subtask estimated time in Supabase
  const updateSubtaskEstimatedTime = useCallback(async (subtaskId: string, estimatedTime: string) => {
    if (!supabase) return null;

    try {
      console.log(`⏱️ Updating Deep Work subtask estimated time: ${subtaskId} -> ${estimatedTime}`);

      await runMutation(async () => {
        const { error } = await supabase
          .from('deep_work_subtasks')
          .update({
            estimated_time: estimatedTime,
            updated_at: new Date().toISOString()
          })
          .eq('id', subtaskId);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
      });

      console.log(`✅ Updated Deep Work subtask estimated time: ${subtaskId}`);

      // Update local state
      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask =>
          subtask.id === subtaskId
            ? { ...subtask, estimatedTime: estimatedTime }
            : subtask
        )
      })));

      return true;

    } catch (error) {
      console.error('❌ Error updating Deep Work subtask estimated time:', error);
      setError(error instanceof Error ? error.message : 'Failed to update subtask estimated time');
      return null;
    }
  }, [supabase, runMutation]);

  useEffect(() => {
    refreshSyncMetadata();

    if (typeof window === 'undefined') {
      return;
    }

    const handleNetworkChange = () => {
      refreshSyncMetadata();
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, [refreshSyncMetadata]);

  // Load tasks when dependencies change
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    isSyncing,
    lastSync,
    syncQueueLength,
    createTask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    addSubtask,
    deleteTask,
    deleteSubtask,
    updateTaskTitle,
    updateTaskPriority,
    updateTaskTimeEstimate,
    updateSubtaskTitle,
    updateSubtaskPriority,
    updateSubtaskEstimatedTime,
    pushTaskToAnotherDay,
    updateTaskDueDate,
    updateSubtaskDueDate,
    updateSubtaskDescription,
    refreshTasks: loadTasks
  };
}