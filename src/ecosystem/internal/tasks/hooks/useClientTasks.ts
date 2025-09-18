
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/shared/hooks/use-toast';
import { useAuthSession } from '@/shared/hooks/useAuthSession';
import { Task } from '@/types/task.types';

// Define a UI-friendly task type that matches the TaskCard component's expected props
export interface UiTask {
  id: string;
  name: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  category: string;
  priority: 'low' | 'medium' | 'high';
  owner: {
    name: string;
    image: string;
  };
  status: {
    name: string;
    color: string;
  };
}

export function useClientTasks(clientId?: string) {
  const [tasks, setTasks] = useState<UiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuthSession();
  
  useEffect(() => {
    if (!user) {
      setError('Authentication required to view tasks');
      setLoading(false);
      return;
    }
    
    const fetchTasks = async () => {
      try {
        setError(null);
        let query = supabase.from('tasks').select('id, title, description, due_date, category, priority, status, assigned_to, assigned_client_id');

        if (clientId) {
          query = query.eq('assigned_client_id', clientId);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }
        
        // Transform DB tasks to UI-friendly format
        const mappedTasks = (data || []).map(task => ({
          id: task.id,
          name: task.title,
          description: task.description,
          startAt: new Date(task.due_date || Date.now() - 86400000), // Default to yesterday
          endAt: new Date(task.due_date || Date.now() + 86400000),   // Default to tomorrow
          category: String(task.category),
          priority: (task.priority || 'medium') as 'low' | 'medium' | 'high',
          status: {
            name: task.status === 'completed' ? 'Completed' : 
                  task.status === 'in_progress' ? 'In Progress' : 'To Do',
            color: task.status === 'completed' ? '#10B981' : 
                  task.status === 'in_progress' ? '#F59E0B' : '#6B7280'
          },
          owner: {
            name: task.assigned_to ? 'Assigned User' : 'Unassigned',
            image: `https://api.dicebear.com/7.x/initials/svg?seed=${task.assigned_to || 'User'}`
          }
        }));
        
        setTasks(mappedTasks);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load tasks';
        setError(message);
        toast({
          variant: "destructive",
          title: "Error loading tasks",
          description: message
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, toast, user]);

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task updated",
        description: "Task status has been updated successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: "Failed to update task status. Please try again."
      });
    }
  };

  return {
    tasks,
    loading,
    error,
    updateTaskStatus
  };
}
