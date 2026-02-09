#!/usr/bin/env python3
"""
Blackbox4 Observability Layer

Provides comprehensive logging, manifest management, goal tracking,
and dashboard integration for the Native TUI system.

Components:
- TUILogger: Session and iteration logging
- DashboardClient: WebSocket integration for real-time updates
- ExecutionResult: Result data structures
- SessionSummary: Session completion data
"""

from .tui_logger import (
    TUILogger,
    SessionSummary,
    ArtifactManager
)

from .dashboard_client import (
    DashboardClient,
    DashboardEvent
)

__all__ = [
    "TUILogger",
    "SessionSummary",
    "ArtifactManager",
    "DashboardClient",
    "DashboardEvent"
]
