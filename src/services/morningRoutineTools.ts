/**
 * Morning Routine AI Tools - Function Calling for GPT-5 Nano
 * Gives AI ability to query Supabase for task context
 */

import { supabase } from '@/integrations/supabase/client';

export interface TaskQueryResult {
  deepWorkTasks: any[];
  lightWorkTasks: any[];
  totalTasks: number;
}

/**
 * Tool Definitions - What AI can call
 */
export const MORNING_ROUTINE_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'get_todays_tasks',
      description: 'Fetch all deep work and light work tasks for today, including subtasks. Use this when user asks what they need to do or when you need task context.',
      parameters: {
        type: 'object',
        properties: {
          includeCompleted: {
            type: 'boolean',
            description: 'Whether to include completed tasks (default: false)'
          }
        }
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_task_details',
      description: 'Get full details for a specific task including all subtasks. Use when user asks about a specific task.',
      parameters: {
        type: 'object',
        properties: {
          taskId: {
            type: 'string',
            description: 'The ID or title of the task to get details for'
          }
        },
        required: ['taskId']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_tasks_by_priority',
      description: 'Search tasks filtered by priority level',
      parameters: {
        type: 'object',
        properties: {
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            description: 'Priority level to filter by'
          }
        },
        required: ['priority']
      }
    }
  }
];

/**
 * Tool Executor - Actually runs the functions
 */
export class MorningRoutineToolExecutor {
  constructor(
    private userId: string,
    private selectedDate: Date
  ) {}

  /**
   * Execute a tool call from GPT-5 Nano
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    console.log(`🔧 [TOOL] Executing: ${toolName}`, args);

    switch (toolName) {
      case 'get_todays_tasks':
        return await this.getTodaysTasks(args.includeCompleted);

      case 'get_task_details':
        return await this.getTaskDetails(args.taskId);

      case 'search_tasks_by_priority':
        return await this.searchTasksByPriority(args.priority);

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * Fetch all tasks for today
   */
  private async getTodaysTasks(includeCompleted = false): Promise<TaskQueryResult> {
    const dateString = this.selectedDate.toISOString().split('T')[0];

    try {
      // Fetch deep work tasks
      let deepQuery = supabase
        .from('deep_work_tasks')
        .select(`
          *,
          subtasks:deep_work_subtasks(*)
        `)
        .eq('userId', this.userId)
        .eq('currentDate', dateString);

      if (!includeCompleted) {
        deepQuery = deepQuery.eq('completed', false);
      }

      const { data: deepTasks } = await deepQuery;

      // Fetch light work tasks
      let lightQuery = supabase
        .from('light_work_tasks')
        .select(`
          *,
          subtasks:light_work_subtasks(*)
        `)
        .eq('userId', this.userId)
        .eq('currentDate', dateString);

      if (!includeCompleted) {
        lightQuery = lightQuery.eq('completed', false);
      }

      const { data: lightTasks } = await lightQuery;

      console.log(`✅ [TOOL] Fetched ${deepTasks?.length || 0} deep + ${lightTasks?.length || 0} light tasks`);

      return {
        deepWorkTasks: deepTasks || [],
        lightWorkTasks: lightTasks || [],
        totalTasks: (deepTasks?.length || 0) + (lightTasks?.length || 0)
      };

    } catch (error) {
      console.error('❌ [TOOL] Error fetching tasks:', error);
      return { deepWorkTasks: [], lightWorkTasks: [], totalTasks: 0 };
    }
  }

  /**
   * Get details for specific task
   */
  private async getTaskDetails(taskIdOrTitle: string): Promise<any> {
    try {
      // Try deep work first
      const { data: deepTask } = await supabase
        .from('deep_work_tasks')
        .select('*, subtasks:deep_work_subtasks(*)')
        .or(`id.eq.${taskIdOrTitle},title.ilike.%${taskIdOrTitle}%`)
        .eq('userId', this.userId)
        .limit(1)
        .single();

      if (deepTask) {
        console.log(`✅ [TOOL] Found deep work task: ${deepTask.title}`);
        return { ...deepTask, workType: 'deep' };
      }

      // Try light work
      const { data: lightTask } = await supabase
        .from('light_work_tasks')
        .select('*, subtasks:light_work_subtasks(*)')
        .or(`id.eq.${taskIdOrTitle},title.ilike.%${taskIdOrTitle}%`)
        .eq('userId', this.userId)
        .limit(1)
        .single();

      if (lightTask) {
        console.log(`✅ [TOOL] Found light work task: ${lightTask.title}`);
        return { ...lightTask, workType: 'light' };
      }

      return { error: 'Task not found' };

    } catch (error) {
      console.error('❌ [TOOL] Error fetching task details:', error);
      return { error: 'Failed to fetch task' };
    }
  }

  /**
   * Search tasks by priority
   */
  private async searchTasksByPriority(priority: string): Promise<any> {
    const dateString = this.selectedDate.toISOString().split('T')[0];

    try {
      const { data: deepTasks } = await supabase
        .from('deep_work_tasks')
        .select('*, subtasks:deep_work_subtasks(*)')
        .eq('userId', this.userId)
        .eq('currentDate', dateString)
        .eq('priority', priority)
        .eq('completed', false);

      const { data: lightTasks } = await supabase
        .from('light_work_tasks')
        .select('*, subtasks:light_work_subtasks(*)')
        .eq('userId', this.userId)
        .eq('currentDate', dateString)
        .eq('priority', priority)
        .eq('completed', false);

      console.log(`✅ [TOOL] Found ${deepTasks?.length || 0} deep + ${lightTasks?.length || 0} light tasks with ${priority} priority`);

      return {
        deepWorkTasks: deepTasks || [],
        lightWorkTasks: lightTasks || [],
        matchingTasks: (deepTasks?.length || 0) + (lightTasks?.length || 0)
      };

    } catch (error) {
      console.error('❌ [TOOL] Error searching tasks:', error);
      return { deepWorkTasks: [], lightWorkTasks: [], matchingTasks: 0 };
    }
  }
}

export { MorningRoutineToolExecutor };
