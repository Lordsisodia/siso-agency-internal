# 06 - Spec Kit Reuse Strategy

**Status:** ✅ Ready to Copy (PATTERNS AS DOCS)
**Source:** `Blackbox Implementation Plan/Evaluations/03-SPECKIT.md`
**Destination:** `blackbox4/docs/frameworks/speckit-patterns.md`

**Action:** Copy patterns as documentation, not code. No implementation.

---

## 📦 What You're Getting (Patterns, Not Code)

### Spec Kit Slash Command Patterns

**Source:** Spec Kit documentation and workflows

**Slash Commands (Copy as Documentation):**

| Command | Purpose | Description | File |
|---------|---------|-------------|------|
| `/speckit.constitution` | Define principles | Set project constitution once | `docs/frameworks/speckit/` |
| `/speckit.specify` | Gather requirements | Structured requirements gathering | `docs/frameworks/speckit/` |
| `/speckit.plan` | Technical planning | Technical implementation planning | `docs/frameworks/speckit/` |
| `/speckit.tasks` | Task breakdown | Actionable task breakdown | `docs/frameworks/speckit/` |
| `/speckit.implement` | Execute tasks | Execute all tasks systematically | `docs/frameworks/speckit/` |
| `/speckit.clarify` | Refine specs | Sequential, coverage-based questioning | `docs/frameworks/speckit/` |
| `/speckit.analyze` | Analyze artifacts | Cross-artifact consistency analysis | `docs/frameworks/speckit/` |
| `/speckit.checklist` | Quality checklists | Custom quality checklists | `docs/frameworks/speckit/` |

---

## 📋 Document Templates to Copy

### A. Constitution Template

**Source:** Spec Kit

**Copy to:** `blackbox4/templates/documents/constitution.md`

```markdown
# Project Constitution

## Core Principles

### 1. [Principle Name]
**Statement:** [One-sentence principle]
**Rationale:** [Why this principle matters]
**Examples:** [Concrete examples]

### 2. [Principle Name]
...

## Technical Decisions

### [Decision Area]
**Decision:** [The choice made]
**Rationale:** [Why this decision]
**Alternatives Considered:** [Other options and why rejected]

## Quality Standards

### Code Quality
- [Quality requirements]
- [Testing requirements]
- [Documentation requirements]

### User Experience
- [UX principles]
- [Accessibility requirements]
- [Performance requirements]

## Development Process

### Workflow
- [How features are developed]
- [How code is reviewed]
- [How decisions are made]

### Tools and Conventions
- [Development tools]
- [Code conventions]
- [Git workflow]
```

---

### B. Requirements Template

**Copy to:** `blackbox4/templates/documents/requirements.md`

```markdown
# Requirements Specification

## Overview

**Project:** [Project name]
**Version:** [Version number]
**Date:** [Date]
**Author:** [Author]

## Functional Requirements

### [Requirement Category]

#### FR-001: [Requirement Title]
**Priority:** [Must/Should/Could]
**Description:** [Detailed description]
**Acceptance Criteria:** [Definition of done]
**Dependencies:** [Other requirements this depends on]

#### FR-002: [Requirement Title]
...

## Non-Functional Requirements

### Performance
- [Performance requirements]

### Security
- [Security requirements]

### Reliability
- [Reliability requirements]

### Scalability
- [Scalability requirements]

## User Stories

### [User Story]
**As a** [user type],  
**I want** [action],  
**So that** [benefit].

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Constraints

### Technical Constraints
- [Technical limitations]

### Business Constraints
- [Business limitations]

### Time Constraints
- [Time limitations]
```

---

### C. User Story Template

**Copy to:** `blackbox4/templates/documents/user-stories.md`

```markdown
# User Stories

## [Epic Name]

### Story: [Story Title]

**Priority:** [P0/P1/P2/P3]
**Story Points:** [Story points]
**Sprint:** [Sprint number]

**User Story:**
As a **[user type]**,
I want **[action]**,
So that **[benefit]**.

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

**Definition of Done:**
- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Documentation updated

**Dependencies:**
- [Other stories or requirements]

**Notes:**
[Additional notes]
```

---

## 🔧 How to Use Spec Kit Patterns in Blackbox4

### Slash Command Pattern (as Documentation)

Instead of actual slash commands, use Blackbox4's prompt-based approach:

**Spec Kit Approach:**
```
/speckit.specify
```

**Blackbox4 Equivalent:**
```bash
# Create a plan with specification focus
./scripts/new-plan.sh "specify requirements for user auth"

# Then use Blackbox4 agent:
# "Read: skills/core/slash-commands.md
# Apply: /speckit.specify workflow to this project"
```

---

### Constitution Pattern

**Usage:**

```bash
# 1. Create constitution
cp templates/documents/constitution.md .plan/constitution.md

# 2. Edit with AI
# "Review: .plan/constitution.md
# Define core principles for this project"

# 3. Follow principles
# "Read: .plan/constitution.md
# Ensure all decisions align with these principles"
```

---

### Specification Pattern

**Usage:**

```bash
# 1. Use specification template
cp templates/documents/requirements.md .plan/requirements.md

# 2. Fill with AI
# "Apply: /speckit.specify workflow
# Fill: .plan/requirements.md with project requirements"

# 3. Use in BMAD workflow
# John (PM) agent uses requirements.md
# Winston (Architect) agent uses requirements.md
```

---

### Clarification Pattern

**Usage:**

```bash
# 1. Clarify requirements
# "Read: .plan/requirements.md
# Apply: /speckit.clarify workflow
# Ask clarifying questions about gaps"

# 2. Document answers
# "Update: .plan/requirements.md with clarified details"
```

---

### Checklist Pattern

**Usage:**

```bash
# 1. Create quality checklist
# "Based on .plan/requirements.md
# Create: quality checklist for this project"

# 2. Use checklist
# "Read: quality-checklist.md
# Validate: implementation meets all criteria"

# 3. Example checklist:
# - [ ] All requirements met
# - [ ] Security review passed
# - [ ] Performance benchmarks met
# - [ ] Accessibility standards followed
# - [ ] Code review approved
# - [ ] Tests passing (100%)
# - [ ] Documentation complete
```

---

## 🚀 Copy Command

```bash
# 1. Create directories
mkdir -p blackbox4/docs/frameworks/speckit
mkdir -p blackbox4/templates/documents

# 2. Copy Spec Kit evaluation (as reference)
cp "Blackbox Implementation Plan/Evaluations/03-SPECKIT.md" \
   blackbox4/docs/frameworks/speckit-patterns.md

# 3. Create document templates
cat > blackbox4/templates/documents/constitution.md << 'EOF'
# Project Constitution

## Core Principles
...

[Copy full template from above section]
EOF

cat > blackbox4/templates/documents/requirements.md << 'EOF'
# Requirements Specification

## Overview
...

[Copy full template from above section]
EOF

cat > blackbox4/templates/documents/user-stories.md << 'EOF'
# User Stories

## [Epic Name]

### Story: [Story Title]
...

[Copy full template from above section]
EOF
```

---

## ✅ What You Get After This Section

1. ✅ **8 Slash Command Patterns** - Documented for reference
2. ✅ **3 Document Templates** - Constitution, Requirements, User Stories
3. ✅ **Usage Examples** - How to use patterns in Blackbox4
4. ✅ **Integration Guide** - How Spec Kit fits with BMAD agents

**Total New Code:** 0 lines
**Total Code Reused:** Patterns from Spec Kit documentation
**Implementation:** As documentation only, not code

---

## 📊 Integration Summary

| Component | Source | Size | Action | Status |
|-----------|--------|------|--------|--------|
| **Slash Command Patterns** | Spec Kit docs | 8 commands | Copy as docs | ✅ Ready |
| **Constitution Template** | Spec Kit | Template | Copy | ✅ Ready |
| **Requirements Template** | Spec Kit | Template | Copy | ✅ Ready |
| **User Story Template** | Spec Kit | Template | Copy | ✅ Ready |
| **Usage Examples** | This doc | Examples | New | ✅ Ready |

**Reuse Ratio:** 100% patterns from Spec Kit, 0% new code

---

## ✅ Success Criteria

After completing this section:

1. ✅ `docs/frameworks/speckit-patterns.md` exists with all 8 slash commands
2. ✅ 3 document templates exist in `templates/documents/`
3. ✅ Usage examples show how to use patterns in Blackbox4
4. ✅ Integration with BMAD agents documented
5. ✅ All templates are well-documented

---

## 🎯 Next Step

**Go to:** `07-METAGPT-REUSE.md`

**Add MetaGPT document templates (PRD, API design, competitive analysis).**
