#!/usr/bin/env bash

# MCP Monitor Daemon for Black Box 5
# Monitors all MCP processes system-wide and prevents crashes

set -e

# Configuration
BB5_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
MCP_LOG_DIR="${HOME}/.mcp-logs"
MCP_STATE_FILE="${MCP_LOG_DIR}/mcp-state.json"

# Settings
MAX_INSTANCES=2
CPU_THRESHOLD=80
MEMORY_THRESHOLD_MB=500
MONITOR_INTERVAL=60

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Create log directory
mkdir -p "$MCP_LOG_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$MCP_LOG_DIR/mcp-monitor.log"
}

# Count MCP processes by type
count_mcp_processes() {
    local server_type="$1"
    pgrep -f "$server_type" 2>/dev/null | wc -l
}

# Cleanup excess MCP processes
cleanup_mcp_processes() {
    local cleaned=0

    # Chrome DevTools
    local chrome_count=$(count_mcp_processes "chrome-devtools-mcp")
    if [ "$chrome_count" -gt "$MAX_INSTANCES" ]; then
        log "Cleaning up chrome-devtools (count: $chrome_count, max: $MAX_INSTANCES)"
        pkill -9 -f "chrome-devtools-mcp" || true
        cleaned=$((cleaned + chrome_count - MAX_INSTANCES))
    fi

    # DuckDuckGo
    local ddg_count=$(count_mcp_processes "duckduckgo-mcp")
    if [ "$ddg_count" -gt "$MAX_INSTANCES" ]; then
        log "Cleaning up duckduckgo (count: $ddg_count, max: $MAX_INSTANCES)"
        pkill -9 -f "duckduckgo-mcp" || true
        cleaned=$((cleaned + ddg_count - MAX_INSTANCES))
    fi

    # Playwright
    local playwright_count=$(count_mcp_processes "playwright.*mcp")
    if [ "$playwright_count" -gt "$MAX_INSTANCES" ]; then
        log "Cleaning up playwright (count: $playwright_count, max: $MAX_INSTANCES)"
        pkill -9 -f "playwright.*mcp" || true
        cleaned=$((cleaned + playwright_count - MAX_INSTANCES))
    fi

    # Filesystem
    local fs_count=$(count_mcp_processes "mcp-server-filesystem")
    if [ "$fs_count" -gt "$MAX_INSTANCES" ]; then
        log "Cleaning up filesystem (count: $fs_count, max: $MAX_INSTANCES)"
        pkill -9 -f "mcp-server-filesystem" || true
        cleaned=$((cleaned + fs_count - MAX_INSTANCES))
    fi

    # Orphaned npm exec
    local npm_count=$(pgrep -f "npm exec.*mcp" 2>/dev/null | wc -l)
    if [ "$npm_count" -gt 6 ]; then
        log "Cleaning up orphaned npm exec (count: $npm_count)"
        pkill -9 -f "npm exec.*mcp" || true
        cleaned=$((cleaned + npm_count))
    fi

    if [ "$cleaned" -gt 0 ]; then
        log -e "${GREEN}✓ Cleaned up $cleaned MCP processes${NC}"
    fi
}

# Generate state report
generate_state_report() {
    local chrome_count=$(count_mcp_processes "chrome-devtools-mcp")
    local ddg_count=$(count_mcp_processes "duckduckgo-mcp")
    local playwright_count=$(count_mcp_processes "playwright.*mcp")
    local fs_count=$(count_mcp_processes "mcp-server-filesystem")
    local total_mcp=$(pgrep -f "mcp" 2>/dev/null | wc -l)

    cat > "$MCP_STATE_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "servers": {
    "chrome-devtools": $chrome_count,
    "duckduckgo": $ddg_count,
    "playwright": $playwright_count,
    "filesystem": $fs_count
  },
  "total_mcp_processes": $total_mcp,
  "max_instances_per_type": $MAX_INSTANCES,
  "last_cleanup": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
}

# Main monitoring loop
main() {
    log "=== MCP Monitor Daemon Started ==="
    log "Monitoring interval: ${MONITOR_INTERVAL}s"
    log "Max instances per type: $MAX_INSTANCES"

    while true; do
        cleanup_mcp_processes
        generate_state_report
        sleep "$MONITOR_INTERVAL"
    done
}

# Run main loop
main
