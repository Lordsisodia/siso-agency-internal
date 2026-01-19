"""
Kill Switch Implementation for BlackBox 5

Provides emergency shutdown capability for the multi-agent system.
This is a critical safety feature that allows immediate termination
of all agent operations in case of emergencies.

Features:
- Immediate halt of all agent operations
- Graceful shutdown with cleanup
- System-wide emergency broadcast
- Persistent state tracking
- Integration with circuit breakers
"""

import logging
import threading
import time
import signal
import os
from datetime import datetime
from typing import Optional, Callable, Dict, Any
from enum import Enum
from pathlib import Path

# Configure logging
logger = logging.getLogger(__name__)


class KillSwitchState(Enum):
    """Kill switch states"""
    ACTIVE = "active"           # System running normally
    ARMED = "armed"             # Ready to trigger
    TRIGGERED = "triggered"     # Emergency shutdown activated
    RECOVERING = "recovering"   # Recovering from shutdown


class KillSwitchReason(Enum):
    """Reasons for triggering kill switch"""
    MANUAL = "manual"                   # Manual activation
    CRITICAL_FAILURE = "critical_failure"  # Critical system failure
    SAFETY_VIOLATION = "safety_violation"  # Safety constraint violated
    RESOURCE_EXHAUSTION = "resource_exhaustion"  # Out of resources
    MALICE_DETECTED = "malice_detected"  # Malicious activity detected
    CIRCUIT_BREAKER = "circuit_breaker"  # Too many circuits open
    USER_REQUEST = "user_request"       # User requested shutdown


class KillSwitch:
    """
    Emergency shutdown system for BlackBox 5.

    The kill switch provides immediate termination of all agent operations
    when critical issues are detected. It can be triggered manually or
    automatically by safety systems.

    Example:
        ```python
        # Get global kill switch
        ks = get_kill_switch()

        # Check if system is operational
        if ks.is_operational():
            # Proceed with operations
            pass

        # Trigger emergency shutdown
        ks.trigger(KillSwitchReason.MANUAL, "User requested shutdown")

        # Later recover
        ks.recover()
        ```

    Attributes:
        state: Current kill switch state
        trigger_time: When the kill switch was triggered
        trigger_reason: Reason for triggering
        trigger_count: Number of times triggered
    """

    _instance: Optional['KillSwitch'] = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        # Only initialize once
        if hasattr(self, '_initialized'):
            return
        self._initialized = True

        # State
        self._state = KillSwitchState.ACTIVE
        self._trigger_time: Optional[datetime] = None
        self._trigger_reason: Optional[KillSwitchReason] = None
        self._trigger_message: Optional[str] = None
        self._trigger_count = 0
        self._recovery_count = 0

        # Callbacks
        self._on_trigger_callbacks: list[Callable] = []
        self._on_recover_callbacks: list[Callable] = []

        # State file
        self._state_file = Path(".blackbox5/2-engine/01-core/safety/.kill_switch_state.json")

        # Load previous state if exists
        self._load_state()

        # Register signal handlers
        self._register_signal_handlers()

        logger.info("Kill Switch initialized: %s", self._state.value)

    def _register_signal_handlers(self):
        """Register signal handlers for SIGTERM and SIGINT"""
        try:
            signal.signal(signal.SIGTERM, self._signal_handler)
            signal.signal(signal.SIGINT, self._signal_handler)
            logger.debug("Registered signal handlers for kill switch")
        except Exception as e:
            logger.warning(f"Could not register signal handlers: {e}")

    def _signal_handler(self, signum, frame):
        """Handle system signals"""
        logger.info(f"Received signal {signum}, triggering kill switch")
        self.trigger(
            KillSwitchReason.USER_REQUEST,
            f"System signal received: {signum}"
        )

    @property
    def state(self) -> KillSwitchState:
        """Current kill switch state"""
        return self._state

    @property
    def trigger_time(self) -> Optional[datetime]:
        """When the kill switch was triggered"""
        return self._trigger_time

    @property
    def trigger_reason(self) -> Optional[KillSwitchReason]:
        """Reason for triggering"""
        return self._trigger_reason

    @property
    def trigger_message(self) -> Optional[str]:
        """Detailed message about trigger"""
        return self._trigger_message

    @property
    def trigger_count(self) -> int:
        """Number of times triggered"""
        return self._trigger_count

    def is_operational(self) -> bool:
        """Check if system is operational (not killed)"""
        return self._state == KillSwitchState.ACTIVE

    def is_triggered(self) -> bool:
        """Check if kill switch has been triggered"""
        return self._state == KillSwitchState.TRIGGERED

    def is_recovering(self) -> bool:
        """Check if system is recovering"""
        return self._state == KillSwitchState.RECOVERING

    def trigger(
        self,
        reason: KillSwitchReason,
        message: str = "",
        source: str = "unknown"
    ) -> bool:
        """
        Trigger the kill switch (emergency shutdown).

        Args:
            reason: Why the kill switch is being triggered
            message: Additional details about the trigger
            source: What component triggered it

        Returns:
            True if successfully triggered, False otherwise

        Example:
            ```python
            ks.trigger(
                KillSwitchReason.SAFETY_VIOLATION,
                "Harmful content detected",
                source="constitutional_classifier"
            )
            ```
        """
        with self._lock:
            # Already triggered
            if self._state == KillSwitchState.TRIGGERED:
                logger.warning("Kill switch already triggered")
                return False

            # Trigger the kill switch
            logger.critical(
                f"KILL SWITCH TRIGGERED: {reason.value} - {message} "
                f"(from: {source})"
            )

            self._state = KillSwitchState.TRIGGERED
            self._trigger_time = datetime.now()
            self._trigger_reason = reason
            self._trigger_message = message
            self._trigger_count += 1

            # Save state
            self._save_state()

            # Execute callbacks
            for callback in self._on_trigger_callbacks:
                try:
                    callback(self, reason, message, source)
                except Exception as e:
                    logger.error(f"Error in trigger callback: {e}")

            # Broadcast to system
            self._broadcast_trigger(reason, message, source)

            return True

    def recover(self, message: str = "") -> bool:
        """
        Recover from kill switch and return to normal operation.

        Args:
            message: Reason for recovery

        Returns:
            True if successfully recovered, False otherwise

        Example:
            ```python
            ks.recover("Issue resolved, resuming operations")
            ```
        """
        with self._lock:
            if self._state != KillSwitchState.TRIGGERED:
                logger.warning("Cannot recover: kill switch not triggered")
                return False

            logger.info(f"Recovering from kill switch: {message}")

            self._state = KillSwitchState.ACTIVE
            self._recovery_count += 1

            # Clear trigger info
            self._trigger_time = None
            self._trigger_reason = None
            self._trigger_message = None

            # Save state
            self._save_state()

            # Execute callbacks
            for callback in self._on_recover_callbacks:
                try:
                    callback(self, message)
                except Exception as e:
                    logger.error(f"Error in recover callback: {e}")

            # Broadcast to system
            self._broadcast_recovery(message)

            return True

    def on_trigger(self, callback: Callable):
        """Register callback for when kill switch is triggered"""
        self._on_trigger_callbacks.append(callback)

    def on_recover(self, callback: Callable):
        """Register callback for when system recovers"""
        self._on_recover_callbacks.append(callback)

    def _broadcast_trigger(self, reason: KillSwitchReason, message: str, source: str):
        """Broadcast kill switch trigger to system"""
        try:
            # Try to import event bus
            from ..communication.event_bus import get_event_bus

            event_bus = get_event_bus()
            event_bus.publish(
                "safety.kill_switch.triggered",
                {
                    "reason": reason.value,
                    "message": message,
                    "source": source,
                    "timestamp": datetime.now().isoformat(),
                }
            )
            logger.debug("Broadcast kill switch trigger to event bus")
        except Exception as e:
            logger.debug(f"Could not broadcast trigger: {e}")

    def _broadcast_recovery(self, message: str):
        """Broadcast recovery to system"""
        try:
            from ..communication.event_bus import get_event_bus

            event_bus = get_event_bus()
            event_bus.publish(
                "safety.kill_switch.recovered",
                {
                    "message": message,
                    "timestamp": datetime.now().isoformat(),
                }
            )
            logger.debug("Broadcast recovery to event bus")
        except Exception as e:
            logger.debug(f"Could not broadcast recovery: {e}")

    def _save_state(self):
        """Save kill switch state to file"""
        try:
            self._state_file.parent.mkdir(parents=True, exist_ok=True)
            import json
            state_data = {
                "state": self._state.value,
                "trigger_time": self._trigger_time.isoformat() if self._trigger_time else None,
                "trigger_reason": self._trigger_reason.value if self._trigger_reason else None,
                "trigger_message": self._trigger_message,
                "trigger_count": self._trigger_count,
                "recovery_count": self._recovery_count,
                "last_updated": datetime.now().isoformat(),
            }
            with open(self._state_file, 'w') as f:
                json.dump(state_data, f, indent=2)
            logger.debug(f"Saved kill switch state to {self._state_file}")
        except Exception as e:
            logger.error(f"Could not save kill switch state: {e}")

    def _load_state(self):
        """Load kill switch state from file"""
        try:
            if not self._state_file.exists():
                return

            import json
            with open(self._state_file, 'r') as f:
                state_data = json.load(f)

            # Restore state
            self._state = KillSwitchState(state_data["state"])
            self._trigger_count = state_data.get("trigger_count", 0)
            self._recovery_count = state_data.get("recovery_count", 0)

            # If was triggered, keep it triggered
            if self._state == KillSwitchState.TRIGGERED:
                logger.warning("Kill switch was triggered, recovering manually required")

            logger.debug(f"Loaded kill switch state: {self._state.value}")
        except Exception as e:
            logger.warning(f"Could not load kill switch state: {e}")

    def reset(self) -> bool:
        """
        Force reset of kill switch (admin only).

        Returns:
            True if successfully reset
        """
        with self._lock:
            logger.warning("Force resetting kill switch")
            self._state = KillSwitchState.ACTIVE
            self._trigger_time = None
            self._trigger_reason = None
            self._trigger_message = None
            self._save_state()
            return True

    def get_status(self) -> Dict[str, Any]:
        """
        Get current kill switch status.

        Returns:
            Dictionary with current status
        """
        return {
            "state": self._state.value,
            "operational": self.is_operational(),
            "triggered": self.is_triggered(),
            "trigger_time": self._trigger_time.isoformat() if self._trigger_time else None,
            "trigger_reason": self._trigger_reason.value if self._trigger_reason else None,
            "trigger_message": self._trigger_message,
            "trigger_count": self._trigger_count,
            "recovery_count": self._recovery_count,
        }


# Global singleton
_kill_switch: Optional[KillSwitch] = None
_kill_switch_lock = threading.Lock()


def get_kill_switch() -> KillSwitch:
    """
    Get the global kill switch instance.

    Returns:
        The global KillSwitch singleton

    Example:
        ```python
        ks = get_kill_switch()
        if ks.is_operational():
            # System is safe to use
            pass
        ```
    """
    global _kill_switch
    if _kill_switch is None:
        with _kill_switch_lock:
            if _kill_switch is None:
                _kill_switch = KillSwitch()
    return _kill_switch


def activate_emergency_shutdown(
    reason: KillSwitchReason = KillSwitchReason.MANUAL,
    message: str = "",
    source: str = "manual"
) -> bool:
    """
    Convenience function to activate emergency shutdown.

    Args:
        reason: Why the shutdown is being activated
        message: Additional details
        source: What triggered it

    Returns:
        True if successfully activated

    Example:
        ```python
        # Emergency shutdown
        activate_emergency_shutdown(
            KillSwitchReason.SAFETY_VIOLATION,
            "Malicious activity detected"
        )
        ```
    """
    ks = get_kill_switch()
    return ks.trigger(reason, message, source)


# Decorator for checking kill switch
def require_operational(func):
    """
    Decorator that checks if kill switch is operational before executing.

    Example:
        ```python
        @require_operational
        def sensitive_operation():
            # This won't run if kill switch is triggered
            pass
        ```
    """
    def wrapper(*args, **kwargs):
        ks = get_kill_switch()
        if not ks.is_operational():
            raise RuntimeError(
                f"Cannot execute {func.__name__}: kill switch has been triggered. "
                f"Reason: {ks.trigger_reason.value if ks.trigger_reason else 'unknown'}"
            )
        return func(*args, **kwargs)
    return wrapper


# Context manager for kill switch checking
class KillSwitchGuard:
    """
    Context manager that ensures kill switch is operational.

    Example:
        ```python
        with KillSwitchGuard():
            # This code will only run if kill switch is operational
            sensitive_operation()
        ```
    """

    def __init__(self, auto_recover: bool = False):
        self.auto_recover = auto_recover
        self.was_operational = False

    def __enter__(self):
        ks = get_kill_switch()
        self.was_operational = ks.is_operational()
        if not self.was_operational:
            raise RuntimeError(
                f"Kill switch is triggered: {ks.trigger_reason.value}"
            )
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        return False
