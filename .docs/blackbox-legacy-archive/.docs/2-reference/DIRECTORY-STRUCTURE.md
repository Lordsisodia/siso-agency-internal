# Blackbox Factory Structure

**Date:** 2026-01-13
**Status:** ✅ **ORGANIZED**

---

## Directory Structure

```
Black Box Factory/
├── README.md                          # Factory overview and navigation
│
└── current/                           # Active development workspace
    └── Blackbox3/                     # Main Blackbox3 system
        ├── README.md                  # Blackbox3 main documentation
        ├── QUICK-START.md             # Getting started guide
        │
        ├── agents/.plans/                    # Project plans and runs
        │   ├── _template/             # Plan templates
        │   └── [project-plans]        # Active projects
        │
        ├── agents/                    # AI agent configurations
        │   ├── _template/             # Agent template
        │   ├── _core/                 # Core agent prompts
        │   ├── bmad/                  # BMAD method agents
        │   ├── custom/                # Custom agents
        │   ├── deep-research/         # Deep research agent
        │   └── feature-research/      # Feature research agent
        │
        ├── scripts/                   # Utility scripts
        │   ├── new-plan.sh            # Create new plan
        │   ├── new-run.sh             # Create new run
        │   ├── new-step.sh            # Create checkpoint
        │   ├── new-tranche.sh         # Create tranche report
        │   ├── promote.sh             # Promote artifacts
        │   ├── validate-all.sh        # Validate system
        │   ├── validate-loop.sh       # Continuous monitoring
        │   └── lib.sh                 # Shared functions
        │
        ├── agents/.skills/                   # MCP Skills documentation
        │   ├── README.md
        │   └── mcp-skills/            # MCP server skills
        │
        ├── .docs/testing/                   # Testing documentation
        │   ├── BLACKBOX3-TESTING-STRATEGY.md
        │   ├── TESTING-QUICKSTART.md
        │   ├── TESTING-SUMMARY.md
        │   ├── TEST-RESULTS-REPORT.md
        │   └── FEEDBACK-TEMPLATE.md
        │
        ├── docs/                      # Additional documentation
        │   └── 05-planning/
        │       └── research/          # Research notes
        │
        └── [additional-docs].md       # Various guides and specs
            ├── IMPLEMENTATION-COMPLETE.md
            ├── MEMORY-ARCHITECTURE.md
            ├── PHASE-1-COMPLETE.md
            ├── TYPELESS-AI-GUIDE.md
            └── ...
```

---

## Key Directories Explained

### Blackbox3/ - Main System
The core Blackbox3 AI-powered development framework.

**Purpose:** Provides plan-run-checkpoint workflow with AI agent coordination and auto-compacting memory.

**Key Features:**
- ✅ Plan management with templates
- ✅ Checkpoint system (numbered steps)
- ✅ Auto-compaction (at 10+ steps)
- ✅ Agent coordination (12+ agents)
- ✅ Artifact promotion and tranches
- ✅ Continuous validation

---

### agents/.plans/ - Project Management
Where all projects (plans) and executions (runs) live.

**Structure:**
```
agents/.plans/
├── _template/                 # Template for new plans
│   ├── README.md
│   ├── context/
│   │   ├── steps/            # Checkpoint files
│   │   ├── compactions/      # Compacted history
│   │   └── reviews/          # Review materials
│   ├── artifacts/            # Generated artifacts
│   └── [template files]
│
└── 2026-01-12_1400_my-project/  # Example project
    ├── context/
    ├── artifacts/
    └── [project files]
```

**When to use:**
- Create a plan: For thinking/planning phase
- Create a run: For execution/implementation phase
- Add checkpoints: Track progress (steps 0001, 0002...)

---

### agents/ - AI Agent Configurations
Contains all agent prompts and configurations.

**Agent Types:**

1. **BMAD Method Agents** (`agents/bmad/`)
   - Project Manager, Architect, Developer, QA, etc.
   - For full software development lifecycle

2. **Research Agents** (`agents/deep-research/`, `agents/feature-research/`)
   - Deep research: Comprehensive investigation
   - Feature research: Competitive analysis

3. **Custom Agents** (`agents/custom/`)
   - Orchestrator and custom workflows

**When to use:**
- Select agent when creating a run
- Different agents for different phases
- Can chain multiple agents

---

### scripts/ - Utility Scripts
Shell scripts for common Blackbox3 operations.

**Core Scripts:**
- `new-plan.sh` - Create new plan
- `new-run.sh` - Create new run with agent
- `new-step.sh` - Add checkpoint to current project
- `new-tranche.sh` - Create synthesis report
- `promote.sh` - Finalize completed work
- `validate-all.sh` - System validation
- `validate-loop.sh` - Continuous monitoring

**Usage:** All scripts run from Blackbox3 root with clear help text

---

### agents/.skills/ - MCP Skills
Model Context Protocol server skills documentation.

**Contains:**
- Supabase skills
- Shopify skills
- GitHub skills
- Chrome DevTools skills
- Playwright skills
- And more...

**Purpose:** Extend Blackbox3 capabilities with MCP servers

---

### .docs/testing/ - Testing Documentation
All testing-related documentation and reports.

**Contains:**
- Testing strategy
- Quick start guide
- Test results
- Feedback templates

**When to use:**
- Validating Blackbox3 functionality
- Running test suites
- Collecting feedback

---

## Removed Directories

### .blackbox/ ✅ REMOVED
**Reason:** Migration artifact from Blackbox1/2
**Contained:** Only temporary validation files
**Action:** Deleted (replaced by `Blackbox3/.local/`)

---

### test-environment/ ⚠️ INVESTIGATE
**Location:** `current/test-environment/`
**Status:** Contains complete testing sandbox

**What's inside:**
- Full Blackbox3 test sandbox
- Agent configurations
- Template systems
- Research snippets
- Test projects

**Question:** Should this be consolidated into Blackbox3?

**Recommendation:**
- If active: Move to `Blackbox3/.docs/testing/sandbox/`
- If legacy: Archive or remove

---

## File Organization Principles

### 1. Keep Root Clean
✅ **DONE:** Only README.md at factory root
✅ **DONE:** All Blackbox3 docs in Blackbox3/

### 2. Logical Grouping
✅ **DONE:** Testing docs in `.docs/testing/`
✅ **DONE:** Scripts in `scripts/`
✅ **DONE:** Agents in `agents/`

### 3. No Migration Artifacts
✅ **DONE:** Removed `.blackbox/` directory
✅ **DONE:** All paths updated to Blackbox3 structure

### 4. Clear Naming
✅ **DONE:** Descriptive filenames
✅ **DONE:** Uppercase for major docs
✅ **DONE:** Kebab-case for utilities

---

## Navigation

### Start Here
1. **Factory Overview:** `Black Box Factory/README.md`
2. **Blackbox3 Guide:** `Blackbox3/README.md`
3. **Quick Start:** `Blackbox3/QUICK-START.md`

### For Development
1. **Create Plan:** `./scripts/new-plan.sh "project-name"`
2. **Create Run:** `./scripts/new-run.sh <plan> <agent>`
3. **Add Step:** `./scripts/new-step.sh "task" "description"`

### For Testing
1. **Test Strategy:** `Blackbox3/.docs/testing/BLACKBOX3-TESTING-STRATEGY.md`
2. **Quick Test:** `Blackbox3/.docs/testing/TESTING-QUICKSTART.md`
3. **Test Results:** `Blackbox3/.docs/testing/TEST-RESULTS-REPORT.md`

### For Reference
1. **Memory System:** `Blackbox3/MEMORY-ARCHITECTURE.md`
2. **Typeless AI:** `Blackbox3/TYPELESS-AI-GUIDE.md`
3. **MCP Skills:** `Blackbox3/agents/.skills/README.md`

---

## Maintenance

### Adding Documentation
- Project docs → `Blackbox3/`
- Testing docs → `Blackbox3/.docs/testing/`
- Agent docs → `Blackbox3/agents/<agent-type>/`

### Creating Templates
- Plan templates → `agents/.plans/_template/`
- Agent templates → `agents/_template/`

### Running Scripts
All scripts run from `Blackbox3/` root:
```bash
cd Blackbox3
./scripts/<script>.sh [options]
```

---

## Next Steps

### Immediate (Completed ✅)
- ✅ Move Blackbox3 docs to Blackbox3/
- ✅ Organize testing documentation
- ✅ Remove .blackbox migration artifact

### Short-term (Pending)
- ⏳ Investigate test-environment purpose
- ⏳ Consolidate or archive test-environment
- ⏳ Create INDEX.md for navigation

### Long-term (Future)
- ⏳ Create comprehensive search index
- ⏳ Add inline documentation examples
- ⏳ Build interactive tutorial

---

**Last Updated:** 2026-01-13
**Maintained By:** Blackbox3 System
