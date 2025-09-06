/**
 * 🚀 Light Work Tasks Hook - DIRECT SUPABASE VERSION
 * 
 * Eliminates Express API - connects directly to Supabase
 * Replaces useLightWorkTasks.ts with pure Supabase implementation
 */

import { useState, useCallback, useEffect } from 'react';
import { useClerkUser } from './useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/lib/supabase-clerk';

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

  // Load light work tasks from Supabase
  const loadTasks = useCallback(async () => {
    if (!isSignedIn || !internalUserId || !supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📊 Loading Light Work tasks from Supabase...');

      // Query Supabase directly
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
        throw new Error(`Supabase error: ${tasksError.message}`);
      }

      // Transform Supabase data to match our interface
      const transformedTasks: LightWorkTask[] = tasksData?.map(task => ({
        id: task.id,
        userId: task.userId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        completed: task.completed,
        originalDate: task.originalDate,
        currentDate: task.task_date || task.currentDate,
        estimatedDuration: task.estimatedDuration,
        rollovers: task.rollovers || 0,
        tags: task.tags || [],
        category: task.category,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        startedAt: task.startedAt,
        actualDurationMin: task.actualDurationMin,
        timeEstimate: task.timeEstimate,
        dueDate: task.due_date,
        subtasks: task.subtasks?.map((subtask: any) => ({
          id: subtask.id,
          taskId: subtask.taskId,
          title: subtask.title,
          text: subtask.text || subtask.title,
          completed: subtask.completed,
          priority: subtask.priority,
          dueDate: subtask.dueDate,
          createdAt: subtask.createdAt,
          updatedAt: subtask.updatedAt,
          completedAt: subtask.completedAt
        })) || []
      })) || [];

      console.log(`✅ Loaded ${transformedTasks.length} Light Work tasks from Supabase`);
      setTasks(transformedTasks);

    } catch (error) {
      console.error('❌ Error loading Light Work tasks from Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tasks from Supabase');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, internalUserId, dateString, supabase]);

  // Create new light work task in Supabase
  const createTask = useCallback(async (taskData: Partial<LightWorkTask>) => {
    if (!internalUserId || !supabase) return null;

    try {
      console.log('➕ Creating Light Work task in Supabase...');

      const { data, error } = await supabase
        .from('light_work_tasks')
        .insert({
          user_id: internalUserId,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority || 'MEDIUM',
          originalDate: dateString,
          task_date: dateString,
          completed: false,
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

      const newTask: LightWorkTask = {
        ...data,
        rollovers: data.rollovers || 0,
        tags: data.tags || [],
        subtasks: []
      };

      console.log(`✅ Created Light Work task in Supabase: ${newTask.title}`);
      setTasks(prev => [...prev, newTask]);
      return newTask;

    } catch (error) {
      console.error('❌ Error creating Light Work task in Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task in Supabase');
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
          completedAt: newCompleted ? now : null,
          updatedAt: now
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
        completedAt: data.completedAt,
        updatedAt: data.updatedAt
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
    addSubtask,
    deleteTask,
    deleteSubtask,
    updateTaskDueDate,
    refreshTasks: loadTasks
  };
}