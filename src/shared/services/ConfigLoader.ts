/**
 * CONFIG LOADER - SAFE TAB CONFIGURATION LOADING WITH FALLBACKS
 * 
 * This class provides robust, fail-safe loading of tab configurations with:
 * - Comprehensive error handling and recovery
 * - Multiple fallback strategies to prevent system failures
 * - Performance optimization with caching
 * - Runtime validation and health checks
 * - Progressive loading and graceful degradation
 * 
 * BUSINESS REASONING:
 * - Navigation must NEVER fail completely - always provide usable interface
 * - Configuration errors should degrade gracefully, not crash the app
 * - Performance optimization through intelligent caching strategies
 * - Development debugging while maintaining production reliability
 * - User experience continuity even during configuration problems
 * 
 * SAFETY PROTOCOLS:
 * - Multiple fallback layers (registry → cached → minimal → emergency)
 * - All operations wrapped in try/catch with specific error handling
 * - Validation at every step to catch configuration issues early
 * - Clear error reporting for development debugging
 * - Automatic recovery strategies for common failure modes
 */

import { TabConfig, TabLoadState, UseTabConfigurationOptions } from '../types/tab-types';
import { tabRegistry } from './TabRegistry';

/**
 * PERFORMANCE METRICS TRACKING
 * 
 * Tracks configuration loading performance for optimization.
 */
interface LoadingMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  cacheHit: boolean;
  fallbackUsed: boolean;
  errorCount: number;
  source: 'registry' | 'cache' | 'fallback' | 'emergency';
}

/**
 * CACHE ENTRY STRUCTURE
 * 
 * Structured caching with expiration and validation metadata.
 */
interface CacheEntry {
  data: TabConfig[];
  timestamp: number;
  ttl: number;
  hash: string; // For cache invalidation
  userPermissions: string[];
  environment: string;
}

/**
 * CONFIG LOADER CLASS
 * 
 * Centralized service for safe tab configuration loading with comprehensive
 * fallback strategies and performance optimization.
 */
export class ConfigLoader {
  private static cache: Map<string, CacheEntry> = new Map();
  private static loadingPromise: Promise<TabConfig[]> | null = null;
  private static lastSuccessfulLoad: TabConfig[] | null = null;
  private static loadingMetrics: LoadingMetrics[] = [];

  /**
   * EMERGENCY FALLBACK CONFIGURATION
   * 
   * Absolute last resort when all other loading methods fail.
   * Provides minimal but functional tab configuration.
   */
  private static readonly EMERGENCY_FALLBACK_CONFIGS: TabConfig[] = [
    {
      id: 'emergency-home',
      label: 'Home',
      icon: null as any, // UI layer must handle null icons gracefully
      component: null as any,
      order: 0,
      enabled: true,
      theme: {
        primary: 'text-gray-600',
        background: 'bg-gray-50',
        border: 'border-gray-200',
        hover: 'hover:bg-gray-100',
        active: 'bg-gray-200'
      },
      accessibility: {
        ariaLabel: 'Emergency Home Tab',
        description: 'Emergency fallback tab - check system configuration'
      },
      permissions: ['user', 'admin'],
      features: ['emergency-mode']
    }
  ];

  /**
   * MAIN CONFIGURATION LOADING METHOD
   * 
   * Attempts to load tab configuration through multiple strategies with
   * comprehensive error handling and fallback mechanisms.
   */
  public static async loadTabConfiguration(
    options: UseTabConfigurationOptions = {}
  ): Promise<{
    tabs: TabConfig[];
    loadState: TabLoadState;
    metrics: LoadingMetrics;
  }> {
    
    const metrics: LoadingMetrics = {
      startTime: Date.now(),
      cacheHit: false,
      fallbackUsed: false,
      errorCount: 0,
      source: 'registry'
    };

    let loadState: TabLoadState = {
      isLoading: true,
      error: null,
      usingFallback: false,
      warnings: []
    };

    try {
      this.debugLog('Starting tab configuration loading...', { options });

      // Prevent concurrent loading requests
      if (this.loadingPromise) {
        this.debugLog('Using existing loading promise');
        const result = await this.loadingPromise;
        return {
          tabs: result,
          loadState: { ...loadState, isLoading: false },
          metrics: { ...metrics, endTime: Date.now(), duration: Date.now() - metrics.startTime }
        };
      }

      // Create loading promise
      this.loadingPromise = this.attemptConfigurationLoad(options, metrics, loadState);
      const tabs = await this.loadingPromise;

      // Clear loading promise
      this.loadingPromise = null;

      // Update metrics
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      this.loadingMetrics.push({ ...metrics });

      // Keep only last 100 metrics for memory management
      if (this.loadingMetrics.length > 100) {
        this.loadingMetrics = this.loadingMetrics.slice(-100);
      }

      loadState.isLoading = false;
      this.debugLog(`Configuration loading completed in ${metrics.duration}ms`, {
        tabCount: tabs.length,
        source: metrics.source,
        cacheHit: metrics.cacheHit,
        fallbackUsed: metrics.fallbackUsed
      });

      return { tabs, loadState, metrics };

    } catch (error) {
      this.loadingPromise = null;
      metrics.errorCount++;
      
      this.debugLog('Configuration loading failed, using emergency fallback', { error });
      
      return {
        tabs: this.EMERGENCY_FALLBACK_CONFIGS,
        loadState: {
          isLoading: false,
          error: error instanceof Error ? error.message : 'Configuration loading failed',
          usingFallback: true,
          warnings: ['Using emergency fallback configuration - check system status']
        },
        metrics: {
          ...metrics,
          endTime: Date.now(),
          duration: Date.now() - metrics.startTime,
          fallbackUsed: true,
          source: 'emergency'
        }
      };
    }
  }

  /**
   * CONFIGURATION LOADING STRATEGIES
   * 
   * Attempts multiple loading strategies in order of preference:
   * 1. Cache (fastest)
   * 2. Registry (primary source)
   * 3. Last successful load (reliability)
   * 4. Emergency fallback (absolute last resort)
   */
  private static async attemptConfigurationLoad(
    options: UseTabConfigurationOptions,
    metrics: LoadingMetrics,
    loadState: TabLoadState
  ): Promise<TabConfig[]> {

    // STRATEGY 1: Try cache first (performance optimization)
    try {
      const cachedTabs = await this.loadFromCache(options);
      if (cachedTabs && cachedTabs.length > 0) {
        this.debugLog('Loaded configuration from cache');
        metrics.cacheHit = true;
        metrics.source = 'cache';
        return cachedTabs;
      }
    } catch (error) {
      metrics.errorCount++;
      loadState.warnings.push('Cache loading failed - proceeding with registry');
      this.debugLog('Cache loading failed', { error });
    }

    // STRATEGY 2: Load from registry (primary source)
    try {
      const registryTabs = await this.loadFromRegistry(options);
      if (registryTabs && registryTabs.length > 0) {
        this.debugLog('Loaded configuration from registry');
        
        // Cache successful load for future performance
        await this.cacheConfiguration(registryTabs, options);
        
        // Store as last successful load
        this.lastSuccessfulLoad = registryTabs;
        
        metrics.source = 'registry';
        return registryTabs;
      }
    } catch (error) {
      metrics.errorCount++;
      loadState.warnings.push('Registry loading failed - trying fallback strategies');
      this.debugLog('Registry loading failed', { error });
    }

    // STRATEGY 3: Use last successful load (reliability fallback)
    if (this.lastSuccessfulLoad && this.lastSuccessfulLoad.length > 0) {
      this.debugLog('Using last successful configuration load');
      loadState.usingFallback = true;
      loadState.warnings.push('Using cached successful configuration - may not reflect latest changes');
      metrics.fallbackUsed = true;
      metrics.source = 'fallback';
      return this.lastSuccessfulLoad;
    }

    // STRATEGY 4: Emergency fallback (absolute last resort)
    this.debugLog('All loading strategies failed, using emergency fallback');
    loadState.usingFallback = true;
    loadState.error = 'All configuration loading strategies failed';
    metrics.fallbackUsed = true;
    metrics.source = 'emergency';
    return this.EMERGENCY_FALLBACK_CONFIGS;
  }

  /**
   * CACHE LOADING STRATEGY
   * 
   * Loads configuration from cache with validation and expiration checks.
   */
  private static async loadFromCache(options: UseTabConfigurationOptions): Promise<TabConfig[] | null> {
    try {
      const cacheKey = this.generateCacheKey(options);
      const cacheEntry = this.cache.get(cacheKey);
      
      if (!cacheEntry) {
        this.debugLog('No cache entry found', { cacheKey });
        return null;
      }

      // Check expiration
      const now = Date.now();
      if (now - cacheEntry.timestamp > cacheEntry.ttl) {
        this.debugLog('Cache entry expired', { 
          age: now - cacheEntry.timestamp, 
          ttl: cacheEntry.ttl 
        });
        this.cache.delete(cacheKey);
        return null;
      }

      // Validate cache entry
      if (!this.validateCachedConfiguration(cacheEntry.data)) {
        this.debugLog('Cache entry validation failed');
        this.cache.delete(cacheKey);
        return null;
      }

      this.debugLog('Cache hit', { 
        tabCount: cacheEntry.data.length,
        age: now - cacheEntry.timestamp
      });
      
      return cacheEntry.data;

    } catch (error) {
      this.debugLog('Cache loading error', { error });
      return null;
    }
  }

  /**
   * REGISTRY LOADING STRATEGY
   * 
   * Loads configuration from the tab registry with permission filtering.
   */
  private static async loadFromRegistry(options: UseTabConfigurationOptions): Promise<TabConfig[] | null> {
    try {
      // Perform registry health check first
      const healthCheck = tabRegistry.healthCheck();
      if (!healthCheck.healthy) {
        this.debugLog('Registry health check failed', { issues: healthCheck.issues });
        // Don't fail completely - proceed with loading but add warnings
      }

      let tabs: TabConfig[];

      // Load tabs based on permissions
      if (options.userPermissions && options.userPermissions.length > 0) {
        tabs = tabRegistry.getTabsByPermission(options.userPermissions);
      } else {
        tabs = tabRegistry.getAllTabs();
      }

      // Apply custom filter if provided
      if (options.customFilter) {
        tabs = tabs.filter(options.customFilter);
      }

      // Validate all loaded tabs
      const validTabs = tabs.filter(tab => this.validateTabAtRuntime(tab));
      
      if (validTabs.length === 0) {
        throw new Error('No valid tabs found in registry');
      }

      if (validTabs.length < tabs.length) {
        this.debugLog('Some tabs failed runtime validation', {
          total: tabs.length,
          valid: validTabs.length,
          invalid: tabs.length - validTabs.length
        });
      }

      return validTabs;

    } catch (error) {
      this.debugLog('Registry loading error', { error });
      throw error;
    }
  }

  /**
   * RUNTIME TAB VALIDATION
   * 
   * Validates individual tabs at runtime to catch configuration errors.
   */
  private static validateTabAtRuntime(tab: TabConfig): boolean {
    try {
      // Basic structure validation
      if (!tab.id || !tab.label || !tab.theme || !tab.accessibility) {
        this.debugLog('Tab failed basic validation', { tabId: tab.id, issues: 'Missing required fields' });
        return false;
      }

      // Theme validation
      if (!tab.theme.primary || !tab.theme.background || !tab.theme.border) {
        this.debugLog('Tab failed theme validation', { tabId: tab.id });
        return false;
      }

      // Accessibility validation
      if (!tab.accessibility.ariaLabel || !tab.accessibility.description) {
        this.debugLog('Tab failed accessibility validation', { tabId: tab.id });
        return false;
      }

      // Order validation
      if (typeof tab.order !== 'number' || tab.order < 0) {
        this.debugLog('Tab failed order validation', { tabId: tab.id, order: tab.order });
        return false;
      }

      // Permissions validation
      if (!Array.isArray(tab.permissions) || tab.permissions.length === 0) {
        this.debugLog('Tab failed permissions validation', { tabId: tab.id });
        return false;
      }

      return true;

    } catch (error) {
      this.debugLog('Tab validation error', { tabId: tab.id, error });
      return false;
    }
  }

  /**
   * CONFIGURATION CACHING
   * 
   * Caches successful configuration loads for performance optimization.
   */
  private static async cacheConfiguration(tabs: TabConfig[], options: UseTabConfigurationOptions): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(options);
      const now = Date.now();
      
      const cacheEntry: CacheEntry = {
        data: tabs,
        timestamp: now,
        ttl: options.cache?.ttl || 5 * 60 * 1000, // 5 minutes default
        hash: this.generateConfigHash(tabs),
        userPermissions: options.userPermissions || [],
        environment: process.env.NODE_ENV || 'development'
      };

      this.cache.set(cacheKey, cacheEntry);
      
      // Cache cleanup - remove expired entries
      this.cleanupCache();
      
      this.debugLog('Configuration cached', { 
        cacheKey, 
        tabCount: tabs.length,
        ttl: cacheEntry.ttl
      });

    } catch (error) {
      this.debugLog('Caching error', { error });
      // Don't fail the loading process for caching errors
    }
  }

  /**
   * CACHE KEY GENERATION
   * 
   * Generates unique cache keys based on loading options.
   */
  private static generateCacheKey(options: UseTabConfigurationOptions): string {
    const keyParts = [
      'tab-config',
      JSON.stringify(options.userPermissions || []),
      options.environment || process.env.NODE_ENV || 'development',
      options.enableSuggestions ? 'suggestions' : 'no-suggestions'
    ];
    return keyParts.join(':');
  }

  /**
   * CONFIGURATION HASH GENERATION
   * 
   * Generates hash for cache invalidation detection.
   */
  private static generateConfigHash(tabs: TabConfig[]): string {
    const configString = tabs.map(tab => `${tab.id}:${tab.order}:${tab.enabled}`).join('|');
    return btoa(configString).slice(0, 16); // Simple hash for cache invalidation
  }

  /**
   * CACHE VALIDATION
   * 
   * Validates cached configuration data integrity.
   */
  private static validateCachedConfiguration(tabs: TabConfig[]): boolean {
    try {
      if (!Array.isArray(tabs) || tabs.length === 0) {
        return false;
      }

      return tabs.every(tab => this.validateTabAtRuntime(tab));

    } catch (error) {
      this.debugLog('Cache validation error', { error });
      return false;
    }
  }

  /**
   * CACHE CLEANUP
   * 
   * Removes expired cache entries to prevent memory leaks.
   */
  private static cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      this.debugLog('Cache cleanup completed', { expiredEntries: expiredKeys.length });
    }
  }

  /**
   * CLEAR CACHE
   * 
   * Manual cache clearing for development and troubleshooting.
   */
  public static clearCache(): void {
    const cacheSize = this.cache.size;
    this.cache.clear();
    this.lastSuccessfulLoad = null;
    this.debugLog('Cache cleared', { previousSize: cacheSize });
  }

  /**
   * GET LOADING METRICS
   * 
   * Returns performance metrics for optimization analysis.
   */
  public static getLoadingMetrics(): LoadingMetrics[] {
    return [...this.loadingMetrics];
  }

  /**
   * GET CACHE STATUS
   * 
   * Returns current cache status for debugging.
   */
  public static getCacheStatus(): {
    size: number;
    entries: Array<{
      key: string;
      age: number;
      ttl: number;
      expired: boolean;
      tabCount: number;
    }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      ttl: entry.ttl,
      expired: now - entry.timestamp > entry.ttl,
      tabCount: entry.data.length
    }));

    return {
      size: this.cache.size,
      entries
    };
  }

  /**
   * DEBUG LOGGING
   * 
   * Controlled debug logging for development troubleshooting.
   */
  private static debugLog(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      if (data) {
        console.debug(`[ConfigLoader] ${message}`, data);
      } else {
        console.debug(`[ConfigLoader] ${message}`);
      }
    }
  }
}

/**
 * CONVENIENCE EXPORTS
 * 
 * Simplified interfaces for common use cases.
 */

/**
 * Simple configuration loading without options
 */
export const loadTabsConfiguration = async (): Promise<TabConfig[]> => {
  const result = await ConfigLoader.loadTabConfiguration();
  return result.tabs;
};

/**
 * Load configuration with permission filtering
 */
export const loadTabsForUser = async (permissions: string[]): Promise<TabConfig[]> => {
  const result = await ConfigLoader.loadTabConfiguration({ userPermissions: permissions });
  return result.tabs;
};

/**
 * Clear all cached configurations
 */
export const clearTabConfigurationCache = (): void => {
  ConfigLoader.clearCache();
};

/**
 * Get configuration loading performance metrics
 */
export const getConfigLoadingMetrics = (): LoadingMetrics[] => {
  return ConfigLoader.getLoadingMetrics();
};