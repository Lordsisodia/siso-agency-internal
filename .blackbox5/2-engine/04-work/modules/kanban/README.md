# Blackbox3 Kanban Module

Task management and Kanban board workflow system.

## Features

### KanbanBoard
- Customizable columns and workflows
- WIP (Work In Progress) limits
- Card management with priorities and due dates
- Labels, watchers, and attachments
- Checklist support
- Activity logging
- Board analytics and cycle time tracking

### SprintManager (In Progress)
- Sprint planning and execution
- Velocity tracking
- Sprint burndown charts
- Team capacity management

### WorkflowEngine (In Progress)
- Custom workflow definitions
- Automated transitions
- Webhook integrations

## Quick Start

```python
from modules.kanban import KanbanBoard

# Initialize board
board = KanbanBoard("My Project")

# Create card
card_id = board.create_card(
    title="Implement authentication",
    description="Add login and registration",
    priority=Priority.HIGH,
    assignee="john@example.com"
)

# Move card
board.move_card(card_id, "in_progress")

# Add checklist
board.add_checklist_item(card_id, "Design database schema")
board.add_checklist_item(card_id, "Implement login API")

# Get analytics
analytics = board.get_board_analytics()
print(f"Cycle time: {analytics['avg_cycle_time_days']} days")
```

## CLI Usage

```bash
# Create card
python -m modules.kanban.board create \
  --title "Fix bug" \
  --description "Critical issue" \
  --priority critical

# Move card
python -m modules.kanban.board move \
  --id abc123 \
  --column in_progress

# View analytics
python -m modules.kanban.board analytics

# Export board
python -m modules.kanban.board export --output board.md
```

## Status

✅ KanbanBoard - Complete
⚠️  SprintManager - Needs implementation
⚠️  WorkflowEngine - Needs implementation
