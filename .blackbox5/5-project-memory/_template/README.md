# Project Template

**Status**: Template
**Version**: 2.0 (7-Folder Structure)
**Updated**: 2026-01-19

---

## Overview

This is the project template for the **optimized 7-folder project memory structure**. All new projects should be initialized from this template.

## The 7-Folder Structure

Organized by how AI agents think - by question type, not file type.

```
_template/
├── 1. project/           # Project identity & direction
│   ├── context.yaml      # Project context (goals, constraints, scope)
│   ├── project.yaml      # Project metadata
│   ├── timeline.yaml     # Timeline & milestones
│   ├── directions/       # Roadmap, strategy, vision
│   └── goals/            # Current goals, metrics
│
├── 2. plans/             # What we're building
│   ├── active/           # Active plans (epics, features)
│   ├── archived/         # Completed/archived plans
│   ├── briefs/           # Product briefs
│   ├── features/         # Feature management
│   ├── prds/             # Product requirements
│   │   ├── active/
│   │   ├── backlog/
│   │   └── completed/
│   └── feature_backlog.yaml
│
├── 3. decisions/         # Why we're doing it this way
│   ├── architectural/    # Architectural decisions
│   ├── scope/            # Scope decisions
│   └── technical/        # Technical decisions
│
├── 4. knowledge/         # How it works + what we've learned
│   ├── artifacts/        # Completed work outputs
│   ├── codebase/         # Code patterns and gotchas
│   ├── graph/            # Knowledge graph (entities, relationships, embeddings)
│   └── research/         # Research findings
│       └── active/       # Active research
│
├── 5. tasks/             # What we're working on
│   ├── active/           # Active tasks
│   ├── completed/        # Completed tasks
│   ├── working/          # Working task folders
│   ├── archived/         # Old completed tasks
│   └── working-archive/  # Additional archive
│
├── 6. domains/           # How it's organized (10 domains)
│   ├── admin/
│   ├── analytics/
│   ├── clients/
│   ├── financials/
│   ├── lifelock/
│   ├── partners/
│   ├── projects/
│   ├── resources/
│   ├── tasks/
│   └── xp-store/
│
├── 7. operations/        # System operations
│   ├── agents/           # Agent memory
│   ├── architecture/     # Architecture validation
│   ├── docs/             # System documentation (engine/arch docs)
│   ├── github/           # GitHub integration
│   ├── logs/             # System logs
│   ├── sessions/         # Session transcripts
│   └── workflows/        # Workflow execution
│
└── CODE-INDEX.yaml       # Global code index
```

## Usage

### Creating a New Project

1. Copy this template to a new directory
2. Rename `_template/` to your project name
3. Fill in `project/context.yaml`, `project/project.yaml`, `project/timeline.yaml`
4. Start working!

### Initializing from Command Line (Future)

```bash
# Future command to initialize a new project
pm:init <project-name>
```

This will:
- Copy the template to a new directory
- Set up project.yaml and context.yaml
- Create initial directory structure
- Print next steps

## The 7 Folders Explained

### 1. `project/` - Project Identity & Direction
**Question**: "What is this project?"

Contains:
- `context.yaml` - Project context (goals, constraints, scope, stakeholders)
- `project.yaml` - Project metadata (name, version, team, progress)
- `timeline.yaml` - Timeline, milestones, events
- `directions/` - Strategic direction (roadmap, strategy, vision)
- `goals/` - Current goals and metrics

### 2. `plans/` - What We're Building
**Question**: "What are we building?"

Contains:
- `active/` - Active plans (epics, features in development)
- `archived/` - Completed/archived plans
- `briefs/` - Product briefs
- `features/` - Feature management (backlog, planned, under-consideration)
- `prds/` - Product requirements (active, backlog, completed)
- `feature_backlog.yaml` - Feature tracking

### 3. `decisions/` - Why This Approach
**Question**: "Why are we doing it this way?"

Contains:
- `architectural/` - Architectural decisions
- `scope/` - Scope decisions (in/out of scope)
- `technical/` - Technical decisions (tech choices, patterns)

### 4. `knowledge/` - How It Works + Learnings
**Question**: "How does it work? What have we learned?"

Contains:
- `artifacts/` - Completed work outputs (architecture specs, dev records)
- `codebase/` - Code knowledge (index, patterns, gotchas)
- `graph/` - Knowledge graph (entities, relationships, embeddings)
- `research/` - Research findings (active research)

### 5. `tasks/` - What We're Working On
**Question**: "What are we working on right now?"

Contains:
- `active/` - Active task files
- `completed/` - Completed tasks
- `working/` - Working task folders (with progress)
- `archived/` - Old completed tasks
- `working-archive/` - Additional archive

### 6. `domains/` - How It's Organized
**Question**: "How is the project organized?"

Contains 10 domains (each with context files):
- `admin/` - Admin domain
- `analytics/` - Analytics domain
- `clients/` - Clients domain
- `financials/` - Financials domain
- `lifelock/` - LifeLock domain
- `partners/` - Partners domain
- `projects/` - Projects domain
- `resources/` - Resources domain
- `tasks/` - Tasks domain
- `xp-store/` - XP Store domain

### 7. `operations/` - System Operations
**Question**: "How does the AI system run?"

Contains:
- `agents/` - Agent memory (active, history)
- `architecture/` - Architecture validation
- `docs/` - System documentation (engine/arch docs)
- `github/` - GitHub integration (issues, PRs, sync history)
- `logs/` - System logs
- `sessions/` - Session transcripts
- `workflows/` - Workflow execution (active, history)

## Templates

### Project Templates
- `project/context.yaml.template` - Project context template
- `project/project.yaml.template` - Project metadata template
- `project/timeline.yaml.template` - Timeline template

### PRD Template
Located in `plans/prds/active/_template.md`

### Task Templates
- `tasks/working/_template/task.md` - Task template

### Agent Session Template
- `operations/agents/active/_template/session.json` - Agent session template

### Decision Templates
Located in `decisions/` subfolders

## Best Practices

1. **Start from Template**: Always use this template for new projects
2. **Fill in Metadata**: Complete project/context/timeline YAML files first
3. **Follow the Workflow**: Research → PRD → Epic → Tasks → GitHub
4. **Document Everything**: Use templates consistently
5. **Update Regularly**: Keep metadata and context current

## Benefits of 7-Folder Structure

1. **AI-Optimized** - Organized by how agents search for information (by question type)
2. **Zero Redundancy** - No duplicate folders or files
3. **Active Work Accessible** - Active plans, research, and tasks are easy to find
4. **Maintainable** - Clear where new content goes
5. **Scalable** - Easy to grow with the project

## Related Documentation

- `.blackbox5/5-project-memory/REORGANIZATION-COMPLETE.md` - Complete reorganization details
- `.blackbox5/5-project-memory/OPTIMIZED-REORGANIZATION.md` - Design rationale

## Version History

- **v2.0** (2026-01-19): Reorganized to 7-folder structure
- **v1.0** (2026-01-18): Initial template
