#!/bin/bash

# complete-task.sh - Mark task as complete and update all state files
#
# Usage: ./scripts/complete-task.sh [TASK-ID]
#
# This script automates the "completion ceremony":
# 1. Prompts for what was done and learned
# 2. Updates STATE.yaml (moves from active_tasks to completed_tasks)
# 3. Updates WORK-LOG.md with entry
# 4. Updates SESSION.md with last action
# 5. Runs generate-dashboards.sh to refresh views

set -e

PROJECT_ROOT="$(dirname "$(dirname "$0")")"
TODAY=$(date +%Y-%m-%d)
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Check if task ID provided
if [ -z "$1" ]; then
    echo "❌ Error: Task ID required"
    echo "Usage: ./scripts/complete-task.sh TASK-YYYY-MM-DD-NNN"
    exit 1
fi

TASK_ID="$1"
TASK_FILE="$PROJECT_ROOT/tasks/active/$TASK_ID.md"

# Check if task file exists
if [ ! -f "$TASK_FILE" ]; then
    echo "❌ Error: Task file not found: $TASK_FILE"
    exit 1
fi

echo "✅ Completing task: $TASK_ID"
echo ""

# Prompt for completion details
echo "📝 Completion Details"
echo "===================="
read -p "What was the primary deliverable? " DELIVERABLE
read -p "Time invested (e.g., '2 hours'): " TIME_INVESTED
read -p "GitHub issue # (if any, press enter to skip): " GITHUB_ISSUE
echo ""
echo "🧠 Learnings (press enter to skip each):"
read -p "  What worked well: " WHAT_WORKED
read -p "  What didn't work: " WHAT_DIDNT_WORK
read -p "  What would you do differently: " DO_DIFFERENTLY
read -p "  Any other notes: " OTHER_NOTES

# Get task info from file
TASK_NAME=$(grep "^# " "$TASK_FILE" | head -1 | sed 's/^# //')
TASK_TYPE=$(grep "Type:" "$TASK_FILE" | sed 's/.*Type: //' | sed 's/ *$//')
TASK_PRIORITY=$(grep "Priority:" "$TASK_FILE" | sed 's/.*Priority: //' | sed 's/ *$//')

echo ""
echo "🔄 Updating state files..."

# Update STATE.yaml
echo "  → Updating STATE.yaml..."
# This is a placeholder - in production, use yq or python to update YAML
# For now, we'll create a manual update instruction

cat > "$PROJECT_ROOT/STATE.yaml.update" << EOF
# Manual STATE.yaml Update Required for $TASK_ID
# (Automated update requires yq: brew install yq)

# Move task from active_tasks to completed_tasks:
# In active_tasks section, remove entry for $TASK_ID

# In completed_tasks section, add:
  - id: "$TASK_ID"
    name: "$TASK_NAME"
    description: "$DELIVERABLE"
    status: "completed"
    priority: "$TASK_PRIORITY"
    type: "$TASK_TYPE"

    file: "tasks/active/$TASK_ID.md"

    deliverables:
      - "$DELIVERABLE"

    github_issue: ${GITHUB_ISSUE:-null}
    completed_at: "$TODAY"

# Update task_stats:
#   total: [no change]
#   active: [decrement by 1]
#   completed: [increment by 1]

# Update progress:
#   tasks_completed: [increment by 1]
#   tasks_percentage: [recalculate]
EOF

# Update WORK-LOG.md
echo "  → Updating WORK-LOG.md..."
LOG_ENTRY="
---

### $TODAY - $TASK_NAME

**Task**: [$TASK_ID]($TASK_ID.md)
**Type**: $TASK_TYPE
**Priority**: $TASK_PRIORITY
**Time Invested**: ${TIME_INVESTED:-"Not specified"}

**Deliverable**:
$DELIVERABLE

**Learnings**:
$([ -n "$WHAT_WORKED" ] && echo "- ✅ What worked: $WHAT_WORKED")
$([ -n "$WHAT_DIDNT_WORK" ] && echo "- ⚠️  What didn't work: $WHAT_DIDNT_WORK")
$([ -n "$DO_DIFFERENTLY" ] && echo "- 💡 Do differently: $DO_DIFFERENTLY")
$([ -n "$OTHER_NOTES" ] && echo "- 📝 Other: $OTHER_NOTES")

**GitHub Issue**: $([ -n "$GITHUB_ISSUE" ] && echo "#$GITHUB_ISSUE" || echo "None")

"

# Insert after the header in WORK-LOG.md
if [ -f "$PROJECT_ROOT/WORK-LOG.md" ]; then
    # Create temp file with new entry inserted after header
    awk -v entry="$LOG_ENTRY" '
        /^## Recent Work/ {print; print ""; print entry; next}
        {print}
    ' "$PROJECT_ROOT/WORK-LOG.md" > "$PROJECT_ROOT/WORK-LOG.md.tmp"
    mv "$PROJECT_ROOT/WORK-LOG.md.tmp" "$PROJECT_ROOT/WORK-LOG.md"
else
    echo "# Work Log" > "$PROJECT_ROOT/WORK-LOG.md"
    echo "" >> "$PROJECT_ROOT/WORK-LOG.md"
    echo "## Recent Work" >> "$PROJECT_ROOT/WORK-LOG.md"
    echo "$LOG_ENTRY" >> "$PROJECT_ROOT/WORK-LOG.md"
fi

# Update SESSION.md
echo "  → Updating SESSION.md..."
if [ -f "$PROJECT_ROOT/project/memory/SESSION.md" ]; then
    # Update last action in SESSION.md
    sed -i '' "s/\*\*Last Action\*\*: .*/\*\*Last Action\*\*: $NOW - Completed $TASK_ID/" "$PROJECT_ROOT/project/memory/SESSION.md"
    sed -i '' "s/\*\*Next Action\*\*: .*/\*\*Next Action\*\*: Review ACTIVE.md for next task/" "$PROJECT_ROOT/project/memory/SESSION.md"
fi

# Update the task file itself
echo "  → Updating task file..."
sed -i '' "s/Status: Pending/Status: Completed/" "$TASK_FILE"
sed -i '' "s/Status: In Progress/Status: Completed/" "$TASK_FILE"
echo "" >> "$TASK_FILE"
echo "---" >> "$TASK_FILE"
echo "" >> "$TASK_FILE"
echo "## Completion" >> "$TASK_FILE"
echo "" >> "$TASK_FILE"
echo "**Completed**: $TODAY" >> "$TASK_FILE"
echo "**Time Invested**: ${TIME_INVESTED:-"Not specified"}" >> "$TASK_FILE"
echo "" >> "$TASK_FILE"
echo "### Deliverable" >> "$TASK_FILE"
echo "$DELIVERABLE" >> "$TASK_FILE"
echo "" >> "$TASK_FILE"
echo "### Learnings" >> "$TASK_FILE"
$([ -n "$WHAT_WORKED" ] && echo "- ✅ **What worked**: $WHAT_WORKED" >> "$TASK_FILE")
$([ -n "$WHAT_DIDNT_WORK" ] && echo "- ⚠️  **What didn't work**: $WHAT_DIDNT_WORK" >> "$TASK_FILE")
$([ -n "$DO_DIFFERENTLY" ] && echo "- 💡 **Do differently**: $DO_DIFFERENTLY" >> "$TASK_FILE")
$([ -n "$OTHER_NOTES" ] && echo "- 📝 **Other**: $OTHER_NOTES" >> "$TASK_FILE")

echo ""
echo "✅ Task completion recorded!"
echo ""
echo "📋 Next Steps:"
echo "  1. Review STATE.yaml.update and apply changes to STATE.yaml"
echo "     (or install yq for full automation: brew install yq)"
echo ""
echo "  2. Run: ./scripts/generate-dashboards.sh"
echo ""
echo "  3. If learnings are significant, create a retrospective:"
echo "     ./scripts/new-retro.sh"
echo ""
echo "📊 Summary:"
echo "  Task: $TASK_ID - $TASK_NAME"
echo "  Deliverable: $DELIVERABLE"
echo "  Time: ${TIME_INVESTED:-"Not specified"}"
echo "  Date: $TODAY"
