/**
 * 🗄️ Task Cache Manager - Intelligent caching for task operations
 * 
 * This module provides sophisticated caching capabilities for task data across the system.
 * It implements multiple caching strategies optimized for different task types and usage patterns,
 * with automatic invalidation, cache warming, and performance monitoring.
 * 
 * Business Context:
 * Caching is critical for task management performance:
 * - Light work: Frequent access requires fast retrieval (30s TTL)
 * - Deep work: Complex queries benefit from longer caching (2m TTL)
 * - Administrative operations: Batch loading and dashboard queries
 * - Real-time updates: Selective cache invalidation
 * 
 * Cache Strategies:
 * - Memory cache for immediate access
 * - Layered caching with different TTLs
 * - Smart invalidation based on data relationships
 * - Cache warming for anticipated access patterns
 * - Performance metrics and hit rate monitoring
 */

import { Task } from '@/components/tasks/TaskCard';

// Cache configuration for different task types
const CACHE_CONFIG = {
  LIGHT_WORK: {
    TTL: 30000,           // 30 seconds for frequent light work updates
    MAX_ENTRIES: 500,     // Higher capacity for frequent access
    NAMESPACE: 'lw'
  },
  DEEP_WORK: {
    TTL: 120000,          // 2 minutes for complex deep work data
    MAX_ENTRIES: 200,     // Lower capacity for complex data
    NAMESPACE: 'dw'
  },
  STATISTICS: {
    TTL: 300000,          // 5 minutes for dashboard statistics
    MAX_ENTRIES: 50,      // Small capacity for aggregated data
    NAMESPACE: 'stats'
  },
  SEARCH: {
    TTL: 60000,           // 1 minute for search results
    MAX_ENTRIES: 100,     // Medium capacity for search caching
    NAMESPACE: 'search'
  }
} as const;

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hitCount: number;
  lastAccessed: number;
  metadata?: {
    size: number;
    complexity: 'low' | 'medium' | 'high';
    source: string;
  };
}

// Cache statistics
interface CacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  averageResponseTime: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
}

// Cache operation result
interface CacheResult<T> {
  hit: boolean;
  data?: T;
  timestamp?: number;
  metadata?: {
    source: 'cache' | 'database';
    responseTime: number;
    cacheKey: string;
  };
}

/**
 * Task Cache Manager - Intelligent multi-layer caching system.
 * 
 * This class provides high-performance caching with automatic invalidation,
 * cache warming, and detailed performance monitoring. It supports different
 * caching strategies optimized for various task management scenarios.
 */
export class TaskCacheManager {
  private static instance: TaskCacheManager;
  private cache = new Map<string, CacheEntry<any>>();
  private stats = {
    totalHits: 0,
    totalMisses: 0,
    totalOperations: 0
  };
  private cleanupInterval?: NodeJS.Timeout;

  private constructor() {
    this.startCleanupInterval();
  }

  /**
   * Get singleton instance of cache manager.
   */
  static getInstance(): TaskCacheManager {
    if (!TaskCacheManager.instance) {
      TaskCacheManager.instance = new TaskCacheManager();
    }
    return TaskCacheManager.instance;
  }

  /**
   * Cache task data with automatic type detection and TTL.
   */
  set<T>(key: string, data: T, namespace: string = 'default', customTTL?: number): void {
    const config = this.getConfigForNamespace(namespace);
    const ttl = customTTL || config.TTL;
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hitCount: 0,
      lastAccessed: Date.now(),
      metadata: {
        size: this.estimateDataSize(data),
        complexity: this.estimateComplexity(data),
        source: 'cache-set'
      }
    };

    const cacheKey = this.buildCacheKey(namespace, key);
    
    // Check capacity limits
    this.enforceCapacityLimits(namespace);
    
    this.cache.set(cacheKey, entry);
    
  }

  /**
   * Retrieve cached data with hit/miss tracking.
   */
  get<T>(key: string, namespace: string = 'default'): CacheResult<T> {
    const startTime = Date.now();
    const cacheKey = this.buildCacheKey(namespace, key);
    const entry = this.cache.get(cacheKey);

    this.stats.totalOperations++;

    if (!entry) {
      this.stats.totalMisses++;
      return {
        hit: false,
        metadata: {
          source: 'database',
          responseTime: Date.now() - startTime,
          cacheKey
        }
      };
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(cacheKey);
      this.stats.totalMisses++;
      return {
        hit: false,
        metadata: {
          source: 'database',
          responseTime: Date.now() - startTime,
          cacheKey
        }
      };
    }

    // Update hit statistics
    entry.hitCount++;
    entry.lastAccessed = Date.now();
    this.stats.totalHits++;

    const responseTime = Date.now() - startTime;

    return {
      hit: true,
      data: entry.data,
      timestamp: entry.timestamp,
      metadata: {
        source: 'cache',
        responseTime,
        cacheKey
      }
    };
  }

  /**
   * Cache task list with intelligent key generation.
   */
  cacheTaskList(tasks: Task[], taskType: 'light-work' | 'deep-work', filters?: any): void {
    const namespace = taskType === 'light-work' ? 'lw' : 'dw';
    const filterKey = filters ? this.hashFilters(filters) : 'all';
    const key = `tasks:${filterKey}`;
    
    this.set(key, tasks, namespace);
  }

  /**
   * Retrieve cached task list with filter matching.
   */
  getCachedTaskList(taskType: 'light-work' | 'deep-work', filters?: any): CacheResult<Task[]> {
    const namespace = taskType === 'light-work' ? 'lw' : 'dw';
    const filterKey = filters ? this.hashFilters(filters) : 'all';
    const key = `tasks:${filterKey}`;
    
    return this.get<Task[]>(key, namespace);
  }

  /**
   * Cache individual task with relationship tracking.
   */
  cacheTask(task: Task, taskType: 'light-work' | 'deep-work'): void {
    const namespace = taskType === 'light-work' ? 'lw' : 'dw';
    const key = `task:${task.id}`;
    
    this.set(key, task, namespace);
    
    // Cache task relationships if they exist
    if (task.dependencies && task.dependencies.length > 0) {
      this.set(`deps:${task.id}`, task.dependencies, namespace);
    }
  }

  /**
   * Retrieve cached individual task.
   */
  getCachedTask(taskId: string, taskType: 'light-work' | 'deep-work'): CacheResult<Task> {
    const namespace = taskType === 'light-work' ? 'lw' : 'dw';
    const key = `task:${taskId}`;
    
    return this.get<Task>(key, namespace);
  }

  /**
   * Cache task statistics for dashboard performance.
   */
  cacheStatistics(stats: any, scope: 'light-work' | 'deep-work' | 'global'): void {
    const key = `stats:${scope}`;
    this.set(key, stats, 'stats');
  }

  /**
   * Retrieve cached statistics.
   */
  getCachedStatistics(scope: 'light-work' | 'deep-work' | 'global'): CacheResult<any> {
    const key = `stats:${scope}`;
    return this.get(key, 'stats');
  }

  /**
   * Cache search results with query fingerprinting.
   */
  cacheSearchResults(query: string, results: Task[], taskType?: 'light-work' | 'deep-work'): void {
    const queryHash = this.hashString(query);
    const typePrefix = taskType ? `${taskType}:` : '';
    const key = `${typePrefix}search:${queryHash}`;
    
    this.set(key, results, 'search');
  }

  /**
   * Retrieve cached search results.
   */
  getCachedSearchResults(query: string, taskType?: 'light-work' | 'deep-work'): CacheResult<Task[]> {
    const queryHash = this.hashString(query);
    const typePrefix = taskType ? `${taskType}:` : '';
    const key = `${typePrefix}search:${queryHash}`;
    
    return this.get<Task[]>(key, 'search');
  }

  /**
   * Invalidate cache entries based on task changes.
   */
  invalidateTask(taskId: string, taskType: 'light-work' | 'deep-work'): void {
    const namespace = taskType === 'light-work' ? 'lw' : 'dw';
    const patterns = [
      this.buildCacheKey(namespace, `task:${taskId}`),
      this.buildCacheKey(namespace, `deps:${taskId}`)
    ];

    // Invalidate specific task entries
    patterns.forEach(pattern => {
      if (this.cache.has(pattern)) {
        this.cache.delete(pattern);
      }
    });

    // Invalidate related list caches
    this.invalidateTaskLists(namespace);
  }

  /**
   * Invalidate all task list caches for a namespace.
   */
  invalidateTaskLists(namespace: string): void {
    const listPattern = this.buildCacheKey(namespace, 'tasks:');
    
    for (const [key] of this.cache) {
      if (key.startsWith(listPattern)) {
        this.cache.delete(key);
      }
    }

    // Also invalidate statistics that might be affected
    this.invalidateStatistics();
  }

  /**
   * Invalidate statistics caches.
   */
  invalidateStatistics(): void {
    const statsPattern = this.buildCacheKey('stats', '');
    
    for (const [key] of this.cache) {
      if (key.startsWith(statsPattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalidate search caches.
   */
  invalidateSearchResults(): void {
    const searchPattern = this.buildCacheKey('search', '');
    
    for (const [key] of this.cache) {
      if (key.startsWith(searchPattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Warm cache with anticipated data.
   */
  async warmCache(warmingStrategy: 'light-work' | 'deep-work' | 'dashboard' | 'all'): Promise<void> {
    
    // This would integrate with actual data fetching services
    // For now, we'll simulate the warming process
    const startTime = Date.now();
    
    try {
      switch (warmingStrategy) {
        case 'light-work':
          await this.warmLightWorkCache();
          break;
        case 'deep-work':
          await this.warmDeepWorkCache();
          break;
        case 'dashboard':
          await this.warmDashboardCache();
          break;
        case 'all':
          await Promise.all([
            this.warmLightWorkCache(),
            this.warmDeepWorkCache(),
            this.warmDashboardCache()
          ]);
          break;
      }
      
      const duration = Date.now() - startTime;
      
    } catch (error) {
      console.error(`❌ Cache warming failed: ${warmingStrategy}`, error);
    }
  }

  /**
   * Get comprehensive cache statistics.
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      totalEntries: this.cache.size,
      hitRate: this.stats.totalOperations > 0 
        ? (this.stats.totalHits / this.stats.totalOperations) * 100 
        : 0,
      missRate: this.stats.totalOperations > 0 
        ? (this.stats.totalMisses / this.stats.totalOperations) * 100 
        : 0,
      totalHits: this.stats.totalHits,
      totalMisses: this.stats.totalMisses,
      averageResponseTime: this.calculateAverageResponseTime(),
      memoryUsage: this.estimateMemoryUsage(),
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : now,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : now
    };
  }

  /**
   * Clear cache with optional namespace filtering.
   */
  clear(namespace?: string): void {
    if (namespace) {
      const pattern = this.buildCacheKey(namespace, '');
      for (const [key] of this.cache) {
        if (key.startsWith(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
      this.resetStats();
    }
  }

  // Private helper methods

  private getConfigForNamespace(namespace: string) {
    switch (namespace) {
      case 'lw': return CACHE_CONFIG.LIGHT_WORK;
      case 'dw': return CACHE_CONFIG.DEEP_WORK;
      case 'stats': return CACHE_CONFIG.STATISTICS;
      case 'search': return CACHE_CONFIG.SEARCH;
      default: return CACHE_CONFIG.LIGHT_WORK; // Default fallback
    }
  }

  private buildCacheKey(namespace: string, key: string): string {
    return `${namespace}:${key}`;
  }

  private hashFilters(filters: any): string {
    return this.hashString(JSON.stringify(filters));
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private estimateDataSize(data: any): number {
    return JSON.stringify(data).length * 2; // Rough byte estimate
  }

  private estimateComplexity(data: any): 'low' | 'medium' | 'high' {
    const size = this.estimateDataSize(data);
    if (size < 1000) return 'low';
    if (size < 10000) return 'medium';
    return 'high';
  }

  private enforceCapacityLimits(namespace: string): void {
    const config = this.getConfigForNamespace(namespace);
    const pattern = this.buildCacheKey(namespace, '');
    
    const namespaceEntries = Array.from(this.cache.entries())
      .filter(([key]) => key.startsWith(pattern));
    
    if (namespaceEntries.length >= config.MAX_ENTRIES) {
      // Remove least recently used entry
      const lruEntry = namespaceEntries
        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)[0];
      
      this.cache.delete(lruEntry[0]);
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000); // Cleanup every minute
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
    }
  }

  private async warmLightWorkCache(): Promise<void> {
    // Simulate warming light work cache
  }

  private async warmDeepWorkCache(): Promise<void> {
    // Simulate warming deep work cache
  }

  private async warmDashboardCache(): Promise<void> {
    // Simulate warming dashboard cache
  }

  private calculateAverageResponseTime(): number {
    // This would track actual response times
    return 0; // Placeholder
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.metadata?.size || 0;
    }
    return totalSize;
  }

  private resetStats(): void {
    this.stats = {
      totalHits: 0,
      totalMisses: 0,
      totalOperations: 0
    };
  }

  /**
   * Cleanup resources on shutdown.
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}