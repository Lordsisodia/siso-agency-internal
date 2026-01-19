#!/usr/bin/env python3
"""
Ralph Runtime - Main Runtime Orchestrator

The RalphRuntime class is the main orchestrator for autonomous agent execution.
It manages the complete lifecycle of plan execution with autonomous capabilities.
"""

import os
import json
import time
import logging
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Callable
from pathlib import Path

from .autonomous_agent import AutonomousAgent, AgentConfidence
from .decision_engine import DecisionEngine, DecisionContext, DecisionResult
from .progress_tracker import ProgressTracker, SessionProgress
from .error_recovery import ErrorRecovery, ErrorClassification, RecoveryStrategy


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class RuntimeState(Enum):
    """Runtime execution states"""
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    ERROR = "error"


class RalphRuntime:
    """
    Main runtime orchestrator for autonomous agent execution.

    This class manages the complete lifecycle of plan execution with
    autonomous capabilities including self-correction, progress monitoring,
    error recovery, and intelligent decision-making.
    """

    def __init__(
        self,
        max_retries: int = 3,
        confidence_threshold: float = 0.7,
        timeout_seconds: int = 300,
        session_timeout: int = 3600,
        human_intervention: str = "ask_first"
    ):
        """
        Initialize the Ralph Runtime.

        Args:
            max_retries: Maximum number of retry attempts for failed tasks
            confidence_threshold: Minimum confidence for autonomous execution
            timeout_seconds: Timeout for individual task execution
            session_timeout: Timeout for entire runtime session
            human_intervention: When to request human intervention
        """
        self.max_retries = max_retries
        self.confidence_threshold = confidence_threshold
        self.timeout_seconds = timeout_seconds
        self.session_timeout = session_timeout
        self.human_intervention = human_intervention

        # Initialize components
        self.agent = AutonomousAgent()
        self.decision_engine = DecisionEngine()
        self.progress_tracker = ProgressTracker()
        self.error_recovery = ErrorRecovery()

        # Runtime state
        self._state = RuntimeState.IDLE
        self._current_plan: Optional[str] = None
        self._current_task: Optional[str] = None
        self._execution_log: List[Dict] = []
        self._start_time: Optional[datetime] = None
        self._context_variables: Dict[str, Any] = {}

        # Callbacks
        self._on_progress_update: Optional[Callable] = None
        self._on_error: Optional[Callable] = None
        self._on_decision: Optional[Callable] = None
        self._on_complete: Optional[Callable] = None

    @property
    def state(self) -> RuntimeState:
        """Get current runtime state"""
        return self._state

    @property
    def is_running(self) -> bool:
        """Check if runtime is running"""
        return self._state == RuntimeState.RUNNING

    @property
    def execution_log(self) -> List[Dict]:
        """Get execution log"""
        return self._execution_log.copy()

    def execute_plan(
        self,
        plan_path: str,
        autonomous_mode: bool = True,
        human_intervention: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute a plan autonomously.

        Args:
            plan_path: Path to the plan directory
            autonomous_mode: Whether to run in fully autonomous mode
            human_intervention: Override default human intervention setting

        Returns:
            Execution result dictionary
        """
        logger.info(f"Starting plan execution: {plan_path}")

        # Set up execution
        self._state = RuntimeState.RUNNING
        self._current_plan = plan_path
        self._start_time = datetime.now()
        intervention = human_intervention or self.human_intervention

        # Initialize progress tracking
        session_id = self.progress_tracker.start_session(
            plan_name=Path(plan_path).name,
            autonomous_mode=autonomous_mode
        )

        try:
            # Load plan and tasks
            plan = self._load_plan(plan_path)
            tasks = self._load_tasks(plan_path)

            if not tasks:
                raise ValueError("No tasks found in plan")

            # Execute tasks
            results = []
            for task in tasks:
                if self._state == RuntimeState.PAUSED:
                    logger.info("Execution paused")
                    break

                result = self.run_task(
                    task=task,
                    autonomous_mode=autonomous_mode,
                    human_intervention=intervention
                )
                results.append(result)

                # Update progress
                self.progress_tracker.update_progress(
                    session_id=session_id,
                    task_id=task.get("id", ""),
                    status=result.get("status", "unknown"),
                    result=result
                )

            # Complete execution
            self._state = RuntimeState.COMPLETED
            final_result = {
                "status": "completed",
                "session_id": session_id,
                "tasks_completed": len(results),
                "tasks_total": len(tasks),
                "results": results,
                "duration": (datetime.now() - self._start_time).total_seconds()
            }

            logger.info(f"Plan execution completed: {final_result}")
            self._log_event("execution_complete", final_result)

            if self._on_complete:
                self._on_complete(final_result)

            return final_result

        except Exception as e:
            logger.error(f"Plan execution failed: {str(e)}")
            self._state = RuntimeState.ERROR
            error_result = {
                "status": "error",
                "error": str(e),
                "session_id": session_id
            }
            self._log_event("execution_error", error_result)
            return error_result

    def run_task(
        self,
        task: Dict[str, Any],
        autonomous_mode: bool = True,
        human_intervention: str = "ask_first"
    ) -> Dict[str, Any]:
        """
        Execute a single task.

        Args:
            task: Task dictionary with id, description, etc.
            autonomous_mode: Whether to run autonomously
            human_intervention: When to request human intervention

        Returns:
            Task execution result
        """
        task_id = task.get("id", "unknown")
        self._current_task = task_id

        logger.info(f"Executing task: {task_id}")
        self._log_event("task_start", {"task_id": task_id, "task": task})

        retry_count = 0
        while retry_count <= self.max_retries:
            try:
                # Plan next steps if autonomous
                if autonomous_mode:
                    next_steps = self.agent.plan_next_steps(task, self._context_variables)
                    logger.info(f"Planned steps: {next_steps}")

                # Evaluate completion status
                completion = self.agent.evaluate_completion(task, self._context_variables)
                confidence = completion.confidence

                # Check if human intervention is needed
                if self._should_request_intervention(confidence, human_intervention):
                    response = self._request_human_intervention(task, completion)
                    if response.get("abort", False):
                        return {"status": "aborted", "task_id": task_id, "reason": "human_aborted"}
                    # Update context with human feedback
                    self._context_variables.update(response.get("context_updates", {}))

                # Make execution decision
                decision = self.make_decision(task, self._context_variables)
                self._log_event("decision", {
                    "task_id": task_id,
                    "decision": decision.to_dict()
                })

                # Execute based on decision
                if decision.action == "execute":
                    result = self._execute_task_action(task)
                elif decision.action == "skip":
                    result = {"status": "skipped", "reason": decision.rationale}
                elif decision.action == "delegate":
                    result = self._delegate_task(task, decision.delegate_to)
                elif decision.action == "wait":
                    result = {"status": "waiting", "reason": decision.rationale}
                else:
                    result = {"status": "unknown", "reason": "Unknown action"}

                # Update context with result
                self._context_variables[f"task_{task_id}_result"] = result

                self._log_event("task_complete", {
                    "task_id": task_id,
                    "result": result,
                    "retry_count": retry_count
                })

                return result

            except Exception as e:
                logger.error(f"Task execution error (attempt {retry_count + 1}): {str(e)}")

                # Attempt error recovery
                error_info = self.error_recovery.detect_error(str(e))
                classification = self.error_recovery.classify_error(error_info)
                recovery = self.error_recovery.attempt_recovery(
                    classification,
                    retry_count,
                    self.max_retries
                )

                self._log_event("error_recovery", {
                    "task_id": task_id,
                    "error": str(e),
                    "classification": classification.to_dict(),
                    "recovery": recovery.to_dict()
                })

                if recovery.strategy == RecoveryStrategy.RETRY:
                    retry_count += 1
                    time.sleep(recovery.retry_delay or 1)
                    continue
                elif recovery.strategy == RecoveryStrategy.ESCALATE:
                    self._escalate_to_human(task, str(e), classification)
                    return {
                        "status": "error",
                        "task_id": task_id,
                        "error": str(e),
                        "escalated": True
                    }
                elif recovery.strategy == RecoveryStrategy.ABORT:
                    return {
                        "status": "error",
                        "task_id": task_id,
                        "error": str(e),
                        "aborted": True
                    }
                else:
                    # Skip or alternative
                    return {
                        "status": "skipped",
                        "task_id": task_id,
                        "error": str(e),
                        "recovery_strategy": recovery.strategy.value
                    }

        return {
            "status": "error",
            "task_id": task_id,
            "error": "Max retries exceeded"
        }

    def handle_agent_handoff(
        self,
        from_agent: str,
        to_agent: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Manage agent handoff during execution.

        Args:
            from_agent: Source agent identifier
            to_agent: Target agent identifier
            context: Current execution context

        Returns:
            Handoff result
        """
        logger.info(f"Agent handoff: {from_agent} -> {to_agent}")

        # Evaluate handoff decision
        decision_context = DecisionContext(
            current_agent=from_agent,
            target_agent=to_agent,
            context_variables=context,
            available_agents=[from_agent, to_agent]
        )

        decision = self.decision_engine.evaluate_context(decision_context)

        handoff_result = {
            "from_agent": from_agent,
            "to_agent": to_agent,
            "approved": decision.confidence >= self.confidence_threshold,
            "confidence": decision.confidence,
            "rationale": decision.rationale
        }

        # Update context with handoff info
        self._context_variables["last_handoff"] = handoff_result

        self._log_event("agent_handoff", handoff_result)

        return handoff_result

    def track_progress(self, session_id: str) -> SessionProgress:
        """
        Get current execution progress.

        Args:
            session_id: Session identifier

        Returns:
            Current progress information
        """
        return self.progress_tracker.get_status(session_id)

    def make_decision(
        self,
        task: Dict[str, Any],
        context: Dict[str, Any]
    ) -> DecisionResult:
        """
        Make execution decision using decision engine.

        Args:
            task: Current task
            context: Execution context

        Returns:
            Decision result
        """
        decision_context = DecisionContext(
            current_task=task.get("id", ""),
            context_variables=context,
            available_actions=["execute", "skip", "delegate", "wait"],
            risk_tolerance=0.5
        )

        decision = self.decision_engine.choose_action(decision_context)

        if self._on_decision:
            self._on_decision(decision)

        return decision

    def recover_from_error(
        self,
        error: Exception,
        context: Dict[str, Any]
    ) -> RecoveryStrategy:
        """
        Recover from execution error.

        Args:
            error: The error that occurred
            context: Current execution context

        Returns:
            Recovery strategy to use
        """
        error_info = self.error_recovery.detect_error(str(error))
        classification = self.error_recovery.classify_error(error_info)
        recovery = self.error_recovery.attempt_recovery(classification, 0, self.max_retries)

        return recovery.strategy

    def pause(self) -> bool:
        """Pause runtime execution"""
        if self._state == RuntimeState.RUNNING:
            self._state = RuntimeState.PAUSED
            self._log_event("runtime_paused", {})
            return True
        return False

    def resume(self) -> bool:
        """Resume paused runtime execution"""
        if self._state == RuntimeState.PAUSED:
            self._state = RuntimeState.RUNNING
            self._log_event("runtime_resumed", {})
            return True
        return False

    def stop(self) -> bool:
        """Stop runtime execution"""
        if self._state in [RuntimeState.RUNNING, RuntimeState.PAUSED]:
            self._state = RuntimeState.IDLE
            self._log_event("runtime_stopped", {})
            return True
        return False

    def set_context_variable(self, key: str, value: Any) -> None:
        """Set a context variable (Phase 1 integration)"""
        self._context_variables[key] = value
        logger.debug(f"Set context variable: {key} = {value}")

    def get_context_variable(self, key: str, default: Any = None) -> Any:
        """Get a context variable (Phase 1 integration)"""
        return self._context_variables.get(key, default)

    def get_all_context_variables(self) -> Dict[str, Any]:
        """Get all context variables"""
        return self._context_variables.copy()

    def set_progress_callback(self, callback: Callable) -> None:
        """Set callback for progress updates"""
        self._on_progress_update = callback

    def set_error_callback(self, callback: Callable) -> None:
        """Set callback for errors"""
        self._on_error = callback

    def set_decision_callback(self, callback: Callable) -> None:
        """Set callback for decisions"""
        self._on_decision = callback

    def set_complete_callback(self, callback: Callable) -> None:
        """Set callback for execution completion"""
        self._on_complete = callback

    def save_state(self, filepath: str) -> None:
        """Save runtime state to file"""
        state = {
            "state": self._state.value,
            "current_plan": self._current_plan,
            "current_task": self._current_task,
            "execution_log": self._execution_log,
            "context_variables": self._context_variables,
            "start_time": self._start_time.isoformat() if self._start_time else None
        }
        with open(filepath, 'w') as f:
            json.dump(state, f, indent=2)
        logger.info(f"Saved runtime state to: {filepath}")

    def load_state(self, filepath: str) -> None:
        """Load runtime state from file"""
        with open(filepath, 'r') as f:
            state = json.load(f)

        self._state = RuntimeState(state["state"])
        self._current_plan = state["current_plan"]
        self._current_task = state["current_task"]
        self._execution_log = state["execution_log"]
        self._context_variables = state["context_variables"]
        self._start_time = datetime.fromisoformat(state["start_time"]) if state["start_time"] else None

        logger.info(f"Loaded runtime state from: {filepath}")

    def _load_plan(self, plan_path: str) -> Dict[str, Any]:
        """Load plan configuration"""
        plan_file = Path(plan_path) / "plan.md"
        if not plan_file.exists():
            plan_file = Path(plan_path) / "README.md"

        if plan_file.exists():
            with open(plan_file, 'r') as f:
                content = f.read()
            return {"path": plan_path, "content": content}

        return {"path": plan_path}

    def _load_tasks(self, plan_path: str) -> List[Dict[str, Any]]:
        """Load tasks from plan"""
        tasks_file = Path(plan_path) / "work-queue.md"

        if tasks_file.exists():
            # Parse tasks from markdown
            tasks = []
            with open(tasks_file, 'r') as f:
                content = f.read()
                # Simple parsing - in production, use proper markdown parser
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if line.startswith('- [ ]'):
                        task = {
                            "id": f"task_{i}",
                            "description": line[5:].strip(),
                            "status": "pending"
                        }
                        tasks.append(task)
            return tasks

        # Return default task if no tasks file
        return [{
            "id": "default_task",
            "description": "Execute plan",
            "status": "pending"
        }]

    def _execute_task_action(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the actual task action"""
        # In production, this would call the actual agent/script
        # For now, simulate execution
        logger.info(f"Executing task action: {task.get('id')}")
        return {
            "status": "completed",
            "task_id": task.get("id"),
            "output": f"Executed: {task.get('description')}"
        }

    def _delegate_task(self, task: Dict[str, Any], delegate_to: str) -> Dict[str, Any]:
        """Delegate task to another agent"""
        logger.info(f"Delegating task {task.get('id')} to {delegate_to}")
        return {
            "status": "delegated",
            "task_id": task.get("id"),
            "delegate_to": delegate_to
        }

    def _should_request_intervention(
        self,
        confidence: float,
        intervention_mode: str
    ) -> bool:
        """Determine if human intervention should be requested"""
        if intervention_mode == "never":
            return False
        if intervention_mode == "ask_first":
            return True
        if intervention_mode == "on_low_confidence":
            return confidence < self.confidence_threshold
        return False

    def _request_human_intervention(
        self,
        task: Dict[str, Any],
        completion: AgentConfidence
    ) -> Dict[str, Any]:
        """Request human intervention"""
        logger.info(f"Requesting human intervention for task: {task.get('id')}")
        # In production, this would prompt the human
        # For now, return a default response
        return {
            "abort": False,
            "context_updates": {},
            "feedback": "Proceed with execution"
        }

    def _escalate_to_human(
        self,
        task: Dict[str, Any],
        error: str,
        classification: ErrorClassification
    ) -> None:
        """Escalate issue to human"""
        logger.warning(f"Escalating to human: {error}")
        if self._on_error:
            self._on_error({
                "task": task,
                "error": error,
                "classification": classification.to_dict()
            })

    def _log_event(self, event_type: str, data: Dict[str, Any]) -> None:
        """Log an execution event"""
        event = {
            "timestamp": datetime.now().isoformat(),
            "type": event_type,
            "data": data
        }
        self._execution_log.append(event)
        logger.debug(f"Event logged: {event_type}")
