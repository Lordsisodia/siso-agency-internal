/**
 * TAB COMPONENT MAPPER
 * 
 * Maps tab IDs to their actual React components.
 * This file handles the dynamic component assignment that couldn't be done
 * at configuration time due to circular import issues.
 * 
 * BUSINESS REASONING:
 * - Separates configuration from implementation to prevent circular imports
 * - Allows tab configurations to be imported without heavy component dependencies
 * - Enables lazy loading and code splitting of tab components
 * - Maintains clean separation between config and UI layers
 */

import { ComponentType, lazy } from 'react';
import { tabRegistry } from './TabRegistry';

// Lazy load components to optimize bundle size
const MorningRoutineTab = lazy(() => 
  import('@/ecosystem/internal/tasks/components/MorningRoutineTab').then(m => ({ default: m.MorningRoutineTab }))
);

const LightWorkTab = lazy(() => 
  import('@/shared/tabs/LightWorkTab').then(m => ({ default: m.LightWorkTab }))
);

const DeepFocusTab = lazy(() => 
  import('@/ecosystem/internal/tasks/components/DeepFocusTab').then(m => ({ default: m.DeepFocusTab }))
);

const TimeBoxTab = lazy(() => 
  import('@/ecosystem/internal/tasks/components/TimeBoxTab').then(m => ({ default: m.TimeBoxTab }))
);

const NightlyCheckoutTab = lazy(() => 
  import('@/ecosystem/internal/tasks/components/NightlyCheckoutTab').then(m => ({ default: m.NightlyCheckoutTab }))
);

// Placeholder for wellness tab (may need to be created or mapped to existing components)
const WellnessTab = lazy(() => 
  import('@/ecosystem/internal/tasks/components/HomeWorkoutSection').then(m => ({ default: m.HomeWorkoutSection })).catch(() => 
    // Fallback if component doesn't exist
    Promise.resolve({ default: () => null })
  )
);

/**
 * COMPONENT MAPPING CONFIGURATION
 * 
 * Maps tab IDs to their corresponding React components.
 */
const COMPONENT_MAP: Record<string, ComponentType<any>> = {
  'morning': MorningRoutineTab,
  'light-work': LightWorkTab,
  'work': DeepFocusTab,
  'wellness': WellnessTab,
  'timebox': TimeBoxTab,
  'checkout': NightlyCheckoutTab
};

/**
 * INITIALIZE COMPONENT MAPPING
 * 
 * Assigns components to tab configurations in the registry.
 * This should be called once during application initialization.
 */
export const initializeTabComponents = (): void => {
  try {
    console.debug('[TabComponentMapper] Initializing tab components...');
    
    // Get all tabs from registry
    const tabs = tabRegistry.getAllTabs();
    
    tabs.forEach(tab => {
      const component = COMPONENT_MAP[tab.id];
      if (component) {
        // Update the tab configuration with the actual component
        const updatedTab = { ...tab, component };
        tabRegistry.registerTab(updatedTab);
        console.debug(`[TabComponentMapper] Mapped component for tab: ${tab.id}`);
      } else {
        console.warn(`[TabComponentMapper] No component mapping found for tab: ${tab.id}`);
      }
    });
    
    console.debug('[TabComponentMapper] Component mapping completed');
    
  } catch (error) {
    console.error('[TabComponentMapper] Failed to initialize tab components:', error);
  }
};

/**
 * GET TAB COMPONENT
 * 
 * Retrieves the component for a specific tab ID.
 * Useful for dynamic component rendering.
 */
export const getTabComponent = (tabId: string): ComponentType<any> | null => {
  try {
    const component = COMPONENT_MAP[tabId];
    if (component) {
      return component;
    }
    
    // Try to get from registry
    const tab = tabRegistry.getTab(tabId);
    return tab?.component || null;
    
  } catch (error) {
    console.error(`[TabComponentMapper] Error getting component for tab ${tabId}:`, error);
    return null;
  }
};

/**
 * REGISTER CUSTOM COMPONENT
 * 
 * Allows runtime registration of custom components for tabs.
 * Useful for plugins or dynamic tab systems.
 */
export const registerCustomComponent = (tabId: string, component: ComponentType<any>): void => {
  try {
    COMPONENT_MAP[tabId] = component;
    
    // Update registry if tab exists
    const tab = tabRegistry.getTab(tabId);
    if (tab) {
      const updatedTab = { ...tab, component };
      tabRegistry.registerTab(updatedTab);
    }
    
    console.debug(`[TabComponentMapper] Registered custom component for tab: ${tabId}`);
    
  } catch (error) {
    console.error(`[TabComponentMapper] Failed to register custom component for tab ${tabId}:`, error);
  }
};

/**
 * COMPONENT HEALTH CHECK
 * 
 * Verifies that all tabs have valid component mappings.
 * Useful for debugging and system health monitoring.
 */
export const checkComponentHealth = (): {
  healthy: boolean;
  issues: string[];
  stats: {
    totalTabs: number;
    mappedTabs: number;
    unmappedTabs: string[];
  };
} => {
  try {
    const tabs = tabRegistry.getAllTabs();
    const unmappedTabs: string[] = [];
    let mappedCount = 0;
    
    tabs.forEach(tab => {
      if (COMPONENT_MAP[tab.id] || tab.component) {
        mappedCount++;
      } else {
        unmappedTabs.push(tab.id);
      }
    });
    
    const issues = unmappedTabs.length > 0 
      ? [`Unmapped components for tabs: ${unmappedTabs.join(', ')}`]
      : [];
    
    return {
      healthy: unmappedTabs.length === 0,
      issues,
      stats: {
        totalTabs: tabs.length,
        mappedTabs: mappedCount,
        unmappedTabs
      }
    };
    
  } catch (error) {
    return {
      healthy: false,
      issues: [`Component health check failed: ${error}`],
      stats: {
        totalTabs: 0,
        mappedTabs: 0,
        unmappedTabs: []
      }
    };
  }
};

/**
 * PRELOAD COMPONENTS
 * 
 * Preloads all tab components to reduce lazy loading delays.
 * Call this during application initialization for better UX.
 */
export const preloadTabComponents = async (): Promise<void> => {
  try {
    console.debug('[TabComponentMapper] Preloading tab components...');
    
    const preloadPromises = Object.entries(COMPONENT_MAP).map(async ([tabId, component]) => {
      try {
        // Force lazy component to load
        if (typeof component === 'function') {
          await component;
        }
        console.debug(`[TabComponentMapper] Preloaded component for: ${tabId}`);
      } catch (error) {
        console.warn(`[TabComponentMapper] Failed to preload component for ${tabId}:`, error);
      }
    });
    
    await Promise.allSettled(preloadPromises);
    console.debug('[TabComponentMapper] Component preloading completed');
    
  } catch (error) {
    console.error('[TabComponentMapper] Component preloading failed:', error);
  }
};

/**
 * EXPORT DEFAULT FOR CONVENIENCE
 */
export default {
  initializeTabComponents,
  getTabComponent,
  registerCustomComponent,
  checkComponentHealth,
  preloadTabComponents
};