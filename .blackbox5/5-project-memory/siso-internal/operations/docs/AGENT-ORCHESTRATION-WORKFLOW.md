# Agent Orchestration Workflow

## Complete Guide for Agents and Users

---

## Overview

The complete agent orchestration system enables:

1. ✅ Talk to Planning Agent to create tasks
2. ✅ Push tasks to Vibe Kanban board
3. ✅ Orchestrate multiple agents working in parallel
4. ✅ Complex tasks use Ralphy autonomous loops
5. ✅ Everything tracked in Project Memory

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER PROVIDES REQUIREMENTS                               │
│                                                              │
│ "I need to build a multi-tenant SaaS app with auth"         │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PLANNING AGENT (BMAD Method)                             │
│                                                              │
│ Creates:                                                     │
│ • PRD (Product Requirements Document)                        │
│ • Epic (Technical Architecture)                              │
│ • Tasks (20+ implementation tasks)                           │
│                                                              │
│ Output: .blackbox5/specs/{prds,epics,tasks}/                │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. PUSH TO VIBE KANBAN                                      │
│                                                              │
│ • Creates cards for each task                               │
│ • Board accessible at http://localhost:3001                  │
│ • Real-time status updates                                  │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ORCHESTRATOR ANALYZES TASKS                              │
│                                                              │
│ • Analyzes task complexity                                   │
│ • Assigns to agents (5 parallel)                             │
│ • Complex tasks → Use Ralphy loop                           │
│ • Simple tasks → Direct execution                           │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. PARALLEL AGENTS EXECUTE                                  │
│                                                              │
│ Agent 1: Authentication (Ralphy - 5 iterations)             │
│ Agent 2: Tenant Model (Ralphy - 3 iterations)               │
│ Agent 3: Dashboard (Ralphy - 4 iterations)                  │
│ Agent 4: Setup Next.js (Direct - 2 min)                     │
│ Agent 5: API endpoints (Direct - 3 min)                     │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. REAL-TIME UPDATES ON VIBE KANBAN                         │
│                                                              │
│ BACKLOG → DOING → DONE                                      │
│   │        │        │                                       │
│   │        ├─ Setup → Agent 4 → DONE ✅                     │
│   │        ├─ Auth → Agent 1 → IN PROGRESS...               │
│   │        └─ API → Agent 5 → DONE ✅                       │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. ALL TASKS COMPLETE                                       │
│                                                              │
│ • All code written                                          │
│ • All tests passing                                         │
│ • All git commits made                                      │
│ • All tracked in Project Memory                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Details

### Planning Agent

**Purpose**: Create tasks from user requirements

**Method**: BMAD (Business, Model, Architecture, Development)

**Output**:
- PRD: Requirements, user stories, success metrics
- Epic: Architecture, tech stack, components
- Tasks: 20+ implementation tasks

**Usage**:
```python
from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent

agent = PlanningAgent()
plan = agent.plan_and_push("Build a multi-tenant SaaS app")

print(f"PRD: {plan['prd']}")
print(f"Epic: {plan['epic']}")
print(f"Tasks: {plan['tasks']}")
print(f"Kanban: {plan['kanban_url']}")
```

### Vibe Kanban

**Purpose**: Visual task board for real-time monitoring

**Features**:
- Show all tasks
- Real-time status updates
- Agent progress tracking
- Drag-and-drop interface

**Access**: http://localhost:3001

**Usage**:
```python
from blackbox5.engine.integrations.vibe import VibeKanbanManager

manager = VibeKanbanManager(api_url="http://localhost:3001")

# Create card
card = await manager.create_card(
    title="Implement authentication",
    description="JWT-based auth with login/logout",
    column="backlog"
)

# Move card
await manager.move_card(card.id, "doing")

# Update status
await manager.update_card_status(card.id, "done")
```

### Orchestrator Agent

**Purpose**: Coordinate parallel agent execution

**Features**:
- Analyze task complexity
- Assign tasks to agents
- Monitor progress
- Handle failures

**Usage**:
```python
from blackbox5.engine.agents.workflows.orchestrator_agent import OrchestratorAgent

orchestrator = OrchestratorAgent()
results = orchestrator.orchestrate_parallel_execution()

for result in results:
    print(f"{result['agent']}: {result['result']['success']}")
```

### Execution Agents

**Complex Tasks** (use Ralphy):
```python
from blackbox5.engine.operations.runtime.ralphy import RalphyManager

manager = RalphyManager()
result = manager.execute_task(
    task="Implement complete authentication system",
    prd_file="specs/prds/current-prd.md",
    engine="claude"
)
```

**Simple Tasks** (direct execution):
```python
# Direct execution, no loop needed
def setup_project():
    run("npx create-next-app@latest .")
    # Done!
```

### Project Memory

**Purpose**: Track all agent activity

**Location**: `.blackbox5/5-project-memory/siso-internal/operations/`

**Structure**:
```
operations/
├── agents/
│   ├── agent-1/sessions.json  # What agent did, when, how long
│   ├── agent-2/sessions.json
│   └── agent-3/sessions.json
└── ralphy/
    ├── sessions/ralphy/sessions.json  # All Ralphy loops
    └── insights.json  # Learned patterns
```

**What's Tracked**:
- Goals (task descriptions)
- Achievements (results, success/failure)
- Code (files created, git commits)
- Timestamps (when started, duration)

---

## Complete Example

```python
#!/usr/bin/env python3
"""Complete agent orchestration example"""

from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent
from blackbox5.engine.agents.workflows.orchestrator_agent import OrchestratorAgent

def main():
    # 1. Plan tasks
    print("🎯 Planning tasks...")
    planning_agent = PlanningAgent()
    plan = planning_agent.plan_and_push(
        user_request="Build a multi-tenant SaaS application with "
                     "authentication, tenant isolation, and billing"
    )

    print(f"✅ PRD created: {plan['prd']}")
    print(f"✅ Epic created: {plan['epic']}")
    print(f"✅ Tasks created: {plan['tasks']}")
    print(f"✅ Kanban: {plan['kanban_url']}")

    # 2. Execute with parallel agents
    print("\n🚀 Executing with parallel agents...")
    orchestrator = OrchestratorAgent()
    results = orchestrator.orchestrate_parallel_execution()

    # 3. Show results
    print(f"\n✅ Execution complete:")
    print(f"  - Agents used: {len(results)}")
    print(f"  - Tasks completed: {sum(1 for r in results if r['result']['success'])}")

    # 4. Check Project Memory
    print(f"\n📊 Results tracked in:")
    print(f"  .blackbox5/5-project-memory/siso-internal/operations/")
    print(f"  ├── agents/ (agent sessions)")
    print(f"  └── ralphy/ (autonomous loops)")

if __name__ == "__main__":
    main()
```

---

## Data Flow

```
User Request
    ↓
Planning Agent
    ├─ Creates PRD
    ├─ Creates Epic
    └─ Creates Tasks
    ↓
Vibe Kanban
    ├─ Creates cards
    └─ Displays board
    ↓
Orchestrator
    ├─ Analyzes tasks
    ├─ Assigns to agents
    └─ Monitors progress
    ↓
Execution Agents (Parallel)
    ├─ Agent 1: Ralphy loop (complex)
    ├─ Agent 2: Ralphy loop (complex)
    ├─ Agent 3: Ralphy loop (complex)
    ├─ Agent 4: Direct execution (simple)
    └─ Agent 5: Direct execution (simple)
    ↓
Project Memory
    ├─ Agent sessions
    ├─ Ralphy sessions
    └─ Insights learned
```

---

## Best Practices

### 1. Start Simple

Begin with simple projects to understand the workflow:
```python
plan = PlanningAgent().plan_and_push("Build a calculator app")
```

### 2. Monitor Progress

Always watch Vibe Kanban during execution:
```
http://localhost:3001
```

### 3. Check Results

Review Project Memory after completion:
```bash
ls -la .blackbox5/5-project-memory/siso-internal/operations/agents/
ls -la .blackbox5/5-project-memory/siso-internal/operations/ralphy/
```

### 4. Use Ralphy for Complex Tasks

Let Ralphy handle complex, multi-step tasks:
- Authentication systems
- Database schemas
- API integrations
- Complex UI components

### 5. Direct Execution for Simple Tasks

Use direct execution for straightforward tasks:
- Project setup
- Configuration files
- Simple CRUD operations
- Basic components

---

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

---

## Further Reading

- [QUICK-START.md](./QUICK-START.md) - Get started in 20 minutes
- [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md) - Detailed setup guide
- [RALPHY-INTEGRATION.md](./RALPHY-INTEGRATION.md) - Ralphy usage
- [VIBE-KANBAN.md](./VIBE-KANBAN.md) - Vibe Kanban setup

---

**Last Updated**: 2026-01-19
**Version**: 1.0
