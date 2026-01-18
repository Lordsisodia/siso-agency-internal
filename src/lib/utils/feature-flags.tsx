/**
 * 🔲 Feature Flags
 *
 * Centralized feature flag configuration with React utilities.
 * Consolidated from: featureFlags.ts, featureFlagUtils.tsx, disabledFeatureTypes.ts
 */

import React from 'react';

// ============================================================================
// FEATURE FLAG CONFIGURATION
// ============================================================================

/**
 * Feature flags to enable/disable certain features in the application
 */
const FeatureFlags = {
  // Core features - always enabled
  authentication: true,
  profiles: true,

  // Content features
  education: true,
  dailyNews: false,

  // Crypto & NFT features
  crypto: false,
  nft: false,
  walletIntegration: false,

  // Social features
  comments: false,
  networking: false,
  leaderboard: false,

  // Economy features
  points: false,
  rewards: false,
  streaks: false,
} as const;

export type FeatureFlag = keyof typeof FeatureFlags;

// ============================================================================
// FEATURE FLAG UTILITIES
// ============================================================================

/**
 * Checks if a specific feature is enabled
 */
export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return FeatureFlags[feature] || false;
};

/**
 * Get all enabled features
 */
export const getEnabledFeatures = (): Record<string, boolean> => {
  return Object.fromEntries(
    Object.entries(FeatureFlags).filter(([_, enabled]) => enabled)
  );
};

/**
 * Get all feature flags
 */
export const getAllFeatureFlags = () => FeatureFlags;

// ============================================================================
// REACT UTILITIES
// ============================================================================

/**
 * Utility that conditionally executes code based on feature flags
 */
export function withFeature<T>(
  feature: FeatureFlag,
  enabledFn: () => T,
  disabledFn?: () => T
): T {
  if (FeatureFlags[feature]) {
    return enabledFn();
  } else if (disabledFn) {
    return disabledFn();
  }
  return undefined as unknown as T;
}

/**
 * Create a mock version of a component that only renders when a feature is enabled
 */
export function withFeatureGuard<P extends object>(
  feature: FeatureFlag,
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
): React.FC<P> {
  return (props: P) => {
    if (FeatureFlags[feature]) {
      return <Component {...props} />;
    }
    return fallback ? <>{fallback}</> : null;
  };
}

/**
 * Create a wrapped hook that respects feature flags
 */
export function createFeatureFlaggedHook<T extends (...args: any[]) => any>(
  feature: FeatureFlag,
  actualHook: T,
  mockResult: ReturnType<T>
): T {
  return ((...args: Parameters<T>) => {
    if (FeatureFlags[feature]) {
      return actualHook(...args);
    }
    return mockResult;
  }) as T;
}

// ============================================================================
// TYPESCRIPT HELPERS
// ============================================================================

/**
 * Additional shape for edge function responses that might have a message field
 */
export interface EdgeFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Type for handling feature tables that might not exist in the database
 */
export interface FeatureTableData<T = any> {
  [key: string]: any;
  data?: T[];
}

/**
 * Helper function to safely access properties in API responses with unknown/any types
 */
export function safePropertyExtract<T = any>(data: any, defaultValue: T): T {
  if (!data) return defaultValue;
  return data as unknown as T;
}

/**
 * Helper function to convert any type to a specific type (useful for mocked responses)
 */
export function asType<T>(data: any): T {
  return data as unknown as T;
}

export default FeatureFlags;
