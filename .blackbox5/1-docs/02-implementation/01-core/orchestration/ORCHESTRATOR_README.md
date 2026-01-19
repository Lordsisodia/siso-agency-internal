# Multi-Agent Orchestrator

## Overview

The `AgentOrchestrator` is a powerful multi-agent coordination system adapted from Auto-Claude's orchestration patterns. It manages multiple AI agents with unique IDs, persistent memory, and sophisticated workflow execution capabilities.

## Key Features

### Unique Agent IDs
- Automatic ID generation: `developer_1`, `researcher_2`, etc.
- Custom IDs supported
- Type-based counters prevent conflicts

### Persistent Memory
- Each agent maintains its own memory store
- Survives agent restarts
- JSON-based storage in `.blackbox5/agent_memory/`

### Workflow Execution
- Sequential workflows with dependencies
- Parallel execution for independent tasks
- Result aggregation and error handling

### Coordination & Safety
- Concurrent agent limits
- Event-driven lifecycle updates
- Integration with BlackBox5 TaskRouter and EventBus

## Architecture

```
AgentOrchestrator
├── Agent Registry (agent_id → AgentInstance)
├── Type Counters (agent_type → count)
├── Workflow Registry (workflow_id → WorkflowResult)
└── Memory Manager (persistent storage)
```

### Agent Lifecycle

```
IDLE → STARTING → RUNNING → [COMPLETED | FAILED | STOPPED]
```

## Usage

### Basic Setup

```python
from blackbox5.engine.core import (
    AgentOrchestrator,
    RedisEventBus,
    TaskRouter,
    create_orchestrator
)

# Create with dependencies
event_bus = RedisEventBus()
task_router = TaskRouter()

orchestrator = AgentOrchestrator(
    event_bus=event_bus,
    task_router=task_router,
    memory_base_path=Path(".blackbox5/agent_memory"),
    max_concurrent_agents=5
)

# Or use convenience function
orchestrator = create_orchestrator(
    event_bus=event_bus,
    task_router=task_router
)
```

### Starting Agents

```python
# Auto-generated ID
agent_id = orchestrator.start_agent(
    agent_type="developer",
    task="Build user authentication feature",
    model="claude-sonnet-4-5-20250929",
    memory_enabled=True
)
# Result: "developer_1"

# Custom ID
agent_id = orchestrator.start_agent(
    agent_type="tester",
    task="Test authentication",
    agent_id="auth_tester_1"
)

# Check status
status = orchestrator.get_agent_status(agent_id)
print(status)
# {
#     "agent_id": "developer_1",
#     "agent_type": "developer",
#     "state": "starting",
#     "created_at": "2025-01-18T10:30:00",
#     "memory_enabled": true
# }
```

### Sequential Workflows

```python
from blackbox5.engine.core import WorkflowStep

# Define workflow
workflow = [
    WorkflowStep(
        agent_type="planner",
        task="Create implementation plan for authentication"
    ),
    WorkflowStep(
        agent_type="developer",
        task="Implement login API endpoint"
    ),
    WorkflowStep(
        agent_type="tester",
        task="Write integration tests"
    ),
    WorkflowStep(
        agent_type="reviewer",
        task="Review code and suggest improvements"
    )
]

# Execute workflow
result = orchestrator.execute_workflow(workflow)

print(f"State: {result.state}")  # WorkflowState.COMPLETED
print(f"Steps: {result.steps_completed}/{result.steps_total}")
print(f"Results: {result.results}")

# Access individual agent results
for agent_id, agent_result in result.results.items():
    print(f"{agent_id}: {agent_result['status']}")
```

### Parallel Execution

```python
import asyncio

# Define independent tasks
tasks = [
    WorkflowStep(agent_type="developer", task="Build REST API"),
    WorkflowStep(agent_type="developer", task="Build GraphQL API"),
    WorkflowStep(agent_type="developer", task="Build WebSocket server"),
    WorkflowStep(agent_type="tester", task="Write API tests"),
]

# Execute in parallel (async)
results = await orchestrator.parallel_execute(tasks)

# Process results
for result in results:
    if result.success:
        print(f"{result.agent_id}: SUCCESS - {result.result}")
    else:
        print(f"{result.agent_id}: FAILED - {result.error}")
```

### Workflow with Dependencies

```python
# Complex workflow with dependencies
workflow = [
    WorkflowStep(
        agent_type="researcher",
        task="Research authentication best practices",
        agent_id="auth_researcher"
    ),
    WorkflowStep(
        agent_type="planner",
        task="Create authentication implementation plan",
        depends_on=["auth_researcher"]  # Waits for researcher
    ),
    # Parallel development
    WorkflowStep(
        agent_type="developer",
        task="Build backend auth",
        parallel=True,
        depends_on=["planner"]
    ),
    WorkflowStep(
        agent_type="developer",
        task="Build frontend auth UI",
        parallel=True,
        depends_on=["planner"]
    ),
    WorkflowStep(
        agent_type="tester",
        task="Test authentication flow",
        depends_on=["developer_1", "developer_2"]  # Waits for both devs
    )
]

result = orchestrator.execute_workflow(workflow)
```

### Agent Memory

```python
# Start agent with memory
agent_id = orchestrator.start_agent(
    "developer",
    task="Build feature",
    memory_enabled=True
)

# Agent accumulates memory during execution
agent = orchestrator._agents[agent_id]
agent.memory["patterns"] = "Use React hooks for state"
agent.memory["gotchas"] = "API endpoint requires auth token"

# Memory is automatically saved when agent stops
orchestrator.stop_agent(agent_id)

# Later, restart with same ID - memory is loaded
agent_id_2 = orchestrator.start_agent(
    "developer",
    task="Continue work",
    agent_id=agent_id,  # Same ID
    memory_enabled=True
)

# Memory is preserved
agent_2 = orchestrator._agents[agent_id_2]
print(agent_2.memory["patterns"])  # "Use React hooks for state"
```

### Listing and Filtering Agents

```python
# List all agents
all_agents = orchestrator.list_agents()

# Filter by type
developers = orchestrator.list_agents(agent_type="developer")

# Filter by state
running = orchestrator.list_agents(state=AgentState.RUNNING)
completed = orchestrator.list_agents(state=AgentState.COMPLETED)

# Combined filters
idle_devs = orchestrator.list_agents(
    agent_type="developer",
    state=AgentState.IDLE
)
```

### Cleanup

```python
# Remove completed agents older than 1 hour
cleaned = orchestrator.cleanup_completed_agents(older_than_seconds=3600)
print(f"Cleaned up {cleaned} agents")

# Get statistics
stats = orchestrator.get_statistics()
print(f"Total agents: {stats['total_agents']}")
print(f"By state: {stats['agents_by_state']}")
print(f"By type: {stats['agents_by_type']}")
print(f"Workflows: {stats['completed_workflows']}/{stats['total_workflows']}")
```

## Advanced Usage

### Integration with TaskRouter

```python
# Route tasks based on complexity
task = Task(
    task_id="task_001",
    description="Build complex feature",
    domain="backend"
)

# Get routing decision
decision = task_router.route(task)

if decision.strategy == ExecutionStrategy.MULTI_AGENT:
    # Use orchestrator for complex tasks
    workflow = create_workflow_from_task(task)
    result = orchestrator.execute_workflow(workflow)
else:
    # Single agent is sufficient
    agent_id = orchestrator.start_agent(
        agent_type=decision.agent_type.value,
        task=task.description
    )
```

### Event-Driven Monitoring

```python
from blackbox5.engine.core import EventType, Priority

# Subscribe to agent lifecycle events
def on_agent_event(event):
    print(f"Agent {event.data['agent_id']}: {event.event_type.value}")

event_bus.subscribe("agent.lifecycle", on_agent_event)

# Now all agent lifecycle events will be logged
agent_id = orchestrator.start_agent("developer", task="Build feature")
# Output: "Agent developer_1: task_created"

orchestrator.stop_agent(agent_id)
# Output: "Agent developer_1: task_completed"
```

### Custom Agent Types

```python
# Define custom agent type
agent_id = orchestrator.start_agent(
    agent_type="security_auditor",
    task="Audit authentication implementation",
    metadata={
        "focus_areas": ["OWASP Top 10", "auth protocols"],
        "severity_threshold": "high"
    }
)
```

## API Reference

### AgentOrchestrator

#### Constructor

```python
AgentOrchestrator(
    event_bus: Optional[RedisEventBus] = None,
    task_router: Optional[TaskRouter] = None,
    memory_base_path: Optional[Path] = None,
    max_concurrent_agents: int = 5
)
```

#### Methods

##### `start_agent()`
Start a new agent instance.

```python
start_agent(
    agent_type: str,
    task: Optional[str] = None,
    agent_id: Optional[str] = None,
    model: str = "claude-sonnet-4-5-20250929",
    max_thinking_tokens: Optional[int] = None,
    memory_enabled: bool = True,
    metadata: Optional[Dict[str, Any]] = None
) -> str
```

**Returns:** Agent ID

##### `stop_agent()`
Stop a running agent.

```python
stop_agent(agent_id: str) -> bool
```

**Returns:** True if stopped successfully

##### `get_agent_status()`
Get agent status.

```python
get_agent_status(agent_id: str) -> Optional[Dict[str, Any]]
```

##### `execute_workflow()`
Execute a sequential workflow.

```python
execute_workflow(
    workflow: List[Union[WorkflowStep, Dict[str, Any]]],
    workflow_id: Optional[str] = None
) -> WorkflowResult
```

##### `parallel_execute()`
Execute tasks in parallel (async).

```python
async parallel_execute(
    tasks: List[Union[Dict[str, Any], WorkflowStep]]
) -> List[ParallelTaskResult]
```

##### `list_agents()`
List agents with optional filters.

```python
list_agents(
    agent_type: Optional[str] = None,
    state: Optional[AgentState] = None
) -> List[Dict[str, Any]]
```

##### `cleanup_completed_agents()`
Remove old completed agents.

```python
cleanup_completed_agents(older_than_seconds: int = 3600) -> int
```

**Returns:** Number of agents removed

##### `get_statistics()`
Get orchestrator statistics.

```python
get_statistics() -> Dict[str, Any]
```

### Data Classes

#### `WorkflowStep`
```python
WorkflowStep(
    agent_type: str,
    task: str,
    agent_id: Optional[str] = None,
    depends_on: List[str] = [],
    parallel: bool = False,
    timeout: int = 300,
    metadata: Dict[str, Any] = {}
)
```

#### `AgentConfig`
```python
AgentConfig(
    agent_type: str,
    agent_id: str,
    task: Optional[str] = None,
    model: str = "claude-sonnet-4-5-20250929",
    max_thinking_tokens: Optional[int] = None,
    memory_enabled: bool = True,
    memory_path: Optional[Path] = None,
    metadata: Dict[str, Any] = {}
)
```

#### `WorkflowResult`
```python
WorkflowResult(
    workflow_id: str,
    state: WorkflowState,
    steps_completed: int,
    steps_total: int,
    results: Dict[str, Any] = {},
    errors: Dict[str, str] = {},
    started_at: Optional[datetime] = None,
    completed_at: Optional[datetime] = None
)
```

#### `ParallelTaskResult`
```python
ParallelTaskResult(
    task_id: str,
    agent_id: str,
    agent_type: str,
    success: bool,
    result: Optional[Any] = None,
    error: Optional[str] = None,
    duration: float = 0.0
)
```

## Best Practices

### 1. Agent Type Naming
Use descriptive, consistent names:
- ✅ `developer`, `tester`, `planner`, `researcher`
- ❌ `dev`, `test`, `plan` (too short)

### 2. Workflow Design
- Keep workflows focused on a single feature/goal
- Use parallel execution for independent tasks
- Specify dependencies explicitly
- Set reasonable timeouts

### 3. Memory Management
- Enable memory for agents that need context persistence
- Disable memory for short-lived, stateless tasks
- Periodically clean up old agents

### 4. Error Handling
```python
try:
    result = orchestrator.execute_workflow(workflow)
    if result.state == WorkflowState.FAILED:
        for agent_id, error in result.errors.items():
            print(f"Agent {agent_id} failed: {error}")
            # Retry or handle error
except Exception as e:
    print(f"Workflow failed: {e}")
```

### 5. Resource Management
```python
# Set appropriate concurrent limits
orchestrator = AgentOrchestrator(
    max_concurrent_agents=3  # Based on your resources
)

# Clean up periodically
orchestrator.cleanup_completed_agents(older_than_seconds=3600)
```

## Examples

### Example 1: Feature Development Workflow

```python
def develop_feature(feature_description: str):
    """Complete workflow for developing a feature."""
    workflow = [
        WorkflowStep(
            agent_type="researcher",
            task=f"Research best practices for: {feature_description}"
        ),
        WorkflowStep(
            agent_type="planner",
            task="Create detailed implementation plan"
        ),
        WorkflowStep(
            agent_type="developer",
            task="Implement the feature"
        ),
        WorkflowStep(
            agent_type="tester",
            task="Write and run tests"
        ),
        WorkflowStep(
            agent_type="reviewer",
            task="Review implementation and suggest improvements"
        )
    ]

    result = orchestrator.execute_workflow(workflow)

    if result.state == WorkflowState.COMPLETED:
        print("Feature developed successfully!")
        return result.results
    else:
        print("Feature development failed:")
        for error in result.errors.values():
            print(f"  - {error}")
        return None
```

### Example 2: Parallel Component Development

```python
async def develop_components(components: List[str]):
    """Develop multiple components in parallel."""
    tasks = [
        WorkflowStep(
            agent_type="developer",
            task=f"Build {component} component"
        )
        for component in components
    ]

    results = await orchestrator.parallel_execute(tasks)

    successful = [r for r in results if r.success]
    failed = [r for r in results if not r.success]

    print(f"Built {len(successful)} components successfully")
    if failed:
        print(f"Failed to build {len(failed)} components")
        for f in failed:
            print(f"  - {f.agent_id}: {f.error}")

    return successful
```

### Example 3: Continuous Testing

```python
async def continuous_testing_loop():
    """Run tests in parallel with development."""
    while True:
        # Get all developer agents
        developers = orchestrator.list_agents(agent_type="developer")

        if developers:
            # Create test tasks for each dev's work
            test_tasks = [
                WorkflowStep(
                    agent_type="tester",
                    task=f"Test {dev['agent_id']}'s recent changes"
                )
                for dev in developers
                if dev['state'] == 'completed'
            ]

            if test_tasks:
                # Run tests in parallel
                results = await orchestrator.parallel_execute(test_tasks)

                # Report results
                for r in results:
                    if not r.success:
                        print(f"Test failed for {r.agent_id}: {r.error}")

        # Wait before next iteration
        await asyncio.sleep(60)
```

## Comparison with Auto-Claude

| Feature | Auto-Claude | BlackBox5 Orchestrator |
|---------|-------------|------------------------|
| Agent IDs | Session-based | Type-based counters |
| Memory | Graphiti-based | JSON files (extensible) |
| Workflow | Sequential only | Sequential + Parallel |
| Coordination | Spec-based | WorkflowStep based |
| Integration | Claude SDK | TaskRouter + EventBus |
| Concurrency | Limited | Configurable limits |

## Future Enhancements

- [ ] Integration with Graphiti memory for advanced context
- [ ] Workflow templates for common patterns
- [ ] Agent pooling and reuse
- [ ] Workflow visualization and debugging
- [ ] Distributed execution across machines
- [ ] Agent communication channels
- [ ] Workflow versioning and rollback
