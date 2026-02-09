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
import os

# =============================================================================
# CONFIGURATION
# =============================================================================

# Paths
SCRIPT_DIR = Path(__file__).parent.parent.parent.parent
BLACKBOX_PATH = SCRIPT_DIR / ".blackbox"
VIBE_WORK_PATH = BLACKBOX_PATH / ".plans" / "active" / "vibe-kanban-work"
BRAIN_INCOMING_PATH = BLACKBOX_PATH / "9-brain" / "incoming"

# Vibe Kanban database location
VIBE_DB_PATH = Path(os.getenv('VIBE_DB_PATH', '/app/vibe-data/vibe-kanban.db'))

# Ensure directories exist
VIBE_WORK_PATH.mkdir(parents=True, exist_ok=True)
BRAIN_INCOMING_PATH.mkdir(parents=True, exist_ok=True)
(BRAIN_INCOMING_PATH / "vibe-kanban-tasks").mkdir(exist_ok=True)
(BRAIN_INCOMING_PATH / "git-commits").mkdir(exist_ok=True)

# Track last seen state
STATE_FILE = VIBE_WORK_PATH / "monitor-state.json"

# =============================================================================
# STATE MANAGEMENT
# =============================================================================

def load_state():
    """Load last seen state"""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return {
        'last_task_id': None,
        'last_attempt_id': None,
        'tasks_seen': [],
        'attempts_seen': [],
        'last_update': None
    }

def save_state(state):
    """Save current state"""
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2, default=str)

# =============================================================================
# DATABASE MONITORING
# =============================================================================

def get_vibe_tasks():
    """Get all tasks from Vibe Kanban database"""

    if not VIBE_DB_PATH.exists():
        print(f"⚠️  Vibe Kanban DB not found at {VIBE_DB_PATH}")
        return []

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
        print(f"❌ Error reading Vibe Kanban DB: {e}")
        return []

def get_task_attempts(task_id):
    """Get attempts for a task"""

    if not VIBE_DB_PATH.exists():
        return []

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
        print(f"❌ Error reading task attempts: {e}")
        return []

# =============================================================================
# TASK HANDLERS
# =============================================================================

def sync_task_to_blackbox(task, attempts, state):
    """Sync a task and its attempts to .blackbox"""

    task_id = task['id']
    title = task['title']
    status = task['status']

    # Check if task is new or updated
    is_new = task_id not in state['tasks_seen']

    if is_new:
        print(f"🆕 New task: {title} (Status: {status})")
        state['tasks_seen'].append(task_id)
    else:
        print(f"📋 Updating task: {title} (Status: {status})")

    # Update progress file
    sync_task_progress(task, attempts)

    # Update active tasks file
    if status in ['todo', 'in_progress', 'in_review']:
        update_active_tasks(task)

    # If completed, move to completed
    if status == 'done':
        move_to_completed(task)
        remove_from_active(task_id)
        sync_to_memory_bank(task)
        update_daily_summary(task, 'completed')
        print(f"✅ Task completed: {title}")

    # If aborted, log failure
    elif status == 'aborted':
        log_task_failure(task, attempts)
        remove_from_active(task_id)
        update_daily_summary(task, 'failed')
        print(f"❌ Task aborted: {title}")

def sync_task_progress(task, attempts):
    """Sync task progress with all attempts"""

    task_id = task['id']
    progress_file = VIBE_WORK_PATH / f"task-{task_id}-progress.md"

    content = f"""# Task Progress: {task['title']}

**ID:** {task['id']}
**Status:** {task['status'].upper()}
**Created:** {task.get('created_at', 'unknown')}
**Updated:** {task.get('updated_at', 'unknown')}

## Description
{task.get('description') or 'No description'}

## Execution Attempts

"""

    if not attempts:
        content += "*No attempts yet*\n"
    else:
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

def update_active_tasks(task):
    """Update active tasks file"""

    active_tasks_file = VIBE_WORK_PATH / "active-tasks.md"

    # Read existing content
    if active_tasks_file.exists():
        with open(active_tasks_file, 'r') as f:
            content = f.read()
    else:
        content = "# Active Vibe Kanban Tasks\n\n*Last updated: " + datetime.now().isoformat() + "*\n\n"

    # Check if task already in file
    task_marker = f"**ID:** {task['id']}"
    if task_marker in content:
        # Update existing entry
        lines = content.split('\n')
        new_lines = []
        skip = False

        for i, line in enumerate(lines):
            if task_marker in line:
                # Found the task, skip until next task
                skip = True
                # Add updated entry
                new_lines.append(f"## Task: {task['title']}")
                new_lines.append("")
                new_lines.append(f"- **ID:** {task['id']}")
                new_lines.append(f"- **Status:** {task['status'].upper()}")
                new_lines.append(f"- **Position:** {task['position']}")
                new_lines.append(f"- **Updated:** {task['updated_at']}")
                new_lines.append("")
                desc = task.get('description', 'No description')[:200]
                new_lines.append(f"**Description:** {desc}...")
                new_lines.append("")
                new_lines.append("---")
                new_lines.append("")
                continue

            if skip and line.startswith('## '):
                skip = False

            if not skip:
                new_lines.append(line)

        content = '\n'.join(new_lines)
    else:
        # Add new entry
        entry = f"""
## Task: {task['title']}

- **ID:** {task['id']}
- **Status:** {task['status'].upper()}
- **Position:** {task['position']}
- **Updated:** {task['updated_at']}
- **Description:** {task.get('description', 'No description')[:200]}...

---

"""
        content += entry

    with open(active_tasks_file, 'w') as f:
        f.write(content)

def remove_from_active(task_id):
    """Remove task from active list"""

    active_tasks_file = VIBE_WORK_PATH / "active-tasks.md"

    if not active_tasks_file.exists():
        return

    with open(active_tasks_file, 'r') as f:
        content = f.read()

    # Remove task entry
    lines = content.split('\n')
    filtered_lines = []
    skip = False

    for line in lines:
        if f"**ID:** {task_id}" in line:
            skip = True
            continue
        if skip and line.startswith('---'):
            skip = False
            continue
        if not skip:
            filtered_lines.append(line)

    with open(active_tasks_file, 'w') as f:
        f.write('\n'.join(filtered_lines))

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

    # Read current content
    with open(summary_file, 'r') as f:
        content = f.read()

    # Add entry to appropriate section
    if status == 'completed':
        if '## Completed Tasks' in content:
            parts = content.split('## Completed Tasks')
            if len(parts) > 1:
                before = parts[0] + '## Completed Tasks\n\n'
                after = parts[1]
                entry = f"### ✅ {task['title']}\n"
                entry += f"- **ID:** {task['id']}\n"
                entry += f"- **Completed:** {datetime.now().strftime('%H:%M')}\n\n"
                content = before + entry + after

    with open(summary_file, 'w') as f:
        f.write(content)

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
    print("⏱️  Polling every 30 seconds")
    print("")

    state = load_state()
    poll_count = 0

    while True:
        try:
            poll_count += 1
            print(f"\n{'='*60}")
            print(f"Poll #{poll_count} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"{'='*60}")

            # Get all tasks from Vibe Kanban
            tasks = get_vibe_tasks()

            if not tasks:
                print("⚠️  No tasks found in Vibe Kanban DB (waiting...)")
            else:
                print(f"📋 Found {len(tasks)} tasks in Vibe Kanban")

                # Process each task
                for task in tasks:
                    task_id = task['id']

                    # Get attempts for this task
                    attempts = get_task_attempts(task_id)

                    # Sync to .blackbox
                    sync_task_to_blackbox(task, attempts, state)

                    # Check for new attempts
                    for attempt in attempts:
                        attempt_id = attempt['id']
                        if attempt_id not in state['attempts_seen']:
                            print(f"🔄 New attempt detected: {attempt['agent_type']} on {task['title']}")
                            state['attempts_seen'].append(attempt_id)

            # Save state
            state['last_update'] = datetime.now().isoformat()
            save_state(state)

            # Update queue status
            if tasks:
                update_queue_status(tasks)

            print(f"✅ Sync complete, waiting 30 seconds...")

            # Wait before next poll (30 seconds)
            time.sleep(30)

        except KeyboardInterrupt:
            print("\n\n⏹️  Monitor stopped by user")
            break

        except Exception as e:
            print(f"❌ Error in monitor loop: {e}")
            import traceback
            traceback.print_exc()
            time.sleep(60)  # Wait longer on error

if __name__ == '__main__':
    monitor_vibe_kanban()
