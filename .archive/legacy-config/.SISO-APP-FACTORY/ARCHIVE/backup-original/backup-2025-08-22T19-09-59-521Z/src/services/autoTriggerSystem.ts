/**
 * Automatic Trigger System for AI App Plan Generation
 * Seamlessly triggers plan generation after onboarding completion
 */

import { useState, useEffect } from 'react';
import { AppPlanInput } from '@/types/appPlan.types';
import { getBusinessOnboardingData } from '@/utils/clientData';
import { appPlanAgent } from './appPlanAgent';
import { toast } from '@/hooks/use-toast';

export interface AutoTriggerConfig {
  enabled: boolean;
  delay: number; // milliseconds to wait before triggering
  showProgress: boolean;
  redirectAfterGeneration: boolean;
  redirectUrl: string;
}

export interface TriggerProgress {
  stage: 'initializing' | 'analyzing' | 'generating' | 'structuring' | 'finalizing' | 'complete';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining: number; // seconds
}

const DEFAULT_CONFIG: AutoTriggerConfig = {
  enabled: true,
  delay: 2000, // 2 second delay after onboarding
  showProgress: true,
  redirectAfterGeneration: true,
  redirectUrl: '/app-plan'
};

/**
 * Main auto-trigger class for app plan generation
 */
export class AutoTriggerSystem {
  private config: AutoTriggerConfig;
  private progressCallbacks: ((progress: TriggerProgress) => void)[] = [];
  private isGenerating = false;

  constructor(config: Partial<AutoTriggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Subscribe to progress updates
   */
  public onProgress(callback: (progress: TriggerProgress) => void): () => void {
    this.progressCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Emit progress update to all subscribers
   */
  private emitProgress(progress: TriggerProgress): void {
    this.progressCallbacks.forEach(callback => callback(progress));
  }

  /**
   * Check if auto-trigger should run and execute if conditions are met
   */
  public async checkAndTrigger(): Promise<boolean> {
    if (!this.config.enabled || this.isGenerating) {
      return false;
    }

    const onboardingData = getBusinessOnboardingData();
    if (!onboardingData) {
      console.log('AutoTrigger: No onboarding data found');
      return false;
    }

    // Check if plan already exists for this data
    const existingPlan = appPlanAgent.getLatestPlan();
    if (existingPlan && this.isRecentPlan(existingPlan.generatedAt, onboardingData.completedAt)) {
      console.log('AutoTrigger: Recent plan already exists');
      return false;
    }

    console.log('AutoTrigger: Conditions met, starting generation...');
    return this.executeAutoGeneration(onboardingData);
  }

  /**
   * Execute the automatic app plan generation
   */
  private async executeAutoGeneration(onboardingData: any): Promise<boolean> {
    this.isGenerating = true;

    try {
      // Show initial trigger notification
      if (this.config.showProgress) {
        toast({
          title: "🤖 AI Agent Activated",
          description: "Analyzing your business requirements to create a comprehensive app plan...",
          duration: 4000
        });
      }

      // Wait for configured delay
      await this.delay(this.config.delay);

      // Stage 1: Initializing
      this.emitProgress({
        stage: 'initializing',
        progress: 10,
        message: 'Setting up AI analysis...',
        estimatedTimeRemaining: 45
      });

      // Convert onboarding data to app plan input
      const input: AppPlanInput = {
        businessName: onboardingData.businessName,
        appPurpose: onboardingData.appPurpose,
        industry: onboardingData.industry,
        targetAudience: onboardingData.targetAudience,
        communicationPreference: onboardingData.communicationPreference,
        budget: onboardingData.budget,
        timeline: onboardingData.timeline
      };

      // Stage 2: Analyzing
      this.emitProgress({
        stage: 'analyzing',
        progress: 25,
        message: `Analyzing ${input.industry} industry requirements...`,
        estimatedTimeRemaining: 35
      });

      await this.delay(2000);

      // Stage 3: Generating
      this.emitProgress({
        stage: 'generating',
        progress: 50,
        message: 'AI generating comprehensive app plan...',
        estimatedTimeRemaining: 20
      });

      // Generate the plan using enhanced AI prompts
      const generatedPlan = await appPlanAgent.generatePlan(input, {
        model: 'gpt-4',
        includeMarketAnalysis: true,
        includeCostEstimates: true,
        includeWireframes: false,
        detailLevel: 'detailed',
        focusAreas: ['technical', 'business', 'design']
      });

      // Stage 4: Structuring
      this.emitProgress({
        stage: 'structuring',
        progress: 80,
        message: 'Structuring recommendations and timeline...',
        estimatedTimeRemaining: 8
      });

      await this.delay(2000);

      // Stage 5: Finalizing
      this.emitProgress({
        stage: 'finalizing',
        progress: 95,
        message: 'Finalizing your app development plan...',
        estimatedTimeRemaining: 2
      });

      await this.delay(1000);

      // Stage 6: Complete
      this.emitProgress({
        stage: 'complete',
        progress: 100,
        message: `App plan ready for ${input.businessName}!`,
        estimatedTimeRemaining: 0
      });

      // Show completion notification
      if (this.config.showProgress) {
        toast({
          title: "✅ App Plan Generated!",
          description: `Comprehensive plan created for ${input.businessName} with ${generatedPlan.features.length} features and detailed implementation roadmap.`,
          duration: 5000
        });
      }

      // Redirect if configured
      if (this.config.redirectAfterGeneration) {
        setTimeout(() => {
          window.location.href = this.config.redirectUrl;
        }, 2000);
      }

      return true;

    } catch (error) {
      console.error('AutoTrigger: Generation failed', error);
      
      this.emitProgress({
        stage: 'complete',
        progress: 0,
        message: 'Generation failed. Please try manually.',
        estimatedTimeRemaining: 0
      });

      if (this.config.showProgress) {
        toast({
          title: "❌ Generation Failed",
          description: "There was an issue generating your app plan. Please try again manually.",
          variant: "destructive",
          duration: 5000
        });
      }

      return false;
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Check if existing plan is recent enough to skip regeneration
   */
  private isRecentPlan(planDate: string, onboardingDate: string): boolean {
    const planTime = new Date(planDate).getTime();
    const onboardingTime = new Date(onboardingDate).getTime();
    
    // Consider plan recent if it was generated after onboarding completion
    return planTime > onboardingTime;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Configure the auto-trigger system
   */
  public configure(config: Partial<AutoTriggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if system is currently generating
   */
  public isCurrentlyGenerating(): boolean {
    return this.isGenerating;
  }

  /**
   * Force stop generation (emergency use)
   */
  public forceStop(): void {
    this.isGenerating = false;
    this.emitProgress({
      stage: 'complete',
      progress: 0,
      message: 'Generation stopped by user.',
      estimatedTimeRemaining: 0
    });
  }
}

// Global instance for use across the application
export const autoTriggerSystem = new AutoTriggerSystem();

/**
 * Hook for React components to use auto-trigger system
 */
export function useAutoTrigger() {
  const [currentProgress, setCurrentProgress] = useState<TriggerProgress | null>(null);
  
  useEffect(() => {
    const unsubscribe = autoTriggerSystem.onProgress(setCurrentProgress);
    return unsubscribe;
  }, []);

  return {
    currentProgress,
    isGenerating: autoTriggerSystem.isCurrentlyGenerating(),
    checkAndTrigger: () => autoTriggerSystem.checkAndTrigger(),
    configure: (config: Partial<AutoTriggerConfig>) => autoTriggerSystem.configure(config)
  };
}

/**
 * Onboarding completion trigger - call this when onboarding finishes
 */
export async function triggerOnOnboardingComplete(): Promise<void> {
  console.log('🚀 Onboarding completed - checking auto-trigger conditions...');
  
  // Small delay to ensure data is saved
  setTimeout(async () => {
    const triggered = await autoTriggerSystem.checkAndTrigger();
    
    if (triggered) {
      console.log('✅ Auto-trigger executed successfully');
    } else {
      console.log('ℹ️ Auto-trigger conditions not met or disabled');
    }
  }, 500);
} 