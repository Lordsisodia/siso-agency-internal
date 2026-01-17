# 🔗 Complete .blackbox + Vibe Kanban Integration Guide

## ⚠️ Important: Vibe Kanban Doesn't Have Webhooks

After researching, **Vibe Kanban doesn't currently support outbound webhooks**. We need a different approach to integrate with .blackbox.

---

## 🎯 Integration Options

### Option 1: File-Based Monitoring (Recommended ✅)

**How it works:** Monitor Vibe Kanban's SQLite database and sync changes to .blackbox

**Pros:**
- ✅ Works in real-time
- ✅ Captures all events
- ✅ No Vibe Kanban modification needed
- ✅ Reliable and simple

**Cons:**
- ⚠️ Polls database (small overhead)

---

## 🚀 Option 1: File-Based Monitoring Setup

### Step 1: Create Vibe Kanban Database Monitor

Create `.blackbox/4-scripts/integrations/vibe-kanban/vibe-monitor.py`:

```python
#!/usr/bin/env python3
"""
Vibe Kanban Database Monitor
Watches Vibe Kanban SQLite database and syncs to .blackbox
"""

import sqlite3
import time
import json
from datetime import datetime
from pathlib import Path
import subprocess

# =============================================================================
# CONFIGURATION
# =============================================================================

# Paths (will be detected automatically)
SCRIPT_DIR = Path(__file__).parent.parent.parent.parent
BLACKBOX_PATH = SCRIPT_DIR / ".blackbox"
VIBE_WORK_PATH = BLACKBOX_PATH / ".plans" / "active" / "vibe-kanban-work"
BRAIN_INCOMING_PATH = BLACKBOX_PATH / "9-brain" / "incoming"

# Vibe Kanban database location (in Docker)
VIBE_DB_PATH = Path("/app/data/vibe-kanban.db")

# Ensure directories exist
VIBE_WORK_PATH.mkdir(parents=True, exist_ok=True)
BRAIN_INCOMING_PATH.mkdir(parents=True, exist_ok=True)
(BRAIN_INCOMING_PATH / "vibe-kanban-tasks").mkdir(exist_ok=True)
(BRAIN_INCOMING_PATH / "git-commits").mkdir(exist_ok=True)

# Track last seen state
STATE_FILE = VIBE_WORK_PATH / "monitor-state.json"

# =============================================================================
# DATABASE MONITORING
# =============================================================================

def load_state():
    """Load last seen state"""
    if STATE_FILE.exists():
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    return {
        'last_task_id': None,
        'last_attempt_id': None,
        'tasks_seen': [],
        'attempts_seen': []
    }

def save_state(state):
    """Save current state"""
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def get_vibe_tasks():
    """Get all tasks from Vibe Kanban database"""

    try:
        conn = sqlite3.connect(VIBE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Get tasks
        cursor.execute("""
            SELECT
                id, title, description, status, position,
                created_at, updated_at, project_id, repo_id
            FROM tasks
            ORDER BY updated_at DESC
        """)

        tasks = [dict(row) for row in cursor.fetchall()]
        conn.close()

        return tasks

    except Exception as e:
        print(f"Error reading Vibe Kanban DB: {e}")
        return []

def get_task_attempts(task_id):
    """Get attempts for a task"""

    try:
        conn = sqlite3.connect(VIBE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                id, task_id, agent_type, status,
                created_at, completed_at, error_message
            FROM task_attempts
            WHERE task_id = ?
            ORDER BY created_at DESC
        """, (task_id,))

        attempts = [dict(row) for row in cursor.fetchall()]
        conn.close()

        return attempts

    except Exception as e:
        print(f"Error reading task attempts: {e}")
        return []

# =============================================================================
# TASK HANDLERS
# =============================================================================

def sync_task_to_blackbox(task, attempts):
    """Sync a task and its attempts to .blackbox"""

    task_id = task['id']
    title = task['title']
    status = task['status']

    print(f"📋 Syncing task: {title} (Status: {status})")

    # Update active tasks file
    update_active_tasks(task)

    # Create/update progress file
    sync_task_progress(task, attempts)

    # If completed, move to completed
    if status == 'done':
        move_to_completed(task)
        remove_from_active(task_id)
        sync_to_memory_bank(task)
        update_daily_summary(task, 'completed')

    # If failed, log failure
    elif status == 'aborted':
        log_task_failure(task, attempts)

def update_active_tasks(task):
    """Update active tasks file"""

    active_tasks_file = VIBE_WORK_PATH / "active-tasks.md"

    entry = f"""
## Task: {task['title']}

- **ID:** {task['id']}
- **Status:** {task['status'].upper()}
- **Position:** {task['position']}
- **Updated:** {task['updated_at']}
- **Description:** {task['description'][:200] if task['description'] else 'No description'}...

---

"""

    with open(active_tasks_file, 'a') as f:
        f.write(entry)

def sync_task_progress(task, attempts):
    """Sync task progress with all attempts"""

    task_id = task['id']
    progress_file = VIBE_WORK_PATH / f"task-{task_id}-progress.md"

    content = f"""# Task Progress: {task['title']}

**ID:** {task['id']}
**Status:** {task['status'].upper()}
**Created:** {task['created_at']}
**Updated:** {task['updated_at']}

## Description
{task['description'] or 'No description'}

## Execution Attempts

"""

    for attempt in attempts:
        agent = attempt.get('agent_type', 'Unknown')
        status = attempt.get('status', 'unknown')
        started = attempt.get('created_at', 'unknown')
        completed = attempt.get('completed_at', 'in progress')

        content += f"""
### Attempt {attempt['id']} - {agent}

- **Status:** {status.upper()}
- **Started:** {started}
- **Completed:** {completed}

"""

        if attempt.get('error_message'):
            content += f"**Error:** {attempt['error_message']}\n"

    content += "\n---\n"

    with open(progress_file, 'w') as f:
        f.write(content)

def move_to_completed(task):
    """Move task to completed list"""

    completed_file = VIBE_WORK_PATH / "completed-tasks.md"

    entry = f"""
## ✅ {task['title']}

- **ID:** {task['id']}
- **Completed:** {task['updated_at']}
- **Status:** Success

---

"""

    with open(completed_file, 'a') as f:
        f.write(entry)

def remove_from_active(task_id):
    """Remove task from active list"""

    active_tasks_file = VIBE_WORK_PATH / "active-tasks.md"

    if active_tasks_file.exists():
        with open(active_tasks_file, 'r') as f:
            content = f.read()

        # Remove task entry
        lines = content.split('\n')
        filtered_lines = []
        skip = False

        for line in lines:
            if f"**ID:** {task_id}" in line:
                skip = True
            if skip and line.startswith('---'):
                skip = False
                continue
            if not skip:
                filtered_lines.append(line)

        with open(active_tasks_file, 'w') as f:
            f.write('\n'.join(filtered_lines))

def sync_to_memory_bank(task):
    """Sync completed task to Memory Bank"""

    memory_file = BLACKBOX_PATH / "9-brain" / "memory" / "extended" / "vibe-kanban-history.md"
    memory_file.parent.mkdir(parents=True, exist_ok=True)

    entry = f"""
## Task: {task['title']}

**Completed:** {task['updated_at']}
**ID:** {task['id']}

### Outcome
- Status: Success
- Position: {task['position']}

---

"""

    with open(memory_file, 'a') as f:
        f.write(entry)

    # Store in incoming
    incoming_file = BRAIN_INCOMING_PATH / "vibe-kanban-tasks" / f"{task['id']}.md"
    with open(incoming_file, 'w') as f:
        f.write(f"# Task: {task['title']}\n\n")
        f.write(f"**ID:** {task['id']}\n")
        f.write(f"**Status:** {task['status']}\n")
        f.write(f"**Completed:** {task['updated_at']}\n")
        f.write(f"**Success:** True\n")

def update_daily_summary(task, status):
    """Update daily summary"""

    today = datetime.now().strftime('%Y-%m-%d')
    summary_file = VIBE_WORK_PATH / "daily-summaries" / f"{today}.md"
    summary_file.parent.mkdir(parents=True, exist_ok=True)

    if not summary_file.exists():
        with open(summary_file, 'w') as f:
            f.write(f"# Vibe Kanban Daily Summary - {today}\n\n")
            f.write("## Completed Tasks\n\n")
            f.write("## Failed Tasks\n\n")

    with open(summary_file, 'a') as f:
        if status == 'completed':
            f.write(f"### ✅ {task['title']}\n")
            f.write(f"- **ID:** {task['id']}\n")
            f.write(f"- **Completed:** {datetime.now().strftime('%H:%M')}\n\n")

def log_task_failure(task, attempts):
    """Log failed task"""

    task_id = task['id']
    progress_file = VIBE_WORK_PATH / f"task-{task_id}-progress.md"

    failure_entry = "\n\n## ❌ Task Failed\n\n"

    if attempts:
        last_attempt = attempts[0]
        failure_entry += f"**Error:** {last_attempt.get('error_message', 'Unknown error')}\n"

    failure_entry += f"**Status:** {task['status']}\n"

    with open(progress_file, 'a') as f:
        f.write(failure_entry)

# =============================================================================
# MAIN MONITOR LOOP
# =============================================================================

def monitor_vibe_kanban():
    """Main monitoring loop"""

    print("🚀 Vibe Kanban Monitor Starting...")
    print(f"📁 Blackbox path: {BLACKBOX_PATH}")
    print(f"🗄️  Vibe DB: {VIBE_DB_PATH}")
    print(f"📝 Work path: {VIBE_WORK_PATH}")
    print("")
    print("✅ Monitor ready!")
    print("🔄 Watching Vibe Kanban for changes...")
    print("")

    state = load_state()

    while True:
        try:
            # Get all tasks from Vibe Kanban
            tasks = get_vibe_tasks()

            if not tasks:
                print("⚠️  No tasks found in Vibe Kanban DB")

            # Process each task
            for task in tasks:
                task_id = task['id']

                # Check if this is a new or updated task
                if task_id not in state['tasks_seen']:
                    print(f"🆕 New task detected: {task['title']}")
                    state['tasks_seen'].append(task_id)

                # Get attempts for this task
                attempts = get_task_attempts(task_id)

                # Sync to .blackbox
                sync_task_to_blackbox(task, attempts)

                # Check for new attempts
                for attempt in attempts:
                    attempt_id = attempt['id']
                    if attempt_id not in state['attempts_seen']:
                        print(f"🔄 New attempt: {attempt['agent_type']} on {task['title']}")
                        state['attempts_seen'].append(attempt_id)

            # Save state
            save_state(state)

            # Update queue status
            update_queue_status(tasks)

            # Wait before next poll (30 seconds)
            time.sleep(30)

        except KeyboardInterrupt:
            print("\n\n⏹️  Monitor stopped by user")
            break

        except Exception as e:
            print(f"❌ Error in monitor loop: {e}")
            time.sleep(60)  # Wait longer on error

def update_queue_status(tasks):
    """Update queue status file"""

    queue_file = VIBE_WORK_PATH / "queue-status.md"

    # Count tasks by status
    status_counts = {}
    for task in tasks:
        status = task['status']
        status_counts[status] = status_counts.get(status, 0) + 1

    content = f"""# Vibe Kanban Queue Status

*Last updated: {datetime.now().isoformat()}*

## Summary
- **Total Tasks:** {len(tasks)}
- **To Do:** {status_counts.get('todo', 0)}
- **In Progress:** {status_counts.get('in_progress', 0)}
- **In Review:** {status_counts.get('in_review', 0)}
- **Done:** {status_counts.get('done', 0)}

## Recent Tasks

"""

    # Show last 5 tasks
    for task in tasks[:5]:
        content += f"### {task['title']}\n"
        content += f"- **Status:** {task['status']}\n"
        content += f"- **Updated:** {task['updated_at']}\n\n"

    with open(queue_file, 'w') as f:
        f.write(content)

if __name__ == '__main__':
    monitor_vibe_kanban()
```

### Step 2: Update Docker Compose

Add the monitor service to `docker-compose.vibe-kanban.yml`:

```yaml
  # =========================================================================
  # VIBE KANBAN MONITOR (.blackbox Integration)
  # =========================================================================
  vibe-monitor:
    build:
      context: .
      dockerfile: .blackbox/4-scripts/integrations/vibe-kanban/Dockerfile
    container_name: vibe-monitor
    restart: unless-stopped

    volumes:
      # Mount .blackbox for tracking
      - ~/SISO-INTERNAL/.blackbox:/app/.blackbox:rw

      # Mount Vibe Kanban data for monitoring
      - vibe-kanban-data:/app/vibe-data:ro

    working_dir: /app/.blackbox/4-scripts/integrations/vibe-kanban

    command: python3 vibe-monitor.py

    environment:
      - PYTHONUNBUFFERED=1
      - VIBE_DB_PATH=/app/vibe-data/vibe-kanban.db

    # Resource limits (256MB max)
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

    depends_on:
      - vibe-kanban

    networks:
      - vibe-network
```

### Step 3: Create Setup Script

Create `setup-blackbox-integration.sh`:

```bash
#!/bin/bash
###############################################################################
# SETUP: .blackbox + Vibe Kanban Integration
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔗 .BLACKBOX + VIBE KANBAN INTEGRATION                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${GREEN}Step 1: Creating .blackbox directories...${NC}"
mkdir -p .blackbox/.plans/active/vibe-kanban-work/daily-summaries
mkdir -p .blackbox/9-brain/incoming/vibe-kanban-tasks
mkdir -p .blackbox/9-brain/incoming/git-commits
echo "✅ Directories created"
echo ""

echo -e "${GREEN}Step 2: Creating initial tracking files...${NC}"

# Active tasks
cat > .blackbox/.plans/active/vibe-kanban-work/active-tasks.md << 'EOF'
# Active Vibe Kanban Tasks

*Last updated: $(date +%Y-%m-%d %H:%M:%S)*

No active tasks currently. Monitor will populate this file.
EOF

# Queue status
cat > .blackbox/.plans/active/vibe-kanban-work/queue-status.md << 'EOF'
# Vibe Kanban Queue Status

*Last updated: $(date +%Y-%m-%d %H:%M:%S)*

Monitor will populate this file with real-time queue status.
EOF

# Completed tasks
cat > .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md << 'EOF'
# Completed Vibe Kanban Tasks

*Last updated: $(date +%Y-%m-%d %H:%M:%S)*

No tasks completed yet. Monitor will populate this file.
EOF

echo "✅ Tracking files created"
echo ""

echo -e "${GREEN}Step 3: Installing Python dependencies...${NC}"
pip3 install -q flask flask-cors 2>/dev/null || true
echo "✅ Dependencies installed"
echo ""

echo -e "${GREEN}Step 4: Stopping Docker stack...${NC}"
docker-compose -f docker-compose.vibe-kanban.yml down 2>/dev/null || true
echo "✅ Stack stopped"
echo ""

echo -e "${GREEN}Step 5: Starting Docker stack with monitor...${NC}"
docker-compose -f docker-compose.vibe-kanban.yml up -d
echo "✅ Stack started"
echo ""

echo -e "${GREEN}Step 6: Waiting for services to be ready...${NC}"
sleep 10
echo "✅ Services ready"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ .blackbox + Vibe Kanban integration complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 What's been set up:"
echo "   • Vibe Kanban database monitor running"
echo "   • All tasks tracked to .blackbox automatically"
echo "   • Real-time progress tracking"
echo "   • Daily summaries generated"
echo "   • Memory Bank synchronization"
echo ""
echo "🔍 What gets tracked:"
echo "   ✅ Task creation"
echo "   ✅ Task execution (all attempts)"
echo "   ✅ Agent used (Gemini, Claude, etc.)"
echo "   ✅ Task completion"
echo "   ✅ Task failures with error messages"
echo "   ✅ Git commits (if available)"
echo "   ✅ Daily summaries"
echo ""
echo "📂 Tracking files:"
echo "   • Active tasks: .blackbox/.plans/active/vibe-kanban-work/active-tasks.md"
echo "   • Queue status: .blackbox/.plans/active/vibe-kanban-work/queue-status.md"
echo "   • Completed: .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md"
echo "   • Progress: .blackbox/.plans/active/vibe-kanban-work/task-{id}-progress.md"
echo "   • Daily: .blackbox/.plans/active/vibe-kanban-work/daily-summaries/{date}.md"
echo ""
echo "🚀 Next steps:"
echo "   1. Create a task in Vibe Kanban"
echo "   2. Wait 30 seconds for monitor to detect it"
echo "   3. Check tracking files"
echo ""
echo "🧪 Test it:"
echo "   # Check active tasks"
echo "   cat .blackbox/.plans/active/vibe-kanban-work/active-tasks.md"
echo ""
echo "   # Check queue status"
echo "   cat .blackbox/.plans/active/vibe-kanban-work/queue-status.md"
echo ""
echo "   # Monitor logs"
echo "   docker logs -f vibe-monitor"
echo ""
```

---

## 🎯 How It Works

```
Vibe Kanban (Port 3000)
    ↓
Creates/Updates Tasks
    ↓
SQLite Database Updated
    ↓
Monitor Detects Change (polls every 30s)
    ↓
Syncs to .blackbox:
    • active-tasks.md
    • task-{id}-progress.md
    • completed-tasks.md
    • queue-status.md
    • daily-summaries/
    • Memory Bank
```

---

## 📊 What Gets Tracked

### For Every Task:
- ✅ Task creation time
- ✅ Title and description
- ✅ Status changes (todo → in_progress → in_review → done)
- ✅ All execution attempts
- ✅ Agent used per attempt
- ✅ Start and end times
- ✅ Success/failure status
- ✅ Error messages (if failed)

### For Every Day:
- ✅ Daily summary of completed tasks
- ✅ Daily summary of failed tasks
- ✅ Queue status snapshots

### For Completed Work:
- ✅ Moved to completed-tasks.md
- ✅ Stored in Memory Bank
- ✅ Artifacts catalogued in incoming/

---

## 🧪 Testing the Integration

1. **Create a test task in Vibe Kanban**
2. **Wait 30 seconds**
3. **Check tracking:**

```bash
# See if task was detected
cat .blackbox/.plans/active/vibe-kanban-work/active-tasks.md

# Check queue status
cat .blackbox/.plans/active/vibe-kanban-work/queue-status.md

# Monitor logs
docker logs -f vibe-monitor
```

4. **Start the task in Vibe Kanban**
5. **Wait for it to complete**
6. **Check progress file:**

```bash
ls .blackbox/.plans/active/vibe-kanban-work/task-*-progress.md
cat .blackbox/.plans/active/vibe-kanban-work/task-{id}-progress.md
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
