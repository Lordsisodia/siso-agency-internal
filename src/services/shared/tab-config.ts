/**
 * TAB CONFIGURATION - SIMPLE COMPATIBILITY LAYER
 *
 * This file provides a simple, backward-compatible interface to the new tab system.
 * It avoids complex initialization and circular import issues by keeping things simple.
 *
 * MIGRATION STRATEGY:
 * This can be renamed to tab-config.ts to replace the original file seamlessly.
 *
 * PHASE 2 COMPLETE: Diet section moved to Health/Nutrition sub-tab
 * - 'nutrition' added to TabId type
 * - Nutrition tab configuration added
 * - Old 'diet' tab kept for backward compatibility
 *
 * PHASE 4 COMPLETE: Health merged into Stats section
 * - Stats now has 4 tabs: Smoking, Water, Fitness, Nutrition
 * - 'health' tab now maps to Stats/Fitness
 * - More button moved to 4th pill position
 */

import {
  Sunrise,
  Coffee,
  Zap,
  Heart,
  Calendar,
  Moon,
  ListChecks,
  Apple,
  LucideIcon
} from 'lucide-react';

// Re-export enhanced system components for opt-in usage
export { tabRegistry } from './TabRegistry';
export { ConfigLoader } from './ConfigLoader';
export { 
  useTabConfiguration, 
  useTabList, 
  useTabSuggestion,
  useTabConfigHealth 
} from '../../lib/hooks/useTabConfiguration';

// Re-export all types
export type * from '../types/tab-types';

// EXACT LEGACY COMPATIBILITY - maintains original interface
// PHASE 4: Health tabs now map to Stats section
export type TabId =
  | 'morning'
  | 'light-work'
  | 'work'
  | 'deep-work'  // New ID for deep work tab
  | 'wellness'  // Maps to Stats/Fitness (PHASE 4)
  | 'health'  // Maps to Stats/Fitness (PHASE 4)
  | 'water'  // Stats subtab (PHASE 3: moved from Health to Stats)
  | 'fitness'  // Stats subtab (PHASE 4: moved from Health to Stats)
  | 'smoking'  // Stats subtab (PHASE 3: moved from Health to Stats)
  | 'nutrition'  // Stats subtab (PHASE 4: moved from Health to Stats)
  | 'stats'  // New Stats section (PHASE 3)
  | 'tasks'
  | 'timebox'
  | 'checkout'
  | 'diet';

export interface TabConfig {
  id: TabId;
  name: string;
  icon: LucideIcon;
  timeRelevance: number[];
  color: string;
  description: string;
  componentPath: string;
}

/**
 * TAB_CONFIG - Exact replica of original configuration
 * This maintains 100% backward compatibility
 */
export const TAB_CONFIG: Record<TabId, TabConfig> = {
  'morning': {
    id: 'morning',
    name: 'Morning',
    icon: Sunrise,
    timeRelevance: [6, 7, 8, 9],
    color: 'from-orange-500 to-yellow-500',
    description: 'Morning routine and planning',
    componentPath: 'MorningRoutineSection'
  },
  'light-work': {
    id: 'light-work',
    name: 'Light',
    icon: Coffee,
    timeRelevance: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    color: 'from-emerald-500 to-teal-500',
    description: 'Light work tasks and activities',
    componentPath: 'LightFocusWorkSection'
  },
  'work': {
    id: 'work',
    name: 'Deep',
    icon: Zap,
    timeRelevance: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    color: 'from-purple-500 to-purple-600',
    description: 'Deep focus work sessions',
    componentPath: 'DeepFocusWorkSection'
  },
  'deep-work': {
    id: 'deep-work',
    name: 'Deep Work',
    icon: Zap,
    timeRelevance: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    color: 'from-purple-500 to-purple-600',
    description: 'Deep focus work sessions',
    componentPath: 'DeepFocusWorkSection'
  },
  'wellness': {
    id: 'wellness',
    name: 'Wellness',
    icon: Heart,
    timeRelevance: [6, 7, 8, 12, 18, 19],
    color: 'from-green-500 to-emerald-500',
    description: 'Health, fitness, and wellness activities',
    componentPath: 'HomeWorkoutSection + HealthNonNegotiablesSection'
  },
  'health': {
    id: 'health',
    name: 'Health',
    icon: Heart,
    timeRelevance: [6, 7, 8, 12, 18, 19],
    color: 'from-rose-500 to-pink-500',
    description: 'Health, fitness, and wellness activities',
    componentPath: 'HomeWorkoutSection + WaterTracker'
  },
  'water': {
    id: 'water',
    name: 'Water',
    icon: Heart,
    timeRelevance: [6, 7, 8, 12, 18, 19],
    color: 'from-blue-500 to-cyan-500',
    description: 'Hydration tracking',
    componentPath: 'WaterTrackerCard'
  },
  'fitness': {
    id: 'fitness',
    name: 'Fitness',
    icon: Heart,
    timeRelevance: [6, 7, 8, 12, 18, 19],
    color: 'from-rose-500 to-pink-500',
    description: 'Fitness and workout tracking',
    componentPath: 'HomeWorkoutSection'
  },
  'smoking': {
    id: 'smoking',
    name: 'Smoking',
    icon: Heart,
    timeRelevance: [6, 7, 8, 12, 18, 19],
    color: 'from-purple-500 to-pink-500',
    description: 'Smoking cessation tracking',
    componentPath: 'SmokingTracker (Stats subtab)'
  },
  'stats': {
    id: 'stats',
    name: 'Stats',
    icon: Heart,
    timeRelevance: [6, 7, 8, 12, 18, 19],
    color: 'from-cyan-500 to-blue-500',
    description: 'Stats tracking (Smoking, Water)',
    componentPath: 'StatsSection'
  },
  'nutrition': {
    id: 'nutrition',
    name: 'Nutrition',
    icon: Apple,
    timeRelevance: [7, 8, 12, 13, 18, 19],
    color: 'from-green-500 to-emerald-500',
    description: 'AI-powered nutrition tracking with photo analysis, meal logging, and macro tracking',
    componentPath: 'DietSection (as Health subtab)'
  },
  'timebox': {
    id: 'timebox',
    name: 'Time Box',
    icon: Calendar,
    timeRelevance: [8, 12, 17],
    color: 'from-purple-500 to-pink-500',
    description: 'Time blocking and schedule management',
    componentPath: 'TimeboxSection'
  },
  'tasks': {
    id: 'tasks',
    name: 'Tasks',
    icon: ListChecks,
    timeRelevance: [9, 12, 15, 18],
    color: 'from-amber-400 to-orange-500',
    description: 'Task list and daily priorities',
    componentPath: 'TasksSection'
  },
  'checkout': {
    id: 'checkout',
    name: 'Checkout',
    icon: Moon,
    timeRelevance: [18, 19, 20, 21],
    color: 'from-indigo-500 to-blue-600',
    description: 'Evening review and wrap-up',
    componentPath: 'NightlyCheckoutSection'
  },
  'diet': {
    id: 'diet',
    name: 'Diet',
    icon: Apple,
    timeRelevance: [7, 8, 12, 13, 18, 19],
    color: 'from-green-500 to-emerald-500',
    description: 'AI-powered nutrition tracking and meal logging',
    componentPath: 'DietSection'
  }
};

// UTILITY FUNCTIONS - Exact replicas of original functions
export const getAllTabIds = (): TabId[] => Object.keys(TAB_CONFIG) as TabId[];

export const getTabConfig = (tabId: TabId): TabConfig => TAB_CONFIG[tabId];

export const isValidTabId = (tabId: string): tabId is TabId => 
  getAllTabIds().includes(tabId as TabId);

// VALIDATION FUNCTION - Exact replica
export const validateTabHandler = (handledTabs: Set<string>): string[] => {
  const allTabs = getAllTabIds();
  const missingTabs = allTabs.filter(tab => !handledTabs.has(tab));
  
  if (missingTabs.length > 0) {
    console.error('🚨 MISSING TAB HANDLERS:', missingTabs);
    console.error('📝 Add these cases to your switch statement:', missingTabs.map(tab => `case '${tab}':`));
  }
  
  return missingTabs;
};

// RUNTIME GUARD - Exact replica
export const assertExhaustive = (x: never): never => {
  throw new Error(`Unhandled tab case: ${x}`);
};

/**
 * ENHANCED FEATURES (OPTIONAL)
 * These provide additional functionality while maintaining compatibility
 */

// Enhanced suggestion function with time-based intelligence
export const getSuggestedTab = (currentHour?: number): TabId => {
  const hour = currentHour ?? new Date().getHours();
  
  // Simple time-based suggestions
  if (hour >= 6 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 14) return 'light-work';
  if (hour >= 14 && hour < 17) return 'work';
  if (hour >= 17 && hour < 19) return 'wellness';
  if (hour >= 19 && hour < 22) return 'checkout';
  
  return 'morning'; // Default fallback
};

// Enhanced health check
export const getSystemHealth = () => {
  return {
    healthy: true,
    issues: [],
    stats: {
      totalTabs: getAllTabIds().length,
      enabledTabs: getAllTabIds().length,
      validationErrors: 0,
      fallbacksUsed: 0
    }
  };
};

// User permission filtering (simplified)
export const getTabsForUser = (permissions: string[] = ['user']): TabId[] => {
  // In the simple version, all tabs are available to all users
  return getAllTabIds();
};

/**
 * DEFAULT EXPORT FOR CONVENIENCE
 */
export default {
  TAB_CONFIG,
  getAllTabIds,
  getTabConfig,
  isValidTabId,
  validateTabHandler,
  assertExhaustive,
  getSuggestedTab,
  getSystemHealth,
  getTabsForUser
};
