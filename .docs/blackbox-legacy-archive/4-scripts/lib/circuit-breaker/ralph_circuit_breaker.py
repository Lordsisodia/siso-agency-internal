#!/usr/bin/env python3
"""
Ralph Runtime Circuit Breaker Integration

This module provides Ralph-specific circuit breaker functionality,
including agent monitoring, failsafe detection, and autonomous execution control.
"""

from typing import Callable, Optional, Dict, Any, List
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum, auto
import json
import threading

from circuit_breaker import (
    CircuitBreaker,
    CircuitBreakerState,
    CircuitBreakerConfig,
    CircuitBreakerOpenError
)
from failsafe_detector import FailsafeDetector, FailsafeCondition


class AgentStatus(Enum):
    """Agent execution status"""
    RUNNING = auto()
    PAUSED = auto()
    STOPPED = auto()
    RECOVERING = auto()
    ESCALATED = auto()


@dataclass
class AgentExecutionContext:
    """Context for agent execution"""
    agent_id: str
    agent_name: str
    session_id: str
    task_id: Optional[str] = None
    start_time: datetime = field(default_factory=datetime.now)
    handoff_count: int = 0
    confidence: float = 1.0
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RalphCircuitBreakerConfig:
    """Configuration for Ralph circuit breaker"""
    # Circuit breaker settings
    agent_failure_threshold: int = 3          # Agent failures before pause
    handoff_threshold: int = 5                # Handoffs before escalation
    low_confidence_threshold: float = 0.3     # Confidence threshold for pause
    stuck_task_threshold: int = 10            # Iterations before stuck

    # Recovery settings
    auto_resume_enabled: bool = True          # Auto-resume after recovery
    auto_resume_delay_ms: int = 30000         # Delay before auto-resume
    max_recovery_attempts: int = 3            # Max recovery attempts

    # Failsafe settings
    cpu_threshold: float = 90.0               # CPU % threshold
    memory_threshold: float = 90.0            # Memory % threshold
    disk_threshold: float = 90.0              # Disk % threshold

    # Escalation
    escalation_timeout_ms: int = 120000       # Time before human escalation


class RalphCircuitBreaker:
    """
    Ralph Runtime Circuit Breaker

    Monitors and protects autonomous agent execution,
    detecting failures and triggering appropriate recovery actions.
    """

    def __init__(self, config: Optional[RalphCircuitBreakerConfig] = None):
        """
        Initialize Ralph circuit breaker

        Args:
            config: Configuration (uses defaults if not provided)
        """
        self.config = config or RalphCircuitBreakerConfig()
        self._agent_circuit_breakers: Dict[str, CircuitBreaker] = {}
        self._failsafe_detector = FailsafeDetector(self.config)
        self._agent_status: Dict[str, AgentStatus] = {}
        self._execution_contexts: Dict[str, AgentExecutionContext] = {}
        self._pause_conditions: Dict[str, List[str]] = {}
        self._recovery_attempts: Dict[str, int] = {}
        self._last_pause_time: Dict[str, datetime] = {}
        self._lock = threading.RLock()

    def monitor_agent(self, context: AgentExecutionContext) -> None:
        """
        Start monitoring an agent

        Args:
            context: Agent execution context
        """
        with self._lock:
            agent_id = context.agent_id

            # Create circuit breaker for this agent
            if agent_id not in self._agent_circuit_breakers:
                cb_config = CircuitBreakerConfig(
                    failure_threshold=self.config.agent_failure_threshold,
                    timeout_ms=60000,
                    call_timeout_ms=120000
                )
                self._agent_circuit_breakers[agent_id] = CircuitBreaker(
                    f"agent-{agent_id}", cb_config
                )

            # Initialize status
            self._agent_status[agent_id] = AgentStatus.RUNNING
            self._execution_contexts[agent_id] = context
            self._recovery_attempts[agent_id] = 0

    def execute_agent(
        self,
        agent_id: str,
        func: Callable[..., Any],
        *args,
        **kwargs
    ) -> Any:
        """
        Execute agent function with circuit breaker protection

        Args:
            agent_id: Agent identifier
            func: Function to execute
            *args: Function arguments
            **kwargs: Function keyword arguments

        Returns:
            Function result

        Raises:
            CircuitBreakerOpenError: If agent circuit is open
            FailsafeTriggeredError: If failsafe condition detected
        """
        with self._lock:
            # Check if agent exists
            if agent_id not in self._agent_circuit_breakers:
                raise ValueError(f"Agent {agent_id} not being monitored")

            # Check if agent is paused
            if self._agent_status[agent_id] != AgentStatus.RUNNING:
                raise AgentPausedError(
                    f"Agent {agent_id} is {self._agent_status[agent_id].name}"
                )

        # Check failsafes before execution
        failsafe_conditions = self._failsafe_detector.check_all()

        if failsafe_conditions:
            self._handle_failsafe(agent_id, failsafe_conditions)
            raise FailsafeTriggeredError(
                f"Failsafe conditions detected: {[c.message for c in failsafe_conditions]}"
            )

        # Execute with circuit breaker protection
        breaker = self._agent_circuit_breakers[agent_id]

        try:
            result = breaker.call(func, *args, **kwargs)
            self._record_agent_success(agent_id)
            return result

        except CircuitBreakerOpenError:
            self._handle_circuit_open(agent_id)
            raise

        except Exception as e:
            self._record_agent_failure(agent_id, e)
            raise

    def detect_failsafe(self, agent_id: str) -> List[FailsafeCondition]:
        """
        Check for failsafe conditions

        Args:
            agent_id: Agent to check

        Returns:
            List of triggered failsafe conditions
        """
        with self._lock:
            context = self._execution_contexts.get(agent_id)
            if not context:
                return []

        # Check all failsafe conditions
        conditions = self._failsafe_detector.check_all()

        # Add agent-specific checks
        if context:
            # Check for handoff loops
            if context.handoff_count >= self.config.handoff_threshold:
                conditions.append(FailsafeCondition(
                    condition_type="handoff_loop",
                    severity="high",
                    message=f"Excessive handoffs detected: {context.handoff_count}",
                    threshold=self.config.handoff_threshold,
                    current_value=context.handoff_count
                ))

            # Check for low confidence
            if context.confidence < self.config.low_confidence_threshold:
                conditions.append(FailsafeCondition(
                    condition_type="low_confidence",
                    severity="medium",
                    message=f"Low confidence detected: {context.confidence}",
                    threshold=self.config.low_confidence_threshold,
                    current_value=context.confidence
                ))

        return conditions

    def trigger_pause(
        self,
        agent_id: str,
        reason: str,
        auto_resume: bool = None
    ) -> None:
        """
        Pause agent execution

        Args:
            agent_id: Agent to pause
            reason: Reason for pause
            auto_resume: Whether to auto-resume (uses config default if None)
        """
        with self._lock:
            if agent_id not in self._agent_status:
                return

            self._agent_status[agent_id] = AgentStatus.PAUSED
            self._last_pause_time[agent_id] = datetime.now()

            if reason not in self._pause_conditions.get(agent_id, []):
                if agent_id not in self._pause_conditions:
                    self._pause_conditions[agent_id] = []
                self._pause_conditions[agent_id].append(reason)

            # Schedule auto-resume if enabled
            if auto_resume is None:
                auto_resume = self.config.auto_resume_enabled

            if auto_resume:
                self._schedule_auto_resume(agent_id)

    def auto_resume(self, agent_id: str) -> bool:
        """
        Attempt to auto-resume paused agent

        Args:
            agent_id: Agent to resume

        Returns:
            True if resumed, False otherwise
        """
        with self._lock:
            # Check if paused
            if self._agent_status.get(agent_id) != AgentStatus.PAUSED:
                return False

            # Check failsafes
            failsafe_conditions = self.detect_failsafe(agent_id)
            if failsafe_conditions:
                # Still unsafe, don't resume
                return False

            # Check circuit breaker state
            breaker = self._agent_circuit_breakers.get(agent_id)
            if breaker and breaker.get_state() == CircuitBreakerState.OPEN:
                # Circuit still open, don't resume
                return False

            # Safe to resume
            self._agent_status[agent_id] = AgentStatus.RUNNING
            self._pause_conditions[agent_id] = []
            return True

    def _handle_circuit_open(self, agent_id: str) -> None:
        """Handle circuit breaker open state"""
        with self._lock:
            self.trigger_pause(
                agent_id,
                "Circuit breaker open - too many failures",
                auto_resume=True
            )

    def _handle_failsafe(
        self,
        agent_id: str,
        conditions: List[FailsafeCondition]
    ) -> None:
        """Handle failsafe conditions"""
        with self._lock:
            # Check severity
            high_severity = any(c.severity == "high" for c in conditions)

            if high_severity:
                # High severity - escalate
                self._agent_status[agent_id] = AgentStatus.ESCALATED
                self.trigger_pause(
                    agent_id,
                    f"Failsafe triggered - {[c.message for c in conditions]}",
                    auto_resume=False
                )
            else:
                # Medium/low severity - pause with auto-resume
                self.trigger_pause(
                    agent_id,
                    f"Failsafe warning - {[c.message for c in conditions]}",
                    auto_resume=True
                )

    def _record_agent_success(self, agent_id: str) -> None:
        """Record successful agent execution"""
        with self._lock:
            breaker = self._agent_circuit_breakers.get(agent_id)
            if breaker:
                breaker.record_success()

            # Reset recovery attempts on success
            if agent_id in self._recovery_attempts:
                self._recovery_attempts[agent_id] = 0

    def _record_agent_failure(self, agent_id: str, error: Exception) -> None:
        """Record failed agent execution"""
        with self._lock:
            breaker = self._agent_circuit_breakers.get(agent_id)
            if breaker:
                breaker.record_failure(error)

    def _schedule_auto_resume(self, agent_id: str) -> None:
        """Schedule auto-resume for paused agent"""
        # This would typically use a background task or timer
        # For now, it's a placeholder that would be called by external scheduler
        pass

    def update_context(
        self,
        agent_id: str,
        **updates
    ) -> None:
        """
        Update agent execution context

        Args:
            agent_id: Agent to update
            **updates: Context updates
        """
        with self._lock:
            if agent_id in self._execution_contexts:
                context = self._execution_contexts[agent_id]
                for key, value in updates.items():
                    if hasattr(context, key):
                        setattr(context, key, value)

    def get_agent_status(self, agent_id: str) -> Dict[str, Any]:
        """
        Get agent status and metrics

        Args:
            agent_id: Agent to query

        Returns:
            Status information
        """
        with self._lock:
            status = {
                'agent_id': agent_id,
                'status': self._agent_status.get(agent_id, AgentStatus.STOPPED).name,
                'pause_conditions': self._pause_conditions.get(agent_id, []),
                'recovery_attempts': self._recovery_attempts.get(agent_id, 0),
                'last_pause_time': self._last_pause_time.get(agent_id),
            }

            # Add circuit breaker info
            if agent_id in self._agent_circuit_breakers:
                breaker = self._agent_circuit_breakers[agent_id]
                status['circuit_breaker'] = breaker.get_statistics()

            # Add context info
            if agent_id in self._execution_contexts:
                context = self._execution_contexts[agent_id]
                status['context'] = {
                    'agent_name': context.agent_name,
                    'session_id': context.session_id,
                    'task_id': context.task_id,
                    'handoff_count': context.handoff_count,
                    'confidence': context.confidence,
                }

            return status

    def get_all_status(self) -> Dict[str, Dict]:
        """Get status of all monitored agents"""
        with self._lock:
            return {
                agent_id: self.get_agent_status(agent_id)
                for agent_id in self._agent_circuit_breakers.keys()
            }

    def reset_agent(self, agent_id: str) -> None:
        """
        Reset agent circuit breaker

        Args:
            agent_id: Agent to reset
        """
        with self._lock:
            if agent_id in self._agent_circuit_breakers:
                self._agent_circuit_breakers[agent_id].reset()
                self._agent_status[agent_id] = AgentStatus.RUNNING
                self._pause_conditions[agent_id] = []
                self._recovery_attempts[agent_id] = 0


class AgentPausedError(Exception):
    """Raised when trying to execute paused agent"""
    pass


class FailsafeTriggeredError(Exception):
    """Raised when failsafe condition is triggered"""
    pass
