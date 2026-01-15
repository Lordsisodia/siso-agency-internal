"""
Blackbox4 Intelligence Layer
Smart task selection, routing, and dependency resolution for autonomous agent loops
"""

from .task_router import TaskRouter
from .dependency_resolver import DependencyResolver
from .context_aware import ContextAwareRouter, ExecutionContext
from .models import Task, TaskPriority, TaskComplexity

__all__ = [
    'TaskRouter',
    'DependencyResolver',
    'ContextAwareRouter',
    'ExecutionContext',
    'Task',
    'TaskPriority',
    'TaskComplexity',
]
