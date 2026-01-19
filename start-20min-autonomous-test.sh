#!/bin/bash
# Start 20-Minute Autonomous Framework Research Test
# This will run Ralph autonomously for 20 minutes researching frameworks

set -e

WORKSPACE="$(pwd)"
cd "$WORKSPACE"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     20-Minute Autonomous Framework Research Test            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PRD_FILE="$WORKSPACE/prd-autonomous-framework-research.json"
TEST_DURATION_MINUTES=20
CHECK_INTERVAL_SECONDS=30
MAX_ITERATIONS=40  # 20 minutes / 30 seconds = 40 iterations

LOG_DIR="$WORKSPACE/.blackbox/.plans/active/autonomous-framework-test"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/ralph-autonomous-test.log"
PID_FILE="$LOG_DIR/ralph.pid"
STATE_FILE="$WORKSPACE/.blackbox5/engine/operations/runtime/ralph/github_state.json"
OUTPUT_DIR="$WORKSPACE/.blackbox5/engine/development/framework-research"
mkdir -p "$OUTPUT_DIR"

echo -e "${CYAN}📋 Test Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Test Duration:     ${TEST_DURATION_MINUTES} minutes"
echo "Check Interval:    ${CHECK_INTERVAL_SECONDS} seconds"
echo "Max Iterations:    ${MAX_ITERATIONS}"
echo "Frameworks:        10+ frameworks"
echo ""
echo "PRD File:          $PRD_FILE"
echo "Log File:          $LOG_FILE"
echo "Output Directory:  $OUTPUT_DIR"
echo "State File:        $STATE_FILE"
echo ""

# Verify GitHub CLI
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
if ! command -v gh &> /dev/null; then
    echo -e "${RED}✗ GitHub CLI not found${NC}"
    echo "Install with: brew install gh"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo -e "${RED}✗ GitHub not authenticated${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Kill any existing Ralph process
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}→ Killing existing Ralph process (PID: $OLD_PID)${NC}"
        kill $OLD_PID
        sleep 2
    fi
fi

# Clear old state for fresh test
if [ -f "$STATE_FILE" ]; then
    echo -e "${YELLOW}→ Backing up old state file${NC}"
    cp "$STATE_FILE" "${STATE_FILE}.backup.$(date +%s)"
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 Starting Ralph - Autonomous Framework Research${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start Ralph in background
RALPH_PYTHON="$WORKSPACE/.blackbox5/engine/operations/runtime/ralph/ralph_runtime.py"

nohup python3 "$RALPH_PYTHON" \
    --workspace "$WORKSPACE" \
    --prd "$PRD_FILE" \
    --max-iterations $MAX_ITERATIONS \
    > "$LOG_FILE" 2>&1 &

RALPH_PID=$!
echo $RALPH_PID > "$PID_FILE"

sleep 2

# Check if Ralph started successfully
if ps -p $RALPH_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ralph Started Successfully!${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📊 Test Running Information${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "Process ID:        ${CYAN}$RALPH_PID${NC}"
    echo -e "Test Duration:     ${YELLOW}${TEST_DURATION_MINUTES} minutes${NC}"
    echo -e "Auto-Stop Time:    $(date -v+${TEST_DURATION_MINUTES}M '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -d "+${TEST_DURATION_MINUTES} minutes" '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo -e "${BLUE}Frameworks Being Researched:${NC}"
    echo "  • FoundationAgents/MetaGPT (63k★)"
    echo "  • agentscope-ai/agentscope (15k★)"
    echo "  • microsoft/agent-framework (6k★)"
    echo "  • google/adk-python (17k★)"
    echo "  • MervinPraison/PraisonAI (5k★)"
    echo "  • bytedance/deer-flow (19k★)"
    echo "  • ruvnet/claude-flow (12k★)"
    echo "  • iflytek/astron-agent (8k★)"
    echo "  • openai/swarm"
    echo "  • bmad-code-org/BMAD-METHOD"
    echo ""

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🔍 Monitor the Test${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}Real-time log monitoring:${NC}"
    echo "  tail -f $LOG_FILE"
    echo ""
    echo -e "${BLUE}Check progress:${NC}"
    echo "  bash check-autonomous-progress.sh"
    echo ""
    echo -e "${BLUE}Check generated files:${NC}"
    echo "  ls -lh $OUTPUT_DIR/"
    echo ""
    echo -e "${BLUE}View specific analysis:${NC}"
    echo "  cat $OUTPUT_DIR/METAGPT-GITHUB-ANALYSIS.md"
    echo ""

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⏱️  Test will auto-stop in ${TEST_DURATION_MINUTES} minutes${NC}"
    echo -e "${YELLOW}    Or stop manually: kill $RALPH_PID${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Show initial output
    sleep 3
    echo -e "${BLUE}📋 Initial Ralph Output:${NC}"
    echo ""
    head -30 "$LOG_FILE" 2>/dev/null || echo "Waiting for output..."
    echo ""

    # Schedule auto-stop
    (
      sleep $((TEST_DURATION_MINUTES * 60))
      if ps -p $RALPH_PID > /dev/null 2>&1; then
        echo ""
        echo "⏱️  Test duration reached, stopping Ralph..."
        kill $RALPH_PID
        echo "✅ Test complete! Results saved to: $OUTPUT_DIR"
      fi
    ) &

else
    echo -e "${RED}❌ Ralph failed to start${NC}"
    echo ""
    echo "Check log file:"
    tail -30 "$LOG_FILE"
    exit 1
fi

echo -e "${GREEN}✅ Test is running! Check back in ${TEST_DURATION_MINUTES} minutes.${NC}"
echo ""
