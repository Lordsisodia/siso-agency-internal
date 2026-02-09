#!/usr/bin/env python3
"""
Event Logging for SISO-Internal Autonomous System

Provides structured logging for:
- Execution events
- Agent communications
- System events
- Telemetry data

Adapted from BlackBox5 RALF-Core telemetry system.
"""

import json
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, field, asdict
import threading


class EventType(Enum):
    """Types of events that can be logged."""
    EXECUTION_START = "execution_start"
    EXECUTION_END = "execution_end"
    EXECUTION_ERROR = "execution_error"
    AGENT_START = "agent_start"
    AGENT_END = "agent_end"
    AGENT_MESSAGE = "agent_message"
    TASK_START = "task_start"
    TASK_END = "task_end"
    TASK_BLOCKED = "task_blocked"
    DECISION = "decision"
    PHASE_CHANGE = "phase_change"
    SYSTEM = "system"
    METRIC = "metric"


class EventSeverity(Enum):
    """Severity levels for events."""
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class Event:
    """Represents a single event."""
    type: EventType
    timestamp: datetime = field(default_factory=datetime.now)
    severity: EventSeverity = EventSeverity.INFO
    message: str = ""
    source: str = ""  # Component that generated the event
    run_id: Optional[str] = None
    task_id: Optional[str] = None
    agent_id: Optional[str] = None
    data: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "type": self.type.value,
            "timestamp": self.timestamp.isoformat(),
            "severity": self.severity.value,
            "message": self.message,
            "source": self.source,
            "run_id": self.run_id,
            "task_id": self.task_id,
            "agent_id": self.agent_id,
            "data": self.data,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Event":
        """Create from dictionary."""
        return cls(
            type=EventType(data["type"]),
            timestamp=datetime.fromisoformat(data["timestamp"]),
            severity=EventSeverity(data.get("severity", "info")),
            message=data.get("message", ""),
            source=data.get("source", ""),
            run_id=data.get("run_id"),
            task_id=data.get("task_id"),
            agent_id=data.get("agent_id"),
            data=data.get("data", {}),
            metadata=data.get("metadata", {}),
        )


class EventLogger:
    """Main event logging system."""

    def __init__(self, autonomous_root: Optional[Path] = None):
        """Initialize event logger."""
        if autonomous_root is None:
            autonomous_root = Path(__file__).parent.parent

        self.autonomous_root = Path(autonomous_root)
        self.logs_dir = self.autonomous_root / "logs"
        self.execution_logs_dir = self.logs_dir / "execution_logs"
        self.agent_logs_dir = self.logs_dir / "agent_communications"
        self.event_logs_dir = self.logs_dir / "event_logs"

        # Ensure directories exist
        self.execution_logs_dir.mkdir(parents=True, exist_ok=True)
        self.agent_logs_dir.mkdir(parents=True, exist_ok=True)
        self.event_logs_dir.mkdir(parents=True, exist_ok=True)

        # Current run tracking
        self._current_run_id: Optional[str] = None
        self._current_log_file: Optional[Path] = None
        self._lock = threading.Lock()

        # Event handlers (for real-time processing)
        self._handlers: List[Callable[[Event], None]] = []

    def start_run(self, run_id: Optional[str] = None) -> str:
        """Start a new logging run.

        Args:
            run_id: Optional run identifier, auto-generated if not provided

        Returns:
            The run ID
        """
        if run_id is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            run_id = f"run-{timestamp}"

        with self._lock:
            self._current_run_id = run_id
            self._current_log_file = self.execution_logs_dir / f"{run_id}.jsonl"

        # Log run start
        self.log(Event(
            type=EventType.EXECUTION_START,
            run_id=run_id,
            message=f"Started run {run_id}",
            source="event_logger",
        ))

        return run_id

    def end_run(self, status: str = "completed"):
        """End the current logging run."""
        if self._current_run_id:
            self.log(Event(
                type=EventType.EXECUTION_END,
                run_id=self._current_run_id,
                message=f"Ended run {self._current_run_id} with status: {status}",
                source="event_logger",
                data={"status": status},
            ))

            with self._lock:
                self._current_run_id = None
                self._current_log_file = None

    def log(self, event: Event):
        """Log an event."""
        # Set run_id if not provided
        if event.run_id is None and self._current_run_id:
            event.run_id = self._current_run_id

        # Write to log file
        with self._lock:
            if self._current_log_file:
                with open(self._current_log_file, "a") as f:
                    f.write(json.dumps(event.to_dict()) + "\n")

        # Call registered handlers
        for handler in self._handlers:
            try:
                handler(event)
            except Exception as e:
                print(f"Error in event handler: {e}")

    def add_handler(self, handler: Callable[[Event], None]):
        """Add an event handler for real-time processing."""
        self._handlers.append(handler)

    def remove_handler(self, handler: Callable[[Event], None]):
        """Remove an event handler."""
        if handler in self._handlers:
            self._handlers.remove(handler)

    # Convenience methods for common event types

    def log_execution(self, message: str, severity: EventSeverity = EventSeverity.INFO, **data):
        """Log an execution event."""
        self.log(Event(
            type=EventType.EXECUTION_START,
            severity=severity,
            message=message,
            source="execution",
            data=data,
        ))

    def log_agent_start(self, agent_id: str, task_id: Optional[str] = None, **data):
        """Log agent start."""
        self.log(Event(
            type=EventType.AGENT_START,
            message=f"Agent {agent_id} started",
            source="agent_manager",
            agent_id=agent_id,
            task_id=task_id,
            data=data,
        ))

    def log_agent_end(self, agent_id: str, task_id: Optional[str] = None, result: str = "", **data):
        """Log agent end."""
        self.log(Event(
            type=EventType.AGENT_END,
            message=f"Agent {agent_id} ended: {result}",
            source="agent_manager",
            agent_id=agent_id,
            task_id=task_id,
            data={"result": result, **data},
        ))

    def log_agent_message(self, from_agent: str, to_agent: str, message: str, **data):
        """Log inter-agent communication."""
        # Also write to agent communications log
        comm_entry = {
            "timestamp": datetime.now().isoformat(),
            "from": from_agent,
            "to": to_agent,
            "message": message,
            "run_id": self._current_run_id,
            **data,
        }

        comm_file = self.agent_logs_dir / f"{self._current_run_id or 'unknown'}.jsonl"
        with open(comm_file, "a") as f:
            f.write(json.dumps(comm_entry) + "\n")

        # Also log as event
        self.log(Event(
            type=EventType.AGENT_MESSAGE,
            message=f"Message from {from_agent} to {to_agent}",
            source="agent_communication",
            agent_id=from_agent,
            data={"to_agent": to_agent, "message": message, **data},
        ))

    def log_task_start(self, task_id: str, **data):
        """Log task start."""
        self.log(Event(
            type=EventType.TASK_START,
            message=f"Task {task_id} started",
            source="task_manager",
            task_id=task_id,
            data=data,
        ))

    def log_task_end(self, task_id: str, status: str = "completed", **data):
        """Log task end."""
        self.log(Event(
            type=EventType.TASK_END,
            message=f"Task {task_id} ended with status: {status}",
            source="task_manager",
            task_id=task_id,
            data={"status": status, **data},
        ))

    def log_decision(self, decision: str, context: str = "", **data):
        """Log a decision."""
        self.log(Event(
            type=EventType.DECISION,
            message=decision,
            source="decision_engine",
            data={"context": context, **data},
        ))

    def log_phase_change(self, from_phase: str, to_phase: str, **data):
        """Log phase transition."""
        self.log(Event(
            type=EventType.PHASE_CHANGE,
            message=f"Phase change: {from_phase} -> {to_phase}",
            source="phase_manager",
            data={"from": from_phase, "to": to_phase, **data},
        ))

    def get_run_events(self, run_id: str) -> List[Event]:
        """Get all events for a specific run."""
        log_file = self.execution_logs_dir / f"{run_id}.jsonl"

        if not log_file.exists():
            return []

        events = []
        with open(log_file) as f:
            for line in f:
                try:
                    data = json.loads(line.strip())
                    events.append(Event.from_dict(data))
                except (json.JSONDecodeError, KeyError):
                    continue

        return events

    def get_agent_communications(self, run_id: str) -> List[Dict[str, Any]]:
        """Get agent communications for a specific run."""
        comm_file = self.agent_logs_dir / f"{run_id}.jsonl"

        if not comm_file.exists():
            return []

        communications = []
        with open(comm_file) as f:
            for line in f:
                try:
                    data = json.loads(line.strip())
                    communications.append(data)
                except json.JSONDecodeError:
                    continue

        return communications


class TelemetryCollector:
    """Collects and aggregates telemetry data."""

    def __init__(self, event_logger: EventLogger):
        """Initialize telemetry collector."""
        self.event_logger = event_logger
        self._metrics: Dict[str, List[float]] = {}
        self._counters: Dict[str, int] = {}
        self._start_times: Dict[str, datetime] = {}

    def start_timer(self, name: str):
        """Start a timer for a metric."""
        self._start_times[name] = datetime.now()

    def end_timer(self, name: str) -> float:
        """End a timer and record the duration."""
        if name not in self._start_times:
            return 0.0

        duration = (datetime.now() - self._start_times[name]).total_seconds()

        if name not in self._metrics:
            self._metrics[name] = []
        self._metrics[name].append(duration)

        # Log as event
        self.event_logger.log(Event(
            type=EventType.METRIC,
            message=f"Timer {name}: {duration:.3f}s",
            source="telemetry",
            data={"metric": name, "value": duration, "type": "timer"},
        ))

        return duration

    def increment_counter(self, name: str, value: int = 1):
        """Increment a counter."""
        self._counters[name] = self._counters.get(name, 0) + value

        self.event_logger.log(Event(
            type=EventType.METRIC,
            message=f"Counter {name}: {self._counters[name]}",
            source="telemetry",
            data={"metric": name, "value": self._counters[name], "type": "counter"},
        ))

    def record_gauge(self, name: str, value: float):
        """Record a gauge value."""
        if name not in self._metrics:
            self._metrics[name] = []
        self._metrics[name].append(value)

        self.event_logger.log(Event(
            type=EventType.METRIC,
            message=f"Gauge {name}: {value}",
            source="telemetry",
            data={"metric": name, "value": value, "type": "gauge"},
        ))

    def get_summary(self) -> Dict[str, Any]:
        """Get summary of all metrics."""
        summary = {
            "counters": self._counters.copy(),
            "metrics": {},
        }

        for name, values in self._metrics.items():
            if values:
                summary["metrics"][name] = {
                    "count": len(values),
                    "min": min(values),
                    "max": max(values),
                    "avg": sum(values) / len(values),
                    "last": values[-1],
                }

        return summary


def get_event_logger(autonomous_root: Optional[Path] = None) -> EventLogger:
    """Get the default event logger instance."""
    return EventLogger(autonomous_root)


if __name__ == "__main__":
    # Simple CLI for testing
    import sys
    import tempfile

    if len(sys.argv) < 2:
        print("Usage: python event_logging.py [test|show <run_id>]")
        sys.exit(1)

    if sys.argv[1] == "test":
        with tempfile.TemporaryDirectory() as tmpdir:
            print("Testing event logging...")

            logger = EventLogger(Path(tmpdir) / ".autonomous")

            # Start a run
            run_id = logger.start_run()
            print(f"✓ Started run: {run_id}")

            # Log some events
            logger.log_execution("Test execution started")
            logger.log_task_start("TASK-001")
            logger.log_agent_start("agent-1", "TASK-001")
            logger.log_decision("Used approach A", "Testing decision logging")
            logger.log_phase_change("setup", "execution")
            logger.log_agent_end("agent-1", "TASK-001", "success")
            logger.log_task_end("TASK-001", "completed")

            # End run
            logger.end_run("completed")
            print("✓ Logged events")

            # Retrieve events
            events = logger.get_run_events(run_id)
            print(f"✓ Retrieved {len(events)} events")

            # Test telemetry
            telemetry = TelemetryCollector(logger)
            telemetry.start_timer("test_operation")
            import time
            time.sleep(0.1)
            duration = telemetry.end_timer("test_operation")
            print(f"✓ Recorded timer: {duration:.3f}s")

            telemetry.increment_counter("operations", 5)
            print(f"✓ Counter value: {telemetry._counters['operations']}")

            summary = telemetry.get_summary()
            print(f"✓ Telemetry summary: {json.dumps(summary, indent=2)}")

            print("\nAll tests passed!")

    elif sys.argv[1] == "show" and len(sys.argv) > 2:
        run_id = sys.argv[2]
        logger = get_event_logger()
        events = logger.get_run_events(run_id)

        print(f"\nEvents for run {run_id}:")
        print("-" * 60)
        for event in events:
            print(f"[{event.timestamp.strftime('%H:%M:%S')}] {event.type.value}: {event.message}")
