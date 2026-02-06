/**
 * Recursive Subtask Utilities
 *
 * Helper functions for working with nested subtasks (2-level hierarchy)
 * Includes recursive completion, counting, and flattening operations
 */

import { UnifiedSubtask } from '../components/UnifiedTaskCard';

/**
 * Recursively count all subtasks including nested ones
 */
export function countAllSubtasks(subtasks: UnifiedSubtask[]): number {
  let count = 0;

  for (const subtask of subtasks) {
    count++; // Count this subtask
    if (subtask.subtasks && subtask.subtasks.length > 0) {
      count += countAllSubtasks(subtask.subtasks); // Recursively count nested
    }
  }

  return count;
}

/**
 * Recursively count completed subtasks including nested ones
 */
export function countCompletedSubtasks(subtasks: UnifiedSubtask[]): number {
  let count = 0;

  for (const subtask of subtasks) {
    if (subtask.completed || subtask.status === 'completed') {
      count++; // Count this subtask if completed
    }
    if (subtask.subtasks && subtask.subtasks.length > 0) {
      count += countCompletedSubtasks(subtask.subtasks); // Recursively count nested
    }
  }

  return count;
}

/**
 * Recursively mark a subtask and all its children as completed/incomplete
 * Returns a new array with updated subtasks (immutable update)
 */
export function toggleSubtaskWithChildren(
  subtasks: UnifiedSubtask[],
  targetSubtaskId: string,
  completed: boolean
): UnifiedSubtask[] {
  return subtasks.map((subtask) => {
    if (subtask.id === targetSubtaskId) {
      // Found the target - update it and all its children
      return {
        ...subtask,
        completed,
        status: completed ? 'completed' : 'not_started',
        subtasks: subtask.subtasks
          ? subtask.subtasks.map((child) => ({
              ...child,
              completed,
              status: completed ? 'completed' : 'not_started',
            }))
          : undefined,
      };
    }

    // Not the target - check if it has nested subtasks to search
    if (subtask.subtasks && subtask.subtasks.length > 0) {
      return {
        ...subtask,
        subtasks: toggleSubtaskWithChildren(subtask.subtasks, targetSubtaskId, completed),
      };
    }

    return subtask;
  });
}

/**
 * Check if all children of a subtask are completed
 */
export function areAllChildrenCompleted(subtask: UnifiedSubtask): boolean {
  if (!subtask.subtasks || subtask.subtasks.length === 0) {
    return true; // No children = vacuously true
  }

  return subtask.subtasks.every(
    (child) => child.completed || child.status === 'completed'
  );
}

/**
 * Check if any child of a subtask is completed
 */
export function areAnyChildrenCompleted(subtask: UnifiedSubtask): boolean {
  if (!subtask.subtasks || subtask.subtasks.length === 0) {
    return false;
  }

  return subtask.subtasks.some(
    (child) => child.completed || child.status === 'completed'
  );
}

/**
 * Flatten nested subtasks into a single array with depth information
 */
export interface FlattenedSubtask extends UnifiedSubtask {
  depth: number;
  parentId?: string;
}

export function flattenSubtasks(
  subtasks: UnifiedSubtask[],
  depth: number = 0,
  parentId?: string
): FlattenedSubtask[] {
  const result: FlattenedSubtask[] = [];

  for (const subtask of subtasks) {
    result.push({ ...subtask, depth, parentId });

    if (subtask.subtasks && subtask.subtasks.length > 0) {
      result.push(...flattenSubtasks(subtask.subtasks, depth + 1, subtask.id));
    }
  }

  return result;
}

/**
 * Find a subtask by ID recursively through nested structure
 */
export function findSubtaskById(
  subtasks: UnifiedSubtask[],
  targetId: string
): UnifiedSubtask | undefined {
  for (const subtask of subtasks) {
    if (subtask.id === targetId) {
      return subtask;
    }

    if (subtask.subtasks && subtask.subtasks.length > 0) {
      const found = findSubtaskById(subtask.subtasks, targetId);
      if (found) return found;
    }
  }

  return undefined;
}

/**
 * Delete a subtask by ID recursively, including from nested structures
 * Returns a new array with the subtask removed (immutable update)
 */
export function deleteSubtaskById(
  subtasks: UnifiedSubtask[],
  targetId: string
): UnifiedSubtask[] {
  return subtasks
    .filter((subtask) => subtask.id !== targetId)
    .map((subtask) => {
      if (subtask.subtasks && subtask.subtasks.length > 0) {
        return {
          ...subtask,
          subtasks: deleteSubtaskById(subtask.subtasks, targetId),
        };
      }
      return subtask;
    });
}

/**
 * Update a subtask by ID recursively through nested structure
 * Returns a new array with the subtask updated (immutable update)
 */
export function updateSubtaskById(
  subtasks: UnifiedSubtask[],
  targetId: string,
  updates: Partial<UnifiedSubtask>
): UnifiedSubtask[] {
  return subtasks.map((subtask) => {
    if (subtask.id === targetId) {
      return { ...subtask, ...updates };
    }

    if (subtask.subtasks && subtask.subtasks.length > 0) {
      return {
        ...subtask,
        subtasks: updateSubtaskById(subtask.subtasks, targetId, updates),
      };
    }

    return subtask;
  });
}

/**
 * Add a nested sub-subtask to a parent subtask
 * Returns a new array with the sub-subtask added (immutable update)
 */
export function addNestedSubtask(
  subtasks: UnifiedSubtask[],
  parentSubtaskId: string,
  newSubtask: UnifiedSubtask
): UnifiedSubtask[] {
  return subtasks.map((subtask) => {
    if (subtask.id === parentSubtaskId) {
      return {
        ...subtask,
        subtasks: [...(subtask.subtasks || []), newSubtask],
      };
    }

    if (subtask.subtasks && subtask.subtasks.length > 0) {
      return {
        ...subtask,
        subtasks: addNestedSubtask(subtask.subtasks, parentSubtaskId, newSubtask),
      };
    }

    return subtask;
  });
}

/**
 * Calculate completion percentage for a task with nested subtasks
 */
export function calculateCompletionPercentage(subtasks: UnifiedSubtask[]): number {
  if (subtasks.length === 0) return 0;

  const total = countAllSubtasks(subtasks);
  const completed = countCompletedSubtasks(subtasks);

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

/**
 * Get completion summary text for display
 */
export function getCompletionSummary(subtasks: UnifiedSubtask[]): string {
  const total = countAllSubtasks(subtasks);
  const completed = countCompletedSubtasks(subtasks);
  const percentage = calculateCompletionPercentage(subtasks);

  if (total === 0) return 'No subtasks';
  if (completed === total) return 'All complete';

  return `${completed}/${total} (${percentage}%)`;
}
