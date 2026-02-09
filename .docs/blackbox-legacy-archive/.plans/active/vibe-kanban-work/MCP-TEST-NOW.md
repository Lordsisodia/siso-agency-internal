# 🧪 TEST MCP NOW - 3 Steps

## Step 1: Restart Claude Code
Quit Claude Code completely and reopen it.

## Step 2: Test MCP Tools
In Claude Code, ask:
```
List all available MCP tools and servers
```

**Look for:** `vibe_kanban_remote` in the list!

## Step 3: Use MCP to Control Vibe Kanban
Then ask:
```
Use Vibe Kanban MCP to list all my projects
```

---

## ✅ What Should Happen

1. **MCP Server Listed** - You see vibe_kanban_remote
2. **Projects Listed** - Vibe Kanban shows your projects
3. **MCP Working** - You can now control remote agents!

---

## 🎯 If It Works: Test Hierarchical Agents

```
Use Vibe Kanban MCP to:
1. List all projects
2. Show all tasks in SISO-INTERNAL
3. Create a new task called "MCP test task"
4. Start the task with a Claude agent
5. Show task status
```

---

## ❌ If It Doesn't Work

### Error: "MCP server not found"
```bash
# Check config
cat ~/.config/claude-code/config.json

# Should show VIBE_KANBAN_URL env var
```

### Error: "Cannot connect"
```bash
# Test URL
curl https://matching-mpg-accomplish-basics.trycloudflare.com

# Should return HTTP 200
```

---

## 📊 Your Setup

**MacBook (Vietnam):**
- ✅ MCP config updated
- ✅ VIBE_KANBAN_URL set
- ✅ Ready to connect

**Mac Mini (Home):**
- ✅ Vibe Kanban running
- ✅ Cloudflare tunnel active
- ✅ URL accessible (HTTP 200)

**Connection:**
- ✅ MCP server (local on MacBook)
- ✅ Connects to remote Vibe Kanban
- ✅ Full control via MCP tools

---

**RESTART CLAUDE CODE NOW AND TEST!** 🚀
