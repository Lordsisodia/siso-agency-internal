# 🚀 Quick Start: Vibe Kanban + .blackbox Integration

## What You Get

A complete AI task orchestration system where:
- You create tasks in Vibe Kanban (visual board)
- Gemini executes them automatically
- Everything gets tracked to .blackbox (zero manual tracking)
- Monitor from anywhere in the world

---

## Step 1: Setup Mac Mini (via RustDesk)

Connect to your Mac Mini at home and run:

```bash
# Pull latest code
cd ~/SISO-INTERNAL
git pull

# Run automated setup
chmod +x setup-vibe-kanban-integration.sh
./setup-vibe-kanban-integration.sh
```

This will:
- Create .blackbox integration directories
- Install Python dependencies
- Create initial tracking files
- Set up git integration

---

## Step 2: Start Vibe Kanban

```bash
# Start the Docker stack
chmod +x start-vibe-kanban.sh
./start-vibe-kanban.sh
```

This starts:
- Vibe Kanban server (port 3000)
- Webhook server (port 5001)
- PostgreSQL database (port 5433)

---

## Step 3: Configure Webhooks

1. Open Vibe Kanban: http://localhost:3000
2. Go to Settings → Webhooks
3. Add webhook:
   - URL: `http://webhook-server:5001/webhook/vibe-kanban`
   - Events: Select all events
4. Save

---

## Step 4: Test It

Create a test task in Vibe Kanban and verify tracking:

```bash
# Check if task was logged
cat .blackbox/.plans/active/vibe-kanban-work/active-tasks.md

# Check queue status
cat .blackbox/.plans/active/vibe-kanban-work/queue-status.md
```

---

## What Gets Tracked Automatically

✅ Every task creation
✅ Start time and completion time
✅ Progress updates in real-time
✅ Agent assignments (Gemini)
✅ Files created during execution
✅ Git commits linked to tasks
✅ Success/failure status
✅ Error messages if failed
✅ Daily summaries
✅ Weekly reports

---

## Monitor from Anywhere

### Check Active Tasks:
```bash
cat .blackbox/.plans/active/vibe-kanban-work/active-tasks.md
```

### See Completed Work:
```bash
cat .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md
```

### View Task Progress:
```bash
ls .blackbox/.plans/active/vibe-kanban-work/task-*-progress.md
cat .blackbox/.plans/active/vibe-kanban-work/task-12345-progress.md
```

### Daily Summaries:
```bash
ls .blackbox/.plans/active/vibe-kanban-work/daily-summaries/
cat .blackbox/.plans/active/vibe-kanban-work/daily-summaries/2025-01-18.md
```

---

## Remote Access Options

### Option 1: RustDesk + SSH Tunnel
From your MacBook in Vietnam:

```bash
# Connect to Mac Mini via RustDesk, then create SSH tunnel:
ssh -L 3000:localhost:3000 user@mac-mini-ip

# Now access Vibe Kanban at http://localhost:3000 on your MacBook
```

### Option 2: Cloudflare Tunnel (Optional)
Uncomment the `cloudflared` service in `docker-compose.vibe-kanban.yml` and configure with your Cloudflare account.

---

## File Structure

```
.blackbox/.plans/active/vibe-kanban-work/
├── active-tasks.md           # Currently running tasks
├── completed-tasks.md        # Task history
├── queue-status.md           # Current queue state
├── task-{id}-progress.md     # Individual task progress
├── daily-summaries/          # Daily progress reports
└── config.json               # Integration config

.blackbox/9-brain/incoming/
├── vibe-kanban-tasks/        # Task artifacts
└── git-commits/              # Commit tracking
```

---

## Docker Management

### Check Status:
```bash
docker-compose -f docker-compose.vibe-kanban.yml ps
```

### View Logs:
```bash
# All services
docker-compose -f docker-compose.vibe-kanban.yml logs -f

# Specific service
docker-compose -f docker-compose.vibe-kanban.yml logs -f vibe-kanban
docker-compose -f docker-compose.vibe-kanban.yml logs -f webhook-server
```

### Stop Everything:
```bash
docker-compose -f docker-compose.vibe-kanban.yml down
```

### Restart:
```bash
docker-compose -f docker-compose.vibe-kanban.yml restart
```

---

## Troubleshooting

### Vibe Kanban not accessible:
```bash
# Check if service is running
docker ps | grep vibe-kanban

# Restart if needed
docker-compose -f docker-compose.vibe-kanban.yml restart vibe-kanban
```

### Webhook not tracking:
```bash
# Check webhook server logs
docker-compose -f docker-compose.vibe-kanban.yml logs -f webhook-server

# Verify webhook is reachable
curl http://localhost:5001/health
```

### Port conflicts:
Edit `docker-compose.vibe-kanban.yml` and change the port mappings under the `ports:` section.

---

## Full Documentation

- **Complete Integration Guide:** `.blackbox/.plans/active/vibe-kanban-integration.md`
- **Docker Setup Guide:** `.blackbox/.plans/active/vibe-kanban-docker-setup.md`
- **Summary:** `VIBE-KANBAN-INTEGRATION-SUMMARY.md`

---

## Summary

You now have:
- 🎯 Vibe Kanban running on Mac Mini
- 🔗 Complete .blackbox integration
- 📊 Automatic tracking of everything
- 📝 Daily progress reports
- 💾 All work preserved in memory system
- 🚀 Queue tasks from anywhere
- 🤖 Gemini executes automatically
- 📱 Monitor from phone/tablet

**No manual tracking needed - everything flows to .blackbox automatically!** 🎉
