#!/usr/bin/env python3
"""
Setup SISO Internal Kanban Board
"""
import sys
sys.path.insert(0, '.blackbox/3-modules')

from kanban.board import KanbanBoard, Priority, TaskStatus
import json
from pathlib import Path

# Create board for SISO Internal
board = KanbanBoard(
    board_name="siso-internal",
    storage_path=Path(".blackbox/.memory/working/kanban"),
    default_columns=["backlog", "todo", "in_progress", "in_review", "done"]
)

print("✅ Created Kanban board: siso-internal")
print(f"   Location: .blackbox/.memory/working/kanban/")
print()

# Load work queue
with open('.blackbox/.memory/working/shared/work-queue.json', 'r') as f:
    work_queue = json.load(f)

print(f"📋 Found {len(work_queue)} task groups in work queue")
print()

# Add tasks to Kanban board
for task_group in work_queue:
    print(f"📦 Task Group: {task_group['title']}")
    
    # Create card for main task
    main_card_id = board.create_card(
        title=task_group['title'],
        description=task_group.get('description', ''),
        priority=Priority.HIGH if task_group.get('priority') == 'high' else Priority.MEDIUM
    )
    
    print(f"   └─ Created card: {main_card_id}")
    
    # Add subtasks as checklist items
    if 'subtasks' in task_group:
        for subtask in task_group['subtasks']:
            board.add_checklist_item(
                main_card_id,
                f"[{subtask['domain']}] {subtask['title']}"
            )
        
        print(f"   └─ Added {len(task_group['subtasks'])} subtasks")
    
    # Move to appropriate column
    if task_group['status'] == 'in_progress':
        board.move_card(main_card_id, 'in_progress')
    else:
        board.move_card(main_card_id, 'todo')
    
    print()

print("=" * 60)
print("📊 BOARD SUMMARY")
print("=" * 60)

analytics = board.get_board_analytics()
print(f"Total Cards: {analytics.get('total_cards', 0)}")
print(f"Cards by Status:")
for status in TaskStatus:
    count = analytics.get('cards_by_status', {}).get(status.value, 0)
    if count > 0:
        print(f"  - {status.value}: {count}")

print()
print("✅ Kanban board setup complete!")
print()
print("To view the board:")
print("  python3 .blackbox/3-modules/kanban/setup-siso-board.py --view")
print()
print("To export to markdown:")
print("  python3 .blackbox/3-modules/kanban/setup-siso-board.py --export")
