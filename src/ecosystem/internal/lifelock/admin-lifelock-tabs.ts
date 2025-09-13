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

// Import tab components - UPDATED FOR UNIFIED ARCHITECTURE
// ✅ Components from unified /sections/ directory
import { MorningRoutineSection } from './sections/MorningRoutineSection';
import { DeepFocusWorkSection } from './sections/DeepFocusWorkSection';
import SisoDeepFocusPlan from '@/components/ui/siso-deep-focus-plan';

// ✅ Components from unified /sections/ directory  
import { LightFocusWorkSection } from './sections/LightFocusWorkSection';
import { EnhancedLightWorkManager } from '@/shared/ui/enhanced-light-work-manager';
import { HomeWorkoutSection } from './sections/HomeWorkoutSection';
import { HealthNonNegotiablesSection } from './sections/HealthNonNegotiablesSection';
import { TimeboxSection } from './sections/TimeboxSection';
import { NightlyCheckoutSection } from './sections/NightlyCheckoutSection';
import { QuickActionsSection } from '@/ecosystem/internal/tasks/ui/QuickActionsSection';

// Import existing tab config
import { TabId, TAB_CONFIG } from '@/shared/services/tab-config';

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
    backgroundClass: 'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24',
    showDateNav: true,
    components: [MorningRoutineSection],
  },
  
  'focus': {
    id: 'focus' as TabId, // This might need to be mapped to 'work'
    name: 'Focus',
    icon: TAB_CONFIG['work'].icon,
    color: TAB_CONFIG['work'].color,
    description: 'Deep focus work and light tasks',
    layoutType: 'standard',
    backgroundClass: 'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24',
    showDateNav: true,
    components: [DeepFocusWorkSection, EnhancedLightWorkManager],
    additionalContent: QuickActionsSection,
  },
  
  'light': {
    id: 'light' as TabId, // This might need to be mapped to 'light-work'  
    name: 'Light Work',
    icon: TAB_CONFIG['light-work'].icon,
    color: TAB_CONFIG['light-work'].color,
    description: 'Light focus work tasks',
    layoutType: 'standard',
    backgroundClass: 'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24',
    showDateNav: true,
    components: [LightFocusWorkSection],
    additionalContent: QuickActionsSection,
  },
  
  'light-work': {
    ...TAB_CONFIG['light-work'],
    layoutType: 'standard',
    backgroundClass: 'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24',
    showDateNav: true,
    components: [LightFocusWorkSection],
    additionalContent: QuickActionsSection,
  },
  
  'work': {
    ...TAB_CONFIG['work'],
    layoutType: 'standard',
    backgroundClass: 'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24',
    showDateNav: true,
    components: [SisoDeepFocusPlan],
  },
  
  'wellness': {
    ...TAB_CONFIG['wellness'],
    layoutType: 'standard',
    backgroundClass: 'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24',
    showDateNav: true,
    components: [HomeWorkoutSection, HealthNonNegotiablesSection],
  },
  
  'timebox': {
    ...TAB_CONFIG['timebox'],
    layoutType: 'standard',
    backgroundClass: 'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24',
    showDateNav: true,
    components: [TimeboxSection],
  },
  
  'checkout': {
    ...TAB_CONFIG['checkout'],
    layoutType: 'standard',
    backgroundClass: 'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24',
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