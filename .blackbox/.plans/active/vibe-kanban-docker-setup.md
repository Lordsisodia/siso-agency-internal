# 🚀 Vibe Kanban + Gemini + Docker - Complete Setup Guide

**Goal:** Run Vibe Kanban on Mac Mini, control from MacBook via browser, execute tasks with Gemini

---

## 🎯 Architecture

```
Mac Mini (Home)                    MacBook (Vietnam)
┌─────────────────────────┐       ┌─────────────────────────┐
│ • Docker                │◄─────►│ • Browser (Vibe Kanban) │
│ • Vibe Kanban Container │       │ • VSCode (Remote SSH)   │
│ • Gemini CLI            │       │ • Control Interface     │
│ • SISO-INTERNAL Code    │       └─────────────────────────┘
│ • All Services          │              ▲
│ • PostgreSQL, Neo4j     │──────────────┘
└─────────────────────────┘         SSH/Tunnel
           ▲
           │
    RustDesk Access
```

---

## Phase 1: Docker Setup on Mac Mini (15 minutes)

### Step 1: Create Docker Compose for Vibe Kanban

Create `docker-compose.vibe-kanban.yml`:

```yaml
version: '3.8'

services:
  # Vibe Kanban Server
  vibe-kanban:
    image: bloopai/vibe-kanban:latest
    container_name: vibe-kanban
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - vibe-kanban-data:/app/data
      - ~/SISO-INTERNAL:/workspace/SISO-INTERNAL:rw
    environment:
      - PORT=3000
      - HOST=0.0.0.0
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
    networks:
      - vibe-network

  # PostgreSQL (if not already running)
  postgres-vibe:
    image: postgres:16-alpine
    container_name: vibe-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: vibe
      POSTGRES_PASSWORD: vibe_password
      POSTGRES_DB: vibe_kanban
    ports:
      - "5433:5432"
    volumes:
      - vibe-postgres-data:/var/lib/postgresql/data
    networks:
      - vibe-network

volumes:
  vibe-kanban-data:
    name: vibe-kanban-data
  vibe-postgres-data:
    name: vibe-postgres-data

networks:
  vibe-network:
    driver: bridge
```

### Step 2: Create Startup Script

Create `~/start-vibe-kanban.sh` on Mac Mini:

```bash
#!/bin/bash
# Start Vibe Kanban on Mac Mini

echo "🚀 Starting Vibe Kanban..."

# Start Docker services
cd ~/SISO-INTERNAL
docker-compose -f docker-compose.vibe-kanban.yml up -d

# Wait for startup
echo "⏳ Waiting for Vibe Kanban to start..."
sleep 10

# Show status
echo ""
echo "✅ Vibe Kanban is running!"
echo ""
echo "📊 Access at: http://localhost:3000"
echo ""
echo "🔍 To view logs:"
echo "   docker-compose -f docker-compose.vibe-kanban.yml logs -f"
echo ""
echo "🛑 To stop:"
echo "   docker-compose -f docker-compose.vibe-kanban.yml down"
echo ""

# Show logs
docker-compose -f docker-compose.vibe-kanban.yml logs --tail=20
```

Make it executable:
```bash
chmod +x ~/start-vibe-kanban.sh
```

---

## Phase 2: Expose Vibe Kanban to External Access (10 minutes)

### Option A: Cloudflare Tunnel (Recommended - Secure & Easy)

**On Mac Mini:**

```bash
# Install cloudflared
brew install cloudflared

# Create tunnel
cloudflared tunnel --url http://localhost:3000
```

You'll get a URL like: `https://random-name.cfarg.app`

**Access from anywhere:**
```
https://random-name.cfarg.app
```

### Option B: SSH Port Forwarding (Simple - No Extra Software)

**From your MacBook in Vietnam:**

```bash
# Create SSH tunnel to Mac Mini
ssh -L 3000:localhost:3000 username@mac-mini-ip

# Keep this terminal open
# Now access: http://localhost:3000
```

### Option C: Tailscale (Best - Zero Config VPN)

**Install on both machines:**

```bash
# On both MacBook and Mac Mini
brew install tailscale
sudo tailscale up
```

**Access Vibe Kanban:**
```
http://mac-mini-tailscale-ip:3000
```

---

## Phase 3: Configure Gemini CLI (5 minutes)

### Step 1: Install Gemini CLI on Mac Mini

```bash
# In RustDesk terminal on Mac Mini

# Install Gemini CLI
npm install -g @google/gemini-cli

# Or using pip
pip install google-generativeai
```

### Step 2: Authenticate Gemini

```bash
# Set your API key
export GEMINI_API_KEY="your-api-key-here"

# Or add to ~/.bashrc or ~/.zshrc
echo 'export GEMINI_API_KEY="your-api-key"' >> ~/.bashrc
source ~/.bashrc
```

---

## Phase 4: Connect Vibe Kanban to Gemini (5 minutes)

### In Vibe Kanban Web Interface:

1. **Open Vibe Kanban** in your browser
2. **Go to Settings** → **Agents**
3. **Add Gemini Agent:**
   - Name: "Gemini CLI"
   - Type: "Gemini"
   - Command: `gemini-cli`
   - API Key: Use environment variable

### Configure Agent Settings:

```yaml
agent:
  type: gemini
  model: gemini-2.0-flash-exp  # Or gemini-2.5-pro
  temperature: 0.7
  max_tokens: 8192
```

---

## Phase 5: Create Your First Project (5 minutes)

### In Vibe Kanban:

1. **Click "New Project"**
2. **Name:** "SISO Internal"
3. **Path:** `/workspace/SISO-INTERNAL`
4. **Agent:** Select "Gemini CLI"
5. **Click "Create Project"**

---

## Phase 6: Queue Tasks from Vietnam (2 minutes)

### From Your MacBook Browser:

1. **Open Vibe Kanban** (via Cloudflare Tunnel/SSH/Tailscale)
2. **Select "SISO Internal" project**
3. **Add tasks rapidly:**

```
Task 1: "Fix navigation bug in header"
Task 2: "Add dark mode toggle"
Task 3: "Refactor user service"
Task 4: "Update README"
Task 5: "Add unit tests for auth module"
[... add 20 more tasks ...]
```

4. **Click "Create & Start" on first task**
5. **Gemini executes automatically on Mac Mini**

---

## Phase 7: Monitor Progress (Real-time)

### Watch Tasks Move Through Board:

```
To Do → In Progress → Review → Done
  ↓         ↓            ↓        ↓
Task 1    Working...    Done    ✅
Task 2    Waiting...    Ready   🟡
Task 3    Waiting...    Ready   🔄
Task 4    Waiting...    Ready   ⏳
```

### Auto-Execution:

When Task 1 completes:
- ✅ Moves to "Done" column
- 🔄 Task 2 automatically starts (if configured)
- 📊 Progress updates in real-time
- 🔔 You get notified (if enabled)

---

## 🎯 Daily Workflow

### From Vietnam (Your MacBook):

**Morning:**
```bash
# 1. Open browser to Vibe Kanban
open https://your-vibe-kanban-url.cfarg.app

# 2. Check progress
# See what completed overnight

# 3. Add new tasks
# Queue up 10-20 tasks for the day

# 4. Start working
# Click "Create & Start" on first task
```

**During Day:**
- Check progress periodically
- Review completed tasks
- Add more tasks as needed
- Go about your day - Gemini works automatically

**Evening:**
- Review all completed tasks
- Merge PRs (if auto-created)
- Plan tomorrow's tasks
- Let it run overnight!

---

## 📊 Management Scripts

### Monitor All Services (Mac Mini):

Create `~/monitor-all.sh`:

```bash
#!/bin/bash
while true; do
    clear
    echo "=== Mac Mini Infrastructure ==="
    echo "Time: $(date)"
    echo ""
    echo "🎯 Vibe Kanban:"
    docker-compose -f docker-compose.vibe-kanban.yml ps
    echo ""
    echo "🐳 Docker Stats:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    echo ""
    echo "📊 Active Tasks:"
    # Show Vibe Kanban API status
    curl -s http://localhost:3000/api/status || echo "API not responding"
    echo ""
    sleep 5
done
```

### Deploy Script (Mac Mini):

Create `~/deploy-vibe.sh`:

```bash
#!/bin/bash
# Deploy updates and restart Vibe Kanban

cd ~/SISO-INTERNAL

# Pull latest code
echo "📥 Pulling latest code..."
git pull

# Restart Vibe Kanban
echo "🔄 Restarting Vibe Kanban..."
docker-compose -f docker-compose.vibe-kanban.yml restart

echo "✅ Done!"
```

---

## 🔒 Security Best Practices

### 1. Use Cloudflare Tunnel (Recommended)
- ✅ HTTPS encryption
- ✅ No open ports
- ✅ DDoS protection
- ✅ Access control

### 2. Add Authentication

Add to Vibe Kanban Docker compose:

```yaml
environment:
  - VIBE_KANBAN_USERNAME=your-username
  - VIBE_KANBAN_PASSWORD=secure-password
```

### 3. Restrict Access

```yaml
# Only allow from your VPN
environment:
  - ALLOWED_IPS=your-vpn-ip-range
```

---

## 📱 Mobile Access

### From Your Phone (Vietnam):

1. **Open browser**
2. **Go to Vibe Kanban URL**
3. **Add tasks on the go**
4. **Monitor progress**
5. **Start/stop tasks**

---

## 🎉 Benefits

### For You:
- ✅ **Work from anywhere** - Vietnam, Thailand, anywhere
- ✅ **Queue tasks remotely** - Add work from phone/tablet
- ✅ **Monitor progress** - See what Gemini is doing
- ✅ **Never touch Mac Mini** - Everything remote
- ✅ **Mac Mini works 24/7** - While you sleep

### For Your Workflow:
- ✅ **Always-on agent** - Gemini never stops
- ✅ **Visual management** - See everything at a glance
- ✅ **Queue-based work** - Add 20 tasks, let it run
- ✅ **No manual intervention** - Auto-execution
- ✅ **Professional setup** - Proper infrastructure

---

## 🚀 Quick Start Commands

### On Mac Mini (One-Time Setup):

```bash
# 1. Clone repo (if not already)
cd ~/SISO-INTERNAL

# 2. Create docker-compose file
# [Copy the docker-compose.vibe-kanban.yml above]

# 3. Start Vibe Kanban
chmod +x ~/start-vibe-kanban.sh
~/start-vibe-kanban.sh

# 4. Setup Cloudflare Tunnel (or use SSH/Tailscale)
cloudflared tunnel --url http://localhost:3000
```

### From MacBook (Daily Use):

```bash
# 1. Access Vibe Kanban
open https://your-vibe-kanban-url.cfarg.app

# 2. Or use SSH tunnel
ssh -L 3000:localhost:3000 mac-mini
open http://localhost:3000
```

---

## 📚 Documentation

- **Vibe Kanban Docs**: https://vibekanban.com/docs
- **Gemini CLI**: https://github.com/google/generative-ai-js
- **Cloudflare Tunnel**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

---

## 🆘 Troubleshooting

### Vibe Kanban won't start?
```bash
docker-compose -f docker-compose.vibe-kanban.yml logs
```

### Can't access from Vietnam?
```bash
# Check tunnel is running
curl http://localhost:3000

# Check Cloudflare tunnel
cloudflared tunnel info
```

### Gemini not executing tasks?
```bash
# Check API key
echo $GEMINI_API_KEY

# Test Gemini CLI
gemini-cli "Say hello"
```

---

## 🎯 Summary

**What You Get:**
- 🚀 Vibe Kanban running on Mac Mini
- 🌐 Access from anywhere (Vietnam, Thailand, anywhere)
- 🤖 Gemini executing tasks automatically
- 👀 Visual progress monitoring
- 📱 Mobile-friendly interface
- 🔒 Secure access via Cloudflare/Tunnel

**Setup Time:** 30 minutes (one-time)
**Daily Usage:** Open browser, add tasks, monitor progress

**This is the professional way to run AI agents!** 🚀
