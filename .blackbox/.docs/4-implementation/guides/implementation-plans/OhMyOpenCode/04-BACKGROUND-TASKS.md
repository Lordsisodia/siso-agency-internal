# Background Task System for Blackbox3
**Status**: Planning Phase

## Overview

Add Oh-My-OpenCode\'s proven background task system to Blackbox3. This enables parallel work like a real team - let agents run in the background while you continue working.

## Why This Matters

**Current**: Only manual execution or Ralph loops (single-threaded)
**After**: Run multiple agents in parallel, get notifications when complete, monitor progress

## What You Get

1. **Parallel Agent Execution**: Run multiple agents simultaneously
2. **Task Management**: Create, list, wait for, cancel background tasks
3. **Notifications**: Get notified when tasks complete
4. **Progress Tracking**: Monitor running tasks in real-time
5. **Integration with Ralph**: Background tasks work seamlessly with autonomous loops

## Files to Create

### 1. Background Manager Script

**File**: `scripts/background-manager.sh`

```bash
#!/usr/bin/env bash

# Blackbox3 Background Task Manager
# Runs agents in background, manages task lifecycle

set -e

BLACKBOX3_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
TASKS_DIR="$BLACKBOX3_HOME/.bb3-tasks"
TASKS_FILE="$TASKS_DIR/tasks.json"
SESSION_ID=""

# Colors
GREEN=\'\\033[0;32m\'
BLUE=\'\\033[0;34m\'
YELLOW=\'\\033[1;33m\'
RED=\'\\033[0;31m\'
NC=\'\\033[0m\'

# Functions
show_help() {
    echo "Blackbox3 Background Manager"
    echo ""
    echo "Manage background agent tasks"
    echo ""
    echo "Usage: blackbox3 background <command> [options]"
    echo ""
    echo "Commands:"
    echo "  add <description> --agent <agent>   Add new background task"
    echo "  list                               List all background tasks"
    echo "  status <task_id>                   Get task status and output"
    echo "  wait <task_id>                    Wait for task to complete"
    echo "  cancel <task_id>                 Cancel running task"
    echo ""
    echo "Options:"
    echo "  --agent <agent>                   Specify agent (oracle, librarian, explore, etc.)"
    echo "  --monitor                           Enable tmux monitoring"
    echo "  --help                              Show this help"
}

init_task_manager() {
    if [ ! -f "$TASKS_DIR" ]; then
        mkdir -p "$TASKS_DIR"
    fi
    
    if [ ! -f "$TASKS_FILE" ]; then
        echo '[]' > "$TASKS_FILE"
    fi
}

add_task() {
    local description=""
    local agent=""
    shift
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --agent)
                agent="$2"
                shift 2
                ;;
            *)
                description="$description $1"
                shift
                ;;
        esac
    done
    
    if [ -z "$description" ]; then
        echo "${RED}Error: Task description required${NC}"
        return 1
    fi
    
    # Get session ID (generate if needed)
    if [ -z "$SESSION_ID" ]; then
        SESSION_ID="bb3-bg-$(date +%s)-$RANDOM"
    fi
    
    # Generate task ID
    local task_id="bg-$(date +%s)-$RANDOM"
    
    # Create task object
    local task=$(cat <<TASKEOF
{
  "id": "$task_id",
  "sessionID": "$SESSION_ID",
  "parentSessionID": "$SESSION_ID",
  "parentMessageID": "",
  "description": "$description",
  "agent": "$agent",
  "status": "running",
  "startedAt": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")",
  "progress": {
    "toolCalls": 0,
    "lastUpdate": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")"
  }
}
TASKEOF
)
    
    # Add to tasks list
    local tasks=$(cat "$TASKS_FILE")
    tasks=$(echo "$tasks" | jq --argjson "$task" \'. += [$task]')
    echo "$tasks" > "$TASKS_FILE"
    
    echo "${GREEN}✓ Background task added${NC}"
    echo "  Task ID: $task_id"
    echo "  Agent: $agent"
    echo "  Description: $description"
    echo "  Session ID: $SESSION_ID"
}

list_tasks() {
    if [ ! -f "$TASKS_FILE" ]; then
        echo "${YELLOW}No tasks found${NC}"
        return 1
    fi
    
    echo "${BLUE}Background Tasks:${NC}"
    jq -r \'.[] | "\(.id) - \(.agent) - \(.description) - \(.status)"' "$TASKS_FILE"
}

task_status() {
    local task_id="$1"
    
    local task=$(jq -r --arg id "$task_id" \'.[] | select(.id == $id)' "$TASKS_FILE")
    
    if [ -z "$task" ]; then
        echo "${RED}Task not found: $task_id${NC}"
        return 1
    fi
    
    echo "${BLUE}Task: $task_id${NC}"
    echo "  Status: $(echo "$task" | jq -r \'.status')"
    echo "  Agent: $(echo "$task" | jq -r \'.agent')"
    echo "  Description: $(echo "$task" | jq -r \'.description')"
    echo "  Started: $(echo "$task" | jq -r \'.startedAt')"
    
    if [ "$(echo "$task" | jq -r \'.status')" = "completed" ]; then
        echo "  Completed: $(echo "$task" | jq -r \'.completedAt')"
    fi
}

wait_task() {
    local task_id="$1"
    
    echo "${YELLOW}Waiting for task $task_id...${NC}"
    
    local status="running"
    while [ "$status" = "running" ]; do
        sleep 2
        status=$(jq -r --arg id "$task_id" \'.[] | select(.id == $id) | .[0].status' "$TASKS_FILE")
    done
    
    task_status "$task_id"
}

cancel_task() {
    local task_id="$1"
    
    # Update task status
    jq --arg id "$task_id" --arg status "cancelled" '.[] | select(.id == $id) | .status = $status' "$TASKS_FILE" > "$TASKS_FILE.tmp"
    mv "$TASKS_FILE.tmp" "$TASKS_FILE"
    
    echo "${GREEN}✓ Task $task_id cancelled${NC}"
}

# Main
case "${1:-help}" in
    add)
        init_task_manager
        add_task "$@"
        ;;
    list)
        init_task_manager
        list_tasks
        ;;
    status)
        init_task_manager
        task_status "$2"
        ;;
    wait)
        init_task_manager
        wait_task "$2"
        ;;
    cancel)
        init_task_manager
        cancel_task "$2"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "${RED}Unknown command: $1${NC}"
        show_help
        ;;
esac
