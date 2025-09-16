/**
 * DEEP WORK TAB CONFIGURATION
 * 
 * Defines the configuration for the Deep Work tab.
 * This tab is dedicated to high-concentration, cognitively demanding tasks
 * that require sustained focus and minimal interruptions.
 * 
 * BUSINESS REASONING:
 * - Deep work produces the most valuable output and breakthrough thinking
 * - Requires protected time blocks with minimal distractions
 * - Higher XP rewards reflect the difficulty and value of deep work
 * - Purple theme conveys focus, creativity, and premium importance
 * 
 * TIME RELEVANCE:
 * - Primary: 9am-12pm and 2pm-5pm (peak cognitive hours)
 * - Avoids post-lunch energy dips and morning routine times
 * - Highest priority for time-based suggestions during focus hours
 * 
 * FEATURES:
 * - Focus timer with distraction blocking
 * - Deep work session tracking and analytics
 * - Environment optimization (lighting, sound, etc.)
 * - Progress visualization and breakthrough moments
 * - Integration with productivity methodologies (GTD, etc.)
 */

import { TabConfig } from '../../types/tab-types';
import { Zap } from 'lucide-react';

/**
 * Complete deep work tab configuration optimized for high-performance focus sessions.
 * Implements research-backed productivity principles for optimal cognitive output.
 */
export const deepWorkTabConfig: TabConfig = {
  // CORE IDENTIFICATION
  id: 'work', // Maintains backward compatibility with existing 'work' id
  label: 'Deep Work',
  icon: Zap,
  component: null as any, // Will be set by registry during initialization
  order: 2,
  enabled: true,

  // TIME-BASED CONFIGURATION (optimized for cognitive peak hours)
  timeRange: {
    start: 9,   // 9 AM (after morning routine and coffee)
    end: 17,    // 5 PM (before evening wind-down)
    priority: 10 // Maximum priority during deep work hours
  },

  // VISUAL THEME (premium purple for high-value work)
  theme: {
    primary: 'text-purple-400',
    background: 'bg-purple-400/10',
    border: 'border-purple-400/30',
    hover: 'hover:bg-purple-400/20',
    active: 'bg-purple-400/25',
    gradient: 'from-purple-500 to-purple-600' // Backward compatibility
  },

  // ACCESSIBILITY CONFIGURATION
  accessibility: {
    ariaLabel: 'Deep Work Tab',
    description: 'High-focus work sessions for cognitively demanding tasks and breakthrough thinking',
    keyboardShortcut: 'Ctrl+3',
    role: 'tab',
    ariaAttributes: {
      'aria-controls': 'deep-work-tabpanel',
      'aria-describedby': 'deep-work-tab-description'
    }
  },

  // ACCESS CONTROL (may require special permissions for premium features)
  permissions: ['user', 'admin', 'premium'],

  // FEATURE FLAGS (advanced productivity features)
  features: [
    'focus-timer',          // Pomodoro and custom focus timers
    'distraction-blocking', // Block notifications and distractions
    'deep-metrics',         // Advanced analytics and insights
    'breakthrough-tracking', // Track moments of insight/progress
    'environment-control',   // Lighting, sound, workspace optimization
    'flow-state-detection', // Detect and maintain flow states
    'session-planning',     // Pre-plan deep work sessions
    'cognitive-load-management', // Monitor and manage mental fatigue
    'progress-visualization', // Visual progress tracking
    'methodology-integration' // GTD, PARA, etc. integration
  ],

  // ENVIRONMENT CONFIGURATION
  environment: 'both', // Available in both dev and production

  // VALIDATION RULES
  validation: {
    required: ['id', 'label', 'icon', 'component', 'theme', 'accessibility', 'permissions'],
    customValidators: [
      // Ensure time range optimizes for cognitive peak hours
      (tab) => tab.timeRange ? tab.timeRange.start >= 8 && tab.timeRange.end <= 18 : true,
      // Ensure focus timer for deep work methodology
      (tab) => tab.features.includes('focus-timer'),
      // Ensure distraction blocking for focus protection
      (tab) => tab.features.includes('distraction-blocking'),
      // Ensure deep metrics for performance optimization
      (tab) => tab.features.includes('deep-metrics'),
      // Ensure highest priority during focus hours
      (tab) => tab.timeRange ? tab.timeRange.priority === 10 : true
    ],
    errorMessages: {
      'timeRange': 'Deep work tab should be within optimal cognitive hours (8 AM - 6 PM)',
      'focus-timer': 'Deep work tab must include focus-timer for time management',
      'distraction-blocking': 'Deep work tab must include distraction-blocking for focus protection',
      'deep-metrics': 'Deep work tab must include deep-metrics for performance tracking',
      'priority': 'Deep work tab must have maximum priority (10) during focus hours'
    }
  },

  // FALLBACK CONFIGURATION
  fallback: {
    label: 'Deep Work (Safe Mode)',
    enabled: true,
    theme: {
      primary: 'text-gray-400',
      background: 'bg-gray-400/10',
      border: 'border-gray-400/30'
    },
    features: ['focus-timer', 'deep-metrics'] // Core features only
  },

  // BACKWARD COMPATIBILITY FIELDS
  timeRelevance: [9, 10, 11, 12, 13, 14, 15, 16, 17], // Legacy format
  color: 'from-purple-500 to-purple-600', // Legacy gradient
  description: 'Deep focus work sessions', // Legacy description
  componentPath: 'DeepFocusWorkSection' // Legacy component reference
};

/**
 * Deep work tab specific configuration constants
 */
export const DEEP_WORK_TAB_CONSTANTS = {
  // XP rewards for deep work (highest rewards for most valuable work)
  XP_REWARDS: {
    MAIN_TASK: 20,        // High XP for deep work importance
    SUBTASK: 8,           // Higher subtask XP for complexity
    FLOW_STATE_BONUS: 25, // Major bonus for achieving flow state
    SESSION_COMPLETION: 30, // Major bonus for completing planned session
    BREAKTHROUGH_BONUS: 50  // Exceptional bonus for breakthrough moments
  },

  // Focus session templates based on research
  SESSION_TEMPLATES: [
    {
      name: 'Deep Dive (2 hours)',
      duration: 120,
      breaks: [{ at: 25, duration: 5 }, { at: 55, duration: 15 }],
      type: 'marathon'
    },
    {
      name: 'Focused Sprint (45 min)',
      duration: 45,
      breaks: [],
      type: 'sprint'
    },
    {
      name: 'Creative Flow (90 min)',
      duration: 90,
      breaks: [{ at: 45, duration: 10 }],
      type: 'creative'
    },
    {
      name: 'Problem Solving (60 min)',
      duration: 60,
      breaks: [{ at: 30, duration: 5 }],
      type: 'analytical'
    }
  ],

  // Distraction blocking levels
  BLOCKING_LEVELS: {
    LIGHT: {
      notifications: false,
      socialMedia: false,
      news: false,
      entertainment: false
    },
    MODERATE: {
      notifications: true,
      socialMedia: true,
      news: true,
      entertainment: true,
      communication: false // Keep work communication
    },
    INTENSIVE: {
      notifications: true,
      socialMedia: true,
      news: true,
      entertainment: true,
      communication: true,
      internet: false // Block all non-essential internet
    }
  },

  // Cognitive load indicators
  COGNITIVE_LOAD_LEVELS: {
    LOW: { score: 1, color: 'green', description: 'Ready for complex tasks' },
    MODERATE: { score: 2, color: 'yellow', description: 'Good for focused work' },
    HIGH: { score: 3, color: 'orange', description: 'Consider lighter tasks' },
    OVERLOADED: { score: 4, color: 'red', description: 'Break recommended' }
  },

  // Flow state indicators and triggers
  FLOW_STATE_METRICS: {
    TRIGGERS: [
      'Clear goals set',
      'Immediate feedback available',
      'Challenge matches skill level',
      'Distractions eliminated',
      'Optimal environment configured'
    ],
    INDICATORS: [
      'Time perception altered',
      'Self-consciousness reduced',
      'Effortless concentration',
      'Intrinsic motivation high',
      'Sense of control present'
    ]
  },

  // Time-based optimization suggestions
  OPTIMIZATION_SUGGESTIONS: {
    MORNING: [
      'Tackle most challenging problems',
      'Creative thinking and brainstorming',
      'Complex analysis and research'
    ],
    MIDDAY: [
      'Systematic work and implementation',
      'Detail-oriented tasks',
      'Process optimization'
    ],
    AFTERNOON: [
      'Review and refinement',
      'Testing and validation',
      'Documentation and communication'
    ]
  }
} as const;

/**
 * Validation function specific to deep work tab
 */
export const validateDeepWorkTabConfig = (config: TabConfig): boolean => {
  // Ensure all critical deep work features
  const requiredFeatures = ['focus-timer', 'distraction-blocking', 'deep-metrics'];
  const hasRequiredFeatures = requiredFeatures.every(feature => 
    config.features.includes(feature)
  );

  // Ensure optimal time range for cognitive peak hours
  const hasValidTimeRange = config.timeRange ? 
    config.timeRange.start >= 8 && config.timeRange.end <= 18 : true;

  // Ensure maximum priority during focus hours
  const hasMaxPriority = config.timeRange ? 
    config.timeRange.priority === 10 : true;

  // Ensure premium theme for high-value work
  const hasValidTheme = config.theme.primary.includes('purple') || 
                       config.theme.primary.includes('blue');

  // Ensure premium permissions for advanced features
  const hasPremiumAccess = config.permissions.includes('premium');

  return hasRequiredFeatures && hasValidTimeRange && hasMaxPriority && 
         hasValidTheme && hasPremiumAccess;
};

/**
 * Export for tab registry
 */
export default deepWorkTabConfig;