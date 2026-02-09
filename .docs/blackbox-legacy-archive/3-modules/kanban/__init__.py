"""
Blackbox3 Kanban Module

Provides task management, Kanban board workflow, and
sprint planning capabilities.
"""

__version__ = "1.0.0"
__author__ = "Blackbox3"

from .board import KanbanBoard
from .task import TaskManager
from .sprint import SprintManager
from .workflow import WorkflowEngine

__all__ = [
    "KanbanBoard",
    "TaskManager",
    "SprintManager",
    "WorkflowEngine",
]
