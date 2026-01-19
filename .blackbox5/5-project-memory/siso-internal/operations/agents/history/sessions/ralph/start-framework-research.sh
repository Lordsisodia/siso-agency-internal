#!/bin/bash
# Run Ralph Runtime - Autonomous Framework Research
# This will run Ralph in the background to autonomously research frameworks

set -e

WORKSPACE="$(pwd)"
cd .blackbox5

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Starting Ralph - Autonomous Framework Research         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "This will run Ralph in the background."
echo ""
echo "📋 Task: Research 4 frameworks (BMAD, SpecKit, MetaGPT, Swarm)"
echo "🔄 6 stories will be executed autonomously"
echo ""

# Create logs directory
LOG_DIR="$WORKSPACE/.blackbox/.plans/active/vibe-kanban-work"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/ralph-framework-research.log"
PID_FILE="$LOG_DIR/ralph.pid"

# Start Ralph in background
RALPH_PYTHON="$WORKSPACE/.blackbox5/engine/operations/runtime/ralph/ralph_runtime.py"
nohup python3 "$RALPH_PYTHON" \
    --workspace "$WORKSPACE" \
    --prd "$WORKSPACE/prd-framework-github-continuous.json" \
    --max-iterations 1000 \
    > "$LOG_FILE" 2>&1 &

RALPH_PID=$!
echo $RALPH_PID > "$PID_FILE"

echo "✅ Ralph Runtime started!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Monitoring Information"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Process ID: $RALPH_PID"
echo "Log file: $LOG_FILE"
echo "Progress: .blackbox/.plans/active/vibe-kanban-work/task-framework-research-progress.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 To Monitor Progress"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "# Watch Ralph's output in real-time:"
echo "  tail -f $LOG_FILE"
echo ""
echo "# Check progress file:"
echo "  tail -f .blackbox/.plans/active/vibe-kanban-work/task-framework-research-progress.md"
echo ""
echo "# Check if Ralph is still running:"
echo "  ps -p $RALPH_PID"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛑 To Stop Ralph"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  kill $RALPH_PID"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show first few lines of output
sleep 2
echo "📋 Initial Output:"
echo ""
head -20 "$LOG_FILE" 2>/dev/null || echo "Waiting for output..."
echo ""

# Check if process is running
if ps -p $RALPH_PID > /dev/null 2>&1; then
    echo "✅ Ralph is running autonomously in the background!"
    echo ""
    echo "It will research all 4 frameworks and create documentation."
    echo "Check the log file to see progress."
else
    echo "⚠️  Ralph process may have exited. Check log file."
    echo ""
    tail -30 "$LOG_FILE"
fi
