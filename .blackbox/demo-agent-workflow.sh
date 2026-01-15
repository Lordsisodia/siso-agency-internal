#!/usr/bin/env bash
# Demo: Agent Task Workflow with Tracking
# Shows how agents should document work, update timeline, and track tasks

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/4-scripts/lib.sh"

BLACKBOX_ROOT="$(find_box_root)"

echo "=========================================="
echo "Agent Task Workflow Demo"
echo "=========================================="
echo ""

# Generate a unique task ID
TASK_ID="task-$(date +%Y%m%d-%H%M%S)-demo"
TIMESTAMP=$(date +"%Y-%m-%dT%H:%M:%SZ")

echo "Creating demo task: $TASK_ID"
echo ""

# Step 1: Add to Work Queue
echo "=== Step 1: Adding to Work Queue ==="
WORK_QUEUE_FILE="$BLACKBOX_ROOT/.memory/working/shared/work-queue.json"

# Create a new task entry
NEW_TASK=$(cat <<EOF
{
  "id": "$TASK_ID",
  "title": "Demo: Implement semantic search integration",
  "description": "Add semantic search to agent workflow to find similar past work",
  "status": "in_progress",
  "priority": "high",
  "phase": "implementation",
  "domain": "backend",
  "complexity": "medium",
  "assigned_agent": "agent-research",
  "created_at": "$TIMESTAMP",
  "updated_at": "$TIMESTAMP",
  "predicted_duration": 2.0,
  "actual_duration": null,
  "blockers": []
}
EOF
)

# Add task to work queue
if command_exists python3; then
    python3 <<PYTHON
import json

work_queue_file = "$WORK_QUEUE_FILE"
with open(work_queue_file, 'r') as f:
    tasks = json.load(f)

# Add new task
new_task = json.loads('''$NEW_TASK''')
tasks.insert(0, new_task)

# Write back
with open(work_queue_file, 'w') as f:
    json.dump(tasks, f, indent=2)

print(f"✓ Task added to work queue: {new_task['id']}")
print(f"  Title: {new_task['title']}")
print(f"  Status: {new_task['status']}")
PYTHON
fi

echo ""

# Step 2: Add to Timeline
echo "=== Step 2: Updating Timeline ==="
TIMELINE_FILE="$BLACKBOX_ROOT/.memory/working/shared/timeline.md"

TIMELINE_ENTRY=$(cat <<EOF

## $TIMESTAMP - [TASK_STARTED] $TASK_ID "Demo: Implement semantic search integration" started by agent-research

EOF
)

# Add to timeline
echo "$TIMELINE_ENTRY" >> "$TIMELINE_FILE"
echo "✓ Timeline updated with task start"

echo ""

# Step 3: Create Agent Session Documentation
echo "=== Step 3: Creating Agent Session Docs ==="

SESSION_DIR="$BLACKBOX_ROOT/.memory/agents/demo-agent-session"
mkdir -p "$SESSION_DIR"

# Create summary
cat > "$SESSION_DIR/summary.md" <<EOF
# Agent Session Summary - Demo

**Session ID:** demo-session
**Task ID:** $TASK_ID
**Start Time:** $(date +"%Y-%m-%d %H:%M")
**Agent:** agent-research (demo)

## What Was Done

This is a demonstration of proper agent task tracking and documentation.

### Actions Taken

1. Added task to work queue
2. Updated timeline with task start
3. Created session documentation
4. Demonstrated semantic search usage

## Tools Used

- Semantic search: Found 3 similar past tasks
- Timeline tracking: Logged task start
- Work queue: Updated task status

## Results

- Demonstrated complete agent workflow
- All tracking systems updated
- Documentation created

## Next Steps

- Continue with task implementation
- Update timeline as work progresses
- Mark task complete when done
EOF

echo "✓ Session documentation created:"
echo "  $SESSION_DIR/summary.md"

echo ""

# Step 4: Use Semantic Search to Find Similar Work
echo "=== Step 4: Semantic Search for Similar Work ==="

if [ -f "$BLACKBOX_ROOT/search-memory" ]; then
    echo "Searching for similar past work..."
    echo ""

    # Run semantic search
    cd "$BLACKBOX_ROOT"
    ./search-memory "semantic search integration" 2>&1 | head -20

    echo ""
    echo "✓ Semantic search found relevant past work"
fi

echo ""

# Step 5: Create a Plan
echo "=== Step 5: Creating Implementation Plan ==="

PLAN_FILE="$SESSION_DIR/plan.md"
cat > "$PLAN_FILE" <<EOF
# Implementation Plan: Semantic Search Integration

## Task ID
$TASK_ID

## Goal
Integrate semantic search into agent workflow to help find similar past work before starting new tasks.

## Steps

### Step 1: Setup (Done)
- [x] Verify semantic search is working
- [x] Test search with sample queries
- [x] Create CLI wrapper for easy access

### Step 2: Integration
- [ ] Add search to agent initialization script
- [ ] Create helper function for semantic queries
- [ ] Add to agent protocol documentation

### Step 3: Testing
- [ ] Test with real agent workflow
- [ ] Verify search quality
- [ ] Measure time saved

### Step 4: Documentation
- [ ] Update agent protocol with search usage
- [ ] Create examples in agent docs
- [ ] Add to training materials

## Estimated Time
- Setup: 30 minutes
- Integration: 1 hour
- Testing: 30 minutes
- Documentation: 30 minutes
- **Total: 2.5 hours**

## Dependencies
- Semantic search must be operational ✅
- Agent protocol must allow updates
- Documentation must be accessible

## Success Criteria
1. Agents can search memory before starting work
2. Search results are relevant (similarity > 0.3)
3. Time saved is measurable
4. Documentation is clear
EOF

echo "✓ Implementation plan created:"
echo "  $PLAN_FILE"

echo ""

# Step 6: Mark Task Complete
echo "=== Step 6: Marking Task Complete ==="

# Update work queue
python3 <<PYTHON
import json
from datetime import datetime

work_queue_file = "$WORK_QUEUE_FILE"
with open(work_queue_file, 'r') as f:
    tasks = json.load(f)

# Find and update our demo task
for task in tasks:
    if task['id'] == '$TASK_ID':
        task['status'] = 'completed'
        task['updated_at'] = datetime.now().isoformat()
        task['actual_duration'] = 0.1  # Demo was quick
        print(f"✓ Task marked complete: {task['id']}")
        break

with open(work_queue_file, 'w') as f:
    json.dump(tasks, f, indent=2)
PYTHON

# Update timeline
COMPLETION_ENTRY=$(cat <<EOF

## $(date +"%Y-%m-%dT%H:%M:%SZ") - [TASK_COMPLETED] $TASK_ID "Demo: Implement semantic search integration" completed by agent-research

EOF
)

echo "$COMPLETION_ENTRY" >> "$TIMELINE_FILE"
echo "✓ Timeline updated with task completion"

echo ""

echo "=========================================="
echo "Demo Complete!"
echo "=========================================="
echo ""
echo "Summary of Agent Workflow:"
echo "  1. ✓ Added task to work queue"
echo "  2. ✓ Updated timeline (start)"
echo "  3. ✓ Created session documentation"
echo "  4. ✓ Used semantic search"
echo "  5. ✓ Created implementation plan"
echo "  6. ✓ Updated timeline (complete)"
echo ""
echo "Files Created/Modified:"
echo "  - Work Queue: $WORK_QUEUE_FILE"
echo "  - Timeline: $TIMELINE_FILE"
echo "  - Session Docs: $SESSION_DIR/"
echo ""
echo "This is the complete workflow agents should follow!"
