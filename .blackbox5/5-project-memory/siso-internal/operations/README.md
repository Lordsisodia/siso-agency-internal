# Operations Documentation

**Purpose**: Complete guide for agent orchestration and operations in BlackBox5.

---

## Quick Links

### 🚀 Getting Started
- **[Agent Orchestration Quick Start](./QUICK-START.md)** - 3 commands to get started
- **[Setup Checklist](./SETUP-CHECKLIST.md)** - Step-by-step setup guide
- **[Verification Guide](./VERIFICATION.md)** - How to verify everything works

### 📚 Complete Guides
- **[Agent Orchestration Workflow](./AGENT-ORCHESTRATION-WORKFLOW.md)** - Complete workflow explanation
- **[Ralphy Integration Guide](./RALPHY-INTEGRATION.md)** - Ralphy-Blackbox integration
- **[Vibe Kanban Guide](./VIBE-KANBAN.md)** - Vibe Kanban setup and usage

### 🎯 Reference
- **[API Reference](./API.md)** - Python API reference
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Best Practices](./BEST-PRACTICES.md)** - Recommended patterns

---

## System Overview

The BlackBox5 operations system consists of:

1. **Planning Agent** - Creates tasks from requirements
2. **Vibe Kanban** - Visual task board
3. **Orchestrator** - Coordinates parallel agents
4. **Execution Agents** - Perform tasks (with or without Ralphy)
5. **Project Memory** - Tracks all activity

---

## Quick Start

```bash
# 1. Check prerequisites
bash .blackbox5/1-docs/03-guides/02-tutorials/check-prerequisites.sh

# 2. Run test
python .blackbox5/1-docs/03-guides/02-tutorials/test-complete-workflow.py

# 3. Use it!
python -c "
from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent
from blackbox5.engine.agents.workflows.orchestrator_agent import OrchestratorAgent

plan = PlanningAgent().plan_and_push('Your project idea')
results = OrchestratorAgent().orchestrate_parallel_execution()
"
```

---

## Architecture

```
User → Planning Agent → Vibe Kanban → Orchestrator → Parallel Agents → Project Memory
```

**Data Flow**:
1. User provides requirements
2. Planning Agent creates PRD, Epic, Tasks
3. Tasks pushed to Vibe Kanban board
4. Orchestrator assigns tasks to agents
5. Agents execute (parallel)
6. Results stored in Project Memory

---

## Key Locations

### Documentation
```
.blackbox5/1-docs/03-guides/02-tutorials/
├── README.md  # Quick start
├── check-prerequisites.sh  # Setup checker
└── test-complete-workflow.py  # Test script
```

### Integration Code
```
.blackbox5/2-engine/07-operations/runtime/ralphy/
├── blackbox_integration.py  # Ralphy bridge
└── ralphy-bb5-integrated.sh  # Integrated wrapper
```

### Project Memory
```
.blackbox5/5-project-memory/siso-internal/operations/
├── agents/  # Agent sessions
├── ralphy/  # Ralphy sessions
└── workflows/  # Workflow execution
```

---

## For Agents

When agents need to understand the orchestration system, they should read:

1. **[AGENT-ORCHESTRATION-WORKFLOW.md](./AGENT-ORCHESTRATION-WORKFLOW.md)** - Complete workflow
2. **[RALPHY-INTEGRATION.md](./RALPHY-INTEGRATION.md)** - How to use Ralphy
3. **[VIBE-KANBAN.md](./VIBE-KANBAN.md)** - How to use Vibe Kanban

---

## Monitoring

- **Vibe Kanban**: http://localhost:3001
- **Project Memory**: `.blackbox5/5-project-memory/siso-internal/operations/`
- **Git Commits**: `git log --oneline`

---

## Support

For issues or questions:
1. Check [Troubleshooting](./TROUBLESHOOTING.md)
2. Run `check-prerequisites.sh`
3. Review test output
4. Check Project Memory logs

---

**Last Updated**: 2026-01-19
**Version**: 1.0
