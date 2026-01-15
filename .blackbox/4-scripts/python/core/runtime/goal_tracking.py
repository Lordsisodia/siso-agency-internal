#!/usr/bin/env python3
"""
Goal-Plan-Action Framework for Agent Self-Awareness

Provides agents with the ability to track goals, plans, and actions
for improved context awareness and progress reporting.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum


class ActionStatus(Enum):
    """Status of an action."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETE = "complete"
    BLOCKED = "blocked"
    FAILED = "failed"


@dataclass
class Action:
    """A single action within a plan."""
    id: str
    description: str
    status: ActionStatus
    created_at: str
    completed_at: Optional[str]
    dependencies: List[str]


@dataclass
class Plan:
    """A plan composed of actions."""
    id: str
    goal: str
    description: str
    actions: List[Action]
    created_at: str
    status: str


@dataclass
class Goal:
    """A high-level goal with sub-goals."""
    id: str
    description: str
    sub_goals: List[str]
    progress: float
    created_at: str


class GoalTracker:
    """
    Goal-Plan-Action tracking framework.

    Enables agents to:
    1. Set high-level goals
    2. Create plans with actions
    3. Track progress on actions
    4. Get status summaries
    """

    def __init__(self, agent_id: str, project_root: str = None):
        """Initialize goal tracker for an agent."""
        self.agent_id = agent_id

        if project_root is None:
            project_root = Path(__file__).parent.parent

        self.project_root = Path(project_root)
        self.memory_dir = self.project_root / ".memory" / "agents" / agent_id
        self.memory_dir.mkdir(parents=True, exist_ok=True)

        self.state_file = self.memory_dir / "goal_state.json"
        self.state = self._load_state()

    def _load_state(self) -> Dict:
        """Load agent's goal state."""
        if self.state_file.exists():
            with open(self.state_file, 'r') as f:
                return json.load(f)

        return {
            "current_goal": None,
            "current_plan": None,
            "completed_goals": [],
            "completed_plans": [],
            "history": []
        }

    def _save_state(self):
        """Save agent's goal state."""
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)

    def set_goal(self, goal: str, sub_goals: List[str] = None):
        """
        Set the current goal and sub-goals.

        Args:
            goal: High-level goal description
            sub_goals: List of sub-goals

        Returns:
            Goal ID
        """
        import uuid

        if self.state["current_goal"]:
            # Archive current goal
            self.state["completed_goals"].append(self.state["current_goal"])

        goal_obj = {
            "id": f"GOAL-{uuid.uuid4().hex[:8].upper()}",
            "description": goal,
            "sub_goals": [
                {"description": sg, "progress": 0.0}
                for sg in (sub_goals or [])
            ],
            "progress": 0.0,
            "created_at": datetime.utcnow().isoformat()
        }

        self.state["current_goal"] = goal_obj
        self._save_state()

        return goal_obj["id"]

    def create_plan(
        self,
        plan_description: str,
        actions: List[str]
    ) -> str:
        """
        Create a plan with specified actions.

        Args:
            plan_description: Description of the plan
            actions: List of action descriptions

        Returns:
            Plan ID
        """
        import uuid

        if self.state["current_plan"]:
            self.state["completed_plans"].append(self.state["current_plan"])

        plan_id = f"PLAN-{uuid.uuid4().hex[:8].upper()}"

        plan = {
            "id": plan_id,
            "description": plan_description,
            "actions": [
                {
                    "id": f"{plan_id}-ACT-{i:03d}",
                    "description": action,
                    "status": ActionStatus.PENDING.value,
                    "created_at": datetime.utcnow().isoformat(),
                    "completed_at": None,
                    "dependencies": []
                }
                for i, action in enumerate(actions)
            ],
            "created_at": datetime.utcnow().isoformat(),
            "status": "pending"
        }

        self.state["current_plan"] = plan
        self._save_state()

        return plan_id

    def update_action(
        self,
        action_id: str,
        status: ActionStatus,
        result: str = None
    ):
        """
        Update the status of an action.

        Args:
            action_id: Action ID
            status: New status
            result: Optional result description
        """
        if not self.state["current_plan"]:
            raise ValueError("No active plan")

        for action in self.state["current_plan"]["actions"]:
            if action["id"] == action_id:
                action["status"] = status.value
                if status == ActionStatus.COMPLETE:
                    action["completed_at"] = datetime.utcnow().isoformat()
                if result:
                    action["result"] = result

                # Update overall plan status
                self._update_plan_status()
                self._save_state()
                return

        raise ValueError(f"Action not found: {action_id}")

    def _update_plan_status(self):
        """Update overall plan status based on actions."""
        actions = self.state["current_plan"]["actions"]

        if all(a["status"] == ActionStatus.COMPLETE.value for a in actions):
            self.state["current_plan"]["status"] = "complete"
        elif any(a["status"] == ActionStatus.FAILED.value for a in actions):
            self.state["current_plan"]["status"] = "failed"
        elif any(a["status"] == ActionStatus.IN_PROGRESS.value for a in actions):
            self.state["current_plan"]["status"] = "in_progress"

    def get_next_action(self) -> Optional[Dict]:
        """
        Get the next pending action with satisfied dependencies.

        Returns:
            Action dict or None
        """
        if not self.state["current_plan"]:
            return None

        completed = {
            a["id"] for a in self.state["current_plan"]["actions"]
            if a["status"] == ActionStatus.COMPLETE.value
        }

        for action in self.state["current_plan"]["actions"]:
            if action["status"] == ActionStatus.PENDING.value:
                if all(dep in completed for dep in action["dependencies"]):
                    return action

        return None

    def get_status(self) -> Dict:
        """
        Get current goal and plan status.

        Returns:
            Status dictionary
        """
        result = {
            "agent_id": self.agent_id,
            "current_goal": self.state["current_goal"],
            "current_plan": self.state["current_plan"]
        }

        # Calculate progress
        if self.state["current_goal"]:
            total_sg = len(self.state["current_goal"]["sub_goals"])
            if total_sg > 0:
                progress = sum(
                    sg["progress"] for sg in self.state["current_goal"]["sub_goals"]
                ) / total_sg
                self.state["current_goal"]["progress"] = progress

        if self.state["current_plan"]:
            total_actions = len(self.state["current_plan"]["actions"])
            if total_actions > 0:
                complete = sum(
                    1 for a in self.state["current_plan"]["actions"]
                    if a["status"] == ActionStatus.COMPLETE.value
                )
                result["plan_progress"] = complete / total_actions

        return result

    def complete_goal(self):
        """Mark current goal as complete."""
        if self.state["current_goal"]:
            self.state["current_goal"]["progress"] = 1.0
            self.state["completed_goals"].append(self.state["current_goal"])
            self.state["current_goal"] = None
            self._save_state()


def main():
    """CLI for goal tracking."""
    import argparse

    parser = argparse.ArgumentParser(description="Goal-Plan-Action tracking")
    parser.add_argument("--agent-id", required=True)
    parser.add_argument("--set-goal", help="Set current goal")
    parser.add_argument("--create-plan", help="Create plan with description")
    parser.add_argument("--add-action", action="append", help="Add action to plan")
    parser.add_argument("--update-action", help="Update action status")
    parser.add_argument("--status", action="store_true", help="Show status")
    parser.add_argument("--next-action", action="store_true", help="Show next action")
    parser.add_argument("--complete-goal", action="store_true", help="Mark goal complete")

    args = parser.parse_args()

    tracker = GoalTracker(args.agent_id)

    if args.set_goal:
        goal_id = tracker.set_goal(args.set_goal)
        print(f"Goal set: {goal_id}")

    elif args.create_plan and args.add_action:
        plan_id = tracker.create_plan(args.create_plan, args.add_action)
        print(f"Plan created: {plan_id}")

    elif args.update_action:
        tracker.update_action(args.update_action, ActionStatus.COMPLETE)
        print(f"Action completed: {args.update_action}")

    elif args.status:
        status = tracker.get_status()
        print(json.dumps(status, indent=2))

    elif args.next_action:
        action = tracker.get_next_action()
        if action:
            print(f"Next action: {action['description']}")
        else:
            print("No pending actions")

    elif args.complete_goal:
        tracker.complete_goal()
        print("Goal completed")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
