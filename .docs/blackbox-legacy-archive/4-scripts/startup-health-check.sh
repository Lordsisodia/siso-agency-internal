#!/usr/bin/env bash

# Startup Health Check Script
# Run this before starting Claude Code agents to ensure clean environment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   MCP Environment Health Check            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Check 1: Count existing MCP processes
echo -e "${BLUE}[1/6]${NC} Checking MCP server processes..."
mcp_count=$(ps aux | grep -E "mcp-server|MCP|mcp" | grep -v grep | wc -l)
echo "  Current MCP processes: $mcp_count"

if [ "$mcp_count" -gt 20 ]; then
    echo -e "${RED}  ⚠ Too many MCP processes detected${NC}"
    read -p "  Clean up? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pkill -9 -f "mcp-server" || true
        pkill -9 -f "npm exec.*mcp" || true
        echo -e "${GREEN}  ✓ Cleaned up excess processes${NC}"
    fi
else
    echo -e "${GREEN}  ✓ MCP process count OK${NC}"
fi

# Check 2: Memory pressure
echo ""
echo -e "${BLUE}[2/6]${NC} Checking memory pressure..."
pages_compressed=$(vm_stat | grep "Pages compressed" | awk '{print $3}' | sed 's/\.//')
if [ "$pages_compressed" -gt 500000 ]; then
    echo -e "${YELLOW}  ⚠ High memory compression detected${NC}"
    echo "  Compressed pages: $pages_compressed"
else
    echo -e "${GREEN}  ✓ Memory pressure OK${NC}"
fi

# Check 3: Disk space
echo ""
echo -e "${BLUE}[3/6]${NC} Checking disk space..."
home_usage=$(df -h "$HOME" | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$home_usage" -gt 90 ]; then
    echo -e "${RED}  ⚠ Home directory nearly full${NC}"
    echo "  Usage: ${home_usage}%"
else
    echo -e "${GREEN}  ✓ Disk space OK${NC}"
fi

# Check 4: Claude configuration
echo ""
echo -e "${BLUE}[4/6]${NC} Checking Claude configuration..."
claude_config="$HOME/.claude/settings.json"
if [ -f "$claude_config" ]; then
    timeout=$(grep -o "API_TIMEOUT_MS.*[0-9]*" "$claude_config" | grep -o "[0-9]*$" || echo "0")
    if [ "$timeout" -gt 600000 ]; then
        echo -e "${YELLOW}  ⚠ API_TIMEOUT_MS is very high (${timeout}ms)${NC}"
    else
        echo -e "${GREEN}  ✓ API_TIMEOUT_MS OK (${timeout}ms)${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠ Claude config not found${NC}"
fi

# Check 5: MCP lock directory
echo ""
echo -e "${BLUE}[5/6]${NC} Checking MCP locks..."
lock_dir="$HOME/.mcp-singleton-locks"
if [ -d "$lock_dir" ]; then
    stale_locks=$(find "$lock_dir" -name "*.lock" -type f | wc -l)
    echo "  Lock files: $stale_locks"
    if [ "$stale_locks" -gt 10 ]; then
        echo -e "${YELLOW}  Cleaning up stale locks...${NC}"
        find "$lock_dir" -name "*.lock" -type f -mmin +120 -delete
        echo -e "${GREEN}  ✓ Cleaned up stale locks${NC}"
    else
        echo -e "${GREEN}  ✓ Lock directory OK${NC}"
    fi
else
    mkdir -p "$lock_dir"
    echo -e "${GREEN}  ✓ Created lock directory${NC}"
fi

# Check 6: VSCode extensions
echo ""
echo -e "${BLUE}[6/6]${NC} Checking VSCode extensions..."
ext_count=$(ls -1 ~/.vscode/extensions 2>/dev/null | grep -v "extensions.json" | wc -l)
echo "  Installed extensions: $ext_count"
echo -e "${GREEN}  ✓ Extension count OK${NC}"

# Summary
echo ""
echo -e "${BLUE}══════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Health check complete!${NC}"
echo ""
echo "You can now start your Claude Code agents."
echo ""
echo "To monitor MCP servers in real-time:"
echo "  watch -n 5 'ps aux | grep -E mcp | grep -v grep'"
echo ""
echo "To view MCP logs:"
echo "  tail -f ~/.mcp-logs/mcp-monitor.log"
echo ""
