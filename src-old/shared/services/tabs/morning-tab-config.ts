/**
 * MORNING TAB CONFIGURATION
 * 
 * Defines the configuration for the Morning Routine tab.
 * This tab focuses on morning planning, routine activities, and setting
 * the foundation for a productive day.
 * 
 * BUSINESS REASONING:
 * - Morning routines are critical for daily success and mental clarity
 * - Early hours (6-10am) are optimal for planning and habit formation
 * - High XP rewards incentivize consistent morning routine completion
 * - Orange/yellow theme evokes sunrise and energy
 * 
 * TIME RELEVANCE:
 * - Primary: 6-9am (peak morning routine time)
 * - Extended: Up to 10am for flexibility
 * - High priority during these hours for tab suggestions
 * 
 * FEATURES:
 * - Morning habit tracking
 * - Daily planning and goal setting
 * - Energy level assessment
 * - Motivational content
 * - Voice command integration
 */

import { TabConfig } from '../../types/tab-types';
import { Sunrise } from 'lucide-react';

/**
 * Complete morning tab configuration with enhanced type safety.
 * Maintains backward compatibility while adding new features.
 */
export const morningTabConfig: TabConfig = {
  // CORE IDENTIFICATION
  id: 'morning',
  label: 'Morning',
  icon: Sunrise,
  component: null as any, // Will be set by registry during initialization
  order: 0,
  enabled: true,

  // TIME-BASED CONFIGURATION
  timeRange: {
    start: 6,  // 6 AM
    end: 10,   // 10 AM  
    priority: 9 // High priority during morning hours
  },

  // VISUAL THEME (maintains existing color scheme)
  theme: {
    primary: 'text-orange-400',
    background: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    hover: 'hover:bg-orange-400/20',
    active: 'bg-orange-400/25',
    gradient: 'from-orange-500 to-yellow-500' // Backward compatibility
  },

  // ACCESSIBILITY CONFIGURATION
  accessibility: {
    ariaLabel: 'Morning Routine Tab',
    description: 'Morning routine planning and habit tracking for optimal day start',
    keyboardShortcut: 'Ctrl+1',
    role: 'tab',
    ariaAttributes: {
      'aria-controls': 'morning-tabpanel',
      'aria-describedby': 'morning-tab-description'
    }
  },

  // ACCESS CONTROL
  permissions: ['user', 'admin'],

  // FEATURE FLAGS
  features: [
    'voice-commands',     // Voice input for morning reflections
    'habit-tracking',     // Morning habit completion tracking
    'morning-briefing',   // Daily summary and weather
    'energy-assessment',  // Morning energy level tracking
    'goal-setting',       // Daily goal planning
    'motivational-content' // Inspirational quotes/content
  ],

  // ENVIRONMENT CONFIGURATION
  environment: 'both', // Available in both dev and production

  // VALIDATION RULES
  validation: {
    required: ['id', 'label', 'icon', 'component', 'theme', 'accessibility', 'permissions'],
    customValidators: [
      // Ensure time range makes sense for morning activities
      (tab) => tab.timeRange ? tab.timeRange.start >= 5 && tab.timeRange.end <= 12 : true,
      // Ensure morning-specific features are present
      (tab) => tab.features.includes('habit-tracking'),
    ],
    errorMessages: {
      'timeRange': 'Morning tab time range should be between 5 AM and 12 PM',
      'features': 'Morning tab must include habit-tracking feature'
    }
  },

  // FALLBACK CONFIGURATION
  fallback: {
    label: 'Morning (Safe Mode)',
    enabled: true,
    theme: {
      primary: 'text-gray-400',
      background: 'bg-gray-400/10',
      border: 'border-gray-400/30'
    },
    features: ['habit-tracking'] // Minimal feature set for fallback
  },

  // BACKWARD COMPATIBILITY FIELDS
  timeRelevance: [6, 7, 8, 9], // Legacy format
  color: 'from-orange-500 to-yellow-500', // Legacy gradient
  description: 'Morning routine and planning', // Legacy description
  componentPath: 'MorningRoutineSection' // Legacy component reference
};

/**
 * Morning tab specific configuration constants
 */
export const MORNING_TAB_CONSTANTS = {
  // XP rewards for morning activities
  XP_REWARDS: {
    MAIN_TASK: 15,    // Higher XP for morning routine importance
    SUBTASK: 5,       // Standard subtask XP
    BONUS: 10         // Bonus for completing entire routine
  },

  // Default morning routine items
  DEFAULT_ROUTINES: [
    'Wake up at consistent time',
    'Drink water',
    'Light exercise or stretching',
    'Meditation or mindfulness',
    'Review daily goals',
    'Healthy breakfast'
  ],

  // Time-based suggestions
  SUGGESTIONS: {
    EARLY_MORNING: [
      'Start with gentle movement',
      'Practice gratitude',
      'Review priorities for the day'
    ],
    LATE_MORNING: [
      'Quick energy boost activity',
      'Final goal review',
      'Transition to work mode'
    ]
  }
} as const;

/**
 * Validation function specific to morning tab
 */
export const validateMorningTabConfig = (config: TabConfig): boolean => {
  // Ensure required morning-specific features
  const requiredFeatures = ['habit-tracking'];
  const hasRequiredFeatures = requiredFeatures.every(feature => 
    config.features.includes(feature)
  );

  // Ensure appropriate time range
  const hasValidTimeRange = config.timeRange ? 
    config.timeRange.start >= 5 && config.timeRange.end <= 12 : true;

  // Ensure morning theme colors
  const hasValidTheme = config.theme.primary.includes('orange') || 
                       config.theme.primary.includes('yellow');

  return hasRequiredFeatures && hasValidTimeRange && hasValidTheme;
};

/**
 * Export for tab registry
 */
export default morningTabConfig;