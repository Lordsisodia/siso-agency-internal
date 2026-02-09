/**
 * Create execution plan command
 * Spawns a planner agent to break down a task into subtasks
 */

import { CommandResult, SkillContext } from '../index';
import { getAgentSpawnConfig } from '../lib/agents';

export interface CreatePlanParams {
  parent_task_id: string;
  context?: Record<string, any>;
}

/**
 * Create an execution plan for a task
 *
 * Note: This returns the spawn configuration for a planner agent.
 * The caller must actually spawn the agent using the Task tool.
 */
export async function createPlan(
  params: CreatePlanParams,
  context: SkillContext
): Promise<CommandResult> {
  try {
    if (!params.parent_task_id) {
      return { success: false, error: 'parent_task_id is required' };
    }

    // Build spawn configuration for planner agent
    const agentConfig = getAgentSpawnConfig({
      role: 'planner',
      subtaskId: params.parent_task_id, // Planner works on parent task
      title: `Plan execution for task ${params.parent_task_id}`,
      description: 'Create detailed execution plan with subtasks',
      context: {
        ...params.context,
        task_id: params.parent_task_id,
        planning_mode: true
      }
    });

    return {
      success: true,
      data: {
        parent_task_id: params.parent_task_id,
        agent_configuration: agentConfig,
        message: 'Planner agent configuration ready. Spawn to create execution plan.'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
