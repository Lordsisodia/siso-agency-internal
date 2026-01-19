# GSD Quick Reference Card

## How to Use GSD with BlackBox5 - In 3 Steps

### Step 1: Import and Create Orchestrator

```python
from pathlib import Path
from core.Orchestrator import AgentOrchestrator, WorkflowStep

orchestrator = AgentOrchestrator(
    memory_base_path=Path(".blackbox5/my_workspace"),
    enable_checkpoints=True,           # Crash recovery
    enable_atomic_commits=True,         # Auto git commits
    enable_state_management=True        # STATE.md progress
)
```

### Step 2: Define Tasks with Dependencies

```python
tasks = [
    # Wave 1: Independent (parallel)
    WorkflowStep(
        agent_type="developer",
        task="Setup database",
        agent_id="task_db",
        depends_on=[]  # Empty = Wave 1
    ),
    WorkflowStep(
        agent_type="developer",
        task="Build UI",
        agent_id="task_ui",
        depends_on=[]  # Empty = Wave 1 (parallel)
    ),

    # Wave 2: Depends on Wave 1
    WorkflowStep(
        agent_type="developer",
        task="Build API",
        agent_id="task_api",
        depends_on=["task_db"]  # Waits for task_db
    ),

    # Wave 3: Depends on Wave 2
    WorkflowStep(
        agent_type="tester",
        task="Test API",
        agent_id="task_test",
        depends_on=["task_api"]  # Waits for task_api
    ),
]
```

### Step 3: Execute

```python
result = await orchestrator.execute_wave_based(
    tasks=tasks,
    workflow_id="my_workflow"
)

print(f"Completed: {result.steps_completed}/{result.steps_total}")
print(f"Waves: {result.waves_completed}")
```

---

## Key Concepts

### `depends_on` Controls Wave Structure

- `depends_on=[]` → **Wave 1** (runs first)
- `depends_on=["task1"]` → **Wave 2** (waits for task1)
- `depends_on=["task1", "task2"]` → **Wave 3** (waits for both)

The orchestrator **automatically**:
1. Builds dependency graph
2. Organizes into waves using topological sort
3. Executes each wave's tasks in parallel
4. Waits for all tasks in wave N before starting wave N+1

### Result Files

- **STATE.md** - Human-readable progress at `.blackbox5/my_workspace/STATE.md`
- **Checkpoints** - Crash recovery state at `.blackbox5/my_workspace/checkpoints/`
- **Commits** - Atomic git commits (one per task)

---

## Common Patterns

### Parallel Independent Tasks

```python
tasks = [
    WorkflowStep(agent_type="dev", task="Task A", agent_id="a", depends_on=[]),
    WorkflowStep(agent_type="dev", task="Task B", agent_id="b", depends_on=[]),
    WorkflowStep(agent_type="dev", task="Task C", agent_id="c", depends_on=[]),
]
# Result: 1 wave with 3 parallel tasks
```

### Sequential Pipeline

```python
tasks = [
    WorkflowStep(agent_type="dev", task="Task 1", agent_id="t1", depends_on=[]),
    WorkflowStep(agent_type="dev", task="Task 2", agent_id="t2", depends_on=["t1"]),
    WorkflowStep(agent_type="dev", task="Task 3", agent_id="t3", depends_on=["t2"]),
]
# Result: 3 waves, 1 task each (sequential)
```

### Diamond Dependency

```python
tasks = [
    WorkflowStep(agent_type="dev", task="Setup", agent_id="setup", depends_on=[]),
    WorkflowStep(agent_type="dev", task="Frontend", agent_id="fe", depends_on=["setup"]),
    WorkflowStep(agent_type="dev", task="Backend", agent_id="be", depends_on=["setup"]),
    WorkflowStep(agent_type="dev", task="Integration", agent_id="int", depends_on=["fe", "be"]),
]
# Result: 3 waves
# Wave 1: [setup]
# Wave 2: [fe, be] (parallel)
# Wave 3: [int]
```

---

## Crash Recovery

If workflow crashes:

```python
# Load last checkpoint
checkpoint = orchestrator.load_checkpoint("my_workflow_wave2")

# Resume with remaining tasks
result = await orchestrator.resume_workflow(
    checkpoint_id="my_workflow_wave2",
    remaining_tasks=[task3, task4]  # Only tasks after wave 2
)
```

---

## Full Example

See `examples/simple_gsd_starter.py` for a complete working example.

Run it:
```bash
python3 .blackbox5/examples/simple_gsd_starter.py
```

---

## What About My Existing Agents?

Your existing agent classes work with GSD! Just specify them in `agent_type`:

```python
from agents.agents.DeveloperAgent import DeveloperAgent
from agents.agents.ArchitectAgent import ArchitectAgent

tasks = [
    WorkflowStep(
        agent_type="architect",  # Uses ArchitectAgent
        task="Design system",
        agent_id="task_arch",
        depends_on=[]
    ),
    WorkflowStep(
        agent_type="developer",  # Uses DeveloperAgent
        task="Implement system",
        agent_id="task_impl",
        depends_on=["task_arch"]
    ),
]
```

---

## Summary

| Feature | How to Enable |
|---------|---------------|
| Parallel execution | Use `execute_wave_based()` |
| Crash recovery | `enable_checkpoints=True` |
| Auto commits | `enable_atomic_commits=True` |
| Progress tracking | `enable_state_management=True` |
| Control wave order | Use `depends_on=[]` for Wave 1, `depends_on=["task1"]` for Wave 2 |

That's it! 3 steps to 10x faster execution.
