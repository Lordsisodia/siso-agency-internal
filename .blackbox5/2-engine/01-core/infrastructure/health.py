"""
Black Box 5 Engine - Health Monitor

Continuous health monitoring with automatic recovery.
Tracks system-wide health and individual service health.
"""

import asyncio
from typing import Any, Callable, Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import logging

logger = logging.getLogger("HealthMonitor")


class HealthStatus(Enum):
    """Health status levels"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    CRITICAL = "critical"


@dataclass
class HealthCheck:
    """A health check that can be run"""
    name: str
    check_func: Callable[[], bool]
    interval: int = 30  # seconds
    timeout: int = 10   # seconds
    enabled: bool = True

    # Runtime state
    last_check: Optional[datetime] = None
    last_result: bool = True
    failure_count: int = 0
    consecutive_failures: int = 0
    last_error: Optional[str] = None


@dataclass
class SystemHealth:
    """Overall system health snapshot"""
    status: HealthStatus
    timestamp: datetime
    services: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    checks: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)


class HealthMonitor:
    """
    Continuous health monitoring system.

    Monitors services and custom health checks, tracks failures,
    triggers automatic recovery, and provides health status APIs.
    """

    def __init__(self, service_registry=None):
        self._registry = service_registry
        self._checks: Dict[str, HealthCheck] = {}
        self._check_interval = 30  # seconds
        self._monitor_task: Optional[asyncio.Task] = None
        self._running = False
        self._callbacks: List[Callable] = []  # Health change callbacks

        # Health history
        self._history: List[SystemHealth] = []
        self._max_history = 100

        # Thresholds
        self._failure_threshold = 3  # Consecutive failures before degraded
        self._critical_threshold = 5  # Consecutive failures before critical

    def register_check(
        self,
        name: str,
        check_func: Callable[[], bool],
        interval: int = 30,
        timeout: int = 10,
        enabled: bool = True
    ) -> None:
        """
        Register a custom health check.

        Args:
            name: Unique name for the check
            check_func: Function that returns True if healthy
            interval: Check interval in seconds
            timeout: Timeout for the check
            enabled: Whether the check is enabled
        """
        self._checks[name] = HealthCheck(
            name=name,
            check_func=check_func,
            interval=interval,
            timeout=timeout,
            enabled=enabled
        )
        logger.debug(f"Registered health check: {name}")

    def unregister_check(self, name: str) -> None:
        """Unregister a health check"""
        if name in self._checks:
            del self._checks[name]
            logger.debug(f"Unregistered health check: {name}")

    def on_health_change(self, callback: Callable) -> None:
        """Register callback for health status changes"""
        self._callbacks.append(callback)

    async def start_monitoring(self, interval: int = 30) -> None:
        """
        Start continuous health monitoring.

        Args:
            interval: Check interval in seconds
        """
        if self._running:
            logger.warning("Health monitoring already running")
            return

        self._check_interval = interval
        self._running = True

        self._monitor_task = asyncio.create_task(self._monitoring_loop())
        logger.info(f"Started health monitoring (interval: {interval}s)")

    async def stop_monitoring(self) -> None:
        """Stop health monitoring"""
        if not self._running:
            return

        self._running = False

        if self._monitor_task:
            self._monitor_task.cancel()
            try:
                await self._monitor_task
            except asyncio.CancelledError:
                pass

        logger.info("Stopped health monitoring")

    async def _monitoring_loop(self) -> None:
        """Continuous monitoring loop"""
        while self._running:
            try:
                await self.check_all()
                await asyncio.sleep(self._check_interval)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in health monitoring loop: {e}")
                await asyncio.sleep(self._check_interval)

    async def check_all(self) -> SystemHealth:
        """
        Run all health checks and return system health.

        Returns:
            SystemHealth snapshot
        """
        health_snapshot = SystemHealth(
            status=HealthStatus.HEALTHY,
            timestamp=datetime.now()
        )

        # Check all registered services
        if self._registry:
            service_health = self._registry.health_status()
            health_snapshot.services = service_health

            # Determine overall status from services
            unhealthy_count = sum(
                1 for s in service_health.values()
                if not s.get("healthy", True)
            )

            if unhealthy_count == 0:
                health_snapshot.status = HealthStatus.HEALTHY
            elif unhealthy_count < len(service_health) * 0.5:
                health_snapshot.status = HealthStatus.DEGRADED
            else:
                health_snapshot.status = HealthStatus.UNHEALTHY

        # Check custom health checks
        for name, check in self._checks.items():
            if not check.enabled:
                continue

            try:
                # Run check with timeout
                result = await asyncio.wait_for(
                    asyncio.to_thread(check.check_func),
                    timeout=check.timeout
                )

                check.last_check = datetime.now()
                check.last_result = result

                if result:
                    check.consecutive_failures = 0
                else:
                    check.consecutive_failures += 1
                    check.failure_count += 1

            except asyncio.TimeoutError:
                logger.warning(f"Health check timed out: {name}")
                check.last_result = False
                check.consecutive_failures += 1
                check.failure_count += 1
                check.last_error = "timeout"

            except Exception as e:
                logger.error(f"Health check error: {name} - {e}")
                check.last_result = False
                check.consecutive_failures += 1
                check.failure_count += 1
                check.last_error = str(e)

            # Store check result
            health_snapshot.checks[name] = {
                "healthy": check.last_result,
                "consecutive_failures": check.consecutive_failures,
                "total_failures": check.failure_count,
                "last_check": check.last_check.isoformat() if check.last_check else None
            }

            # Update overall status based on checks
            if check.consecutive_failures >= self._critical_threshold:
                health_snapshot.status = HealthStatus.CRITICAL
            elif check.consecutive_failures >= self._failure_threshold:
                health_snapshot.status = HealthStatus.DEGRADED

        # Add to history
        self._add_to_history(health_snapshot)

        # Notify callbacks if status changed
        await self._notify_status_change(health_snapshot)

        return health_snapshot

    def _add_to_history(self, health: SystemHealth) -> None:
        """Add health snapshot to history"""
        self._history.append(health)

        # Trim history
        if len(self._history) > self._max_history:
            self._history = self._history[-self._max_history:]

    async def _notify_status_change(self, health: SystemHealth) -> None:
        """Notify callbacks of health status changes"""
        if not self._history:
            return

        previous_status = self._history[-1].status if self._history else None

        if previous_status != health.status:
            logger.info(f"Health status changed: {previous_status.value} -> {health.status.value}")

            for callback in self._callbacks:
                try:
                    if asyncio.iscoroutinefunction(callback):
                        await callback(health)
                    else:
                        callback(health)
                except Exception as e:
                    logger.error(f"Error in health change callback: {e}")

    def get_current_health(self) -> Dict[str, Any]:
        """
        Get current system health as dict.

        Returns:
            Dictionary with health status
        """
        if not self._history:
            return {
                "status": "unknown",
                "timestamp": datetime.now().isoformat(),
                "services": {},
                "checks": {}
            }

        latest = self._history[-1]

        return {
            "status": latest.status.value,
            "timestamp": latest.timestamp.isoformat(),
            "services": latest.services,
            "checks": latest.checks,
            "metadata": latest.metadata
        }

    def get_health_history(
        self,
        since: Optional[datetime] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get health history.

        Args:
            since: Only return history after this time
            limit: Maximum number of entries

        Returns:
            List of health snapshots
        """
        history = self._history

        if since:
            history = [h for h in history if h.timestamp >= since]

        if limit:
            history = history[-limit:]

        return [
            {
                "status": h.status.value,
                "timestamp": h.timestamp.isoformat(),
                "services": h.services,
                "checks": h.checks
            }
            for h in history
        ]

    def get_uptime(self) -> Dict[str, Any]:
        """
        Get uptime statistics.

        Returns:
            Dictionary with uptime stats
        """
        if not self._history:
            return {"uptime_percentage": 0, "total_checks": 0, "healthy_checks": 0}

        total = len(self._history)
        healthy = sum(1 for h in self._history if h.status == HealthStatus.HEALTHY)

        # Calculate time span
        if len(self._history) >= 2:
            start = self._history[0].timestamp
            end = self._history[-1].timestamp
            duration = (end - start).total_seconds()
        else:
            duration = 0

        return {
            "uptime_percentage": (healthy / total * 100) if total > 0 else 0,
            "total_checks": total,
            "healthy_checks": healthy,
            "degraded_checks": sum(
                1 for h in self._history if h.status == HealthStatus.DEGRADED
            ),
            "unhealthy_checks": sum(
                1 for h in self._history
                if h.status in (HealthStatus.UNHEALTHY, HealthStatus.CRITICAL)
            ),
            "monitoring_duration_seconds": duration
        }


# Built-in health checks

class BuiltInChecks:
    """Common built-in health checks"""

    @staticmethod
    def disk_space(min_percent_free: float = 10.0) -> Callable[[], bool]:
        """Check if sufficient disk space is available"""
        import shutil

        def check() -> bool:
            try:
                usage = shutil.disk_usage("/")
                percent_free = (usage.free / usage.total) * 100
                return percent_free >= min_percent_free
            except Exception:
                return False

        return check

    @staticmethod
    def memory_available(min_mb: int = 100) -> Callable[[], bool]:
        """Check if sufficient memory is available"""
        import psutil

        def check() -> bool:
            try:
                available = psutil.virtual_memory().available
                available_mb = available / (1024 * 1024)
                return available_mb >= min_mb
            except Exception:
                return False

        return check

    @staticmethod
    def cpu_usage(max_percent: float = 90.0) -> Callable[[], bool]:
        """Check if CPU usage is below threshold"""
        import psutil

        def check() -> bool:
            try:
                percent = psutil.cpu_percent(interval=1)
                return percent <= max_percent
            except Exception:
                return False

        return check

    @staticmethod
    def port_listening(port: int, host: str = "127.0.0.1") -> Callable[[], bool]:
        """Check if a port is listening"""
        import socket

        def check() -> bool:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex((host, port))
                sock.close()
                return result == 0
            except Exception:
                return False

        return check
