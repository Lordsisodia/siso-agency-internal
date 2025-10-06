/**
 * 🚀 Light Work Tasks Hook - OFFLINE-FIRST PWA VERSION
 *
 * Architecture:
 * 1. IndexedDB (offlineDb) - Primary storage, works offline
 * 2. Supabase - Cloud sync when online
 * 3. Auto-sync queue when offline
 */

import { useState, useCallback, useEffect } from 'react';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { offlineDb } from '@/shared/offline/offlineDb';

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

export function useLightWorkTasksSupabase({ selectedDate }: UseLightWorkTasksProps) {
  const { user, isSignedIn } = useClerkUser();
  const supabase = useSupabaseClient();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const [tasks, setTasks] = useState<LightWorkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateString = selectedDate?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0];

  // Load light work tasks - INSTANT CACHE + BACKGROUND SYNC
  const loadTasks = useCallback(async () => {
    if (!isSignedIn || !internalUserId) {
      setLoading(false);
      return;
    }

    try {
      // Don't show loading for cached data!
      setError(null);

      console.log('📊 Loading Light Work tasks (instant cache)...');

      // 1. Load from IndexedDB INSTANTLY (no loading state)
      const localTasks = await offlineDb.getLightWorkTasks(dateString);

      if (localTasks && localTasks.length > 0) {
        console.log(`⚡ INSTANT: Loaded ${localTasks.length} tasks from IndexedDB (${navigator.onLine ? 'online' : 'offline'})`);
        const transformedLocal = localTasks.map(task => ({
          id: task.id,
          userId: task.user_id,
          title: task.title,
          description: task.description,
          priority: task.priority || 'MEDIUM' as const,
          completed: task.completed,
          originalDate: task.original_date,
          currentDate: task.task_date || task.original_date,
          estimatedDuration: task.estimated_duration,
          rollovers: 0,
          tags: [],
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          completedAt: task.completed_at,
          subtasks: []
        }));
        setTasks(transformedLocal);
        setLoading(false); // Instant load complete!
      } else {
        setLoading(false); // No local data, load complete
      }

      // 2. If online, sync with Supabase in BACKGROUND (doesn't block UI)
      if (navigator.onLine && supabase) {
        const { data: tasksData, error: tasksError } = await supabase
          .from('light_work_tasks')
          .select(`
            *,
            subtasks:light_work_subtasks(*)
          `)
          .eq('user_id', internalUserId)
          .eq('completed', false)
          .order('created_at', { ascending: false });

        if (tasksError) {
          console.warn('⚠️ Supabase sync failed (using offline data):', tasksError.message);
          return;
        }

        // Transform Supabase data and cache locally
        const transformedTasks: LightWorkTask[] = tasksData?.map(task => ({
          id: task.id,
          userId: task.user_id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          completed: task.completed,
          originalDate: task.original_date,
          currentDate: task.task_date || task.original_date,
          estimatedDuration: task.estimated_duration,
          rollovers: task.rollovers || 0,
          tags: task.tags || [],
          category: task.category,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          completedAt: task.completed_at,
          startedAt: task.started_at,
          actualDurationMin: task.actual_duration_min,
          timeEstimate: task.time_estimate,
          dueDate: task.due_date,
          subtasks: task.subtasks?.map((subtask: any) => ({
            id: subtask.id,
            taskId: subtask.task_id,
            title: subtask.title,
            text: subtask.text || subtask.title,
            completed: subtask.completed,
            priority: subtask.priority,
            dueDate: subtask.due_date,
            estimatedTime: subtask.estimated_time,
            createdAt: subtask.created_at,
            updatedAt: subtask.updated_at,
            completedAt: subtask.completed_at
          })) || []
        })) || [];

        // Cache to offlineDb for offline access
        for (const task of tasksData || []) {
          await offlineDb.saveLightWorkTask({
            id: task.id,
            user_id: task.user_id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            completed: task.completed,
            original_date: task.original_date,
            task_date: task.task_date || task.original_date,
            estimated_duration: task.estimated_duration,
            created_at: task.created_at,
            updated_at: task.updated_at,
            completed_at: task.completed_at,
            _needs_sync: false,
            _sync_status: 'synced'
          }, false);
        }

        console.log(`✅ Loaded ${transformedTasks.length} Light Work tasks from Supabase + cached locally`);
        setTasks(transformedTasks);
      }

    } catch (error) {
      console.error('❌ Error loading Light Work tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tasks');
      setLoading(false);
    }
    // No finally block - loading is set false immediately after IndexedDB load
  }, [isSignedIn, internalUserId, dateString, supabase]);

  // Create new light work task - OFFLINE-FIRST
  const createTask = useCallback(async (taskData: Partial<LightWorkTask>) => {
    if (!internalUserId) return null;

    try {
      console.log('➕ Creating Light Work task (offline-first)...');

      const taskId = `light-${Date.now()}`;
      const now = new Date().toISOString();

      // 1. Create task in offlineDb FIRST (always works)
      const localTask = {
        id: taskId,
        user_id: internalUserId,
        title: taskData.title || '',
        description: taskData.description,
        priority: taskData.priority || 'MEDIUM',
        original_date: dateString,
        task_date: dateString,
        completed: false,
        estimated_duration: taskData.estimatedDuration,
        created_at: now,
        updated_at: now,
        _needs_sync: true,
        _sync_status: 'pending' as const
      };

      await offlineDb.saveLightWorkTask(localTask, true);
      console.log('✅ Task saved to IndexedDB');

      const newTask: LightWorkTask = {
        id: localTask.id,
        userId: localTask.user_id,
        title: localTask.title,
        description: localTask.description,
        priority: localTask.priority as any,
        completed: localTask.completed,
        originalDate: localTask.original_date,
        currentDate: localTask.task_date,
        estimatedDuration: localTask.estimated_duration,
        rollovers: 0,
        tags: [],
        createdAt: localTask.created_at,
        updatedAt: localTask.updated_at,
        subtasks: []
      };

      // 2. If online, sync to Supabase in background
      if (navigator.onLine && supabase) {
        supabase
          .from('light_work_tasks')
          .insert({
            id: taskId,
            user_id: internalUserId,
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority || 'MEDIUM',
            original_date: dateString,
            task_date: dateString,
            completed: false,
            rollovers: 0,
            tags: taskData.tags || [],
            category: taskData.category,
            estimated_duration: taskData.estimatedDuration
          })
          .then(({ error }) => {
            if (error) {
              console.warn('⚠️ Supabase sync failed (queued for retry):', error.message);
            } else {
              console.log('✅ Task synced to Supabase');
              offlineDb.markTaskSynced(taskId, 'lightWorkTasks');
            }
          });
      }

      console.log(`✅ Created Light Work task (${navigator.onLine ? 'online' : 'offline'}): ${newTask.title}`);
      setTasks(prev => [...prev, newTask]);
      return newTask;

    } catch (error) {
      console.error('❌ Error creating Light Work task:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task');
      return null;
    }
  }, [internalUserId, dateString, supabase]);

  // Toggle task completion in Supabase
  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`🔄 Toggling task completion in Supabase: ${taskId}`);

      // Get current task state
      const currentTask = tasks.find(t => t.id === taskId);
      if (!currentTask) return null;

      const newCompleted = !currentTask.completed;
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('light_work_tasks')
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

      const updatedTask: LightWorkTask = {
        ...currentTask,
        completed: data.completed,
        completedAt: data.completed_at,
        updatedAt: data.updated_at
      };

      console.log(`✅ Toggled task completion in Supabase: ${taskId} -> ${newCompleted}`);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      return updatedTask;

    } catch (error) {
      console.error('❌ Error toggling task completion in Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to toggle task in Supabase');
      return null;
    }
  }, [tasks, supabase]);

  // Add subtask to task in Supabase
  const addSubtask = useCallback(async (taskId: string, subtaskTitle: string, priority = 'Med') => {
    if (!supabase) return null;
    
    try {
      console.log(`➕ Adding subtask to task in Supabase: ${taskId}`);

      const { data, error } = await supabase
        .from('light_work_subtasks')
        .insert({
          task_id: taskId,
          title: subtaskTitle,
          text: subtaskTitle,
          completed: false,
          priority
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      const newSubtask: LightWorkSubtask = {
        id: data.id,
        taskId: data.task_id,
        title: data.title,
        text: data.text,
        completed: data.completed,
        priority: data.priority,
        dueDate: data.due_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        completedAt: data.completed_at
      };

      console.log(`✅ Added subtask to task in Supabase: ${taskId}`);
      
      // Update tasks state to include new subtask
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, subtasks: [...task.subtasks, newSubtask] }
          : task
      ));
      
      return newSubtask;

    } catch (error) {
      console.error('❌ Error adding subtask in Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to add subtask in Supabase');
      return null;
    }
  }, [supabase]);

  // Delete task from Supabase
  const deleteTask = useCallback(async (taskId: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`🗑️ Deleting task from Supabase: ${taskId}`);

      const { error } = await supabase
        .from('light_work_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log(`✅ Deleted task from Supabase: ${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return true;

    } catch (error) {
      console.error('❌ Error deleting task from Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete task from Supabase');
      return null;
    }
  }, [supabase]);

  // Update task due date in Supabase
  // Toggle subtask completion
  const toggleSubtaskCompletion = useCallback(async (taskId: string, subtaskId: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`🔄 Toggling Light Work subtask completion: ${subtaskId}`);
      
      // Find current subtask state
      const currentTask = tasks.find(t => t.id === taskId);
      const currentSubtask = currentTask?.subtasks.find(s => s.id === subtaskId);
      if (!currentSubtask) return null;
      
      const newCompleted = !currentSubtask.completed;
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('light_work_subtasks')
        .update({
          completed: newCompleted,
          completed_at: newCompleted ? now : null,
          updated_at: now
        })
        .eq('id', subtaskId);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      console.log(`✅ Toggled Light Work subtask completion: ${subtaskId} -> ${newCompleted}`);
      
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
      console.error('❌ Error toggling Light Work subtask completion:', error);
      setError(error instanceof Error ? error.message : 'Failed to toggle subtask');
      return null;
    }
  }, [tasks, supabase]);

  // Update task title
  const updateTaskTitle = useCallback(async (taskId: string, newTitle: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`✏️ Updating Light Work task title: ${taskId}`);
      
      const { error } = await supabase
        .from('light_work_tasks')
        .update({
          title: newTitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      console.log(`✅ Updated Light Work task title: ${taskId}`);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, title: newTitle }
          : task
      ));
      
      return true;
      
    } catch (error) {
      console.error('❌ Error updating Light Work task title:', error);
      setError(error instanceof Error ? error.message : 'Failed to update task title');
      return null;
    }
  }, [supabase]);

  // Push task to another day (reschedule)
  const pushTaskToAnotherDay = useCallback(async (taskId: string, newDate: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`📅 Rescheduling Light Work task: ${taskId} to ${newDate}`);
      
      const { error } = await supabase
        .from('light_work_tasks')
        .update({
          task_date: newDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      console.log(`✅ Rescheduled Light Work task: ${taskId} to ${newDate}`);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, currentDate: newDate, isPushed: true }
          : task
      ));
      
      return true;
      
    } catch (error) {
      console.error('❌ Error rescheduling Light Work task:', error);
      setError(error instanceof Error ? error.message : 'Failed to reschedule task');
      return null;
    }
  }, [supabase]);

  const updateTaskDueDate = useCallback(async (taskId: string, dueDate: Date | null) => {
    if (!supabase) return null;
    
    try {
      console.log(`📅 Updating task due date in Supabase: ${taskId} -> ${dueDate}`);

      const { data, error } = await supabase
        .from('light_work_tasks')
        .update({
          due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log(`✅ Updated task due date in Supabase: ${taskId}`);
      
      // Update tasks state with new due date
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, dueDate: dueDate?.toISOString().split('T')[0] } : task
      ));
      
      return data;

    } catch (error) {
      console.error('❌ Error updating task due date in Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to update due date in Supabase');
      return null;
    }
  }, [supabase]);

  // Delete subtask from Supabase
  const deleteSubtask = useCallback(async (subtaskId: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`🗑️ Deleting subtask from Supabase: ${subtaskId}`);

      const { error } = await supabase
        .from('light_work_subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log(`✅ Deleted subtask from Supabase: ${subtaskId}`);
      
      // Update tasks state to remove deleted subtask
      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
      })));
      
      return true;

    } catch (error) {
      console.error('❌ Error deleting subtask from Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete subtask from Supabase');
      return null;
    }
  }, [supabase]);

  // Update subtask due date in Supabase
  const updateSubtaskDueDate = useCallback(async (subtaskId: string, dueDate: Date | null) => {
    if (!supabase) return null;
    
    try {
      console.log(`📅 Updating subtask due date in Supabase: ${subtaskId} -> ${dueDate}`);

      const { error } = await supabase
        .from('light_work_subtasks')
        .update({
          due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', subtaskId);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log(`✅ Updated subtask due date in Supabase: ${subtaskId}`);
      
      // Update tasks state with new subtask due date
      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask => 
          subtask.id === subtaskId ? { ...subtask, dueDate: dueDate?.toISOString().split('T')[0] } : subtask
        )
      })));
      
      return true;

    } catch (error) {
      console.error('❌ Error updating subtask due date in Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to update subtask due date in Supabase');
      return null;
    }
  }, [supabase]);

  // Update subtask title in Supabase
  const updateSubtaskTitle = useCallback(async (subtaskId: string, newTitle: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`✏️ Updating Light Work subtask title: ${subtaskId} -> ${newTitle}`);
      
      const { error } = await supabase
        .from('light_work_subtasks')
        .update({
          title: newTitle,
          text: newTitle, // Update both title and text fields
          updated_at: new Date().toISOString()
        })
        .eq('id', subtaskId);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      console.log(`✅ Updated Light Work subtask title: ${subtaskId}`);
      
      // Update tasks state with new subtask title
      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask => 
          subtask.id === subtaskId ? { ...subtask, title: newTitle, text: newTitle } : subtask
        )
      })));
      
      return true;
      
    } catch (error) {
      console.error('❌ Error updating Light Work subtask title:', error);
      setError(error instanceof Error ? error.message : 'Failed to update subtask title');
      return null;
    }
  }, [supabase]);

  // Update subtask priority in Supabase
  const updateSubtaskPriority = useCallback(async (subtaskId: string, priority: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`🎯 Updating Light Work subtask priority: ${subtaskId} -> ${priority}`);

      const { error } = await supabase
        .from('light_work_subtasks')
        .update({
          priority: priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', subtaskId);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log(`✅ Updated Light Work subtask priority: ${subtaskId}`);
      
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
      console.error('❌ Error updating Light Work subtask priority:', error);
      setError(error instanceof Error ? error.message : 'Failed to update subtask priority');
      return null;
    }
  }, [supabase]);

  // Update subtask description (text field) in Supabase
  const updateSubtaskDescription = useCallback(async (subtaskId: string, description: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`📝 Updating Light Work subtask description: ${subtaskId}`);

      const { error } = await supabase
        .from('light_work_subtasks')
        .update({
          text: description,
          updated_at: new Date().toISOString()
        })
        .eq('id', subtaskId);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log(`✅ Updated Light Work subtask description: ${subtaskId}`);
      
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
      console.error('❌ Error updating Light Work subtask description:', error);
      setError(error instanceof Error ? error.message : 'Failed to update subtask description');
      return null;
    }
  }, [supabase]);

  // Update subtask estimated time in Supabase
  const updateSubtaskEstimatedTime = useCallback(async (subtaskId: string, estimatedTime: string) => {
    if (!supabase) return null;

    try {
      console.log(`⏱️ Updating Light Work subtask estimated time: ${subtaskId} -> ${estimatedTime}`);

      const { error } = await supabase
        .from('light_work_subtasks')
        .update({
          estimated_time: estimatedTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', subtaskId);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log(`✅ Updated Light Work subtask estimated time: ${subtaskId}`);

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
      console.error('❌ Error updating Light Work subtask estimated time:', error);
      setError(error instanceof Error ? error.message : 'Failed to update subtask estimated time');
      return null;
    }
  }, [supabase]);

  // Load tasks when dependencies change
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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
    updateSubtaskTitle,
    pushTaskToAnotherDay,
    updateTaskDueDate,
    updateSubtaskDueDate,
    updateSubtaskPriority,
    updateSubtaskEstimatedTime,
    updateSubtaskDescription,
    refreshTasks: loadTasks
  };
}