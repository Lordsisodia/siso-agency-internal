/**
 * Create autonomous subtask command
 */

import { CommandResult, SkillContext } from '../index';
import { insertSubtask, AutonomousSubtask } from '../lib/supabase';

export interface CreateSubtaskParams {
  parent_task_id: string;
  title: string;
  description?: string;
  agent_role: 'researcher' | 'coder' | 'reviewer' | 'architect' | 'planner' | 'verifier';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  verification_required?: boolean;
  estimated_duration_min?: number;
}

/**
 * Create a new autonomous subtask
 */
export async function createSubtask(
  params: CreateSubtaskParams,
  context: SkillContext
): Promise<CommandResult> {
  try {
    // Validate required params
    if (!params.parent_task_id) {
      return { success: false, error: 'parent_task_id is required' };
    }
    if (!params.title) {
      return { success: false, error: 'title is required' };
    }
    if (!params.agent_role) {
      return { success: false, error: 'agent_role is required' };
    }

    // Build subtask object
    const subtask: Omit<AutonomousSubtask, 'id' | 'created_at' | 'updated_at'> = {
      parent_task_id: params.parent_task_id,
      title: params.title,
      description: params.description || null,
      status: 'pending',
      priority: params.priority || 'medium',
      agent_metadata: {
        created_by: context.userId,
        created_at: new Date().toISOString()
      },
      summary: null,
      created_by_agent_id: context.userId,
      assigned_agent_role: params.agent_role,
      started_at: null,
      completed_at: null,
      estimated_duration_min: params.estimated_duration_min || null,
      verification_required: params.verification_required !== false, // default true
      verified_by_agent_id: null,
      verification_notes: null
    };

    // Insert into database
    const created = await insertSubtask(subtask, context);

    return {
      success: true,
      data: {
        id: created.id,
        title: created.title,
        status: created.status,
        assigned_agent_role: created.assigned_agent_role,
        message: `Created ${params.agent_role} subtask: ${params.title}`
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
