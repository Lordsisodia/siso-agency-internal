/**
 * Timebox Calculations Hook
 *
 * Handles all calculations: positions, progress, density, stats
 */

import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { TimeboxTask, TaskPosition, TIMEBOX_HOUR_HEIGHT, mapCategoryToUI } from '../types';

const sanitizeTime = (time: string): string => {
  if (!time) return '';

  const match = time.trim().match(/(\d{1,2}):(\d{2})/);
  if (!match) return '';

  let hours = Number(match[1]);
  let minutes = Number(match[2]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return '';
  }

  if (hours >= 24) {
    hours = 23;
    minutes = 59;
  } else if (hours < 0) {
    hours = 0;
  }

  if (minutes >= 60) {
    minutes = 59;
  } else if (minutes < 0) {
    minutes = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const extractTimeParts = (time: string): { hours: number; minutes: number; isValid: boolean } => {
  if (!time) {
    return { hours: 0, minutes: 0, isValid: false };
  }

  const parts = time.trim().split(':');
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return { hours: 0, minutes: 0, isValid: false };
  }

  return { hours, minutes, isValid: true };
};

interface UseTimeboxCalculationsProps {
  timeBlocks: any[];
  selectedDate: Date;
}

export const useTimeboxCalculations = ({ timeBlocks, selectedDate }: UseTimeboxCalculationsProps) => {

  // Transform database time blocks into UI tasks
  const tasks = useMemo(() => {
    return timeBlocks.map(block => {
      const sanitizedStart = sanitizeTime(block.startTime);
      const sanitizedEnd = sanitizeTime(block.endTime);

      const { hours: startHour, minutes: startMin, isValid: startValid } = extractTimeParts(sanitizedStart);
      const { hours: endHour, minutes: endMin, isValid: endValid } = extractTimeParts(sanitizedEnd);

      const duration = startValid && endValid
        ? Math.max(0, (endHour * 60 + endMin) - (startHour * 60 + startMin))
        : 0;

      return {
        id: block.id,
        title: block.title,
        startTime: sanitizedStart,
        endTime: sanitizedEnd,
        duration,
        category: mapCategoryToUI(block.category),
        description: block.description || '',
        completed: block.completed || false,
        color: block.category,
        priority: block.priority,
        intensity: block.intensity
      } as TimeboxTask;
    });
  }, [timeBlocks]);

  // Generate hour slots from 12am to 11pm
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour <= 23; hour++) {
      slots.push({
        hour,
        label: hour === 0 ? '12 AM' : hour <= 12 ? `${hour === 12 ? 12 : hour} ${hour < 12 ? 'AM' : 'PM'}` : `${hour - 12} PM`,
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

    const PIXELS_PER_MINUTE = TIMEBOX_HOUR_HEIGHT / 60; // Keep in sync with timeline hour height
    const totalMinutesFromStart = hours * 60 + minutes;
    return totalMinutesFromStart * PIXELS_PER_MINUTE;
  }, []);

  // Calculate task position on timeline (memoized function)
  const getTaskPosition = useMemo(() => {
    return (startTime: string, endTime: string): TaskPosition => {
      try {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
          console.error(`Invalid time format: ${startTime} - ${endTime}`);
          return { top: 0, height: 60, duration: 0 };
        }

        const PIXELS_PER_MINUTE = TIMEBOX_HOUR_HEIGHT / 60;
        const MIN_HEIGHT = 24;
        const MAX_HEIGHT = 320;

        const startMinutesFromStart = startHour * 60 + startMin;
        const endMinutesFromStart = endHour * 60 + endMin;
        const duration = endMinutesFromStart - startMinutesFromStart;

        const topPosition = startMinutesFromStart * PIXELS_PER_MINUTE;
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
        console.error(`Error calculating task position for ${startTime}:`, error);
        return { top: 0, height: 60, duration: 0 };
      }
    };
  }, []);

  // Validate and filter tasks
  const validTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task || !task.id || !task.startTime || !task.endTime) {
        console.warn('Invalid task found:', task);
        return false;
      }

      const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/;
      if (!timePattern.test(task.startTime) || !timePattern.test(task.endTime)) {
        console.warn(`Invalid time format for task ${task.id}:`, task.startTime, task.endTime);
        return false;
      }

      return true;
    });
  }, [tasks]);

  // Calculate hourly density for heatmap
  const hourlyDensity = useMemo(() => {
    const density = Array(24).fill(0);

    validTasks.forEach(task => {
      const [startHour, startMin] = task.startTime.split(':').map(Number);
      const [endHour, endMin] = task.endTime.split(':').map(Number);

      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;

      for (let h = startHour; h <= endHour; h++) {
        const hourStart = h * 60;
        const hourEnd = (h + 1) * 60;

        const overlapStart = Math.max(startTotalMin, hourStart);
        const overlapEnd = Math.min(endTotalMin, hourEnd);

        if (overlapStart < overlapEnd) {
          density[h] += overlapEnd - overlapStart;
        }
      }
    });

    return density;
  }, [validTasks]);

  // Calculate today's statistics
  const todayStats = useMemo(() => {
    const deepWork = validTasks.filter(t => t.category === 'deep-work').reduce((acc, t) => acc + t.duration, 0);
    const lightWork = validTasks.filter(t => t.category === 'light-work').reduce((acc, t) => acc + t.duration, 0);
    const completed = validTasks.filter(t => t.completed).length;
    const total = validTasks.length;

    return {
      deepWorkHours: Math.round(deepWork / 60 * 10) / 10,
      lightWorkHours: Math.round(lightWork / 60 * 10) / 10,
      totalTasks: total,
      completedTasks: completed,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [validTasks]);

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
    tasks,
    validTasks,
    getTaskPosition,
    currentTimePosition,
    hourlyDensity,
    todayStats,
    yesterdayStats
  };
};
