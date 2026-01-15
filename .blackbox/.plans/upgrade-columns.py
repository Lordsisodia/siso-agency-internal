#!/usr/bin/env python3
"""
Add new columns to existing Kanban board and migrate cards.
"""

import sys
import os
from pathlib import Path
import json

os.chdir('/Users/shaansisodia/DEV/client-projects/lumelle')

# Load existing board
board_file = Path(".blackbox/.plans/kanban/lumelle-refactoring.json")

print("📂 Loading existing board...")
with open(board_file, 'r') as f:
    data = json.load(f)

print(f"   Columns: {list(data['columns'].keys())}")
print(f"   Cards: {len(data['cards'])}")
print()

# Define new columns with their order
new_columns = [
    {"id": "icebox", "name": "Icebox", "position": 0},
    {"id": "backlog", "name": "Backlog", "position": 1},
    {"id": "sprint_backlog", "name": "Sprint Backlog", "position": 2},
    {"id": "planning", "name": "Planning", "position": 3},
    {"id": "in_progress", "name": "In Progress", "position": 4},
    {"id": "qa", "name": "QA", "position": 5},
    {"id": "review", "name": "Review", "position": 6},
    {"id": "done", "name": "Done", "position": 7},
    {"id": "blocked", "name": "Blocked", "position": 8}
]

# Update columns
print("✅ Updating columns...")
for new_col in new_columns:
    col_id = new_col['id']

    if col_id not in data['columns']:
        # Add new column
        data['columns'][col_id] = {
            "id": col_id,
            "name": new_col['name'],
            "position": new_col['position'],
            "card_ids": []
        }
        print(f"   + Added: {col_id}")
    else:
        # Update existing column
        data['columns'][col_id]['position'] = new_col['position']
        data['columns'][col_id]['name'] = new_col['name']
        print(f"   ~ Updated: {col_id}")

# Reorder cards to match new column structure
print()
print("✅ Reordering cards...")

# Map old columns to new columns
column_mapping = {
    "backlog": "backlog",
    "planning": "planning",
    "in_progress": "in_progress",
    "in_review": "review",
    "done": "done"
}

# Update card column_ids and add definition_of_done
for card_id, card in data['cards'].items():
    old_column = card['column_id']

    # Map to new column
    if old_column in column_mapping:
        new_column = column_mapping[old_column]
        card['column_id'] = new_column

    # Add definition_of_done if not present
    if 'definition_of_done' not in card:
        card['definition_of_done'] = [
            {"id": "dod1", "text": "Code reviewed", "completed": False},
            {"id": "dod2", "text": "All tests passing", "completed": False},
            {"id": "dod3", "text": "No ESLint errors", "completed": False},
            {"id": "dod4", "text": "Documentation updated", "completed": False},
            {"id": "dod5", "text": "Merged to main branch", "completed": False}
        ]

# Add WIP limits
print()
print("⚙️  Setting WIP limits...")
data['wip_limits'] = {
    "sprint_backlog": 3,
    "planning": 2,
    "in_progress": 2,
    "qa": 2,
    "review": 2
}

print("   sprint_backlog: 3")
print("   planning: 2")
print("   in_progress: 2")
print("   qa: 2")
print("   review: 2")

# Save updated board
print()
print("💾 Saving updated board...")
with open(board_file, 'w') as f:
    json.dump(data, f, indent=2)

print("   ✅ Saved to: .blackbox/.plans/kanban/lumelle-refactoring.json")
print()

print("=" * 60)
print("🎊 BOARD UPGRADE COMPLETE!")
print("=" * 60)
print()

# Count cards per column
print("📌 Cards by Column:")
for col_id in [c['id'] for c in new_columns]:
    if col_id in data['columns']:
        count = len(data['columns'][col_id]['card_ids'])
        print(f"   {col_id:20} {count} cards")

print()
print(f"📊 Total Cards: {len(data['cards'])}")
print()
print("🚀 Next: Run dependency mapper")
print("   python3 .blackbox/.plans/map-dependencies.py")
