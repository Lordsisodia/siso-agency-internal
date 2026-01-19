#!/usr/bin/env bash

# MCP Monitor Daemon
# Monitors MCP server health and auto-cleanup
# Run this as a background service or via launchd

set -e

# Configuration
MONITOR_INTERVAL=60  # Check every 60 seconds
MCP_LOG_DIR="${HOME}/.mcp-logs"
MCP_STATE_FILE="${MCP_LOG_DIR}/mcp-state.json"
CPU_THRESHOLD=80  # CPU usage threshold
MEM_THRESHOLD=500  # Memory threshold in MB

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

mkdir -p "$MCP_LOG_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$MCP_LOG_DIR/mcp-monitor.log"
}

# Get process resource usage
get_proc_stats() {
    local pid="$1"
    ps -p "$pid" -o pid,%cpu,rss,command 2>/dev/null || echo "0 0 0"
}

# Check if MCP server is healthy
check_mcp_health() {
    local server_name="$1"
    local max_age=7200  # 2 hours in seconds

    while IFS= read -r pid; do
        if [ -n "$pid" ]; then
            local stats=$(get_proc_stats "$pid")
            local cpu=$(echo "$stats" | awk '{print $2}')
            local mem_mb=$(echo "$stats" | awk '{print $3/1024}')

            # Check CPU usage
            if (( $(echo "$cpu > $CPU_THRESHOLD" | bc -l) )); then
                log "⚠ $server_name (PID: $pid) high CPU: ${cpu}%"
            fi

            # Check memory usage
            if (( mem_mb > MEM_THRESHOLD )); then
                log "⚠ $server_name (PID: $pid) high memory: ${mem_mb}MB"
            fi

            # Check process age
            local elapsed=$(( $(date +%s) - $(ps -p "$pid" -o lstart= 2>/dev/null | date -jf "%a %b %d %H:%M:%S %Y" +%s 2>/dev/null || echo "0") ))
            if [ "$elapsed" -gt "$max_age" ]; then
                log "⚠ $server_name (PID: $pid) running for ${elapsed}s, considering restart"
            fi
        fi
    done < <(pgrep -f "$server_name" 2>/dev/null || true)
}

# Cleanup orphaned MCP processes
cleanup_orphans() {
    local cleaned=0

    # Kill duplicate chrome-devtools instances (keep 2)
    local chrome_count=$(pgrep -f "chrome-devtools-mcp" | wc -l)
    if [ "$chrome_count" -gt 2 ]; then
        pkill -9 -f "chrome-devtools-mcp" || true
        log "✓ Cleaned up chrome-devtools instances (was: $chrome_count)"
        cleaned=$((cleaned + chrome_count - 2))
    fi

    # Kill duplicate duckduckgo instances (keep 2)
    local ddg_count=$(pgrep -f "duckduckgo-mcp" | wc -l)
    if [ "$ddg_count" -gt 2 ]; then
        pkill -9 -f "duckduckgo-mcp" || true
        log "✓ Cleaned up duckduckgo instances (was: $ddg_count)"
        cleaned=$((cleaned + ddg_count - 2))
    fi

    # Kill duplicate playwright instances (keep 2)
    local playwright_count=$(pgrep -f "playwright.*mcp" | wc -l)
    if [ "$playwright_count" -gt 2 ]; then
        pkill -9 -f "playwright.*mcp" || true
        log "✓ Cleaned up playwright instances (was: $playwright_count)"
        cleaned=$((cleaned + playwright_count - 2))
    fi

    # Kill duplicate filesystem instances (keep 2)
    local fs_count=$(pgrep -f "mcp-server-filesystem" | wc -l)
    if [ "$fs_count" -gt 2 ]; then
        pkill -9 -f "mcp-server-filesystem" || true
        log "✓ Cleaned up filesystem instances (was: $fs_count)"
        cleaned=$((cleaned + fs_count - 2))
    fi

    # Kill orphaned npm exec processes
    local npm_count=$(pgrep -f "npm exec.*mcp" | wc -l)
    if [ "$npm_count" -gt 6 ]; then
        pkill -9 -f "npm exec.*mcp" || true
        log "✓ Cleaned up orphaned npm exec processes (was: $npm_count)"
        cleaned=$((cleaned + npm_count))
    fi

    return $cleaned
}

# Generate state report
generate_report() {
    local report="{
  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"servers\": {
    \"chrome-devtools\": $(pgrep -f "chrome-devtools-mcp" | wc -l),
    \"duckduckgo\": $(pgrep -f "duckduckgo-mcp" | wc -l),
    \"playwright\": $(pgrep -f "playwright.*mcp" | wc -l),
    \"filesystem\": $(pgrep -f "mcp-server-filesystem" | wc -l),
    \"supabase\": $(pgrep -f "supabase.*mcp" | wc -l)
  },
  \"total_node_processes\": $(pgrep -f "node|mcp" | wc -l),
  \"system\": {
    \"memory_pressure\": $(vm_stat | head -1)
  }
}"

    echo "$report" > "$MCP_STATE_FILE"
}

# Main monitoring loop
main() {
    log "=== MCP Monitor Daemon Started ==="

    while true; do
        log "Running health checks..."

        # Check each MCP server type
        check_mcp_health "chrome-devtools-mcp"
        check_mcp_health "duckduckgo-mcp"
        check_mcp_health "playwright"
        check_mcp_health "mcp-server-filesystem"
        check_mcp_health "supabase"

        # Cleanup orphans
        cleanup_orphans
        local cleaned=$?
        if [ "$cleaned" -gt 0 ]; then
            echo -e "${YELLOW}⚠ Cleaned up $cleaned orphaned MCP processes${NC}"
        fi

        # Generate state report
        generate_report

        # Wait for next interval
        sleep "$MONITOR_INTERVAL"
    done
}

# Run main loop
main
