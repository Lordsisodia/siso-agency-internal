"use client";

/**
 * useUnifiedTasks Hook
 *
 * Combines light and deep work tasks into a unified interface for Today's Tasks view.
 * Handles task transformation, allocation logic, filtering, and TIMEBOX INTEGRATION.
 */

import { useMemo, useCallback, useEffect, useRef } from "react";
import { format } from "date-fns";
import { LightWorkTask } from "@/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase";
import { DeepWorkTask } from "@/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase";
import { UnifiedTask } from "@/domains/lifelock/1-daily/_shared/components/UnifiedTaskCard";
import { TimeBlock } from "@/services/api/timeblocksApi.offline";

export type UnifiedTaskType = "light" | "deep";

export interface TimeboxSlot {
  timeBlockId: string;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  title: string;
}

export interface UnifiedTaskWithType extends UnifiedTask {
  workType: UnifiedTaskType;
  originalId: string;
  timebox?: TimeboxSlot; // Linked timebox slot
}

interface UseUnifiedTasksOptions {
  rawLightTasks: LightWorkTask[];
  rawDeepTasks: DeepWorkTask[];
  timeBlocks: TimeBlock[];
  selectedDate: Date;
  searchQuery?: string;
  priorityFilter?: string[];
  typeFilter?: UnifiedTaskType[];
  userId?: string;
  onAutoSchedule?: (taskId: string, startTime: string, endTime: string) => Promise<void>;
}

interface UseUnifiedTasksResult {
  allocatedTasks: UnifiedTaskWithType[];
  unallocatedTasks: UnifiedTaskWithType[];
  allTasks: UnifiedTaskWithType[];
  completedTasks: UnifiedTaskWithType[];
  stats: {
    total: number;
    allocated: number;
    unallocated: number;
    completed: number;
    scheduled: number; // Tasks with timebox slots
    totalEstimatedMinutes: number;
  };
  // Auto-scheduling
  autoScheduleTask: (taskId: string, preferredStartTime?: string) => Promise<boolean>;
  findNextAvailableSlot: (durationMinutes?: number, afterTime?: string) => string | null;
}

// Transform Light Work tasks
function transformLightWorkTask(task: LightWorkTask): UnifiedTaskWithType {
  return {
    id: `light-${task.id}`,
    originalId: task.id,
    workType: "light" as const,
    title: task.title,
    description: task.description || "",
    status: task.completed ? "completed" : "in-progress",
    priority: (task.priority || "MEDIUM").toLowerCase(),
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      description: subtask.text || subtask.title,
      status: subtask.completed ? "completed" : "pending",
      priority: subtask.priority || "medium",
      estimatedTime: subtask.estimatedTime,
      tools: [],
      completed: subtask.completed,
      dueDate: subtask.dueDate,
    })),
    focusIntensity: 2 as 1 | 2 | 3 | 4,
    dueDate: task.dueDate || task.currentDate || null,
    timeEstimate: task.timeEstimate || null,
    actualDurationMin: task.actualDurationMin,
  };
}

// Transform Deep Work tasks
function transformDeepWorkTask(task: DeepWorkTask): UnifiedTaskWithType {
  return {
    id: `deep-${task.id}`,
    originalId: task.id,
    workType: "deep" as const,
    title: task.title,
    description: task.description || "",
    status: task.completed ? "completed" : "in-progress",
    priority: (task.priority || "MEDIUM").toLowerCase(),
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      description: subtask.text || subtask.title,
      status: subtask.completed ? "completed" : "pending",
      priority: subtask.priority || "medium",
      estimatedTime: subtask.estimatedTime,
      tools: [],
      completed: subtask.completed,
      dueDate: subtask.dueDate,
    })),
    focusIntensity: (task.focusBlocks || 4) as 1 | 2 | 3 | 4,
    dueDate: task.dueDate || task.taskDate || null,
    timeEstimate: task.timeEstimate || null,
    actualDurationMin: task.actualDurationMin,
    clientId: task.clientId ?? undefined,
  };
}

// Helper to normalize date strings
function normalizeDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

// Parse time estimate to minutes
function parseTimeEstimateToMinutes(value?: string | null): number {
  if (!value) return 0;
  const normalized = value.toString().toLowerCase();
  let minutes = 0;

  const hourMatches = normalized.matchAll(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/g);
  for (const match of hourMatches) {
    minutes += Math.round(parseFloat(match[1]) * 60);
  }

  const minuteMatches = normalized.matchAll(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)/g);
  for (const match of minuteMatches) {
    minutes += Math.round(parseFloat(match[1]));
  }

  if (minutes === 0) {
    const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      minutes = Math.round(parseFloat(numberMatch[1]));
    }
  }

  return minutes;
}

// Calculate task time summary
function getTaskTimeSummary(task: UnifiedTask): { totalMinutes: number; formatted: string } {
  const baseSubtaskMinutes = task.id.startsWith("deep-") ? 45 : 30;
  let totalMinutes = 0;

  task.subtasks
    .filter((subtask) => subtask.status !== "completed")
    .forEach((subtask) => {
      const estimateMinutes = parseTimeEstimateToMinutes(subtask.estimatedTime);
      totalMinutes += estimateMinutes > 0 ? estimateMinutes : baseSubtaskMinutes;
    });

  const manualMinutes = parseTimeEstimateToMinutes(task.timeEstimate);

  if (task.subtasks.length === 0) {
    totalMinutes = manualMinutes > 0 ? manualMinutes : baseSubtaskMinutes;
  } else if (manualMinutes > 0) {
    totalMinutes = manualMinutes;
  }

  const rounded = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;

  let formatted: string;
  if (hours > 0 && mins > 0) {
    formatted = `${hours}h ${mins}m`;
  } else if (hours > 0) {
    formatted = `${hours}h`;
  } else {
    formatted = `${mins}m`;
  }

  return { totalMinutes, formatted };
}

// Parse time string to minutes since midnight
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Format minutes since midnight to time string
function minutesToTime(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Format time for display (09:00 -> 9:00 AM)
function formatTimeDisplay(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Sort tasks: By timebox time first, then deep work, then by priority
function sortTasks(tasks: UnifiedTaskWithType[]): UnifiedTaskWithType[] {
  return [...tasks].sort((a, b) => {
    // First sort by timebox time
    if (a.timebox && b.timebox) {
      return a.timebox.startTime.localeCompare(b.timebox.startTime);
    }
    if (a.timebox) return -1;
    if (b.timebox) return 1;

    // Then by work type (deep first)
    if (a.workType !== b.workType) {
      return a.workType === "deep" ? -1 : 1;
    }

    // Then by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
    return aPriority - bPriority;
  });
}

export function useUnifiedTasks({
  rawLightTasks,
  rawDeepTasks,
  timeBlocks,
  selectedDate,
  searchQuery = "",
  priorityFilter = [],
  typeFilter = [],
  userId,
  onAutoSchedule,
}: UseUnifiedTasksOptions): UseUnifiedTasksResult {
  // Get today's date string for comparison
  const todayDate = useMemo(() => {
    const date = selectedDate || new Date();
    return format(date, "yyyy-MM-dd");
  }, [selectedDate]);

  // Transform all tasks
  const allLightTasks = useMemo(
    () => rawLightTasks.map(transformLightWorkTask),
    [rawLightTasks]
  );
  const allDeepTasks = useMemo(
    () => rawDeepTasks.map(transformDeepWorkTask),
    [rawDeepTasks]
  );

  // Create Maps for O(1) lookups
  const rawLightMap = useMemo(
    () => new Map(rawLightTasks.map((t) => [t.id, t])),
    [rawLightTasks]
  );
  const rawDeepMap = useMemo(
    () => new Map(rawDeepTasks.map((t) => [t.id, t])),
    [rawDeepTasks]
  );

  // Link time blocks to tasks
  const linkTimeBlocksToTasks = useCallback((
    tasks: UnifiedTaskWithType[],
    blocks: TimeBlock[]
  ): UnifiedTaskWithType[] => {
    // Create a map of taskId -> timeBlock
    const taskTimeMap = new Map<string, TimeBlock>();
    blocks.forEach((block) => {
      if (block.taskId) {
        taskTimeMap.set(block.taskId, block);
      }
    });

    return tasks.map((task) => {
      const timeBlock = taskTimeMap.get(task.originalId);
      if (timeBlock) {
        return {
          ...task,
          timebox: {
            timeBlockId: timeBlock.id,
            startTime: timeBlock.startTime,
            endTime: timeBlock.endTime,
            title: timeBlock.title,
          },
        };
      }
      return task;
    });
  }, []);

  // Split tasks into allocated and unallocated
  const { allocated, unallocated, completed } = useMemo(() => {
    const allocated: UnifiedTaskWithType[] = [];
    const unallocated: UnifiedTaskWithType[] = [];
    const completed: UnifiedTaskWithType[] = [];

    // Process light tasks
    allLightTasks.forEach((task) => {
      if (task.status === "completed") {
        completed.push(task);
        return;
      }

      const normalizedCurrentDate = normalizeDate(task.dueDate);
      const isScheduledToday = normalizedCurrentDate === todayDate;

      if (isScheduledToday) {
        allocated.push(task);
      } else {
        // Check if due today but scheduled for another day
        const originalTask = rawLightMap.get(task.originalId);
        if (originalTask) {
          const taskDueDate = normalizeDate(originalTask.dueDate);
          const taskCurrentDate = normalizeDate(originalTask.currentDate);
          if (taskDueDate === todayDate && taskCurrentDate !== todayDate) {
            unallocated.push(task);
          }
        }
      }
    });

    // Process deep tasks
    allDeepTasks.forEach((task) => {
      if (task.status === "completed") {
        completed.push(task);
        return;
      }

      const normalizedTaskDate = normalizeDate(task.dueDate);
      const isScheduledToday = normalizedTaskDate === todayDate;

      if (isScheduledToday) {
        allocated.push(task);
      } else {
        // Check if due today but scheduled for another day
        const originalTask = rawDeepMap.get(task.originalId);
        if (originalTask) {
          const taskDueDate = normalizeDate(originalTask.dueDate);
          const taskCurrentDate = normalizeDate(originalTask.currentDate);
          if (taskDueDate === todayDate && taskCurrentDate !== todayDate) {
            unallocated.push(task);
          }
        }
      }
    });

    // Link time blocks to allocated tasks
    const allocatedWithTime = linkTimeBlocksToTasks(allocated, timeBlocks);

    return { allocated: allocatedWithTime, unallocated, completed };
  }, [allLightTasks, allDeepTasks, rawLightMap, rawDeepMap, todayDate, timeBlocks, linkTimeBlocksToTasks]);

  // Find next available time slot
  const findNextAvailableSlot = useCallback((
    durationMinutes: number = 60,
    afterTime: string = "09:00"
  ): string | null => {
    if (!timeBlocks.length) return afterTime;

    const sortedBlocks = [...timeBlocks].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    const afterMinutes = timeToMinutes(afterTime);
    let currentTime = Math.max(afterMinutes, timeToMinutes("08:00")); // Start from 8 AM or afterTime

    for (const block of sortedBlocks) {
      const blockStart = timeToMinutes(block.startTime);
      const blockEnd = timeToMinutes(block.endTime);

      // If there's a gap before this block
      if (currentTime + durationMinutes <= blockStart) {
        return minutesToTime(currentTime);
      }

      // Move current time to end of this block
      if (blockEnd > currentTime) {
        currentTime = blockEnd;
      }
    }

    // Check if there's room at end of day (before 10 PM)
    if (currentTime + durationMinutes <= timeToMinutes("22:00")) {
      return minutesToTime(currentTime);
    }

    return null;
  }, [timeBlocks]);

  // Auto-schedule a task
  const autoScheduleTask = useCallback(async (
    taskId: string,
    preferredStartTime?: string
  ): Promise<boolean> => {
    if (!onAutoSchedule) return false;

    const task = allocatedTasks.find((t) => t.id === taskId) ||
                 unallocatedTasks.find((t) => t.id === taskId);

    if (!task) return false;

    // Get task duration
    const { totalMinutes } = getTaskTimeSummary(task);
    const duration = Math.max(totalMinutes, 30); // Minimum 30 minutes

    // Find next available slot
    const startTime = preferredStartTime || findNextAvailableSlot(duration);
    if (!startTime) return false;

    // Calculate end time
    const endMinutes = timeToMinutes(startTime) + duration;
    const endTime = minutesToTime(endMinutes);

    try {
      await onAutoSchedule(task.originalId, startTime, endTime);
      return true;
    } catch (error) {
      console.error("Failed to auto-schedule task:", error);
      return false;
    }
  }, [allocatedTasks, unallocatedTasks, findNextAvailableSlot, onAutoSchedule]);

  // Apply filters
  const filterTasks = useCallback(
    (tasks: UnifiedTaskWithType[]) => {
      return tasks.filter((task) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch =
            task.title.toLowerCase().includes(query) ||
            task.description.toLowerCase().includes(query) ||
            task.subtasks.some((st) => st.title.toLowerCase().includes(query));
          if (!matchesSearch) return false;
        }

        // Priority filter
        if (priorityFilter.length > 0 && !priorityFilter.includes(task.priority)) {
          return false;
        }

        // Type filter
        if (typeFilter.length > 0 && !typeFilter.includes(task.workType)) {
          return false;
        }

        return true;
      });
    },
    [searchQuery, priorityFilter, typeFilter]
  );

  const filteredAllocated = useMemo(
    () => sortTasks(filterTasks(allocated)),
    [allocated, filterTasks]
  );
  const filteredUnallocated = useMemo(
    () => sortTasks(filterTasks(unallocated)),
    [unallocated, filterTasks]
  );
  const filteredCompleted = useMemo(
    () => sortTasks(filterTasks(completed)),
    [completed, filterTasks]
  );

  // Calculate stats
  const stats = useMemo(() => {
    const totalEstimatedMinutes = filteredAllocated.reduce(
      (sum, task) => sum + getTaskTimeSummary(task).totalMinutes,
      0
    );

    const scheduledCount = filteredAllocated.filter((t) => t.timebox).length;

    return {
      total: allocated.length + unallocated.length + completed.length,
      allocated: allocated.length,
      unallocated: unallocated.length,
      completed: completed.length,
      scheduled: scheduledCount,
      totalEstimatedMinutes,
    };
  }, [allocated, unallocated, completed, filteredAllocated]);

  return {
    allocatedTasks: filteredAllocated,
    unallocatedTasks: filteredUnallocated,
    allTasks: [...filteredAllocated, ...filteredUnallocated],
    completedTasks: filteredCompleted,
    stats,
    autoScheduleTask,
    findNextAvailableSlot,
  };
}

export { getTaskTimeSummary, parseTimeEstimateToMinutes, normalizeDate, formatTimeDisplay, timeToMinutes, minutesToTime };
