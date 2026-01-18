/**
 * Task Query Tools - All Supabase queries for Morning Thought Dump AI
 * Each function is tested to return real data
 */

import { supabase } from '@/services/integrations/supabase/client';

export class TaskQueryTools {
  constructor(
    private userId: string,
    private selectedDate: Date
  ) {}

  private get dateString() {
    return this.selectedDate.toISOString().split('T')[0];
  }

  /**
   * 1. Get all tasks for today
   */
  async getTodaysTasks(includeCompleted = false) {
    

    // Build queries - conditionally filter by completed
    let deepQuery = supabase
      .from('deep_work_tasks')
      .select('*, subtasks:deep_work_subtasks(*)')
      .eq('user_id', this.userId)
      .eq('current_date', this.dateString);

    let lightQuery = supabase
      .from('light_work_tasks')
      .select('*, subtasks:light_work_subtasks(*)')
      .eq('user_id', this.userId)
      .eq('current_date', this.dateString);

    // Only filter by completed if NOT including completed tasks
    if (!includeCompleted) {
      deepQuery = deepQuery.eq('completed', false);
      lightQuery = lightQuery.eq('completed', false);
    }

    const [deepResult, lightResult] = await Promise.all([
      deepQuery,
      lightQuery
    ]);

    const deepTasks = deepResult.data || [];
    const lightTasks = lightResult.data || [];

    

    return {
      deepWorkTasks: deepTasks,
      lightWorkTasks: lightTasks,
      summary: {
        totalDeepWork: deepTasks.length,
        totalLightWork: lightTasks.length,
        totalSubtasks: deepTasks.reduce((sum, t) => sum + (t.subtasks?.length || 0), 0) +
                      lightTasks.reduce((sum, t) => sum + (t.subtasks?.length || 0), 0),
        estimatedTimeHours: (
          deepTasks.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0) +
          lightTasks.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0)
        ) / 60
      }
    };
  }

  /**
   * 2. Find task by title (fuzzy match)
   */
  async getTaskByTitle(titleQuery: string) {
    

    const searchPattern = `%${titleQuery.toLowerCase()}%`;

    const [deepResult, lightResult] = await Promise.all([
      supabase
        .from('deep_work_tasks')
        .select('*, subtasks:deep_work_subtasks(*)')
        .eq('user_id', this.userId)
        .ilike('title', searchPattern)
        .limit(1)
        .maybeSingle(),

      supabase
        .from('light_work_tasks')
        .select('*, subtasks:light_work_subtasks(*)')
        .eq('user_id', this.userId)
        .ilike('title', searchPattern)
        .limit(1)
        .maybeSingle()
    ]);

    const task = deepResult.data || lightResult.data;

    if (task) {
      
      return {
        ...task,
        workType: deepResult.data ? 'deep' : 'light'
      };
    }

    
    return { error: 'Task not found' };
  }

  /**
   * 3. Get urgent/high priority tasks only
   */
  async getUrgentTasks() {
    

    const [deepResult, lightResult] = await Promise.all([
      supabase
        .from('deep_work_tasks')
        .select('*, subtasks:deep_work_subtasks(*)')
        .eq('user_id', this.userId)
        .eq('current_date', this.dateString)
        .in('priority', ['HIGH', 'URGENT'])
        .eq('completed', false),

      supabase
        .from('light_work_tasks')
        .select('*, subtasks:light_work_subtasks(*)')
        .eq('user_id', this.userId)
        .eq('current_date', this.dateString)
        .in('priority', ['HIGH', 'URGENT'])
        .eq('completed', false)
    ]);

    const urgentTasks = [
      ...(deepResult.data || []).map(t => ({ ...t, workType: 'deep' })),
      ...(lightResult.data || []).map(t => ({ ...t, workType: 'light' }))
    ];

    

    return {
      urgentTasks,
      count: urgentTasks.length
    };
  }

  /**
   * 4. Get deep work tasks only
   */
  async getDeepWorkTasksOnly() {
    

    const { data } = await supabase
      .from('deep_work_tasks')
      .select('*, subtasks:deep_work_subtasks(*)')
      .eq('user_id', this.userId)
      .eq('current_date', this.dateString)
      .eq('completed', false)
      .order('priority', { ascending: false });

    const tasks = data || [];

    

    return {
      deepWorkTasks: tasks,
      totalEstimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0) / 60,
      requiresFocusBlocks: tasks.reduce((sum, t) => sum + (t.focusBlocks || 1), 0)
    };
  }

  /**
   * 5. Get light work tasks only
   */
  async getLightWorkTasksOnly() {
    

    const { data } = await supabase
      .from('light_work_tasks')
      .select('*, subtasks:light_work_subtasks(*)')
      .eq('user_id', this.userId)
      .eq('current_date', this.dateString)
      .eq('completed', false)
      .order('priority', { ascending: false });

    const tasks = data || [];

    

    return {
      lightWorkTasks: tasks,
      totalTasks: tasks.length,
      totalEstimatedMinutes: tasks.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0)
    };
  }

  /**
   * 6. Get subtasks for specific task
   */
  async getTaskSubtasks(taskId: string) {
    

    // Try deep work subtasks
    const { data: deepSubtasks } = await supabase
      .from('deep_work_subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at');

    if (deepSubtasks && deepSubtasks.length > 0) {
      
      return {
        subtasks: deepSubtasks,
        completedCount: deepSubtasks.filter(s => s.completed).length,
        totalCount: deepSubtasks.length,
        workType: 'deep'
      };
    }

    // Try light work subtasks
    const { data: lightSubtasks } = await supabase
      .from('light_work_subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at');

    if (lightSubtasks && lightSubtasks.length > 0) {
      
      return {
        subtasks: lightSubtasks,
        completedCount: lightSubtasks.filter(s => s.completed).length,
        totalCount: lightSubtasks.length,
        workType: 'light'
      };
    }

    
    return { subtasks: [], completedCount: 0, totalCount: 0 };
  }

  /**
   * 7. Get tasks under specific time constraint
   */
  async getTasksByTimeConstraint(maxMinutes: number) {
    

    const [deepResult, lightResult] = await Promise.all([
      supabase
        .from('deep_work_tasks')
        .select('*')
        .eq('user_id', this.userId)
        .eq('current_date', this.dateString)
        .lte('estimated_duration', maxMinutes)
        .eq('completed', false),

      supabase
        .from('light_work_tasks')
        .select('*')
        .eq('user_id', this.userId)
        .eq('current_date', this.dateString)
        .lte('estimated_duration', maxMinutes)
        .eq('completed', false)
    ]);

    const matchingTasks = [
      ...(deepResult.data || []).map(t => ({ ...t, workType: 'deep' })),
      ...(lightResult.data || []).map(t => ({ ...t, workType: 'light' }))
    ];

    

    return {
      tasks: matchingTasks,
      matchingTasks: matchingTasks.length,
      averageTimeMinutes: matchingTasks.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0) / matchingTasks.length || 0
    };
  }

  /**
   * 8. Search tasks by keyword
   */
  async searchTasksByKeyword(keyword: string) {
    

    const searchPattern = `%${keyword.toLowerCase()}%`;

    const [deepResult, lightResult] = await Promise.all([
      supabase
        .from('deep_work_tasks')
        .select('*, subtasks:deep_work_subtasks(*)')
        .eq('user_id', this.userId)
        .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`),

      supabase
        .from('light_work_tasks')
        .select('*, subtasks:light_work_subtasks(*)')
        .eq('user_id', this.userId)
        .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
    ]);

    const matchingTasks = [
      ...(deepResult.data || []).map(t => ({ ...t, workType: 'deep' })),
      ...(lightResult.data || []).map(t => ({ ...t, workType: 'light' }))
    ];

    

    return {
      matchingTasks,
      searchTerm: keyword,
      resultsCount: matchingTasks.length
    };
  }

  /**
   * 9. Check upcoming deadlines
   */
  async checkUpcomingDeadlines(daysAhead: number = 3) {
    

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    const todayStr = today.toISOString().split('T')[0];
    const futureStr = futureDate.toISOString().split('T')[0];

    // Query both deep and light work tasks with due dates
    const [deepResult, lightResult] = await Promise.all([
      supabase
        .from('deep_work_tasks')
        .select('*')
        .eq('user_id', this.userId)
        .eq('completed', false)
        .gte('task_date', todayStr)
        .lte('task_date', futureStr)
        .order('task_date', { ascending: true }),

      supabase
        .from('light_work_tasks')
        .select('*')
        .eq('user_id', this.userId)
        .eq('completed', false)
        .gte('task_date', todayStr)
        .lte('task_date', futureStr)
        .order('task_date', { ascending: true })
    ]);

    const allTasks = [
      ...(deepResult.data || []).map(t => ({ ...t, workType: 'deep' })),
      ...(lightResult.data || []).map(t => ({ ...t, workType: 'light' }))
    ];

    // Categorize by urgency
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const urgent = allTasks.filter(t => t.task_date === todayStr);
    const soon = allTasks.filter(t => t.task_date > todayStr && t.task_date <= tomorrowStr);
    const upcoming = allTasks.filter(t => t.task_date > tomorrowStr);

    

    return {
      urgent: urgent.map(t => ({
        title: t.title,
        dueDate: t.task_date,
        daysUntil: 0,
        workType: t.workType,
        estimatedTime: t.estimated_duration || 'not set'
      })),
      soon: soon.map(t => ({
        title: t.title,
        dueDate: t.task_date,
        daysUntil: 1,
        workType: t.workType,
        estimatedTime: t.estimated_duration || 'not set'
      })),
      upcoming: upcoming.map(t => ({
        title: t.title,
        dueDate: t.task_date,
        daysUntil: Math.ceil((new Date(t.task_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        workType: t.workType,
        estimatedTime: t.estimated_duration || 'not set'
      })),
      totalCount: allTasks.length,
      hasUrgent: urgent.length > 0
    };
  }
}
