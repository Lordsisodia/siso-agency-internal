# Blackbox4 Semantic Index

**Last Updated:** 2026-01-15
**Purpose:** Comprehensive semantic index of all Blackbox4 types, categories, and their locations.

---

## How to Use This Index

**For AI:**
- **Routing:** Look up type → Get primary location → Apply placement rules
- **Discovery:** Look up type → Get location pattern → Use search command
- **Understanding:** Look up type → Read description → Understand role

**For Humans:**
- **Finding:** Use Quick Reference tables
- **Understanding:** Read type descriptions
- **Contributing:** Follow location patterns when adding new things

---

## Type System Reference

### Complete Type Table

| Type | Description | Primary Location | Location Pattern | Examples |
|------|-------------|-------------------|------------------|----------|
| **Agent** | AI agent definition | `1-agents/` | `1-agents/[category]/[name].md` | `orchestrator.md`, `ralph-agent.md` |
| **Skill** | Reusable workflow/framework | `1-agents/.skills/` | `.skills/[category]/[name].md` | `deep-research.md`, `first-principles-thinking.md` |
| **Plan** | Project plan with tasks | `.plans/` | `.plans/[active|completed]/[date]_[name]/` | Active plans, completed plans |
| **Library** | Reusable code (Python) | `4-scripts/lib/` | `lib/[name]/` | `context-variables/`, `ralph-runtime/` |
| **Script** | Executable (Shell/Python) | `4-scripts/` | `[category]/[name].[sh\|py]` | `new-plan.sh`, `agent-handoff.sh` |
| **Template** | Pattern/template | `5-templates/` | `[category]/[name]` | Document templates, plan templates |
| **Document** | Documentation | `.docs/` | `[category]/[name].md` | Architecture docs, guides |
| **Test** | Test code | `8-testing/` | `[category]/[name]` | Unit tests, integration tests |
| **Config** | Configuration | `.config/` | `[name].yaml` or `.json` | `blackbox4.yaml`, `mcp-servers.json` |
| **Memory** | Working state/knowledge | `.memory/working/` | `[subcategory]/[name]` | Session data, agent state |
| **Runtime** | Execution data | `.runtime/` | `[subcategory]/[name]` | Ralph state, executor results |
| **Module** | Functional module | `3-modules/` | `[name]/` | `context/`, `planning/`, `research/` |
| **Framework** | Framework pattern | `2-frameworks/` | `[name]/` | `1-bmad/`, `2-speckit/` |
| **Tool** | Maintenance/utility | `6-tools/` | `[category]/[name]` | Migration tools, validation tools |
| **Workspace** | Active work area | `7-workspace/` | `[category]/[name]` | Active projects, artifacts |
| **Example** | Usage examples | `1-agents/` | `[category]/[name]-examples/` | `ralph-examples/`, `context-examples/` |

---

## Category Reference

### Agent Categories

| Category | Location | Description | Examples |
|----------|----------|-------------|----------|
| **Core Agents** | `1-agents/1-core/` | Foundational agent definitions | Base agent templates |
| **BMAD Agents** | `1-agents/2-bmad/` | BMAD methodology agents (9 specialized) | PM, Architect, Dev, QA, etc. |
| **Research Agents** | `1-agents/3-research/` | Research-focused agents | `deep-research.md`, `feature-research.md` |
| **Specialist Agents** | `1-agents/4-specialists/` | Specialized agents for specific tasks | `orchestrator.md`, `ralph-agent.md` |
| **Enhanced Agents** | `1-agents/5-enhanced/` | Enhanced AI agents | Oracle, Librarian, Explore |

### Skill Categories

| Category | Location | Description | Examples |
|----------|----------|-------------|----------|
| **Core Skills** | `.skills/1-core/` | General workflow skills | `deep-research.md`, `docs-routing.md`, `feedback-triage.md`, `first-principles-thinking.md` |
| **MCP Skills** | `.skills/2-mcp/` | MCP server integration skills | `1-supabase-skills.md`, `3-github-skills.md` |
| **Workflow Skills** | `.skills/3-workflow/` | Workflow-specific skills | Documentation skills, planning skills |

### Library Categories (By Phase)

| Phase | Category | Location | Description | Examples |
|-------|----------|----------|-------------|----------|
| **Phase 1** | Context Variables | `lib/context-variables/` | Multi-tenant context support | Swarm integration |
| **Phase 2** | Hierarchical Tasks | `lib/hierarchical-tasks/` | Parent-child task relationships | CrewAI patterns |
| **Phase 2** | Task Breakdown | `lib/task-breakdown/` | Automatic task breakdown | MetaGPT patterns |
| **Phase 3** | Spec Creation | `lib/spec-creation/` | Structured spec creation | Spec Kit integration |
| **Phase 4** | Ralph Runtime | `lib/ralph-runtime/` | Autonomous execution engine | Ralph runtime |
| **Phase 4** | Circuit Breaker | `lib/circuit-breaker/` | Circuit breaker pattern | Failure protection |
| **Phase 4** | Response Analyzer | `lib/response-analyzer/` | Response quality analysis | Quality control |

### Script Categories

| Category | Location | Description | Examples |
|----------|----------|-------------|----------|
| **Agent Scripts** | `4-scripts/agents/` | Agent execution and handoff | `agent-handoff.sh` |
| **Planning Scripts** | `4-scripts/planning/` | Plan creation and management | `new-plan.sh` |
| **Integration Scripts** | `4-scripts/integration/` | Cross-component integration | Phase integration scripts |
| **Validation Scripts** | `4-scripts/validation/` | Validation and verification | `validate-*` scripts |
| **Testing Scripts** | `4-scripts/testing/` | Test infrastructure | Phase test scripts |

### Documentation Categories

| Category | Location | Description | Examples |
|----------|----------|-------------|----------|
| **Getting Started** | `.docs/1-getting-started/` | New user guides | Quick starts, tutorials |
| **Architecture** | `.docs/2-architecture/` | System architecture | Design docs, architecture diagrams |
| **Components** | `.docs/3-components/` | Component documentation | Agent docs, library docs |
| **Frameworks** | `.docs/4-frameworks/` | Framework integration docs | Swarm, CrewAI, MetaGPT, Spec Kit, Ralph |
| **Workflows** | `.docs/5-workflows/` | Workflow guides | How-to guides |
| **Archives** | `.docs/6-archives/` | Historical documentation | Old docs, reference |
| **Phase Docs** | `.docs/phase*/` | Phase-specific documentation | `phase1/`, `phase2/`, `phase3/`, `phase4/` |

### Test Categories

| Category | Location | Description | Examples |
|----------|----------|-------------|----------|
| **Unit Tests** | `8-testing/unit/` | Unit tests for components | `agents/`, `libraries/` |
| **Integration Tests** | `8-testing/integration/` | Integration tests | Cross-component tests |
| **Phase Tests** | `8-testing/phase*/` | Phase-specific tests | `phase1/`, `phase2/`, `phase3/`, `phase4/` |
| **E2E Tests** | `8-testing/e2e/` | End-to-end tests | Full system tests |

### Memory Categories

| Category | Location | Description | Size Limit |
|----------|----------|-------------|------------|
| **Working Memory** | `.memory/working/` | Active session memory | 10MB |
| **Extended Memory** | `.memory/extended/` | Long-term knowledge | 500MB |
| **Archival Memory** | `.memory/archival/` | Historical records | 5GB |

### Workspace Categories

| Category | Location | Description | Examples |
|----------|----------|-------------|----------|
| **Active Workspace** | `7-workspace/workspace/` | Current work area | Active files, scratchpad |
| **Projects** | `7-workspace/projects/` | Project directories | Individual project workspaces |
| **Artifacts** | `7-workspace/artifacts/` | Generated artifacts | Build outputs, reports |
| **Benchmarks** | `7-workspace/workspace/benchmarks/` | Benchmark data | Performance data |

---

## Semantic Search Patterns

### By Type

**Find all agents:**
```bash
find 1-agents/ -name "*.md" -type f
```

**Find all skills:**
```bash
find 1-agents/.skills/ -name "*.md" -type f
```

**Find all libraries:**
```bash
find 4-scripts/lib/ -maxdepth 1 -type d
```

**Find all scripts:**
```bash
find 4-scripts/ -name "*.sh" -o -name "*.py"
```

**Find all documentation:**
```bash
find .docs/ -name "*.md" -type f
```

**Find all tests:**
```bash
find 8-testing/ -type f
```

### By Category

**Find BMAD agents:**
```bash
find 1-agents/2-bmad/ -name "*.md"
```

**Find research agents:**
```bash
find 1-agents/3-research/ -name "*.md"
```

**Find specialist agents:**
```bash
find 1-agents/4-specialists/ -name "*.md"
```

**Find MCP skills:**
```bash
find 1-agents/.skills/2-mcp/ -name "*.md"
```

**Find phase-specific libraries:**
```bash
ls 4-scripts/lib/context-variables/  # Phase 1
ls 4-scripts/lib/hierarchical-tasks/  # Phase 2
ls 4-scripts/lib/spec-creation/  # Phase 3
ls 4-scripts/lib/ralph-runtime/  # Phase 4
```

### By Pattern

**Find all examples:**
```bash
find 1-agents/ -name "*-examples/" -type d
```

**Find all purpose markers:**
```bash
find . -name ".purpose.md" -type f
```

**Find all templates:**
```bash
find 5-templates/ -type f
```

**Find all tools:**
```bash
find 6-tools/ -type f
```

**Find all configuration files:**
```bash
find .config/ -type f
```

---

## Type-to-Location Mapping

### Quick Reference Decision Tree

```
I have a...
│
├── AGENT
│   └── 1-agents/[category]/
│       ├── 1-core/ (core agents)
│       ├── 2-bmad/ (BMAD agents)
│       ├── 3-research/ (research agents)
│       ├── 4-specialists/ (specialist agents)
│       └── 5-enhanced/ (enhanced agents)
│
├── SKILL
│   └── 1-agents/.skills/[category]/
│       ├── 1-core/ (core skills)
│       ├── 2-mcp/ (MCP skills)
│       └── 3-workflow/ (workflow skills)
│
├── PLAN
│   └── .plans/[status]/
│       ├── active/ (active plans)
│       └── completed/ (completed plans)
│
├── LIBRARY (code)
│   └── 4-scripts/lib/[name]/
│
├── SCRIPT (executable)
│   └── 4-scripts/[category]/
│       ├── agents/ (agent scripts)
│       ├── planning/ (planning scripts)
│       ├── testing/ (test scripts)
│       └── [script].sh (root scripts)
│
├── DOCUMENTATION
│   └── .docs/[category]/
│       ├── 1-getting-started/ (guides)
│       ├── 2-architecture/ (architecture)
│       ├── 3-components/ (components)
│       ├── 4-frameworks/ (frameworks)
│       ├── 5-workflows/ (workflows)
│       ├── 6-archives/ (archives)
│       └── phase*/ (phase docs)
│
├── TEMPLATE
│   └── 5-templates/[category]/
│       ├── 1-documents/ (document templates)
│       ├── 2-plans/ (plan templates)
│       └── 3-code/ (code templates)
│
├── TEST
│   └── 8-testing/[category]/
│       ├── unit/ (unit tests)
│       ├── integration/ (integration tests)
│       ├── phase*/ (phase tests)
│       └── e2e/ (E2E tests)
│
├── CONFIG
│   └── .config/[filename].yaml
│
├── MEMORY
│   └── .memory/working/[category]/
│
├── RUNTIME
│   └── .runtime/[category]/
│
├── MODULE
│   └── 3-modules/[name]/
│
├── FRAMEWORK
│   └── 2-frameworks/[name]/
│
├── TOOL
│   └── 6-tools/[category]/
│
└── WORKSPACE
    └── 7-workspace/[category]/
```

---

## Special Cases

### Co-located Things

**Agent + Examples:**
- Agent: `1-agents/4-specialists/my-agent.md`
- Examples: `1-agents/4-specialists/my-agent-examples/`

**Library + Tests:**
- Library: `4-scripts/lib/my-library/`
- Tests: `8-testing/unit/libraries/test-my-library.py`

**Documentation + Subject:**
- Subject: `4-scripts/lib/my-library/`
- Documentation: `.docs/2-reference/libraries.md` or `.docs/phase[1-4]/`

### Ambiguous Types

**Is it a tool or a script?**
- Tool = Maintenance/utility → `6-tools/`
- Script = Execution/workflow → `4-scripts/`

**Is it a template or example?**
- Template = Reusable pattern → `5-templates/`
- Example = Demonstration → `1-agents/*-examples/`

**Is it a module or library?**
- Module = Functional unit with agents → `3-modules/`
- Library = Reusable code → `4-scripts/lib/`

---

## Related Files

- **BRAIN-ARCHITECTURE.md** - Overall brain architecture specification
- **PLACEMENT-RULES.md** - Detailed placement rule framework
- **intelligent-routing.md** - AI skill for routing/placement
- **DISCOVERY-INDEX.md** - Quick reference for finding anything

---

**Status:** Complete
**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Maintainer:** Blackbox4 Core Team
