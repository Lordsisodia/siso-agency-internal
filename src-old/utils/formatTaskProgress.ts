/**
 * Formats task progress as a percentage string with fraction
 * @param completed - Number of completed tasks
 * @param total - Total number of tasks
 * @returns Formatted string like "75% (3/4)" or "0%" for invalid input
 * 
 * @example
 * ```typescript
 * formatTaskProgress(3, 4) // "75% (3/4)"
 * formatTaskProgress(0, 0) // "0%"
 * formatTaskProgress(-1, 4) // "0%"
 * ```
 */
export interface TaskProgressInput {
  completed: number;
  total: number;
}

export function formatTaskProgress(completed: number, total: number): string;
export function formatTaskProgress(input: TaskProgressInput): string;
export function formatTaskProgress(
  completedOrInput: number | TaskProgressInput, 
  total?: number
): string {
  let completed: number;
  let totalTasks: number;

  // Handle overloaded signatures
  if (typeof completedOrInput === 'object') {
    completed = completedOrInput.completed;
    totalTasks = completedOrInput.total;
  } else {
    completed = completedOrInput;
    totalTasks = total!;
  }

  // Input validation
  if (!Number.isInteger(completed) || !Number.isInteger(totalTasks) || 
      completed < 0 || totalTasks < 0 || completed > totalTasks) {
    return "0%";
  }

  // Handle edge cases
  if (totalTasks === 0) {
    return "0%";
  }

  // Calculate percentage
  const percentage = Math.round((completed / totalTasks) * 100);

  // Format with fraction
  return `${percentage}% (${completed}/${totalTasks})`;
}

export default formatTaskProgress;