/**
 * Task Update Tools - AI can modify tasks in Supabase
 * Allows AI to set times, durations, priorities, schedule to timebox
 */

import { supabase } from '@/integrations/supabase/client';

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
    console.log(`🔧 [UPDATE] Setting task ${taskId} duration to ${durationMinutes} min`);

    // Try deep work first
    const { error: deepError } = await supabase
      .from('deep_work_tasks')
      .update({ estimated_duration: durationMinutes })
      .eq('id', taskId)
      .eq('user_id', this.userId);

    if (!deepError) {
      console.log(`✅ [UPDATE] Updated deep work task duration`);
      return { success: true, taskId, durationMinutes };
    }

    // Try light work
    const { error: lightError } = await supabase
      .from('light_work_tasks')
      .update({ estimated_duration: durationMinutes })
      .eq('id', taskId)
      .eq('user_id', this.userId);

    if (!lightError) {
      console.log(`✅ [UPDATE] Updated light work task duration`);
      return { success: true, taskId, durationMinutes };
    }

    console.error(`❌ [UPDATE] Failed to update task duration`);
    return { success: false, error: 'Task not found' };
  }

  /**
   * 2. Set task due date
   */
  async setTaskDueDate(taskId: string, dueDate: string) {
    console.log(`🔧 [UPDATE] Setting task ${taskId} due date to ${dueDate}`);

    // Try deep work
    const { error: deepError } = await supabase
      .from('deep_work_tasks')
      .update({ task_date: dueDate })
      .eq('id', taskId)
      .eq('user_id', this.userId);

    if (!deepError) {
      console.log(`✅ [UPDATE] Updated deep work task due date`);
      return { success: true, taskId, dueDate };
    }

    // Try light work
    const { error: lightError } = await supabase
      .from('light_work_tasks')
      .update({ due_date: dueDate })
      .eq('id', taskId)
      .eq('user_id', this.userId);

    if (!lightError) {
      console.log(`✅ [UPDATE] Updated light work task due date`);
      return { success: true, taskId, dueDate };
    }

    return { success: false, error: 'Task not found' };
  }

  /**
   * 3. Update task priority
   */
  async updateTaskPriority(taskId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') {
    console.log(`🔧 [UPDATE] Setting task ${taskId} priority to ${priority}`);

    const { error: deepError } = await supabase
      .from('deep_work_tasks')
      .update({ priority })
      .eq('id', taskId)
      .eq('user_id', this.userId);

    if (!deepError) {
      console.log(`✅ [UPDATE] Updated task priority`);
      return { success: true, taskId, priority };
    }

    const { error: lightError } = await supabase
      .from('light_work_tasks')
      .update({ priority })
      .eq('id', taskId)
      .eq('user_id', this.userId);

    if (!lightError) {
      console.log(`✅ [UPDATE] Updated task priority`);
      return { success: true, taskId, priority };
    }

    return { success: false, error: 'Task not found' };
  }

  /**
   * 4. Schedule task to timebox
   */
  async scheduleTaskToTimebox(taskId: string, startTime: string, durationMinutes: number) {
    console.log(`🔧 [UPDATE] Scheduling task ${taskId} at ${startTime} for ${durationMinutes} min`);

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
        console.log(`✅ [UPDATE] Added task to existing timebox`);
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
        console.log(`✅ [UPDATE] Created new timebox schedule`);
        return { success: true, taskId, startTime, durationMinutes };
      }
    }

    return { success: false, error: 'Failed to schedule task' };
  }

  /**
   * 5. Bulk schedule multiple tasks
   */
  async bulkScheduleTasks(schedules: Array<{ taskId: string, startTime: string, duration: number }>) {
    console.log(`🔧 [UPDATE] Bulk scheduling ${schedules.length} tasks`);

    const results = await Promise.all(
      schedules.map(s => this.scheduleTaskToTimebox(s.taskId, s.startTime, s.duration))
    );

    const successCount = results.filter(r => r.success).length;

    console.log(`✅ [UPDATE] Scheduled ${successCount}/${schedules.length} tasks`);

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
    console.log(`🔧 [UPDATE] Setting subtask ${subtaskId} time to ${estimatedTime}`);

    const { error: deepError } = await supabase
      .from('deep_work_subtasks')
      .update({ estimated_time: estimatedTime })
      .eq('id', subtaskId);

    if (!deepError) {
      console.log(`✅ [UPDATE] Updated deep work subtask time`);
      return { success: true, subtaskId, estimatedTime };
    }

    const { error: lightError } = await supabase
      .from('light_work_subtasks')
      .update({ estimated_time: estimatedTime })
      .eq('id', subtaskId);

    if (!lightError) {
      console.log(`✅ [UPDATE] Updated light work subtask time`);
      return { success: true, subtaskId, estimatedTime };
    }

    return { success: false, error: 'Subtask not found' };
  }
}
