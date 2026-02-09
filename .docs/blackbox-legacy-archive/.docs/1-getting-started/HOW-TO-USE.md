# How to Book & Use Blackbox3

**Your Quick Guide to Starting with Blackbox3**

---

## 🎯 What is "Booking" Blackbox3?

"Booking" Blackbox3 simply means **starting a session** with a structured plan. Think of it like booking a meeting room - you're reserving space and structure for your AI-assisted work.

---

## 🚀 Quick Start: 3 Ways to Book Blackbox3

### Option 1: Simple Plan (Most Common)
**Best for:** Single tasks, research, feature work

```bash
cd "/Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/Blackbox3"

# Create a new plan (this is your "booking")
./scripts/new-plan.sh "your-task-name"

# Example:
./scripts/new-plan.sh "research-react-state-management"
```

This creates a plan folder with everything you need:
- ✓ 13 template files (README, checklist, status, etc.)
- ✓ Artifacts directory for outputs
- ✓ Context management system
- ✓ Auto-compaction setup

**Then work with AI:**
```bash
cd agents/.plans/<timestamp>_<task-name>/
# Open Claude Code, Cursor, or other AI tool
# Paste the agent prompt from agents/_core/prompt.md
# Start working!
```

---

### Option 2: Feature Research Workflow
**Best for:** Deep research on features, competitors, markets

```bash
cd "/Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/Blackbox3"

# Start feature research (auto-sets up everything)
./scripts/start-feature-research.sh
```

This creates a complete research workflow:
- ✓ Run folder with orchestration checklist
- ✓ Agent configuration files
- ✓ Context pack for quick reference
- ✓ Work queue for tracking progress
- ✓ Tranche report templates

---

### Option 3: Multi-Agent Cycle
**Best for:** Complex projects requiring multiple specialists

```bash
cd "/Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/Blackbox3"

# Start multi-agent workflow
./scripts/start-agent-cycle.sh
```

This sets up agent coordination:
- ✓ Run folder for agent handoffs
- ✓ Agent prompt templates
- ✓ Context tracking across agents
- ✓ Work queue for multi-agent tasks

---

## 📋 Step-by-Step: Your First Booking

### 1. Create Your Plan (Book It)

```bash
cd "/Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/Blackbox3"

./scripts/new-plan.sh "my-first-task"
```

**Output:**
```
Created plan: agents/.plans/2025-01-12_1500_my-first-task/
With 13 template files ready to use
```

### 2. Navigate to Your Plan

```bash
cd agents/.plans/2025-01-12_1500_my-first-task/
```

### 3. Read the Core Prompt

```bash
cat ../../agents/_core/prompt.md
```

This shows you the standard workflow and expectations.

### 4. Start Working with AI

**Option A: Claude Code (Recommended)**
1. Open Claude Code
2. Navigate to your plan folder
3. Paste the agent prompt
4. Start working!

**Option B: Cursor/Windsurf**
1. Open the editor
2. Open your plan folder
3. Use AI chat with the agent prompt
4. Create checkpoints as you go

### 5. Create Checkpoints (Progress Tracking)

As you complete work, create checkpoints:

```bash
./../../scripts/new-step.sh "research" "Completed initial research"
./../../scripts/new-step.sh "analysis" "Analyzed 5 competitors"
./../../scripts/new-step.sh "synthesis" "Created synthesis document"
```

**What this does:**
- ✓ Creates step files in `context/steps/`
- ✓ Auto-compacts at 10+ steps
- ✓ Maintains rolling context for AI
- ✓ Lets you work for hours without context overflow

### 6. Complete Your Plan

When done:
1. Update `status.md` to mark complete
2. Generate final report from template
3. Promote artifacts to permanent location

```bash
./../../scripts/promote.sh 2025-01-12_1500_my-first-task ../artifacts/
```

---

## 🎭 Using BMAD Agents

Blackbox3 includes specialized BMAD agents:

### Available Agents

| Agent | Best For | Location |
|-------|----------|----------|
| **analyst** | Research, competitive analysis | `agents/analyst/` |
| **pm** | Product requirements, PRDs | `agents/pm/` |
| **architect** | System architecture, design | `agents/architect/` |
| **dev** | Implementation, coding | `agents/dev/` |
| **qa** | Testing, validation | `agents/qa/` |
| **sm** | Sprint management | `agents/sm/` |
| **ux-designer** | User experience design | `agents/ux-designer/` |
| **tech-writer** | Documentation | `agents/tech-writer/` |

### How to Use an Agent

```bash
cd "/Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/Blackbox3"

# Option 1: Use agent's workflow
cd agents/analyst
cat prompt.md    # Read the agent's main prompt
cat runbook.md   # See step-by-step workflow
cat rubric.md    # Understand quality criteria

# Option 2: Create plan with agent
./scripts/new-plan.sh "analyst-research"
cd agents/.plans/<timestamp>_analyst-research/
# Use agent's prompt.md as your starting point
```

---

## 📊 What Happens During a Session

### The Blackbox Loop

```
READ → CHECK → PLAN → EXECUTE → CAPTURE → LOG
```

1. **READ** `context.md` - Understand project state
2. **CHECK** `tasks.md` - See what needs doing
3. **PLAN** - Create execution folder
4. **EXECUTE** - Work with AI in chat
5. **CAPTURE** - Save outputs to artifacts/
6. **LOG** - Update tasks.md

### The 5-Stage Workflow

All Blackbox3 work follows 5 stages:

**Stage 0 — Align**
- Restate goal in one sentence
- List constraints
- List required inputs

**Stage 1 — Plan**
- Create plan folder
- Write plan files (README, checklist, status)

**Stage 2 — Execute**
- Produce artifacts
- Create checkpoints
- Update status

**Stage 3 — Communicate**
- 1-line summary
- Current stage
- Decisions needed
- Output locations

**Stage 4 — Verify**
- Run validation
- Test results
- Check quality

**Stage 5 — Wrap**
- Update tasks.md
- Mark plan complete
- Provide summary

---

## 🔧 Advanced Bookings

### Long-Running Session (3+ hours)

```bash
# 1. Create plan
./scripts/new-plan.sh "deep-research-session"

# 2. Navigate to plan
cd agents/.plans/<timestamp>_deep-research-session/

# 3. Work with AI, creating checkpoints frequently
./../../scripts/new-step.sh "step1" "Completed step 1"
./../../scripts/new-step.sh "step2" "Completed step 2"
# ... repeat for 50+ steps over 6+ hours

# 4. Context auto-compacts every 10 steps
# 5. No context overflow, ever!
```

### Multi-Agent Project

```bash
# 1. Start agent cycle
./scripts/start-agent-cycle.sh

# 2. Each agent works in sequence:
#    - analyst → research
#    - pm → requirements
#    - architect → design
#    - dev → implementation
#    - qa → testing

# 3. Context maintained across agents
# 4. Work queue updated automatically
```

### OSS Discovery

```bash
# Start OSS discovery workflow
./scripts/start-oss-discovery-cycle.sh

# This sets up:
# - Finding open-source components
# - Analyzing licenses
# - Scoring candidates
```

---

## 📁 Where Everything Lives

```
Blackbox3/
├── agents/.plans/                    # Your bookings go here
│   ├── 2025-01-12_1500_task1/ # Completed plan
│   ├── 2025-01-12_1600_task2/ # Active plan
│   └── _template/             # Plan templates
│
├── agents/                    # Agent definitions
│   ├── analyst/
│   ├── pm/
│   ├── architect/
│   └── ...
│
├── scripts/                   # All executable scripts
│   ├── new-plan.sh           # Create new booking
│   ├── new-step.sh           # Create checkpoint
│   ├── start-feature-research.sh
│   └── ...
│
├── .memory/                   # Extended memory (500MB)
│   ├── working/
│   ├── extended/
│   └── archival/
│
├── context.md                 # Current project state
├── tasks.md                   # Project backlog
└── protocol.md                # System rules
```

---

## 💡 Tips for Great Bookings

### 1. Be Specific with Plan Names
```bash
# Good
./scripts/new-plan.sh "research-react-state-libraries-2025"

# Less good
./scripts/new-plan.sh "research"
```

### 2. Create Checkpoints Often
```bash
# After each meaningful piece of work
./../../scripts/new-step.sh "research-phase" "Analyzed 5 competitors"
./../../scripts/new-step.sh "analysis" "Created comparison matrix"
./../../scripts/new-step.sh "synthesis" "Wrote synthesis document"
```

### 3. Let Context Manage Itself
- Auto-compaction at 10+ steps
- No manual intervention needed
- Just keep working

### 4. Use the Right Tool
- **Simple task** → `new-plan.sh`
- **Feature research** → `start-feature-research.sh`
- **Multi-agent** → `start-agent-cycle.sh`

### 5. Complete the Loop
- Update status.md
- Generate final report
- Promote artifacts

---

## 🎯 Common Booking Scenarios

### Scenario 1: Research Task
```bash
# Create plan
./scripts/new-plan.sh "competitor-analysis"

# Navigate
cd agents/.plans/<timestamp>_competitor-analysis/

# Work with AI, creating checkpoints
./../../scripts/new-step.sh "research" "Found 10 competitors"
./../../scripts/new-step.sh "analysis" "Analyzed features"
./../../scripts/new-step.sh "report" "Created comparison table"
```

### Scenario 2: Feature Design
```bash
# Create plan
./scripts/new-plan.sh "user-authentication-design"

# Use architect agent
cat ../../agents/architect/prompt.md

# Work through design
./../../scripts/new-step.sh "requirements" "Gathered requirements"
./../../scripts/new-step.sh "design" "Created architecture diagram"
./../../scripts/new-step.sh "review" "Reviewed with team"
```

### Scenario 3: Bug Investigation
```bash
# Create plan
./scripts/new-plan.sh "investigate-login-bug"

# Work with AI to debug
./../../scripts/new-step.sh "reproduce" "Reproduced bug"
./../../scripts/new-step.sh "analyze" "Found root cause"
./../../scripts/new-step.sh "fix" "Implemented fix"
./../../scripts/new-step.sh "test" "Verified fix works"
```

---

## ✅ Ready to Book?

Your first booking is just one command away:

```bash
cd "/Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/Blackbox3"

# Create your first plan
./scripts/new-plan.sh "my-first-blackbox3-session"

# Navigate to it
cd agents/.plans/$(ls -t agents/.plans/ | head -1)

# Start working with AI!
```

---

## 📚 More Resources

- **Full Documentation**: `README.md`
- **Protocol**: `protocol.md`
- **Memory Architecture**: `MEMORY-ARCHITECTURE.md`
- **Agent Guide**: `agents/_core/prompt.md`
- **Testing**: Use the test-environment/ for experiments

---

**Happy Booking! 🚀**

Remember: Blackbox3 is simple, manual, and designed for AI-assisted development. Just create a plan and start working!
