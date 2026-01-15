#!/usr/bin/env python3
"""
Kanban Board for Blackbox3

Provides visual Kanban board with column management,
WIP limits, and workflow automation.
"""

import json
import uuid
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum
import threading


class TaskStatus(Enum):
    """Task status enumeration."""
    BACKLOG = "backlog"
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    BLOCKED = "blocked"
    DONE = "done"
    ARCHIVED = "archived"


class Priority(Enum):
    """Task priority enumeration."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class KanbanBoard:
    """
    Manages Kanban board with columns, WIP limits, and cards.

    Features:
    - Customizable columns and workflows
    - WIP (Work In Progress) limits
    - Card aging and due dates
    - Labels and tags
    - Assignees and watchers
    - Attachments and checklists
    - Activity logging
    - Board analytics
    """

    def __init__(
        self,
        board_name: str,
        storage_path: Optional[Path] = None,
        default_columns: Optional[List[str]] = None
    ):
        """
        Initialize Kanban board.

        Args:
            board_name: Name of the board
            storage_path: Path for board storage
            default_columns: Default column names
        """
        self.board_name = board_name
        self.storage_path = Path(storage_path) if storage_path else Path.cwd() / ".plans" / "kanban"

        self.storage_path.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()

        # Board configuration
        self.columns: Dict[str, Dict[str, Any]] = {}
        self.cards: Dict[str, Dict[str, Any]] = {}
        self.wip_limits: Dict[str, int] = {}
        self.activity_log: List[Dict[str, Any]] = []

        # Initialize default columns
        if default_columns is None:
            default_columns = ["backlog", "todo", "in_progress", "in_review", "done"]

        self._initialize_columns(default_columns)

        # Load existing board data
        self._load_board()

    def _initialize_columns(self, column_names: List[str]):
        """Initialize board columns."""
        for i, name in enumerate(column_names):
            self.columns[name] = {
                "id": name,
                "name": name.replace("_", " ").title(),
                "position": i,
                "card_ids": []
            }

    def _load_board(self):
        """Load board data from disk."""
        board_file = self.storage_path / f"{self.board_name}.json"

        if board_file.exists():
            try:
                with open(board_file, 'r') as f:
                    data = json.load(f)
                    self.columns = data.get("columns", {})
                    self.cards = data.get("cards", {})
                    self.wip_limits = data.get("wip_limits", {})
                    self.activity_log = data.get("activity_log", [])
            except Exception as e:
                print(f"Warning: Could not load board: {e}")

    def _save_board(self):
        """Save board data to disk."""
        board_file = self.storage_path / f"{self.board_name}.json"

        with self._lock:
            data = {
                "board_name": self.board_name,
                "columns": self.columns,
                "cards": self.cards,
                "wip_limits": self.wip_limits,
                "activity_log": self.activity_log,
                "last_updated": datetime.utcnow().isoformat()
            }

            with open(board_file, 'w') as f:
                json.dump(data, f, indent=2)

    def _log_activity(self, action: str, details: Dict[str, Any]):
        """Log activity to board."""
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "action": action,
            "details": details
        }
        self.activity_log.append(entry)

        # Keep only last 1000 activities
        if len(self.activity_log) > 1000:
            self.activity_log = self.activity_log[-1000:]

    def add_column(self, column_id: str, name: str, position: Optional[int] = None) -> bool:
        """
        Add a new column to the board.

        Args:
            column_id: Unique column identifier
            name: Display name
            position: Optional position (appends if not specified)

        Returns:
            True if successful
        """
        if column_id in self.columns:
            print(f"Error: Column {column_id} already exists")
            return False

        if position is None:
            position = len(self.columns)

        self.columns[column_id] = {
            "id": column_id,
            "name": name,
            "position": position,
            "card_ids": []
        }

        self._log_activity("column_added", {"column_id": column_id, "name": name})
        self._save_board()

        print(f"Added column: {column_id} - {name}")
        return True

    def set_wip_limit(self, column_id: str, limit: int) -> bool:
        """
        Set WIP limit for a column.

        Args:
            column_id: Column ID
            limit: Maximum number of cards

        Returns:
            True if successful
        """
        if column_id not in self.columns:
            print(f"Error: Column {column_id} not found")
            return False

        self.wip_limits[column_id] = limit
        self._log_activity("wip_limit_set", {"column_id": column_id, "limit": limit})
        self._save_board()

        print(f"Set WIP limit for {column_id}: {limit}")
        return True

    def create_card(
        self,
        title: str,
        description: str,
        column_id: str = "backlog",
        priority: Priority = Priority.MEDIUM,
        assignee: Optional[str] = None,
        due_date: Optional[str] = None,
        labels: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Create a new card.

        Args:
            title: Card title
            description: Card description
            column_id: Initial column
            priority: Card priority
            assignee: Assigned user
            due_date: Due date (ISO format)
            labels: Optional labels/tags
            metadata: Optional metadata

        Returns:
            Card ID
        """
        if column_id not in self.columns:
            print(f"Error: Column {column_id} not found")
            return None

        # Check WIP limit
        if column_id in self.wip_limits:
            current_count = len(self.columns[column_id]["card_ids"])
            if current_count >= self.wip_limits[column_id]:
                print(f"Error: WIP limit reached for column {column_id}")
                return None

        card_id = str(uuid.uuid4())[:8]

        card = {
            "id": card_id,
            "title": title,
            "description": description,
            "column_id": column_id,
            "priority": priority.value,
            "assignee": assignee,
            "due_date": due_date,
            "labels": labels or [],
            "checklist": [],
            "attachments": [],
            "watchers": [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "position": len(self.columns[column_id]["card_ids"]),
            "metadata": metadata or {}
        }

        with self._lock:
            self.cards[card_id] = card
            self.columns[column_id]["card_ids"].append(card_id)

            self._log_activity("card_created", {
                "card_id": card_id,
                "title": title,
                "column": column_id
            })

            self._save_board()

        print(f"Created card: {card_id} - {title}")
        return card_id

    def move_card(self, card_id: str, target_column_id: str) -> bool:
        """
        Move card to different column.

        Args:
            card_id: Card ID
            target_column_id: Target column ID

        Returns:
            True if successful
        """
        if card_id not in self.cards:
            print(f"Error: Card {card_id} not found")
            return False

        if target_column_id not in self.columns:
            print(f"Error: Column {target_column_id} not found")
            return False

        card = self.cards[card_id]
        source_column_id = card["column_id"]

        # Check WIP limit
        if target_column_id in self.wip_limits:
            current_count = len(self.columns[target_column_id]["card_ids"])
            if current_count >= self.wip_limits[target_column_id]:
                print(f"Error: WIP limit reached for column {target_column_id}")
                return False

        with self._lock:
            # Remove from source column
            if card_id in self.columns[source_column_id]["card_ids"]:
                self.columns[source_column_id]["card_ids"].remove(card_id)

            # Add to target column
            self.columns[target_column_id]["card_ids"].append(card_id)

            # Update card
            card["column_id"] = target_column_id
            card["updated_at"] = datetime.utcnow().isoformat()

            self._log_activity("card_moved", {
                "card_id": card_id,
                "from": source_column_id,
                "to": target_column_id
            })

            self._save_board()

        print(f"Moved card {card_id} from {source_column_id} to {target_column_id}")
        return True

    def update_card(
        self,
        card_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[Priority] = None,
        assignee: Optional[str] = None,
        due_date: Optional[str] = None
    ) -> bool:
        """
        Update card properties.

        Args:
            card_id: Card ID
            title: New title
            description: New description
            priority: New priority
            assignee: New assignee
            due_date: New due date

        Returns:
            True if successful
        """
        if card_id not in self.cards:
            print(f"Error: Card {card_id} not found")
            return False

        card = self.cards[card_id]

        with self._lock:
            if title:
                card["title"] = title
            if description:
                card["description"] = description
            if priority:
                card["priority"] = priority.value
            if assignee is not None:  # Allow None to unassign
                card["assignee"] = assignee
            if due_date:
                card["due_date"] = due_date

            card["updated_at"] = datetime.utcnow().isoformat()
            self._log_activity("card_updated", {"card_id": card_id})
            self._save_board()

        print(f"Updated card {card_id}")
        return True

    def add_checklist_item(self, card_id: str, item: str) -> bool:
        """
        Add checklist item to card.

        Args:
            card_id: Card ID
            item: Checklist item text

        Returns:
            True if successful
        """
        if card_id not in self.cards:
            return False

        with self._lock:
            self.cards[card_id]["checklist"].append({
                "id": str(uuid.uuid4())[:8],
                "text": item,
                "completed": False,
                "created_at": datetime.utcnow().isoformat()
            })

            self._save_board()

        print(f"Added checklist item to card {card_id}")
        return True

    def toggle_checklist_item(self, card_id: str, item_id: str) -> bool:
        """
        Toggle checklist item completion.

        Args:
            card_id: Card ID
            item_id: Checklist item ID

        Returns:
            True if successful
        """
        if card_id not in self.cards:
            return False

        for item in self.cards[card_id]["checklist"]:
            if item["id"] == item_id:
                item["completed"] = not item["completed"]
                self._save_board()
                return True

        return False

    def add_label(self, card_id: str, label: str) -> bool:
        """
        Add label to card.

        Args:
            card_id: Card ID
            label: Label text

        Returns:
            True if successful
        """
        if card_id not in self.cards:
            return False

        if label not in self.cards[card_id]["labels"]:
            with self._lock:
                self.cards[card_id]["labels"].append(label)
                self._save_board()

        return True

    def add_watcher(self, card_id: str, watcher: str) -> bool:
        """
        Add watcher to card.

        Args:
            card_id: Card ID
            watcher: Watcher name

        Returns:
            True if successful
        """
        if card_id not in self.cards:
            return False

        if watcher not in self.cards[card_id]["watchers"]:
            with self._lock:
                self.cards[card_id]["watchers"].append(watcher)
                self._save_board()

        return True

    def delete_card(self, card_id: str) -> bool:
        """
        Delete card from board.

        Args:
            card_id: Card ID

        Returns:
            True if successful
        """
        if card_id not in self.cards:
            print(f"Error: Card {card_id} not found")
            return False

        card = self.cards[card_id]
        column_id = card["column_id"]

        with self._lock:
            # Remove from column
            if card_id in self.columns[column_id]["card_ids"]:
                self.columns[column_id]["card_ids"].remove(card_id)

            # Remove card
            del self.cards[card_id]

            self._log_activity("card_deleted", {"card_id": card_id})
            self._save_board()

        print(f"Deleted card {card_id}")
        return True

    def get_column_cards(self, column_id: str) -> List[Dict[str, Any]]:
        """
        Get all cards in a column.

        Args:
            column_id: Column ID

        Returns:
            List of cards
        """
        if column_id not in self.columns:
            return []

        card_ids = self.columns[column_id]["card_ids"]
        return [self.cards[cid] for cid in card_ids if cid in self.cards]

    def get_overdue_cards(self) -> List[Dict[str, Any]]:
        """
        Get all overdue cards.

        Returns:
            List of overdue cards
        """
        now = datetime.utcnow().isoformat()
        overdue = []

        for card in self.cards.values():
            if card.get("due_date") and card["due_date"] < now:
                if card["column_id"] not in ["done", "archived"]:
                    overdue.append(card)

        return overdue

    def get_board_analytics(self) -> Dict[str, Any]:
        """
        Get board analytics and statistics.

        Returns:
            Analytics data
        """
        total_cards = len(self.cards)
        cards_by_column = {}
        cards_by_priority = {}
        cards_by_assignee = {}

        for column_id, column in self.columns.items():
            cards_by_column[column_id] = len(column["card_ids"])

        for card in self.cards.values():
            priority = card.get("priority", "medium")
            cards_by_priority[priority] = cards_by_priority.get(priority, 0) + 1

            assignee = card.get("assignee", "unassigned")
            cards_by_assignee[assignee] = cards_by_assignee.get(assignee, 0) + 1

        # Calculate cycle time (average time from start to done)
        done_cards = [c for c in self.cards.values() if c["column_id"] == "done"]
        cycle_times = []

        for card in done_cards:
            if card.get("created_at"):
                created = datetime.fromisoformat(card["created_at"])
                updated = datetime.fromisoformat(card["updated_at"])
                cycle_time = (updated - created).days
                cycle_times.append(cycle_time)

        avg_cycle_time = sum(cycle_times) / len(cycle_times) if cycle_times else 0

        return {
            "total_cards": total_cards,
            "cards_by_column": cards_by_column,
            "cards_by_priority": cards_by_priority,
            "cards_by_assignee": cards_by_assignee,
            "overdue_cards": len(self.get_overdue_cards()),
            "avg_cycle_time_days": avg_cycle_time,
            "wip_limits": self.wip_limits,
            "columns": len(self.columns)
        }

    def export_to_markdown(self, output_path: Optional[Path] = None) -> Path:
        """
        Export board to markdown file.

        Args:
            output_path: Output file path

        Returns:
            Path to exported file
        """
        if output_path is None:
            output_path = self.storage_path / f"{self.board_name}.md"

        with open(output_path, 'w') as f:
            f.write(f"# {self.board_name}\n\n")

            # Analytics
            analytics = self.get_board_analytics()
            f.write("## Board Analytics\n\n")
            f.write(f"- **Total Cards:** {analytics['total_cards']}\n")
            f.write(f"- **Overdue:** {analytics['overdue_cards']}\n")
            f.write(f"- **Avg Cycle Time:** {analytics['avg_cycle_time_days']:.1f} days\n\n")

            # Columns and cards
            for column_id in sorted(self.columns.keys(), key=lambda x: self.columns[x]["position"]):
                column = self.columns[column_id]
                f.write(f"## {column['name']}\n\n")

                cards = self.get_column_cards(column_id)
                if not cards:
                    f.write("*No cards*\n\n")
                    continue

                for card in sorted(cards, key=lambda c: c.get("position", 0)):
                    f.write(f"### {card['title']}\n\n")
                    f.write(f"**ID:** {card['id']}\n")
                    f.write(f"**Priority:** {card.get('priority', 'medium')}\n")

                    if card.get("assignee"):
                        f.write(f"**Assignee:** {card['assignee']}\n")

                    if card.get("due_date"):
                        f.write(f"**Due:** {card['due_date']}\n")

                    if card.get("labels"):
                        f.write(f"**Labels:** {', '.join(card['labels'])}\n")

                    f.write(f"\n{card['description']}\n\n")

                    if card.get("checklist"):
                        completed = sum(1 for item in card["checklist"] if item["completed"])
                        total = len(card["checklist"])
                        f.write(f"**Checklist:** {completed}/{total} complete\n\n")

        print(f"Exported board to: {output_path}")
        return output_path


def cli_main():
    """CLI entry point for Kanban board."""
    import argparse

    parser = argparse.ArgumentParser(description="Blackbox3 Kanban Board")
    parser.add_argument("action", choices=["create", "move", "update", "delete", "list", "analytics", "export"])
    parser.add_argument("--board", help="Board name", default="default")
    parser.add_argument("--id", help="Card ID")
    parser.add_argument("--title", help="Card title")
    parser.add_argument("--description", help="Card description")
    parser.add_argument("--column", help="Column ID")
    parser.add_argument("--priority", help="Priority")
    parser.add_argument("--assignee", help="Assignee")
    parser.add_argument("--due", help="Due date")
    parser.add_argument("--output", help="Output file")

    args = parser.parse_args()
    board = KanbanBoard(args.board)

    if args.action == "create":
        board.create_card(
            args.title,
            args.description,
            column_id=args.column or "backlog",
            priority=Priority(args.priority) if args.priority else Priority.MEDIUM,
            assignee=args.assignee
        )

    elif args.action == "move":
        if not args.id or not args.column:
            print("Error: --id and --column required for move")
            return 1
        board.move_card(args.id, args.column)

    elif args.action == "update":
        if not args.id:
            print("Error: --id required for update")
            return 1
        board.update_card(
            args.id,
            title=args.title,
            description=args.description,
            priority=Priority(args.priority) if args.priority else None,
            assignee=args.assignee
        )

    elif args.action == "delete":
        if not args.id:
            print("Error: --id required for delete")
            return 1
        board.delete_card(args.id)

    elif args.action == "list":
        for column_id, column in board.columns.items():
            print(f"\n{column['name']} ({len(column['card_ids'])} cards):")
            cards = board.get_column_cards(column_id)
            for card in cards:
                print(f"  - {card['id']}: {card['title']}")

    elif args.action == "analytics":
        analytics = board.get_board_analytics()
        print(json.dumps(analytics, indent=2))

    elif args.action == "export":
        output = Path(args.output) if args.output else None
        board.export_to_markdown(output)

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(cli_main())
