# SISO Internal Lab - Project Context

This is the project-level config for SISO Internal Lab. All agents in this project inherit this context.

## Project Structure
```
SISO_Internal_Lab/
├── agents/       # Standalone agents (Legacy_Agent, etc.)
├── swarms/      # Pipeline workflows
├── codebase/    # Application code
├── docs/        # Documentation
├── inbox/       # Tasks from external sources
└── .beads/      # Task tracking
```

## Values
- Build internal tools for SISO
- Keep things simple and maintainable
- Focus on automation and efficiency

## Task Management
All tasks use the central SQLite database. Use the global siso-tasks CLI:

```bash
export SISO_TASKS_DB="/Users/shaansisodia/SISO_Workspace/.tasks/siso_tasks.db"
python3 /Users/shaansisodia/SISO_Workspace/Agent_OS/skills/siso-tasks/siso-tasks.py <command>
```

## For Agents
Each agent has its own `.claude/` folder in their directory for agent-specific config.
