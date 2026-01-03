/**
 * 🗄️ SUPABASE OPERATIONS TEMPLATE
 * 
 * Comprehensive template for all Supabase database operations
 * Ensures consistent snake_case to camelCase mapping across all workflows
 * 
 * CRITICAL: Database uses snake_case, TypeScript interfaces use camelCase
 * This template prevents the database column errors we experienced
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * STANDARD DATABASE COLUMN MAPPINGS
 * 
 * Use these mappings for ALL Supabase operations to ensure consistency
 */
export const STANDARD_COLUMN_MAPPINGS = {
  // Timestamp columns (ALL tables use these)
  createdAt: 'created_at',
  updatedAt: 'updated_at', 
  completedAt: 'completed_at',
  startedAt: 'started_at',
  
  // Date columns
  dueDate: 'due_date',
  taskDate: 'task_date',
  originalDate: 'original_date',
  
  // Task-specific columns
  userId: 'user_id',
  taskId: 'task_id',
  workType: 'work_type', // Critical: was causing errors with task_type
  focusBlocks: 'focus_blocks', // Critical: was causing task creation errors
  breakDuration: 'break_duration', // Critical: was causing task creation errors
  estimatedDuration: 'estimated_duration',
  actualDurationMin: 'actual_duration_min',
  requiresFocus: 'requires_focus',
  complexityLevel: 'complexity_level',
  timeEstimate: 'time_estimate',
  aiAnalyzed: 'ai_analyzed',
  aiReasoning: 'ai_reasoning',
  analyzedAt: 'analyzed_at',
  xpReward: 'xp_reward',
  contextualBonus: 'contextual_bonus',
  learningValue: 'learning_value',
  priorityRank: 'priority_rank',
  strategicImportance: 'strategic_importance',
  timeAccuracy: 'time_accuracy',
  interruptionMode: 'interruption_mode'
} as const;

/**
 * COLUMN MAPPING UTILITIES
 * 
 * Helper functions to transform data between database and interface formats
 */
export class ColumnMapper {
  /**
   * Convert camelCase interface keys to snake_case database columns
   */
  static toDatabaseFormat(data: Record<string, any>): Record<string, any> {
    const mapped: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      const dbColumn = STANDARD_COLUMN_MAPPINGS[key as keyof typeof STANDARD_COLUMN_MAPPINGS];
      mapped[dbColumn || key] = value;
    }
    
    return mapped;
  }
  
  /**
   * Convert snake_case database columns to camelCase interface keys
   */
  static toInterfaceFormat(data: Record<string, any>): Record<string, any> {
    const mapped: Record<string, any> = {};
    const reverseMap = Object.fromEntries(
      Object.entries(STANDARD_COLUMN_MAPPINGS).map(([k, v]) => [v, k])
    );
    
    for (const [key, value] of Object.entries(data)) {
      const interfaceKey = reverseMap[key] || key;
      mapped[interfaceKey] = value;
    }
    
    return mapped;
  }
}

/**
 * SAFE DATABASE OPERATIONS
 * 
 * Template class with error handling and proper column mapping
 */
export class SafeSupabaseOperations<T = any> {
  constructor(
    private supabase: SupabaseClient,
    private tableName: string,
    private userIdColumn: string = 'user_id'
  ) {}
  
  /**
   * Create a new record with proper column mapping
   */
  async create(data: Partial<T>, userId: string): Promise<{ data: T | null; error: Error | null }> {
    try {
      const mappedData = ColumnMapper.toDatabaseFormat({
        ...data,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log(`➕ Creating ${this.tableName} record...`);
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(mappedData)
        .select()
        .single();
        
      if (error) {
        console.error(`❌ Error creating ${this.tableName}:`, error);
        return { data: null, error: new Error(error.message) };
      }
      
      const transformedResult = ColumnMapper.toInterfaceFormat(result) as T;
      console.log(`✅ Created ${this.tableName} record:`, transformedResult);
      return { data: transformedResult, error: null };
      
    } catch (error) {
      console.error(`❌ Unexpected error creating ${this.tableName}:`, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  }
  
  /**
   * Update a record with proper column mapping
   */
  async update(
    id: string, 
    data: Partial<T>
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const mappedData = ColumnMapper.toDatabaseFormat({
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`📝 Updating ${this.tableName} record ${id}...`);
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(mappedData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error(`❌ Error updating ${this.tableName}:`, error);
        return { data: null, error: new Error(error.message) };
      }
      
      const transformedResult = ColumnMapper.toInterfaceFormat(result) as T;
      console.log(`✅ Updated ${this.tableName} record:`, transformedResult);
      return { data: transformedResult, error: null };
      
    } catch (error) {
      console.error(`❌ Unexpected error updating ${this.tableName}:`, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  }
  
  /**
   * Load records for a user with proper column mapping
   */
  async loadByUser(
    userId: string, 
    dateFilter?: string
  ): Promise<{ data: T[]; error: Error | null }> {
    try {
      console.log(`📖 Loading ${this.tableName} records for user...`);
      
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq(this.userIdColumn, userId);
        
      if (dateFilter) {
        query = query.eq('task_date', dateFilter);
      }
      
      const { data: result, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error(`❌ Error loading ${this.tableName}:`, error);
        return { data: [], error: new Error(error.message) };
      }
      
      const transformedResults = result?.map(item => 
        ColumnMapper.toInterfaceFormat(item)
      ) as T[] || [];
      
      console.log(`✅ Loaded ${transformedResults.length} ${this.tableName} records`);
      return { data: transformedResults, error: null };
      
    } catch (error) {
      console.error(`❌ Unexpected error loading ${this.tableName}:`, error);
      return { 
        data: [], 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  }
  
  /**
   * Toggle completion status with proper timestamp handling
   */
  async toggleCompletion(
    id: string, 
    completed: boolean
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const now = new Date().toISOString();
      const updateData = {
        completed,
        completed_at: completed ? now : null,
        updated_at: now
      };
      
      console.log(`🔄 Toggling completion for ${this.tableName} ${id}...`);
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error(`❌ Error toggling completion for ${this.tableName}:`, error);
        return { data: null, error: new Error(error.message) };
      }
      
      const transformedResult = ColumnMapper.toInterfaceFormat(result) as T;
      console.log(`✅ Toggled completion for ${this.tableName}:`, transformedResult);
      return { data: transformedResult, error: null };
      
    } catch (error) {
      console.error(`❌ Unexpected error toggling completion for ${this.tableName}:`, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  }
  
  /**
   * Delete a record safely
   */
  async delete(id: string): Promise<{ error: Error | null }> {
    try {
      console.log(`🗑️ Deleting ${this.tableName} record ${id}...`);
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error(`❌ Error deleting ${this.tableName}:`, error);
        return { error: new Error(error.message) };
      }
      
      console.log(`✅ Deleted ${this.tableName} record ${id}`);
      return { error: null };
      
    } catch (error) {
      console.error(`❌ Unexpected error deleting ${this.tableName}:`, error);
      return { 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  }
}

/**
 * TASK-SPECIFIC OPERATIONS
 * 
 * Specialized operations for task management
 */
export class TaskOperations<T = any> extends SafeSupabaseOperations<T> {
  /**
   * Create a task with work-type specific defaults
   */
  async createTask(
    taskData: Partial<T>, 
    userId: string, 
    workType: 'deep_work' | 'light_work' = 'deep_work'
  ): Promise<{ data: T | null; error: Error | null }> {
    const defaults = {
      deep_work: {
        focusBlocks: 4,
        breakDuration: 15,
        priority: 'HIGH',
        workType: 'deep_focus'
      },
      light_work: {
        priority: 'MEDIUM',
        workType: 'light_work'
      }
    };
    
    const taskWithDefaults = {
      ...defaults[workType],
      ...taskData,
      userId
    };
    
    return this.create(taskWithDefaults, userId);
  }
  
  /**
   * Update due date with proper column mapping
   */
  async updateDueDate(
    id: string, 
    dueDate: string | null
  ): Promise<{ data: T | null; error: Error | null }> {
    return this.update(id, { dueDate } as Partial<T>);
  }
  
  /**
   * Update title with proper error handling
   */
  async updateTitle(
    id: string, 
    title: string
  ): Promise<{ data: T | null; error: Error | null }> {
    return this.update(id, { title } as Partial<T>);
  }
}

/**
 * SUBTASK OPERATIONS
 * 
 * Specialized operations for subtask management
 */
export class SubtaskOperations<T = any> extends SafeSupabaseOperations<T> {
  /**
   * Create subtask with parent task relationship
   */
  async createSubtask(
    subtaskData: Partial<T>, 
    taskId: string
  ): Promise<{ data: T | null; error: Error | null }> {
    const subtaskWithParent = {
      ...subtaskData,
      taskId,
      completed: false
    };
    
    // Note: We don't need userId for subtasks as they inherit from parent task
    return this.create(subtaskWithParent, ''); 
  }
  
  /**
   * Load subtasks for a specific task
   */
  async loadByTask(taskId: string): Promise<{ data: T[]; error: Error | null }> {
    try {
      console.log(`📖 Loading subtasks for task ${taskId}...`);
      
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error(`❌ Error loading subtasks:`, error);
        return { data: [], error: new Error(error.message) };
      }
      
      const transformedResults = result?.map(item => 
        ColumnMapper.toInterfaceFormat(item)
      ) as T[] || [];
      
      console.log(`✅ Loaded ${transformedResults.length} subtasks`);
      return { data: transformedResults, error: null };
      
    } catch (error) {
      console.error(`❌ Unexpected error loading subtasks:`, error);
      return { 
        data: [], 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  }
}

/**
 * USAGE EXAMPLES
 * 
 * How to use this template in your hooks
 */

/*
// Example: Deep Work Tasks Hook
export const useDeepWorkTasksTemplate = () => {
  const supabase = useSupabaseClient();
  const userId = useSupabaseUserId();
  
  const taskOps = new TaskOperations<DeepWorkTask>(supabase, 'deep_work_tasks');
  const subtaskOps = new SubtaskOperations<DeepWorkSubtask>(supabase, 'deep_work_subtasks');
  
  const createTask = useCallback(async (taskData: Partial<DeepWorkTask>) => {
    if (!userId) return null;
    const result = await taskOps.createTask(taskData, userId, 'deep_work');
    return result.data;
  }, [userId, taskOps]);
  
  const loadTasks = useCallback(async (date: string) => {
    if (!userId) return [];
    const result = await taskOps.loadByUser(userId, date);
    return result.data;
  }, [userId, taskOps]);
  
  // ... more operations
};

// Example: Light Work Tasks Hook  
export const useLightWorkTasksTemplate = () => {
  const supabase = useSupabaseClient();
  const userId = useSupabaseUserId();
  
  const taskOps = new TaskOperations<LightWorkTask>(supabase, 'light_work_tasks');
  
  const createTask = useCallback(async (taskData: Partial<LightWorkTask>) => {
    if (!userId) return null;
    const result = await taskOps.createTask(taskData, userId, 'light_work');
    return result.data;
  }, [userId, taskOps]);
  
  // ... more operations
};
*/

/**
 * MIGRATION CHECKLIST
 * 
 * When creating new database operations:
 * 
 * 1. ✅ Use SafeSupabaseOperations or specialized classes
 * 2. ✅ Map ALL camelCase to snake_case using STANDARD_COLUMN_MAPPINGS
 * 3. ✅ Add proper error handling with try-catch blocks
 * 4. ✅ Include console logging for debugging
 * 5. ✅ Transform returned data from snake_case to camelCase
 * 6. ✅ Handle timestamps (created_at, updated_at, completed_at)
 * 7. ✅ Test with actual database to verify column names match
 * 8. ✅ Use TypeScript interfaces that match your data structure
 * 
 * COMMON ERRORS TO AVOID:
 * - ❌ Using camelCase in .update() or .insert() operations
 * - ❌ Forgetting to map snake_case responses back to camelCase
 * - ❌ Missing error handling for database operations
 * - ❌ Not updating timestamps on mutations
 * - ❌ Assuming column names without checking database schema
 */

export default {
  ColumnMapper,
  SafeSupabaseOperations,
  TaskOperations,
  SubtaskOperations,
  STANDARD_COLUMN_MAPPINGS
};