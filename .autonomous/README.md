# SISO-Internal Autonomous System

**Location:** `~/.blackbox5/5-project-memory/siso-internal/.autonomous/`

**Purpose:** Autonomous task execution and project memory for SISO-Internal.

---

## Overview

This directory contains the autonomous infrastructure for the SISO-Internal project, adapted from the BlackBox5 pattern. It provides:

- **Task Management** - Track and execute tasks
- **Agent System** - Specialized agents for different work types
- **Memory** - Short-term, long-term, and episodic storage
- **Logging** - Comprehensive event and execution logging
- **Context Management** - Token budget and compression

---

## Directory Structure

```
.autonomous/
├── lib/                    # Python utilities
│   ├── task_utils.py       # Task management
│   ├── storage_backends.py # Storage abstraction
│   ├── event_logging.py    # Event logging
│   ├── context_management.py # Context budget
│   ├── state_machine.py    # State machines
│   └── skill_router.py     # Skill routing
├── agents/                 # Agent registry
│   ├── analyzer/           # Research specialist
│   ├── architect/          # Design specialist
│   ├── execution/          # Implementation specialist
│   ├── executor/           # Command specialist
│   ├── metrics/            # Monitoring specialist
│   ├── planner/            # Planning specialist
│   └── scout/              # Exploration specialist
├── logs/                   # Log storage
│   ├── execution_logs/     # Run logs
│   ├── agent_communications/ # Agent messages
│   └── event_logs/         # System events
├── memory/                 # Memory stores
│   ├── short_term/         # Working memory
│   ├── long_term/          # Persistent insights
│   └── episodic/           # Run records
├── runs/                   # Run records
│   └── run-YYYYMMDD_HHMMSS/ # Individual runs
├── tasks/                  # Task management
│   ├── active/             # Pending/in-progress
│   ├── completed/          # Done tasks
│   └── templates/          # Task templates
├── analysis/               # Analysis output
├── bin/                    # Executable scripts
├── config/                 # Configuration
├── research-pipeline/      # Research artifacts
├── signals/                # Signal files
├── testing/                # Test files
├── validations/            # Validation results
├── feedback/               # Feedback system
├── goals/                  # Goal management
├── workspaces/             # Agent workspaces
└── timeline/               # Chronological records
```

---

## Quick Start

### List Tasks

```bash
python lib/task_utils.py list
```

### Get Next Task

```bash
python lib/task_utils.py next
```

### Check Context Status

```bash
python lib/context_management.py status
```

### Test Skill Router

```bash
python lib/skill_router.py "Create a PRD for user authentication"
```

---

## Architecture

### Task Lifecycle

```
Pending -> In Progress -> Completed
    |           |
    v           v
Abandoned   Blocked
```

### Agent System

Agents are defined in `agents/{agent}/agent.yaml`:
- Capabilities
- Triggers (keywords, confidence)
- I/O formats
- Tool access

### Storage

File-based storage with YAML/JSON:
- Human-readable
- Version controllable
- No external dependencies

---

## Configuration

See `config/` for configuration options.

Key files:
- `config/system.yaml` - System settings
- `config/routes.yaml` - Path routing

---

## Integration with Claude Code

This system integrates with Claude Code through:
- Task files that guide work
- Context management for token budgets
- Skill routing for automatic skill selection
- Memory for persistence across sessions

---

## Development

### Adding a New Agent

1. Create `agents/{name}/agent.yaml`
2. Define capabilities and triggers
3. Add to agent registry

### Adding a New Utility

1. Create `lib/{module}.py`
2. Add to `lib/__init__.py`
3. Include CLI testing

### Running Tests

```bash
python -m pytest testing/
```

---

## Documentation

Each directory has its own README.md explaining:
- Purpose
- Structure
- Usage
- Conventions

---

## License

Part of SISO-Internal project.
