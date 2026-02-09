#!/usr/bin/env python3
"""
Quick setup script to initialize Kanban board with Phase 1 issues.
Run this ONCE to set up the board for systematic refactoring.
"""

import sys
import os
from pathlib import Path
import json
from datetime import datetime

# Change to project root
os.chdir('/Users/shaansisodia/DEV/client-projects/lumelle')
sys.path.insert(0, '.blackbox/4-scripts/lib/hierarchical-tasks')

from hierarchical_task import HierarchicalTask

# Import KanbanBoard
sys.path.insert(0, '.blackbox/3-modules/kanban')
from board import KanbanBoard, Priority

def setup_kanban():
    """Initialize kanban board with Phase 1 critical issues."""

    print("🎯 Setting up Kanban board for Lumelle Systematic Refactoring...")
    print()

    # Create board
    board = KanbanBoard(
        board_name="lumelle-refactoring",
        storage_path=Path(".blackbox/.plans/kanban"),
        default_columns=["backlog", "planning", "in_progress", "in_review", "done"]
    )

    print("✅ Board created with columns:")
    for col_id, col in board.columns.items():
        print(f"   - {col_id}")
    print()

    # Phase 1 Issues Data
    phase1_issues = [
        {
            "number": 193,
            "title": "CartContext.tsx Refactoring",
            "description": "Reduce CartContext from 562 to <300 lines by extracting cart operations and calculations into separate modules.",
            "priority": Priority.CRITICAL,
            "estimated": "8-12 days",
            "subtasks": 10
        },
        {
            "number": 194,
            "title": "Analytics Domain Migration",
            "description": "Fix analytics tracking on wrong domain. Audit events, update configuration, migrate to correct domain.",
            "priority": Priority.CRITICAL,
            "estimated": "7-12 days",
            "subtasks": 10
        },
        {
            "number": 195,
            "title": "DrawerProvider Split",
            "description": "Split DrawerProvider (860 lines) into focused providers for cart drawer, menu drawer, and other drawer types.",
            "priority": Priority.CRITICAL,
            "estimated": "TBD",
            "subtasks": 8
        },
        {
            "number": 196,
            "title": "TypeScript Configuration",
            "description": "Update tsconfig.json with proper settings and fix type errors throughout codebase.",
            "priority": Priority.CRITICAL,
            "estimated": "2-3 days",
            "subtasks": 8
        },
        {
            "number": 197,
            "title": "localStorage Key Management",
            "description": "Create centralized, namespaced localStorage key management with type safety.",
            "priority": Priority.CRITICAL,
            "estimated": "4-6 hours",
            "subtasks": 7
        },
        {
            "number": 198,
            "title": "Platform Commerce Runtime",
            "description": "Fix platform commerce runtime configuration and add proper error handling.",
            "priority": Priority.CRITICAL,
            "estimated": "4-6 hours",
            "subtasks": 6
        },
        {
            "number": 199,
            "title": "Debug Code Cleanup",
            "description": "Remove all console.log and debugger statements, add proper logging where needed.",
            "priority": Priority.CRITICAL,
            "estimated": "2-3 hours",
            "subtasks": 5
        },
        {
            "number": 200,
            "title": "Volume Discount Duplication",
            "description": "Consolidate duplicate volume discount logic into single source of truth with unit tests.",
            "priority": Priority.CRITICAL,
            "estimated": "4-6 hours",
            "subtasks": 6
        }
    ]

    # Create cards for each issue
    print("📋 Creating cards for Phase 1 issues:")
    print()

    card_ids = []

    for issue in phase1_issues:
        card_id = board.create_card(
            title=f"Issue #{issue['number']}: {issue['title']}",
            description=issue['description'],
            column_id="backlog",
            priority=issue['priority'],
            labels=["P0", "Phase-1", f"issue-{issue['number']}"],
            metadata={
                "issue_number": issue['number'],
                "estimated": issue['estimated'],
                "subtask_count": issue['subtasks'],
                "hierarchical_task_file": f".blackbox/.memory/working/hierarchical-tasks/issue-{issue['number']}.json",
                "phase": "Phase 1"
            }
        )

        if card_id:
            card_ids.append(card_id)
            print(f"   ✅ Issue #{issue['number']}: {issue['title']}")
            print(f"      Priority: {issue['priority'].value}")
            print(f"      Estimate: {issue['estimated']}")
            print(f"      Subtasks: {issue['subtasks']}")
            print()

    # Set WIP limits
    print("⚙️  Setting WIP limits:")
    board.set_wip_limit("in_progress", 3)
    print("   - in_progress: 3 (max 3 issues at once)")
    print()

    # Print board summary
    print("=" * 60)
    print("🎊 KANBAN BOARD SETUP COMPLETE!")
    print("=" * 60)
    print()
    print(f"📍 Board location: .blackbox/.plans/kanban/lumelle-refactoring.json")
    print(f"📊 Total cards: {len(card_ids)}")
    print(f"📋 Columns: {len(board.columns)}")
    print()
    print("🚀 NEXT STEPS:")
    print()
    print("1. Move Issue #193 from backlog → planning:")
    print("   board.move_card('CARD_ID', 'planning')")
    print()
    print("2. Start lumelle-architect on Issue #193:")
    print("   Load: .blackbox/.memory/working/hierarchical-tasks/issue-193.json")
    print("   Create execution specification")
    print()
    print("3. Track progress:")
    print("   - Update Kanban cards as you progress")
    print("   - Mark checklist items complete")
    print("   - Move cards through columns")
    print()
    print("📖 Quick Commands:")
    print()
    print("# View board status")
    print("python3 -c \"from modules.kanban.board import KanbanBoard; from pathlib import Path; b = KanbanBoard('lumelle-refactoring', Path('.blackbox/.plans/kanban')); b.print_board_status()\"")
    print()
    print("# Move first card to planning")
    print("python3 .blackbox/.plans/move-first-issue.py")
    print()
    print("# View specific card")
    print("python3 .blackbox/.plans/view-card.py CARD_ID")
    print()

    # Create helper scripts
    create_helper_scripts(card_ids)

    return board

def create_helper_scripts(card_ids):
    """Create convenience scripts for working with the board."""

    # Script: Move first issue to planning
    move_script = """#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, '.blackbox/3-modules/kanban')

from board import KanbanBoard

board = KanbanBoard("lumelle-refactoring", Path(".blackbox/.plans/kanban"))

# Get first backlog card
backlog_cards = board.columns["backlog"]["card_ids"]
if backlog_cards:
    card_id = backlog_cards[0]
    card = board.cards[card_id]
    print(f"Moving {card['title']} to planning...")
    board.move_card(card_id, "planning")
    print("✅ Moved to planning column")
else:
    print("No cards in backlog")
"""

    script_path = Path(".blackbox/.plans/move-first-issue.py")
    with open(script_path, 'w') as f:
        f.write(move_script)
    os.chmod(script_path, 0o755)
    print(f"✅ Created helper: {script_path}")
    print()

    # Create card viewing script
    view_script = """#!/usr/bin/env python3
import sys
import json
from pathlib import Path

if len(sys.argv) < 2:
    print("Usage: python3 view-card.py CARD_ID")
    sys.exit(1)

card_id = sys.argv[1]
board_file = Path(".blackbox/.plans/kanban/lumelle-refactoring.json")

with open(board_file, 'r') as f:
    data = json.load(f)

if card_id in data['cards']:
    card = data['cards'][card_id]
    print(f"Card: {card['title']}")
    print(f"Column: {card['column_id']}")
    print(f"Priority: {card['priority']}")
    print(f"\\nDescription:")
    print(card['description'])
    print(f"\\nMetadata:")
    for key, value in card.get('metadata', {}).items():
        print(f"  {key}: {value}")
    print(f"\\nChecklist:")
    for item in card.get('checklist', []):
        status = "✅" if item['completed'] else "☐"
        print(f"  {status} {item['text']}")
else:
    print(f"Card {card_id} not found")
"""

    script_path = Path(".blackbox/.plans/view-card.py")
    with open(script_path, 'w') as f:
        f.write(view_script)
    os.chmod(script_path, 0o755)
    print(f"✅ Created helper: {script_path}")
    print()

    # Create status script
    status_script = """#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, '.blackbox/3-modules/kanban')

from board import KanbanBoard

board = KanbanBoard("lumelle-refactoring", Path(".blackbox/.plans/kanban"))

print("🎯 Lumelle Refactoring - Kanban Board Status")
print("=" * 60)
print()

for col_id, col in board.columns.items():
    print(f"📌 {col_id.replace('_', ' ').title()} ({len(col['card_ids'])} cards)")
    for card_id in col['card_ids']:
        card = board.cards[card_id]
        issue_num = card.get('metadata', {}).get('issue_number', '?')
        estimate = card.get('metadata', {}).get('estimated', '?')
        completed = sum(1 for item in card.get('checklist', []) if item['completed'])
        total = len(card.get('checklist', []))
        print(f"   Issue #{issue_num}: {card['title']}")
        print(f"   Priority: {card['priority']} | Estimate: {estimate}")
        if total > 0:
            print(f"   Progress: {completed}/{total} ({int(completed/total*100)}%)")
        print()

analytics = board.get_board_analytics()
if analytics:
    print("📊 Analytics")
    print(f"   Total Cards: {analytics.get('total_cards', 0)}")
    print(f"   Completed: {analytics.get('completed_cards', 0)}")
"""

    script_path = Path(".blackbox/.plans/board-status.py")
    with open(script_path, 'w') as f:
        f.write(status_script)
    os.chmod(script_path, 0o755)
    print(f"✅ Created helper: {script_path}")
    print()

if __name__ == "__main__":
    setup_kanban()
