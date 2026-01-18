/**
 * Enhanced Morning Routine Progress Calculation Utilities
 * 
 * Updated to handle comprehensive task structure with subtasks
 * Extracted progress calculation logic to improve:
 * - Testability: Pure functions can be unit tested easily
 * - Reusability: Same logic across different components
 * - Maintainability: Single source of truth for progress logic
 * - Performance: Can be memoized for expensive calculations
 * - Accuracy: Properly accounts for subtasks in progress calculation
 */

import { MorningRoutineData, MorningRoutineProgress, MorningTask } from '../types';
import { DEFAULT_MORNING_ROUTINE_TASKS } from '../config';

/**
 * Calculate comprehensive progress for a morning routine with subtasks
 * Matches the logic from the enhanced MorningRoutineSection component
 */
export function calculateMorningRoutineProgress(
  routineData: MorningRoutineData | null,
  tasks: MorningTask[] = DEFAULT_MORNING_ROUTINE_TASKS
): MorningRoutineProgress {
  if (!routineData) {
    const totalItems = getTotalProgressItems(tasks);
    return {
      completed: 0,
      total: totalItems,
      percentage: 0,
      completedTasks: [],
      remainingTasks: getAllProgressItems(tasks)
    };
  }

  let totalItems = 0;
  let completedItems = 0;
  const completedTasks: string[] = [];
  const remainingTasks: string[] = [];

  tasks.forEach(task => {
    if (task.subtasks.length > 0) {
      // Count subtasks
      totalItems += task.subtasks.length;
      task.subtasks.forEach(subtask => {
        if (routineData[subtask.key]) {
          completedItems++;
          completedTasks.push(subtask.key);
        } else {
          remainingTasks.push(subtask.key);
        }
      });
    } else {
      // Count main task if no subtasks
      totalItems += 1;
      if (routineData[task.key]) {
        completedItems++;
        completedTasks.push(task.key);
      } else {
        remainingTasks.push(task.key);
      }
    }
  });

  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    completed: completedItems,
    total: totalItems,
    percentage,
    completedTasks,
    remainingTasks
  };
}

/**
 * Get total number of progress items (tasks + subtasks)
 */
export function getTotalProgressItems(tasks: MorningTask[] = DEFAULT_MORNING_ROUTINE_TASKS): number {
  return tasks.reduce((total, task) => {
    return total + (task.subtasks.length > 0 ? task.subtasks.length : 1);
  }, 0);
}

/**
 * Get all progress item keys (task keys + subtask keys)
 */
export function getAllProgressItems(tasks: MorningTask[] = DEFAULT_MORNING_ROUTINE_TASKS): string[] {
  const items: string[] = [];
  
  tasks.forEach(task => {
    if (task.subtasks.length > 0) {
      task.subtasks.forEach(subtask => items.push(subtask.key));
    } else {
      items.push(task.key);
    }
  });
  
  return items;
}

/**
 * Get task completion status (for main tasks)
 */
export function getTaskStatus(
  routineData: MorningRoutineData | null,
  taskKey: string
): boolean {
  if (!routineData) return false;
  return routineData[taskKey as keyof MorningRoutineData] === true;
}

/**
 * Get subtask completion status
 */
export function getSubtaskStatus(
  routineData: MorningRoutineData | null,
  subtaskKey: string
): boolean {
  if (!routineData) return false;
  return routineData[subtaskKey as keyof MorningRoutineData] === true;
}

/**
 * Get completed tasks and subtasks with their metadata
 */
export function getCompletedItems(
  routineData: MorningRoutineData | null,
  tasks: MorningTask[] = DEFAULT_MORNING_ROUTINE_TASKS
): { completedTasks: MorningTask[]; completedSubtasks: { task: MorningTask; subtask: any }[] } {
  if (!routineData) return { completedTasks: [], completedSubtasks: [] };

  const completedTasks: MorningTask[] = [];
  const completedSubtasks: { task: MorningTask; subtask: any }[] = [];

  tasks.forEach(task => {
    if (task.subtasks.length > 0) {
      task.subtasks.forEach(subtask => {
        if (routineData[subtask.key]) {
          completedSubtasks.push({ task, subtask });
        }
      });
    } else if (routineData[task.key]) {
      completedTasks.push(task);
    }
  });

  return { completedTasks, completedSubtasks };
}

/**
 * Check if morning routine is complete
 */
export function isMorningRoutineComplete(
  routineData: MorningRoutineData | null,
  tasks: MorningTask[] = DEFAULT_MORNING_ROUTINE_TASKS
): boolean {
  const progress = calculateMorningRoutineProgress(routineData, tasks);
  return progress.percentage === 100;
}

/**
 * Get completion status for a specific task including its subtasks
 */
export function getTaskCompletionStatus(
  routineData: MorningRoutineData | null,
  task: MorningTask
): { completed: number; total: number; isFullyCompleted: boolean } {
  if (!routineData) {
    const total = task.subtasks.length > 0 ? task.subtasks.length : 1;
    return { completed: 0, total, isFullyCompleted: false };
  }

  if (task.subtasks.length > 0) {
    const completed = task.subtasks.filter(subtask => routineData[subtask.key]).length;
    const total = task.subtasks.length;
    return { 
      completed, 
      total, 
      isFullyCompleted: completed === total 
    };
  } else {
    const isCompleted = routineData[task.key] || false;
    return { 
      completed: isCompleted ? 1 : 0, 
      total: 1, 
      isFullyCompleted: isCompleted 
    };
  }
}

/**
 * Get progress display text
 */
export function getProgressDisplayText(progress: MorningRoutineProgress): string {
  if (progress.completed === 0) {
    return 'Not started';
  }
  
  if (progress.percentage === 100) {
    return 'Complete! 🎉';
  }
  
  return `${progress.completed}/${progress.total} complete (${progress.percentage}%)`;
}

/**
 * Get progress color based on completion percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage === 0) return 'gray';
  if (percentage < 30) return 'red';
  if (percentage < 60) return 'orange';
  if (percentage < 100) return 'blue';
  return 'green';
}