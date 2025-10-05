import { createHash } from 'crypto';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  hits: number;
  size: number;
  ttl: number;
  tags?: string[];
}

export interface CacheConfig {
  maxSize: number; // Max cache size in bytes
  defaultTTL: number; // Default TTL in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
  compressionThreshold: number; // Compress entries larger than this (bytes)
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  entryCount: number;
  hitRate: number;
}

export class MCPCache {
  private cache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    entryCount: 0,
    hitRate: 0
  };
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private accessOrder: string[] = []; // LRU tracking

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100 * 1024 * 1024, // 100MB default
      defaultTTL: 15 * 60 * 1000, // 15 minutes default
      cleanupInterval: 5 * 60 * 1000, // 5 minutes default
      compressionThreshold: 10 * 1024, // 10KB default
      ...config
    };

    this.startCleanupTimer();
  }

  /**
   * Generate cache key from MCP call details
   */
  generateKey(mcp: string, method: string, params: any): string {
    const keyData = JSON.stringify({ mcp, method, params });
    return createHash('sha256').update(keyData).digest('hex');
  }

  /**
   * Get cached data with automatic TTL check
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update stats and LRU
    entry.hits++;
    this.stats.hits++;
    this.updateHitRate();
    this.updateAccessOrder(key);

    return entry.data as T;
  }

  /**
   * Set cache entry with size tracking
   */
  set<T = any>(
    key: string, 
    data: T, 
    options: { ttl?: number; tags?: string[] } = {}
  ): boolean {
    const ttl = options.ttl || this.config.defaultTTL;
    const size = this.calculateSize(data);

    // Check if we need to make room
    if (this.stats.size + size > this.config.maxSize) {
      this.evictLRU(size);
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      hits: 0,
      size,
      ttl,
      tags: options.tags
    };

    // Update existing entry size
    const existingEntry = this.cache.get(key);
    if (existingEntry) {
      this.stats.size -= existingEntry.size;
    }

    this.cache.set(key, entry);
    this.stats.size += size;
    this.stats.entryCount = this.cache.size;
    this.updateAccessOrder(key);

    return true;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.size -= entry.size;
      this.stats.entryCount--;
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return true;
    }
    return false;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      entryCount: 0,
      hitRate: 0
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Invalidate entries by tag
   */
  invalidateByTag(tag: string): number {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  /**
   * Invalidate entries by MCP
   */
  invalidateByMCP(mcp: string): number {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (key.includes(mcp)) {
        this.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  /**
   * Cached MCP call wrapper
   */
  async cachedCall<T = any>(
    mcp: string,
    method: string,
    params: any,
    executor: () => Promise<T>,
    options?: { ttl?: number; tags?: string[] }
  ): Promise<T> {
    const key = this.generateKey(mcp, method, params);
    
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute and cache
    try {
      const result = await executor();
      this.set(key, result, options);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  }

  /**
   * Warm cache with preloaded data
   */
  warmCache(entries: Array<{
    mcp: string;
    method: string;
    params: any;
    data: any;
    ttl?: number;
  }>): void {
    for (const entry of entries) {
      const key = this.generateKey(entry.mcp, entry.method, entry.params);
      this.set(key, entry.data, { ttl: entry.ttl });
    }
  }

  /**
   * Export cache for persistence
   */
  export(): Array<{
    key: string;
    entry: CacheEntry;
  }> {
    const entries: Array<{ key: string; entry: CacheEntry }> = [];
    
    for (const [key, entry] of this.cache.entries()) {
      // Only export non-expired entries
      if (Date.now() - entry.timestamp <= entry.ttl) {
        entries.push({ key, entry });
      }
    }

    return entries;
  }

  /**
   * Import cache from persistence
   */
  import(entries: Array<{ key: string; entry: CacheEntry }>): void {
    for (const { key, entry } of entries) {
      // Recalculate remaining TTL
      const elapsed = Date.now() - entry.timestamp;
      const remainingTTL = entry.ttl - elapsed;
      
      if (remainingTTL > 0) {
        this.cache.set(key, entry);
        this.stats.size += entry.size;
        this.stats.entryCount++;
      }
    }
  }

  /**
   * Calculate approximate size of data
   */
  private calculateSize(data: any): number {
    const str = JSON.stringify(data);
    return new Blob([str]).size;
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU(requiredSpace: number): void {
    let freedSpace = 0;
    
    while (freedSpace < requiredSpace && this.accessOrder.length > 0) {
      const key = this.accessOrder.shift()!;
      const entry = this.cache.get(key);
      
      if (entry) {
        freedSpace += entry.size;
        this.delete(key);
        this.stats.evictions++;
      }
    }
  }

  /**
   * Update access order for LRU
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Remove from access order
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Singleton instance for global cache
export const mcpCache = new MCPCache();