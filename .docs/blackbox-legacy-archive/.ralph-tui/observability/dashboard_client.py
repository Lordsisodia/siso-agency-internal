#!/usr/bin/env python3
"""
Dashboard Client for Blackbox4 Observability

Provides WebSocket integration for real-time dashboard updates.
Optional dependency - gracefully degrades if socketio not available.

Events:
- session_start: New session started
- iteration_start: Iteration execution started
- iteration_complete: Iteration execution completed
- iteration_failed: Iteration execution failed
- session_update: Session progress update
- session_end: Session completed
"""

import json
from typing import Optional, Dict, Any, Callable
from dataclasses import dataclass, asdict
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class DashboardEvent:
    """
    Dashboard event data structure.

    Attributes:
        event_type: Type of event
        timestamp: Event timestamp
        session_id: Session identifier
        data: Event-specific data
    """
    event_type: str
    timestamp: str
    session_id: str
    data: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)

    def to_json(self) -> str:
        """Convert to JSON string."""
        return json.dumps(self.to_dict())


class DashboardClient:
    """
    WebSocket client for real-time dashboard updates.

    Features:
    - Real-time event streaming to dashboard
    - Automatic reconnection
    - Graceful degradation if unavailable
    - Event buffering when disconnected
    """

    def __init__(self, ws_url: str = "ws://localhost:8000", auto_connect: bool = True):
        """
        Initialize dashboard client.

        Args:
            ws_url: WebSocket server URL
            auto_connect: Whether to automatically connect
        """
        self.ws_url = ws_url
        self.auto_connect = auto_connect
        self.connected = False
        self.event_buffer: list = []

        # Try to import socketio
        try:
            import socketio
            self.socket = socketio.Client()
            self._setup_handlers()
            self._socketio_available = True

            if auto_connect:
                self.connect()
        except ImportError:
            logger.warning("python-socketio not available, dashboard integration disabled")
            self.socket = None
            self._socketio_available = False

    def _setup_handlers(self):
        """Setup socket event handlers."""
        if not self._socketio_available or not self.socket:
            return

        @self.socket.event
        def connect():
            logger.info(f"Connected to dashboard at {self.ws_url}")
            self.connected = True
            self._flush_buffer()

        @self.socket.event
        def disconnect():
            logger.info("Disconnected from dashboard")
            self.connected = False

        @self.socket.event
        def connect_error(error):
            logger.error(f"Dashboard connection error: {error}")
            self.connected = False

    def connect(self) -> bool:
        """
        Connect to dashboard server.

        Returns:
            True if connected successfully
        """
        if not self._socketio_available:
            logger.debug("SocketIO not available, skipping connection")
            return False

        try:
            self.socket.connect(self.ws_url)
            return True
        except Exception as e:
            logger.error(f"Failed to connect to dashboard: {e}")
            self.connected = False
            return False

    def disconnect(self):
        """Disconnect from dashboard server."""
        if self._socketio_available and self.socket and self.connected:
            self.socket.disconnect()
            self.connected = False

    def _emit(self, event_type: str, data: Dict[str, Any]):
        """
        Emit event to dashboard.

        Args:
            event_type: Type of event
            data: Event data
        """
        if not self._socketio_available or not self.socket:
            # Buffer event for later
            self._buffer_event(event_type, data)
            return

        if not self.connected:
            self._buffer_event(event_type, data)
            return

        try:
            self.socket.emit(event_type, data)
            logger.debug(f"Emitted event: {event_type}")
        except Exception as e:
            logger.error(f"Failed to emit event {event_type}: {e}")
            self._buffer_event(event_type, data)

    def _buffer_event(self, event_type: str, data: Dict[str, Any]):
        """
        Buffer event when disconnected.

        Args:
            event_type: Type of event
            data: Event data
        """
        event = {
            "event_type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }
        self.event_buffer.append(event)

        # Keep buffer size manageable
        if len(self.event_buffer) > 1000:
            self.event_buffer = self.event_buffer[-1000:]

    def _flush_buffer(self):
        """Flush buffered events when reconnected."""
        if not self.event_buffer:
            return

        logger.info(f"Flushing {len(self.event_buffer)} buffered events")

        for event in self.event_buffer:
            try:
                self.socket.emit(event["event_type"], event["data"])
            except Exception as e:
                logger.error(f"Failed to emit buffered event: {e}")

        self.event_buffer.clear()

    def emit_session_start(self, session_id: str, prd: Dict[str, Any]):
        """
        Emit session start event.

        Args:
            session_id: Session identifier
            prd: PRD dictionary
        """
        event_data = {
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "goal": prd.get("goal", ""),
            "sub_goals": prd.get("sub_goals", []),
            "tasks": prd.get("tasks", [])
        }

        self._emit("session_start", event_data)

    def emit_iteration_start(self, iteration: int, task: Dict[str, Any]):
        """
        Emit iteration start event.

        Args:
            iteration: Iteration number
            task: Task dictionary
        """
        event_data = {
            "session_id": task.get("session_id", ""),
            "iteration": iteration,
            "task_id": task.get("id", ""),
            "task_description": task.get("description", ""),
            "timestamp": datetime.utcnow().isoformat()
        }

        self._emit("iteration_start", event_data)

    def emit_iteration_complete(self, iteration: int, task: Dict[str, Any], result):
        """
        Emit iteration complete event.

        Args:
            iteration: Iteration number
            task: Task dictionary
            result: ExecutionResult object
        """
        # Handle ExecutionResult
        if hasattr(result, "success"):
            result_data = {
                "success": result.success,
                "status": result.status,
                "duration_ms": result.duration_ms,
                "tokens_used": result.tokens_used,
                "cost_usd": result.cost_usd,
                "output": result.output[:1000] if result.output else "",  # Truncate long outputs
                "error": result.error
            }
        else:
            result_data = result

        event_data = {
            "session_id": task.get("session_id", ""),
            "iteration": iteration,
            "task_id": task.get("id", ""),
            "timestamp": datetime.utcnow().isoformat(),
            "result": result_data
        }

        if result_data.get("success"):
            self._emit("iteration_complete", event_data)
        else:
            self._emit("iteration_failed", event_data)

    def emit_session_update(self, session_id: str, status: str, progress: float):
        """
        Emit session progress update.

        Args:
            session_id: Session identifier
            status: Status string (running, paused, completed)
            progress: Progress percentage (0-100)
        """
        event_data = {
            "session_id": session_id,
            "status": status,
            "progress": progress,
            "timestamp": datetime.utcnow().isoformat()
        }

        self._emit("session_update", event_data)

    def emit_session_end(self, summary):
        """
        Emit session end event.

        Args:
            summary: SessionSummary object
        """
        # Handle SessionSummary
        if hasattr(summary, "to_dict"):
            summary_data = summary.to_dict()
        else:
            summary_data = summary

        event_data = {
            "session_id": summary_data.get("session_id", ""),
            "timestamp": datetime.utcnow().isoformat(),
            "duration_seconds": summary_data.get("duration_seconds", 0),
            "total_iterations": summary_data.get("total_iterations", 0),
            "total_tokens": summary_data.get("total_tokens", 0),
            "total_cost": summary_data.get("total_cost", 0.0),
            "success_rate": summary_data.get("success_rate", 0.0),
            "goal_achieved": summary_data.get("goal_achieved", False),
            "final_goal_progress": summary_data.get("final_goal_progress", 0.0)
        }

        self._emit("session_end", event_data)

    def emit_log(self, session_id: str, level: str, message: str, metadata: Dict[str, Any] = None):
        """
        Emit log event.

        Args:
            session_id: Session identifier
            level: Log level (info, warning, error)
            message: Log message
            metadata: Optional metadata
        """
        event_data = {
            "session_id": session_id,
            "level": level,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }

        self._emit("log", event_data)

    def emit_metric(self, session_id: str, metric_name: str, value: float, metadata: Dict[str, Any] = None):
        """
        Emit metric event.

        Args:
            session_id: Session identifier
            metric_name: Metric name
            value: Metric value
            metadata: Optional metadata
        """
        event_data = {
            "session_id": session_id,
            "metric_name": metric_name,
            "value": value,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }

        self._emit("metric", event_data)

    def register_callback(self, event_type: str, callback: Callable):
        """
        Register callback for dashboard events.

        Args:
            event_type: Type of event to listen for
            callback: Callback function
        """
        if not self._socketio_available or not self.socket:
            logger.warning("Cannot register callback: SocketIO not available")
            return

        @self.socket.on(event_type)
        def handle_event(*args, **kwargs):
            try:
                callback(*args, **kwargs)
            except Exception as e:
                logger.error(f"Error in callback for {event_type}: {e}")

    def is_available(self) -> bool:
        """
        Check if dashboard integration is available.

        Returns:
            True if SocketIO is available
        """
        return self._socketio_available

    def is_connected(self) -> bool:
        """
        Check if connected to dashboard.

        Returns:
            True if connected
        """
        return self.connected and self._socketio_available
