/**
 * USE TAB CONFIGURATION HOOK
 * 
 * React hook for consuming tab configurations with comprehensive state management,
 * error handling, and performance optimization. This hook replaces direct imports
 * of tab-config.ts and provides:
 * 
 * CORE FEATURES:
 * - Reactive loading states with proper error boundaries
 * - Automatic retry logic with exponential backoff
 * - Permission-based filtering for role-based access
 * - Real-time suggestions based on time and context
 * - Performance optimization with intelligent caching
 * - Development debugging and health monitoring
 * 
 * BUSINESS REASONING:
 * - Provides consistent UX with loading states and error handling
 * - Enables personalization through permission and preference filtering
 * - Optimizes performance through caching and memoization
 * - Supports A/B testing and gradual feature rollouts
 * - Maintains system reliability with comprehensive error recovery
 * 
 * USAGE PATTERNS:
 * - Replace direct tab-config imports with this hook
 * - Combine with React Suspense for optimized loading UX
 * - Use suggestions for intelligent default tab selection
 * - Leverage error states for graceful degradation
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  TabConfig, 
  TabLoadState, 
  UseTabConfigurationOptions,
  TabRegistryEvents 
} from '../types/tab-types';
import { ConfigLoader } from '../services/ConfigLoader';
import { tabRegistry } from '../services/TabRegistry';

/**
 * HOOK RETURN INTERFACE
 * 
 * Complete interface returned by useTabConfiguration hook.
 */
interface UseTabConfigurationReturn {
  // Core data
  tabs: TabConfig[];
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  isReloading: boolean;
  
  // Status indicators
  usingFallback: boolean;
  warnings: string[];
  lastUpdated: Date | null;
  
  // Utility functions
  getSuggestedTab: () => string;
  getTabConfig: (tabId: string) => TabConfig | null;
  isValidTabId: (tabId: string) => boolean;
  
  // Control functions
  refresh: () => Promise<void>;
  clearCache: () => void;
  
  // Health monitoring
  healthStatus: {
    healthy: boolean;
    issues: string[];
    loadTime?: number;
  };
  
  // Legacy compatibility
  legacyTabConfig: Record<string, any>;
  legacyTabIds: string[];
}

/**
 * RETRY CONFIGURATION
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryCount: number;
}

/**
 * USE TAB CONFIGURATION HOOK
 * 
 * Main hook for tab configuration management with comprehensive features.
 */
export const useTabConfiguration = (
  options: UseTabConfigurationOptions = {}
): UseTabConfigurationReturn => {
  
  // Core state management
  const [tabs, setTabs] = useState<TabConfig[]>([]);
  const [loadState, setLoadState] = useState<TabLoadState>({
    isLoading: true,
    error: null,
    usingFallback: false,
    warnings: []
  });
  const [isReloading, setIsReloading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [healthStatus, setHealthStatus] = useState<{
    healthy: boolean;
    issues: string[];
    loadTime?: number;
  }>({ healthy: true, issues: [] });

  // Refs for cleanup and optimization
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingAbortRef = useRef<AbortController | null>(null);
  const retryConfigRef = useRef<RetryConfig>({
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    retryCount: 0
  });

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => ({
    userPermissions: options.userPermissions || ['user'],
    environment: options.environment,
    enableSuggestions: options.enableSuggestions !== false, // Default true
    customFilter: options.customFilter,
    cache: {
      enabled: options.cache?.enabled !== false, // Default true
      ttl: options.cache?.ttl || 5 * 60 * 1000, // 5 minutes default
      ...options.cache
    }
  }), [
    JSON.stringify(options.userPermissions),
    options.environment,
    options.enableSuggestions,
    options.customFilter,
    options.cache?.enabled,
    options.cache?.ttl
  ]);

  /**
   * CORE LOADING FUNCTION
   * 
   * Handles the main configuration loading with retry logic and error handling.
   */
  const loadConfiguration = useCallback(async (isRefresh = false) => {
    debugLog('Starting configuration load', { isRefresh, options: memoizedOptions });
    
    // Abort any existing loading operation
    if (loadingAbortRef.current) {
      loadingAbortRef.current.abort();
    }
    loadingAbortRef.current = new AbortController();
    
    if (isRefresh) {
      setIsReloading(true);
    } else {
      setLoadState(prev => ({ ...prev, isLoading: true, error: null }));
    }

    const startTime = Date.now();

    try {
      const result = await ConfigLoader.loadTabConfiguration(memoizedOptions);
      
      // Check if operation was aborted
      if (loadingAbortRef.current?.signal.aborted) {
        debugLog('Load operation was aborted');
        return;
      }

      const loadTime = Date.now() - startTime;
      debugLog('Configuration loaded successfully', { 
        tabCount: result.tabs.length,
        loadTime,
        source: result.metrics.source,
        cacheHit: result.metrics.cacheHit
      });

      // Update state with successful load
      setTabs(result.tabs);
      setLoadState(result.loadState);
      setLastUpdated(new Date());
      setHealthStatus({
        healthy: result.loadState.error === null,
        issues: result.loadState.warnings,
        loadTime
      });

      // Reset retry counter on success
      retryConfigRef.current.retryCount = 0;

    } catch (error) {
      debugLog('Configuration loading failed', { error });
      
      // Don't update state if operation was aborted
      if (loadingAbortRef.current?.signal.aborted) {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Configuration loading failed';
      
      setLoadState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        usingFallback: true,
        warnings: [...prev.warnings, 'Automatic retry will be attempted']
      }));

      setHealthStatus({
        healthy: false,
        issues: [errorMessage],
        loadTime: Date.now() - startTime
      });

      // Attempt retry with exponential backoff
      await attemptRetry();
    } finally {
      setIsReloading(false);
      loadingAbortRef.current = null;
    }
  }, [memoizedOptions]);

  /**
   * RETRY LOGIC
   * 
   * Implements exponential backoff retry strategy for failed loads.
   */
  const attemptRetry = useCallback(async () => {
    const retryConfig = retryConfigRef.current;
    
    if (retryConfig.retryCount >= retryConfig.maxRetries) {
      debugLog('Max retries exceeded', { retryCount: retryConfig.retryCount });
      return;
    }

    const delay = Math.min(
      retryConfig.baseDelay * Math.pow(2, retryConfig.retryCount),
      retryConfig.maxDelay
    );

    retryConfig.retryCount++;
    debugLog('Scheduling retry', { 
      attempt: retryConfig.retryCount,
      delay,
      maxRetries: retryConfig.maxRetries
    });

    retryTimeoutRef.current = setTimeout(() => {
      debugLog('Executing retry', { attempt: retryConfig.retryCount });
      loadConfiguration(false);
    }, delay);
  }, [loadConfiguration]);

  /**
   * MANUAL REFRESH FUNCTION
   * 
   * Allows manual refresh of configuration with cache clearing.
   */
  const refresh = useCallback(async () => {
    debugLog('Manual refresh requested');
    
    // Clear cache to force fresh load
    ConfigLoader.clearCache();
    
    // Reset retry counter
    retryConfigRef.current.retryCount = 0;
    
    await loadConfiguration(true);
  }, [loadConfiguration]);

  /**
   * CLEAR CACHE FUNCTION
   * 
   * Clears configuration cache and optionally reloads.
   */
  const clearCache = useCallback(() => {
    debugLog('Clearing cache');
    ConfigLoader.clearCache();
    setLastUpdated(null);
  }, []);

  /**
   * GET SUGGESTED TAB
   * 
   * Returns intelligent tab suggestion based on current time and context.
   */
  const getSuggestedTab = useCallback((): string => {
    if (!memoizedOptions.enableSuggestions) {
      return tabs.length > 0 ? tabs[0].id : 'morning';
    }

    try {
      const suggestion = tabRegistry.getSuggestedTab();
      debugLog('Tab suggestion generated', { suggestion });
      return suggestion;
    } catch (error) {
      debugLog('Error getting tab suggestion', { error });
      return tabs.length > 0 ? tabs[0].id : 'morning';
    }
  }, [tabs, memoizedOptions.enableSuggestions]);

  /**
   * GET TAB CONFIG
   * 
   * Retrieves specific tab configuration by ID.
   */
  const getTabConfig = useCallback((tabId: string): TabConfig | null => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      debugLog('Tab config found', { tabId });
      return tab;
    }
    
    debugLog('Tab config not found', { tabId, availableTabs: tabs.map(t => t.id) });
    return null;
  }, [tabs]);

  /**
   * IS VALID TAB ID
   * 
   * Checks if a tab ID exists in the current configuration.
   */
  const isValidTabId = useCallback((tabId: string): boolean => {
    const isValid = tabs.some(tab => tab.id === tabId);
    debugLog('Tab ID validation', { tabId, isValid });
    return isValid;
  }, [tabs]);

  /**
   * LEGACY COMPATIBILITY
   * 
   * Provides backward compatibility with original tab-config.ts format.
   */
  const legacyTabConfig = useMemo(() => {
    const legacy: Record<string, any> = {};
    tabs.forEach(tab => {
      legacy[tab.id] = {
        id: tab.id,
        name: tab.label,
        icon: tab.icon,
        timeRelevance: tab.timeRelevance || [],
        color: tab.color || tab.theme.gradient || '',
        description: tab.description || tab.accessibility.description,
        componentPath: tab.componentPath || ''
      };
    });
    return legacy;
  }, [tabs]);

  const legacyTabIds = useMemo(() => {
    return tabs.map(tab => tab.id);
  }, [tabs]);

  /**
   * REGISTRY EVENT LISTENERS
   * 
   * Listen for registry events to keep hook state synchronized.
   */
  useEffect(() => {
    const handleTabRegistered = (event: TabRegistryEvents['tab:registered']) => {
      debugLog('Tab registered event', { tabId: event.tab.id });
      // Optionally reload configuration when new tabs are registered
      if (memoizedOptions.cache?.enabled) {
        loadConfiguration(true);
      }
    };

    const handleTabUnregistered = (event: TabRegistryEvents['tab:unregistered']) => {
      debugLog('Tab unregistered event', { tabId: event.tabId });
      // Remove unregistered tab from current state
      setTabs(prev => prev.filter(tab => tab.id !== event.tabId));
    };

    const handleValidationFailed = (event: TabRegistryEvents['validation:failed']) => {
      debugLog('Validation failed event', { tabId: event.tabId, errors: event.errors });
      setLoadState(prev => ({
        ...prev,
        warnings: [...prev.warnings, `Tab ${event.tabId} validation failed`]
      }));
    };

    // Subscribe to events
    tabRegistry.on('tab:registered', handleTabRegistered);
    tabRegistry.on('tab:unregistered', handleTabUnregistered);
    tabRegistry.on('validation:failed', handleValidationFailed);

    // Cleanup listeners
    return () => {
      tabRegistry.off('tab:registered', handleTabRegistered);
      tabRegistry.off('tab:unregistered', handleTabUnregistered);
      tabRegistry.off('validation:failed', handleValidationFailed);
    };
  }, [memoizedOptions.cache?.enabled, loadConfiguration]);

  /**
   * INITIAL LOAD EFFECT
   * 
   * Triggers initial configuration loading when component mounts or options change.
   */
  useEffect(() => {
    debugLog('Triggering initial load', { options: memoizedOptions });
    loadConfiguration(false);

    // Cleanup function
    return () => {
      // Clear retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      // Abort any ongoing loading
      if (loadingAbortRef.current) {
        loadingAbortRef.current.abort();
        loadingAbortRef.current = null;
      }
    };
  }, [loadConfiguration]);

  /**
   * DEBUG LOGGING
   * 
   * Development logging for troubleshooting.
   */
  const debugLog = (message: string, data?: any): void => {
    if (process.env.NODE_ENV === 'development') {
      if (data) {
        console.debug(`[useTabConfiguration] ${message}`, data);
      } else {
        console.debug(`[useTabConfiguration] ${message}`);
      }
    }
  };

  // Return hook interface
  return {
    // Core data
    tabs,
    
    // Loading states
    isLoading: loadState.isLoading,
    error: loadState.error,
    isReloading,
    
    // Status indicators
    usingFallback: loadState.usingFallback,
    warnings: loadState.warnings,
    lastUpdated,
    
    // Utility functions
    getSuggestedTab,
    getTabConfig,
    isValidTabId,
    
    // Control functions
    refresh,
    clearCache,
    
    // Health monitoring
    healthStatus,
    
    // Legacy compatibility
    legacyTabConfig,
    legacyTabIds
  };
};

/**
 * SIMPLIFIED HOOK FOR BASIC USAGE
 * 
 * Simplified version for components that just need basic tab list.
 */
export const useTabList = (userPermissions?: string[]): TabConfig[] => {
  const { tabs } = useTabConfiguration({ userPermissions });
  return tabs;
};

/**
 * HOOK FOR TAB SUGGESTIONS
 * 
 * Specialized hook for getting intelligent tab suggestions.
 */
export const useTabSuggestion = (): string => {
  const { getSuggestedTab, isLoading } = useTabConfiguration({ 
    enableSuggestions: true 
  });
  
  // Return suggestion or default while loading
  return isLoading ? 'morning' : getSuggestedTab();
};

/**
 * HOOK FOR HEALTH MONITORING
 * 
 * Specialized hook for monitoring tab configuration health.
 */
export const useTabConfigHealth = () => {
  const { healthStatus, warnings, error, usingFallback } = useTabConfiguration();
  
  return {
    ...healthStatus,
    warnings,
    error,
    usingFallback,
    overall: {
      status: healthStatus.healthy && !error ? 'healthy' : 'degraded',
      severity: error ? 'error' : warnings.length > 0 ? 'warning' : 'info'
    }
  };
};