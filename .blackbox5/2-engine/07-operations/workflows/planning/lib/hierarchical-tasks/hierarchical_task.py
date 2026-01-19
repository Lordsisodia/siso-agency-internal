#!/usr/bin/env python3
"""
Hierarchical Task Module
Represents tasks with parent-child relationships
"""

import uuid
from typing import List, Dict, Optional, Any
from datetime import datetime


class HierarchicalTask:
    """A task that can have parent and child tasks."""

    def __init__(
        self,
        description: str,
        expected_output: str = "",
        completed: bool = False,
        parent_task: Optional['HierarchicalTask'] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.id = str(uuid.uuid4())[:8]
        self.description = description
        self.expected_output = expected_output
        self.completed = completed
        self.parent_task = parent_task
        self.children: List['HierarchicalTask'] = []
        self.context: List['HierarchicalTask'] = []  # Dependencies
        self.metadata = metadata or {}
        self.created_at = datetime.now().isoformat()
        self.completed_at = None

    def add_child(self, child: 'HierarchicalTask'):
        """Add a child task."""
        if child not in self.children:
            self.children.append(child)

    def add_dependency(self, task: 'HierarchicalTask']):
        """Add a dependency (context task)."""
        if task not in self.context:
            self.context.append(task)

    def get_depth(self) -> int:
        """Get the depth of this task in the hierarchy."""
        depth = 0
        current = self.parent_task
        while current:
            depth += 1
            current = current.parent_task
        return depth

    def get_all_descendants(self) -> List['HierarchicalTask']:
        """Get all descendant tasks."""
        descendants = []
        for child in self.children:
            descendants.append(child)
            descendants.extend(child.get_all_descendants())
        return descendants

    def to_dict(self) -> Dict[str, Any]:
        """Convert task to dictionary."""
        return {
            'id': self.id,
            'description': self.description,
            'expected_output': self.expected_output,
            'completed': self.completed,
            'parent_id': self.parent_task.id if self.parent_task else None,
            'children_ids': [c.id for c in self.children],
            'context_ids': [c.id for c in self.context],
            'metadata': self.metadata,
            'created_at': self.created_at,
            'completed_at': self.completed_at
        }

    def to_checklist_item(self, level: int = 0) -> str:
        """Format task as checklist item."""
        indent = "  " * level
        status = "x" if self.completed else " "
        return f"{indent}- [{status}] {self.description} (ID: {self.id})"

    def __repr__(self) -> str:
        return f"HierarchicalTask(id={self.id}, description='{self.description}', completed={self.completed})"


def create_task_tree(description: str) -> HierarchicalTask:
    """Create a root task for a new tree."""
    return HierarchicalTask(description=description)
