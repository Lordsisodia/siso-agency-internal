#!/bin/bash
#
# Status checker for OhMyOpenCode background tasks
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BB3_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BG_DIR="${BB3_ROOT}/.background"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check specific task or all
TASK_ID="$1"

if [[ -z "$TASK_ID" || "$TASK_ID" == "--all" || "$TASK_ID" == "-a" ]]; then
    # List all tasks
    echo "=== Background Tasks ==="
    echo

    if [[ ! -d "$BG_DIR" ]]; then
        echo -e "${YELLOW}No background tasks directory${NC}"
        exit 0
    fi

    FOUND=false
    for AGENT_DIR in "$BG_DIR"/*; do
        if [[ -d "$AGENT_DIR" ]]; then
            AGENT_NAME=$(basename "$AGENT_DIR")
            echo -e "${BLUE}Agent: ${AGENT_NAME}${NC}"

            for PID_FILE in "$AGENT_DIR"/*.pid; do
                if [[ -f "$PID_FILE" ]]; then
                    FOUND=true
                    TASK_BASE=$(basename "$PID_FILE" .pid)
                    PID=$(cat "$PID_FILE")

                    if ps -p "$PID" > /dev/null 2>&1; then
                        STATUS="${GREEN}Running${NC}"
                    else
                        STATUS="${YELLOW}Completed${NC}"
                    fi

                    echo -e "  Task: ${TASK_BASE}"
                    echo -e "  PID: ${PID}"
                    echo -e "  Status: ${STATUS}"

                    # Show last few lines of log if exists
                    LOG_FILE="${AGENT_DIR}/${TASK_BASE}.log"
                    if [[ -f "$LOG_FILE" ]]; then
                        echo -e "  Last log:"
                        tail -3 "$LOG_FILE" | sed 's/^/    /'
                    fi

                    echo
                fi
            done
        fi
    done

    if [[ "$FOUND" == false ]]; then
        echo -e "${YELLOW}No background tasks found${NC}"
    fi

else
    # Check specific task
    # Find the task file
    TASK_FILE=""
    for AGENT_DIR in "$BG_DIR"/*; do
        if [[ -d "$AGENT_DIR" ]]; then
            if [[ -f "${AGENT_DIR}/${TASK_ID}.pid" ]]; then
                TASK_FILE="${AGENT_DIR}/${TASK_ID}"
                break
            fi
        fi
    done

    if [[ -z "$TASK_FILE" ]]; then
        echo -e "${RED}Task not found: ${TASK_ID}${NC}"
        echo "Use --all to list all tasks"
        exit 1
    fi

    PID_FILE="${TASK_FILE}.pid"
    LOG_FILE="${TASK_FILE}.log"
    RESULT_FILE="${TASK_FILE}-result.json"

    if [[ ! -f "$PID_FILE" ]]; then
        echo -e "${RED}PID file not found for task: ${TASK_ID}${NC}"
        exit 1
    fi

    PID=$(cat "$PID_FILE")

    echo "=== Task: ${TASK_ID} ==="
    echo

    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "Status: ${GREEN}Running${NC}"
    else
        echo -e "Status: ${YELLOW}Completed${NC}"
    fi

    echo "PID: ${PID}"

    if [[ -f "$LOG_FILE" ]]; then
        echo
        echo "=== Log Output ==="
        tail -20 "$LOG_FILE"
    fi

    if [[ -f "$RESULT_FILE" ]]; then
        echo
        echo "=== Results ==="
        cat "$RESULT_FILE"
    fi
fi
