/**
 * Task Update Tools - AI can modify tasks in Supabase
 * Allows AI to set times, durations, priorities, schedule to timebox
 */

import { supabase } from '@/services/integrations/supabase/client';

export class TaskUpdateTools {
  constructor(
    private userId: string,
    private selectedDate: Date
  ) {}

  private get dateString() {
    return this.selectedDate.toISOString().split('T')[0];
  }

  /**
   * 1. Update task estimated duration
   */
  async updateTaskDuration(taskId: string, durationMinutes: number) {
    

    // Try deep work first
    const { error: deepError } = await supabase
      .from('deep_work_tasks')
      .update({ estimated_duration: durationMinutes })
      .eq('id', taskId)
      .eq('user_id', this.userId);

    if (!deepError) {
      
      return { success: true, taskId, durationMinutes };
    }

    // Try light work
    const { error: lightError } = await supabase
      .from('light_work_tasks')
      .update({ estimated_duration: durationMinutes })
      .eq('id', taskId)
      .eq('user_id', this.userId);

    if (!lightError) {
      
      return { success: true, taskId, durationMinutes };
    }

    console.error(`❌ [UPDATE] Failed to update task duration`);
    return { success: false, error: 'Task not found' };
  }

  /**
   * 2. Set task due date
   */
  async setTaskDueDate(taskId: string, dueDate: string) {
    

    // Try deep work
    const { error: deepError } = await supabase
      .from('deep_work_tasks')
      .update({ task_date: dueDate })
      .eq('id', taskId)
      .eq('user_id', this.userId);

    if (!deepError) {
      
      return { success: true, taskId, dueDate };
    }

    // Try light work
    const { error: lightError } = await supabase
      .from('light_work_tasks')
      .update({ due_date: dueDate })
      .eq('id', taskId)
      .eq('user_id', this.userId);

    if (!lightError) {
      
      return { success: true, taskId, dueDate };
    }

    return { success: false, error: 'Task not found' };
  }

  /**
   * 3. Update task priority
   */
  async updateTaskPriority(taskId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') {
    

    const { error: deepError } = await supabase
      .from('deep_work_tasks')
      .update({ priority })
      .eq('id', taskId)
      .eq('user_id', this.userId);

    if (!deepError) {
      
      return { success: true, taskId, priority };
    }

    const { error: lightError } = await supabase
      .from('light_work_tasks')
      .update({ priority })
      .eq('id', taskId)
      .eq('user_id', this.userId);

    if (!lightError) {
      
      return { success: true, taskId, priority };
    }

    return { success: false, error: 'Task not found' };
  }

  /**
   * 4. Schedule task to timebox
   */
  async scheduleTaskToTimebox(taskId: string, startTime: string, durationMinutes: number) {
    

    // Get existing timebox schedule for the day
    const { data: existingSchedule } = await supabase
      .from('day_schedules')
      .select('*')
      .eq('user_id', this.userId)
      .eq('date', this.dateString)
      .maybeSingle();

    // Build new timeblock
    const newTimeblock = {
      id: `timeblock-${Date.now()}`,
      taskId,
      startTime,
      duration: durationMinutes,
      category: 'deep-work', // Will be determined by task type
      position: startTime,
      sourceTaskIds: [taskId]
    };

    if (existingSchedule) {
      // Add to existing schedule
      const scheduleData = existingSchedule.schedule_data || [];
      scheduleData.push(newTimeblock);

      const { error } = await supabase
        .from('day_schedules')
        .update({
          schedule_data: scheduleData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSchedule.id);

      if (!error) {
        
        return { success: true, taskId, startTime, durationMinutes };
      }
    } else {
      // Create new schedule
      const { error } = await supabase
        .from('day_schedules')
        .insert({
          user_id: this.userId,
          date: this.dateString,
          schedule_data: [newTimeblock]
        });

      if (!error) {
        
        return { success: true, taskId, startTime, durationMinutes };
      }
    }

    return { success: false, error: 'Failed to schedule task' };
  }

  /**
   * 5. Bulk schedule multiple tasks
   */
  async bulkScheduleTasks(schedules: Array<{ taskId: string, startTime: string, duration: number }>) {
    

    const results = await Promise.all(
      schedules.map(s => this.scheduleTaskToTimebox(s.taskId, s.startTime, s.duration))
    );

    const successCount = results.filter(r => r.success).length;

    

    return {
      success: successCount === schedules.length,
      scheduledCount: successCount,
      totalCount: schedules.length,
      results
    };
  }

  /**
   * 6. Update subtask estimated time
   */
  async updateSubtaskTime(subtaskId: string, estimatedTime: string) {
    

    const { error: deepError } = await supabase
      .from('deep_work_subtasks')
      .update({ estimated_time: estimatedTime })
      .eq('id', subtaskId);

    if (!deepError) {
      
      return { success: true, subtaskId, estimatedTime };
    }

    const { error: lightError } = await supabase
      .from('light_work_subtasks')
      .update({ estimated_time: estimatedTime })
      .eq('id', subtaskId);

    if (!lightError) {
      
      return { success: true, subtaskId, estimatedTime };
    }

    return { success: false, error: 'Subtask not found' };
  }

  /**
   * 7. Save user energy level
   */
  async saveEnergyLevel(energyLevel: number) {
    

    // Validate input
    if (energyLevel < 1 || energyLevel > 10) {
      return { success: false, error: 'Energy level must be between 1-10' };
    }

    try {
      // Upsert to daily_health table
      const { error } = await supabase
        .from('daily_health')
        .upsert({
          user_id: this.userId,
          date: this.dateString,
          energy_level: energyLevel,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        });

      if (error) {
        console.error(`❌ [UPDATE] Failed to save energy level:`, error);
        return { success: false, error: error.message };
      }

      

      // Return with scheduling suggestions
      let suggestion = '';
      if (energyLevel >= 8) {
        suggestion = 'High energy - perfect for deep work and complex tasks';
      } else if (energyLevel >= 5) {
        suggestion = 'Moderate energy - good for medium complexity tasks';
      } else {
        suggestion = 'Low energy - focus on light work and easy wins';
      }

      return {
        success: true,
        energyLevel,
        suggestion,
        schedulingAdvice: energyLevel >= 7 ? 'schedule_hard_tasks_now' : 'schedule_light_tasks_now'
      };
    } catch (error) {
      console.error(`❌ [UPDATE] Exception saving energy level:`, error);
      return { success: false, error: 'Failed to save energy level' };
    }
  }
}
