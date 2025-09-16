/**
 * Enhanced TypeScript type definitions for Morning Routine feature
 * 
 * Updated to match comprehensive task structure with subtasks and time tracking
 * Centralized type definitions to improve:
 * - Type safety across components and services
 * - Code completion and IntelliSense
 * - Easier refactoring and maintenance
 * - Clear contracts between components
 */

import { LucideIcon } from 'lucide-react';

/**
 * Individual subtask within a morning routine task
 */
export interface MorningSubtask {
  key: string;
  title: string;
}

/**
 * Comprehensive morning routine task with subtasks and time tracking
 */
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
 * Enhanced morning routine data structure for API responses
 * Now includes all task keys and subtask keys for comprehensive tracking
 */
export interface MorningRoutineData {
  id: string;
  userId: string;
  date: string;
  wakeUpTime?: string;
  completedAt?: string;
  
  // Main tasks
  wakeUp: boolean;
  getBloodFlowing: boolean;
  freshenUp: boolean;
  powerUpBrain: boolean;
  planDay: boolean;
  meditation: boolean;
  
  // Subtasks for "Get Blood Flowing"
  pushups: boolean;
  situps: boolean;
  pullups: boolean;
  
  // Subtasks for "Freshen Up"
  bathroom: boolean;
  brushTeeth: boolean;
  coldShower: boolean;
  
  // Subtasks for "Power Up Brain"
  water: boolean;
  supplements: boolean;
  preworkout: boolean;
  
  // Subtasks for "Plan Day"
  thoughtDump: boolean;
  planDeepWork: boolean;
  planLightWork: boolean;
  setTimebox: boolean;
  
  // Extensible for future task/subtask additions
  [key: string]: any;
}

/**
 * Morning routine section component props
 */
export interface MorningRoutineSectionProps {
  selectedDate: Date;
}

/**
 * Morning routine progress calculation
 */
export interface MorningRoutineProgress {
  completed: number;
  total: number;
  percentage: number;
  completedTasks: string[];
  remainingTasks: string[];
}

/**
 * Morning routine API request/response types
 */
export interface CreateMorningRoutineRequest {
  userId: string;
  date: string;
  wakeUpTime?: string;
}

export interface UpdateMorningRoutineRequest {
  wakeUpTime?: string;
  drinkWater?: boolean;
  exercise?: boolean;
  meditate?: boolean;
  readNews?: boolean;
  reviewGoals?: boolean;
  planDay?: boolean;
  healthCheck?: boolean;
  gratitude?: boolean;
}

/**
 * Morning routine habit categories for organization
 */
export type MorningHabitCategory = 'physical' | 'mental' | 'planning' | 'reflection';

/**
 * Category mapping interface
 */
export interface MorningHabitsByCategory {
  [category: string]: string[];
}

/**
 * Color theme type for habit styling
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
 * Color class mapping interface
 */
export interface MorningRoutineColorMap {
  [color: string]: string;
}