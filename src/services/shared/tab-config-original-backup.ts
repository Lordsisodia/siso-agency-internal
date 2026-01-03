/**
 * CENTRALIZED TAB CONFIGURATION
 * 
 * This file defines all LifeLock tabs in one place to prevent routing inconsistencies.
 * 
 * CRITICAL: When adding/modifying tabs:
 * 1. Update this configuration file
 * 2. Ensure TabLayoutWrapper.tsx uses these same IDs
 * 3. Ensure AdminLifeLock.tsx switch statement covers all cases
 * 4. Run tests to verify all tabs work
 */

import { ComponentType } from 'react';
import { 
  Sunrise, 
  Coffee,
  Zap, 
  Heart,
  Calendar, 
  Moon, 
  LucideIcon
} from 'lucide-react';

// STRICT TYPING - This prevents typos and missing cases
export type TabId = 
  | 'morning'
  | 'light-work' 
  | 'work'
  | 'wellness'
  | 'timebox'
  | 'checkout';

export interface TabConfig {
  id: TabId;
  name: string;
  icon: LucideIcon;
  timeRelevance: number[];
  color: string;
  description: string;
  componentPath: string; // For documentation - which component handles this tab
}

/**
 * MASTER TAB CONFIGURATION
 * This is the single source of truth for all LifeLock tabs
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
    name: 'Light Work',
    icon: Coffee,
    timeRelevance: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    color: 'from-emerald-500 to-teal-500',
    description: 'Light work tasks and activities',
    componentPath: 'LightFocusWorkSection'
  },
  'work': {
    id: 'work',
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
  'timebox': {
    id: 'timebox',
    name: 'Time Box',
    icon: Calendar,
    timeRelevance: [8, 12, 17],
    color: 'from-purple-500 to-pink-500',
    description: 'Time blocking and schedule management',
    componentPath: 'TimeboxSection'
  },
  'checkout': {
    id: 'checkout',
    name: 'Checkout',
    icon: Moon,
    timeRelevance: [18, 19, 20, 21],
    color: 'from-indigo-500 to-blue-600',
    description: 'Evening review and wrap-up',
    componentPath: 'NightlyCheckoutSection'
  }
};

// UTILITY FUNCTIONS
export const getAllTabIds = (): TabId[] => Object.keys(TAB_CONFIG) as TabId[];

export const getTabConfig = (tabId: TabId): TabConfig => TAB_CONFIG[tabId];

export const isValidTabId = (tabId: string): tabId is TabId => 
  getAllTabIds().includes(tabId as TabId);

// VALIDATION FUNCTION - Use this to check if all tabs are handled
export const validateTabHandler = (handledTabs: Set<string>): string[] => {
  const allTabs = getAllTabIds();
  const missingTabs = allTabs.filter(tab => !handledTabs.has(tab));
  
  if (missingTabs.length > 0) {
    console.error('🚨 MISSING TAB HANDLERS:', missingTabs);
    console.error('📝 Add these cases to your switch statement:', missingTabs.map(tab => `case '${tab}':`));
  }
  
  return missingTabs;
};

// RUNTIME GUARD - Use this in switch statements
export const assertExhaustive = (x: never): never => {
  throw new Error(`Unhandled tab case: ${x}`);
};