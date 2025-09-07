/**
 * 🚀 Deep Work Tasks Hook - DIRECT SUPABASE VERSION
 * 
 * Eliminates Express API - connects directly to Supabase
 * Replaces useDeepWorkTasks.ts with pure Supabase implementation
 */

import { useState, useCallback, useEffect } from 'react';
import { useClerkUser } from './useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/lib/supabase-clerk';

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

  const dateString = selectedDate?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0];

  // Load deep work tasks from Supabase
  const loadTasks = useCallback(async () => {
    if (!isSignedIn || !internalUserId || !supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🧠 Loading Deep Work tasks from Supabase...');

      // Query Supabase directly
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
        throw new Error(`Supabase error: ${tasksError.message}`);
      }

      // Transform Supabase data to match our interface
      const transformedTasks: DeepWorkTask[] = tasksData?.map(task => ({
        id: task.id,
        userId: task.userId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        completed: task.completed,
        originalDate: task.originalDate,
        currentDate: task.task_date || task.currentDate,
        estimatedDuration: task.estimatedDuration,
        focusBlocks: task.focusBlocks || 4,
        breakDuration: task.breakDuration || 15,
        interruptionMode: task.interruptionMode || false,
        rollovers: task.rollovers || 0,
        tags: task.tags || [],
        category: task.category,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        startedAt: task.startedAt,
        actualDurationMin: task.actualDurationMin,
        timeEstimate: task.timeEstimate,
        subtasks: task.subtasks?.map((subtask: any) => ({
          id: subtask.id,
          taskId: subtask.taskId,
          title: subtask.title,
          text: subtask.text || subtask.title,
          completed: subtask.completed,
          priority: subtask.priority,
          dueDate: subtask.dueDate,
          requiresFocus: subtask.requiresFocus || false,
          complexityLevel: subtask.complexityLevel || 1,
          createdAt: subtask.createdAt,
          updatedAt: subtask.updatedAt,
          completedAt: subtask.completedAt
        })) || []
      })) || [];

      console.log(`✅ Loaded ${transformedTasks.length} Deep Work tasks from Supabase`);
      setTasks(transformedTasks);

    } catch (error) {
      console.error('❌ Error loading Deep Work tasks from Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tasks from Supabase');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, internalUserId, dateString, supabase]);

  // Create new deep work task in Supabase
  const createTask = useCallback(async (taskData: Partial<DeepWorkTask>) => {
    if (!internalUserId || !supabase) return null;

    try {
      console.log('➕ Creating Deep Work task in Supabase...');

      const { data, error } = await supabase
        .from('deep_work_tasks')
        .insert({
          user_id: internalUserId,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority || 'HIGH',
          originalDate: dateString,
          task_date: dateString,
          completed: false,
          focusBlocks: taskData.focusBlocks || 4,
          breakDuration: taskData.breakDuration || 15,
          interruptionMode: taskData.interruptionMode || false,
          rollovers: 0,
          tags: taskData.tags || [],
          category: taskData.category,
          estimatedDuration: taskData.estimatedDuration,
          timeEstimate: taskData.timeEstimate
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      const newTask: DeepWorkTask = {
        ...data,
        focusBlocks: data.focusBlocks || 4,
        breakDuration: data.breakDuration || 15,
        interruptionMode: data.interruptionMode || false,
        rollovers: data.rollovers || 0,
        tags: data.tags || [],
        subtasks: []
      };

      console.log(`✅ Created Deep Work task in Supabase: ${newTask.title}`);
      setTasks(prev => [...prev, newTask]);
      return newTask;

    } catch (error) {
      console.error('❌ Error creating Deep Work task in Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task in Supabase');
      return null;
    }
  }, [internalUserId, dateString, supabase]);

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

      const { data, error } = await supabase
        .from('deep_work_tasks')
        .update({
          completed: newCompleted,
          completedAt: newCompleted ? now : null,
          updatedAt: now
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      const updatedTask: DeepWorkTask = {
        ...currentTask,
        completed: data.completed,
        completedAt: data.completedAt,
        updatedAt: data.updatedAt
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
  }, [tasks, supabase]);

  // Add subtask to task in Supabase
  const addSubtask = useCallback(async (taskId: string, subtaskTitle: string, priority = 'HIGH') => {
    if (!supabase) return null;
    
    try {
      console.log(`➕ Adding subtask to Deep Work task in Supabase: ${taskId}`);

      const { data, error } = await supabase
        .from('deep_work_subtasks')
        .insert({
          taskId,
          title: subtaskTitle,
          text: subtaskTitle,
          completed: false,
          priority,
          requiresFocus: true,
          complexityLevel: 1
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      const newSubtask: DeepWorkSubtask = {
        id: data.id,
        taskId: data.taskId,
        title: data.title,
        text: data.text,
        completed: data.completed,
        priority: data.priority,
        dueDate: data.dueDate,
        requiresFocus: data.requiresFocus,
        complexityLevel: data.complexityLevel,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        completedAt: data.completedAt
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
  }, [supabase]);

  // Delete task from Supabase
  const deleteTask = useCallback(async (taskId: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`🗑️ Deleting Deep Work task from Supabase: ${taskId}`);

      const { error } = await supabase
        .from('deep_work_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log(`✅ Deleted Deep Work task from Supabase: ${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return true;

    } catch (error) {
      console.error('❌ Error deleting Deep Work task from Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete task from Supabase');
      return null;
    }
  }, [supabase]);

  // Delete subtask from Supabase
  const deleteSubtask = useCallback(async (subtaskId: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`🗑️ Deleting Deep Work subtask from Supabase: ${subtaskId}`);

      const { error } = await supabase
        .from('deep_work_subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

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
  }, [supabase]);

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
      
      const { error } = await supabase
        .from('deep_work_subtasks')
        .update({
          completed: newCompleted,
          completedAt: newCompleted ? now : null,
          updatedAt: now
        })
        .eq('id', subtaskId);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
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
  }, [tasks, supabase]);

  // Update task title
  const updateTaskTitle = useCallback(async (taskId: string, newTitle: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`✏️ Updating Deep Work task title: ${taskId}`);
      
      const { error } = await supabase
        .from('deep_work_tasks')
        .update({
          title: newTitle,
          updatedAt: new Date().toISOString()
        })
        .eq('id', taskId);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
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
  }, [supabase]);

  // Push task to another day (reschedule)
  const pushTaskToAnotherDay = useCallback(async (taskId: string, newDate: string) => {
    if (!supabase) return null;
    
    try {
      console.log(`📅 Rescheduling Deep Work task: ${taskId} to ${newDate}`);
      
      const { error } = await supabase
        .from('deep_work_tasks')
        .update({
          task_date: newDate,
          updatedAt: new Date().toISOString()
        })
        .eq('id', taskId);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
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
  }, [supabase]);

  // Update task due date (works on both tasks and subtasks)
  const updateTaskDueDate = useCallback(async (taskOrSubtaskId: string, dueDate: Date | null) => {
    if (!supabase) return null;
    
    try {
      console.log(`📅 Updating Deep Work due date in Supabase: ${taskOrSubtaskId}`);
      
      // Format date for database
      const dateString = dueDate ? dueDate.toISOString() : null;
      
      // First try updating as a subtask
      const { error: subtaskError } = await supabase
        .from('deep_work_subtasks')
        .update({
          dueDate: dateString,
          updatedAt: new Date().toISOString()
        })
        .eq('id', taskOrSubtaskId);
      
      if (!subtaskError) {
        console.log(`✅ Updated Deep Work subtask due date: ${taskOrSubtaskId}`);
        
        // Update local state
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
      
      // If subtask update failed, try updating as a task
      const { error: taskError } = await supabase
        .from('deep_work_tasks')
        .update({
          due_date: dateString,
          updatedAt: new Date().toISOString()
        })
        .eq('id', taskOrSubtaskId);
      
      if (taskError) {
        throw new Error(`Supabase error: ${taskError.message}`);
      }
      
      console.log(`✅ Updated Deep Work task due date: ${taskOrSubtaskId}`);
      
      // Update local state
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
  }, [supabase]);

  // Update subtask due date in Supabase (dedicated function for subtasks only)
  const updateSubtaskDueDate = useCallback(async (subtaskId: string, dueDate: Date | null) => {
    if (!supabase) return null;
    
    try {
      console.log(`📅 Updating Deep Work subtask due date: ${subtaskId} -> ${dueDate}`);

      const dateString = dueDate ? dueDate.toISOString() : null;
      
      const { error } = await supabase
        .from('deep_work_subtasks')
        .update({
          dueDate: dateString,
          updatedAt: new Date().toISOString()
        })
        .eq('id', subtaskId);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

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
    pushTaskToAnotherDay,
    updateTaskDueDate,
    updateSubtaskDueDate,
    refreshTasks: loadTasks
  };
}