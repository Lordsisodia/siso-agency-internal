#!/bin/bash

# new-retro.sh - Create a new retrospective from template
#
# Usage: ./scripts/new-retro.sh

set -e

PROJECT_ROOT="$(dirname "$(dirname "$0")")"
TODAY=$(date +%Y-%m-%d)

echo "🪞 Creating new retrospective"
echo ""
echo "Retro types:"
echo "  1) Sprint"
echo "  2) Project"
echo "  3) Task"
echo "  4) Technical"
echo ""
read -p "Choose type [1-4]: " TYPE

case $TYPE in
    1)
        TYPE_NAME="sprint"
        PREFIX="sprint"
        ;;
    2)
        TYPE_NAME="project"
        PREFIX="proj"
        ;;
    3)
        TYPE_NAME="task"
        PREFIX="task"
        ;;
    4)
        TYPE_NAME="technical"
        PREFIX="tech"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
read -p "Enter retro title (short, kebab-case): " TITLE
SLUG="${TITLE// /-}"
RETRO_ID="RETRO-$TODAY-$PREFIX-$SLUG"

echo ""
read -p "Brief description: " DESCRIPTION

echo ""
echo "📝 Creating retrospective: $RETRO_ID"

# Copy template
cp "$PROJECT_ROOT/operations/retrospectives/_template.md" "$PROJECT_ROOT/operations/retrospectives/$RETRO_ID.md"

# Replace placeholders in the file
sed -i '' "s/\[DATE\]/$TODAY/g" "$PROJECT_ROOT/operations/retrospectives/$RETRO_ID.md"
sed -i '' "s/\[SLUG\]/$SLUG/g" "$PROJECT_ROOT/operations/retrospectives/$RETRO_ID.md"
sed -i '' "s/\[Brief Title\]/$DESCRIPTION/g" "$PROJECT_ROOT/operations/retrospectives/$RETRO_ID.md"
sed -i '' "s/\[Type\]/$TYPE_NAME/g" "$PROJECT_ROOT/operations/retrospectives/$RETRO_ID.md"
sed -i '' "s/\[Agent Name\]/\$(whoami)/g" "$PROJECT_ROOT/operations/retrospectives/$RETRO_ID.md"
sed -i '' "s/\[YYYY-MM-DD\]/$TODAY/g" "$PROJECT_ROOT/operations/retrospectives/$RETRO_ID.md"

echo "✅ Created: operations/retrospectives/$RETRO_ID.md"
echo ""
echo "Next steps:"
echo "  1. Edit operations/retrospectives/$RETRO_ID.md to add retrospective details"
echo "  2. Link to related tasks, features, decisions"
echo "  3. Track action items for follow-up"
echo "  4. Add to STATE.yaml retrospectives section (if tracking there)"
echo ""
echo "Quick start: Fill out these sections first:"
echo "  - Context (what are we reviewing?)"
echo "  - What Went Well (celebrate wins!)"
echo "  - What Didn't Go Well (identify improvements)"
echo "  - Action Items (make commitments)"
