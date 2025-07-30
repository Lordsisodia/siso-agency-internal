import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

// Enhanced task interfaces for LifeLock integration
export interface EnhancedTask {
  id: string;
  title: string;
  description?: string;
  category: 'main' | 'weekly' | 'daily' | 'siso_app_dev' | 'onboarding_app' | 'instagram' | 'deep_focus' | 'light_focus' | 'personal_dev' | 'client_work' | 'business_dev' | 'admin_tasks' | 'learning' | 'health_fitness' | 'creative' | 'research';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status: string;
  work_type: 'deep_focus' | 'light_focus' | 'admin' | 'creative' | 'meeting' | 'review';
  focus_level: number; // 1-5
  energy_level: 'low' | 'medium' | 'high';
  estimated_duration?: number; // minutes
  actual_duration?: number; // minutes
  due_date?: string;
  time_block_start?: string;
  time_block_end?: string;
  project_id?: string;
  tags?: string[];
  subtasks?: SubTask[];
  notes?: string;
  flow_state_potential: number; // 1-5
  effort_points: number; // 1-13 (Fibonacci)
  lifelock_sync: boolean;
  auto_schedule: boolean;
  dependencies?: string[];
  template_id?: string;
  context_switching_cost: number; // minutes
  assigned_to?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimated_duration?: number;
}

export interface DeepWorkSession {
  id?: string;
  user_id?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  planned_duration?: number;
  actual_duration?: number;
  focus_quality?: number; // 1-10
  distractions_count: number;
  environment_rating?: number; // 1-10
  energy_start?: number; // 1-10
  energy_end?: number; // 1-10
  session_notes?: string;
  technique_used?: string; // pomodoro, timeboxing, etc.
  tasks_completed?: string[];
  session_type: 'deep_focus' | 'light_focus' | 'creative' | 'learning';
  created_at?: string;
  updated_at?: string;
}

export interface TaskTemplate {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  category: EnhancedTask['category'];
  priority: EnhancedTask['priority'];
  work_type: EnhancedTask['work_type'];
  estimated_duration?: number;
  focus_level: number;
  energy_level: EnhancedTask['energy_level'];
  flow_state_potential: number;
  effort_points: number;
  tags?: string[];
  subtasks?: SubTask[];
  template_notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TimeBlock {
  id?: string;
  user_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  block_type: 'work' | 'deep_focus' | 'light_focus' | 'break' | 'meeting' | 'personal';
  title?: string;
  description?: string;
  task_ids?: string[];
  is_flexible: boolean;
  buffer_time: number; // minutes
  created_at?: string;
  updated_at?: string;
}

export interface TaskAnalytics {
  id?: string;
  user_id?: string;
  task_id: string;
  date: string;
  planned_duration?: number;
  actual_duration?: number;
  focus_quality?: number; // 1-10
  difficulty_rating?: number; // 1-10
  satisfaction_rating?: number; // 1-10
  energy_level_start?: number; // 1-10
  energy_level_end?: number; // 1-10
  distractions_count: number;
  context_switches: number;
  work_environment?: string;
  noise_level?: number; // 1-10
  created_at?: string;
}

export interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  avg_focus_quality: number;
  total_deep_work_hours: number;
  avg_task_duration: number;
}

export class EnhancedTaskService {
  
  /**
   * Get tasks for a specific date with enhanced filtering
   */
  static async getTasksForDate(
    date: Date = new Date(),
    workType?: EnhancedTask['work_type'],
    category?: EnhancedTask['category']
  ): Promise<EnhancedTask[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const dateStr = format(date, 'yyyy-MM-dd');
      
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .or(`due_date.eq.${dateStr},created_at.gte.${dateStr}T00:00:00,created_at.lt.${dateStr}T23:59:59`);

      if (workType) {
        query = query.eq('work_type', workType);
      }

      if (category) {
        query = query.eq('category', category);
      }

      query = query.order('priority', { ascending: false })
        .order('focus_level', { ascending: false })
        .order('created_at', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching enhanced tasks:', error);
        return [];
      }

      return (data || []).map(task => this.mapTaskFromDB(task));
    } catch (error) {
      console.error('Failed to fetch enhanced tasks:', error);
      return [];
    }
  }

  /**
   * Get deep focus tasks for LifeLock integration
   */
  static async getDeepFocusTasksForDate(date: Date = new Date()): Promise<EnhancedTask[]> {
    return this.getTasksForDate(date, 'deep_focus');
  }

  /**
   * Get light focus tasks for LifeLock integration
   */
  static async getLightFocusTasksForDate(date: Date = new Date()): Promise<EnhancedTask[]> {
    return this.getTasksForDate(date, 'light_focus');
  }

  /**
   * Create an enhanced task
   */
  static async createEnhancedTask(task: Partial<EnhancedTask>): Promise<EnhancedTask | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const taskData = {
        title: task.title,
        description: task.description,
        category: task.category || 'main',
        priority: task.priority || 'medium',
        work_type: task.work_type || 'deep_focus',
        focus_level: task.focus_level || 3,
        energy_level: task.energy_level || 'medium',
        estimated_duration: task.estimated_duration,
        due_date: task.due_date,
        time_block_start: task.time_block_start,
        time_block_end: task.time_block_end,
        project_id: task.project_id,
        tags: task.tags,
        subtasks: task.subtasks,
        notes: task.notes,
        flow_state_potential: task.flow_state_potential || 3,
        effort_points: task.effort_points || 1,
        lifelock_sync: task.lifelock_sync !== false, // default true
        auto_schedule: task.auto_schedule || false,
        dependencies: task.dependencies,
        template_id: task.template_id,
        context_switching_cost: task.context_switching_cost || 0,
        status: 'pending',
        assigned_to: user.id,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        console.error('Error creating enhanced task:', error);
        return null;
      }

      // Sync with LifeLock if enabled
      if (task.lifelock_sync !== false && task.due_date) {
        await this.syncTasksToLifeLock(new Date(task.due_date));
      }

      return this.mapTaskFromDB(data);
    } catch (error) {
      console.error('Failed to create enhanced task:', error);
      return null;
    }
  }

  /**
   * Update task completion and analytics
   */
  static async updateTaskCompletion(
    taskId: string, 
    completed: boolean,
    analytics?: Partial<TaskAnalytics>
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Update task status
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          status: completed ? 'done' : 'pending',
          completed_at: completed ? new Date().toISOString() : null,
          actual_duration: analytics?.actual_duration,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('assigned_to', user.id);

      if (taskError) {
        console.error('Error updating task completion:', taskError);
        return false;
      }

      // Add analytics if provided
      if (analytics && completed) {
        await this.recordTaskAnalytics(taskId, analytics);
      }

      // Sync with LifeLock
      await this.syncTasksToLifeLock(new Date());

      return true;
    } catch (error) {
      console.error('Failed to update task completion:', error);
      return false;
    }
  }

  /**
   * Record task analytics
   */
  static async recordTaskAnalytics(taskId: string, analytics: Partial<TaskAnalytics>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const analyticsData = {
        user_id: user.id,
        task_id: taskId,
        date: format(new Date(), 'yyyy-MM-dd'),
        planned_duration: analytics.planned_duration,
        actual_duration: analytics.actual_duration,
        focus_quality: analytics.focus_quality,
        difficulty_rating: analytics.difficulty_rating,
        satisfaction_rating: analytics.satisfaction_rating,
        energy_level_start: analytics.energy_level_start,
        energy_level_end: analytics.energy_level_end,
        distractions_count: analytics.distractions_count || 0,
        context_switches: analytics.context_switches || 0,
        work_environment: analytics.work_environment,
        noise_level: analytics.noise_level
      };

      const { error } = await supabase
        .from('task_analytics')
        .insert(analyticsData);

      if (error) {
        console.error('Error recording task analytics:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to record task analytics:', error);
      return false;
    }
  }

  /**
   * Create or update deep work session
   */
  static async recordDeepWorkSession(session: Partial<DeepWorkSession>): Promise<DeepWorkSession | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const sessionData = {
        user_id: user.id,
        date: session.date || format(new Date(), 'yyyy-MM-dd'),
        start_time: session.start_time,
        end_time: session.end_time,
        planned_duration: session.planned_duration,
        actual_duration: session.actual_duration,
        focus_quality: session.focus_quality,
        distractions_count: session.distractions_count || 0,
        environment_rating: session.environment_rating,
        energy_start: session.energy_start,
        energy_end: session.energy_end,
        session_notes: session.session_notes,
        technique_used: session.technique_used,
        tasks_completed: session.tasks_completed,
        session_type: session.session_type || 'deep_focus'
      };

      const { data, error } = await supabase
        .from('deep_work_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Error recording deep work session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to record deep work session:', error);
      return null;
    }
  }

  /**
   * Get task statistics for analytics
   */
  static async getTaskStats(
    dateFrom: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    dateTo: Date = new Date()
  ): Promise<TaskStats | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .rpc('get_task_stats', {
          user_uuid: user.id,
          date_from: format(dateFrom, 'yyyy-MM-dd'),
          date_to: format(dateTo, 'yyyy-MM-dd')
        });

      if (error) {
        console.error('Error getting task stats:', error);
        return null;
      }

      return data[0] || null;
    } catch (error) {
      console.error('Failed to get task stats:', error);
      return null;
    }
  }

  /**
   * Auto-schedule tasks for a day
   */
  static async autoScheduleTasks(
    date: Date = new Date(),
    startHour: number = 9,
    endHour: number = 17
  ): Promise<Array<{task_id: string, suggested_start_time: string, suggested_end_time: string}>> {
    try {
      const { data, error } = await supabase
        .rpc('auto_schedule_tasks', {
          target_date: format(date, 'yyyy-MM-dd'),
          start_hour: startHour,
          end_hour: endHour
        });

      if (error) {
        console.error('Error auto-scheduling tasks:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to auto-schedule tasks:', error);
      return [];
    }
  }

  /**
   * Sync tasks to LifeLock system
   */
  static async syncTasksToLifeLock(date: Date = new Date()): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('sync_tasks_to_lifelock', {
          target_date: format(date, 'yyyy-MM-dd')
        });

      if (error) {
        console.error('Error syncing tasks to LifeLock:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Failed to sync tasks to LifeLock:', error);
      return false;
    }
  }

  /**
   * Create task from template
   */
  static async createTaskFromTemplate(
    templateId: string,
    dueDate?: Date,
    overrides?: Partial<EnhancedTask>
  ): Promise<EnhancedTask | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get template
      const { data: template, error: templateError } = await supabase
        .from('task_templates')
        .select('*')
        .eq('id', templateId)
        .eq('user_id', user.id)
        .single();

      if (templateError || !template) {
        console.error('Error fetching task template:', templateError);
        return null;
      }

      // Create task from template
      const taskData: Partial<EnhancedTask> = {
        title: overrides?.title || template.name,
        description: overrides?.description || template.description,
        category: overrides?.category || template.category,
        priority: overrides?.priority || template.priority,
        work_type: overrides?.work_type || template.work_type,
        estimated_duration: overrides?.estimated_duration || template.estimated_duration,
        focus_level: overrides?.focus_level || template.focus_level,
        energy_level: overrides?.energy_level || template.energy_level,
        flow_state_potential: overrides?.flow_state_potential || template.flow_state_potential,
        effort_points: overrides?.effort_points || template.effort_points,
        tags: overrides?.tags || template.tags,
        subtasks: overrides?.subtasks || template.subtasks,
        notes: overrides?.notes || template.template_notes,
        template_id: templateId,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
        ...overrides
      };

      return this.createEnhancedTask(taskData);
    } catch (error) {
      console.error('Failed to create task from template:', error);
      return null;
    }
  }

  /**
   * Map database task to EnhancedTask interface
   */
  private static mapTaskFromDB(dbTask: any): EnhancedTask {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description,
      category: dbTask.category,
      priority: dbTask.priority,
      status: dbTask.status,
      work_type: dbTask.work_type || 'deep_focus',
      focus_level: dbTask.focus_level || 3,
      energy_level: dbTask.energy_level || 'medium',
      estimated_duration: dbTask.estimated_duration,
      actual_duration: dbTask.actual_duration,
      due_date: dbTask.due_date,
      time_block_start: dbTask.time_block_start,
      time_block_end: dbTask.time_block_end,
      project_id: dbTask.project_id,
      tags: dbTask.tags,
      subtasks: dbTask.subtasks,
      notes: dbTask.notes,
      flow_state_potential: dbTask.flow_state_potential || 3,
      effort_points: dbTask.effort_points || 1,
      lifelock_sync: dbTask.lifelock_sync !== false,
      auto_schedule: dbTask.auto_schedule || false,
      dependencies: dbTask.dependencies,
      template_id: dbTask.template_id,
      context_switching_cost: dbTask.context_switching_cost || 0,
      assigned_to: dbTask.assigned_to,
      created_by: dbTask.created_by,
      created_at: dbTask.created_at,
      updated_at: dbTask.updated_at,
      completed_at: dbTask.completed_at
    };
  }
}