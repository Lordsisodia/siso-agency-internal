# Agent Orchestration Tutorials
## Quick Start & Testing Guide

This folder contains everything you need to get the complete agent orchestration system up and running quickly.

---

## 🚀 Quick Start (3 Commands)

```bash
# 1. Check prerequisites
bash .blackbox5/1-docs/03-guides/02-tutorials/check-prerequisites.sh

# 2. Run complete test
python .blackbox5/1-docs/03-guides/02-tutorials/test-complete-workflow.py

# 3. Start using it!
# (See instructions below)
```

---

## 📁 Files in This Folder

### Setup & Check Scripts

| File | Purpose | Usage |
|------|---------|-------|
| `check-prerequisites.sh` | Check if everything is installed | `bash check-prerequisites.sh` |
| `AGENT-ORCHESTRATION-SETUP-CHECKLIST.md` | Complete setup guide | Read this first! |
| `test-complete-workflow.py` | Test entire pipeline | `python test-complete-workflow.py` |

### Test Scripts

| File | Purpose | Usage |
|------|---------|-------|
| `test-planning-agent.py` | Test planning phase | `python test-planning-agent.py` |
| `test-orchestrator-agent.py` | Test orchestration | `python test-orchestrator-agent.py` |
| `test-ralphy-workflow.py` | Test Ralphy integration | `python test-ralphy-workflow.py` |

### Demo Scripts

| File | Purpose | Usage |
|------|---------|-------|
| `interactive-demo.py` | Interactive workflow demo | `python interactive-demo.py` |
| `simple-demo.py` | Simple example | `python simple-demo.py` |

---

## 🎯 Typical Usage Flow

### First Time Setup

```bash
# 1. Read the checklist
cat AGENT-ORCHESTRATION-SETUP-CHECKLIST.md

# 2. Check prerequisites
bash check-prerequisites.sh

# 3. Fix any issues (script will tell you what to do)

# 4. Run test
python test-complete-workflow.py
```

### Daily Usage

```bash
# Option 1: Interactive demo (easiest)
python interactive-demo.py

# Option 2: Use in your code
python your-script.py  # (see examples below)
```

---

## 💡 Quick Examples

### Example 1: Plan and Execute Tasks

```python
from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent
from blackbox5.engine.agents.workflows.orchestrator_agent import OrchestratorAgent

# Plan tasks
agent = PlanningAgent()
plan = agent.plan_and_push("Build a simple calculator app")

# Execute with parallel agents
orchestrator = OrchestratorAgent()
results = orchestrator.orchestrate_parallel_execution()

print(f"✅ Created {plan['tasks']} tasks")
print(f"✅ Completed {len(results)} tasks")
```

### Example 2: Just Planning

```python
from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent

agent = PlanningAgent()
plan = agent.plan_and_push("Your project idea here")

print(f"PRD: {plan['prd']}")
print(f"Epic: {plan['epic']}")
print(f"Tasks: {plan['tasks']}")
print(f"Kanban: {plan['kanban_url']}")
```

### Example 3: Just Execution

```python
from blackbox5.engine.agents.workflows.orchestrator_agent import OrchestratorAgent

orchestrator = OrchestratorAgent()
results = orchestrator.orchestrate_parallel_execution()

for result in results:
    print(f"{result['agent']}: {result['result']['success']}")
```

---

## 📊 What Gets Tested

### `check-prerequisites.sh`

Checks:
- ✅ Python 3.10+
- ✅ Node.js 18+
- ✅ Git configured
- ✅ Python dependencies
- ✅ Vibe Kanban running
- ✅ Project structure
- ✅ AgentMemory module
- ✅ VibeKanbanManager
- ✅ Ralphy integration
- ✅ Project Memory structure

### `test-complete-workflow.py`

Tests:
- ✅ Planning Agent creates tasks
- ✅ Vibe Kanban integration
- ✅ Parallel agent execution
- ✅ Project Memory tracking

---

## 🐛 Troubleshooting

### Issue: Test fails

**Solution**:
```bash
# 1. Check prerequisites
bash check-prerequisites.sh

# 2. Fix any issues reported

# 3. Try again
python test-complete-workflow.py
```

### Issue: Vibe Kanban not accessible

**Solution**:
```bash
# Start Vibe Kanban
docker run -d -p 3001:3001 vibekanban/server

# Verify
curl http://localhost:3001/health
```

### Issue: Module import errors

**Solution**:
```bash
# Add to PYTHONPATH
export PYTHONPATH="$PWD:$PYTHONPATH"

# Or install
pip install -e .blackbox5/2-engine/
```

---

## 📚 Further Reading

1. **Complete Workflow Guide**
   ```
   .blackbox5/1-docs/01-theory/03-workflows/production/COMPLETE-AGENT-ORCHESTRATION-WORKFLOW.md
   ```

2. **Setup Checklist**
   ```
   .blackbox5/1-docs/03-guides/02-tutorials/AGENT-ORCHESTRATION-SETUP-CHECKLIST.md
   ```

3. **Vibe Kanban Integration**
   ```
   .blackbox5/2-engine/06-integrations/vibe/README.md
   ```

4. **Ralphy Integration**
   ```
   .blackbox5/2-engine/07-operations/runtime/ralphy/BLACKBOX-INTEGRATION.md
   ```

---

## ✅ Success Criteria

You're all set when:

- [ ] `check-prerequisites.sh` passes all checks
- [ ] `test-complete-workflow.py` runs successfully
- [ ] Vibe Kanban is accessible at http://localhost:3001
- [ ] You can run the interactive demo

---

## 🎉 Next Steps

Once everything is working:

1. **Try the interactive demo**:
   ```bash
   python interactive-demo.py
   ```

2. **Build your own project**:
   ```python
   from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent
   from blackbox5.engine.agents.workflows.orchestrator_agent import OrchestratorAgent

   # Your project idea
   plan = PlanningAgent().plan_and_push("Your idea here")
   results = OrchestratorAgent().orchestrate_parallel_execution()
   ```

3. **Monitor in Vibe Kanban**:
   ```
   Open: http://localhost:3001
   Watch agents work in real-time!
   ```

4. **Check results in Project Memory**:
   ```bash
   ls -la .blackbox5/5-project-memory/siso-internal/operations/
   ```

---

**Happy Building! 🚀**
