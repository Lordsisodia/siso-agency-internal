#!/usr/bin/env bash

# Blackbox4 Background Task Manager (Bash 3.2 Compatible)
# Run multiple agents in parallel like a real team

set -e

BLACKBOX4_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TASKS_DIR="$BLACKBOX4_HOME/.runtime/background-tasks"
TASKS_FILE="$TASKS_DIR/tasks.json"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Initialize task manager
init_task_manager() {
    if [ ! -d "$TASKS_DIR" ]; then
        mkdir -p "$TASKS_DIR"
    fi

    if [ ! -f "$TASKS_FILE" ]; then
        echo '[]' > "$TASKS_FILE"
    fi
}

# Add new background task
add_task() {
    local description=""
    local agent="default"
    local priority="normal"

    shift
    while [[ $# -gt 0 ]]; do
        case $1 in
            --agent)
                agent="$2"
                shift 2
                ;;
            --priority)
                priority="$2"
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

    # Trim description
    description=$(echo "$description" | xargs)

    # Generate task ID
    local task_id="bg-$(date +%s)-$$"

    # Create task JSON
    local task_json="{\"id\":\"$task_id\",\"agent\":\"$agent\",\"description\":\"$description\",\"priority\":\"$priority\",\"status\":\"running\",\"started_at\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}"

    # Add to tasks file
    if [ -f "$TASKS_FILE" ]; then
        echo "$task_json" >> "$TASKS_FILE.tmp"
        mv "$TASKS_FILE.tmp" "$TASKS_FILE"
    else
        echo "$task_json" > "$TASKS_FILE"
    fi

    echo "${GREEN}✓ Background task added${NC}"
    echo "  Task ID: $task_id"
    echo "  Agent: $agent"
    echo "  Description: $description"
    echo "  Priority: $priority"
}

# List all background tasks
list_tasks() {
    if [ ! -f "$TASKS_FILE" ]; then
        echo "${YELLOW}No tasks found${NC}"
        return 1
    fi

    echo "${BLUE}Background Tasks:${NC}"
    while IFS= read -r task; do
        local id=$(echo "$task" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        local agent=$(echo "$task" | grep -o '"agent":"[^"]*"' | cut -d'"' -f4)
        local desc=$(echo "$task" | grep -o '"description":"[^"]*"' | cut -d'"' -f4)
        local status=$(echo "$task" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        echo "  $id - $agent - $desc - $status"
    done < "$TASKS_FILE"
}

# Get task status
task_status() {
    local task_id="$1"

    if [ ! -f "$TASKS_FILE" ]; then
        echo "${RED}No tasks file found${NC}"
        return 1
    fi

    grep "\"id\":\"$task_id\"" "$TASKS_FILE" >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "${RED}Task not found: $task_id${NC}"
        return 1
    fi

    echo "${BLUE}Task: $task_id${NC}"
    grep "\"id\":\"$task_id\"" "$TASKS_FILE" | sed 's/","/"\\n  "/g' | sed 's/"//g'
}

# Cancel running task
cancel_task() {
    local task_id="$1"

    if [ ! -f "$TASKS_FILE" ]; then
        echo "${RED}No tasks file found${NC}"
        return 1
    fi

    # Update task status in file
    grep -v "\"id\":\"$task_id\"" "$TASKS_FILE" > "$TASKS_FILE.tmp"
    echo "\"id\":\"$task_id\",\"status\":\"cancelled\"" >> "$TASKS_FILE.tmp"
    mv "$TASKS_FILE.tmp" "$TASKS_FILE"

    echo "${GREEN}✓ Task $task_id cancelled${NC}"
}

# Show statistics
show_stats() {
    if [ ! -f "$TASKS_FILE" ]; then
        echo "${YELLOW}No tasks found${NC}"
        return 1
    fi

    echo "${BLUE}Background Task Statistics:${NC}"
    local total=$(wc -l < "$TASKS_FILE")
    echo "  Total tasks: $total"

    local running=$(grep '"status":"running"' "$TASKS_FILE" | wc -l)
    echo "  Running: $running"

    local completed=$(grep '"status":"completed"' "$TASKS_FILE" | wc -l)
    echo "  Completed: $completed"
}

# Clean up completed tasks
cleanup_tasks() {
    local keep_hours="${1:-24}"

    if [ ! -f "$TASKS_FILE" ]; then
        return 0
    fi

    # Keep only running tasks
    grep '"status":"running"' "$TASKS_FILE" > "$TASKS_FILE.tmp"
    mv "$TASKS_FILE.tmp" "$TASKS_FILE"

    echo "${GREEN}✓ Cleaned up completed tasks${NC}"
}

# Show help
show_help() {
    echo "Blackbox4 Background Task Manager"
    echo ""
    echo "Manage background agent tasks for parallel execution."
    echo ""
    echo "Usage: background-manager.sh <command> [options]"
    echo ""
    echo "Commands:"
    echo "  add <description>          Add new background task"
    echo "  list                       List all background tasks"
    echo "  status <task_id>           Get task status and output"
    echo "  cancel <task_id>          Cancel running task"
    echo "  stats                     Show task statistics"
    echo "  cleanup [hours]           Clean up completed tasks"
    echo ""
    echo "Options:"
    echo "  --agent <agent>           Specify agent (oracle, librarian, explore, etc.)"
    echo "  --priority <priority>     Set priority (low, normal, high)"
    echo ""
    echo "Examples:"
    echo "  # Add a research task"
    echo "  background-manager.sh add \"Research auth patterns\" --agent librarian"
    echo ""
    echo "  # List all tasks"
    echo "  background-manager.sh list"
    echo ""
    echo "  # Get task status"
    echo "  background-manager.sh status bg-123456"
    echo ""
    echo "  # Cancel a task"
    echo "  background-manager.sh cancel bg-123456"
}

# Main
init_task_manager

case "${1:-help}" in
    add)
        add_task "$@"
        ;;
    list|ls)
        list_tasks
        ;;
    status)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Task ID required${NC}"
            exit 1
        fi
        task_status "$2"
        ;;
    cancel)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Task ID required${NC}"
            exit 1
        fi
        cancel_task "$2"
        ;;
    stats)
        show_stats
        ;;
    cleanup)
        cleanup_tasks "${2:-24}"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
