# File Naming Conventions

**Project**: SISO Internal
**Version**: 2.0
**Updated**: 2026-01-19

---

## Overview

This document defines the naming conventions for all files in the project memory system. Consistent naming helps agents find files by pattern and maintains organization.

---

## Task Files

### Format
```
TASK-YYYY-MM-DD-NNN.md
```

### Components
- `TASK` - Literal prefix
- `YYYY` - Year (4 digits)
- `MM` - Month (2 digits, zero-padded)
- `DD` - Day (2 digits, zero-padded)
- `NNN` - Sequential task number (3 digits, zero-padded)

### Examples
```
TASK-2026-01-18-001.md
TASK-2026-01-18-002.md
TASK-2026-01-19-001.md
```

### Location
- Active: `tasks/active/`
- Completed: `tasks/completed/`
- Working: `tasks/working/{task-slug}/`

---

## Decision Files

### Format
```
DEC-YYYY-MM-DD-{type}-{slug}.md
```

### Components
- `DEC` - Literal prefix
- `YYYY-MM-DD` - Date
- `{type}` - Decision type: `arch` (architectural), `scope` (scope), `tech` (technical)
- `{slug}` - Short descriptive slug (kebab-case)

### Examples
```
DEC-2026-01-19-arch-user-profile.md
DEC-2026-01-19-tech-auth-flow.md
DEC-2026-01-19-social-features.md
```

### Location
- Architectural: `decisions/architectural/`
- Scope: `decisions/scope/`
- Technical: `decisions/technical/`

---

## Research Files

### Format
Research is organized by topic folder with standardized files:

```
research/active/{topic}/
├── metadata.yaml
├── STACK.md
├── FEATURES.md
├── ARCHITECTURE.md
├── PITFALLS.md
└── SUMMARY.md
```

### Components
- `{topic}` - Feature/research topic (kebab-case)
- Files are always uppercase (4D research: STACK, FEATURES, ARCHITECTURE, PITFALLS)

### Examples
```
research/active/user-profile/
research/active/github-integration/
research/active/analytics-dashboard/
```

### Location
- Active: `knowledge/research/active/{topic}/`
- Archived: `knowledge/research/archived/{topic}/`

---

## Epic Files

### Format
```
{epic-slug}/
├── metadata.yaml
├── epic.md
├── ARCHITECTURE.md
├── first-principles.md
├── TASK-BREAKDOWN.md
├── TASK-SUMMARY.md
├── INDEX.md
├── README.md
└── 001.md through 018.md (individual tasks)
```

### Components
- `{epic-slug}` - Feature slug (kebab-case)
- Task files are numbered: `001.md`, `002.md`, etc. (3 digits, zero-padded)

### Examples
```
plans/active/user-profile/
plans/active/github-integration/
plans/active/analytics-redesign/
```

### Location
- Active: `plans/active/{epic-slug}/`
- Archived: `plans/archived/{epic-slug}.md`

---

## PRD Files

### Format
```
{prd-slug}.md
```

### Components
- `{prd-slug}` - Feature slug (kebab-case)

### Examples
```
user-profile.md
github-integration.md
analytics-dashboard.md
```

### Location
- Active: `plans/prds/active/`
- Backlog: `plans/prds/backlog/`
- Completed: `plans/prds/completed/`

---

## YAML Configuration Files

### Format
```
{filename}.yaml
```

### Root-Level Files
- `CODE-INDEX.yaml` - Global code index
- `FEATURE-BACKLOG.yaml` - Feature tracking
- `TEST-RESULTS.yaml` - Test results
- `_NAMING.md` - This file (naming conventions)

### Project Metadata
Located in `project/_meta/`:
- `context.yaml` - Project context
- `project.yaml` - Project metadata
- `timeline.yaml` - Timeline and milestones

---

## Domain Files

### Format
Each domain has standardized files:

```
{domain}/
├── DOMAIN-CONTEXT.md
├── FEATURES.md
├── COMPONENTS.md
├── PAGES.md
└── REFACTOR-HISTORY.md
```

### Components
- `{domain}` - Domain name (kebab-case)
- Files are uppercase (except DOMAIN-CONTEXT.md which has a hyphen)

### Examples
```
admin/DOMAIN-CONTEXT.md
admin/FEATURES.md
lifelock/COMPONENTS.md
```

### Location
- Domains: Root level (when content exists)

---

## Agent Session Files

### Format
```
{agent-name}/
├── session.json
├── context.json
├── insights.json
└── sessions.json
```

### Components
- `{agent-name}` - Agent identifier (kebab-case)
- Files are lowercase JSON

### Examples
```
operations/agents/history/sessions/backend-developer/session.json
operations/agents/history/sessions/frontend-developer/context.json
```

### Location
- Active: `operations/agents/active/{agent-name}/`
- History: `operations/agents/history/sessions/{agent-name}/`

---

## General Conventions

### Case
- **File extensions**: Always lowercase (`.md`, `.yaml`, `.json`)
- **File names**: Use kebab-case for multi-word names (`user-profile.md`)
- **Constants/Folders**: Use UPPERCASE for standard names (`README.md`, `DOMAIN-CONTEXT.md`)

### Special Characters
- Use hyphens (`-`) for multi-word names: `user-profile.md`
- Use underscores (`_`) for prefixes and special files: `_meta/`, `_template.md`, `_NAMING.md`
- Use dots (`.`) for file extensions only

### Numbers
- Pad numbers to 3 digits for sorting: `001.md`, `002.md`
- Use ISO 8601 dates: `2026-01-19`

### Prefixes
- `TASK-` - Task files
- `DEC-` - Decision files
- `_` - Special/system files (not content)

---

## Templates

Template files use `_template` prefix:

```
_template.md
_template.yaml
_template-task.md
```

### Location
Templates are co-located with their usage:
- Task template: `tasks/working/_template/task.md`
- PRD template: `plans/prds/active/_template.md`
- Agent session template: `operations/agents/active/_template/session.json`

---

## Forbidden Patterns

### Don't Use
- Spaces in filenames: `user profile.md` ❌
- CamelCase: `UserProfile.md` ❌
- Snake_case (except for prefixes): `user_profile.md` ❌
- Inconsistent padding: `task-1.md`, `task-01.md`, `task-001.md` ❌

### Use Instead
- Kebab-case: `user-profile.md` ✅
- Consistent padding: `task-001.md` ✅
- Standard prefixes: `TASK-2026-01-19-001.md` ✅

---

## Migration

When renaming existing files, consider:
1. **Backlinks**: Check if other files reference the old name
2. **Git history**: Preserve history with `git mv`
3. **Update references**: Search for old filename and update links

---

## Related Documentation

- `README.md` - Project overview
- `project/_meta/context.yaml` - Project context
- `project/_meta/project.yaml` - Project metadata

---

**Questions?** See the main README.md or project context for more information.
