# 🧪 FINAL MCP TEST - Do This on Your MacBook

## 🚀 On Your MacBook (Vietnam):

### **Step 1: Update MCP Config**

```bash
cat > ~/.config/claude-code/config.json << 'EOF'
{
  "mcpServers": {
    "vibe_kanban_remote": {
      "command": "npx",
      "args": [
        "-y",
        "vibe-kanban@latest",
        "--mcp",
        "--server-url",
        "https://tower-poly-lauren-minister.trycloudflare.com"
      ],
      "env": {
        "VIBE_KANBAN_URL": "https://tower-poly-lauren-minister.trycloudflare.com"
      }
    }
  }
}
EOF
```

### **Step 2: Restart Claude Code**

Quit and reopen Claude Code completely.

### **Step 3: Test MCP Connection**

In Claude Code, ask:

```
List all available MCP servers and tools
```

Look for `vibe_kanban_remote` in the list!

### **Step 4: Use Vibe Kanban MCP**

Then ask:

```
Use Vibe Kanban MCP to list all my projects
```

---

## ✅ What Should Happen:

1. **MCP server listed** - You see vibe_kanban_remote
2. **Projects shown** - Vibe Kanban displays your projects
3. **Connection works** - MCP is communicating!

---

## 🎯 If It Works - CREATE A TASK!

```
Use Vibe Kanban MCP to create a new task:
- Title: "Test MCP from Vietnam"
- Description: "Testing MCP connection! Read .blackbox/AGENT-ONBOARDING.md first, then add loading spinner to XP Display component. Log all work to .blackbox."
- Project: [Choose your project]
```

---

## 🚨 Troubleshooting:

### "MCP server not found"
The MCP server might not be running on Mac Mini.

**Solution:** Check Mac Mini via RustDesk:
```bash
docker ps | grep vibe
```

### "Connection refused"
The Cloudflare tunnel might be down.

**Solution:** Restart cloudflared on Mac Mini:
```bash
docker restart vibe-cloudflared
```

---

## 🎉 Success Criteria:

✅ MCP server listed
✅ Can list projects
✅ Can create tasks
✅ Full MCP control from Vietnam!

---

## 📸 Report Back:

Tell me:
- [ ] Did MCP server appear in the list?
- [ ] Could you list projects?
- [ ] Were you able to create a task?
- [ ] What happened?

---

**Run these commands on your MacBook now and tell me what you see!** 🚀
