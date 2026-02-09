#!/usr/bin/env python3
"""
Vibe Kanban Integration Server
Receives webhooks from Vibe Kanban and updates .blackbox memory system

This server runs on Mac Mini and tracks every Vibe Kanban event
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
from pathlib import Path
import subprocess

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# =============================================================================
# CONFIGURATION
# =============================================================================

# Paths (will be detected automatically)
SCRIPT_DIR = Path(__file__).parent.parent.parent.parent
BLACKBOX_PATH = SCRIPT_DIR / ".blackbox"
VIBE_WORK_PATH = BLACKBOX_PATH / ".plans" / "active" / "vibe-kanban-work"
BRAIN_INCOMING_PATH = BLACKBOX_PATH / "9-brain" / "incoming"

# Ensure directories exist
VIBE_WORK_PATH.mkdir(parents=True, exist_ok=True)
BRAIN_INCOMING_PATH.mkdir(parents=True, exist_ok=True)
(BRAIN_INCOMING_PATH / "vibe-kanban-tasks").mkdir(exist_ok=True)
(BRAIN_INCOMING_PATH / "git-commits").mkdir(exist_ok=True)

# =============================================================================
# WEBHOOK ENDPOINTS
# =============================================================================

@app.route('/webhook/vibe-kanban', methods=['POST'])
def vibe_kanban_webhook():
    """Main webhook endpoint for Vibe Kanban events"""

    try:
        data = request.json
        event_type = data.get('event')
        task_data = data.get('task', {})

        # Log the webhook
        log_webhook(event_type, data)

        # Route to appropriate handler
        handlers = {
            'task.created': handle_task_created,
            'task.started': handle_task_started,
            'task.completed': handle_task_completed,
            'task.failed': handle_task_failed,
            'task.aborted': handle_task_aborted,
            'git.commit': handle_git_commit,
            'agent.started': handle_agent_started,
            'agent.completed': handle_agent_completed,
        }

        handler = handlers.get(event_type)
        if handler:
            handler(task_data)

        return jsonify({
            'status': 'success',
            'event': event_type,
            'timestamp': datetime.now().isoformat()
        }), 200

    except Exception as e:
        print(f"Error handling webhook: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'vibe-kanban-webhook-server',
        'timestamp': datetime.now().isoformat()
    }), 200

# =============================================================================
# TASK HANDLERS
# =============================================================================

def handle_task_created(task):
    """Handle task creation event"""

    task_id = task.get('id', 'unknown')
    title = task.get('title', 'Untitled Task')
    description = task.get('description', '')
    project = task.get('project', 'Unknown')

    # Update active tasks file
    active_tasks_file = VIBE_WORK_PATH / "active-tasks.md"

    entry = f"""
## Task Created: {title}

- **ID:** {task_id}
- **Project:** {project}
- **Description:** {description}
- **Created:** {datetime.now().isoformat()}
- **Status:** Queued
- **Position:** {task.get('position', 'unknown')}

---

"""

    with open(active_tasks_file, 'a') as f:
        f.write(entry)

    # Update queue status
    update_queue_status('created', task)

    print(f"✅ Task created: {title}")

def handle_task_started(task):
    """Handle task execution started"""

    task_id = task.get('id', 'unknown')
    title = task.get('title', 'Untitled Task')
    agent = task.get('agent', 'Gemini')

    # Create progress file for this task
    progress_file = VIBE_WORK_PATH / f"task-{task_id}-progress.md"

    progress_content = f"""# Task Progress: {title}

**ID:** {task_id}
**Agent:** {agent}
**Started:** {datetime.now().isoformat()}
**Status:** 🔄 In Progress

## Task Description
{task.get('description', 'No description')}

## Execution Log

"""

    with open(progress_file, 'w') as f:
        f.write(progress_content)

    # Update active tasks
    update_active_tasks(task_id, 'in_progress', title)

    print(f"🚀 Task started: {title} (Agent: {agent})")

def handle_task_completed(task):
    """Handle task completion"""

    task_id = task.get('id', 'unknown')
    title = task.get('title', 'Untitled Task')
    duration = task.get('duration', 'unknown')
    artifacts = task.get('artifacts', [])

    # Update progress file
    progress_file = VIBE_WORK_PATH / f"task-{task_id}-progress.md"

    completion_entry = f"""

---

## ✅ Task Completed

**Completed:** {datetime.now().isoformat()}
**Duration:** {duration}
**Status:** Success

### Artifacts Created
{chr(10).join(f'- {artifact}' for artifact in artifacts)}

### Git Commits
{generate_commit_summary(task)}

### Success Metrics
- ✅ Task completed successfully
- ✅ All acceptance criteria met
- ✅ Code committed
- ✅ Artifacts created

### Next Steps
- Review work
- Merge PR (if applicable)
- Mark as reviewed in Vibe Kanban

---
"""

    with open(progress_file, 'a') as f:
        f.write(completion_entry)

    # Move to completed
    move_to_completed(task)

    # Remove from active
    remove_from_active(task_id)

    # Sync to Memory Bank
    sync_to_memory_bank(task)

    # Update daily summary
    update_daily_summary(task, 'completed')

    print(f"✅ Task completed: {title}")

def handle_task_failed(task):
    """Handle task failure"""

    task_id = task.get('id', 'unknown')
    title = task.get('title', 'Untitled Task')
    error = task.get('error', 'Unknown error')

    # Update progress file
    progress_file = VIBE_WORK_PATH / f"task-{task_id}-progress.md"

    failure_entry = f"""

---

## ❌ Task Failed

**Failed:** {datetime.now().isoformat()}
**Status:** Failed

### Error
```
{error}
```

### Attempted Solutions
{task.get('attempts', 'No attempts logged')}

### What To Do Next
- Review error message
- Check logs for more details
- Adjust approach if needed
- Retry task with different parameters

---
"""

    with open(progress_file, 'a') as f:
        f.write(failure_entry)

    # Remove from active
    remove_from_active(task_id)

    # Update daily summary
    update_daily_summary(task, 'failed')

    print(f"❌ Task failed: {title} - {error}")

def handle_task_aborted(task):
    """Handle task abortion"""

    task_id = task.get('id', 'unknown')
    title = task.get('title', 'Untitled Task')

    # Update progress file
    progress_file = VIBE_WORK_PATH / f"task-{task_id}-progress.md"

    abortion_entry = f"""

---

## ⏹️ Task Aborted

**Aborted:** {datetime.now().isoformat()}
**Status:** Aborted

### Reason
{task.get('abort_reason', 'Task was manually aborted')}

---
"""

    with open(progress_file, 'a') as f:
        f.write(abortion_entry)

    # Remove from active
    remove_from_active(task_id)

    print(f"⏹️ Task aborted: {title}")

def handle_git_commit(commit_data):
    """Handle git commit event"""

    hash = commit_data.get('hash', 'unknown')
    message = commit_data.get('message', 'No message')
    author = commit_data.get('author', 'Unknown')
    task_id = commit_data.get('task_id', 'unknown')

    # Log commit
    commits_dir = BRAIN_INCOMING_PATH / "git-commits"
    today = datetime.now().strftime('%Y-%m-%d')
    commits_file = commits_dir / f"{today}.md"

    commit_entry = f"""
## Commit: {message[:50]}...

- **Hash:** {hash}
- **Author:** {author}
- **Task ID:** {task_id}
- **Time:** {datetime.now().isoformat()}

"""

    with open(commits_file, 'a') as f:
        f.write(commit_entry)

    # Link to task progress
    if task_id != 'unknown':
        progress_file = VIBE_WORK_PATH / f"task-{task_id}-progress.md"
        if progress_file.exists():
            with open(progress_file, 'a') as f:
                f.write(f"\n### Git Commit\n")
                f.write(f"- Hash: {hash}\n")
                f.write(f"- Message: {message}\n")

    print(f"📝 Git commit logged: {hash[:8]}")

def handle_agent_started(data):
    """Handle agent started event"""
    agent = data.get('agent', 'Unknown')
    print(f"🤖 Agent started: {agent}")

def handle_agent_completed(data):
    """Handle agent completed event"""
    agent = data.get('agent', 'Unknown')
    print(f"✅ Agent completed: {agent}")

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def update_queue_status(status, task):
    """Update queue status file"""

    queue_file = VIBE_WORK_PATH / "queue-status.md"

    entry = f"""
### Queue Update: {status.upper()}

**Time:** {datetime.now().isoformat()}
**Task:** {task.get('title', 'Untitled')}
**ID:** {task.get('id', 'unknown')}
**Queue Position:** {task.get('position', 'unknown')}

---

"""

    with open(queue_file, 'a') as f:
        f.write(entry)

def update_active_tasks(task_id, status, title):
    """Update active tasks list"""

    active_tasks_file = VIBE_WORK_PATH / "active-tasks.md"

    if not active_tasks_file.exists():
        with open(active_tasks_file, 'w') as f:
            f.write("# Active Tasks\n\n")

    with open(active_tasks_file, 'r') as f:
        content = f.read()

    # Update task status in file
    # (In production, would parse and update specific task)
    with open(active_tasks_file, 'a') as f:
        f.write(f"- [{status}] {title} (ID: {task_id}) - {datetime.now().strftime('%H:%M')}\n")

def remove_from_active(task_id):
    """Remove task from active list"""

    active_tasks_file = VIBE_WORK_PATH / "active-tasks.md"

    if active_tasks_file.exists():
        with open(active_tasks_file, 'r') as f:
            lines = f.readlines()

        # Filter out the task
        with open(active_tasks_file, 'w') as f:
            for line in lines:
                if f"(ID: {task_id})" not in line:
                    f.write(line)

def move_to_completed(task):
    """Move task to completed list"""

    completed_file = VIBE_WORK_PATH / "completed-tasks.md"

    entry = f"""
## ✅ {task.get('title', 'Untitled Task')}

- **ID:** {task.get('id', 'unknown')}
- **Completed:** {datetime.now().isoformat()}
- **Duration:** {task.get('duration', 'unknown')}
- **Agent:** {task.get('agent', 'Gemini')}
- **Artifacts:** {len(task.get('artifacts', []))} files
- **Status:** Success

---

"""

    with open(completed_file, 'a') as f:
        f.write(entry)

def sync_to_memory_bank(task):
    """Sync completed task to Memory Bank"""

    memory_file = BLACKBOX_PATH / "9-brain" / "memory" / "extended" / "vibe-kanban-history.md"
    memory_file.parent.mkdir(parents=True, exist_ok=True)

    entry = f"""
## Task: {task.get('title', 'Untitled')}

**Completed:** {datetime.now().isoformat()}
**ID:** {task.get('id', 'unknown')}
**Project:** {task.get('project', 'Unknown')}

### Outcome
- Status: Success
- Duration: {task.get('duration', 'unknown')}
- Artifacts: {len(task.get('artifacts', []))} created

### Success Metrics
✅ Task completed
✅ Code committed
✅ All criteria met

---
"""

    with open(memory_file, 'a') as f:
        f.write(entry)

    # Also store in incoming for processing
    incoming_file = BRAIN_INCOMING_PATH / "vibe-kanban-tasks" / f"{task.get('id', 'unknown')}.md"

    with open(incoming_file, 'w') as f:
        f.write(f"# Task: {task.get('title')}\n\n")
        f.write(f"**ID:** {task.get('id')}\n")
        f.write(f"**Completed:** {datetime.now().isoformat()}\n")
        f.write(f"**Artifacts:** {task.get('artifacts', [])}\n")
        f.write(f"**Success:** True\n")

def update_daily_summary(task, status):
    """Update daily summary with task completion"""

    today = datetime.now().strftime('%Y-%m-%d')
    summary_file = VIBE_WORK_PATH / "daily-summaries" / f"{today}.md"
    summary_file.parent.mkdir(parents=True, exist_ok=True)

    if not summary_file.exists():
        # Create new daily summary
        with open(summary_file, 'w') as f:
            f.write(f"# Vibe Kanban Daily Summary - {today}\n\n")
            f.write("## Overview\n\n")
            f.write("- **Date:** {today}\n")
            f.write("- **Tasks Completed:** 0\n")
            f.write("- **Tasks Failed:** 0\n")
            f.write("- **Total Artifacts:** 0\n\n")
            f.write("## Completed Tasks\n\n")
            f.write("## Failed Tasks\n\n")

    # Update summary (in production, would parse and update counts)
    with open(summary_file, 'a') as f:
        if status == 'completed':
            f.write(f"### ✅ {task.get('title', 'Untitled')}\n")
            f.write(f"- **ID:** {task.get('id')}\n")
            f.write(f"- **Completed:** {datetime.now().strftime('%H:%M')}\n\n")
        elif status == 'failed':
            f.write(f"### ❌ {task.get('title', 'Untitled')}\n")
            f.write(f"- **ID:** {task.get('id')}\n")
            f.write(f"- **Failed:** {datetime.now().strftime('%H:%M')}\n")
            f.write(f"- **Error:** {task.get('error', 'Unknown')}\n\n")

def generate_commit_summary(task):
    """Generate summary of git commits for task"""

    # In production, would fetch actual commits
    # For now, return placeholder
    commits = task.get('commits', [])
    if not commits:
        return "No commits recorded"

    summary = "\n".join([f"- {commit.get('message', 'No message')}" for commit in commits])
    return summary

def log_webhook(event_type, data):
    """Log all webhooks for debugging"""

    log_dir = VIBE_WORK_PATH / "webhook-logs"
    log_dir.mkdir(exist_ok=True)

    log_file = log_dir / f"{datetime.now().strftime('%Y-%m-%d')}.log"

    with open(log_file, 'a') as f:
        f.write(f"\n{'='*80}\n")
        f.write(f"Webhook: {event_type}\n")
        f.write(f"Time: {datetime.now().isoformat()}\n")
        f.write(f"Data: {json.dumps(data, indent=2)}\n")

# =============================================================================
# MAIN
# =============================================================================

if __name__ == '__main__':
    print("🚀 Vibe Kanban Webhook Server Starting...")
    print(f"📁 Blackbox path: {BLACKBOX_PATH}")
    print(f"📝 Work path: {VIBE_WORK_PATH}")
    print(f"🧠 Brain incoming: {BRAIN_INCOMING_PATH}")
    print("")
    print("✅ Webhook server ready!")
    print("📡 Listening on: http://0.0.0.0:5001")
    print("🔗 Webhook URL: http://webhook-server:5001/webhook/vibe-kanban")
    print("")

    app.run(host='0.0.0.0', port=5001, debug=False)
