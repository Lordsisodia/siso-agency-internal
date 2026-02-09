# Blackbox3 Agent Protocol

**Version:** 1.0.0
**Status:** Draft
**Purpose:** Define the standard interface for all Blackbox3 agents

---

## Overview

The Agent Protocol enables **composable, stateless agents** that can be orchestrated by the Interactive Mode runtime. Any agent that implements this interface can participate in multi-agent workflows.

---

## Core Interface

```typescript
/**
 * Agent metadata and capabilities
 */
interface Agent {
  // Identity
  name: string;
  version: string;
  type: AgentType;

  // Description for orchestrator decision-making
  description: string;
  capabilities: string[];

  // Workflow configuration
  supported_complexities: Complexity[];
  supported_task_types: TaskType[];
  can_run_in_parallel: boolean;

  // Execution
  execute(input: AgentInput): Promise<AgentOutput>;
}

/**
 * Agent types in the system
 */
type AgentType =
  | "orchestrator"    // Coordinates other agents
  | "pm"             // Product management
  | "architect"      // Technical architecture
  | "dev"            // Implementation
  | "qa"             // Quality assurance
  | "analyst"        // Research and analysis
  | "tech-writer"    // Documentation
  | "sm"             // Scrum master
  | "custom";        // User-defined agents

/**
 * Task complexity levels
 */
type Complexity =
  | "simple"     // Single agent, fast track
  | "moderate"   // 2 agents sequentially
  | "complex"    // 3-4 agents with architecture
  | "critical";  // Full team with orchestrator

/**
 * Task types
 */
type TaskType =
  | "feature"    // New functionality
  | "bugfix"     // Fix defects
  | "research"   // Investigation
  | "refactor"   // Code improvements
  | "docs";      // Documentation
```

---

## Input Schema

```typescript
/**
 * Input passed to every agent
 */
interface AgentInput {
  // Task context
  task: Task;

  // Workflow context
  workflow: WorkflowContext;

  // Previous agent outputs (if any)
  previous_outputs: Map<string, AgentOutput>;

  // Shared context
  context: {
    project_root: string;
    plan_folder: string;
    artifacts_folder: string;
    user_id?: string;
    session_id: string;
  };

  // Configuration
  config: {
    verbose: boolean;
    dry_run: boolean;
    timeout_seconds: number;
  };
}

/**
 * The task to be performed
 */
interface Task {
  id: string;
  description: string;
  type: TaskType;
  complexity: Complexity;
  constraints: string[];
  dependencies: string[];

  // Requirements gathered so far
  requirements: {
    functional: string[];
    non_functional: string[];
    user_stories: UserStory[];
  };
}

/**
 * Workflow execution context
 */
interface WorkflowContext {
  current_step: number;
  total_steps: number;
  current_phase: "planning" | "execution" | "validation";

  // Agent sequence
  agent_sequence: AgentStep[];

  // Parallel groups
  parallel_groups?: ParallelGroup[];
}

interface AgentStep {
  agent: string;
  step_number: number;
  depends_on: number[];
  status: "pending" | "in_progress" | "complete" | "blocked";
}

interface ParallelGroup {
  group_id: string;
  agents: string[];
  run_mode: "parallel" | "sequential";
}

/**
 * User story format
 */
interface UserStory {
  id: string;
  title: string;
  as_a: string;
  i_want: string;
  so_that: string;
  acceptance_criteria: string[];
  priority: "high" | "medium" | "low";
}
```

---

## Output Schema

```typescript
/**
 * Output returned by every agent
 */
interface AgentOutput {
  // Agent identification
  agent_name: string;
  agent_type: AgentType;
  timestamp: string;

  // Execution metadata
  execution: {
    duration_seconds: number;
    tokens_used: number;
    status: "success" | "partial" | "failed";
    errors?: AgentError[];
  };

  // Primary output
  output: AgentResult;

  // Artifacts created
  artifacts: Artifact[];

  // Next step recommendations
  recommendations: {
    next_agents?: string[];
    modifications?: TaskModification[];
    blockers?: string[];
  };

  // Quality metrics
  quality: {
    completeness: number;  // 0-100
    confidence: number;    // 0-100
    satisfaction: number;  // 1-10
  };
}

/**
 * The primary result from the agent
 */
interface AgentResult {
  type: ResultType;

  // Content varies by type
  content:
    | { type: "requirements"; data: PRDocument }
    | { type: "architecture"; data: ArchitectureDocument }
    | { type: "implementation"; data: CodeBundle }
    | { type: "validation"; data: TestReport }
    | { type: "analysis"; data: AnalysisReport }
    | { type: "documentation"; data: Documentation };
}

type ResultType =
  | "requirements"
  | "architecture"
  | "implementation"
  | "validation"
  | "analysis"
  | "documentation";

/**
 * Artifact reference
 */
interface Artifact {
  id: string;
  name: string;
  type: "document" | "code" | "diagram" | "test";
  path: string;
  size_bytes: number;
  checksum: string;
}

/**
 * Error from agent execution
 */
interface AgentError {
  code: string;
  message: string;
  severity: "warning" | "error" | "critical";
  recoverable: boolean;
  context?: Record<string, unknown>;
}

/**
 * Suggested task modifications
 */
interface TaskModification {
  type: "scope" | "requirements" | "complexity";
  description: string;
  rationale: string;
  impact: string;
}
```

---

## Artifact Types

```typescript
/**
 * PR Document (PM output)
 */
interface PRDocument {
  title: string;
  version: string;
  last_updated: string;

  sections: {
    executive_summary: string;
    user_stories: UserStory[];
    functional_requirements: Requirement[];
    non_functional_requirements: Requirement[];
    ui_requirements: UIRequirement[];
    data_requirements: DataSchema[];
    assumptions: string[];
    risks: Risk[];
    release_criteria: string[];
  };
}

/**
 * Architecture Document (Architect output)
 */
interface ArchitectureDocument {
  title: string;
  version: string;
  last_updated: string;

  sections: {
    overview: string;
    system_architecture: SystemDiagram;
    database_schema: DatabaseSchema[];
    api_design: APISpec[];
    component_architecture: ComponentStructure[];
    state_management: StateStrategy;
    caching_strategy: CacheStrategy;
    performance: PerformancePlan;
    security: SecurityPlan;
    monitoring: MonitoringPlan;
  };
}

/**
 * Code Bundle (Dev output)
 */
interface CodeBundle {
  language: string;
  framework: string;

  files: CodeFile[];
  dependencies: Dependency[];
  configuration: ConfigFile[];
  tests: TestFile[];

  documentation: {
    readme: string;
    usage_examples: string[];
    migration_guide?: string;
  };
}

/**
 * Test Report (QA output)
 */
interface TestReport {
  title: string;
  version: string;
  date: string;

  results: {
    total_tests: number;
    passed: number;
    failed: number;
    skipped: number;
    pass_rate: number;
  };

  sections: {
    functional_tests: TestCase[];
    performance_tests: PerformanceTest[];
    security_tests: SecurityTest[];
    compatibility_tests: CompatibilityTest[];
    bugs_found: Bug[];
    production_approval: boolean;
  };
}
```

---

## Agent Lifecycle

```typescript
/**
 * States in an agent's lifecycle
 */
type AgentState =
  | "idle"        // Not assigned
  | "assigned"    // Task assigned, not started
  | "running"     // Currently executing
  | "waiting"     // Waiting for dependencies
  | "complete"    // Finished successfully
  | "failed";     // Finished with errors

/**
 * Agent execution flow
 */
interface AgentLifecycle {
  // 1. Discovery
  discover(): AgentManifest;

  // 2. Validation
  validate(input: AgentInput): ValidationResult;

  // 3. Pre-processing
  preprocess(input: AgentInput): ProcessedInput;

  // 4. Execution
  execute(input: ProcessedInput): Promise<AgentOutput>;

  // 5. Post-processing
  postprocess(output: AgentOutput): FinalOutput;

  // 6. Cleanup
  cleanup(): void;
}

interface AgentManifest {
  agent: Agent;
  schema: {
    input: JSONSchema;
    output: JSONSchema;
  };
  examples: Example[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

---

## Parallel Execution Protocol

```typescript
/**
 * Defines how agents can run in parallel
 */
interface ParallelExecution {
  // Groups that can run simultaneously
  groups: ParallelGroup[];

  // Dependencies between groups
  dependencies: GroupDependency[];

  // Resource constraints
  constraints: {
    max_parallel_agents: number;
    max_memory_per_agent: number;
    max_total_tokens: number;
  };
}

interface GroupDependency {
  from_group: string;
  to_group: string;
  condition: "all_complete" | "any_complete" | "output_matches";
}

/**
 * Example parallel workflow:
 */
interface ParallelWorkflowExample {
  planning_phase: {
    mode: "parallel";
    agents: ["pm", "architect"];
    timeout: 300; // 5 minutes
  };

  execution_phase: {
    mode: "sequential";
    agents: ["dev"];
    depends_on: ["planning_phase"];
  };

  validation_phase: {
    mode: "parallel";
    agents: ["qa", "security"];
    depends_on: ["execution_phase"];
  };
}
```

---

## Error Handling

```typescript
/**
 * Standard error codes
 */
enum AgentErrorCode {
  // Input errors
  INVALID_INPUT = "E001",
  MISSING_REQUIREMENTS = "E002",
  CONSTRAINT_VIOLATION = "E003",

  // Execution errors
  EXECUTION_TIMEOUT = "E101",
  TOKEN_LIMIT_EXCEEDED = "E102",
  DEPENDENCY_FAILED = "E103",

  // Output errors
  INVALID_OUTPUT_FORMAT = "E201",
  MISSING_REQUIRED_ARTIFACTS = "E202",
  VALIDATION_FAILED = "E203",

  // System errors
  AGENT_NOT_FOUND = "E301",
  REGISTRATION_FAILED = "E302",
  STATE_CORRUPTION = "E303";
}

/**
 * Error recovery strategies
 */
type RecoveryStrategy =
  | "retry"           // Try again with same input
  | "fallback"        // Use alternative agent
  | "skip"            // Continue without this agent
  | "abort";          // Stop the workflow

interface ErrorRecovery {
  code: AgentErrorCode;
  strategy: RecoveryStrategy;
  max_retries: number;
  fallback_agent?: string;
}
```

---

## Version Compatibility

```typescript
/**
 * Protocol versioning
 */
interface ProtocolVersion {
  major: number;  // Breaking changes
  minor: number;  // Backward compatible additions
  patch: number;  // Bug fixes
}

/**
 * Agent compatibility
 */
interface AgentCompatibility {
  protocol_version: ProtocolVersion;
  min_compatible: ProtocolVersion;
  max_compatible: ProtocolVersion;

  deprecated_features: string[];
  required_features: string[];
}
```

---

## Example Agent Implementation

```typescript
/**
 * Example: Developer Agent
 */
class DeveloperAgent implements Agent {
  name = "dev";
  version = "1.0.0";
  type = "dev" as AgentType;

  description = "Implements code based on requirements and architecture";
  capabilities = [
    "write_code",
    "create_tests",
    "write_documentation",
    "refactor_code"
  ];

  supported_complexities: Complexity[] = ["simple", "moderate", "complex", "critical"];
  supported_task_types: TaskType[] = ["feature", "bugfix", "refactor"];
  can_run_in_parallel = false; // Dev usually runs sequentially

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start_time = Date.now();

    try {
      // 1. Validate input
      if (!input.task.requirements.functional.length) {
        throw new Error("No requirements provided");
      }

      // 2. Generate code
      const code = await this.generateImplementation(input);

      // 3. Create artifacts
      const artifacts = await this.saveArtifacts(code);

      // 4. Return output
      return {
        agent_name: this.name,
        agent_type: this.type,
        timestamp: new Date().toISOString(),

        execution: {
          duration_seconds: (Date.now() - start_time) / 1000,
          tokens_used: this.estimateTokens(code),
          status: "success"
        },

        output: {
          type: "implementation",
          content: { type: "implementation", data: code }
        },

        artifacts,
        recommendations: {
          next_agents: this.suggestNextAgents(input, code)
        },
        quality: {
          completeness: 95,
          confidence: 90,
          satisfaction: 9
        }
      };

    } catch (error) {
      return {
        agent_name: this.name,
        agent_type: this.type,
        timestamp: new Date().toISOString(),
        execution: {
          duration_seconds: (Date.now() - start_time) / 1000,
          tokens_used: 0,
          status: "failed",
          errors: [{
            code: "E101",
            message: error.message,
            severity: "error",
            recoverable: false
          }]
        },
        output: null,
        artifacts: [],
        recommendations: {},
        quality: { completeness: 0, confidence: 0, satisfaction: 0 }
      };
    }
  }

  private async generateImplementation(input: AgentInput): Promise<CodeBundle> {
    // Implementation specific to Dev agent
    return {} as CodeBundle;
  }

  // ... other methods
}
```

---

## Implementation Checklist

To create a new agent:

1. **Implement the Agent interface**
   - [ ] Define metadata (name, version, type, description)
   - [ ] List capabilities
   - [ ] Specify supported complexities and task types
   - [ ] Set parallel execution support

2. **Implement execute() method**
   - [ ] Validate input
   - [ ] Perform agent-specific work
   - [ ] Create artifacts
   - [ ] Return AgentOutput with all required fields

3. **Handle errors**
   - [ ] Use standard error codes
   - [ ] Provide recovery strategies
   - [ ] Log appropriately

4. **Provide examples**
   - [ ] Input examples
   - [ ] Output examples
   - [ ] Use cases

5. **Test integration**
   - [ ] Test with orchestrator
   - [ ] Test in parallel workflows
   - [ ] Test error scenarios

---

**Status:** Draft v1.0.0
**Last Updated:** 2026-01-15
