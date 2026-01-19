# Agent Orchestration

**Capability**: Orchestrate multiple agents in parallel for complex development tasks

---

## When to Use

Use this skill when:
- Building complex features that can be parallelized
- Need to coordinate multiple agents working on different parts
- Want real-time progress tracking via Vibe Kanban
- Complex tasks require autonomous loops (Ralphy)

## What It Does

1. **Planning**: Creates PRD, Epic, and Tasks from requirements
2. **Orchestration**: Coordinates 5+ agents working in parallel
3. **Execution**: Complex tasks use Ralphy loops, simple tasks direct
4. **Tracking**: Everything tracked in Project Memory

## Quick Start

```python
from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent
from blackbox5.engine.agents.workflows.orchestrator_agent import OrchestratorAgent

# Plan and execute
plan = PlanningAgent().plan_and_push("Build your project")
results = OrchestratorAgent().orchestrate_parallel_execution()
```

## Documentation

**Primary Reference**:
- `.blackbox5/5-project-memory/siso-internal/operations/README.md`

**Quick Start**:
- `.blackbox5/5-project-memory/siso-internal/operations/docs/QUICK-START.md`

**Complete Workflow**:
- `.blackbox5/5-project-memory/siso-internal/operations/docs/AGENT-ORCHESTRATION-WORKFLOW.md`

**Setup Guide**:
- `.blackbox5/1-docs/03-guides/02-tutorials/AGENT-ORCHESTRATION-SETUP-CHECKLIST.md`

## Verification

Before using, verify setup:

```bash
bash .blackbox5/1-docs/03-guides/02-tutorials/check-prerequisites.sh
python .blackbox5/1-docs/03-guides/02-tutorials/test-complete-workflow.py
```

## Workflow

```
User Requirements
    ↓
Planning Agent (creates tasks)
    ↓
Vibe Kanban (visual board)
    ↓
Orchestrator (coordinates agents)
    ↓
5 Parallel Agents
    ├─ Complex tasks → Ralphy loop
    └─ Simple tasks → Direct
    ↓
Project Memory (tracks everything)
```

## Monitoring

- **Vibe Kanban**: http://localhost:3001
- **Project Memory**: `.blackbox5/5-project-memory/siso-internal/operations/`
- **Git**: `git log --oneline`

## Example

```python
# Complete example
from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent
from blackbox5.engine.agents.workflows.orchestrator_agent import OrchestratorAgent

# 1. Plan
plan = PlanningAgent().plan_and_push(
    "Build multi-tenant SaaS with auth"
)

print(f"Tasks: {plan['tasks']}")
print(f"Kanban: {plan['kanban_url']}")

# 2. Execute
results = OrchestratorAgent().orchestrate_parallel_execution()

# 3. Results
for result in results:
    print(f"{result['agent']}: {result['result']['success']}")
```

## See Also

- **Ralphy Integration**: `.blackbox5/5-project-memory/siso-internal/operations/docs/RALPHY-INTEGRATION.md`
- **Vibe Kanban**: `.blackbox5/5-project-memory/siso-internal/operations/docs/VIBE-KANBAN.md`
- **API Reference**: `.blackbox5/5-project-memory/siso-internal/operations/docs/API.md`
