
import React from 'react';
import FeatureFlags from './featureFlags';

/**
 * Utility that conditionally executes code based on feature flags
 * 
 * @param feature The feature flag to check
 * @param enabledFn Function to execute if the feature is enabled
 * @param disabledFn Function to execute if the feature is disabled (optional)
 * @returns The result of the appropriate function
 */
export function withFeature<T>(
  feature: keyof typeof FeatureFlags,
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
 * 
 * @param feature The feature flag to check
 * @param Component The component to render if the feature is enabled
 * @param fallback Optional fallback UI to render if feature is disabled
 * @returns A wrapped component that respects feature flags
 */
export function withFeatureGuard<P extends object>(
  feature: keyof typeof FeatureFlags,
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
 * 
 * @param feature The feature flag to check
 * @param actualHook The hook to use if the feature is enabled
 * @param mockResult The mock result to return if the feature is disabled
 * @returns A hook that either uses the real implementation or returns the mock
 */
export function createFeatureFlaggedHook<T extends (...args: any[]) => any>(
  feature: keyof typeof FeatureFlags,
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
