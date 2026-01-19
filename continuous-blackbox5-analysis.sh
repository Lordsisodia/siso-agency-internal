#!/bin/bash
#
# continuous-blackbox5-analysis.sh
#
# Continuously runs Ralph to analyze Blackbox5 and identify improvements
# Each run generates new analysis documents
#

set -e

WORKSPACE="$(pwd)"
PRD_FILE="$WORKSPACE/prd-continuous-blackbox5.json"
MAX_ITERATIONS=20
SLEEP_INTERVAL=300  # 5 minutes between runs

echo "======================================================================"
echo " Ralph Continuous Blackbox5 Analysis"
echo "======================================================================"
echo ""
echo "Workspace: $WORKSPACE"
echo "PRD: $PRD_FILE"
echo "Max Iterations: $MAX_ITERATIONS"
echo "Sleep Interval: ${SLEEP_INTERVAL}s ($(($SLEEP_INTERVAL/60)) minutes)"
echo ""
echo "Starting continuous analysis loop..."
echo "Press Ctrl+C to stop"
echo ""

RUN_NUMBER=0

while true; do
    RUN_NUMBER=$((RUN_NUMBER + 1))

    echo "======================================================================"
    echo " Run #$RUN_NUMBER - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "======================================================================"
    echo ""

    # Run Ralph
    python3 -c "
import sys, asyncio
from pathlib import Path
import importlib.util

ralph_path = Path.cwd() / '.blackbox5' / 'engine' / 'runtime' / 'ralph' / 'ralph_runtime.py'
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
" || echo "Ralph run completed with errors"

    # List generated files
    echo ""
    echo "Generated analysis files:"
    ls -lh .blackbox5/engine/runtime/ralph/continuous/*.md 2>/dev/null | tail -5 || echo "No files generated yet"

    echo ""
    echo "Run #$RUN_NUMBER complete. Sleeping for ${SLEEP_INTERVAL}s..."
    echo ""

    sleep $SLEEP_INTERVAL
done
