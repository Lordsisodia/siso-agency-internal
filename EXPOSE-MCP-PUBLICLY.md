# 🌍 Expose Vibe Kanban MCP Server Publicly via Cloudflare Tunnel

## 🎯 Goal: Make MCP Server Accessible Globally

Currently your Cloudflare tunnel only exposes port 3000 (web UI). We need to ALSO expose port 3001 (MCP server)!

---

## 🔧 Solution: Update Cloudflare Tunnel Config

### Step 1: SSH to Mac Mini

```bash
ssh shaan@192.168.0.29
cd ~/SISO-INTERNAL
```

### Step 2: Find Cloudflare Tunnel Config

```bash
# Check if config exists
ls -la ~/cloudflared/
cat ~/cloudflared/config.yml
```

### Step 3: Update Config to Expose MCP Server

The config should expose BOTH ports:

```yaml
ingress:
  - hostname: tower-poly-lauren-minister.trycloudflare.com
    service: http://localhost:3000
  - hostname: vibe-mcp-tower-poly-lauren-minister.trycloudflare.com
    service: http://localhost:3001
  - service: http_status:404
```

Or use a single hostname with path routing:

```yaml
ingress:
  - hostname: tower-poly-lauren-minister.trycloudflare.com
    service: http://localhost:3000
    path: /web/*
  - hostname: tower-poly-lauren-minister.trycloudflare.com
    service: http://localhost:3001
    path: /mcp/*
  - service: http_status:404
```

### Step 4: Restart Cloudflare Tunnel

```bash
# Find cloudflared process
docker ps | grep cloudflared

# Restart it
docker restart vibe-cloudflared

# Or restart entire stack
docker-compose -f docker-compose.vibe-kanban.yml restart cloudflared
```

---

## 🚀 Alternative: Use ngrok for MCP (Easier!)

If Cloudflare tunnel is tricky, use ngrok:

### On Mac Mini:

```bash
# Install ngrok
brew install ngrok

# Start ngrok for MCP port
ngrok http 3001
```

This gives you a public URL like:
```
https://abc123.ngrok.io -> http://localhost:3001
```

### Update Claude Code Config:

```json
{
  "mcpServers": {
    "vibe_kanban_public": {
      "command": "npx",
      "args": ["-y", "vibe-kanban@latest", "--mcp"],
      "env": {
        "VIBE_KANBAN_URL": "https://abc123.ngrok.io"
      }
    }
  }
}
```

---

## 🎯 Best Solution: Separate ngrok Tunnel for MCP

### On Mac Mini (via SSH/RustDesk):

```bash
# Terminal 1: Keep web UI tunnel running (docker)

# Terminal 2: Start ngrok for MCP
ngrok http 3001
```

### This Gives You:

- **Web UI:** https://tower-poly-lauren-minister.trycloudflare.com (port 3000)
- **MCP Server:** https://abc123.ngrok.io (port 3001)

### On Your MacBook:

Update Claude Code config:
```json
{
  "mcpServers": {
    "vibe_kanban_mcp": {
      "command": "npx",
      "args": ["-y", "vibe-kanban@latest", "--mcp"],
      "env": {
        "VIBE_KANBAN_URL": "https://abc123.ngrok.io"
      }
    }
  }
}
```

---

## 📋 Quick Start (Right Now):

### On Mac Mini (via RustDesk terminal):

```bash
# Install ngrok if not installed
brew install ngrok

# Start ngrok for MCP server
ngrok http 3001
```

You'll see output like:
```
Session Status                online
Forwarding                    https://a1b2c3d4.ngrok.io -> http://localhost:3001
```

### On Your MacBook:

1. **Copy that ngrok URL** (e.g., https://a1b2c3d4.ngrok.io)
2. **Update Claude Code MCP config** with that URL
3. **Restart Claude Code**

---

## ✅ Test It Works!

In Claude Code, ask:

```
Use Vibe Kanban MCP to list all my projects
```

If it works - you now have GLOBAL MCP ACCESS! 🎉

---

## 💡 Permanent Solution: Cloudflare Tunnel with Multiple Services

For a permanent setup, create a proper Cloudflare Tunnel config:

### config.yml (Complete):

```yaml
tunnel: <your-tunnel-id>
credentials-file: /root/.cloudflared/<tunnel-id>.json

ingress:
  # Web UI
  - hostname: vibe-web.your-domain.com
    service: http://localhost:3000

  # MCP Server
  - hostname: vibe-mcp.your-domain.com
    service: http://localhost:3001

  # Fallback
  - service: http_status:404
```

This gives you:
- https://vibe-web.your-domain.com → Web UI
- https://vibe-mcp.your-domain.com → MCP Server

---

## 🎯 Summary

**Quickest Solution RIGHT NOW:**
1. On Mac Mini: `ngrok http 3001`
2. Copy the ngrok URL
3. Update Claude Code MCP config
4. Restart Claude Code
5. Test: "Use Vibe Kanban MCP to list projects"

**You now have public MCP access!** 🚀

The ngrok URL stays consistent as long as ngrok is running, so your Claude Code can connect anytime!
