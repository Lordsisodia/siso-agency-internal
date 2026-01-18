#!/usr/bin/env python3
"""
Progress Tracker - Execution Progress Monitoring

The ProgressTracker class monitors and reports on execution progress
with milestone tracking and session management.
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


class SessionStatus(Enum):
    """Session execution status"""
    INITIALIZING = "initializing"
    IN_PROGRESS = "in_progress"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class MilestoneStatus(Enum):
    """Milestone completion status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"
    FAILED = "failed"


@dataclass
class ProgressMilestone:
    """A milestone in the execution progress"""
    id: str
    name: str
    description: str
    status: MilestoneStatus = MilestoneStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "metadata": self.metadata
        }


@dataclass
class TaskProgress:
    """Progress for a single task"""
    task_id: str
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration: Optional[float] = None
    output: Optional[str] = None
    error: Optional[str] = None
    retry_count: int = 0

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "task_id": self.task_id,
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "duration": self.duration,
            "output": self.output,
            "error": self.error,
            "retry_count": self.retry_count
        }


@dataclass
class SessionProgress:
    """Progress tracking for a session"""
    session_id: str
    plan_name: str
    status: SessionStatus = SessionStatus.INITIALIZING
    started_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    autonomous_mode: bool = False
    tasks_completed: int = 0
    tasks_total: int = 0
    tasks: Dict[str, TaskProgress] = field(default_factory=dict)
    milestones: List[ProgressMilestone] = field(default_factory=list)
    metrics: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "session_id": self.session_id,
            "plan_name": self.plan_name,
            "status": self.status.value,
            "started_at": self.started_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "autonomous_mode": self.autonomous_mode,
            "tasks_completed": self.tasks_completed,
            "tasks_total": self.tasks_total,
            "tasks": {k: v.to_dict() for k, v in self.tasks.items()},
            "milestones": [m.to_dict() for m in self.milestones],
            "metrics": self.metrics
        }


class ProgressTracker:
    """
    Track execution progress with milestones and session management.

    Provides comprehensive progress monitoring and reporting capabilities.
    """

    def __init__(self, persistence_dir: Optional[str] = None):
        """
        Initialize the progress tracker.

        Args:
            persistence_dir: Directory for persisting progress data
        """
        self.persistence_dir = persistence_dir or "/tmp/blackbox4/progress"
        os.makedirs(self.persistence_dir, exist_ok=True)

        self._sessions: Dict[str, SessionProgress] = {}
        self._current_session_id: Optional[str] = None

    def start_session(
        self,
        plan_name: str,
        autonomous_mode: bool = False,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Start a new progress tracking session.

        Args:
            plan_name: Name of the plan being executed
            autonomous_mode: Whether running in autonomous mode
            metadata: Optional session metadata

        Returns:
            Session ID
        """
        session_id = f"{plan_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        session = SessionProgress(
            session_id=session_id,
            plan_name=plan_name,
            autonomous_mode=autonomous_mode,
            status=SessionStatus.IN_PROGRESS
        )

        if metadata:
            session.metrics.update(metadata)

        self._sessions[session_id] = session
        self._current_session_id = session_id

        # Add initial milestone
        self.add_milestone(
            session_id=session_id,
            name="session_started",
            description="Progress tracking session started"
        )

        self._persist_session(session_id)
        logger.info(f"Started progress tracking session: {session_id}")

        return session_id

    def update_progress(
        self,
        session_id: str,
        task_id: str,
        status: str,
        result: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Update progress for a task.

        Args:
            session_id: Session identifier
            task_id: Task identifier
            status: Task status
            result: Optional task result
        """
        if session_id not in self._sessions:
            logger.warning(f"Session not found: {session_id}")
            return

        session = self._sessions[session_id]

        # Get or create task progress
        if task_id not in session.tasks:
            session.tasks[task_id] = TaskProgress(
                task_id=task_id,
                status=status,
                started_at=datetime.now()
            )
        else:
            task_progress = session.tasks[task_id]
            task_progress.status = status

            if status in ["completed", "error", "failed"]:
                task_progress.completed_at = datetime.now()
                if task_progress.started_at:
                    task_progress.duration = (
                        task_progress.completed_at - task_progress.started_at
                    ).total_seconds()

            if result:
                task_progress.output = result.get("output")
                task_progress.error = result.get("error")
                task_progress.retry_count = result.get("retry_count", 0)

        # Update session metrics
        if status == "completed":
            session.tasks_completed += 1

        self._persist_session(session_id)
        logger.debug(f"Updated progress for task {task_id}: {status}")

    def add_milestone(
        self,
        session_id: str,
        name: str,
        description: str,
        status: MilestoneStatus = MilestoneStatus.PENDING,
        metadata: Optional[Dict[str, Any]] = None
    ) -> ProgressMilestone:
        """
        Add a milestone to track.

        Args:
            session_id: Session identifier
            name: Milestone name
            description: Milestone description
            status: Initial milestone status
            metadata: Optional milestone metadata

        Returns:
            Created milestone
        """
        if session_id not in self._sessions:
            logger.warning(f"Session not found: {session_id}")
            return None

        milestone = ProgressMilestone(
            id=f"{session_id}_{name}_{len(self._sessions[session_id].milestones)}",
            name=name,
            description=description,
            status=status,
            metadata=metadata or {}
        )

        self._sessions[session_id].milestones.append(milestone)
        self._persist_session(session_id)

        logger.info(f"Added milestone: {name}")
        return milestone

    def complete_milestone(
        self,
        session_id: str,
        milestone_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Mark a milestone as completed.

        Args:
            session_id: Session identifier
            milestone_id: Milestone identifier
            metadata: Optional completion metadata
        """
        if session_id not in self._sessions:
            logger.warning(f"Session not found: {session_id}")
            return

        for milestone in self._sessions[session_id].milestones:
            if milestone.id == milestone_id:
                milestone.status = MilestoneStatus.COMPLETED
                milestone.completed_at = datetime.now()
                if metadata:
                    milestone.metadata.update(metadata)
                self._persist_session(session_id)
                logger.info(f"Completed milestone: {milestone.name}")
                return

        logger.warning(f"Milestone not found: {milestone_id}")

    def get_status(self, session_id: str) -> SessionProgress:
        """
        Get current status for a session.

        Args:
            session_id: Session identifier

        Returns:
            Session progress
        """
        if session_id not in self._sessions:
            logger.warning(f"Session not found: {session_id}")
            return None

        # Calculate live metrics
        session = self._sessions[session_id]
        if session.tasks_total > 0:
            session.metrics["completion_percentage"] = (
                session.tasks_completed / session.tasks_total
            ) * 100

        return session

    def generate_report(self, session_id: str) -> Dict[str, Any]:
        """
        Generate a comprehensive progress report.

        Args:
            session_id: Session identifier

        Returns:
            Progress report dictionary
        """
        if session_id not in self._sessions:
            logger.warning(f"Session not found: {session_id}")
            return {}

        session = self._sessions[session_id]

        # Calculate statistics
        total_tasks = len(session.tasks)
        completed_tasks = sum(
            1 for t in session.tasks.values()
            if t.status in ["completed", "skipped"]
        )
        failed_tasks = sum(
            1 for t in session.tasks.values()
            if t.status in ["error", "failed"]
        )

        # Calculate duration
        if session.completed_at:
            duration = (session.completed_at - session.started_at).total_seconds()
        else:
            duration = (datetime.now() - session.started_at).total_seconds()

        # Calculate average task duration
        completed_with_duration = [
            t for t in session.tasks.values()
            if t.duration is not None
        ]
        avg_task_duration = (
            sum(t.duration for t in completed_with_duration) / len(completed_with_duration)
            if completed_with_duration else 0
        )

        # Milestone summary
        completed_milestones = sum(
            1 for m in session.milestones
            if m.status == MilestoneStatus.COMPLETED
        )

        report = {
            "session_id": session_id,
            "plan_name": session.plan_name,
            "status": session.status.value,
            "duration": duration,
            "autonomous_mode": session.autonomous_mode,
            "task_summary": {
                "total": total_tasks,
                "completed": completed_tasks,
                "failed": failed_tasks,
                "completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            },
            "milestone_summary": {
                "total": len(session.milestones),
                "completed": completed_milestones,
                "pending": len(session.milestones) - completed_milestones
            },
            "performance_metrics": {
                "average_task_duration": avg_task_duration,
                "total_retries": sum(t.retry_count for t in session.tasks.values())
            },
            "metadata": session.metrics
        }

        return report

    def set_session_status(self, session_id: str, status: SessionStatus) -> None:
        """
        Update session status.

        Args:
            session_id: Session identifier
            status: New session status
        """
        if session_id not in self._sessions:
            logger.warning(f"Session not found: {session_id}")
            return

        self._sessions[session_id].status = status

        if status in [SessionStatus.COMPLETED, SessionStatus.FAILED, SessionStatus.CANCELLED]:
            self._sessions[session_id].completed_at = datetime.now()

        self._persist_session(session_id)
        logger.info(f"Session {session_id} status: {status.value}")

    def get_all_sessions(self) -> List[str]:
        """Get all session IDs"""
        return list(self._sessions.keys())

    def get_active_sessions(self) -> List[str]:
        """Get all active session IDs"""
        return [
            sid for sid, session in self._sessions.items()
            if session.status == SessionStatus.IN_PROGRESS
        ]

    def cleanup_old_sessions(self, max_age_hours: int = 24) -> int:
        """
        Clean up old completed sessions.

        Args:
            max_age_hours: Maximum age in hours to keep

        Returns:
            Number of sessions cleaned up
        """
        cutoff = datetime.now().timestamp() - (max_age_hours * 3600)
        cleaned = 0

        for session_id in list(self._sessions.keys()):
            session = self._sessions[session_id]

            if session.status in [SessionStatus.COMPLETED, SessionStatus.FAILED]:
                session_age = session.completed_at.timestamp() if session.completed_at else 0
                if session_age < cutoff:
                    # Remove from memory
                    del self._sessions[session_id]
                    # Remove persistence file
                    persistence_file = os.path.join(self.persistence_dir, f"{session_id}.json")
                    if os.path.exists(persistence_file):
                        os.remove(persistence_file)
                    cleaned += 1

        logger.info(f"Cleaned up {cleaned} old sessions")
        return cleaned

    def _persist_session(self, session_id: str) -> None:
        """Persist session data to disk"""
        if session_id not in self._sessions:
            return

        session = self._sessions[session_id]
        persistence_file = os.path.join(self.persistence_dir, f"{session_id}.json")

        try:
            with open(persistence_file, 'w') as f:
                json.dump(session.to_dict(), f, indent=2)
        except Exception as e:
            logger.error(f"Failed to persist session {session_id}: {str(e)}")

    def _load_session(self, session_id: str) -> Optional[SessionProgress]:
        """Load session data from disk"""
        persistence_file = os.path.join(self.persistence_dir, f"{session_id}.json")

        if not os.path.exists(persistence_file):
            return None

        try:
            with open(persistence_file, 'r') as f:
                data = json.load(f)

            # Reconstruct session
            session = SessionProgress(
                session_id=data["session_id"],
                plan_name=data["plan_name"],
                status=SessionStatus(data["status"]),
                started_at=datetime.fromisoformat(data["started_at"]),
                completed_at=datetime.fromisoformat(data["completed_at"]) if data.get("completed_at") else None,
                autonomous_mode=data["autonomous_mode"],
                tasks_completed=data["tasks_completed"],
                tasks_total=data["tasks_total"],
                metrics=data.get("metrics", {})
            )

            # Reconstruct tasks
            for task_id, task_data in data.get("tasks", {}).items():
                session.tasks[task_id] = TaskProgress(
                    task_id=task_data["task_id"],
                    status=task_data["status"],
                    started_at=datetime.fromisoformat(task_data["started_at"]) if task_data.get("started_at") else None,
                    completed_at=datetime.fromisoformat(task_data["completed_at"]) if task_data.get("completed_at") else None,
                    duration=task_data.get("duration"),
                    output=task_data.get("output"),
                    error=task_data.get("error"),
                    retry_count=task_data.get("retry_count", 0)
                )

            # Reconstruct milestones
            for milestone_data in data.get("milestones", []):
                milestone = ProgressMilestone(
                    id=milestone_data["id"],
                    name=milestone_data["name"],
                    description=milestone_data["description"],
                    status=MilestoneStatus(milestone_data["status"]),
                    created_at=datetime.fromisoformat(milestone_data["created_at"]),
                    completed_at=datetime.fromisoformat(milestone_data["completed_at"]) if milestone_data.get("completed_at") else None,
                    metadata=milestone_data.get("metadata", {})
                )
                session.milestones.append(milestone)

            return session

        except Exception as e:
            logger.error(f"Failed to load session {session_id}: {str(e)}")
            return None

    def load_all_sessions(self) -> None:
        """Load all persisted sessions from disk"""
        if not os.path.exists(self.persistence_dir):
            return

        for filename in os.listdir(self.persistence_dir):
            if filename.endswith(".json"):
                session_id = filename[:-5]  # Remove .json
                session = self._load_session(session_id)
                if session:
                    self._sessions[session_id] = session

        logger.info(f"Loaded {len(self._sessions)} sessions from disk")
