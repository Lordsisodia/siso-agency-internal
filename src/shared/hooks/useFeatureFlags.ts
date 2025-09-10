/**
 * useFeatureFlags Hook
 * 
 * Simple feature flags hook for managing feature toggles.
 * Created to fix missing import in AdminLifeLock.tsx
 */

export interface FeatureFlags {
  [key: string]: boolean;
}

export const useFeatureFlags = () => {
  // Simple default implementation
  const featureFlags: FeatureFlags = {
    newTaskSystem: true,
    enhancedUI: true,
    betaFeatures: false
  };

  const isFeatureEnabled = (flagName: string): boolean => {
    return featureFlags[flagName] ?? false;
  };

  const toggleFeature = (flagName: string) => {
    // In a real implementation, this would update the flags
    console.log(`Toggling feature: ${flagName}`);
  };

  return {
    featureFlags,
    isFeatureEnabled,
    toggleFeature
  };
};