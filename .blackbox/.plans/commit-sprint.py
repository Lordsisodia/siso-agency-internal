#!/usr/bin/env python3
"""
Commit Sprint 1 tasks to sprint backlog.
Moves the top 3 prioritized tasks from backlog to sprint_backlog.
"""

import sys
import os
from pathlib import Path
import json

os.chdir('/Users/shaansisodia/DEV/client-projects/lumelle')

print("🎯 Committing Sprint 1 Tasks")
print("=" * 70)
print()

# Load board
board_file = Path(".blackbox/.plans/kanban/lumelle-refactoring.json")
with open(board_file, 'r') as f:
    board_data = json.load(f)

cards = board_data['cards']
columns = board_data['columns']

# Sprint 1 task IDs (from actual board)
sprint1_card_ids = [
    "937827f8",  # Issue #199: Debug Code Cleanup
    "3c2350a2",  # Issue #196: TypeScript Configuration
    "6340ab76"   # Issue #193: CartContext.tsx Refactoring (in planning)
]

print("📋 Sprint 1 Commitment:")
print()

# Find and move cards
committed_cards = []
for card_id in sprint1_card_ids:
    if card_id not in cards:
        print(f"   ⚠️  NOT FOUND: {card_id}")
        continue

    card = cards[card_id]
    old_column = card['column_id']

    # Skip if already in sprint_backlog or planning
    if old_column in ['sprint_backlog', 'planning']:
        committed_cards.append(card)
        print(f"   ✓ {card['title']}")
        print(f"      Already in: {old_column}")
        print()
        continue

    # Remove from old column
    if old_column in columns and card_id in columns[old_column]['card_ids']:
        columns[old_column]['card_ids'].remove(card_id)

    # Add to sprint_backlog
    card['column_id'] = 'sprint_backlog'
    if 'sprint_backlog' not in columns:
        columns['sprint_backlog'] = {
            'id': 'sprint_backlog',
            'name': 'Sprint Backlog',
            'position': 2,
            'card_ids': []
        }
    columns['sprint_backlog']['card_ids'].append(card_id)

    committed_cards.append(card)

    estimate = card.get('metadata', {}).get('estimated', 'Unknown')
    priority = card.get('priority', 'Unknown')

    print(f"   ✅ {card['title']}")
    print(f"      Priority: {priority}")
    print(f"      Estimate: {estimate}")
    print(f"      Moved: {old_column} → sprint_backlog")
    print()

# Check WIP limit
wip_limit = board_data.get('wip_limits', {}).get('sprint_backlog', 3)
current_count = len(columns['sprint_backlog']['card_ids'])

print("=" * 70)
print("📊 SPRINT BACKLOG STATUS")
print("=" * 70)
print()

print(f"Total Tasks: {current_count}")
print(f"WIP Limit: {wip_limit}")

if current_count > wip_limit:
    print(f"⚠️  WARNING: Over WIP limit by {current_count - wip_limit} tasks")
else:
    print(f"✅ Within WIP limit ({wip_limit - current_count} slots available)")

print()

# Show committed cards
print("🎯 COMMITTED CARDS:")
for i, card in enumerate(committed_cards, 1):
    print(f"   {i}. {card['title']}")
    desc = card.get('description', '')
    if len(desc) > 80:
        desc = desc[:77] + "..."
    print(f"      {desc}")
    print()

# Save updated board
print("💾 Saving board...")
with open(board_file, 'w') as f:
    json.dump(board_data, f, indent=2)
print("   ✅ Saved")
print()

print("=" * 70)
print("✅ SPRINT 1 COMMIT COMPLETE!")
print("=" * 70)
print()

print("🚀 NEXT STEPS:")
print()
print("1. Review Sprint Goal:")
print("   cat .blackbox/.plans/sprint-1-goal.md")
print()
print("2. Move first task to Planning:")
print("   python3 .blackbox/.plans/move-first-sprint-task.py")
print()
print("3. Start Issue #199 (Debug Cleanup):")
print("   - Use START-PROMPT.md for architect")
print("   - Quick win (2-3 hours)")
print("   - Clean slate")
print()
print("4. Track progress:")
print("   python3 .blackbox/.plans/board-status.py")
print()
