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
 *
 * PHASE 2 COMPLETE: Diet section moved to Health/Nutrition sub-tab
 * - Diet section removed from bottom navigation
 * - Nutrition added as 4th Health sub-tab
 * - Old diet routes now redirect to health/nutrition for backward compatibility
 *
 * PHASE 3 COMPLETE: Stats section created with Smoking and Water tracking
 * - Stats section added as 3rd main navigation pill
 * - Smoking and Water moved from Health to Stats
 * - Health now only contains Fitness and Nutrition
 *
 * PHASE 4 COMPLETE: Health merged into Stats, More button moved to 4th pill
 * - Stats now has 4 tabs: Smoking, Water, Fitness, Nutrition
 * - Health section removed from main navigation
 * - More button (9 dots) now integrated as 4th pill
 * - Old health routes now redirect to stats/fitness for backward compatibility
 */

import React from 'react';
import { LucideIcon, Apple } from 'lucide-react';

// Import tab components (relative paths; this file lives at lifelock/_shared/shell)
import { MorningRoutineSection } from '../../1-daily/1-morning-routine/ui/pages/MorningRoutineSection';
import { DeepFocusWorkSection } from '../../1-daily/4-deep-work/ui/pages/DeepFocusWorkSection';
import { LightFocusWorkSection } from '../../1-daily/3-light-work/ui/pages/LightFocusWorkSection';
import { HealthTrackerSection } from '../../1-daily/5-wellness/ui/pages/HealthTrackerSection';
import { HomeWorkoutSection } from '../../1-daily/5-wellness/ui/pages/HomeWorkoutSection';
import { SmokingTracker } from '../../1-daily/5-wellness/ui/components/SmokingTracker';
import { DietSection } from '../../1-daily/8-diet/ui/pages/DietSection';
import { StatsSection } from '../../1-daily/6-stats/ui/pages/StatsSection';
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
  activeSubTab?: string; // Active subtab for sections with sub-navigation
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
    backgroundClass: '',
    showDateNav: true,
    components: [MorningRoutineSection],
  },

  'light-work': {
    ...TAB_CONFIG['light-work'],
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [LightFocusWorkSection],
  },

  'work': {
    ...TAB_CONFIG['work'],
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [DeepFocusWorkSection],
  },

  'deep-work': {
    ...TAB_CONFIG['deep-work'],
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [DeepFocusWorkSection],
  },

  'wellness': {
    ...TAB_CONFIG['wellness'],
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [HomeWorkoutSection],
  },

  // Health is an alias for wellness (renamed in navigation)
  // PHASE 4: Now redirects to Stats/Fitness
  'health': {
    ...TAB_CONFIG['wellness'],
    id: 'health' as TabId,
    name: 'Health',
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [StatsSection],
    componentProps: { activeSubTab: 'fitness' },
  },

  // Stats section (PHASE 3: New section, PHASE 4: Enhanced with Fitness & Nutrition)
  'stats': {
    ...TAB_CONFIG['stats'],
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [StatsSection],
  },

  // Stats subtabs (PHASE 3: Moved from Health, PHASE 4: Added Fitness & Nutrition)
  'water': {
    ...TAB_CONFIG['wellness'],
    id: 'water' as TabId,
    name: 'Water',
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [StatsSection],
    componentProps: { activeSubTab: 'water' },
  },

  'smoking': {
    ...TAB_CONFIG['wellness'],
    id: 'smoking' as TabId,
    name: 'Smoking',
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [StatsSection],
    componentProps: { activeSubTab: 'smoking' },
  },

  // PHASE 4: Fitness moved from Health to Stats
  'fitness': {
    ...TAB_CONFIG['wellness'],
    id: 'fitness' as TabId,
    name: 'Fitness',
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [StatsSection],
    componentProps: { activeSubTab: 'fitness' },
  },

  // PHASE 4: Nutrition moved from Health to Stats
  'nutrition': {
    ...TAB_CONFIG['wellness'],
    id: 'nutrition' as TabId,
    name: 'Nutrition',
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [StatsSection],
    componentProps: { activeSubTab: 'nutrition' },
  },

  // Diet section - PHASE 2: Now redirects to Health/Nutrition, PHASE 4: redirects to Stats/Nutrition
  // Kept for backward compatibility with old routes
  'diet': {
    id: 'diet' as TabId,
    name: 'Diet',
    icon: Apple,
    color: 'text-green-400',
    description: 'AI-powered nutrition tracking',
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [StatsSection],
    componentProps: { activeSubTab: 'nutrition' },
  },

  // Diet subtabs - PHASE 2: Now redirect to Health/Nutrition, PHASE 4: redirect to Stats/Nutrition
  // Kept for backward compatibility with old routes
  'photo': {
    ...TAB_CONFIG['diet'] || {
      id: 'diet' as TabId,
      name: 'Diet',
      icon: Apple,
      color: 'text-green-400',
      description: 'AI-powered nutrition tracking',
    },
    id: 'photo' as TabId,
    name: 'Photo',
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [StatsSection],
    componentProps: { activeSubTab: 'nutrition' },
  },

  'meals': {
    ...TAB_CONFIG['diet'] || {
      id: 'diet' as TabId,
      name: 'Diet',
      icon: Apple,
      color: 'text-green-400',
      description: 'AI-powered nutrition tracking',
    },
    id: 'meals' as TabId,
    name: 'Meals',
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [StatsSection],
    componentProps: { activeSubTab: 'nutrition' },
  },

  'macros': {
    ...TAB_CONFIG['diet'] || {
      id: 'diet' as TabId,
      name: 'Diet',
      icon: Apple,
      color: 'text-green-400',
      description: 'AI-powered nutrition tracking',
    },
    id: 'macros' as TabId,
    name: 'Macros',
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [StatsSection],
    componentProps: { activeSubTab: 'nutrition' },
  },

  'timebox': {
    ...TAB_CONFIG['timebox'],
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [TimeboxSection],
  },
  'tasks': {
    ...TAB_CONFIG['tasks'],
    layoutType: 'standard',
    backgroundClass: '',
    showDateNav: true,
    components: [TasksSection],
  },

  'checkout': {
    ...TAB_CONFIG['checkout'],
    layoutType: 'standard',
    backgroundClass: '',
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
  const config = ENHANCED_TAB_CONFIG[tabId];
  if (!config) {
    console.error('[getEnhancedTabConfig] No config found for tab:', tabId);
    console.error('[getEnhancedTabConfig] Available tabs:', Object.keys(ENHANCED_TAB_CONFIG));
  }
  return config;
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
