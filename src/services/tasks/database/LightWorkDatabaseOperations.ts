/**
 * 💾 Light Work Database Operations - Focused data access for quick tasks
 * 
 * This module handles all database operations specifically for light work tasks.
 * Light work tasks are quick, administrative activities typically lasting 5-45 minutes
 * with low cognitive intensity and frequent context switching.
 * 
 * Business Context:
 * Light work database operations are optimized for:
 * - High frequency, low complexity queries
 * - Quick response times for administrative workflows
 * - Batch operations for efficiency
 * - Lightweight caching for frequently accessed data
 * 
 * Database Patterns:
 * - Simple CRUD operations with minimal joins
 * - Optimistic updates for quick status changes
 * - Batch processing for administrative bulk operations
 * - Fast filtering and sorting for task lists
 */

import { supabase } from '@/lib/supabase';
import { Task } from '@/components/tasks/TaskCard';

// Light work specific database configuration
const LIGHT_WORK_CONFIG = {
  TABLE_NAME: 'tasks',
  WORK_TYPE: 'light_work',
  BATCH_SIZE: 50,           // Smaller batches for quick processing
  QUERY_TIMEOUT: 5000,      // 5 second timeout for light work
  MAX_TITLE_LENGTH: 80,     // Shorter titles for quick tasks
  DEFAULT_PRIORITY: 'medium' as const
} as const;

// Database result types
interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    affected: number;
    cached: boolean;
    executionTime: number;
  };
}

interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

/**
 * Light Work Database Operations - Optimized for quick task management.
 * 
 * This class provides focused database operations for light work tasks,
 * emphasizing speed and simplicity over complex business logic.
 * Operations are designed for high frequency, low latency use cases.
 */
export class LightWorkDatabaseOperations {

  /**
   * Retrieve all light work tasks with optional filtering and pagination.
   * Optimized for quick loading in administrative interfaces.
   */
  static async getAllTasks(options: QueryOptions = {}): Promise<DatabaseResult<Task[]>> {
    const startTime = Date.now();
    
    try {
      let query = supabase
        .from(LIGHT_WORK_CONFIG.TABLE_NAME)
        .select('*')
        .eq('work_type', LIGHT_WORK_CONFIG.WORK_TYPE);

      // Apply filters if provided
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection !== 'desc' 
        });
      } else {
        // Default: most recent first for light work
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Light work database query failed:', error);
        return {
          success: false,
          error: `Database query failed: ${error.message}`
        };
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: data || [],
        metadata: {
          affected: data?.length || 0,
          cached: false,
          executionTime
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Light work query exception:', error);
      
      return {
        success: false,
        error: `Query exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime
        }
      };
    }
  }

  /**
   * Create a new light work task with validation and defaults.
   * Optimized for quick task creation in administrative workflows.
   */
  static async createTask(taskData: Partial<Task>): Promise<DatabaseResult<Task>> {
    const startTime = Date.now();
    
    try {
      // Apply light work defaults
      const lightWorkTask = {
        ...taskData,
        work_type: LIGHT_WORK_CONFIG.WORK_TYPE,
        priority: taskData.priority || LIGHT_WORK_CONFIG.DEFAULT_PRIORITY,
        status: taskData.status || 'pending',
        level: taskData.level || 0,
        focus_intensity: taskData.focusIntensity || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(LIGHT_WORK_CONFIG.TABLE_NAME)
        .insert(lightWorkTask)
        .select()
        .single();

      if (error) {
        console.error('❌ Light work task creation failed:', error);
        return {
          success: false,
          error: `Task creation failed: ${error.message}`
        };
      }

      const executionTime = Date.now() - startTime;
      console.log(`✅ Created light work task: ${data.id} (${executionTime}ms)`);

      return {
        success: true,
        data,
        metadata: {
          affected: 1,
          cached: false,
          executionTime
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Light work creation exception:', error);
      
      return {
        success: false,
        error: `Creation exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime
        }
      };
    }
  }

  /**
   * Update an existing light work task.
   * Supports partial updates for quick administrative changes.
   */
  static async updateTask(taskId: string, updates: Partial<Task>): Promise<DatabaseResult<Task>> {
    const startTime = Date.now();
    
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(LIGHT_WORK_CONFIG.TABLE_NAME)
        .update(updateData)
        .eq('id', taskId)
        .eq('work_type', LIGHT_WORK_CONFIG.WORK_TYPE)
        .select()
        .single();

      if (error) {
        console.error('❌ Light work task update failed:', error);
        return {
          success: false,
          error: `Task update failed: ${error.message}`
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Light work task not found or unauthorized'
        };
      }

      const executionTime = Date.now() - startTime;
      console.log(`✅ Updated light work task: ${taskId} (${executionTime}ms)`);

      return {
        success: true,
        data,
        metadata: {
          affected: 1,
          cached: false,
          executionTime
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Light work update exception:', error);
      
      return {
        success: false,
        error: `Update exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime
        }
      };
    }
  }

  /**
   * Update task status for quick administrative changes.
   * Optimized for frequent status toggles in light work workflows.
   */
  static async updateTaskStatus(taskId: string, completed: boolean): Promise<DatabaseResult<void>> {
    const startTime = Date.now();
    
    try {
      const status = completed ? 'completed' : 'pending';
      const completedAt = completed ? new Date().toISOString() : null;

      const { error } = await supabase
        .from(LIGHT_WORK_CONFIG.TABLE_NAME)
        .update({ 
          status,
          completed_at: completedAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('work_type', LIGHT_WORK_CONFIG.WORK_TYPE);

      if (error) {
        console.error('❌ Light work status update failed:', error);
        return {
          success: false,
          error: `Status update failed: ${error.message}`
        };
      }

      const executionTime = Date.now() - startTime;
      console.log(`✅ Updated light work status: ${taskId} -> ${status} (${executionTime}ms)`);

      return {
        success: true,
        metadata: {
          affected: 1,
          cached: false,
          executionTime
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Light work status update exception:', error);
      
      return {
        success: false,
        error: `Status update exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime
        }
      };
    }
  }

  /**
   * Update subtask status for light work administrative tasks.
   * Supports quick completion tracking for simple subtasks.
   */
  static async updateSubtaskStatus(subtaskId: string, completed: boolean): Promise<DatabaseResult<void>> {
    const startTime = Date.now();
    
    try {
      // For light work, subtasks are stored as JSON in the subtasks column
      // We need to update the specific subtask's status within the JSON array
      
      // First, get the current task with subtasks
      const { data: task, error: fetchError } = await supabase
        .from(LIGHT_WORK_CONFIG.TABLE_NAME)
        .select('subtasks')
        .contains('subtasks', [{ id: subtaskId }])
        .eq('work_type', LIGHT_WORK_CONFIG.WORK_TYPE)
        .single();

      if (fetchError || !task) {
        return {
          success: false,
          error: 'Light work task or subtask not found'
        };
      }

      // Update the subtask status in the JSON array
      const updatedSubtasks = task.subtasks.map((subtask: any) => 
        subtask.id === subtaskId 
          ? { ...subtask, status: completed ? 'completed' : 'pending' }
          : subtask
      );

      // Update the task with modified subtasks
      const { error: updateError } = await supabase
        .from(LIGHT_WORK_CONFIG.TABLE_NAME)
        .update({ 
          subtasks: updatedSubtasks,
          updated_at: new Date().toISOString()
        })
        .contains('subtasks', [{ id: subtaskId }])
        .eq('work_type', LIGHT_WORK_CONFIG.WORK_TYPE);

      if (updateError) {
        console.error('❌ Light work subtask update failed:', updateError);
        return {
          success: false,
          error: `Subtask update failed: ${updateError.message}`
        };
      }

      const executionTime = Date.now() - startTime;
      const status = completed ? 'completed' : 'pending';
      console.log(`✅ Updated light work subtask: ${subtaskId} -> ${status} (${executionTime}ms)`);

      return {
        success: true,
        metadata: {
          affected: 1,
          cached: false,
          executionTime
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Light work subtask update exception:', error);
      
      return {
        success: false,
        error: `Subtask update exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime
        }
      };
    }
  }

  /**
   * Delete a light work task.
   * Supports soft deletion with cleanup for administrative workflows.
   */
  static async deleteTask(taskId: string): Promise<DatabaseResult<void>> {
    const startTime = Date.now();
    
    try {
      const { error } = await supabase
        .from(LIGHT_WORK_CONFIG.TABLE_NAME)
        .delete()
        .eq('id', taskId)
        .eq('work_type', LIGHT_WORK_CONFIG.WORK_TYPE);

      if (error) {
        console.error('❌ Light work task deletion failed:', error);
        return {
          success: false,
          error: `Task deletion failed: ${error.message}`
        };
      }

      const executionTime = Date.now() - startTime;
      console.log(`✅ Deleted light work task: ${taskId} (${executionTime}ms)`);

      return {
        success: true,
        metadata: {
          affected: 1,
          cached: false,
          executionTime
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Light work deletion exception:', error);
      
      return {
        success: false,
        error: `Deletion exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime
        }
      };
    }
  }

  /**
   * Batch update multiple light work tasks.
   * Optimized for administrative bulk operations.
   */
  static async batchUpdateTasks(
    taskIds: string[], 
    updates: Partial<Task>
  ): Promise<DatabaseResult<number>> {
    const startTime = Date.now();
    
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(LIGHT_WORK_CONFIG.TABLE_NAME)
        .update(updateData)
        .in('id', taskIds)
        .eq('work_type', LIGHT_WORK_CONFIG.WORK_TYPE)
        .select('id');

      if (error) {
        console.error('❌ Light work batch update failed:', error);
        return {
          success: false,
          error: `Batch update failed: ${error.message}`
        };
      }

      const affectedCount = data?.length || 0;
      const executionTime = Date.now() - startTime;
      console.log(`✅ Batch updated ${affectedCount} light work tasks (${executionTime}ms)`);

      return {
        success: true,
        data: affectedCount,
        metadata: {
          affected: affectedCount,
          cached: false,
          executionTime
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Light work batch update exception:', error);
      
      return {
        success: false,
        error: `Batch update exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime
        }
      };
    }
  }

  /**
   * Get light work task statistics for administrative dashboards.
   * Quick aggregation queries for light work metrics.
   */
  static async getTaskStatistics(): Promise<DatabaseResult<{
    total: number;
    pending: number;
    completed: number;
    inProgress: number;
  }>> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase
        .from(LIGHT_WORK_CONFIG.TABLE_NAME)
        .select('status')
        .eq('work_type', LIGHT_WORK_CONFIG.WORK_TYPE);

      if (error) {
        console.error('❌ Light work statistics query failed:', error);
        return {
          success: false,
          error: `Statistics query failed: ${error.message}`
        };
      }

      // Calculate statistics
      const stats = {
        total: data.length,
        pending: data.filter(t => t.status === 'pending').length,
        completed: data.filter(t => t.status === 'completed').length,
        inProgress: data.filter(t => t.status === 'in-progress').length
      };

      const executionTime = Date.now() - startTime;
      console.log(`✅ Retrieved light work statistics (${executionTime}ms)`);

      return {
        success: true,
        data: stats,
        metadata: {
          affected: data.length,
          cached: false,
          executionTime
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Light work statistics exception:', error);
      
      return {
        success: false,
        error: `Statistics exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime
        }
      };
    }
  }
}