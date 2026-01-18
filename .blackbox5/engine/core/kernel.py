"""
Black Box 5 Engine - Core Kernel

The central singleton that manages all engine services and lifecycle.
Implements first-principles initialization with health monitoring and graceful degradation.
"""

import asyncio
import os
import sys
from pathlib import Path
from typing import Any, Callable, Dict, Optional, Type
from dataclasses import dataclass, field
from enum import Enum
import logging
from datetime import datetime

# Add engine directory to path for imports
engine_root = Path(__file__).parent.parent
sys.path.insert(0, str(engine_root))


class RunLevel(Enum):
    """System run levels for graceful degradation"""
    DEAD = 0      # Critical failure, cannot operate
    MINIMAL = 1   # Core only, no agents/tools
    DEGRADED = 2  # Some components failed
    FULL = 3      # Everything working


class SystemStatus(Enum):
    """System status states"""
    OFFLINE = "offline"
    INITIALIZING = "initializing"
    STARTING = "starting"
    READY = "ready"
    DEGRADED = "degraded"
    ERROR = "error"
    SHUTTING_DOWN = "shutting_down"


@dataclass
class HealthStatus:
    """Health status for a service or the system"""
    healthy: bool
    status: str
    message: str = ""
    last_check: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ServiceConfig:
    """Configuration for a service"""
    name: str
    service_class: Type
    enabled: bool = True
    lazy: bool = True  # Lazy load on first use
    dependencies: list = field(default_factory=list)
    priority: int = 100  # Lower = higher priority


class EngineKernel:
    """
    Central singleton that manages all engine services.

    Implements:
    - Service registry with factory pattern
    - Health monitoring
    - Lifecycle management (startup/shutdown)
    - Run level management for graceful degradation
    """

    _instance: Optional['EngineKernel'] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self._initialized = True

        # Core state
        self._status = SystemStatus.OFFLINE
        self._run_level = RunLevel.DEAD
        self._services: Dict[str, Any] = {}
        self._service_configs: Dict[str, ServiceConfig] = {}
        self._health_statuses: Dict[str, HealthStatus] = {}
        self._startup_time: Optional[datetime] = None
        self._lock = asyncio.Lock()

        # Setup logging
        self._setup_logging()

        self.logger.info("🔌 EngineKernel initialized")

    def _setup_logging(self):
        """Setup structured logging"""
        self.logger = logging.getLogger("EngineKernel")
        self.logger.setLevel(logging.INFO)

        # Console handler with formatting
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)

    @property
    def status(self) -> SystemStatus:
        """Current system status"""
        return self._status

    @property
    def run_level(self) -> RunLevel:
        """Current run level"""
        return self._run_level

    @property
    def services(self) -> Dict[str, Any]:
        """All registered services"""
        return self._services.copy()

    def register_service(self, config: ServiceConfig) -> None:
        """
        Register a service with the kernel.

        Args:
            config: ServiceConfig with service details
        """
        self._service_configs[config.name] = config
        self.logger.debug(f"Registered service: {config.name} (lazy={config.lazy})")

    async def get_service(self, name: str) -> Optional[Any]:
        """
        Get a service instance, initializing if needed (lazy loading).

        Args:
            name: Service name

        Returns:
            Service instance or None if not found/failed to initialize
        """
        # Return cached instance if available
        if name in self._services:
            return self._services[name]

        # Check if service is registered
        if name not in self._service_configs:
            self.logger.error(f"Service not registered: {name}")
            return None

        config = self._service_configs[name]

        if not config.enabled:
            self.logger.warning(f"Service disabled: {name}")
            return None

        # Initialize the service
        try:
            self.logger.info(f"Initializing service: {name}")
            service_instance = config.service_class()

            # Call initialize if it exists
            if hasattr(service_instance, 'initialize'):
                if asyncio.iscoroutinefunction(service_instance.initialize):
                    await service_instance.initialize()
                else:
                    service_instance.initialize()

            self._services[name] = service_instance
            self._health_statuses[name] = HealthStatus(
                healthy=True,
                status="initialized",
                message=f"Service {name} initialized successfully"
            )

            self.logger.info(f"✅ Service initialized: {name}")
            return service_instance

        except Exception as e:
            self.logger.error(f"❌ Failed to initialize service {name}: {e}")
            self._health_statuses[name] = HealthStatus(
                healthy=False,
                status="failed",
                message=f"Failed to initialize: {str(e)}"
            )
            return None

    async def start_all_services(self) -> None:
        """
        Start all non-lazy services.

        Initializes services in dependency order, loading independent
        services in parallel where possible.
        """
        self.logger.info("🚀 Starting all services...")
        self._status = SystemStatus.STARTING
        self._startup_time = datetime.now()

        # Separate services by dependency level
        levels = self._calculate_dependency_levels()

        # Start services level by level
        for level, services in sorted(levels.items()):
            self.logger.info(f"Starting level {level} services: {[s for s in services]}")

            # Start services in parallel within each level
            tasks = [
                self.get_service(service_name)
                for service_name in services
                if self._service_configs[service_name].enabled
                and not self._service_configs[service_name].lazy
            ]
            await asyncio.gather(*tasks, return_exceptions=True)

        # Calculate final run level
        self._calculate_run_level()

        # Set final status
        if self._run_level == RunLevel.FULL:
            self._status = SystemStatus.READY
        elif self._run_level == RunLevel.DEGRADED:
            self._status = SystemStatus.DEGRADED
        else:
            self._status = SystemStatus.ERROR

        startup_duration = (datetime.now() - self._startup_time).total_seconds()
        self.logger.info(f"✅ All services started in {startup_duration:.2f}s")
        self.logger.info(f"🎯 System status: {self._status.value}")
        self.logger.info(f"📊 Run level: {self._run_level.name}")

    async def stop_all_services(self) -> None:
        """
        Stop all services gracefully (in reverse dependency order).
        """
        self.logger.info("🛑 Stopping all services...")
        self._status = SystemStatus.SHUTTING_DOWN

        # Calculate dependency levels and stop in reverse order
        levels = self._calculate_dependency_levels()

        for level in sorted(levels.keys(), reverse=True):
            services = levels[level]
            self.logger.info(f"Stopping level {level} services: {[s for s in services]}")

            for service_name in services:
                if service_name not in self._services:
                    continue

                try:
                    service = self._services[service_name]

                    # Call stop if it exists
                    if hasattr(service, 'stop'):
                        if asyncio.iscoroutinefunction(service.stop):
                            await service.stop()
                        else:
                            service.stop()

                    self.logger.info(f"✅ Stopped service: {service_name}")

                except Exception as e:
                    self.logger.error(f"❌ Error stopping service {service_name}: {e}")

        self._status = SystemStatus.OFFLINE
        self._run_level = RunLevel.DEAD
        self.logger.info("✅ All services stopped")

    def get_health_status(self, service_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Get health status of services.

        Args:
            service_name: Specific service name, or None for all services

        Returns:
            Dictionary with health status
        """
        if service_name:
            if service_name in self._health_statuses:
                status = self._health_statuses[service_name]
                return {
                    "healthy": status.healthy,
                    "status": status.status,
                    "message": status.message,
                    "last_check": status.last_check.isoformat(),
                    "metadata": status.metadata
                }
            return {"healthy": False, "status": "unknown", "message": "Service not found"}

        # Return all services
        return {
            "system": {
                "status": self._status.value,
                "run_level": self._run_level.name,
                "startup_time": self._startup_time.isoformat() if self._startup_time else None
            },
            "services": {
                name: {
                    "healthy": status.healthy,
                    "status": status.status,
                    "message": status.message
                }
                for name, status in self._health_statuses.items()
            }
        }

    def _calculate_dependency_levels(self) -> Dict[int, list]:
        """
        Calculate dependency levels for topological sorting.

        Returns:
            Dict mapping level -> list of service names
        """
        levels = {}
        service_names = set(self._service_configs.keys())

        # Build dependency graph
        for name in service_names:
            self._calculate_level(name, self._service_configs, levels, set())

        return levels

    def _calculate_level(
        self,
        name: str,
        configs: Dict[str, ServiceConfig],
        levels: Dict[int, list],
        visiting: set
    ) -> int:
        """Recursively calculate dependency level for a service"""
        if name in levels:
            # Find the level this service is already at
            for level, services in levels.items():
                if name in services:
                    return level
            return 0

        if name in visiting:
            self.logger.warning(f"Circular dependency detected involving: {name}")
            return 0

        visiting.add(name)

        config = configs.get(name)
        if not config:
            return 0

        # Calculate max level of dependencies
        max_dep_level = -1
        for dep in config.dependencies:
            dep_level = self._calculate_level(dep, configs, levels, visiting)
            max_dep_level = max(max_dep_level, dep_level)

        # This service's level is one more than its max dependency
        my_level = max_dep_level + 1

        if my_level not in levels:
            levels[my_level] = []
        levels[my_level].append(name)

        visiting.remove(name)
        return my_level

    def _calculate_run_level(self) -> None:
        """Calculate system run level based on service health"""
        total_services = len(self._service_configs)
        healthy_services = sum(
            1 for status in self._health_statuses.values()
            if status.healthy
        )

        if healthy_services == 0:
            self._run_level = RunLevel.DEAD
        elif healthy_services < total_services * 0.5:
            self._run_level = RunLevel.MINIMAL
        elif healthy_services < total_services:
            self._run_level = RunLevel.DEGRADED
        else:
            self._run_level = RunLevel.FULL


# Global kernel instance
kernel = EngineKernel()
