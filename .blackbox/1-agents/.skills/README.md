# Skills Organization - Complete Structure

## Overview

All skills are organized into **8 purpose-based categories**. Each skill has its own folder with:
- `SKILL.md` - Complete documentation with YAML frontmatter
- `scripts/` - Optional supporting scripts and utilities

## Category Structure

```
.skills/
├── development/           # Coding practices & methodologies
├── mcp-integrations/      # Model Context Protocol server integrations
├── git-workflow/          # Git operations & version control
├── documentation/         # Documentation & technical writing
├── testing/               # Testing & quality assurance
├── automation/            # Automation & scripting
├── collaboration/         # Team collaboration & code review
└── thinking/              # Problem solving & planning
```

## Skills by Category

### 🛠️ Development
Coding practices, methodologies, and development workflows.

| Skill | Description |
|-------|-------------|
| `test-driven-development/` | RED-GREEN-REFACTOR cycle for bulletproof code |

### 🔌 MCP Integrations
Model Context Protocol server integrations for extending Claude's capabilities.

| Skill | Description |
|-------|-------------|
| `supabase/` | Supabase database and authentication integrations |
| `shopify/` | Shopify e-commerce platform integration |
| `github/` | GitHub API and repository operations |
| `serena/` | Serena semantic coding tools |
| `chrome-devtools/` | Chrome DevTools integration for web debugging |
| `playwright/` | Playwright browser automation and testing |
| `filesystem/` | File system operations and management |
| `sequential-thinking/` | Sequential reasoning and thought processes |
| `siso-internal/` | Internal SISO tools and workflows |
| `artifacts-builder/` | Build HTML artifacts with React & Tailwind |
| `docx/` | Microsoft Word document processing |
| `pdf/` | PDF document extraction and manipulation |
| `mcp-builder/` | Create custom MCP servers |

### 🌿 Git Workflow
Git operations, version control, and branching strategies.

| Skill | Description |
|-------|-------------|
| `using-git-worktrees/` | Parallel development with git worktrees |

### 📚 Documentation
Documentation generation, routing, and technical writing.

| Skill | Description |
|-------|-------------|
| `docs-routing/` | Intelligent documentation routing |
| `feedback-triage/` | Feedback categorization and routing |

### 🧪 Testing
Testing methodologies, debugging, and quality assurance.

| Skill | Description |
|-------|-------------|
| `systematic-debugging/` | Four-phase root cause analysis process |

### ⚙️ Automation
Automation scripts, CLI tools, and operational workflows.

| Skill | Description |
|-------|-------------|
| `github-cli/` | GitHub command-line interface operations |
| `long-run-ops/` | Long-running operation management |
| `ui-cycle/` | UI development cycle automation |

### 🤝 Collaboration
Code review, team workflows, and collaboration tools.

| Skill | Description |
|-------|-------------|
| `notifications-local/` | Local notification systems |
| `notifications-mobile/` | Mobile notification handling |
| `notifications-telegram/` | Telegram bot notifications |
| `requesting-code-review/` | PR preparation and code review workflows |
| `skill-creator/` | Create and maintain skills |
| `subagent-driven-development/` | Multi-agent development workflows |

### 🧠 Thinking
Problem-solving frameworks, planning methodologies, and research.

| Skill | Description |
|-------|-------------|
| `deep-research/` | In-depth research methodologies |
| `first-principles-thinking/` | First-principles problem solving |
| `intelligent-routing/` | Smart task and context routing |
| `writing-plans/` | Implementation planning and documentation |

## Skill Structure

Each skill follows this format:

```
skill-name/
├── SKILL.md       # Main skill documentation
└── scripts/       # Optional: Supporting scripts
```

### SKILL.md Format

```markdown
---
name: skill-name
category: development|mcp-integrations|git-workflow|documentation|testing|automation|collaboration|thinking
version: 1.0.0
description: One-line summary
author: source
verified: true
tags: [tag1, tag2, tag3]
---

# Skill Name

## Overview
[What it does]

## When to Use This Skill
✅ Use case 1
✅ Use case 2

## How It Works
[Implementation details]

## Usage Examples
[Concrete examples]

## Best Practices
[Guidelines]

## Common Mistakes
❌ What to avoid

## Integration with Claude
[How Claude uses it]
```

## Usage

Skills are automatically loaded by Claude when relevant context is detected. Examples:

- **Development**: "Let's use TDD to build this feature"
- **MCP**: "Create an MCP server for the GitHub API"
- **Git**: "Set up worktrees for parallel development"
- **Testing**: "Help me debug this systematically"
- **Collaboration**: "Prepare this PR for review"
- **Thinking**: "Create a detailed implementation plan"

## Adding New Skills

1. **Choose the appropriate category** based on the skill's primary purpose
2. **Create a skill folder**:
   ```bash
   mkdir -p .skills/category-name/my-new-skill/scripts
   ```
3. **Create SKILL.md** with proper YAML frontmatter
4. **Add any supporting scripts** to the `scripts/` folder
5. **The skill will be automatically available** to Claude

## Category Guidelines

### Development
- Coding practices and methodologies
- Development workflows
- Programming techniques
- Code quality practices

### MCP Integrations
- All MCP server integrations
- External API connections
- Database integrations
- Tool implementations

### Git Workflow
- Git operations
- Version control workflows
- Branching strategies
- Repository management

### Documentation
- Documentation generation
- Technical writing
- API documentation
- Knowledge management

### Testing
- Testing methodologies
- Debugging processes
- Quality assurance
- Test automation

### Automation
- Scripting and automation
- CLI tools
- Operational workflows
- Task automation

### Collaboration
- Code review processes
- Team workflows
- Communication tools
- Project management

### Thinking
- Problem-solving frameworks
- Planning methodologies
- Research techniques
- Decision-making processes

## Statistics

- **Total Skills**: 33
- **Categories**: 8
- **MCP Integrations**: 13
- **New Skills from awesome-claude-skills**: 11

## Credits

### Original Sources
- **obra/superpowers** - TDD, debugging, git workflows, planning
- **anthropics/skills** - Official MCP and document processing skills
- **awesome-claude-skills** - Curated collection by karanb192

### Blackbox4 Integration
Reorganized and integrated into Blackbox4 agents system with:
- Purpose-based categorization
- Standardized skill structure
- Comprehensive documentation
- Ready-to-use integration

---

**Organization**: Purpose-based categories for better discoverability
**Structure**: Individual folders with SKILL.md and scripts/
**Last Updated**: 2025-01-15
**Status**: ✅ Complete and ready for use
