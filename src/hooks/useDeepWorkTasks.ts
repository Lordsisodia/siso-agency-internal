/**
 * 🚀 Deep Work Tasks Hook - Clean Architecture
 * 
 * Dedicated hook for Deep Work tasks only
 * Uses separate API endpoints for clean data separation
 */

import { useState, useCallback, useEffect } from 'react';
import { useClerkUser } from './useClerkUser';

export interface DeepWorkTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  originalDate: string;
  currentDate: string;
  estimatedDuration?: number;
  focusBlocks: number;
  breakDuration: number;
  interruptionMode: boolean;
  rollovers: number;
  tags: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  startedAt?: string;
  actualDurationMin?: number;
  timeEstimate?: string;
  subtasks: DeepWorkSubtask[];
}

export interface DeepWorkSubtask {
  id: string;
  taskId: string;
  title: string;
  text: string;
  completed: boolean;
  priority?: string;
  dueDate?: string;
  requiresFocus: boolean;
  complexityLevel?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface UseDeepWorkTasksProps {
  selectedDate: Date;
}

export function useDeepWorkTasks({ selectedDate }: UseDeepWorkTasksProps) {
  const { user, isSignedIn } = useClerkUser();
  const [tasks, setTasks] = useState<DeepWorkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateString = selectedDate?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0];

  // Load deep work tasks
  const loadTasks = useCallback(async () => {
    if (!isSignedIn || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/deep-work/tasks?userId=${user.id}&date=${dateString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`🧠 Loaded ${result.data.length} Deep Work tasks`);
        setTasks(result.data);
      } else {
        throw new Error(result.error || 'Failed to load deep work tasks');
      }
    } catch (error) {
      console.error('❌ Error loading deep work tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, user?.id, dateString]);

  // Create new deep work task
  const createTask = useCallback(async (taskData: Partial<DeepWorkTask>) => {
    if (!user?.id) return null;

    try {
      const response = await fetch('/api/deep-work/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          taskData: {
            ...taskData,
            originalDate: dateString,
            currentDate: dateString,
            priority: taskData.priority || 'HIGH',
            estimatedDuration: taskData.estimatedDuration || 120, // Default 2 hours
            focusBlocks: taskData.focusBlocks || 1,
            breakDuration: taskData.breakDuration || 15
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Created Deep Work task: ${result.data.title}`);
        setTasks(prev => [...prev, result.data]);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('❌ Error creating deep work task:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task');
      return null;
    }
  }, [user?.id, dateString]);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/deep-work/tasks/${taskId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Toggled Deep Work task completion: ${taskId}`);
        setTasks(prev => prev.map(task => 
          task.id === taskId ? result.data : task
        ));
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to toggle task');
      }
    } catch (error) {
      console.error('❌ Error toggling deep work task:', error);
      setError(error instanceof Error ? error.message : 'Failed to toggle task');
      return null;
    }
  }, []);

  // Add subtask to task
  const addSubtask = useCallback(async (taskId: string, subtaskTitle: string, priority = 'High', complexityLevel = 3) => {
    try {
      const response = await fetch(`/api/deep-work/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: subtaskTitle,
          priority,
          complexityLevel
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Added subtask to Deep Work task: ${taskId}`);
        // Reload tasks to get updated data
        await loadTasks();
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to add subtask');
      }
    } catch (error) {
      console.error('❌ Error adding subtask to deep work task:', error);
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