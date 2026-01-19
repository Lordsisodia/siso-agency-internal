# Agent Orchestration Quick Start

**Time to setup**: 20 minutes
**Time to use**: 3 lines of code

---

## 3 Commands to Start

### 1. Check Prerequisites (1 minute)

```bash
bash .blackbox5/1-docs/03-guides/02-tutorials/check-prerequisites.sh
```

**What it does**:
- Checks Python 3.10+
- Checks Node.js 18+
- Checks Git configuration
- Checks all dependencies
- Provides fix instructions for any issues

### 2. Run Test (2 minutes)

```bash
python .blackbox5/1-docs/03-guides/02-tutorials/test-complete-workflow.py
```

**What it tests**:
- Planning Agent creates tasks
- Vibe Kanban integration
- Parallel agent execution
- Project Memory tracking

### 3. Start Using (immediate)

```python
from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent
from blackbox5.engine.agents.workflows.orchestrator_agent import OrchestratorAgent

# Plan tasks
plan = PlanningAgent().plan_and_push("Build my app")

# Execute with parallel agents
results = OrchestratorAgent().orchestrate_parallel_execution()

print(f"✅ Created {plan['tasks']} tasks")
print(f"✅ Completed {len(results)} tasks")
```

---

## What You Get

### Complete Workflow

```
You → Planning Agent → Vibe Kanban → Orchestrator → 5 Parallel Agents
                                                              ↓
                                              Complex → Ralphy Loop
                                              Simple → Direct
                                                              ↓
                                              All tracked in Project Memory
```

### Real-Time Monitoring

**Vibe Kanban**: http://localhost:3001
- See all tasks
- Watch agents work
- Real-time updates

### Project Memory Tracking

**Location**: `.blackbox5/5-project-memory/siso-internal/operations/`

**Tracked**:
- Goals (task descriptions)
- Achievements (results)
- Code (files created, git commits)
- Timestamps (when, how long)

---

## Example Session

```bash
# You run:
python interactive-demo.py

# System asks:
"What do you want to build?" > A todo app with authentication

# System responds:
✅ Planning complete: 12 tasks created
✅ Pushed to Vibe Kanban: http://localhost:3001
✅ Executing with 4 parallel agents...

# You open browser to http://localhost:3001
# You see tasks moving from BACKLOG → DOING → DONE in real-time

# System completes:
✅ All 12 tasks complete!
✅ Check results in Project Memory
✅ Check git commits
```

---

## Next Steps

1. **Read complete workflow**: [AGENT-ORCHESTRATION-WORKFLOW.md](./AGENT-ORCHESTRATION-WORKFLOW.md)
2. **Setup checklist**: [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md)
3. **Verification**: [VERIFICATION.md](./VERIFICATION.md)

---

## Troubleshooting

### Issue: Prerequisites check fails

**Solution**: Script will tell you exactly what to fix

### Issue: Test fails

**Solution**:
```bash
# Check Vibe Kanban is running
docker run -d -p 3001:3001 vibekanban/server

# Verify
curl http://localhost:3001/health
```

### Issue: Module import errors

**Solution**:
```bash
export PYTHONPATH="$PWD:$PYTHONPATH"
```

---

**🎉 Ready to use! See [AGENT-ORCHESTRATION-WORKFLOW.md](./AGENT-ORCHESTRATION-WORKFLOW.md) for complete guide.**
