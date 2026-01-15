# Interactive Multi-Agent Mode - 24-Hour Implementation Plan

**Version:** 1.0.0
**Status:** Ready to Execute
**Target:** Transform Blackbox3 from script-based to interactive AI assistant

---

## Executive Summary

**Goal:** Enable all Blackbox3 agents to run within a single AI conversation, coordinated by an Orchestrator Agent.

**Time Budget:** 24 hours of focused coding

**Impact:**
- Eliminate context switching between agents
- Reduce overhead by 40-60%
- Enable real-time user interaction
- Make BB3 feel like a smart AI assistant

**Feasibility:** Very doable. Core infrastructure exists. Main work is orchestration layer.

---

## Implementation Phases

```
┌─────────────────────────────────────────────────────────────┐
│                    24-HOUR BREAKDOWN                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Phase 1: Foundation (8 hours)                               │
│    → Agent Protocol (3h)                                     │
│    → Agent Registry (2h)                                     │
│    → Orchestrator Agent Core (3h)                            │
│                                                               │
│  Phase 2: Execution Engine (8 hours)                         │
│    → Sequential Execution (2h)                               │
│    → Parallel Execution (3h)                                 │
│    → Progress Tracking (1h)                                  │
│    → Error Handling (2h)                                     │
│                                                               │
│  Phase 3: Integration (6 hours)                              │
│    → UI/Prompt Interface (2h)                                │
│    → Artifact Management (1.5h)                              │
│    → Testing & Validation (2.5h)                             │
│                                                               │
│  Phase 4: Polish (2 hours)                                   │
│    → Documentation (1h)                                      │
│    → Examples & Edge Cases (1h)                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation (8 hours)

### Hour 1-3: Agent Protocol Implementation

**File:** `agents/protocol/agent-interface.ts`

**Tasks:**
1. Define TypeScript interfaces for Agent, AgentInput, AgentOutput (1h)
2. Define artifact types (PRDocument, ArchitectureDocument, etc.) (1h)
3. Create validation schemas (1h)

**Code to write:**
```typescript
// Core agent interface
export interface Agent {
  name: string;
  version: string;
  type: AgentType;
  description: string;
  capabilities: string[];
  execute(input: AgentInput): Promise<AgentOutput>;
}

// Input/output schemas
export interface AgentInput { /* ... */ }
export interface AgentOutput { /* ... */ }

// Artifact types
export interface PRDocument { /* ... */ }
export interface ArchitectureDocument { /* ... */ }
// ... etc
```

**Success criteria:**
- [ ] All interfaces compile without errors
- [ ] TypeScript types are comprehensive
- [ ] Documentation for each interface

---

### Hour 4-5: Agent Registry

**File:** `agents/registry/agent-registry.ts`

**Tasks:**
1. Create registry class (1h)
2. Implement auto-discovery from agents/ directory (1h)

**Code to write:**
```typescript
export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();

  // Discover agents from directory
  async discoverAgents(directory: string): Promise<void> {
    const agentFiles = await this.scanDirectory(directory);
    for (const file of agentFiles) {
      const agent = await this.loadAgent(file);
      this.register(agent);
    }
  }

  // Register agent
  register(agent: Agent): void {
    this.agents.set(agent.name, agent);
  }

  // Get agent by name
  getAgent(name: string): Agent {
    const agent = this.agents.get(name);
    if (!agent) throw new Error(`Agent not found: ${name}`);
    return agent;
  }

  // Query agents by capability
  findAgentsByCapability(capability: string): Agent[] {
    return Array.from(this.agents.values())
      .filter(a => a.capabilities.includes(capability));
  }
}
```

**Success criteria:**
- [ ] Can auto-discover all agents from agents/
- [ ] Can retrieve agents by name
- [ ] Can query agents by capability

---

### Hour 6-8: Orchestrator Agent Core

**File:** `agents/custom/orchestrator.agent.ts`

**Tasks:**
1. Create OrchestratorAgent class (1h)
2. Implement TaskAnalyzer module (1h)
3. Implement WorkflowPlanner module (1h)

**Code to write:**
```typescript
export class OrchestratorAgent implements Agent {
  name = "orchestrator";
  type = "orchestrator" as AgentType;

  constructor(
    private taskAnalyzer: TaskAnalyzer,
    private workflowPlanner: WorkflowPlanner,
    private agentRegistry: AgentRegistry
  ) {}

  async execute(input: AgentInput): Promise<AgentOutput> {
    // 1. Analyze task
    const analysis = await this.taskAnalyzer.analyze(input.task);

    // 2. Plan workflow
    const workflow = await this.workflowPlanner.plan(analysis);

    // 3. Return workflow for execution engine
    return {
      agent_name: this.name,
      agent_type: this.type,
      timestamp: new Date().toISOString(),
      execution: { duration_seconds: 0, tokens_used: 0, status: "success" },
      output: { type: "analysis", content: { type: "workflow", data: workflow } },
      artifacts: [],
      recommendations: { next_agents: workflow.agents },
      quality: { completeness: 100, confidence: analysis.confidence, satisfaction: 9 }
    };
  }
}

// Task analyzer
class TaskAnalyzer {
  async analyze(task: Task): Promise<TaskAnalysis> {
    return {
      task_type: await this.detectTaskType(task),
      complexity: await this.detectComplexity(task),
      scope: await this.estimateScope(task),
      risk_level: await this.assessRisk(task),
      confidence: this.calculateConfidence(task),
      reasoning: { /* ... */ }
    };
  }

  private async detectComplexity(task: Task): Promise<Complexity> {
    const score = await this.calculateComplexityScore(task);
    if (score >= 80) return "critical";
    if (score >= 60) return "complex";
    if (score >= 30) return "moderate";
    return "simple";
  }
}

// Workflow planner
class WorkflowPlanner {
  async plan(analysis: TaskAnalysis): Promise<Workflow> {
    const baseWorkflow = this.selectBaseWorkflow(analysis);
    const parallelGroups = this.identifyParallelGroups(analysis);
    const estimates = this.calculateEstimates(baseWorkflow, parallelGroups);

    return {
      id: generateId(),
      task_analysis: analysis,
      agents: baseWorkflow.agents,
      parallel_groups: parallelGroups,
      estimates,
      metadata: { /* ... */ }
    };
  }
}
```

**Success criteria:**
- [ ] Orchestrator can analyze tasks
- [ ] Orchestrator can generate workflows
- [ ] Complexity detection works (test with sample tasks)

---

## Phase 2: Execution Engine (8 hours)

### Hour 9-10: Sequential Execution

**File:** `engine/execution-engine.ts`

**Tasks:**
1. Create ExecutionEngine class (1h)
2. Implement sequential agent execution (1h)

**Code to write:**
```typescript
export class ExecutionEngine {
  constructor(
    private agentRegistry: AgentRegistry,
    private artifactManager: ArtifactManager,
    private progressTracker: ProgressTracker
  ) {}

  async execute(workflow: Workflow): Promise<ExecutionResults> {
    const results: ExecutionResults = {
      workflow_id: workflow.id,
      agent_outputs: new Map(),
      artifacts: [],
      status: "in_progress"
    };

    for (const agentName of workflow.agents) {
      await this.executeAgent(agentName, workflow, results);
    }

    results.status = "complete";
    return results;
  }

  private async executeAgent(
    agentName: string,
    workflow: Workflow,
    results: ExecutionResults
  ): Promise<void> {
    const agent = this.agentRegistry.getAgent(agentName);
    const input = this.prepareAgentInput(agentName, workflow, results);

    this.progressTracker.update(`Starting ${agentName}...`);
    const output = await agent.execute(input);

    results.agent_outputs.set(agentName, output);
    for (const artifact of output.artifacts) {
      await this.artifactManager.save(artifact);
      results.artifacts.push(artifact);
    }

    this.progressTracker.update(`${agentName} complete`);
  }
}
```

**Success criteria:**
- [ ] Can execute agents sequentially
- [ ] Outputs pass between agents correctly
- [ ] Artifacts are saved

---

### Hour 11-13: Parallel Execution

**File:** `engine/parallel-executor.ts`

**Tasks:**
1. Create parallel execution logic (1.5h)
2. Implement dependency resolution (1h)
3. Add progress reporting for parallel (0.5h)

**Code to write:**
```typescript
export class ParallelExecutor {
  async executeParallelGroup(
    group: ParallelGroup,
    workflow: Workflow,
    results: ExecutionResults
  ): Promise<void> {
    this.progressTracker.update(`Running ${group.agents.join(" + ")} in parallel...`);

    const executions = group.agents.map(agentName =>
      this.executeAgent(agentName, workflow, results)
    );

    await Promise.all(executions);
    this.progressTracker.update(`Parallel group complete`);
  }

  private async executeAgent(
    agentName: string,
    workflow: Workflow,
    results: ExecutionResults
  ): Promise<void> {
    // Same as sequential but with parallel-safe state
    // ... implementation
  }
}
```

**Success criteria:**
- [ ] PM + Architect can run in parallel
- [ ] Outputs are correctly merged
- [ ] Dependencies are respected

---

### Hour 14: Progress Tracking

**File:** `engine/progress-tracker.ts`

**Tasks:**
1. Create ProgressTracker class (1h)

**Code to write:**
```typescript
export class ProgressTracker {
  private updates: ProgressUpdate[] = [];

  update(message: string): void {
    const update: ProgressUpdate = {
      timestamp: new Date().toISOString(),
      message,
      type: this.detectType(message)
    };
    this.updates.push(update);
    this.display(update);
  }

  getSummary(): ProgressSummary {
    return {
      total_updates: this.updates.length,
      agents_completed: this.countComplete(),
      percentage: this.calculatePercentage()
    };
  }

  private display(update: ProgressUpdate): void {
    const emoji = this.getEmoji(update.type);
    console.log(`${emoji} ${update.message}`);
  }

  private getEmoji(type: string): string {
    const map = {
      workflow_start: "🚀",
      agent_start: "▶️",
      agent_complete: "✅",
      parallel_start: "⚡",
      error: "❌"
    };
    return map[type] || "  ";
  }
}
```

**Success criteria:**
- [ ] Progress updates display correctly
- [ ] Summary is accurate
- [ ] Emojis render properly

---

### Hour 15-16: Error Handling

**File:** `engine/error-handler.ts`

**Tasks:**
1. Create error classification system (1h)
2. Implement recovery strategies (1h)

**Code to write:**
```typescript
export class ErrorHandler {
  async handle(error: AgentError, context: ExecutionContext): Promise<RecoveryAction> {
    const strategy = this.selectStrategy(error);

    switch (strategy) {
      case "retry":
        return await this.retry(error, context);
      case "fallback":
        return await this.useFallback(error, context);
      case "skip":
        return await this.skip(error, context);
      case "abort":
        return await this.abort(error, context);
    }
  }

  private selectStrategy(error: AgentError): RecoveryStrategy {
    if (error.code.startsWith("E1")) return "retry";
    if (error.code.startsWith("E2")) return "fallback";
    if (error.recoverable) return "skip";
    return "abort";
  }

  private async retry(error: AgentError, context: ExecutionContext): Promise<RecoveryAction> {
    // Retry with same input
    // ... implementation
  }

  private async useFallback(error: AgentError, context: ExecutionContext): Promise<RecoveryAction> {
    // Use alternative agent
    // ... implementation
  }
}
```

**Success criteria:**
- [ ] Errors are classified correctly
- [ ] Recovery strategies work
- [ ] User is informed of errors

---

## Phase 3: Integration (6 hours)

### Hour 17-18: UI/Prompt Interface

**File:** `scripts/interactive-mode.ts`

**Tasks:**
1. Create interactive mode script (1h)
2. Implement user approval flow (1h)

**Code to write:**
```typescript
export async function runInteractiveMode(taskDescription: string) {
  // 1. Initialize orchestrator
  const orchestrator = await initializeOrchestrator();

  // 2. Create task
  const task: Task = {
    id: generateId(),
    description: taskDescription,
    type: "feature", // Will be detected
    complexity: "moderate", // Will be detected
    // ... other fields
  };

  // 3. Run orchestrator
  const input: AgentInput = { task, /* ... */ };
  const output = await orchestrator.execute(input);

  // 4. Present workflow
  const workflow = output.output.content.data as Workflow;
  const approved = await presentWorkflow(workflow);

  if (!approved) {
    console.log("Workflow cancelled.");
    return;
  }

  // 5. Execute workflow
  const results = await executeWorkflow(workflow);

  // 6. Present results
  presentResults(results);
}

async function presentWorkflow(workflow: Workflow): Promise<boolean> {
  console.log(formatWorkflow(workflow));

  // Wait for user input
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\nPress Enter to continue, or "cancel" to stop: ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() !== 'cancel');
    });
  });
}

function formatWorkflow(workflow: Workflow): string {
  const analysis = workflow.task_analysis;

  return `
═══════════════════════════════════════════════════════════
                    ACTION PLAN
═══════════════════════════════════════════════════════════

Task: ${analysis.task_type.toUpperCase()}
Complexity: ${analysis.complexity.toUpperCase()} (${analysis.confidence}% confidence)

Estimated Time: ${workflow.estimates.estimated_minutes} minutes

═══════════════════════════════════════════════════════════
                    WORKFLOW
═══════════════════════════════════════════════════════════

${formatAgentSequence(workflow)}

═══════════════════════════════════════════════════════════
                    ANALYSIS
═══════════════════════════════════════════════════════════

${formatAnalysis(analysis)}

═══════════════════════════════════════════════════════════
`;
}
```

**Success criteria:**
- [ ] User can approve/cancel workflow
- [ ] Workflow is presented clearly
- [ ] User can provide modifications

---

### Hour 19-20: Artifact Management

**File:** `engine/artifact-manager.ts`

**Tasks:**
1. Create ArtifactManager class (1h)
2. Implement auto-save with metadata (1h)

**Code to write:**
```typescript
export class ArtifactManager {
  async save(artifact: Artifact): Promise<void> {
    const path = this.buildPath(artifact);
    const metadata = this.buildMetadata(artifact);

    // Ensure directory exists
    await fs.mkdir(path.dirname(path), { recursive: true });

    // Write artifact
    await fs.writeFile(path, artifact.content);

    // Write metadata
    await fs.writeFile(path + ".meta.json", JSON.stringify(metadata, null, 2));

    // Register in index
    await this.registerInIndex(artifact, path);
  }

  private buildPath(artifact: Artifact): string {
    return `${this.artifactsDir}/${artifact.id}/${artifact.name}`;
  }

  private buildMetadata(artifact: Artifact): ArtifactMetadata {
    return {
      id: artifact.id,
      name: artifact.name,
      type: artifact.type,
      created_at: new Date().toISOString(),
      size_bytes: artifact.size_bytes,
      checksum: artifact.checksum,
      agent: artifact.agent,
      task_id: artifact.task_id
    };
  }

  async listArtifacts(taskId: string): Promise<Artifact[]> {
    const index = await this.loadIndex();
    return index.filter(a => a.task_id === taskId);
  }
}
```

**Success criteria:**
- [ ] Artifacts are saved with metadata
- [ ] Artifact index is maintained
- [ ] Can retrieve artifacts by task

---

### Hour 21-22: Testing & Validation

**File:** `tests/interactive-mode.test.ts`

**Tasks:**
1. Test simple workflow (Dev only) (0.5h)
2. Test moderate workflow (PM → Dev) (0.5h)
3. Test complex workflow (PM → Arch → Dev → QA) (0.5h)
4. Test parallel execution (PM + Arch) (0.5h)
5. Test error handling (0.5h)
6. Fix bugs found (0.5h)

**Test cases:**
```typescript
describe("Interactive Mode", () => {
  test("Simple task - Dev only", async () => {
    const workflow = await orchestrator.execute({
      task: { description: "Add a button to form" }
    });
    expect(workflow.agents).toEqual(["dev"]);
  });

  test("Moderate task - PM → Dev", async () => {
    const workflow = await orchestrator.execute({
      task: { description: "Create user profile page" }
    });
    expect(workflow.agents).toEqual(["pm", "dev"]);
  });

  test("Complex task - Full workflow", async () => {
    const workflow = await orchestrator.execute({
      task: { description: "Search for 100K products" }
    });
    expect(workflow.agents).toContain("pm");
    expect(workflow.agents).toContain("architect");
    expect(workflow.agents).toContain("dev");
    expect(workflow.agents).toContain("qa");
  });

  test("Parallel execution", async () => {
    const workflow = await orchestrator.execute({
      task: { description: "Complex feature requiring planning" }
    });
    expect(workflow.parallel_groups.length).toBeGreaterThan(0);
  });

  test("Error recovery", async () => {
    // Test agent failure and recovery
    // ... implementation
  });
});
```

**Success criteria:**
- [ ] All tests pass
- [ ] Workflows execute correctly
- [ ] Artifacts are generated
- [ ] No critical bugs

---

## Phase 4: Polish (2 hours)

### Hour 23: Documentation

**Files:**
- `docs/interactive-mode/README.md`
- `docs/interactive-mode/USER-GUIDE.md`
- `docs/interactive-mode/ARCHITECTURE.md`

**Tasks:**
1. Write user guide (30min)
2. Write architecture documentation (30min)

**User guide sections:**
```markdown
# Interactive Mode User Guide

## Getting Started
...
## Basic Usage
...
## Workflow Options
...
## Troubleshooting
...
```

**Architecture documentation:**
```markdown
# Interactive Mode Architecture

## Overview
...
## Components
...
## Data Flow
...
## Extension Points
...
```

**Success criteria:**
- [ ] User guide is clear
- [ ] Architecture is documented
- [ ] Examples are provided

---

### Hour 24: Examples & Edge Cases

**File:** `examples/interactive-mode-examples.md`

**Tasks:**
1. Create example conversations (30min)
2. Handle edge cases (30min)

**Example conversations:**
```markdown
# Example 1: Simple Task
User: Add a submit button to the login form
Orchestrator: [analyzes and presents plan]
User: [approves]
Orchestrator: [executes Dev agent, returns code]

# Example 2: Complex Task with Parallel
User: Implement search with filters for 100K products
Orchestrator: [analyzes as complex, suggests parallel PM+Arch]
User: [approves]
Orchestrator: [runs PM + Arch in parallel, then Dev, then QA]

# Example 3: User Override
User: Create a basic API endpoint --simple
Orchestrator: [respects user override, uses Dev only]

# Example 4: Progressive Enhancement
User: Add user profile feature --progressive
Orchestrator: [runs Dev, asks if enhancement needed]
User: yes, add PM for requirements
Orchestrator: [runs PM, asks if more needed]
User: no, this is good
Orchestrator: [finalizes workflow]
```

**Edge cases to handle:**
- User cancels mid-workflow
- Agent fails with unrecoverable error
- User wants to modify workflow after approval
- Task description is too vague
- Conflicting dependencies

**Success criteria:**
- [ ] 4+ example conversations
- [ ] Edge cases are handled
- [ ] User can override workflow

---

## Quick Start Commands

After implementation, users can run:

```bash
# Interactive mode (default)
./scripts/interactive-mode.sh "Add search feature"

# Override to simple
./scripts/interactive-mode.sh "Add button" --simple

# Override to complex
./scripts/interactive-mode.sh "Add feature" --complex

# Progressive mode
./scripts/interactive-mode.sh "Add feature" --progressive

# Parallel mode (when available)
./scripts/interactive-mode.sh "Add feature" --parallel
```

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to first agent | < 30 seconds | Measure from task submission to first agent start |
| Parallel speedup | 20-30% faster | Compare PM+Arch parallel vs sequential |
| User satisfaction | 8/10 | Survey after use |
| Error recovery | < 5% failure rate | Track failed workflows |
| Artifact quality | Same as v2.0 | Compare artifact completeness |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Parallel execution causes conflicts | Use independent state, merge outputs carefully |
| Complexity detection is wrong | Allow user override with flags |
| Agent fails mid-workflow | Implement checkpoint/restart |
| Too much memory usage | Stream outputs, don't keep all in memory |
| User approval bottleneck | Make approval optional with --yes flag |

---

## Implementation Checklist

### Phase 1: Foundation (8h)
- [ ] Agent Protocol interfaces
- [ ] Agent Registry with auto-discovery
- [ ] Orchestrator Agent with TaskAnalyzer
- [ ] WorkflowPlanner with complexity detection

### Phase 2: Execution Engine (8h)
- [ ] Sequential execution
- [ ] Parallel execution
- [ ] Progress tracking with emoji updates
- [ ] Error handling with recovery

### Phase 3: Integration (6h)
- [ ] Interactive mode script
- [ ] User approval flow
- [ ] Artifact manager with metadata
- [ ] Test suite with 5+ tests

### Phase 4: Polish (2h)
- [ ] User guide documentation
- [ ] Architecture documentation
- [ ] Example conversations
- [ ] Edge case handling

---

## Post-Implementation

### Day 1 After:
- Test with real tasks
- Gather feedback
- Fix critical bugs

### Week 1 After:
- Performance optimization
- Additional features if needed
- Documentation improvements

### Month 1 After:
- Measure impact vs v2.0
- Iterate based on usage
- Plan v2.2 features

---

**Status:** Ready to Execute
**Estimated Completion:** 24 hours
**Target Release:** v2.1 - Interactive Multi-Agent Mode
