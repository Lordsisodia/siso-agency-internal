# Vibe Kanban - Local Setup Guide

Vibe Kanban is a self-hosted task management application for orchestrating AI coding agents.

## Quick Start

```bash
# Start Vibe Kanban
./scripts/start-vibe-local.sh

# Or start fresh (clean old data)
./scripts/start-vibe-local.sh --clean
```

## What Is Vibe Kanban?

Vibe Kanban is an open-source application (from https://github.com/BloopAI/vibe-kanban) that helps you:
- Switch between different coding agents (Claude, Gemini, Codex, etc.)
- Orchestrate multiple agents in parallel or sequence
- Review work and manage dev servers
- Track task status for your coding agents
- Configure MCP (Model Context Protocol) servers

## Resource Usage

| Component | RAM Usage |
|-----------|-----------|
| Node.js Process | ~200-400MB |
| SQLite Database | ~10-20MB |
| **Total** | **~210-420MB** |

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    Vibe Kanban                          │
│                   (localhost:3000)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │ Agent 1│  │ Agent 2│  │ Agent 3│  │ Agent 4│  │
│  │ Claude │  │ Gemini │  │ Codex  │  │  ...   │  │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  │
│       │            │            │            │        │
│       └────────────┴────────────┴────────────┘        │
│                      ↓                                 │
│              Your Codebase                             │
│       ~/SISO-INTERNAL (mounted)                        │
└─────────────────────────────────────────────────────────┘
```

## Installation

Vibe Kanban runs via `npx` (Node Package Executor):

```bash
# First time setup
./scripts/start-vibe-local.sh
```

This will:
1. Download Vibe Kanban (on first run, ~30-60 seconds)
2. Start the server on http://localhost:3000
3. Store data in `~/.vibe-kanban-data/`

## Accessing Vibe Kanban

Once started:
- **Web UI**: Open http://localhost:3000 in your browser
- **Logs**: `tail -f ~/.vibe-kanban-data/vibe-kanban.log`
- **Data**: `~/.vibe-kanban-data/`

## Managing Vibe Kanban

### View Logs
```bash
tail -f ~/.vibe-kanban-data/vibe-kanban.log
```

### Stop Vibe Kanban
```bash
pkill -f vibe-kanban
```

### Restart Vibe Kanban
```bash
./scripts/start-vibe-local.sh
```

### Clean Restart
```bash
./scripts/start-vibe-local.sh --clean
```

### Check Resource Usage
```bash
ps aux | grep vibe
```

## Configuration

Vibe Kanban is configured with environment variables (set in start script):

```bash
export VIBE_KANBAN_PORT=3000
export VIBE_KANBAN_HOST=0.0.0.0
export DATABASE_URL="sqlite:$HOME/.vibe-kanban-data/vibe-kanban.db"
export RUST_LOG=warn
export NODE_OPTIONS="--max-old-space-size=512"
```

## Setting Up Your 6 Claude Agents

1. **Open Vibe Kanban** in your browser
2. **Configure Claude Code** in Settings:
   - Add your Claude Code CLI path
   - Set up API keys
3. **Create Tasks** for each agent to work on
4. **Configure MCP Servers** (if needed):
   - Filesystem access
   - Supabase integration
   - Custom MCP servers

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Change port in start script
export VIBE_KANBAN_PORT=3001
```

### Out of Memory Errors
If you experience RAM issues:
```bash
# Reduce Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=256"
```

### Vibe Kanban Won't Start
```bash
# Check logs
cat ~/.vibe-kanban-data/vibe-kanban.log

# Try clean restart
./scripts/start-vibe-local.sh --clean
```

### Agents Not Working
1. Check agent CLI is installed and in PATH
2. Verify API keys are configured in Vibe Kanban settings
3. Check agent logs in Vibe Kanban UI

## Architecture

```
Vibe Kanban (Node.js + Rust)
    │
    ├→ Web UI (TypeScript)
    ├→ Backend API (Rust)
    ├→ Database (SQLite)
    └→ MCP Server Integration
```

## File Locations

| Location | Path |
|----------|------|
| Start Script | `./scripts/start-vibe-local.sh` |
| Logs | `~/.vibe-kanban-data/vibe-kanban.log` |
| Data | `~/.vibe-kanban-data/` |
| Database | `~/.vibe-kanban-data/vibe-kanban.db` |
| PID File | `~/.vibe-kanban-data/vibe-kanban.pid` |

## Next Steps

1. **Start Vibe Kanban**: `./scripts/start-vibe-local.sh`
2. **Open browser**: http://localhost:3000
3. **Configure agents** in Settings
4. **Create your first task**
5. **Assign to an agent** and watch it work!

## Documentation

For full documentation, see: https://github.com/BloopAI/vibe-kanban

## Support

- GitHub Issues: https://github.com/BloopAI/vibe-kanban/issues
- GitHub Discussions: https://github.com/BloopAI/vibe-kanban/discussions
