"""
SISO-Internal Autonomous System - Library Package

Core utilities for task management, storage, logging, and context management.
"""

from .task_utils import (
    Task,
    TaskStatus,
    TaskPriority,
    TaskManager,
    get_task_manager,
)

from .storage_backends import (
    StorageBackend,
    FileSystemBackend,
    MemoryBackend,
    HybridBackend,
    StorageManager,
    get_storage_manager,
)

from .event_logging import (
    Event,
    EventType,
    EventSeverity,
    EventLogger,
    TelemetryCollector,
    get_event_logger,
)

from .context_management import (
    ContextBudget,
    ContextThreshold,
    ContextAction,
    ContextManager,
    TokenEstimator,
    ContextCompressor,
    get_context_manager,
)

__version__ = "1.0.0"
__all__ = [
    # Task utilities
    "Task",
    "TaskStatus",
    "TaskPriority",
    "TaskManager",
    "get_task_manager",
    # Storage backends
    "StorageBackend",
    "FileSystemBackend",
    "MemoryBackend",
    "HybridBackend",
    "StorageManager",
    "get_storage_manager",
    # Event logging
    "Event",
    "EventType",
    "EventSeverity",
    "EventLogger",
    "TelemetryCollector",
    "get_event_logger",
    # Context management
    "ContextBudget",
    "ContextThreshold",
    "ContextAction",
    "ContextManager",
    "TokenEstimator",
    "ContextCompressor",
    "get_context_manager",
]
