/**
 * Morning Routine Domain Types
 *
 * Core type definitions for the Morning Routine feature.
 * These types define the structure of tasks, habits, state, and completion tracking.
 */

import type { LucideIcon } from 'lucide-react';

/**
 * Unique identifier for each main task in the morning routine
 */
export type TaskKey = 'wakeUp' | 'freshenUp' | 'getBloodFlowing' | 'powerUpBrain' | 'planDay' | 'meditation';

/**
 * Domain identifier for each task module
 * Maps to the 6 domain-based modules in the refactored architecture
 */
export type TaskDomain = 'wake-up' | 'freshen-up' | 'blood-flow' | 'brain-power' | 'planning' | 'meditation';

/**
 * Subtask within a morning routine task
 * Represents individual habits or actions within a larger task category
 */
export interface SubTask {
  /** Unique identifier for the subtask */
  key: string;
  /** Display title for the subtask */
  title: string;
}

/**
 * Complete definition of a morning routine task
 * Combines metadata, UI configuration, and completion tracking
 */
export interface MorningRoutineTask {
  /** Unique task identifier */
  key: TaskKey;
  /** Display title */
  title: string;
  /** Detailed description of the task purpose */
  description: string;
  /** Icon component for UI display */
  icon: LucideIcon;
  /** Domain module this task belongs to */
  domain: TaskDomain;
  /** Whether this task requires time tracking input */
  hasTimeTracking: boolean;
  /** List of subtasks within this task */
  subtasks: SubTask[];
}

/**
 * Completion status for a single task
 * Tracks progress and XP earned
 */
export interface TaskCompletionStatus {
  /** Whether the task is marked as complete */
  isComplete: boolean;
  /** Progress percentage (0-100) */
  progressPercent: number;
  /** Total XP earned from this task */
  xpEarned: number;
  /** Timestamp when task was completed */
  completedAt?: Date;
}

/**
 * Habit state for binary completion tracking
 * Used for simple yes/no habit items
 */
export interface HabitState {
  /** Whether the habit is completed */
  completed: boolean;
  /** Timestamp of completion */
  completedAt?: Date;
}

/**
 * Complete morning routine state for a specific date
 * Aggregates all task states and metadata
 */
export interface MorningRoutineState {
  /** The date this routine is for */
  date: Date;
  /** Completion status for all tasks keyed by task key */
  tasks: Record<TaskKey, TaskCompletionStatus>;
  /** Total XP earned across all tasks */
  totalXP: number;
}

/**
 * Habit item within the morning routine
 * Individual checkbox items that users can complete
 */
export interface MorningRoutineHabit {
  /** Display name of the habit */
  name: string;
  /** Completion status */
  completed: boolean;
}

/**
 * Morning routine data structure from API
 * Represents the complete routine state for a user on a specific date
 */
export interface MorningRoutineData {
  /** Unique identifier */
  id: string;
  /** User ID who owns this routine */
  userId: string;
  /** Date in YYYY-MM-DD format */
  date: string;
  /** List of habit items */
  items: MorningRoutineHabit[];
  /** Number of completed habits */
  completedCount: number;
  /** Total number of habits */
  totalCount: number;
  /** Completion percentage */
  completionPercentage: number;
}

/**
 * Metadata stored with morning routine
 * Contains additional tracked data beyond simple completion
 */
export interface MorningRoutineMetadata {
  /** Wake-up time in HH:mm format */
  wakeUpTime?: string;
  /** Amount of water consumed in ml */
  waterAmount?: number;
  /** Meditation duration (e.g., "10 min") */
  meditationDuration?: string;
  /** Number of push-up reps completed */
  pushupReps?: number;
  /** Top 3 priorities for the day */
  dailyPriorities?: string[];
  /** Whether the day planning is complete */
  isPlanDayComplete?: boolean;
  /** Timestamp of routine completion */
  completedAt?: string;
}

/**
 * Props for the main Morning Routine Section component
 */
export interface MorningRoutineSectionProps {
  /** Currently selected date for viewing/editing */
  selectedDate: Date;
}

/**
 * Progress calculation for the morning routine
 */
export interface MorningRoutineProgress {
  /** Number of completed tasks */
  completed: number;
  /** Total number of tasks */
  total: number;
  /** Completion percentage (0-100) */
  percentage: number;
  /** List of completed task keys */
  completedTasks: string[];
  /** List of incomplete task keys */
  remainingTasks: string[];
}

/**
 * Request to create a new morning routine entry
 */
export interface CreateMorningRoutineRequest {
  /** User ID creating the routine */
  userId: string;
  /** Date for the routine */
  date: string;
  /** Optional initial wake-up time */
  wakeUpTime?: string;
}

/**
 * Request to update an existing morning routine
 */
export interface UpdateMorningRoutineRequest {
  /** Updated wake-up time */
  wakeUpTime?: string;
  /** Water intake status */
  drinkWater?: boolean;
  /** Exercise completion status */
  exercise?: boolean;
  /** Meditation completion status */
  meditate?: boolean;
  /** News reading status */
  readNews?: boolean;
  /** Goal review status */
  reviewGoals?: boolean;
  /** Day planning status */
  planDay?: boolean;
  /** Health check completion */
  healthCheck?: boolean;
  /** gratitude practice completion */
  gratitude?: boolean;
}

/**
 * Categories for organizing morning habits
 */
export type MorningHabitCategory = 'physical' | 'mental' | 'planning' | 'reflection';

/**
 * Map of habit categories to their associated habit keys
 */
export interface MorningHabitsByCategory {
  [category: string]: string[];
}

/**
 * Color themes for habit UI elements
 */
export type MorningHabitColor =
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'red'
  | 'indigo'
  | 'pink'
  | 'yellow';

/**
 * Map of color names to CSS class names
 */
export interface MorningRoutineColorMap {
  [color: string]: string;
}

/**
 * XP state tracking for morning routine
 * Manages one-time XP awards to prevent duplicate grants
 */
export interface MorningRoutineXPState {
  /** Whether wake-up XP has been awarded */
  wakeAwarded: boolean;
  /** Map of step keys to completion status */
  steps: Record<string, boolean>;
  /** Timestamp of last completion */
  lastCompletionTimestamp: number | null;
}

/**
 * Parameters for calculating step XP multiplier
 * Used in timing-based XP calculations
 */
export interface StepXpMultiplierParams {
  /** Minutes since wake-up time */
  minutesSinceWake: number | null;
  /** Minutes since previous step completion */
  minutesSincePrevious: number | null;
  /** Multiplier from wake-up time */
  wakeUpMultiplier?: number;
}
