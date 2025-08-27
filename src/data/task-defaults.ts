/**
 * Centralized Task Defaults - Extracted from Components
 * 
 * This file consolidates all hardcoded task arrays found across components
 * to follow the DRY principle and make task management easier.
 * 
 * Benefits:
 * - Single source of truth for default tasks
 * - Easy to modify task configurations
 * - Consistent task structure across components
 * - Reduces code duplication
 */

import { 
  Sun,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Droplets,
  Dumbbell,
  Brain,
  Newspaper,
  Target,
  Calendar as CalendarIcon,
  Activity,
  Heart,
  Coffee,
  Book,
  Briefcase,
  Home,
  Zap
} from 'lucide-react';

// Base task interface
export interface TaskDefault {
  key: string;
  title: string;
  description?: string;
  timeEstimate?: string;
  icon?: any;
  hasTimeTracking?: boolean;
  subtasks?: Array<{
    key: string;
    title: string;
    description?: string;
  }>;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  category?: string;
}

// ============================================================================
// MORNING ROUTINE TASKS (extracted from MorningRoutineSection.tsx)
// ============================================================================

export const MORNING_ROUTINE_TASKS: TaskDefault[] = [
  {
    key: 'wakeUp',
    title: 'Wake Up',
    description: 'Start the day before midday to maximize productivity. Track your wake-up time.',
    timeEstimate: '5 min',
    icon: Sun,
    hasTimeTracking: true,
    subtasks: []
  },
  {
    key: 'getBloodFlowing',
    title: 'Get Blood Flowing (5 min)',
    description: 'Max rep push-ups (Target PB: 30) - Physical activation to wake up the body.',
    timeEstimate: '5 min',
    icon: Dumbbell,
    hasTimeTracking: false,
    subtasks: [
      { key: 'pushups', title: 'Push-ups (PB 30)' },
      { key: 'situps', title: 'Sit-ups' },
      { key: 'pullups', title: 'Pull-ups' }
    ]
  },
  {
    key: 'freshenUp',
    title: 'Freshen Up (25 min)',
    description: 'Cold shower to wake up - Personal hygiene and cleanliness.',
    timeEstimate: '25 min',
    icon: Droplets,
    hasTimeTracking: false,
    subtasks: [
      { key: 'bathroom', title: 'Bathroom break' },
      { key: 'brushTeeth', title: 'Brush teeth' },
      { key: 'coldShower', title: 'Cold shower' },
      { key: 'skincare', title: 'Skincare routine' },
      { key: 'getDressed', title: 'Get dressed' }
    ]
  },
  {
    key: 'mentalActivation',
    title: 'Mental Activation (10 min)',
    description: 'Light reading and news consumption - Stay informed without overwhelm.',
    timeEstimate: '10 min',
    icon: Brain,
    hasTimeTracking: false,
    subtasks: [
      { key: 'readNews', title: 'Read news headlines' },
      { key: 'checkWeather', title: 'Check weather' },
      { key: 'quickReading', title: 'Quick educational reading' }
    ]
  },
  {
    key: 'dayPreparation',
    title: 'Day Preparation (15 min)',
    description: 'Review goals and plan the day ahead - Set intentions and priorities.',
    timeEstimate: '15 min',
    icon: Target,
    hasTimeTracking: false,
    subtasks: [
      { key: 'reviewGoals', title: 'Review daily goals' },
      { key: 'checkCalendar', title: 'Check calendar' },
      { key: 'planDay', title: 'Plan day structure' },
      { key: 'setIntentions', title: 'Set daily intentions' }
    ]
  },
  {
    key: 'healthCheck',
    title: 'Health Check (5 min)',
    description: 'Body awareness and basic health monitoring - Listen to your body.',
    timeEstimate: '5 min',
    icon: Heart,
    hasTimeTracking: false,
    subtasks: [
      { key: 'bodyCheck', title: 'Body awareness check' },
      { key: 'energyLevel', title: 'Assess energy level' },
      { key: 'moodCheck', title: 'Check mental state' }
    ]
  },
  {
    key: 'gratitude',
    title: 'Gratitude Practice (5 min)',
    description: 'Practice gratitude and positive mindset - Start the day with appreciation.',
    timeEstimate: '5 min',
    icon: Heart,
    hasTimeTracking: false,
    subtasks: [
      { key: 'threeThings', title: 'Three things grateful for' },
      { key: 'positiveAffirmation', title: 'Positive affirmation' },
      { key: 'mindfulMoment', title: 'Mindful moment' }
    ]
  }
];

// ============================================================================
// DEEP FOCUS WORK TASKS
// ============================================================================

export const DEEP_FOCUS_WORK_TASKS: TaskDefault[] = [
  {
    key: 'criticalProject',
    title: 'Critical Project Work',
    description: 'High-priority project requiring deep focus and concentration.',
    timeEstimate: '2 hours',
    icon: Briefcase,
    priority: 'critical',
    category: 'deep-work',
    subtasks: [
      { key: 'planning', title: 'Project planning' },
      { key: 'execution', title: 'Core work execution' },
      { key: 'review', title: 'Work review and iteration' }
    ]
  },
  {
    key: 'strategicThinking',
    title: 'Strategic Planning',
    description: 'Long-term strategic thinking and business planning.',
    timeEstimate: '90 min',
    icon: Brain,
    priority: 'high',
    category: 'strategy',
    subtasks: [
      { key: 'analysis', title: 'Situation analysis' },
      { key: 'planning', title: 'Strategic planning' },
      { key: 'documentation', title: 'Document decisions' }
    ]
  },
  {
    key: 'creativeWork',
    title: 'Creative Development',
    description: 'Creative work requiring uninterrupted focus.',
    timeEstimate: '1 hour',
    icon: Zap,
    priority: 'high',
    category: 'creative',
    subtasks: [
      { key: 'brainstorming', title: 'Brainstorming session' },
      { key: 'creation', title: 'Creative execution' },
      { key: 'refinement', title: 'Refine and polish' }
    ]
  }
];

// ============================================================================
// LIGHT WORK TASKS  
// ============================================================================

export const LIGHT_WORK_TASKS: TaskDefault[] = [
  {
    key: 'emailProcessing',
    title: 'Email Processing',
    description: 'Process and respond to emails efficiently.',
    timeEstimate: '30 min',
    icon: Circle,
    priority: 'medium',
    category: 'communication',
    subtasks: [
      { key: 'inbox', title: 'Clear inbox' },
      { key: 'responses', title: 'Send responses' },
      { key: 'organization', title: 'Organize emails' }
    ]
  },
  {
    key: 'adminTasks',
    title: 'Administrative Tasks',
    description: 'Handle routine administrative work.',
    timeEstimate: '45 min',
    icon: CheckCircle2,
    priority: 'medium',
    category: 'admin',
    subtasks: [
      { key: 'documentation', title: 'Update documentation' },
      { key: 'filing', title: 'File documents' },
      { key: 'scheduling', title: 'Schedule appointments' }
    ]
  },
  {
    key: 'quickMeetings',
    title: 'Quick Check-ins',
    description: 'Brief meetings and status updates.',
    timeEstimate: '20 min',
    icon: Calendar,
    priority: 'medium',
    category: 'meetings',
    subtasks: [
      { key: 'teamCheckin', title: 'Team check-in' },
      { key: 'statusUpdate', title: 'Status update' },
      { key: 'nextSteps', title: 'Plan next steps' }
    ]
  }
];

// ============================================================================
// WELLNESS TASKS
// ============================================================================

export const WELLNESS_TASKS: TaskDefault[] = [
  {
    key: 'workoutSession',
    title: 'Workout Session',
    description: 'Physical exercise for health and energy.',
    timeEstimate: '45 min',
    icon: Dumbbell,
    priority: 'high',
    category: 'fitness',
    subtasks: [
      { key: 'warmup', title: 'Warm-up (5 min)' },
      { key: 'mainWorkout', title: 'Main workout (30 min)' },
      { key: 'cooldown', title: 'Cool-down (10 min)' }
    ]
  },
  {
    key: 'meditation',
    title: 'Meditation Practice',
    description: 'Mindfulness and mental wellness practice.',
    timeEstimate: '15 min',
    icon: Brain,
    priority: 'medium',
    category: 'mental-health',
    subtasks: [
      { key: 'breathing', title: 'Breathing exercises' },
      { key: 'mindfulness', title: 'Mindful meditation' },
      { key: 'reflection', title: 'Reflection time' }
    ]
  },
  {
    key: 'healthyMeal',
    title: 'Healthy Meal Prep',
    description: 'Prepare nutritious meals for sustained energy.',
    timeEstimate: '30 min',
    icon: Heart,
    priority: 'medium',
    category: 'nutrition',
    subtasks: [
      { key: 'planning', title: 'Plan meals' },
      { key: 'preparation', title: 'Prep ingredients' },
      { key: 'cooking', title: 'Cook meal' }
    ]
  }
];

// ============================================================================
// EVENING CHECKOUT TASKS
// ============================================================================

export const CHECKOUT_TASKS: TaskDefault[] = [
  {
    key: 'dayReview',
    title: 'Day Review',
    description: 'Reflect on the day\'s accomplishments and lessons.',
    timeEstimate: '10 min',
    icon: CheckCircle2,
    priority: 'medium',
    category: 'reflection',
    subtasks: [
      { key: 'accomplishments', title: 'Note accomplishments' },
      { key: 'lessons', title: 'Identify lessons learned' },
      { key: 'improvements', title: 'Areas for improvement' }
    ]
  },
  {
    key: 'tomorrowPrep',
    title: 'Tomorrow Preparation',
    description: 'Prepare for tomorrow to ensure a smooth start.',
    timeEstimate: '15 min',
    icon: Calendar,
    priority: 'medium',
    category: 'planning',
    subtasks: [
      { key: 'priorities', title: 'Set tomorrow priorities' },
      { key: 'schedule', title: 'Review schedule' },
      { key: 'preparation', title: 'Prepare materials' }
    ]
  },
  {
    key: 'windDown',
    title: 'Wind Down Routine',
    description: 'Relax and prepare for quality sleep.',
    timeEstimate: '20 min',
    icon: Heart,
    priority: 'low',
    category: 'relaxation',
    subtasks: [
      { key: 'cleanup', title: 'Tidy workspace' },
      { key: 'relaxation', title: 'Relaxation activity' },
      { key: 'sleepPrep', title: 'Prepare for sleep' }
    ]
  }
];

// ============================================================================
// TASK COLLECTION MAP
// ============================================================================

export const TASK_COLLECTIONS = {
  morning: MORNING_ROUTINE_TASKS,
  'deep-work': DEEP_FOCUS_WORK_TASKS,
  'light-work': LIGHT_WORK_TASKS,
  wellness: WELLNESS_TASKS,
  checkout: CHECKOUT_TASKS
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get tasks for a specific section
 */
export function getTasksForSection(section: keyof typeof TASK_COLLECTIONS): TaskDefault[] {
  return TASK_COLLECTIONS[section] || [];
}

/**
 * Get all tasks flattened
 */
export function getAllTasks(): TaskDefault[] {
  return Object.values(TASK_COLLECTIONS).flat();
}

/**
 * Get tasks by category
 */
export function getTasksByCategory(category: string): TaskDefault[] {
  return getAllTasks().filter(task => task.category === category);
}

/**
 * Get tasks by priority
 */
export function getTasksByPriority(priority: TaskDefault['priority']): TaskDefault[] {
  return getAllTasks().filter(task => task.priority === priority);
}

/**
 * Calculate total estimated time for task array
 */
export function calculateTotalTime(tasks: TaskDefault[]): number {
  return tasks.reduce((total, task) => {
    if (!task.timeEstimate) return total;
    
    const timeMatch = task.timeEstimate.match(/(\d+)\s*(min|hour|hr)/i);
    if (!timeMatch) return total;
    
    const value = parseInt(timeMatch[1]);
    const unit = timeMatch[2].toLowerCase();
    
    if (unit.startsWith('h')) {
      return total + (value * 60);
    } else {
      return total + value;
    }
  }, 0);
}

export default TASK_COLLECTIONS;