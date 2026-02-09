#!/usr/bin/env python3
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
    print(f"\nDescription:")
    print(card['description'])
    print(f"\nMetadata:")
    for key, value in card.get('metadata', {}).items():
        print(f"  {key}: {value}")
    print(f"\nChecklist:")
    for item in card.get('checklist', []):
        status = "✅" if item['completed'] else "☐"
        print(f"  {status} {item['text']}")
else:
    print(f"Card {card_id} not found")
