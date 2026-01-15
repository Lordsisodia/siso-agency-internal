# Blackbox3/Blackbox4 Reference Structure for Research Agents

**Purpose**: Define exactly how research agents should format outputs to match Blackbox3/Blackbox4 expectations

**Target Audience**: Research agents analyzing external frameworks (Oh-My-OpenCode, BMAD, SpecKit, Ralph, etc.)

---

## 📁 Blackbox3/Blackbox4 Directory Structure

### Core Directory Layout

```
blackbox4/
├── agents/              # Agent definitions and skills
│   ├── _core/          # Core agent prompts and behaviors
│   ├── bmad/           # BMAD methodology agents
│   └── .skills/        # Skill definitions (164KB)
├── scripts/            # Bash scripts (5,810+ lines)
│   ├── python/         # Python validation scripts
│   └── check-blackbox.sh
├── core/               # Core functionality
│   ├── runtime/        # Runtime system
│   ├── blueprints/     # Plan blueprints
│   └── templates/      # Templates for plans
├── modules/            # Functional modules
│   ├── first-principles/
│   ├── research/
│   └── ...
├── ralph/              # Ralph autonomous engine
├── .memory/            # 3-tier memory system
├── .opencode/          # Oh-My-OpenCode integration
│   ├── mcp-servers.json
│   ├── skills/
│   └── background-tasks/
├── docs/               # Documentation
│   ├── frameworks/
│   └── research/
├── protocol.md         # Core workflow protocol
├── context.md          # Context for AI agents
└── tasks.md            # Task management
```

---

## 📄 Research Output Format Requirements

### 1. Framework Analysis Report

Each research agent must produce a **framework analysis report** in this format:

**File Path**: `blackbox4/docs/research/{FRAMEWORK}-analysis.md`

**Required Structure**:

```markdown
# {FRAMEWORK NAME} Framework Analysis

**Researcher Agent**: [Agent Name]
**Date**: [YYYY-MM-DD]
**Framework Version**: [Version if applicable]
**Source**: [Repository URL/Documentation URL]

---

## Executive Summary

[2-3 paragraph summary answering]:
- What does this framework do?
- What are its core strengths?
- What are its main weaknesses?
- How does it compare to Blackbox3?
- Should we adopt/adapt it? (Yes/No/Maybe)

---

## Architecture Overview

### Core Components

[List 5-10 core components with brief descriptions]

### Design Patterns

[Identify key design patterns used]

### Technology Stack

[List main technologies/languages]

---

## Detailed Component Analysis

### Component 1: [Name]

**Purpose**: [What it does]
**Implementation**: [How it works - technical details]
**Code Location**: [Specific file/paths]
**Lines of Code**: [Estimate if code is available]
**Key Classes/Functions**: [List important code elements]

**Can We Reuse This?**
- Reuse Decision: [YES/NO/PARTIAL]
- Effort to Integrate: [HOURS/DAYS/WEEKS]
- Benefits: [What we get]
- Risks: [Potential issues]

### Component 2: [Name]
[Repeat for each major component]

---

## Integration Recommendations

### High-Impact, Low-Effort Items (Priority 1)

[Items that give big benefits with minimal effort]

### High-Impact, High-Effort Items (Priority 2)

[Items that give big benefits but require significant work]

### Low-Impact, Low-Effort Items (Priority 3)

[Nice-to-have items that are easy to add]

### Low-Impact, High-Effort Items (Priority 4)

[Skip unless there's a specific need]

---

## Code to Copy/Adapt

### Files to Copy As-Is

```bash
# Exact files/directories to copy
cp -r [source-path] blackbox4/[destination-path]
```

### Files to Adapt

```bash
# Files that need modifications before use
# Describe what changes are needed
```

### Code Patterns to Replicate

```python
# Show key patterns with code examples
# Explain what the pattern does
# How it could be implemented in Blackbox4
```

---

## What NOT to Copy

### Code to Avoid

[List components/code that should NOT be copied and why]

### Anti-Patterns

[Identify patterns in this framework that Blackbox4 should avoid]

---

## Comparative Analysis

### vs. Blackbox3

| Feature | {FRAMEWORK} | Blackbox3 | Better In |
|---------|-------------|-----------|-----------|
| [Feature 1] | [Description] | [Description] | [Framework/Blackbox3] |
| [Feature 2] | [Description] | [Description] | [Framework/Blackbox3] |

### vs. Oh-My-OpenCode

[Similar comparison table]

### vs. Other Frameworks

[Comparisons with other analyzed frameworks]

---

## Specific Research Questions Answered

### [Question 1 from research plan]
**Answer**: [Detailed answer with evidence]

### [Question 2 from research plan]
**Answer**: [Detailed answer with evidence]

[Repeat for all questions from the research plan]

---

## Code Examples

### Example 1: [Feature Name]

```python
# Actual code example from framework
# Explain what this does
# How could Blackbox4 use this?
```

### Example 2: [Feature Name]
[Repeat as needed]

---

## Recommendations Summary

### Must Adopt (Non-negotiable)

[List features/components that Blackbox4 should definitely adopt]

### Should Adopt (Strong recommendation)

[List features/components with strong recommendation]

### Could Adopt (Optional)

[List features/components that are optional but beneficial]

### Should NOT Adopt

[List features/components to avoid]

---

## Next Steps

### Immediate Actions (This Week)

1. [Action item 1]
2. [Action item 2]

### Short-term Actions (This Month)

1. [Action item]
2. [Action item]

### Long-term Actions (Next Quarter)

1. [Action item]
2. [Action item]

---

## Appendix

### A. File Structure

[Show complete file tree of the framework]

### B. Key Configuration Files

[List and explain important config files]

### C. Dependencies

[List all dependencies with versions]

### D. Known Issues

[List any known issues or limitations]

### E. Contact/Community

[Links to documentation, community, etc.]
```

---

## 2. Component Documentation

For each reusable component, create a component document:

**File Path**: `blackbox4/docs/components/{COMPONENT-NAME}.md`

**Format**:

```markdown
# {COMPONENT NAME}

**Source Framework**: [Framework Name]
**Original Location**: [path in original framework]
**Blackbox4 Location**: [path in blackbox4]
**Status**: [COPIED/ADAPTED/PENDING/SKIPPED]

---

## Purpose

[What this component does]

---

## How It Works

[Technical explanation]

---

## Dependencies

[List what this component needs]

---

## Usage Example

```bash
# How to use this component
```

---

## Integration Notes

[Any special considerations for integration]

---

## Testing

[How to test this component]

---

## Maintenance Notes

[Any notes for future maintenance]
```

---

## 3. Action Plan Document

For implementation guidance, create action plans:

**File Path**: `blackbox4/docs/action-plans/{FRAMEWORK}-integration.md`

**Format**:

```markdown
# {FRAMEWORK} Integration Action Plan

**Status**: [PLANNED/IN_PROGRESS/COMPLETE]
**Priority**: [HIGH/MEDIUM/LOW]
**Estimated Effort**: [X hours/days/weeks]

---

## Phase 1: Assessment (1-2 days)

- [ ] Download and analyze framework
- [ ] Document core components
- [ ] Identify reusable code
- [ ] Create component list

**Deliverables**:
- Framework analysis report
- Component inventory

---

## Phase 2: Selection (1 day)

- [ ] Prioritize components by impact/effort
- [ ] Create integration roadmap
- [ ] Define acceptance criteria

**Deliverables**:
- Prioritized component list
- Integration roadmap

---

## Phase 3: Integration (X days)

- [ ] Copy/adapt components
- [ ] Update paths and references
- [ ] Test integration
- [ ] Document changes

**Deliverables**:
- Integrated components
- Test results
- Updated documentation

---

## Phase 4: Validation (1-2 days)

- [ ] Run Blackbox3 tests
- [ ] Validate new functionality
- [ ] Performance testing

**Deliverables**:
- Test reports
- Performance metrics

---

## Progress Tracking

| Task | Status | Date | Notes |
|------|--------|------|-------|
| [Task 1] | [PENDING/COMPLETE] | [Date] | [Notes] |
| [Task 2] | [PENDING/COMPLETE] | [Date] | [Notes] |
```

---

## 4. Code Files to Create/Modify

### Bash Scripts

All bash scripts must:
- Use `#!/usr/bin/env bash` shebang
- Include error handling (`set -euo pipefail`)
- Have inline comments explaining purpose
- Follow Blackbox3 script conventions

Example:

```bash
#!/usr/bin/env bash
# Script: script-name.sh
# Purpose: [One-line description]
# Usage: ./script-name.sh [args]

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLACKBOX4_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Functions
function main() {
    # Main logic here
    echo "Doing work..."
}

# Execute
main "$@"
```

### Python Scripts

All Python scripts must:
- Include docstrings
- Use type hints where appropriate
- Follow PEP 8
- Handle errors gracefully

Example:

```python
#!/usr/bin/env python3
"""
Script: script_name.py
Purpose: [One-line description]
Usage: python script_name.py [args]
"""

from typing import Optional
import sys

def main(args: list[str]) -> Optional[int]:
    """Main function."""
    # Logic here
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

### Markdown Files

All markdown files must:
- Use consistent heading hierarchy
- Include frontmatter with metadata (status, last updated, etc.)
- Use code blocks with language specifications
- Link to related documents

---

## 5. File Naming Conventions

### Scripts
- Lowercase with hyphens: `check-blackbox.sh`, `validate-docs.py`
- Descriptive names: `bmad-phase-tracker.sh`

### Documentation
- Title case: `Framework-Analysis.md`
- Kebab-case for filenames: `ohmyopencode-analysis.md`

### Directories
- Lowercase: `agents/`, `scripts/`, `docs/`
- Descriptive: `research/`, `frameworks/`, `action-plans/`

---

## 6. Version Control Integration

### Commit Message Format

```
[TYPE]: brief description

Detailed explanation if needed.

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation update
- refactor: Code refactoring
- test: Test changes
- chore: Maintenance tasks
```

### Branch Naming

```
feature/{framework}-integration
fix/{issue-description}
docs/{documentation-update}
```

---

## 7. Quality Standards

### Code Quality

- All code must pass linting (flake8 for Python, shellcheck for bash)
- All functions must have tests (where applicable)
- All changes must be documented

### Documentation Quality

- All changes must be documented in README
- All new components must have usage examples
- All APIs must be documented

### Testing Standards

- Unit tests for all new code
- Integration tests for new features
- Performance tests for critical paths

---

## 8. Communication with Orchestrator

### Status Updates

Research agents must report status to orchestrator using this format:

```json
{
  "agent": "Research Agent Name",
  "framework": "Framework Name",
  "phase": "Research Phase",
  "progress": 0-100,
  "status": "IN_PROGRESS/BLOCKED/COMPLETE",
  "deliverables": ["list", "of", "deliverables"],
  "blockers": ["any blockers"],
  "next_steps": ["next actions"],
  "timestamp": "ISO-8601"
}
```

### Deliverable Handoff

When research is complete, agents must provide:

1. **Framework Analysis Report**: Complete markdown document
2. **Component Inventory**: List of all components with metadata
3. **Integration Plan**: Action plan for Blackbox4
4. **Code Samples**: Relevant code examples
5. **Risk Assessment**: Potential risks and mitigations

---

## 9. Success Criteria

A research task is complete when:

- ✅ All research questions answered
- ✅ Framework analysis report complete
- ✅ Component inventory finalized
- ✅ Integration plan created
- ✅ All deliverables in correct format
- ✅ Code examples provided
- ✅ Risks documented
- ✅ Recommendations clear and actionable

---

## 10. Common Patterns to Follow

### Pattern 1: Code Discovery

When analyzing a framework:

1. Start with README and documentation
2. Identify entry points (main files)
3. Map out directory structure
4. Identify core components
5. Analyze dependencies
6. Look for reusable patterns
7. Document findings

### Pattern 2: Component Evaluation

For each component:

1. Identify purpose
2. Analyze implementation
3. Estimate complexity
4. Evaluate reusability
5. Assess integration effort
6. Document risks
7. Provide recommendation

### Pattern 3: Documentation

When documenting:

1. Be specific and technical
2. Provide code examples
3. Include file paths
4. Estimate efforts
5. Be honest about limitations
6. Provide clear recommendations

---

## Appendix: Blackbox4-Specific Requirements

### MCP Integration

Blackbox4 uses MCP (Model Context Protocol) servers:

- **Config File**: `blackbox4/.opencode/mcp-servers.json`
- **Format**: Standard MCP server configuration
- **Integration**: Copy as-is, update paths

### Agent System

Blackbox4 uses enhanced agents from Oh-My-OpenCode:

- **Registry**: `blackbox4/agents/_registry.yaml`
- **Definitions**: `blackbox4/agents/_core/`
- **Skills**: `blackbox4/agents/.skills/`

### Memory System

Blackbox4 uses 3-tier memory:

1. **Short-term**: `.memory/short-term/`
2. **Medium-term**: `.memory/medium-term/`
3. **Long-term**: `.memory/long-term/` (ChromaDB)

### Ralph Integration

Blackbox4 uses Ralph as external dependency:

- **Location**: `blackbox4/ralph/`
- **Status**: Already integrated
- **Action**: Keep as-is

---

**Last Updated**: 2026-01-15
**Status**: ✅ ACTIVE - Use this format for all research outputs
