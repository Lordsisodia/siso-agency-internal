import { supabase } from '@/services/integrations/supabase/client';
import { format, addMinutes, parseISO } from 'date-fns';

// Types matching the UI expectations
export interface TimeBoxTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'light_work' | 'deep_work' | 'admin' | 'learning' | 'planning';
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  scheduledStartTime?: Date;
  scheduledEndTime?: Date;
  tags?: string[];
  parentTaskId?: string;
  subtasks?: TimeBoxSubtask[];
  visibleSubtaskIds?: string[];
  metadata?: Record<string, any> | null;
}

export interface TimeBoxSubtask {
  id: string;
  title: string;
  status?: string;
  completed: boolean;
}

export interface TimeSlot {
  id: string;
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  duration: number;  // in minutes
  task?: TimeBoxTask;
  isFixed?: boolean; // for non-moveable appointments
}

export interface DaySchedule {
  date: string; // "2025-09-25"
  timeSlots: TimeSlot[];
  totalScheduledMinutes: number;
  unscheduledTasks: TimeBoxTask[];
}

export interface TimeBoxStats {
  totalTasks: number;
  completedTasks: number;
  totalScheduledTime: number;
  totalActualTime: number;
  completionRate: number;
  averageTaskDuration: number;
}

// In-memory timer tracking (for session persistence)
const activeTimers: Map<string, { startTime: Date; taskId: string }> = new Map();

class TimeBoxApi {
  // Generate time slots for a day (9 AM to 6 PM by default)
  generateTimeSlots(startHour: number = 9, endHour: number = 18, slotDuration: number = 60): TimeSlot[] {
    const slots: TimeSlot[] = [];
    
    for (let hour = startHour; hour < endHour; hour += slotDuration / 60) {
      const wholeHour = Math.floor(hour);
      const minutes = (hour % 1) * 60;
      const startTime = `${wholeHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const endHour = hour + slotDuration / 60;
      const endWholeHour = Math.floor(endHour);
      const endMinutes = (endHour % 1) * 60;
      const endTime = `${endWholeHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      
      slots.push({
        id: `slot-${startTime}`,
        startTime,
        endTime,
        duration: slotDuration
      });
    }
    
    return slots;
  }

  // Get all tasks for timebox from existing tasks table
  async getTasksForTimeBox(date: string): Promise<TimeBoxTask[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Return empty array for non-authenticated users instead of throwing
        return [];
      }

      // Get all tasks from the main tasks table
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          subtasks:tasks!parent_task_id(
            id,
            title,
            status
          )
        `)
        .is('parent_task_id', null);

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      if (!tasks) return [];

      // Convert to TimeBoxTask format
      const timeBoxTasks: TimeBoxTask[] = tasks.map(task => {
        const rawMetadata = (task.metadata && typeof task.metadata === 'object') ? task.metadata : {};
        const visibleSubtasks = Array.isArray(rawMetadata?.timebox_visible_subtasks)
          ? rawMetadata.timebox_visible_subtasks
          : [];

        const subtasks: TimeBoxSubtask[] = Array.isArray(task.subtasks)
          ? task.subtasks.map((subtask: any) => ({
              id: subtask.id,
              title: subtask.title,
              status: subtask.status,
              completed:
                subtask.status === 'completed' ||
                subtask.status === 'done' ||
                subtask.completed === true,
            }))
          : [];

        return {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          category: task.category || 'light_work',
          estimatedDuration: task.estimated_duration_minutes || 30,
          actualDuration: task.actual_duration_minutes,
          scheduledStartTime: task.scheduled_start_time ? new Date(task.scheduled_start_time) : undefined,
          scheduledEndTime: task.scheduled_end_time ? new Date(task.scheduled_end_time) : undefined,
          tags: task.tags || [],
          parentTaskId: task.parent_task_id,
          subtasks,
          visibleSubtaskIds: visibleSubtasks,
          metadata: rawMetadata,
        };
      });

      return timeBoxTasks;
    } catch (error) {
      console.error('Error fetching tasks for timebox:', error);
      return [];
    }
  }

  // Get day schedule with tasks in time slots
  async getDaySchedule(date: string): Promise<DaySchedule> {
    try {
      const tasks = await this.getTasksForTimeBox(date);
      const timeSlots = this.generateTimeSlots();
      
      // Fill time slots with scheduled tasks
      const filledSlots = timeSlots.map(slot => {
        const scheduledTask = tasks.find(task => {
          if (!task.scheduledStartTime) return false;
          const taskStartTime = format(task.scheduledStartTime, 'HH:mm');
          return taskStartTime === slot.startTime;
        });
        
        return {
          ...slot,
          task: scheduledTask
        };
      });

      // Get unscheduled tasks
      const unscheduledTasks = tasks.filter(task => !task.scheduledStartTime);
      
      // Calculate total scheduled time
      const totalScheduledMinutes = filledSlots
        .filter(slot => slot.task)
        .reduce((total, slot) => total + slot.duration, 0);

      return {
        date,
        timeSlots: filledSlots,
        totalScheduledMinutes,
        unscheduledTasks
      };
    } catch (error) {
      console.error('Error getting day schedule:', error);
      return {
        date,
        timeSlots: this.generateTimeSlots(),
        totalScheduledMinutes: 0,
        unscheduledTasks: []
      };
    }
  }

  // Schedule a task to a specific time slot (update tasks table)
  async scheduleTask(taskId: string, slot: TimeSlot): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated for scheduling');
        return;
      }

      // Parse slot time to create proper datetime
      const today = new Date();
      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const scheduledStart = new Date(today);
      scheduledStart.setHours(startHour, startMinute, 0, 0);
      
      const scheduledEnd = addMinutes(scheduledStart, slot.duration);

      // Update the task in the main tasks table
      const { error } = await supabase
        .from('tasks')
        .update({
          scheduled_start_time: scheduledStart.toISOString(),
          scheduled_end_time: scheduledEnd.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error scheduling task:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error scheduling task:', error);
    }
  }

  // Unschedule a task
  async unscheduleTask(taskId: string, date: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated for unscheduling');
        return;
      }

      // Update the task in the main tasks table
      const { error } = await supabase
        .from('tasks')
        .update({
          scheduled_start_time: null,
          scheduled_end_time: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error unscheduling task:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error unscheduling task:', error);
    }
  }

  async updateTaskVisibleSubtasks(
    taskId: string,
    visibleSubtaskIds: string[],
    existingMetadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      const nextMetadata = {
        ...existingMetadata,
        timebox_visible_subtasks: visibleSubtaskIds,
      };

      const { error } = await supabase
        .from('tasks')
        .update({
          metadata: nextMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating timebox subtask visibility:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating visible subtasks:', error);
      throw error;
    }
  }

  // Start timer for a task
  startTimer(taskId: string): void {
    activeTimers.set(taskId, {
      startTime: new Date(),
      taskId
    });
  }

  // Stop timer and return duration
  stopTimer(taskId: string): number {
    const timer = activeTimers.get(taskId);
    if (!timer) return 0;
    
    const duration = Math.floor((new Date().getTime() - timer.startTime.getTime()) / 1000 / 60);
    activeTimers.delete(taskId);
    
    return duration;
  }

  // Get active timer info
  getActiveTimer(taskId: string): { isActive: boolean; duration: number; startTime?: Date } {
    const timer = activeTimers.get(taskId);
    if (!timer) return { isActive: false, duration: 0 };
    
    const duration = Math.floor((new Date().getTime() - timer.startTime.getTime()) / 1000 / 60);
    return {
      isActive: true,
      duration,
      startTime: timer.startTime
    };
  }

  // Complete a task
  async completeTask(taskId: string, actualDuration?: number): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated for completing task');
        return;
      }

      // Update the task in the main tasks table
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          actual_duration_minutes: actualDuration,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error completing task:', error);
        throw error;
      }

      // Stop any active timer
      activeTimers.delete(taskId);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  }

  // Auto-schedule tasks based on priority and duration
  async autoScheduleTasks(date?: string): Promise<DaySchedule> {
    try {
      const targetDate = date || format(new Date(), 'yyyy-MM-dd');
      const tasks = await this.getTasksForTimeBox(targetDate);
      const unscheduledTasks = tasks.filter(task => !task.scheduledStartTime);
      
      // Sort by priority and category (deep work = high priority)
      const sortedTasks = unscheduledTasks.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        
        // Deep work tasks get slight priority boost
        const aBoost = a.category === 'deep_work' ? 0.5 : 0;
        const bBoost = b.category === 'deep_work' ? 0.5 : 0;
        
        return (bPriority + bBoost) - (aPriority + aBoost);
      });

      // Get available time slots
      const schedule = await this.getDaySchedule(targetDate);
      const availableSlots = schedule.timeSlots.filter(slot => !slot.task);

      // Auto-assign tasks to slots
      for (let i = 0; i < Math.min(sortedTasks.length, availableSlots.length); i++) {
        await this.scheduleTask(sortedTasks[i].id, availableSlots[i]);
      }

      // Return updated schedule
      return await this.getDaySchedule(targetDate);
    } catch (error) {
      console.error('Error auto-scheduling tasks:', error);
      throw error;
    }
  }

  // Get statistics for timebox
  async getTimeBoxStats(date: string): Promise<TimeBoxStats> {
    try {
      const tasks = await this.getTasksForTimeBox(date);
      const completedTasks = tasks.filter(task => task.status === 'completed');
      
      const totalScheduledTime = tasks
        .filter(task => task.estimatedDuration)
        .reduce((total, task) => total + task.estimatedDuration, 0);
      
      const totalActualTime = completedTasks
        .filter(task => task.actualDuration)
        .reduce((total, task) => total + (task.actualDuration || 0), 0);
      
      const completionRate = tasks.length > 0 ? completedTasks.length / tasks.length : 0;
      
      const averageTaskDuration = completedTasks.length > 0 
        ? totalActualTime / completedTasks.length 
        : 0;

      return {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        totalScheduledTime,
        totalActualTime,
        completionRate,
        averageTaskDuration
      };
    } catch (error) {
      console.error('Error getting timebox stats:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        totalScheduledTime: 0,
        totalActualTime: 0,
        completionRate: 0,
        averageTaskDuration: 0
      };
    }
  }

  // Create a new task (add to main tasks table)
  async createTask(title: string, options: {
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: 'light_work' | 'deep_work' | 'admin' | 'learning' | 'planning';
    estimatedDuration?: number;
    tags?: string[];
  } = {}): Promise<TimeBoxTask> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          title: title,
          description: options.description,
          status: 'pending',
          priority: options.priority || 'medium',
          category: options.category || 'light_work',
          estimated_duration_minutes: options.estimatedDuration || (options.category === 'deep_work' ? 90 : 30),
          tags: options.tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        category: task.category,
        estimatedDuration: task.estimated_duration_minutes,
        tags: task.tags || []
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const timeboxApi = new TimeBoxApi();