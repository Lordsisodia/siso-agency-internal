/**
 * Timebox Calculations Hook
 *
 * Handles all calculations: positions, progress, density, stats
 */

import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { TimeboxTask, TaskPosition, TIMEBOX_HOUR_HEIGHT, mapCategoryToUI, AutoAdjustment } from './types';

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

  return {
    timeSlots,
    tasks: sequentialTasks,
    validTasks: sequentialTasks,
    getTaskPosition,
    currentTimePosition,
    hourlyDensity,
    todayStats,
    yesterdayStats,
    autoAdjustments
  };
};
