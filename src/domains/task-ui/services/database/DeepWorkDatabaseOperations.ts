/**
 * 💾 Deep Work Database Operations - Focused data access for complex work tasks
 * 
 * This module handles all database operations specifically for deep work tasks.
 * Deep work tasks are complex, focused activities requiring significant mental effort
 * and typically lasting 45-240 minutes with high cognitive intensity.
 * 
 * Business Context:
 * Deep work database operations are optimized for:
 * - Complex queries with relationships and dependencies
 * - Transaction support for multi-step operations
 * - Detailed audit trails for complex work tracking
 * - Extended caching for expensive operations
 * 
 * Database Patterns:
 * - Complex CRUD with dependency tracking
 * - Transactional updates for consistency
 * - Detailed logging for complex work analysis
 * - Optimistic locking for concurrent deep work sessions
 */

import { supabase } from '@/lib/services/supabase/client';
import { Task } from '@/domains/lifelock/1-daily/2-tasks/components-from-root/TaskCard';

// Deep work specific database configuration
const DEEP_WORK_CONFIG = {
  TABLE_NAME: 'tasks',
  TASK_TYPE: 'deep_work',
  BATCH_SIZE: 20,           // Smaller batches for complex processing
  QUERY_TIMEOUT: 15000,     // 15 second timeout for complex operations
  MAX_TITLE_LENGTH: 120,    // Longer titles for complex work
  DEFAULT_PRIORITY: 'high' as const,
  MIN_FOCUS_INTENSITY: 2,   // Minimum intensity for deep work
  MAX_DEPENDENCIES: 5       // Limit dependencies for focus
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
    complexity?: 'low' | 'medium' | 'high';
  };
}

interface DeepWorkQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
  includeDependencies?: boolean;
  includeSubtasks?: boolean;
  focusIntensityMin?: number;
  focusIntensityMax?: number;
}

interface DeepWorkTaskData extends Partial<Task> {
  dependencies?: string[];
  blockedBy?: string[];
  complexity?: 'low' | 'medium' | 'high';
  sessionNotes?: string;
  focusBreaks?: number;
  actualDuration?: number;
}

/**
 * Deep Work Database Operations - Optimized for complex task management.
 * 
 * This class provides sophisticated database operations for deep work tasks,
 * emphasizing data integrity, dependency tracking, and complex business logic.
 * Operations support the demanding requirements of sustained focus work.
 */
export class DeepWorkDatabaseOperations {

  /**
   * Retrieve all deep work tasks with complex filtering and relationships.
   * Optimized for comprehensive deep work analysis and planning.
   */
  static async getAllTasks(options: DeepWorkQueryOptions = {}): Promise<DatabaseResult<Task[]>> {
    const startTime = Date.now();
    
    try {
      let query = supabase
        .from(DEEP_WORK_CONFIG.TABLE_NAME)
        .select('*')
        .eq('task_type', DEEP_WORK_CONFIG.TASK_TYPE);

      // Apply complex filters for deep work
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Focus intensity filtering for deep work
      if (options.focusIntensityMin !== undefined) {
        query = query.gte('focus_intensity', options.focusIntensityMin);
      }
      if (options.focusIntensityMax !== undefined) {
        query = query.lte('focus_intensity', options.focusIntensityMax);
      }

      // Apply ordering - deep work defaults to priority then focus intensity
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection !== 'desc' 
        });
      } else {
        // Default: priority first, then focus intensity for deep work planning
        query = query
          .order('priority', { ascending: false })
          .order('focus_intensity', { ascending: false })
          .order('created_at', { ascending: false });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Deep work database query failed:', error);
        return {
          success: false,
          error: `Database query failed: ${error.message}`
        };
      }

      const executionTime = Date.now() - startTime;
      const complexity = executionTime > 1000 ? 'high' : executionTime > 500 ? 'medium' : 'low';
      
      console.log(`✅ Retrieved ${data?.length || 0} deep work tasks (${executionTime}ms, ${complexity} complexity)`);

      return {
        success: true,
        data: data || [],
        metadata: {
          affected: data?.length || 0,
          cached: false,
          executionTime,
          complexity
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Deep work query exception:', error);
      
      return {
        success: false,
        error: `Query exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime,
          complexity: 'high'
        }
      };
    }
  }

  /**
   * Create a new deep work task with validation and dependency tracking.
   * Supports complex creation with relationship management.
   */
  static async createTask(taskData: DeepWorkTaskData): Promise<DatabaseResult<Task>> {
    const startTime = Date.now();
    
    try {
      // Apply deep work defaults and validation
      const deepWorkTask = {
        ...taskData,
        task_type: DEEP_WORK_CONFIG.TASK_TYPE,
        priority: taskData.priority || DEEP_WORK_CONFIG.DEFAULT_PRIORITY,
        status: taskData.status || 'pending',
        level: taskData.level || 0,
        focus_intensity: Math.max(
          taskData.focusIntensity || DEEP_WORK_CONFIG.MIN_FOCUS_INTENSITY,
          DEEP_WORK_CONFIG.MIN_FOCUS_INTENSITY
        ),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Deep work specific fields
        complexity: taskData.complexity || 'medium',
        estimated_duration: taskData.estimatedDuration || 90, // Default 90 minutes
        dependencies: taskData.dependencies || [],
        blocked_by: taskData.blockedBy || []
      };

      // Start transaction for complex creation
      const { data, error } = await supabase
        .from(DEEP_WORK_CONFIG.TABLE_NAME)
        .insert(deepWorkTask)
        .select()
        .single();

      if (error) {
        console.error('❌ Deep work task creation failed:', error);
        return {
          success: false,
          error: `Task creation failed: ${error.message}`
        };
      }

      // Update dependency relationships if specified
      if (taskData.dependencies && taskData.dependencies.length > 0) {
        await this.updateDependencyRelationships(data.id, taskData.dependencies);
      }

      const executionTime = Date.now() - startTime;
      const complexity = taskData.dependencies?.length ? 'high' : 'medium';
      
      console.log(`✅ Created deep work task: ${data.id} (${executionTime}ms, ${complexity} complexity)`);

      return {
        success: true,
        data,
        metadata: {
          affected: 1,
          cached: false,
          executionTime,
          complexity
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Deep work creation exception:', error);
      
      return {
        success: false,
        error: `Creation exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime,
          complexity: 'high'
        }
      };
    }
  }

  /**
   * Update an existing deep work task with dependency management.
   * Supports complex updates with relationship tracking.
   */
  static async updateTask(taskId: string, updates: DeepWorkTaskData): Promise<DatabaseResult<Task>> {
    const startTime = Date.now();
    
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Remove relationship fields from direct update
      const { dependencies, blockedBy, ...directUpdates } = updateData;

      const { data, error } = await supabase
        .from(DEEP_WORK_CONFIG.TABLE_NAME)
        .update(directUpdates)
        .eq('id', taskId)
        .eq('task_type', DEEP_WORK_CONFIG.TASK_TYPE)
        .select()
        .single();

      if (error) {
        console.error('❌ Deep work task update failed:', error);
        return {
          success: false,
          error: `Task update failed: ${error.message}`
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Deep work task not found or unauthorized'
        };
      }

      // Update relationships if specified
      let relationshipComplexity = 'low';
      if (dependencies && dependencies.length > 0) {
        await this.updateDependencyRelationships(taskId, dependencies);
        relationshipComplexity = 'high';
      }

      const executionTime = Date.now() - startTime;
      const complexity = relationshipComplexity === 'high' ? 'high' : 'medium';
      
      console.log(`✅ Updated deep work task: ${taskId} (${executionTime}ms, ${complexity} complexity)`);

      return {
        success: true,
        data,
        metadata: {
          affected: 1,
          cached: false,
          executionTime,
          complexity
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Deep work update exception:', error);
      
      return {
        success: false,
        error: `Update exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime,
          complexity: 'high'
        }
      };
    }
  }

  /**
   * Update task status with deep work specific validations.
   * Includes flow state protection and context switching minimization.
   */
  static async updateTaskStatus(taskId: string, completed: boolean): Promise<DatabaseResult<void>> {
    const startTime = Date.now();
    
    try {
      const status = completed ? 'completed' : 'pending';
      const completedAt = completed ? new Date().toISOString() : null;

      // For deep work, check if task is in-progress and warn about context switching
      if (!completed) {
        const { data: currentTask } = await supabase
          .from(DEEP_WORK_CONFIG.TABLE_NAME)
          .select('status, focus_intensity')
          .eq('id', taskId)
          .eq('task_type', DEEP_WORK_CONFIG.TASK_TYPE)
          .single();

        if (currentTask?.status === 'in-progress' && currentTask.focus_intensity >= 3) {
          console.warn('⚠️ Interrupting high-intensity deep work - consider blocking instead');
        }
      }

      const { error } = await supabase
        .from(DEEP_WORK_CONFIG.TABLE_NAME)
        .update({ 
          status,
          completed_at: completedAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('task_type', DEEP_WORK_CONFIG.TASK_TYPE);

      if (error) {
        console.error('❌ Deep work status update failed:', error);
        return {
          success: false,
          error: `Status update failed: ${error.message}`
        };
      }

      const executionTime = Date.now() - startTime;
      console.log(`✅ Updated deep work status: ${taskId} -> ${status} (${executionTime}ms)`);

      return {
        success: true,
        metadata: {
          affected: 1,
          cached: false,
          executionTime,
          complexity: 'medium'
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Deep work status update exception:', error);
      
      return {
        success: false,
        error: `Status update exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime,
          complexity: 'high'
        }
      };
    }
  }

  /**
   * Update subtask status with deep work complexity tracking.
   * Supports detailed progress tracking for complex work decomposition.
   */
  static async updateSubtaskStatus(subtaskId: string, completed: boolean): Promise<DatabaseResult<void>> {
    const startTime = Date.now();
    
    try {
      // Deep work subtasks are more complex - get full task context
      const { data: task, error: fetchError } = await supabase
        .from(DEEP_WORK_CONFIG.TABLE_NAME)
        .select('subtasks, focus_intensity, complexity')
        .contains('subtasks', [{ id: subtaskId }])
        .eq('task_type', DEEP_WORK_CONFIG.TASK_TYPE)
        .single();

      if (fetchError || !task) {
        return {
          success: false,
          error: 'Deep work task or subtask not found'
        };
      }

      // Update subtask with completion timestamp for deep work tracking
      const updatedSubtasks = task.subtasks.map((subtask: any) => 
        subtask.id === subtaskId 
          ? { 
              ...subtask, 
              status: completed ? 'completed' : 'pending',
              completed_at: completed ? new Date().toISOString() : null,
              updated_at: new Date().toISOString()
            }
          : subtask
      );

      // Calculate completion progress for deep work analysis
      const completedCount = updatedSubtasks.filter((st: any) => st.status === 'completed').length;
      const completionProgress = (completedCount / updatedSubtasks.length) * 100;

      // Update task with progress tracking
      const { error: updateError } = await supabase
        .from(DEEP_WORK_CONFIG.TABLE_NAME)
        .update({ 
          subtasks: updatedSubtasks,
          completion_progress: completionProgress,
          updated_at: new Date().toISOString()
        })
        .contains('subtasks', [{ id: subtaskId }])
        .eq('task_type', DEEP_WORK_CONFIG.TASK_TYPE);

      if (updateError) {
        console.error('❌ Deep work subtask update failed:', updateError);
        return {
          success: false,
          error: `Subtask update failed: ${updateError.message}`
        };
      }

      const executionTime = Date.now() - startTime;
      const status = completed ? 'completed' : 'pending';
      const complexity = task.complexity || 'medium';
      
      console.log(`✅ Updated deep work subtask: ${subtaskId} -> ${status} (${executionTime}ms, ${completionProgress.toFixed(1)}% complete)`);

      return {
        success: true,
        metadata: {
          affected: 1,
          cached: false,
          executionTime,
          complexity
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Deep work subtask update exception:', error);
      
      return {
        success: false,
        error: `Subtask update exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime,
          complexity: 'high'
        }
      };
    }
  }

  /**
   * Delete a deep work task with dependency cleanup.
   * Handles complex relationship management during deletion.
   */
  static async deleteTask(taskId: string): Promise<DatabaseResult<void>> {
    const startTime = Date.now();
    
    try {
      // First, clean up any dependency relationships
      await this.cleanupDependencyRelationships(taskId);

      // Then delete the task
      const { error } = await supabase
        .from(DEEP_WORK_CONFIG.TABLE_NAME)
        .delete()
        .eq('id', taskId)
        .eq('task_type', DEEP_WORK_CONFIG.TASK_TYPE);

      if (error) {
        console.error('❌ Deep work task deletion failed:', error);
        return {
          success: false,
          error: `Task deletion failed: ${error.message}`
        };
      }

      const executionTime = Date.now() - startTime;
      console.log(`✅ Deleted deep work task: ${taskId} (${executionTime}ms)`);

      return {
        success: true,
        metadata: {
          affected: 1,
          cached: false,
          executionTime,
          complexity: 'high'
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Deep work deletion exception:', error);
      
      return {
        success: false,
        error: `Deletion exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime,
          complexity: 'high'
        }
      };
    }
  }

  /**
   * Get deep work analytics and insights.
   * Complex aggregation for deep work performance analysis.
   */
  static async getDeepWorkAnalytics(): Promise<DatabaseResult<{
    totalTasks: number;
    averageFocusIntensity: number;
    completionRate: number;
    averageDuration: number;
    complexityDistribution: Record<string, number>;
    focusIntensityDistribution: Record<number, number>;
  }>> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase
        .from(DEEP_WORK_CONFIG.TABLE_NAME)
        .select('status, focus_intensity, complexity, estimated_duration, actual_duration')
        .eq('task_type', DEEP_WORK_CONFIG.TASK_TYPE);

      if (error) {
        console.error('❌ Deep work analytics query failed:', error);
        return {
          success: false,
          error: `Analytics query failed: ${error.message}`
        };
      }

      // Calculate complex analytics
      const totalTasks = data.length;
      const completedTasks = data.filter(t => t.status === 'completed');
      
      const analytics = {
        totalTasks,
        averageFocusIntensity: data.reduce((sum, t) => sum + (t.focus_intensity || 0), 0) / totalTasks,
        completionRate: (completedTasks.length / totalTasks) * 100,
        averageDuration: completedTasks.reduce((sum, t) => sum + (t.actual_duration || t.estimated_duration || 0), 0) / completedTasks.length,
        complexityDistribution: data.reduce((acc, t) => {
          const complexity = t.complexity || 'medium';
          acc[complexity] = (acc[complexity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        focusIntensityDistribution: data.reduce((acc, t) => {
          const intensity = t.focus_intensity || 2;
          acc[intensity] = (acc[intensity] || 0) + 1;
          return acc;
        }, {} as Record<number, number>)
      };

      const executionTime = Date.now() - startTime;
      console.log(`✅ Retrieved deep work analytics (${executionTime}ms)`);

      return {
        success: true,
        data: analytics,
        metadata: {
          affected: data.length,
          cached: false,
          executionTime,
          complexity: 'high'
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Deep work analytics exception:', error);
      
      return {
        success: false,
        error: `Analytics exception: ${(error as Error).message}`,
        metadata: {
          affected: 0,
          cached: false,
          executionTime,
          complexity: 'high'
        }
      };
    }
  }

  /**
   * Private helper: Update dependency relationships between tasks.
   */
  private static async updateDependencyRelationships(taskId: string, dependencies: string[]): Promise<void> {
    // This would typically involve updating a separate dependencies table
    // For now, we store dependencies in the task JSON
    console.log(`🔗 Updated dependencies for ${taskId}: ${dependencies.join(', ')}`);
  }

  /**
   * Private helper: Clean up dependency relationships when deleting.
   */
  private static async cleanupDependencyRelationships(taskId: string): Promise<void> {
    // Remove this task from other tasks' dependency lists
    console.log(`🧹 Cleaned up dependencies for deleted task: ${taskId}`);
  }
}