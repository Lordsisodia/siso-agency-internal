/**
 * TIMEBOX TAB CONFIGURATION
 * 
 * Defines the configuration for the Time Box tab.
 * This tab focuses on time blocking, schedule management, calendar optimization,
 * and temporal productivity strategies for maximum efficiency.
 * 
 * BUSINESS REASONING:
 * - Time blocking is proven to increase productivity and reduce context switching
 * - Schedule optimization prevents overcommitment and burnout
 * - Calendar management ensures proper work-life balance
 * - Purple-pink gradient conveys premium time management and organization
 * 
 * TIME RELEVANCE:
 * - Primary: Planning periods (8am, 12pm, 5pm) for schedule review
 * - Strategic times for calendar optimization and time block adjustment
 * - Available throughout the day for schedule consultation
 * 
 * FEATURES:
 * - Time blocking and calendar integration
 * - Schedule optimization and conflict detection
 * - Productivity methodology integration (GTD, PARA, etc.)
 * - Meeting efficiency and time audit tools
 * - Energy-based scheduling optimization
 */

import { TabConfig } from '../../types/tab-types';
import { Calendar } from 'lucide-react';

/**
 * Complete timebox tab configuration for advanced time management.
 * Implements productivity research and time optimization methodologies.
 */
export const timeboxTabConfig: TabConfig = {
  // CORE IDENTIFICATION
  id: 'timebox',
  label: 'Time Box',
  icon: Calendar,
  component: null as any, // Will be set by registry during initialization
  order: 4,
  enabled: true,

  // TIME-BASED CONFIGURATION (strategic planning periods)
  timeRange: {
    start: 8,   // 8 AM (morning planning)
    end: 17,    // 5 PM (end-of-day review)
    priority: 7 // High priority during planning periods
  },

  // VISUAL THEME (premium time management colors)
  theme: {
    primary: 'text-purple-400',
    background: 'bg-purple-400/10',
    border: 'border-purple-400/30',
    hover: 'hover:bg-purple-400/20',
    active: 'bg-purple-400/25',
    gradient: 'from-purple-500 to-pink-500' // Backward compatibility
  },

  // ACCESSIBILITY CONFIGURATION
  accessibility: {
    ariaLabel: 'Time Box Tab',
    description: 'Time blocking, schedule management, and productivity optimization tools',
    keyboardShortcut: 'Ctrl+5',
    role: 'tab',
    ariaAttributes: {
      'aria-controls': 'timebox-tabpanel',
      'aria-describedby': 'timebox-tab-description'
    }
  },

  // ACCESS CONTROL
  permissions: ['user', 'admin', 'premium'], // Premium features for advanced time management

  // FEATURE FLAGS (advanced time management tools)
  features: [
    'time-blocking',         // Visual time block creation and management
    'calendar-integration',  // Sync with external calendars
    'schedule-optimization', // AI-powered schedule improvements
    'conflict-detection',    // Detect and resolve scheduling conflicts
    'energy-scheduling',     // Schedule based on energy levels
    'meeting-efficiency',    // Meeting analysis and optimization
    'time-audit',           // Track how time is actually spent
    'productivity-metrics',  // Advanced time usage analytics
    'batch-scheduling',     // Group similar activities
    'buffer-time-management', // Automatic buffer time insertion
    'deadline-tracking',    // Project and task deadline management
    'time-estimation'       // Improve time estimation skills
  ],

  // ENVIRONMENT CONFIGURATION
  environment: 'both', // Available in both dev and production

  // VALIDATION RULES
  validation: {
    required: ['id', 'label', 'icon', 'component', 'theme', 'accessibility', 'permissions'],
    customValidators: [
      // Ensure time range covers key planning periods
      (tab) => tab.timeRange ? tab.timeRange.start <= 9 && tab.timeRange.end >= 16 : true,
      // Ensure time-blocking for core functionality
      (tab) => tab.features.includes('time-blocking'),
      // Ensure calendar integration for practical use
      (tab) => tab.features.includes('calendar-integration'),
      // Ensure schedule optimization for value-add
      (tab) => tab.features.includes('schedule-optimization')
    ],
    errorMessages: {
      'timeRange': 'Timebox tab should cover key planning periods (morning and afternoon)',
      'time-blocking': 'Timebox tab must include time-blocking for core functionality',
      'calendar-integration': 'Timebox tab must include calendar-integration for practical use',
      'schedule-optimization': 'Timebox tab must include schedule-optimization for value'
    }
  },

  // FALLBACK CONFIGURATION
  fallback: {
    label: 'Time Box (Safe Mode)',
    enabled: true,
    theme: {
      primary: 'text-gray-400',
      background: 'bg-gray-400/10',
      border: 'border-gray-400/30'
    },
    features: ['time-blocking', 'calendar-integration'] // Essential features only
  },

  // BACKWARD COMPATIBILITY FIELDS
  timeRelevance: [8, 12, 17], // Legacy format
  color: 'from-purple-500 to-pink-500', // Legacy gradient
  description: 'Time blocking and schedule management', // Legacy description
  componentPath: 'TimeboxSection' // Legacy component reference
};

/**
 * Timebox tab specific configuration constants
 */
export const TIMEBOX_TAB_CONSTANTS = {
  // XP rewards for time management activities
  XP_REWARDS: {
    TIME_BLOCK_COMPLETION: 15, // Reward for completing planned time blocks
    SCHEDULE_OPTIMIZATION: 20, // Reward for optimizing schedule
    MEETING_EFFICIENCY: 10,    // Reward for efficient meetings
    TIME_AUDIT_INSIGHT: 25,    // Reward for time audit insights
    DEADLINE_MET: 30,          // Major reward for meeting deadlines
    ESTIMATION_ACCURACY: 5     // Small reward for accurate time estimates
  },

  // Time block templates based on productivity research
  TIME_BLOCK_TEMPLATES: [
    {
      name: 'Deep Work Block',
      duration: 90,
      type: 'deep-work',
      energyLevel: 'high',
      distractions: 'blocked',
      bufferBefore: 10,
      bufferAfter: 15
    },
    {
      name: 'Communication Block',
      duration: 60,
      type: 'communication',
      energyLevel: 'medium',
      activities: ['email', 'messages', 'calls'],
      bufferBefore: 5,
      bufferAfter: 5
    },
    {
      name: 'Administrative Block',
      duration: 45,
      type: 'administrative',
      energyLevel: 'low',
      activities: ['planning', 'organizing', 'reviewing'],
      bufferBefore: 5,
      bufferAfter: 10
    },
    {
      name: 'Creative Block',
      duration: 120,
      type: 'creative',
      energyLevel: 'high',
      environment: 'inspiring',
      bufferBefore: 15,
      bufferAfter: 15
    }
  ],

  // Energy-based scheduling optimization
  ENERGY_PATTERNS: {
    HIGH_ENERGY_HOURS: [9, 10, 11, 14, 15], // Typical high energy periods
    MEDIUM_ENERGY_HOURS: [8, 12, 13, 16],   // Moderate energy periods
    LOW_ENERGY_HOURS: [7, 17, 18, 19],      // Lower energy periods
    OPTIMAL_ACTIVITIES: {
      HIGH: ['deep-work', 'creative', 'problem-solving', 'learning'],
      MEDIUM: ['meetings', 'communication', 'planning', 'organizing'],
      LOW: ['administrative', 'email', 'organizing', 'reflecting']
    }
  },

  // Meeting efficiency metrics and optimization
  MEETING_EFFICIENCY: {
    OPTIMAL_LENGTHS: [15, 30, 45, 60], // Standard meeting lengths
    EFFICIENCY_FACTORS: [
      'Clear agenda',
      'Defined outcomes',
      'Right attendees',
      'Time boundaries',
      'Action items',
      'Follow-up plan'
    ],
    RED_FLAGS: [
      'No agenda',
      'Too many attendees',
      'Recurring without value',
      'No clear outcome',
      'Poor preparation'
    ]
  },

  // Time audit categories
  TIME_AUDIT_CATEGORIES: [
    { name: 'Deep Work', color: 'purple', value: 'high' },
    { name: 'Meetings', color: 'blue', value: 'medium' },
    { name: 'Communication', color: 'green', value: 'medium' },
    { name: 'Administrative', color: 'yellow', value: 'low' },
    { name: 'Interruptions', color: 'red', value: 'negative' },
    { name: 'Breaks', color: 'gray', value: 'neutral' }
  ],

  // Schedule optimization suggestions
  OPTIMIZATION_SUGGESTIONS: {
    MORNING: [
      'Schedule most important tasks first',
      'Block time for deep work',
      'Minimize early meetings'
    ],
    MIDDAY: [
      'Plan meetings and collaboration',
      'Schedule administrative tasks',
      'Include proper lunch break'
    ],
    AFTERNOON: [
      'Handle communication and email',
      'Complete lighter tasks',
      'Plan for next day'
    ]
  },

  // Buffer time recommendations (in minutes)
  BUFFER_TIMES: {
    BETWEEN_MEETINGS: 15,     // Standard buffer between meetings
    BEFORE_DEEP_WORK: 10,     // Buffer before focus sessions
    AFTER_DEEP_WORK: 15,      // Buffer after focus sessions
    TRAVEL_TIME: 30,          // Buffer for travel between locations
    TASK_SWITCHING: 5         // Buffer for mental context switching
  }
} as const;

/**
 * Validation function specific to timebox tab
 */
export const validateTimeboxTabConfig = (config: TabConfig): boolean => {
  // Ensure required time management features
  const requiredFeatures = ['time-blocking', 'calendar-integration', 'schedule-optimization'];
  const hasRequiredFeatures = requiredFeatures.every(feature => 
    config.features.includes(feature)
  );

  // Ensure time range covers planning periods
  const hasValidTimeRange = config.timeRange ? 
    config.timeRange.start <= 9 && config.timeRange.end >= 16 : true;

  // Ensure premium theme for advanced time management
  const hasValidTheme = config.theme.primary.includes('purple') || 
                       config.theme.primary.includes('pink');

  // Ensure premium permissions for advanced features
  const hasPremiumAccess = config.permissions.includes('premium');

  // Ensure reasonable priority for planning importance
  const hasValidPriority = config.timeRange ? 
    config.timeRange.priority && config.timeRange.priority >= 6 : true;

  return hasRequiredFeatures && hasValidTimeRange && hasValidTheme && 
         hasPremiumAccess && hasValidPriority;
};

/**
 * Export for tab registry
 */
export default timeboxTabConfig;