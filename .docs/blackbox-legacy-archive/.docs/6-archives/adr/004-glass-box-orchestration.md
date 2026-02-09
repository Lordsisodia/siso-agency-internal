# ADR-004: Glass Box Orchestration, Black Box Implementation

**Status:** Accepted
**Date:** 2026-01-15
**Decision Makers:** Blackbox4 Team
**Technical Story:** Core architectural principle

## Context

Multi-agent systems need balance between:
- **Transparency**: Orchestration must be observable
- **Simplicity**: Implementation details should be hidden
- **Debuggability**: Users need to see what's happening
- **Usability**: Complexity shouldn't overwhelm users

Existing approaches:
- **All glass box**: Too much complexity exposed
- **All black box**: No visibility into execution
- **Mixed**: Inconsistent patterns

## Decision

Separate **system space** (glass box) from **user space** (black box):

**System Space (Glass Box):**
```
.config/           # Configuration (VISIBLE)
.docs/             # Documentation (VISIBLE)
.memory/           # Memory system (AUDITABLE)
.plans/            # Active plans (TRANSPARENT)
.runtime/          # Runtime state (OBSERVABLE)
```

**User Space (Black Box):**
```
1-agents/          # Agent implementations (HIDDEN)
2-frameworks/      # Framework patterns (HIDDEN)
3-modules/         # Module logic (HIDDEN)
4-scripts/         # Scripts (HIDDEN)
5-templates/       # Templates (HIDDEN)
6-tools/           # Tools (HIDDEN)
7-workspace/       # Workspace (HIDDEN)
```

**Principle:** "Glass Box Orchestration, Black Box Implementation"

## Status

**Accepted** - Core architectural principle

## Consequences

### Positive

- **Orchestration is visible**: Users see plans, state, memory
- **Implementation is hidden**: Complexity encapsulated
- **Debuggable**: Can inspect runtime state
- **Maintainable**: Clear separation of concerns
- **Scalable**: Easy to add agents/modules

### Negative

- **Two mental models**: System vs user space
- **Dot-folder convention**: Not immediately obvious
- **Documentation burden**: Need to explain both spaces
- **Migration cost**: Moving from single-space approach

## Why This Separation?

### System Space (Glass Box)

**Visible because:**
- Users need to see what's running
- Plans should be transparent
- Memory should be auditable
- Runtime state observable
- Configuration accessible

**Benefits:**
- Debuggability
- Trust
- Control
- Understanding

### User Space (Black Box)

**Hidden because:**
- Implementation details distract
- Complexity overwhelms
- Users care about outcomes, not internals
- Easier to maintain
- Better abstraction

**Benefits:**
- Simplicity
- Focus
- Encapsulation
- Flexibility

## Alternatives Considered

1. **All glass box** - Too overwhelming
2. **All black box** - No visibility
3. **No separation** - Inconsistent patterns
4. **Role-based access** - Over-engineering for local system

## Implementation

**System Space Structure:**
```
.blackbox4/
├── .config/              # All config files
│   ├── blackbox4.yaml
│   ├── agents.yaml
│   └── memory.yaml
├── .docs/                # All documentation
├── .memory/              # Three-tier memory
├── .plans/               # Active plans (visible)
└── .runtime/             # Runtime state (observable)
```

**User Space Structure:**
```
├── 1-agents/             # Agent implementations
├── 2-frameworks/         # Frameworks
├── 3-modules/            # Domain modules
├── 4-scripts/            # Scripts
├── 5-templates/          # Templates
├── 6-tools/              # Tools
└── 7-workspace/          # Workspace
```

**Dot-Folder Convention:**
- System folders start with dot (.)
- User folders are numbered (1-7)
- Clear visual distinction

## Examples

**Viewing orchestration (glass box):**
```bash
# See active plans
ls .plans/active/

# See runtime state
cat .runtime/.ralph/state.json

# See memory
ls .memory/working/
```

**Using implementation (black box):**
```bash
# Don't worry about internals
# Just use agents
"Use agent: oracle"
"Use agent: librarian"

# Implementation hidden
```

## Future Enhancements

- [ ] Visualization tools for orchestration layer
- [ ] Runtime inspection UI
- [ ] Memory exploration tools
- [ ] Plan execution tracking

## See Also

- [OPTIMAL-BLACKBOX-ARCHITECTURE.md](../../../OPTIMAL-BLACKBOX-ARCHITECTURE.md)
- [BLACKBOX4-ANALYSIS.md](../../../BLACKBOX4-ANALYSIS.md)
- [ADR-001](./001-numbered-folders.md) - Numbered folders in user space
