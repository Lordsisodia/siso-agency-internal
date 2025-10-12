/**
 * Enhanced Morning Routine Task Configuration
 * 
 * Updated to match the comprehensive structure from MorningRoutineSection.tsx
 * Extracted to improve:
 * - Maintainability: Centralized task configuration (119 lines → external file)
 * - Testability: Data can be tested independently
 * - Reusability: Other components can use same defaults
 * - Internationalization: Easy to centralize text management
 * - A/B Testing: Easy to swap out different task configurations
 * - Flexibility: Easy to add/remove tasks and subtasks
 */

import { 
  Sun,
  Dumbbell,
  Droplets,
  Brain,
  Calendar as CalendarIcon,
  Heart
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface MorningSubtask {
  key: string;
  title: string;
}

export interface MorningTask {
  key: string;
  title: string;
  description: string;
  timeEstimate: string;
  icon: LucideIcon;
  hasTimeTracking: boolean;
  subtasks: MorningSubtask[];
}

/**
 * Enhanced morning routine tasks configuration
 * These are the comprehensive morning routine tasks with subtasks and time tracking
 */
export const DEFAULT_MORNING_ROUTINE_TASKS: MorningTask[] = [
  {
    key: 'wakeUp' as const,
    title: 'Wake Up',
    description: 'Start the day before midday to maximize productivity. Track your wake-up time.',
    timeEstimate: '5 min',
    icon: Sun,
    hasTimeTracking: true,
    subtasks: []
  },
  {
    key: 'freshenUp' as const,
    title: 'Freshen Up (25 min)',
    description: 'Cold shower to wake up - Personal hygiene and cleanliness.',
    timeEstimate: '25 min',
    icon: Droplets,
    hasTimeTracking: false,
    subtasks: [
      { key: 'bathroom', title: 'Bathroom break' },
      { key: 'brushTeeth', title: 'Brush teeth' },
      { key: 'coldShower', title: 'Cold shower' }
    ]
  },
  {
    key: 'getBloodFlowing' as const,
    title: 'Get Blood Flowing',
    description: 'Max rep push-ups (Target PB: 30) - Physical activation to wake up the body.',
    timeEstimate: '5 min',
    icon: Dumbbell,
    hasTimeTracking: false,
    subtasks: [
      { key: 'pushups', title: 'Push-ups (PB 30)' }
    ]
  },
  {
    key: 'powerUpBrain' as const,
    title: 'Power Up Brain (5 min)',
    description: 'Hydrate and fuel the body and mind.',
    timeEstimate: '5 min',
    icon: Brain,
    hasTimeTracking: false,
    subtasks: [
      { key: 'water', title: 'Water (500ml)' },
      { key: 'supplements', title: 'Supplements' }
    ]
  },
  {
    key: 'planDay' as const,
    title: 'Plan Day (15 min)',
    description: 'Go through tasks, prioritize, and allocate time slots.',
    timeEstimate: '15 min',
    icon: CalendarIcon,
    hasTimeTracking: false,
    subtasks: [
      { key: 'thoughtDump', title: 'Thought dump' },
      { key: 'planDeepWork', title: 'Plan deep work' },
      { key: 'planLightWork', title: 'Plan light work' },
      { key: 'setTimebox', title: 'Set timebox' }
    ]
  },
  {
    key: 'meditation' as const,
    title: 'Meditation (2 min)',
    description: 'Meditate to set an innovative mindset for creating business value.',
    timeEstimate: '2 min',
    icon: Heart,
    hasTimeTracking: false,
    subtasks: []
  }
];

/**
 * Get morning tasks by category (for advanced organization)
 */
export const MORNING_TASKS_BY_CATEGORY = {
  preparation: ['wakeUp', 'freshenUp'],
  physical: ['getBloodFlowing', 'powerUpBrain'],
  mental: ['planDay', 'meditation']
};

/**
 * Helper function to get morning routine tasks (allows for future customization)
 */
export function getMorningRoutineTasks(): MorningTask[] {
  return DEFAULT_MORNING_ROUTINE_TASKS;
}

/**
 * Helper function to get a specific task by key
 */
export function getTaskByKey(key: string): MorningTask | undefined {
  return DEFAULT_MORNING_ROUTINE_TASKS.find(task => task.key === key);
}

/**
 * Helper function to get all subtasks across all tasks
 */
export function getAllSubtasks(): MorningSubtask[] {
  return DEFAULT_MORNING_ROUTINE_TASKS.flatMap(task => task.subtasks);
}

/**
 * Helper function to get tasks with time tracking
 */
export function getTasksWithTimeTracking(): MorningTask[] {
  return DEFAULT_MORNING_ROUTINE_TASKS.filter(task => task.hasTimeTracking);
}

/**
 * Helper function to get total estimated time for all tasks
 */
export function getTotalEstimatedTime(): number {
  return DEFAULT_MORNING_ROUTINE_TASKS.reduce((total, task) => {
    const minutes = parseInt(task.timeEstimate.replace(/\D/g, '')) || 0;
    return total + minutes;
  }, 0);
}

/**
 * Helper function to create custom morning routine
 * Useful for A/B testing different task configurations
 */
export function createCustomMorningRoutine(customTasks: MorningTask[]): MorningTask[] {
  return [...customTasks];
}