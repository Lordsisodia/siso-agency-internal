#!/usr/bin/env python3
"""
Ralphy-Blackbox Integration Bridge

This module integrates Ralphy with the Blackbox5 AgentMemory system,
ensuring all Ralphy sessions are tracked in Project Memory with:
1. Goals and objectives
2. Task achievements
3. Code outputted
4. Timestamps and duration
"""

import json
import sys
import os
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, Dict, Any

# Add Blackbox engine to path
script_dir = Path(__file__).parent
engine_path = script_dir / "../../.."
sys.path.insert(0, str(engine_path))

try:
    from knowledge.memory.AgentMemory import AgentMemory
except ImportError:
    # Fallback if AgentMemory is not in expected location
    print("Warning: AgentMemory not found in expected location", file=sys.stderr)
    AgentMemory = None


class RalphyBlackboxBridge:
    """
    Bridge between Ralphy and Blackbox5 AgentMemory system.

    Captures Ralphy execution data and stores it in the Blackbox
    Project Memory structure under operations/ralphy/.
    """

    def __init__(
        self,
        agent_id: str = "ralphy",
        project_root: Optional[Path] = None,
        memory_base_path: Optional[Path] = None
    ):
        """
        Initialize the Ralphy-Blackbox bridge.

        Args:
            agent_id: Agent identifier (default: "ralphy")
            project_root: Project root directory
            memory_base_path: Base path for memory storage
        """
        self.agent_id = agent_id

        # Determine project root
        if project_root is None:
            project_root = Path.cwd()
            while project_root != project_root.parent:
                if (project_root / ".blackbox5").exists():
                    break
                project_root = project_root.parent

        self.project_root = project_root

        # Set up memory path in Project Memory
        if memory_base_path is None:
            memory_base_path = project_root / ".blackbox5" / "5-project-memory" / "siso-internal" / "operations" / "ralphy"

        self.memory_path = memory_base_path
        self.memory_path.mkdir(parents=True, exist_ok=True)

        # Initialize AgentMemory if available
        self.memory = None
        if AgentMemory:
            try:
                self.memory = AgentMemory(
                    agent_id=agent_id,
                    memory_base_path=memory_base_path.parent,
                    auto_save=True
                )
            except Exception as e:
                print(f"Warning: Failed to initialize AgentMemory: {e}", file=sys.stderr)

        # Session tracking
        self.session_id: Optional[str] = None
        self.session_start: Optional[datetime] = None

    def start_session(
        self,
        task: str,
        prd_file: str = "PRD.md",
        engine: str = "claude",
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Start a new Ralphy session and track it in Blackbox.

        Args:
            task: Task description
            prd_file: PRD filename
            engine: AI engine being used
            metadata: Additional session metadata

        Returns:
            Session ID
        """
        self.session_start = datetime.now(timezone.utc)

        # Generate session ID
        timestamp = self.session_start.strftime("%Y%m%d_%H%M%S")
        self.session_id = f"ralphy_{timestamp}"

        # Create session metadata
        session_metadata = {
            "engine": engine,
            "prd_file": prd_file,
            "task": task,
            "session_type": "ralphy_execution",
            "blackbox_version": "5.0"
        }
        if metadata:
            session_metadata.update(metadata)

        # Store in AgentMemory if available
        if self.memory:
            try:
                self.memory.add_session(
                    task=task,
                    result="Session started",
                    success=True,
                    metadata=session_metadata
                )
            except Exception as e:
                print(f"Warning: Failed to add session to memory: {e}", file=sys.stderr)

        # Store in active session
        self._store_active_session(task, session_metadata)

        print(f"[Blackbox] Started session: {self.session_id}", file=sys.stderr)
        return self.session_id

    def end_session(
        self,
        success: bool = True,
        result: str = "",
        files_created: Optional[list] = None,
        git_commit: Optional[str] = None,
        error: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        End a Ralphy session and update Blackbox memory.

        Args:
            success: Whether the task was successful
            result: Result description
            files_created: List of files created
            git_commit: Git commit hash if created
            error: Error message if failed

        Returns:
            Session summary dictionary
        """
        if not self.session_id:
            print("Warning: No active session to end", file=sys.stderr)
            return {}

        # Calculate duration
        duration = None
        if self.session_start:
            duration = (datetime.now(timezone.utc) - self.session_start).total_seconds()

        # Build result message
        result_parts = []
        if success:
            result_parts.append("Task completed successfully")
        else:
            result_parts.append("Task failed")

        if result:
            result_parts.append(result)

        if files_created:
            result_parts.append(f"Created {len(files_created)} file(s)")

        if git_commit:
            result_parts.append(f"Commit: {git_commit}")

        result_message = ". ".join(result_parts)

        # Update session in AgentMemory
        session_summary = {
            "session_id": self.session_id,
            "success": success,
            "duration_seconds": duration,
            "files_created": files_created or [],
            "git_commit": git_commit,
            "error": error,
            "result": result_message
        }

        if self.memory:
            try:
                # Update the last session with completion data
                if self.memory.sessions:
                    last_session = self.memory.sessions[-1]
                    last_session.success = success
                    last_session.result = result_message
                    if duration:
                        last_session.duration_seconds = duration

                    # Add files_created to metadata
                    if files_created:
                        last_session.metadata["files_created"] = files_created
                    if git_commit:
                        last_session.metadata["git_commit"] = git_commit
                    if error:
                        last_session.metadata["error"] = error

                    self.memory._save()
            except Exception as e:
                print(f"Warning: Failed to update session in memory: {e}", file=sys.stderr)

        # Archive session
        self._archive_session(session_summary)

        # Clear active session
        self._clear_active_session()

        print(f"[Blackbox] Ended session: {self.session_id}", file=sys.stderr)

        return session_summary

    def log_progress(self, message: str, category: str = "info") -> None:
        """
        Log progress during session execution.

        Args:
            message: Progress message
            category: Category (info, warning, error, milestone)
        """
        if not self.session_id:
            return

        # Append to session progress log
        progress_file = self.memory_path / "sessions" / f"{self.session_id}_progress.jsonl"
        progress_file.parent.mkdir(parents=True, exist_ok=True)

        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "session_id": self.session_id,
            "category": category,
            "message": message
        }

        try:
            with open(progress_file, 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
        except Exception as e:
            print(f"Warning: Failed to log progress: {e}", file=sys.stderr)

    def add_insight(
        self,
        content: str,
        category: str = "pattern",
        confidence: float = 1.0
    ) -> None:
        """
        Add an insight learned during execution.

        Args:
            content: Insight content
            category: Category (pattern, gotcha, discovery, optimization)
            confidence: Confidence level (0.0 to 1.0)
        """
        if self.memory:
            try:
                self.memory.add_insight(
                    content=content,
                    category=category,
                    confidence=confidence,
                    source_session=self.session_id
                )
            except Exception as e:
                print(f"Warning: Failed to add insight: {e}", file=sys.stderr)

    def _store_active_session(self, task: str, metadata: Dict[str, Any]) -> None:
        """Store active session data."""
        active_dir = self.memory_path / "active"
        active_dir.mkdir(parents=True, exist_ok=True)

        session_file = active_dir / "session.json"

        session_data = {
            "agent_id": self.agent_id,
            "agent_type": "autonomous_coding",
            "session_start": self.session_start.isoformat() if self.session_start else None,
            "task": task,
            "status": "active",
            "session_id": self.session_id,
            "context": {
                "project": str(self.project_root),
                "engine": metadata.get("engine", "claude"),
                "prd_file": metadata.get("prd_file", ""),
                "blackbox_integration": True
            }
        }

        try:
            with open(session_file, 'w') as f:
                json.dump(session_data, f, indent=2)
        except Exception as e:
            print(f"Warning: Failed to store active session: {e}", file=sys.stderr)

    def _clear_active_session(self) -> None:
        """Clear active session file."""
        active_file = self.memory_path / "active" / "session.json"
        try:
            if active_file.exists():
                active_file.unlink()
        except Exception as e:
            print(f"Warning: Failed to clear active session: {e}", file=sys.stderr)

    def _archive_session(self, summary: Dict[str, Any]) -> None:
        """Archive session to history."""
        history_dir = self.memory_path / "history" / "sessions" / self.agent_id
        history_dir.mkdir(parents=True, exist_ok=True)

        sessions_file = history_dir / "sessions.json"

        # Load existing sessions
        sessions = []
        if sessions_file.exists():
            try:
                with open(sessions_file, 'r') as f:
                    sessions = json.load(f)
            except Exception:
                sessions = []

        # Add new session
        session_record = {
            "session_id": self.session_id,
            "timestamp": self.session_start.isoformat() if self.session_start else None,
            "task": summary.get("task", ""),
            "result": summary.get("result", ""),
            "metadata": {
                "engine": summary.get("engine", "claude"),
                "files_created": summary.get("files_created", []),
                "git_commit": summary.get("git_commit"),
                "duration_seconds": summary.get("duration_seconds")
            },
            "success": summary.get("success", True),
            "duration_seconds": summary.get("duration_seconds")
        }

        sessions.append(session_record)

        # Save sessions
        try:
            with open(sessions_file, 'w') as f:
                json.dump(sessions, f, indent=2)
        except Exception as e:
            print(f"Warning: Failed to archive session: {e}", file=sys.stderr)

        # Also create individual session file
        session_dir = history_dir / self.session_id
        session_dir.mkdir(exist_ok=True)

        session_file = session_dir / "session.json"
        try:
            with open(session_file, 'w') as f:
                json.dump({
                    "session_id": self.session_id,
                    "start_time": self.session_start.isoformat() if self.session_start else None,
                    "end_time": datetime.now(timezone.utc).isoformat(),
                    "summary": summary
                }, f, indent=2)
        except Exception as e:
            print(f"Warning: Failed to save session details: {e}", file=sys.stderr)


def create_bridge() -> RalphyBlackboxBridge:
    """Create a Ralphy-Blackbox bridge instance."""
    return RalphyBlackboxBridge()


if __name__ == "__main__":
    # Test the bridge
    bridge = create_bridge()

    session_id = bridge.start_session(
        task="Test task",
        engine="claude",
        metadata={"test": True}
    )

    print(f"Started session: {session_id}")

    bridge.log_progress("Task started", "info")
    bridge.log_progress("Working on task...", "info")
    bridge.log_progress("Task completed", "milestone")

    bridge.add_insight("Test insight", "pattern", 0.9)

    summary = bridge.end_session(
        success=True,
        result="Test completed",
        files_created=["test.py"],
        git_commit="abc123"
    )

    print("Session summary:")
    print(json.dumps(summary, indent=2))
