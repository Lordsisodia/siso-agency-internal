# Blackbox4 Brain Architecture

**Last Updated:** 2026-01-15
**Purpose:** Structured intelligence system for AI to understand Blackbox4's organization and make intelligent routing/placement decisions.

---

## Executive Summary

**Problem:** AI needs structured intelligence about "where everything is" and "where stuff should go" in Blackbox4.

**Solution:** A multi-layered brain architecture providing:
1. **Semantic Index** - What things are and where they belong
2. **Placement Rules** - Decision framework for where to put new things
3. **Discovery Protocol** - How to find anything
4. **Routing Logic** - How to navigate the system

**Key Files:**
- `BRAIN-ARCHITECTURE.md` (this file) - Overall specification
- `SEMANTIC-INDEX.md` - What is what and where it lives
- `PLACEMENT-RULES.md` - Decision framework for placement
- `intelligent-routing.md` - AI skill for routing/placement

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                  BLACKBOX4 BRAIN ARCHITECTURE                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LAYER 1: STRUCTURAL LAYER                                   │
│  ─────────────────────                                       │
│  • Numbered Directories (1-8)                                │
│  • Hidden Directories (.*, .memory, .runtime, .plans)        │
│  • Purpose Markers (.purpose.md)                             │
│  • Semantic Symlinks                                         │
│                                                              │
│  LAYER 2: SEMANTIC LAYER                                     │
│  ─────────────────────                                       │
│  • Type System (agents, plans, docs, code, etc.)             │
│  • Category Mapping (what type goes where)                   │
│  • Discovery Index (how to find anything)                    │
│  • Semantic Relationships (what relates to what)             │
│                                                              │
│  LAYER 3: PLACEMENT LAYER                                    │
│  ────────────────────                                        │
│  • Placement Rules (decision framework)                     │
│  • Routing Logic (how to decide)                             │
│  • Conflict Resolution (what if ambiguous)                   │
│  • Migration Rules (how to move things)                      │
│                                                              │
│  LAYER 4: DISCOVERY LAYER                                    │
│  ─────────────────────                                       │
│  • Search Patterns (how to find by type/category)            │
│  • Quick Reference (common lookups)                          │
│  • Fallback Protocol (what if not found)                     │
│  • Update Protocol (how to keep brain current)               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Structural Layer

### Physical Structure

**Numbered Directories (1-8):**
- `1-agents/` - All agent definitions and skills
- `2-frameworks/` - Framework patterns and methodologies
- `3-modules/` - Functional modules (context, planning, research, kanban)
- `4-scripts/` - Executable scripts and libraries
- `5-templates/` - Templates for documents, plans, code
- `6-tools/` - Maintenance, migration, validation tools
- `7-workspace/` - Active workspace and projects
- `8-testing/` - All testing infrastructure

**Hidden Directories:**
- `.*` (dotfiles/dotdirs) - System and configuration
- `.docs/` - Complete documentation
- `.memory/` - 3-tier memory system
- `.runtime/` - Runtime state and execution data
- `.plans/` - Active and archived project plans

**Purpose Markers:**
- `.purpose.md` files in major directories
- Each explains: Purpose, Contains, Used By, Owner, Stability, Key Files, Related

**Semantic Symlinks:**
- `agents → 1-agents`
- `docs → .docs`
- `libraries → 4-scripts/lib`
- `memory → .memory`
- `plans → .plans`
- `runtime → .runtime`
- `scripts → 4-scripts`
- `tests → 8-testing`

### Structural Rules

**Rule 1: Numbered Prefix Indicates Intent**
- 1-* = Agent/Intelligence layer
- 2-* = Framework/Methodology layer
- 3-* = Module/Functionality layer
- 4-* = Execution/Scripting layer
- 5-* = Template/Pattern layer
- 6-* = Tool/Utility layer
- 7-* = Workspace/Output layer
- 8-* = Testing/Validation layer

**Rule 2: Hidden Prefix Indicates System**
- `.*` = System-level (not user-facing)
- `.docs/` = Documentation (metadata)
- `.memory/` = State/persistence
- `.runtime/` = Execution data
- `.plans/` = Project management

**Rule 3: Colocation Principle**
- Related things should be co-located
- Examples:
  - Agent and its examples: `1-agents/4-specialists/my-agent.md` + `my-agent-examples/`
  - Library and its tests: `4-scripts/lib/my-lib/` + `8-testing/unit/libraries/`
  - Documentation and subject: `.docs/2-architecture/` describes architecture

---

## Layer 2: Semantic Layer

### Type System

**Core Types:**

| Type | Definition | Primary Location | Pattern |
|------|------------|-------------------|---------|
| **Agent** | AI agent definition | `1-agents/` | `*.md` |
| **Skill** | Reusable workflow/framework | `1-agents/.skills/` | `*.md` |
| **Plan** | Project plan with tasks | `.plans/active/` | `*/` |
| **Library** | Reusable code | `4-scripts/lib/` | `*/` |
| **Script** | Executable script | `4-scripts/` | `*.sh`, `*.py` |
| **Template** | Pattern/template | `5-templates/` | `*` |
| **Document** | Documentation | `.docs/` | `*.md` |
| **Test** | Test code | `8-testing/` | `*` |
| **Config** | Configuration | `.config/` | `*.yaml`, `*.json` |
| **Memory** | Working state | `.memory/working/` | `*` |

### Semantic Categories

**Category Hierarchy:**

```
INTELLIGENCE (Agents + Skills)
├── Core Agents (1-agents/1-core/)
├── BMAD Agents (1-agents/2-bmad/)
├── Research Agents (1-agents/3-research/)
├── Specialist Agents (1-agents/4-specialists/)
├── Enhanced Agents (1-agents/5-enhanced/)
└── Skills (1-agents/.skills/)
    ├── Core Skills (.skills/1-core/)
    ├── MCP Skills (.skills/2-mcp/)
    └── Workflow Skills (.skills/3-workflow/)

KNOWLEDGE (Documentation + Memory)
├── Documentation (.docs/)
│   ├── Getting Started (.docs/1-getting-started/)
│   ├── Architecture (.docs/2-architecture/)
│   ├── Components (.docs/3-components/)
│   ├── Frameworks (.docs/4-frameworks/)
│   └── Workflows (.docs/5-workflows/)
└── Memory (.memory/)
    ├── Working (.memory/working/)
    ├── Extended (.memory/extended/)
    └── Archival (.memory/archival/)

EXECUTION (Scripts + Libraries + Tools)
├── Scripts (4-scripts/)
│   ├── Agent Scripts (agents/)
│   ├── Planning Scripts (planning/)
│   └── Testing Scripts (testing/)
├── Libraries (4-scripts/lib/)
│   ├── Phase 1 (context-variables/)
│   ├── Phase 2 (hierarchical-tasks/, task-breakdown/)
│   ├── Phase 3 (spec-creation/)
│   └── Phase 4 (ralph-runtime/, circuit-breaker/, response-analyzer/)
└── Tools (6-tools/)
    ├── Maintenance (maintenance/)
    ├── Migration (migration/)
    └── Validation (validation/)

PLANNING (Plans + Templates)
├── Active Plans (.plans/active/)
├── Completed Plans (.plans/completed/)
└── Templates (5-templates/)
    ├── Documents (1-documents/)
    ├── Plans (2-plans/)
    └── Code (3-code/)

WORKSPACE (Projects + Artifacts)
├── Workspace (7-workspace/workspace/)
├── Projects (7-workspace/projects/)
└── Artifacts (7-workspace/artifacts/)

VALIDATION (Testing + Quality)
├── Unit Tests (8-testing/unit/)
├── Integration Tests (8-testing/integration/)
├── Phase Tests (8-testing/phase*/)
└── E2E Tests (8-testing/e2e/)
```

### Semantic Relationships

**Relationship Types:**

1. **Contains** (A contains B)
   - `1-agents/` contains `1-agents/.skills/`
   - `4-scripts/lib/` contains all libraries

2. **Implements** (A implements B)
   - `context-variables/` implements Swarm Phase 1
   - `hierarchical-tasks/` implements CrewAI patterns

3. **Documents** (A documents B)
   - `.docs/phase1/` documents `context-variables/`
   - `.docs/2-reference/agents.md` documents agents

4. **Tests** (A tests B)
   - `8-testing/phase3/` tests `spec-creation/`
   - `8-testing/unit/libraries/` tests libraries

5. **Uses** (A uses B)
   - All agents use `.skills/`
   - Ralph Runtime uses all Phase 1-4 libraries
   - Plans use templates

6. **Parallel** (A is parallel to B)
   - Phase 1, 2, 3, 4 are parallel implementations
   - BMAD agents are parallel to Research agents

---

## Layer 3: Placement Layer

### Placement Decision Framework

**Decision Tree:**

```
WHAT ARE YOU PLACING?
│
├── AGENT (AI agent definition)
│   ├── Specialist agent → 1-agents/4-specialists/
│   ├── BMAD agent → 1-agents/2-bmad/
│   ├── Research agent → 1-agents/3-research/
│   └── Core agent → 1-agents/1-core/
│
├── SKILL (reusable workflow)
│   ├── Core skill → 1-agents/.skills/1-core/
│   ├── MCP skill → 1-agents/.skills/2-mcp/
│   └── Workflow skill → 1-agents/.skills/3-workflow/
│
├── PLAN (project plan)
│   ├── Active plan → .plans/active/
│   └── Completed plan → .plans/completed/
│
├── LIBRARY (reusable code)
│   ├── Phase 1 (context) → 4-scripts/lib/context-variables/
│   ├── Phase 2 (tasks) → 4-scripts/lib/hierarchical-tasks/ or task-breakdown/
│   ├── Phase 3 (specs) → 4-scripts/lib/spec-creation/
│   ├── Phase 4 (runtime) → 4-scripts/lib/ralph-runtime/
│   └── New library → 4-scripts/lib/[library-name]/
│
├── SCRIPT (executable)
│   ├── Agent script → 4-scripts/agents/
│   ├── Planning script → 4-scripts/planning/
│   ├── Testing script → 4-scripts/testing/ or 8-testing/
│   └── Utility script → 4-scripts/ or 6-tools/
│
├── DOCUMENTATION
│   ├── About agent → 1-agents/[agent-type]/[agent-name].md (front matter)
│   ├── About library → .docs/2-reference/ or .docs/phase*/
│   ├── About framework → .docs/4-frameworks/
│   ├── Getting started → .docs/1-getting-started/
│   └── System doc → .docs/2-architecture/
│
├── TEMPLATE
│   ├── Document template → 5-templates/1-documents/
│   ├── Plan template → 5-templates/2-plans/ or .plans/_template/
│   ├── Code template → 5-templates/3-code/
│   └── Spec template → 5-templates/specs/
│
├── TEST
│   ├── Unit test → 8-testing/unit/[category]/
│   ├── Integration test → 8-testing/integration/
│   ├── Phase test → 8-testing/phase*/
│   └── E2E test → 8-testing/e2e/
│
├── CONFIGURATION
│   ├── System config → .config/
│   ├── Memory config → .config/memory.yaml
│   ├── MCP config → .config/mcp-servers.json
│   └── Agent config → .config/agents.yaml
│
└── WORKSPACE/ARTIFACT
    ├── Active work → 7-workspace/workspace/
    ├── Project → 7-workspace/projects/
    └── Artifact → 7-workspace/artifacts/
```

### Placement Rules

**Rule 1: Type-Based Routing**
- Determine the type first (agent, skill, library, etc.)
- Use type's primary location
- Follow decision tree for specific placement

**Rule 2: Co-location with Related**
- Place near related items
- Agent with its examples
- Library with its tests
- Documentation with its subject

**Rule 3: Number Alignment**
- 1-* = Agents/intelligence
- 4-* = Execution/libraries
- 8-* = Testing/validation
- Align placement with numbering

**Rule 4: Hidden vs Visible**
- System/internal: `.*` directories
- User-facing: numbered directories
- Config always in `.config/`
- Documentation always in `.docs/`

**Rule 5: Phase Alignment**
- Phase 1 components: `context-variables/`, `phase1/` docs, tests
- Phase 2 components: `hierarchical-tasks/`, `task-breakdown/`, `phase2/` docs
- Phase 3 components: `spec-creation/`, `phase3/` docs
- Phase 4 components: `ralph-runtime/`, `phase4/` docs

### Conflict Resolution

**Ambiguous Type?**
1. **Primary purpose** - What is the MAIN purpose?
2. **Primary user** - Who primarily uses it?
3. **Primary location** - Where is it primarily used?
4. **Default to most specific** - Use the most specific category

**Example:** Is a script a tool or test?
- Primary purpose: Testing → 8-testing/
- Primary purpose: Utility → 6-tools/ or 4-scripts/

**Multiple Valid Locations?**
1. **Colocation principle** - Place with most related items
2. **Usage principle** - Place where primarily used
3. **Reference principle** - Place in primary location, reference elsewhere

---

## Layer 4: Discovery Layer

### Discovery Protocol

**Step 1: Check Type**
- What type of thing are you looking for?
- Use Type System table to identify primary location

**Step 2: Check Semantic Category**
- Which category does it belong to?
- Use Category Hierarchy to narrow down

**Step 3: Use Discovery Index**
- Check `.docs/DISCOVERY-INDEX.md`
- Use Quick Answers table
- Use By Category section

**Step 4: Use Search Patterns**
- Use search patterns from Discovery Index
- Use appropriate find command

**Step 5: Fallback**
- If not found, check related locations
- Check `.docs/` for documentation
- Check `.memory/` for working knowledge

### Search Patterns

**By Type:**
```bash
# Find agents
find 1-agents/ -name "*.md"

# Find libraries
find 4-scripts/lib/ -type d -maxdepth 1

# Find scripts
find 4-scripts/ -name "*.sh" -o -name "*.py"

# Find tests
find 8-testing/ -type f

# Find documentation
find .docs/ -name "*.md"
```

**By Phase:**
```bash
# Phase 1
ls 4-scripts/lib/context-variables/
ls .docs/phase1/

# Phase 2
ls 4-scripts/lib/hierarchical-tasks/
ls 4-scripts/lib/task-breakdown/
ls .docs/phase2/

# Phase 3
ls 4-scripts/lib/spec-creation/
ls .docs/phase3/

# Phase 4
ls 4-scripts/lib/ralph-runtime/
ls .docs/phase4/
```

**By Pattern:**
```bash
# Find all examples
find 1-agents/ -name "*-examples/" -type d

# Find all purpose markers
find . -name ".purpose.md" -type f

# Find all tests
find 8-testing/ -name "test-*" -o -name "*-test.sh"

# Find all templates
find 5-templates/ -type f
```

### Quick Reference

**Most Common Lookups:**

| Looking for... | Go to... | Command |
|----------------|----------|---------|
| All agents | `1-agents/` | `find 1-agents/ -name "*.md"` |
| All skills | `1-agents/.skills/` | `ls 1-agents/.skills/*/*.md` |
| Active plans | `.plans/active/` | `ls .plans/active/` |
| All libraries | `4-scripts/lib/` | `ls 4-scripts/lib/*/` |
| All scripts | `4-scripts/` | `ls 4-scripts/*.sh` |
| All docs | `.docs/` | `find .docs/ -name "*.md"` |
| All tests | `8-testing/` | `ls 8-testing/*/` |
| Config | `.config/` | `ls .config/` |

### Update Protocol

**When Adding New Things:**

1. **Place correctly** - Use Placement Rules
2. **Document** - Add to appropriate `.docs/` location
3. **Index** - Update `DISCOVERY-INDEX.md` if major
4. **Purpose marker** - Add `.purpose.md` if new directory
5. **Test** - Add tests if applicable

**When Moving Things:**

1. **Check relationships** - What references this?
2. **Update references** - Update all references
3. **Update docs** - Update documentation
4. **Update index** - Update `DISCOVERY-INDEX.md`
5. **Verify** - Ensure nothing broken

**When Restructuring:**

1. **Plan** - Use `.plans/` to plan restructure
2. **Impact analysis** - What will be affected?
3. **Migration** - Move systematically
4. **Update** - Update all references
5. **Test** - Verify everything works

---

## Integration with AI

### How AI Should Use This

**1. For Routing (Where do I put X?):**
- Use Layer 3 (Placement Layer)
- Follow Decision Tree
- Apply Placement Rules
- Resolve conflicts using Conflict Resolution

**2. For Discovery (Where do I find X?):**
- Use Layer 4 (Discovery Layer)
- Follow Discovery Protocol
- Use Search Patterns
- Fallback to related locations

**3. For Understanding (What is this system?):**
- Read Layer 1 (Structural Layer) for physical layout
- Read Layer 2 (Semantic Layer) for type system
- Use Semantic Relationships to understand connections

**4. For Maintenance (How do I keep this current?):**
- Follow Update Protocol
- Keep Purpose Markers current
- Update Discovery Index for major changes
- Document architectural decisions

### AI Skill Integration

This brain architecture is designed to be used with the **intelligent-routing.md** skill, which provides:
- Step-by-step routing decisions
- Placement recommendations
- Discovery assistance
- Conflict resolution

**Usage:**
```
"Use the intelligent-routing skill to determine where to place this new agent"
"Use the brain architecture to find all libraries related to Phase 2"
"Apply placement rules to determine where this documentation should go"
```

---

## Quality Metrics

**Success Criteria:**

✅ **AI can route correctly** - Given a description, AI places in correct location 95%+ of time
✅ **AI can discover quickly** - AI can find anything in <10 seconds using this architecture
✅ **AI can explain placement** - AI can explain WHY something belongs somewhere
✅ **AI can maintain consistency** - AI can keep system organized as it evolves
✅ **AI can detect anomalies** - AI can identify things in wrong locations

---

## Related Files

- **SEMANTIC-INDEX.md** - Detailed semantic index of all types
- **PLACEMENT-RULES.md** - Detailed placement rule framework
- **intelligent-routing.md** - AI skill for routing/placement
- **DISCOVERY-INDEX.md** - Quick reference for finding anything
- **ORGANIZATION-ANALYSIS.md** - Analysis of current organization

---

**Status:** Complete
**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Maintainer:** Blackbox4 Core Team
