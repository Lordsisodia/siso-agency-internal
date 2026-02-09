/**
 * Update subtask status command
 */

import { CommandResult, SkillContext } from '../index';
import { updateSubtask, mergeAgentMetadata, getSubtask } from '../lib/supabase';

export interface UpdateStatusParams {
  subtask_id: string;
  status: 'pending' | 'planned' | 'executing' | 'verifying' | 'completed' | 'failed';
  agent_metadata?: Record<string, any>;
  summary?: string;
  verification_notes?: string;
}

/**
 * Update subtask status and metadata
 */
export async function updateStatus(
  params: UpdateStatusParams,
  context: SkillContext
): Promise<CommandResult> {
  try {
    if (!params.subtask_id) {
      return { success: false, error: 'subtask_id is required' };
    }
    if (!params.status) {
      return { success: false, error: 'status is required' };
    }

    // Validate status
    const validStatuses = ['pending', 'planned', 'executing', 'verifying', 'completed', 'failed'];
    if (!validStatuses.includes(params.status)) {
      return {
        success: false,
        error: `Invalid status: ${params.status}. Must be one of: ${validStatuses.join(', ')}`
      };
    }

    // Build updates
    const updates: any = {
      status: params.status
    };

    // Add completion timestamp if completing
    if (params.status === 'completed' || params.status === 'failed') {
      updates.completed_at = new Date().toISOString();
    }

    // Add summary if provided
    if (params.summary) {
      updates.summary = params.summary;
    }

    // Add verification notes if provided
    if (params.verification_notes) {
      updates.verification_notes = params.verification_notes;
    }

    // Update the subtask
    const updated = await updateSubtask(params.subtask_id, updates, context);

    // Merge agent metadata if provided
    if (params.agent_metadata && Object.keys(params.agent_metadata).length > 0) {
      await mergeAgentMetadata(params.subtask_id, params.agent_metadata, context);
    }

    // If status is completed and verification is required, check if we need verifier
    if (params.status === 'completed' && updated.verification_required) {
      // Transition to verifying state
      await updateSubtask(params.subtask_id, { status: 'verifying' }, context);

      return {
        success: true,
        data: {
          subtask_id: params.subtask_id,
          status: 'verifying',
          message: 'Subtask completed, awaiting verification'
        }
      };
    }

    return {
      success: true,
      data: {
        subtask_id: params.subtask_id,
        status: params.status,
        title: updated.title,
        message: `Status updated to ${params.status}`
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
