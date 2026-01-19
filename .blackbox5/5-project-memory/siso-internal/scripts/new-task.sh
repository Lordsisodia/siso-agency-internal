#!/bin/bash

# new-task.sh - Create a new task from template
#
# Usage: ./scripts/new-task.sh

set -e

PROJECT_ROOT="$(dirname "$(dirname "$0")")"

# Get next task number
TASK_COUNT=$(ls "$PROJECT_ROOT/tasks/active" 2>/dev/null | wc -l | tr -d ' ')
TASK_NUM=$(printf "%03d" $TASK_COUNT)
TODAY=$(date +%Y-%m-%d)

TASK_ID="TASK-$TODAY-$TASK_NUM"

echo "📝 Creating new task: $TASK_ID"

# Copy template
cp "$PROJECT_ROOT/tasks/working/_template/task.md" "$PROJECT_ROOT/tasks/active/$TASK_ID.md"

echo "✅ Created: tasks/active/$TASK_ID.md"
echo ""
echo "Next steps:"
echo "  1. Edit tasks/active/$TASK_ID.md to add task details"
echo "  2. Update STATE.yaml to add task to active_tasks or completed_tasks"
echo "  3. Run ./scripts/generate-dashboards.sh to update views"
