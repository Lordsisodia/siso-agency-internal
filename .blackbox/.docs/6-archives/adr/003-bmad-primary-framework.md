# ADR-003: BMAD as Primary Framework

**Status:** Accepted
**Date:** 2026-01-15
**Decision Makers:** Blackbox4 Team
**Technical Story:** Framework selection

## Context

Blackbox4 needed a primary methodology for:
- Multi-agent orchestration
- Project planning
- Task breakdown
- Team coordination

Available frameworks:
- **BMAD** (Breakthrough Method for Agile AI-Driven Development)
- **Spec Kit**
- **MetaGPT**
- **Swarm**

## Decision

Adopt **BMAD as the primary framework** with others as optional:

**Primary:** `2-frameworks/1-bmad/`
- 12+ specialized agents
- 4-phase methodology
- Proven track record
- Comprehensive tooling

**Secondary:** `2-frameworks/2-speckit/`, `2-frameworks/3-metagpt/`, `2-frameworks/4-swarm/`
- Available for specific use cases
- Not required
- Experimental

## Status

**Accepted** - BMAD integrated as default framework

## Consequences

### Positive

- **Consistency**: Single primary methodology
- **Proven**: BMAD tested in production
- **Comprehensive**: Covers all phases
- **Specialized agents**: Purpose-built for each phase
- **Documentation**: Extensive guides available

### Negative

- **Lock-in**: Heavy investment in BMAD
- **Learning curve**: 12+ agents to learn
- **Complexity**: More than needed for simple tasks
- **Opportunity cost**: Less focus on other frameworks

## Why BMAD?

1. **Agent Coverage**: 12+ specialized agents
   - Analyst, Architect, Dev, PM, PO, QA, SM, TEA, etc.

2. **4-Phase Methodology**:
   - Phase 1: Elicitation
   - Phase 2: Analysis
   - Phase 3: Design
   - Phase 4: Implementation

3. **Proven Results**:
   - Used in production systems
   - Tested on real projects
   - Continuous improvement

4. **Tooling**:
   - Agent templates
   - Workflow scripts
   - Documentation

## Alternatives Considered

1. **MetaGPT** - Less mature, fewer agents
2. **Spec Kit** - More focused on specs, less on execution
3. **Swarm** - Different paradigm (emergent vs structured)
4. **No primary framework** - Too much choice, inconsistency

## Implementation

**BMAD Agents Location:**
```
1-agents/2-bmad/
├── analyst.md
├── architect.md
├── dev.md
├── pm.md
├── po.md
├── qa.md
├── sm.md
└── tea.md
```

**Default Workflow:**
```bash
# Start BMAD project
./4-scripts/start-bmad.sh "Project description"

# Agents automatically sequenced:
# 1. Analyst - Requirements gathering
# 2. Architect - System design
# 3. Dev - Implementation
# 4. QA - Testing
```

**Using Other Frameworks:**
```bash
# Use Spec Kit instead
./4-scripts/start-speckit.sh "Project description"

# Use MetaGPT
./4/scripts/start-metagpt.sh "Project description"
```

## Future Considerations

- [ ] Evaluate BMAD competitors quarterly
- [ ] Gather metrics on BMAD effectiveness
- [ ] Consider hybrid approaches
- [ ] Community feedback integration

## See Also

- [BMAD Documentation](../../4-frameworks/bmad/)
- [Agent Reference](../../2-reference/AGENT-REFERENCE.md)
- [ADR-001](./001-numbered-folders.md) - Framework organization
