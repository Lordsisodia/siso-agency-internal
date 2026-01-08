# 🤖 Agent Execution System

**Database-first, agent-managed task execution system for SISO Internal**

Enables AI agents (like Claude) to manage tasks, create execution plans, track progress, and maintain context - all through database operations. **No code changes required** to your existing app.

---

## 📋 What This Does

The Agent Execution System allows AI to:

1. **Create Execution Plans** - Break down tasks into steps
2. **Log Every Action** - Full audit trail of agent activities
3. **Maintain Context** - Persistent memory across sessions
4. **Track Progress** - Step-by-step execution tracking
5. **Handle Errors** - Graceful failure recovery

---

## 🎯 Use Cases

### For AI Agents
- Research complex topics with step-by-step methodology
- Implement features with proper planning and testing
- Coordinate multi-step workflows
- Maintain context across conversations
- Auto-generate subtasks from plans

### For Your App
- Visual display of agent-created plans
- Real-time progress tracking
- Audit logs for transparency
- Context search and retrieval
- Plan history and analytics

---

## 🏗️ Architecture

### Database Tables

```sql
agent_execution_plans     -- Stores execution plans
agent_execution_logs      -- Tracks every agent action
agent_context_memory      -- Persistent context store
```

### Key Concepts

1. **Plan**: A multi-step execution strategy for a task
2. **Log**: Atomic record of an agent action
3. **Context**: Key-value storage for persistent memory
4. **Step**: Individual unit of work within a plan

---

## 🚀 Quick Start

### 1. Create a Plan

```typescript
import { agentExecution } from '@/services/agent/agent-execution.service';

const plan = await agentExecution.createPlan({
  task_id: 'deep-1765060407236',
  plan_type: 'research',
  steps: [
    {
      step: 1,
      action: 'search',
      description: 'Search for first-principles frameworks',
      estimated_duration: 30,
    },
    {
      step: 2,
      action: 'analyze',
      description: 'Analyze findings',
      estimated_duration: 45,
    },
  ],
  reasoning: 'Research first-principles thinking methodology',
});
```

### 2. Log Progress

```typescript
await agentExecution.addLog({
  plan_id: plan.id,
  step_number: 1,
  action_type: 'complete_step',
  description: 'Completed research phase',
  after_state: { findings_count: 15 },
  agent_confidence: 0.95,
});
```

### 3. Store Context

```typescript
await agentExecution.setContext({
  task_id: 'deep-1765060407236',
  plan_id: plan.id,
  context_type: 'research',
  context_key: 'key_findings',
  context_value: 'First-principles requires questioning assumptions',
  metadata: { source: 'academic_paper' },
});
```

### 4. Update Plan Status

```typescript
await agentExecution.updatePlan({
  plan_id: plan.id,
  current_step: 2,
  status: 'in_progress',
  agent_reasoning: 'Research phase complete, starting analysis',
});
```

---

## 📊 Real Example

For your task **"Make a first principle systems prompt"**, the system created:

### Plan (6 steps, 375 min estimated)
1. Research existing frameworks (30 min)
2. Analyze SISO architecture (45 min)
3. Extract core principles (60 min)
4. Design prompt structure (90 min)
5. Create prompt template (120 min)
6. Validate with samples (30 min)

### Context Stored
- **Goal**: Create systems prompt for first-principles thinking
- **Dependencies**: First-principles knowledge, SISO architecture, prompt engineering

### Execution Log
- ✅ Initialized context with research goals
- ⏳ Ready to execute step 1

---

## 🎨 Integration with Your App

### Display Plans in UI

```typescript
// Fetch plan with logs and context
const plan = await agentExecution.getPlan(
  planId,
  includeLogs = true,
  includeContext = true
);

// Render in your component
<AgentPlanView 
  plan={plan}
  onStepComplete={(step) => handleStepComplete(plan.id, step)}
/>
```

### Query Active Plans

```typescript
// Get all in-progress plans
const activePlans = await agentExecution.queryPlans({
  status: 'in_progress',
});

// Get plans for specific task
const taskPlans = await agentExecution.queryPlans({
  task_id: 'deep-1765060407236',
});
```

### Search Context

```typescript
// Find all research context
const research = await agentExecution.queryContext({
  context_type: 'research',
});

// Get context for specific task
const taskContext = await agentExecution.getContext(taskId);
```

---

## 🤖 For AI Agents: How to Use

### Pattern 1: Research Tasks

```typescript
const plan = await agentExecution.createPlan({
  task_id: taskId,
  plan_type: 'research',
  steps: [
    { step: 1, action: 'search', description: 'Search literature' },
    { step: 2, action: 'analyze', description: 'Analyze sources' },
    { step: 3, action: 'synthesize', description: 'Synthesize findings' },
  ],
});

for (const step of plan.plan_json.steps) {
  // Execute step
  const result = await executeStep(step);
  
  // Log completion
  await agentExecution.addLog({
    plan_id: plan.id,
    step_number: step.step,
    action_type: 'complete_step',
    description: `Completed: ${step.description}`,
    after_state: result,
  });
  
  // Update progress
  await agentExecution.updatePlan({
    plan_id: plan.id,
    current_step: step.step + 1,
  });
}

await agentExecution.updatePlan({
  plan_id: plan.id,
  status: 'completed',
});
```

### Pattern 2: Generate Subtasks

```typescript
const plan = await agentExecution.createPlan({
  task_id: taskId,
  plan_type: 'subtask_breakdown',
  steps: taskBreakdown, // Array of subtasks
});

// Convert each step to actual subtask
for (const step of plan.plan_json.steps) {
  await supabase.from('deep_work_subtasks').insert({
    task_id: taskId,
    title: step.description,
    priority: 'MEDIUM',
    estimated_time: step.estimated_duration,
  });
  
  await agentExecution.addLog({
    plan_id: plan.id,
    step_number: step.step,
    action_type: 'create_subtask',
    entity_id: subtask.id,
    description: `Created subtask: ${step.description}`,
  });
}
```

### Pattern 3: Handle Errors

```typescript
try {
  await riskyOperation();
} catch (error) {
  await agentExecution.addLog({
    plan_id: plan.id,
    step_number: currentStep,
    action_type: 'block',
    description: 'Operation failed',
    error_message: error.message,
    agent_confidence: 0,
  });
  
  await agentExecution.updatePlan({
    plan_id: plan.id,
    status: 'blocked',
    agent_reasoning: `Blocked: ${error.message}`,
  });
  
  await agentExecution.setContext({
    plan_id: plan.id,
    context_type: 'blockers',
    context_key: 'error_details',
    context_value: error.message,
  });
}
```

---

## 📈 Advanced Features

### High-Level Execution

```typescript
const completedPlan = await agentExecution.executePlan(
  taskId,
  'implementation',
  steps,
  async (step, planId) => {
    // Executor function for each step
    console.log(`Executing: ${step.description}`);
    
    // Store step notes
    await agentExecution.setContext({
      plan_id: planId,
      context_type: 'notes',
      context_key: `step_${step.step}`,
      context_value: 'Step notes here',
    });
    
    return { result: 'success' };
  }
);
```

### Query by Date Range

```typescript
const recentLogs = await agentExecution.queryLogs({
  start_date: '2025-01-01',
  end_date: '2025-01-31',
  limit: 100,
});
```

### Get Full Plan History

```typescript
const fullPlan = await agentExecution.getPlan(
  planId,
  includeLogs = true,
  includeContext = true
);

// fullPlan.logs - Array of all actions
// fullPlan.context - Array of all context entries
```

---

## 🔒 Security

Row Level Security (RLS) policies ensure:
- ✅ Users see only their task plans
- ✅ Service role (agents) can manage everything
- ✅ Automatic user_id filtering
- ✅ Cascade deletion on task deletion

---

## 📊 Database Schema

### agent_execution_plans

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| task_id | TEXT | Reference to deep_work_tasks |
| plan_type | TEXT | Type of plan |
| current_step | INTEGER | Current step number |
| total_steps | INTEGER | Total steps in plan |
| status | TEXT | Plan status |
| plan_json | JSONB | Plan structure with steps |
| agent_reasoning | TEXT | AI reasoning |

### agent_execution_logs

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Reference to plan |
| step_number | INTEGER | Step number |
| action_type | TEXT | Type of action |
| entity_id | TEXT | Related entity ID |
| description | TEXT | Action description |
| before_state | JSONB | State before action |
| after_state | JSONB | State after action |
| agent_confidence | REAL | Confidence score (0-1) |

### agent_context_memory

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| task_id | TEXT | Reference to task |
| plan_id | UUID | Reference to plan |
| context_type | TEXT | Type of context |
| context_key | TEXT | Context key |
| context_value | TEXT | Context value |
| metadata | JSONB | Additional data |

---

## 🎓 Best Practices

1. **Always Log Actions** - Every agent action should be logged
2. **Store Context** - Keep important info in context memory
3. **Handle Errors** - Use try-catch and log failures
4. **Update Status** - Keep plan status current
5. **Use Metadata** - Store structured data in JSONB fields

---

## 🚀 Next Steps

1. **UI Components** - Create components to display plans/logs/context
2. **Agent Prompts** - Add system prompts explaining this system to agents
3. **Analytics** - Build dashboards for plan metrics
4. **Search** - Implement context search
5. **Automation** - Auto-create plans for new tasks

---

## 📝 Example Files

- `agent-execution.types.ts` - Type definitions
- `agent-execution.service.ts` - Service layer
- `agent-execution.examples.ts` - Usage examples

---

## 🎯 Summary

✅ **Database-first** - No code changes needed
✅ **Agent-friendly** - Simple API for AI agents
✅ **Full transparency** - Every action logged
✅ **Persistent context** - Memory across sessions
✅ **Visual ready** - Easy to display in UI
✅ **Production ready** - RLS, indexes, triggers

**Agents can now manage tasks autonomously while keeping you informed!** 🎉
