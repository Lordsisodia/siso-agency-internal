#!/bin/bash
# Start Ralph Autonomous Loop

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="$(pwd)"
PRD_FILE="$WORKSPACE/prd.json"
MAX_ITERATIONS=${1:-100}

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           Ralph Autonomous Loop - Blackbox5                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Workspace: $WORKSPACE"
echo "PRD: $PRD_FILE"
echo "Max Iterations: $MAX_ITERATIONS"
echo ""

if [ ! -f "$PRD_FILE" ]; then
    echo "❌ Error: PRD file not found: $PRD_FILE"
    echo ""
    echo "Create a PRD file first with your user stories:"
    echo ""
    echo "  {"
    echo "    \"branchName\": \"feature/my-feature\","
    echo "    \"userStories\": ["
    echo "      {"
    echo "        \"id\": \"US-001\","
    echo "        \"title\": \"My first story\","
    echo "        \"priority\": 1,"
    echo "        \"passes\": false,"
    echo "        \"agent\": \"coder\""
    echo "      }"
    echo "    ]"
    echo "  }"
    echo ""
    exit 1
fi

# Run Ralph
python -m blackbox5.engine.runtime.ralph \
    --workspace "$WORKSPACE" \
    --prd "$PRD_FILE" \
    --max-iterations $MAX_ITERATIONS

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Ralph Complete!                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
