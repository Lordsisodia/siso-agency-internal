#!/bin/bash
# Live Dashboard for Autonomous Framework Research Test

WORKSPACE="$(pwd)"
cd "$WORKSPACE"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

while true; do
    clear

    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     Autonomous Framework Research - Live Dashboard          ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Last updated: ${BOLD}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo ""

    # Check if process is running
    RESEARCH_PID=$(ps aux | grep "run-autonomous-research.py" | grep -v grep | awk '{print $2}' | head -1)

    if [ -n "$RESEARCH_PID" ]; then
        echo -e "${GREEN}✓ Status: RUNNING${NC}"
        echo -e "  Process ID: ${CYAN}$RESEARCH_PID${NC}"
        echo -e "  Uptime: $(ps -p $RESEARCH_PID -o etime= 2>/dev/null | tr -d ' ')"
        echo -e "  Memory: $(ps -p $RESEARCH_PID -o rss= 2>/dev/null | awk '{printf "%.1f MB", $1/1024}')"
    else
        echo -e "${RED}✗ Status: NOT RUNNING${NC}"
        echo -e "  The test has completed or was stopped."
        echo ""
        exit 0
    fi

    echo ""

    # Show State
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}📊 Research State${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    STATE_FILE=".blackbox5/engine/operations/runtime/ralph/github_state.json"

    if [ -f "$STATE_FILE" ]; then
        TOTAL_ISSUES=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('total_issues', 0))" 2>/dev/null || echo "0")
        LAST_UPDATE=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('last_updated', 'never'))" 2>/dev/null | cut -d'T' -f2 | cut -d'.' -f1)

        echo -e "${BOLD}Total Issues Analyzed:${NC} ${CYAN}$TOTAL_ISSUES${NC}"
        echo -e "${BOLD}Last Update:${NC} ${CYAN}$LAST_UPDATE${NC}"
        echo ""

        # Show per-repo counts
        echo -e "${BLUE}Issues per Repository:${NC}"
        python3 << 'EOF' 2>/dev/null
import json
from pathlib import Path

state_file = Path('.blackbox5/engine/operations/runtime/ralph/github_state.json')
if state_file.exists():
    data = json.load(open(state_file))
    repos = data.get('repos', {})

    for repo, issues in sorted(repos.items()):
        name = repo.split('/')[-1]
        print(f"  • {name:<25} {len(issues):>3} issues")
EOF
    else
        echo -e "${YELLOW}⚠️  State file not created yet${NC}"
    fi

    echo ""

    # Show Output Files
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}📁 Generated Analysis Files${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    OUTPUT_DIR=".blackbox5/engine/development/framework-research"

    if [ -d "$OUTPUT_DIR" ]; then
        file_count=$(ls -1 "$OUTPUT_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
        total_size=$(du -sh "$OUTPUT_DIR" 2>/dev/null | cut -f1)

        echo -e "${BOLD}Total Files:${NC} ${CYAN}$file_count${NC}  |  ${BOLD}Total Size:${NC} ${CYAN}$total_size${NC}"
        echo ""

        echo -e "${BLUE}Recent Files:${NC}"
        ls -lt "$OUTPUT_DIR"/*.md 2>/dev/null | head -5 | while read -r line; do
            filename=$(echo "$line" | awk '{print $NF}')
            filesize=$(echo "$line" | awk '{print $5}')
            modtime=$(echo "$line" | awk '{print $6, $7, $8}')
            basename=$(basename "$filename")

            # Calculate file age
            file_age_seconds=$(($(date +%s) - $(stat -f "%m" "$filename" 2>/dev/null || stat -c "%Y" "$file")))
            if [ $file_age_seconds -lt 60 ]; then
                age="${GREEN}now${NC}"
            elif [ $file_age_seconds -lt 300 ]; then
                age="${YELLOW}$((file_age_seconds / 60))m ago${NC}"
            else
                age="${NC}$((file_age_seconds / 60))m ago"
            fi

            echo -e "  • ${basename:<50} ${filesize:>8}  ${age}"
        done
    else
        echo -e "${YELLOW}⚠️  Output directory not found${NC}"
    fi

    echo ""
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Commands
    echo -e "${GREEN}Commands:${NC}"
    echo -e "  ${CYAN}cat $OUTPUT_DIR/*.md${NC}         - View all analyses"
    echo -e "  ${CYAN}cat $STATE_FILE${NC}              - View state"
    echo -e "  ${CYAN}kill $RESEARCH_PID${NC}           - Stop test"
    echo ""

    # Refresh countdown
    echo -e "${YELLOW}Refreshing in 10 seconds...${NC}"
    echo ""

    sleep 10
done
