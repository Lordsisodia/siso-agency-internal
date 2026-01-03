import { useQuery } from '@tanstack/react-query';
import { Task, TaskCategory, TaskStats, TaskPriority, TaskStatus } from '@/types/task.types';
import { fetchTaskStats } from '@/services/api/taskApi';
import { useTaskOperations } from './useTaskOperations';
import { supabase } from '@/services/integrations/supabase/client';

export function useTasks() {
  // Helper function to process task data
  const processTaskData = (data: any[]): Task[] => {
    // Map the data to ensure types are correct
    const mappedData = (data || []).map(item => ({
      ...item,
      // Ensure status is a valid TaskStatus
      status: validateTaskStatus(item.status),
      // Ensure priority is a valid TaskPriority
      priority: validateTaskPriority(item.priority)
    } as Task));

    // Sort tasks by priority
    return mappedData.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    });
  };

  const useTaskQuery = (category?: TaskCategory, userId?: string) => {
    console.log('Fetching tasks with category:', category, 'userId:', userId);
    return useQuery({
      queryKey: ['tasks', category, userId],
      queryFn: async () => {
        try {
          // First, try the simplified query approach
          let query = supabase
            .from('tasks')
            .select('id, title, description, status, priority, category, assigned_to, due_date, created_at, updated_at');
          
          // Add filters step by step to avoid complex policy issues
          if (userId) {
            query = query.eq('assigned_to', userId);
          }
          
          if (category) {
            query = query.eq('category', category);
          }

          const { data, error } = await query;
          
          if (error) {
            console.error('Error fetching tasks:', error);
            
            // If we get an RLS/recursion error, try fallback approaches
            if (error.message.includes('infinite recursion') || error.message.includes('policy')) {
              console.log('🔧 [TASKS] RLS issue detected, attempting fallback query...');
              
              // Try a simpler query without OR conditions
              const fallbackQuery = supabase
                .from('tasks')
                .select('id, title, description, status, priority, category, due_date, assigned_to, created_by, created_at, updated_at');
              
              const { data: fallbackData, error: fallbackError } = await fallbackQuery;
              
              if (fallbackError) {
                console.error('Fallback query also failed:', fallbackError);
                // Return empty array instead of throwing to prevent app crash
                return [];
              }
              
              // Filter data on client side if needed
              let filteredData = fallbackData || [];
              if (userId) {
                filteredData = filteredData.filter(task => 
                  task.assigned_to === userId || task.created_by === userId
                );
              }
              if (category) {
                filteredData = filteredData.filter(task => task.category === category);
              }
              
              return processTaskData(filteredData);
            }
            
            throw error;
          }

          return processTaskData(data || []);
        } catch (error) {
          console.error('Critical error in task query:', error);
          // Return empty array to prevent complete app failure
          return [];
        }
      },
      meta: {
        onError: (error: Error) => {
          console.error('Error in task query:', error);
        }
      }
    });
  };

  // Helper function to validate task status
  const validateTaskStatus = (status: any): TaskStatus => {
    const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed'];
    return validStatuses.includes(status) ? status : 'pending';
  };

  // Helper function to validate task priority
  const validateTaskPriority = (priority: any): TaskPriority => {
    const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
    return validPriorities.includes(priority) ? priority : 'medium';
  };

  const useTaskStatsQuery = (userId?: string) => {
    return useQuery({
      queryKey: ['taskStats', userId],
      queryFn: () => fetchTaskStats(userId)
    });
  };

  // Import and re-export mutation functions from useTaskOperations
  const { useCreateTask, useUpdateTask, useDeleteTask, useDeleteAllTasks } = useTaskOperations();

  return {
    useTaskQuery,
    useTaskStatsQuery,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
    useDeleteAllTasks
  };
}

// Export types for backward compatibility
export type { Task, TaskCategory, TaskStats, TaskPriority };