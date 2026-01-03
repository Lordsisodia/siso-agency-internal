/**
 * VIEW CONFIGURATIONS - Single source of truth for LifeLock views
 *
 * Each view type (Daily/Weekly/Monthly/Yearly) defines:
 * - Layout type (tabs, grid, calendar, timeline)
 * - Sections to display
 * - Date format and navigation
 * - Rendering rules
 */

import { TabId } from '@/services/shared/tab-config';

export type ViewType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type LayoutType = 'tabs' | 'grid' | 'calendar' | 'timeline';

export interface SectionConfig {
  id: TabId;
  component: string; // Component name to render
  showInCompactMode?: boolean; // For weekly/monthly views
}

export interface ViewConfig {
  id: ViewType;
  name: string;
  layoutType: LayoutType;
  sections: SectionConfig[];
  dateFormat: string;
  supportsTabs: boolean; // Whether this view uses tab navigation
  navigationUnit: 'day' | 'week' | 'month' | 'year';
}

/**
 * DAILY VIEW - Tab-based interface
 * Current implementation: TabLayoutWrapper with section switching
 */
export const DAILY_VIEW_CONFIG: ViewConfig = {
  id: 'daily',
  name: 'Daily View',
  layoutType: 'tabs',
  sections: [
    { id: 'morning', component: 'MorningRoutineSection' },
    { id: 'light-work', component: 'LightFocusWorkSection' },
    { id: 'work', component: 'DeepFocusWorkSection' },
    { id: 'timebox', component: 'TimeboxSection' },
    { id: 'tasks', component: 'TasksSection' },
    { id: 'wellness', component: 'HomeWorkoutSection + HealthNonNegotiablesSection' },
    { id: 'checkout', component: 'NightlyCheckoutSection' },
  ],
  dateFormat: 'yyyy-MM-dd',
  supportsTabs: true,
  navigationUnit: 'day',
};

/**
 * WEEKLY VIEW - Grid layout (future implementation)
 */
export const WEEKLY_VIEW_CONFIG: ViewConfig = {
  id: 'weekly',
  name: 'Weekly View',
  layoutType: 'grid',
  sections: [
    { id: 'morning', component: 'MorningRoutineSection', showInCompactMode: true },
    { id: 'light-work', component: 'LightFocusWorkSection', showInCompactMode: true },
    { id: 'work', component: 'DeepFocusWorkSection', showInCompactMode: true },
  ],
  dateFormat: 'yyyy-[W]II', // Week format
  supportsTabs: false,
  navigationUnit: 'week',
};

/**
 * VIEW REGISTRY - Maps view type to configuration
 */
export const VIEW_CONFIGS: Record<ViewType, ViewConfig> = {
  daily: DAILY_VIEW_CONFIG,
  weekly: WEEKLY_VIEW_CONFIG,
  monthly: DAILY_VIEW_CONFIG, // TODO: Create MONTHLY_VIEW_CONFIG
  yearly: DAILY_VIEW_CONFIG,  // TODO: Create YEARLY_VIEW_CONFIG
};

/**
 * Get configuration for a specific view
 */
export const getViewConfig = (view: ViewType): ViewConfig => {
  return VIEW_CONFIGS[view] || DAILY_VIEW_CONFIG;
};

/**
 * Check if a view supports tab navigation
 */
export const viewSupportsTabs = (view: ViewType): boolean => {
  return getViewConfig(view).supportsTabs;
};
