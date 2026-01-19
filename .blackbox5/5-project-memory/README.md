# Project Memory

This folder contains project-specific memory structures for BlackBox5.

## Structure

```
5-project-memory/
├── _template/           # Template for new projects
│   ├── decisions/       # Decision log templates
│   ├── plans/           # Plan templates (PRDs, epics, tasks)
│   ├── research/        # Research templates
│   └── tasks/           # Task templates
│
├── siso-internal/       # SISO Internal project memory
│   ├── agents/          # Agent-specific memory
│   ├── architecture/    # Architecture documentation
│   ├── artifacts/       # Build artifacts and outputs
│   ├── codebase/        # Code index and navigation
│   ├── context/         # High-level project context
│   ├── domains/         # Domain-specific memory
│   ├── github/          # GitHub integration memory
│   ├── knowledge/       # Knowledge base
│   ├── legacy/          # Legacy project memory
│   │   ├── plans/       # Archived plans
│   │   ├── pipeline/    # Pipeline configurations
│   │   ├── decisions/   # Decision logs
│   │   └── research/    # Research documents
│   ├── logs/            # Execution logs
│   ├── sessions/        # Session history
│   ├── tasks/           # Active and archived tasks
│   ├── workflows/       # Workflow definitions
│   └── working/         # Active working memory
│
├── code_index.md        # Global code index
└── INDEX.yaml           # Memory index
```

## Usage

### Creating a New Project

1. Copy the `_template/` folder
2. Rename it to your project name (e.g., `my-project/`)
3. Fill in the project metadata files

### Project Memory Types

- **Context**: High-level project context (goals, directions, PRDs, features)
- **Plans**: Implementation plans (PRDs, epics, tasks, checklists)
- **Tasks**: Active tasks and their contexts
- **Decisions**: Architectural decision records
- **Research**: Research findings and analysis
- **Working**: Active session memory (transient)

## Memory Tiers

This implements the three-tier memory system:

1. **Working Memory** (`working/`) - Session-only, ~10MB
2. **Extended Memory** (project folders) - Permanent, ~500MB
3. **Archival Memory** (`legacy/`, `artifacts/`) - Permanent, ~5GB

See: `.blackbox/.docs/3-components/memory/MEMORY-ARCHITECTURE.md`

## Framework vs Project

- **Framework Level**: `_template/`, `code_index.md`, `INDEX.yaml`
- **Project Level**: `siso-internal/` (and other projects)

Each project has its own isolated memory structure.
