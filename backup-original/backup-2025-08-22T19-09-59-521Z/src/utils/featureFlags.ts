
/**
 * Feature flags to enable/disable certain features in the application
 * This is useful for development and testing, and for disabling features
 * that aren't ready for production yet
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
  streaks: false
};

/**
 * Checks if a specific feature is enabled
 * @param feature The feature to check
 * @returns True if the feature is enabled, false otherwise
 */
export const isFeatureEnabled = (feature: keyof typeof FeatureFlags): boolean => {
  return FeatureFlags[feature] || false;
};

/**
 * Get all enabled features
 * @returns An object containing all enabled features
 */
export const getEnabledFeatures = (): Record<string, boolean> => {
  return Object.fromEntries(
    Object.entries(FeatureFlags).filter(([_, enabled]) => enabled)
  );
};

export default FeatureFlags;
