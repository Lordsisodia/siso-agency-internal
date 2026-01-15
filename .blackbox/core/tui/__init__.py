"""
Blackbox4 TUI (Terminal User Interface) Module

Provides a native terminal-based UI for Blackbox4 operations with:
- Split-panel layout (task list + execution log)
- Real-time progress tracking
- Keyboard navigation
- Color-coded status indicators
- Session management
"""

from .blackbox_tui import BlackboxTUI
from .panels import TaskListPanel, ExecutionLogPanel, SessionHeaderPanel, ControlsFooterPanel
from .controls import KeyboardController, ControlScheme
from .models import Task, LogEntry, TaskStatus, LogLevel, Priority, SessionInfo

__all__ = [
    'BlackboxTUI',
    'TaskListPanel',
    'ExecutionLogPanel',
    'SessionHeaderPanel',
    'ControlsFooterPanel',
    'KeyboardController',
    'ControlScheme',
    'Task',
    'LogEntry',
    'TaskStatus',
    'LogLevel',
    'Priority',
    'SessionInfo',
]

__version__ = '1.0.0'
__author__ = 'Blackbox4 Team'
