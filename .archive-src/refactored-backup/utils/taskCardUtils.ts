/**
 * Task Card Utilities - Common Logic Extraction
 * 
 * Extracted from various task card implementations to provide
 * reusable utility functions for task card operations.
 * 
 * Benefits:
 * - DRY principle: No more duplicated logic across components
 * - Consistent behavior: Same calculations everywhere
 * - Easy testing: Pure functions can be unit tested
 * - Performance: Memoizable utility functions
 */

import { TaskCardTask, TaskCardSubtask, TaskCardTheme } from '../components/UnifiedTaskCard';

/**
 * Calculate task completion progress
 */
export function calculateTaskProgress(task: TaskCardTask): {
  completed: number;
  total: number;
  percentage: number;
  isComplete: boolean;
} {
  // Main task only
  if (!task.subtasks || task.subtasks.length === 0) {
    return {
      completed: task.completed ? 1 : 0,
      total: 1,
      percentage: task.completed ? 100 : 0,
      isComplete: task.completed
    };
  }

  // Task with subtasks
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const percentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return {
    completed: completedSubtasks,
    total: totalSubtasks,
    percentage,
    isComplete: percentage === 100
  };
}

/**
 * Get theme for a task based on context or category
 */
export function getTaskTheme(
  context?: string | 'morning' | 'work' | 'light' | 'wellness' | 'timebox' | 'checkout',
  hour?: number
): TaskCardTheme {
  // Explicit context
  if (context && ['morning', 'work', 'light', 'wellness', 'timebox', 'checkout'].includes(context)) {
    return context as TaskCardTheme;
  }

  // Time-based theme
  if (hour !== undefined) {
    if (hour >= 6 && hour <= 9) return 'morning';
    if (hour >= 9 && hour <= 12) return 'work';
    if (hour >= 12 && hour <= 17) return 'light';
    if (hour >= 17 && hour <= 19) return 'wellness';
    if (hour >= 19 && hour <= 21) return 'checkout';
  }

  return 'default';
}

/**
 * Sort tasks by priority and completion status
 */
export function sortTasks(tasks: TaskCardTask[]): TaskCardTask[] {
  const priorityOrder = { critical: 5, urgent: 4, high: 3, medium: 2, low: 1 };
  
  return [...tasks].sort((a, b) => {
    // Incomplete tasks first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Then by priority
    const aPriority = a.priority ? priorityOrder[a.priority] : 0;
    const bPriority = b.priority ? priorityOrder[b.priority] : 0;
    
    return bPriority - aPriority;
  });
}

/**
 * Filter tasks by completion status
 */
export function filterTasks(
  tasks: TaskCardTask[], 
  filter: 'all' | 'completed' | 'pending' | 'overdue'
): TaskCardTask[] {
  switch (filter) {
    case 'completed':
      return tasks.filter(task => task.completed);
    case 'pending':
      return tasks.filter(task => !task.completed);
    case 'overdue':
      return tasks.filter(task => task.status === 'overdue');
    default:
      return tasks;
  }
}

/**
 * Calculate estimated time for a list of tasks
 */
export function calculateTotalTime(tasks: TaskCardTask[]): {
  totalMinutes: number;
  displayTime: string;
} {
  let totalMinutes = 0;

  tasks.forEach(task => {
    if (task.timeEstimate) {
      // Parse time estimates like "5 min", "1.5 hours", "30m", etc.
      const timeMatch = task.timeEstimate.match(/(\d+(?:\.\d+)?)\s*(min|minute|minutes|m|hour|hours|h)/i);
      if (timeMatch) {
        const value = parseFloat(timeMatch[1]);
        const unit = timeMatch[2].toLowerCase();
        
        if (unit.startsWith('h')) {
          totalMinutes += value * 60;
        } else {
          totalMinutes += value;
        }
      }
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let displayTime = '';
  if (hours > 0) {
    displayTime += `${hours}h`;
    if (minutes > 0) displayTime += ` ${minutes}m`;
  } else if (minutes > 0) {
    displayTime = `${minutes}m`;
  } else {
    displayTime = '0m';
  }

  return { totalMinutes, displayTime };
}

/**
 * Generate task completion status text
 */
export function getTaskStatusText(task: TaskCardTask): string {
  if (task.completed) {
    return 'Completed';
  }

  const progress = calculateTaskProgress(task);
  
  if (progress.total === 1) {
    return task.status === 'in_progress' ? 'In Progress' : 'Pending';
  }

  if (progress.completed === 0) {
    return 'Not Started';
  }

  if (progress.percentage === 100) {
    return 'All Subtasks Complete';
  }

  return `${progress.completed}/${progress.total} subtasks complete`;
}

/**
 * Check if task should show priority indicator
 */
export function shouldShowPriority(task: TaskCardTask): boolean {
  return !!(task.priority && ['high', 'urgent', 'critical'].includes(task.priority));
}

/**
 * Check if task is overdue (if it has a due date)
 */
export function isTaskOverdue(task: TaskCardTask, currentDate: Date = new Date()): boolean {
  // This would need to be implemented based on your task structure
  // For now, we'll use the status field
  return task.status === 'overdue';
}

/**
 * Get accessibility label for task
 */
export function getTaskAccessibilityLabel(task: TaskCardTask): string {
  const progress = calculateTaskProgress(task);
  const status = task.completed ? 'completed' : 'incomplete';
  const priority = task.priority ? ` with ${task.priority} priority` : '';
  const progressText = progress.total > 1 ? `, ${progress.completed} of ${progress.total} subtasks complete` : '';
  
  return `${task.title}, ${status}${priority}${progressText}`;
}

/**
 * Create a new subtask for a task
 */
export function createSubtask(title: string, id?: string): TaskCardSubtask {
  return {
    id: id || crypto.randomUUID(),
    title: title.trim(),
    completed: false
  };
}

/**
 * Create a new task with default values
 */
export function createTask(
  title: string,
  options: {
    id?: string;
    priority?: TaskCardTask['priority'];
    status?: TaskCardTask['status'];
    timeEstimate?: string;
    subtasks?: TaskCardSubtask[];
  } = {}
): TaskCardTask {
  return {
    id: options.id || crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    priority: options.priority,
    status: options.status || 'pending',
    timeEstimate: options.timeEstimate,
    subtasks: options.subtasks || []
  };
}

/**
 * Batch operations for multiple tasks
 */
export const taskBatchOperations = {
  /**
   * Toggle completion for multiple tasks
   */
  toggleAll(tasks: TaskCardTask[], completed: boolean): TaskCardTask[] {
    return tasks.map(task => ({ ...task, completed }));
  },

  /**
   * Update priority for multiple tasks
   */
  updatePriority(tasks: TaskCardTask[], priority: TaskCardTask['priority']): TaskCardTask[] {
    return tasks.map(task => ({ ...task, priority }));
  },

  /**
   * Clear completed tasks
   */
  clearCompleted(tasks: TaskCardTask[]): TaskCardTask[] {
    return tasks.filter(task => !task.completed);
  },

  /**
   * Get statistics for task list
   */
  getStats(tasks: TaskCardTask[]) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(t => shouldShowPriority(t)).length;
    const withSubtasks = tasks.filter(t => t.subtasks && t.subtasks.length > 0).length;
    
    return {
      total,
      completed,
      pending,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      highPriority,
      withSubtasks
    };
  }
};

/**
 * Task card animation presets
 */
export const taskAnimations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  
  completion: {
    initial: { scale: 1 },
    animate: { scale: [1, 1.05, 1] },
    transition: { duration: 0.3 }
  }
};