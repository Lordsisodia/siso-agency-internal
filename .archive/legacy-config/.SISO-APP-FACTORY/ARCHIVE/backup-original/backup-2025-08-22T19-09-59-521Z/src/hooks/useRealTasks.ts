import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task.types';
import { useAuthSession } from '@/hooks/useAuthSession';

interface DashboardTask {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  due_date?: string;
  action?: () => void;
  actionText?: string;
}

export function useRealTasks(filterType?: 'all' | 'high-priority' | 'due-soon') {
  const { user } = useAuthSession();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['dashboard-tasks', user?.id, filterType],
    queryFn: async () => {
      if (!user) {
        console.log('useRealTasks: No authenticated user found');
        throw new Error('User not authenticated');
      }

      console.log('useRealTasks: Fetching tasks for user:', user.id, 'filterType:', filterType);

      try {
        // Base query - fetch tasks from the real database
        let query = supabase
          .from('tasks')
          .select('*')
          .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
          .in('status', ['pending', 'in_progress']);

        // Apply filters based on filterType
        if (filterType === 'high-priority') {
          query = query.in('priority', ['urgent', 'high']);
        } else if (filterType === 'due-soon') {
          // Tasks due within the next 7 days
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          query = query
            .not('due_date', 'is', null)
            .lte('due_date', nextWeek.toISOString());
        }

        const { data, error } = await query
          .order('priority', { ascending: false }) // urgent, high, medium, low
          .order('due_date', { ascending: true })
          .limit(50); // Increase limit for full list

        if (error) {
          console.error('useRealTasks: Database error:', error);
          throw new Error(`Database error: ${error.message}`);
        }

        console.log('useRealTasks: Successfully fetched', data?.length || 0, 'tasks');
        return data as Task[] || [];
      } catch (err) {
        console.error('useRealTasks: Query failed:', err);
        throw err;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      console.log('useRealTasks: Retry attempt', failureCount, 'Error:', error);
      return failureCount < 3; // Retry up to 3 times
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Transform database tasks to dashboard format
  const transformTasks = (dbTasks: Task[]): DashboardTask[] => {
    if (!dbTasks || !Array.isArray(dbTasks)) {
      console.warn('useRealTasks: Invalid tasks data:', dbTasks);
      return [];
    }

    return dbTasks.map(task => ({
      id: task.id,
      text: task.title,
      completed: task.status === 'completed',
      created_at: task.created_at,
      priority: mapPriority(task.priority),
      category: task.category,
      due_date: task.due_date,
      actionText: task.status === 'pending' ? 'Start' : 'Continue'
    }));
  };

  // Map database priority to our component priority
  const mapPriority = (dbPriority: string): 'high' | 'medium' | 'low' => {
    switch (dbPriority) {
      case 'urgent':
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
      default:
        return 'low';
    }
  };

  const transformedTasks = transformTasks(tasks);
  const remainingTasks = transformedTasks.filter(task => !task.completed).length;

  return {
    tasks: transformedTasks,
    allTasks: transformedTasks,
    remainingTasks,
    loading: isLoading,
    error,
    hasRealTasks: transformedTasks.length > 0
  };
}

// Hook to add new task to database
export function useAddTask() {
  const { user } = useAuthSession();

  const addTask = async (title: string, category: string = 'main') => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: title.trim(),
        category: category as any,
        status: 'pending',
        priority: 'medium',
        created_by: user.id,
        assigned_to: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      throw error;
    }

    return data;
  };

  return { addTask };
}

// Hook to update task status
export function useUpdateTask() {
  const updateTaskStatus = async (taskId: string, completed: boolean) => {
    const status = completed ? 'completed' : 'pending';
    const completed_at = completed ? new Date().toISOString() : null;

    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        status,
        completed_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    return data;
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  return { updateTaskStatus, deleteTask };
} 