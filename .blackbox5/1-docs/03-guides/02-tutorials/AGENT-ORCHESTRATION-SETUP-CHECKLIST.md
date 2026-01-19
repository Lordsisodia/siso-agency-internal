# Agent Orchestration Setup Checklist
## Easy Setup & Testing Guide

**Goal**: Get the complete agent workflow (Planning → Vibe Kanban → Parallel Agents → Ralphy Loops) up and running as easily as possible.

---

## 🎯 Quick Start: 3 Steps to Production

### Step 1: Verify Prerequisites (5 minutes)

```bash
# Run this one command to check everything
bash .blackbox5/1-docs/03-guides/02-tutorials/check-prerequisites.sh
```

**What it checks**:
- ✅ Python 3.10+ installed
- ✅ Node.js 18+ installed
- ✅ Git configured
- ✅ Required Python packages
- ✅ Vibe Kanban server reachable
- ✅ Project structure correct

### Step 2: Run Setup Script (10 minutes)

```bash
# Run automated setup
bash .blackbox5/1-docs/03-guides/02-tutorials/setup-agent-orchestration.sh
```

**What it does**:
- ✅ Installs all dependencies
- ✅ Sets up Vibe Kanban
- ✅ Creates agent configuration files
- ✅ Sets up Project Memory structure
- ✅ Runs smoke tests

### Step 3: Run End-to-End Test (5 minutes)

```bash
# Run complete workflow test
python .blackbox5/1-docs/03-guides/02-tutorials/test-complete-workflow.py
```

**What it tests**:
- ✅ Planning Agent creates tasks
- ✅ Tasks pushed to Vibe Kanban
- ✅ Parallel agents execute
- ✅ Ralphy loops work
- ✅ Results stored in Project Memory

**Total time: 20 minutes to full production system!**

---

## 📋 Detailed Setup Checklist

### Phase 1: Core Infrastructure (5 minutes)

- [ ] **1.1 Check Python version**
  ```bash
  python3 --version  # Should be 3.10+
  ```

- [ ] **1.2 Check Node.js version**
  ```bash
  node --version  # Should be 18+
  ```

- [ ] **1.3 Verify Git configuration**
  ```bash
  git config user.name
  git config user.email
  ```

- [ ] **1.4 Install Python dependencies**
  ```bash
  pip install -r .blackbox5/2-engine/requirements.txt
  ```

- [ ] **1.5 Install Node dependencies**
  ```bash
  cd .blackbox5/2-engine/07-operations/runtime/ralphy
  npm install
  ```

### Phase 2: Vibe Kanban Setup (10 minutes)

- [ ] **2.1 Start Vibe Kanban server**
  ```bash
  # Option A: Docker (recommended)
  docker run -d -p 3001:3001 vibekanban/server

  # Option B: Local installation
  cd .blackbox5/2-engine/06-integrations/vibe
  npm install
  npm start
  ```

- [ ] **2.2 Verify Vibe Kanban is running**
  ```bash
  curl http://localhost:3001/health
  # Should return: {"status":"ok"}
  ```

- [ ] **2.3 Create test board**
  ```bash
  python3 - <<'EOF'
  from blackbox5.engine.integrations.vibe import VibeKanbanManager

  manager = VibeKanbanManager(api_url="http://localhost:3001")
  board = manager.create_board(name="Test Board")
  print(f"✅ Board created: {board.id}")
  EOF
  ```

- [ ] **2.4 Verify board in browser**
  ```
  Open: http://localhost:3001
  Should see: Test Board with columns (Backlog, Doing, Done)
  ```

### Phase 3: Agent Configuration (5 minutes)

- [ ] **3.1 Configure Planning Agent**
  ```bash
  cp .blackbox5/2-engine/02-agents/config/planning-agent.yaml.example \
     .blackbox5/2-engine/02-agents/config/planning-agent.yaml

  # Edit configuration
  nano .blackbox5/2-engine/02-agents/config/planning-agent.yaml
  ```

  **Required settings**:
  ```yaml
  agent_id: "planning-agent"
  vibe_kanban_url: "http://localhost:3001"
  project_memory_path: ".blackbox5/5-project-memory"
  ```

- [ ] **3.2 Configure Orchestrator Agent**
  ```bash
  cp .blackbox5/2-engine/02-agents/config/orchestrator-agent.yaml.example \
     .blackbox5/2-engine/02-agents/config/orchestrator-agent.yaml
  ```

  **Required settings**:
  ```yaml
  agent_id: "orchestrator"
  max_parallel_agents: 5
  vibe_kanban_url: "http://localhost:3001"
  ralphy_enabled: true
  ```

- [ ] **3.3 Configure Ralphy**
  ```bash
  # Already configured in previous integration
  # Verify it exists
  ls -la .blackbox5/2-engine/07-operations/runtime/ralphy-bb5-integrated.sh
  ```

### Phase 4: Project Memory Setup (2 minutes)

- [ ] **4.1 Create Project Memory structure**
  ```bash
  mkdir -p .blackbox5/5-project-memory/siso-internal/operations/{agents,ralphy}
  mkdir -p .blackbox5/5-project-memory/siso-internal/operations/agents/{active,history}
  ```

- [ ] **4.2 Verify AgentMemory module**
  ```bash
  python3 - <<'EOF'
  from blackbox5.engine.knowledge.memory.AgentMemory import AgentMemory

  # Test creation
  memory = AgentMemory(agent_id="test-agent")
  memory.add_session("Test task", "Test result")

  print(f"✅ AgentMemory working")
  print(f"Memory path: {memory.memory_path}")
  EOF
  ```

- [ ] **4.3 Test Ralphy integration**
  ```bash
  python3 .blackbox5/2-engine/07-operations/runtime/ralphy/blackbox_integration.py
  # Should output session data
  ```

### Phase 5: End-to-End Testing (10 minutes)

- [ ] **5.1 Test Planning Agent**
  ```bash
  python3 .blackbox5/1-docs/03-guides/02-tutorials/test-planning-agent.py
  ```

  **Expected output**:
  ```
  ✅ Planning Agent test started
  ✅ PRD created: .blackbox5/specs/prds/test-prd.md
  ✅ Epic created: .blackbox5/specs/epics/test-epic.md
  ✅ Tasks created: 5
  ✅ Pushed to Vibe Kanban: 5 cards
  ```

- [ ] **5.2 Test Orchestrator Agent**
  ```bash
  python3 .blackbox5/1-docs/03-guides/02-tutorials/test-orchestrator-agent.py
  ```

  **Expected output**:
  ```
  ✅ Orchestrator Agent test started
  ✅ Found 5 cards in backlog
  ✅ Assigned to 3 agents
  ✅ Agent-1 completed task
  ✅ Agent-2 completed task
  ✅ Agent-3 completed task
  ```

- [ ] **5.3 Test Ralphy Integration**
  ```bash
  cd /tmp/ralphy-orchestration-test
  python3 ../.blackbox5/1-docs/03-guides/02-tutorials/test-ralphy-workflow.py
  ```

  **Expected output**:
  ```
  ✅ Ralphy workflow test started
  ✅ Session created
  ✅ Task executed
  ✅ Files created: test.py
  ✅ Git commit made
  ✅ Session tracked in Project Memory
  ```

- [ ] **5.4 Test Complete Workflow**
  ```bash
  python3 .blackbox5/1-docs/03-guides/02-tutorials/test-complete-workflow.py
  ```

  **Expected output**:
  ```
  ✅ COMPLETE WORKFLOW TEST
  ✅ Phase 1: Planning
  ✅ Phase 2: Vibe Kanban
  ✅ Phase 3: Parallel Execution
  ✅ Phase 4: Project Memory

  📊 Results:
    - Tasks created: 5
    - Agents used: 3
    - Ralphy loops: 2
    - Direct tasks: 3
    - All tracked in Project Memory
  ```

---

## 🧪 Verification Checklist

### Quick Verification (2 minutes)

Run this single command to verify everything:

```bash
bash .blackbox5/1-docs/03-guides/02-tutorials/verify-all.sh
```

**What it checks**:
```
✅ Python 3.10+ installed
✅ Node.js 18+ installed
✅ Git configured
✅ Vibe Kanban running (http://localhost:3001)
✅ Planning Agent configured
✅ Orchestrator Agent configured
✅ Ralphy integrated
✅ Project Memory structure created
✅ AgentMemory working
✅ All dependencies installed

🎉 READY TO RUN!
```

### Manual Verification (If script fails)

**Check 1: Vibe Kanban**
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok"}
```

**Check 2: Planning Agent**
```bash
python3 -c "from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent; print('✅ OK')"
# Expected: ✅ OK
```

**Check 3: Orchestrator**
```bash
python3 -c "from blackbox5.engine.agents.workflows.orchestrator_agent import OrchestratorAgent; print('✅ OK')"
# Expected: ✅ OK
```

**Check 4: Ralphy**
```bash
.blackbox5/2-engine/07-operations/runtime/ralphy-bb5-integrated.sh --help
# Expected: Ralphy usage information
```

**Check 5: Project Memory**
```bash
ls -la .blackbox5/5-project-memory/siso-internal/operations/
# Expected: agents/, ralphy/ directories exist
```

---

## 🚀 Running Your First Workflow

### Option 1: Automated Test (Recommended)

```bash
# Run complete automated test
python .blackbox5/1-docs/03-guides/02-tutorials/test-complete-workflow.py

# This will:
# 1. Create a sample project
# 2. Plan tasks with Planning Agent
# 3. Push to Vibe Kanban
# 4. Execute with parallel agents
# 5. Show results in Project Memory
```

### Option 2: Manual Step-by-Step

```bash
# Step 1: Create test project
mkdir /tmp/workflow-test && cd /tmp/workflow-test
git init

# Step 2: Plan tasks
python3 - <<'EOF'
from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent

agent = PlanningAgent()
result = agent.plan_and_push("Create a simple calculator app")

print(f"✅ Tasks created: {result['tasks']}")
print(f"📊 View Kanban: {result['kanban_url']}")
EOF

# Step 3: Execute tasks
python3 - <<'EOF'
from blackbox5.engine.agents.workflows.orchestrator_agent import OrchestratorAgent

agent = OrchestratorAgent()
results = agent.orchestrate_parallel_execution()

print(f"✅ Tasks completed: {len(results)}")
EOF

# Step 4: Check results
echo "📊 Results in Project Memory:"
ls -la .blackbox5/5-project-memory/siso-internal/operations/
```

### Option 3: Interactive Demo

```bash
# Run interactive demo
python .blackbox5/1-docs/03-guides/02-tutorials/interactive-demo.py
```

**This will**:
1. Ask you what you want to build
2. Create tasks automatically
3. Show Vibe Kanban board
4. Execute with parallel agents
5. Display results

---

## 📊 Success Criteria

### Minimum Viable Setup

You have a working setup when:

- [ ] Vibe Kanban is accessible at http://localhost:3001
- [ ] Planning Agent can create tasks and push to Kanban
- [ ] Orchestrator can run 3+ agents in parallel
- [ ] Ralphy integration tracks sessions in Project Memory
- [ ] You can run the complete workflow test successfully

### Full Production Setup

You have full production setup when:

- [ ] All above minimum criteria met
- [ ] AgentMemory tracks all sessions
- [ ] Vibe Kanban shows real-time updates
- [ ] Ralphy loops work for complex tasks
- [ ] Project Memory contains complete session history
- [ ] Git commits are made automatically
- [ ] Insights are learned and stored

---

## 🐛 Troubleshooting

### Issue: Vibe Kanban not accessible

**Symptom**: `curl http://localhost:3001` fails

**Solution**:
```bash
# Check if Docker container is running
docker ps | grep vibekanban

# If not running, start it
docker run -d -p 3001:3001 vibekanban/server

# If using local installation
cd .blackbox5/2-engine/06-integrations/vibe
npm start
```

### Issue: Planning Agent fails

**Symptom**: `ImportError: No module named 'blackbox5'`

**Solution**:
```bash
# Add to PYTHONPATH
export PYTHONPATH="$PWD:$PYTHONPATH"

# Or install in development mode
pip install -e .blackbox5/2-engine/
```

### Issue: Orchestrator can't connect to Vibe Kanban

**Symptom**: `Connection refused` error

**Solution**:
```bash
# Check Vibe Kanban is running
curl http://localhost:3001/health

# Update configuration if using different port
nano .blackbox5/2-engine/02-agents/config/orchestrator-agent.yaml
# Change: vibe_kanban_url: "http://localhost:3001"
```

### Issue: Ralphy not tracking sessions

**Symptom**: No sessions in Project Memory

**Solution**:
```bash
# Check Ralphy integration
python3 .blackbox5/2-engine/07-operations/runtime/ralphy/blackbox_integration.py

# Verify Project Memory path
ls -la .blackbox5/5-project-memory/siso-internal/operations/ralphy/

# Check if using integrated wrapper
ls -la .blackbox5/2-engine/07-operations/runtime/ralphy-bb5-integrated.sh
```

---

## 📝 Quick Reference Commands

### Setup Commands
```bash
# Check prerequisites
bash .blackbox5/1-docs/03-guides/02-tutorials/check-prerequisites.sh

# Run setup
bash .blackbox5/1-docs/03-guides/02-tutorials/setup-agent-orchestration.sh

# Verify everything
bash .blackbox5/1-docs/03-guides/02-tutorials/verify-all.sh
```

### Test Commands
```bash
# Test Planning Agent
python .blackbox5/1-docs/03-guides/02-tutorials/test-planning-agent.py

# Test Orchestrator
python .blackbox5/1-docs/03-guides/02-tutorials/test-orchestrator-agent.py

# Test Ralphy
python .blackbox5/1-docs/03-guides/02-tutorials/test-ralphy-workflow.py

# Test complete workflow
python .blackbox5/1-docs/03-guides/02-tutorials/test-complete-workflow.py
```

### Run Commands
```bash
# Interactive demo
python .blackbox5/1-docs/03-guides/02-tutorials/interactive-demo.py

# Quick test
cd /tmp/quick-test && python ../.blackbox5/1-docs/03-guides/02-tutorials/test-complete-workflow.py
```

---

## ✅ Final Checklist

Before using in production:

- [ ] Run all tests successfully
- [ ] Verify Vibe Kanban board shows tasks
- [ ] Check Project Memory contains sessions
- [ ] Confirm git commits are made
- [ ] Test with your own project
- [ ] Read the complete workflow guide
- [ ] Understand how to monitor agents
- [ ] Know how to troubleshoot issues

---

## 🎯 Next Steps

Once setup is complete:

1. **Read the complete workflow guide**:
   ```bash
   cat .blackbox5/1-docs/01-theory/03-workflows/production/COMPLETE-AGENT-ORCHESTRATION-WORKFLOW.md
   ```

2. **Run your first real workflow**:
   ```bash
   python .blackbox5/1-docs/03-guides/02-tutorials/interactive-demo.py
   ```

3. **Monitor in Vibe Kanban**:
   ```
   Open: http://localhost:3001
   Watch agents work in real-time!
   ```

4. **Check results in Project Memory**:
   ```bash
   ls -la .blackbox5/5-project-memory/siso-internal/operations/agents/
   ls -la .blackbox5/5-project-memory/siso-internal/operations/ralphy/
   ```

---

## 📞 Getting Help

If something doesn't work:

1. **Check the troubleshooting section above**
2. **Run verification script**: `bash verify-all.sh`
3. **Check logs**: `.blackbox5/5-project-memory/siso-internal/operations/logs/`
4. **Review test output**: Look for error messages
5. **Consult the main documentation**: See the docs folder

---

**Summary**: 20 minutes from zero to full agent orchestration system! 🚀
