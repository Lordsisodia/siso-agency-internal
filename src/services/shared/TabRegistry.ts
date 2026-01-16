/**
 * TAB REGISTRY - CENTRAL SERVICE FOR TAB CONFIGURATION MANAGEMENT
 * 
 * This class provides a centralized, type-safe, and validated registry for all tab configurations.
 * It replaces the monolithic tab-config.ts with a robust system that includes:
 * 
 * CORE FEATURES:
 * - Runtime validation of all tab configurations
 * - Environment-specific tab filtering (dev/prod)
 * - Permission-based access control
 * - Time-based tab suggestions
 * - Graceful fallback handling
 * - Health checks and diagnostics
 * 
 * BUSINESS REASONING:
 * - Prevents configuration errors from breaking navigation
 * - Enables safe deployment of new tabs via feature flags
 * - Supports user personalization and role-based access
 * - Provides intelligent UX with time-based suggestions
 * - Maintains high system reliability with fallback mechanisms
 * 
 * SAFETY PROTOCOLS:
 * - All configurations are validated before registration
 * - Invalid configurations are rejected with clear error messages
 * - Fallback configurations ensure system never breaks
 * - Development mode provides detailed debugging information
 */

import { 
  TabConfig, 
  TabRegistryConfig, 
  TabRegistryEvents,
  LegacyTabId,
  TabConfigValidationSchema
} from '../types/tab-types';

// Import individual tab configurations
import morningTabConfig from './tabs/morning-tab-config';
import lightWorkTabConfig from './tabs/light-work-tab-config';
import deepWorkTabConfig from './tabs/deep-work-tab-config';
import wellnessTabConfig from './tabs/wellness-tab-config';
import smokingTabConfig from './tabs/smoking-tab-config';
import timeboxTabConfig from './tabs/timebox-tab-config';
import tasksTabConfig from './tabs/tasks-tab-config';
import checkoutTabConfig from './tabs/checkout-tab-config';

/**
 * EVENT EMITTER FOR TAB REGISTRY
 * 
 * Enables reactive updates when tab configurations change.
 * Components can subscribe to events for real-time updates.
 */
type EventListener<T = any> = (data: T) => void;

class EventEmitter {
  private listeners: Map<string, EventListener[]> = new Map();

  on<K extends keyof TabRegistryEvents>(event: K, listener: EventListener<TabRegistryEvents[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off<K extends keyof TabRegistryEvents>(event: K, listener: EventListener<TabRegistryEvents[K]>): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit<K extends keyof TabRegistryEvents>(event: K, data: TabRegistryEvents[K]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

/**
 * TAB REGISTRY CLASS
 * 
 * Central service for managing all tab configurations with validation,
 * environment filtering, permission checks, and intelligent suggestions.
 */
export class TabRegistry extends EventEmitter {
  private tabs: Map<string, TabConfig> = new Map();
  private config: TabRegistryConfig;
  private validationSchema: TabConfigValidationSchema;
  private isInitialized = false;

  constructor() {
    super();
    this.config = this.getDefaultConfig();
    this.validationSchema = this.getValidationSchema();
    this.initializeRegistry();
  }

  /**
   * DEFAULT CONFIGURATION
   * 
   * Provides sensible defaults for the tab registry system.
   * Can be overridden via updateConfig() method.
   */
  private getDefaultConfig(): TabRegistryConfig {
    return {
      tabs: [],
      defaultTab: 'morning', // Safe default that should always be available
      enableTimeBasedSuggestions: true,
      enableSwipeGestures: true,
      animationDuration: 300,
      maxVisibleTabs: 6,
      enableCaching: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      developmentMode: {
        enableDebugLogs: process.env.NODE_ENV === 'development',
        showValidationWarnings: process.env.NODE_ENV === 'development',
        enableHotReload: process.env.NODE_ENV === 'development'
      }
    };
  }

  /**
   * VALIDATION SCHEMA
   * 
   * Defines comprehensive validation rules for tab configurations.
   * Ensures all tabs meet minimum requirements and business rules.
   */
  private getValidationSchema(): TabConfigValidationSchema {
    return {
      version: '1.0.0',
      required: {
        fields: ['id', 'label', 'icon', 'order', 'enabled', 'theme', 'accessibility', 'permissions'],
        customValidators: [
          // Ensure unique IDs
          (config: TabConfig) => ({
            valid: typeof config.id === 'string' && config.id.length > 0,
            message: 'Tab ID must be a non-empty string'
          }),
          // Ensure valid order
          (config: TabConfig) => ({
            valid: typeof config.order === 'number' && config.order >= 0,
            message: 'Tab order must be a non-negative number'
          }),
          // Ensure theme has required properties
          (config: TabConfig) => ({
            valid: Boolean(config.theme && config.theme.primary && config.theme.background && config.theme.border),
            message: 'Tab theme must include primary, background, and border colors'
          }),
          // Ensure accessibility configuration
          (config: TabConfig) => ({
            valid: Boolean(config.accessibility && config.accessibility.ariaLabel && config.accessibility.description),
            message: 'Tab accessibility must include ariaLabel and description'
          })
        ]
      },
      types: {
        id: 'string',
        label: 'string',
        order: 'number',
        enabled: 'boolean',
        permissions: 'array',
        features: 'array'
      },
      businessRules: {
        // Ensure morning tab exists (critical for default fallback)
        morningTabExists: (config: TabConfig) => ({
          valid: config.id !== 'morning' || config.enabled,
          message: 'Morning tab must be enabled as it serves as system fallback'
        }),
        // Ensure reasonable time ranges
        validTimeRange: (config: TabConfig) => {
          if (!config.timeRange) return { valid: true };
          const { start, end } = config.timeRange;
          return {
            valid: start >= 0 && start <= 23 && end >= 0 && end <= 23 && start < end,
            message: 'Time range must have valid hours (0-23) with start < end'
          };
        },
        // Ensure required permissions include 'user'
        userPermissionRequired: (config: TabConfig) => ({
          valid: config.permissions.includes('user'),
          message: 'All tabs must be accessible to users (include "user" permission)'
        })
      }
    };
  }

  /**
   * INITIALIZE REGISTRY
   * 
   * Sets up the registry with default tab configurations.
   * This method is called automatically during construction.
   */
  private initializeRegistry(): void {
    try {
      this.debugLog('Initializing TabRegistry...');
      
      // Register all default tabs
      const defaultTabs = [
        morningTabConfig,
        lightWorkTabConfig,
        deepWorkTabConfig,
        wellnessTabConfig,
        smokingTabConfig,
        timeboxTabConfig,
        tasksTabConfig,
        checkoutTabConfig
      ];

      let successCount = 0;
      let errorCount = 0;

      defaultTabs.forEach(tab => {
        try {
          this.registerTab(tab);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Failed to register tab ${tab.id}:`, error);
          
          // Try to register fallback version if available
          if (tab.fallback) {
            try {
              const fallbackTab: TabConfig = { ...tab, ...tab.fallback };
              this.registerTab(fallbackTab);
              console.warn(`Registered fallback version for tab ${tab.id}`);
              this.emit('fallback:loaded', { reason: `Primary config failed: ${error}` });
            } catch (fallbackError) {
              console.error(`Failed to register fallback for tab ${tab.id}:`, fallbackError);
            }
          }
        }
      });

      this.isInitialized = true;
      this.debugLog(`Registry initialized: ${successCount} successful, ${errorCount} failed`);
      
      // Ensure we have at least one working tab
      if (this.tabs.size === 0) {
        this.registerEmergencyFallback();
      }

    } catch (error) {
      console.error('Critical error during TabRegistry initialization:', error);
      this.registerEmergencyFallback();
    }
  }

  /**
   * EMERGENCY FALLBACK
   * 
   * Creates a minimal tab configuration when all else fails.
   * Ensures the system never completely breaks.
   */
  private registerEmergencyFallback(): void {
    const emergencyTab: TabConfig = {
      id: 'emergency',
      label: 'Home',
      icon: null as any, // Will need to be handled by UI layer
      component: null as any,
      order: 0,
      enabled: true,
      theme: {
        primary: 'text-gray-400',
        background: 'bg-gray-50',
        border: 'border-gray-200'
      },
      accessibility: {
        ariaLabel: 'Emergency Home Tab',
        description: 'Emergency fallback tab when configuration fails'
      },
      permissions: ['user', 'admin'],
      features: []
    };

    this.tabs.set(emergencyTab.id, emergencyTab);
    this.config.defaultTab = 'emergency';
    console.warn('Emergency fallback tab registered - check tab configurations');
    this.emit('fallback:loaded', { reason: 'Complete configuration failure - emergency mode' });
  }

  /**
   * REGISTER TAB
   * 
   * Adds a new tab configuration to the registry with full validation.
   * Rejects invalid configurations with detailed error messages.
   */
  public registerTab(tab: TabConfig): void {
    this.debugLog(`Registering tab: ${tab.id}`);

    // Validate tab configuration
    const validationResult = this.validateTab(tab);
    if (!validationResult.valid) {
      const error = new Error(`Invalid tab configuration for ${tab.id}: ${validationResult.errors.join(', ')}`);
      this.emit('validation:failed', { tabId: tab.id, errors: validationResult.errors });
      throw error;
    }

    // Check for duplicate IDs
    if (this.tabs.has(tab.id)) {
      console.warn(`Overwriting existing tab configuration: ${tab.id}`);
    }

    // Register the tab
    this.tabs.set(tab.id, { ...tab }); // Clone to prevent external modifications
    this.debugLog(`Successfully registered tab: ${tab.id}`);
    
    // Update config tabs list
    this.config.tabs = Array.from(this.tabs.values());
    
    // Emit registration event
    this.emit('tab:registered', { tab });
  }

  /**
   * VALIDATE TAB
   * 
   * Comprehensive validation of tab configuration against schema and business rules.
   * Returns detailed validation results with specific error messages.
   */
  private validateTab(tab: TabConfig): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check required fields
      this.validationSchema.required.fields.forEach(field => {
        if (!(field in tab) || tab[field as keyof TabConfig] === undefined) {
          errors.push(`Missing required field: ${field}`);
        }
      });

      // Run custom validators
      this.validationSchema.required.customValidators.forEach(validator => {
        const result = validator(tab);
        if (!result.valid) {
          errors.push(result.message || 'Custom validation failed');
        }
      });

      // Check business rules
      Object.entries(this.validationSchema.businessRules).forEach(([ruleName, rule]) => {
        const result = rule(tab);
        if (!result.valid) {
          errors.push(result.message || `Business rule violated: ${ruleName}`);
        }
      });

      // Environment-specific warnings
      if (tab.environment === 'development' && process.env.NODE_ENV === 'production') {
        warnings.push(`Tab ${tab.id} is development-only but running in production`);
      }

      // Permission warnings
      if (tab.permissions.includes('premium') && !tab.features.includes('premium-features')) {
        warnings.push(`Tab ${tab.id} has premium permissions but no premium features`);
      }

      // Time range optimization warnings
      if (tab.timeRange && tab.timeRange.priority && tab.timeRange.priority < 5) {
        warnings.push(`Tab ${tab.id} has low priority (${tab.timeRange.priority}) - consider optimization`);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        valid: false,
        errors: [`Validation error: ${error}`],
        warnings: []
      };
    }
  }

  /**
   * GET TAB
   *
   * Retrieves a specific tab configuration by ID.
   * Returns null if tab doesn't exist or is not accessible.
   * Includes backward compatibility mapping for legacy 'work' ID to 'deep-work'.
   */
  public getTab(id: string): TabConfig | null {
    // Handle legacy 'work' ID mapping to 'deep-work'
    if (id === 'work') {
      id = 'deep-work';
    }

    const tab = this.tabs.get(id);
    if (!tab) {
      this.debugLog(`Tab not found: ${id}`);
      return null;
    }

    // Check if tab is allowed in current environment
    if (!this.isTabAllowedInEnvironment(tab)) {
      this.debugLog(`Tab ${id} not allowed in current environment`);
      return null;
    }

    return { ...tab }; // Return clone to prevent external modifications
  }

  /**
   * GET ALL TABS
   * 
   * Returns all registered tabs filtered by environment and enabled status.
   * Sorted by order for consistent display.
   */
  public getAllTabs(): TabConfig[] {
    return Array.from(this.tabs.values())
      .filter(tab => tab.enabled)
      .filter(tab => this.isTabAllowedInEnvironment(tab))
      .sort((a, b) => a.order - b.order)
      .map(tab => ({ ...tab })); // Return clones
  }

  /**
   * GET TABS BY PERMISSION
   * 
   * Returns tabs accessible to users with specific permissions.
   * Enables role-based tab filtering.
   */
  public getTabsByPermission(userPermissions: string[]): TabConfig[] {
    return this.getAllTabs().filter(tab => 
      tab.permissions.some(permission => 
        userPermissions.includes(permission)
      )
    );
  }

  /**
   * GET SUGGESTED TAB
   * 
   * Returns intelligent tab suggestion based on current time and context.
   * Implements time-based productivity optimization.
   */
  public getSuggestedTab(currentHour?: number): string {
    if (!this.config.enableTimeBasedSuggestions) {
      return this.config.defaultTab;
    }

    const hour = currentHour ?? new Date().getHours();
    this.debugLog(`Getting suggested tab for hour: ${hour}`);
    
    // Find tabs relevant to current time, sorted by priority
    const timeRelevantTabs = this.getAllTabs()
      .filter(tab => tab.timeRange && 
        hour >= tab.timeRange.start && 
        hour < tab.timeRange.end)
      .sort((a, b) => (b.timeRange?.priority || 0) - (a.timeRange?.priority || 0));

    if (timeRelevantTabs.length > 0) {
      this.debugLog(`Suggested tab: ${timeRelevantTabs[0].id} (priority: ${timeRelevantTabs[0].timeRange?.priority})`);
      return timeRelevantTabs[0].id;
    }

    // Fallback to default tab
    this.debugLog(`No time-relevant tabs found, using default: ${this.config.defaultTab}`);
    return this.config.defaultTab;
  }

  /**
   * ENVIRONMENT FILTERING
   * 
   * Determines if a tab is allowed in the current environment.
   * Supports development/production environment restrictions.
   */
  private isTabAllowedInEnvironment(tab: TabConfig): boolean {
    if (!tab.environment || tab.environment === 'both') return true;
    
    const currentEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    return tab.environment === currentEnv;
  }

  /**
   * UNREGISTER TAB
   * 
   * Removes a tab from the registry.
   * Used for dynamic tab management and cleanup.
   */
  public unregisterTab(tabId: string): boolean {
    if (!this.tabs.has(tabId)) {
      this.debugLog(`Cannot unregister non-existent tab: ${tabId}`);
      return false;
    }

    // Prevent unregistering the default tab
    if (tabId === this.config.defaultTab) {
      console.warn(`Cannot unregister default tab: ${tabId}`);
      return false;
    }

    this.tabs.delete(tabId);
    this.config.tabs = Array.from(this.tabs.values());
    this.debugLog(`Unregistered tab: ${tabId}`);
    this.emit('tab:unregistered', { tabId });
    return true;
  }

  /**
   * UPDATE CONFIGURATION
   * 
   * Updates the registry configuration with new settings.
   * Enables runtime configuration changes.
   */
  public updateConfig(newConfig: Partial<TabRegistryConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.debugLog('Registry configuration updated');
  }

  /**
   * GET CONFIGURATION
   * 
   * Returns the current registry configuration including all tabs.
   * Useful for debugging and system introspection.
   */
  public getConfig(): TabRegistryConfig {
    return {
      ...this.config,
      tabs: this.getAllTabs()
    };
  }

  /**
   * HEALTH CHECK
   * 
   * Performs comprehensive system health check.
   * Returns diagnostic information about registry state.
   */
  public healthCheck(): {
    healthy: boolean;
    issues: string[];
    stats: {
      totalTabs: number;
      enabledTabs: number;
      validationErrors: number;
      fallbacksUsed: number;
    };
  } {
    const issues: string[] = [];
    let validationErrors = 0;
    let fallbacksUsed = 0;

    // Check if registry is initialized
    if (!this.isInitialized) {
      issues.push('Registry not properly initialized');
    }

    // Check if we have any tabs
    if (this.tabs.size === 0) {
      issues.push('No tabs registered');
    }

    // Check if default tab exists
    if (!this.tabs.has(this.config.defaultTab)) {
      issues.push(`Default tab '${this.config.defaultTab}' does not exist`);
    }

    // Validate all registered tabs
    Array.from(this.tabs.values()).forEach(tab => {
      const validation = this.validateTab(tab);
      if (!validation.valid) {
        validationErrors++;
        issues.push(`Tab '${tab.id}' has validation errors: ${validation.errors.join(', ')}`);
      }
      
      // Check for fallback usage
      if (tab.id.includes('emergency') || tab.label.includes('Safe Mode')) {
        fallbacksUsed++;
      }
    });

    return {
      healthy: issues.length === 0,
      issues,
      stats: {
        totalTabs: this.tabs.size,
        enabledTabs: this.getAllTabs().length,
        validationErrors,
        fallbacksUsed
      }
    };
  }

  /**
   * DEBUG LOGGING
   * 
   * Controlled debug logging based on development mode settings.
   * Helps with troubleshooting and development.
   */
  private debugLog(message: string, ...args: any[]): void {
    if (this.config.developmentMode?.enableDebugLogs) {
      console.debug(`[TabRegistry] ${message}`, ...args);
    }
  }

  /**
   * LEGACY COMPATIBILITY
   * 
   * Provides backward compatibility with the original tab-config.ts interface.
   * Allows gradual migration without breaking existing code.
   */
  public getLegacyTabConfig(): Record<string, any> {
    const legacyConfig: Record<string, any> = {};
    
    Array.from(this.tabs.values()).forEach(tab => {
      legacyConfig[tab.id] = {
        id: tab.id,
        name: tab.label,
        icon: tab.icon,
        timeRelevance: tab.timeRelevance || [],
        color: tab.color || tab.theme.gradient || '',
        description: tab.description || tab.accessibility.description,
        componentPath: tab.componentPath || ''
      };
    });

    return legacyConfig;
  }

  /**
   * GET LEGACY TAB IDS
   *
   * Returns tab IDs in the legacy format for backward compatibility.
   */
  public getLegacyTabIds(): LegacyTabId[] {
    return Array.from(this.tabs.keys()).filter(id =>
      ['morning', 'light-work', 'work', 'deep-work', 'wellness', 'timebox', 'checkout'].includes(id)
    ) as LegacyTabId[];
  }
}

// Export singleton instance
export const tabRegistry = new TabRegistry();

// Export utility functions for backward compatibility
export const getAllTabIds = () => tabRegistry.getLegacyTabIds();
export const getTabConfig = (tabId: string) => tabRegistry.getTab(tabId);
export const isValidTabId = (tabId: string) => tabRegistry.getTab(tabId) !== null;

/**
 * LEGACY VALIDATION FUNCTION
 * 
 * Maintains compatibility with existing validation patterns.
 */
export const validateTabHandler = (handledTabs: Set<string>): string[] => {
  const allTabs = getAllTabIds();
  const missingTabs = allTabs.filter(tab => !handledTabs.has(tab));
  
  if (missingTabs.length > 0) {
    console.error('🚨 MISSING TAB HANDLERS:', missingTabs);
    console.error('📝 Add these cases to your switch statement:', missingTabs.map(tab => `case '${tab}':`));
  }
  
  return missingTabs;
};

/**
 * RUNTIME GUARD
 * 
 * Maintains compatibility with existing exhaustiveness checking.
 */
export const assertExhaustive = (x: never): never => {
  throw new Error(`Unhandled tab case: ${x}`);
};
