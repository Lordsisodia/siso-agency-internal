#!/bin/bash
# Start REAL Ralph Runtime Test (20 minutes)

WORKSPACE="$(pwd)"
cd "$WORKSPACE"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Starting REAL Ralph Runtime - 20 Minute Test             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Clear old state
STATE_FILE=".blackbox5/engine/operations/runtime/ralph/github_state.json"
if [ -f "$STATE_FILE" ]; then
    mv "$STATE_FILE" "${STATE_FILE}.backup"
fi

LOG_DIR=".blackbox/.plans/active/ralph-real-test"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/ralph.log"
PID_FILE="$LOG_DIR/ralph.pid"

# Kill any existing Ralph
if [ -f "$PID_FILE" ]; then
    kill $(cat "$PID_FILE") 2>/dev/null || true
    sleep 1
fi

echo "Starting Ralph Runtime..."
echo ""

# Start Ralph in background
python3 .blackbox5/engine/operations/runtime/ralph/ralph_runtime.py \
    --workspace "$WORKSPACE" \
    --prd "$WORKSPACE/prd-autonomous-framework-research.json" \
    --max-iterations 40 \
    > "$LOG_FILE" 2>&1 &

RALPH_PID=$!
echo $RALPH_PID > "$PID_FILE"

sleep 3

echo "✅ Ralph Started!"
echo ""
echo "Process ID: $RALPH_PID"
echo "Log file: $LOG_FILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Monitor commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  tail -f $LOG_FILE"
echo "  ls -lh .blackbox5/engine/development/framework-research/"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show initial output
head -50 "$LOG_FILE"
echo ""

# Auto-stop after 20 minutes
(sleep 1200; kill $RALPH_PID 2>/dev/null; echo "Test complete!") &

echo "Will auto-stop in 20 minutes."
echo "Or stop manually: kill $RALPH_PID"
echo ""
