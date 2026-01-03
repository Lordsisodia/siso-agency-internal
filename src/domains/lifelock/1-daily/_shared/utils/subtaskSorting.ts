/**
 * 🎯 Smart Hybrid Subtask Sorting Utility
 *
 * Sorts subtasks by combining priority urgency + time urgency
 *
 * Sort Order:
 * 1. Overdue (sorted by priority)
 * 2. Due Today (sorted by priority)
 * 3. Future dates (weighted score: priority - days until due)
 * 4. No due date (sorted by priority, at bottom)
 */

export type SubtaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface SortableSubtask {
  id: string;
  priority?: string;
  dueDate?: string;
  [key: string]: any;
}

const PRIORITY_WEIGHTS: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Get priority weight (defaults to medium if not set)
 */
function getPriorityWeight(priority?: string): number {
  return PRIORITY_WEIGHTS[priority?.toLowerCase() || 'medium'] || 2;
}

/**
 * Calculate days until due date
 */
function getDaysUntilDue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Categorize subtask by due date status
 */
function getDueDateCategory(dueDate?: string): 'overdue' | 'today' | 'future' | 'none' {
  if (!dueDate) return 'none';

  const daysUntil = getDaysUntilDue(dueDate);

  if (daysUntil < 0) return 'overdue';
  if (daysUntil === 0) return 'today';
  return 'future';
}

/**
 * Calculate weighted score for future tasks
 * Higher score = higher priority
 */
function calculateFutureScore(priority: string, daysUntilDue: number): number {
  const priorityWeight = getPriorityWeight(priority);

  // Subtract 0.5 for each day into the future
  // This means urgent tasks stay high even if further away
  // But time still matters
  return priorityWeight - (daysUntilDue * 0.5);
}

/**
 * Main sorting function - Smart Hybrid Sort
 */
export function sortSubtasksHybrid<T extends SortableSubtask>(subtasks: T[]): T[] {
  return [...subtasks].sort((a, b) => {
    const categoryA = getDueDateCategory(a.dueDate);
    const categoryB = getDueDateCategory(b.dueDate);

    // Category priority order
    const categoryOrder = { overdue: 0, today: 1, future: 2, none: 3 };

    // Different categories? Sort by category
    if (categoryA !== categoryB) {
      return categoryOrder[categoryA] - categoryOrder[categoryB];
    }

    // Same category - apply category-specific sorting
    switch (categoryA) {
      case 'overdue':
      case 'today':
      case 'none':
        // For these categories, just sort by priority
        return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);

      case 'future':
        // For future tasks, use weighted scoring
        const scoreA = calculateFutureScore(
          a.priority || 'medium',
          getDaysUntilDue(a.dueDate!)
        );
        const scoreB = calculateFutureScore(
          b.priority || 'medium',
          getDaysUntilDue(b.dueDate!)
        );

        return scoreB - scoreA; // Higher score first
    }
  });
}

/**
 * Debug helper - get sort details for a subtask
 */
export function getSubtaskSortDebugInfo(subtask: SortableSubtask) {
  const category = getDueDateCategory(subtask.dueDate);
  const priorityWeight = getPriorityWeight(subtask.priority);

  let score = priorityWeight;
  if (category === 'future' && subtask.dueDate) {
    const daysUntil = getDaysUntilDue(subtask.dueDate);
    score = calculateFutureScore(subtask.priority || 'medium', daysUntil);
  }

  return {
    category,
    priorityWeight,
    score,
    daysUntilDue: subtask.dueDate ? getDaysUntilDue(subtask.dueDate) : null
  };
}
