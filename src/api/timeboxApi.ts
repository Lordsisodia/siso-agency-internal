/**
 * TimeBox API - Functional time allocation system for LifeLock tasks
 * Connects TimeBox interface with real light work and deep work tasks
 */

import { hybridLifelockApi } from './hybridLifelockApi';
import { format, addMinutes, parseISO, startOfDay, endOfDay, isSameDay } from 'date-fns';

// TimeBox data types
export interface TimeSlot {
  id: string;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  duration: number;  // minutes
  date: string;      // "2025-01-09"
}

export interface TimeBoxTask {
  id: string;
  title: string;
  description?: string;
  taskType: 'light_work' | 'deep_work' | 'break' | 'meeting' | 'focus_block';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedDuration: number; // minutes
  actualDuration?: number;   // minutes when completed
  completed: boolean;
  xpReward: number;
  
  // TimeBox specific fields
  scheduledSlot?: TimeSlot;
  isScheduled: boolean;
  
  // Tracking fields
  startedAt?: string;
  completedAt?: string;
  isActive: boolean; // currently running timer
  
  // Original task data
  originalTaskId: string;
  originalTaskType: 'light' | 'deep';
}

export interface DaySchedule {
  date: string;
  timeSlots: TimeSlot[];
  scheduledTasks: TimeBoxTask[];
  unscheduledTasks: TimeBoxTask[];
  totalScheduledMinutes: number;
  totalAvailableMinutes: number;
  productivityScore: number;
}

export interface TimeBoxStats {
  tasksCompleted: number;
  totalScheduledTasks: number;
  totalFocusTime: number; // minutes
  averageTaskDuration: number;
  completionRate: number;
  xpEarned: number;
  mostProductiveHour: string;
  timeBoxingStreak: number;
}

class TimeBoxApi {
  private activeTimers: Map<string, { startTime: Date; taskId: string }> = new Map();
  private timeSlotDuration = 30; // Default 30-minute slots

  // ===== TASK INTEGRATION =====
  
  async getTasksForTimeBox(date?: string): Promise<TimeBoxTask[]> {
    const targetDate = date || format(new Date(), 'yyyy-MM-dd');
    
    try {
      // Get tasks from both light work and deep work
      const { lightWork, deepWork } = await hybridLifelockApi.getAllTasksForDate(targetDate);
      
      // Convert to TimeBox format
      const timeBoxTasks: TimeBoxTask[] = [];
      
      // Process light work tasks
      lightWork.forEach(task => {
        timeBoxTasks.push({
          id: `timebox-light-${task.id}`,
          title: task.title,
          description: task.description,
          taskType: 'light_work',
          priority: task.priority as 'LOW' | 'MEDIUM' | 'HIGH',
          estimatedDuration: task.estimated_duration || 30,
          actualDuration: task.actual_duration_min,
          completed: task.completed,
          xpReward: task.xp_reward || 10,
          isScheduled: false,
          isActive: false,
          originalTaskId: task.id,
          originalTaskType: 'light',
          startedAt: task.started_at,
          completedAt: task.completed_at
        });
      });
      
      // Process deep work tasks
      deepWork.forEach(task => {
        timeBoxTasks.push({
          id: `timebox-deep-${task.id}`,
          title: task.title,
          description: task.description,
          taskType: 'deep_work',
          priority: task.priority as 'LOW' | 'MEDIUM' | 'HIGH',
          estimatedDuration: task.estimated_duration || 60,
          actualDuration: task.actual_duration_min,
          completed: task.completed,
          xpReward: task.xp_reward || 20,
          isScheduled: false,
          isActive: false,
          originalTaskId: task.id,
          originalTaskType: 'deep',
          startedAt: task.started_at,
          completedAt: task.completed_at
        });
      });
      
      return timeBoxTasks;
    } catch (error) {
      console.error('Failed to load tasks for TimeBox:', error);
      return [];
    }
  }

  // ===== TIME SLOT MANAGEMENT =====
  
  generateTimeSlots(date: string, startHour = 6, endHour = 22): TimeSlot[] {
    const slots: TimeSlot[] = [];
    let currentMinutes = startHour * 60; // Start at 6 AM
    const endMinutes = endHour * 60; // End at 10 PM
    
    while (currentMinutes < endMinutes) {
      const startTime = this.minutesToTimeString(currentMinutes);
      const endTime = this.minutesToTimeString(currentMinutes + this.timeSlotDuration);
      
      slots.push({
        id: `slot-${date}-${startTime}`,
        startTime,
        endTime,
        duration: this.timeSlotDuration,
        date
      });
      
      currentMinutes += this.timeSlotDuration;
    }
    
    return slots;
  }
  
  private minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // ===== TASK SCHEDULING =====
  
  async scheduleTask(taskId: string, timeSlot: TimeSlot): Promise<void> {
    try {
      // Store scheduling in local storage for now
      // In production, this would sync to Supabase
      const scheduleKey = `schedule-${timeSlot.date}`;
      const existingSchedule = JSON.parse(localStorage.getItem(scheduleKey) || '{}');
      
      if (!existingSchedule.scheduledTasks) {
        existingSchedule.scheduledTasks = [];
      }
      
      // Remove any existing schedule for this task
      existingSchedule.scheduledTasks = existingSchedule.scheduledTasks.filter(
        (scheduled: any) => scheduled.taskId !== taskId
      );
      
      // Add new schedule
      existingSchedule.scheduledTasks.push({
        taskId,
        timeSlot,
        scheduledAt: new Date().toISOString()
      });
      
      localStorage.setItem(scheduleKey, JSON.stringify(existingSchedule));
      
      console.log(`📅 Scheduled task ${taskId} for ${timeSlot.startTime}-${timeSlot.endTime}`);
    } catch (error) {
      console.error('Failed to schedule task:', error);
      throw error;
    }
  }
  
  async unscheduleTask(taskId: string, date: string): Promise<void> {
    try {
      const scheduleKey = `schedule-${date}`;
      const existingSchedule = JSON.parse(localStorage.getItem(scheduleKey) || '{}');
      
      if (existingSchedule.scheduledTasks) {
        existingSchedule.scheduledTasks = existingSchedule.scheduledTasks.filter(
          (scheduled: any) => scheduled.taskId !== taskId
        );
        localStorage.setItem(scheduleKey, JSON.stringify(existingSchedule));
      }
      
      console.log(`🗑️ Unscheduled task ${taskId}`);
    } catch (error) {
      console.error('Failed to unschedule task:', error);
      throw error;
    }
  }

  // ===== DAY SCHEDULE GENERATION =====
  
  async getDaySchedule(date?: string): Promise<DaySchedule> {
    const targetDate = date || format(new Date(), 'yyyy-MM-dd');
    
    try {
      // Get all tasks for the day
      const allTasks = await this.getTasksForTimeBox(targetDate);
      
      // Generate time slots
      const timeSlots = this.generateTimeSlots(targetDate);
      
      // Get scheduled tasks from storage
      const scheduleKey = `schedule-${targetDate}`;
      const savedSchedule = JSON.parse(localStorage.getItem(scheduleKey) || '{}');
      const scheduledTaskIds = savedSchedule.scheduledTasks || [];
      
      // Apply schedules to tasks
      const scheduledTasks: TimeBoxTask[] = [];
      const unscheduledTasks: TimeBoxTask[] = [];
      
      allTasks.forEach(task => {
        const schedule = scheduledTaskIds.find((s: any) => s.taskId === task.id);
        if (schedule) {
          task.scheduledSlot = schedule.timeSlot;
          task.isScheduled = true;
          scheduledTasks.push(task);
        } else {
          unscheduledTasks.push(task);
        }
      });
      
      // Calculate stats
      const totalScheduledMinutes = scheduledTasks.reduce(
        (sum, task) => sum + (task.scheduledSlot?.duration || 0), 0
      );
      const totalAvailableMinutes = timeSlots.length * this.timeSlotDuration;
      const completedTasks = scheduledTasks.filter(t => t.completed).length;
      const productivityScore = scheduledTasks.length > 0 
        ? (completedTasks / scheduledTasks.length) * 100 
        : 0;
      
      return {
        date: targetDate,
        timeSlots,
        scheduledTasks,
        unscheduledTasks,
        totalScheduledMinutes,
        totalAvailableMinutes,
        productivityScore
      };
    } catch (error) {
      console.error('Failed to generate day schedule:', error);
      throw error;
    }
  }

  // ===== TIMER FUNCTIONALITY =====
  
  startTimer(taskId: string): void {
    if (this.activeTimers.has(taskId)) {
      console.warn(`Timer already running for task ${taskId}`);
      return;
    }
    
    this.activeTimers.set(taskId, {
      startTime: new Date(),
      taskId
    });
    
    console.log(`⏱️ Started timer for task ${taskId}`);
    
    // Store in localStorage for persistence
    localStorage.setItem(`timer-${taskId}`, JSON.stringify({
      startTime: new Date().toISOString(),
      taskId
    }));
  }
  
  stopTimer(taskId: string): number {
    const timer = this.activeTimers.get(taskId);
    if (!timer) {
      console.warn(`No active timer for task ${taskId}`);
      return 0;
    }
    
    const duration = Math.floor((Date.now() - timer.startTime.getTime()) / (1000 * 60));
    this.activeTimers.delete(taskId);
    
    // Remove from localStorage
    localStorage.removeItem(`timer-${taskId}`);
    
    console.log(`⏹️ Stopped timer for task ${taskId}. Duration: ${duration} minutes`);
    return duration;
  }
  
  getActiveTimer(taskId: string): { duration: number; isActive: boolean } {
    const timer = this.activeTimers.get(taskId);
    if (!timer) {
      return { duration: 0, isActive: false };
    }
    
    const duration = Math.floor((Date.now() - timer.startTime.getTime()) / (1000 * 60));
    return { duration, isActive: true };
  }

  // ===== ANALYTICS =====
  
  async getTimeBoxStats(date?: string): Promise<TimeBoxStats> {
    const schedule = await this.getDaySchedule(date);
    
    const tasksCompleted = schedule.scheduledTasks.filter(t => t.completed).length;
    const totalScheduledTasks = schedule.scheduledTasks.length;
    const totalFocusTime = schedule.scheduledTasks
      .filter(t => t.completed)
      .reduce((sum, t) => sum + (t.actualDuration || t.estimatedDuration), 0);
    
    const completedTasks = schedule.scheduledTasks.filter(t => t.completed);
    const averageTaskDuration = completedTasks.length > 0
      ? completedTasks.reduce((sum, t) => sum + (t.actualDuration || t.estimatedDuration), 0) / completedTasks.length
      : 0;
    
    const completionRate = totalScheduledTasks > 0 ? (tasksCompleted / totalScheduledTasks) * 100 : 0;
    const xpEarned = completedTasks.reduce((sum, t) => sum + t.xpReward, 0);
    
    // Find most productive hour (placeholder logic)
    const mostProductiveHour = "09:00"; // Would analyze actual completion patterns
    
    return {
      tasksCompleted,
      totalScheduledTasks,
      totalFocusTime,
      averageTaskDuration,
      completionRate,
      xpEarned,
      mostProductiveHour,
      timeBoxingStreak: 1 // Would track daily streaks
    };
  }

  // ===== AUTO-SCHEDULING =====
  
  async autoScheduleTasks(date?: string): Promise<DaySchedule> {
    const schedule = await this.getDaySchedule(date);
    const { unscheduledTasks } = schedule;
    
    // Simple auto-scheduling algorithm
    // 1. Sort by priority and estimated duration
    const sortedTasks = unscheduledTasks.sort((a, b) => {
      const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // If same priority, schedule shorter tasks first
      return a.estimatedDuration - b.estimatedDuration;
    });
    
    // 2. Find available time slots
    const availableSlots = schedule.timeSlots.filter(slot => {
      return !schedule.scheduledTasks.some(task => 
        task.scheduledSlot && task.scheduledSlot.id === slot.id
      );
    });
    
    // 3. Schedule tasks into available slots
    let slotIndex = 0;
    for (const task of sortedTasks) {
      if (slotIndex >= availableSlots.length) break;
      
      const requiredSlots = Math.ceil(task.estimatedDuration / this.timeSlotDuration);
      
      // Check if we have enough consecutive slots
      if (slotIndex + requiredSlots <= availableSlots.length) {
        const timeSlot = availableSlots[slotIndex];
        await this.scheduleTask(task.id, timeSlot);
        slotIndex += requiredSlots;
      }
    }
    
    // Return updated schedule
    return await this.getDaySchedule(date);
  }

  // ===== TASK COMPLETION =====
  
  async completeTask(taskId: string, actualDuration?: number): Promise<void> {
    try {
      // Extract original task info
      const isLightWork = taskId.includes('light');
      const originalTaskId = taskId.replace('timebox-light-', '').replace('timebox-deep-', '');
      
      // Update via hybrid API
      await hybridLifelockApi.toggleTaskCompletion(originalTaskId, isLightWork ? 'light' : 'deep');
      
      // Stop any active timer
      if (actualDuration === undefined) {
        actualDuration = this.stopTimer(taskId);
      }
      
      console.log(`✅ Completed TimeBox task ${taskId} in ${actualDuration} minutes`);
    } catch (error) {
      console.error('Failed to complete task:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const timeboxApi = new TimeBoxApi();

// Export types
export type {
  TimeSlot,
  TimeBoxTask,
  DaySchedule,
  TimeBoxStats
};