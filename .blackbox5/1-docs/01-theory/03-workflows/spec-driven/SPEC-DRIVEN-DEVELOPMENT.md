# Spec-Driven Development + First Principles Integration

## Overview

Integrating **CCPM's Spec-Driven Development** with **First Principles Thinking** to create a rigorous development discipline for BlackBox5 skills and agents.

## The Problem: "Vibe Coding"

**Current State:**
- Skills created without clear requirements
- Agents make assumptions about what to build
- No traceability from idea to implementation
- "Just build it" approach leads to rework

**Desired State:**
- Every skill has explicit requirements
- First principles analysis before building
- Full traceability from PRD to code
- Zero ambiguity in specifications

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  SPEC-DRIVEN DEVELOPMENT PIPELINE            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. BRAINSTORM (First Principles)                            │
│     │                                                         │
│     ├── What problem are we solving?                         │
│     ├── What are the fundamental truths?                     │
│     ├── What are our assumptions?                            │
│     └── What are the constraints?                            │
│     ↓                                                         │
│  2. DOCUMENT (Spec)                                          │
│     │                                                         │
│     ├── PRD (Product Requirements)                           │
│     ├── Epic (Technical Specification)                       │
│     └── Tasks (Acceptance Criteria)                          │
│     ↓                                                         │
│  3. PLAN (Architecture)                                      │
│     │                                                         │
│     ├── First principles design                              │
│     ├── Technical decisions (explicit)                       │
│     └── Implementation strategy                              │
│     ↓                                                         │
│  4. EXECUTE (Build)                                          │
│     │                                                         │
│     ├── Skill/Agent implementation                           │
│     ├── Following spec exactly                               │
│     └── No deviations without approval                       │
│     ↓                                                         │
│  5. TRACK (Verify)                                           │
│     │                                                         │
│     ├── Acceptance criteria met?                             │
│     ├── First principles validated?                          │
│     └── Ready for production                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
.blackbox5/
├── specs/                           # NEW: Specifications directory
│   ├── prds/                        # Product Requirements Documents
│   │   ├── 001-test-driven-development.md
│   │   ├── 002-systematic-debugging.md
│   │   └── TEMPLATE.md
│   ├── epics/                       # Technical Specifications
│   │   ├── 001-test-driven-development-epic.md
│   │   ├── 002-systematic-debugging-epic.md
│   │   └── TEMPLATE.md
│   └── tasks/                       # Individual tasks with acceptance criteria
│       ├── 001-tdd-red-phase.md
│       ├── 002-tdd-green-phase.md
│       ├── 003-tdd-refactor-phase.md
│       └── TEMPLATE.md
│
├── engine/
│   ├── agents/
│   │   ├── .skills/                 # Skills (existing)
│   │   └── [agents]/                # Agents (existing)
│   └── specs/                       # NEW: Engine-level specs
│       ├── skill-development-lifecycle.md
│       ├── agent-development-lifecycle.md
│       └── quality-gates.md
│
└── github/                          # NEW: GitHub integration
    ├── issues/                      # Issue templates
    │   ├── prd-template.yml
    │   ├── epic-template.yml
    │   └── task-template.yml
    └── workflows/                   # GitHub Actions
        ├── create-prd.yml
        ├── parse-to-epic.yml
        └── sync-to-github.yml
```

## Phase 1: First Principles Brainstorm

### Template: `specs/prds/TEMPLATE.md`

```markdown
# PRD: [Skill/Agent Name]

## First Principles Analysis

<context>
[Brief description of what we're building]
</context>

## The Problem

<problem>
What problem are we trying to solve?
- Why does this problem exist?
- Who has this problem?
- What happens if we don't solve it?
</problem>

## First Principles Decomposition

<fundamental_truths>
1. What do we know to be TRUE?
   - Truth 1
   - Truth 2
   - Truth 3

2. What are our ASSUMPTIONS?
   - Assumption 1 (verified? ✅/❌)
   - Assumption 2 (verified? ✅/❌)
   - Assumption 3 (verified? ✅/❌)

3. What are CONSTRAINTS?
   - Real constraints (laws of physics, time, resources)
   - Imagined constraints (can be challenged)
</fundamental_truths>

## Solution from First Principles

<solution>
Build from ground up (not by analogy):
1. Based on fundamental truths, what's the minimal solution?
2. What are the core requirements (not "nice to haves")?
3. What can we learn from existing solutions (without copying)?
</solution>

## Requirements

<requirements>
### Functional Requirements
- FR-1: [Requirement 1]
- FR-2: [Requirement 2]
- FR-3: [Requirement 3]

### Non-Functional Requirements
- NFR-1: Performance: [Specific metric]
- NFR-2: Security: [Specific requirement]
- NFR-3: Maintainability: [Specific requirement]

### Acceptance Criteria
- AC-1: [Specific, measurable criteria]
- AC-2: [Specific, measurable criteria]
- AC-3: [Specific, measurable criteria]
</requirements>

## Success Metrics

<metrics>
How will we know this is successful?
- Metric 1: [Specific, measurable]
- Metric 2: [Specific, measurable]
- Metric 3: [Specific, measurable]
</metrics>

## Related Skills/Agents

<dependencies>
- Depends on: [skill/agent names]
- Conflicts with: [skill/agent names]
- Enhances: [skill/agent names]
</dependencies>
```

## Phase 2: Technical Epic

### Template: `specs/epics/TEMPLATE.md`

```markdown
# Epic: [Skill/Agent Name] - Technical Specification

## Overview

<overview>
This epic specifies the technical implementation of [Skill/Agent].
Traces to PRD: [PRD-number]
</overview>

## First Principles Design

<design_from_fundamentals>
### Core Architecture
- What are the essential components?
- What can we eliminate (not needed)?
- What's the minimal viable implementation?

### Key Technical Decisions
1. Decision 1
   - Options considered: [A, B, C]
   - Chosen: [B]
   - Rationale (from first principles): [Why B is fundamentally better]

2. Decision 2
   - Options considered: [X, Y, Z]
   - Chosen: [Y]
   - Rationale (from first principles): [Why Y is fundamentally better]
</design_from_fundamentals>

## Implementation Strategy

<implementation>
### Components
1. Component 1
   - File location: [path]
   - Dependencies: [list]
   - Acceptance criteria: [specific criteria]

2. Component 2
   - File location: [path]
   - Dependencies: [list]
   - Acceptance criteria: [specific criteria]

### Data Flow
[Diagram or description of how components interact]

### Error Handling
- Error scenario 1: [handling approach]
- Error scenario 2: [handling approach]
</implementation>

## Testing Strategy

<testing>
### Unit Tests
- Test 1: [what it tests]
- Test 2: [what it tests]

### Integration Tests
- Test 1: [what it tests]
- Test 2: [what it tests]

### First Principles Validation
- Verify core assumptions still hold
- Test fundamental truths in production
- Measure against success metrics
</testing>

## Tasks Breakdown

<tasks>
Link to individual task specs:
- Task 1: [task-file]
- Task 2: [task-file]
- Task 3: [task-file]
</tasks>

## Dependencies

<dependencies>
### Skills Required
- [skill-name-1]
- [skill-name-2]

### Agents Required
- [agent-name-1]
- [agent-name-2]

### External Dependencies
- [dependency-1]
- [dependency-2]
</dependencies>

## Rollout Plan

<rollout>
1. Phase 1: [what, when]
2. Phase 2: [what, when]
3. Phase 3: [what, when]
</rollout>
```

## Phase 3: Task Specification

### Template: `specs/tasks/TEMPLATE.md`

```markdown
# Task: [Specific Task Name]

## Context

<tracking>
**Epic**: [Epic-name]
**PRD**: [PRD-number]
**Priority**: [P0/P1/P2/P3]
**Estimated Complexity**: [Low/Medium/High]
**Assignee**: [Agent/Human]
</tracking>

## First Principles Check

<validation>
Before starting:
1. ✅ Does this task trace to a PRD requirement?
2. ✅ Do we understand the fundamental problem?
3. ✅ Are our assumptions verified?
4. ✅ Is the constraint real or imagined?
</validation>

## Task Specification

<spec>
### What to Build
- [Specific deliverable]
- [Specific deliverable]
- [Specific deliverable]

### What NOT to Build
- [Out of scope item 1]
- [Out of scope item 2]

### Acceptance Criteria
- [ ] AC-1: [Specific, testable criteria]
- [ ] AC-2: [Specific, testable criteria]
- [ ] AC-3: [Specific, testable criteria]

### Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Documentation updated
- [ ] First principles validated
- [ ] Peer review completed
</spec>

## Implementation Notes

<implementation>
### File Changes
- Create: [file-path]
- Modify: [file-path]
- Delete: [file-path]

### Code Pattern
```python
# Example of expected pattern
```

### Integration Points
- Calls: [skill/agent/function]
- Called by: [skill/agent/function]
- Side effects: [what happens]
</implementation>

## Verification

<verification>
### How to Test
1. Step 1: [test step]
2. Step 2: [test step]
3. Step 3: [test step]

### Expected Result
[What should happen when task is complete]

### Rollback Plan
If this fails:
- [Rollback step 1]
- [Rollback step 2]
</verification>
```

## GitHub Integration

### Issue Templates

**`.github/issues/PRD_TEMPLATE.yml`**

```yaml
---
name: Product Requirements Document (PRD)
about: Create a new PRD using first principles analysis
title: '[PRD] '
labels: prd, first-principles
assignees: ''
---

## First Principles Analysis

<!-- Answer these questions BEFORE writing requirements -->

### The Problem
- What problem are we solving?
- Why does it exist?
- Who has it?

### Fundamental Truths
1. What do we know to be TRUE?
2. What are our assumptions (verified/unverified)?
3. What are real vs imagined constraints?

### Solution from First Principles
- Build from ground up (not by analogy)
- What's the minimal viable solution?

## Requirements
<!-- List functional and non-functional requirements -->

## Success Metrics
<!-- How will we measure success? -->
```

**`.github/issues/EPIC_TEMPLATE.yml`**

```yaml
---
name: Technical Epic
about: Create technical specification from PRD
title: '[EPIC] '
labels: epic, technical-spec
assignees: ''
---

## Overview
Traces to PRD: #

## First Principles Design
### Core Architecture
### Key Technical Decisions
### Implementation Strategy

## Components
<!-- List components with file locations -->

## Testing Strategy
<!-- How will we validate this works? -->

## Tasks
<!-- Break down into individual tasks -->
```

**`.github/issues/TASK_TEMPLATE.yml`**

```yaml
---
name: Implementation Task
about: Specific task from epic
title: '[TASK] '
labels: task, implementation
assignees: ''
---

## Context
**Epic**: #
**PRD**: #

## First Principles Check
- [ ] Traces to PRD requirement
- [ ] Fundamental problem understood
- [ ] Assumptions verified
- [ ] Constraints validated

## Acceptance Criteria
- [ ] AC-1:
- [ ] AC-2:
- [ ] AC-3:

## Definition of Done
- [ ] Implemented
- [ ] Tested
- [ ] Documented
- [ ] Reviewed
```

## Workflow: PRD → Epic → Tasks → Code

### Step 1: Create PRD (First Principles Brainstorm)

```bash
# Using BlackBox5 agent
bb5 prd:new skill-name

# Agent guides first principles analysis:
# - What problem are we solving?
# - What are fundamental truths?
# - What are assumptions vs constraints?
# - What's the minimal solution?
```

**Output**: `specs/prds/001-skill-name.md`

### Step 2: Parse to Epic (Technical Specification)

```bash
bb5 prd:parse skill-name

# Agent transforms PRD to technical epic:
# - Architecture from first principles
# - Technical decisions (with rationale)
# - Component breakdown
# - Testing strategy
```

**Output**: `specs/epics/001-skill-name-epic.md`

### Step 3: Decompose to Tasks

```bash
bb5 epic:decompose skill-name

# Agent breaks epic into tasks:
# - Individual components
# - Acceptance criteria
# - File locations
# - Dependencies
```

**Output**: `specs/tasks/001-task-1.md`, `002-task-2.md`, etc.

### Step 4: Sync to GitHub

```bash
bb5 github:sync skill-name

# Creates GitHub issues:
# - 1 Epic issue
# - N Task issues
# - All linked together
```

**Output**: GitHub Issues with proper templates

### Step 5: Execute (Agent or Human)

```bash
bb5 task:start 1234

# Agent:
# - Reads task spec
# - Validates first principles
# - Implements exactly to spec
# - Creates PR
```

**Output**: Pull Request with traceability

## Example: Creating the TDD Skill

### Step 1: PRD with First Principles

**File**: `specs/prds/001-test-driven-development.md`

```markdown
# PRD: Test-Driven Development Skill

## First Principles Analysis

### The Problem
Developers write code without tests, leading to:
- Bugs in production
- Fear of refactoring
- Unknown breaking changes

### Fundamental Truths
1. **Tests verify code behavior** (observable, measurable)
2. **Refactoring breaks code** (entropy exists)
3. **Confidence comes from proof** (tests are evidence)

### Assumptions
- ✅ Tests can catch bugs (verified in practice)
- ✅ Writing tests first improves design (verified)
- ❌ TDD slows development (FALSE - proven to speed up)

### Constraints
- Real: Time to write tests
- Imagined: "No time for tests" (false economy)

### Solution from First Principles
**Minimal viable TDD**:
1. Write test FIRST (prove it fails)
2. Make test PASS (minimal code)
3. Refactor (improve with safety net)

## Requirements
- FR-1: Teach RED-GREEN-REFACTOR cycle
- FR-2: Provide clear workflow
- FR-3: Include examples

## Success Metrics
- Users write tests before code
- Reduced bug rate
- Increased refactoring confidence
```

### Step 2: Epic (Technical Spec)

**File**: `specs/epics/001-test-driven-development-epic.md`

```markdown
# Epic: TDD Skill Implementation

## Overview
Implements Test-Driven Development methodology as a BlackBox5 skill.

## First Principles Design

### Core Architecture
**Essential Components**:
1. `SKILL.md` - Main skill document
2. `<workflow>` tag - RED-GREEN-REFACTOR phases
3. `<examples>` tag - Concrete demonstrations

**What to Eliminate**:
- Complex tooling (not needed)
- Framework-specific patterns (keep generic)

### Key Technical Decisions
1. **Format**: XML tags (Anthropic best practice)
   - Why: Better parsing, clarity
   - Alternatives considered: Markdown only, JSON

2. **Structure**: 3 phases
   - Why: Matches TDD cycle
   - Alternatives: 2 phases (too simple), 5+ phases (too complex)

## Components
1. `development-workflow/coding-assistance/test-driven-development/SKILL.md`
   - Content: XML-structured TDD methodology
   - Dependencies: None (foundational skill)

## Testing Strategy
- Verify XML parsing works
- Test skill loads correctly
- Validate workflow phases

## Tasks
- Task 1: Create directory structure
- Task 2: Write SKILL.md with XML tags
- Task 3: Add examples and best practices
```

### Step 3: Tasks

**File**: `specs/tasks/001-tdd-create-structure.md`

```markdown
# Task: Create TDD Skill Directory Structure

## Context
**Epic**: 001-test-driven-development-epic
**Priority**: P0

## First Principles Check
- [x] Traces to PRD FR-2 (Provide clear workflow)
- [x] Minimal viable structure (no unnecessary folders)

## Acceptance Criteria
- [ ] Directory: `.skills-new/development-workflow/coding-assistance/test-driven-development/`
- [ ] File: `SKILL.md` exists
- [ ] Directory: `scripts/` exists (may be empty)

## Implementation
```bash
mkdir -p .blackbox5/engine/agents/.skills-new/development-workflow/coding-assistance/test-driven-development/scripts
touch .blackbox5/engine/agents/.skills-new/development-workflow/coding-assistance/test-driven-development/SKILL.md
```

## Definition of Done
- [ ] Directories created
- [ ] Ready for content
```

## Implementation Plan

### Week 1: Setup

1. **Create directory structure**
   ```bash
   mkdir -p .blackbox5/specs/{prds,epics,tasks}
   mkdir -p .github/{issues,workflows}
   ```

2. **Create templates**
   - `specs/prds/TEMPLATE.md`
   - `specs/epics/TEMPLATE.md`
   - `specs/tasks/TEMPLATE.md`
   - `.github/issues/PRD_TEMPLATE.yml`
   - `.github/issues/EPIC_TEMPLATE.yml`
   - `.github/issues/TASK_TEMPLATE.yml`

3. **Create skill for spec-driven development**
   - `.blackbox5/engine/agents/.skills-new/knowledge-documentation/planning-architecture/spec-driven-development/SKILL.md`

### Week 2: Integration

1. **Add commands to agents**
   - `bb5 prd:new` - Create PRD with first principles
   - `bb5 prd:parse` - Transform to epic
   - `bb5 epic:decompose` - Break into tasks
   - `bb5 github:sync` - Create GitHub issues

2. **Update existing skills**
   - Add PRD links to existing skills
   - Add acceptance criteria
   - Trace back to first principles

### Week 3: Validation

1. **Test with new skill**
2. **Measure impact**
3. **Iterate**

## Quality Gates

<quality_gates>
### Before Creating Any Skill
- [ ] PRD exists with first principles analysis
- [ ] Requirements are explicit (no ambiguity)
- [ ] Acceptance criteria are measurable
- [ ] Technical epic approved

### Before Writing Code
- [ ] Task specification reviewed
- [ ] First principles validated
- [ ] Dependencies identified
- [ ] Rollback plan documented

### Before Merging
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Documentation complete
- [ ] First principles still valid
</quality_gates>

## Benefits

<benefits>
### For Developers
- Clear requirements (no guessing)
- Traceability (why are we building this?)
- Confidence (first principles validated)

### For Agents
- Explicit specifications (no ambiguity)
- Testable acceptance criteria
- Clear boundaries (what NOT to build)

### For Teams
- Transparency (GitHub Issues)
- Collaboration (human-AI handoffs)
- Accountability (traceability)
</benefits>

## Summary

**First Principles** ensures we build the RIGHT thing.
**Spec-Driven Development** ensures we build it CORRECTLY.
**GitHub Integration** ensures full TRACEABILITY.

Together, they eliminate "vibe coding" and create production-ready skills and agents.
