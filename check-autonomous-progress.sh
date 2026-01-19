#!/bin/bash
# Check Autonomous Framework Research Progress
# Shows real-time progress of the 20-minute autonomous test

set -e

WORKSPACE="$(pwd)"
cd "$WORKSPACE"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
PID_FILE="$WORKSPACE/.blackbox/.plans/active/autonomous-framework-test/ralph.pid"
LOG_FILE="$WORKSPACE/.blackbox/.plans/active/autonomous-framework-test/ralph-autonomous-test.log"
STATE_FILE="$WORKSPACE/.blackbox5/engine/operations/runtime/ralph/github_state.json"
OUTPUT_DIR="$WORKSPACE/.blackbox5/engine/development/framework-research"

clear

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Autonomous Framework Research - Progress Check            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Last updated: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Check if Ralph is running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Status: RUNNING${NC}"
        echo -e "  Process ID: ${CYAN}$PID${NC}"
        echo -e "  Uptime: $(ps -p $PID -o etime= 2>/dev/null | tr -d ' ')"
        echo -e "  Memory: $(ps -p $PID -o rss= 2>/dev/null | awk '{printf "%.1f MB", $1/1024}')"
    else
        echo -e "${RED}✗ Status: STOPPED${NC}"
        echo -e "  Process $PID not found"
        echo ""
        echo "The test has completed or was stopped."
        exit 0
    fi
else
    echo -e "${RED}✗ Status: NOT RUNNING${NC}"
    echo "  No PID file found"
    echo ""
    echo "Start the test with:"
    echo "  bash start-20min-autonomous-test.sh"
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
    echo "Current State:"
    cat "$STATE_FILE" | python3 -m json.tool 2>/dev/null || cat "$STATE_FILE"
else
    echo -e "${YELLOW}⚠️  State file not created yet${NC}"
    echo "Ralph will create it after first GitHub fetch"
fi

echo ""

# Show Output Files
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📁 Generated Research Files${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -d "$OUTPUT_DIR" ]; then
    file_count=$(ls -1 "$OUTPUT_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${BLUE}Total Files Generated: ${CYAN}${file_count}${NC}"
    echo ""

    for file in "$OUTPUT_DIR"/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            filesize=$(du -h "$file" | cut -f1)
            modtime=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$file" 2>/dev/null || stat -c "%y" "$file" 2>/dev/null | cut -d'.' -f1)
            line_count=$(wc -l < "$file" | tr -d ' ')

            # Get file age
            file_age_seconds=$(($(date +%s) - $(stat -f "%m" "$file" 2>/dev/null || stat -c "%Y" "$file")))
            if [ $file_age_seconds -lt 60 ]; then
                age_color="${GREEN}"
                age_text="${file_age_seconds}s ago"
            elif [ $file_age_seconds -lt 3600 ]; then
                age_color="${YELLOW}"
                age_text="$((file_age_seconds / 60))m ago"
            else
                age_color="${NC}"
                age_text="$((file_age_seconds / 3600))h ago"
            fi

            echo -e "${CYAN}• ${filename}${NC}"
            echo -e "  Size: ${filesize}  |  Lines: ${line_count}  |  Modified: ${modtime} (${age_text}${age_color})"
        fi
    done
else
    echo -e "${YELLOW}⚠️  Output directory not found yet${NC}"
fi

echo ""

# Show Recent Log Activity
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📋 Recent Activity (Last 25 lines)${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "$LOG_FILE" ]; then
    tail -25 "$LOG_FILE"
else
    echo -e "${YELLOW}⚠️  Log file not found: $LOG_FILE${NC}"
fi

echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Show Commands
echo -e "${GREEN}Commands:${NC}"
echo -e "  ${CYAN}tail -f $LOG_FILE${NC}           - Watch live logs"
echo -e "  ${CYAN}ls -lh $OUTPUT_DIR/${NC}          - List all output files"
echo -e "  ${CYAN}cat $OUTPUT_DIR/*.md${NC}         - View all analyses"
echo -e "  ${CYAN}kill $PID${NC}                    - Stop test immediately"
echo -e "  ${CYAN}bash $0${NC}                      - Refresh this dashboard"
echo ""

# Quick stats
if [ -d "$OUTPUT_DIR" ]; then
    total_lines=$(find "$OUTPUT_DIR" -name "*.md" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
    total_size=$(du -sh "$OUTPUT_DIR" 2>/dev/null | cut -f1)

    echo -e "${BLUE}Quick Stats:${NC}"
    echo -e "  Total Research Output: ${CYAN}${total_lines}${NC} lines"
    echo -e "  Total Size: ${CYAN}${total_size}${NC}"
    echo ""
fi

echo -e "${GREEN}Press Ctrl+C to exit. Running in monitor mode...${NC}"
echo ""

# Monitor mode - refresh every 10 seconds
sleep_count=0
while true; do
    sleep 10
    sleep_count=$((sleep_count + 1))

    # Check every 6th refresh (1 minute) or show countdown
    if [ $((sleep_count % 6)) -eq 0 ]; then
        clear
        exec "$0"
    fi

    # Just check if process is still alive
    if ! ps -p $PID > /dev/null 2>&1; then
        echo ""
        echo -e "${RED}⚠️  Ralph process stopped!${NC}"
        echo "Refreshing..."
        sleep 2
        exec "$0"
    fi
done
