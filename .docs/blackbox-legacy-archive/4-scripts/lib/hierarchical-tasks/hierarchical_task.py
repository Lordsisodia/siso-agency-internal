"""
Hierarchical Task System for Blackbox4
Adapted from CrewAI
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid


class HierarchicalTask:
    """
    Blackbox4 hierarchical task with parent-child relationships.

    Attributes:
        id: Unique task identifier
        description: Task description
        expected_output: Expected outcome
        parent_task: Parent task (for hierarchy)
        context: List of tasks this depends on
        completed: Completion status
        children: List of child tasks
        metadata: Additional task information
    """

    def __init__(
        self,
        description: str,
        expected_output: str = "",
        parent_task: Optional['HierarchicalTask'] = None,
        context: Optional[List['HierarchicalTask']] = None,
        completed: bool = False,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.id = str(uuid.uuid4())
        self.description = description
        self.expected_output = expected_output
        self.parent_task = parent_task
        self.context = context or []
        self.completed = completed
        self.children = []
        self.metadata = metadata or {}
        self.created_at = datetime.now()

        # Add to parent's children if parent exists
        if parent_task:
            parent_task.add_child(self)

    def add_child(self, child: 'HierarchicalTask'):
        """Add a child task."""
        self.children.append(child)
        child.parent_task = self

    def get_depth(self) -> int:
        """Calculate nesting depth."""
        depth = 0
        task = self.parent_task
        while task:
            depth += 1
            task = task.parent_task
        return depth

    def get_dependency_chain(self) -> List['HierarchicalTask']:
        """Get ordered list of tasks to execute before this one."""
        chain = []
        task = self.parent_task
        while task:
            chain.insert(0, task)
            if task.parent_task:
                task = task.parent_task
            else:
                break
        chain.append(self)
        return chain

    def to_checklist_item(self) -> str:
        """Convert to checklist.md format."""
        status = "x" if self.completed else " "
        indent = "  " * self.get_depth()
        return f"{indent}- [{status}] {self.description}"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'id': self.id,
            'description': self.description,
            'expected_output': self.expected_output,
            'completed': self.completed,
            'depth': self.get_depth(),
            'parent_id': self.parent_task.id if self.parent_task else None,
            'children': [child.id for child in self.children],
            'metadata': self.metadata
        }
