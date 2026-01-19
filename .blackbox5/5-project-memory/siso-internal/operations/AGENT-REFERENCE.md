# Agent Reference Guide

**Purpose**: Quick reference for agents using the orchestration system.

---

## Quick Links for Agents

### 🚀 I Need to...

**Plan and execute tasks**:
- Read: `.blackbox5/5-project-memory/siso-internal/operations/docs/AGENT-ORCHESTRATION-WORKFLOW.md`
- Use: `PlanningAgent` and `OrchestratorAgent`

**Use Ralphy for complex tasks**:
- Read: `.blackbox5/5-project-memory/siso-internal/operations/docs/RALPHY-INTEGRATION.md`
- Use: `RalphyManager`

**Push tasks to Vibe Kanban**:
- Read: `.blackbox5/5-project-memory/siso-internal/operations/docs/VIBE-KANBAN.md`
- Use: `VibeKanbanManager`

**Track sessions in Project Memory**:
- Read: `.blackbox5/5-project-memory/siso-internal/operations/README.md`
- Use: `AgentMemory`

**Troubleshoot issues**:
- Read: `.blackbox5/5-project-memory/siso-internal/operations/docs/TROUBLESHOOTING.md`
- Run: `check-prerequisites.sh`

---

## Component Locations

### Documentation (Read This First!)

**Main Operations Guide**:
```
.blackbox5/5-project-memory/siso-internal/operations/
├── README.md  # Start here!
└── docs/
    ├── QUICK-START.md  # 3 commands to start
    ├── AGENT-ORCHESTRATION-WORKFLOW.md  # Complete workflow
    ├── RALPHY-INTEGRATION.md  # Ralphy usage
    ├── VIBE-KANBAN.md  # Vibe Kanban guide
    ├── SETUP-CHECKLIST.md  # Setup instructions
    ├── TROUBLESHOOTING.md  # Fix issues
    └── API.md  # Python API reference
```

### Integration Code

**Planning Agent**:
```
.blackbox5/2-engine/02-agents/workflows/planning_agent.py
```

**Orchestrator Agent**:
```
.blackbox5/2-engine/02-agents/workflows/orchestrator_agent.py
```

**Vibe Kanban Manager**:
```
.blackbox5/2-engine/06-integrations/vibe/manager.py
```

**Ralphy Integration**:
```
.blackbox5/2-engine/07-operations/runtime/ralphy/
├── blackbox_integration.py
└── ralphy-bb5-integrated.sh
```

### Agent Skills

**Agent Orchestration Skill**:
```
.blackbox5/2-engine/02-agents/capabilities/skills-cap/development-workflow/autonomous/agent-orchestration/SKILL.md
```

---

## Common Workflows

### Workflow 1: Plan and Execute

```python
from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent
from blackbox5.engine.agents.workflows.orchestrator_agent import OrchestratorAgent

# Plan
plan = PlanningAgent().plan_and_push("Build your project")

# Execute
results = OrchestratorAgent().orchestrate_parallel_execution()
```

**Documentation**: `.blackbox5/5-project-memory/siso-internal/operations/docs/AGENT-ORCHESTRATION-WORKFLOW.md`

### Workflow 2: Use Ralphy for Complex Task

```python
from blackbox5.engine.operations.runtime.ralphy import RalphyManager

manager = RalphyManager()
result = manager.execute_task(
    task="Implement authentication system",
    prd_file="specs/prds/current-prd.md",
    engine="claude"
)
```

**Documentation**: `.blackbox5/5-project-memory/siso-internal/operations/docs/RALPHY-INTEGRATION.md`

### Workflow 3: Push to Vibe Kanban

```python
from blackbox5.engine.integrations.vibe import VibeKanbanManager

manager = VibeKanbanManager(api_url="http://localhost:3001")
card = await manager.create_card(
    title="Task name",
    description="Task description",
    column="backlog"
)
```

**Documentation**: `.blackbox5/5-project-memory/siso-internal/operations/docs/VIBE-KANBAN.md`

---

## Decision Tree

```
Need to build something?
    │
    ├─ Simple task (1-2 files)
    │   └─ Use direct execution
    │
    ├─ Medium task (3-10 files)
    │   └─ Use Ralphy autonomous loop
    │
    └─ Large project (10+ files)
        └─ Use Agent Orchestration
            ├─ Planning Agent (creates tasks)
            ├─ Vibe Kanban (visual board)
            └─ Orchestrator (parallel agents)
```

---

## Quick Reference Commands

### Setup

```bash
# Check prerequisites
bash .blackbox5/1-docs/03-guides/02-tutorials/check-prerequisites.sh

# Run test
python .blackbox5/1-docs/03-guides/02-tutorials/test-complete-workflow.py

# Start Vibe Kanban
docker run -d -p 3001:3001 vibekanban/server
```

### Monitoring

```bash
# Check Vibe Kanban
curl http://localhost:3001/health

# Check Project Memory
ls -la .blackbox5/5-project-memory/siso-internal/operations/

# Check git commits
git log --oneline -10
```

### Troubleshooting

```bash
# Check Python modules
python3 -c "from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent"

# Check Vibe Kanban connection
curl http://localhost:3001/health

# Check Project Memory
ls -la .blackbox5/5-project-memory/siso-internal/operations/agents/
```

---

## What Gets Tracked

All activity tracked in `.blackbox5/5-project-memory/siso-internal/operations/`:

### Agents Directory
```
agents/
├── agent-1/sessions.json  # What agent did
├── agent-2/sessions.json  # When they did it
└── agent-3/sessions.json  # How long it took
```

**Session Data**:
```json
{
  "session_id": "agent_1_20260119",
  "timestamp": "2026-01-19T12:00:00Z",
  "task": "Implement authentication",
  "result": "Completed successfully",
  "success": true,
  "duration_seconds": 180.5,
  "files_created": ["auth.py", "models.py"],
  "git_commit": "abc123"
}
```

### Ralphy Directory
```
ralphy/
├── sessions/ralphy/sessions.json  # All Ralphy loops
└── insights.json  # Learned patterns
```

**Session Data**:
```json
{
  "session_id": "ralphy_20260119_120000",
  "task": "Implement authentication",
  "timestamp": "2026-01-19T12:00:00Z",
  "result": "5 iterations completed",
  "success": true,
  "duration_seconds": 900.0,
  "files_created": ["auth.py", "models.py", "tests/"],
  "git_commit": "abc123"
}
```

---

## For New Agents

When you're a new agent getting started:

1. **Read the Quick Start**:
   ```
   .blackbox5/5-project-memory/siso-internal/operations/docs/QUICK-START.md
   ```

2. **Understand the Workflow**:
   ```
   .blackbox5/5-project-memory/siso-internal/operations/docs/AGENT-ORCHESTRATION-WORKFLOW.md
   ```

3. **Check Your Skills**:
   ```
   .blackbox5/2-engine/02-agents/capabilities/skills-cap/development-workflow/autonomous/agent-orchestration/SKILL.md
   ```

4. **Run the Test**:
   ```bash
   python .blackbox5/1-docs/03-guides/02-tutorials/test-complete-workflow.py
   ```

---

## Summary

**Key Points**:
- All documentation in `.blackbox5/5-project-memory/siso-internal/operations/`
- Quick start: 3 commands, 20 minutes
- Complete workflow: Planning → Kanban → Orchestrator → Execution
- Everything tracked in Project Memory

**Most Important Files**:
1. `.blackbox5/5-project-memory/siso-internal/operations/README.md`
2. `.blackbox5/5-project-memory/siso-internal/operations/docs/QUICK-START.md`
3. `.blackbox5/5-project-memory/siso-internal/operations/docs/AGENT-ORCHESTRATION-WORKFLOW.md`

**Quick Usage**:
```python
plan = PlanningAgent().plan_and_push("Your project")
results = OrchestratorAgent().orchestrate_parallel_execution()
```

---

**Last Updated**: 2026-01-19
**Version**: 1.0
