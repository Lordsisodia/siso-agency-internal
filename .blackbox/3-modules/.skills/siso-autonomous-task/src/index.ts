/**
 * SISO Autonomous Task Skill
 * Main entry point for autonomous task management commands
 */

import { createSubtask } from './commands/create';
import { spawnAgent } from './commands/spawn';
import { updateStatus } from './commands/status';
import { getContext } from './commands/context';
import { listSubtasks } from './commands/list';
import { createPlan } from './commands/plan';

export interface SkillContext {
  userId: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export interface CommandResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Main command handler
 */
export async function handleCommand(
  command: string,
  params: Record<string, any>,
  context: SkillContext
): Promise<CommandResult> {
  try {
    switch (command) {
      case 'create':
        return await createSubtask(params, context);

      case 'spawn':
        return await spawnAgent(params, context);

      case 'status':
        return await updateStatus(params, context);

      case 'context':
        return await getContext(params, context);

      case 'list':
        return await listSubtasks(params, context);

      case 'plan':
        return await createPlan(params, context);

      default:
        return {
          success: false,
          error: `Unknown command: ${command}. Available: create, spawn, status, context, list, plan`
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Export individual commands for direct use
export { createSubtask, spawnAgent, updateStatus, getContext, listSubtasks, createPlan };