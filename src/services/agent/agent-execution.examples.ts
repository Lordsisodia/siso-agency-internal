// ============================================================================
// AGENT EXECUTION SYSTEM - Usage Examples
// Shows how AI agents can use the execution system to manage tasks
// ============================================================================

import { agentExecution } from './agent-execution.service';
import type { ExecutionStep, CreatePlanInput } from './agent-execution.types';

// ============================================================================
// EXAMPLE 1: Create and Execute a Research Plan
// ============================================================================

export async function exampleResearchPlan() {
  // 1. Define the research steps
  const steps: ExecutionStep[] = [
    {
      step: 1,
      action: 'search_literature',
      description: 'Search for first-principles thinking frameworks',
      estimated_duration: 30,
    },
    {
      step: 2,
      action: 'analyze_sources',
      description: 'Analyze and extract key principles from sources',
      estimated_duration: 45,
    },
    {
      step: 3,
      action: 'synthesize',
      description: 'Synthesize findings into coherent framework',
      estimated_duration: 60,
    },
  ];

  // 2. Create the plan
  const plan = await agentExecution.createPlan({
    task_id: 'deep-1765060407236',
    plan_type: 'research',
    steps,
    reasoning: 'Research first-principles thinking to create comprehensive systems prompt',
    metadata: {
      domain: 'prompt_engineering',
      complexity: 'high',
    },
  });

  console.log('✅ Plan created:', plan.id);

  // 3. Execute each step
  for (const step of steps) {
    // Log step start
    await agentExecution.addLog({
      plan_id: plan.id!,
      step_number: step.step,
      action_type: 'complete_step',
      description: `Starting: ${step.description}`,
      agent_confidence: 0.9,
    });

    // Simulate step execution
    console.log(`⏳ Executing step ${step.step}: ${step.description}`);
    
    // ... actual work happens here ...

    // Log step completion
    await agentExecution.addLog({
      plan_id: plan.id!,
      step_number: step.step,
      action_type: 'complete_step',
      description: `Completed: ${step.description}`,
      after_state: { status: 'completed', result: 'Research data gathered' },
      agent_confidence: 0.95,
    });

    // Update plan progress
    await agentExecution.updatePlan({
      plan_id: plan.id!,
      current_step: step.step + 1,
    });
  }

  // 4. Mark plan as completed
  await agentExecution.updatePlan({
    plan_id: plan.id!,
    status: 'completed',
    agent_reasoning: 'Research completed successfully, synthesized framework',
  });

  console.log('✅ Plan completed!');
}

// ============================================================================
// EXAMPLE 2: Create Implementation Plan with Subtasks
// ============================================================================

export async function exampleImplementationPlan() {
  const steps: ExecutionStep[] = [
    {
      step: 1,
      action: 'analyze_requirements',
      description: 'Analyze feature requirements',
      estimated_duration: 30,
    },
    {
      step: 2,
      action: 'design_solution',
      description: 'Design technical solution',
      estimated_duration: 60,
      dependencies: [1],
    },
    {
      step: 3,
      action: 'implement',
      description: 'Implement feature',
      estimated_duration: 120,
      dependencies: [2],
    },
    {
      step: 4,
      action: 'test',
      description: 'Test implementation',
      estimated_duration: 45,
      dependencies: [3],
    },
  ];

  const plan = await agentExecution.createPlan({
    task_id: 'task-id',
    plan_type: 'implementation',
    steps,
    reasoning: 'Implement feature with proper design, implementation, and testing phases',
  });

  // Add context about requirements
  await agentExecution.setContext({
    task_id: 'task-id',
    plan_id: plan.id,
    context_type: 'requirements',
    context_key: 'functional',
    context_value: 'User must be able to create, read, update, delete tasks',
    metadata: { priority: 'high' },
  });

  return plan;
}

// ============================================================================
// EXAMPLE 3: Create Subtasks from Plan
// ============================================================================

export async function exampleCreateSubtasksFromPlan() {
  const taskId = 'deep-1765056460475'; // Ecommerce client

  const steps: ExecutionStep[] = [
    {
      step: 1,
      action: 'create_subtask',
      description: 'Setup Shopify API connection',
      estimated_duration: 45,
    },
    {
      step: 2,
      action: 'create_subtask',
      description: 'Create product sync mechanism',
      estimated_duration: 90,
    },
    {
      step: 3,
      action: 'create_subtask',
      description: 'Build order management system',
      estimated_duration: 120,
    },
  ];

  const plan = await agentExecution.createPlan({
    task_id: taskId,
    plan_type: 'implementation',
    steps,
    reasoning: 'Break down ecommerce implementation into manageable subtasks',
  });

  // Convert each step to an actual subtask in deep_work_subtasks
  for (const step of steps) {
    await agentExecution.addLog({
      plan_id: plan.id!,
      step_number: step.step,
      action_type: 'create_subtask',
      entity_type: 'subtask',
      description: `Creating subtask: ${step.description}`,
      after_state: {
        title: step.description,
        estimated_time: step.estimated_duration,
      },
      agent_confidence: 0.95,
    });

    // Actual subtask creation would happen here via Supabase
    // await supabase.from('deep_work_subtasks').insert({...});
  }

  return plan;
}

// ============================================================================
// EXAMPLE 4: Context Management for Complex Tasks
// ============================================================================

export async function exampleContextManagement() {
  const taskId = 'deep-1761743987000'; // SISO: Partnership program
  const planId = 'plan-id';

  // Store research findings
  await agentExecution.setContext({
    task_id: taskId,
    plan_id: planId,
    context_type: 'research',
    context_key: 'partner_requirements',
    context_value: 'Partners need: dashboard, client tracking, task management',
    metadata: { source: 'stakeholder_interviews', date: '2025-01-08' },
  });

  // Store technical decisions
  await agentExecution.setContext({
    task_id: taskId,
    plan_id: planId,
    context_type: 'decisions',
    context_key: 'architecture',
    context_value: 'Use separate domain for partners with shared task system',
    metadata: { rationale: 'reusability', complexity: 'medium' },
  });

  // Store blockers
  await agentExecution.setContext({
    task_id: taskId,
    plan_id: planId,
    context_type: 'blockers',
    context_key: 'api_dependency',
    context_value: 'Waiting for partner API authentication flow',
    metadata: { severity: 'high', estimated_resolution: '2 days' },
  });

  // Retrieve all context for this task
  const allContext = await agentExecution.getContext(taskId);
  console.log('📚 All context:', allContext);

  // Retrieve only blockers
  const blockers = await agentExecution.getContext(taskId, 'blockers');
  console.log('🚧 Blockers:', blockers);
}

// ============================================================================
// EXAMPLE 5: Error Handling and Recovery
// ============================================================================

export async function exampleErrorHandling() {
  const steps: ExecutionStep[] = [
    {
      step: 1,
      action: 'risky_operation',
      description: 'Attempt operation that might fail',
      estimated_duration: 30,
    },
  ];

  const plan = await agentExecution.createPlan({
    task_id: 'task-id',
    plan_type: 'implementation',
    steps,
    reasoning: 'Example with error handling',
  });

  try {
    // Attempt step
    await agentExecution.addLog({
      plan_id: plan.id!,
      step_number: 1,
      action_type: 'complete_step',
      description: 'Starting risky operation',
    });

    // Simulate error
    throw new Error('API rate limit exceeded');

  } catch (error) {
    // Log error
    await agentExecution.addLog({
      plan_id: plan.id!,
      step_number: 1,
      action_type: 'block',
      description: 'Operation failed',
      error_message: error instanceof Error ? error.message : String(error),
      agent_confidence: 0,
    });

    // Update plan status to blocked
    await agentExecution.updatePlan({
      plan_id: plan.id!,
      status: 'blocked',
      agent_reasoning: `Blocked by error: ${error}`,
    });

    // Store context about the error
    await agentExecution.setContext({
      plan_id: plan.id,
      context_type: 'blockers',
      context_key: 'rate_limit',
      context_value: 'API rate limit exceeded, retry after 1 hour',
      metadata: {
        error_type: 'rate_limit',
        retry_after: '2025-01-08T22:00:00Z',
      },
    });
  }
}

// ============================================================================
// EXAMPLE 6: Query and Reporting
// ============================================================================

export async function exampleQueriesAndReports() {
  // Get all in-progress plans
  const inProgressPlans = await agentExecution.queryPlans({
    status: 'in_progress',
  });
  console.log('🔄 In-progress plans:', inProgressPlans.length);

  // Get all plans for a specific task
  const taskPlans = await agentExecution.queryPlans({
    task_id: 'deep-1765060407236',
  });
  console.log('📋 Task plans:', taskPlans);

  // Get recent logs
  const recentLogs = await agentExecution.queryLogs({
    limit: 50,
  });
  console.log('📝 Recent logs:', recentLogs);

  // Get all research context
  const researchContext = await agentExecution.queryContext({
    context_type: 'research',
  });
  console.log('🔬 Research context:', researchContext);

  // Get full plan with logs and context
  const fullPlan = await agentExecution.getPlan('plan-id', true, true);
  console.log('📦 Full plan:', fullPlan);
}

// ============================================================================
// EXAMPLE 7: Using the High-Level executePlan Method
// ============================================================================

export async function exampleHighLevelExecution() {
  const steps: ExecutionStep[] = [
    {
      step: 1,
      action: 'research',
      description: 'Research topic',
      estimated_duration: 30,
    },
    {
      step: 2,
      action: 'implement',
      description: 'Implement solution',
      estimated_duration: 60,
    },
    {
      step: 3,
      action: 'test',
      description: 'Test solution',
      estimated_duration: 30,
    },
  ];

  // Define executor function for each step
  const executor = async (step: ExecutionStep, planId: string) => {
    console.log(`Executing: ${step.description}`);

    // Store context about this step
    await agentExecution.setContext({
      plan_id: planId,
      context_type: 'notes',
      context_key: `step_${step.step}_notes`,
      context_value: `Notes from executing ${step.action}`,
    });

    return { result: 'success', data: 'step data' };
  };

  // Execute entire plan
  const completedPlan = await agentExecution.executePlan(
    'task-id',
    'implementation',
    steps,
    executor
  );

  console.log('✅ Plan execution completed:', completedPlan);
}

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export const examples = {
  researchPlan: exampleResearchPlan,
  implementationPlan: exampleImplementationPlan,
  createSubtasksFromPlan: exampleCreateSubtasksFromPlan,
  contextManagement: exampleContextManagement,
  errorHandling: exampleErrorHandling,
  queriesAndReports: exampleQueriesAndReports,
  highLevelExecution: exampleHighLevelExecution,
};
