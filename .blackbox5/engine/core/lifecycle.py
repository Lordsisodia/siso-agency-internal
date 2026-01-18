"""
Black Box 5 Engine - Lifecycle Manager

Manages engine startup, shutdown, and state transitions.
Handles graceful shutdown with proper cleanup.
"""

import asyncio
import signal
from typing import Callable, Dict, List, Optional, Set
from enum import Enum
from datetime import datetime
import logging

logger = logging.getLogger("LifecycleManager")


class LifecycleState(Enum):
    """Engine lifecycle states"""
    CREATED = "created"
    INITIALIZING = "initializing"
    STARTING = "starting"
    RUNNING = "running"
    STOPPING = "stopping"
    STOPPED = "stopped"
    ERROR = "error"


class LifecycleEvent:
    """Represents a lifecycle event"""

    def __init__(self, state: LifecycleState, timestamp: datetime, error: Optional[Exception] = None):
        self.state = state
        self.timestamp = timestamp
        self.error = error


class LifecycleManager:
    """
    Manages engine lifecycle from initialization to shutdown.

    Features:
    - State transitions with validation
    - Graceful shutdown with signals
    - Lifecycle hooks (before/after state changes)
    - Shutdown timeout handling
    - Multiple shutdown phases
    """

    def __init__(self):
        self._state = LifecycleState.CREATED
        self._events: List[LifecycleEvent] = []
        self._hooks: Dict[LifecycleState, List[Callable]] = {
            state: [] for state in LifecycleState
        }
        self._shutdown_event = asyncio.Event()
        self._shutdown_tasks: Set[asyncio.Task] = set()
        self._shutdown_timeout = 30  # seconds

    @property
    def state(self) -> LifecycleState:
        """Current lifecycle state"""
        return self._state

    @property
    def is_running(self) -> bool:
        """Whether the engine is running"""
        return self._state == LifecycleState.RUNNING

    @property
    def is_shutting_down(self) -> bool:
        """Whether the engine is shutting down"""
        return self._state in (LifecycleState.STOPPING, LifecycleState.STOPPED)

    def register_hook(
        self,
        state: LifecycleState,
        hook: Callable,
        before: bool = True
    ) -> None:
        """
        Register a lifecycle hook.

        Args:
            state: The state to hook onto
            hook: Callable to execute
            before: If True, run before state change; if False, run after
        """
        # Store hook with timing indicator
        hook_entry = {"func": hook, "before": before}
        self._hooks[state].append(hook_entry)
        logger.debug(f"Registered {'pre' if before else 'post'} hook for {state.value}")

    async def transition_to(self, new_state: LifecycleState) -> bool:
        """
        Transition to a new lifecycle state.

        Args:
            new_state: Target state

        Returns:
            True if transition successful, False otherwise
        """
        # Validate transition
        if not self._is_valid_transition(self._state, new_state):
            logger.error(
                f"Invalid state transition: {self._state.value} -> {new_state.value}"
            )
            return False

        # Run pre-hooks
        await self._run_hooks(new_state, before=True)

        # Update state
        old_state = self._state
        self._state = new_state

        logger.info(f"State transition: {old_state.value} -> {new_state.value}")

        # Record event
        self._events.append(LifecycleEvent(new_state, datetime.now()))

        # Run post-hooks
        await self._run_hooks(new_state, before=False)

        return True

    def _is_valid_transition(
        self,
        from_state: LifecycleState,
        to_state: LifecycleState
    ) -> bool:
        """Check if a state transition is valid"""
        valid_transitions = {
            LifecycleState.CREATED: {
                LifecycleState.INITIALIZING,
                LifecycleState.ERROR
            },
            LifecycleState.INITIALIZING: {
                LifecycleState.STARTING,
                LifecycleState.ERROR
            },
            LifecycleState.STARTING: {
                LifecycleState.RUNNING,
                LifecycleState.ERROR
            },
            LifecycleState.RUNNING: {
                LifecycleState.STOPPING,
                LifecycleState.ERROR
            },
            LifecycleState.STOPPING: {
                LifecycleState.STOPPED
            },
            LifecycleState.STOPPED: {
                LifecycleState.INITIALIZING  # Can restart
            },
            LifecycleState.ERROR: {
                LifecycleState.STOPPING,
                LifecycleState.INITIALIZING  # Can retry
            }
        }

        return to_state in valid_transitions.get(from_state, set())

    async def _run_hooks(self, state: LifecycleState, before: bool) -> None:
        """Run hooks for a state"""
        hooks = self._hooks.get(state, [])

        for hook_entry in hooks:
            if hook_entry["before"] == before:
                try:
                    hook_func = hook_entry["func"]
                    if asyncio.iscoroutinefunction(hook_func):
                        await hook_func()
                    else:
                        hook_func()
                except Exception as e:
                    logger.error(
                        f"Error in {'pre' if before else 'post'} hook for {state.value}: {e}"
                    )

    async def initialize(
        self,
        init_func: Callable,
        on_error: Optional[Callable] = None
    ) -> bool:
        """
        Initialize the engine.

        Args:
            init_func: Async function to run for initialization
            on_error: Optional callback if initialization fails

        Returns:
            True if successful, False otherwise
        """
        if not await self.transition_to(LifecycleState.INITIALIZING):
            return False

        try:
            await init_func()
            await self.transition_to(LifecycleState.STARTING)
            return True

        except Exception as e:
            logger.error(f"Initialization failed: {e}")
            await self.transition_to(LifecycleState.ERROR)

            if on_error:
                try:
                    await on_error(e)
                except Exception as e2:
                    logger.error(f"Error in error handler: {e2}")

            return False

    async def start(
        self,
        start_func: Callable,
        on_error: Optional[Callable] = None
    ) -> bool:
        """
        Start the engine.

        Args:
            start_func: Async function to run for startup
            on_error: Optional callback if startup fails

        Returns:
            True if successful, False otherwise
        """
        if not await self.transition_to(LifecycleState.RUNNING):
            return False

        try:
            await start_func()
            logger.info("Engine started successfully")
            return True

        except Exception as e:
            logger.error(f"Startup failed: {e}")
            await self.transition_to(LifecycleState.ERROR)

            if on_error:
                try:
                    await on_error(e)
                except Exception as e2:
                    logger.error(f"Error in error handler: {e2}")

            return False

    async def shutdown(
        self,
        shutdown_func: Callable,
        timeout: Optional[float] = None
    ) -> bool:
        """
        Shutdown the engine gracefully.

        Args:
            shutdown_func: Async function to run for shutdown
            timeout: Optional timeout in seconds

        Returns:
            True if successful, False if timeout
        """
        if not await self.transition_to(LifecycleState.STOPPING):
            return False

        timeout = timeout or self._shutdown_timeout

        try:
            # Run shutdown with timeout
            await asyncio.wait_for(shutdown_func(), timeout=timeout)

            await self.transition_to(LifecycleState.STOPPED)
            logger.info("Engine shutdown complete")
            return True

        except asyncio.TimeoutError:
            logger.error(f"Shutdown timeout after {timeout}s")
            await self.transition_to(LifecycleState.STOPPED)
            return False

        except Exception as e:
            logger.error(f"Shutdown error: {e}")
            await self.transition_to(LifecycleState.ERROR)
            return False

        finally:
            # Signal shutdown complete
            self._shutdown_event.set()

    def setup_signal_handlers(self, loop: asyncio.AbstractEventLoop) -> None:
        """
        Setup signal handlers for graceful shutdown.

        Args:
            loop: asyncio event loop
        """
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(
                sig,
                lambda s=sig: asyncio.create_task(self._handle_signal(s))
            )

        logger.info("Signal handlers registered for SIGINT, SIGTERM")

    async def _handle_signal(self, sig: signal.Signals) -> None:
        """Handle shutdown signal"""
        logger.info(f"Received signal {sig.name}, initiating shutdown")
        self._shutdown_event.set()

    async def wait_for_shutdown(self) -> None:
        """Wait for shutdown signal"""
        await self._shutdown_event.wait()

    def get_event_history(self) -> List[Dict[str, any]]:
        """
        Get lifecycle event history.

        Returns:
            List of event dictionaries
        """
        return [
            {
                "state": event.state.value,
                "timestamp": event.timestamp.isoformat(),
                "error": str(event.error) if event.error else None
            }
            for event in self._events
        ]

    def add_shutdown_task(self, task: asyncio.Task) -> None:
        """
        Add a task to be cancelled on shutdown.

        Args:
            task: Asyncio task to track
        """
        self._shutdown_tasks.add(task)
        logger.debug(f"Added shutdown task: {task}")

    async def cancel_all_tasks(self) -> None:
        """Cancel all tracked shutdown tasks"""
        logger.info(f"Cancelling {len(self._shutdown_tasks)} tasks...")

        for task in self._shutdown_tasks:
            if not task.done():
                task.cancel()
                logger.debug(f"Cancelled task: {task}")

        # Wait for all tasks to be cancelled
        if self._shutdown_tasks:
            await asyncio.wait(
                self._shutdown_tasks,
                timeout=5,
                return_when=asyncio.ALL_COMPLETED
            )

        self._shutdown_tasks.clear()
        logger.info("All tasks cancelled")


class GracefulShutdown:
    """
    Context manager for graceful shutdown.

    Usage:
        async with GracefulShutdown(lifecycle_manager) as shutdown:
            # Run engine
            await shutdown.wait()
            # Cleanup happens automatically
    """

    def __init__(
        self,
        lifecycle: LifecycleManager,
        shutdown_func: Callable,
        timeout: float = 30
    ):
        self._lifecycle = lifecycle
        self._shutdown_func = shutdown_func
        self._timeout = timeout

    async def __aenter__(self):
        """Enter context manager"""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Exit context manager - perform shutdown"""
        logger.info("GracefulShutdown context exiting, performing cleanup...")
        await self._lifecycle.shutdown(self._shutdown_func, self._timeout)
        return False  # Don't suppress exceptions

    async def wait(self):
        """Wait for shutdown signal"""
        await self._lifecycle.wait_for_shutdown()
