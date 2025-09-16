/**
 * WELLNESS TAB CONFIGURATION
 * 
 * Defines the configuration for the Wellness tab.
 * This tab focuses on physical health, mental wellbeing, fitness activities,
 * and lifestyle habits that support overall life performance.
 * 
 * BUSINESS REASONING:
 * - Physical and mental wellness directly impact cognitive performance
 * - Regular wellness activities prevent burnout and maintain energy
 * - Integration with morning and evening routines for holistic health
 * - Green theme represents health, vitality, and natural balance
 * 
 * TIME RELEVANCE:
 * - Primary: Morning (6-8am) and evening (6-8pm) for routine integration
 * - Lunch break (12-1pm) for midday wellness activities
 * - Flexible throughout the day for wellness check-ins
 * 
 * FEATURES:
 * - Workout tracking and planning
 * - Nutrition and hydration monitoring
 * - Mental health check-ins and mood tracking
 * - Stress management and relaxation techniques
 * - Sleep optimization and tracking
 */

import { TabConfig } from '../../types/tab-types';
import { Heart } from 'lucide-react';

/**
 * Complete wellness tab configuration focused on holistic health optimization.
 * Integrates physical fitness, mental health, and lifestyle wellness practices.
 */
export const wellnessTabConfig: TabConfig = {
  // CORE IDENTIFICATION
  id: 'wellness',
  label: 'Wellness',
  icon: Heart,
  component: null as any, // Will be set by registry during initialization
  order: 3,
  enabled: true,

  // TIME-BASED CONFIGURATION (morning, lunch, and evening focus)
  timeRange: {
    start: 6,   // 6 AM (morning wellness routine)
    end: 20,    // 8 PM (evening wellness activities)
    priority: 8 // High priority for health maintenance
  },

  // VISUAL THEME (health-focused green palette)
  theme: {
    primary: 'text-green-400',
    background: 'bg-green-400/10',
    border: 'border-green-400/30',
    hover: 'hover:bg-green-400/20',
    active: 'bg-green-400/25',
    gradient: 'from-green-500 to-emerald-500' // Backward compatibility
  },

  // ACCESSIBILITY CONFIGURATION
  accessibility: {
    ariaLabel: 'Wellness Tab',
    description: 'Health, fitness, and wellness activities for optimal life performance',
    keyboardShortcut: 'Ctrl+4',
    role: 'tab',
    ariaAttributes: {
      'aria-controls': 'wellness-tabpanel',
      'aria-describedby': 'wellness-tab-description'
    }
  },

  // ACCESS CONTROL
  permissions: ['user', 'admin'],

  // FEATURE FLAGS (comprehensive wellness tracking)
  features: [
    'workout-tracking',     // Exercise and fitness activity logging
    'nutrition-monitoring', // Food intake and nutrition tracking
    'hydration-reminders',  // Water intake tracking and reminders
    'mood-tracking',        // Mental health and emotional state tracking
    'stress-management',    // Stress level monitoring and coping techniques
    'sleep-optimization',   // Sleep quality tracking and improvement
    'habit-formation',      // Wellness habit building and tracking
    'body-metrics',         // Weight, measurements, health vitals
    'mindfulness-sessions', // Meditation and mindfulness practices
    'recovery-tracking'     // Rest and recovery optimization
  ],

  // ENVIRONMENT CONFIGURATION
  environment: 'both', // Available in both dev and production

  // VALIDATION RULES
  validation: {
    required: ['id', 'label', 'icon', 'component', 'theme', 'accessibility', 'permissions'],
    customValidators: [
      // Ensure time range covers key wellness periods
      (tab) => tab.timeRange ? tab.timeRange.start <= 8 && tab.timeRange.end >= 18 : true,
      // Ensure workout tracking for fitness
      (tab) => tab.features.includes('workout-tracking'),
      // Ensure mood tracking for mental health
      (tab) => tab.features.includes('mood-tracking'),
      // Ensure habit formation for behavior change
      (tab) => tab.features.includes('habit-formation')
    ],
    errorMessages: {
      'timeRange': 'Wellness tab should cover morning and evening wellness periods',
      'workout-tracking': 'Wellness tab must include workout-tracking for fitness',
      'mood-tracking': 'Wellness tab must include mood-tracking for mental health',
      'habit-formation': 'Wellness tab must include habit-formation for behavior change'
    }
  },

  // FALLBACK CONFIGURATION
  fallback: {
    label: 'Wellness (Safe Mode)',
    enabled: true,
    theme: {
      primary: 'text-gray-400',
      background: 'bg-gray-400/10',
      border: 'border-gray-400/30'
    },
    features: ['workout-tracking', 'mood-tracking', 'habit-formation'] // Essential features
  },

  // BACKWARD COMPATIBILITY FIELDS
  timeRelevance: [6, 7, 8, 12, 18, 19], // Legacy format
  color: 'from-green-500 to-emerald-500', // Legacy gradient
  description: 'Health, fitness, and wellness activities', // Legacy description
  componentPath: 'HomeWorkoutSection + HealthNonNegotiablesSection' // Legacy component reference
};

/**
 * Wellness tab specific configuration constants
 */
export const WELLNESS_TAB_CONSTANTS = {
  // XP rewards for wellness activities (encouraging healthy habits)
  XP_REWARDS: {
    WORKOUT_COMPLETION: 25,  // High reward for exercise
    HEALTHY_MEAL: 10,        // Moderate reward for nutrition
    HYDRATION_GOAL: 5,       // Small but frequent reward
    MINDFULNESS_SESSION: 15, // Good reward for mental health
    SLEEP_GOAL: 20,          // High reward for quality sleep
    CONSISTENCY_BONUS: 30    // Major bonus for daily consistency
  },

  // Wellness categories and activities
  WELLNESS_CATEGORIES: [
    {
      name: 'Physical Fitness',
      activities: ['Strength Training', 'Cardio', 'Flexibility', 'Sports', 'Walking'],
      icon: '💪',
      color: 'green'
    },
    {
      name: 'Mental Health',
      activities: ['Meditation', 'Journaling', 'Therapy', 'Mindfulness', 'Breathing'],
      icon: '🧠',
      color: 'blue'
    },
    {
      name: 'Nutrition',
      activities: ['Healthy Meals', 'Meal Prep', 'Hydration', 'Supplements', 'Mindful Eating'],
      icon: '🥗',
      color: 'emerald'
    },
    {
      name: 'Recovery',
      activities: ['Sleep', 'Rest Days', 'Massage', 'Stretching', 'Relaxation'],
      icon: '😴',
      color: 'purple'
    }
  ],

  // Default wellness routines
  DEFAULT_ROUTINES: {
    MORNING: [
      'Drink water upon waking',
      'Light stretching or movement',
      'Healthy breakfast',
      'Mood check-in',
      'Set wellness intention for the day'
    ],
    LUNCH: [
      'Nutritious lunch',
      'Short walk or movement',
      'Hydration check',
      'Stress level assessment'
    ],
    EVENING: [
      'Reflect on physical activity',
      'Evening stretching or yoga',
      'Prepare for quality sleep',
      'Gratitude practice'
    ]
  },

  // Wellness metrics and tracking
  METRICS: {
    PHYSICAL: ['Weight', 'Body Fat %', 'Muscle Mass', 'Energy Level', 'Pain/Discomfort'],
    MENTAL: ['Mood', 'Stress Level', 'Anxiety', 'Focus', 'Motivation'],
    LIFESTYLE: ['Sleep Hours', 'Sleep Quality', 'Water Intake', 'Steps', 'Active Minutes'],
    NUTRITION: ['Calories', 'Protein', 'Vegetables', 'Processed Foods', 'Mindful Eating']
  },

  // Time-based wellness suggestions
  SUGGESTIONS: {
    EARLY_MORNING: [
      'Gentle movement to wake up the body',
      'Hydrate after overnight fast',
      'Set positive intention for the day'
    ],
    MORNING: [
      'Energizing workout or walk',
      'Nutritious breakfast',
      'Mood and energy assessment'
    ],
    MIDDAY: [
      'Healthy lunch break',
      'Brief movement or stretching',
      'Stress management check-in'
    ],
    EVENING: [
      'Relaxing movement or yoga',
      'Reflect on wellness wins',
      'Prepare for restorative sleep'
    ]
  }
} as const;

/**
 * Validation function specific to wellness tab
 */
export const validateWellnessTabConfig = (config: TabConfig): boolean => {
  // Ensure required wellness features
  const requiredFeatures = ['workout-tracking', 'mood-tracking', 'habit-formation'];
  const hasRequiredFeatures = requiredFeatures.every(feature => 
    config.features.includes(feature)
  );

  // Ensure time range covers key wellness periods (morning and evening)
  const hasValidTimeRange = config.timeRange ? 
    config.timeRange.start <= 8 && config.timeRange.end >= 18 : true;

  // Ensure health-focused theme (green family)
  const hasValidTheme = config.theme.primary.includes('green') || 
                       config.theme.primary.includes('emerald');

  // Ensure high priority for health importance
  const hasValidPriority = config.timeRange ? 
    config.timeRange.priority && config.timeRange.priority >= 7 : true;

  return hasRequiredFeatures && hasValidTimeRange && hasValidTheme && hasValidPriority;
};

/**
 * Export for tab registry
 */
export default wellnessTabConfig;