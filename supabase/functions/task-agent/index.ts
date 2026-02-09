/**
 * Continuous Task Agent
 *
 * This agent runs continuously, analyzing tasks and creating autonomous subtasks.
 * It doesn't wait for user input - it proactively finds work to do.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const CONFIG = {
  ANALYSIS_BATCH_SIZE: 5,
  MAX_SUBTASKS_PER_TASK: 5,
  MIN_TASK_AGE_MINUTES: 5, // Don't analyze tasks newer than this
  CIRCUIT_BREAKER_THRESHOLD: 5
};

const state = {
  consecutiveErrors: 0,
  lastAnalysisAt: null as string | null
};

interface Task {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  priority: string;
}

Deno.serve(async (req) => {
  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Circuit breaker check
    if (state.consecutiveErrors >= CONFIG.CIRCUIT_BREAKER_THRESHOLD) {
      return new Response(
        JSON.stringify({ status: 'circuit_breaker', consecutiveErrors: state.consecutiveErrors }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const results: any[] = [];

    // 1. Find tasks that need analysis
    // Tasks without any autonomous subtasks, older than MIN_TASK_AGE_MINUTES
    const { data: tasksNeedingAnalysis, error: analysisError } = await supabase
      .from('deep_work_tasks')
      .select('*')
      .not('id', 'in', (
        supabase
          .from('autonomous_subtasks')
          .select('parent_task_id')
      ))
      .lt('created_at', new Date(Date.now() - CONFIG.MIN_TASK_AGE_MINUTES * 60000).toISOString())
      .order('priority', { ascending: false })
      .limit(CONFIG.ANALYSIS_BATCH_SIZE);

    if (analysisError) {
      throw new Error(`Failed to fetch tasks: ${analysisError.message}`);
    }

    console.log(`Found ${tasksNeedingAnalysis?.length || 0} tasks needing analysis`);

    // 2. Analyze each task and create planner subtasks
    for (const task of (tasksNeedingAnalysis || [])) {
      try {
        const result = await analyzeTask(task, supabase);
        results.push({ taskId: task.id, action: 'analyzed', result });
        state.consecutiveErrors = 0;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`Error analyzing task ${task.id}:`, errorMsg);
        results.push({ taskId: task.id, action: 'error', error: errorMsg });
        state.consecutiveErrors++;
      }
    }

    // 3. Check for pending planner subtasks and process them
    const { data: pendingPlanners, error: plannerError } = await supabase
      .from('autonomous_subtasks')
      .select('*')
      .eq('status', 'pending')
      .eq('assigned_agent_role', 'planner')
      .limit(3);

    if (plannerError) {
      console.error('Error fetching pending planners:', plannerError);
    } else {
      for (const planner of (pendingPlanners || [])) {
        try {
          const result = await executePlanner(planner, supabase);
          results.push({ subtaskId: planner.id, action: 'planned', result });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`Error executing planner ${planner.id}:`, errorMsg);
          results.push({ subtaskId: planner.id, action: 'error', error: errorMsg });
        }
      }
    }

    // 4. Check for executing subtasks that might be stuck
    const { data: stuckTasks, error: stuckError } = await supabase
      .from('autonomous_subtasks')
      .select('*')
      .eq('status', 'executing')
      .lt('started_at', new Date(Date.now() - 30 * 60000).toISOString()) // 30 min timeout
      .limit(5);

    if (stuckError) {
      console.error('Error fetching stuck tasks:', stuckError);
    } else {
      for (const stuck of (stuckTasks || [])) {
        await supabase
          .from('autonomous_subtasks')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            agent_metadata: {
              ...stuck.agent_metadata,
              failure_reason: 'Timeout - agent did not complete within 30 minutes'
            }
          })
          .eq('id', stuck.id);

        results.push({ subtaskId: stuck.id, action: 'marked_stuck' });
      }
    }

    state.lastAnalysisAt = new Date().toISOString();

    return new Response(
      JSON.stringify({
        status: 'success',
        duration_ms: Date.now() - startTime,
        tasks_analyzed: tasksNeedingAnalysis?.length || 0,
        planners_executed: pendingPlanners?.length || 0,
        stuck_tasks_marked: stuckTasks?.length || 0,
        results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Task agent error:', errorMsg);
    state.consecutiveErrors++;

    return new Response(
      JSON.stringify({ status: 'error', error: errorMsg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Analyze a task and create a planner subtask
 */
async function analyzeTask(task: Task, supabase: any): Promise<any> {
  console.log(`Analyzing task: ${task.title}`);

  // Simple heuristic analysis - in production this could use LLM
  const analysis = {
    complexity: estimateComplexity(task),
    needsResearch: task.title.toLowerCase().includes('research') || task.description?.toLowerCase().includes('research'),
    needsCode: task.title.toLowerCase().includes('implement') || task.title.toLowerCase().includes('build'),
    needsReview: task.title.toLowerCase().includes('review') || task.title.toLowerCase().includes('audit')
  };

  // Create planner subtask
  const { data: plannerSubtask, error } = await supabase
    .from('autonomous_subtasks')
    .insert({
      parent_task_id: task.id,
      title: `Analyze and plan: ${task.title}`,
      description: `Task analysis: ${JSON.stringify(analysis)}`,
      status: 'pending',
      priority: task.priority?.toLowerCase() || 'medium',
      assigned_agent_role: 'planner',
      verification_required: false,
      agent_metadata: {
        task_analysis: analysis,
        task_context: {
          title: task.title,
          description: task.description,
          user_id: task.user_id
        },
        analyzed_at: new Date().toISOString()
      }
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create planner: ${error.message}`);
  }

  return {
    planner_subtask_id: plannerSubtask.id,
    analysis
  };
}

/**
 * Execute a planner subtask - create execution subtasks
 */
async function executePlanner(planner: any, supabase: any): Promise<any> {
  console.log(`Executing planner: ${planner.title}`);

  // Transition to executing
  await supabase
    .from('autonomous_subtasks')
    .update({
      status: 'executing',
      started_at: new Date().toISOString()
    })
    .eq('id', planner.id);

  // Get parent task details
  const { data: parentTask } = await supabase
    .from('deep_work_tasks')
    .select('*')
    .eq('id', planner.parent_task_id)
    .single();

  // Generate execution subtasks based on task content
  const subtasks = generateExecutionSubtasks(parentTask, planner);

  // Create the subtasks
  const createdSubtasks = [];
  for (const subtask of subtasks) {
    const { data: created, error } = await supabase
      .from('autonomous_subtasks')
      .insert({
        parent_task_id: planner.parent_task_id,
        title: subtask.title,
        description: subtask.description,
        status: 'pending',
        priority: subtask.priority,
        assigned_agent_role: subtask.role,
        verification_required: subtask.role === 'coder', // Verify code changes
        estimated_duration_min: subtask.duration,
        agent_metadata: {
          created_by_planner: planner.id,
          execution_order: subtask.order
        }
      })
      .select()
      .single();

    if (!error && created) {
      createdSubtasks.push(created.id);
    }
  }

  // Mark planner as completed
  await supabase
    .from('autonomous_subtasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      summary: `Created ${createdSubtasks.length} execution subtasks`,
      agent_metadata: {
        ...planner.agent_metadata,
        created_subtasks: createdSubtasks,
        execution_plan: subtasks
      }
    })
    .eq('id', planner.id);

  return {
    subtasks_created: createdSubtasks.length,
    subtask_ids: createdSubtasks
  };
}

/**
 * Estimate task complexity based on title/description
 */
function estimateComplexity(task: Task): 'low' | 'medium' | 'high' {
  const text = `${task.title} ${task.description || ''}`.toLowerCase();

  if (text.includes('simple') || text.includes('quick') || text.includes('fix')) return 'low';
  if (text.includes('complex') || text.includes('architecture') || text.includes('refactor')) return 'high';
  if (text.includes('implement') || text.includes('build') || text.includes('create')) return 'medium';

  return 'medium';
}

/**
 * Generate execution subtasks based on task analysis
 */
function generateExecutionSubtasks(task: any, planner: any): any[] {
  const subtasks = [];
  const analysis = planner.agent_metadata?.task_analysis || {};

  // Always start with research if needed
  if (analysis.needsResearch || analysis.complexity === 'high') {
    subtasks.push({
      title: `Research: ${task.title}`,
      description: 'Gather information and analyze existing solutions',
      role: 'researcher',
      priority: 'high',
      duration: 30,
      order: 1
    });
  }

  // Add design/architecture for complex tasks
  if (analysis.complexity === 'high') {
    subtasks.push({
      title: `Design architecture for: ${task.title}`,
      description: 'Create system design and technical approach',
      role: 'architect',
      priority: 'high',
      duration: 45,
      order: 2
    });
  }

  // Add implementation
  if (analysis.needsCode || analysis.complexity !== 'low') {
    subtasks.push({
      title: `Implement: ${task.title}`,
      description: 'Write code and implement the solution',
      role: 'coder',
      priority: task.priority?.toLowerCase() || 'medium',
      duration: analysis.complexity === 'high' ? 90 : 60,
      order: 3
    });
  }

  // Add review
  if (analysis.needsReview || analysis.complexity !== 'low') {
    subtasks.push({
      title: `Review: ${task.title}`,
      description: 'Review implementation for quality and correctness',
      role: 'reviewer',
      priority: 'medium',
      duration: 20,
      order: 4
    });
  }

  return subtasks;
}
