/**
 * Get subtask context command
 */

import { CommandResult, SkillContext } from '../index';
import { getSubtask } from '../lib/supabase';

export interface GetContextParams {
  subtask_id: string;
}

/**
 * Get full context for a subtask including agent_metadata
 */
export async function getContext(
  params: GetContextParams,
  context: SkillContext
): Promise<CommandResult> {
  try {
    if (!params.subtask_id) {
      return { success: false, error: 'subtask_id is required' };
    }

    const subtask = await getSubtask(params.subtask_id, context);
    if (!subtask) {
      return { success: false, error: `Subtask ${params.subtask_id} not found` };
    }

    // Calculate duration if started
    let duration_min = null;
    if (subtask.started_at && subtask.completed_at) {
      const start = new Date(subtask.started_at);
      const end = new Date(subtask.completed_at);
      duration_min = Math.round((end.getTime() - start.getTime()) / 60000);
    }

    return {
      success: true,
      data: {
        subtask: {
          id: subtask.id,
          parent_task_id: subtask.parent_task_id,
          title: subtask.title,
          description: subtask.description,
          status: subtask.status,
          priority: subtask.priority,
          summary: subtask.summary,
          assigned_agent_role: subtask.assigned_agent_role,
          created_by_agent_id: subtask.created_by_agent_id,
          started_at: subtask.started_at,
          completed_at: subtask.completed_at,
          duration_min,
          estimated_duration_min: subtask.estimated_duration_min,
          verification_required: subtask.verification_required,
          verified_by_agent_id: subtask.verified_by_agent_id,
          verification_notes: subtask.verification_notes,
          created_at: subtask.created_at,
          updated_at: subtask.updated_at
        },
        // Full agent metadata (agents can see everything)
        agent_metadata: subtask.agent_metadata
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
