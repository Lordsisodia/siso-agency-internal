/**
 * Enhanced Tab Configuration for AdminLifeLock Refactoring
 * 
 * Extracted from AdminLifeLock.tsx switch statement (220 lines → external config)
 * This eliminates the massive switch statement by using configuration-driven rendering.
 * 
 * Benefits:
 * - Zero code duplication: Single layout pattern for all tabs
 * - Easy to add new tabs: Just add configuration, no switch case needed
 * - Better maintainability: Tab logic centralized in one file
 * - Type safety: Comprehensive interfaces for all tab properties
 * - A/B testing: Easy to swap different tab configurations
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

// Import tab components (relative paths; this file lives at lifelock/_shared/shell)
import { MorningRoutineSection } from '../../1-daily/1-morning-routine/ui/pages/MorningRoutineSection';
import { DeepFocusWorkSection } from '../../1-daily/4-deep-work/ui/pages/DeepFocusWorkSection';
import { LightFocusWorkSection } from '../../1-daily/3-light-work/ui/pages/LightFocusWorkSection';
import { HomeWorkoutSection } from '../../1-daily/5-wellness/ui/pages/HomeWorkoutSection';
import { WaterTracker } from '../../1-daily/5-wellness/ui/components/WaterTracker';
import { PhotoNutritionTracker } from '../../1-daily/5-wellness/features/photo-nutrition/components/PhotoNutritionTracker';
import { TimeboxSection } from '../../1-daily/6-timebox/ui/pages/TimeboxSection';
import { NightlyCheckoutSection } from '../../1-daily/7-checkout/ui/pages/NightlyCheckoutSection';
import { TasksSection } from '../../1-daily/2-tasks/ui/pages/TasksSection';

// Import existing tab config
import { TabId, TAB_CONFIG } from '@/services/shared/tab-config';

/**
 * Enhanced tab configuration with component mappings and layout variants
 */
export interface EnhancedTabConfig {
  id: TabId;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
  
  // Layout configuration
  layoutType: 'standard' | 'chat' | 'full-screen';
  backgroundClass: string;
  showDateNav: boolean;
  
  // Component configuration
  components: React.ComponentType<any>[];
  additionalContent?: React.ComponentType<any>;
  
  // Props to pass to components
  componentProps?: Record<string, any>;
}

/**
 * Tab component interfaces
 */
export interface TabComponentProps {
  selectedDate: Date;
  // Additional props that might be needed
  [key: string]: any;
}

export interface TabLayoutProps {
  selectedDate: Date;
  dayCompletionPercentage: number;
  navigateDay?: (direction: 'prev' | 'next') => void;
  userId?: string;
  // Handler props for interactive tabs
  handleQuickAdd?: (task: string) => void;
  handleOrganizeTasks?: () => void;
  handleVoiceCommand?: (message: string) => void;
  isAnalyzingTasks?: boolean;
  isProcessingVoice?: boolean;
  todayCard?: any;
}

/**
 * Enhanced tab configurations with component mappings
 * This replaces the entire switch statement with configuration-driven rendering
 */
export const ENHANCED_TAB_CONFIG: Record<TabId, EnhancedTabConfig> = {
  'morning': {
    ...TAB_CONFIG['morning'],
    layoutType: 'standard',
    backgroundClass: 'min-h-screen bg-[#121212] p-4 pb-24',
    showDateNav: true,
    components: [MorningRoutineSection],
  },

  'light-work': {
    ...TAB_CONFIG['light-work'],
    layoutType: 'standard',
    backgroundClass: 'min-h-screen bg-[#121212] p-4 pb-24',
    showDateNav: true,
    components: [LightFocusWorkSection],
  },

  'work': {
    ...TAB_CONFIG['work'],
    layoutType: 'standard',
    backgroundClass: 'min-h-screen bg-[#121212] p-4 pb-24',
    showDateNav: true,
    components: [DeepFocusWorkSection],
  },

  'wellness': {
    ...TAB_CONFIG['wellness'],
    layoutType: 'standard',
    backgroundClass: 'min-h-screen bg-[#121212] p-4 pb-24',
    showDateNav: true,
    components: [WaterTracker, HomeWorkoutSection, PhotoNutritionTracker],
  },
  
  'timebox': {
    ...TAB_CONFIG['timebox'],
    layoutType: 'standard',
    backgroundClass: 'min-h-screen bg-[#121212] p-4 pb-24',
    showDateNav: true,
    components: [TimeboxSection],
  },
  'tasks': {
    ...TAB_CONFIG['tasks'],
    layoutType: 'standard',
    backgroundClass: 'min-h-screen bg-[#121212] p-4 pb-24',
    showDateNav: true,
    components: [TasksSection],
  },
  
  'checkout': {
    ...TAB_CONFIG['checkout'],
    layoutType: 'standard',
    backgroundClass: 'min-h-screen bg-[#121212] p-4 pb-24',
    showDateNav: true,
    components: [NightlyCheckoutSection],
  },
};

/**
 * Helper functions for configuration-driven rendering
 */

/**
 * Get enhanced tab configuration
 */
export function getEnhancedTabConfig(tabId: TabId): EnhancedTabConfig {
  return ENHANCED_TAB_CONFIG[tabId];
}

/**
 * Get all enhanced tab configurations
 */
export function getAllEnhancedTabConfigs(): EnhancedTabConfig[] {
  return Object.values(ENHANCED_TAB_CONFIG);
}

/**
 * Check if tab has interactive components
 */
export function hasInteractiveComponents(tabId: TabId): boolean {
  const config = getEnhancedTabConfig(tabId);
  return !!config.additionalContent || config.components.length > 1;
}

/**
 * Get components for a specific tab
 */
export function getTabComponents(tabId: TabId): React.ComponentType<any>[] {
  const config = getEnhancedTabConfig(tabId);
  return config.components;
}

/**
 * Check if tab uses special layout
 */
export function isSpecialLayout(tabId: TabId): boolean {
  const config = getEnhancedTabConfig(tabId);
  return config.layoutType !== 'standard';
}
