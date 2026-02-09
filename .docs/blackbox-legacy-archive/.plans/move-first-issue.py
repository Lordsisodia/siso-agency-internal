#!/usr/bin/env python3
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
