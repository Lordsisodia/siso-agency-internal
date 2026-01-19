#!/bin/bash
# Start Autonomous Framework Research (20-minute test)

WORKSPACE="$(pwd)"
cd "$WORKSPACE"

# Configuration
PRD_FILE="$WORKSPACE/prd-autonomous-framework-research.json"
LOG_DIR="$WORKSPACE/.blackbox/.plans/active/autonomous-framework-test"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/ralph-test.log"
PID_FILE="$LOG_DIR/ralph.pid"
STATE_FILE="$WORKSPACE/.blackbox5/engine/operations/runtime/ralph/github_state.json"
OUTPUT_DIR="$WORKSPACE/.blackbox5/engine/development/framework-research"

# Clear old state for fresh test
if [ -f "$STATE_FILE" ]; then
    mv "$STATE_FILE" "${STATE_FILE}.backup.$(date +%s)"
fi

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Starting Autonomous Framework Research Test             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Kill any existing Ralph
if [ -f "$PID_FILE" ]; then
    kill $(cat "$PID_FILE") 2>/dev/null || true
    sleep 1
fi

# Start Ralph with output redirected
RALPH_PYTHON="$WORKSPACE/.blackbox5/engine/operations/runtime/ralph/ralph_runtime.py"

python3 "$RALPH_PYTHON" \
    --workspace "$WORKSPACE" \
    --prd "$PRD_FILE" \
    --max-iterations 1000 \
    > "$LOG_FILE" 2>&1 &

RALPH_PID=$!
echo $RALPH_PID > "$PID_FILE"

echo "✅ Ralph Started!"
echo ""
echo "Process ID: $RALPH_PID"
echo "Log file: $LOG_FILE"
echo "Output dir: $OUTPUT_DIR"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Monitor commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  tail -f $LOG_FILE"
echo "  ls -lh $OUTPUT_DIR/"
echo "  cat $STATE_FILE"
echo "  bash check-autonomous-progress.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Wait and show initial output
sleep 5
echo "Initial output (first 30 lines):"
echo ""
head -30 "$LOG_FILE" 2>/dev/null || echo "Waiting for output..."
echo ""

# Check if running
if ps -p $RALPH_PID > /dev/null 2>&1; then
    echo "✓ Ralph is running autonomously!"
    echo ""
    echo "Will auto-stop in 20 minutes."
    echo "Or stop manually: kill $RALPH_PID"
    echo ""

    # Schedule auto-stop
    (sleep 1200; kill $RALPH_PID 2>/dev/null; echo "Test complete!") &
else
    echo "✗ Ralph may have stopped. Check log."
fi

echo ""
