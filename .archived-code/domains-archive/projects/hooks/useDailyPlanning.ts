/**
 * Daily Planning Hook - Manual day planning and time boxing functionality
 * 
 * This hook manages the complete daily planning workflow:
 * 1. Load all available tasks from all sources
 * 2. Select tasks for a specific day
 * 3. Estimate time for tasks without durations
 * 4. Assign tasks to specific time slots
 * 5. Handle time conflicts and validation
 * 6. Save/load daily plans
 */

import { useState, useEffect } from 'react';
import { useTimelineTasks } from './useTimelineTasks';
import { format, parse, isWithinInterval, addMinutes } from 'date-fns';

export interface TimeSlot {
  id: string;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  duration: number;  // 90 minutes
  assignedTaskId?: string; // task ID assigned to this slot
  isBlocked?: boolean; // for meetings, breaks, etc.
  label?: string; // custom label like "Meeting with client"
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  timeSlots: TimeSlot[];
  selectedTaskIds: string[]; // tasks selected for today
  unscheduledTaskIds: string[]; // selected but not yet time-boxed
  totalPlannedTime: number; // total minutes planned
  totalAvailableTime: number; // total minutes in time slots
}

export interface TaskWithEstimation {
  id: string;
  title: string;
  description?: string;
  category: 'morning' | 'light-work' | 'deep-work' | 'wellness';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  estimatedDuration: number; // minutes
  hasUserEstimate: boolean; // true if user manually set duration
  source: 'database' | 'generated'; // where the task came from
}

interface UseDailyPlanningOptions {
  selectedDate: Date;
  workingHours?: { start: string; end: string }; // default: 9:00-17:00
  timeSlotDuration?: number; // default: 30 minutes
}

export function useDailyPlanning(options: UseDailyPlanningOptions) {
  const { 
    selectedDate, 
    workingHours = { start: '09:00', end: '17:00' },
    timeSlotDuration = 30 
  } = options;

  // Get all timeline tasks
  const { timelineGroups, loading: tasksLoading } = useTimelineTasks({
    startDate: selectedDate,
    endDate: selectedDate,
    categories: ['morning', 'light-work', 'deep-work', 'wellness']
  });

  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [availableTasks, setAvailableTasks] = useState<TaskWithEstimation[]>([]);
  const [loading, setLoading] = useState(true);

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Generate default time slots for the day
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = parseInt(workingHours.start.split(':')[0]);
    const startMinute = parseInt(workingHours.start.split(':')[1]);
    const endHour = parseInt(workingHours.end.split(':')[0]);
    const endMinute = parseInt(workingHours.end.split(':')[1]);

    const startTime = new Date(selectedDate);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    let currentTime = new Date(startTime);
    let slotIndex = 0;

    while (currentTime < endTime) {
      const nextTime = addMinutes(currentTime, timeSlotDuration);
      
      slots.push({
        id: `slot-${slotIndex}`,
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(nextTime, 'HH:mm'),
        duration: timeSlotDuration
      });

      currentTime = nextTime;
      slotIndex++;
    }

    return slots;
  };

  // Convert timeline tasks to tasks with estimation
  useEffect(() => {
    if (tasksLoading) return;

    const tasks: TaskWithEstimation[] = timelineGroups
      .flatMap(group => group.tasks)
      .map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        completed: task.completed,
        estimatedDuration: task.estimatedDuration || 30, // default 30 min
        hasUserEstimate: !!task.estimatedDuration,
        source: 'database' as const
      }));

    setAvailableTasks(tasks);
    setLoading(false);
  }, [timelineGroups, tasksLoading]);

  // Load or create daily plan
  useEffect(() => {
    if (!availableTasks.length) return;

    // Try to load existing plan from localStorage
    const savedPlan = localStorage.getItem(`daily-plan-${dateString}`);
    
    if (savedPlan) {
      try {
        const plan: DailyPlan = JSON.parse(savedPlan);
        setDailyPlan(plan);
        return;
      } catch (error) {
        console.warn('Failed to load saved daily plan:', error);
      }
    }

    // Create new daily plan
    const newPlan: DailyPlan = {
      date: dateString,
      timeSlots: generateTimeSlots(),
      selectedTaskIds: [],
      unscheduledTaskIds: [],
      totalPlannedTime: 0,
      totalAvailableTime: generateTimeSlots().reduce((sum, slot) => sum + slot.duration, 0)
    };

    setDailyPlan(newPlan);
  }, [availableTasks, dateString]);

  // Save daily plan to localStorage
  const saveDailyPlan = (plan: DailyPlan) => {
    try {
      localStorage.setItem(`daily-plan-${plan.date}`, JSON.stringify(plan));
      console.log('📅 Daily plan saved for', plan.date);
    } catch (error) {
      console.error('Failed to save daily plan:', error);
    }
  };

  // Select a task for today
  const selectTask = (taskId: string) => {
    if (!dailyPlan) return;

    const updatedPlan = {
      ...dailyPlan,
      selectedTaskIds: [...dailyPlan.selectedTaskIds, taskId],
      unscheduledTaskIds: [...dailyPlan.unscheduledTaskIds, taskId]
    };

    setDailyPlan(updatedPlan);
    saveDailyPlan(updatedPlan);
  };

  // Deselect a task
  const deselectTask = (taskId: string) => {
    if (!dailyPlan) return;

    // Remove from selected and unscheduled
    // Also remove from any time slot
    const updatedPlan = {
      ...dailyPlan,
      selectedTaskIds: dailyPlan.selectedTaskIds.filter(id => id !== taskId),
      unscheduledTaskIds: dailyPlan.unscheduledTaskIds.filter(id => id !== taskId),
      timeSlots: dailyPlan.timeSlots.map(slot => 
        slot.assignedTaskId === taskId 
          ? { ...slot, assignedTaskId: undefined }
          : slot
      )
    };

    // Recalculate total planned time
    updatedPlan.totalPlannedTime = calculateTotalPlannedTime(updatedPlan);

    setDailyPlan(updatedPlan);
    saveDailyPlan(updatedPlan);
  };

  // Assign a task to a time slot
  const assignTaskToSlot = (taskId: string, slotId: string) => {
    if (!dailyPlan) return;

    const task = availableTasks.find(t => t.id === taskId);
    const slot = dailyPlan.timeSlots.find(s => s.id === slotId);
    
    if (!task || !slot) return;

    // Check if task duration fits in slot
    if (task.estimatedDuration > slot.duration) {
      console.warn('Task duration exceeds slot duration:', {
        task: task.title,
        taskDuration: task.estimatedDuration,
        slotDuration: slot.duration
      });
      // Could return an error or auto-extend slot
    }

    const updatedPlan = {
      ...dailyPlan,
      timeSlots: dailyPlan.timeSlots.map(s => 
        s.id === slotId 
          ? { ...s, assignedTaskId: taskId }
          : s.assignedTaskId === taskId // Remove from other slots
            ? { ...s, assignedTaskId: undefined }
            : s
      ),
      unscheduledTaskIds: dailyPlan.unscheduledTaskIds.filter(id => id !== taskId)
    };

    // Recalculate total planned time
    updatedPlan.totalPlannedTime = calculateTotalPlannedTime(updatedPlan);

    setDailyPlan(updatedPlan);
    saveDailyPlan(updatedPlan);
  };

  // Remove task from time slot (back to unscheduled)
  const removeTaskFromSlot = (slotId: string) => {
    if (!dailyPlan) return;

    const slot = dailyPlan.timeSlots.find(s => s.id === slotId);
    if (!slot || !slot.assignedTaskId) return;

    const updatedPlan = {
      ...dailyPlan,
      timeSlots: dailyPlan.timeSlots.map(s => 
        s.id === slotId 
          ? { ...s, assignedTaskId: undefined }
          : s
      ),
      unscheduledTaskIds: [...dailyPlan.unscheduledTaskIds, slot.assignedTaskId]
    };

    // Recalculate total planned time
    updatedPlan.totalPlannedTime = calculateTotalPlannedTime(updatedPlan);

    setDailyPlan(updatedPlan);
    saveDailyPlan(updatedPlan);
  };

  // Update task time estimation
  const updateTaskEstimation = (taskId: string, newDuration: number) => {
    setAvailableTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, estimatedDuration: newDuration, hasUserEstimate: true }
          : task
      )
    );

    // If task is in a slot, recalculate plan
    if (dailyPlan) {
      const updatedPlan = { ...dailyPlan };
      updatedPlan.totalPlannedTime = calculateTotalPlannedTime(updatedPlan);
      setDailyPlan(updatedPlan);
      saveDailyPlan(updatedPlan);
    }
  };

  // Calculate total planned time
  const calculateTotalPlannedTime = (plan: DailyPlan): number => {
    return plan.timeSlots.reduce((total, slot) => {
      if (slot.assignedTaskId) {
        const task = availableTasks.find(t => t.id === slot.assignedTaskId);
        return total + (task?.estimatedDuration || 0);
      }
      return total;
    }, 0);
  };

  // Get conflicts and validation
  const getValidation = () => {
    if (!dailyPlan) return { isValid: false, conflicts: [], warnings: [] };

    const conflicts: string[] = [];
    const warnings: string[] = [];

    // Check for time conflicts
    dailyPlan.timeSlots.forEach(slot => {
      if (slot.assignedTaskId) {
        const task = availableTasks.find(t => t.id === slot.assignedTaskId);
        if (task && task.estimatedDuration > slot.duration) {
          conflicts.push(`${task.title} (${task.estimatedDuration}m) exceeds slot duration (${slot.duration}m)`);
        }
      }
    });

    // Check workload
    if (dailyPlan.totalPlannedTime > dailyPlan.totalAvailableTime * 0.9) {
      warnings.push('Day is heavily loaded - consider reducing tasks');
    }

    if (dailyPlan.unscheduledTaskIds.length > 0) {
      warnings.push(`${dailyPlan.unscheduledTaskIds.length} selected tasks not yet scheduled`);
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
      warnings
    };
  };

  // Get tasks by category for easy browsing
  const getTasksByCategory = () => {
    const categories = {
      morning: availableTasks.filter(t => t.category === 'morning'),
      'light-work': availableTasks.filter(t => t.category === 'light-work'),
      'deep-work': availableTasks.filter(t => t.category === 'deep-work'),
      wellness: availableTasks.filter(t => t.category === 'wellness')
    };

    return categories;
  };

  // Get selected tasks
  const getSelectedTasks = () => {
    if (!dailyPlan) return [];
    return availableTasks.filter(task => 
      dailyPlan.selectedTaskIds.includes(task.id)
    );
  };

  // Get unscheduled tasks
  const getUnscheduledTasks = () => {
    if (!dailyPlan) return [];
    return availableTasks.filter(task => 
      dailyPlan.unscheduledTaskIds.includes(task.id)
    );
  };

  return {
    // State
    dailyPlan,
    availableTasks,
    loading: loading || tasksLoading,
    
    // Actions
    selectTask,
    deselectTask,
    assignTaskToSlot,
    removeTaskFromSlot,
    updateTaskEstimation,
    
    // Computed data
    getValidation,
    getTasksByCategory,
    getSelectedTasks,
    getUnscheduledTasks,
    
    // Utilities
    saveDailyPlan: () => dailyPlan && saveDailyPlan(dailyPlan)
  };
}