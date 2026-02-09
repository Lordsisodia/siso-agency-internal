# Blackbox4 Placement Rules

**Last Updated:** 2026-01-15
**Purpose:** Decision framework for determining where to place new things in Blackbox4.

---

## Overview

**Question:** "Where should I put X?"

**Answer:** Use this decision framework to determine the correct location based on type, purpose, and relationships.

---

## Decision Framework

### Step 1: Identify Type

**What are you placing?**

Choose from:
- Agent
- Skill
- Plan
- Library
- Script
- Template
- Document
- Test
- Config
- Memory
- Runtime
- Module
- Framework
- Tool
- Workspace
- Example

**Don't know the type?** Use the Type Identification section below.

### Step 2: Apply Type-Based Routing

Once you know the type, use the Type Routing Table to find the primary location.

### Step 3: Apply Specific Rules

Apply specific rules for the type (see Specific Rules by Type section).

### Step 4: Validate with Principles

Validate the placement against Core Principles (see below).

### Step 5: Document

Add `.purpose.md` if creating a new directory. Update related documentation.

---

## Type Identification

### Identification Questions

**Agent or Skill?**
- Agent = Standalone AI entity with its own prompt/behavior
- Skill = Reusable workflow/framework that agents use

**Library or Module?**
- Library = Reusable code in `4-scripts/lib/`
- Module = Functional unit with its own agents in `3-modules/`

**Script or Tool?**
- Script = Execution/workflow code (`4-scripts/`)
- Tool = Maintenance/utility (`6-tools/`)

**Template or Example?**
- Template = Reusable pattern (`5-templates/`)
- Example = Demonstration of usage (`*-examples/`)

**Document or Config?**
- Document = Human-readable explanation (`.docs/`)
- Config = Machine-readable settings (`.config/`)

**Plan or Workspace?**
- Plan = Project with tasks/checklist (`.plans/`)
- Workspace = Active work area (`7-workspace/`)

**Memory or Runtime?**
- Memory = Knowledge/context (`.memory/`)
- Runtime = Execution state (`.runtime/`)

---

## Type Routing Table

| Type | Primary Location | Decision Criteria |
|------|-------------------|-------------------|
| **Agent** | `1-agents/` | Is it an AI entity? |
| **Skill** | `1-agents/.skills/` | Is it a reusable workflow? |
| **Plan** | `.plans/` | Is it a project with tasks? |
| **Library** | `4-scripts/lib/` | Is it reusable code? |
| **Script** | `4-scripts/` | Is it executable code? |
| **Template** | `5-templates/` | Is it a reusable pattern? |
| **Document** | `.docs/` | Is it documentation? |
| **Test** | `8-testing/` | Is it a test? |
| **Config** | `.config/` | Is it configuration? |
| **Memory** | `.memory/` | Is it working knowledge? |
| **Runtime** | `.runtime/` | Is it execution state? |
| **Module** | `3-modules/` | Is it a functional unit? |
| **Framework** | `2-frameworks/` | Is it a framework pattern? |
| **Tool** | `6-tools/` | Is it maintenance/utility? |
| **Workspace** | `7-workspace/` | Is it active work? |
| **Example** | `1-agents/*-examples/` | Is it a demonstration? |

---

## Specific Rules by Type

### Agent Placement Rules

**Rule 1: Categorize by Type**
- Core agent → `1-agents/1-core/`
- BMAD agent → `1-agents/2-bmad/`
- Research agent → `1-agents/3-research/`
- Specialist agent → `1-agents/4-specialists/`
- Enhanced agent → `1-agents/5-enhanced/`

**Rule 2: Create Examples Directory**
- Agent: `my-agent.md`
- Examples: `my-agent-examples/`
- Location: Same directory as agent

**Rule 3: Reference in Documentation**
- Update `.docs/2-reference/agents.md`
- Or create category-specific doc

**Decision Tree:**
```
Is it an agent?
├── Yes → What type?
│   ├── Core → 1-agents/1-core/
│   ├── BMAD → 1-agents/2-bmad/
│   ├── Research → 1-agents/3-research/
│   ├── Specialist → 1-agents/4-specialists/
│   └── Enhanced → 1-agents/5-enhanced/
└── No → Check other types
```

### Skill Placement Rules

**Rule 1: Categorize by Type**
- Core skill → `.skills/1-core/`
- MCP skill → `.skills/2-mcp/`
- Workflow skill → `.skills/3-workflow/`

**Rule 2: Follow Naming Convention**
- Use kebab-case: `my-skill.md`
- No spaces, no underscores

**Rule 3: Create Examples if Complex**
- Complex skill → Create examples directory
- Simple skill → Examples in skill file

**Decision Tree:**
```
Is it a skill?
├── Yes → What type?
│   ├── Core workflow → .skills/1-core/
│   ├── MCP integration → .skills/2-mcp/
│   └── Specific workflow → .skills/3-workflow/
└── No → Check other types
```

### Plan Placement Rules

**Rule 1: Status-Based Placement**
- Active plan → `.plans/active/`
- Completed plan → `.plans/completed/`

**Rule 2: Naming Convention**
- Format: `YYYY-MM-DD_HHMM_[name]`
- Example: `2026-01-15_1430_improve-collaboration/`

**Rule 3: Required Files**
- `README.md` - Plan overview
- `checklist.md` - Task checklist
- `status.md` - Current status

**Decision Tree:**
```
Is it a plan?
├── Yes → Is it active?
│   ├── Yes → .plans/active/YYYY-MM-DD_HHMM_[name]/
│   └── No → .plans/completed/YYYY-MM-DD_HHMM_[name]/
└── No → Check other types
```

### Library Placement Rules

**Rule 1: Phase Alignment**
- Phase 1 (context) → `context-variables/`
- Phase 2 (tasks) → `hierarchical-tasks/` or `task-breakdown/`
- Phase 3 (specs) → `spec-creation/`
- Phase 4 (runtime) → `ralph-runtime/`, `circuit-breaker/`, `response-analyzer/`
- Other → `4-scripts/lib/[library-name]/`

**Rule 2: Library Structure**
```
4-scripts/lib/[library-name]/
├── __init__.py
├── [library-name].py
├── types.py (if needed)
├── util.py (if needed)
└── README.md
```

**Rule 3: Add Tests**
- Tests: `8-testing/unit/libraries/test-[library-name].py`

**Decision Tree:**
```
Is it a library?
├── Yes → Which phase?
│   ├── Phase 1 → context-variables/
│   ├── Phase 2 → hierarchical-tasks/ or task-breakdown/
│   ├── Phase 3 → spec-creation/
│   ├── Phase 4 → ralph-runtime/ (or circuit-breaker/, response-analyzer/)
│   └── Other → 4-scripts/lib/[library-name]/
└── No → Check other types
```

### Script Placement Rules

**Rule 1: Category-Based Placement**
- Agent script → `4-scripts/agents/`
- Planning script → `4-scripts/planning/`
- Integration script → `4-scripts/integration/`
- Validation script → `4-scripts/validation/`
- Testing script → `4-scripts/testing/` or `8-testing/`
- Utility script → `4-scripts/` (root)

**Rule 2: Executable Permission**
- All `.sh` files must be executable (`chmod +x`)

**Rule 3: Script Headers**
- Include shebang: `#!/bin/bash` or `#!/usr/bin/env python3`
- Include description comment

**Decision Tree:**
```
Is it a script?
├── Yes → What type?
│   ├── Agent execution → 4-scripts/agents/
│   ├── Planning → 4-scripts/planning/
│   ├── Integration → 4-scripts/integration/
│   ├── Validation → 4-scripts/validation/
│   ├── Testing → 4-scripts/testing/ or 8-testing/
│   └── Other utility → 4-scripts/ (root)
└── No → Check other types
```

### Document Placement Rules

**Rule 1: Category-Based Placement**
- Getting started → `.docs/1-getting-started/`
- Architecture → `.docs/2-architecture/`
- Component reference → `.docs/3-components/`
- Framework docs → `.docs/4-frameworks/`
- Workflow guides → `.docs/5-workflows/`
- Archives → `.docs/6-archives/`
- Phase-specific → `.docs/phase[1-4]/`

**Rule 2: Reference vs Tutorial**
- Reference = Component documentation → `.docs/3-components/`
- Tutorial = Getting started → `.docs/1-getting-started/`

**Rule 3: Documentation Style**
- Use clear headings
- Include examples
- Link to related docs

**Decision Tree:**
```
Is it documentation?
├── Yes → What type?
│   ├── Tutorial → .docs/1-getting-started/
│   ├── Architecture → .docs/2-architecture/
│   ├── Component reference → .docs/3-components/
│   ├── Framework doc → .docs/4-frameworks/
│   ├── Workflow guide → .docs/5-workflows/
│   ├── Archive → .docs/6-archives/
│   └── Phase-specific → .docs/phase[1-4]/
└── No → Check other types
```

### Test Placement Rules

**Rule 1: Test Type Placement**
- Unit test → `8-testing/unit/[category]/`
- Integration test → `8-testing/integration/`
- Phase test → `8-testing/phase[1-4]/`
- E2E test → `8-testing/e2e/`

**Rule 2: Mirror Structure**
- Unit tests mirror library structure:
  - Library: `4-scripts/lib/my-library/`
  - Test: `8-testing/unit/libraries/test-my-library.py`

**Rule 3: Test Naming**
- Format: `test-[name].py` or `[name]-test.sh`

**Decision Tree:**
```
Is it a test?
├── Yes → What type?
│   ├── Unit → 8-testing/unit/[category]/
│   ├── Integration → 8-testing/integration/
│   ├── Phase-specific → 8-testing/phase[1-4]/
│   └── E2E → 8-testing/e2e/
└── No → Check other types
```

### Template Placement Rules

**Rule 1: Template Type Placement**
- Document template → `5-templates/1-documents/`
- Plan template → `5-templates/2-plans/` or `.plans/_template/`
- Code template → `5-templates/3-code/`
- Spec template → `5-templates/specs/`

**Rule 2: Template Naming**
- Add `-template` suffix: `my-template.md`

**Rule 3: Template Variables**
- Use `{{variable}}` syntax for placeholders
- Document variables in template README

**Decision Tree:**
```
Is it a template?
├── Yes → What type?
│   ├── Document → 5-templates/1-documents/
│   ├── Plan → 5-templates/2-plans/ or .plans/_template/
│   ├── Code → 5-templates/3-code/
│   └── Spec → 5-templates/specs/
└── No → Check other types
```

### Config Placement Rules

**Rule 1: All Config in `.config/`**
- No exceptions
- Subdirectories by category if needed

**Rule 2: Config Type**
- YAML = Structured configuration: `.yaml`
- JSON = Data/configuration: `.json`

**Rule 3: Naming**
- System config: `blackbox4.yaml`
- MCP config: `mcp-servers.json`
- Memory config: `memory.yaml`

**Decision Tree:**
```
Is it configuration?
├── Yes → Always → .config/
└── No → Check other types
```

---

## Core Principles

### Principle 1: Type Consistency

**Rule:** Things of the same type go in the same place.

**Application:**
- All agents in `1-agents/`
- All libraries in `4-scripts/lib/`
- All documentation in `.docs/`

**Benefits:**
- Predictable locations
- Easy to find
- Consistent structure

### Principle 2: Co-location

**Rule:** Related things should be near each other.

**Application:**
- Agent with its examples
- Library with its tests
- Documentation with its subject

**Benefits:**
- Easy to see relationships
- Easy to maintain
- Reduced cognitive load

### Principle 3: Number Alignment

**Rule:** Use numbered prefixes to indicate layer/purpose.

**Application:**
- 1-* = Intelligence/agents
- 4-* = Execution/scripts
- 8-* = Testing/validation

**Benefits:**
- Clear system structure
- Logical ordering
- Easy to understand

### Principle 4: Hidden vs Visible

**Rule:** Hide system/internal, show user-facing.

**Application:**
- System: `.*` directories
- User-facing: numbered directories
- Config: always `.config/`
- Docs: always `.docs/`

**Benefits:**
- Clean user interface
- Clear separation
- Reduced clutter

### Principle 5: Single Source of Truth

**Rule:** Each thing has one primary location.

**Application:**
- Don't duplicate
- Use references/symlinks if needed
- Document canonical location

**Benefits:**
- No confusion
- Easy to update
- Consistent information

---

## Conflict Resolution

### Multiple Valid Locations

**Problem:** Multiple locations seem valid.

**Resolution:**

1. **Primary Purpose** - What is the MAIN purpose?
   - Choose location that matches primary purpose

2. **Primary User** - Who primarily uses it?
   - Choose location nearest to primary user

3. **Primary Usage** - Where is it primarily used?
   - Choose location where primarily used

4. **Most Specific** - Use most specific category
   - Specific beats general

### Example Conflicts

**Conflict:** Is this a tool or script?

**Resolution:**
- Maintenance/utility → Tool (`6-tools/`)
- Execution/workflow → Script (`4-scripts/`)

**Conflict:** Is this a module or library?

**Resolution:**
- Has own agents → Module (`3-modules/`)
- Reusable code only → Library (`4-scripts/lib/`)

**Conflict:** Is this template or example?

**Resolution:**
- Reusable pattern → Template (`5-templates/`)
- Demonstrates usage → Example (`*-examples/`)

---

## Validation Checklist

Before finalizing placement, verify:

- [ ] **Type identified correctly** - Using Type Identification
- [ ] **Primary location chosen** - Using Type Routing Table
- [ ] **Specific rules applied** - Using Specific Rules by Type
- [ ] **Core principles validated** - Using Core Principles
- [ ] **Conflicts resolved** - Using Conflict Resolution
- [ ] **Documentation updated** - If creating new thing
- [ ] **Purpose marker added** - If creating new directory
- [ ] **References updated** - If moving thing

---

## Examples

### Example 1: New Specialist Agent

**Question:** Where do I put a new specialist agent called "data-analyst"?

**Process:**
1. Type: Agent
2. Agent type: Specialist
3. Location: `1-agents/4-specialists/data-analyst.md`
4. Examples: `1-agents/4-specialists/data-analyst-examples/`
5. Update docs: `.docs/2-reference/agents.md`

### Example 2: New Phase 2 Library

**Question:** Where do I put a new library for task prioritization?

**Process:**
1. Type: Library
2. Phase: Phase 2 (task-related)
3. Location: `4-scripts/lib/task-prioritization/`
4. Tests: `8-testing/unit/libraries/test-task-prioritization.py`
5. Docs: Update `.docs/phase2/` or `.docs/2-reference/libraries.md`

### Example 3: New Workflow Guide

**Question:** Where do I put documentation for how to use the planning system?

**Process:**
1. Type: Document
2. Category: Workflow guide
3. Location: `.docs/5-workflows/planning-guide.md`
4. Related: Link to `4-scripts/planning/` scripts

### Example 4: New Plan

**Question:** Where do I create a plan for improving collaboration?

**Process:**
1. Type: Plan
2. Status: Active
3. Location: `.plans/active/2026-01-15_1430_improve-collaboration/`
4. Files: `README.md`, `checklist.md`, `status.md`

---

## Related Files

- **BRAIN-ARCHITECTURE.md** - Overall brain architecture
- **SEMANTIC-INDEX.md** - Type system and categories
- **intelligent-routing.md** - AI skill for routing
- **DISCOVERY-INDEX.md** - Quick reference

---

**Status:** Complete
**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Maintainer:** Blackbox4 Core Team
