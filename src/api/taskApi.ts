
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskCategory, TaskStats } from '@/types/task.types';

export async function fetchTasks(category?: TaskCategory, userId?: string): Promise<Task[]> {
  console.log('Fetching tasks with category:', category, 'and userId:', userId);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('No authenticated user found');
    throw new Error('Not authenticated');
  }
  
  let query = supabase
    .from('tasks')
    .select('id, title, description, status, priority, category, assigned_to, due_date, created_at, updated_at');

  if (category) {
    console.log('Applying category filter:', category);
    query = query.eq('category', category);
  }
  
  if (userId) {
    console.log('Filtering tasks by assigned user:', userId);
    query = query.eq('assigned_to', userId);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  console.log('Tasks fetched successfully:', data);
  return data as Task[];
}

export async function fetchTaskStats(userId?: string): Promise<TaskStats> {
  console.log('Fetching task statistics for userId:', userId);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('No authenticated user found for task stats');
    throw new Error('Not authenticated');
  }
  
  try {
    // Build base query
    let query = supabase.from('tasks').select('status, priority, created_at, completed_at');
    
    // Filter by user if specified
    if (userId) {
      query = query.eq('assigned_to', userId);
    }
    
    const { data: tasks, error } = await query;
    
    if (error) {
      console.error('Error fetching task stats:', error);
      throw error;
    }

    // Process data to generate statistics
    const taskArray = tasks || [];
    
    // Calculate status statistics
    const byStatus = {
      pending: taskArray.filter(t => t.status === 'pending').length,
      in_progress: taskArray.filter(t => t.status === 'in_progress').length,
      completed: taskArray.filter(t => t.status === 'completed').length
    };

    // Calculate priority statistics
    const byPriority = {
      low: taskArray.filter(t => t.priority === 'low').length,
      medium: taskArray.filter(t => t.priority === 'medium').length,
      high: taskArray.filter(t => t.priority === 'high').length,
      urgent: taskArray.filter(t => t.priority === 'urgent').length
    };

    // Calculate daily statistics for the past week
    const byDay = generateDailyStats(taskArray);

    // Calculate totals
    const totals = {
      pending: byStatus.pending,
      in_progress: byStatus.in_progress,
      completed: byStatus.completed,
      total: taskArray.length
    };

    console.log('Task stats calculated successfully:', { totals, byStatus, byPriority });
    
    return {
      byStatus,
      byPriority,
      byDay,
      totals
    };
  } catch (error) {
    console.error('Failed to fetch task stats:', error);
    throw error;
  }
}

// Helper function to generate daily statistics
function generateDailyStats(tasks: any[]) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const dayStats = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayName = days[date.getDay()];
    
    // Count tasks created on this day
    const created = tasks.filter(task => {
      const createdDate = new Date(task.created_at);
      return createdDate.toDateString() === date.toDateString();
    }).length;

    // Count tasks completed on this day
    const completed = tasks.filter(task => {
      if (!task.completed_at) return false;
      const completedDate = new Date(task.completed_at);
      return completedDate.toDateString() === date.toDateString();
    }).length;

    dayStats.push({
      day: dayName,
      created,
      completed
    });
  }

  return dayStats;
}
