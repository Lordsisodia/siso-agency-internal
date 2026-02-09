# Blackbox3 Quick Start Guide

**Get started in 3 minutes**

---

## 1. Create Your First Plan

```bash
./scripts/new-plan.sh "my-project"
```

This creates a plan folder with all templates:
- README.md (project description)
- checklist.md (completion checklist)
- status.md (status tracking)
- work-queue.md (next actions)
- success-metrics.md (how to measure success)
- progress-log.md (progress over time)
- notes.md (ad-hoc notes)
- artifacts.md (track outputs)
- docs-to-read.md (reading list)
- final-report.md (final deliverable)
- rankings.md (scored ideas)
- artifact-map.md (where outputs live)
- context/ (context management)

---

## 2. Navigate to Your Plan

```bash
cd agents/.plans/<plan-folder>
```

---

## 3. Work with AI

As you work with AI, create checkpoints:

```bash
./../../scripts/new-step.sh "research-phase" "Competitor research completed"
```

This creates:
- A step file in context/steps/001_*.md
- Auto-compaction when 10+ steps accumulate
- Rolling context in context/context.md

---

## 4. For Long Sessions (3+ hours)

The context management system automatically:
- Creates checkpoint files every time you call new-step.sh
- Compacts 10+ steps into one file (prevents overflow)
- Maintains rolling context for AI to read
- Keeps recent steps accessible

**No action needed** - it's automatic!

---

## 5. Use One-Command Workflows

### Feature Research
```bash
./scripts/start-feature-research.sh
```
Creates a complete feature research workflow with:
- Run folder setup
- Agent configuration
- Context pack
- Work queue

### Agent Cycle
```bash
./scripts/start-agent-cycle.sh
```
Starts a multi-agent workflow with:
- Run folder
- Agent prompts
- Context tracking

### OSS Discovery
```bash
./scripts/start-oss-discovery-cycle.sh
```
Starts OSS discovery workflow for:
- Finding open-source components
- Analyzing licenses
- Scoring candidates

---

## 6. Validate Your Work

```bash
# Validate all plans
./scripts/validate-all.sh

# Validate long-running workflow
./scripts/validate-loop.sh
```

---

## 7. Promote Artifacts

```bash
./scripts/promote.sh <plan-folder> <destination>
```

Moves outputs from plan folder to permanent location.

---

## Agent Examples

### Deep Research Agent
```bash
# Use the deep-research agent
cd agents/deep-research
cat runbook.md  # See step-by-step guide
cat rubric.md   # See quality criteria
```

### Feature Research Agent
```bash
# Use the feature-research agent
cd agents/feature-research
cat agent.md    # See agent description
cat prompt.md   # See main prompt
```

---

## Create Your Own Agent

```bash
./scripts/new-agent.sh "my-agent"
```

Creates a new agent from the template with:
- agent.md (agent description)
- prompt.md (main prompt)
- runbook.md (step-by-step guide)
- rubric.md (quality criteria)
- prompts/ (reusable prompts)
- schemas/ (output templates)
- examples/ (reference outputs)

---

## Directory Structure

```
Blackbox3/
├── scripts/           # All executable scripts (17 total)
│   ├── new-plan.sh
│   ├── new-run.sh
│   ├── new-step.sh
│   ├── compact-context.sh
│   ├── start-feature-research.sh
│   ├── start-agent-cycle.sh
│   ├── start-oss-discovery-cycle.sh
│   ├── validate-all.sh
│   └── ...
├── agents/.plans/            # Your plans go here
│   ├── _template/     # Plan templates
│   └── <plan-folders>/
├── agents/            # Agent definitions
│   ├── _template/     # Agent template
│   ├── deep-research/
│   └── feature-research/
└── README.md          # This file
```

---

## What Makes Blackbox3 Different

### Before Blackbox3
- AI sessions limited to 30 minutes (context overflow)
- No way to track long-running work
- Manual context management
- Templates scattered
- No workflow automation

### After Blackbox3
- ✅ Unlimited AI sessions (hours, not minutes)
- ✅ Automatic context management
- ✅ Complete plan templates
- ✅ Rich agent structure
- ✅ One-command workflows
- ✅ Validation and testing
- ✅ Artifact management

---

## Common Workflows

### Research Task
```bash
# 1. Create plan
./scripts/new-plan.sh "competitor-analysis"

# 2. Navigate to plan
cd agents/.plans/<plan-folder>

# 3. Work with AI, creating checkpoints
./../../scripts/new-step.sh "research" "Analyzed 5 competitors"
./../../scripts/new-step.sh "synthesis" "Synthesized findings"
# ... (repeat for 3 hours, 60+ steps)

# 4. Context auto-compacts every 10 steps
# 5. Generate final report from template
```

### Multi-Agent Project
```bash
# 1. Start workflow
./scripts/start-agent-cycle.sh

# 2. Each agent creates checkpoints
# 3. Context maintained across agents
# 4. Work queue updated automatically
# 5. Success metrics tracked
```

### Feature Development
```bash
# 1. Start feature research
./scripts/start-feature-research.sh

# 2. Follow orchestration checklist
# 3. Use tranche reports for progress
# 4. Validate and promote artifacts
```

---

## Tips

1. **Always create checkpoints** when completing a task
   - Helps AI maintain context
   - Creates audit trail
   - Enables compaction

2. **Use run folders for execution**, plans for planning
   - Plans: `agents/.plans/` (thinking)
   - Runs: `agents/.plans/` (doing)
   - Same structure, different purpose

3. **Let context manage itself**
   - Auto-compaction at 10+ steps
   - No manual intervention needed
   - Just keep working

4. **Validate before promoting**
   - Run validate-all.sh
   - Check completeness
   - Then promote artifacts

5. **Use agents as templates**
   - deep-research is a great example
   - Copy and customize
   - Or use new-agent.sh

---

## Getting Help

- **See examples:** Check agents/.plans/_template/ for template examples
- **Read runbooks:** agents/*/runbook.md for step-by-step guides
- **Check rubrics:** agents/*/rubric.md for quality criteria
- **Review tests:** See SPRINT-1-VERIFICATION.md and SPRINT-6-TEST.md

---

## Next Steps

1. **Create your first plan** - `./scripts/new-plan.sh "my-first-project"`
2. **Work with AI** - Create checkpoints as you go
3. **Try a workflow** - `./scripts/start-feature-research.sh`
4. **Explore agents** - Check out agents/deep-research/
5. **Read the docs** - Start with README.md

---

**Blackbox3 is ready to use! Start creating plans and working with AI. 🚀**
