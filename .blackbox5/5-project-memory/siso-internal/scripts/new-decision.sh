#!/bin/bash

# new-decision.sh - Create a new decision from template
#
# Usage: ./scripts/new-decision.sh

set -e

PROJECT_ROOT="$(dirname "$(dirname "$0")")"
TODAY=$(date +%Y-%m-%d)

echo "📋 Creating new decision"
echo ""
echo "Decision types:"
echo "  1) Architectural"
echo "  2) Scope"
echo "  3) Technical"
echo ""
read -p "Choose type [1-3]: " TYPE

case $TYPE in
    1)
        TYPE_NAME="architectural"
        TEMPLATE="decisions/architectural/_template.md"
        PREFIX="arch"
        ;;
    2)
        TYPE_NAME="scope"
        TEMPLATE="decisions/scope/_template.md"
        PREFIX="scope"
        ;;
    3)
        TYPE_NAME="technical"
        TEMPLATE="decisions/technical/_template.md"
        PREFIX="tech"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

read -p "Enter decision title (short, kebab-case): " TITLE
SLUG="${TITLE// /-}"
DEC_ID="DEC-$TODAY-$PREFIX-$SLUG"

echo ""
echo "📝 Creating decision: $DEC_ID"

# Copy template
cp "$PROJECT_ROOT/$TEMPLATE" "$PROJECT_ROOT/decisions/$TYPE_NAME/$DEC_ID.md"

echo "✅ Created: decisions/$TYPE_NAME/$DEC_ID.md"
echo ""
echo "Next steps:"
echo "  1. Edit decisions/$TYPE_NAME/$DEC_ID.md to add decision details"
echo "  2. Update STATE.yaml to add decision to decisions_* section"
echo "  3. Run ./scripts/generate-dashboards.sh to update views"
