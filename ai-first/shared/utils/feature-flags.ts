// Feature flags for AI Chat Assistant enhancements
// Allows safe rollout of new features without breaking existing functionality

export interface AIAssistantFeatureFlags {
  // Chat enhancement features
  enableChatThreads: boolean;
  enableConversationHistory: boolean;
  enablePersonalChatMode: boolean;
  
  // Morning routine features
  enableMorningRoutineTimer: boolean;
  enableStructuredMorningChat: boolean;
  
  // Learning and AI features
  enableAILearningSystem: boolean;
  enableConversationAnalysis: boolean;
  enableSmartSuggestions: boolean;
  
  // Integration features
  enableClaudeCodeIntegration: boolean;
  enableAdvancedTaskCreation: boolean;
  enableCrossPlatformSync: boolean;
  
  // UI/UX enhancements
  enableEnhancedMobileUI: boolean;
  enableVoiceQualityUpgrade: boolean;
  enableCustomPersonality: boolean;
}

// Default flags - ALL DISABLED for safe rollout
const DEFAULT_FEATURE_FLAGS: AIAssistantFeatureFlags = {
  // Chat enhancement features
  enableChatThreads: false,
  enableConversationHistory: false,
  enablePersonalChatMode: false,
  
  // Morning routine features  
  enableMorningRoutineTimer: false,
  enableStructuredMorningChat: false,
  
  // Learning and AI features
  enableAILearningSystem: false,
  enableConversationAnalysis: false,
  enableSmartSuggestions: false,
  
  // Integration features
  enableClaudeCodeIntegration: false,
  enableAdvancedTaskCreation: false,
  enableCrossPlatformSync: false,
  
  // UI/UX enhancements
  enableEnhancedMobileUI: false,
  enableVoiceQualityUpgrade: false,
  enableCustomPersonality: false,
};

// User-specific feature flags (for progressive rollout)
const USER_SPECIFIC_FLAGS: Record<string, Partial<AIAssistantFeatureFlags>> = {
  // Enable features for specific users (your user ID here)
  'shaan_user_id': {
    enablePersonalChatMode: true,
    enableChatThreads: true,
    enableConversationHistory: true,
    enableMorningRoutineTimer: true,
  },
  
  // Add other test users as needed
  'test_user_1': {
    enableConversationHistory: true,
  },
};

// Environment-based feature flags
const ENV_FEATURE_FLAGS: Partial<AIAssistantFeatureFlags> = {
  // Development environment - enable more features for testing
  ...(process.env.NODE_ENV === 'development' && {
    enableChatThreads: true,
    enableConversationHistory: true,
    enableMorningRoutineTimer: true,
  }),
  
  // Staging environment - enable subset for testing
  ...(process.env.VERCEL_ENV === 'preview' && {
    enableConversationHistory: true,
  }),
};

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags: AIAssistantFeatureFlags;
  
  private constructor() {
    this.flags = this.calculateFlags();
  }
  
  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }
  
  private calculateFlags(): AIAssistantFeatureFlags {
    const userId = this.getCurrentUserId();
    const userFlags = USER_SPECIFIC_FLAGS[userId] || {};
    
    return {
      ...DEFAULT_FEATURE_FLAGS,
      ...ENV_FEATURE_FLAGS,
      ...userFlags,
    };
  }
  
  private getCurrentUserId(): string {
    // Get current user ID from your auth system
    // Replace with your actual user ID retrieval logic
    if (typeof window !== 'undefined') {
      // Check localStorage, cookies, or global state for user ID
      return localStorage.getItem('user_id') || 'anonymous';
    }
    return 'anonymous';
  }
  
  // Main method to check if a feature is enabled
  public isEnabled(feature: keyof AIAssistantFeatureFlags): boolean {
    return this.flags[feature];
  }
  
  // Get all flags for a component
  public getFlags(): AIAssistantFeatureFlags {
    return { ...this.flags };
  }
  
  // Enable a feature for current user (runtime override)
  public enableFeature(feature: keyof AIAssistantFeatureFlags): void {
    this.flags[feature] = true;
    console.log(`🚩 [FEATURE FLAGS] Enabled feature: ${feature}`);
  }
  
  // Disable a feature for current user (runtime override)
  public disableFeature(feature: keyof AIAssistantFeatureFlags): void {
    this.flags[feature] = false;
    console.log(`🚩 [FEATURE FLAGS] Disabled feature: ${feature}`);
  }
  
  // Bulk enable features (for testing)
  public enableFeatures(features: (keyof AIAssistantFeatureFlags)[]): void {
    features.forEach(feature => {
      this.flags[feature] = true;
    });
    console.log(`🚩 [FEATURE FLAGS] Enabled features:`, features);
  }
  
  // Reset to default flags
  public resetFlags(): void {
    this.flags = this.calculateFlags();
    console.log(`🚩 [FEATURE FLAGS] Reset to default flags`);
  }
  
  // Debug method to see all current flags
  public debugFlags(): void {
    console.log('🚩 [FEATURE FLAGS] Current flags:', this.flags);
    console.log('🚩 [FEATURE FLAGS] User ID:', this.getCurrentUserId());
    console.log('🚩 [FEATURE FLAGS] Environment:', process.env.NODE_ENV);
  }
}

// Convenience hook for React components
export const useFeatureFlags = (): AIAssistantFeatureFlags => {
  const flagService = FeatureFlagService.getInstance();
  return flagService.getFlags();
};

// Convenience function to check individual flags
export const isFeatureEnabled = (feature: keyof AIAssistantFeatureFlags): boolean => {
  const flagService = FeatureFlagService.getInstance();
  return flagService.isEnabled(feature);
};

// Development helper functions
export const devEnableAllFeatures = (): void => {
  if (process.env.NODE_ENV === 'development') {
    const flagService = FeatureFlagService.getInstance();
    const allFeatures = Object.keys(DEFAULT_FEATURE_FLAGS) as (keyof AIAssistantFeatureFlags)[];
    flagService.enableFeatures(allFeatures);
  }
};

export const devDisableAllFeatures = (): void => {
  if (process.env.NODE_ENV === 'development') {
    const flagService = FeatureFlagService.getInstance();
    flagService.resetFlags();
  }
};

// Console commands for easy testing (development only)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).enableAIFeature = (feature: string) => {
    const flagService = FeatureFlagService.getInstance();
    flagService.enableFeature(feature as keyof AIAssistantFeatureFlags);
  };
  
  (window as any).disableAIFeature = (feature: string) => {
    const flagService = FeatureFlagService.getInstance();
    flagService.disableFeature(feature as keyof AIAssistantFeatureFlags);
  };
  
  (window as any).debugAIFlags = () => {
    const flagService = FeatureFlagService.getInstance();
    flagService.debugFlags();
  };
  
  (window as any).enableAllAIFeatures = devEnableAllFeatures;
  (window as any).disableAllAIFeatures = devDisableAllFeatures;
}