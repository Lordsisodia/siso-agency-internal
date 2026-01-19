# Skills Organization - Complete Structure

## Overview

All skills have been reorganized into individual folders following this structure:

```
skill-name/
├── SKILL.md       # Main skill documentation
└── scripts/       # Optional: Supporting scripts and utilities
```

## Directory Structure

```
.skills/
├── 1-core/                    # Core development practices
│   ├── test-driven-development/
│   │   ├── SKILL.md
│   │   └── scripts/
│   ├── systematic-debugging/
│   │   ├── SKILL.md
│   │   └── scripts/
│   └── using-git-worktrees/
│       ├── SKILL.md
│       └── scripts/
│
├── 2-mcp/                     # MCP integrations & tools
│   ├── mcp-builder/
│   │   ├── SKILL.md
│   │   └── scripts/
│   ├── artifacts-builder/
│   │   ├── SKILL.md
│   │   └── scripts/
│   ├── pdf/
│   │   ├── SKILL.md
│   │   └── scripts/
│   └── docx/
│       ├── SKILL.md
│       └── scripts/
│
└── 3-workflow/                # Workflow & collaboration
    ├── requesting-code-review/
    │   ├── SKILL.md
    │   └── scripts/
    ├── writing-plans/
    │   ├── SKILL.md
    │   └── scripts/
    ├── skill-creator/
    │   ├── SKILL.md
    │   └── scripts/
    └── subagent-driven-development/
        ├── SKILL.md
        └── scripts/
```

## Skills Summary

### 1-Core Skills (3)
1. **test-driven-development** - RED-GREEN-REFACTOR cycle for bulletproof code
2. **systematic-debugging** - Four-phase root cause analysis process
3. **using-git-worktrees** - Parallel development without context switching

### 2-MCP Skills (4)
1. **mcp-builder** - Build custom MCP servers for Claude
2. **artifacts-builder** - Build HTML artifacts with React & Tailwind
3. **pdf** - Extract text, tables, metadata from PDFs
4. **docx** - Create, edit, analyze Word documents

### 3-Workflow Skills (4)
1. **requesting-code-review** - Pre-review preparation with formatted diffs
2. **writing-plans** - Create detailed implementation strategies
3. **skill-creator** - Create reusable skills following best practices
4. **subagent-driven-development** - Quality-gated multi-agent workflows

## Usage

Skills are automatically loaded by Claude when relevant context is detected. Each skill contains:

- **SKILL.md**: Complete documentation with examples, best practices, and integration notes
- **scripts/**: Optional supporting scripts for automation or utilities

## Adding New Skills

To add a new skill:

1. Create a new folder in the appropriate category:
   ```bash
   mkdir -p .skills/1-core/my-new-skill/scripts
   ```

2. Create a SKILL.md file with proper YAML frontmatter:
   ```markdown
   ---
   name: my-new-skill
   category: core
   version: 1.0.0
   description: Brief description
   author: your-name
   verified: false
   tags: [tag1, tag2]
   ---

   # Skill Name
   ... documentation ...
   ```

3. Add any supporting scripts to the `scripts/` folder

4. The skill will be automatically available to Claude

## Credits

Skills imported from:
- **obra/superpowers** - Core TDD, debugging, and workflow skills
- **anthropics/skills** - Official MCP and document processing skills
- **awesome-claude-skills** - Curation by karanb192

---

**Total Skills**: 11
**Categories**: 3
**Organization**: Individual folders with SKILL.md and scripts/ subdirectories
**Last Updated**: 2025-01-15
