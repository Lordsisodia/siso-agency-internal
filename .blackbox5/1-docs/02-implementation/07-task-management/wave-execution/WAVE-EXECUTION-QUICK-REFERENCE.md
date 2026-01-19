# Wave-Based Execution - Quick Reference

## Overview

Wave-Based Execution organizes tasks into waves based on dependencies and executes them in parallel for up to 10x faster workflow execution.

## Basic Usage

```python
from engine.core.Orchestrator import AgentOrchestrator, WorkflowStep

orchestrator = AgentOrchestrator()

tasks = [
    WorkflowStep(
        agent_type="developer",
        task="Setup database",
        agent_id="setup_db"
    ),
    WorkflowStep(
        agent_type="developer",
        task="Build API",
        agent_id="build_api",
        depends_on=["setup_db"]  # Depends on setup_db
    ),
]

result = await orchestrator.execute_wave_based(tasks)
```

## Common Patterns

### 1. Linear Chain
```
A → B → C
```
Result: 3 waves, 1 task each

### 2. Diamond Pattern
```
    → B ─┐
A        → D
    → C ─┘
```
Result: 3 waves - [A], [B,C], [D]

### 3. Independent Tasks
```
A   B   C
```
Result: 1 wave with all 3 tasks in parallel

### 4. Complex DAG
```
A   B
│ ╲ │
C  D
│ ╲ │
  E
```
Result: 3 waves - [A,B], [C,D], [E]

## API Reference

### `execute_wave_based(tasks, workflow_id=None)`

**Parameters:**
- `tasks` (List[WorkflowStep]): Tasks to execute
- `workflow_id` (str, optional): Custom workflow ID

**Returns:** `WorkflowResult`

**WorkflowResult Fields:**
- `workflow_id` (str): Workflow identifier
- `state` (WorkflowState): COMPLETED, FAILED, or PARTIAL
- `steps_completed` (int): Number of tasks completed
- `steps_total` (int): Total number of tasks
- `waves_completed` (int): Number of waves executed
- `wave_details` (List[WaveResult]): Detailed results per wave
- `results` (Dict): Task results by agent_id
- `errors` (Dict): Errors by agent_id

**WaveResult Fields:**
- `wave_number` (int): Wave sequence number
- `task_ids` (List[str]): Task IDs in this wave
- `results` (List[ParallelTaskResult]): Task results
- `started_at` (datetime): Wave start time
- `completed_at` (datetime): Wave completion time
- `success_count` (int): Number of successful tasks
- `failure_count` (int): Number of failed tasks

## WorkflowStep Fields

```python
WorkflowStep(
    agent_type="developer",     # Required: Agent type
    task="Build feature",       # Required: Task description
    agent_id="task_1",          # Optional: Task ID (auto-generated if None)
    depends_on=["task_0"],      # Optional: List of task IDs this depends on
    parallel=False,             # Optional: Hint for parallel execution
    timeout=300,                # Optional: Timeout in seconds
    metadata={}                 # Optional: Additional metadata
)
```

## Error Handling

### Circular Dependencies

```python
tasks = [
    WorkflowStep(agent_type="dev", task="A", agent_id="a", depends_on=["c"]),
    WorkflowStep(agent_type="dev", task="B", agent_id="b", depends_on=["a"]),
    WorkflowStep(agent_type="dev", task="C", agent_id="c", depends_on=["b"]),
]

result = await orchestrator.execute_wave_based(tasks)
# result.state == WorkflowState.FAILED
# result.errors["circular_dependency"] == "Circular dependency detected..."
```

### Partial Failures

Tasks continue even if some fail:

```python
result = await orchestrator.execute_wave_based(tasks)

for wave in result.wave_details:
    if wave.failure_count > 0:
        print(f"Wave {wave.wave_number} had {wave.failure_count} failures")
```

## Performance Tips

1. **Maximize Parallelism**: Structure tasks to minimize dependencies
2. **Balance Waves**: Aim for similar number of tasks per wave
3. **Critical Path**: Identify and optimize the longest dependency chain
4. **Independent Tasks**: Tasks with no dependencies run in first wave

## Examples

See `.blackbox5/examples/wave_execution_example.py` for complete examples.

## Testing

Run tests:
```bash
python3 -m pytest .blackbox5/tests/test_wave_execution.py -v
```

## Implementation Details

- **Algorithm**: Kahn's topological sort
- **Time Complexity**: O(V + E) where V=tasks, E=dependencies
- **Space Complexity**: O(V + E)
- **Integration**: Uses existing `parallel_execute()` for wave execution
