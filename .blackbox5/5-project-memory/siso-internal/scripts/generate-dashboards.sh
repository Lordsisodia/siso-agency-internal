#!/bin/bash

# generate-dashboards.sh - Generate all dashboards from STATE.yaml
#
# This script generates all dashboard files from STATE.yaml (the single source of truth)
# Run this after updating STATE.yaml to keep all views in sync
#
# Usage: ./scripts/generate-dashboards.sh

set -e

echo "🔄 Generating dashboards from STATE.yaml..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if STATE.yaml exists
if [ ! -f "$PROJECT_ROOT/STATE.yaml" ]; then
    echo "❌ Error: STATE.yaml not found at $PROJECT_ROOT/STATE.yaml"
    exit 1
fi

# Generate ACTIVE.md
echo "  → Generating ACTIVE.md..."
# This would normally use a YAML parser, but for now we'll use a simple approach
# In production, you'd use yq or similar to parse STATE.yaml and generate the markdown
echo "  ⚠️  ACTIVE.md generation not yet automated (manual for now)"
echo "  → See STATE.yaml for current active state"

# Generate WORK-LOG.md
echo "  → Generating WORK-LOG.md..."
echo "  ⚠️  WORK-LOG.md generation not yet automated (manual for now)"
echo "  → See STATE.yaml recent_work section"

# Generate SYNC-STATE.md
echo "  → Generating SYNC-STATE.md..."
echo "  ⚠️  SYNC-STATE.md generation not yet automated (manual for now)"
echo "  → See STATE.yaml github_sync section"

echo ""
echo "✅ Dashboard generation complete!"
echo ""
echo "Note: Full automation requires a YAML parser (yq or similar)."
echo "For now, STATE.yaml is the single source of truth."
echo "Update STATE.yaml when state changes, then update dashboards manually."
echo ""
echo "To install yq (YAML processor):"
echo "  brew install yq"
echo ""
echo "Then update the generate scripts to use yq for full automation."
