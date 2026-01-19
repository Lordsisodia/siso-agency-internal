# SISO Internal Project Memory

**Status**: Active
**Version**: 2.1 (6-Folder Structure)
**Updated**: 2026-01-19

---

## Overview

This is the project memory for **SISO Internal** - the internal development and features for the SISO ecosystem.

## Structure (6 Folders)

This memory is organized by how AI agents think - by question type, not file type.

```
siso-internal/
├── 1. decisions/          # Why we're doing it this way
├── 2. knowledge/          # How it works + what we've learned
├── 3. operations/         # System operations
├── 4. plans/              # What we're building
├── 5. project/            # Project identity & direction
├── 6. tasks/              # What we're working on
├── _NAMING.md             # File naming conventions
├── CODE-INDEX.yaml        # Global code index
├── FEATURE-BACKLOG.yaml   # Feature tracking
└── TEST-RESULTS.yaml      # Test results
```

## Quick Start for Agents

### Finding Information

**"What are we building?"**
- → `plans/active/user-profile/` - Active User Profile epic (27 files, 281 KB)
- → `plans/features/backlog.md` - Feature backlog
- → `plans/prds/active/` - Active PRDs

**"Why this approach?"**
- → `decisions/` - Architectural, scope, and technical decisions

**"How does it work?"**
- → `knowledge/codebase/code_index.md` - Code structure index
- → `knowledge/research/active/user-profile/` - Active User Profile research (6 files, 72 KB)
- → `operations/docs/` - System documentation (Brain/Engine architecture)

**"What are we working on?"**
- → `tasks/active/` - 5 active tasks (TASK-2026-01-18-001 through 005)

**"How does the AI system run?"**
- → `operations/` - Agent memory, architecture validation, GitHub integration, logs, sessions, workflows

### Key Files

**Project Metadata** (in `project/_meta/`):
- `project/_meta/context.yaml` - Project context (goals, constraints, scope, current focus)
- `project/_meta/project.yaml` - Project metadata (name, version, team, progress)
- `project/_meta/timeline.yaml` - Timeline, milestones, events

**Root-Level Files**:
- `CODE-INDEX.yaml` - Global code index
- `FEATURE-BACKLOG.yaml` - Feature tracking
- `TEST-RESULTS.yaml` - Test results
- `_NAMING.md` - File naming conventions

### Active Work

**User Profile Feature**
- Status: Planning complete, ready for development
- Research: `knowledge/research/active/user-profile/` (6 files, 72 KB)
- Epic: `plans/active/user-profile/` (27 files, 281 KB)
- Tasks: 18 atomic tasks defined in epic

**Active Tasks**
- TASK-2026-01-18-001: User Profile PRD Creation (completed)
- TASK-2026-01-18-002: User Profile Epic Creation (completed)
- TASK-2026-01-18-003: User Profile Task Breakdown (completed)
- TASK-2026-01-18-004: Complete project memory system migration (completed)
- TASK-2026-01-18-005: Sync user-profile to GitHub (pending)

## The 6 Folders Explained

### 1. `decisions/` - Why This Approach
**Question**: "Why are we doing it this way?"

- `architectural/` - Architectural decisions
- `scope/` - Scope decisions (in/out of scope)
- `technical/` - Technical decisions (tech choices, patterns)

### 2. `knowledge/` - How It Works + Learnings
**Question**: "How does it work? What have we learned?"

- `artifacts/` - Completed work outputs
- `codebase/` - Code patterns and gotchas
- `graph/` - Knowledge graph (entities, relationships, embeddings)
- `research/active/` - Active research (user-profile)

### 3. `operations/` - System Operations
**Question**: "How does the AI system run?"

- `agents/` - Agent memory (active, history)
- `architecture/` - Architecture validation
- `docs/` - System documentation (Brain/Engine architecture)
- `github/` - GitHub integration
- `logs/` - System logs
- `sessions/` - Session transcripts
- `workflows/` - Workflow execution

### 4. `plans/` - What We're Building
**Question**: "What are we building?"

- `active/user-profile/` - ACTIVE User Profile epic (27 files, 281 KB)
- `archived/` - 20+ archived plans
- `briefs/` - Product briefs
- `features/` - Feature management
- `prds/` - Product requirements (active, backlog, completed)

### 5. `project/` - Project Identity & Direction
**Question**: "What is this project?"

**Metadata** (in `_meta/`):
- `context.yaml` - Project context (goals, constraints, scope, current focus)
- `project.yaml` - Project metadata (name, version, team, progress)
- `timeline.yaml` - Timeline, milestones, events

**Content**:
- `directions/` - Strategic direction (roadmap, strategy, vision)
- `goals/` - Current goals and metrics

### 6. `tasks/` - What We're Working On
**Question**: "What are we working on right now?"

- `active/` - 5 active task files (TASK-2026-01-18-001 through 005)
- `completed/` - Completed tasks
- `working/` - Working task folders
- `archived/` - Old completed tasks

## Templates

Templates are available in the corresponding folders:

- `plans/prds/active/_template.md` - PRD template
- `tasks/working/_template/task.md` - Task template
- `operations/agents/active/_template/session.json` - Agent session template

## Naming Conventions

See `_NAMING.md` for complete file naming conventions:

- **Tasks**: `TASK-YYYY-MM-DD-NNN.md`
- **Decisions**: `DEC-YYYY-MM-DD-{type}-{slug}.md`
- **Research**: `{topic}/STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md`
- **Epics**: `{epic-slug}/epic.md`, `ARCHITECTURE.md`, etc.

## Scripts & Workflows

### GitHub Integration
- Sync epics and tasks to GitHub issues
- Track pull requests
- Maintain sync history

Location: `operations/github/`

### Agent Memory
- Track agent sessions
- Store agent insights
- Maintain agent context

Location: `operations/agents/`

### Workflow Execution
- Execute workflows
- Track workflow history
- Maintain active workflows

Location: `operations/workflows/`

## Project Context

### Current Focus
- **Feature**: project-memory-system
- **Phase**: Complete
- **Next Step**: Sync user-profile to GitHub

### Primary Goal
Build production-ready features for SISO ecosystem

### Team
- **John** (PM): PRD creation, requirements, research coordination
- **Winston** (Architect): Epic creation, technical design, architecture
- **Arthur** (Developer): Implementation, coding, testing
- **Dexter** (DevOps): Deployment, infrastructure, CI/CD
- **Felix** (Security): Security review, audits, compliance

### Timeline
- Started: 2026-01-18
- Estimated Completion: 2026-02-15
- Milestones:
  - 2026-01-18: GitHub integration complete ✅
  - 2026-01-19: Project memory system complete ✅
  - 2026-02-15: User profile MVP complete

## Recent Changes

### 2026-01-19: Layout Improvements Complete
- Removed empty `domains/` folder (YAGNI principle)
- Consolidated YAML files to root (`FEATURE-BACKLOG.yaml`, `TEST-RESULTS.yaml`)
- Created `project/_meta/` for consistent structure
- Created `_NAMING.md` for file naming conventions
- Moved misplaced `agents/` folder to `operations/agents/`

### 2026-01-19: Reorganization Complete
- Reduced from 18 folders to 6 folders (67% reduction)
- Organized by question type (how AI agents think)
- Eliminated duplicate folders
- Moved active work from "legacy" to proper locations

## File Count

- **Markdown files**: 96
- **YAML files**: 9 (including 3 at root level)
- **JSON files**: 33 (agent session data)
- **Total**: 138 files (clean, no duplicates)

## Related Documentation

- `.blackbox5/5-project-memory/REORGANIZATION-COMPLETE.md` - Complete reorganization details
- `.blackbox5/5-project-memory/OPTIMIZED-REORGANIZATION.md` - Design rationale
- `.blackbox5/5-project-memory/_template/` - Project template (use this for new projects)

## Best Practices for Agents

1. **Read First**: Always read `project/_meta/context.yaml` before starting work
2. **Use Templates**: Use templates when creating new documents
3. **Follow Naming**: Follow `_NAMING.md` conventions for file names
4. **Update Progress**: Update task progress in `tasks/active/`
5. **Document Decisions**: Document decisions in `decisions/`
6. **Sync to GitHub**: Sync completed work to GitHub

## Design Principles

This structure follows these principles:

1. **Simplicity** - Minimal files, no redundant navigation layers
2. **DRY** - File system IS the index (no INDEX.yaml needed)
3. **YAGNI** - No empty folder structures (domains/ removed until needed)
4. **Single Source of Truth** - One place for each type of information
5. **Question-Based** - Organized by how agents think, not file types

## Support

For questions about the memory system:
- See `REORGANIZATION-COMPLETE.md` for details on the reorganization
- See `_template/README.md` for the template documentation
- See `_NAMING.md` for file naming conventions
- See individual folder READMEs for specific guidance
