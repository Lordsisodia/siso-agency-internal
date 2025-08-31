/**
 * 🚀 Light Work Tasks Hook - Clean Architecture
 * 
 * Dedicated hook for Light Work tasks only
 * Uses separate API endpoints for clean data separation
 */

import { useState, useCallback, useEffect } from 'react';
import { useClerkUser } from './useClerkUser';

export interface LightWorkTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  originalDate: string;
  currentDate: string;
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

export function useLightWorkTasks({ selectedDate }: UseLightWorkTasksProps) {
  const { user, isSignedIn } = useClerkUser();
  const [tasks, setTasks] = useState<LightWorkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateString = selectedDate?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0];

  // Load light work tasks
  const loadTasks = useCallback(async () => {
    if (!isSignedIn || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/light-work/tasks?userId=${user.id}&date=${dateString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`☕ Loaded ${result.data.length} Light Work tasks`);
        setTasks(result.data);
      } else {
        throw new Error(result.error || 'Failed to load light work tasks');
      }
    } catch (error) {
      console.error('❌ Error loading light work tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, user?.id, dateString]);

  // Create new light work task
  const createTask = useCallback(async (taskData: Partial<LightWorkTask>) => {
    if (!user?.id) return null;

    try {
      const response = await fetch('/api/light-work/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          taskData: {
            ...taskData,
            originalDate: dateString,
            currentDate: dateString
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Created Light Work task: ${result.data.title}`);
        setTasks(prev => [...prev, result.data]);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('❌ Error creating light work task:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task');
      return null;
    }
  }, [user?.id, dateString]);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/light-work/tasks/${taskId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Toggled Light Work task completion: ${taskId}`);
        setTasks(prev => prev.map(task => 
          task.id === taskId ? result.data : task
        ));
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to toggle task');
      }
    } catch (error) {
      console.error('❌ Error toggling light work task:', error);
      setError(error instanceof Error ? error.message : 'Failed to toggle task');
      return null;
    }
  }, []);

  // Add subtask to task
  const addSubtask = useCallback(async (taskId: string, subtaskTitle: string, priority = 'Med') => {
    try {
      const response = await fetch(`/api/light-work/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: subtaskTitle,
          priority
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Added subtask to Light Work task: ${taskId}`);
        // Reload tasks to get updated data
        await loadTasks();
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to add subtask');
      }
    } catch (error) {
      console.error('❌ Error adding subtask to light work task:', error);
      setError(error instanceof Error ? error.message : 'Failed to add subtask');
      return null;
    }
  }, [loadTasks]);

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
    refreshTasks: loadTasks
  };
}