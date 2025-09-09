/**
 * Feature Flag System for LifeLock Refactoring Migration
 * 
 * This system allows safe migration from old to new code by enabling
 * individual features to be toggled without breaking the existing app.
 * 
 * Usage:
 * - All flags default to false (keeps existing code running)
 * - Flip flags to true to test refactored code
 * - Can be controlled per environment or per user
 */

export interface LifeLockFeatureFlags {
  // Core component refactoring
  useRefactoredAdminLifeLock: boolean;        // AdminLifeLock.tsx switch statement → component factory (220 lines saved)
  useRefactoredTabContentRenderer: boolean;   // Replace switch statement with configuration-driven rendering
  useRefactoredMorningRoutine: boolean;       // Extract hardcoded data, use reusable components  
  useRefactoredTaskCards: boolean;            // Unified TaskCard component (5,100+ lines → reusable component)
  useUnifiedTaskCard: boolean;                // Replace all task card implementations with unified component
  useTaskCardUtils: boolean;                  // Use extracted task card utilities and helper functions
  
  // Hook refactoring  
  useRefactoredLifeLockHooks: boolean;        // Master refactored hook (226 lines → focused hooks)
  useRefactoredTaskData: boolean;             // Split task data management (~90 lines → focused hook)
  useRefactoredTaskActions: boolean;          // Split task actions (~17 lines → focused hook)
  useRefactoredVoiceProcessing: boolean;      // Split voice processing (~12 lines → focused hook)
  useRefactoredTaskOrganization: boolean;     // Split task organization (~26 lines → focused hook)
  useRefactoredServiceInit: boolean;          // Split service initialization (~12 lines → focused hook)
  
  // Service layer refactoring
  useRefactoredVoiceProcessor: boolean;       // Decompose monolithic voice processing service
  useRefactoredTaskProcessor: boolean;        // Extract task processing logic
  useRefactoredProgressCalculator: boolean;   // Extract progress calculation logic
  
  // Performance optimizations
  useOptimizedComponents: boolean;            // React.memo, useMemo, useCallback optimizations
  useVirtualizedTaskLists: boolean;           // Virtual scrolling for large task lists
  useAdvancedCaching: boolean;                // Enhanced caching and memoization
  
  // Data management
  useRefactoredDataLayer: boolean;            // Centralized data management and localStorage
  useRefactoredDefaultTasks: boolean;         // Extracted default task configurations
  useRefactoredThemeSystem: boolean;          // Centralized color and theme management
  
  // UI Component refactoring (SAFEST - just visual components)
  useUnifiedLoadingState: boolean;            // Replace 100+ custom loading divs with LoadingState component
  useUnifiedErrorState: boolean;              // Replace 50+ custom error divs with ErrorState component
  useUnifiedThemeSystem: boolean;             // Replace 12,000+ duplicate CSS classes with theme system
}

/**
 * Default feature flag configuration
 * All flags are false by default to maintain existing behavior
 */
export const DEFAULT_FEATURE_FLAGS: LifeLockFeatureFlags = {
  // Core component refactoring
  useRefactoredAdminLifeLock: false,
  useRefactoredTabContentRenderer: false,
  useRefactoredMorningRoutine: false,
  useRefactoredTaskCards: false,
  useUnifiedTaskCard: false,
  useTaskCardUtils: false,
  
  // Hook refactoring
  useRefactoredLifeLockHooks: false,
  useRefactoredTaskData: false,
  useRefactoredTaskActions: false,
  useRefactoredVoiceProcessing: false,
  useRefactoredTaskOrganization: false,
  useRefactoredServiceInit: false,
  
  // Service layer refactoring
  useRefactoredVoiceProcessor: false,
  useRefactoredTaskProcessor: false,
  useRefactoredProgressCalculator: false,
  
  // Performance optimizations
  useOptimizedComponents: false,
  useVirtualizedTaskLists: false,
  useAdvancedCaching: false,
  
  // Data management
  useRefactoredDataLayer: false,
  useRefactoredDefaultTasks: false,
  useRefactoredThemeSystem: false,
  
  // UI Component refactoring (SAFEST - just visual components)
  useUnifiedLoadingState: false,
  useUnifiedErrorState: false,
  useUnifiedThemeSystem: false,
};

/**
 * Current active feature flags
 * Modify these values to test refactored code
 */
let currentFlags: LifeLockFeatureFlags = { 
  ...DEFAULT_FEATURE_FLAGS,
  // Enable key refactored components for production consistency
  useRefactoredAdminLifeLock: true,       // Enable TabContentRenderer for consistent UI
  useRefactoredLifeLockHooks: true,       // Enable refactored hooks
  useRefactoredTaskCards: true,           // Enable unified task cards
  useUnifiedTaskCard: true,               // Enable unified task card component
  useTaskCardUtils: true,                 // Enable task card utilities
  useUnifiedLoadingState: true,           // Enable unified loading states
  useUnifiedErrorState: true,             // Enable unified error states
  useUnifiedThemeSystem: true,            // Enable unified theme system
  useOptimizedComponents: true,           // Enable performance optimizations
};

/**
 * Development override flags
 * Enable specific flags for testing during development
 */
const DEVELOPMENT_OVERRIDES: Partial<LifeLockFeatureFlags> = {
  // HIGH-VALUE SIMPLE REFACTORS ENABLED (565+ lines saved immediately)
  useRefactoredDefaultTasks: true,        // 119 lines saved - morning routine data extraction
  useRefactoredAdminLifeLock: true,       // 220 lines saved - replace switch statement with TabContentRenderer
  useRefactoredLifeLockHooks: true,       // 226 lines saved - split monolithic hook into focused hooks
  useRefactoredTaskCards: true,           // Task card unification
  useUnifiedTaskCard: true,               // Enable unified task card component
  useTaskCardUtils: true,                 // Enable task card utilities
  useOptimizedComponents: true,           // Performance optimizations
  
  // ULTRA-SAFE UI COMPONENT REFACTORS (150+ lines saved with zero risk)
  useUnifiedLoadingState: true,           // Replace 100+ loading divs - SAFEST refactor possible
  useUnifiedErrorState: true,             // Replace 50+ error divs - SAFEST refactor possible
  useUnifiedThemeSystem: true,            // Replace 12,000+ CSS classes - MASSIVE bundle reduction
};

// Apply development overrides if in development mode
if (process.env.NODE_ENV === 'development') {
  currentFlags = { ...currentFlags, ...DEVELOPMENT_OVERRIDES };
}

/**
 * Check if a specific feature flag is enabled
 */
export function isFeatureEnabled(flag: keyof LifeLockFeatureFlags): boolean {
  return currentFlags[flag];
}

/**
 * Get all current feature flag values
 */
export function getCurrentFlags(): LifeLockFeatureFlags {
  return { ...currentFlags };
}

/**
 * Update feature flags (useful for runtime toggling)
 */
export function updateFlags(updates: Partial<LifeLockFeatureFlags>): void {
  currentFlags = { ...currentFlags, ...updates };
}

/**
 * Reset all flags to default values
 */
export function resetFlags(): void {
  currentFlags = { ...DEFAULT_FEATURE_FLAGS };
}

/**
 * Utility function to conditionally use old or new implementation
 */
export function useImplementation<T>(
  flag: keyof LifeLockFeatureFlags,
  newImplementation: T,
  oldImplementation: T
): T {
  return isFeatureEnabled(flag) ? newImplementation : oldImplementation;
}

/**
 * Higher-order component wrapper for feature-flagged components
 */
export function withFeatureFlag<P extends object>(
  flag: keyof LifeLockFeatureFlags,
  NewComponent: any,
  OldComponent: any
) {
  return function FeatureFlaggedComponent(props: P) {
    return isFeatureEnabled(flag) ? NewComponent(props) : OldComponent(props);
  };
}

/**
 * Feature flag debugging helper
 * Logs which flags are currently enabled
 */
export function logEnabledFlags(): void {
  if (process.env.NODE_ENV === 'development') {
    const enabled = Object.entries(currentFlags)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);
    
    console.log('🚩 Enabled feature flags:', enabled);
    
    if (enabled.length === 0) {
      console.log('📝 All feature flags disabled - using original implementation');
    }
  }
}

/**
 * Quick flag presets for different testing scenarios
 */
export const FLAG_PRESETS = {
  // Test basic refactored components
  basicRefactoring: {
    useRefactoredDefaultTasks: true,
    useRefactoredTaskCards: true,
    useOptimizedComponents: true,
  },
  
  // Test unified task card system
  unifiedTaskCards: {
    useRefactoredTaskCards: true,
    useUnifiedTaskCard: true,
    useTaskCardUtils: true,
  },
  
  // Test AdminLifeLock refactoring
  adminLifeLockRefactoring: {
    useRefactoredAdminLifeLock: true,
    useRefactoredTabContentRenderer: true,
  },
  
  // Test hook refactoring
  hookRefactoring: {
    useRefactoredLifeLockHooks: true,
    useRefactoredTaskActions: true,
    useRefactoredVoiceHooks: true,
  },
  
  // Test complete hook splitting
  completeHookSplit: {
    useRefactoredLifeLockHooks: true,        // Master refactored hook
    useRefactoredTaskData: true,             // Split task data management
    useRefactoredTaskActions: true,          // Split task actions
    useRefactoredVoiceProcessing: true,      // Split voice processing
    useRefactoredTaskOrganization: true,     // Split task organization
    useRefactoredServiceInit: true,          // Split service initialization
  },
  
  // Test service layer changes
  serviceRefactoring: {
    useRefactoredVoiceProcessor: true,
    useRefactoredTaskProcessor: true,
    useRefactoredProgressCalculator: true,
  },
  
  // Enable all performance optimizations
  performanceMode: {
    useOptimizedComponents: true,
    useVirtualizedTaskLists: true,
    useAdvancedCaching: true,
  },
  
  // Enable everything (full refactored experience)
  allRefactored: Object.keys(DEFAULT_FEATURE_FLAGS).reduce(
    (acc, key) => ({ ...acc, [key]: true }),
    {} as LifeLockFeatureFlags
  ),
};

/**
 * Apply a preset configuration
 */
export function applyPreset(preset: keyof typeof FLAG_PRESETS): void {
  updateFlags(FLAG_PRESETS[preset]);
  logEnabledFlags();
}