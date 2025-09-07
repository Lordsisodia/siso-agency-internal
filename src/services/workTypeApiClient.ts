/**
 * 🔧 WorkType API Client - Calls correct LIGHT/DEEP work endpoints
 * 
 * Replaces stub PersonalTaskService with real API calls
 * Routes to /api/light-work/tasks and /api/deep-work/tasks
 */

import { format } from 'date-fns';

const createApiUrl = (path: string) => {
  // In development, use local API server on port 3001
  // In production, use relative URLs for Vercel deployment
  const isDev = import.meta.env.DEV;
  return isDev ? `http://localhost:3001${path}` : path;
};

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  workType: 'LIGHT' | 'DEEP';
  priority: string;
  currentDate: string;
  subtasks?: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  workType: 'LIGHT' | 'DEEP';
}

export interface MorningRoutineHabit {
  name: string;
  completed: boolean;
}

export interface MorningRoutine {
  id: string;
  userId: string;
  date: string;
  items: MorningRoutineHabit[];
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
}

export class WorkTypeApiClient {
  
  /**
   * Get tasks for date - calls both LIGHT and DEEP endpoints
   */
  async getTasksForDate(userId: string, date: Date): Promise<Task[]> {
    const dateString = format(date, 'yyyy-MM-dd');
    
    try {
      // Call both endpoints in parallel
      const [lightResponse, deepResponse] = await Promise.all([
        fetch(createApiUrl(`/api/light-work/tasks?userId=${userId}&date=${dateString}`)),
        fetch(createApiUrl(`/api/deep-work/tasks?userId=${userId}&date=${dateString}`))
      ]);

      const lightResult = await lightResponse.json();
      const deepResult = await deepResponse.json();

      const allTasks: Task[] = [];
      
      if (lightResult.success && lightResult.data) {
        allTasks.push(...lightResult.data);
      }
      
      if (deepResult.success && deepResult.data) {
        allTasks.push(...deepResult.data);
      }

      return allTasks;
    } catch (error) {
      console.error('❌ Failed to fetch tasks for date:', error);
      return [];
    }
  }

  /**
   * Add task - routes to correct endpoint based on workType
   */
  async addTask(title: string, date: Date, priority: string, workType: 'LIGHT' | 'DEEP' = 'LIGHT', userId?: string): Promise<void> {
    const dateString = format(date, 'yyyy-MM-dd');
    
    if (!userId) {
      throw new Error('userId is required');
    }
    
    try {
      const endpoint = workType === 'LIGHT' ? '/api/light-work/tasks' : '/api/deep-work/tasks';
      
      const response = await fetch(createApiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          taskData: {
            title,
            priority,
            currentDate: dateString,
            estimatedMinutes: 30
          }
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('❌ Failed to add task:', error);
      throw error;
    }
  }

  /**
   * Toggle task completion - needs workType to route correctly
   */
  async toggleTask(taskId: string, workType: 'LIGHT' | 'DEEP', currentCompleted?: boolean): Promise<void> {
    try {
      const endpoint = workType === 'DEEP' 
        ? `/api/deep-work/tasks?taskId=${taskId}` 
        : `/api/light-work/tasks?taskId=${taskId}`;
      
      const response = await fetch(createApiUrl(endpoint), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completed: !currentCompleted
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to toggle task');
      }
    } catch (error) {
      console.error('❌ Failed to toggle task:', error);
      throw error;
    }
  }

  /**
   * Delete task - needs workType to route correctly  
   */
  async deleteTask(taskId: string, workType: 'LIGHT' | 'DEEP'): Promise<void> {
    try {
      const endpoint = workType === 'DEEP' 
        ? `/api/deep-work/tasks?taskId=${taskId}` 
        : `/api/light-work/tasks?taskId=${taskId}`;
      
      const response = await fetch(createApiUrl(endpoint), {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
      throw error;
    }
  }

  /**
   * Update task - needs workType to route correctly
   */
  async updateTask(taskId: string, updates: { title?: string; priority?: string }, workType: 'LIGHT' | 'DEEP'): Promise<void> {
    try {
      const endpoint = workType === 'DEEP' 
        ? `/api/deep-work/tasks?taskId=${taskId}` 
        : `/api/light-work/tasks?taskId=${taskId}`;
      
      const response = await fetch(createApiUrl(endpoint), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('❌ Failed to update task:', error);
      throw error;
    }
  }

  /**
   * Get morning routine for date
   */
  async getMorningRoutine(userId: string, date: Date): Promise<MorningRoutine | null> {
    const dateString = format(date, 'yyyy-MM-dd');
    
    try {
      const response = await fetch(createApiUrl(`/api/morning-routine?userId=${userId}&date=${dateString}`));
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get morning routine');
      }

      return result.data;
    } catch (error) {
      console.error('❌ Failed to get morning routine:', error);
      return null;
    }
  }

  /**
   * Update morning routine habit
   */
  async updateMorningRoutineHabit(userId: string, date: Date, habitName: string, completed: boolean): Promise<void> {
    const dateString = format(date, 'yyyy-MM-dd');
    
    try {
      const response = await fetch(createApiUrl('/api/morning-routine'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          date: dateString,
          habitName,
          completed
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update morning routine habit');
      }
    } catch (error) {
      console.error('❌ Failed to update morning routine habit:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const workTypeApiClient = new WorkTypeApiClient();
export const personalTaskService = workTypeApiClient; // Alias for compatibility