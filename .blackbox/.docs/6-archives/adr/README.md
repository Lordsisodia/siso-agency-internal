# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for Blackbox4.

## What are ADRs?

ADRs document significant architectural decisions in Blackbox4. Each ADR records:
- **Context**: What situation required the decision
- **Decision**: What was decided
- **Consequences**: What resulted from the decision

## Why ADRs?

- **Onboarding**: New contributors understand past decisions
- **Consistency**: Avoid revisiting the same decisions
- **Historical**: Track evolution of architecture
- **Communication**: Share reasoning with team

## ADR Template

```markdown
# ADR-XXX: [Title]

**Status:** Accepted | Proposed | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Decision Makers:** @username
**Technical Story:** [link to issue/plan]

## Context

[What is the issue that we're seeing that is motivating this decision or change?]

## Decision

[What is the change that we're proposing and/or doing?]

## Status

[Proposed | Accepted | Rejected | Deprecated | Superseded]

## Consequences

- [Positive consequence 1]
- [Positive consequence 2]
- [Negative consequence 1]
- [Negative consequence 2]

## See Also

- [Link to related ADR]
- [Link to documentation]
- [Link to implementation]
```

## ADR Index

| **ADR** | **Title** | **Status** | **Date** |
|---------|-----------|------------|----------|
| [ADR-001](./001-numbered-folders.md) | Numbered Folder Navigation | Accepted | 2026-01-15 |
| [ADR-002](./002-three-tier-memory.md) | Three-Tier Memory System | Accepted | 2026-01-15 |
| [ADR-003](./003-bmad-primary-framework.md) | BMAD as Primary Framework | Accepted | 2026-01-15 |
| [ADR-004](./004-glass-box-orchestration.md) | Glass Box Orchestration, Black Box Implementation | Accepted | 2026-01-15 |
| [ADR-005](./005-readme-everywhere.md) | README.md in Every Directory | Accepted | 2026-01-15 |

## Creating a New ADR

1. Copy the template above
2. Assign next sequential number (ADR-006, etc.)
3. Fill in all sections
4. Add to index above
5. Commit: `git add .docs/6-archives/adr/`

## Viewing ADRs

ADRs are organized by:
- **Number**: Sequential order (001, 002, etc.)
- **Status**: Current state of decision
- **Date**: When decision was made

## ADR Lifecycle

1. **Proposed**: Draft stage, open for feedback
2. **Accepted**: Decision made and implemented
3. **Rejected**: Decision not pursued
4. **Deprecated**: Decision no longer recommended
5. **Superseded**: Replaced by newer ADR

## Best Practices

- **Be concise**: ADRs should be 200-500 words
- **Focus on why**: Explain reasoning, not just what
- **Document trade-offs**: Include both positive and negative consequences
- **Link to context**: Reference issues, plans, or discussions
- **Keep current**: Update ADRs if decisions change

## Examples

See existing ADRs in this directory for examples of well-documented decisions.

---

**Last Updated:** 2026-01-15
**Maintainer:** Blackbox4 Team
