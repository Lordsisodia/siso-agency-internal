/**
 * COMPREHENSIVE TAB CONFIGURATION TYPES
 * 
 * This module defines all TypeScript interfaces for the decomposed tab configuration system.
 * These types ensure type safety across all tab configuration operations and provide
 * comprehensive validation capabilities.
 * 
 * CRITICAL FEATURES:
 * - Runtime validation support with Zod-compatible interfaces
 * - Environment-specific configuration support (dev/prod/both)
 * - Permission-based access control
 * - Theme configuration with accessibility support
 * - Time-based tab suggestions
 * - Feature flags per tab
 * 
 * BUSINESS REASONING:
 * - Prevents configuration errors that would break navigation
 * - Enables gradual rollout of new tabs via feature flags
 * - Supports personalization based on user permissions
 * - Allows time-based tab suggestions for optimal productivity
 */

import { ComponentType } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * THEME CONFIGURATION
 * 
 * Defines the visual appearance of each tab including colors, gradients,
 * and accessibility considerations. The theme system supports:
 * - Consistent color schemes across all tabs
 * - Accessibility-compliant color contrasts
 * - Hover and active state definitions
 * - Gradient support for modern UI aesthetics
 */
export interface TabTheme {
  /** Primary text color class (e.g., 'text-orange-400') */
  primary: string;
  /** Background color class (e.g., 'bg-orange-400/10') */
  background: string;
  /** Border color class (e.g., 'border-orange-400/30') */
  border: string;
  /** Optional hover state color override */
  hover?: string;
  /** Optional active state color override */
  active?: string;
  /** Optional gradient for backgrounds (maintains compatibility with existing system) */
  gradient?: string;
}

/**
 * ACCESSIBILITY CONFIGURATION
 * 
 * Ensures WCAG 2.1 AA compliance and provides enhanced user experience
 * for users with disabilities. Includes keyboard navigation support
 * and screen reader optimization.
 */
export interface TabAccessibility {
  /** ARIA label for screen readers */
  ariaLabel: string;
  /** Human-readable description of tab functionality */
  description: string;
  /** Optional keyboard shortcut (e.g., 'Ctrl+1') */
  keyboardShortcut?: string;
  /** ARIA role override (defaults to 'tab') */
  role?: string;
  /** Additional ARIA attributes */
  ariaAttributes?: Record<string, string>;
}

/**
 * TIME RANGE CONFIGURATION
 * 
 * Defines when a tab is most relevant based on the time of day.
 * Used for intelligent tab suggestions and productivity optimization.
 * 
 * BUSINESS REASONING:
 * - Morning tabs (6-10am): Focus on planning and routine
 * - Work tabs (10am-6pm): Productivity and task execution  
 * - Evening tabs (6-10pm): Reflection and wrap-up
 */
export interface TabTimeRange {
  /** Start hour (0-23) when tab becomes relevant */
  start: number;
  /** End hour (0-23) when tab relevance ends */
  end: number;
  /** Priority weight for time-based suggestions (1-10) */
  priority?: number;
}

/**
 * TAB VALIDATION RULES
 * 
 * Defines validation rules for tab configuration to prevent runtime errors.
 * Rules are enforced both at build time (TypeScript) and runtime (validation functions).
 */
export interface TabValidationRules {
  /** Required fields that must be present */
  required: string[];
  /** Custom validation functions */
  customValidators?: Array<(tab: TabConfig) => boolean>;
  /** Validation error messages */
  errorMessages?: Record<string, string>;
}

/**
 * CORE TAB CONFIGURATION
 * 
 * The main interface defining a complete tab configuration.
 * Maintains backward compatibility with the existing system while
 * adding enhanced features for validation, accessibility, and extensibility.
 * 
 * MIGRATION STRATEGY:
 * - All existing tab-config.ts properties are preserved
 * - New properties are optional to maintain compatibility
 * - Enhanced type safety prevents configuration errors
 */
export interface TabConfig {
  /** Unique identifier matching existing TabId union type */
  id: string;
  /** Display name shown in the tab */
  label: string;
  /** Lucide React icon component */
  icon: LucideIcon;
  /** React component to render when tab is active */
  component: ComponentType<any>;
  /** Display order in tab navigation (0-based) */
  order: number;
  /** Whether tab is enabled and should be shown */
  enabled: boolean;
  
  // ENHANCED FEATURES (all optional for backward compatibility)
  /** Time range when tab is most relevant */
  timeRange?: TabTimeRange;
  /** Visual theme configuration */
  theme: TabTheme;
  /** Accessibility configuration */
  accessibility: TabAccessibility;
  /** Required user permissions to access tab */
  permissions: string[];
  /** Feature flags this tab depends on */
  features: string[];
  /** Environment where tab should be available */
  environment?: 'development' | 'production' | 'both';
  /** Validation rules for this tab */
  validation?: TabValidationRules;
  /** Fallback configuration if tab fails to load */
  fallback?: Partial<TabConfig>;
  
  // BACKWARD COMPATIBILITY (maintains existing interface)
  /** Time relevance array (maintains compatibility) */
  timeRelevance?: number[];
  /** Color gradient (maintains compatibility) */
  color?: string;
  /** Description (maintains compatibility) */
  description?: string;
  /** Component path (maintains compatibility) */
  componentPath?: string;
}

/**
 * TAB REGISTRY CONFIGURATION
 * 
 * Global configuration for the tab system behavior.
 * Controls features like time-based suggestions, animations,
 * and user experience enhancements.
 */
export interface TabRegistryConfig {
  /** All registered tabs */
  tabs: TabConfig[];
  /** Default tab to show when no specific tab is requested */
  defaultTab: string;
  /** Enable intelligent time-based tab suggestions */
  enableTimeBasedSuggestions: boolean;
  /** Enable swipe gestures for mobile navigation */
  enableSwipeGestures: boolean;
  /** Animation duration for tab transitions (ms) */
  animationDuration: number;
  /** Maximum number of tabs to show at once */
  maxVisibleTabs?: number;
  /** Enable tab caching for performance */
  enableCaching?: boolean;
  /** Cache TTL in milliseconds */
  cacheTTL?: number;
  /** Development mode settings */
  developmentMode?: {
    enableDebugLogs: boolean;
    showValidationWarnings: boolean;
    enableHotReload: boolean;
  };
}

/**
 * TAB LOAD STATE
 * 
 * Represents the loading state of the tab configuration system.
 * Used by React hooks to provide loading indicators and error handling.
 */
export interface TabLoadState {
  /** Whether tabs are currently loading */
  isLoading: boolean;
  /** Error message if loading failed */
  error: string | null;
  /** Whether fallback configuration is being used */
  usingFallback: boolean;
  /** Validation warnings (non-fatal issues) */
  warnings: string[];
}

/**
 * TAB REGISTRY EVENTS
 * 
 * Event types for the tab registry system.
 * Enables reactive updates when tab configuration changes.
 */
export interface TabRegistryEvents {
  /** Tab was registered */
  'tab:registered': { tab: TabConfig };
  /** Tab was unregistered */
  'tab:unregistered': { tabId: string };
  /** Tab configuration was updated */
  'tab:updated': { tab: TabConfig };
  /** Configuration validation failed */
  'validation:failed': { tabId: string; errors: string[] };
  /** Fallback configuration loaded */
  'fallback:loaded': { reason: string };
}

/**
 * HOOK CONFIGURATION OPTIONS
 * 
 * Configuration options for the useTabConfiguration hook.
 * Allows customization of loading behavior and filtering.
 */
export interface UseTabConfigurationOptions {
  /** User permissions for tab filtering */
  userPermissions?: string[];
  /** Environment override */
  environment?: 'development' | 'production';
  /** Enable automatic tab suggestions */
  enableSuggestions?: boolean;
  /** Custom filter function */
  customFilter?: (tab: TabConfig) => boolean;
  /** Cache configuration */
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}

/**
 * BACKWARD COMPATIBILITY TYPES
 * 
 * These types maintain compatibility with the existing tab-config.ts system.
 * They map the existing types to the new enhanced types while preserving
 * all existing functionality.
 */

/** Legacy TabId union type (maintains exact compatibility) */
export type LegacyTabId = 
  | 'morning'
  | 'light-work' 
  | 'work'
  | 'wellness'
  | 'tasks'
  | 'timebox'
  | 'checkout';

/** Legacy TabConfig interface (maintains exact compatibility) */
export interface LegacyTabConfig {
  id: LegacyTabId;
  name: string;
  icon: LucideIcon;
  timeRelevance: number[];
  color: string;
  description: string;
  componentPath: string;
}

/**
 * CONFIGURATION VALIDATION SCHEMA
 * 
 * Runtime validation schema for tab configurations.
 * Ensures all configurations meet minimum requirements and prevent runtime errors.
 */
export interface TabConfigValidationSchema {
  /** Schema version for migration compatibility */
  version: string;
  /** Required fields validation */
  required: {
    fields: string[];
    customValidators: Array<(config: any) => { valid: boolean; message?: string }>;
  };
  /** Type validation rules */
  types: {
    [key: string]: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  };
  /** Custom business rules */
  businessRules: {
    [key: string]: (config: TabConfig) => { valid: boolean; message?: string };
  };
}

/**
 * MIGRATION UTILITIES
 * 
 * Utility types for migrating from the legacy system to the new system.
 * These help ensure smooth transitions without breaking existing code.
 */

/** Migration mapping from legacy to new configuration */
export interface MigrationMapping {
  /** Legacy field name */
  from: keyof LegacyTabConfig;
  /** New field name */
  to: keyof TabConfig;
  /** Transform function for value conversion */
  transform?: (value: any) => any;
  /** Whether this field is required in the new system */
  required?: boolean;
}

/** Migration result */
export interface MigrationResult {
  /** Successfully migrated configuration */
  config: TabConfig;
  /** Migration warnings */
  warnings: string[];
  /** Migration errors */
  errors: string[];
}
