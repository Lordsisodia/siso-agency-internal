# Contributing to Blackbox4

**Version:** 1.0.0
**Last Updated:** 2026-01-15

---

## Overview

Blackbox4 is a local-first AI agent orchestration system. We welcome contributions that improve the system's capabilities, documentation, or usability.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Adding Agents](#adding-agents)
4. [Adding Skills](#adding-skills)
5. [Adding Modules](#adding-modules)
6. [Documentation Standards](#documentation-standards)
7. [Testing](#testing)
8. [Code Style](#code-style)
9. [Pull Request Process](#pull-request-process)
10. [Community Guidelines](#community-guidelines)

---

## Getting Started

### Prerequisites

1. **Claude Code CLI** - Install from [claude.ai/code](https://claude.ai/code)
2. **Bash 4.0+** - For script execution
3. **Read DEPENDENCIES.md** - Full dependency list

### First-Time Setup

```bash
# Clone the repository
git clone <repository-url>
cd Blackbox4

# Verify dependencies
cd .blackbox4
./4-scripts/check-dependencies.sh

# Validate structure
./4-scripts/validate-structure.sh
```

### Development Environment

**Recommended:**
- VS Code with Claude Code extension
- macOS 13+ or Ubuntu 22.04+
- 16GB RAM minimum (for Claude models)

**Optional:**
- iTerm2 with shell integration
- jq and yq for JSON/YAML processing

---

## Development Workflow

### 1. Create a Plan

Before making changes, create a plan:

```bash
cd .blackbox4
./4-scripts/new-plan.sh "Brief description of work"
```

This creates a plan directory in `.plans/active/`.

### 2. Work in Your Plan Directory

```bash
cd .plans/active/YYYY-MM-DD_HHMM_your-goal/
# Edit README.md, checklist.md, status.md
```

### 3. Make Changes

Follow the conventions in this document for your changes.

### 4. Test

```bash
cd .blackbox4
./4-scripts/validate-structure.sh  # Structure validation
./8-testing/run-tests.sh           # Run tests (if applicable)
```

### 5. Update Documentation

Update relevant documentation:
- Agent: `.docs/3-components/agents/`
- Skill: `.docs/3-components/skills/`
- Module: `.docs/3-components/modules/`

### 6. Commit

```bash
git add .
git commit -m "feat: description of changes

- Added new agent: X
- Updated documentation: Y
- Fixed bug: Z"
```

---

## Adding Agents

### Agent Categories

Choose the appropriate category:

| **Category** | **Purpose** |
|--------------|-------------|
| `1-core/` | Core agent system components |
| `2-bmad/` | BMAD methodology agents |
| `3-research/` | Research and exploration agents |
| `4-specialists/` | Specialist agents (Ralph, etc.) |
| `5-enhanced/` | Enhanced AI agents (Oracle, Librarian, Explore) |

### Agent Template

Use the agent template:

```bash
cd .blackbox4
./4-scripts/new-agent.sh <category> <agent-name>
```

Or manually create:

```markdown
# Agent Name

**Agent ID:** `agent-name`
**Icon:** 🤖
**Model:** claude-opus-4.5 or claude-sonnet-4.5

## Overview

Brief description of what this agent does.

## Capabilities

1. **Capability 1** - Description
2. **Capability 2** - Description
3. **Capability 3** - Description

## When to Use

Trigger this agent when you need:
- "specific trigger phrase 1"
- "specific trigger phrase 2"
- "specific trigger phrase 3"

## Usage

```bash
# In your plan directory
"Read: 1-agents/<category>/agent-name.md"
"Your task description here"
```

## Configuration

No special configuration required.

## See Also

- [Related Agent](../other-agent.md)
- [Documentation](../../../../.docs/3-components/agents/agent-name.md)
```

### Agent Guidelines

1. **Agent ID**: Use lowercase, hyphenated format: `my-agent`
2. **Icon**: Use a single emoji that represents the agent
3. **Model**: Choose appropriate model
   - **Opus 4.5**: Strategic tasks, complex reasoning
   - **Sonnet 4.5**: Standard tasks, research
   - **Haiku 4.0**: Fast, simple tasks
4. **Capabilities**: List 3-7 specific capabilities
5. **Triggers**: Provide 3-5 specific trigger phrases

### Example: Adding a Research Agent

```bash
# Create agent
cat > 1-agents/3-research/web-scraper.md << 'EOF'
# Web Scraper

**Agent ID:** `web-scraper`
**Icon:** 🕷️
**Model:** claude-sonnet-4.5

## Overview

Extracts structured data from web pages.

## Capabilities

1. **HTML Parsing** - Extract data from HTML
2. **Content Extraction** - Remove boilerplate, keep content
3. **Data Cleaning** - Normalize and format extracted data

## When to Use

Trigger this agent when you need:
- "scrape website"
- "extract data from webpage"
- "collect structured web data"
EOF
```

---

## Adding Skills

### Skill Categories

| **Category** | **Purpose** |
|--------------|-------------|
| `1-core/` | Core Blackbox4 skills |
| `2-mcp/` | MCP server integration skills |
| `3-workflow/` | Multi-step workflow skills |

### Skill Template

Create skill markdown file:

```markdown
# Skill Name

**Skill ID:** `skill-name`
**Category:** core|mcp|workflow
**MCP Server:** (for MCP skills only)

## Description

What this skill does.

## Usage

```bash
# Use in agent prompt
"Use skill: skill-name"
"Execute skill-name with parameters: X"
```

## Parameters

| **Parameter** | **Type** | **Required** | **Description** |
|---------------|----------|--------------|-----------------|
| param1 | string | Yes | Description |
| param2 | number | No | Description |

## Example

```
User: "Execute skill-name with param1=value"
Agent: [Uses skill-name to...]
```

## See Also

- [Related Skill](../other-skill.md)
- [MCP Documentation](../../../../.docs/3-components/mcp/skill-name.md)
```

---

## Adding Modules

### Module Structure

Modules go in `3-modules/`:

```
3-modules/
└── your-module/
    ├── README.md
    ├── agents/              # Module-specific agents
    ├── skills/              # Module-specific skills
    ├── templates/           # Module templates
    └── tests/               # Module tests
```

### Module README Template

```markdown
# Module Name

**Module ID:** `module-name`
**Version:** 1.0.0

## Purpose

What this module provides.

## Components

### Agents
- `agent1.md` - Description
- `agent2.md` - Description

### Skills
- `skill1.md` - Description
- `skill2.md` - Description

## Usage

```bash
# Load module
"Load module: module-name"
"Use module-name agent: agent1"
```

## Dependencies

- MCP Server: X (required)
- External tool: Y (optional)

## See Also

- [Module Documentation](../../../../.docs/3-components/modules/module-name.md)
```

---

## Documentation Standards

### README.md Requirements

Every directory must have a `README.md` that answers:

1. **What?** - What is this directory/component?
2. **Why?** - Why does it exist?
3. **How?** - How do I use it?
4. **Where?** - Where does it fit in the system?
5. **Warning?** - Any cautions or restrictions?

### Documentation Structure

```
.docs/
├── INDEX.md                     # Start here
├── 1-getting-started/          # New user guides
├── 2-reference/                # Technical reference
│   ├── DEPENDENCIES.md         # This file
│   └── AGENT-REFERENCE.md      # All agents
├── 3-components/               # Component docs
│   ├── agents/                 # Agent documentation
│   ├── skills/                 # Skill documentation
│   └── modules/                # Module documentation
├── 4-frameworks/               # Framework docs
├── 5-workflows/                # Workflow guides
└── 6-archives/                 # Historical docs
```

### Writing Style

- **Concise**: 20-80 lines per README
- **Clear**: Use simple language
- **Actionable**: Include examples
- **Linked**: Use relative links to related docs

---

## Testing

### Structure Validation

Always run structure validation:

```bash
cd .blackbox4
./4-scripts/validate-structure.sh
```

### Agent Testing

When adding agents:

1. **Manual Testing**: Run agent in Claude Code CLI
2. **Test Cases**: Create test cases in `8-testing/agents/`
3. **Documentation**: Update agent docs

### Script Testing

When adding scripts:

1. **Syntax Check**: `bash -n script.sh`
2. **ShellCheck**: `shellcheck script.sh` (if installed)
3. **Manual Test**: Run script with various inputs

---

## Code Style

### Bash Scripts

Follow these conventions:

```bash
#!/bin/bash
#
# Brief description of script
#

# Use set -euo pipefail for safety
set -euo pipefail

# Constants
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors (optional)
GREEN='\033[0;32m'
NC='\033[0m'

# Functions (snake_case)
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Main logic
main() {
    log_info "Starting..."
}

main "$@"
```

### Markdown Files

- **Line Length**: 100 characters (soft limit)
- **Headers**: Use `#`, `##`, `###` (no more than 4 levels)
- **Lists**: Use `-` for bullets
- **Code Blocks**: Specify language: \```bash
- **Links**: Use relative links for internal docs

### File Naming

- **Agents**: `kebab-case.md` (e.g., `web-scraper.md`)
- **Scripts**: `kebab-case.sh` (e.g., `new-agent.sh`)
- **Directories**: `kebab-case` (e.g., `web-scraper/`)
- **Skills**: `kebab-case.md` (e.g., `data-fetch.md`)

---

## Pull Request Process

### Before Submitting

1. **Update Documentation**: Ensure all README.md files are updated
2. **Run Validation**: `./4-scripts/validate-structure.sh`
3. **Test Changes**: Manual testing of new features
4. **Check Style**: Follow code style guidelines

### PR Title Format

Use conventional commits:

```
feat: add new agent for web scraping
fix: correct Ralph runtime state management
docs: update CONTRIBUTING.md with new guidelines
refactor: reorganize skill categories
test: add agent validation tests
```

### PR Description Template

```markdown
## Summary
Brief description of changes.

## Changes
- Added X
- Updated Y
- Fixed Z

## Testing
- Manual testing: [describe]
- Automated tests: [describe]

## Documentation
- Updated: [files]
- Added: [files]

## Checklist
- [ ] All README.md files updated
- [ ] Structure validation passes
- [ ] Code style guidelines followed
- [ ] Documentation updated
```

---

## Community Guidelines

### Be Respectful

- Use inclusive language
- Provide constructive feedback
- Assume good intentions

### Be Helpful

- Answer questions in issues
- Review PRs when you can
- Improve documentation

### Be Professional

- Follow the code of conduct
- No harassment or discrimination
- Respect privacy and confidentiality

---

## Getting Help

### Documentation

- [Getting Started](../../.docs/1-getting-started/)
- [Reference](../../.docs/2-reference/)
- [Component Docs](../../.docs/3-components/)

### Issues

Report bugs or request features:
1. Check existing issues first
2. Use issue templates
3. Provide clear descriptions
4. Include steps to reproduce

### Discussions

Start a discussion for:
- Questions about usage
- Architecture discussions
- Feature proposals

---

## Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` - List of all contributors
- Release notes - For significant contributions
- Documentation - For documentation improvements

Thank you for contributing to Blackbox4! 🎉

---

**Last Updated:** 2026-01-15
**Maintainer:** Blackbox4 Team
