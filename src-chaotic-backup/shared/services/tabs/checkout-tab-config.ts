/**
 * CHECKOUT TAB CONFIGURATION
 * 
 * Defines the configuration for the Checkout tab.
 * This tab handles evening review, daily reflection, next-day preparation,
 * and end-of-day optimization for continuous improvement.
 * 
 * BUSINESS REASONING:
 * - Evening reflection is crucial for learning and growth
 * - Daily review prevents issues from compounding
 * - Next-day preparation reduces morning decision fatigue
 * - Indigo-blue theme promotes calm reflection and closure
 * 
 * TIME RELEVANCE:
 * - Primary: Evening hours (6-10pm) for reflection and wrap-up
 * - End-of-workday transition period (5-7pm) for work closure
 * - Late evening (9-10pm) for next-day preparation
 * 
 * FEATURES:
 * - Daily review and reflection prompts
 * - Achievement celebration and progress tracking
 * - Next-day planning and preparation
 * - Lessons learned capture and documentation
 * - Gratitude practice and positive psychology
 */

import { TabConfig } from '../../types/tab-types';
import { Moon } from 'lucide-react';

/**
 * Complete checkout tab configuration for comprehensive daily closure.
 * Implements reflection practices and continuous improvement methodologies.
 */
export const checkoutTabConfig: TabConfig = {
  // CORE IDENTIFICATION
  id: 'checkout',
  label: 'Checkout',
  icon: Moon,
  component: null as any, // Will be set by registry during initialization
  order: 5,
  enabled: true,

  // TIME-BASED CONFIGURATION (evening reflection period)
  timeRange: {
    start: 18,  // 6 PM (end of work day)
    end: 22,    // 10 PM (bedtime preparation)
    priority: 8 // High priority for day closure
  },

  // VISUAL THEME (calming evening colors)
  theme: {
    primary: 'text-indigo-400',
    background: 'bg-indigo-400/10',
    border: 'border-indigo-400/30',
    hover: 'hover:bg-indigo-400/20',
    active: 'bg-indigo-400/25',
    gradient: 'from-indigo-500 to-blue-600' // Backward compatibility
  },

  // ACCESSIBILITY CONFIGURATION
  accessibility: {
    ariaLabel: 'Checkout Tab',
    description: 'Evening review, reflection, and next-day preparation for continuous improvement',
    keyboardShortcut: 'Ctrl+6',
    role: 'tab',
    ariaAttributes: {
      'aria-controls': 'checkout-tabpanel',
      'aria-describedby': 'checkout-tab-description'
    }
  },

  // ACCESS CONTROL
  permissions: ['user', 'admin'],

  // FEATURE FLAGS (comprehensive reflection and planning)
  features: [
    'daily-review',          // Structured daily review process
    'achievement-celebration', // Celebrate wins and progress
    'reflection-prompts',    // Guided reflection questions
    'lessons-learned',       // Capture insights and learning
    'next-day-planning',     // Prepare for tomorrow
    'gratitude-practice',    // Positive psychology integration
    'progress-visualization', // Visual progress tracking
    'habit-reflection',      // Review habit performance
    'energy-assessment',     // End-of-day energy evaluation
    'improvement-suggestions', // AI-powered improvement recommendations
    'mood-tracking',         // Evening mood and satisfaction
    'challenge-identification' // Identify areas for improvement
  ],

  // ENVIRONMENT CONFIGURATION
  environment: 'both', // Available in both dev and production

  // VALIDATION RULES
  validation: {
    required: ['id', 'label', 'icon', 'component', 'theme', 'accessibility', 'permissions'],
    customValidators: [
      // Ensure time range covers evening reflection period
      (tab) => tab.timeRange ? tab.timeRange.start >= 17 && tab.timeRange.end <= 23 : true,
      // Ensure daily review for reflection
      (tab) => tab.features.includes('daily-review'),
      // Ensure reflection prompts for structured thinking
      (tab) => tab.features.includes('reflection-prompts'),
      // Ensure next-day planning for preparation
      (tab) => tab.features.includes('next-day-planning')
    ],
    errorMessages: {
      'timeRange': 'Checkout tab should cover evening reflection hours (5 PM - 11 PM)',
      'daily-review': 'Checkout tab must include daily-review for structured reflection',
      'reflection-prompts': 'Checkout tab must include reflection-prompts for guided thinking',
      'next-day-planning': 'Checkout tab must include next-day-planning for preparation'
    }
  },

  // FALLBACK CONFIGURATION
  fallback: {
    label: 'Checkout (Safe Mode)',
    enabled: true,
    theme: {
      primary: 'text-gray-400',
      background: 'bg-gray-400/10',
      border: 'border-gray-400/30'
    },
    features: ['daily-review', 'reflection-prompts', 'next-day-planning'] // Essential features
  },

  // BACKWARD COMPATIBILITY FIELDS
  timeRelevance: [18, 19, 20, 21], // Legacy format
  color: 'from-indigo-500 to-blue-600', // Legacy gradient
  description: 'Evening review and wrap-up', // Legacy description
  componentPath: 'NightlyCheckoutSection' // Legacy component reference
};

/**
 * Checkout tab specific configuration constants
 */
export const CHECKOUT_TAB_CONSTANTS = {
  // XP rewards for reflection and planning activities
  XP_REWARDS: {
    DAILY_REVIEW_COMPLETION: 20,  // High reward for daily reflection
    GRATITUDE_PRACTICE: 10,       // Reward for positive psychology
    LESSONS_LEARNED: 15,          // Reward for capturing insights
    NEXT_DAY_PLANNING: 15,        // Reward for preparation
    ACHIEVEMENT_CELEBRATION: 5,   // Reward for acknowledging wins
    IMPROVEMENT_COMMITMENT: 25,   // Major reward for growth commitment
    CONSISTENCY_STREAK: 30        // Major bonus for daily consistency
  },

  // Daily review framework (based on productivity research)
  REVIEW_FRAMEWORK: {
    SECTIONS: [
      {
        name: 'Achievements',
        questions: [
          'What did I accomplish today?',
          'What am I most proud of?',
          'Which goals did I advance?'
        ],
        type: 'celebration'
      },
      {
        name: 'Challenges',
        questions: [
          'What obstacles did I encounter?',
          'What didn\'t go as planned?',
          'Where did I struggle?'
        ],
        type: 'analysis'
      },
      {
        name: 'Learning',
        questions: [
          'What did I learn today?',
          'What would I do differently?',
          'What insights did I gain?'
        ],
        type: 'growth'
      },
      {
        name: 'Gratitude',
        questions: [
          'What am I grateful for today?',
          'Who helped me or inspired me?',
          'What positive moments stood out?'
        ],
        type: 'appreciation'
      },
      {
        name: 'Tomorrow',
        questions: [
          'What are my top 3 priorities for tomorrow?',
          'How can I prepare for success?',
          'What potential obstacles should I anticipate?'
        ],
        type: 'preparation'
      }
    ]
  },

  // Reflection prompt categories
  REFLECTION_CATEGORIES: [
    {
      name: 'Personal Growth',
      prompts: [
        'How did I challenge myself today?',
        'What comfort zone did I step out of?',
        'How did I develop as a person?'
      ],
      frequency: 'daily'
    },
    {
      name: 'Relationships',
      prompts: [
        'How did I connect with others today?',
        'What positive impact did I have on someone?',
        'How can I improve my relationships?'
      ],
      frequency: 'weekly'
    },
    {
      name: 'Health & Wellness',
      prompts: [
        'How did I take care of my physical health?',
        'What was my energy level like?',
        'How was my mental and emotional state?'
      ],
      frequency: 'daily'
    },
    {
      name: 'Productivity',
      prompts: [
        'How effectively did I use my time?',
        'What systems or processes worked well?',
        'Where can I optimize my productivity?'
      ],
      frequency: 'daily'
    }
  ],

  // Next-day preparation checklist
  PREPARATION_CHECKLIST: [
    {
      category: 'Planning',
      items: [
        'Review calendar for tomorrow',
        'Set top 3 priorities',
        'Identify potential obstacles',
        'Plan first task of the day'
      ]
    },
    {
      category: 'Environment',
      items: [
        'Organize workspace',
        'Prepare necessary materials',
        'Set up technology/tools',
        'Clear physical and digital clutter'
      ]
    },
    {
      category: 'Mental',
      items: [
        'Visualize successful day',
        'Set positive intention',
        'Release today\'s stress',
        'Prepare mentally for challenges'
      ]
    },
    {
      category: 'Logistics',
      items: [
        'Check weather and plan accordingly',
        'Prepare meals or snacks',
        'Set optimal bedtime',
        'Ensure adequate rest'
      ]
    }
  ],

  // Progress visualization metrics
  PROGRESS_METRICS: [
    { name: 'Daily Goal Completion', type: 'percentage', color: 'green' },
    { name: 'Habit Consistency', type: 'streak', color: 'blue' },
    { name: 'Energy Level Trend', type: 'line-chart', color: 'yellow' },
    { name: 'Mood Tracking', type: 'mood-chart', color: 'purple' },
    { name: 'Productivity Score', type: 'score', color: 'orange' },
    { name: 'Learning Progress', type: 'cumulative', color: 'teal' }
  ],

  // Evening optimization suggestions
  OPTIMIZATION_SUGGESTIONS: {
    HIGH_ACHIEVEMENT_DAY: [
      'Celebrate your wins - you earned it!',
      'Identify what made today successful',
      'Plan how to replicate this success'
    ],
    CHALLENGING_DAY: [
      'Focus on lessons learned and growth',
      'Practice self-compassion',
      'Plan specific improvements for tomorrow'
    ],
    AVERAGE_DAY: [
      'Look for small wins and progress',
      'Identify one area for tomorrow\'s improvement',
      'Appreciate consistent effort'
    ]
  }
} as const;

/**
 * Validation function specific to checkout tab
 */
export const validateCheckoutTabConfig = (config: TabConfig): boolean => {
  // Ensure required reflection features
  const requiredFeatures = ['daily-review', 'reflection-prompts', 'next-day-planning'];
  const hasRequiredFeatures = requiredFeatures.every(feature => 
    config.features.includes(feature)
  );

  // Ensure time range covers evening reflection period
  const hasValidTimeRange = config.timeRange ? 
    config.timeRange.start >= 17 && config.timeRange.end <= 23 : true;

  // Ensure calming evening theme
  const hasValidTheme = config.theme.primary.includes('indigo') || 
                       config.theme.primary.includes('blue');

  // Ensure high priority for day closure importance
  const hasValidPriority = config.timeRange ? 
    config.timeRange.priority && config.timeRange.priority >= 7 : true;

  return hasRequiredFeatures && hasValidTimeRange && hasValidTheme && hasValidPriority;
};

/**
 * Export for tab registry
 */
export default checkoutTabConfig;