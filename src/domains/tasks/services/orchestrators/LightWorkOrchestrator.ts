/**
 * 🎼 Light Work Orchestrator - Thin coordination layer for light work operations
 * 
 * This orchestrator coordinates between validation, database operations, caching,
 * transformation, and error handling for light work tasks. It provides a clean
 * interface while delegating specific responsibilities to focused modules.
 * 
 * Business Context:
 * Light work orchestration focuses on:
 * - Fast response times for quick administrative tasks
 * - Efficient caching for frequently accessed data
 * - Simple validation for low-complexity operations
 * - Minimal overhead for high-frequency operations
 * 
 * Coordination Responsibilities:
 * - Route operations to appropriate specialized modules
 * - Coordinate cache invalidation with database updates
 * - Transform data between different contexts
 * - Handle errors with appropriate recovery strategies
 * - Monitor performance for optimization opportunities
 */

import { Task } from '@/components/tasks/TaskCard';
import { LightWorkValidator } from '../validation/LightWorkValidator';
import { LightWorkDatabaseOperations } from '../database/LightWorkDatabaseOperations';
import { TaskCacheManager } from '../cache/TaskCacheManager';
import { TaskDataTransformer } from '../transformation/TaskDataTransformer';
import { TaskErrorHandler } from '../error/TaskErrorHandler';

// Operation result interface
interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    cached: boolean;
    executionTime: number;
    source: 'cache' | 'database';
    validationTime?: number;
    transformationTime?: number;
  };
}

// Light work specific configuration
const LIGHT_WORK_CONFIG = {
  TASK_TYPE: 'light-work' as const,
  CACHE_NAMESPACE: 'lw',
  MAX_RETRY_ATTEMPTS: 2,
  OPERATION_TIMEOUT: 5000,
  BATCH_SIZE: 50
} as const;

/**
 * Light Work Orchestrator - Lightweight coordination for quick tasks.
 * 
 * This orchestrator implements a thin coordination layer that delegates
 * to specialized modules while maintaining high performance for light work
 * operations. It emphasizes speed and simplicity over complex business logic.
 */
export class LightWorkOrchestrator {
  private cacheManager: TaskCacheManager;

  constructor() {
    this.cacheManager = TaskCacheManager.getInstance();
  }

  /**
   * Get all light work tasks with intelligent caching.
   */
  async getTasks(filters?: any): Promise<OperationResult<Task[]>> {
    const startTime = Date.now();
    const context = {
      operation: 'getTasks',
      taskType: LIGHT_WORK_CONFIG.TASK_TYPE,
      timestamp: new Date()
    };

    try {
      // Try cache first for light work (optimized for speed)
      const cacheResult = this.cacheManager.getCachedTaskList(LIGHT_WORK_CONFIG.TASK_TYPE, filters);

      if (cacheResult.hit && cacheResult.data) {
        return {
          success: true,
          data: cacheResult.data,
          metadata: {
            cached: true,
            executionTime: Date.now() - startTime,
            source: 'cache'
          }
        };
      }

      // Cache miss - fetch from database
      const dbResult = await LightWorkDatabaseOperations.getAllTasks({
        filters,
        orderBy: 'updated_at',
        orderDirection: 'desc'
      });

      if (!dbResult.success) {
        const errorResult = TaskErrorHandler.handleDatabaseError(
          new Error(dbResult.error || 'Database query failed'),
          context
        );
        
        return {
          success: false,
          error: errorResult.userMessage,
          metadata: {
            cached: false,
            executionTime: Date.now() - startTime,
            source: 'database'
          }
        };
      }

      // Transform database results to UI format
      const transformStart = Date.now();
      const transformResult = TaskDataTransformer.transformDatabaseRowsToTasks(
        dbResult.data || [],
        { 
          contextFormat: 'ui',
          includeSubtasks: true,
          includeMetadata: true
        }
      );

      if (!transformResult.success) {
        return {
          success: false,
          error: 'Data transformation failed',
          metadata: {
            cached: false,
            executionTime: Date.now() - startTime,
            source: 'database',
            transformationTime: Date.now() - transformStart
          }
        };
      }

      const tasks = transformResult.data || [];

      // Cache the results for future requests
      this.cacheManager.cacheTaskList(tasks, LIGHT_WORK_CONFIG.TASK_TYPE, filters);

      return {
        success: true,
        data: tasks,
        metadata: {
          cached: false,
          executionTime: Date.now() - startTime,
          source: 'database',
          transformationTime: Date.now() - transformStart
        }
      };

    } catch (error) {
      const errorResult = TaskErrorHandler.handleError(error, context);
      
      return {
        success: false,
        error: errorResult.userMessage,
        metadata: {
          cached: false,
          executionTime: Date.now() - startTime,
          source: 'database'
        }
      };
    }
  }

  /**
   * Create a new light work task with validation and caching.
   */
  async createTask(taskData: any): Promise<OperationResult<Task>> {
    const startTime = Date.now();
    const context = {
      operation: 'createTask',
      taskType: LIGHT_WORK_CONFIG.TASK_TYPE,
      timestamp: new Date(),
      additionalData: { title: taskData.title }
    };

    try {
      // Validate input data
      const validationStart = Date.now();
      const validationResult = LightWorkValidator.validateCreateInput(taskData);
      const validationTime = Date.now() - validationStart;

      if (!validationResult.isValid) {
        const errorResult = TaskErrorHandler.handleValidationError(
          validationResult.errors,
          context
        );
        
        return {
          success: false,
          error: errorResult.userMessage,
          metadata: {
            cached: false,
            executionTime: Date.now() - startTime,
            source: 'database',
            validationTime
          }
        };
      }

      // Transform input data to database format
      const transformStart = Date.now();
      const transformResult = TaskDataTransformer.transformTaskToDatabaseRow(
        { ...taskData, id: `lw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` },
        { contextFormat: 'storage' }
      );

      if (!transformResult.success) {
        return {
          success: false,
          error: 'Data preparation failed',
          metadata: {
            cached: false,
            executionTime: Date.now() - startTime,
            source: 'database',
            validationTime,
            transformationTime: Date.now() - transformStart
          }
        };
      }

      // Create task in database
      const dbResult = await LightWorkDatabaseOperations.createTask(transformResult.data!);

      if (!dbResult.success) {
        const errorResult = TaskErrorHandler.handleDatabaseError(
          new Error(dbResult.error || 'Task creation failed'),
          context
        );
        
        return {
          success: false,
          error: errorResult.userMessage,
          metadata: {
            cached: false,
            executionTime: Date.now() - startTime,
            source: 'database',
            validationTime,
            transformationTime: Date.now() - transformStart
          }
        };
      }

      const createdTask = dbResult.data!;

      // Cache the new task
      this.cacheManager.cacheTask(createdTask, LIGHT_WORK_CONFIG.TASK_TYPE);

      // Invalidate task list caches
      this.cacheManager.invalidateTaskLists(LIGHT_WORK_CONFIG.CACHE_NAMESPACE);


      return {
        success: true,
        data: createdTask,
        metadata: {
          cached: false,
          executionTime: Date.now() - startTime,
          source: 'database',
          validationTime,
          transformationTime: Date.now() - transformStart
        }
      };

    } catch (error) {
      const errorResult = TaskErrorHandler.handleError(error, context);
      
      return {
        success: false,
        error: errorResult.userMessage,
        metadata: {
          cached: false,
          executionTime: Date.now() - startTime,
          source: 'database'
        }
      };
    }
  }

  /**
   * Update a light work task with optimistic caching.
   */
  async updateTask(taskId: string, updates: any): Promise<OperationResult<Task>> {
    const startTime = Date.now();
    const context = {
      operation: 'updateTask',
      taskType: LIGHT_WORK_CONFIG.TASK_TYPE,
      taskId,
      timestamp: new Date()
    };

    try {
      // Validate update data
      const validationStart = Date.now();
      const validationResult = LightWorkValidator.validateUpdateInput(updates);
      const validationTime = Date.now() - validationStart;

      if (!validationResult.isValid) {
        const errorResult = TaskErrorHandler.handleValidationError(
          validationResult.errors,
          context
        );
        
        return {
          success: false,
          error: errorResult.userMessage,
          metadata: {
            cached: false,
            executionTime: Date.now() - startTime,
            source: 'database',
            validationTime
          }
        };
      }

      // Update task in database
      const dbResult = await LightWorkDatabaseOperations.updateTask(taskId, updates);

      if (!dbResult.success) {
        const errorResult = TaskErrorHandler.handleDatabaseError(
          new Error(dbResult.error || 'Task update failed'),
          context
        );
        
        return {
          success: false,
          error: errorResult.userMessage,
          metadata: {
            cached: false,
            executionTime: Date.now() - startTime,
            source: 'database',
            validationTime
          }
        };
      }

      const updatedTask = dbResult.data!;

      // Update cache
      this.cacheManager.cacheTask(updatedTask, LIGHT_WORK_CONFIG.TASK_TYPE);

      // Invalidate related caches
      this.cacheManager.invalidateTask(taskId, LIGHT_WORK_CONFIG.TASK_TYPE);


      return {
        success: true,
        data: updatedTask,
        metadata: {
          cached: false,
          executionTime: Date.now() - startTime,
          source: 'database',
          validationTime
        }
      };

    } catch (error) {
      const errorResult = TaskErrorHandler.handleError(error, context);
      
      return {
        success: false,
        error: errorResult.userMessage,
        metadata: {
          cached: false,
          executionTime: Date.now() - startTime,
          source: 'database'
        }
      };
    }
  }

  /**
   * Update task status with fast response optimization.
   */
  async updateTaskStatus(taskId: string, completed: boolean): Promise<OperationResult<void>> {
    const startTime = Date.now();
    const context = {
      operation: 'updateTaskStatus',
      taskType: LIGHT_WORK_CONFIG.TASK_TYPE,
      taskId,
      timestamp: new Date(),
      additionalData: { completed }
    };

    try {
      // Fast status update for light work
      const dbResult = await LightWorkDatabaseOperations.updateTaskStatus(taskId, completed);

      if (!dbResult.success) {
        const errorResult = TaskErrorHandler.handleDatabaseError(
          new Error(dbResult.error || 'Status update failed'),
          context
        );
        
        return {
          success: false,
          error: errorResult.userMessage,
          metadata: {
            cached: false,
            executionTime: Date.now() - startTime,
            source: 'database'
          }
        };
      }

      // Invalidate caches for updated task
      this.cacheManager.invalidateTask(taskId, LIGHT_WORK_CONFIG.TASK_TYPE);


      return {
        success: true,
        metadata: {
          cached: false,
          executionTime: Date.now() - startTime,
          source: 'database'
        }
      };

    } catch (error) {
      const errorResult = TaskErrorHandler.handleError(error, context);
      
      return {
        success: false,
        error: errorResult.userMessage,
        metadata: {
          cached: false,
          executionTime: Date.now() - startTime,
          source: 'database'
        }
      };
    }
  }

  /**
   * Update subtask status with light work optimization.
   */
  async updateSubtaskStatus(subtaskId: string, completed: boolean): Promise<OperationResult<void>> {
    const startTime = Date.now();
    const context = {
      operation: 'updateSubtaskStatus',
      taskType: LIGHT_WORK_CONFIG.TASK_TYPE,
      timestamp: new Date(),
      additionalData: { subtaskId, completed }
    };

    try {
      const dbResult = await LightWorkDatabaseOperations.updateSubtaskStatus(subtaskId, completed);

      if (!dbResult.success) {
        const errorResult = TaskErrorHandler.handleDatabaseError(
          new Error(dbResult.error || 'Subtask update failed'),
          context
        );
        
        return {
          success: false,
          error: errorResult.userMessage,
          metadata: {
            cached: false,
            executionTime: Date.now() - startTime,
            source: 'database'
          }
        };
      }

      // Invalidate related caches (light work subtasks affect parent task)
      this.cacheManager.invalidateTaskLists(LIGHT_WORK_CONFIG.CACHE_NAMESPACE);


      return {
        success: true,
        metadata: {
          cached: false,
          executionTime: Date.now() - startTime,
          source: 'database'
        }
      };

    } catch (error) {
      const errorResult = TaskErrorHandler.handleError(error, context);
      
      return {
        success: false,
        error: errorResult.userMessage,
        metadata: {
          cached: false,
          executionTime: Date.now() - startTime,
          source: 'database'
        }
      };
    }
  }

  /**
   * Delete a light work task with cleanup.
   */
  async deleteTask(taskId: string): Promise<OperationResult<void>> {
    const startTime = Date.now();
    const context = {
      operation: 'deleteTask',
      taskType: LIGHT_WORK_CONFIG.TASK_TYPE,
      taskId,
      timestamp: new Date()
    };

    try {
      const dbResult = await LightWorkDatabaseOperations.deleteTask(taskId);

      if (!dbResult.success) {
        const errorResult = TaskErrorHandler.handleDatabaseError(
          new Error(dbResult.error || 'Task deletion failed'),
          context
        );
        
        return {
          success: false,
          error: errorResult.userMessage,
          metadata: {
            cached: false,
            executionTime: Date.now() - startTime,
            source: 'database'
          }
        };
      }

      // Clean up caches
      this.cacheManager.invalidateTask(taskId, LIGHT_WORK_CONFIG.TASK_TYPE);


      return {
        success: true,
        metadata: {
          cached: false,
          executionTime: Date.now() - startTime,
          source: 'database'
        }
      };

    } catch (error) {
      const errorResult = TaskErrorHandler.handleError(error, context);
      
      return {
        success: false,
        error: errorResult.userMessage,
        metadata: {
          cached: false,
          executionTime: Date.now() - startTime,
          source: 'database'
        }
      };
    }
  }

  /**
   * Get light work statistics with caching.
   */
  async getStatistics(): Promise<OperationResult<any>> {
    const startTime = Date.now();
    const context = {
      operation: 'getStatistics',
      taskType: LIGHT_WORK_CONFIG.TASK_TYPE,
      timestamp: new Date()
    };

    try {
      // Check cache first
      const cacheResult = this.cacheManager.getCachedStatistics(LIGHT_WORK_CONFIG.TASK_TYPE);
      
      if (cacheResult.hit && cacheResult.data) {
        return {
          success: true,
          data: cacheResult.data,
          metadata: {
            cached: true,
            executionTime: Date.now() - startTime,
            source: 'cache'
          }
        };
      }

      // Generate statistics from database
      const dbResult = await LightWorkDatabaseOperations.getTaskStatistics();

      if (!dbResult.success) {
        const errorResult = TaskErrorHandler.handleDatabaseError(
          new Error(dbResult.error || 'Statistics query failed'),
          context
        );
        
        return {
          success: false,
          error: errorResult.userMessage,
          metadata: {
            cached: false,
            executionTime: Date.now() - startTime,
            source: 'database'
          }
        };
      }

      const stats = dbResult.data!;

      // Cache the statistics
      this.cacheManager.cacheStatistics(stats, LIGHT_WORK_CONFIG.TASK_TYPE);

      return {
        success: true,
        data: stats,
        metadata: {
          cached: false,
          executionTime: Date.now() - startTime,
          source: 'database'
        }
      };

    } catch (error) {
      const errorResult = TaskErrorHandler.handleError(error, context);
      
      return {
        success: false,
        error: errorResult.userMessage,
        metadata: {
          cached: false,
          executionTime: Date.now() - startTime,
          source: 'database'
        }
      };
    }
  }
}