# Blackbox4 Complete Structure (5 Levels Deep)

**Status**: ✅ Complete View
**Created**: 2026-01-15
**Shows**: Full structure up to 5 levels deep

---

## 📁 Root Level (Level 0-1)

```
blackbox4/
│
├── README.md                     # System overview
├── protocol.md                   # How the system works
├── context.md                    # Current project state
├── tasks.md                      # Project backlog
├── manifest.yaml                 # System manifest
├── memory-config.yaml            # Memory configuration
│
├── .config/                      # System configuration
├── .docs/                        # ALL documentation
├── .memory/                      # 3-tier memory system
├── .plans/                       # Active project plans
├── .runtime/                     # Runtime/state data
│
├── 1-agents/                     # ALL agent definitions
├── 2-frameworks/                 # Framework patterns & templates
├── 3-modules/                    # Domain modules
├── 4-scripts/                    # All executable scripts
├── 5-templates/                  # Document/file templates
├── 6-tools/                      # Helper utilities
└── 7-workspace/                  # Active workspace
```

---

## 🔧 .config/ (System Configuration)

```
.config/
├── blackbox4.yaml                # Main configuration
│   ├── version: 4.0.0
│   ├── agents: ...
│   ├── skills: ...
│   └── memory: ...
│
├── mcp-servers.json              # MCP server configs
│   ├── supabase: {...}
│   ├── shopify: {...}
│   ├── github: {...}
│   └── [8+ servers]...
│
├── agents.yaml                   # Agent registry
│   ├── core: [...]
│   ├── bmad: [...]
│   ├── research: [...]
│   └── enhanced: [...]
│
└── memory.yaml                   # Memory configuration
    ├── working: {size: 10MB}
    ├── extended: {size: 500MB}
    └── archival: {size: 5GB}
```

---

## 📚 .docs/ (Unified Documentation)

```
.docs/
├── INDEX.md                      # Start here - master index
│
├── 1-getting-started/            # New user guides
│   ├── quick-start.md
│   │   └── [5-minute overview]
│   ├── user-guide.md
│   │   ├── [How to use Blackbox4]
│   │   └── [Common workflows]
│   ├── agent-guide.md
│   │   ├── [How to use agents]
│   │   └── [Agent patterns]
│   └── framework-guide.md
│       └── [Framework integration]
│
├── 2-reference/                  # Technical reference
│   ├── architecture.md
│   │   ├── [System architecture]
│   │   ├── [Component relationships]
│   │   └── [Data flows]
│   ├── configuration.md
│   │   ├── [Config reference]
│   │   ├── [Environment variables]
│   │   └── [MCP setup]
│   ├── directory-structure.md
│   │   ├── [Complete file tree]
│   │   └── [Folder purposes]
│   └── api-reference.md
│       ├── [Script APIs]
│       └── [Module APIs]
│
├── 3-components/                 # Component documentation
│   ├── agents.md
│   │   ├── [Agent system]
│   │   ├── [Agent types]
│   │   └── [Agent patterns]
│   ├── skills.md
│   │   ├── [Skills system]
│   │   ├── [Skill types]
│   │   └── [Creating skills]
│   ├── memory.md
│   │   ├── [3-tier memory]
│   │   ├── [Memory management]
│   │   └── [Semantic search]
│   └── modules.md
│       ├── [Module system]
│       └── [Available modules]
│
├── 4-frameworks/                 # Framework documentation
│   ├── bmad.md
│   │   ├── [BMAD methodology]
│   │   ├── [4-phase process]
│   │   └── [BMAD agents]
│   ├── speckit.md
│   │   ├── [Spec Kit patterns]
│   │   └── [Slash commands]
│   ├── metagpt.md
│   │   └── [MetaGPT templates]
│   └── swarm.md
│       └── [Swarm patterns]
│
├── 5-workflows/                  # Workflow guides
│   ├── manual-mode.md
│   │   ├── [Manual workflow]
│   │   └── [When to use]
│   ├── autonomous-mode.md
│   │   ├── [Ralph-powered workflow]
│   │   └── [When to use]
│   └── bmad-phases.md
│       ├── [Phase 1: Analysis]
│       ├── [Phase 2: Planning]
│       ├── [Phase 3: Solutioning]
│       └── [Phase 4: Implementation]
│
└── 6-archives/                   # Historical documentation
    ├── analysis/
    │   ├── BLACKBOX3-ANALYSIS.md
    │   ├── BLACKBOX3-ISSUES-ANALYSIS.md
    │   └── LUMELLE-INTEGRATION-SUMMARY.md
    ├── testing/
    │   ├── SPRINT-1-VERIFICATION.md
    │   └── SPRINT-6-TEST.md
    └── roadmap/
        └── [Historical roadmaps]
```

---

## 🧠 .memory/ (3-Tier Memory System)

```
.memory/
├── working/                      # 10MB - Active session
│   ├── current-session.md
│   │   ├── [Active work]
│   │   ├── [Context]
│   │   └── [Temporary notes]
│   └── compact/
│       └── [Auto-compacted sessions]
│
├── extended/                     # 500MB - Project knowledge
│   ├── chroma-db/
│   │   ├── [Vector database]
│   │   └── [Semantic index]
│   ├── entities.json
│   │   └── [Knowledge graph]
│   └── goals.json
│       └── [Goal tracking]
│
└── archival/                     # 5GB - Historical records
    ├── sessions/
    │   └── [Session history]
    └── projects/
        └── [Project archives]
```

---

## 📋 .plans/ (Active Project Plans)

```
.plans/
├── README.md                     # Plans overview
│
├── _template/                    # Plan template
│   ├── README.md
│   │   ├── [Goal description]
│   │   ├── [Context]
│   │   ├── [Approach]
│   │   └── [Success criteria]
│   ├── checklist.md
│   │   ├── [Task breakdown]
│   │   └── [Progress tracking]
│   ├── status.md
│   │   ├── [Current state]
│   │   ├── [Blockers]
│   │   └── [Next steps]
│   └── artifacts/
│       └── [Generated outputs]
│
└── active/                       # Active projects
    └── YYYY-MM-DD_HHMM_goal-name/
        ├── README.md
        ├── checklist.md
        ├── status.md
        ├── artifacts/
        │   ├── [Code files]
        │   ├── [Documentation]
        │   └── [Research outputs]
        ├── PROMPT.md              # Generated (for Ralph)
        │   └── [Ralph prompt]
        └── @fix_plan.md           # Generated (for Ralph)
            └── [Ralph tasks]
```

---

## ⚙️ .runtime/ (Runtime/State Data)

```
.runtime/
├── .ralph/                       # Ralph runtime state
│   ├── exit-state.json
│   │   └── [Ralph exit state]
│   ├── last-response.md
│   │   └── [Last Ralph response]
│   └── logs/
│       └── [Ralph logs]
│
├── cache/                        # Runtime cache
│   └── [Cached data]
│
├── locks/                        # Process locks
│   └── [Lock files]
│
└── state/                        # Application state
    └── [State files]
```

---

## 🤖 1-agents/ (ALL Agent Definitions)

```
1-agents/
├── README.md                     # Agents overview
├── _registry.yaml                # Master agent registry
│   ├── core: [...]
│   ├── bmad: [...]
│   ├── research: [...]
│   ├── specialists: [...]
│   └── enhanced: [...]
│
├── 1-core/                       # Core agent system
│   ├── prompt.md
│   │   └── [Base agent template]
│   └── templates/
│       ├── agent-template.md
│       │   └── [Agent template]
│       └── runbook-template.md
│           └── [Runbook template]
│
├── 2-bmad/                       # BMAD methodology
│   ├── core/
│   │   ├── bmad-master.agent.yaml
│   │   │   └── [BMAD orchestrator]
│   │   └── [Core BMAD files]
│   ├── modules/
│   │   ├── analyst.agent.yaml    # Mary - Analyst
│   │   ├── pm.agent.yaml         # John - PM
│   │   ├── architect.agent.yaml  # Winston - Architect
│   │   ├── dev.agent.yaml        # Developer
│   │   ├── qa.agent.yaml         # QA Engineer
│   │   ├── sm.agent.yaml         # Scrum Master
│   │   ├── ux-designer.agent.yaml
│   │   ├── tech-writer.agent.yaml
│   │   └── [More BMAD agents...]
│   └── workflows/
│       ├── four-phase.md
│       │   ├── [4-phase overview]
│       │   └── [Phase transitions]
│       ├── analysis.md
│       │   ├── [Research workflows]
│       │   └── [Competitive analysis]
│       ├── planning.md
│       │   ├── [PRD creation]
│       │   └── [Tech specs]
│       ├── solutioning.md
│       │   ├── [Architecture]
│       │   └── [Epics/stories]
│       └── implementation.md
│           ├── [Sprint planning]
│           └── [Development]
│
├── 3-research/                   # All research agents
│   ├── deep-research/
│   │   ├── agent.md
│   │   ├── runbook.md
│   │   ├── prompt.md
│   │   ├── schemas/
│   │   │   └── output.schema.json
│   │   ├── examples/
│   │   │   └── final-report.example.md
│   │   └── prompts/
│   │       ├── context-pack.md
│   │       └── library/
│   │           └── [Research prompts]
│   ├── feature-research/
│   │   ├── agent.md
│   │   ├── prompt.md
│   │   ├── runbook.md
│   │   ├── autopilot-loop-prompt.md
│   │   └── orchestration-checklist.md
│   ├── oss-discovery/
│   │   ├── agent.md
│   │   ├── prompt.md
│   │   ├── runbook.md
│   │   ├── config.yaml
│   │   ├── schemas/
│   │   │   └── oss-candidates.schema.json
│   │   └── oss-discovery-sidecar/
│   │       └── [Sidecar scripts]
│   └── docs-feedback/
│       ├── agent.md
│       ├── prompt.md
│       └── modules/
│           ├── architecture.md
│           ├── data.md
│           └── ui.md
│
├── 4-specialists/                # Specialist agents
│   ├── orchestrator/
│   │   ├── orchestrator.agent.yaml
│   │   └── [Master orchestrator]
│   ├── architect/
│   │   └── [Architecture specialist]
│   ├── ralph-agent/
│   │   ├── protocol.md
│   │   ├── manifest.json
│   │   ├── work/
│   │   │   └── index.md
│   │   └── context/
│   │       └── [Ralph context]
│   └── [more-specialists]/
│
├── 5-enhanced/                   # Enhanced AI agents
│   ├── oracle.md
│   │   ├── [GPT-5.2 architect]
│   │   └── [Pattern detection]
│   ├── librarian.md
│   │   ├── [Claude/Gemini researcher]
│   │   └── [Documentation lookup]
│   └── explore.md
│       ├── [Grok/Gemini navigator]
│       └── [Fast codebase search]
│
└── .skills/                      # Skills system
    ├── README.md
    ├── _registry.yaml
    │
    ├── 1-core/                   # Core skills
    │   ├── deep-research.md
    │   │   └── [Research methodology]
    │   ├── docs-routing.md
    │   │   └── [Organize outputs]
    │   ├── feedback-triage.md
    │   │   └── [Process feedback]
    │   ├── github-cli.md
    │   │   └── [GitHub workflows]
    │   ├── long-run-ops.md
    │   │   └── [Multi-hour sessions]
    │   └── notifications.md
    │       ├── notifications-local.md
    │       ├── notifications-mobile.md
    │       └── notifications-telegram.md
    │
    ├── 2-mcp/                    # MCP integration skills
    │   ├── supabase.md
    │   │   └── [Database operations]
    │   ├── shopify.md
    │   │   └── [E-commerce integration]
    │   ├── github.md
    │   │   └── [Repository management]
    │   ├── serena.md
    │   │   └── [Semantic code operations]
    │   ├── playwright.md
    │   │   └── [Browser automation]
    │   ├── filesystem.md
    │   │   └── [File operations]
    │   └── sequential-thinking.md
    │       └── [Enhanced reasoning]
    │
    └── 3-workflow/                # Workflow-specific skills
        ├── ui-cycle.md
        │   ├── [UI development cycle]
        │   └── [Adaptive workflow]
        └── [more-workflows]/
            └── [Additional workflows]
```

---

## 🎨 2-frameworks/ (Framework Patterns & Templates)

```
2-frameworks/
├── README.md                     # Frameworks overview
│
├── 1-bmad/                       # BMAD framework
│   ├── 4-phase-methodology.md
│   │   ├── [Phase 1: Analysis]
│   │   ├── [Phase 2: Planning]
│   │   ├── [Phase 3: Solutioning]
│   │   └── [Phase 4: Implementation]
│   ├── workflows/
│   │   └── [BMAD workflows]
│   └── agents/
│       └── [BMAD agent references]
│
├── 2-speckit/                    # Spec Kit patterns
│   ├── slash-commands/
│   │   ├── specify.md
│   │   ├── clarify.md
│   │   ├── checklist.md
│   │   ├── analyze.md
│   │   └── implement.md
│   └── templates/
│       └── [Spec templates]
│
├── 3-metagpt/                    # MetaGPT templates
│   └── templates/
│       ├── prd-template.md
│       ├── api-design.md
│       └── competitive-analysis.md
│
└── 4-swarm/                      # Swarm patterns
    ├── patterns/
    │   ├── context-variables.md
    │   ├── validation-agent.md
    │   └── handoffs.md
    └── examples/
        └── [Usage examples]
```

---

## 🧩 3-modules/ (Domain Modules)

```
3-modules/
├── README.md                     # Modules overview
│
├── context/                      # Context management
│   └── README.md
│       └── [Context module docs]
│
├── domain/                       # Domain knowledge
│   └── README.md
│       └── [Domain module docs]
│
├── first-principles/             # First-principles reasoning
│   └── README.md
│       └── [FP module docs]
│
├── implementation/              # Implementation patterns
│   └── README.md
│       └── [Implementation docs]
│
├── kanban/                       # Task board management
│   └── README.md
│       └── [Kanban module docs]
│
├── planning/                     # Planning patterns
│   └── README.md
│       └── [Planning module docs]
│
└── research/                     # Research patterns
    └── README.md
        └── [Research module docs]
```

---

## 📜 4-scripts/ (All Executable Scripts)

```
4-scripts/
├── lib.sh                        # Shared utilities
│   ├── [Common functions]
│   └── [Helper routines]
│
├── check-blackbox.sh             # Validate system (236 lines)
├── compact-context.sh           # Auto-compress (243 lines)
├── new-plan.sh                  # Create plans (78 lines)
├── new-run.sh                    # Create runs (112 lines)
├── new-step.sh                  # Create steps (159 lines)
├── action-plan.sh                # Generate actions (245 lines)
├── start-feature-research.sh    # Multi-agent research (647 lines)
├── start-agent-cycle.sh          # Agent execution (275 lines)
├── start-oss-discovery-cycle.sh  # OSS discovery (1,798 lines)
├── start-ui-cycle.sh             # UI development cycle
├── autonomous-loop.sh            # Ralph autonomous wrapper
├── agent-handoff.sh              # Agent handoff logic
├── auto-compact.sh              # Auto-compaction
├── build-semantic-index.sh      # Build search index
├── check-ui-constraints.sh       # Validate UI constraints
├── check-vendor-leaks.sh         # Check vendor independence
├── compact-ui-context.sh         # Compact UI context
├── fix-perms.sh                  # Fix permissions
├── install-hooks.sh              # Install git hooks
├── manage-memory-tiers.sh        # Manage memory
├── monitor-ui-deploy.sh          # Monitor UI deployment
├── new-agent.sh                  # Create new agent
├── new-tranche.sh                # Create tranche
├── notify.sh                     # Send notifications
├── promote.sh                    # Promote artifacts
├── review-compactions.sh         # Review compactions
├── start-10h-monitor.sh          # Long-run monitoring
├── start-testing.sh              # Run tests
│
└── python/                       # Python scripts
    ├── validate-docs.py
    │   └── [Documentation validator]
    └── plan-status.py
        └── [Plan status tracker]
```

---

## 📄 5-templates/ (Document/File Templates)

```
5-templates/
├── README.md                     # Templates overview
│
├── 1-documents/                  # Document templates
│   ├── prd.md
│   │   └── [Product requirements]
│   ├── api-design.md
│   │   └── [API specification]
│   ├── competitive-analysis.md
│   │   └── [Competitor analysis]
│   ├── constitution.md
│   │   └── [Project constitution]
│   ├── requirements.md
│   │   └── [Requirements spec]
│   └── user-stories.md
│       └── [User story template]
│
├── 2-plans/                      # Plan templates
│   └── plan-template.md
│       └── [Plan structure]
│
└── 3-code/                       # Code templates (if needed)
    └── [Code templates]
```

---

## 🔧 6-tools/ (Helper Utilities)

```
6-tools/
├── README.md                     # Tools overview
│
├── validation/                   # Validation tools
│   └── [Validation scripts]
│
├── migration/                    # Migration scripts
│   └── [Migration utilities]
│
└── maintenance/                  # Maintenance utilities
    └── [Maintenance scripts]
```

---

## 💼 7-workspace/ (Active Workspace)

```
7-workspace/
├── README.md                     # Workspace overview
│
├── artifacts/                    # Generated artifacts
│   └── [Build artifacts, outputs]
│
├── benchmarks/                   # Benchmark results
│   └── [Performance data]
│
├── projects/                     # Active projects
│   └── [Project workspaces]
│
└── runs/                         # Run outputs
    └── [Execution runs]
```

---

## 📊 Structure Statistics

| Metric | Count | Notes |
|--------|-------|-------|
| **Root folders** | 12 | 5 dot-folders + 7 numbered |
| **Max items per level** | 7 | Never overwhelming |
| **Agent categories** | 6 | Core, BMAD, Research, Specialists, Enhanced, Skills |
| **Skill categories** | 3 | Core, MCP, Workflow |
| **Documentation sections** | 6 | Numbered 1-6 |
| **Frameworks** | 4 | BMAD, SpecKit, MetaGPT, Swarm |
| **Empty folders** | 0 | All folders have purpose |

---

## ✅ Completeness Check

### All Blackbox3 Content Accounted For:

✅ **Root files**: README, protocol, context, tasks, manifest, memory-config
✅ **Dot-folders**: .config, .docs, .memory, .plans (moved), .runtime (new)
✅ **Agents**: All 17+ categories consolidated into 6 logical groups
✅ **Skills**: 19 files organized into 3 categories
✅ **Scripts**: All 5,810+ lines of bash scripts
✅ **Modules**: All 7 domain modules
✅ **Core**: Templates, blueprints, integrations, prompts, protocols, runtime
✅ **Shared**: Schemas, templates, logs
✅ **Workspace**: Artifacts, benchmarks, projects, runs
✅ **Research**: Gap analysis (moved to .docs/6-archives/)
✅ **Test**: Test files (moved to 6-tools/validation/)
✅ **Tools**: Experiments (kept in 6-tools/)

### Missing Components:

❌ **None found** - All Blackbox3 content has a place in Blackbox4

### New Components Added:

✅ **.plans/** - Plans elevated to top-level
✅ **.runtime/** - Runtime data separated from config
✅ **2-frameworks/** - Centralized framework patterns
✅ **Numbered folders** - 1-7 for clear ordering
✅ **Hierarchical organization** - Scalable structure

---

## 🎯 Navigation Examples

### Find an agent:
```
1-agents/
├── → 2-bmad/ (BMAD agents)
├── → 3-research/ (Research agents)
├── → 4-specialists/ (Specialist agents)
└── → 5-enhanced/ (Enhanced AI agents)
```

### Find documentation:
```
.docs/
├── → 1-getting-started/ (New users)
├── → 2-reference/ (Technical info)
├── → 3-components/ (Component docs)
├── → 4-frameworks/ (Framework info)
├── → 5-workflows/ (Workflow guides)
└── → 6-archives/ (Historical docs)
```

### Find skills:
```
1-agents/.skills/
├── → 1-core/ (Core skills)
├── → 2-mcp/ (MCP skills)
└── → 3-workflow/ (Workflow skills)
```

---

## 🚀 Next Steps

1. ✅ **Review this structure** - Does everything make sense?
2. ✅ **Create migration script** - Automate the moves
3. ✅ **Execute migration** - Build new structure
4. ✅ **Validate** - Ensure all content moved correctly
5. ✅ **Test navigation** - Verify intuitive structure

---

**Status**: ✅ Complete - All content accounted for
**Missing**: Nothing - All Blackbox3 components mapped to Blackbox4
