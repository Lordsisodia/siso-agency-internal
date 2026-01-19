---
allowed-tools: Bash, Read, Write, LS, Task, Agent
---

# PRD New (Enhanced with Research + Memory)

Launch brainstorming for new product requirement document with research phase and BlackBox memory integration.

## Usage
```
/pm:prd-new <feature_name>
```

## Required Rules

**IMPORTANT:** Before executing this command, read and follow:
- `.claude/rules/datetime.md` - For getting real current date/time

## Preflight Checklist

Before proceeding, complete these validation steps.
Do not bother the user with preflight checks progress ("I'm not going to ..."). Just do them and move on.

### Input Validation
1. **Validate feature name format:**
   - Must contain only lowercase letters, numbers, and hyphens
   - Must start with a letter
   - No spaces or special characters allowed
   - If invalid, tell user: "❌ Feature name must be kebab-case (lowercase letters, numbers, hyphens only). Examples: user-auth, payment-v2, notification-system"

2. **Check for existing PRD:**
   - Check if `.claude/prds/$ARGUMENTS.md` already exists
   - If it exists, ask user: "⚠️ PRD '$ARGUMENTS' already exists. Do you want to overwrite it? (yes/no)"
   - Only proceed with explicit 'yes' confirmation

3. **Verify directory structure:**
   - Check if `.claude/prds/` directory exists
   - If not, create it first

## Instructions

You are a product manager creating a comprehensive Product Requirements Document (PRD) for: **$ARGUMENTS**

Follow this **structured approach with research phase**:

### Phase 1: Research (CCPM 4-Dimensional Framework)

**CRITICAL**: Before writing any PRD, conduct parallel research across 4 dimensions.

Spawn 4 parallel research agents:

```python
# Research Dimension 1: STACK
Task(
    description="Research tech stack for $ARGUMENTS",
    subagent_type="general-purpose",
    prompt="""
    Research the current tech stack for implementing: $ARGUMENTS

    Investigate:
    - What programming languages are we using?
    - What frameworks/libraries are available?
    - What database/storage systems exist?
    - What API patterns are established?

    Output: STACK.md with findings
    """
)

# Research Dimension 2: FEATURES
Task(
    description="Research feature requirements for $ARGUMENTS",
    subagent_type="general-purpose",
    prompt="""
    Research what features $ARGUMENTS needs

    Investigate:
    - What are the core features needed?
    - What are nice-to-have features?
    - What features exist in similar systems?
    - What features can we skip?

    Output: FEATURES.md with findings
    """
)

# Research Dimension 3: ARCHITECTURE
Task(
    description="Research architecture for $ARGUMENTS",
    subagent_type="general-purpose",
    prompt="""
    Research where $ARGUMENTS fits in the system architecture

    Investigate:
    - Where does this fit in the existing system?
    - What components will it interact with?
    - What are the data flows?
    - What are the integration points?

    Output: ARCHITECTURE.md with findings
    """
)

# Research Dimension 4: PITFALLS
Task(
    description="Research pitfalls for $ARGUMENTS",
    subagent_type="general-purpose",
    prompt="""
    Research common pitfalls when implementing: $ARGUMENTS

    Investigate:
    - What are common mistakes?
    - What security issues exist?
    - What performance problems occur?
    - What are the known failure patterns?

    Output: PITFALLS.md with findings
    """
)
```

**Wait for all 4 research dimensions to complete.**

**Synthesize research:**

Create `.claude/prds/$ARGUMENTS/research/SUMMARY.md` that combines findings from all 4 dimensions.

### Phase 2: First Principles Analysis

**Before writing the PRD**, answer these fundamental questions:

1. **What problem are we ACTUALLY solving?**
   - NOT "Implement $ARGUMENTS"
   - BUT "Users need [core benefit]"

2. **What are the core constraints?**
   - Technical constraints
   - Performance constraints
   - Security constraints
   - Time/resource constraints

3. **What does "success" look like?**
   - Measurable outcomes
   - User experience goals
   - Technical metrics

4. **What are we NOT doing? (Scope Boundaries)**
   - Explicitly define what's out of scope
   - Prevent scope creep

5. **What assumptions are we making?**
   - About users
   - About technology
   - About resources

6. **What do we need to validate?**
   - Risk areas
   - Uncertainties
   - Dependencies

Document this in: `.claude/prds/$ARGUMENTS/first-principles.md`

### Phase 3: Discovery & Context

- Ask clarifying questions about the feature/product "$ARGUMENTS"
- Understand the problem being solved (from first principles perspective)
- Identify target users and use cases
- Gather constraints and requirements

### Phase 4: PRD Structure

Create a comprehensive PRD with these sections:

#### Executive Summary
- Brief overview and value proposition
- Reference first principles analysis

#### Problem Statement
- What problem are we solving? (from first principles)
- Why is this important now?

#### User Stories
- Primary user personas
- Detailed user journeys
- Pain points being addressed

#### Requirements
**Functional Requirements**
- Core features and capabilities
- User interactions and flows

**Non-Functional Requirements**
- Performance expectations
- Security considerations
- Scalability needs

#### Success Criteria
- Measurable outcomes
- Key metrics and KPIs

#### Constraints & Assumptions
- Technical limitations
- Timeline constraints
- Resource limitations

#### Out of Scope
- What we're explicitly NOT building (from first principles)

#### Dependencies
- External dependencies
- Internal team dependencies

### Phase 5: BlackBox Memory Updates

**CRITICAL**: Update BlackBox memory throughout the process.

```python
# After research phase
from engine.memory.AgentMemory import AgentMemory

memory = AgentMemory(agent_id="john")  # PM agent

# Store research findings
memory.add_insight(
    content="[Key finding from research]",
    category="pattern",  # or "gotcha", "discovery"
    confidence=0.9,
    metadata={
        "feature": "$ARGUMENTS",
        "source": "STACK.md research",
        "phase": "research"
    }
)

# Store first principles analysis
memory.add_session(
    task="First principles analysis for $ARGUMENTS",
    result="Identified core problem, constraints, scope boundaries",
    success=True,
    metadata={
        "feature": "$ARGUMENTS",
        "scope_boundaries": ["list boundaries"],
        "core_constraints": ["list constraints"]
    }
)

# Store PRD creation
memory.add_session(
    task="Create PRD for $ARGUMENTS",
    result="Created comprehensive PRD with X requirements, Y success criteria",
    success=True,
    metadata={
        "feature": "$ARGUMENTS",
        "prd_file": ".claude/prds/$ARGUMENTS.md",
        "requirements_count": X,
        "success_criteria_count": Y
    }
)

# Update current plan context
memory.update_context({
    "current_plan": {
        "feature": "$ARGUMENTS",
        "phase": "prd_complete",
        "next_step": "Create epic from PRD"
    }
})
```

### Phase 6: File Format with Frontmatter

Save the completed PRD to: `.claude/prds/$ARGUMENTS.md` with this exact structure:

```markdown
---
name: $ARGUMENTS
description: [Brief one-line description of the PRD]
status: backlog
created: [Current ISO date/time]
research: .claude/prds/$ARGUMENTS/research/
first_principles: .claude/prds/$ARGUMENTS/first-principles.md
---

# PRD: $ARGUMENTS

## Executive Summary
[Content...]

## Problem Statement
[Content from first principles analysis]

[Continue with all sections...]
```

### Frontmatter Guidelines
- **name**: Use the exact feature name (same as $ARGUMENTS)
- **description**: Write a concise one-line summary of what this PRD covers
- **status**: Always start with "backlog" for new PRDs
- **created**: Get REAL current datetime by running: `date -u +"%Y-%m-%dT%H:%M:%SZ"`
  - Never use placeholder text
  - Must be actual system time in ISO 8601 format
- **research**: Link to research directory
- **first_principles**: Link to first principles analysis

### Quality Checks

Before saving the PRD, verify:
- [ ] Research phase completed (4 dimensions + summary)
- [ ] First principles analysis completed
- [ ] All PRD sections are complete (no placeholder text)
- [ ] User stories include acceptance criteria
- [ ] Success criteria are measurable
- [ ] Dependencies are clearly identified
- [ ] Out of scope items are explicitly listed
- [ ] BlackBox memory updated with research findings
- [ ] BlackBox memory updated with PRD creation

### Post-Creation

After successfully creating the PRD:
1. Confirm: "✅ PRD created: .claude/prds/$ARGUMENTS.md"
2. Show brief summary of what was captured
3. Confirm BlackBox memory updated
4. Suggest next step: "Ready to create implementation epic? Run: /pm:prd-parse $ARGUMENTS"

## Error Recovery

If any step fails:
- Clearly explain what went wrong
- Provide specific steps to fix the issue
- Never leave partial or corrupted files
- Rollback BlackBox memory updates if PRD creation failed

## Research Output Structure

```
.claude/prds/$ARGUMENTS/
├── research/
│   ├── STACK.md         # Tech stack analysis
│   ├── FEATURES.md      # Feature requirements
│   ├── ARCHITECTURE.md  # System integration
│   ├── PITFALLS.md      # Common pitfalls
│   └── SUMMARY.md       # Synthesized findings
├── first-principles.md  # First principles analysis
└── $ARGUMENTS.md        # The PRD itself
```

## Summary

This enhanced workflow ensures:

1. ✅ **Research Before Planning**: 4-dimensional parallel research
2. ✅ **First Principles Thinking**: Deep questioning before writing
3. ✅ **BlackBox Memory Integration**: All findings stored in memory
4. ✅ **Traceability**: Complete audit trail from research to PRD
5. ✅ **Quality**: Comprehensive, well-researched PRDs

Conduct a thorough brainstorming session before writing the PRD. Ask questions, explore edge cases, and ensure comprehensive coverage of the feature requirements for "$ARGUMENTS".
