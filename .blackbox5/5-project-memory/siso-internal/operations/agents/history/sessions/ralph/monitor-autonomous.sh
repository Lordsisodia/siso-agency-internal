#!/bin/bash
# Monitor Ralph Autonomous Operation
# Real-time dashboard showing Ralph's autonomous GitHub monitoring

set -e

WORKSPACE="$(pwd)"
cd "$WORKSPACE"

# Configuration
STATE_FILE="$WORKSPACE/.blackbox5/engine/operations/runtime/ralph/github_state.json"
PID_FILE="$WORKSPACE/.blackbox/.plans/active/vibe-kanban-work/ralph.pid"
LOG_DIR="$WORKSPACE/.blackbox/.plans/active/vibe-kanban-work"
OUTPUT_DIR="$WORKSPACE/.blackbox5/engine/operations/runtime/ralph/framework-github"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Ralph Runtime - Autonomous Monitoring Dashboard         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Ralph is running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Status: RUNNING${NC}"
        echo -e "  Process ID: ${CYAN}$PID${NC}"
        echo -e "  Uptime: $(ps -p $PID -o etime= 2>/dev/null | tr -d ' ')"
    else
        echo -e "${RED}✗ Status: NOT RUNNING${NC}"
        echo -e "  Process $PID not found"
        echo ""
        echo "Ralph is not running. Start it with:"
        echo "  bash .blackbox5/engine/operations/runtime/ralph/start-framework-research.sh"
        exit 1
    fi
else
    echo -e "${RED}✗ Status: NOT RUNNING${NC}"
    echo "  No PID file found"
    echo ""
    echo "Start Ralph with:"
    echo "  bash .blackbox5/engine/operations/runtime/ralph/start-framework-research.sh"
    exit 1
fi

echo ""

# Show GitHub State
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📊 GitHub State Tracking${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "$STATE_FILE" ]; then
    echo -e "${BLUE}State File:${NC} $STATE_FILE"
    echo ""
    echo "Recent State:"
    cat "$STATE_FILE" | python3 -m json.tool 2>/dev/null || cat "$STATE_FILE"
else
    echo -e "${YELLOW}⚠️  State file not found yet${NC}"
    echo "Ralph will create it after first GitHub fetch"
fi

echo ""

# Show Output Files
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📁 Generated Analysis Files${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -d "$OUTPUT_DIR" ]; then
    for file in "$OUTPUT_DIR"/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            filesize=$(du -h "$file" | cut -f1)
            modtime=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$file" 2>/dev/null || stat -c "%y" "$file" 2>/dev/null | cut -d'.' -f1)
            echo -e "${CYAN}• ${filename}${NC}"
            echo -e "  Size: ${filesize}  |  Modified: ${modtime}"
        fi
    done
else
    echo -e "${YELLOW}⚠️  Output directory not found yet${NC}"
fi

echo ""

# Show Recent Log Activity
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📋 Recent Activity (Last 20 lines)${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

LOG_FILE="$LOG_DIR/ralph-framework-research.log"
if [ -f "$LOG_FILE" ]; then
    tail -20 "$LOG_FILE"
else
    echo -e "${YELLOW}⚠️  Log file not found: $LOG_FILE${NC}"
fi

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Show Commands
echo -e "${GREEN}Commands:${NC}"
echo -e "  ${CYAN}tail -f $LOG_FILE${NC}           - Watch live logs"
echo -e "  ${CYAN}kill $PID${NC}                   - Stop Ralph"
echo -e "  ${CYAN}bash $0${NC}                     - Refresh this dashboard"
echo ""

# Check for new issues periodically
echo -e "${GREEN}Press Ctrl+C to exit. Running in monitor mode...${NC}"
echo ""

# Monitor mode - refresh every 5 seconds
while true; do
    sleep 5
    clear

    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     Ralph Runtime - Autonomous Monitoring Dashboard         ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Last updated: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""

    # Check if still running
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Status: RUNNING${NC} (PID: $PID)"
    else
        echo -e "${RED}✗ Status: STOPPED${NC}"
        exit 1
    fi

    echo ""

    # Show current state
    if [ -f "$STATE_FILE" ]; then
        TOTAL_SEEN=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('total_seen', 0))" 2>/dev/null || echo "0")
        REPO=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('repo', 'unknown'))" 2>/dev/null || echo "unknown")
        LAST_UPDATE=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('last_updated', 'never'))" 2>/dev/null || echo "never")

        echo -e "${BLUE}📊 GitHub State:${NC}"
        echo -e "  Repository: ${CYAN}${REPO}${NC}"
        echo -e "  Issues Seen: ${CYAN}${TOTAL_SEEN}${NC}"
        echo -e "  Last Update: ${CYAN}${LAST_UPDATE}${NC}"
    fi

    echo ""
    echo -e "${YELLOW}Checking for new issues... (auto-refresh every 5s)${NC}"
    echo ""
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
done
