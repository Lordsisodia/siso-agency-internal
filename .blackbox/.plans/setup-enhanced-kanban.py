#!/usr/bin/env python3
"""
Enhanced Kanban board setup with additional columns, task types, labels, and dependencies.
Run this to upgrade the existing board with sprint management features.
"""

import sys
import os
from pathlib import Path
import json
from datetime import datetime

# Change to project root
os.chdir('/Users/shaansisodia/DEV/client-projects/lumelle')
sys.path.insert(0, '.blackbox/3-modules/kanban')

from board import KanbanBoard, Priority

def setup_enhanced_kanban():
    """Upgrade kanban board with enhanced columns and features."""

    print("🎯 Upgrading Kanban board with enhanced features...")
    print()

    # Load existing board
    existing_board_file = Path(".blackbox/.plans/kanban/lumelle-refactoring.json")

    if existing_board_file.exists():
        print("📂 Loading existing board...")
        with open(existing_board_file, 'r') as f:
            existing_data = json.load(f)
        print(f"   Found {len(existing_data.get('cards', {}))} existing cards")
        print()
    else:
        existing_data = None
        print("ℹ️  No existing board found, creating new...")
        print()

    # Create enhanced board with additional columns
    board = KanbanBoard(
        board_name="lumelle-refactoring",
        storage_path=Path(".blackbox/.plans/kanban"),
        default_columns=[
            "icebox",           # Future work (Phase 2-4)
            "backlog",          # All prioritized work
            "sprint_backlog",   # Committed for current sprint
            "planning",         # Architect creating specs
            "in_progress",      # Dev implementing
            "qa",               # Testing & validation
            "review",           # Final review
            "done",             # Completed
            "blocked"           # Stuck issues
        ]
    )

    print("✅ Enhanced board created with columns:")
    for col_id, col in board.columns.items():
        wip_limit = board.wip_limits.get(col_id, "∞")
        print(f"   - {col_id:20} (WIP: {wip_limit})")
    print()

    # Set WIP limits for flow columns
    print("⚙️  Setting WIP limits:")
    board.set_wip_limit("sprint_backlog", 3)  # Max 3 issues per sprint
    board.set_wip_limit("planning", 2)         # Max 2 in planning
    board.set_wip_limit("in_progress", 2)      # Max 2 in parallel
    board.set_wip_limit("qa", 2)               # Max 2 in QA
    board.set_wip_limit("review", 2)           # Max 2 in review
    print("   - sprint_backlog: 3 (max 3 issues committed)")
    print("   - planning: 2 (max 2 in architecture)")
    print("   - in_progress: 2 (max 2 in parallel)")
    print("   - qa: 2 (max 2 in testing)")
    print("   - review: 2 (max 2 in review)")
    print()

    # Migrate existing cards if any
    migrated_cards = []
    if existing_data and 'cards' in existing_data:
        for card_id, card in existing_data['cards'].items():
            # Map old columns to new columns
            old_column = card['column_id']
            new_column = map_column(old_column)

            # Create card with enhanced metadata
            new_card_id = board.create_card(
                title=card['title'],
                description=card['description'],
                column_id=new_column,
                priority=Priority(card['priority']),
                labels=card.get('labels', []),
                metadata={
                    **card.get('metadata', {}),
                    'card_type': determine_card_type(card),
                    'size': estimate_size(card),
                    'definition_of_done': get_definition_of_done()
                }
            )

            if new_card_id:
                migrated_cards.append(new_card_id)
                print(f"   ✅ Migrated: {card['title']}")

    print()

    # Add Landing Page tasks
    landing_tasks = [
        {
            "title": "Hero - Update imagery",
            "description": "Update hero section imagery with new branding assets",
            "type": "feature",
            "priority": Priority.HIGH,
            "size": "M",
            "estimate": "2 days",
            "labels": ["P1", "ui", "landing-page", "hero"],
            "domain": "ui"
        },
        {
            "title": "Hero - Refine copy",
            "description": "Improve hero section copy for better conversion",
            "type": "feature",
            "priority": Priority.HIGH,
            "size": "S",
            "estimate": "1 day",
            "labels": ["P1", "ui", "landing-page", "hero", "copywriting"],
            "domain": "ui"
        },
        {
            "title": "Customer Stories - Add testimonials",
            "description": "Add 3-5 new customer testimonials with quotes and photos",
            "type": "feature",
            "priority": Priority.HIGH,
            "size": "M",
            "estimate": "2 days",
            "labels": ["P1", "ui", "landing-page", "testimonials"],
            "domain": "ui"
        },
        {
            "title": "Customer Stories - Update logos",
            "description": "Update customer logo carousel with latest clients",
            "type": "feature",
            "priority": Priority.MEDIUM,
            "size": "S",
            "estimate": "1 day",
            "labels": ["P2", "ui", "landing-page", "logos"],
            "domain": "ui"
        },
        {
            "title": "Customer Stories - Refine layout",
            "description": "Improve testimonials section layout and responsiveness",
            "type": "feature",
            "priority": Priority.MEDIUM,
            "size": "M",
            "estimate": "2 days",
            "labels": ["P2", "ui", "landing-page", "responsive"],
            "domain": "ui"
        },
        {
            "title": "Customer Stories - Add carousel",
            "description": "Implement carousel functionality for testimonials",
            "type": "feature",
            "priority": Priority.MEDIUM,
            "size": "L",
            "estimate": "3 days",
            "labels": ["P2", "ui", "landing-page", "carousel"],
            "domain": "ui"
        },
        {
            "title": "Spin Wheel - Implement component",
            "description": "Build spin wheel component for promotional offers",
            "type": "feature",
            "priority": Priority.MEDIUM,
            "size": "L",
            "estimate": "3 days",
            "labels": ["P2", "ui", "spin-wheel", "interactive"],
            "domain": "ui"
        },
        {
            "title": "Spin Wheel - Connect backend",
            "description": "Connect spin wheel to backend offers and redemption system",
            "type": "feature",
            "priority": Priority.MEDIUM,
            "size": "M",
            "estimate": "2 days",
            "labels": ["P2", "backend", "spin-wheel", "integration"],
            "domain": "backend"
        },
        {
            "title": "Footer - Update links",
            "description": "Update footer links and company information",
            "type": "chore",
            "priority": Priority.LOW,
            "size": "XS",
            "estimate": "1 day",
            "labels": ["P3", "ui", "footer"],
            "domain": "ui"
        }
    ]

    print("📋 Adding Landing Page tasks:")
    for task in landing_tasks:
        card_id = board.create_card(
            title=f"LP: {task['title']}",
            description=task['description'],
            column_id="backlog",
            priority=task['priority'],
            labels=task['labels'],
            metadata={
                'card_type': task['type'],
                'size': task['size'],
                'domain': task['domain'],
                'estimated': task['estimate'],
                'project': 'landing-page'
            }
        )
        if card_id:
            print(f"   ✅ {task['title']} ({task['estimate']}, {task['size']})")
    print()

    # Add WebhookInbox tasks
    webhook_tasks = [
        {
            "title": "Verification parity review",
            "description": "Review current webhook verification implementation and identify gaps",
            "type": "spike",
            "priority": Priority.HIGH,
            "size": "S",
            "estimate": "2 days",
            "labels": ["P1", "webhooks", "security", "research"],
            "domain": "security"
        },
        {
            "title": "Design richer inbox records",
            "description": "Design enhanced webhook inbox record structure with full request/response data",
            "type": "feature",
            "priority": Priority.HIGH,
            "size": "M",
            "estimate": "3 days",
            "labels": ["P1", "webhooks", "database", "design"],
            "domain": "backend"
        },
        {
            "title": "Implement replay tooling",
            "description": "Build tooling to replay webhooks from inbox for testing and debugging",
            "type": "feature",
            "priority": Priority.MEDIUM,
            "size": "L",
            "estimate": "4 days",
            "labels": ["P2", "webhooks", "tools", "developer-experience"],
            "domain": "tools"
        },
        {
            "title": "Add auditability features",
            "description": "Add comprehensive audit logging for all webhook processing",
            "type": "feature",
            "priority": Priority.MEDIUM,
            "size": "M",
            "estimate": "2 days",
            "labels": ["P2", "webhooks", "logging", "audit"],
            "domain": "backend"
        },
        {
            "title": "Testing & validation",
            "description": "Comprehensive testing of webhook inbox improvements",
            "type": "feature",
            "priority": Priority.HIGH,
            "size": "M",
            "estimate": "2 days",
            "labels": ["P1", "webhooks", "testing", "qa"],
            "domain": "qa"
        }
    ]

    print("📋 Adding WebhookInbox tasks:")
    for task in webhook_tasks:
        card_id = board.create_card(
            title=f"WH: {task['title']}",
            description=task['description'],
            column_id="backlog",
            priority=task['priority'],
            labels=task['labels'],
            metadata={
                'card_type': task['type'],
                'size': task['size'],
                'domain': task['domain'],
                'estimated': task['estimate'],
                'project': 'webhook-inbox'
            }
        )
        if card_id:
            print(f"   ✅ {task['title']} ({task['estimate']}, {task['size']})")
    print()

    # Print summary
    print("=" * 70)
    print("🎊 ENHANCED KANBAN BOARD SETUP COMPLETE!")
    print("=" * 70)
    print()

    total_cards = len(board.cards)
    print(f"📊 Total Cards: {total_cards}")
    print()

    # Count by type
    card_types = {}
    for card in board.cards.values():
        card_type = card.get('metadata', {}).get('card_type', 'unknown')
        card_types[card_type] = card_types.get(card_type, 0) + 1

    print("🏷️  Cards by Type:")
    for card_type, count in sorted(card_types.items()):
        print(f"   {card_type:15} {count}")
    print()

    # Count by column
    print("📌 Cards by Column:")
    for col_id, col in board.columns.items():
        count = len(col['card_ids'])
        print(f"   {col_id:20} {count} cards")
    print()

    print("🚀 NEXT STEPS:")
    print()
    print("1. Create Sprint Goal document:")
    print("   python3 .blackbox/.plans/create-sprint-goal.py")
    print()
    print("2. Map task dependencies:")
    print("   python3 .blackbox/.plans/map-dependencies.py")
    print()
    print("3. Commit top 3 items to sprint backlog:")
    print("   python3 .blackbox/.plans/commit-sprint.py")
    print()
    print("4. View board status:")
    print("   python3 .blackbox/.plans/board-status-enhanced.py")
    print()

    return board

def map_column(old_column):
    """Map old column names to new enhanced columns."""
    mapping = {
        "backlog": "backlog",        # Keep same
        "planning": "planning",        # Keep same
        "in_progress": "in_progress",  # Keep same
        "in_review": "review",         # Map in_review → review
        "done": "done"                # Keep same
    }
    return mapping.get(old_column, "backlog")

def determine_card_type(card):
    """Determine card type based on title and labels."""
    title = card['title'].lower()
    labels = ' '.join(card.get('labels', [])).lower()

    if 'issue #' in title or 'refactor' in title:
        return "refactor"
    elif 'bug' in title or 'fix' in title:
        return "bug"
    elif 'research' in title or 'spike' in title or 'audit' in title:
        return "spike"
    elif 'update' in title or 'cleanup' in title:
        return "chore"
    else:
        return "feature"

def estimate_size(card):
    """Estimate card size based on metadata."""
    estimate = card.get('metadata', {}).get('estimated', '')

    if 'hour' in estimate.lower():
        return "XS"  # < 1 day
    elif '1 day' in estimate or '2-3 day' in estimate:
        return "S"   # 1-2 days
    elif '2-3 day' in estimate:
        return "M"   # 3-5 days
    elif '8-12 day' in estimate or '7-12 day' in estimate:
        return "L"   # 6-10 days
    else:
        return "M"   # Default

def get_definition_of_done():
    """Return standard definition of done checklist."""
    return [
        {"id": "dod1", "text": "Code reviewed", "completed": False},
        {"id": "dod2", "text": "All tests passing", "completed": False},
        {"id": "dod3", "text": "No ESLint errors", "completed": False},
        {"id": "dod4", "text": "Documentation updated", "completed": False},
        {"id": "dod5", "text": "Merged to main branch", "completed": False}
    ]

if __name__ == "__main__":
    setup_enhanced_kanban()
