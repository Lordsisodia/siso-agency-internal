/**
 * LIGHT WORK TAB CONFIGURATION
 * 
 * Defines the configuration for the Light Work tab.
 * This tab handles lighter tasks, quick wins, and less intensive work
 * that doesn't require deep focus but still contributes to productivity.
 * 
 * BUSINESS REASONING:
 * - Light work fills gaps between deep focus sessions
 * - Perfect for administrative tasks, emails, and quick project updates
 * - Lower cognitive load allows for task switching and multitasking
 * - Green/emerald theme suggests growth and steady progress
 * 
 * TIME RELEVANCE:
 * - Primary: 10am-2pm and 4pm-6pm (between deep focus blocks)
 * - Extended: Available throughout work hours for flexibility
 * - Medium priority for time-based suggestions
 * 
 * FEATURES:
 * - Quick task capture and completion
 * - Email and communication management
 * - Administrative task processing
 * - Time tracking for lighter activities
 * - Template-based task creation
 */

import { TabConfig } from '../../types/tab-types';
import { Coffee } from 'lucide-react';

/**
 * Complete light work tab configuration with enhanced type safety.
 * Balances productivity with cognitive load management.
 */
export const lightWorkTabConfig: TabConfig = {
  // CORE IDENTIFICATION
  id: 'light-work',
  label: 'Light',
  icon: Coffee,
  component: null as any, // Will be set by registry during initialization
  order: 1,
  enabled: true,

  // TIME-BASED CONFIGURATION
  timeRange: {
    start: 9,   // 9 AM (after morning routine)
    end: 17,    // 5 PM (work hours)
    priority: 6 // Medium priority (lower than deep work)
  },

  // VISUAL THEME (maintains existing color scheme)
  theme: {
    primary: 'text-emerald-400',
    background: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    hover: 'hover:bg-emerald-400/20',
    active: 'bg-emerald-400/25',
    gradient: 'from-emerald-500 to-teal-500' // Backward compatibility
  },

  // ACCESSIBILITY CONFIGURATION
  accessibility: {
    ariaLabel: 'Light Work Tab',
    description: 'Light tasks, quick wins, and administrative work management',
    keyboardShortcut: 'Ctrl+2',
    role: 'tab',
    ariaAttributes: {
      'aria-controls': 'light-work-tabpanel',
      'aria-describedby': 'light-work-tab-description'
    }
  },

  // ACCESS CONTROL
  permissions: ['user', 'admin'],

  // FEATURE FLAGS
  features: [
    'quick-add',          // Rapid task entry
    'task-templates',     // Pre-defined task templates
    'time-tracking',      // Time spent on light tasks
    'batch-processing',   // Group similar tasks
    'email-integration',  // Email task creation
    'priority-sorting',   // Automatic priority assignment
    'completion-streaks', // Track consecutive completions
    'break-reminders'     // Suggest breaks between tasks
  ],

  // ENVIRONMENT CONFIGURATION
  environment: 'both', // Available in both dev and production

  // VALIDATION RULES
  validation: {
    required: ['id', 'label', 'icon', 'component', 'theme', 'accessibility', 'permissions'],
    customValidators: [
      // Ensure time range covers standard work hours
      (tab) => tab.timeRange ? tab.timeRange.start >= 8 && tab.timeRange.end <= 18 : true,
      // Ensure quick-add feature is present for light work efficiency
      (tab) => tab.features.includes('quick-add'),
      // Ensure task templates for productivity
      (tab) => tab.features.includes('task-templates')
    ],
    errorMessages: {
      'timeRange': 'Light work tab time range should be within work hours (8 AM - 6 PM)',
      'quick-add': 'Light work tab must include quick-add feature for efficiency',
      'task-templates': 'Light work tab must include task-templates for productivity'
    }
  },

  // FALLBACK CONFIGURATION
  fallback: {
    label: 'Light Work (Safe Mode)',
    enabled: true,
    theme: {
      primary: 'text-gray-400',
      background: 'bg-gray-400/10',
      border: 'border-gray-400/30'
    },
    features: ['quick-add', 'time-tracking'] // Essential features only
  },

  // BACKWARD COMPATIBILITY FIELDS
  timeRelevance: [9, 10, 11, 12, 13, 14, 15, 16, 17], // Legacy format
  color: 'from-emerald-500 to-teal-500', // Legacy gradient
  description: 'Light work tasks and activities', // Legacy description
  componentPath: 'LightFocusWorkSection' // Legacy component reference
};

/**
 * Light work tab specific configuration constants
 */
export const LIGHT_WORK_TAB_CONSTANTS = {
  // XP rewards for light work activities
  XP_REWARDS: {
    MAIN_TASK: 10,    // Moderate XP for light tasks
    SUBTASK: 5,       // Standard subtask XP
    QUICK_WIN: 3,     // Small XP for very quick tasks
    BATCH_BONUS: 15   // Bonus for completing task batches
  },

  // Task categories for light work
  TASK_CATEGORIES: [
    'Email & Communication',
    'Administrative Tasks',
    'Quick Updates',
    'Planning & Organization',
    'Research & Reading',
    'Social Media & Marketing'
  ],

  // Task templates for common light work
  TASK_TEMPLATES: [
    {
      name: 'Check and respond to emails',
      estimatedTime: 15,
      category: 'Email & Communication',
      priority: 'medium'
    },
    {
      name: 'Update project status',
      estimatedTime: 10,
      category: 'Administrative Tasks',
      priority: 'medium'
    },
    {
      name: 'Quick team check-in',
      estimatedTime: 5,
      category: 'Communication',
      priority: 'low'
    },
    {
      name: 'File organization',
      estimatedTime: 20,
      category: 'Administrative Tasks',
      priority: 'low'
    }
  ],

  // Time-based suggestions for light work
  SUGGESTIONS: {
    MID_MORNING: [
      'Check overnight emails',
      'Quick project updates',
      'Calendar review for the day'
    ],
    EARLY_AFTERNOON: [
      'Administrative catch-up',
      'Follow-up communications',
      'Light research tasks'
    ],
    LATE_AFTERNOON: [
      'Email cleanup',
      'Tomorrow\'s preparation',
      'Quick wins wrap-up'
    ]
  },

  // Break reminders (in minutes)
  BREAK_INTERVALS: {
    SHORT_BREAK: 25,  // Pomodoro-style
    LONG_BREAK: 90,   // Extended focus sessions
    MICRO_BREAK: 15   // Quick refreshers
  }
} as const;

/**
 * Validation function specific to light work tab
 */
export const validateLightWorkTabConfig = (config: TabConfig): boolean => {
  // Ensure required light work features
  const requiredFeatures = ['quick-add', 'task-templates'];
  const hasRequiredFeatures = requiredFeatures.every(feature => 
    config.features.includes(feature)
  );

  // Ensure work-hours time range
  const hasValidTimeRange = config.timeRange ? 
    config.timeRange.start >= 8 && config.timeRange.end <= 18 : true;

  // Ensure appropriate theme (green family for growth/progress)
  const hasValidTheme = config.theme.primary.includes('emerald') || 
                       config.theme.primary.includes('green') ||
                       config.theme.primary.includes('teal');

  // Ensure reasonable priority (not highest, not lowest)
  const hasValidPriority = config.timeRange ? 
    config.timeRange.priority && config.timeRange.priority >= 4 && config.timeRange.priority <= 7 : true;

  return hasRequiredFeatures && hasValidTimeRange && hasValidTheme && hasValidPriority;
};

/**
 * Export for tab registry
 */
export default lightWorkTabConfig;
