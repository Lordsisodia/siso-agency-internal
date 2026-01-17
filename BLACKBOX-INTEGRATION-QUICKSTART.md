# 🚀 .blackbox + Vibe Kanban Integration: Quick Start

## ⚡ One-Command Setup

On your Mac Mini (via RustDesk or SSH):

```bash
cd ~/SISO-INTERNAL
git pull
./setup-blackbox-integration.sh
```

That's it! Everything is now tracking automatically.

---

## 🎯 What Happens

The system monitors Vibe Kanban's database and syncs everything to .blackbox:

```
You create task in Vibe Kanban
    ↓
Monitor detects it (within 30 seconds)
    ↓
Automatically updates .blackbox:
    • active-tasks.md
    • task-{id}-progress.md
    • queue-status.md
    • daily-summaries/
    • Memory Bank
```

---

## 📊 What Gets Tracked

### For Every Task:
- ✅ Task creation
- ✅ Title and description
- ✅ Status changes
- ✅ All execution attempts
- ✅ Agent used (Gemini, Claude, etc.)
- ✅ Start and end times
- ✅ Success/failure status
- ✅ Error messages

### For Every Day:
- ✅ Daily summary of completed tasks
- ✅ Queue status

### For Completed Work:
- ✅ Moved to completed-tasks.md
- ✅ Stored in Memory Bank
- ✅ Artifacts catalogued

---

## 🧪 Test It

1. **Create a task in Vibe Kanban** (http://localhost:3000)
2. **Wait 30 seconds**
3. **Check tracking:**

```bash
# See active tasks
cat .blackbox/.plans/active/vibe-kanban-work/active-tasks.md

# Check queue status
cat .blackbox/.plans/active/vibe-kanban-work/queue-status.md

# Monitor logs
docker logs -f vibe-monitor
```

---

## 📂 Files Created

```
.blackbox/.plans/active/vibe-kanban-work/
├── active-tasks.md           # Currently running tasks
├── completed-tasks.md        # Task history
├── queue-status.md           # Current queue state
├── task-{id}-progress.md     # Per-task progress
├── daily-summaries/          # Daily reports
└── monitor-state.json        # Monitor state

.blackbox/9-brain/
├── incoming/vibe-kanban-tasks/  # Task artifacts
└── memory/extended/vibe-kanban-history.md  # Long-term history
```

---

## 🔍 Monitor Commands

```bash
# See monitor logs
docker logs -f vibe-monitor

# Restart monitor
docker restart vibe-monitor

# Check if monitor is running
docker ps | grep vibe-monitor

# See all Vibe Kanban services
docker-compose -f docker-compose.vibe-kanban.yml ps
```

---

## 💡 How It Works

**Vibe Kanban doesn't have webhooks**, so we use a **database monitor**:

1. Vibe Kanban stores everything in SQLite database
2. Monitor reads database every 30 seconds
3. Detects changes (new tasks, status updates)
4. Syncs to .blackbox files
5. Updates daily summaries
6. Syncs completed work to Memory Bank

**Zero configuration needed** - it just works!

---

## 📈 Resource Usage

```
Vibe Kanban:     1GB
Monitor:         256MB
MCP Servers:     256MB (2x 128MB)
PostgreSQL:      512MB
Webhook Server:  256MB
─────────────────────────
Total:           ~2.25GB (well within 16GB!)
```

---

## 🎁 Summary

**You get complete automatic tracking:**
- All Vibe Kanban tasks → .blackbox
- Real-time progress monitoring
- Daily summaries
- Memory Bank synchronization
- Zero manual intervention

**Just run:** `./setup-blackbox-integration.sh`

**Everything happens automatically!** 🎉

---

## 📖 Full Documentation

See `BLACKBOX-VIBE-KANBAN-INTEGRATION.md` for complete details.
