/**
 * TAB CONFIGURATION - DECOMPOSED SYSTEM ENTRY POINT
 * 
 * This file serves as the new main entry point for the decomposed tab configuration system.
 * It provides a migration-friendly interface that maintains backward compatibility while
 * leveraging the enhanced capabilities of the new system.
 * 
 * MIGRATION STRATEGY:
 * 1. This file replaces the monolithic tab-config.ts
 * 2. Existing imports continue to work without modification
 * 3. New features are available through enhanced interfaces
 * 4. Gradual migration path allows incremental adoption
 * 
 * BACKWARD COMPATIBILITY:
 * - All existing exports are preserved with identical signatures
 * - Legacy interfaces continue to work as expected  
 * - Existing switch statements and validation patterns remain functional
 * - No breaking changes to consuming components
 * 
 * NEW FEATURES AVAILABLE:
 * - React hooks for configuration consumption (useTabConfiguration)
 * - Advanced validation and error handling
 * - Environment-specific configuration support
 * - Permission-based access control
 * - Intelligent time-based suggestions
 * - Performance optimization through caching
 * - Comprehensive health monitoring and diagnostics
 * 
 * USAGE PATTERNS:
 * 
 * LEGACY PATTERN (continues to work):
 * ```typescript
 * import { TAB_CONFIG, TabId, getAllTabIds } from '@/services/shared/tab-config';
 * const tabs = Object.values(TAB_CONFIG);
 * ```
 * 
 * ENHANCED PATTERN (recommended for new code):
 * ```typescript  
 * import { useTabConfiguration } from '@/services/shared/tab-config';
 * const { tabs, getSuggestedTab, healthStatus } = useTabConfiguration(userPermissions);
 * ```
 */
import { tabRegistry } from './TabRegistry';

// ENHANCED SYSTEM IMPORTS
export { tabRegistry } from './TabRegistry';
export { ConfigLoader } from './ConfigLoader';
export { 
  useTabConfiguration, 
  useTabList, 
  useTabSuggestion,
  useTabConfigHealth 
} from '../../lib/hooks/useTabConfiguration';

// TYPE SYSTEM EXPORTS
export type {
  TabConfig,
  TabTheme,
  TabAccessibility,
  TabTimeRange,
  TabRegistryConfig,
  TabLoadState,
  UseTabConfigurationOptions,
  LegacyTabId,
  LegacyTabConfig
} from '../types/tab-types';

// INDIVIDUAL TAB CONFIGURATIONS (for direct access if needed)
export { default as morningTabConfig } from './tabs/morning-tab-config';
export { default as lightWorkTabConfig } from './tabs/light-work-tab-config';
export { default as deepWorkTabConfig } from './tabs/deep-work-tab-config';
export { default as wellnessTabConfig } from './tabs/wellness-tab-config';
export { default as timeboxTabConfig } from './tabs/timebox-tab-config';
export { default as checkoutTabConfig } from './tabs/checkout-tab-config';

/**
 * BACKWARD COMPATIBILITY LAYER
 * 
 * Maintains exact compatibility with the original tab-config.ts interface.
 * This ensures existing code continues to work without modification.
 */

// Legacy TabId union type (exact match with original)
export type TabId = 
  | 'morning'
  | 'light-work' 
  | 'work'
  | 'wellness'
  | 'timebox'
  | 'checkout';

// Legacy TabConfig interface (exact match with original)  
export interface LegacyTabConfigInterface {
  id: TabId;
  name: string;
  icon: any; // LucideIcon type from original
  timeRelevance: number[];
  color: string;
  description: string;
  componentPath: string;
}

/**
 * TAB_CONFIG - Legacy Configuration Object
 * 
 * Provides the same TAB_CONFIG export that existing code expects.
 * Now backed by the enhanced registry system with validation and error handling.
 */
export const TAB_CONFIG: Record<TabId, LegacyTabConfigInterface> = {
  'morning': {
    id: 'morning',
    name: 'Morning',
    icon: null as any, // Will be populated by registry
    timeRelevance: [6, 7, 8, 9],
    color: 'from-orange-500 to-yellow-500',
    description: 'Morning routine and planning',
    componentPath: 'MorningRoutineSection'
  },
  'light-work': {
    id: 'light-work',
    name: 'Light Work',
    icon: null as any, // Will be populated by registry
    timeRelevance: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    color: 'from-emerald-500 to-teal-500',
    description: 'Light work tasks and activities',
    componentPath: 'LightFocusWorkSection'
  },
  'work': {
    id: 'work',
    name: 'Deep Work',
    icon: null as any, // Will be populated by registry  
    timeRelevance: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    color: 'from-purple-500 to-purple-600',
    description: 'Deep focus work sessions',
    componentPath: 'DeepFocusWorkSection'
  },
  'wellness': {
    id: 'wellness',
    name: 'Wellness',
    icon: null as any, // Will be populated by registry
    timeRelevance: [6, 7, 8, 12, 18, 19],
    color: 'from-green-500 to-emerald-500',
    description: 'Health, fitness, and wellness activities',
    componentPath: 'HomeWorkoutSection + HealthNonNegotiablesSection'
  },
  'timebox': {
    id: 'timebox',
    name: 'Time Box',
    icon: null as any, // Will be populated by registry
    timeRelevance: [8, 12, 17],
    color: 'from-purple-500 to-pink-500',
    description: 'Time blocking and schedule management',
    componentPath: 'TimeboxSection'
  },
  'checkout': {
    id: 'checkout',
    name: 'Checkout',
    icon: null as any, // Will be populated by registry
    timeRelevance: [18, 19, 20, 21],
    color: 'from-indigo-500 to-blue-600',
    description: 'Evening review and wrap-up',
    componentPath: 'NightlyCheckoutSection'
  }
};

/**
 * ENHANCED TAB_CONFIG WITH REGISTRY DATA
 * 
 * Populates the legacy TAB_CONFIG with actual data from the registry.
 * This ensures icons and other dynamic data are available.
 */
function populateTabConfigFromRegistry(): void {
  try {
    // Import dynamically to avoid circular import issues
    const registryTabs = tabRegistry.getAllTabs();
    
    registryTabs.forEach(tab => {
      if (TAB_CONFIG[tab.id as TabId]) {
        TAB_CONFIG[tab.id as TabId] = {
          ...TAB_CONFIG[tab.id as TabId],
          icon: tab.icon,
          // Preserve legacy format while adding registry data
          name: tab.label,
          timeRelevance: tab.timeRelevance || [],
          color: tab.color || tab.theme.gradient || '',
          description: tab.description || tab.accessibility.description,
          componentPath: tab.componentPath || ''
        };
      }
    });
  } catch (error) {
    console.warn('Failed to populate TAB_CONFIG from registry:', error);
    // Legacy config will work with placeholder data
  }
}

// Initialize enhanced config lazily
let isPopulated = false;
const ensurePopulated = () => {
  if (!isPopulated) {
    populateTabConfigFromRegistry();
    isPopulated = true;
  }
};

/**
 * UTILITY FUNCTIONS - Legacy Compatibility
 * 
 * Maintains exact compatibility with original utility functions.
 */
export const getAllTabIds = (): TabId[] => {
  ensurePopulated();
  try {
    return tabRegistry.getLegacyTabIds();
  } catch (error) {
    console.warn('Failed to get tab IDs from registry, using fallback:', error);
    return Object.keys(TAB_CONFIG) as TabId[];
  }
};

export const getTabConfig = (tabId: TabId): LegacyTabConfigInterface => {
  ensurePopulated();
  try {
    const tab = tabRegistry.getTab(tabId);
    if (tab) {
      return {
        id: tab.id as TabId,
        name: tab.label,
        icon: tab.icon,
        timeRelevance: tab.timeRelevance || [],
        color: tab.color || tab.theme.gradient || '',
        description: tab.description || tab.accessibility.description,
        componentPath: tab.componentPath || ''
      };
    }
  } catch (error) {
    console.warn(`Failed to get tab config from registry for ${tabId}:`, error);
  }
  
  // Fallback to legacy config
  return TAB_CONFIG[tabId];
};

export const isValidTabId = (tabId: string): tabId is TabId => {
  ensurePopulated();
  try {
    return tabRegistry.getTab(tabId) !== null;
  } catch (error) {
    console.warn('Failed to validate tab ID via registry:', error);
    return getAllTabIds().includes(tabId as TabId);
  }
};

/**
 * VALIDATION FUNCTION - Enhanced Version
 * 
 * Maintains legacy interface while adding enhanced validation capabilities.
 */
export const validateTabHandler = (handledTabs: Set<string>): string[] => {
  ensurePopulated();
  try {
    const allTabs = getAllTabIds();
    const missingTabs = allTabs.filter(tab => !handledTabs.has(tab));
    
    if (missingTabs.length > 0) {
      console.error('🚨 MISSING TAB HANDLERS:', missingTabs);
      console.error('📝 Add these cases to your switch statement:', missingTabs.map(tab => `case '${tab}':`));
      
      // Enhanced: Also check registry health
      try {
        const healthCheck = tabRegistry.healthCheck();
        if (!healthCheck.healthy) {
          console.warn('⚠️ TAB REGISTRY HEALTH ISSUES:', healthCheck.issues);
        }
      } catch (healthError) {
        console.warn('Failed to check registry health:', healthError);
      }
    }
    
    return missingTabs;
  } catch (error) {
    console.error('Error in tab validation:', error);
    return [];
  }
};

/**
 * RUNTIME GUARD - Enhanced Version
 * 
 * Maintains legacy interface with enhanced error reporting.
 */
export const assertExhaustive = (x: never): never => {
  const error = new Error(`Unhandled tab case: ${x}`);
  
  // Enhanced: Add debugging information in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 EXHAUSTIVE ASSERTION FAILED');
    console.error('Available tabs:', getAllTabIds());
    console.error('Registry health:', tabRegistry.healthCheck());
  }
  
  throw error;
};

/**
 * ENHANCED FEATURES - New Functionality
 * 
 * Additional features available in the enhanced system.
 * These are opt-in and don't affect existing code.
 */

/**
 * Get intelligent tab suggestion based on current time
 */
export const getSuggestedTab = (currentHour?: number): TabId => {
  ensurePopulated();
  try {
    const suggestion = tabRegistry.getSuggestedTab(currentHour);
    return suggestion as TabId;
  } catch (error) {
    console.warn('Failed to get tab suggestion:', error);
    return 'morning'; // Safe default
  }
};

/**
 * Get tabs filtered by user permissions
 */
export const getTabsForUser = (permissions: string[]): TabId[] => {
  ensurePopulated();
  try {
    const userTabs = tabRegistry.getTabsByPermission(permissions);
    return userTabs.map(tab => tab.id as TabId);
  } catch (error) {
    console.warn('Failed to get user tabs:', error);
    return getAllTabIds(); // Fallback to all tabs
  }
};

/**
 * Get system health status
 */
export const getSystemHealth = () => {
  ensurePopulated();
  try {
    return tabRegistry.healthCheck();
  } catch (error) {
    console.warn('Failed to get system health:', error);
    return {
      healthy: false,
      issues: ['Health check failed'],
      stats: {
        totalTabs: 0,
        enabledTabs: 0,
        validationErrors: 1,
        fallbacksUsed: 0
      }
    };
  }
};

/**
 * DEVELOPMENT UTILITIES
 * 
 * Additional utilities for development and debugging.
 */

/**
 * Debug: Get detailed tab information
 */
export const getDebugInfo = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  ensurePopulated();
  return {
    registryHealth: tabRegistry.healthCheck(),
    registryConfig: tabRegistry.getConfig(),
    cacheStatus: ConfigLoader.getCacheStatus(),
    loadingMetrics: ConfigLoader.getLoadingMetrics(),
    legacyCompatibility: {
      tabConfigKeys: Object.keys(TAB_CONFIG),
      allTabIds: getAllTabIds(),
      validationStatus: validateTabHandler(new Set(getAllTabIds()))
    }
  };
};

/**
 * MIGRATION HELPERS
 * 
 * Utilities to help with migrating from legacy to enhanced system.
 */

/**
 * Check if component is using legacy or enhanced patterns
 */
export const checkMigrationStatus = (componentName: string) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  console.group(`🔄 Migration Status: ${componentName}`);
  console.log('✅ Using decomposed tab-config system');
  console.log('📖 Migration guide: https://docs.your-domain.com/tab-config-migration');
  console.log('🎯 Consider using useTabConfiguration hook for enhanced features');
  console.groupEnd();
};

/**
 * DEFAULT EXPORT FOR CONVENIENCE
 * 
 * Provides a default export that includes the most commonly used features.
 */
export default {
  // Legacy compatibility
  TAB_CONFIG,
  getAllTabIds,
  getTabConfig,
  isValidTabId,
  validateTabHandler,
  assertExhaustive,
  
  // Enhanced features
  getSuggestedTab,
  getTabsForUser,
  getSystemHealth,
  
  // React hooks
  useTabConfiguration: useTabConfiguration,
  useTabList: useTabList,
  useTabSuggestion: useTabSuggestion,
  
  // Registry access
  tabRegistry: tabRegistry,
  
  // Development utilities
  getDebugInfo,
  checkMigrationStatus
};
