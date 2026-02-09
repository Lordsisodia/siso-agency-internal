/**
 * List subtasks command
 */

import { CommandResult, SkillContext } from '../index';
import { listSubtasksByParent } from '../lib/supabase';

export interface ListSubtasksParams {
  parent_task_id: string;
  status?: 'pending' | 'planned' | 'executing' | 'verifying' | 'completed' | 'failed';
}

/**
 * List autonomous subtasks for a parent task
 */
export async function listSubtasks(
  params: ListSubtasksParams,
  context: SkillContext
): Promise<CommandResult> {
  try {
    if (!params.parent_task_id) {
      return { success: false, error: 'parent_task_id is required' };
    }

    const subtasks = await listSubtasksByParent(
      params.parent_task_id,
      params.status,
      context
    );

    // Summarize for display
    const summary = {
      total: subtasks.length,
      by_status: {} as Record<string, number>,
      by_role: {} as Record<string, number>
    };

    for (const subtask of subtasks) {
      summary.by_status[subtask.status] = (summary.by_status[subtask.status] || 0) + 1;
      if (subtask.assigned_agent_role) {
        summary.by_role[subtask.assigned_agent_role] = (summary.by_role[subtask.assigned_agent_role] || 0) + 1;
      }
    }

    return {
      success: true,
      data: {
        parent_task_id: params.parent_task_id,
        summary,
        subtasks: subtasks.map(s => ({
          id: s.id,
          title: s.title,
          status: s.status,
          assigned_agent_role: s.assigned_agent_role,
          priority: s.priority,
          summary: s.summary,
          started_at: s.started_at,
          completed_at: s.completed_at
        }))
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
