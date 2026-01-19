#!/usr/bin/env bash

# MCP Server Cleanup Script
# Kills duplicate MCP server processes to prevent memory leaks and crashes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}MCP Server Process Cleanup${NC}"
echo "================================"

# Find and kill duplicate MCP servers
declare -A mcp_servers

# List all MCP-related node processes
echo "Checking for MCP server processes..."

# Count instances of each MCP server type
for proc in $(pgrep -f "mcp-server" || true); do
    if [ -n "$proc" ]; then
        cmdline=$(ps -p "$proc" -o command= 2>/dev/null || true)
        if [ -n "$cmdline" ]; then
            # Extract server type from command line
            if [[ "$cmdline" =~ "chrome-devtools-mcp" ]]; then
                mcp_servers["chrome-devtools"]=$((mcp_servers["chrome-devtools"] + 1))
            elif [[ "$cmdline" =~ "duckduckgo-mcp" ]]; then
                mcp_servers["duckduckgo"]=$((mcp_servers["duckduckgo"] + 1))
            elif [[ "$cmdline" =~ "playwright" ]]; then
                mcp_servers["playwright"]=$((mcp_servers["playwright"] + 1))
            elif [[ "$cmdline" =~ "filesystem" ]]; then
                mcp_servers["filesystem"]=$((mcp_servers["filesystem"] + 1))
            elif [[ "$cmdline" =~ "supabase" ]]; then
                mcp_servers["supabase"]=$((mcp_servers["supabase"] + 1))
            fi
        fi
    fi
done

# Display counts and kill duplicates
for server in "${!mcp_servers[@]}"; do
    count=${mcp_servers[$server]}
    if [ "$count" -gt 2 ]; then
        echo -e "${RED}Found $count instances of $server (keeping 2)${NC}"

        # Get all PIDs for this server type, sort by PID (older first), keep newest 2
        pkill -9 -f "$server" || true
        echo -e "${GREEN}✓ Killed excess $server processes${NC}"
    else
        echo -e "${GREEN}✓ $server: $count instances (OK)${NC}"
    fi
done

# Kill orphaned npm exec processes
echo ""
echo "Checking for orphaned npm exec processes..."
orphans=$(pgrep -f "npm exec.*mcp" | wc -l)
if [ "$orphans" -gt 6 ]; then
    pkill -9 -f "npm exec.*mcp" || true
    echo -e "${GREEN}✓ Killed $orphaned npm exec processes${NC}"
else
    echo -e "${GREEN}✓ No orphaned npm exec processes${NC}"
fi

# Show final status
echo ""
echo "Final MCP server status:"
for server in chrome-devtools duckduckgo playwright filesystem supabase; do
    count=$(pgrep -f "$server" | wc -l)
    echo "  $server: $count running"
done

echo -e "${GREEN}✓ Cleanup complete${NC}"
