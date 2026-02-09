# ADR-005: README.md in Every Directory

**Status:** Accepted
**Date:** 2026-01-15
**Decision Makers:** Blackbox4 Team
**Technical Story:** Documentation standard

## Context

Without documentation in directories:
- Users don't know what folders contain
- New contributors can't orient themselves
- Maintainers forget folder purposes
- "What was this for?" becomes common
- Institutional memory is lost

Industry standard: **Every directory should have README.md**

## Decision

Require **README.md in every directory** in .blackbox4:

**Rule:** No directory without README.md

**Exceptions:** None (not even runtime-generated dirs)

**README.md must answer 5 questions:**
1. **What?** - What is this directory?
2. **Why?** - Why does it exist?
3. **How?** - How do I use it?
4. **Where?** - Where does it fit?
5. **Warning?** - Any cautions?

## Status

**Accepted** - 100% coverage achieved (194/194 directories)

## Consequences

### Positive

- **Self-documenting**: Structure explains itself
- **Quick onboarding**: New users orient quickly
- **Reduced questions**: Answers in README
- **Maintainable**: Purpose documented
- **Professional**: Industry best practice

### Negative

- **Maintenance overhead**: Keep READMEs in sync
- **File count**: +194 files in repository
- **Initial effort**: Creating all READMEs
- **Review burden**: PRs include README updates

## Implementation

### Automated Generation

**Script:** `4-scripts/generate-readmes.sh`
```bash
cd .blackbox4
./4-scripts/generate-readmes.sh
```

**Output:**
```
Total directories scanned: 194
README.md files created: 1
Already had README.md: 193
```

### Verification

**Script:** `4-scripts/verify-readmes.sh`
```bash
cd .blackbox4
./4-scripts/verify-readmes.sh
```

**Output:**
```
Total directories: 194
With README.md: 194
Without README.md: 0
✅ SUCCESS: All directories have README.md!
```

### Template

**Standard template:**
```markdown
# [Directory Name]

[One-line description]

## Purpose
[What this directory contains]

## Organization
[Subdirectories and their purposes]

## Usage
[How to use this directory]

## See Also
[Related documentation]
```

### Examples

**Root level directory:**
```markdown
# 1-agents

All agent definitions in Blackbox4.

## Purpose
Contains agent system:
- Agent definitions
- Agent categorization
- Skills system
- Agent templates

## Organization
- 1-core/ - Core agent system
- 2-bmad/ - BMAD methodology
- 3-research/ - Research agents
- 4-specialists/ - Specialist agents
- 5-enhanced/ - Enhanced AI agents
- .skills/ - Skills system

## Usage
See [`.docs/3-components/agents/`](../.docs/3-components/agents/)
```

**Runtime directory:**
```markdown
# .ralph

Ralph Wiggum autonomous loop runtime state.

## Purpose
Contains runtime state for Ralph's autonomous execution.

## Files
- state.json - Current Ralph state
- prd.json - Active PRD
- logs/ - Execution logs

## Warning
⚠️ DO NOT manually modify files in this directory
```

## Workflow

**When modifying directories:**
```bash
# 1. Make code changes
vim [files]

# 2. Update README.md
vim README.md

# 3. Commit both together
git add [files] README.md
git commit -m "Update: [changes] + update docs"
```

**Validation:**
```bash
# Include in CI/CD
./4-scripts/verify-readmes.sh || exit 1
```

## Alternatives Considered

1. **No READMEs** - Confusing, unmaintainable
2. **READMEs in root only** - Doesn't scale
3. **Central documentation** - Hard to maintain
4. **Code comments** - Not discoverable

## Future Enhancements

- [ ] Auto-generate from code structure
- [ ] Linting for README quality
- [ ] Template validation
- [ ] Multi-language support

## Metrics

**Current State:**
- Total directories: 194
- With README.md: 194
- Coverage: 100%

**Historical:**
- Initial gap: 89 directories missing README (from Blackbox3)
- Fixed: Automated generation + manual review
- Maintained: Verification script

## See Also

- [README-IMPLEMENTATION.md](../../../README-IMPLEMENTATION.md) - Complete implementation details
- [verify-readmes.sh](../../../4-scripts/verify-readmes.sh) - Verification script
- [generate-readmes.sh](../../../4-scripts/generate-readmes.sh) - Generation script
