/**
 * 🌐 Real Task Database Service
 * 
 * Uses the real API client to connect to actual database
 * NO MORE MOCKS - This is the real deal!
 */

import { apiClient } from '@/services/api-client';

// Define types matching the database schema
type WorkType = 'DEEP' | 'LIGHT' | 'MORNING';
type Priority = 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
type TaskDifficulty = 'TRIVIAL' | 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';

export interface TaskWithSubtasks {
  id: string;
  title: string;
  description?: string;
  workType: WorkType;
  priority: Priority;
  completed: boolean;
  currentDate: string;
  originalDate: string;
  estimatedDuration?: number;
  timeEstimate?: string;
  rollovers: number;
  tags: string[];
  category?: string;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subtasks: SubtaskWithCompletion[];
}

export interface SubtaskWithCompletion {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  workType: WorkType;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  workType: WorkType;
  priority: Priority;
  currentDate: string;
  originalDate?: string;
  timeEstimate?: string;
  estimatedDuration?: number;
  tags?: string[];
  category?: string;
  subtasks?: Array<{
    title: string;
    workType: WorkType;
  }>;
}

export class RealTaskDatabaseService {
  /**
   * Get all tasks for a user on a specific date
   */
  async getTasksForDate(userId: string, date: string): Promise<TaskWithSubtasks[]> {
    try {
      console.log(`🔍 [REAL DB] Fetching tasks for user ${userId} on ${date}`);
      const tasks = await apiClient.getTasksForDate(userId, date);
      console.log(`✅ [REAL DB] Retrieved ${tasks.length} tasks`);
      return tasks;
    } catch (error) {
      console.error('❌ [REAL DB] Failed to fetch tasks:', error);
      throw error;
    }
  }

  /**
   * Create a new task with optional subtasks
   */
  async createTask(userId: string, taskData: CreateTaskData): Promise<TaskWithSubtasks> {
    try {
      console.log(`➕ [REAL DB] Creating task: ${taskData.title}`);
      const task = await apiClient.createTask(userId, taskData);
      console.log(`✅ [REAL DB] Created task with ID: ${task.id}`);
      return task;
    } catch (error) {
      console.error('❌ [REAL DB] Failed to create task:', error);
      throw error;
    }
  }

  /**
   * Update task completion status
   */
  async updateTaskCompletion(taskId: string, completed: boolean): Promise<TaskWithSubtasks> {
    try {
      console.log(`✅ [REAL DB] ${completed ? 'Completing' : 'Uncompleting'} task: ${taskId}`);
      const task = await apiClient.updateTaskCompletion(taskId, completed);
      console.log(`✅ [REAL DB] Task completion updated successfully`);
      return task;
    } catch (error) {
      console.error('❌ [REAL DB] Failed to update task completion:', error);
      throw error;
    }
  }

  /**
   * Update subtask completion status  
   */
  async updateSubtaskCompletion(subtaskId: string, completed: boolean): Promise<SubtaskWithCompletion> {
    try {
      console.log(`✅ [REAL DB] ${completed ? 'Completing' : 'Uncompleting'} subtask: ${subtaskId}`);
      const subtask = await apiClient.updateSubtaskCompletion(subtaskId, completed);
      console.log(`✅ [REAL DB] Subtask completion updated successfully`);
      return subtask;
    } catch (error) {
      console.error('❌ [REAL DB] Failed to update subtask completion:', error);
      throw error;
    }
  }

  /**
   * Get personal context for user
   */
  async getPersonalContext(userId: string) {
    try {
      console.log(`🔍 [REAL DB] Fetching personal context for user ${userId}`);
      const context = await apiClient.getPersonalContext(userId);
      console.log(`✅ [REAL DB] Retrieved personal context`);
      return context;
    } catch (error) {
      console.error('❌ [REAL DB] Failed to fetch personal context:', error);
      throw error;
    }
  }

  /**
   * Update personal context for user
   */
  async updatePersonalContext(userId: string, contextData: any) {
    try {
      console.log(`💾 [REAL DB] Updating personal context for user ${userId}`);
      const context = await apiClient.updatePersonalContext(userId, contextData);
      console.log(`✅ [REAL DB] Personal context updated successfully`);
      return context;
    } catch (error) {
      console.error('❌ [REAL DB] Failed to update personal context:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const realTaskDatabaseService = new RealTaskDatabaseService();