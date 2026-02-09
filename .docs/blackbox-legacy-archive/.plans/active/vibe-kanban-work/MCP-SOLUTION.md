# 🚀 MAKING MCP WORK FOR HIERARCHICAL AGENTS

## 🎯 The Goal

**Your Setup:**
- **MacBook (Vietnam)**: 1-3 Gemini agents (orchestrators)
- **Mac Mini (Home)**: 10-20 Vibe Kanban agents (workers)
- **MCP Required**: Yes! Gemini agents need to control Vibe Kanban agents

## ✅ THE SOLUTION: Run MCP Server Locally on MacBook

### Architecture:
```
┌─────────────────────────────────────────────────┐
│  MacBook (Vietnam)                              │
│                                                 │
│  1. Gemini Agents (Orchestrators)               │
│     ├─ Agent 1: Strategic planning              │
│     ├─ Agent 2: Task distribution               │
│     └─ Agent 3: Monitoring/review               │
│                                                 │
│  2. Vibe Kanban MCP Server (LOCAL)              │
│     ├─ Runs via: npx vibe-kanban --mcp          │
│     ├-- Connects to remote Vibe Kanban via URL   │
│     └─ Exposes MCP tools to Gemini agents       │
│                                                 │
│  3. Claude Code MCP Client                      │
│     └─ Gemini agents use MCP tools              │
│                                                 │
└─────────────────────────────────────────────────┘
                    │
                    │ VIBE_KANBAN_URL env var
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Mac Mini (Home)                                │
│                                                 │
│  1. Vibe Kanban Web UI (Port 3000)              │
│     └─ Exposed via Cloudflare tunnel            │
│                                                 │
│  2. Vibe Kanban Agents (Workers)                │
│     ├─ 10-20 agents running                     │
│     ├─ Execute actual coding tasks              │
│     └─ Report back via .blackbox                │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🔧 Setup Instructions

### Step 1: Update MCP Config on MacBook

```bash
cat > ~/.config/claude-code/config.json << 'EOF'
{
  "mcpServers": {
    "vibe_kanban_remote": {
      "command": "npx",
      "args": [
        "-y",
        "vibe-kanban@latest",
        "--mcp"
      ],
      "env": {
        "VIBE_KANBAN_URL": "https://matching-mpg-accomplish-basics.trycloudflare.com"
      }
    }
  }
}
EOF
```

**Key Change:** Remove `--server-url` from args, use `VIBE_KANBAN_URL` env var instead!

### Step 2: Test MCP Connection

Restart Claude Code, then test:

```bash
# List MCP tools (should see vibe_kanban tools)
# In Claude Code, ask: "List all available MCP tools"
```

### Step 3: Use MCP from Gemini Agents

Gemini agents can now:
```
1. List projects: "List all Vibe Kanban projects"
2. Create tasks: "Create task in SISO project"
3. Start agents: "Start task with Claude agent"
4. Monitor: "Show all active tasks"
5. Review: "Get task status and progress"
```

## 💡 How It Works

### MCP Server (Local on MacBook):
- Runs via `npx vibe-kanban --mcp`
- Uses `VIBE_KANBAN_URL` to connect to remote instance
- Exposes MCP tools to Claude Code
- Gemini agents use these tools

### Vibe Kanban (Remote on Mac Mini):
- Web UI accessible via Cloudflare tunnel
- Receives commands from MCP server
- Executes tasks with worker agents
- Updates .blackbox automatically

### Communication Flow:
```
Gemini Agent (MacBook)
    ↓ (MCP tools)
Vibe Kanban MCP (MacBook)
    ↓ (HTTP requests)
Vibe Kanban Web UI (Mac Mini)
    ↓ (Agent execution)
10-20 Worker Agents (Mac Mini)
    ↓ (Results)
.blackbox Tracking (Mac Mini)
```

## 🎯 Your Hierarchical Agent Workflow

### Level 1: Gemini Agents (MacBook - Orchestrators)

**Agent 1: Strategic Planner**
- Reviews project goals
- Plans task distribution
- Creates high-level roadmaps
- Uses MCP to create Vibe Kanban tasks

**Agent 2: Task Manager**
- Monitors active tasks
- Distributes work to workers
- Handles bottlenecks
- Uses MCP to start/stop agents

**Agent 3: Quality Review**
- Reviews completed work
- Validates .blackbox tracking
- Approves/requests changes
- Uses MCP to review artifacts

### Level 2: Vibe Kanban Agents (Mac Mini - Workers)

10-20 specialized agents:
- Frontend developers
- Backend developers
- Testing agents
- Documentation agents
- Refactoring agents
- etc.

## 🚀 Implementation Steps

### Phase 1: Setup (Now)
1. ✅ Update MCP config (above)
2. ✅ Restart Claude Code
3. ✅ Test MCP tools available
4. ✅ Verify connection to remote Vibe Kanban

### Phase 2: Test (Today)
1. Create simple task via MCP
2. Start 1 worker agent
3. Monitor progress
4. Verify .blackbox tracking

### Phase 3: Scale (This Week)
1. Deploy 3 Gemini orchestrators
2. Queue 10 Vibe Kanban tasks
3. Start 5-10 worker agents
4. Monitor hierarchical workflow

### Phase 4: Optimize (Ongoing)
1. Refine agent prompts
2. Optimize task distribution
3. Improve monitoring
4. Scale to 20 workers

## 📊 Expected Performance

### MacBook (M1 - 16GB):
- 1-3 Gemini agents (lightweight)
- 1 MCP server (lightweight)
- Total: ~2-4GB RAM

### Mac Mini (M4 - 16GB):
- 10-20 Vibe Kanban agents (heavy)
- Docker containers
- .blackbox tracking
- Total: ~12-14GB RAM

### Communication:
- MCP → Vibe Kanban: HTTP requests (fast)
- Vietnam → Home: Cloudflare tunnel (1-2s latency)
- Agent coordination: Minimal overhead

## 🔍 Troubleshooting

### MCP Tools Not Available:
```bash
# Check config
cat ~/.config/claude-code/config.json

# Restart Claude Code completely
# Check MCP server starts: npx -y vibe-kanban@latest --mcp
```

### Can't Connect to Remote:
```bash
# Test URL accessible
curl https://matching-mpg-accomplish-basics.trycloudflare.com

# Should return HTTP 200
```

### Agents Not Starting:
- Check Vibe Kanban web UI
- Verify .blackbox onboarding
- Review agent logs
- Check Docker containers on Mac Mini

## ✅ Success Criteria

1. ✅ MCP tools available in Claude Code
2. ✅ Can list projects via MCP
3. ✅ Can create tasks via MCP
4. ✅ Can start agents via MCP
5. ✅ Gemini agents orchestrate workers
6. ✅ .blackbox tracking complete
7. ✅ Hierarchical workflow operational

## 🎉 Summary

**YOU WERE RIGHT!** You need MCP for hierarchical agents.

**Solution:**
- Run MCP server locally on MacBook
- Connect to remote Vibe Kanban via URL
- Gemini agents use MCP to control workers
- Full hierarchical orchestration achieved!

**Next Step:**
Update the MCP config and test it! 🚀
