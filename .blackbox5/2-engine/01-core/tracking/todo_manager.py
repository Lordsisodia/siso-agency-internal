"""
Todo Management System - Quick Idea Capture
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import json
import logging
import uuid

logger = logging.getLogger(__name__)


class Priority(str, Enum):
    """Todo priority levels"""
    URGENT = "urgent"
    NORMAL = "normal"
    LOW = "low"


class TodoStatus(str, Enum):
    """Todo status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


@dataclass
class Todo:
    """A todo item"""
    id: str
    description: str
    priority: Priority
    status: TodoStatus
    tags: List[str]
    created_at: datetime
    completed_at: Optional[datetime] = None
    notes: str = ""
    estimated_effort: Optional[str] = None  # e.g., "2h", "1d"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'description': self.description,
            'priority': self.priority.value,
            'status': self.status.value,
            'tags': self.tags,
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'notes': self.notes,
            'estimated_effort': self.estimated_effort
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Todo':
        """Create from dictionary"""
        return cls(
            id=data['id'],
            description=data['description'],
            priority=Priority(data['priority']),
            status=TodoStatus(data['status']),
            tags=data.get('tags', []),
            created_at=datetime.fromisoformat(data['created_at']),
            completed_at=datetime.fromisoformat(data['completed_at']) if data.get('completed_at') else None,
            notes=data.get('notes', ''),
            estimated_effort=data.get('estimated_effort')
        )


class TodoManager:
    """
    Manages todos with quick capture and organization.

    Features:
    - Quick add: /todo "Fix auth bug"
    - Tag-based organization
    - Priority levels
    - Persistent storage
    """

    def __init__(self, storage_path: Optional[Path] = None):
        """
        Initialize todo manager.

        Args:
            storage_path: Path to JSON file (default: ~/.blackbox5/todos.json)
        """
        if storage_path is None:
            storage_path = Path.home() / ".blackbox5" / "todos.json"

        self.storage_path = storage_path
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)

        self.todos: Dict[str, Todo] = {}
        self._load()

    def _load(self) -> None:
        """Load todos from storage"""
        if self.storage_path.exists():
            try:
                with open(self.storage_path, 'r') as f:
                    data = json.load(f)

                for todo_data in data.get('todos', []):
                    todo = Todo.from_dict(todo_data)
                    self.todos[todo.id] = todo

                logger.info(f"Loaded {len(self.todos)} todos")
            except Exception as e:
                logger.error(f"Failed to load todos: {e}")

    def _save(self) -> None:
        """Save todos to storage"""
        try:
            data = {
                'todos': [todo.to_dict() for todo in self.todos.values()],
                'updated_at': datetime.now().isoformat()
            }

            # Atomic write
            temp_path = self.storage_path.with_suffix('.tmp')
            with open(temp_path, 'w') as f:
                json.dump(data, f, indent=2)

            temp_path.rename(self.storage_path)
            logger.debug(f"Saved {len(self.todos)} todos")

        except Exception as e:
            logger.error(f"Failed to save todos: {e}")

    def quick_add(
        self,
        description: str,
        priority: str = "normal",
        tags: Optional[List[str]] = None
    ) -> str:
        """
        Quick add a todo with minimal friction.

        Usage: /todo "Fix authentication bug"

        Args:
            description: Todo description
            priority: Priority level (urgent, normal, low)
            tags: Optional tags

        Returns:
            Todo ID
        """
        todo = Todo(
            id=str(uuid.uuid4())[:8],
            description=description,
            priority=Priority(priority),
            status=TodoStatus.PENDING,
            tags=tags or [],
            created_at=datetime.now()
        )

        self.todos[todo.id] = todo
        self._save()

        logger.info(f"Added todo: {description}")
        return todo.id

    def complete(self, todo_id: str) -> bool:
        """
        Mark todo as complete.

        Args:
            todo_id: Todo to complete

        Returns:
            True if found and completed
        """
        if todo_id in self.todos:
            self.todos[todo_id].status = TodoStatus.COMPLETED
            self.todos[todo_id].completed_at = datetime.now()
            self._save()
            return True
        return False

    def update(
        self,
        todo_id: str,
        description: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        tags: Optional[List[str]] = None,
        notes: Optional[str] = None
    ) -> bool:
        """Update todo fields"""
        if todo_id not in self.todos:
            return False

        todo = self.todos[todo_id]

        if description is not None:
            todo.description = description
        if priority is not None:
            todo.priority = Priority(priority)
        if status is not None:
            todo.status = TodoStatus(status)
        if tags is not None:
            todo.tags = tags
        if notes is not None:
            todo.notes = notes

        self._save()
        return True

    def delete(self, todo_id: str) -> bool:
        """Delete a todo"""
        if todo_id in self.todos:
            del self.todos[todo_id]
            self._save()
            return True
        return False

    def list(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        tags: Optional[List[str]] = None,
        limit: Optional[int] = None
    ) -> List[Todo]:
        """
        List todos with optional filtering.

        Args:
            status: Filter by status
            priority: Filter by priority
            tags: Filter by tags (must match all)
            limit: Max results to return

        Returns:
            List of matching todos
        """
        results = list(self.todos.values())

        # Apply filters
        if status:
            results = [t for t in results if t.status.value == status]
        if priority:
            results = [t for t in results if t.priority.value == priority]
        if tags:
            results = [t for t in results if all(tag in t.tags for tag in tags)]

        # Sort by priority (urgent first) then created_at
        priority_order = {'urgent': 0, 'normal': 1, 'low': 2}
        results.sort(key=lambda t: (priority_order.get(t.priority.value, 99), t.created_at))

        if limit:
            results = results[:limit]

        return results

    def get(self, todo_id: str) -> Optional[Todo]:
        """Get a specific todo"""
        return self.todos.get(todo_id)

    def search(self, query: str) -> List[Todo]:
        """Search todos by description or notes"""
        query_lower = query.lower()
        return [
            todo for todo in self.todos.values()
            if (query_lower in todo.description.lower() or
                query_lower in todo.notes.lower() or
                any(query_lower in tag.lower() for tag in todo.tags))
        ]

    def add_note(self, todo_id: str, note: str) -> bool:
        """Add a note to a todo"""
        if todo_id in self.todos:
            if self.todos[todo_id].notes:
                self.todos[todo_id].notes += f"\n\n{note}"
            else:
                self.todos[todo_id].notes = note
            self._save()
            return True
        return False

    def get_statistics(self) -> Dict[str, Any]:
        """Get todo statistics"""
        total = len(self.todos)
        by_status = {}
        by_priority = {}

        for todo in self.todos.values():
            # Count by status
            status = todo.status.value
            by_status[status] = by_status.get(status, 0) + 1

            # Count by priority
            priority = todo.priority.value
            by_priority[priority] = by_priority.get(priority, 0) + 1

        return {
            'total': total,
            'by_status': by_status,
            'by_priority': by_priority,
            'completed_ratio': by_status.get('completed', 0) / total if total > 0 else 0
        }
