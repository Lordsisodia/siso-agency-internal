/**
 * Spawn sub-agent command
 */

import { CommandResult, SkillContext } from '../index';
import { getSubtask, updateSubtask, mergeAgentMetadata } from '../lib/supabase';
import { getAgentSpawnConfig, AgentSpawnConfig } from '../lib/agents';

export interface SpawnAgentParams {
  subtask_id: string;
  context?: Record<string, any>;
}

/**
 * Spawn a sub-agent to work on a subtask
 *
 * Note: This command returns the spawn configuration.
 * The actual spawning must be done by the caller using the Task tool.
 */
export async function spawnAgent(
  params: SpawnAgentParams,
  context: SkillContext
): Promise<CommandResult> {
  try {
    if (!params.subtask_id) {
      return { success: false, error: 'subtask_id is required' };
    }

    // Get the subtask
    const subtask = await getSubtask(params.subtask_id, context);
    if (!subtask) {
      return { success: false, error: `Subtask ${params.subtask_id} not found` };
    }

    // Update status to executing
    await updateSubtask(
      params.subtask_id,
      {
        status: 'executing',
        started_at: new Date().toISOString()
      },
      context
    );

    // Record spawn in metadata
    await mergeAgentMetadata(
      params.subtask_id,
      {
        spawn_history: [
          {
            spawned_at: new Date().toISOString(),
            context: params.context || {}
          }
        ]
      },
      context
    );

    // Build spawn configuration
    const spawnConfig: AgentSpawnConfig = {
      role: subtask.assigned_agent_role || 'researcher',
      subtaskId: subtask.id,
      title: subtask.title,
      description: subtask.description || undefined,
      context: params.context
    };

    const agentConfig = getAgentSpawnConfig(spawnConfig);

    return {
      success: true,
      data: {
        subtask_id: subtask.id,
        title: subtask.title,
        role: subtask.assigned_agent_role,
        status: 'executing',
        // Return the agent configuration for the caller to use
        agent_configuration: agentConfig,
        message: `Spawn configuration ready for ${subtask.assigned_agent_role} agent`
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
