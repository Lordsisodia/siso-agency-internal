/**
 * 🌐 API Client Service
 * 
 * Browser-safe HTTP client for calling our API endpoints
 */

import { createApiUrl } from '../utils/api-config';

export interface CreateTaskInput {
  title: string;
  description?: string;
  workType: 'DEEP' | 'LIGHT' | 'MORNING';
  priority: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  currentDate: string;
  originalDate?: string;
  timeEstimate?: string;
  estimatedDuration?: number;
  subtasks?: Array<{
    title: string;
    workType: 'DEEP' | 'LIGHT' | 'MORNING';
  }>;
}

export interface PersonalContextData {
  currentGoals?: string;
  skillPriorities?: string;
  revenueTargets?: string;
  timeConstraints?: string;
  currentProjects?: string;
  hatedTasks?: string;
  valuedTasks?: string;
  learningObjectives?: string;
}

class APIClient {

  /**
   * Get tasks for a user on a specific date
   */
  async getTasksForDate(userId: string, date: string) {
    const response = await fetch(createApiUrl(`/api/tasks?userId=${userId}&date=${date}`));
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch tasks');
    }
    
    return result.data;
  }

  /**
   * Create a new task
   */
  async createTask(userId: string, taskData: CreateTaskInput) {
    const response = await fetch(createApiUrl('/api/tasks'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, taskData })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create task');
    }
    
    return result.data;
  }

  /**
   * Update task completion status
   */
  async updateTaskCompletion(taskId: string, completed: boolean) {
    const response = await fetch(createApiUrl(`/api/tasks`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ taskId, completed })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update task completion');
    }
    
    return result.data;
  }

  /**
   * Update task title
   */
  async updateTaskTitle(taskId: string, title: string) {
    const response = await fetch(createApiUrl(`/api/tasks`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ taskId, title })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update task title');
    }
    
    return result.data;
  }

  /**
   * Update subtask completion status
   */
  async updateSubtaskCompletion(subtaskId: string, completed: boolean) {
    const response = await fetch(createApiUrl(`/api/subtasks/${subtaskId}`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ completed })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update subtask completion');
    }
    
    return result.data;
  }

  /**
   * Add subtask to existing task
   */
  async addSubtask(taskId: string, subtaskData: { title: string; workType: 'DEEP' | 'LIGHT' | 'MORNING' }) {
    const response = await fetch(createApiUrl('/api/subtasks'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ taskId, ...subtaskData })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to add subtask');
    }
    
    return result.data;
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string) {
    const response = await fetch(createApiUrl(`/api/tasks?taskId=${taskId}`), {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete task');
    }
    
    return result;
  }

  /**
   * Push task to another day
   */
  async pushTaskToAnotherDay(taskId: string, pushedToDate?: string) {
    const response = await fetch(createApiUrl(`/api/tasks/${taskId}/push`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pushedToDate })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to push task to another day');
    }
    
    return result.data;
  }

  /**
   * Get personal context for user
   */
  async getPersonalContext(userId: string) {
    const response = await fetch(createApiUrl(`/api/personal-context?userId=${userId}`));
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get personal context');
    }
    
    return result.data;
  }

  /**
   * Update personal context for user
   */
  async updatePersonalContext(userId: string, contextData: PersonalContextData) {
    const response = await fetch(createApiUrl('/api/personal-context'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, contextData })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update personal context');
    }
    
    return result.data;
  }

  /**
   * Get morning routine for a specific date
   */
  async getMorningRoutine(userId: string, date: string) {
    const response = await fetch(createApiUrl(`/api/morning-routine?userId=${userId}&date=${date}`));
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch morning routine');
    }
    
    return result.data;
  }

  /**
   * Update morning routine habit completion
   */
  async updateMorningRoutineHabit(userId: string, date: string, habitName: string, completed: boolean) {
    const response = await fetch(createApiUrl('/api/morning-routine'), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, date, habitName, completed })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update morning routine habit');
    }
    
    return result.data;
  }
}

export const apiClient = new APIClient();
export default apiClient;