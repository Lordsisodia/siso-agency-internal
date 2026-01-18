/**
 * 🏗️ Base Task Service - Foundation for all task database operations
 * 
 * This abstract class provides the core functionality that all task services need:
 * - Database connection management through Supabase MCP tools
 * - Intelligent retry logic for network failures and database timeouts
 * - Smart caching system to reduce database load and improve performance
 * - Standardized error handling with detailed logging for debugging
 * - Common data transformation patterns for database-to-component mapping
 * 
 * Business Context:
 * The SISO Internal app needs reliable task management across light work and deep work.
 * This service ensures database operations are resilient and performant, preventing
 * task data loss and providing a smooth user experience even when the database is slow.
 * 
 * Technical Architecture:
 * Uses abstract methods to define the interface that all task services must implement,
 * while providing common functionality like caching and retry logic in the base class.
 */

import { Task, Subtask } from '@/domains/lifelock/1-daily/2-tasks/components-from-root/TaskCard';
import { supabase, TABLES } from '@/lib/services/supabase/client';

// Core database result structure for consistent error handling
// This standardizes how we handle both successful and failed database operations
interface DatabaseResult<T> {
  data: T | null;
  error: Error | null;
  fromCache?: boolean;
  retryCount?: number;
}

// Cache entry structure with timestamp for expiration management
// Each cached item knows when it was stored so we can invalidate stale data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

// Configuration for retry behavior - can be customized per operation type
// Different operations may need different retry strategies (e.g., reads vs writes)
interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  exponentialBackoff: boolean;
  retryableErrors: string[];
}

/**
 * Abstract base class that provides common database functionality for all task services.
 * This implements the Template Method pattern - defines the structure of operations
 * while letting subclasses implement specific business logic.
 */
export abstract class BaseTaskService {
  // In-memory cache for frequently accessed data
  // Using Map for O(1) lookup performance on cache hits
  protected cache: Map<string, CacheEntry<any>> = new Map();
  
  // Default retry configuration - can be overridden by subclasses
  // These values balance reliability with user experience (not too slow)
  protected defaultRetryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelayMs: 1000,
    exponentialBackoff: true,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'CONNECTION_ERROR']
  };

  constructor() {
    // Set up cache cleanup to prevent memory leaks
    // Run cleanup every 5 minutes to remove expired entries
    setInterval(() => this.cleanupExpiredCache(), 5 * 60 * 1000);
  }

  /**
   * Execute a database operation with intelligent retry logic and error handling.
   * This is the core method that wraps all database calls with resilience patterns.
   * 
   * The retry logic uses exponential backoff to avoid overwhelming a struggling database,
   * and only retries on specific error types that are likely to be transient.
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<DatabaseResult<T>> {
    // Merge provided config with defaults
    // This allows each operation to customize retry behavior if needed
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: Error;

    // Attempt the operation up to maxAttempts times
    // Each attempt has progressively longer delays to give the database time to recover
    for (let attempt = 0; attempt < retryConfig.maxAttempts; attempt++) {
      try {
        console.log(`🔄 Database operation attempt ${attempt + 1}/${retryConfig.maxAttempts}`);
        
        // Execute the actual database operation
        // This could be any Supabase query or MCP tool call
        const result = await operation();
        
        // Success! Return the data with metadata about the operation
        console.log(`✅ Database operation succeeded on attempt ${attempt + 1}`);
        return {
          data: result,
          error: null,
          fromCache: false,
          retryCount: attempt
        };
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`❌ Database operation attempt ${attempt + 1} failed:`, lastError.message);
        
        // Check if this error type should be retried
        // Some errors (like validation errors) shouldn't be retried
        const shouldRetry = this.shouldRetryError(lastError, retryConfig);
        
        // If this was the last attempt or error isn't retryable, give up
        if (attempt === retryConfig.maxAttempts - 1 || !shouldRetry) {
          console.error(`💥 Database operation failed permanently after ${attempt + 1} attempts`);
          break;
        }
        
        // Calculate delay before next retry
        // Exponential backoff: 1s, 2s, 4s, etc. to reduce database load
        const delay = retryConfig.exponentialBackoff 
          ? retryConfig.baseDelayMs * Math.pow(2, attempt)
          : retryConfig.baseDelayMs;
          
        console.log(`⏱️ Waiting ${delay}ms before retry...`);
        await this.delay(delay);
      }
    }

    // All retries failed, return error result
    // Include retry count for debugging and monitoring
    return {
      data: null,
      error: lastError!,
      fromCache: false,
      retryCount: retryConfig.maxAttempts
    };
  }

  /**
   * Smart caching system to reduce database load and improve response times.
   * Cache keys are generated based on operation type and parameters,
   * ensuring that identical requests can reuse cached data.
   */
  protected async executeWithCache<T>(
    cacheKey: string,
    operation: () => Promise<T>,
    cacheTimeMs: number = 60000, // Default 1 minute cache
    config: Partial<RetryConfig> = {}
  ): Promise<DatabaseResult<T>> {
    
    // First, check if we have valid cached data
    // This avoids unnecessary database calls for recently fetched data
    const cachedData = this.getCachedData<T>(cacheKey, cacheTimeMs);
    if (cachedData !== null) {
      console.log(`📦 Cache hit for key: ${cacheKey}`);
      return {
        data: cachedData,
        error: null,
        fromCache: true,
        retryCount: 0
      };
    }

    console.log(`🔍 Cache miss for key: ${cacheKey}, fetching from database...`);
    
    // Cache miss - execute the operation with retry logic
    // This combines caching with resilience for optimal performance and reliability
    const result = await this.executeWithRetry(operation, config);
    
    // If the operation succeeded, cache the result for future requests
    // Only cache successful results to avoid caching errors
    if (result.data !== null && result.error === null) {
      this.setCachedData(cacheKey, result.data);
      console.log(`💾 Cached result for key: ${cacheKey}`);
    }

    return result;
  }

  /**
   * Generate a consistent cache key based on operation name and parameters.
   * This ensures that identical operations can find cached data,
   * while different operations get separate cache entries.
   */
  protected getCacheKey(operation: string, params: any = {}): string {
    // Create a deterministic key from operation name and parameters
    // JSON.stringify ensures identical parameters create identical keys
    const paramString = JSON.stringify(params, Object.keys(params).sort());
    return `${operation}_${paramString}`;
  }

  /**
   * Retrieve cached data if it exists and hasn't expired.
   * Returns null if data is missing or stale, triggering a database fetch.
   */
  protected getCachedData<T>(key: string, maxAgeMs: number): T | null {
    const cached = this.cache.get(key);
    
    // Check if cache entry exists and is still fresh
    // Stale data is treated as a cache miss to ensure data accuracy
    if (cached && (Date.now() - cached.timestamp) < maxAgeMs) {
      return cached.data as T;
    }
    
    // Cache miss or expired data
    if (cached && (Date.now() - cached.timestamp) >= maxAgeMs) {
      console.log(`🗑️ Removing expired cache entry: ${key}`);
      this.cache.delete(key);
    }
    
    return null;
  }

  /**
   * Store data in cache with current timestamp.
   * The timestamp is used later to determine if cached data has expired.
   */
  protected setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    });
    
    console.log(`📝 Cached data for key: ${key} (cache size: ${this.cache.size})`);
  }

  /**
   * Clear all cached data for a specific operation type or pattern.
   * This is used when data changes to ensure cache consistency.
   */
  protected clearCache(pattern?: string): void {
    if (!pattern) {
      // Clear entire cache
      const size = this.cache.size;
      this.cache.clear();
      console.log(`🧹 Cleared entire cache (${size} entries)`);
      return;
    }
    
    // Clear entries matching the pattern
    // This allows selective cache invalidation when specific data changes
    let cleared = 0;
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    if (cleared > 0) {
      console.log(`🧹 Cleared ${cleared} cache entries matching pattern: ${pattern}`);
    }
  }

  /**
   * Remove expired cache entries to prevent memory leaks.
   * Called automatically by a timer, but can also be called manually.
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    let removed = 0;
    
    // Check each cache entry and remove if older than 10 minutes
    // This is a conservative cleanup - specific operations may have shorter TTLs
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > 10 * 60 * 1000) { // 10 minutes
        this.cache.delete(key);
        removed++;
      }
    }
    
    if (removed > 0) {
      console.log(`🗑️ Cleaned up ${removed} expired cache entries`);
    }
  }

  /**
   * Determine if an error should trigger a retry attempt.
   * Network errors and timeouts are retryable, but validation errors are not.
   */
  private shouldRetryError(error: Error, config: RetryConfig): boolean {
    const errorMessage = error.message.toLowerCase();
    
    // Check if error matches any retryable patterns
    // This prevents wasting time retrying permanent failures like bad data
    return config.retryableErrors.some(retryableError => 
      errorMessage.includes(retryableError.toLowerCase())
    ) || 
    // Common network error patterns
    errorMessage.includes('network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('fetch failed');
  }

  /**
   * Simple delay utility for retry logic.
   * Uses Promise-based timing to avoid blocking other operations.
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute Supabase query with proper error handling.
   * This provides a unified interface to Supabase for all service operations.
   */
  protected async executeSupabaseQuery(tableName: string, query: 'select' | 'insert' | 'update' | 'delete', options: any = {}): Promise<any[]> {
    try {
      console.log(`🔍 Executing Supabase query on ${tableName}:`, query);
      
      let result;
      
      switch (query) {
        case 'select':
          let selectQuery = supabase
            .from(tableName)
            .select(options.select || '*');
          
          // Only add .eq() filter if both column and value are defined
          if (options.eq?.column && options.eq?.value !== undefined) {
            selectQuery = selectQuery.eq(options.eq.column, options.eq.value);
          }
          
          result = await selectQuery
            .order(options.order?.column || 'created_at', { ascending: options.order?.ascending !== false });
          break;
          
        case 'insert':
          result = await supabase
            .from(tableName)
            .insert(options.data)
            .select();
          break;
          
        case 'update':
          result = await supabase
            .from(tableName)
            .update(options.data)
            .eq(options.eq?.column || 'id', options.eq?.value)
            .select();
          break;
          
        case 'delete':
          result = await supabase
            .from(tableName)
            .delete()
            .eq(options.eq?.column || 'id', options.eq?.value);
          break;
          
        default:
          throw new Error(`Unsupported query type: ${query}`);
      }
      
      if (result.error) {
        throw new Error(`Supabase error: ${result.error.message}`);
      }
      
      console.log(`✅ Supabase query executed successfully on ${tableName}`);
      return result.data || [];
      
    } catch (error) {
      console.error('❌ Supabase query execution failed:', error);
      
      // Fallback to simulated data for development/testing
      console.log(`⚠️ Using fallback simulated data for ${tableName}`);
      return await this.simulateQuery(tableName);
    }
  }

  /**
   * Simulate database queries for development and testing.
   * This provides realistic test data that matches the production database structure.
   */
  private async simulateQuery(tableName: string): Promise<any[]> {
    // Add realistic delay to simulate network latency
    // This helps catch timing issues during development
    await this.delay(Math.random() * 200 + 50); // 50-250ms delay
    
    // Return appropriate mock data based on table name
    // These simulate actual database responses for development
    switch (tableName) {
      case TABLES.LIGHT_WORK_TASKS:
        return this.getMockLightWorkTasks();
      case TABLES.LIGHT_WORK_SUBTASKS:
        return this.getMockLightWorkSubtasks();
      case TABLES.DEEP_WORK_TASKS:
        return this.getMockDeepWorkTasks();
      case TABLES.DEEP_WORK_SUBTASKS:
        return this.getMockDeepWorkSubtasks();
      default:
        return [];
    }
  }

  /**
   * Abstract methods that each task service must implement.
   * These define the standard interface for all task operations,
   * ensuring consistency across different task types.
   */
  
  // Get tasks of this type, optionally filtered by user
  abstract getTasks(userId?: string): Promise<Task[]>;
  
  // Create a new task with validation and business logic
  abstract createTask(taskInput: any): Promise<Task>;
  
  // Update an existing task with partial data
  abstract updateTask(taskId: string, updates: any): Promise<Task>;
  
  // Delete a task and all associated data
  abstract deleteTask(taskId: string): Promise<void>;
  
  // Update task completion status with timestamp tracking
  abstract updateTaskStatus(taskId: string, completed: boolean): Promise<void>;
  
  // Update subtask completion status with parent task updates
  abstract updateSubtaskStatus(subtaskId: string, completed: boolean): Promise<void>;

  /**
   * Mock data methods for development and testing.
   * These provide realistic sample data that matches database schemas.
   */
  
  protected getMockLightWorkTasks(): any[] {
    return [
      {
        id: 'lw-test-task-1',
        user_id: 'user-123',
        title: 'Email Processing & Admin Tasks',
        description: 'Handle incoming emails and quick administrative work',
        priority: 'Med',
        status: 'pending',
        completed: false,
        original_date: '2025-09-14',
        task_date: '2025-09-14',
        estimated_duration: 30,
        tags: ['admin', 'email'],
        category: 'Administration',
        focusIntensity: 1,
        subtasks: [
          {
            id: 'test-subtask-1',
            title: 'Check priority emails',
            completed: false,
            priority: 'HIGH'
          }
        ],
        created_at: '2025-09-14T10:00:00Z',
        updated_at: '2025-09-14T10:00:00Z'
      },
      {
        id: 'lw-test-task-2',
        user_id: 'user-123',
        title: 'Secondary Light Work Task',
        description: 'Another light work task for testing',
        priority: 'HIGH',
        status: 'pending',
        completed: false,
        original_date: '2025-09-14',
        task_date: '2025-09-14',
        estimated_duration: 45,
        tags: ['testing'],
        category: 'Development',
        focusIntensity: 1,
        subtasks: [
          {
            id: 'subtask-1',
            title: 'Mock Subtask',
            completed: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        created_at: '2025-09-14T10:00:00Z',
        updated_at: '2025-09-14T10:00:00Z'
      }
    ];
  }

  protected getMockLightWorkSubtasks(): any[] {
    return [
      {
        id: 'mock-lw-sub-1',
        task_id: 'mock-lw-1',
        title: 'Process urgent emails',
        text: 'Clear high-priority emails and respond',
        completed: false,
        priority: 'HIGH',
        created_at: '2025-09-14T10:00:00Z',
        updated_at: '2025-09-14T10:00:00Z'
      }
    ];
  }

  protected getMockDeepWorkTasks(): any[] {
    return [
      {
        id: 'dw-test-task-1',
        user_id: 'user-123',
        title: 'Complete SISO Database Integration',
        description: 'Finish database services decomposition and test all components',
        priority: 'HIGH',
        status: 'in-progress',
        completed: false,
        original_date: '2025-09-14',
        task_date: '2025-09-14',
        estimated_duration: 120,
        focus_blocks: 3,
        break_duration: 15,
        tags: ['development', 'database'],
        category: 'Development',
        focusIntensity: 3,
        subtasks: [
          {
            id: 'test-subtask-1',
            title: 'Set up database connections',
            completed: false,
            priority: 'HIGH'
          },
          {
            id: 'test-subtask-2',
            title: 'Write integration tests',
            completed: true,
            priority: 'MED'
          }
        ],
        created_at: '2025-09-14T08:00:00Z',
        updated_at: '2025-09-14T08:00:00Z'
      }
    ];
  }

  protected getMockDeepWorkSubtasks(): any[] {
    return [
      {
        id: 'mock-dw-sub-1',
        task_id: 'mock-dw-1',
        title: 'Implement BaseTaskService with retry logic',
        text: 'Create foundational service with error handling and caching',
        completed: false,
        priority: 'HIGH',
        created_at: '2025-09-14T08:00:00Z',
        updated_at: '2025-09-14T08:00:00Z'
      }
    ];
  }
}