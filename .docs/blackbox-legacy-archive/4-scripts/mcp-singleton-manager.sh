#!/usr/bin/env bash

# MCP Singleton Manager
# Ensures only one instance of each MCP server type runs per user session
# Place this in your shell profile (bashrc/zshrc) or run before starting agents

set -e

# Configuration
MCP_LOCK_DIR="${HOME}/.mcp-singleton-locks"
MCP_LOG_DIR="${HOME}/.mcp-logs"
MCP_MAX_INSTANCES=2  # Maximum instances per server type

# Create directories
mkdir -p "$MCP_LOCK_DIR" "$MCP_LOG_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$MCP_LOG_DIR/mcp-manager.log"
}

# Check if an MCP server is already running
is_mcp_running() {
    local server_name="$1"
    local lock_file="$MCP_LOCK_DIR/${server_name}.lock"

    if [ -f "$lock_file" ]; then
        local pid=$(cat "$lock_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0  # Running
        else
            rm -f "$lock_file"  # Stale lock
            return 1  # Not running
        fi
    fi
    return 1  # Not running
}

# Register an MCP server
register_mcp_server() {
    local server_name="$1"
    local pid="$2"
    local lock_file="$MCP_LOCK_DIR/${server_name}.lock"

    # Remove stale locks for this server
    rm -f "${MCP_LOCK_DIR}/${server_name}-"*.lock

    # Create new lock
    echo "$pid" > "$lock_file"
    log "Registered $server_name with PID $pid"
}

# Wrapper for npx MCP server calls
mcp_npx() {
    local server_name="$1"
    shift

    # Count existing instances
    local count=$(pgrep -f "$server_name" | wc -l)

    if [ "$count" -ge "$MCP_MAX_INSTANCES" ]; then
        echo -e "${YELLOW}⚠ $server_name already has $count instances (max: $MCP_MAX_INSTANCES)${NC}"
        echo "Using existing instance..."
        return 0
    fi

    # Start new instance
    log "Starting $server_name (instance $((count + 1)))"
    npx "$@" &
    local pid=$!
    register_mcp_server "$server_name-$pid" "$pid"

    # Wait briefly to ensure it started
    sleep 0.5

    if ps -p "$pid" > /dev/null 2>&1; then
        log "Started $server_name (PID: $pid)"
        return 0
    else
        log "Failed to start $server_name"
        return 1
    fi
}

# Export functions for use in subshells
export -f is_mcp_running
export -f register_mcp_server
export -f mcp_npx

# Clean up on exit
cleanup_mcp_locks() {
    log "Cleaning up MCP locks..."
    find "$MCP_LOCK_DIR" -name "*.lock" -type f -while read lock; do
        pid=$(cat "$lock")
        if ! ps -p "$pid" > /dev/null 2>&1; then
            rm -f "$lock"
            log "Removed stale lock: $lock"
        fi
    done
}

# Run cleanup on script exit
trap cleanup_mcp_locks EXIT

# Initial cleanup
cleanup_mcp_locks

echo -e "${GREEN}✓ MCP Singleton Manager initialized${NC}"
echo "  Lock dir: $MCP_LOCK_DIR"
echo "  Log dir: $MCP_LOG_DIR"
echo "  Max instances per server: $MCP_MAX_INSTANCES"
