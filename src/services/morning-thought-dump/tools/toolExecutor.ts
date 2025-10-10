/**
 * Tool Executor - Maps GPT-5 Nano function calls to actual Supabase queries
 */

import { TaskQueryTools } from './taskQueryTools';
import { TaskUpdateTools } from './taskUpdateTools';

export class MorningThoughtDumpToolExecutor {
  private queryTools: TaskQueryTools;
  private updateTools: TaskUpdateTools;

  constructor(userId: string, selectedDate: Date) {
    this.queryTools = new TaskQueryTools(userId, selectedDate);
    this.updateTools = new TaskUpdateTools(userId, selectedDate);
  }

  /**
   * Execute any tool by name
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    console.log(`🔧 [EXECUTOR] Running: ${toolName}`, args);

    switch (toolName) {
      case 'get_todays_tasks':
        return await this.queryTools.getTodaysTasks(args?.includeCompleted || false);

      case 'get_task_by_title':
        return await this.queryTools.getTaskByTitle(args.titleQuery);

      case 'get_urgent_tasks':
        return await this.queryTools.getUrgentTasks();

      case 'get_deep_work_tasks_only':
        return await this.queryTools.getDeepWorkTasksOnly();

      case 'get_light_work_tasks_only':
        return await this.queryTools.getLightWorkTasksOnly();

      case 'get_task_subtasks':
        return await this.queryTools.getTaskSubtasks(args.taskId);

      case 'get_tasks_by_time':
        return await this.queryTools.getTasksByTimeConstraint(args.maxMinutes);

      case 'search_tasks':
        return await this.queryTools.searchTasksByKeyword(args.keyword);

      // UPDATE TOOLS
      case 'update_task_duration':
        return await this.updateTools.updateTaskDuration(args.taskId, args.durationMinutes);

      case 'set_task_due_date':
        return await this.updateTools.setTaskDueDate(args.taskId, args.dueDate);

      case 'update_task_priority':
        return await this.updateTools.updateTaskPriority(args.taskId, args.priority);

      case 'schedule_task_to_timebox':
        return await this.updateTools.scheduleTaskToTimebox(args.taskId, args.startTime, args.durationMinutes);

      case 'bulk_schedule_tasks':
        return await this.updateTools.bulkScheduleTasks(args.schedules);

      case 'update_subtask_time':
        return await this.updateTools.updateSubtaskTime(args.subtaskId, args.estimatedTime);

      default:
        console.error(`❌ [EXECUTOR] Unknown tool: ${toolName}`);
        return { error: `Unknown tool: ${toolName}` };
    }
  }
}
