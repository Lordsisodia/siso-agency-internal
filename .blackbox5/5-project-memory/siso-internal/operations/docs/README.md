# Contextual Memory

This folder contains **ContextualMemory** - high-level project context including goals, directions, PRDs, and features.

## Structure

```
context/
├── goals/               # Main goals and objectives
│   ├── current.md       # Active goals
│   ├── long-term.md     # Future objectives
│   └── metrics.json     # Goal progress tracking
│
├── tasks/               # Task overview and relationships
│   ├── backlog.md       # Task backlog
│   ├── dependencies.md  # Task dependencies
│   └── priorities.md    # Task prioritization
│
├── directions/          # Future directions
│   ├── roadmap.md       # Product roadmap
│   ├── vision.md        # Long-term vision
│   └── strategy.md      # Strategic initiatives
│
├── prds/                # Product requirements
│   ├── active/          # Currently active PRDs
│   ├── backlog/         # Future PRDs
│   └── completed/       # Completed PRDs
│
└── features/            # Future features
    ├── backlog.md       # Feature backlog
    ├── planned/         # Planned features
    ├── under-consideration/  # Exploratory features
    └── dependencies.md  # Feature dependencies
```

## Purpose

ContextualMemory provides **big-picture context** for agents:

### Goals (`goals/`)
- What are we trying to achieve?
- What are our success metrics?
- What's the long-term vision?

### Tasks (`tasks/`)
- What tasks are pending?
- What are the dependencies?
- What should we prioritize?

### Directions (`directions/`)
- Where is the product going?
- What's our strategy?
- What's the roadmap?

### PRDs (`prds/`)
- What are we building?
- What are the requirements?
- What's the scope?

### Features (`features/`)
- What features are planned?
- What's under consideration?
- What are the dependencies?

## Usage

When an agent needs context about the project, it should:

1. **Check goals/** - Understand current objectives
2. **Review directions/** - Understand long-term vision
3. **Scan prds/active/** - See what's being built
4. **Check features/planned/** - See what's coming next

This provides **strategic context** beyond individual tasks.

## Templates

See each subfolder for templates:
- `goals/_template/`
- `directions/_template/`
- `prds/_template/`
- `features/_template/`
