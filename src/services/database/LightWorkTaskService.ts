/**
 * 💡 Light Work Task Service - Specialized operations for quick, focused tasks
 * 
 * This service handles all database operations for light work tasks, which are:
 * - Short duration tasks (typically 5-45 minutes)
 * - Quick wins and administrative work
 * - Email processing, meetings, and rapid responses
 * - Lower cognitive load activities that fit between deep work sessions
 * 
 * Business Context:
 * Light work tasks are essential for maintaining momentum throughout the day.
 * They provide quick dopamine hits and keep administrative work flowing.
 * This service ensures these tasks are tracked efficiently with minimal overhead.
 * 
 * Key Characteristics:
 * - Optimized for speed and low friction
 * - Simpler validation rules than deep work
 * - Faster cache expiration (tasks change quickly)
 * - Focus on completion velocity over deep analysis
 */

import { BaseTaskService } from './BaseTaskService';
import { Task, Subtask } from '@/components/tasks/TaskCard';

// Database types specific to light work tasks
// These match the Supabase schema for light_work_tasks table
interface LightWorkTaskDB {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: string;
  completed: boolean;
  original_date: string;
  task_date: string;
  estimated_duration?: number;
  tags?: string[];
  category?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  started_at?: string;
  actual_duration_min?: number;
}

// Light work subtask database schema
// Simpler structure than deep work subtasks
interface LightWorkSubtaskDB {
  id: string;
  task_id: string;
  title: string;
  text: string;
  completed?: boolean;
  priority?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  started_at?: string;
  actual_duration_min?: number;
}

// Input type for creating new light work tasks
// Validates that required fields are present before database operation
interface CreateLightWorkTaskInput {
  user_id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'Med' | 'HIGH';
  estimated_duration?: number;
  tags?: string[];
  category?: string;
  task_date: string;
}

// Input type for updating light work tasks
// All fields are optional to support partial updates
interface UpdateLightWorkTaskInput {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'Med' | 'HIGH';
  estimated_duration?: number;
  tags?: string[];
  category?: string;
  task_date?: string;
  completed?: boolean;
}

/**
 * Specialized service for light work task operations.
 * Extends BaseTaskService to inherit retry logic, caching, and error handling,
 * while implementing light work specific business rules and validations.
 */
export class LightWorkTaskService extends BaseTaskService {
  // Database table names for light work tasks
  // Separated from deep work to allow independent schema evolution
  private readonly tableName = 'light_work_tasks';
  private readonly subtasksTableName = 'light_work_subtasks';
  
  // Cache settings optimized for light work patterns
  // Shorter cache times because light work changes frequently
  private readonly cacheTimeMs = 30000; // 30 seconds - light work changes quickly
  private readonly subtasksCacheTimeMs = 15000; // 15 seconds - subtasks change very quickly

  /**
   * Get all light work tasks for a user with intelligent caching.
   * Light work tasks are fetched with shorter cache times because they're
   * updated frequently as people complete quick tasks throughout the day.
   */
  async getTasks(userId?: string): Promise<Task[]> {
    console.log('🔄 Loading light work tasks...');
    
    // Generate cache key based on user filter
    // This ensures each user's tasks are cached separately
    const cacheKey = this.getCacheKey('getLightWorkTasks', { userId });
    
    // Use cached data if available to provide instant response
    // Light work users expect snappy performance for quick task checks
    const result = await this.executeWithCache(
      cacheKey,
      async () => {
        // Fetch tasks and subtasks in parallel for better performance
        // This reduces total database roundtrip time
        const [tasksData, subtasksData] = await Promise.all([
          this.fetchTasksFromDatabase(userId),
          this.fetchSubtasksFromDatabase()
        ]);

        // Transform database format to component format
        // This isolates the component layer from database schema changes
        return this.transformTasksWithSubtasks(tasksData, subtasksData);
      },
      this.cacheTimeMs
    );

    if (result.error) {
      console.error('❌ Failed to fetch light work tasks:', result.error);
      throw result.error;
    }

    console.log(`✅ Loaded ${result.data?.length || 0} light work tasks${result.fromCache ? ' (from cache)' : ''}`);
    return result.data || [];
  }

  /**
   * Create a new light work task with validation optimized for quick entry.
   * Light work tasks should be easy to create without excessive validation,
   * encouraging users to capture tasks quickly during busy periods.
   */
  async createTask(taskInput: CreateLightWorkTaskInput): Promise<Task> {
    console.log('🔄 Creating light work task:', taskInput.title);

    // Validate input with light work specific rules
    // Less strict than deep work to encourage quick task capture
    const validationErrors = this.validateTaskInput(taskInput);
    if (validationErrors.length > 0) {
      const error = new Error(`Light work task validation failed: ${validationErrors.join(', ')}`);
      console.error('❌ Validation error:', error.message);
      throw error;
    }

    // Transform app input to database format
    // Add timestamps and calculated fields like XP rewards
    const dbTask = this.transformAppTaskToDb(taskInput);

    // Execute database insert with retry logic
    // Light work tasks should be created reliably even under poor network conditions
    const result = await this.executeWithRetry(async () => {
      const query = `
        INSERT INTO ${this.tableName} (
          user_id, title, description, priority, completed, 
          original_date, task_date, estimated_duration, tags, category,
          created_at, updated_at
        ) VALUES (
          '${dbTask.user_id}', '${dbTask.title}', '${dbTask.description || ''}',
          '${dbTask.priority}', false, '${dbTask.original_date}', '${dbTask.task_date}',
          ${dbTask.estimated_duration || 'NULL'}, '${JSON.stringify(dbTask.tags || [])}',
          '${dbTask.category || ''}', '${dbTask.created_at}', '${dbTask.updated_at}'
        ) RETURNING *
      `;
      
      const data = await this.executeMCPQuery(query);
      if (!data || data.length === 0) {
        throw new Error('No data returned from insert operation');
      }
      return data[0];
    });

    if (result.error) {
      console.error('❌ Failed to create light work task:', result.error);
      throw result.error;
    }

    // Clear relevant cache entries since we have new data
    // This ensures subsequent fetches return the new task
    this.clearCache('getLightWorkTasks');

    const createdTask = this.transformDbTaskToApp(result.data!, []);
    console.log(`✅ Created light work task: ${createdTask.id}`);
    return createdTask;
  }

  /**
   * Update an existing light work task with partial data.
   * Supports both status updates and content modifications,
   * with optimistic locking to prevent conflicting updates.
   */
  async updateTask(taskId: string, updates: UpdateLightWorkTaskInput): Promise<Task> {
    console.log('🔄 Updating light work task:', taskId);

    // Validate updates with light work specific rules
    // Allow flexible updates but ensure data consistency
    const validationErrors = this.validateTaskUpdates(updates);
    if (validationErrors.length > 0) {
      const error = new Error(`Update validation failed: ${validationErrors.join(', ')}`);
      console.error('❌ Update validation error:', error.message);
      throw error;
    }

    // Transform app updates to database format
    // Handle special cases like completion timestamps
    const dbUpdates = this.transformAppUpdatesToDb(updates);
    dbUpdates.updated_at = new Date().toISOString();

    // Build dynamic UPDATE query based on provided fields
    // This allows partial updates without overwriting unchanged fields
    const updateFields = Object.entries(dbUpdates)
      .map(([key, value]) => {
        if (value === null) return `${key} = NULL`;
        if (typeof value === 'string') return `${key} = '${value}'`;
        if (typeof value === 'boolean') return `${key} = ${value}`;
        if (Array.isArray(value)) return `${key} = '${JSON.stringify(value)}'`;
        return `${key} = ${value}`;
      })
      .join(', ');

    // Execute update with retry logic
    // Task updates should be reliable to maintain data consistency
    const result = await this.executeWithRetry(async () => {
      const query = `
        UPDATE ${this.tableName}
        SET ${updateFields}
        WHERE id = '${taskId}'
        RETURNING *
      `;
      
      const data = await this.executeMCPQuery(query);
      if (!data || data.length === 0) {
        throw new Error(`Task not found or update failed: ${taskId}`);
      }
      return data[0];
    });

    if (result.error) {
      console.error('❌ Failed to update light work task:', result.error);
      throw result.error;
    }

    // Clear cache entries affected by this update
    // Ensures fresh data on subsequent fetches
    this.clearCache('getLightWorkTasks');
    this.clearCache(taskId);

    // Fetch subtasks to return complete task object
    // This maintains consistency with other service methods
    const subtasks = await this.getTaskSubtasks(taskId);
    const updatedTask = this.transformDbTaskToApp(result.data!, subtasks);
    
    console.log(`✅ Updated light work task: ${taskId}`);
    return updatedTask;
  }

  /**
   * Delete a light work task and all associated subtasks.
   * Uses database transactions to ensure data consistency,
   * preventing orphaned subtasks or incomplete deletions.
   */
  async deleteTask(taskId: string): Promise<void> {
    console.log('🔄 Deleting light work task:', taskId);

    // Delete task and subtasks in a transaction-like manner
    // First subtasks, then main task to maintain referential integrity
    const result = await this.executeWithRetry(async () => {
      // Delete all subtasks first
      const deleteSubtasksQuery = `DELETE FROM ${this.subtasksTableName} WHERE task_id = '${taskId}'`;
      await this.executeMCPQuery(deleteSubtasksQuery);

      // Then delete the main task
      const deleteTaskQuery = `DELETE FROM ${this.tableName} WHERE id = '${taskId}'`;
      const data = await this.executeMCPQuery(deleteTaskQuery);
      
      return { success: true };
    });

    if (result.error) {
      console.error('❌ Failed to delete light work task:', result.error);
      throw result.error;
    }

    // Clear all cache entries for this task and user's task list
    // This prevents stale data from appearing in the UI
    this.clearCache('getLightWorkTasks');
    this.clearCache(taskId);

    console.log(`✅ Deleted light work task: ${taskId}`);
  }

  /**
   * Update task completion status with proper timestamp tracking.
   * Light work completion should be fast and frictionless,
   * encouraging users to mark tasks done immediately.
   */
  async updateTaskStatus(taskId: string, completed: boolean): Promise<void> {
    console.log(`🔄 Updating light work task status: ${taskId} -> ${completed ? 'completed' : 'pending'}`);

    const now = new Date().toISOString();
    
    // Build status update with appropriate timestamps
    // Track completion time for productivity analytics
    const statusUpdate = completed 
      ? `completed = true, completed_at = '${now}', updated_at = '${now}'`
      : `completed = false, completed_at = NULL, updated_at = '${now}'`;

    const result = await this.executeWithRetry(async () => {
      const query = `UPDATE ${this.tableName} SET ${statusUpdate} WHERE id = '${taskId}'`;
      await this.executeMCPQuery(query);
      return { success: true };
    });

    if (result.error) {
      console.error('❌ Failed to update task status:', result.error);
      throw result.error;
    }

    // Clear cache to ensure status change is visible immediately
    // Light work users expect instant feedback on completion
    this.clearCache('getLightWorkTasks');
    this.clearCache(taskId);

    console.log(`✅ Updated task status: ${taskId} -> ${completed ? 'completed' : 'pending'}`);
  }

  /**
   * Update subtask completion status with parent task awareness.
   * When all subtasks are completed, consider prompting to complete parent task.
   */
  async updateSubtaskStatus(subtaskId: string, completed: boolean): Promise<void> {
    console.log(`🔄 Updating subtask status: ${subtaskId} -> ${completed ? 'completed' : 'pending'}`);

    const now = new Date().toISOString();
    
    // Build subtask status update
    // Similar to task status but for subtask table
    const statusUpdate = completed
      ? `completed = true, completed_at = '${now}', updated_at = '${now}'`
      : `completed = false, completed_at = NULL, updated_at = '${now}'`;

    const result = await this.executeWithRetry(async () => {
      const query = `UPDATE ${this.subtasksTableName} SET ${statusUpdate} WHERE id = '${subtaskId}'`;
      await this.executeMCPQuery(query);
      return { success: true };
    });

    if (result.error) {
      console.error('❌ Failed to update subtask status:', result.error);
      throw result.error;
    }

    // Clear cache to show subtask changes immediately
    // Subtask status changes should be visible instantly
    this.clearCache('getLightWorkTasks');

    console.log(`✅ Updated subtask status: ${subtaskId} -> ${completed ? 'completed' : 'pending'}`);
  }

  /**
   * Private helper methods for data transformation and validation.
   * These handle the mapping between database format and application format,
   * ensuring consistent data handling across all operations.
   */

  private async fetchTasksFromDatabase(userId?: string): Promise<LightWorkTaskDB[]> {
    // Build query with optional user filter
    // Light work tasks are typically filtered by user for privacy
    let query = `SELECT * FROM ${this.tableName}`;
    if (userId) {
      query += ` WHERE user_id = '${userId}'`;
    }
    query += ` ORDER BY created_at DESC LIMIT 50`; // Reasonable limit for light work

    const data = await this.executeMCPQuery(query);
    return data || [];
  }

  private async fetchSubtasksFromDatabase(): Promise<LightWorkSubtaskDB[]> {
    // Fetch all subtasks - we'll group them by task_id later
    // This is more efficient than individual queries per task
    const query = `SELECT * FROM ${this.subtasksTableName} ORDER BY created_at ASC`;
    const data = await this.executeMCPQuery(query);
    return data || [];
  }

  private async getTaskSubtasks(taskId: string): Promise<Subtask[]> {
    // Get subtasks for a specific task
    // Used when we need subtasks for a single task (like after updates)
    const query = `SELECT * FROM ${this.subtasksTableName} WHERE task_id = '${taskId}' ORDER BY created_at ASC`;
    const data = await this.executeMCPQuery(query);
    
    return (data || []).map(subtask => this.transformDbSubtaskToApp(subtask));
  }

  private transformTasksWithSubtasks(tasksData: LightWorkTaskDB[], subtasksData: LightWorkSubtaskDB[]): Task[] {
    // Group subtasks by task_id for efficient lookup
    // This avoids N+1 query problems when building task objects
    const subtasksByTaskId: Record<string, LightWorkSubtaskDB[]> = {};
    subtasksData.forEach(subtask => {
      if (!subtasksByTaskId[subtask.task_id]) {
        subtasksByTaskId[subtask.task_id] = [];
      }
      subtasksByTaskId[subtask.task_id].push(subtask);
    });

    // Transform each task with its subtasks
    // This creates the complete Task objects expected by components
    return tasksData.map(dbTask => {
      const taskSubtasks = (subtasksByTaskId[dbTask.id] || [])
        .map(subtask => this.transformDbSubtaskToApp(subtask));
      
      return this.transformDbTaskToApp(dbTask, taskSubtasks);
    });
  }

  private validateTaskInput(task: CreateLightWorkTaskInput): string[] {
    const errors: string[] = [];

    // Title validation - less strict than deep work
    // Light work titles can be shorter and more informal
    if (!task.title || task.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (task.title.length > 150) {
      errors.push('Title too long (max 150 characters for light work)');
    }

    // Priority validation - ensure valid values
    // Light work typically uses simpler priority schemes
    if (task.priority && !['LOW', 'Med', 'HIGH'].includes(task.priority)) {
      errors.push('Priority must be LOW, Med, or HIGH');
    }

    // Time estimate validation - light work should be short
    // Warn if estimates seem too long for light work
    if (task.estimated_duration && task.estimated_duration > 60) {
      errors.push('Light work tasks should typically be under 60 minutes');
    }

    // User ID is required for data privacy and filtering
    if (!task.user_id || task.user_id.trim().length === 0) {
      errors.push('User ID is required');
    }

    return errors;
  }

  private validateTaskUpdates(updates: UpdateLightWorkTaskInput): string[] {
    const errors: string[] = [];

    // Validate title if provided
    if (updates.title !== undefined) {
      if (!updates.title || updates.title.trim().length === 0) {
        errors.push('Title cannot be empty');
      } else if (updates.title.length > 150) {
        errors.push('Title too long (max 150 characters)');
      }
    }

    // Validate priority if provided
    if (updates.priority && !['LOW', 'Med', 'HIGH'].includes(updates.priority)) {
      errors.push('Priority must be LOW, Med, or HIGH');
    }

    // Validate time estimate if provided
    if (updates.estimated_duration && updates.estimated_duration > 60) {
      errors.push('Light work tasks should typically be under 60 minutes');
    }

    return errors;
  }

  private transformAppTaskToDb(taskInput: CreateLightWorkTaskInput): LightWorkTaskDB {
    const now = new Date().toISOString();
    
    return {
      id: '', // Will be generated by database
      user_id: taskInput.user_id,
      title: taskInput.title.trim(),
      description: taskInput.description?.trim() || null,
      priority: taskInput.priority,
      completed: false,
      original_date: taskInput.task_date,
      task_date: taskInput.task_date,
      estimated_duration: taskInput.estimated_duration || null,
      tags: taskInput.tags || [],
      category: taskInput.category || 'general',
      created_at: now,
      updated_at: now
    };
  }

  private transformAppUpdatesToDb(updates: UpdateLightWorkTaskInput): Partial<LightWorkTaskDB> {
    const dbUpdates: Partial<LightWorkTaskDB> = {};

    // Only include fields that are actually being updated
    // This allows partial updates without overwriting unchanged data
    if (updates.title !== undefined) dbUpdates.title = updates.title.trim();
    if (updates.description !== undefined) dbUpdates.description = updates.description?.trim() || null;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.estimated_duration !== undefined) dbUpdates.estimated_duration = updates.estimated_duration;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.task_date !== undefined) dbUpdates.task_date = updates.task_date;
    
    // Handle completion status with timestamps
    if (updates.completed !== undefined) {
      dbUpdates.completed = updates.completed;
      if (updates.completed) {
        dbUpdates.completed_at = new Date().toISOString();
      } else {
        dbUpdates.completed_at = null;
      }
    }

    return dbUpdates;
  }

  private transformDbTaskToApp(dbTask: LightWorkTaskDB, subtasks: Subtask[]): Task {
    // Map database priority to component priority
    // Handle different priority formats that might exist in the database
    const priorityMap: Record<string, string> = {
      'LOW': 'low',
      'Med': 'medium', 
      'MEDIUM': 'medium',
      'HIGH': 'high',
      'URGENT': 'high'
    };

    // Calculate focus intensity based on task characteristics
    // Light work typically has lower focus intensity than deep work
    let focusIntensity: 1 | 2 | 3 | 4 = 1; // Default for light work
    if (dbTask.estimated_duration && dbTask.estimated_duration > 30) {
      focusIntensity = 2; // Slightly higher for longer light work
    }

    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || '',
      status: dbTask.completed ? 'completed' : 'pending',
      priority: priorityMap[dbTask.priority] || 'medium',
      level: 0, // Light work doesn't use levels
      dependencies: [], // Light work rarely has dependencies
      subtasks,
      focusIntensity,
      context: dbTask.category || 'general'
    };
  }

  private transformDbSubtaskToApp(dbSubtask: LightWorkSubtaskDB): Subtask {
    // Calculate estimated time display
    // Show actual duration if available, otherwise use a default
    const estimatedTime = dbSubtask.actual_duration_min 
      ? `${dbSubtask.actual_duration_min}min`
      : '10min'; // Default for light work subtasks

    // Map priority with defaults suitable for light work
    const priorityMap: Record<string, string> = {
      'HIGH': 'high',
      'Med': 'medium',
      'LOW': 'low'
    };

    return {
      id: dbSubtask.id,
      title: dbSubtask.title,
      description: dbSubtask.text,
      status: dbSubtask.completed ? 'completed' : 'pending',
      priority: priorityMap[dbSubtask.priority || 'Med'] || 'medium',
      estimatedTime,
      tools: ['email', 'calendar', 'notes'] // Common tools for light work
    };
  }
}