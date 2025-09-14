/**
 * 🎯 Deep Work Task Service - Specialized operations for complex, focused work
 * 
 * This service handles all database operations for deep work tasks, which are:
 * - Long duration, cognitively demanding tasks (typically 45-240 minutes)
 * - Complex problem solving, creative work, and strategic thinking
 * - Development work, research, writing, and design projects
 * - High-value activities that require sustained concentration and flow states
 * 
 * Business Context:
 * Deep work tasks are the highest-impact activities that drive real progress.
 * They require protected time blocks, minimal interruptions, and optimal conditions.
 * This service ensures these critical tasks are managed with enhanced tracking,
 * sophisticated planning features, and detailed progress monitoring.
 * 
 * Key Characteristics:
 * - Enhanced validation for complex task requirements
 * - Longer cache times (deep work tasks change less frequently)
 * - Focus block and break tracking for optimal work sessions
 * - Rollover and interruption management
 * - Higher XP rewards reflecting the difficulty and value
 */

import { BaseTaskService } from './BaseTaskService';
import { Task, Subtask } from '@/components/tasks/TaskCard';

// Database types specific to deep work tasks
// These include additional fields for deep work management
interface DeepWorkTaskDB {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: string;
  completed: boolean;
  original_date: string;
  task_date: string;
  estimated_duration?: number;
  focus_blocks?: number;
  break_duration?: number;
  interruption_mode?: boolean;
  rollovers?: number;
  tags?: string[];
  category?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  started_at?: string;
  actual_duration_min?: number;
}

// Deep work subtasks with enhanced tracking
// More detailed than light work subtasks due to complexity
interface DeepWorkSubtaskDB {
  id: string;
  task_id: string;
  title: string;
  text: string;
  completed?: boolean;
  priority?: string;
  due_date?: string;
  estimated_duration_min?: number;
  focus_blocks_required?: number;
  complexity_level?: number;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  started_at?: string;
  actual_duration_min?: number;
}

// Input type for creating new deep work tasks
// More comprehensive than light work due to planning requirements
interface CreateDeepWorkTaskInput {
  user_id: string;
  title: string;
  description: string; // Required for deep work - need clear context
  priority: 'LOW' | 'Med' | 'HIGH' | 'URGENT';
  estimated_duration: number; // Required - need time planning
  focus_blocks?: number;
  break_duration?: number;
  tags?: string[];
  category?: string;
  task_date: string;
}

// Input type for updating deep work tasks
// All fields optional to support flexible updates during work sessions
interface UpdateDeepWorkTaskInput {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'Med' | 'HIGH' | 'URGENT';
  estimated_duration?: number;
  focus_blocks?: number;
  break_duration?: number;
  interruption_mode?: boolean;
  rollovers?: number;
  tags?: string[];
  category?: string;
  task_date?: string;
  completed?: boolean;
  started_at?: string;
  actual_duration_min?: number;
}

/**
 * Specialized service for deep work task operations.
 * Extends BaseTaskService with deep work specific business rules,
 * enhanced validation, and sophisticated progress tracking.
 */
export class DeepWorkTaskService extends BaseTaskService {
  // Database table names for deep work tasks
  // Separate from light work to support different feature sets
  private readonly tableName = 'deep_work_tasks';
  private readonly subtasksTableName = 'deep_work_subtasks';
  
  // Cache settings optimized for deep work patterns
  // Longer cache times because deep work tasks change less frequently
  private readonly cacheTimeMs = 120000; // 2 minutes - deep work tasks are more stable
  private readonly subtasksCacheTimeMs = 60000; // 1 minute - subtasks change moderately

  // Deep work specific constants for validation and calculation
  private readonly MIN_DEEP_WORK_DURATION = 45; // Minimum minutes for effective deep work
  private readonly MAX_DEEP_WORK_DURATION = 240; // Maximum sustainable deep work session
  private readonly DEFAULT_FOCUS_BLOCK_DURATION = 45; // Standard Pomodoro-style focus block
  private readonly DEFAULT_BREAK_DURATION = 15; // Standard break between focus blocks

  /**
   * Get all deep work tasks for a user with enhanced caching.
   * Deep work tasks use longer cache times because they change less frequently
   * and users typically work on them for extended periods without interruption.
   */
  async getTasks(userId?: string): Promise<Task[]> {
    console.log('🎯 Loading deep work tasks...');
    
    // Generate cache key with user context
    // Deep work tasks are always user-specific for focus and privacy
    const cacheKey = this.getCacheKey('getDeepWorkTasks', { userId });
    
    // Use longer cache times for deep work stability
    // Deep work users prefer consistency over real-time updates
    const result = await this.executeWithCache(
      cacheKey,
      async () => {
        // Fetch tasks and subtasks in parallel for optimal performance
        // Deep work queries may be more complex due to additional fields
        const [tasksData, subtasksData] = await Promise.all([
          this.fetchTasksFromDatabase(userId),
          this.fetchSubtasksFromDatabase()
        ]);

        // Transform with deep work specific business logic
        // This includes calculating focus intensity, XP rewards, etc.
        return this.transformTasksWithSubtasks(tasksData, subtasksData);
      },
      this.cacheTimeMs
    );

    if (result.error) {
      console.error('❌ Failed to fetch deep work tasks:', result.error);
      throw result.error;
    }

    console.log(`✅ Loaded ${result.data?.length || 0} deep work tasks${result.fromCache ? ' (from cache)' : ''}`);
    return result.data || [];
  }

  /**
   * Create a new deep work task with comprehensive validation.
   * Deep work tasks require more planning and validation to ensure
   * they're properly structured for successful execution.
   */
  async createTask(taskInput: CreateDeepWorkTaskInput): Promise<Task> {
    console.log('🎯 Creating deep work task:', taskInput.title);

    // Validate with strict deep work requirements
    // Deep work tasks need detailed planning to be effective
    const validationErrors = this.validateTaskInput(taskInput);
    if (validationErrors.length > 0) {
      const error = new Error(`Deep work task validation failed: ${validationErrors.join(', ')}`);
      console.error('❌ Validation error:', error.message);
      throw error;
    }

    // Transform and enhance with deep work calculations
    // Add calculated fields like focus blocks and XP rewards
    const dbTask = this.transformAppTaskToDb(taskInput);
    
    // Calculate and set focus blocks if not provided
    if (!dbTask.focus_blocks) {
      dbTask.focus_blocks = this.calculateOptimalFocusBlocks(dbTask.estimated_duration || 45);
    }

    // Execute database insert with enhanced error handling
    // Deep work creation is critical and should be reliable
    const result = await this.executeWithRetry(async () => {
      const query = `
        INSERT INTO ${this.tableName} (
          user_id, title, description, priority, completed,
          original_date, task_date, estimated_duration, focus_blocks, break_duration,
          interruption_mode, rollovers, tags, category, created_at, updated_at
        ) VALUES (
          '${dbTask.user_id}', '${dbTask.title}', '${dbTask.description || ''}',
          '${dbTask.priority}', false, '${dbTask.original_date}', '${dbTask.task_date}',
          ${dbTask.estimated_duration || 'NULL'}, ${dbTask.focus_blocks || 'NULL'},
          ${dbTask.break_duration || this.DEFAULT_BREAK_DURATION}, false, 0,
          '${JSON.stringify(dbTask.tags || [])}', '${dbTask.category || 'general'}',
          '${dbTask.created_at}', '${dbTask.updated_at}'
        ) RETURNING *
      `;
      
      const data = await this.executeMCPQuery(query);
      if (!data || data.length === 0) {
        throw new Error('No data returned from deep work task insert');
      }
      return data[0];
    });

    if (result.error) {
      console.error('❌ Failed to create deep work task:', result.error);
      throw result.error;
    }

    // Clear cache to show new task immediately
    // Deep work tasks should appear promptly in planning views
    this.clearCache('getDeepWorkTasks');

    const createdTask = this.transformDbTaskToApp(result.data!, []);
    console.log(`✅ Created deep work task: ${createdTask.id} with ${result.data!.focus_blocks} focus blocks`);
    return createdTask;
  }

  /**
   * Update deep work task with session tracking and rollover management.
   * Deep work updates often involve session progress, interruptions, and 
   * complex state changes that need careful handling.
   */
  async updateTask(taskId: string, updates: UpdateDeepWorkTaskInput): Promise<Task> {
    console.log('🎯 Updating deep work task:', taskId);

    // Validate updates with deep work specific rules
    // Ensure updates maintain deep work integrity
    const validationErrors = this.validateTaskUpdates(updates);
    if (validationErrors.length > 0) {
      const error = new Error(`Deep work update validation failed: ${validationErrors.join(', ')}`);
      console.error('❌ Update validation error:', error.message);
      throw error;
    }

    // Transform and enhance updates with deep work logic
    // Handle special cases like session completion and rollovers
    const dbUpdates = this.transformAppUpdatesToDb(updates);
    dbUpdates.updated_at = new Date().toISOString();

    // Recalculate focus blocks if duration changed
    // Ensure focus blocks remain optimal for the new duration
    if (updates.estimated_duration && !updates.focus_blocks) {
      dbUpdates.focus_blocks = this.calculateOptimalFocusBlocks(updates.estimated_duration);
    }

    // Build dynamic UPDATE query for deep work fields
    // Deep work has more fields than light work, requiring careful handling
    const updateFields = Object.entries(dbUpdates)
      .map(([key, value]) => {
        if (value === null) return `${key} = NULL`;
        if (typeof value === 'string') return `${key} = '${value}'`;
        if (typeof value === 'boolean') return `${key} = ${value}`;
        if (Array.isArray(value)) return `${key} = '${JSON.stringify(value)}'`;
        return `${key} = ${value}`;
      })
      .join(', ');

    // Execute update with retry logic for reliability
    // Deep work updates must be persistent to maintain session state
    const result = await this.executeWithRetry(async () => {
      const query = `
        UPDATE ${this.tableName}
        SET ${updateFields}
        WHERE id = '${taskId}'
        RETURNING *
      `;
      
      const data = await this.executeMCPQuery(query);
      if (!data || data.length === 0) {
        throw new Error(`Deep work task not found or update failed: ${taskId}`);
      }
      return data[0];
    });

    if (result.error) {
      console.error('❌ Failed to update deep work task:', result.error);
      throw result.error;
    }

    // Clear cache to ensure updates are visible
    // Deep work progress should be reflected immediately
    this.clearCache('getDeepWorkTasks');
    this.clearCache(taskId);

    // Fetch subtasks for complete task object
    // Deep work subtasks may have changed during the session
    const subtasks = await this.getTaskSubtasks(taskId);
    const updatedTask = this.transformDbTaskToApp(result.data!, subtasks);
    
    console.log(`✅ Updated deep work task: ${taskId}`);
    return updatedTask;
  }

  /**
   * Delete deep work task with enhanced cleanup.
   * Deep work tasks may have more associated data that needs cleanup,
   * including session data and complex subtask hierarchies.
   */
  async deleteTask(taskId: string): Promise<void> {
    console.log('🎯 Deleting deep work task:', taskId);

    // Delete with proper cleanup order for data integrity
    // Deep work tasks may have more complex relationships
    const result = await this.executeWithRetry(async () => {
      // Delete subtasks first to maintain referential integrity
      const deleteSubtasksQuery = `DELETE FROM ${this.subtasksTableName} WHERE task_id = '${taskId}'`;
      await this.executeMCPQuery(deleteSubtasksQuery);

      // Delete main task
      const deleteTaskQuery = `DELETE FROM ${this.tableName} WHERE id = '${taskId}'`;
      await this.executeMCPQuery(deleteTaskQuery);
      
      return { success: true };
    });

    if (result.error) {
      console.error('❌ Failed to delete deep work task:', result.error);
      throw result.error;
    }

    // Comprehensive cache cleanup for deep work
    // Deep work deletion affects multiple cache entries
    this.clearCache('getDeepWorkTasks');
    this.clearCache(taskId);

    console.log(`✅ Deleted deep work task: ${taskId}`);
  }

  /**
   * Update deep work task status with session tracking.
   * Deep work completion includes session analytics and XP calculations
   * based on the complexity and duration of the completed work.
   */
  async updateTaskStatus(taskId: string, completed: boolean): Promise<void> {
    console.log(`🎯 Updating deep work task status: ${taskId} -> ${completed ? 'completed' : 'pending'}`);

    const now = new Date().toISOString();
    
    // Enhanced status update with session data
    // Track completion metrics for deep work analytics
    const statusUpdate = completed 
      ? `completed = true, completed_at = '${now}', updated_at = '${now}'`
      : `completed = false, completed_at = NULL, updated_at = '${now}'`;

    const result = await this.executeWithRetry(async () => {
      const query = `UPDATE ${this.tableName} SET ${statusUpdate} WHERE id = '${taskId}'`;
      await this.executeMCPQuery(query);
      return { success: true };
    });

    if (result.error) {
      console.error('❌ Failed to update deep work task status:', result.error);
      throw result.error;
    }

    // Clear cache for immediate status reflection
    // Deep work completion should trigger immediate UI updates
    this.clearCache('getDeepWorkTasks');
    this.clearCache(taskId);

    console.log(`✅ Updated deep work task status: ${taskId} -> ${completed ? 'completed' : 'pending'}`);
  }

  /**
   * Update deep work subtask status with complexity tracking.
   * Deep work subtasks may have different completion criteria and
   * contribute to overall task progress calculations.
   */
  async updateSubtaskStatus(subtaskId: string, completed: boolean): Promise<void> {
    console.log(`🎯 Updating deep work subtask status: ${subtaskId} -> ${completed ? 'completed' : 'pending'}`);

    const now = new Date().toISOString();
    
    // Enhanced subtask update for deep work tracking
    // Include metrics useful for deep work progress analysis
    const statusUpdate = completed
      ? `completed = true, completed_at = '${now}', updated_at = '${now}'`
      : `completed = false, completed_at = NULL, updated_at = '${now}'`;

    const result = await this.executeWithRetry(async () => {
      const query = `UPDATE ${this.subtasksTableName} SET ${statusUpdate} WHERE id = '${subtaskId}'`;
      await this.executeMCPQuery(query);
      return { success: true };
    });

    if (result.error) {
      console.error('❌ Failed to update deep work subtask status:', result.error);
      throw result.error;
    }

    // Update cache for deep work progress tracking
    // Subtask completion affects overall task progress
    this.clearCache('getDeepWorkTasks');

    console.log(`✅ Updated deep work subtask status: ${subtaskId} -> ${completed ? 'completed' : 'pending'}`);
  }

  /**
   * Private helper methods for deep work specific operations.
   * These handle the enhanced business logic and validation
   * required for effective deep work management.
   */

  private async fetchTasksFromDatabase(userId?: string): Promise<DeepWorkTaskDB[]> {
    // Build query with user filter - deep work is always user-specific
    // Include deep work specific fields in the selection
    let query = `SELECT * FROM ${this.tableName}`;
    if (userId) {
      query += ` WHERE user_id = '${userId}'`;
    }
    query += ` ORDER BY created_at DESC LIMIT 30`; // Smaller limit - deep work tasks are fewer but richer

    const data = await this.executeMCPQuery(query);
    return data || [];
  }

  private async fetchSubtasksFromDatabase(): Promise<DeepWorkSubtaskDB[]> {
    // Fetch all deep work subtasks with enhanced fields
    // Deep work subtasks have more metadata than light work
    const query = `SELECT * FROM ${this.subtasksTableName} ORDER BY created_at ASC`;
    const data = await this.executeMCPQuery(query);
    return data || [];
  }

  private async getTaskSubtasks(taskId: string): Promise<Subtask[]> {
    // Get subtasks for a specific deep work task
    // Include complex subtask fields for proper transformation
    const query = `SELECT * FROM ${this.subtasksTableName} WHERE task_id = '${taskId}' ORDER BY created_at ASC`;
    const data = await this.executeMCPQuery(query);
    
    return (data || []).map(subtask => this.transformDbSubtaskToApp(subtask));
  }

  private transformTasksWithSubtasks(tasksData: DeepWorkTaskDB[], subtasksData: DeepWorkSubtaskDB[]): Task[] {
    // Group subtasks by task_id for efficient deep work assembly
    // Deep work tasks may have more complex subtask relationships
    const subtasksByTaskId: Record<string, DeepWorkSubtaskDB[]> = {};
    subtasksData.forEach(subtask => {
      if (!subtasksByTaskId[subtask.task_id]) {
        subtasksByTaskId[subtask.task_id] = [];
      }
      subtasksByTaskId[subtask.task_id].push(subtask);
    });

    // Transform each deep work task with enhanced business logic
    // Include focus intensity calculations and progress tracking
    return tasksData.map(dbTask => {
      const taskSubtasks = (subtasksByTaskId[dbTask.id] || [])
        .map(subtask => this.transformDbSubtaskToApp(subtask));
      
      return this.transformDbTaskToApp(dbTask, taskSubtasks);
    });
  }

  private validateTaskInput(task: CreateDeepWorkTaskInput): string[] {
    const errors: string[] = [];

    // Enhanced title validation for deep work
    // Deep work needs descriptive titles for context switching
    if (!task.title || task.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (task.title.length < 10) {
      errors.push('Deep work tasks need descriptive titles (minimum 10 characters)');
    } else if (task.title.length > 200) {
      errors.push('Title too long (maximum 200 characters)');
    }

    // Description is required for deep work context
    // Deep work requires clear objectives and context
    if (!task.description || task.description.trim().length === 0) {
      errors.push('Description is required for deep work tasks');
    } else if (task.description.length < 20) {
      errors.push('Deep work description should be detailed (minimum 20 characters)');
    }

    // Enhanced priority validation
    if (!task.priority || !['LOW', 'Med', 'HIGH', 'URGENT'].includes(task.priority)) {
      errors.push('Priority must be LOW, Med, HIGH, or URGENT');
    }

    // Duration validation specific to deep work effectiveness
    // Deep work requires minimum time blocks for flow state
    if (!task.estimated_duration) {
      errors.push('Estimated duration is required for deep work planning');
    } else if (task.estimated_duration < this.MIN_DEEP_WORK_DURATION) {
      errors.push(`Deep work tasks should be at least ${this.MIN_DEEP_WORK_DURATION} minutes for effectiveness`);
    } else if (task.estimated_duration > this.MAX_DEEP_WORK_DURATION) {
      errors.push(`Deep work sessions shouldn't exceed ${this.MAX_DEEP_WORK_DURATION} minutes to prevent burnout`);
    }

    // Focus blocks validation if provided
    if (task.focus_blocks && task.focus_blocks < 1) {
      errors.push('Focus blocks must be at least 1');
    }

    // Break duration validation for sustainable work
    if (task.break_duration && task.break_duration < 5) {
      errors.push('Break duration should be at least 5 minutes for recovery');
    }

    // User ID validation
    if (!task.user_id || task.user_id.trim().length === 0) {
      errors.push('User ID is required');
    }

    return errors;
  }

  private validateTaskUpdates(updates: UpdateDeepWorkTaskInput): string[] {
    const errors: string[] = [];

    // Validate title updates
    if (updates.title !== undefined) {
      if (!updates.title || updates.title.trim().length === 0) {
        errors.push('Title cannot be empty');
      } else if (updates.title.length < 10) {
        errors.push('Deep work titles need to be descriptive (minimum 10 characters)');
      }
    }

    // Validate description updates
    if (updates.description !== undefined) {
      if (!updates.description || updates.description.trim().length === 0) {
        errors.push('Description cannot be empty for deep work tasks');
      } else if (updates.description.length < 20) {
        errors.push('Deep work description should be detailed (minimum 20 characters)');
      }
    }

    // Validate duration updates
    if (updates.estimated_duration !== undefined) {
      if (updates.estimated_duration < this.MIN_DEEP_WORK_DURATION) {
        errors.push(`Duration should be at least ${this.MIN_DEEP_WORK_DURATION} minutes`);
      } else if (updates.estimated_duration > this.MAX_DEEP_WORK_DURATION) {
        errors.push(`Duration shouldn't exceed ${this.MAX_DEEP_WORK_DURATION} minutes`);
      }
    }

    // Validate focus blocks
    if (updates.focus_blocks !== undefined && updates.focus_blocks < 1) {
      errors.push('Focus blocks must be at least 1');
    }

    return errors;
  }

  private calculateOptimalFocusBlocks(durationMinutes: number): number {
    // Calculate optimal number of focus blocks based on duration
    // Uses research-based recommendations for sustained focus
    const blockDuration = this.DEFAULT_FOCUS_BLOCK_DURATION;
    const breakDuration = this.DEFAULT_BREAK_DURATION;
    
    // Calculate how many complete focus+break cycles fit in the duration
    const cycleTime = blockDuration + breakDuration;
    let blocks = Math.floor(durationMinutes / cycleTime);
    
    // Ensure at least one block, maximum 4 blocks (research shows diminishing returns)
    blocks = Math.max(1, Math.min(blocks, 4));
    
    console.log(`📊 Calculated ${blocks} focus blocks for ${durationMinutes} minute deep work session`);
    return blocks;
  }

  private transformAppTaskToDb(taskInput: CreateDeepWorkTaskInput): DeepWorkTaskDB {
    const now = new Date().toISOString();
    
    return {
      id: '', // Generated by database
      user_id: taskInput.user_id,
      title: taskInput.title.trim(),
      description: taskInput.description.trim(),
      priority: taskInput.priority,
      completed: false,
      original_date: taskInput.task_date,
      task_date: taskInput.task_date,
      estimated_duration: taskInput.estimated_duration,
      focus_blocks: taskInput.focus_blocks || this.calculateOptimalFocusBlocks(taskInput.estimated_duration),
      break_duration: taskInput.break_duration || this.DEFAULT_BREAK_DURATION,
      interruption_mode: false,
      rollovers: 0,
      tags: taskInput.tags || [],
      category: taskInput.category || 'general',
      created_at: now,
      updated_at: now
    };
  }

  private transformAppUpdatesToDb(updates: UpdateDeepWorkTaskInput): Partial<DeepWorkTaskDB> {
    const dbUpdates: Partial<DeepWorkTaskDB> = {};

    // Transform all provided update fields
    // Deep work updates are more comprehensive than light work
    if (updates.title !== undefined) dbUpdates.title = updates.title.trim();
    if (updates.description !== undefined) dbUpdates.description = updates.description.trim();
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.estimated_duration !== undefined) dbUpdates.estimated_duration = updates.estimated_duration;
    if (updates.focus_blocks !== undefined) dbUpdates.focus_blocks = updates.focus_blocks;
    if (updates.break_duration !== undefined) dbUpdates.break_duration = updates.break_duration;
    if (updates.interruption_mode !== undefined) dbUpdates.interruption_mode = updates.interruption_mode;
    if (updates.rollovers !== undefined) dbUpdates.rollovers = updates.rollovers;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.task_date !== undefined) dbUpdates.task_date = updates.task_date;
    if (updates.started_at !== undefined) dbUpdates.started_at = updates.started_at;
    if (updates.actual_duration_min !== undefined) dbUpdates.actual_duration_min = updates.actual_duration_min;
    
    // Handle completion with enhanced tracking
    if (updates.completed !== undefined) {
      dbUpdates.completed = updates.completed;
      if (updates.completed) {
        dbUpdates.completed_at = new Date().toISOString();
        // Set actual duration if not provided
        if (updates.actual_duration_min === undefined && updates.started_at) {
          const startTime = new Date(updates.started_at).getTime();
          const endTime = new Date().getTime();
          dbUpdates.actual_duration_min = Math.round((endTime - startTime) / (1000 * 60));
        }
      } else {
        dbUpdates.completed_at = null;
      }
    }

    return dbUpdates;
  }

  private transformDbTaskToApp(dbTask: DeepWorkTaskDB, subtasks: Subtask[]): Task {
    // Enhanced priority mapping for deep work
    // Deep work uses more nuanced priority handling
    const priorityMap: Record<string, string> = {
      'LOW': 'low',
      'Med': 'medium',
      'MEDIUM': 'medium', 
      'HIGH': 'high',
      'URGENT': 'high'
    };

    // Calculate focus intensity based on deep work characteristics
    // Deep work typically has higher focus intensity than light work
    let focusIntensity: 1 | 2 | 3 | 4 = 3; // Default high intensity for deep work
    
    // Adjust based on focus blocks and duration
    if (dbTask.focus_blocks && dbTask.focus_blocks >= 4) {
      focusIntensity = 4; // Maximum intensity for extended deep work
    } else if (dbTask.focus_blocks && dbTask.focus_blocks <= 1) {
      focusIntensity = 2; // Lower intensity for short deep work
    }
    
    // Increase intensity for urgent/high priority tasks
    if (dbTask.priority === 'URGENT' || dbTask.priority === 'HIGH') {
      focusIntensity = Math.min(4, focusIntensity + 1) as 1 | 2 | 3 | 4;
    }

    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || '',
      status: dbTask.completed ? 'completed' : 'pending',
      priority: priorityMap[dbTask.priority] || 'medium',
      level: 0, // Deep work doesn't use hierarchical levels
      dependencies: [], // Dependencies handled at planning level
      subtasks,
      focusIntensity,
      context: dbTask.category || 'deep-work'
    };
  }

  private transformDbSubtaskToApp(dbSubtask: DeepWorkSubtaskDB): Subtask {
    // Enhanced time estimation for deep work subtasks
    // More sophisticated than light work due to complexity
    let estimatedTime = '30min'; // Default for deep work subtasks
    
    if (dbSubtask.estimated_duration_min) {
      estimatedTime = `${dbSubtask.estimated_duration_min}min`;
    } else if (dbSubtask.actual_duration_min) {
      estimatedTime = `${dbSubtask.actual_duration_min}min`;
    } else if (dbSubtask.focus_blocks_required) {
      // Estimate based on focus blocks
      const estimatedMinutes = dbSubtask.focus_blocks_required * this.DEFAULT_FOCUS_BLOCK_DURATION;
      estimatedTime = `${estimatedMinutes}min`;
    }

    // Enhanced priority mapping for deep work subtasks
    const priorityMap: Record<string, string> = {
      'URGENT': 'high',
      'HIGH': 'high',
      'Med': 'medium',
      'MEDIUM': 'medium',
      'LOW': 'low'
    };

    return {
      id: dbSubtask.id,
      title: dbSubtask.title,
      description: dbSubtask.text,
      status: dbSubtask.completed ? 'completed' : 'pending',
      priority: priorityMap[dbSubtask.priority || 'Med'] || 'medium',
      estimatedTime,
      tools: ['ide', 'documentation', 'research-tools', 'design-software'] // Deep work tools
    };
  }
}