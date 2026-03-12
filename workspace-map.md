# Workspace Map

This file maps cmux workspaces to their agents/tasks for SISO Internal Lab.

## Active Workspaces

| Workspace | Agent/Task | Path |
|----------|------------|------|
| workspace:6 | INTERNAL: LEGACY | agents/Legacy_Agent |

## Adding New Workspaces

When creating a new workspace for an agent:

1. Create the agent in `agents/<AgentName>/`
2. Add entry to this map
3. Run: `cmux new-workspace --command "cd ~/SISO_Workspace/SISO_Internal_Lab/agents/<AgentName> && ./run.sh"`
4. Rename with: `cmux rename-workspace --workspace workspace:<N> "INTERNAL: <AGENT_NAME>"`

## Workspace Naming Convention

Use format: `INTERNAL: <AGENT_NAME>`

Example: `INTERNAL: PLANNER`, `INTERNAL: DEVELOPER`

## Quick Commands

```bash
# List current workspaces
cmux list-workspaces

# Create new agent workspace
cmux new-workspace --command "cd ~/SISO_Workspace/SISO_Internal_Lab/agents/<AgentName> && ./run.sh"

# Rename workspace
cmux rename-workspace --workspace workspace:N "INTERNAL: <NAME>"
```
