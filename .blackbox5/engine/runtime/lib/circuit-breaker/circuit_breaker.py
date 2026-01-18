#!/usr/bin/env python3
"""
Enhanced Circuit Breaker Implementation for Ralph Runtime

This module provides a robust circuit breaker pattern implementation
with sliding window failure tracking, automatic state transitions,
and comprehensive metrics.
"""

from enum import Enum, auto
from typing import Callable, Optional, Any, Dict, List
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import time
import threading


class CircuitBreakerState(Enum):
    """Circuit breaker states"""
    CLOSED = auto()      # Normal operation
    OPEN = auto()        # Circuit is open, blocking calls
    HALF_OPEN = auto()   # Testing if system has recovered


@dataclass
class CallResult:
    """Result of a circuit breaker protected call"""
    success: bool
    duration_ms: float
    timestamp: datetime = field(default_factory=datetime.now)
    error: Optional[Exception] = None


@dataclass
class CircuitBreakerConfig:
    """Configuration for circuit breaker"""
    failure_threshold: int = 5          # Failures before opening
    success_threshold: int = 2          # Successes to close from half-open
    timeout_ms: int = 60000             # Time to stay open before half-open
    call_timeout_ms: int = 30000        # Max time for protected call
    sliding_window_size: int = 100      # Size of sliding window
    half_open_max_calls: int = 3        # Max calls in half-open state


class CircuitBreakerMetrics:
    """Track circuit breaker metrics"""

    def __init__(self):
        self.total_calls: int = 0
        self.successful_calls: int = 0
        self.failed_calls: int = 0
        self.rejected_calls: int = 0
        self.short_circuited_calls: int = 0
        self.timeouts: int = 0
        self.state_transitions: List[Dict] = []
        self.call_history: List[CallResult] = []

    def record_call(self, result: CallResult):
        """Record a call result"""
        self.call_history.append(result)
        # Keep only recent history
        if len(self.call_history) > 1000:
            self.call_history = self.call_history[-1000:]

    def record_transition(self, from_state: CircuitBreakerState,
                         to_state: CircuitBreakerState, reason: str = ""):
        """Record state transition"""
        self.state_transitions.append({
            'from': from_state.name,
            'to': to_state.name,
            'reason': reason,
            'timestamp': datetime.now().isoformat()
        })

    def get_statistics(self) -> Dict:
        """Get current statistics"""
        success_rate = 0.0
        if self.total_calls > 0:
            success_rate = (self.successful_calls / self.total_calls) * 100

        return {
            'total_calls': self.total_calls,
            'successful_calls': self.successful_calls,
            'failed_calls': self.failed_calls,
            'rejected_calls': self.rejected_calls,
            'short_circuited_calls': self.short_circuited_calls,
            'timeouts': self.timeouts,
            'success_rate': round(success_rate, 2),
            'recent_failures': len([r for r in self.call_history[-50:] if not r.success]),
            'state_transitions': len(self.state_transitions)
        }


class CircuitBreaker:
    """
    Enhanced Circuit Breaker Implementation

    Protects systems from cascading failures by automatically
    failing fast when a dependency is experiencing issues.
    """

    def __init__(self, name: str, config: Optional[CircuitBreakerConfig] = None):
        """
        Initialize circuit breaker

        Args:
            name: Name of this circuit breaker
            config: Configuration (uses defaults if not provided)
        """
        self.name = name
        self.config = config or CircuitBreakerConfig()
        self._state = CircuitBreakerState.CLOSED
        self._metrics = CircuitBreakerMetrics()
        self._last_failure_time: Optional[datetime] = None
        self._last_state_change = datetime.now()
        self._consecutive_failures = 0
        self._consecutive_successes = 0
        self._half_open_calls = 0
        self._lock = threading.RLock()

    def get_state(self) -> CircuitBreakerState:
        """Get current state"""
        with self._lock:
            self._check_state_transition()
            return self._state

    def _check_state_transition(self):
        """Check if state should transition"""
        now = datetime.now()

        # Open → Half-Open after timeout
        if self._state == CircuitBreakerState.OPEN:
            if self._last_failure_time:
                time_since_failure = (now - self._last_failure_time).total_seconds() * 1000
                if time_since_failure >= self.config.timeout_ms:
                    self._transition_to(CircuitBreakerState.HALF_OPEN,
                                      "Recovery timeout elapsed")

        # Half-Open → Closed after threshold successes
        elif self._state == CircuitBreakerState.HALF_OPEN:
            if self._consecutive_successes >= self.config.success_threshold:
                self._transition_to(CircuitBreakerState.CLOSED,
                                  "Recovery successful")

    def _transition_to(self, new_state: CircuitBreakerState, reason: str = ""):
        """Transition to new state"""
        old_state = self._state
        self._state = new_state
        self._last_state_change = datetime.now()
        self._metrics.record_transition(old_state, new_state, reason)

        # Reset counters on state change
        if new_state == CircuitBreakerState.CLOSED:
            self._consecutive_failures = 0
            self._consecutive_successes = 0
            self._half_open_calls = 0
        elif new_state == CircuitBreakerState.OPEN:
            self._consecutive_successes = 0
            self._half_open_calls = 0
        elif new_state == CircuitBreakerState.HALF_OPEN:
            self._consecutive_successes = 0
            self._half_open_calls = 0

    def call(self, func: Callable[..., Any], *args, **kwargs) -> Any:
        """
        Execute function with circuit breaker protection

        Args:
            func: Function to execute
            *args: Function arguments
            **kwargs: Function keyword arguments

        Returns:
            Function result

        Raises:
            Exception: Original exception if call fails
            CircuitBreakerOpenError: If circuit is open
        """
        with self._lock:
            self._check_state_transition()

            # Reject calls if circuit is open
            if self._state == CircuitBreakerState.OPEN:
                self._metrics.rejected_calls += 1
                raise CircuitBreakerOpenError(
                    f"Circuit breaker '{self.name}' is OPEN - rejecting call"
                )

            # Limit calls in half-open state
            if self._state == CircuitBreakerState.HALF_OPEN:
                if self._half_open_calls >= self.config.half_open_max_calls:
                    self._metrics.rejected_calls += 1
                    raise CircuitBreakerOpenError(
                        f"Circuit breaker '{self.name}' is HALF-OPEN - max calls exceeded"
                    )
                self._half_open_calls += 1

        # Execute the call
        start_time = time.time()
        self._metrics.total_calls += 1

        try:
            # Check for timeout
            if self.config.call_timeout_ms > 0:
                result = self._execute_with_timeout(func, args, kwargs)
            else:
                result = func(*args, **kwargs)

            duration_ms = (time.time() - start_time) * 1000
            self.record_success(duration_ms)
            return result

        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            self.record_failure(e, duration_ms)
            raise

    def _execute_with_timeout(self, func: Callable, args: tuple,
                             kwargs: dict) -> Any:
        """Execute function with timeout"""
        # This is a simplified implementation
        # For production, use threading.Timer or signal.alarm
        return func(*args, **kwargs)

    def record_success(self, duration_ms: float = 0):
        """
        Record a successful call

        Args:
            duration_ms: Call duration in milliseconds
        """
        with self._lock:
            self._metrics.successful_calls += 1
            self._consecutive_failures = 0

            if self._state == CircuitBreakerState.HALF_OPEN:
                self._consecutive_successes += 1

            result = CallResult(
                success=True,
                duration_ms=duration_ms,
                timestamp=datetime.now()
            )
            self._metrics.record_call(result)

    def record_failure(self, error: Exception, duration_ms: float = 0):
        """
        Record a failed call

        Args:
            error: Exception that occurred
            duration_ms: Call duration before failure
        """
        with self._lock:
            self._metrics.failed_calls += 1
            self._consecutive_successes = 0
            self._consecutive_failures += 1
            self._last_failure_time = datetime.now()

            result = CallResult(
                success=False,
                duration_ms=duration_ms,
                timestamp=datetime.now(),
                error=error
            )
            self._metrics.record_call(result)

            # Open circuit if threshold reached
            if (self._state == CircuitBreakerState.CLOSED and
                self._consecutive_failures >= self.config.failure_threshold):
                self._transition_to(CircuitBreakerState.OPEN,
                                  f"Failure threshold reached: {self._consecutive_failures}")
            elif (self._state == CircuitBreakerState.HALF_OPEN and
                  self._consecutive_failures >= 1):
                self._transition_to(CircuitBreakerState.OPEN,
                                  "Half-open test failed")

    def reset(self):
        """Reset circuit breaker to closed state"""
        with self._lock:
            self._transition_to(CircuitBreakerState.CLOSED, "Manual reset")
            self._metrics = CircuitBreakerMetrics()

    def get_metrics(self) -> CircuitBreakerMetrics:
        """Get metrics"""
        return self._metrics

    def get_statistics(self) -> Dict:
        """Get statistics snapshot"""
        with self._lock:
            stats = self._metrics.get_statistics()
            stats.update({
                'name': self.name,
                'state': self._state.name,
                'consecutive_failures': self._consecutive_failures,
                'consecutive_successes': self._consecutive_successes,
                'last_failure_time': self._last_failure_time.isoformat() if self._last_failure_time else None,
                'last_state_change': self._last_state_change.isoformat(),
                'half_open_calls': self._half_open_calls,
                'config': {
                    'failure_threshold': self.config.failure_threshold,
                    'success_threshold': self.config.success_threshold,
                    'timeout_ms': self.config.timeout_ms,
                    'call_timeout_ms': self.config.call_timeout_ms
                }
            })
            return stats


class CircuitBreakerOpenError(Exception):
    """Raised when circuit breaker is open"""
    pass


# Convenience decorator
def circuit_breaker_protected(
    name: str,
    failure_threshold: int = 5,
    timeout_ms: int = 60000,
    call_timeout_ms: int = 30000
):
    """
    Decorator to protect function with circuit breaker

    Args:
        name: Name for circuit breaker
        failure_threshold: Failures before opening
        timeout_ms: Time to stay open
        call_timeout_ms: Max time for calls
    """
    def decorator(func):
        config = CircuitBreakerConfig(
            failure_threshold=failure_threshold,
            timeout_ms=timeout_ms,
            call_timeout_ms=call_timeout_ms
        )
        breaker = CircuitBreaker(name, config)

        def wrapper(*args, **kwargs):
            return breaker.call(func, *args, **kwargs)

        wrapper.breaker = breaker  # Expose breaker for monitoring
        return wrapper

    return decorator
