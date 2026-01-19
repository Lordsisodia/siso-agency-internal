#!/bin/bash
# Ralphy wrapper for Black Box 5 with full AgentMemory integration
# This wrapper ensures Ralphy tracks all work in the Blackbox system

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Set Ralphy to use Project Memory
export RALPHY_DIR="$PROJECT_ROOT/5-project-memory/siso-internal/operations/ralphy"
mkdir -p "$RALPHY_DIR"

# Set up Python path for Blackbox integration
export PYTHONPATH="$PROJECT_ROOT:$PYTHONPATH"

# Get Ralphy arguments
TASK="$1"
ENGINE="$2"
PRD_FILE="$3"
shift 3  # Remove first three arguments, rest are optional

# Start Blackbox session tracking
python3 - <<EOF
import sys
sys.path.insert(0, "$PROJECT_ROOT")
from blackbox_integration import create_bridge

bridge = create_bridge()
session_id = bridge.start_session(
    task="$TASK",
    prd_file="$PRD_FILE",
    engine="$ENGINE"
)

# Save session_id for later
with open("$RALPHY_DIR/.active_session", "w") as f:
    f.write(session_id)

print(f"Session ID: {session_id}")
EOF

# Run Ralphy
echo "[Blackbox] Executing Ralphy..."
"$SCRIPT_DIR/ralphy/ralphy.sh" "$@"
RALPHY_EXIT_CODE=$?

# End Blackbox session tracking
python3 - <<EOF
import sys
import os
import subprocess
sys.path.insert(0, "$PROJECT_ROOT")
from blackbox_integration import create_bridge

bridge = create_bridge()

# Get session_id
session_file = "$RALPHY_DIR/.active_session"
if os.path.exists(session_file):
    with open(session_file, "r") as f:
        session_id = f.read().strip()
    os.remove(session_file)
else:
    session_id = None

# Collect results
success=$RALPHY_EXIT_CODE -eq 0
files_created=[]
git_commit=""

# Check git commit
if cd "$PROJECT_ROOT" && git rev-parse HEAD > /dev/null 2>&1; then
    git_commit=$(cd "$PROJECT_ROOT" && git rev-parse --short HEAD)
fi

# Check for created files (last modified in last minute)
if [ -d "$PROJECT_ROOT" ]; then
    files_created=$(find "$PROJECT_ROOT" -maxdepth 1 -type f -mmin -1 ! -name ".*" 2>/dev/null | head -10)
fi

result="Task completed"
if [ $RALPHY_EXIT_CODE -ne 0 ]; then
    result="Task failed with exit code $RALPHY_EXIT_CODE"
fi

summary = bridge.end_session(
    success=$RALPHY_EXIT_CODE -eq 0,
    result="$result",
    files_created=files_created.split() if files_created else [],
    git_commit=git_commit if git_commit else None
)

print("[Blackbox] Session ended")
print(f"Success: {summary.get('success')}")
print(f"Duration: {summary.get('duration_seconds')} seconds")
EOF

exit $RALPHY_EXIT_CODE
