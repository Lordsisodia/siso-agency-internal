# 🧪 TEST MCP CONNECTION RIGHT NOW!

## 🎯 Quick Test Steps

### On Your MacBook (Vietnam):

**Step 1: Verify MCP Config**
```bash
cat ~/.config/claude-code/config.json
```

You should see vibe_kanban_remote configured.

**Step 2: Restart Claude Code**
- Quit Claude Code completely
- Reopen it

**Step 3: Test MCP Connection**

In Claude Code, type this EXACT prompt:

```
List all available MCP tools and servers
```

This should show Vibe Kanban MCP in the list.

**Step 4: Test Vibe Kanban MCP**

Then ask:

```
Use Vibe Kanban MCP to list all projects
```

---

## ✅ What Should Happen:

1. **MCP tools listed** - You see vibe_kanban in the list
2. **Projects listed** - Vibe Kanban shows all projects
3. **Connection successful** - MCP is working!

---

## ❌ If It Doesn't Work:

### Error: "MCP server not found"
**Solution:** The MCP server needs to be running locally. On Mac Mini, the MCP server should start automatically when Vibe Kanban runs.

### Error: "Connection refused"
**Solution:** The public URL might not work for MCP. MCP requires direct connection, not HTTP tunnel.

---

## 🚀 Alternative: Use Web UI Directly

Since MCP might have limitations with public URLs, let's use the web UI:

**Go to:** https://tower-poly-lauren-minister.trycloudflare.com

**Create task manually with this:**

**Title:**
```
Test .blackbox integration - Remote task
```

**Description:**
```
This task was created from Vietnam to test the remote workflow!

🎯 REQUIREMENTS:
1. Read .blackbox/AGENT-ONBOARDING.md first (MANDATORY!)
2. Find XP Display component in src/domains/lifelock/
3. Add simple loading spinner (⏳ emoji)
4. Test it works

📍 .blackbox INTEGRATION:
- Create: .blackbox/.plans/active/vibe-kanban-work/task-{ID}-progress.md
- Log all work with timestamps
- Update completed-tasks.md when done
- Create artifact in incoming/

✅ SUCCESS = Working code + Complete .blackbox tracking
```

---

## 💡 Why MCP Might Not Work

**Vibe Kanban MCP is LOCAL-ONLY** - it's designed to run on the same machine, not via public URL.

The MCP server (`npx vibe-kanban --mcp`) starts a local server that expects local file system access.

---

## 🎯 Best Approach for Now:

**Use the Web UI** - it works perfectly!
- https://tower-poly-lauren-minister.trycloudflare.com
- Create task
- Start with Gemini
- Watch it work!

This gives you full remote control without MCP limitations.

---

## 📋 Test the Complete Workflow:

1. **Open Vibe Kanban** (web UI)
2. **Create the test task** (from above)
3. **Start with Gemini**
4. **Watch real-time progress**
5. **Monitor .blackbox** (via SSH to Mac Mini)
6. **Review completed work**

**This proves the autonomous workflow works from anywhere!** 🌏→🏠

---

## 🎉 Summary

**Web UI:** ✅ Works globally via Cloudflare tunnel
**MCP:** ⚠️ Local-only (designed for same-machine access)

**For remote work:** Use the web UI - it's perfect!
**For local work:** Use MCP for faster workflow

**Ready to test?** Open the web UI and create that task! 🚀
