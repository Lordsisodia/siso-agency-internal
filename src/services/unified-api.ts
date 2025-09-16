/**
 * 🎯 Unified API Service - Senior Dev's Vision Realized
 * 
 * Consolidates all scattered Supabase operations into a clean, unified service layer.
 * Replaces multiple fragmented service patterns with single composable API.
 */

import { supabase } from '@/integrations/supabase/client';

// Task operations unified from scattered API routes
export const taskService = {
  // Get tasks for specific date and work type
  getTasks: async (userId: string, date: string, workType?: 'LIGHT_WORK' | 'DEEP') => {
    const query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);
    
    if (workType) {
      query.eq('work_type', workType);
    }
    
    const { data, error } = await query;
    if (error) throw new Error(`Failed to get tasks: ${error.message}`);
    return data || [];
  },

  // Get deep work tasks for specific date
  getDeepWorkTasksForDate: async (userId: string, date: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .eq('work_type', 'DEEP');
    
    if (error) throw new Error(`Failed to get deep work tasks: ${error.message}`);
    return data || [];
  },

  // Get tasks for date (generic)
  getTasksForDate: async (userId: string, date: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);
    
    if (error) throw new Error(`Failed to get tasks for date: ${error.message}`);
    return data || [];
  },

  // Get single task by ID
  getTaskById: async (taskId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();
    
    if (error) throw new Error(`Failed to get task: ${error.message}`);
    return data;
  },

  // Create new task
  createTask: async (userId: string, taskData: any) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        ...taskData
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create task: ${error.message}`);
    return data;
  },

  // Update task completion status
  updateTaskCompletion: async (taskId: string, completed: boolean) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        completed,
        completed_at: completed ? new Date().toISOString() : null 
      })
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update task completion: ${error.message}`);
    return data;
  },

  // Toggle task completion
  toggleTaskCompletion: async (taskId: string) => {
    // First get current state
    const task = await taskService.getTaskById(taskId);
    const newState = !task.completed;
    
    return await taskService.updateTaskCompletion(taskId, newState);
  },

  // Update task title
  updateTaskTitle: async (taskId: string, title: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ title })
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update task title: ${error.message}`);
    return data;
  },

  // Delete task
  deleteTask: async (taskId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to delete task: ${error.message}`);
    return data;
  }
};

// Subtask operations unified
export const subtaskService = {
  // Add subtask to task
  addSubtask: async (taskId: string, subtaskData: any) => {
    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: taskId,
        ...subtaskData
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to add subtask: ${error.message}`);
    return data;
  },

  // Update subtask completion
  updateSubtaskCompletion: async (subtaskId: string, completed: boolean) => {
    const { data, error } = await supabase
      .from('subtasks')
      .update({ 
        completed,
        completed_at: completed ? new Date().toISOString() : null 
      })
      .eq('id', subtaskId)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update subtask completion: ${error.message}`);
    return data;
  },

  // Update subtask due date
  updateSubtaskDueDate: async (subtaskId: string, dueDate: string) => {
    const { data, error } = await supabase
      .from('subtasks')
      .update({ due_date: dueDate })
      .eq('id', subtaskId)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update subtask due date: ${error.message}`);
    return data;
  },

  // Delete subtask
  deleteSubtask: async (subtaskId: string) => {
    const { data, error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to delete subtask: ${error.message}`);
    return data;
  }
};

// Personal context operations unified
export const personalContextService = {
  // Get personal context for user
  getPersonalContext: async (userId: string) => {
    const { data, error } = await supabase
      .from('personal_context')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to get personal context: ${error.message}`);
    }
    return data;
  },

  // Update personal context
  updatePersonalContext: async (userId: string, contextData: any) => {
    const { data, error } = await supabase
      .from('personal_context')
      .upsert({
        user_id: userId,
        ...contextData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update personal context: ${error.message}`);
    return data;
  }
};

// Combined unified service object matching the senior dev's vision
export const taskDatabaseService = {
  ...taskService,
  ...subtaskService,
  ...personalContextService
};

// Export individual services for specific use cases
export { taskService as tasks };
export { subtaskService as subtasks };
export { personalContextService as personalContext };

// Default export for backward compatibility
export default taskDatabaseService;