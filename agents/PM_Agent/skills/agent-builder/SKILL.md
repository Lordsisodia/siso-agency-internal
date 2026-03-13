# Agent Builder Skill

Create new agents from the SISO agent template.

## Template Location

```
/Users/shaansisodia/SISO_Workspace/Agent_OS/workspace/__template_agent__/
```

## Agent Structure

```
<agent-name>/
├── .a0proj/
│   ├── project.json       # Agent config
│   └── goals/            # Agent goals
├── config/
│   └── identity.md        # Built from AGENTS.md + SOUL.md
├── inbox/                # Task inbox
├── memory/               # Agent memory
├── workspace/            # Working directory
├── skills/               # Agent-specific skills
├── AGENTS.md            # What the agent does
├── SOUL.md              # How the agent thinks
└── CLAUDE.md            # Claude context
```

## Create New Agent

### 1. Copy Template
```bash
cp -r /Users/shaansisodia/SISO_Workspace/Agent_OS/workspace/__template_agent__ \
      /Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab/agents/<AgentName>
```

### 2. Update project.json
```bash
# Edit .a0proj/project.json with:
{
  "id": "AgentName",
  "name": "AgentName",
  "version": "1.0.0"
}
```

### 3. Create AGENTS.md
Define what the agent does.

### 4. Create SOUL.md
Define how the agent thinks.

### 5. Delete run.sh (not used)
```bash
rm /Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab/agents/<AgentName>/run.sh
```

### 6. Add Skills
Create skills/ directory with agent-specific skills.

## Example: Create Developer Agent

```bash
# 1. Copy template
cp -r /Users/shaansisodia/SISO_Workspace/Agent_OS/workspace/__template_agent__ \
      /Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab/agents/Developer_Agent

# 2. Update project.json
# Set id: "Developer_Agent", name: "Developer_Agent"

# 3. Write AGENTS.md - defines the agent's role

# 4. Write SOUL.md - defines the agent's mindset

# 5. Delete run.sh (not needed)
rm Developer_Agent/run.sh

# 6. Run agent - open terminal in agent folder and run:
siso-mini
```

## How to Run an Agent

1. Create new workspace in CMUX
2. Name it (e.g., "INTERNAL: Dev")
3. Open terminal in agent folder
4. Run: `siso-mini`

## Available Models

- `minimax/MiniMax-M2.5-highspeed` - Fast
- `anthropic/claude-sonnet-4-20250514` - Claude Sonnet
- `openai/gpt-4o` - GPT-4

## Agents Location

All SISO Internal Lab agents go in:
```
/Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab/agents/
```
