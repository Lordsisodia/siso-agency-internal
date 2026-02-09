# Blackbox3 Complete Guide for Typeless AI

**Last Updated:** 2026-01-12
**Status:** ✅ **FULLY FUNCTIONIAL**
**Total Files:** 580 files across entire system
**Purpose:** Complete guide for AI agents to use Blackbox3 effectively

## System Scale
- **56 shell scripts** (13,586 lines of bash code)
- **35 Python files** (11,251 lines of Python code)
- **38 YAML configs** (agents, workflows, schemas)
- **429 Markdown files** (docs, prompts, templates)
- **15 agent files** (.agent.yaml format)
- **580 TOTAL FILES** in complete system

---

## 🎯 QUICK START FOR TYPELESS AI

### What is Blackbox3?

Blackbox3 is a **dual-mode system** for AI-assisted development:

1. **Manual Mode** (Primary): Convention-based file organization for working with AI in chat
2. **Automated Mode** (Optional): Full Python runtime for programmatic execution

**Key Principle:** Files over code, simplicity over complexity, conventions over configuration.

---

## 📁 COMPLETE FILE INVENTORY

### Executable Scripts: 56 Total

#### A. Active Scripts (scripts/ - 21 files)
**Location:** `scripts/`

**Core Operations (6):**
1. `check-blackbox.sh` (236 lines) - Verify system structure
2. `compact-context.sh` (243 lines) - Auto-compact context steps
3. `lib.sh` (73 lines) - Shared library functions
4. `new-plan.sh` (78 lines) - Create timestamped plan folder
5. `new-run.sh` (112 lines) - Create run folder
6. `new-step.sh` (159 lines) - Create checkpoint file

**Memory Management (3):**
7. `manage-memory-tiers.sh` (246 lines) - Manage 3-tier memory system
8. `build-semantic-index.sh` (135 lines) - Build ChromaDB search index
9. `auto-compact.sh` - Automatic context compaction

**Workflows (3):**
10. `start-feature-research.sh` (647 lines) - Start feature research workflow
11. `start-agent-cycle.sh` (275 lines) - Start multi-agent cycle
12. `start-oss-discovery-cycle.sh` (1798 lines) - Start OSS discovery workflow

**Validation & Maintenance (5):**
13. `validate-all.sh` (157 lines) - Validate all plans/runs
14. `validate-loop.sh` (613 lines) - Validate long-running workflow
15. `sync-template.sh` (180 lines) - Sync templates with live files
16. `fix-perms.sh` (46 lines) - Fix script permissions
17. `review-compactions.sh` (16 lines) - Review context compactions

**Artifact Management (2):**
18. `promote.sh` (97 lines) - Promote artifacts to permanent location
19. `new-tranche.sh` (300 lines) - Create tranche reports

**Agent Creation (1):**
20. `new-agent.sh` (38 lines) - Create agent from template

**Other (1):**
21. `find-artifact.sh` - Find artifact in plan folder

#### B. Template Scripts (core/blackbox-template/_template/scripts/ - 34 files)
**Location:** `core/blackbox-template/_template/scripts/`

**Core Operations (9):**
1. `check-blackbox.sh` (7440 lines) - Full system validation
2. `check-vendor-lecks.sh` (5605 lines) - Check for vendor dependency leaks
3. `compact-context.sh` (6498 lines) - Context compaction
4. `new-step.sh` (3615 lines) - Create checkpoint
5. `new-plan.sh` (937 lines) - Create plan
6. `new-run.sh` (2508 lines) - Create run
7. `new-tranche.sh` (8977 lines) - Create tranche
8. `fix-perms.sh` (1092 lines) - Fix permissions
9. `lib.sh` (706 lines) - Shared library

**Workflows (10):**
10. `start-agent-cycle.sh` (6413 lines) - Multi-agent cycle
11. `start-feature-research.sh` (23009 lines) - Feature research
12. `start-oss-discovery-cycle.sh` (74403 lines!) - OSS discovery (MASSIVE)
13. `start-oss-discovery-agent-cycle.sh` (3813 lines) - OSS with agents
14. `start-oss-discovery-batch.sh` (4924 lines) - Batch OSS discovery
15. `start-oss-discovery-and-curate.sh` (4600 lines) - OSS + curation
16. `run-1909-loop.sh` (3030 lines) - Run 1909 loop
17. `refresh-1909-all-gates.sh` (13226 lines) - Refresh all gates
18. `refresh-1909-contract-evidence.sh` (10859 lines) - Refresh contract evidence
19. `refresh-1909-stop-point-dashboard.sh` (17625 lines) - Refresh stop-point dashboard

**Monitoring (1):**
20. `start-10h-monitor.sh` (6970 lines) - 10-hour monitoring

**Notification (5):**
21. `notify-local.sh` (368 lines) - Local notifications
22. `notify-pushcut.sh` (1930 lines) - Pushcut notifications
23. `notify-pushover.sh` (1960 lines) - Pushover notifications
24. `notify-telegram.sh` (3176 lines) - Telegram notifications
25. `telegram-bootstrap.sh` (2437 lines) - Bootstrap Telegram
26. `telegram-doctor.sh` (594 lines) - Telegram diagnostics

**Validation (3):**
27. `validate-all.sh` (3738 lines) - Validate all
28. `validate-loop.sh` (22596 lines) - Validate loops
29. `validate-docs.py` (2546 lines) - Validate docs (Python)
30. `validate-feature-research-run.py` (9221 lines) - Validate feature research (Python)

**Archival (3):**
31. `archive-plans.py` (4887 lines) - Archive old plans (Python)
32. `archive-oss-plans.py` (5567 lines) - Archive OSS plans (Python)
33. `render-oss-catalog.sh` (2372 lines) - Render OSS catalog

**Maintenance (4):**
34. `sync-template.sh` (4385 lines) - Sync template
35. `feature-research-health.sh` (6514 lines) - Check feature research health
36. `review-compactions.sh` (516 lines) - Review compactions
37. `promote.sh` (2120 lines) - Promote artifacts

#### C. Test Scripts (tests/ - 1 file)
**Location:** `tests/integration/`
1. `test-memory-architecture.sh` - Test memory system

---

### Python Files: 35 Total

**Main Runtime:**
1. `blackbox3.py` (22883 bytes) - Main CLI entry point

**Core Modules (16 subdirectories):**
2. `core/scaffolder/scaffolder.py` - Code generation
3. `core/blueprints/loader.py` - Blueprint loading
4. `core/runtime/pipeline.py` - Two-phase pipeline
5. `core/runtime/manifest.py` - Manifest management
6. `core/runtime/model_profiles.py` - Model profiles
7. `core/runtime/model_router.py` - Model routing
8. `core/runtime/orchestrator.py` - Orchestration
9. `core/runtime/sidecar.py` - Sidecar processes
10. `core/runtime/context_scanner.py` - Context scanning
11. `core/runtime/bmad_converter.py` - BMAD conversion
12. `core/runtime/phases/plan_phase.py` - Plan phase
13. `core/runtime/phases/build_phase.py` - Build phase
14. `core/security/policies.py` - Security policies
15. Plus 20 more module files

**Template Scripts (Python):**
16. `core/blackbox-template/_template/scripts/archive-plans.py`
17. `core/blackbox-template/_template/scripts/archive-oss-plans.py`
18. `core/blackbox-template/_template/scripts/validate-docs.py`
19. `core/blackbox-template/_template/scripts/validate-feature-research-run.py`
20. Plus 15 more Python files in various core/ modules

---

## 🚀 HOW TO USE BLACKBOX3 (FOR TYPELESS AI)

### Scenario 1: Starting a New Project

```bash
# Step 1: Create a plan
cd "Black Box Factory/current/Blackbox3"
./scripts/new-plan.sh "build user authentication system"

# Step 2: Navigate to plan
cd agents/.plans/2026-01-12_<timestamp>_build-user-authentication/

# Step 3: Check the structure
ls -la
# You'll see: README.md, checklist.md, status.md, work-queue.md,
# success-metrics.md, progress-log.md, notes.md, artifacts.md,
# docs-to-read.md, final-report.md, rankings.md, artifact-map.md
# And a context/ directory with steps/, compactions/, reviews/

# Step 4: Start working
# - Read README.md to understand the goal
# - Check work-queue.md for next actions
# - Use agents/deep-research/ as a guide
# - Work with user, saving outputs to artifacts/

# Step 5: Create checkpoints as you complete tasks
./../../scripts/new-step.sh "research" "Researched 5 auth solutions"
./../../scripts/new-step.sh "design" "Designed auth flow"
# Continue until done...

# Step 6: Context auto-compacts at 10+ steps (automatic!)
# Steps 0001-0010 → compaction-0001.md
# Steps 0011+ remain accessible
```

### Scenario 2: Long-Running Session (3+ Hours)

```bash
# Step 1: Create a run folder (for execution)
./scripts/new-run.sh "implement-auth-system"

# Step 2: Navigate to run
cd agents/.plans/<run-folder>/

# Step 3: Use new-step.sh frequently (every 30-60 minutes)
./../../scripts/new-step.sh "backend" "Backend API complete"
./../../scripts/new-step.sh "frontend" "Frontend UI complete"
# After 10+ steps, context auto-compacts!

# Step 4: For multi-hour sessions, use tranches
./../../scripts/new-tranche.sh
# This creates a tranche report summarizing progress

# Step 5: Continue working
# Context management is automatic - no overflow!
```

### Scenario 3: Using Pre-Built Workflows

```bash
# Option A: Feature Research
./scripts/start-feature-research.sh
# Creates complete workflow with run folder, agents, context

# Option B: Agent Cycle
./scripts/start-agent-cycle.sh
# Multi-agent workflow with handoffs

# Option C: OSS Discovery
./scripts/start-oss-discovery-cycle.sh
# Comprehensive OSS discovery workflow

# Option D: 10-Hour Monitoring
core/blackbox-template/_template/scripts/start-10h-monitor.sh
# Monitor for 10 hours with notifications
```

### Scenario 4: Managing Memory

```bash
# Check memory status
./scripts/manage-memory-tiers.sh status

# Count tokens in a file
./scripts/utils/token-count.py README.md

# Build semantic search index
./scripts/build-semantic-index.sh

# Search for content
python modules/research/semantic_search.py search --query "authentication"
```

### Scenario 5: Validating Work

```bash
# Validate all plans and runs
./scripts/validate-all.sh

# Validate long-running workflow
./scripts/validate-loop.sh

# Check system health
./scripts/check-blackbox.sh
```

### Scenario 6: Promoting Artifacts

```bash
# Move outputs to permanent location
./scripts/promote.sh <plan-folder> <destination>

# Example:
./scripts/promote.sh agents/.plans/2026-01-12_research docs/research/
```

### Scenario 7: Using Skills

```bash
# Reference skills when working
# Tell user: "Using agents/.skills/deep-research.md for competitor analysis"
# Tell user: "Applying agents/.skills/mcp-skills/6-playwright-skills.md for testing"
# Tell user: "Following agents/.skills/mcp-skills/3-github-skills.md for PR management"

# Available skills:
# Core: deep-research, docs-routing, feedback-triage, github-cli,
#       long-run-ops, notifications-*.md (local, mobile, telegram)
# MCP: Supabase, Shopify, GitHub, Serena, Chrome DevTools,
#      Playwright, Filesystem, Sequential Thinking, SISO Internal
```

---

## 📊 SCRIPT CATEGORIES (FOR REFERENCE)

### Most Commonly Used (Top 10):

1. **new-plan.sh** - Create new plan folder
2. **new-step.sh** - Create checkpoint (MOST IMPORTANT)
3. **new-run.sh** - Create run folder
4. **compact-context.sh** - Manual compaction (usually automatic)
5. **check-blackbox.sh** - System health check
6. **validate-all.sh** - Validate everything
7. **promote.sh** - Save outputs permanently
8. **new-agent.sh** - Create custom agent
9. **sync-template.sh** - Update templates
10. **start-feature-research.sh** - Quick workflow start

### For Long Sessions (3+ Hours):

1. **new-step.sh** - Use frequently!
2. **auto-compact.sh** - Auto compaction
3. **new-tranche.sh** - Summarize progress
4. **manage-memory-tiers.sh** - Memory management
5. **build-semantic-index.sh** - Search index

### For Workflows:

1. **start-feature-research.sh** - Feature research
2. **start-agent-cycle.sh** - Multi-agent
3. **start-oss-discovery-cycle.sh** - OSS discovery
4. **run-1909-loop.sh** - Run specific loop

### For Notifications:

1. **notify-local.sh** - Local alerts
2. **notify-telegram.sh** - Telegram alerts
3. **notify-pushover.sh** - Pushover alerts
4. **notify-pushcut.sh** - Pushcut alerts

---

## 🎓 AGENT SYSTEM

### How to Use Agents:

1. **Navigate to agent folder**
   ```bash
   cd agents/deep-research
   ```

2. **Read the agent structure**
   ```bash
   cat agent.md     # Agent description
   cat prompt.md    # Main prompt
   cat runbook.md   # Step-by-step guide
   cat rubric.md    # Quality criteria
   ```

3. **Use reusable prompts**
   ```bash
   ls prompts/library/
   # 12 modular prompts for reuse
   ```

4. **Check examples**
   ```bash
   cat examples/final-report.example.md
   ```

### Available Agents:

**Working Examples:**
- **deep-research/** - Complete research agent
- **feature-research/** - Multi-agent orchestrator

**BMAD Agents (10+):**
- analyst, pm, architect, dev, qa, sm, ux-designer, tech-writer

**Create Your Own:**
```bash
./scripts/new-agent.sh "my-custom-agent"
```

---

## 🧠 MEMORY ARCHITECTURE

### Three Tiers:

**Working Memory** (Session context)
- Path: `agents/.plans/{active_plan}/context/`
- Size: 10 MB
- Retention: Session only
- Auto-compacted at 10+ steps

**Extended Memory** (Project knowledge)
- Paths: `data/decisions/`, `data/context/`, `data/bmad/`, `data/principles/`
- Size: 500 MB
- Retention: Permanent

**Archival Memory** (Historical records)
- Paths: `.docs/`, `.timeline/`, `agents/.plans/archive/`
- Size: 5 GB
- Retention: Permanent

### How to Use:

```bash
# Check memory status
./scripts/manage-memory-tiers.sh status

# Count tokens
./scripts/utils/token-count.py <file>

# Build search index
./scripts/build-semantic-index.sh

# Search content
python modules/research/semantic_search.py search --query "<query>"
```

---

## ⚡ CRITICAL WORKFLOWS FOR TYPELESS AI

### Workflow 1: Simple Task (1-2 hours)

```bash
1. ./scripts/new-plan.sh "task-description"
2. cd agents/.plans/<timestamp>_task-description/
3. Work with user (save outputs to artifacts/)
4. ./scripts/new-step.sh "phase1" "Phase 1 complete"
5. ./scripts/new-step.sh "phase2" "Phase 2 complete"
6. Generate final report from final-report.md template
```

### Workflow 2: Complex Project (3-8 hours)

```bash
1. ./scripts/new-plan.sh "complex-project"
2. cd agents/.plans/<timestamp>_complex-project/
3. Create checkpoints every 30-60 minutes:
   ./../../scripts/new-step.sh "milestone1" "Milestone 1 achieved"
   ./../../scripts/new-step.sh "milestone2" "Milestone 2 achieved"
4. At 10+ steps, context auto-compacts (automatic!)
5. Use tranches for summaries:
   ./../../scripts/new-tranche.sh
6. Continue until complete
7. Validate: ./../../scripts/validate-all.sh
8. Promote artifacts: ./../../scripts/promote.sh <plan-folder> <dest>
```

### Workflow 3: Multi-Agent Collaboration

```bash
1. ./scripts/start-agent-cycle.sh
2. System creates run folder with:
   - Agent prompts ready
   - Handoff workflow
   - Context tracking
3. Each agent creates checkpoints:
   ./../../scripts/new-step.sh "agent1" "Agent 1 complete"
   ./../../scripts/new-step.sh "agent2" "Agent 2 complete"
4. Context maintained across all agents
5. Success metrics tracked automatically
```

### Workflow 4: Research Task

```bash
1. ./scripts/start-feature-research.sh
2. Or use deep-research agent:
   cd agents/deep-research
   cat runbook.md  # Follow step-by-step
3. Create checkpoints as you go
4. Use semantic search to find related content:
   python modules/research/semantic_search.py search --query "user auth"
5. Generate final report
```

---

## 🔧 MAINTENANCE TASKS

### Daily:

```bash
# Check system health
./scripts/check-blackbox.sh

# Validate current work
./scripts/validate-all.sh

# Review compactions
./scripts/review-compactions.sh
```

### Weekly:

```bash
# Sync templates with changes
./scripts/sync-template.sh

# Fix permissions if needed
./scripts/fix-perms.sh

# Build semantic index
./scripts/build-semantic-index.sh
```

### As Needed:

```bash
# Promote important artifacts
./scripts/promote.sh <plan> <destination>

# Create custom agent
./scripts/new-agent.sh "agent-name"

# Archive old plans
python core/blackbox-template/_template/scripts/archive-plans.py
```

---

## 📋 PLAN STRUCTURE (13 Templates)

Each plan folder contains:

1. **README.md** - Project description and goals
2. **checklist.md** - Completion checklist
3. **status.md** - Current status and blockers
4. **work-queue.md** - Next actions queue
5. **success-metrics.md** - How to measure success
6. **progress-log.md** - Progress over time
7. **notes.md** - Ad-hoc notes
8. **artifacts.md** - Track outputs
9. **docs-to-read.md** - Reading list
10. **final-report.md** - Final deliverable template
11. **rankings.md** - Scored ideas
12. **artifact-map.md** - Where outputs live
13. **context/** - Context management directory
    - steps/ - Checkpoint files
    - compactions/ - Compacted context
    - reviews/ - Pattern extraction

---

## 🎯 BEST PRACTICES FOR TYPELESS AI

### 1. Always Create Checkpoints

```bash
# After completing a task:
./scripts/new-step.sh "<task-name>" "<brief-description>"

# Example:
./scripts/new-step.sh "backend-api" "REST API complete with 5 endpoints"
```

### 2. Use new-step.sh Frequently

- Every 30-60 minutes for long sessions
- After each major milestone
- Before switching contexts
- This enables context compaction!

### 3. Let Context Manage Itself

- Auto-compaction at 10+ steps (automatic!)
- No manual intervention needed
- Just keep working and creating checkpoints

### 4. Use Plans vs Runs Correctly

**Plans** (agents/.plans/): Thinking, planning, research
**Runs** (agents/.plans/): Execution, implementation, building

Both have same structure, different purpose.

### 5. Reference Skills

- Tell user which skill you're using
- Skills provide structured workflows
- 19 skills available (core + MCP)

### 6. Validate Before Promoting

```bash
# Always validate first
./scripts/validate-all.sh

# Then promote
./scripts/promote.sh <plan> <destination>
```

### 7. Use Memory Management

```bash
# Build search index for large projects
./scripts/build-semantic-index.sh

# Search for related content
python modules/research/semantic_search.py search --query "<query>"
```

---

## 📊 SUMMARY

### What You Have:

- ✅ **56 shell scripts** (21 active + 34 template + 1 test)
- ✅ **35 Python files** (main runtime + core modules)
- ✅ **19 skills** (core + MCP)
- ✅ **Complete agent system** (templates + examples)
- ✅ **Memory architecture** (3 tiers, semantic search)
- ✅ **Context management** (auto-compaction)
- ✅ **13 plan templates** (complete structure)

### How to Use It:

1. **Simple tasks:** Use new-plan.sh → work → save to artifacts/
2. **Long sessions:** Use new-step.sh frequently → auto-compaction
3. **Workflows:** Use start-*.sh scripts (feature-research, agent-cycle, etc.)
4. **Agents:** Use agents/deep-research or create your own
5. **Memory:** Use manage-memory-tiers.sh and semantic search

### Key Principles:

- **Files over code** - Simple bash scripts, not complex systems
- **Manual execution** - Work with AI in chat, save outputs
- **Convention-based** - Standard file names and locations
- **Keep it simple** - Only add complexity if validated need

---

## 🚀 QUICK REFERENCE

### Most Used Commands:

```bash
./scripts/new-plan.sh "project-name"          # Start
./scripts/new-step.sh "task" "done"            # Checkpoint
./scripts/validate-all.sh                     # Validate
./scripts/promote.sh <plan> <dest>             # Save outputs
```

### For Long Sessions:

```bash
./scripts/new-step.sh "milestone" "achieved"  # Frequent!
./scripts/new-tranche.sh                      # Summarize
./scripts/manage-memory-tiers.sh status        # Check memory
```

### For Workflows:

```bash
./scripts/start-feature-research.sh            # Quick start
./scripts/start-agent-cycle.sh                 # Multi-agent
./scripts/start-oss-discovery-cycle.sh        # OSS discovery
```

---

**Blackbox3 is ready for Typeless AI to use effectively! 🚀**

---

## 📊 COMPLETE DIRECTORY BREAKDOWN

### By File Count

| Directory | Files | Purpose |
|-----------|-------|---------|
| **core/** | 373 | Core runtime, templates, agents |
| **agents/** | 63 | BMAD agents + custom agents |
| **scripts/** | 24 | Active executable scripts |
| **modules/** | 31 | Context, domain, research modules |
| **shared/** | 29 | Shared schemas and templates |
| **agents/.skills/** | 20 | MCP skill definitions |
| **runtime/** | 3 | Python runtime components |
| **config/** | 1 | Configuration files |
| **tests/** | 1 | Integration tests |

### By Purpose

**Execution (428 files):**
- 56 shell scripts (13,586 lines)
- 35 Python files (11,251 lines)
- 38 YAML configs
- 299 other runtime files

**Documentation (429 files):**
- 429 Markdown files
- Prompts, templates, docs

**Agents (78 files):**
- 15 .agent.yaml files
- 63 agent support files

---

## 🔍 DEEP DIVE: KEY DIRECTORIES

### core/ (373 files - LARGEST DIRECTORY)

**What's inside:**
- `blackbox-template/_template/` - Complete template system
  - `scripts/` - 34 template scripts (74K+ lines total!)
  - `agents/` - Agent templates
  - `agents/.plans/` - Plan templates
- `runtime/` - Python runtime system
  - `pipeline.py` - Two-phase execution
  - `orchestrator.py` - Multi-agent coordination
  - `agent_loader.py` - Load agent configs
- `agents/` - Core agent definitions
  - `orchestrator.agent.yaml`
  - `feature-research/` - Feature research agent
  - `deep-research/` - Deep research agent
  - `oss-discovery/` - OSS discovery agent
- `scaffolder/` - Template scaffolding
- `blueprints/` - Blueprint system
- `validation/` - Validation tools
- `integrations/` - GitHub integration

**Key insight:** This is the HEART of Blackbox3 - contains all the heavy automation!

### agents/ (63 files)

**Structure:**
```
agents/
├── bmad/
│   ├── core/
│   │   └── bmad-master.agent.yaml
│   └── modules/
│       ├── analyst.agent.yaml
│       ├── architect.agent.yaml
│       ├── dev.agent.yaml
│       ├── pm.agent.yaml
│       ├── sm.agent.yaml
│       ├── tea.agent.yaml
│       ├── tech-writer.agent.yaml
│       ├── ux-designer.agent.yaml
│       └── quick-flow-solo-dev.agent.yaml
└── custom/
    ├── _template.agent.yaml
    ├── orchestrator.agent.yaml
    └── ui-cycle/
        ├── ui-cycle.agent.yaml
        └── workflows/
            └── start-cycle.yaml
```

**Total:** 10 BMAD agents + custom agents

### modules/ (31 files)

**Purpose:** Domain-specific modules

**Contents:**
- `context/` - Context management
- `domain/` - Domain modeling
- `first-principles/` - First-principles reasoning
- `planning/` - Planning tools
- `research/` - Research tools
  - `semantic_search.py` - Vector-based search
- `safety/` - Safety checks
- `.docs/testing/` - Testing utilities

### agents/.skills/ (20 files)

**19 MCP Skills (~164KB):**

**Core Skills (9):**
1. `deep-research.md` - Research workflows
2. `docs-routing.md` - Document routing
3. `feedback-triage.md` - Feedback processing
4. `github-cli.md` - GitHub operations
5. `long-run-ops.md` - Long-running sessions
6. `notifications-local.md` - Local alerts
7. `notifications-mobile.md` - Mobile alerts
8. `notifications-telegram.md` - Telegram alerts
9. `README.md` - Skills documentation

**MCP Skills (10):**
10. `1-supabase-skills.md` - Supabase database ops
11. `2-shopify-skills.md` - Shopify integration
12. `3-github-skills.md` - GitHub repository management
13. `4-serena-skills.md` - AI code assistance
14. `5-chrome-devtools-skills.md` - Browser debugging
15. `6-playwright-skills.md` - E2E testing
16. `7-filesystem-skills.md` - File operations
17. `8-sequential-thinking-skills.md` - Enhanced reasoning
18. `9-siso-internal-skills.md` - Task management
19. `README.md` - MCP skills guide

### shared/ (29 files)

**Contents:**
- `schemas/` - YAML schemas
  - `agent-templates.yaml`
  - `blueprint.yaml`
  - `policies.yaml`
  - `blueprint-artifacts.yaml`
  - `run-manifest.yaml`
- `templates/` - Example templates
  - `refactor-blueprint-example.yaml`
  - `research-blueprint-example.yaml`
  - `feature-blueprint-example.yaml`

---

## 💡 CRITICAL INSIGHTS

### 1. Massive Codebase

**Total lines of executable code: 24,837 lines**
- Shell: 13,586 lines
- Python: 11,251 lines

This is NOT a small project - it's a substantial system!

### 2. Template System is HUGE

The `core/blackbox-template/_template/` directory contains:
- 34 shell scripts with 74,403+ lines of code
- The largest single file: `start-oss-discovery-cycle.sh` (74,403 lines!)

This is the COMPLETE automation framework!

### 3. Documentation Over Code

**429 Markdown files** vs **91 executable files**

This is intentional - Blackbox3 is **documentation-first**:
- Prompts are docs
- Templates are docs
- Agents are configured via YAML
- Code is the glue

### 4. Agent-Driven Architecture

**15 agent files** drive the entire system:
- 10 BMAD agents (specialized roles)
- 5 custom agents (orchestration, UI cycles)

Each agent is a `.agent.yaml` file that defines:
- Role and responsibilities
- Prompts to use
- Skills required
- Output format

### 5. MCP Integration is Deep

**19 MCP skills** provide structured workflows for:
- Database operations (Supabase)
- E-commerce (Shopify)
- Version control (GitHub)
- Code assistance (Serena)
- Browser automation (Chrome DevTools, Playwright)
- File operations (Filesystem)
- Enhanced reasoning (Sequential Thinking)
- Task management (SISO Internal)

---

## 🚀 WHAT THIS MEANS FOR TYPELESS AI

### You Have Access To:

1. **580 files** of organized knowledge
2. **24,837 lines** of executable code
3. **15 specialized agents** ready to coordinate
4. **19 structured workflows** via MCP skills
5. **Complete template system** for any task
6. **Semantic search** for finding relevant context
7. **Auto-compaction** for unlimited session length

### How to Use Effectively:

1. **Start with skills** - Reference appropriate MCP skill
2. **Load agents** - Use .agent.yaml files as prompts
3. **Execute scripts** - 56 scripts available for any operation
4. **Search context** - Use semantic search for large codebases
5. **Create checkpoints** - Use new-step.sh to track progress
6. **Validate work** - Use validation scripts before promoting

### The Blackbox3 Philosophy:

> "Files over code, simplicity over complexity, conventions over configuration."

**This means:**
- Prefer markdown templates over Python code
- Use bash scripts over complex programs
- Follow file naming conventions
- Let conventions drive behavior

---

