/**
 * Integration Setup
 * Utilities for integrating new task system with existing codebase
 */

import { Task, TaskFilters, TaskViewType } from '../types/task.types';

// Integration configuration
export interface IntegrationConfig {
  enableLegacySupport: boolean;
  migrateExistingData: boolean;
  preserveExistingRoutes: boolean;
  enableProgressiveUpgrade: boolean;
  fallbackToLegacy: boolean;
  debugMode: boolean;
}

// Default integration configuration
export const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig = {
  enableLegacySupport: true,
  migrateExistingData: true,
  preserveExistingRoutes: true,
  enableProgressiveUpgrade: true,
  fallbackToLegacy: true,
  debugMode: process.env.NODE_ENV === 'development'
};

/**
 * Setup function to initialize new task system alongside existing one
 */
export const setupTasksIntegration = (config: Partial<IntegrationConfig> = {}) => {
  const finalConfig = { ...DEFAULT_INTEGRATION_CONFIG, ...config };
  
  if (finalConfig.debugMode) {
    console.log('🚀 Initializing Tasks Integration with config:', finalConfig);
  }

  // Add CSS classes for new system
  addTasksSystemStyles();
  
  // Setup route handlers if needed
  if (finalConfig.preserveExistingRoutes) {
    setupRouteCompatibility();
  }
  
  // Setup global event handlers
  setupGlobalEventHandlers();
  
  if (finalConfig.debugMode) {
    console.log('✅ Tasks Integration setup complete');
  }
  
  return finalConfig;
};

/**
 * Add CSS classes for new task system
 */
const addTasksSystemStyles = () => {
  if (typeof document === 'undefined') return;
  
  const existingStyle = document.getElementById('tasks-integration-styles');
  if (existingStyle) return;

  const style = document.createElement('style');
  style.id = 'tasks-integration-styles';
  style.textContent = `
    .tasks-legacy-hidden {
      display: none !important;
    }
    
    .tasks-new-system {
      opacity: 1;
      transition: opacity 0.3s ease-in-out;
    }
    
    .tasks-loading {
      opacity: 0.7;
      pointer-events: none;
    }
    
    .tasks-error {
      border: 2px solid #ef4444;
      background-color: #fef2f2;
    }
    
    .tasks-migration-notice {
      background: linear-gradient(90deg, #f59e0b, #f97316);
      color: white;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      text-align: center;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
    }
  `;
  
  document.head.appendChild(style);
};

/**
 * Setup route compatibility for gradual migration
 */
const setupRouteCompatibility = () => {
  if (typeof window === 'undefined') return;
  
  // Legacy route mappings
  const routeMappings = {
    '/admin/tasks': '/admin/tasks-new',
    '/tasks': '/tasks-new',
    '/projects/tasks': '/projects/tasks-new'
  };
  
  // Intercept navigation to legacy routes
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(state, title, url) {
    const newUrl = mapLegacyRoute(url as string);
    return originalPushState.call(history, state, title, newUrl);
  };
  
  history.replaceState = function(state, title, url) {
    const newUrl = mapLegacyRoute(url as string);
    return originalReplaceState.call(history, state, title, newUrl);
  };
  
  function mapLegacyRoute(url: string): string {
    const path = new URL(url, window.location.origin).pathname;
    return routeMappings[path] || url;
  }
};

/**
 * Setup global event handlers for system integration
 */
const setupGlobalEventHandlers = () => {
  if (typeof window === 'undefined') return;
  
  // Listen for task updates from legacy system
  window.addEventListener('legacy-task-update', (event: any) => {
    const taskData = event.detail;
    console.log('Legacy task update received:', taskData);
    
    // Dispatch to new system
    window.dispatchEvent(new CustomEvent('tasks-system-update', {
      detail: { source: 'legacy', data: taskData }
    }));
  });
  
  // Listen for new system events
  window.addEventListener('tasks-system-update', (event: any) => {
    const { source, data } = event.detail;
    console.log(`Task system update from ${source}:`, data);
  });
  
  // Listen for navigation events
  window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    if (path.includes('/tasks')) {
      console.log('Task-related navigation detected:', path);
    }
  });
};

/**
 * Progressive upgrade utility
 */
export const enableProgressiveUpgrade = () => {
  // Check if user has opted into new system
  const hasOptedIn = localStorage.getItem('tasks-new-system-enabled') === 'true';
  
  if (hasOptedIn) {
    // Hide legacy task components
    hideLegacyComponents();
    showNewSystemComponents();
  } else {
    // Show upgrade prompt
    showUpgradePrompt();
  }
};

/**
 * Hide legacy task components
 */
const hideLegacyComponents = () => {
  if (typeof document === 'undefined') return;
  
  const legacySelectors = [
    '.admin-tasks-legacy',
    '.task-item-legacy',
    '.task-list-legacy',
    '[data-legacy-tasks]'
  ];
  
  legacySelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.add('tasks-legacy-hidden');
    });
  });
};

/**
 * Show new system components
 */
const showNewSystemComponents = () => {
  if (typeof document === 'undefined') return;
  
  const newSystemSelectors = [
    '.tasks-new-system',
    '[data-new-tasks]'
  ];
  
  newSystemSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.remove('tasks-legacy-hidden');
      el.classList.add('tasks-new-system');
    });
  });
};

/**
 * Show upgrade prompt to users
 */
const showUpgradePrompt = () => {
  if (typeof document === 'undefined') return;
  
  const existingPrompt = document.getElementById('tasks-upgrade-prompt');
  if (existingPrompt) return;
  
  const prompt = document.createElement('div');
  prompt.id = 'tasks-upgrade-prompt';
  prompt.className = 'tasks-migration-notice';
  prompt.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
      <span>🚀 New improved task system available!</span>
      <button 
        onclick="enableNewTaskSystem()" 
        style="background: white; color: #f97316; border: none; padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-weight: 600; cursor: pointer;"
      >
        Try it now
      </button>
      <button 
        onclick="dismissUpgradePrompt()" 
        style="background: transparent; color: white; border: 1px solid white; padding: 0.25rem 0.75rem; border-radius: 0.375rem; cursor: pointer;"
      >
        Later
      </button>
    </div>
  `;
  
  document.body.appendChild(prompt);
  
  // Add global functions for prompt interaction
  (window as any).enableNewTaskSystem = () => {
    localStorage.setItem('tasks-new-system-enabled', 'true');
    enableProgressiveUpgrade();
    dismissUpgradePrompt();
  };
  
  (window as any).dismissUpgradePrompt = () => {
    const prompt = document.getElementById('tasks-upgrade-prompt');
    if (prompt) {
      prompt.remove();
    }
  };
};

/**
 * Migration status checker
 */
export const checkMigrationStatus = () => {
  return {
    newSystemEnabled: localStorage.getItem('tasks-new-system-enabled') === 'true',
    legacyDataPresent: checkForLegacyData(),
    migrationRequired: checkMigrationRequired(),
    compatibilityMode: DEFAULT_INTEGRATION_CONFIG.enableLegacySupport
  };
};

/**
 * Check for legacy data in local storage or DOM
 */
const checkForLegacyData = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check localStorage for legacy task data
  const legacyKeys = [
    'tasks-data',
    'admin-tasks',
    'task-filters',
    'task-preferences'
  ];
  
  const hasLegacyStorage = legacyKeys.some(key => 
    localStorage.getItem(key) !== null
  );
  
  // Check DOM for legacy components
  const legacySelectors = [
    '.admin-tasks-legacy',
    '.task-item-legacy',
    '[data-legacy-tasks]'
  ];
  
  const hasLegacyComponents = legacySelectors.some(selector =>
    document.querySelector(selector) !== null
  );
  
  return hasLegacyStorage || hasLegacyComponents;
};

/**
 * Check if migration is required
 */
const checkMigrationRequired = (): boolean => {
  const newSystemEnabled = localStorage.getItem('tasks-new-system-enabled') === 'true';
  const hasLegacyData = checkForLegacyData();
  
  return !newSystemEnabled && hasLegacyData;
};

/**
 * Utility to safely access legacy task data
 */
export const getLegacyTaskData = (): any[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem('tasks-data') || 
                  localStorage.getItem('admin-tasks') ||
                  '[]';
    return JSON.parse(data);
  } catch (error) {
    console.warn('Failed to parse legacy task data:', error);
    return [];
  }
};

/**
 * Bridge function to communicate between old and new systems
 */
export const createSystemBridge = () => {
  return {
    // Send data from new system to legacy
    syncToLegacy: (task: Task) => {
      window.dispatchEvent(new CustomEvent('new-task-update', {
        detail: task
      }));
    },
    
    // Receive data from legacy system
    onLegacyUpdate: (callback: (data: any) => void) => {
      window.addEventListener('legacy-task-update', (event: any) => {
        callback(event.detail);
      });
    },
    
    // Check if legacy system is present
    isLegacyPresent: () => {
      return checkForLegacyData();
    },
    
    // Get migration status
    getMigrationStatus: checkMigrationStatus
  };
};

export default {
  setupTasksIntegration,
  enableProgressiveUpgrade,
  checkMigrationStatus,
  getLegacyTaskData,
  createSystemBridge
};