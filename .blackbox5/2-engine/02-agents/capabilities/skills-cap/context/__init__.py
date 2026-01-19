"""
Blackbox3 Context Management Module

Provides advanced context tracking, snapshot management, and context
restoration for AI-assisted development sessions.
"""

__version__ = "1.0.0"
__author__ = "Blackbox3"

from .manager import ContextManager
from .snapshot import SnapshotManager
from .storage import ContextStorage

__all__ = [
    "ContextManager",
    "SnapshotManager",
    "ContextStorage",
]
