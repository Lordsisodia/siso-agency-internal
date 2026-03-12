# Skills Registry

This file defines available skills for this agent.

## Core Skills

| Skill | Description |
|-------|-------------|
| fs | File system operations |
| terminal | Bash commands |
| github | GitHub CLI operations |

---

## GitHub Skill

Complete GitHub workflow for SISO Internal Lab.

```bash
# Create new feature branch
github branch feature/my-feature

# Commit changes
github commit "your message"

# Push branch to create PR
github push

# Merge to main (ONLY after testing!)
github merge
```

**⚠️ NEVER push directly to main without testing first!**

---

## Vercel Skill

Deploy SISO Internal Lab to Vercel.

```bash
# Deploy preview (for testing)
vercel

# Deploy production (ONLY after merge to main!)
vercel prod
```

---

## Playwright Skill

Automated browser testing.

```bash
# Install
npm install -g @playwright/cli@latest

# Usage
playwright open <url>
playwright snapshot
playwright screenshot /tmp/test.png
```

---

## Agent Builder Skill

Create new agents from SISO template.

```bash
# Copy template
cp -r /Users/shaansisodia/SISO_Workspace/Agent_OS/workspace/__template_agent__ \
      /Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab/agents/<AgentName>

# Update .a0proj/project.json
# Write AGENTS.md
# Write SOUL.md
# Delete run.sh (not used)
```

---

## Workspace Skill

Navigate SISO Internal Lab workspace.

```bash
# List agents
ls /Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab/agents/

# Run app
cd /Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab/codebase
npm run dev
```

---

## CLI Runner Skill

Run SISO CLI commands.

```bash
siso-mini      # MiniMax powered
siso-claude    # Claude powered
siso-glm       # GLM powered
siso-kimi      # Kimi powered
```

---

## Agent Commander Skill (IMPORTANT!)

Create workspaces, start agents, and communicate with them.

### List Workspaces
```bash
cmux list-workspaces
```

### Create & Start Agent

```bash
# 1. Create workspace
cmux new-workspace

# 2. Get ID from list-workspaces
cmux list-workspaces

# 3. Rename
cmux rename-workspace --workspace workspace:X "INTERNAL: AgentName"

# 4. Navigate (SEPARATE command!)
cmux send --workspace workspace:X "cd /path/to/agent\n"

# 5. Start agent (SEPARATE command!)
cmux send --workspace workspace:X "siso-mini\n"
```

### Send Message to Agent
```bash
cmux send --workspace workspace:X "Your message here\n"
```

### Important Rules
- Always send `cd` and `siso-mini` as SEPARATE commands
- Check workspace ID with `cmux list-workspaces` first

**See `skills/agent-commander/SKILL.md` for full documentation.**

---

## CMUX Skill

Terminal multiplexer for Claude Code. Create workspaces, send commands, automate browsers.

### List Workspaces
```bash
cmux list-workspaces
```

### Create & Name Workspace
```bash
cmux new-workspace
cmux rename-workspace --workspace workspace:X "INTERNAL: Testing"
```

### Send Command to Workspace
```bash
cmux send --workspace workspace:6 "echo hello\n"
cmux send --workspace workspace:6 "cd /path/to/project\n"
cmux send --workspace workspace:6 "siso-mini\n"
```

### Browser Automation
```bash
cmux browser open https://siso-internal.vercel.app
cmux browser snapshot
cmux browser click "button:Login"
cmux browser get url
```

### Naming Strategy
```
INTERNAL: <name>   - Internal projects (Testing, Dev, Code Review)
OS: <name>         - OS-level tasks
META: <name>       - Meta/management tasks
```

### Create Testing Agent Workspace
```bash
cmux new-workspace
cmux rename-workspace --workspace workspace:X "INTERNAL: Testing"
cmux send --workspace workspace:X "cd /Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab/agents/Testing_Agent\n"
cmux send --workspace workspace:X "siso-mini\n"
```

---

## Meta Commander Skill

Communicate with META agents (Skills, Agent Creator, etc.).

```bash
# Find workspace
cmux list-workspaces

# Send to META: Skills (workspace:13)
cmux send --workspace workspace:13 "message\n"
```

**See `skills/meta-commander/SKILL.md` for full documentation.**

---

## Task Commander Skill

Query tasks from SQLite DB and assign to agents.

```bash
# Query tasks
python3 -c "import sqlite3; conn = sqlite3.connect('/Users/shaansisodia/SISO_Workspace/.tasks/siso_tasks.db'); cursor = conn.cursor(); cursor.execute('SELECT id, title, assigned_to, status FROM tasks'); print(cursor.fetchall())"

# Create task
export SISO_TASKS_DB="/Users/shaansisodia/SISO_Workspace/.tasks/siso_tasks.db"
python3 /Users/shaansisodia/SISO_Workspace/Agent_OS/skills/siso-tasks/siso-tasks.py create-task --id TASK-0001 --project-id siso-internal --assigned-to Testing_Agent --title "Task" --description "..."
```

**See `skills/task-commander/SKILL.md` for full workflow.**

---

## Agents in SISO Internal Lab

| Agent | Path |
|-------|------|
| PM_Agent | `.../SISO_Internal_Lab/agents/PM_Agent` |
| Testing_Agent | `.../SISO_Internal_Lab/agents/Testing_Agent` |

---

## Testing Skills

### Local Dev
```bash
npm run dev
```

### Playwright CLI
```bash
playwright open <url>
```
