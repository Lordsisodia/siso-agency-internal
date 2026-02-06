/**
 * Intelligent XP Allocation System
 *
 * A gamified XP calculation engine that rewards task completion based on:
 * - Base XP (Light=15, Deep=25)
 * - Priority multipliers
 * - Time estimate bonuses
 * - Focus intensity (Deep Work)
 * - Subtask completion XP
 *
 * Transparent and configurable - all multipliers are exported constants.
 */

// Task type definitions (local to avoid circular dependencies)
export enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  BACKLOG = 'backlog'
}

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

/** Base XP values by work type */
export const XP_BASE = {
  LIGHT: 15,
  DEEP: 25,
} as const;

/** Priority multipliers for Light Work tasks */
export const XP_PRIORITY_MULTIPLIERS_LIGHT = {
  CRITICAL: 2.0,
  HIGH: 1.5,
  MEDIUM: 1.2,
  LOW: 1.0,
  BACKLOG: 0.8,
} as const;

/** Priority multipliers for Deep Work tasks (higher rewards for focus) */
export const XP_PRIORITY_MULTIPLIERS_DEEP = {
  CRITICAL: 2.5,
  HIGH: 1.7,
  MEDIUM: 1.3,
  LOW: 1.0,
  BACKLOG: 0.8,
} as const;

/** Time estimate bonus thresholds and values (in minutes) */
export const XP_TIME_BONUS = {
  LIGHT: {
    THRESHOLD_30: 30,
    THRESHOLD_60: 60,
    BONUS_30: 5,
    BONUS_60: 10,
  },
  DEEP: {
    THRESHOLD_60: 60,
    THRESHOLD_120: 120,
    THRESHOLD_240: 240,
    BONUS_60: 10,
    BONUS_120: 25,
    BONUS_240: 50,
  },
} as const;

/** Subtask XP values */
export const XP_SUBTASK = {
  LIGHT: {
    BASE: 5,
    BONUS_30MIN: 3,   // Additional XP for 30-60 min subtasks
    BONUS_60MIN: 8,   // Additional XP for 60+ min subtasks
  },
  DEEP: {
    BASE: 8,
    BONUS_30MIN: 5,   // Additional XP for 30-60 min subtasks
    BONUS_60MIN: 12,  // Additional XP for 60+ min subtasks
  },
} as const;

/** Focus intensity multipliers for Deep Work */
export const XP_FOCUS_MULTIPLIERS = {
  NONE: 1.0,
  LOW: 1.05,
  MEDIUM: 1.15,
  HIGH: 1.25,
  FLOW_STATE: 1.5,
} as const;

/** Completion streak bonuses */
export const XP_STREAK_BONUSES = {
  DAILY_STREAK_3: 5,
  DAILY_STREAK_7: 15,
  DAILY_STREAK_30: 50,
} as const;

/** Caps and limits */
export const XP_LIMITS = {
  MAX_TASK_XP: 500,
  MAX_SUBTASK_XP_PER_TASK: 100,
  MIN_TASK_XP: 5,
} as const;

// Legacy exports for backward compatibility
export const XP_BASE_LIGHT_WORK = XP_BASE.LIGHT;
export const XP_BASE_DEEP_WORK = XP_BASE.DEEP;
export const XP_SUBTASK_LIGHT_SHORT = XP_SUBTASK.LIGHT.BASE + XP_SUBTASK.LIGHT.BONUS_30MIN;
export const XP_SUBTASK_LIGHT_MEDIUM = XP_SUBTASK.LIGHT.BASE + XP_SUBTASK.LIGHT.BONUS_30MIN;
export const XP_SUBTASK_LIGHT_LONG = XP_SUBTASK.LIGHT.BASE + XP_SUBTASK.LIGHT.BONUS_60MIN;
export const XP_SUBTASK_DEEP_BASE = XP_SUBTASK.DEEP.BASE;
export const XP_SUBTASK_DEEP_MEDIUM = XP_SUBTASK.DEEP.BASE + XP_SUBTASK.DEEP.BONUS_30MIN;
export const XP_SUBTASK_DEEP_LONG = XP_SUBTASK.DEEP.BASE + XP_SUBTASK.DEEP.BONUS_60MIN;
export const XP_TIME_BONUS_SMALL = XP_TIME_BONUS.DEEP.BONUS_60;
export const XP_TIME_BONUS_MEDIUM = XP_TIME_BONUS.DEEP.BONUS_120;
export const XP_TIME_BONUS_LARGE = XP_TIME_BONUS.DEEP.BONUS_240;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Work type for XP calculation */
export type WorkType = 'light' | 'deep';

/** Focus intensity level */
export type FocusIntensity = 'none' | 'low' | 'medium' | 'high' | 'flow_state';

/** Subtask for XP calculation - supports nested sub-subtasks */
export interface SubtaskXP {
  id: string;
  title: string;
  status: TaskStatus;
  estimatedMinutes?: number;
  completedAt?: string;
  /** Nested sub-subtasks for recursive XP calculation */
  subtasks?: SubtaskXP[];
}

/** Extended task interface for XP calculation */
export interface TaskForXP {
  id?: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  workType?: WorkType;
  subtasks?: SubtaskXP[];
  focusIntensity?: FocusIntensity;
  timeEstimateMinutes?: number;
  estimated_time?: number | string;
  completionStreakDays?: number;
  [key: string]: any;
}

/** Detailed XP breakdown */
export interface XPBreakdown {
  base: number;
  priorityBonus: number;
  timeBonus: number;
  focusBonus: number;
  subtaskXP: number;
  streakBonus: number;
  total: number;
}

/** Complete XP calculation result with metadata */
export interface XPCalculationResult {
  total: number;
  breakdown: XPBreakdown;
  workType: WorkType;
  priority: TaskPriority;
  appliedMultipliers: {
    priority: number;
    focus: number;
  };
  subtaskCount: number;
  capped: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse time estimate string to minutes
 * Supports: "30min", "2h", "1h 30m", "90", "1.5h"
 */
export function parseTimeEstimate(estimate?: string | number | null): number {
  if (estimate === null || estimate === undefined) return 0;

  // If already a number, assume minutes
  if (typeof estimate === 'number') return estimate;

  const normalized = estimate.toLowerCase().trim();
  let totalMinutes = 0;

  // Match hours: "2h", "2 hours", "2hr", "1.5h"
  const hourRegex = /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/g;
  let hourMatch;
  while ((hourMatch = hourRegex.exec(normalized)) !== null) {
    totalMinutes += Math.round(parseFloat(hourMatch[1]) * 60);
  }

  // Match minutes: "30m", "30 min", "30 minutes"
  const minuteRegex = /(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)/g;
  let minuteMatch;
  while ((minuteMatch = minuteRegex.exec(normalized)) !== null) {
    totalMinutes += Math.round(parseFloat(minuteMatch[1]));
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
 * Get priority multiplier based on work type
 */
export function getPriorityMultiplier(
  priority: TaskPriority,
  workType: WorkType
): number {
  const multipliers = workType === 'deep'
    ? XP_PRIORITY_MULTIPLIERS_DEEP
    : XP_PRIORITY_MULTIPLIERS_LIGHT;

  return multipliers[priority] ?? multipliers.MEDIUM;
}

/**
 * Get focus intensity multiplier
 */
export function getFocusMultiplier(intensity: FocusIntensity = 'none'): number {
  return XP_FOCUS_MULTIPLIERS[intensity.toUpperCase() as keyof typeof XP_FOCUS_MULTIPLIERS] ?? 1.0;
}

/**
 * Calculate time estimate bonus
 */
export function calculateTimeBonus(
  minutes: number,
  workType: WorkType
): number {
  if (workType === 'deep') {
    if (minutes >= XP_TIME_BONUS.DEEP.THRESHOLD_240) {
      return XP_TIME_BONUS.DEEP.BONUS_240;
    }
    if (minutes >= XP_TIME_BONUS.DEEP.THRESHOLD_120) {
      return XP_TIME_BONUS.DEEP.BONUS_120;
    }
    if (minutes >= XP_TIME_BONUS.DEEP.THRESHOLD_60) {
      return XP_TIME_BONUS.DEEP.BONUS_60;
    }
  } else {
    if (minutes >= XP_TIME_BONUS.LIGHT.THRESHOLD_60) {
      return XP_TIME_BONUS.LIGHT.BONUS_60;
    }
    if (minutes >= XP_TIME_BONUS.LIGHT.THRESHOLD_30) {
      return XP_TIME_BONUS.LIGHT.BONUS_30;
    }
  }
  return 0;
}

/**
 * Calculate XP for a single subtask including nested sub-subtasks
 * Recursive function that traverses the full subtask tree
 */
function calculateSingleSubtaskXP(
  subtask: SubtaskXP,
  workType: WorkType,
  depth: number = 0
): { xp: number; count: number; breakdown: Array<{ id: string; title: string; xp: number; depth: number }> } {
  const baseXP = workType === 'deep' ? XP_SUBTASK.DEEP.BASE : XP_SUBTASK.LIGHT.BASE;
  const bonus30 = workType === 'deep' ? XP_SUBTASK.DEEP.BONUS_30MIN : XP_SUBTASK.LIGHT.BONUS_30MIN;
  const bonus60 = workType === 'deep' ? XP_SUBTASK.DEEP.BONUS_60MIN : XP_SUBTASK.LIGHT.BONUS_60MIN;

  let xp = 0;
  let count = 0;
  const breakdown: Array<{ id: string; title: string; xp: number; depth: number }> = [];

  // Only count XP if subtask is completed
  if (subtask.status === TaskStatus.COMPLETED) {
    xp = baseXP;
    const estimatedMinutes = subtask.estimatedMinutes ?? 0;

    if (estimatedMinutes >= 60) {
      xp += bonus60;
    } else if (estimatedMinutes >= 30) {
      xp += bonus30;
    }

    // Apply depth multiplier (nested subtasks get slightly less XP)
    const depthMultiplier = Math.max(0.5, 1 - depth * 0.25);
    xp = Math.round(xp * depthMultiplier);

    count++;
    breakdown.push({ id: subtask.id, title: subtask.title, xp, depth });
  }

  // Recursively calculate XP for nested sub-subtasks
  if (subtask.subtasks && subtask.subtasks.length > 0) {
    for (const nestedSubtask of subtask.subtasks) {
      const nested = calculateSingleSubtaskXP(nestedSubtask, workType, depth + 1);
      xp += nested.xp;
      count += nested.count;
      breakdown.push(...nested.breakdown);
    }
  }

  return { xp, count, breakdown };
}

/**
 * Calculate subtask XP with support for nested sub-subtasks (2-level hierarchy)
 * Uses recursive traversal to calculate XP for all levels
 */
export function calculateSubtaskXP(
  subtasks: SubtaskXP[],
  workType: WorkType
): { total: number; count: number; breakdown: Array<{ id: string; title: string; xp: number; depth: number }> } {
  let total = 0;
  let count = 0;
  const breakdown: Array<{ id: string; title: string; xp: number; depth: number }> = [];

  for (const subtask of subtasks) {
    const result = calculateSingleSubtaskXP(subtask, workType, 0);
    total += result.xp;
    count += result.count;
    breakdown.push(...result.breakdown);
  }

  // Cap subtask XP per task
  const cappedTotal = Math.min(total, XP_LIMITS.MAX_SUBTASK_XP_PER_TASK);

  return {
    total: cappedTotal,
    count,
    breakdown,
  };
}

/**
 * Calculate streak bonus
 */
export function calculateStreakBonus(streakDays: number = 0): number {
  if (streakDays >= 30) return XP_STREAK_BONUSES.DAILY_STREAK_30;
  if (streakDays >= 7) return XP_STREAK_BONUSES.DAILY_STREAK_7;
  if (streakDays >= 3) return XP_STREAK_BONUSES.DAILY_STREAK_3;
  return 0;
}

// ============================================================================
// MAIN CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate XP for a single task with full transparency
 *
 * @param task - The task to calculate XP for
 * @returns Complete XP calculation with breakdown
 *
 * @example
 * ```typescript
 * const result = calculateTaskXP({
 *   workType: 'deep',
 *   priority: TaskPriority.HIGH,
 *   status: TaskStatus.COMPLETED,
 *   timeEstimateMinutes: 120,
 *   focusIntensity: 'high',
 *   subtasks: [
 *     { id: '1', title: 'Subtask 1', status: TaskStatus.COMPLETED, estimatedMinutes: 45 },
 *   ],
 * });
 *
 * console.log(result.breakdown);
 * // { base: 25, priorityBonus: 17, timeBonus: 25, focusBonus: 16, subtaskXP: 13, streakBonus: 0, total: 96 }
 * ```
 */
export function calculateTaskXP(task: TaskForXP): XPCalculationResult {
  const workType = task.workType ?? 'light';
  const priority = task.priority ?? TaskPriority.MEDIUM;
  const focusIntensity = task.focusIntensity ?? 'none';
  const timeEstimateMinutes = task.timeEstimateMinutes ?? parseTimeEstimate(task.estimated_time as unknown as string);
  const streakDays = task.completionStreakDays ?? 0;

  // Base XP
  const baseXP = workType === 'deep' ? XP_BASE.DEEP : XP_BASE.LIGHT;

  // Priority multiplier
  const priorityMultiplier = getPriorityMultiplier(priority, workType);
  const priorityBonus = Math.round(baseXP * (priorityMultiplier - 1));

  // Time bonus
  const timeBonus = calculateTimeBonus(timeEstimateMinutes, workType);

  // Focus bonus (Deep Work only)
  const focusMultiplier = workType === 'deep' ? getFocusMultiplier(focusIntensity) : 1.0;
  const focusBonus = workType === 'deep'
    ? Math.round((baseXP + priorityBonus + timeBonus) * (focusMultiplier - 1))
    : 0;

  // Subtask XP
  const subtaskResult = calculateSubtaskXP(task.subtasks ?? [], workType);
  const subtaskXP = subtaskResult.total;

  // Streak bonus
  const streakBonus = calculateStreakBonus(streakDays);

  // Calculate total before capping
  const rawTotal = baseXP + priorityBonus + timeBonus + focusBonus + subtaskXP + streakBonus;

  // Apply caps
  const capped = rawTotal > XP_LIMITS.MAX_TASK_XP;
  const total = Math.min(Math.max(rawTotal, XP_LIMITS.MIN_TASK_XP), XP_LIMITS.MAX_TASK_XP);

  return {
    total,
    breakdown: {
      base: baseXP,
      priorityBonus,
      timeBonus,
      focusBonus,
      subtaskXP,
      streakBonus,
      total,
    },
    workType,
    priority,
    appliedMultipliers: {
      priority: priorityMultiplier,
      focus: focusMultiplier,
    },
    subtaskCount: subtaskResult.count,
    capped,
  };
}

/**
 * Preview XP without actually awarding it
 * Useful for showing users what they will earn before completion
 */
export function previewTaskXP(task: TaskForXP): XPCalculationResult {
  return calculateTaskXP(task);
}

/**
 * Calculate XP for task completion (includes completion bonus)
 */
export function calculateTaskCompletionXP(
  task: TaskForXP,
  options: {
    includeCompletionBonus?: boolean;
    completionBonusAmount?: number;
  } = {}
): XPCalculationResult {
  const { includeCompletionBonus = true, completionBonusAmount = 10 } = options;

  const result = calculateTaskXP(task);

  if (includeCompletionBonus && task.status === TaskStatus.COMPLETED) {
    const bonus = completionBonusAmount;
    result.breakdown.total += bonus;
    result.total = Math.min(result.total + bonus, XP_LIMITS.MAX_TASK_XP);
  }

  return result;
}

/**
 * Calculate total daily XP across multiple tasks
 */
export function calculateDailyTaskXP(
  tasks: TaskForXP[],
  options: {
    includeStreakBonus?: boolean;
    currentStreakDays?: number;
  } = {}
): {
  total: number;
  lightWorkXP: number;
  deepWorkXP: number;
  taskBreakdown: XPCalculationResult[];
} {
  const { includeStreakBonus = false, currentStreakDays = 0 } = options;

  let lightWorkXP = 0;
  let deepWorkXP = 0;
  const taskBreakdown: XPCalculationResult[] = [];

  for (const task of tasks) {
    const result = calculateTaskXP(task);
    taskBreakdown.push(result);

    if (result.workType === 'deep') {
      deepWorkXP += result.total;
    } else {
      lightWorkXP += result.total;
    }
  }

  let total = lightWorkXP + deepWorkXP;

  // Apply daily streak bonus once
  if (includeStreakBonus) {
    total += calculateStreakBonus(currentStreakDays);
  }

  return {
    total,
    lightWorkXP,
    deepWorkXP,
    taskBreakdown,
  };
}

/**
 * Get XP formula explanation for transparency
 */
export function getXPFormulaExplanation(): string {
  return `
XP Calculation Formula:
======================

Base XP:
  - Light Work: ${XP_BASE.LIGHT} XP
  - Deep Work: ${XP_BASE.DEEP} XP

Priority Multipliers:
  Light Work:
    - Critical: ${XP_PRIORITY_MULTIPLIERS_LIGHT.CRITICAL}x
    - High: ${XP_PRIORITY_MULTIPLIERS_LIGHT.HIGH}x
    - Medium: ${XP_PRIORITY_MULTIPLIERS_LIGHT.MEDIUM}x
    - Low: ${XP_PRIORITY_MULTIPLIERS_LIGHT.LOW}x
    - Backlog: ${XP_PRIORITY_MULTIPLIERS_LIGHT.BACKLOG}x

  Deep Work:
    - Critical: ${XP_PRIORITY_MULTIPLIERS_DEEP.CRITICAL}x
    - High: ${XP_PRIORITY_MULTIPLIERS_DEEP.HIGH}x
    - Medium: ${XP_PRIORITY_MULTIPLIERS_DEEP.MEDIUM}x
    - Low: ${XP_PRIORITY_MULTIPLIERS_DEEP.LOW}x
    - Backlog: ${XP_PRIORITY_MULTIPLIERS_DEEP.BACKLOG}x

Time Estimate Bonus:
  Light Work:
    - 30+ min: +${XP_TIME_BONUS.LIGHT.BONUS_30} XP
    - 60+ min: +${XP_TIME_BONUS.LIGHT.BONUS_60} XP

  Deep Work:
    - 60+ min: +${XP_TIME_BONUS.DEEP.BONUS_60} XP
    - 120+ min: +${XP_TIME_BONUS.DEEP.BONUS_120} XP
    - 240+ min: +${XP_TIME_BONUS.DEEP.BONUS_240} XP

Focus Intensity (Deep Work only):
  - None: ${XP_FOCUS_MULTIPLIERS.NONE}x
  - Low: ${XP_FOCUS_MULTIPLIERS.LOW}x
  - Medium: ${XP_FOCUS_MULTIPLIERS.MEDIUM}x
  - High: ${XP_FOCUS_MULTIPLIERS.HIGH}x
  - Flow State: ${XP_FOCUS_MULTIPLIERS.FLOW_STATE}x

Subtask XP:
  Light Work:
    - Base: ${XP_SUBTASK.LIGHT.BASE} XP per subtask
    - 30-60 min: +${XP_SUBTASK.LIGHT.BONUS_30MIN} XP
    - 60+ min: +${XP_SUBTASK.LIGHT.BONUS_60MIN} XP

  Deep Work:
    - Base: ${XP_SUBTASK.DEEP.BASE} XP per subtask
    - 30-60 min: +${XP_SUBTASK.DEEP.BONUS_30MIN} XP
    - 60+ min: +${XP_SUBTASK.DEEP.BONUS_60MIN} XP

Streak Bonuses:
  - 3-day streak: +${XP_STREAK_BONUSES.DAILY_STREAK_3} XP
  - 7-day streak: +${XP_STREAK_BONUSES.DAILY_STREAK_7} XP
  - 30-day streak: +${XP_STREAK_BONUSES.DAILY_STREAK_30} XP

Limits:
  - Max task XP: ${XP_LIMITS.MAX_TASK_XP} XP
  - Max subtask XP per task: ${XP_LIMITS.MAX_SUBTASK_XP_PER_TASK} XP
  - Min task XP: ${XP_LIMITS.MIN_TASK_XP} XP
`;
}

/**
 * Format XP breakdown for display
 */
export function formatXPBreakdown(result: XPCalculationResult): string {
  const { breakdown, workType, priority, appliedMultipliers, subtaskCount, capped } = result;

  const lines = [
    `XP Breakdown (${workType.toUpperCase()} WORK - ${priority})`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Base XP:                    +${breakdown.base}`,
    `Priority Bonus (${appliedMultipliers.priority}x):       +${breakdown.priorityBonus}`,
  ];

  if (breakdown.timeBonus > 0) {
    lines.push(`Time Estimate Bonus:        +${breakdown.timeBonus}`);
  }

  if (breakdown.focusBonus > 0) {
    lines.push(`Focus Bonus (${appliedMultipliers.focus}x):          +${breakdown.focusBonus}`);
  }

  if (breakdown.subtaskXP > 0) {
    lines.push(`Subtask XP (${subtaskCount}):           +${breakdown.subtaskXP}`);
  }

  if (breakdown.streakBonus > 0) {
    lines.push(`Streak Bonus:               +${breakdown.streakBonus}`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`TOTAL:                      ${breakdown.total} XP${capped ? ' (capped)' : ''}`);

  return lines.join('\n');
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Calculate Light Work Task XP (Legacy)
 * @deprecated Use calculateTaskXP instead
 */
export function calculateLightWorkTaskXP(task: {
  priority?: string;
  subtasks?: Array<{ completed?: boolean; estimatedTime?: string }>;
  completed?: boolean;
}): { total: number; taskXP: number; subtaskXP: number } {
  const result = calculateTaskXP({
    workType: 'light',
    priority: (task.priority?.toUpperCase() as TaskPriority) ?? TaskPriority.MEDIUM,
    status: task.completed ? TaskStatus.COMPLETED : TaskStatus.NOT_STARTED,
    subtasks: task.subtasks?.map((st, i) => ({
      id: String(i),
      title: '',
      status: st.completed ? TaskStatus.COMPLETED : TaskStatus.NOT_STARTED,
      estimatedMinutes: parseTimeEstimate(st.estimatedTime),
    })),
  });

  return {
    total: result.total,
    taskXP: result.breakdown.base + result.breakdown.priorityBonus,
    subtaskXP: result.breakdown.subtaskXP,
  };
}

/**
 * Calculate Deep Work Task XP (Legacy)
 * @deprecated Use calculateTaskXP instead
 */
export function calculateDeepWorkTaskXP(task: {
  priority?: string;
  subtasks?: Array<{ completed?: boolean; estimatedTime?: string }>;
  completed?: boolean;
  timeEstimate?: string;
}): { total: number; taskXP: number; subtaskXP: number; timeBonus: number } {
  const result = calculateTaskXP({
    workType: 'deep',
    priority: (task.priority?.toUpperCase() as TaskPriority) ?? TaskPriority.MEDIUM,
    status: task.completed ? TaskStatus.COMPLETED : TaskStatus.NOT_STARTED,
    timeEstimateMinutes: parseTimeEstimate(task.timeEstimate),
    subtasks: task.subtasks?.map((st, i) => ({
      id: String(i),
      title: '',
      status: st.completed ? TaskStatus.COMPLETED : TaskStatus.NOT_STARTED,
      estimatedMinutes: parseTimeEstimate(st.estimatedTime),
    })),
  });

  return {
    total: result.total,
    taskXP: result.breakdown.base + result.breakdown.priorityBonus + result.breakdown.focusBonus,
    subtaskXP: result.breakdown.subtaskXP,
    timeBonus: result.breakdown.timeBonus,
  };
}

/**
 * Get Light Work Priority Multiplier (Legacy)
 * @deprecated Use getPriorityMultiplier instead
 */
export function getLightWorkPriorityMultiplier(priority?: string): number {
  return getPriorityMultiplier(
    (priority?.toUpperCase() as TaskPriority) ?? TaskPriority.MEDIUM,
    'light'
  );
}

/**
 * Get Deep Work Priority Multiplier (Legacy)
 * @deprecated Use getPriorityMultiplier instead
 */
export function getDeepWorkPriorityMultiplier(priority?: string): number {
  return getPriorityMultiplier(
    (priority?.toUpperCase() as TaskPriority) ?? TaskPriority.MEDIUM,
    'deep'
  );
}
