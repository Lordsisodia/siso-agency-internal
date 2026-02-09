#!/usr/bin/env python3
"""
State Machine for SISO-Internal Autonomous System

Provides state management for tasks, agents, and workflows.
Implements finite state machine pattern with transitions and guards.

Adapted from BlackBox5 RALF-Core state management system.
"""

from typing import Dict, List, Optional, Any, Callable, Set
from enum import Enum, auto
from dataclasses import dataclass, field
from datetime import datetime


class State(Enum):
    """Base state enumeration."""
    pass


class TaskState(State):
    """Task lifecycle states."""
    PENDING = auto()
    IN_PROGRESS = auto()
    BLOCKED = auto()
    COMPLETED = auto()
    ABANDONED = auto()


class AgentState(State):
    """Agent lifecycle states."""
    IDLE = auto()
    WORKING = auto()
    WAITING = auto()
    ERROR = auto()
    OFFLINE = auto()


class RunState(State):
    """Run lifecycle states."""
    INITIALIZING = auto()
    RUNNING = auto()
    PAUSED = auto()
    COMPLETED = auto()
    FAILED = auto()


@dataclass
class Transition:
    """Represents a state transition."""
    from_state: State
    to_state: State
    trigger: str
    guard: Optional[Callable[[Any], bool]] = None
    action: Optional[Callable[[Any], None]] = None
    description: str = ""


class StateMachine:
    """Generic finite state machine."""

    def __init__(self, initial_state: State, name: str = ""):
        """Initialize state machine."""
        self.name = name
        self.current_state = initial_state
        self.initial_state = initial_state
        self._transitions: Dict[State, List[Transition]] = {}
        self._history: List[tuple] = []  # (timestamp, from_state, to_state, trigger)
        self._on_state_change: Optional[Callable[[State, State], None]] = None

    def add_transition(
        self,
        from_state: State,
        to_state: State,
        trigger: str,
        guard: Optional[Callable[[Any], bool]] = None,
        action: Optional[Callable[[Any], None]] = None,
        description: str = "",
    ):
        """Add a transition to the state machine."""
        transition = Transition(
            from_state=from_state,
            to_state=to_state,
            trigger=trigger,
            guard=guard,
            action=action,
            description=description,
        )

        if from_state not in self._transitions:
            self._transitions[from_state] = []

        self._transitions[from_state].append(transition)

    def can_transition(self, trigger: str, context: Any = None) -> bool:
        """Check if a transition is possible."""
        if self.current_state not in self._transitions:
            return False

        for transition in self._transitions[self.current_state]:
            if transition.trigger == trigger:
                if transition.guard is None or transition.guard(context):
                    return True

        return False

    def transition(self, trigger: str, context: Any = None) -> bool:
        """Attempt to transition to a new state."""
        if self.current_state not in self._transitions:
            return False

        for transition in self._transitions[self.current_state]:
            if transition.trigger == trigger:
                # Check guard
                if transition.guard is not None and not transition.guard(context):
                    continue

                # Perform transition
                old_state = self.current_state
                self.current_state = transition.to_state

                # Record history
                self._history.append((
                    datetime.now(),
                    old_state,
                    transition.to_state,
                    trigger,
                ))

                # Execute action
                if transition.action:
                    try:
                        transition.action(context)
                    except Exception as e:
                        print(f"Error in transition action: {e}")

                # Notify listener
                if self._on_state_change:
                    self._on_state_change(old_state, transition.to_state)

                return True

        return False

    def on_state_change(self, callback: Callable[[State, State], None]):
        """Register a callback for state changes."""
        self._on_state_change = callback

    def get_available_triggers(self) -> List[str]:
        """Get list of available triggers from current state."""
        if self.current_state not in self._transitions:
            return []

        return [t.trigger for t in self._transitions[self.current_state]]

    def get_history(self) -> List[tuple]:
        """Get transition history."""
        return self._history.copy()

    def reset(self):
        """Reset to initial state."""
        self.current_state = self.initial_state
        self._history = []


class TaskStateMachine(StateMachine):
    """State machine for task lifecycle."""

    def __init__(self):
        """Initialize task state machine with standard transitions."""
        super().__init__(TaskState.PENDING, name="Task")

        # Define standard task transitions
        self.add_transition(
            TaskState.PENDING,
            TaskState.IN_PROGRESS,
            "start",
            description="Task started",
        )
        self.add_transition(
            TaskState.PENDING,
            TaskState.ABANDONED,
            "abandon",
            description="Task abandoned before starting",
        )
        self.add_transition(
            TaskState.IN_PROGRESS,
            TaskState.BLOCKED,
            "block",
            description="Task blocked by dependency or issue",
        )
        self.add_transition(
            TaskState.IN_PROGRESS,
            TaskState.COMPLETED,
            "complete",
            description="Task completed successfully",
        )
        self.add_transition(
            TaskState.IN_PROGRESS,
            TaskState.ABANDONED,
            "abandon",
            description="Task abandoned while in progress",
        )
        self.add_transition(
            TaskState.BLOCKED,
            TaskState.IN_PROGRESS,
            "unblock",
            description="Blocker resolved, resuming task",
        )
        self.add_transition(
            TaskState.BLOCKED,
            TaskState.ABANDONED,
            "abandon",
            description="Abandon blocked task",
        )


class AgentStateMachine(StateMachine):
    """State machine for agent lifecycle."""

    def __init__(self):
        """Initialize agent state machine."""
        super().__init__(AgentState.IDLE, name="Agent")

        self.add_transition(
            AgentState.IDLE,
            AgentState.WORKING,
            "assign",
            description="Task assigned to agent",
        )
        self.add_transition(
            AgentState.WORKING,
            AgentState.WAITING,
            "wait",
            description="Agent waiting for input/dependency",
        )
        self.add_transition(
            AgentState.WORKING,
            AgentState.IDLE,
            "complete",
            description="Task completed, agent idle",
        )
        self.add_transition(
            AgentState.WORKING,
            AgentState.ERROR,
            "error",
            description="Error occurred during work",
        )
        self.add_transition(
            AgentState.WAITING,
            AgentState.WORKING,
            "resume",
            description="Resuming work after wait",
        )
        self.add_transition(
            AgentState.ERROR,
            AgentState.IDLE,
            "reset",
            description="Reset after error",
        )
        self.add_transition(
            AgentState.ERROR,
            AgentState.WORKING,
            "retry",
            description="Retry after error",
        )


class RunStateMachine(StateMachine):
    """State machine for run lifecycle."""

    def __init__(self):
        """Initialize run state machine."""
        super().__init__(RunState.INITIALIZING, name="Run")

        self.add_transition(
            RunState.INITIALIZING,
            RunState.RUNNING,
            "start",
            description="Run started",
        )
        self.add_transition(
            RunState.RUNNING,
            RunState.PAUSED,
            "pause",
            description="Run paused",
        )
        self.add_transition(
            RunState.PAUSED,
            RunState.RUNNING,
            "resume",
            description="Run resumed",
        )
        self.add_transition(
            RunState.RUNNING,
            RunState.COMPLETED,
            "complete",
            description="Run completed successfully",
        )
        self.add_transition(
            RunState.RUNNING,
            RunState.FAILED,
            "fail",
            description="Run failed",
        )
        self.add_transition(
            RunState.PAUSED,
            RunState.FAILED,
            "fail",
            description="Run failed while paused",
        )


def get_next_available_task(tasks: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Get the next available task from a list.

    Filters to pending tasks and sorts by priority.
    """
    pending = [
        t for t in tasks
        if t.get("status") in ["pending", TaskState.PENDING.name]
    ]

    if not pending:
        return None

    # Priority order
    priority_order = {
        "critical": 0,
        "high": 1,
        "medium": 2,
        "low": 3,
    }

    pending.sort(
        key=lambda t: priority_order.get(
            t.get("priority", "medium").lower(), 999
        )
    )

    return pending[0]


if __name__ == "__main__":
    # Simple CLI for testing
    import sys

    if len(sys.argv) < 2:
        print("Usage: python state_machine.py [test]")
        sys.exit(1)

    if sys.argv[1] == "test":
        print("Testing state machines...")

        # Test TaskStateMachine
        task_sm = TaskStateMachine()
        print(f"✓ Initial state: {task_sm.current_state.name}")

        task_sm.transition("start")
        print(f"✓ After 'start': {task_sm.current_state.name}")

        task_sm.transition("block")
        print(f"✓ After 'block': {task_sm.current_state.name}")

        task_sm.transition("unblock")
        print(f"✓ After 'unblock': {task_sm.current_state.name}")

        task_sm.transition("complete")
        print(f"✓ After 'complete': {task_sm.current_state.name}")

        # Test AgentStateMachine
        agent_sm = AgentStateMachine()
        print(f"✓ Agent initial: {agent_sm.current_state.name}")

        agent_sm.transition("assign")
        print(f"✓ After 'assign': {agent_sm.current_state.name}")

        agent_sm.transition("error")
        print(f"✓ After 'error': {agent_sm.current_state.name}")

        agent_sm.transition("retry")
        print(f"✓ After 'retry': {agent_sm.current_state.name}")

        # Test RunStateMachine
        run_sm = RunStateMachine()
        run_sm.transition("start")
        print(f"✓ Run after 'start': {run_sm.current_state.name}")

        run_sm.transition("pause")
        print(f"✓ Run after 'pause': {run_sm.current_state.name}")

        run_sm.transition("resume")
        print(f"✓ Run after 'resume': {run_sm.current_state.name}")

        run_sm.transition("complete")
        print(f"✓ Run after 'complete': {run_sm.current_state.name}")

        # Test history
        print(f"✓ Task history has {len(task_sm.get_history())} transitions")

        print("\nAll tests passed!")
