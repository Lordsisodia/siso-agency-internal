/**
 * Timebox Calculations Hook
 *
 * Handles all calculations: positions, progress, density, stats
 */

import { useMemo } from 'react';
import { format, subDays, isSameDay } from 'date-fns';
import { TimeboxTask, TaskPosition, TIMEBOX_HOUR_HEIGHT, mapCategoryToUI, AutoAdjustment, CurrentTaskInfo } from './types';

const START_OF_DAY_MINUTES = 4 * 60;
const MINUTES_IN_DAY = 24 * 60;

const clampMinutes = (minutes: number): number => {
  if (Number.isNaN(minutes)) return 0;
  return Math.min(Math.max(minutes, 0), MINUTES_IN_DAY);
};

const toDisplayMinutes = (minutes: number): number => {
  const relative = minutes - START_OF_DAY_MINUTES;
  return (relative + MINUTES_IN_DAY) % MINUTES_IN_DAY;
};

const fromDisplayMinutes = (displayMinutes: number): number => {
  return (displayMinutes + START_OF_DAY_MINUTES) % MINUTES_IN_DAY;
};

const minutesToTimeString = (minutes: number): string => {
  const normalized = (minutes + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const timeToMinutes = (time: string | number | Date | null | undefined): number | null => {
  if (time === null || time === undefined) {
    return null;
  }

  if (typeof time === 'number' && Number.isFinite(time)) {
    return clampMinutes(time);
  }

  if (time instanceof Date) {
    return clampMinutes(time.getHours() * 60 + time.getMinutes());
  }

  if (typeof time === 'string') {
    const trimmed = time.trim();
    const match = trimmed.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return null;
    }

    return clampMinutes(hours * 60 + minutes);
  }

  return null;
};

interface UseTimeboxCalculationsProps {
  timeBlocks: any[];
  selectedDate: Date;
}

export const useTimeboxCalculations = ({ timeBlocks, selectedDate }: UseTimeboxCalculationsProps) => {

  // Transform database time blocks into UI tasks
  const rawTasks = useMemo(() => {
    return timeBlocks.map(block => {
      const startValue = block.startTime ?? block.start_time;
      const endValue = block.endTime ?? block.end_time;
      const startMinutes = clampMinutes(timeToMinutes(startValue) ?? 0);
      const rawEndMinutes = timeToMinutes(endValue);

      const fallbackDuration = 60; // default to one hour if duration cannot be inferred
      let durationMinutes: number;
      let endMinutes: number;

      if (rawEndMinutes === null) {
        durationMinutes = fallbackDuration;
        endMinutes = (startMinutes + durationMinutes) % MINUTES_IN_DAY;
      } else {
        endMinutes = clampMinutes(rawEndMinutes);
        durationMinutes = endMinutes - startMinutes;
        if (durationMinutes <= 0) {
          durationMinutes += MINUTES_IN_DAY;
        }
      }

      // Ensure minimum block size
      if (durationMinutes < 5) {
        durationMinutes = 5;
        endMinutes = (startMinutes + durationMinutes) % MINUTES_IN_DAY;
      }

      return {
        id: block.id,
        title: block.title,
        startTime: minutesToTimeString(startMinutes),
        endTime: minutesToTimeString(endMinutes),
        duration: durationMinutes,
        category: mapCategoryToUI(block.category ?? block.type),
        description: block.description || '',
        completed: block.completed || false,
        color: block.category,
        priority: block.priority,
        intensity: block.intensity
      } as TimeboxTask;
    });
  }, [timeBlocks]);

  // Validate and sort tasks
  const sortedTasks = useMemo(() => {
    return rawTasks
      .filter(task => {
        if (!task || !task.id) return false;
        const startMinutes = timeToMinutes(task.startTime);
        if (startMinutes === null) {
          console.warn('Invalid task time detected:', task);
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const startA = timeToMinutes(a.startTime) ?? 0;
        const startB = timeToMinutes(b.startTime) ?? 0;
        const displayA = toDisplayMinutes(startA);
        const displayB = toDisplayMinutes(startB);
        if (displayA === displayB) {
          const endA = toDisplayMinutes((startA + a.duration) % MINUTES_IN_DAY);
          const endB = toDisplayMinutes((startB + b.duration) % MINUTES_IN_DAY);
          return endA - endB;
        }
        return displayA - displayB;
      });
  }, [rawTasks]);

  const { sequentialTasks, autoAdjustments } = useMemo(() => {
    let cursor = 0;
    const adjustments: AutoAdjustment[] = [];

    const sequential = sortedTasks.map(task => {
      const originalStart = task.startTime;
      const originalEnd = task.endTime;

      const startMinutes = clampMinutes(timeToMinutes(originalStart) ?? 0);
      const displayStart = toDisplayMinutes(startMinutes);
      const normalizedDuration = Math.max(task.duration, 5);

      const candidateDisplayStart = Math.max(displayStart, cursor);
      const clampedDisplayStart = Math.min(candidateDisplayStart, MINUTES_IN_DAY - normalizedDuration);
      const adjustedDisplayEnd = clampedDisplayStart + normalizedDuration;

      cursor = adjustedDisplayEnd;

      const normalizedAdjustedStart = clampedDisplayStart % MINUTES_IN_DAY;
      const normalizedAdjustedEnd = adjustedDisplayEnd % MINUTES_IN_DAY;

      const adjustedStartMinutes = fromDisplayMinutes(normalizedAdjustedStart);
      const adjustedEndMinutes = fromDisplayMinutes(normalizedAdjustedEnd);

      const wasAutoAdjusted = normalizedAdjustedStart !== displayStart;

      if (wasAutoAdjusted) {
        adjustments.push({
          id: task.id,
          newStartTime: minutesToTimeString(adjustedStartMinutes),
          newEndTime: minutesToTimeString(adjustedEndMinutes),
          originalStartTime: originalStart,
          originalEndTime: originalEnd
        });
      }

      return {
        ...task,
        startTime: minutesToTimeString(adjustedStartMinutes),
        endTime: minutesToTimeString(adjustedEndMinutes),
        duration: normalizedDuration,
        originalStartTime: wasAutoAdjusted ? originalStart : undefined,
        originalEndTime: wasAutoAdjusted ? originalEnd : undefined,
        wasAutoAdjusted,
        autoAdjustmentReason: wasAutoAdjusted
          ? 'Adjusted automatically to avoid overlapping blocks'
          : undefined
      };
    });

    return { sequentialTasks: sequential, autoAdjustments: adjustments };
  }, [sortedTasks]);

  // Generate hour slots from 12am to 11pm
  const timeSlots = useMemo(() => {
    const slots = [] as Array<{ displayIndex: number; hour: number; label: string; time24: string }>;
    for (let index = 0; index < 24; index++) {
      const hour = (Math.floor(START_OF_DAY_MINUTES / 60) + index) % 24;
      const label = hour === 0
        ? '12 AM'
        : hour < 12
          ? `${hour} AM`
          : hour === 12
            ? '12 PM'
            : `${hour - 12} PM`;
      slots.push({
        displayIndex: index,
        hour,
        label,
        time24: `${hour.toString().padStart(2, '0')}:00`,
      });
    }
    return slots;
  }, []);

  // Calculate current time position
  const currentTimePosition = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const PIXELS_PER_MINUTE = TIMEBOX_HOUR_HEIGHT / 60;
    const nowMinutes = hours * 60 + minutes;
    const displayMinutes = toDisplayMinutes(nowMinutes);
    return displayMinutes * PIXELS_PER_MINUTE;
  }, []);

  // Calculate task position on timeline (memoized function)
  const getTaskPosition = useMemo(() => {
    const PIXELS_PER_MINUTE = TIMEBOX_HOUR_HEIGHT / 60;
    const MIN_HEIGHT = 24;
    const MAX_HEIGHT = 320;

    return (task: TimeboxTask): TaskPosition => {
      try {
        const startMinutes = clampMinutes(timeToMinutes(task.startTime) ?? 0);
        const displayStart = toDisplayMinutes(startMinutes);
        const duration = Math.max(task.duration, 5);

        const topPosition = displayStart * PIXELS_PER_MINUTE;
        let calculatedHeight = duration * PIXELS_PER_MINUTE;

        if (duration < 20) {
          calculatedHeight = Math.max(MIN_HEIGHT, calculatedHeight);
        } else if (duration > 240) {
          calculatedHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, calculatedHeight * 0.85));
        }

        return {
          top: topPosition,
          height: calculatedHeight,
          duration
        };
      } catch (error) {
        console.error(`Error calculating task position for ${task.startTime}:`, error);
        return { top: 0, height: 60, duration: 0 };
      }
    };
  }, []);

  // Calculate hourly density for heatmap
  const hourlyDensity = useMemo(() => {
    const density = Array(24).fill(0);

    sequentialTasks.forEach(task => {
      const startMinutes = clampMinutes(timeToMinutes(task.startTime) ?? 0);
      const displayStart = toDisplayMinutes(startMinutes);
      const displayEnd = Math.min(displayStart + Math.max(task.duration, 5), MINUTES_IN_DAY);

      for (let index = 0; index < 24; index++) {
        const slotStart = index * 60;
        const slotEnd = slotStart + 60;
        const overlapStart = Math.max(displayStart, slotStart);
        const overlapEnd = Math.min(displayEnd, slotEnd);
        if (overlapStart < overlapEnd) {
          density[index] += 1;
        }
      }
    });

    return density;
  }, [sequentialTasks]);

  // Calculate today's statistics
  const todayStats = useMemo(() => {
    const deepWork = sequentialTasks.filter(t => t.category === 'deep-work').reduce((acc, t) => acc + t.duration, 0);
    const lightWork = sequentialTasks.filter(t => t.category === 'light-work').reduce((acc, t) => acc + t.duration, 0);
    const completed = sequentialTasks.filter(t => t.completed).length;
    const total = sequentialTasks.length;

    return {
      deepWorkHours: Math.round(deepWork / 60 * 10) / 10,
      lightWorkHours: Math.round(lightWork / 60 * 10) / 10,
      totalTasks: total,
      completedTasks: completed,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [sequentialTasks]);

  // Calculate yesterday's statistics (from localStorage)
  const yesterdayStats = useMemo(() => {
    const yesterdayKey = format(subDays(selectedDate, 1), 'yyyy-MM-dd');
    try {
      const cached = localStorage.getItem(`timebox-stats-${yesterdayKey}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to load yesterday stats:', error);
    }

    // Return empty stats if no cache
    return {
      deepWorkHours: 0,
      lightWorkHours: 0,
      totalTasks: 0,
      completedTasks: 0,
      completionPercentage: 0
    };
  }, [selectedDate]);

  // Calculate overdue task IDs (tasks that have passed their end time without completion)
  const overdueTaskIds = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return sequentialTasks
      .filter(task => {
        // Only check incomplete tasks
        if (task.completed) return false;

        const endMinutes = timeToMinutes(task.endTime);
        if (endMinutes === null) return false;

        // Task is overdue if end time is before current time
        return endMinutes < currentMinutes;
      })
      .map(task => task.id);
  }, [sequentialTasks]);

  // Calculate day forecast (last task end time, completion status)
  const dayForecast = useMemo(() => {
    if (sequentialTasks.length === 0) {
      return {
        lastEndTime: null,
        allCompleted: false,
        completionPercentage: 0,
        completionTime: null
      };
    }

    // Find the last task end time
    let lastEndMinutes = 0;
    let lastCompletedEndMinutes: number | null = null;

    sequentialTasks.forEach(task => {
      const endMinutes = timeToMinutes(task.endTime);
      if (endMinutes !== null) {
        // Track the absolute last end time
        if (endMinutes > lastEndMinutes) {
          lastEndMinutes = endMinutes;
        }
        // Track the last completed task end time
        if (task.completed && endMinutes > (lastCompletedEndMinutes ?? 0)) {
          lastCompletedEndMinutes = endMinutes;
        }
      }
    });

    const totalTasks = sequentialTasks.length;
    const completedTasks = sequentialTasks.filter(t => t.completed).length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const allCompleted = completedTasks === totalTasks && totalTasks > 0;

    return {
      lastEndTime: minutesToTimeString(lastEndMinutes),
      allCompleted,
      completionPercentage,
      completionTime: allCompleted && lastCompletedEndMinutes !== null
        ? minutesToTimeString(lastCompletedEndMinutes)
        : null
    };
  }, [sequentialTasks]);

  // Calculate day segments for progress timeline
  const dayProgress = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Calculate total planned minutes for the day
    const totalPlannedMinutes = sequentialTasks.reduce((acc, task) => acc + task.duration, 0);

    // Calculate completed minutes
    const completedMinutes = sequentialTasks
      .filter(task => task.completed)
      .reduce((acc, task) => acc + task.duration, 0);

    // Calculate remaining minutes (only for upcoming tasks)
    const remainingMinutes = sequentialTasks
      .filter(task => {
        const taskStartMinutes = timeToMinutes(task.startTime) ?? 0;
        return !task.completed && taskStartMinutes > currentMinutes;
      })
      .reduce((acc, task) => acc + task.duration, 0);

    // Build day segments for the timeline visualization
    const daySegments = sequentialTasks.map(task => {
      const taskStartMinutes = timeToMinutes(task.startTime) ?? 0;
      const taskEndMinutes = taskStartMinutes + task.duration;

      let status: 'completed' | 'current' | 'upcoming';
      if (task.completed) {
        status = 'completed';
      } else if (currentMinutes >= taskStartMinutes && currentMinutes < taskEndMinutes) {
        status = 'current';
      } else {
        status = 'upcoming';
      }

      return {
        id: task.id,
        category: task.category,
        widthPercent: totalPlannedMinutes > 0 ? (task.duration / totalPlannedMinutes) * 100 : 0,
        status,
        duration: task.duration,
        title: task.title
      };
    });

    // Calculate current time position as percentage of the day
    // Use the time range from first task start to last task end
    let currentTimePercent = 0;
    if (sequentialTasks.length > 0) {
      const firstTaskStart = Math.min(...sequentialTasks.map(t => timeToMinutes(t.startTime) ?? 0));
      const lastTaskEnd = Math.max(...sequentialTasks.map(t => {
        const start = timeToMinutes(t.startTime) ?? 0;
        return start + t.duration;
      }));
      const totalDaySpan = lastTaskEnd - firstTaskStart;

      if (totalDaySpan > 0) {
        currentTimePercent = ((currentMinutes - firstTaskStart) / totalDaySpan) * 100;
        currentTimePercent = Math.max(0, Math.min(100, currentTimePercent));
      }
    }

    return {
      segments: daySegments,
      totalPlannedMinutes,
      completedMinutes,
      remainingMinutes,
      currentTimePercent,
      plannedHours: Math.round((totalPlannedMinutes / 60) * 10) / 10,
      doneHours: Math.round((completedMinutes / 60) * 10) / 10,
      leftHours: Math.round((remainingMinutes / 60) * 10) / 10
    };
  }, [sequentialTasks]);

  // Calculate current task info for Now Task Spotlight
  const currentTaskInfo: CurrentTaskInfo = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Check if we're viewing today - if not, return null task
    if (!isSameDay(selectedDate, now)) {
      return {
        task: null,
        isCurrent: false,
        timeRemaining: 0,
        nextTask: sequentialTasks.length > 0 ? sequentialTasks[0] : null
      };
    }

    // Find current task (where current time is between start and end)
    let currentTask: TimeboxTask | null = null;
    let nextTask: TimeboxTask | null = null;
    let timeRemaining = 0;

    for (let i = 0; i < sequentialTasks.length; i++) {
      const task = sequentialTasks[i];
      const taskStartMinutes = timeToMinutes(task.startTime) ?? 0;
      const taskEndMinutes = taskStartMinutes + task.duration;

      // Check if current time falls within this task
      if (currentMinutes >= taskStartMinutes && currentMinutes < taskEndMinutes) {
        currentTask = task;
        timeRemaining = taskEndMinutes - currentMinutes;
        // Find next incomplete task after current
        for (let j = i + 1; j < sequentialTasks.length; j++) {
          if (!sequentialTasks[j].completed) {
            nextTask = sequentialTasks[j];
            break;
          }
        }
        break;
      }

      // If we haven't found current task yet, track potential next task
      if (!currentTask && taskStartMinutes > currentMinutes && !task.completed) {
        if (!nextTask) {
          nextTask = task;
        }
      }
    }

    // If no current task, find the next upcoming task
    if (!currentTask) {
      for (const task of sequentialTasks) {
        const taskStartMinutes = timeToMinutes(task.startTime) ?? 0;
        if (taskStartMinutes > currentMinutes && !task.completed) {
          nextTask = task;
          break;
        }
      }
    }

    return {
      task: currentTask,
      isCurrent: !!currentTask,
      timeRemaining,
      nextTask
    };
  }, [sequentialTasks, selectedDate]);

  // Calculate timebox XP (10 XP per task)
  const timeboxXP = useMemo(() => {
    return sequentialTasks.length * 10;
  }, [sequentialTasks]);

  // Calculate occupied slots (hours that have tasks)
  const occupiedSlots = useMemo(() => {
    const occupied = new Set<number>();
    sequentialTasks.forEach(task => {
      const startHour = parseInt(task.startTime.split(':')[0], 10);
      const endHour = parseInt(task.endTime.split(':')[0], 10);
      // Add all hours this task spans
      for (let hour = startHour; hour < endHour; hour++) {
        occupied.add(hour);
      }
    });
    return Array.from(occupied);
  }, [sequentialTasks]);

  return {
    timeSlots,
    tasks: sequentialTasks,
    validTasks: sequentialTasks,
    getTaskPosition,
    currentTimePosition,
    hourlyDensity,
    todayStats,
    yesterdayStats,
    autoAdjustments,
    overdueTaskIds,
    dayForecast,
    dayProgress,
    currentTaskInfo,
    timeboxXP,
    occupiedSlots
  };
};
