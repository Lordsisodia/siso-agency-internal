#!/usr/bin/env python3
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
