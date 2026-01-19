# 🎯 Easy Setup Guide for Agent Orchestration

## What We Created

We've made it **super easy** to get the complete agent orchestration system up and running! Here's what you have now:

---

## 📋 One-Command Setup

### Step 1: Check What You Need (1 minute)

```bash
bash .blackbox5/1-docs/03-guides/02-tutorials/check-prerequisites.sh
```

**This tells you**:
- ✅ What's installed correctly
- ❌ What needs fixing
- 💡 Exactly how to fix it

**Example output**:
```
✅ Python 3.10+ installed
✅ Node.js 18+ installed
❌ Vibe Kanban not accessible (start with: docker run -d -p 3001:3001 vibekanban/server)
✅ Project structure correct
```

### Step 2: Fix Any Issues (5 minutes)

The script tells you exactly what to do. For example:

```bash
# If Vibe Kanban is not running:
docker run -d -p 3001:3001 vibekanban/server

# If Python version is wrong:
# Update to Python 3.10+

# If modules not found:
export PYTHONPATH="$PWD:$PYTHONPATH"
```

### Step 3: Run the Test (2 minutes)

```bash
python .blackbox5/1-docs/03-guides/02-tutorials/test-complete-workflow.py
```

**This tests**:
- ✅ Planning Agent creates tasks
- ✅ Vibe Kanban integration
- ✅ Parallel agent execution
- ✅ Project Memory tracking

**That's it!** You're now ready to use the complete system.

---

## 🚀 How to Use It

### Option 1: Interactive Demo (Easiest)

```bash
python .blackbox5/1-docs/03-guides/02-tutorials/interactive-demo.py
```

**This will**:
1. Ask what you want to build
2. Create tasks automatically
3. Show Vibe Kanban board
4. Execute with parallel agents
5. Display results

### Option 2: Use in Your Code

```python
# Just 3 lines!
from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent
from blackbox5.engine.agents.workflows.orchestrator_agent import OrchestratorAgent

plan = PlanningAgent().plan_and_push("Build my app")
results = OrchestratorAgent().orchestrate_parallel_execution()
```

### Option 3: Step-by-Step

```python
# 1. Plan tasks
agent = PlanningAgent()
plan = agent.plan_and_push("Your project idea")

# 2. Check Vibe Kanban
print(f"View at: {plan['kanban_url']}")

# 3. Execute
results = OrchestratorAgent().orchestrate_parallel_execution()
```

---

## 📊 What You Get

### Complete Agent Workflow

```
You talk to Planning Agent
        ↓
    Creates tasks
        ↓
   Pushes to Vibe Kanban
        ↓
   Orchestrator sees board
        ↓
   Spins up 5 parallel agents
        ↓
    Complex tasks → Ralphy loop
    Simple tasks → Direct execution
        ↓
   All tracked in Project Memory
```

### Real-Time Monitoring

**Vibe Kanban Board** (http://localhost:3001):
```
BACKLOG → DOING → DONE
  │        │        │
  │        ├─ Task 1 → Agent 1 → DONE ✅
  │        ├─ Task 2 → Agent 2 → IN PROGRESS...
  │        └─ Task 3 → Agent 3 → IN PROGRESS...
```

### Project Memory Tracking

```
.blackbox5/5-project-memory/siso-internal/operations/
├── agents/
│   ├── agent-1/sessions.json  (What agent did)
│   ├── agent-2/sessions.json  (When they did it)
│   └── agent-3/sessions.json  (How long it took)
└── ralphy/
    ├── sessions.json  (Autonomous loops)
    └── insights.json  (Learned patterns)
```

---

## ✅ What's Included

### 1. Setup Checklist
**File**: `AGENT-ORCHESTRATION-SETUP-CHECKLIST.md`

**Contains**:
- Step-by-step setup instructions
- Detailed configuration guides
- Troubleshooting section
- Quick reference commands

### 2. Prerequisites Checker
**File**: `check-prerequisites.sh`

**Does**:
- Checks Python version
- Checks Node.js version
- Checks Git configuration
- Checks all dependencies
- Checks Vibe Kanban
- Checks Project Memory
- Provides fix instructions

### 3. Complete Workflow Test
**File**: `test-complete-workflow.py`

**Tests**:
- Planning Agent
- Vibe Kanban integration
- Parallel execution
- Project Memory tracking

### 4. README
**File**: `README.md`

**Provides**:
- Quick start guide
- Usage examples
- Troubleshooting tips
- Further reading links

---

## 🎯 Typical Session

### What You Would Do

```bash
# 1. Check everything is ready
bash check-prerequisites.sh

# Output:
# ✅ Python 3.10+ installed
# ✅ Node.js 18+ installed
# ✅ All systems ready!

# 2. Run the test
python test-complete-workflow.py

# Output:
# 📋 Phase 1: Testing Planning Agent...
#   ✅ PRD created
#   ✅ Tasks created: 5
# 🎯 Phase 2: Testing Vibe Kanban...
#   ✅ Vibe Kanban is running
# 🚀 Phase 3: Testing Parallel Execution...
#   ✅ All 5 tasks completed in parallel
# 📊 Phase 4: Testing Project Memory...
#   ✅ Session created
# 🎉 ALL TESTS PASSED!

# 3. Use it for real!
python interactive-demo.py

# Output:
# What do you want to build? > A todo app with authentication
# ✅ Planning complete: 12 tasks created
# ✅ Pushed to Vibe Kanban: http://localhost:3001
# ✅ Executing with 4 parallel agents...
# ✅ Task 1 completed by Agent 1
# ✅ Task 2 completed by Agent 2
# ✅ Task 3 completed by Agent 3
# ✅ All tasks complete!
```

---

## 📁 All Files Created

```
.blackbox5/1-docs/03-guides/02-tutorials/
├── README.md                                    # Quick start guide
├── AGENT-ORCHESTRATION-SETUP-CHECKLIST.md      # Complete setup checklist
├── check-prerequisites.sh                       # Prerequisites checker
├── test-complete-workflow.py                   # Complete workflow test
└── EASY-SETUP-GUIDE.md                         # This file
```

---

## 🎓 How to Learn More

### Quick References

1. **Setup Checklist** - Complete step-by-step guide
2. **README** - Quick start and examples
3. **Complete Workflow Guide** - Full system documentation

### Main Documentation

1. **Agent Orchestration Workflow**
   ```
   .blackbox5/1-docs/01-theory/03-workflows/production/COMPLETE-AGENT-ORCHESTRATION-WORKFLOW.md
   ```

2. **Vibe Kanban Integration**
   ```
   .blackbox5/2-engine/06-integrations/vibe/README.md
   ```

3. **Ralphy Integration**
   ```
   .blackbox5/2-engine/07-operations/runtime/ralphy/BLACKBOX-INTEGRATION.md
   ```

---

## 💡 Tips

### Tip 1: Run the Checker First

Always run `check-prerequisites.sh` before starting. It saves time!

### Tip 2: Use the Test

Run `test-complete-workflow.py` to verify everything works.

### Tip 3: Monitor in Real-Time

Open http://localhost:3001 to watch agents work in real-time!

### Tip 4: Check Project Memory

All sessions are tracked in `.blackbox5/5-project-memory/`

---

## ✅ Success Checklist

You're ready when:

- [ ] `check-prerequisites.sh` passes all checks
- [ ] `test-complete-workflow.py` runs successfully
- [ ] Vibe Kanban accessible at http://localhost:3001
- [ ] You understand the workflow
- [ ] You've run the test successfully

---

## 🎉 Summary

**What we built**:
- ✅ Easy setup system
- ✅ Automated checking
- ✅ Complete testing
- ✅ Clear documentation
- ✅ Quick start guides

**How to use it**:
1. Run `check-prerequisites.sh`
2. Fix any issues
3. Run `test-complete-workflow.py`
4. Start building!

**Time to setup**: 20 minutes max
**Time to use**: 3 lines of code!

---

**Happy Building! 🚀**
