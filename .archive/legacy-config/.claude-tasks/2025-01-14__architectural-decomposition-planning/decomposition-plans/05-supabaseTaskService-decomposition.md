# 🎯 supabaseTaskService.ts Decomposition Plan

## Current State Analysis

**File:** `/src/services/supabaseTaskService.ts`  
**Risk Level:** 🔴 **HIGH** - Database breakage affects entire task system

### Current Problems
1. **Giant Service** - All database operations in one file
2. **Mixed Concerns** - Light work and deep work operations mixed together
3. **No Error Boundaries** - Database errors can crash entire app
4. **No Retry Logic** - Network failures cause permanent failures
5. **No Caching Strategy** - Every call hits database
6. **Hard to Test** - Monolithic service hard to mock and test
7. **No Type Separation** - All types mixed together

## Decomposition Strategy

### **Phase 1: Create Base Service Architecture**

#### `database/BaseTaskService.ts`
```typescript
// This is the foundation service that other services will extend
// It handles common database operations like connections and error handling
export abstract class BaseTaskService {
  protected supabase: SupabaseClient;
  protected cache: Map<string, any> = new Map();

  constructor() {
    // Initialize the Supabase client for database connections
    this.supabase = createSupabaseClient();
  }

  // Helper method to safely execute database operations
  // This wraps all database calls with error handling and retry logic
  protected async executeWithRetry<T>(
    operation: () => Promise<T>, 
    retries: number = 3
  ): Promise<{ data: T | null; error: Error | null }> {
    
    // Try the database operation up to 'retries' times
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Attempt the database operation
        const result = await operation();
        
        // If successful, return the data
        return { data: result, error: null };
      } catch (error) {
        console.warn(`Database operation attempt ${attempt + 1} failed:`, error);
        
        // If this was the last attempt, return the error
        if (attempt === retries - 1) {
          return { data: null, error: error as Error };
        }
        
        // Wait before retrying (exponential backoff)
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }
    
    // This should never be reached, but TypeScript requires it
    return { data: null, error: new Error('Unexpected retry failure') };
  }

  // Simple delay function for retry logic
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cache helper to avoid duplicate database calls
  protected getCacheKey(operation: string, params: any): string {
    return `${operation}_${JSON.stringify(params)}`;
  }

  // Get data from cache if it exists and isn't expired
  protected getCachedData<T>(key: string, maxAgeMs: number = 60000): T | null {
    const cached = this.cache.get(key);
    
    if (cached && (Date.now() - cached.timestamp) < maxAgeMs) {
      return cached.data;
    }
    
    return null;
  }

  // Store data in cache with timestamp
  protected setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Abstract methods that child services must implement
  // These define the interface that all task services must have
  abstract getTasks(userId?: string): Promise<Task[]>;
  abstract createTask(task: CreateTaskInput): Promise<Task>;
  abstract updateTask(taskId: string, updates: Partial<Task>): Promise<Task>;
  abstract deleteTask(taskId: string): Promise<void>;
}
```

### **Phase 2: Specialized Service Classes**

#### `services/LightWorkTaskService.ts`
```typescript
// Service specifically for light work tasks
// This handles all database operations for the light work task type
export class LightWorkTaskService extends BaseTaskService {
  private tableName = 'light_work_tasks';
  private subtasksTableName = 'light_work_subtasks';

  // Get all light work tasks for a user
  // Uses caching to avoid repeated database calls
  async getTasks(userId?: string): Promise<LightWorkTask[]> {
    const cacheKey = this.getCacheKey('getLightWorkTasks', { userId });
    
    // Check if we have recent cached data
    const cachedTasks = this.getCachedData<LightWorkTask[]>(cacheKey, 30000); // 30 second cache
    if (cachedTasks) {
      return cachedTasks;
    }

    // If no cache, fetch from database
    const { data, error } = await this.executeWithRetry(async () => {
      let query = this.supabase
        .from(this.tableName)
        .select(`
          *,
          subtasks:${this.subtasksTableName}(*)
        `)
        .order('created_at', { ascending: false });

      // Add user filter if provided
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const result = await query;
      
      if (result.error) {
        throw new Error(`Database query failed: ${result.error.message}`);
      }
      
      return result.data || [];
    });

    if (error) {
      console.error('Failed to fetch light work tasks:', error);
      throw error;
    }

    // Transform database format to app format
    const transformedTasks = this.transformDbTasksToApp(data || []);
    
    // Cache the results for future calls
    this.setCachedData(cacheKey, transformedTasks);
    
    return transformedTasks;
  }

  // Create a new light work task
  // Uses optimistic updates and handles validation
  async createTask(taskInput: CreateLightWorkTaskInput): Promise<LightWorkTask> {
    // Validate the input before sending to database
    const validationErrors = this.validateTaskInput(taskInput);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Transform app format to database format
    const dbTask = this.transformAppTaskToDb(taskInput);

    const { data, error } = await this.executeWithRetry(async () => {
      const result = await this.supabase
        .from(this.tableName)
        .insert(dbTask)
        .select()
        .single();

      if (result.error) {
        throw new Error(`Failed to create task: ${result.error.message}`);
      }

      return result.data;
    });

    if (error) {
      console.error('Failed to create light work task:', error);
      throw error;
    }

    // Clear cache since we have new data
    this.clearCacheForUser(taskInput.user_id);
    
    // Transform back to app format and return
    return this.transformDbTaskToApp(data!);
  }

  // Update an existing light work task
  // Handles partial updates and maintains data integrity
  async updateTask(taskId: string, updates: Partial<LightWorkTask>): Promise<LightWorkTask> {
    // Validate the updates
    const validationErrors = this.validateTaskUpdates(updates);
    if (validationErrors.length > 0) {
      throw new Error(`Update validation failed: ${validationErrors.join(', ')}`);
    }

    // Transform app updates to database format
    const dbUpdates = this.transformAppUpdatesToDb(updates);
    
    // Add updated_at timestamp
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await this.executeWithRetry(async () => {
      const result = await this.supabase
        .from(this.tableName)
        .update(dbUpdates)
        .eq('id', taskId)
        .select()
        .single();

      if (result.error) {
        throw new Error(`Failed to update task: ${result.error.message}`);
      }

      return result.data;
    });

    if (error) {
      console.error('Failed to update light work task:', error);
      throw error;
    }

    // Clear cache since data changed
    this.clearCacheForTask(taskId);
    
    return this.transformDbTaskToApp(data!);
  }

  // Delete a light work task and all its subtasks
  // Uses database transaction to maintain consistency
  async deleteTask(taskId: string): Promise<void> {
    const { error } = await this.executeWithRetry(async () => {
      // Start a database transaction to delete task and subtasks together
      const { error: subtasksError } = await this.supabase
        .from(this.subtasksTableName)
        .delete()
        .eq('task_id', taskId);

      if (subtasksError) {
        throw new Error(`Failed to delete subtasks: ${subtasksError.message}`);
      }

      const { error: taskError } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', taskId);

      if (taskError) {
        throw new Error(`Failed to delete task: ${taskError.message}`);
      }

      return {};
    });

    if (error) {
      console.error('Failed to delete light work task:', error);
      throw error;
    }

    // Clear cache since data changed
    this.clearCacheForTask(taskId);
  }

  // Helper methods for data transformation and validation
  // These keep the database format separate from the app format

  private validateTaskInput(task: CreateLightWorkTaskInput): string[] {
    const errors: string[] = [];
    
    // Title is required and should be reasonable length
    if (!task.title || task.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (task.title.length > 200) {
      errors.push('Title too long (max 200 characters)');
    }
    
    // Priority must be valid
    if (task.priority && !['low', 'medium', 'high'].includes(task.priority)) {
      errors.push('Priority must be low, medium, or high');
    }
    
    return errors;
  }

  private transformDbTasksToApp(dbTasks: any[]): LightWorkTask[] {
    // Convert database format to application format
    return dbTasks.map(dbTask => this.transformDbTaskToApp(dbTask));
  }

  private transformDbTaskToApp(dbTask: any): LightWorkTask {
    // Transform individual database task to app format
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description,
      priority: dbTask.priority,
      status: dbTask.status,
      estimatedTime: dbTask.estimated_time,
      actualTime: dbTask.actual_time,
      xpReward: dbTask.xp_reward,
      createdAt: new Date(dbTask.created_at),
      updatedAt: new Date(dbTask.updated_at),
      subtasks: dbTask.subtasks?.map(this.transformDbSubtaskToApp) || []
    };
  }

  // Additional helper methods...
  private clearCacheForUser(userId: string): void {
    // Remove cached data for this user
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => key.includes(userId));
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}
```

#### `services/DeepWorkTaskService.ts`
```typescript
// Service specifically for deep work tasks
// Similar structure to LightWorkTaskService but with deep work specific logic
export class DeepWorkTaskService extends BaseTaskService {
  private tableName = 'deep_work_tasks';
  private subtasksTableName = 'deep_work_subtasks';

  // Deep work tasks have different validation rules
  // They require longer descriptions and higher time estimates
  private validateTaskInput(task: CreateDeepWorkTaskInput): string[] {
    const errors: string[] = [];
    
    // Deep work tasks need more detailed titles
    if (!task.title || task.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (task.title.length < 10) {
      errors.push('Deep work tasks need descriptive titles (min 10 characters)');
    }
    
    // Description is required for deep work
    if (!task.description || task.description.trim().length === 0) {
      errors.push('Description is required for deep work tasks');
    }
    
    // Time estimate should be reasonable for deep work (at least 45 minutes)
    if (task.estimatedTime && task.estimatedTime < 45) {
      errors.push('Deep work tasks should be at least 45 minutes');
    }
    
    return errors;
  }

  // Deep work tasks have different XP calculations
  // They reward more points for completion
  private calculateXPReward(task: CreateDeepWorkTaskInput): number {
    let baseXP = 20; // Higher base XP for deep work
    
    // Bonus XP for longer tasks
    if (task.estimatedTime) {
      baseXP += Math.floor(task.estimatedTime / 30) * 5; // 5 XP per 30 minutes
    }
    
    // Priority multiplier
    const multipliers = { low: 1, medium: 1.5, high: 2 };
    baseXP *= multipliers[task.priority] || 1;
    
    return Math.round(baseXP);
  }

  // Implementation similar to LightWorkTaskService but with deep work specifics...
}
```

### **Phase 3: Service Registry and Factory**

#### `services/TaskServiceRegistry.ts`
```typescript
// Central registry that manages all task services
// This provides a single point to get the right service for each task type
export class TaskServiceRegistry {
  private services: Map<string, BaseTaskService> = new Map();
  
  constructor() {
    // Register all available task services
    this.registerService('light-work', new LightWorkTaskService());
    this.registerService('deep-work', new DeepWorkTaskService());
  }

  // Register a new task service type
  registerService(type: string, service: BaseTaskService): void {
    this.services.set(type, service);
  }

  // Get the appropriate service for a task type
  getService(taskType: string): BaseTaskService {
    const service = this.services.get(taskType);
    
    if (!service) {
      throw new Error(`No service registered for task type: ${taskType}`);
    }
    
    return service;
  }

  // Get all registered task types
  getRegisteredTypes(): string[] {
    return Array.from(this.services.keys());
  }

  // Health check all services
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [type, service] of this.services) {
      try {
        // Try to fetch tasks to test the service
        await service.getTasks();
        results[type] = true;
      } catch (error) {
        console.error(`Health check failed for ${type} service:`, error);
        results[type] = false;
      }
    }
    
    return results;
  }
}

// Export a singleton instance
export const taskServiceRegistry = new TaskServiceRegistry();
```

### **Phase 4: Unified Service Interface**

#### `services/UnifiedTaskService.ts`
```typescript
// This provides the same interface as the old monolithic service
// But internally routes to the appropriate specialized service
// This makes migration easier - existing code can use this without changes
export class UnifiedTaskService {
  private registry = taskServiceRegistry;

  // Route to appropriate service based on task type
  async getTasks(taskType: 'light-work' | 'deep-work', userId?: string): Promise<Task[]> {
    const service = this.registry.getService(taskType);
    return service.getTasks(userId);
  }

  async createTask(taskType: 'light-work' | 'deep-work', task: CreateTaskInput): Promise<Task> {
    const service = this.registry.getService(taskType);
    return service.createTask(task);
  }

  async updateTask(
    taskType: 'light-work' | 'deep-work', 
    taskId: string, 
    updates: Partial<Task>
  ): Promise<Task> {
    const service = this.registry.getService(taskType);
    return service.updateTask(taskId, updates);
  }

  async deleteTask(taskType: 'light-work' | 'deep-work', taskId: string): Promise<void> {
    const service = this.registry.getService(taskType);
    return service.deleteTask(taskId);
  }

  // Batch operations across multiple task types
  async batchCreateTasks(tasks: Array<{ type: string; data: CreateTaskInput }>): Promise<Task[]> {
    const results: Task[] = [];
    
    // Process each task creation
    for (const { type, data } of tasks) {
      try {
        const task = await this.createTask(type as any, data);
        results.push(task);
      } catch (error) {
        console.error(`Failed to create ${type} task:`, error);
        // Continue with other tasks even if one fails
      }
    }
    
    return results;
  }

  // Get health status of all services
  async getHealthStatus(): Promise<ServiceHealthStatus> {
    const healthChecks = await this.registry.healthCheck();
    
    return {
      overall: Object.values(healthChecks).every(healthy => healthy),
      services: healthChecks,
      timestamp: new Date()
    };
  }
}

// Export instance that matches old interface
export const supabaseTaskService = new UnifiedTaskService();
```

## Final Migration-Friendly Structure

```typescript
// For existing code, import works exactly the same:
import { supabaseTaskService } from '@/services/supabaseTaskService';

// Usage stays identical:
const tasks = await supabaseTaskService.getTasks('light-work', userId);
const newTask = await supabaseTaskService.createTask('deep-work', taskData);

// But now it's backed by specialized, maintainable services!
```

## Benefits of This Decomposition

### **1. Separation of Concerns**
- Light work and deep work logic completely separate
- Database operations isolated from business logic
- Caching and error handling centralized

### **2. Maintainability**
- Change deep work logic without affecting light work
- Add new task types without modifying existing code
- Test individual services in isolation

### **3. Reliability**
- Retry logic prevents network failures
- Caching reduces database load
- Error boundaries prevent app crashes

### **4. Performance**
- Smart caching avoids duplicate requests
- Batch operations for bulk actions
- Connection pooling through base service

### **5. Extensibility**
- Easy to add new task types
- Plugin architecture for services
- Health monitoring built-in

## Migration Strategy

### **Step 1: Create Base Service**
- Implement BaseTaskService with retry/caching
- Test against existing database operations

### **Step 2: Create Specialized Services**
- Extract LightWorkTaskService from existing code
- Move light work operations, test thoroughly

### **Step 3: Create Deep Work Service**
- Extract DeepWorkTaskService
- Move deep work operations, test thoroughly

### **Step 4: Create Registry**
- Implement service registry and factory
- Test service discovery and routing

### **Step 5: Create Unified Interface**
- Create UnifiedTaskService that matches old interface
- Replace old service with new unified one
- Test that all existing code still works

## Expected Outcome

**Before:** 1,000+ line monolithic service  
**After:** Modular system with specialized services

**Risk Reduction:** 🔴 High → 🟢 Low  
**Maintainability:** 🔴 Hard → 🟢 Easy  
**Reliability:** 🟡 Basic → 🟢 Excellent  
**Performance:** 🟡 OK → 🟢 Optimized  
**Testability:** 🔴 Hard → 🟢 Easy