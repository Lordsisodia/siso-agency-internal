#!/usr/bin/env python3
"""
TUI Logger for Blackbox4 Observability

Integrates with ManifestManager and GoalTracker to provide
comprehensive session and iteration logging for the TUI system.

Features:
- Session lifecycle logging (start, iterations, end)
- Manifest integration for execution tracking
- Goal tracker integration for progress monitoring
- Artifact storage for context, results, and iterations
- Real-time dashboard updates via WebSocket
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, asdict
import uuid

# Import existing Blackbox4 components
import sys
sys.path.append(str(Path(__file__).parent.parent.parent / "4-scripts" / "python"))

from core.runtime.manifest import ManifestManager, RunManifest
from core.runtime.goal_tracking import GoalTracker, ActionStatus


@dataclass
class ExecutionResult:
    """
    Result of a task execution.

    Attributes:
        success: Whether execution succeeded
        status: Status string (complete, failed, blocked)
        duration_ms: Execution duration in milliseconds
        tokens_used: Total tokens used
        cost_usd: Estimated cost in USD
        output: Execution output
        error: Error message if failed
        metadata: Additional metadata
    """
    success: bool
    status: str
    duration_ms: int
    tokens_used: int = 0
    cost_usd: float = 0.0
    output: str = ""
    error: Optional[str] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


@dataclass
class SessionSummary:
    """
    Summary of a completed TUI session.

    Attributes:
        session_id: Unique session identifier
        start_time: Session start timestamp
        end_time: Session end timestamp
        duration_seconds: Total session duration
        total_iterations: Number of iterations completed
        total_tokens: Total tokens used
        total_cost: Total estimated cost
        success_rate: Percentage of successful tasks
        artifacts_created: List of artifact paths
        goal_achieved: Whether primary goal was achieved
    """
    session_id: str
    start_time: str
    end_time: str
    duration_seconds: float
    total_iterations: int
    total_tokens: int
    total_cost: float
    success_rate: float
    artifacts_created: List[str]
    goal_achieved: bool
    final_goal_progress: float

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


class ArtifactManager:
    """
    Manages artifact storage for TUI sessions.

    Artifacts structure:
    .blackbox4/artifacts/
    └── {session_id}/
        ├── manifest.json
        ├── progress.json
        ├── tasks/
        │   ├── {task_id}-context.json
        │   └── {task_id}-result.json
        └── iterations/
            └── {iteration:04d}/
                ├── prompt.txt
                ├── response.txt
                └── metadata.json
    """

    def __init__(self, session_id: str, blackbox_root: Path):
        """
        Initialize artifact manager.

        Args:
            session_id: Unique session identifier
            blackbox_root: Path to blackbox root directory
        """
        self.session_id = session_id
        self.blackbox_root = Path(blackbox_root)
        self.artifacts_dir = self.blackbox_root / "artifacts" / session_id

        # Create directory structure
        self.tasks_dir = self.artifacts_dir / "tasks"
        self.iterations_dir = self.artifacts_dir / "iterations"
        self.tasks_dir.mkdir(parents=True, exist_ok=True)
        self.iterations_dir.mkdir(parents=True, exist_ok=True)

    def save_task_context(self, task: Dict[str, Any], iteration: int) -> Path:
        """
        Save task context to artifacts.

        Args:
            task: Task dictionary
            iteration: Iteration number

        Returns:
            Path to saved artifact
        """
        task_id = task.get("id", f"task-{iteration:04d}")
        filename = f"{task_id}-context.json"
        filepath = self.tasks_dir / filename

        artifact = {
            "task_id": task_id,
            "iteration": iteration,
            "timestamp": datetime.utcnow().isoformat(),
            "task": task
        }

        with open(filepath, 'w') as f:
            json.dump(artifact, f, indent=2)

        return filepath

    def save_task_result(self, task: Dict[str, Any], result: ExecutionResult, iteration: int) -> Path:
        """
        Save task execution result to artifacts.

        Args:
            task: Task dictionary
            result: Execution result
            iteration: Iteration number

        Returns:
            Path to saved artifact
        """
        task_id = task.get("id", f"task-{iteration:04d}")
        filename = f"{task_id}-result.json"
        filepath = self.tasks_dir / filename

        artifact = {
            "task_id": task_id,
            "iteration": iteration,
            "timestamp": datetime.utcnow().isoformat(),
            "result": {
                "success": result.success,
                "status": result.status,
                "duration_ms": result.duration_ms,
                "tokens_used": result.tokens_used,
                "cost_usd": result.cost_usd,
                "output": result.output,
                "error": result.error,
                "metadata": result.metadata
            }
        }

        with open(filepath, 'w') as f:
            json.dump(artifact, f, indent=2)

        return filepath

    def save_iteration(self, iteration: int, prompt: str, response: str, metadata: Dict[str, Any]) -> Path:
        """
        Save iteration details to artifacts.

        Args:
            iteration: Iteration number
            prompt: Prompt text
            response: Response text
            metadata: Additional metadata

        Returns:
            Path to iteration directory
        """
        iteration_dir = self.iterations_dir / f"{iteration:04d}"
        iteration_dir.mkdir(exist_ok=True)

        # Save prompt
        prompt_file = iteration_dir / "prompt.txt"
        with open(prompt_file, 'w') as f:
            f.write(prompt)

        # Save response
        response_file = iteration_dir / "response.txt"
        with open(response_file, 'w') as f:
            f.write(response)

        # Save metadata
        metadata_file = iteration_dir / "metadata.json"
        metadata["timestamp"] = datetime.utcnow().isoformat()
        metadata["iteration"] = iteration
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)

        return iteration_dir

    def get_artifact_summary(self) -> Dict[str, Any]:
        """
        Get summary of stored artifacts.

        Returns:
            Summary dictionary
        """
        task_files = list(self.tasks_dir.glob("*.json"))
        iteration_dirs = [d for d in self.iterations_dir.iterdir() if d.is_dir()]

        return {
            "session_id": self.session_id,
            "artifacts_dir": str(self.artifacts_dir),
            "task_artifacts": len(task_files),
            "iteration_artifacts": len(iteration_dirs),
            "total_files": len(task_files) + len(iteration_dirs) * 3  # 3 files per iteration
        }


class TUILogger:
    """
    Comprehensive TUI activity logger.

    Integrates with:
    - ManifestManager: For execution tracking and replayability
    - GoalTracker: For goal and progress monitoring
    - ArtifactManager: For artifact storage
    - DashboardClient: For real-time WebSocket updates

    Usage:
        logger = TUILogger(session_id="sess-001", blackbox_root=Path("/path/to/blackbox"))
        logger.log_session_start(prd)
        logger.log_iteration(1, task, result)
        summary = logger.log_session_end(success_rate=0.95, goal_achieved=True)
    """

    def __init__(self, session_id: str, blackbox_root: Path):
        """
        Initialize TUI logger.

        Args:
            session_id: Unique session identifier
            blackbox_root: Path to blackbox root directory
        """
        self.session_id = session_id
        self.blackbox_root = Path(blackbox_root)

        # Initialize components
        self.manifest_manager = ManifestManager(self.blackbox_root)
        self.goal_tracker = GoalTracker(agent_id=f"tui-{session_id}", project_root=self.blackbox_root)
        self.artifact_manager = ArtifactManager(session_id, self.blackbox_root)

        # Create manifest for this session
        self.manifest = self.manifest_manager.create_manifest(
            agent="tui-native",
            phase="execution",
            model_profile="balanced",
            task_name=session_id
        )

        # Session tracking
        self.start_time: Optional[datetime] = None
        self.iterations_completed = 0
        self.total_tokens = 0
        self.total_cost = 0.0
        self.successful_tasks = 0
        self.total_tasks = 0

        # Dashboard client (lazy import, optional)
        self._dashboard_client = None

    @property
    def dashboard_client(self):
        """Lazy load dashboard client."""
        if self._dashboard_client is None:
            try:
                from .dashboard_client import DashboardClient
                self._dashboard_client = DashboardClient()
            except ImportError:
                # socketio not available, dashboard disabled
                self._dashboard_client = False
        return self._dashboard_client if self._dashboard_client is not False else None

    def log_session_start(self, prd: Dict[str, Any]):
        """
        Log session start.

        Args:
            prd: PRD dictionary containing requirements and goals
        """
        self.start_time = datetime.now()

        # Set up goal tracker
        goal_description = prd.get("goal", "Execute TUI session")
        sub_goals = prd.get("sub_goals", [])
        self.goal_tracker.set_goal(goal_description, sub_goals)

        # Create execution plan
        plan_actions = prd.get("tasks", [f"Complete TUI session {self.session_id}"])
        plan_description = f"Execution plan for session {self.session_id}"
        self.goal_tracker.create_plan(plan_description, plan_actions)

        # Update manifest
        self.manifest.set_input("user_prompt", json.dumps(prd))
        self.manifest.log_step(
            action="session_start",
            status="success",
            duration_ms=0,
            metadata={
                "session_id": self.session_id,
                "goal": goal_description,
                "sub_goals_count": len(sub_goals)
            }
        )

        # Save session manifest
        self._save_session_manifest()

        # Emit dashboard event
        if self.dashboard_client:
            self.dashboard_client.emit_session_start(self.session_id, prd)

    def log_iteration(self, iteration: int, task: Dict[str, Any], result: ExecutionResult):
        """
        Log iteration execution.

        Args:
            iteration: Iteration number
            task: Task dictionary
            result: Execution result
        """
        self.total_tasks += 1
        self.iterations_completed += 1
        self.total_tokens += result.tokens_used
        self.total_cost += result.cost_usd

        if result.success:
            self.successful_tasks += 1

        # Update goal tracker
        action_id = task.get("action_id", f"PLAN-ACT-{iteration:03d}")
        try:
            status = ActionStatus.COMPLETE if result.success else ActionStatus.FAILED
            self.goal_tracker.update_action(
                action_id,
                status,
                result.output if result.success else result.error
            )
        except ValueError:
            # Action not found in plan, continue
            pass

        # Add step to manifest
        self.manifest.log_step(
            action=task.get("description", f"Iteration {iteration}"),
            status=result.status,
            duration_ms=result.duration_ms,
            input_tokens=result.metadata.get("input_tokens", 0),
            output_tokens=result.metadata.get("output_tokens", 0),
            metadata={
                "iteration": iteration,
                "task_id": task.get("id"),
                "success": result.success,
                "error": result.error
            }
        )

        # Save artifacts
        self.artifact_manager.save_task_context(task, iteration)
        self.artifact_manager.save_task_result(task, result, iteration)

        # Save iteration details if prompt/response available
        if result.metadata.get("prompt") and result.metadata.get("response"):
            self.artifact_manager.save_iteration(
                iteration,
                result.metadata["prompt"],
                result.metadata["response"],
                {
                    "task_id": task.get("id"),
                    "tokens_used": result.tokens_used,
                    "cost_usd": result.cost_usd,
                    "duration_ms": result.duration_ms
                }
            )

        # Update manifest metrics
        self.manifest.update_metrics(
            operations_count=self.manifest.data["manifest"]["metrics"]["operations_count"] + 1,
            estimated_cost=self.total_cost
        )

        # Save session manifest
        self._save_session_manifest()

        # Emit dashboard events
        if self.dashboard_client:
            self.dashboard_client.emit_iteration_complete(iteration, task, result)

    def log_session_end(self, summary: Dict[str, Any]) -> SessionSummary:
        """
        Finalize session and create summary.

        Args:
            summary: Summary dictionary containing:
                - success_rate: Percentage of successful tasks
                - goal_achieved: Whether primary goal was achieved
                - final_goal_progress: Progress toward goal (0-1)

        Returns:
            SessionSummary object
        """
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds() if self.start_time else 0

        # Finalize manifest
        self.manifest.set_validation_results(
            success=summary.get("goal_achieved", False),
            checks_passed=self.successful_tasks,
            checks_failed=self.total_tasks - self.successful_tasks
        )
        self.manifest.finalize()

        # Complete goal if achieved
        if summary.get("goal_achieved", False):
            self.goal_tracker.complete_goal()

        # Create session summary
        session_summary = SessionSummary(
            session_id=self.session_id,
            start_time=self.start_time.isoformat() if self.start_time else "",
            end_time=end_time.isoformat(),
            duration_seconds=duration,
            total_iterations=self.iterations_completed,
            total_tokens=self.total_tokens,
            total_cost=self.total_cost,
            success_rate=summary.get("success_rate", 0.0),
            artifacts_created=self._get_artifact_paths(),
            goal_achieved=summary.get("goal_achieved", False),
            final_goal_progress=summary.get("final_goal_progress", 0.0)
        )

        # Save session summary
        self._save_session_summary(session_summary)

        # Emit dashboard event
        if self.dashboard_client:
            self.dashboard_client.emit_session_end(session_summary)

        return session_summary

    def _save_session_manifest(self):
        """Save current session manifest state."""
        manifest_path = self.artifact_manager.artifacts_dir / "manifest.json"
        with open(manifest_path, 'w') as f:
            json.dump(self.manifest.data, f, indent=2)

    def _save_session_summary(self, summary: SessionSummary):
        """Save session summary to artifacts."""
        summary_path = self.artifact_manager.artifacts_dir / "summary.json"
        with open(summary_path, 'w') as f:
            json.dump(summary.to_dict(), f, indent=2)

    def _save_progress(self):
        """Save current progress state."""
        progress = {
            "session_id": self.session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "iterations_completed": self.iterations_completed,
            "total_tasks": self.total_tasks,
            "successful_tasks": self.successful_tasks,
            "total_tokens": self.total_tokens,
            "total_cost": self.total_cost,
            "goal_status": self.goal_tracker.get_status()
        }

        progress_path = self.artifact_manager.artifacts_dir / "progress.json"
        with open(progress_path, 'w') as f:
            json.dump(progress, f, indent=2)

    def _get_artifact_paths(self) -> List[str]:
        """Get list of created artifact paths."""
        artifact_summary = self.artifact_manager.get_artifact_summary()
        return [
            str(artifact_summary["artifacts_dir"]),
            str(artifact_summary["artifacts_dir"] / "manifest.json"),
            str(artifact_summary["artifacts_dir"] / "progress.json"),
            str(artifact_summary["artifacts_dir"] / "summary.json")
        ]

    def get_current_status(self) -> Dict[str, Any]:
        """
        Get current session status.

        Returns:
            Status dictionary
        """
        if self.start_time:
            duration = (datetime.now() - self.start_time).total_seconds()
        else:
            duration = 0

        return {
            "session_id": self.session_id,
            "duration_seconds": duration,
            "iterations_completed": self.iterations_completed,
            "total_tasks": self.total_tasks,
            "successful_tasks": self.successful_tasks,
            "success_rate": self.successful_tasks / self.total_tasks if self.total_tasks > 0 else 0.0,
            "total_tokens": self.total_tokens,
            "total_cost": self.total_cost,
            "goal_status": self.goal_tracker.get_status(),
            "artifacts": self.artifact_manager.get_artifact_summary()
        }
