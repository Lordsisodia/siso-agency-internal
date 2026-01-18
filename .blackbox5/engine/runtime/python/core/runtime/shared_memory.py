#!/usr/bin/env python3
"""
Shared Memory System for Multi-Agent Coordination

Provides a shared memory space for agents to coordinate, track state,
and hand off work between each other.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
from threading import Lock
import fcntl

PROJECT_ROOT = Path(__file__).parent.parent


@dataclass
class AgentUpdate:
    """An agent status update."""
    agent_id: str
    timestamp: str
    action: str
    artifacts: List[str]
    summary: str


@dataclass
class QueueItem:
    """An item in the work queue."""
    id: str
    task_type: str
    description: str
    assigned_to: Optional[str]
    created_at: str
    priority: int  # 1-10, 1 is highest
    status: str  # pending, in_progress, complete
    dependencies: List[str]


class SharedMemory:
    """
    Thread-safe shared memory for multi-agent coordination.

    Provides:
    - Project state tracking
    - Agent update publishing
    - Work queue management
    - Goal progress tracking
    """

    def __init__(self, project_root: str = None):
        """
        Initialize shared memory.

        Args:
            project_root: Project root directory
        """
        if project_root is None:
            project_root = Path.cwd()

        self.project_root = Path(project_root)
        self.shared_memory_dir = self.project_root / ".memory" / "shared"
        self.shared_memory_dir.mkdir(parents=True, exist_ok=True)

        self.state_file = self.shared_memory_dir / "project-state.json"
        self.queue_file = self.shared_memory_dir / "work-queue.json"
        self.updates_dir = self.shared_memory_dir / "agent-updates"
        self.updates_dir.mkdir(exist_ok=True)

        self._lock = Lock()

        # Load or initialize state
        self.state = self._load_state()
        self.queue = self._load_queue()

    def _load_state(self) -> Dict:
        """Load project state from file."""
        if self.state_file.exists():
            with open(self.state_file, 'r') as f:
                return json.load(f)

        # Initialize default state
        return {
            "version": "1.0",
            "last_updated": datetime.utcnow().isoformat(),
            "active_plan": "active",
            "current_phase": "context",
            "active_agents": [],
            "decisions_in_progress": [],
            "goals": {
                "current": None,
                "sub_goals": [],
                "overall_progress": 0.0
            },
            "metrics": {
                "total_decisions": 0,
                "decisions_this_session": 0,
                "active_tasks": 0
            }
        }

    def _save_state(self):
        """Save project state to file."""
        self.state["last_updated"] = datetime.utcnow().isoformat()

        with self._lock:
            with open(self.state_file, 'w') as f:
                fcntl.flock(f.fileno(), fcntl.LOCK_EX)
                json.dump(self.state, f, indent=2)
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)

    def _load_queue(self) -> List[Dict]:
        """Load work queue from file."""
        if self.queue_file.exists():
            with open(self.queue_file, 'r') as f:
                return json.load(f)
        return []

    def _save_queue(self):
        """Save work queue to file."""
        with self._lock:
            with open(self.queue_file, 'w') as f:
                fcntl.flock(f.fileno(), fcntl.LOCK_EX)
                json.dump(self.queue, f, indent=2)
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)

    def publish_update(
        self,
        agent_id: str,
        action: str,
        artifacts: List[str] = None,
        summary: str = ""
    ):
        """
        Publish an agent update to shared memory.

        Args:
            agent_id: Agent identifier
            action: Action performed
            artifacts: List of artifacts created/modified
            summary: Summary of work
        """
        update = AgentUpdate(
            agent_id=agent_id,
            timestamp=datetime.utcnow().isoformat(),
            action=action,
            artifacts=artifacts or [],
            summary=summary
        )

        # Write to agent's update file
        update_file = self.updates_dir / f"{agent_id}.jsonl"
        with open(update_file, 'a') as f:
            f.write(json.dumps(asdict(update)) + "\n")

        # Update active agents list
        if agent_id not in self.state["active_agents"]:
            self.state["active_agents"].append(agent_id)

        self._save_state()

    def get_updates(self, agent_id: str = None, limit: int = 10) -> List[AgentUpdate]:
        """
        Get recent agent updates.

        Args:
            agent_id: Specific agent to get updates for (None = all)
            limit: Maximum number of updates to return

        Returns:
            List of AgentUpdate objects
        """
        updates = []

        if agent_id:
            update_files = [self.updates_dir / f"{agent_id}.jsonl"]
        else:
            update_files = list(self.updates_dir.glob("*.jsonl"))

        for update_file in update_files:
            if not update_file.exists():
                continue

            with open(update_file, 'r') as f:
                for line in f:
                    if line.strip():
                        update_dict = json.loads(line)
                        updates.append(AgentUpdate(**update_dict))

        # Sort by timestamp (newest first) and limit
        updates.sort(key=lambda u: u.timestamp, reverse=True)
        return updates[:limit]

    def add_to_queue(
        self,
        task_type: str,
        description: str,
        assigned_to: str = None,
        priority: int = 5,
        dependencies: List[str] = None
    ) -> str:
        """
        Add a task to the work queue.

        Args:
            task_type: Type of task (e.g., "research", "development")
            description: Task description
            assigned_to: Agent to assign to (None = unassigned)
            priority: Priority 1-10 (1 is highest)
            dependencies: List of task IDs this depends on

        Returns:
            Task ID
        """
        import uuid
        task_id = f"TASK-{uuid.uuid4().hex[:8].upper()}"

        item = QueueItem(
            id=task_id,
            task_type=task_type,
            description=description,
            assigned_to=assigned_to,
            created_at=datetime.utcnow().isoformat(),
            priority=priority,
            status="pending",
            dependencies=dependencies or []
        )

        self.queue.append(asdict(item))
        self._save_queue()

        # Update metrics
        self.state["metrics"]["active_tasks"] = sum(
            1 for item in self.queue if item["status"] in ["pending", "in_progress"]
        )
        self._save_state()

        return task_id

    def get_next_task(self, agent_id: str = None) -> Optional[Dict]:
        """
        Get the next task from the queue.

        Args:
            agent_id: Agent requesting work (filters to assigned or unassigned)

        Returns:
            Queue item dict or None if no tasks available
        """
        # Filter by agent
        available = [
            item for item in self.queue
            if item["status"] == "pending"
            and (item["assigned_to"] is None or item["assigned_to"] == agent_id)
            and all(
                dep_item["status"] == "complete"
                for dep_item in self.queue
                if dep_item["id"] in item["dependencies"]
            )
        ]

        if not available:
            return None

        # Sort by priority (lower number = higher priority)
        available.sort(key=lambda x: x["priority"])
        return available[0]

    def update_task_status(self, task_id: str, status: str):
        """
        Update the status of a task.

        Args:
            task_id: Task ID
            status: New status (pending, in_progress, complete)
        """
        for item in self.queue:
            if item["id"] == task_id:
                item["status"] = status
                self._save_queue()

                # Update metrics
                self.state["metrics"]["active_tasks"] = sum(
                    1 for i in self.queue if i["status"] in ["pending", "in_progress"]
                )
                self._save_state()
                return

        raise ValueError(f"Task not found: {task_id}")

    def set_goal(self, goal: str, sub_goals: List[str] = None):
        """
        Set the current goal and sub-goals.

        Args:
            goal: Current goal description
            sub_goals: List of sub-goals
        """
        self.state["goals"]["current"] = goal
        self.state["goals"]["sub_goals"] = [
            {"description": sg, "progress": 0.0}
            for sg in (sub_goals or [])
        ]
        self.state["goals"]["overall_progress"] = 0.0
        self._save_state()

    def update_progress(self, sub_goal: str, progress: float):
        """
        Update progress on a sub-goal.

        Args:
            sub_goal: Sub-goal description
            progress: Progress 0.0 to 1.0
        """
        for sg in self.state["goals"]["sub_goals"]:
            if sg["description"] == sub_goal:
                sg["progress"] = max(0.0, min(1.0, progress))
                break
        else:
            # Add new sub-goal
            self.state["goals"]["sub_goals"].append({
                "description": sub_goal,
                "progress": max(0.0, min(1.0, progress))
            })

        # Recalculate overall progress
        if self.state["goals"]["sub_goals"]:
            total = sum(sg["progress"] for sg in self.state["goals"]["sub_goals"])
            self.state["goals"]["overall_progress"] = total / len(self.state["goals"]["sub_goals"])

        self._save_state()

    def get_status(self) -> Dict:
        """
        Get current project status.

        Returns:
            Status dictionary
        """
        return {
            "state": self.state,
            "queue": self.queue,
            "recent_updates": [asdict(u) for u in self.get_updates(limit=5)]
        }


def main():
    """CLI for shared memory operations."""
    import argparse

    parser = argparse.ArgumentParser(description="Shared memory management")
    parser.add_argument("--project-root", default=".")
    parser.add_argument("--status", action="store_true", help="Show status")
    parser.add_argument("--queue", action="store_true", help="Show work queue")
    parser.add_argument("--updates", action="store_true", help="Show recent updates")
    parser.add_argument("--add-task", help="Add task to queue")
    parser.add_argument("--task-type", default="general")
    parser.add_argument("--assign", help="Assign to agent")
    parser.add_argument("--priority", type=int, default=5)

    args = parser.parse_args()

    memory = SharedMemory(args.project_root)

    if args.status:
        status = memory.get_status()
        print(json.dumps(status, indent=2))
    elif args.queue:
        for item in memory.queue:
            print(f"{item['id']}: {item['description']} [{item['status']}]")
    elif args.updates:
        for update in memory.get_updates(limit=10):
            print(f"{update.timestamp} [{update.agent_id}] {update.action}")
    elif args.add_task:
        task_id = memory.add_to_queue(
            task_type=args.task_type,
            description=args.add_task,
            assigned_to=args.assign,
            priority=args.priority
        )
        print(f"Added task: {task_id}")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
