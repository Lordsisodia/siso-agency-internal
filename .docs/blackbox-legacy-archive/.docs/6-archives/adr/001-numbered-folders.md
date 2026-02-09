# ADR-001: Numbered Folder Navigation

**Status:** Accepted
**Date:** 2026-01-15
**Decision Makers:** Blackbox4 Team
**Technical Story:** Initial architecture design

## Context

Blackbox4 needed a clear, intuitive navigation structure for:
- 12+ top-level directories
- Multiple agent categories
- Framework patterns
- Modules and tools

Traditional folder names (e.g., `src/`, `lib/`, `tools/`) don't convey:
- **Priority**: What's most important?
- **Order**: Where do I start?
- **Mental model**: How do things relate?

## Decision

Use **numbered folders (1-7)** for user-space directories:

```
1-agents/         # All agent definitions
2-frameworks/     # Framework patterns
3-modules/        # Domain modules
4-scripts/        # All scripts
5-templates/      # Templates
6-tools/          # Tools
7-workspace/      # Workspace
```

**Rules:**
1. Max 7 numbered folders (cognitive limit)
2. Numbering indicates workflow order
3. System folders use dot-prefix (.config/, .docs/, etc.)
4. Subdirectories also numbered when appropriate

## Status

**Accepted** - Implemented in initial structure

## Consequences

### Positive

- **Clear mental model**: Numbers = order = workflow
- **Quick navigation**: "Go to 1-agents" is unambiguous
- **Prevents overwhelm**: Max 7 items = never too many
- **Forces prioritization**: Must justify numbered position
- **Keyboard friendly**: 1-7 keys map directly

### Negative

- **Reordering is expensive**: Changing numbers breaks references
- **Not traditional**: Deviates from standard conventions
- **Numbers in paths**: Longer file paths

## Alternatives Considered

1. **Alphabetical** (src/, tools/, lib/) - No priority indication
2. **Functional** (code/, docs/, config/) - Less intuitive workflow
3. **No numbering** - Harder to remember order

## Implementation

Numbered folders implemented in:
- Root level (1-agents through 7-workspace)
- Agent categories (1-core through 5-enhanced)
- Documentation (1-getting-started through 6-archives)
- Skills (1-core, 2-mcp, 3-workflow)

## See Also

- [OPTIMAL-BLACKBOX-ARCHITECTURE.md](../../../OPTIMAL-BLACKBOX-ARCHITECTURE.md) - Analysis of numbered folders
- [STRUCTURE.txt](../../../STRUCTURE.txt) - Complete structure
- [ADR-004](./004-glass-box-orchestration.md) - System vs user space separation
