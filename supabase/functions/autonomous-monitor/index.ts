/**
 * Autonomous Task Monitor
 *
 * Continuously polls for pending autonomous subtasks and spawns agents to work on them.
 * Runs as a Supabase Edge Function with cron trigger.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Configuration
const CONFIG = {
  MAX_ITERATIONS_PER_RUN: 5,
  CIRCUIT_BREAKER_THRESHOLD: 3,
  AGENT_TIMEOUT_MS: 15 * 60 * 1000, // 15 minutes
  POLL_BATCH_SIZE: 5
};

// State tracking (in-memory for edge function instance)
const state = {
  consecutiveErrors: 0,
  lastError: null as string | null,
  iterationsThisRun: 0
};

interface AutonomousSubtask {
  id: string;
  parent_task_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'planned' | 'executing' | 'verifying' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical' | null;
  agent_metadata: Record<string, any>;
  assigned_agent_role: 'researcher' | 'coder' | 'reviewer' | 'architect' | 'planner' | 'verifier' | null;
  started_at: string | null;
  verification_required: boolean;
  created_at: string;
}

interface DeepWorkTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_autonomous_eligible: boolean;
}

Deno.serve(async (req) => {
  const startTime = Date.now();

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check circuit breaker
    if (state.consecutiveErrors >= CONFIG.CIRCUIT_BREAKER_THRESHOLD) {
      console.error('Circuit breaker triggered - too many consecutive errors');
      return new Response(
        JSON.stringify({
          status: 'circuit_breaker',
          error: state.lastError,
          consecutiveErrors: state.consecutiveErrors
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Poll for pending subtasks
    const { data: pendingSubtasks, error: pollError } = await supabase
      .from('autonomous_subtasks')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(CONFIG.POLL_BATCH_SIZE);

    if (pollError) {
      throw new Error(`Failed to poll subtasks: ${pollError.message}`);
    }

    console.log(`Found ${pendingSubtasks?.length || 0} pending subtasks`);

    // 2. Process each pending subtask
    const results: any[] = [];

    for (const subtask of (pendingSubtasks || [])) {
      if (state.iterationsThisRun >= CONFIG.MAX_ITERATIONS_PER_RUN) {
        console.log('Max iterations reached, stopping for this run');
        break;
      }

      state.iterationsThisRun++;

      try {
        const result = await processSubtask(subtask, supabase);
        results.push({ subtaskId: subtask.id, status: 'success', result });
        state.consecutiveErrors = 0; // Reset on success
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`Error processing subtask ${subtask.id}:`, errorMsg);
        results.push({ subtaskId: subtask.id, status: 'error', error: errorMsg });
        state.consecutiveErrors++;
        state.lastError = errorMsg;

        // Mark subtask as failed
        await supabase
          .from('autonomous_subtasks')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            agent_metadata: {
              ...subtask.agent_metadata,
              error: errorMsg,
              failed_at: new Date().toISOString()
            }
          })
          .eq('id', subtask.id);
      }
    }

    // 3. Also check for autonomous-eligible parent tasks without subtasks
    const { data: eligibleTasks, error: eligibleError } = await supabase
      .from('deep_work_tasks')
      .select('*')
      .eq('is_autonomous_eligible', true)
      .not('id', 'in', (
        supabase
          .from('autonomous_subtasks')
          .select('parent_task_id')
          .neq('status', 'failed')
      ))
      .limit(3);

    if (eligibleError) {
      console.error('Error fetching eligible tasks:', eligibleError);
    } else if (eligibleTasks && eligibleTasks.length > 0) {
      console.log(`Found ${eligibleTasks.length} eligible tasks needing planning`);

      for (const task of eligibleTasks) {
        if (state.iterationsThisRun >= CONFIG.MAX_ITERATIONS_PER_RUN) {
          break;
        }

        try {
          const result = await createExecutionPlan(task, supabase);
          results.push({ taskId: task.id, status: 'plan_created', result });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`Error creating plan for task ${task.id}:`, errorMsg);
          results.push({ taskId: task.id, status: 'error', error: errorMsg });
        }
      }
    }

    const duration = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        status: 'success',
        processed: results.length,
        duration_ms: duration,
        results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Monitor error:', errorMsg);
    state.consecutiveErrors++;
    state.lastError = errorMsg;

    return new Response(
      JSON.stringify({ status: 'error', error: errorMsg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Process a single subtask based on its role
 */
async function processSubtask(
  subtask: AutonomousSubtask,
  supabase: any
): Promise<any> {
  console.log(`Processing subtask ${subtask.id} (${subtask.assigned_agent_role}): ${subtask.title}`);

  // Transition to 'planned' first
  await supabase
    .from('autonomous_subtasks')
    .update({
      status: 'planned',
      agent_metadata: {
        ...subtask.agent_metadata,
        planning_started_at: new Date().toISOString()
      }
    })
    .eq('id', subtask.id);

  // Get parent task context
  const { data: parentTask } = await supabase
    .from('deep_work_tasks')
    .select('*')
    .eq('id', subtask.parent_task_id)
    .single();

  // Build agent prompt based on role
  const agentPrompt = buildAgentPrompt(subtask, parentTask);

  // Transition to 'executing'
  await supabase
    .from('autonomous_subtasks')
    .update({
      status: 'executing',
      started_at: new Date().toISOString(),
      agent_metadata: {
        ...subtask.agent_metadata,
        execution_started_at: new Date().toISOString(),
        agent_prompt: agentPrompt
      }
    })
    .eq('id', subtask.id);

  // Note: In a real implementation, this would spawn an actual agent
  // For now, we store the prompt and mark as needing external agent execution
  // The external agent would call back via webhook or poll for work

  return {
    action: 'agent_spawned',
    role: subtask.assigned_agent_role,
    prompt_length: agentPrompt.length,
    note: 'Agent execution pending - external agent needs to pick up this task'
  };
}

/**
 * Create an execution plan for a parent task
 */
async function createExecutionPlan(
  task: DeepWorkTask,
  supabase: any
): Promise<any> {
  console.log(`Creating execution plan for task ${task.id}: ${task.title}`);

  // Create a planner subtask
  const { data: plannerSubtask, error } = await supabase
    .from('autonomous_subtasks')
    .insert({
      parent_task_id: task.id,
      title: `Plan execution: ${task.title}`,
      description: 'Create detailed execution plan with subtasks',
      status: 'pending',
      priority: 'high',
      assigned_agent_role: 'planner',
      verification_required: false,
      agent_metadata: {
        task_context: {
          title: task.title,
          description: task.description,
          user_id: task.user_id
        },
        plan_for_task_id: task.id
      }
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create planner subtask: ${error.message}`);
  }

  return {
    planner_subtask_id: plannerSubtask.id,
    message: 'Planner subtask created - will be picked up on next monitor run'
  };
}

/**
 * Build agent prompt based on role
 */
function buildAgentPrompt(subtask: AutonomousSubtask, parentTask: DeepWorkTask | null): string {
  const rolePrompts: Record<string, string> = {
    planner: `You are a Planner Agent for the SISO Blackbox autonomous task system.

Your job is to analyze a task and create a detailed execution plan.

When given a task:
1. Analyze the requirements and context
2. Break down into 3-5 logical subtasks
3. Assign appropriate roles to each subtask
4. Estimate duration for each subtask

Use the siso-autonomous-task skill commands:
- /autonomous create - to create each subtask
- /autonomous status - to update this planner task status`,

    researcher: `You are a Researcher Agent for the SISO Blackbox autonomous task system.

Your job is to gather information and analyze code.

When given a research task:
1. Search the codebase for relevant files
2. Read and analyze the code
3. Summarize findings with specific file references

Use the siso-autonomous-task skill to update status when done.`,

    coder: `You are a Coder Agent for the SISO Blackbox autonomous task system.

Your job is to implement code changes.

Rules:
- NEVER change code you haven't read
- Follow existing patterns
- Keep changes minimal

Use the siso-autonomous-task skill to update status when done.`,

    reviewer: `You are a Reviewer Agent for the SISO Blackbox autonomous task system.

Your job is to review code changes and provide feedback.

Check for correctness, quality, security, and performance.

Use the siso-autonomous-task skill to update status when done.`,

    architect: `You are an Architect Agent for the SISO Blackbox autonomous task system.

Your job is to design systems and define patterns.

Consider scalability, maintainability, and integration points.

Use the siso-autonomous-task skill to update status when done.`,

    verifier: `You are a Verifier Agent for the SISO Blackbox autonomous task system.

Your job is to do final verification before marking a task complete.

Review all subtasks and confirm acceptance criteria are met.

Use the siso-autonomous-task skill to update status when done.`
  };

  const basePrompt = rolePrompts[subtask.assigned_agent_role || 'researcher'];

  return `${basePrompt}

---

TASK CONTEXT:
Subtask ID: ${subtask.id}
Title: ${subtask.title}
Description: ${subtask.description || 'N/A'}
Priority: ${subtask.priority || 'medium'}

Parent Task: ${parentTask?.title || 'N/A'}
Parent Description: ${parentTask?.description || 'N/A'}

---

INSTRUCTIONS:
1. Read the task context carefully
2. Execute your role-specific responsibilities
3. Update the subtask status using /autonomous status
4. Store findings in agent_metadata
5. Write a user-friendly summary when complete
6. You have 15 minutes to complete this task

Begin work now.`;
}
