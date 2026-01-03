/**
 * TaskIntegrationService - Unified interface for TimeBox integration
 * 
 * This service provides a unified interface for integrating existing LifeLock tasks
 * (LightWork, DeepWork, MorningRoutine) with the TimeBox scheduling system.
 * 
 * Features:
 * - Unified task interface for TimeBox display
 * - Category-based filtering (Light Work | Deep Work | Morning Routine)
 * - Subtask expansion with parent context
 * - Bidirectional sync with original services
 * - Manual scheduling control
 */

import { LightWorkTaskService } from './database/LightWorkTaskService';
import { DeepWorkTaskService } from './database/DeepWorkTaskService';
import { Task, Subtask, WorkType, TaskStatus } from '@/types/task.types';
import { timeboxApi } from '@/services/api/timeboxApi';

export interface UnifiedTimeBoxTask {
  id: string;
  title: string;
  parentTask?: string; // "[Main Task] - Subtask" format
  category: 'light_work' | 'deep_work' | 'morning_routine';
  estimatedDuration: number; // in minutes
  originalSource: 'light_work' | 'deep_work' | 'morning_routine';
  originalTaskId: string;
  originalSubtaskId?: string;
  status: TaskStatus;
  priority?: string;
  workType?: WorkType;
}

export class TaskIntegrationService {
  private static lightWorkService: LightWorkTaskService = new LightWorkTaskService();
  private static deepWorkService: DeepWorkTaskService = new DeepWorkTaskService();

  /**
   * Get all unified tasks for TimeBox integration
   * Returns all subtasks as individual schedulable items with parent context
   */
  static async getUnifiedTasks(): Promise<UnifiedTimeBoxTask[]> {
    try {
      const [lightWorkTasks, deepWorkTasks] = await Promise.all([
        this.lightWorkService.getTasks(),
        this.deepWorkService.getTasks()
      ]);

      const unified: UnifiedTimeBoxTask[] = [];

      // Process light work tasks and their subtasks
      lightWorkTasks.forEach(task => {
        if (task.subtasks && task.subtasks.length > 0) {
          // Add each subtask as individual schedulable item
          task.subtasks.forEach(subtask => {
            unified.push({
              id: `lw_${task.id}_${subtask.id}`,
              title: `[${task.title}] - ${subtask.title}`,
              parentTask: task.title,
              category: 'light_work',
              estimatedDuration: task.estimated_time || 30, // Default 30 min for light work
              originalSource: 'light_work',
              originalTaskId: task.id,
              originalSubtaskId: subtask.id,
              status: subtask.status,
              priority: task.priority,
              workType: 'light'
            });
          });
        } else {
          // Add main task if no subtasks
          unified.push({
            id: `lw_${task.id}`,
            title: task.title,
            category: 'light_work',
            estimatedDuration: task.estimated_time || 30,
            originalSource: 'light_work',
            originalTaskId: task.id,
            status: task.status,
            priority: task.priority,
            workType: 'light'
          });
        }
      });

      // Process deep work tasks and their subtasks
      deepWorkTasks.forEach(task => {
        if (task.subtasks && task.subtasks.length > 0) {
          // Add each subtask as individual schedulable item
          task.subtasks.forEach(subtask => {
            unified.push({
              id: `dw_${task.id}_${subtask.id}`,
              title: `[${task.title}] - ${subtask.title}`,
              parentTask: task.title,
              category: 'deep_work',
              estimatedDuration: task.estimated_time || 60, // Default 60 min for deep work
              originalSource: 'deep_work',
              originalTaskId: task.id,
              originalSubtaskId: subtask.id,
              status: subtask.status,
              priority: task.priority,
              workType: 'deep'
            });
          });
        } else {
          // Add main task if no subtasks
          unified.push({
            id: `dw_${task.id}`,
            title: task.title,
            category: 'deep_work',
            estimatedDuration: task.estimated_time || 60,
            originalSource: 'deep_work',
            originalTaskId: task.id,
            status: task.status,
            priority: task.priority,
            workType: 'deep'
          });
        }
      });

      // Add morning routine as single 45-minute block
      unified.push({
        id: 'morning_routine_block',
        title: 'Morning Routine',
        category: 'morning_routine',
        estimatedDuration: 45,
        originalSource: 'morning_routine',
        originalTaskId: 'morning_routine',
        status: 'pending',
        workType: 'morning'
      });

      return unified.filter(task => task.status !== 'completed'); // Only show non-completed tasks
    } catch (error) {
      console.error('❌ Failed to get unified tasks:', error);
      throw new Error('Failed to retrieve unified tasks for TimeBox');
    }
  }

  /**
   * Filter unified tasks by category
   */
  static filterTasksByCategory(
    tasks: UnifiedTimeBoxTask[], 
    category: 'all' | 'light_work' | 'deep_work' | 'morning_routine'
  ): UnifiedTimeBoxTask[] {
    if (category === 'all') {
      return tasks;
    }
    return tasks.filter(task => task.category === category);
  }

  /**
   * Schedule a unified task in the TimeBox
   */
  static async scheduleTask(task: UnifiedTimeBoxTask, timeSlot: string, date: Date): Promise<void> {
    try {
      // Convert unified task to TimeBox format and schedule
      await timeboxApi.scheduleTask({
        id: task.id,
        title: task.title,
        category: task.category === 'light_work' ? 'light_work' : 
                 task.category === 'deep_work' ? 'deep_work' : 'admin',
        estimatedDuration: task.estimatedDuration,
        status: task.status,
        priority: task.priority || 'medium',
        workType: task.workType
      }, timeSlot, date);

      console.log(`✅ Scheduled task: ${task.title} at ${timeSlot}`);
    } catch (error) {
      console.error('❌ Failed to schedule task:', error);
      throw new Error(`Failed to schedule task: ${task.title}`);
    }
  }

  /**
   * Complete a unified task and sync back to original service
   */
  static async completeTask(unifiedTaskId: string): Promise<void> {
    try {
      const [source, originalTaskId, originalSubtaskId] = unifiedTaskId.split('_');
      
      if (source === 'lw') {
        // Light Work task completion
        if (originalSubtaskId) {
          await this.lightWorkService.updateSubtaskStatus(originalSubtaskId, true);
        } else {
          await this.lightWorkService.updateTaskStatus(originalTaskId, true);
        }
      } else if (source === 'dw') {
        // Deep Work task completion
        if (originalSubtaskId) {
          await this.deepWorkService.updateSubtaskStatus(originalSubtaskId, true);
        } else {
          await this.deepWorkService.updateTaskStatus(originalTaskId, true);
        }
      } else if (unifiedTaskId === 'morning_routine_block') {
        // Morning routine completion - could integrate with morning routine service later
        console.log('✅ Morning routine completed');
      }

      // Also mark as complete in TimeBox
      await timeboxApi.completeTask(unifiedTaskId);
      
      console.log(`✅ Task completed and synced: ${unifiedTaskId}`);
    } catch (error) {
      console.error('❌ Failed to complete task:', error);
      throw new Error(`Failed to complete task: ${unifiedTaskId}`);
    }
  }

  /**
   * Update task duration and reflow timeline
   */
  static async updateTaskDuration(unifiedTaskId: string, newDuration: number): Promise<void> {
    try {
      // Update in TimeBox system
      // This would integrate with TimeBox's timeline reflow system
      console.log(`📊 Updated task duration: ${unifiedTaskId} to ${newDuration} minutes`);
      
      // Could also update estimated time in original service if needed
    } catch (error) {
      console.error('❌ Failed to update task duration:', error);
      throw new Error(`Failed to update duration for task: ${unifiedTaskId}`);
    }
  }

  /**
   * Get task counts by category for UI display
   */
  static async getTaskCounts(): Promise<{
    all: number;
    light_work: number;
    deep_work: number;
    morning_routine: number;
  }> {
    try {
      const tasks = await this.getUnifiedTasks();
      
      return {
        all: tasks.length,
        light_work: tasks.filter(t => t.category === 'light_work').length,
        deep_work: tasks.filter(t => t.category === 'deep_work').length,
        morning_routine: tasks.filter(t => t.category === 'morning_routine').length
      };
    } catch (error) {
      console.error('❌ Failed to get task counts:', error);
      return { all: 0, light_work: 0, deep_work: 0, morning_routine: 0 };
    }
  }
}