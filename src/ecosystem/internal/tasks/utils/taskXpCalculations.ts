/**
 * Task XP Calculations
 *
 * Rules-based XP system for Light Work and Deep Work tasks
 * Based on priority, time estimates, and subtask completion
 */

/**
 * Light Work Task XP
 *
 * Rules:
 * - Main task: 20 XP × priority multiplier
 * - Each subtask: 10 XP (if estimated time < 30 min)
 * - Simple and fast
 */
export function calculateLightWorkTaskXP(task: {
  priority?: string;
  subtasks?: Array<{ completed?: boolean; estimatedTime?: string }>;
  completed?: boolean;
}): { total: number; taskXP: number; subtaskXP: number } {
  if (!task.completed && !task.subtasks?.some(s => s.completed)) {
    return { total: 0, taskXP: 0, subtaskXP: 0 };
  }

  // Base task XP with priority multiplier
  const basePriority = (task.priority || 'medium').toLowerCase();
  const priorityMultiplier =
    basePriority === 'urgent' ? 2.0 :
    basePriority === 'high' ? 1.5 :
    basePriority === 'medium' ? 1.2 : 1.0;

  const taskXP = task.completed ? Math.round(20 * priorityMultiplier) : 0;

  // Subtask XP: 10 XP each (if < 30 min)
  const subtaskXP = (task.subtasks || []).filter(s => s.completed).reduce((total, subtask) => {
    const estimatedMinutes = parseEstimatedTime(subtask.estimatedTime);

    // If no time estimate or < 30 min, award 10 XP
    if (estimatedMinutes === 0 || estimatedMinutes < 30) {
      return total + 10;
    }

    // If >= 30 min, award proportionally (15 XP for 30-60 min, 20 XP for 60+ min)
    if (estimatedMinutes >= 60) {
      return total + 20;
    } else {
      return total + 15;
    }
  }, 0);

  return {
    total: taskXP + subtaskXP,
    taskXP,
    subtaskXP
  };
}

/**
 * Deep Work Task XP
 *
 * Rules:
 * - Main task: 50 XP × priority multiplier
 * - Each subtask: 15 XP (higher than light work)
 * - Time bonus: +25 to +100 XP based on total time
 * - More rewarding for complex work
 */
export function calculateDeepWorkTaskXP(task: {
  priority?: string;
  subtasks?: Array<{ completed?: boolean; estimatedTime?: string }>;
  completed?: boolean;
  timeEstimate?: string;
}): { total: number; taskXP: number; subtaskXP: number; timeBonus: number } {
  if (!task.completed && !task.subtasks?.some(s => s.completed)) {
    return { total: 0, taskXP: 0, subtaskXP: 0, timeBonus: 0 };
  }

  // Base task XP with higher priority multipliers
  const basePriority = (task.priority || 'medium').toLowerCase();
  const priorityMultiplier =
    basePriority === 'urgent' ? 2.5 :
    basePriority === 'high' ? 1.7 :
    basePriority === 'medium' ? 1.3 : 1.0;

  const taskXP = task.completed ? Math.round(50 * priorityMultiplier) : 0;

  // Subtask XP: 15 XP each (higher than light work)
  const subtaskXP = (task.subtasks || []).filter(s => s.completed).reduce((total, subtask) => {
    const estimatedMinutes = parseEstimatedTime(subtask.estimatedTime);

    // Base: 15 XP per subtask
    let xp = 15;

    // Bonus for longer subtasks
    if (estimatedMinutes >= 60) {
      xp = 25; // 1+ hour subtask
    } else if (estimatedMinutes >= 30) {
      xp = 20; // 30-60 min subtask
    }

    return total + xp;
  }, 0);

  // Time bonus (only if main task is completed)
  let timeBonus = 0;
  if (task.completed && task.timeEstimate) {
    const totalMinutes = parseEstimatedTime(task.timeEstimate);

    if (totalMinutes >= 240) {
      timeBonus = 100; // 4+ hours
    } else if (totalMinutes >= 120) {
      timeBonus = 50; // 2-4 hours
    } else if (totalMinutes >= 60) {
      timeBonus = 25; // 1-2 hours
    }
  }

  return {
    total: taskXP + subtaskXP + timeBonus,
    taskXP,
    subtaskXP,
    timeBonus
  };
}

/**
 * Parse time estimate string to minutes
 * Examples: "30min", "2h", "1h 30m" → minutes
 */
function parseEstimatedTime(estimate?: string | null): number {
  if (!estimate) return 0;

  const normalized = estimate.toLowerCase().trim();
  let totalMinutes = 0;

  // Match hours: "2h", "2 hours", "2hr"
  const hourMatches = normalized.matchAll(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/g);
  for (const match of hourMatches) {
    totalMinutes += Math.round(parseFloat(match[1]) * 60);
  }

  // Match minutes: "30m", "30 min", "30 minutes"
  const minuteMatches = normalized.matchAll(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)/g);
  for (const match of minuteMatches) {
    totalMinutes += Math.round(parseFloat(match[1]));
  }

  // If just a number, assume minutes
  if (totalMinutes === 0) {
    const numberMatch = normalized.match(/^(\d+(?:\.\d+)?)$/);
    if (numberMatch) {
      totalMinutes = Math.round(parseFloat(numberMatch[1]));
    }
  }

  return totalMinutes;
}

/**
 * Calculate total daily task XP across all tasks
 */
export function calculateDailyTaskXP(tasks: Array<{
  type: 'light' | 'deep';
  priority?: string;
  subtasks?: Array<{ completed?: boolean; estimatedTime?: string }>;
  completed?: boolean;
  timeEstimate?: string;
}>): { total: number; lightWorkXP: number; deepWorkXP: number } {
  let lightWorkXP = 0;
  let deepWorkXP = 0;

  tasks.forEach(task => {
    if (task.type === 'light') {
      const result = calculateLightWorkTaskXP(task);
      lightWorkXP += result.total;
    } else {
      const result = calculateDeepWorkTaskXP(task);
      deepWorkXP += result.total;
    }
  });

  return {
    total: lightWorkXP + deepWorkXP,
    lightWorkXP,
    deepWorkXP
  };
}
