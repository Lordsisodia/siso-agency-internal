import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface TodayTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  due_date?: string;
  completed_at?: string;
}

export class TodayTasksService {
  
  /**
   * Fetch tasks for today from Supabase
   */
  static async getTodaysTasks(date: Date = new Date()): Promise<TodayTask[]> {
    try {
      console.log('📅 [TODAY TASKS] Fetching tasks for date:', format(date, 'yyyy-MM-dd'));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ [TODAY TASKS] No authenticated user found');
        return [];
      }

      console.log('👤 [TODAY TASKS] User authenticated:', user.id);
      const todayStr = format(date, 'yyyy-MM-dd');
      
      console.log('🔍 [TODAY TASKS] Querying tasks for:', todayStr);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`due_date.eq.${todayStr},created_at.gte.${todayStr}T00:00:00,created_at.lt.${todayStr}T23:59:59`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ [TODAY TASKS] Error fetching tasks:', error);
        console.error('❌ [TODAY TASKS] Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return [];
      }

      console.log('✅ [TODAY TASKS] Successfully fetched tasks:', data?.length || 0);

      return (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.status === 'done' || task.completed_at !== null,
        category: task.category,
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        due_date: task.due_date,
        completed_at: task.completed_at
      }));

    } catch (error) {
      console.error('Failed to fetch today\'s tasks:', error);
      return [];
    }
  }

  /**
   * Update task completion status
   */
  static async updateTaskCompletion(taskId: string, completed: boolean): Promise<boolean> {
    try {
      console.log('🔄 [TODAY TASKS] Updating task completion:', { taskId, completed });
      
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: completed ? 'done' : 'pending',
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select();

      if (error) {
        console.error('❌ [TODAY TASKS] Error updating task completion:', error);
        console.error('❌ [TODAY TASKS] Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return false;
      }

      console.log('✅ [TODAY TASKS] Task completion updated successfully:', data);
      return true;
    } catch (error) {
      console.error('❌ [TODAY TASKS] Failed to update task completion:', error);
      return false;
    }
  }

  /**
   * Create a new task for today
   */
  static async createTodayTask(title: string, category: 'main' | 'weekly' | 'daily' | 'siso_app_dev' | 'onboarding_app' | 'instagram' = 'main', priority: 'low' | 'medium' | 'high' = 'medium'): Promise<TodayTask | null> {
    try {
      console.log('➕ [TODAY TASKS] Creating new task:', { title, category, priority });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ [TODAY TASKS] No authenticated user found for task creation');
        return null;
      }

      console.log('👤 [TODAY TASKS] User authenticated for task creation:', user.id);
      
      const taskData = {
        title,
        category,
        priority,
        status: 'pending',
        due_date: format(new Date(), 'yyyy-MM-dd'),
        assigned_to: user.id,
        created_by: user.id
      };
      
      console.log('📝 [TODAY TASKS] Task data to insert:', taskData);

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        console.error('❌ [TODAY TASKS] Error creating task:', error);
        console.error('❌ [TODAY TASKS] Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return null;
      }

      console.log('✅ [TODAY TASKS] Task created successfully:', data);

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        completed: false,
        category: data.category,
        priority: data.priority,
        status: data.status,
        due_date: data.due_date
      };

    } catch (error) {
      console.error('Failed to create task:', error);
      return null;
    }
  }

  /**
   * Get tasks by category for today
   */
  static async getTasksByCategory(category: string, date: Date = new Date()): Promise<TodayTask[]> {
    const allTasks = await this.getTodaysTasks(date);
    return allTasks.filter(task => task.category === category);
  }
} 