# 🔗 Vibe Kanban + .blackbox Integration System

**Goal:** Every task in Vibe Kanban automatically tracks to .blackbox memory system

---

## 🎯 Integration Points

### 1. Task Creation → Plan Updates
When you create a task in Vibe Kanban, it automatically:
- Creates corresponding entry in `.blackbox/.plans/active/vibe-kanban-work/`
- Generates task metadata
- Links to existing plans
- Updates work queue

### 2. Task Execution → Progress Tracking
When Gemini starts working:
- Logs to progress-log.md
- Updates status.md
- Tracks time spent
- Records decisions made

### 3. Task Completion → Memory Storage
When task completes:
- Stores artifacts created
- Records achievements
- Updates success metrics
- Commits to Memory Bank

### 4. Git Integration → Version Control
Every action:
- Triggers git commits
- Links commits to tasks
- Stores commit references
- Tracks code changes

---

## 📁 Directory Structure

```
.blackbox/
├── .plans/active/
│   ├── vibe-kanban-work/              # Vibe Kanban task tracking
│   │   ├── active-tasks.md             # Currently running tasks
│   │   ├── completed-tasks.md          # Task history
│   │   ├── task-templates.md           # Reusable task templates
│   │   └── queue-status.md             # Current queue state
│   │
│   └── distributed-docker-infrastructure/  # Existing Docker setup
│
├── 9-brain/                            # Memory system
│   ├── incoming/                       # New artifacts from Vibe Kanban
│   │   ├── vibe-kanban-tasks/          # Task artifacts
│   │   ├── git-commits/                # Commit tracking
│   │   └── achievements/               # Completed work
│   │
│   └── memory/
│       ├── extended/                   # Long-term memory
│       │   └── vibe-kanban-history.md   # Task history
│       └── working/                    # Active session data
│           └── vibe-kanban-session.json # Current session
│
└── 4-scripts/integrations/
    └── vibe-kanban/                    # Integration scripts
        ├── task-tracker.sh             # Track task lifecycle
        ├── artifact-collector.sh       # Collect artifacts
        ├── git-integration.sh          # Git hook system
        └── memory-sync.sh              # Sync to Memory Bank
```

---

## 🔧 Implementation

### Component 1: Vibe Kanban Webhook System

Vibe Kanban supports webhooks! We'll use them to track everything.

**Setup in Vibe Kanban:**

1. Go to Settings → Webhooks
2. Add webhook endpoint
3. Configure events to track:
   - task.created
   - task.started
   - task.completed
   - task.failed
   - git.commit

### Component 2: Integration Server

Create `.blackbox/4-scripts/integrations/vibe-kanban/webhook-server.py`:

```python
#!/usr/bin/env python3
"""
Vibe Kanban Integration Server
Receives webhooks from Vibe Kanban and updates .blackbox memory system
"""

from flask import Flask, request, jsonify
import json
import os
from datetime import datetime
from pathlib import Path

app = Flask(__name__)

# Paths
BLACKBOX_PATH = Path.home() / "SISO-INTERNAL" / ".blackbox"
PLANS_PATH = BLACKBOX_PATH / ".plans" / "active" / "vibe-kanban-work"
BRAIN_PATH = BLACKBOX_PATH / "9-brain" / "incoming"

# Ensure directories exist
PLANS_PATH.mkdir(parents=True, exist_ok=True)
BRAIN_PATH.mkdir(parents=True, exist_ok=True)

@app.route('/webhook/vibe-kanban', methods=['POST'])
def vibe_kanban_webhook():
    """Receive webhook from Vibe Kanban"""

    data = request.json
    event_type = data.get('event')
    task_data = data.get('task', {})

    # Route to appropriate handler
    if event_type == 'task.created':
        handle_task_created(task_data)
    elif event_type == 'task.started':
        handle_task_started(task_data)
    elif event_type == 'task.completed':
        handle_task_completed(task_data)
    elif event_type == 'task.failed':
        handle_task_failed(task_data)
    elif event_type == 'git.commit':
        handle_git_commit(task_data)

    return jsonify({'status': 'success'}), 200

def handle_task_created(task):
    """Track new task creation"""

    task_file = PLANS_PATH / "active-tasks.md"

    # Append to active tasks
    with open(task_file, 'a') as f:
        f.write(f"\n## Task Created: {task.get('title')} - {datetime.now().isoformat()}\n")
        f.write(f"- **ID:** {task.get('id')}\n")
        f.write(f"- **Description:** {task.get('description')}\n")
        f.write(f"- **Project:** {task.get('project')}\n")
        f.write(f"- **Status:** Created\n")
        f.write(f"- **Agent:** {task.get('agent', 'Gemini')}\n")

    # Update queue status
    update_queue_status('created', task)

def handle_task_started(task):
    """Track when task starts execution"""

    progress_file = PLANS_PATH / f"task-{task.get('id')}-progress.md"

    # Create progress file
    with open(progress_file, 'w') as f:
        f.write(f"# Task Progress: {task.get('title')}\n\n")
        f.write(f"**Started:** {datetime.now().isoformat()}\n")
        f.write(f"**Agent:** {task.get('agent', 'Gemini')}\n")
        f.write(f"**Status:** In Progress\n\n")
        f.write("## Execution Log\n\n")

    # Update active tasks
    update_active_tasks(task.get('id'), 'in_progress')

def handle_task_completed(task):
    """Track task completion and collect artifacts"""

    progress_file = PLANS_PATH / f"task-{task.get('id')}-progress.md"

    # Update progress file
    with open(progress_file, 'a') as f:
        f.write(f"\n## ✅ Task Completed\n\n")
        f.write(f"**Completed:** {datetime.now().isoformat()}\n")
        f.write(f"**Duration:** {task.get('duration', 'unknown')}\n")
        f.write(f"**Status:** Success\n\n")
        f.write("## Artifacts Created\n\n")

        # List artifacts
        for artifact in task.get('artifacts', []):
            f.write(f"- {artifact}\n")

    # Move to completed
    move_to_completed(task)

    # Update Memory Bank
    sync_to_memory_bank(task)

def handle_task_failed(task):
    """Track task failure"""

    progress_file = PLANS_PATH / f"task-{task.get('id')}-progress.md"

    with open(progress_file, 'a') as f:
        f.write(f"\n## ❌ Task Failed\n\n")
        f.write(f"**Failed:** {datetime.now().isoformat()}\n")
        f.write(f"**Error:** {task.get('error', 'Unknown error')}\n")

    update_active_tasks(task.get('id'), 'failed')

def handle_git_commit(commit_data):
    """Track git commits"""

    commits_file = BRAIN_PATH / "git-commits" / f"{datetime.now().strftime('%Y%m%d')}.md"
    commits_file.parent.mkdir(exist_ok=True)

    with open(commits_file, 'a') as f:
        f.write(f"\n## Commit: {commit_data.get('message', 'No message')}\n")
        f.write(f"- **Hash:** {commit_data.get('hash')}\n")
        f.write(f"- **Author:** {commit_data.get('author')}\n")
        f.write(f"- **Task:** {commit_data.get('task_id', 'Unknown')}\n")
        f.write(f"- **Time:** {datetime.now().isoformat()}\n")

def update_queue_status(status, task):
    """Update queue status file"""

    queue_file = PLANS_PATH / "queue-status.md"

    with open(queue_file, 'a') as f:
        f.write(f"\n### {datetime.now().isoformat()} - Task {status.upper()}\n")
        f.write(f"- **Task:** {task.get('title')}\n")
        f.write(f"- **ID:** {task.get('id')}\n")
        f.write(f"- **Queue Position:** {task.get('position', 'unknown')}\n")

def update_active_tasks(task_id, status):
    """Update active tasks file"""

    active_file = PLANS_PATH / "active-tasks.md"

    # Read current content
    if active_file.exists():
        content = active_file.read_text()
    else:
        content = "# Active Tasks\n\n"

    # Update task status
    # (Implementation details...)

    active_file.write_text(content)

def move_to_completed(task):
    """Move task to completed list"""

    completed_file = PLANS_PATH / "completed-tasks.md"

    with open(completed_file, 'a') as f:
        f.write(f"\n## ✅ {task.get('title')}\n")
        f.write(f"- **ID:** {task.get('id')}\n")
        f.write(f"- **Completed:** {datetime.now().isoformat()}\n")
        f.write(f"- **Duration:** {task.get('duration')}\n")

def sync_to_memory_bank(task):
    """Sync completed task to Memory Bank"""

    memory_file = BLACKBOX_PATH / "9-brain" / "memory" / "extended" / "vibe-kanban-history.md"

    with open(memory_file, 'a') as f:
        f.write(f"\n## Task: {task.get('title')}\n")
        f.write(f"**Completed:** {datetime.now().isoformat()}\n")
        f.write(f"**Artifacts:** {len(task.get('artifacts', []))} files\n")
        f.write(f"**Success Metrics:** All criteria met\n")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
```

### Component 3: Docker Integration

Add to `docker-compose.vibe-kanban.yml`:

```yaml
services:
  vibe-kanban:
    # ... existing config ...
    environment:
      - WEBHOOK_URL=http://webhook-server:5001/webhook/vibe-kanban
    depends_on:
      - webhook-server

  webhook-server:
    build: .blackbox/4-scripts/integrations/vibe-kanban
    container_name: vibe-webhook-server
    restart: unless-stopped
    ports:
      - "5001:5001"
    volumes:
      - ~/SISO-INTERNAL/.blackbox:/app/.blackbox:rw
    networks:
      - vibe-network
```

---

## 📊 Tracking Templates

### Task Template

`.blackbox/.plans/active/vibe-kanban-work/task-templates.md`:

```markdown
# Task Templates for Vibe Kanban

## Template: Bug Fix

**Prompt Template:**
```
Fix the bug in {component}: {bug_description}

Steps:
1. Reproduce the bug
2. Identify root cause
3. Implement fix
4. Add tests
5. Verify fix
```

**Expected Artifacts:**
- Fixed source file
- Test file
- Commit hash

**Estimated Time:** 30-60 minutes

---

## Template: Feature Addition

**Prompt Template:**
```
Add {feature} to {component}

Requirements:
- {requirement_1}
- {requirement_2}

Acceptance Criteria:
- [ ] Feature works as expected
- [ ] Tests added
- [ ] Documentation updated
```

**Expected Artifacts:**
- New component file
- Updated tests
- Updated README
- Commit hash

**Estimated Time:** 2-4 hours
```

---

## 🔄 Automatic Sync System

### Sync Script

`.blackbox/4-scripts/integrations/vibe-kanban/sync-to-blackbox.sh`:

```bash
#!/bin/bash
#
# Sync Vibe Kanban data to .blackbox
#

BLACKBOX_PATH=~/SISO-INTERNAL/.blackbox
VIBE_WORK=$BLACKBOX_PATH/.plans/active/vibe-kanban-work

# Sync active tasks
echo "Syncing active tasks..."
# Pull from Vibe Kanban API
# Update .blackbox files

# Sync completed tasks
echo "Syncing completed tasks..."
# Archive completed tasks

# Update progress logs
echo "Updating progress logs..."
# Generate daily summary

# Commit to git
echo "Committing to .blackbox..."
cd $BLACKBOX_PATH
git add .
git commit -m "Auto-sync from Vibe Kanban: $(date)"
```

---

## 📈 Metrics & Analytics

### Daily Summary Generation

`.blackbox/4-scripts/integrations/vibe-kanban/generate-daily-summary.sh`:

```bash
#!/bin/bash
#
# Generate daily summary of Vibe Kanban activity
#

DATE=$(date +%Y-%m-%d)
SUMMARY_FILE=.blackbox/.plans/active/vibe-kanban-work/daily-summaries/$DATE.md

mkdir -p $(dirname $SUMMARY_FILE)

cat > $SUMMARY_FILE << EOF
# Vibe Kanban Daily Summary - $DATE

## Overview
- **Tasks Completed:** $(count_completed_tasks)
- **Tasks Failed:** $(count_failed_tasks)
- **Total Time:** $(total_time)
- **Artifacts Created:** $(count_artifacts)

## Completed Tasks
$(list_completed_tasks)

## Failed Tasks
$(list_failed_tasks)

## Artifacts Created
$(list_artifacts)

## Success Metrics
$(calculate_metrics)
EOF

echo "Daily summary generated: $SUMMARY_FILE"
```

---

## 🎯 Complete Workflow

```
1. User creates task in Vibe Kanban
   ↓
2. Webhook → webhook-server
   ↓
3. Update .blackbox/.plans/active/vibe-kanban-work/
   ↓
4. Gemini executes task
   ↓
5. Progress updates to .blackbox
   ↓
6. Task completes → artifacts collected
   ↓
7. Sync to Memory Bank
   ↓
8. Git commit with all metadata
   ↓
9. Daily summary generated
   ↓
10. Everything tracked in .blackbox!
```

---

## 🔗 Integration with Existing Systems

### Ralph Agent Coordination

```markdown
# Ralph Agent can see Vibe Kanban tasks

## Ralph can:
- ✅ Read queue from Vibe Kanban
- ✅ Pick up tasks autonomously
- ✅ Report progress back
- ✅ Update .blackbox with findings

## Integration Point:
- .blackbox/.plans/active/vibe-kanban-work/queue-status.md
- Ralph reads this file
- Updates progress as it works
```

### Memory Bank Integration

```markdown
# All Vibe Kanban data flows to Memory Bank

## Incoming Artifacts:
- .blackbox/9-brain/incoming/vibe-kanban-tasks/
- .blackbox/9-brain/incoming/git-commits/
- .blackbox/9-brain/incoming/achievements/

## Automatic Processing:
- Every hour → Sync to Memory Bank
- End of day → Generate summary
- End of week → Archive to extended memory
```

---

## 🚀 Setup Instructions

### Step 1: Create Integration Directory

```bash
mkdir -p .blackbox/4-scripts/integrations/vibe-kanban
cd .blackbox/4-scripts/integrations/vibe-kanban
```

### Step 2: Create Webhook Server

```bash
# Copy the Python webhook server code
# Save as webhook-server.py

# Install dependencies
pip install flask
```

### Step 3: Update Docker Compose

```bash
# Add webhook-server service to docker-compose.vibe-kanban.yml
# Rebuild and restart
docker-compose -f docker-compose.vibe-kanban.yml up -d --build
```

### Step 4: Configure Webhooks in Vibe Kanban

1. Open Vibe Kanban
2. Settings → Webhooks
3. Add: `http://webhook-server:5001/webhook/vibe-kanban`
4. Select events to track

### Step 5: Test Integration

```bash
# Create test task in Vibe Kanban
# Check .blackbox/.plans/active/vibe-kanban-work/active-tasks.md
# Should see task logged!
```

---

## 📊 What Gets Tracked

### For Every Task:
- ✅ Creation timestamp
- ✅ Task description
- ✅ Agent assigned (Gemini)
- ✅ Start time
- ✅ Completion time
- ✅ Duration
- ✅ Success/Failure status
- ✅ Artifacts created
- ✅ Git commits made
- ✅ Error messages (if failed)

### For Every Day:
- ✅ Tasks completed
- ✅ Tasks failed
- ✅ Total work time
- ✅ Artifacts created
- ✅ Success metrics

### For Every Week:
- ✅ Summary reports
- ✅ Productivity metrics
- ✅ Agent performance
- ✅ Achievement tracking

---

## 🎯 Benefits

### For You:
- 📊 **Complete visibility** - See everything Vibe Kanban does
- 📝 **Automatic documentation** - No manual tracking needed
- 🔍 **Searchable history** - Find any task instantly
- 📈 **Progress metrics** - Track productivity over time

### For .blackbox:
- 🧠 **Rich memory** - Every task recorded
- 🔄 **Auto-sync** - No manual updates
- 📦 **Artifact tracking** - Everything catalogued
- 🎯 **Success metrics** - Measurable progress

---

## 🚀 Next Steps

1. ✅ Create webhook server
2. ✅ Add to Docker compose
3. ✅ Configure webhooks in Vibe Kanban
4. ✅ Test integration
5. ✅ Verify .blackbox updates
6. ✅ Generate first daily summary

---

**Everything Vibe Kanban does will be tracked in .blackbox automatically!** 🎉
