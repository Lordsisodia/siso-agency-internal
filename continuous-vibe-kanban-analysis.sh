#!/bin/bash
#
# continuous-vibe-kanban-analysis.sh
#
# Continuously runs Ralph to analyze Vibe Kanban and identify improvements
# Runs autonomously in the background, generating new analysis every cycle
#

set -e

WORKSPACE="$(pwd)"
PRD_FILE="$WORKSPACE/prd-framework-github-continuous.json"
MAX_ITERATIONS=20
SLEEP_INTERVAL=1  # 1 second between runs (continuous)
OUTPUT_DIR=".blackbox5/engine/operations/runtime/ralph/framework-github"
LOG_FILE="ralph-vibe-continuous.log"

echo "======================================================================"
echo " Ralph Continuous Framework GitHub Analysis"
echo "======================================================================"
echo ""
echo "Workspace: $WORKSPACE"
echo "PRD: $PRD_FILE"
echo "Max Iterations: $MAX_ITERATIONS"
echo "Sleep Interval: ${SLEEP_INTERVAL}s (continuous operation)"
echo "Output Directory: $OUTPUT_DIR"
echo "Log File: $LOG_FILE"
echo ""
echo "Starting continuous Vibe Kanban analysis loop..."
echo "Press Ctrl+C to stop"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

RUN_NUMBER=0

while true; do
    RUN_NUMBER=$((RUN_NUMBER + 1))
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    echo "======================================================================" | tee -a "$LOG_FILE"
    echo " Run #$RUN_NUMBER - $TIMESTAMP" | tee -a "$LOG_FILE"
    echo "======================================================================" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Run Ralph
    python3 -c "
import sys, asyncio
from pathlib import Path
import importlib.util

ralph_path = Path.cwd() / '.blackbox5' / 'engine' / 'operations' / 'runtime' / 'ralph' / 'ralph_runtime.py'
spec = importlib.util.spec_from_file_location('ralph_runtime', ralph_path)
ralph_module = importlib.util.module_from_spec(spec)
sys.modules['ralph_runtime'] = ralph_module
spec.loader.exec_module(ralph_module)

async def main():
    await ralph_module.run_ralph(
        workspace_path=str(Path.cwd()),
        prd_path='$PRD_FILE',
        max_iterations=$MAX_ITERATIONS
    )

asyncio.run(main())
" 2>&1 | tee -a "$LOG_FILE"

    # List generated files
    echo "" | tee -a "$LOG_FILE"
    echo "Generated analysis files:" | tee -a "$LOG_FILE"
    ls -lht $OUTPUT_DIR/*.md 2>/dev/null | head -5 | tee -a "$LOG_FILE" || echo "No files generated yet" | tee -a "$LOG_FILE"

    # Count issues identified
    if [ -d "$OUTPUT_DIR" ]; then
        ISSUE_COUNT=$(grep -r "PRIORITY" $OUTPUT_DIR/*.md 2>/dev/null | wc -l | tr -d ' ')
        echo "" | tee -a "$LOG_FILE"
        echo "Issues identified so far: $ISSUE_COUNT" | tee -a "$LOG_FILE"
    fi

    echo "" | tee -a "$LOG_FILE"
    echo "Run #$RUN_NUMBER complete. Starting next run immediately..." | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    sleep $SLEEP_INTERVAL
done
