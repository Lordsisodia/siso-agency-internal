"""
Black Box 5 Engine - Service Registry

Implements service registration, lifecycle management, and health monitoring.
Based on patterns from TaskServiceRegistry with enhancements for async operations.
"""

import asyncio
from typing import Any, Callable, Dict, List, Optional, Type
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
import logging

logger = logging.getLogger("ServiceRegistry")


@dataclass
class ServiceHealth:
    """Health status for a service"""
    healthy: bool
    status: str
    message: str = ""
    last_check: datetime = field(default_factory=datetime.now)
    error_count: int = 0
    last_error: Optional[str] = None


class Service(ABC):
    """
    Base class for all services.

    Services must implement these lifecycle methods:
    - initialize(): Set up the service
    - start(): Start the service
    - stop(): Stop the service gracefully
    - is_healthy(): Check if service is healthy
    - recover(): Attempt to recover from failure
    """

    def __init__(self, name: str):
        self.name = name
        self._initialized = False
        self._started = False
        self._health = ServiceHealth(healthy=False, status="not_initialized")

    @property
    def initialized(self) -> bool:
        return self._initialized

    @property
    def started(self) -> bool:
        return self._started

    @property
    def health(self) -> ServiceHealth:
        return self._health

    @abstractmethod
    async def initialize(self) -> None:
        """Initialize the service (called once)"""
        pass

    @abstractmethod
    async def start(self) -> None:
        """Start the service"""
        pass

    @abstractmethod
    async def stop(self) -> None:
        """Stop the service gracefully"""
        pass

    @abstractmethod
    def is_healthy(self) -> bool:
        """Check if service is healthy"""
        pass

    async def recover(self) -> bool:
        """
        Attempt to recover from failure.

        Returns:
            True if recovery successful, False otherwise
        """
        try:
            logger.info(f"Attempting recovery for service: {self.name}")

            # Try to restart the service
            if self._started:
                await self.stop()
            await asyncio.sleep(1)  # Brief pause
            await self.start()

            self._health.healthy = True
            self._health.status = "recovered"
            self._health.error_count = 0
            self._health.last_error = None

            logger.info(f"✅ Service recovered: {self.name}")
            return True

        except Exception as e:
            logger.error(f"❌ Recovery failed for {self.name}: {e}")
            self._health.error_count += 1
            self._health.last_error = str(e)
            return False


@dataclass
class ServiceConfig:
    """Configuration for registering a service"""
    name: str
    service_class: Type[Service]
    enabled: bool = True
    lazy: bool = True
    dependencies: List[str] = field(default_factory=list)
    priority: int = 100  # Lower = higher priority
    auto_recover: bool = True
    max_retries: int = 3


class ServiceRegistry:
    """
    Central registry for all engine services.

    Manages service lifecycle, health monitoring, and dependency resolution.
    """

    def __init__(self):
        self._services: Dict[str, Service] = {}
        self._configs: Dict[str, ServiceConfig] = {}
        self._lock = asyncio.Lock()
        self._health_check_interval = 30
        self._health_check_task: Optional[asyncio.Task] = None

    def register(self, config: ServiceConfig) -> None:
        """
        Register a service configuration.

        Args:
            config: ServiceConfig with service details
        """
        self._configs[config.name] = config
        logger.debug(
            f"Registered service: {config.name} "
            f"(enabled={config.enabled}, lazy={config.lazy})"
        )

    async def get(self, name: str) -> Optional[Service]:
        """
        Get a service instance, initializing if needed.

        Args:
            name: Service name

        Returns:
            Service instance or None if not found/failed
        """
        # Return cached instance
        if name in self._services:
            return self._services[name]

        # Check if registered
        if name not in self._configs:
            logger.error(f"Service not registered: {name}")
            return None

        config = self._configs[name]

        if not config.enabled:
            logger.warning(f"Service disabled: {name}")
            return None

        # Initialize the service
        async with self._lock:
            # Double-check after acquiring lock
            if name in self._services:
                return self._services[name]

            try:
                logger.info(f"Initializing service: {name}")

                # Create service instance
                service_instance = config.service_class(name)

                # Initialize
                await self._initialize_with_retry(service_instance, config)

                # Store instance
                self._services[name] = service_instance

                logger.info(f"✅ Service initialized: {name}")
                return service_instance

            except Exception as e:
                logger.error(f"❌ Failed to initialize {name}: {e}")
                return None

    async def _initialize_with_retry(
        self,
        service: Service,
        config: ServiceConfig
    ) -> None:
        """Initialize service with retry logic"""
        last_error = None

        for attempt in range(config.max_retries):
            try:
                await service.initialize()
                service._initialized = True
                return

            except Exception as e:
                last_error = e
                logger.warning(
                    f"Initialization attempt {attempt + 1}/{config.max_retries} "
                    f"failed for {service.name}: {e}"
                )
                if attempt < config.max_retries - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff

        # All retries failed
        raise last_error or Exception("Initialization failed")

    async def start_all(self) -> None:
        """Start all registered non-lazy services"""
        logger.info("Starting all services...")

        # Calculate dependency levels
        levels = self._calculate_dependency_levels()

        # Start services level by level
        for level, service_names in sorted(levels.items()):
            logger.info(f"Starting level {level} services: {service_names}")

            # Start services in parallel within each level
            tasks = []
            for name in service_names:
                config = self._configs.get(name)
                if config and config.enabled and not config.lazy:
                    tasks.append(self._start_service(name))

            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)

        logger.info("✅ All services started")

    async def _start_service(self, name: str) -> bool:
        """Start a single service"""
        try:
            service = await self.get(name)
            if service and not service.started:
                await service.start()
                service._started = True
                service._health.healthy = True
                service._health.status = "running"
                logger.info(f"✅ Service started: {name}")
                return True
        except Exception as e:
            logger.error(f"❌ Failed to start {name}: {e}")
            return False

    async def stop_all(self) -> None:
        """Stop all services in reverse dependency order"""
        logger.info("Stopping all services...")

        # Calculate dependency levels
        levels = self._calculate_dependency_levels()

        # Stop in reverse order
        for level in sorted(levels.keys(), reverse=True):
            service_names = levels[level]
            logger.info(f"Stopping level {level} services: {service_names}")

            for name in service_names:
                if name not in self._services:
                    continue

                try:
                    service = self._services[name]
                    if service.started:
                        await service.stop()
                        service._started = False
                        service._health.status = "stopped"
                        logger.info(f"✅ Service stopped: {name}")

                except Exception as e:
                    logger.error(f"❌ Error stopping {name}: {e}")

        logger.info("✅ All services stopped")

    def health_status(self, service_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Get health status of services.

        Args:
            service_name: Specific service name, or None for all

        Returns:
            Dictionary with health status
        """
        if service_name:
            if service_name in self._services:
                health = self._services[service_name]._health
                return {
                    "healthy": health.healthy,
                    "status": health.status,
                    "message": health.message,
                    "last_check": health.last_check.isoformat(),
                    "error_count": health.error_count,
                    "last_error": health.last_error
                }
            return {"healthy": False, "status": "not_found"}

        # Return all services
        return {
            name: {
                "healthy": service._health.healthy,
                "status": service._health.status,
                "message": service._health.message,
                "error_count": service._health.error_count
            }
            for name, service in self._services.items()
        }

    async def start_health_monitoring(self, interval: int = 30) -> None:
        """
        Start continuous health monitoring.

        Args:
            interval: Check interval in seconds
        """
        self._health_check_interval = interval

        if self._health_check_task and not self._health_check_task.done():
            logger.warning("Health monitoring already running")
            return

        self._health_check_task = asyncio.create_task(self._health_check_loop())
        logger.info(f"Started health monitoring (interval: {interval}s)")

    async def stop_health_monitoring(self) -> None:
        """Stop health monitoring"""
        if self._health_check_task:
            self._health_check_task.cancel()
            try:
                await self._health_check_task
            except asyncio.CancelledError:
                pass
            logger.info("Stopped health monitoring")

    async def _health_check_loop(self) -> None:
        """Continuous health check loop"""
        while True:
            try:
                await self._check_all_services()
                await asyncio.sleep(self._health_check_interval)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in health check loop: {e}")
                await asyncio.sleep(self._health_check_interval)

    async def _check_all_services(self) -> None:
        """Check health of all services and attempt recovery"""
        for name, service in self._services.items():
            try:
                healthy = service.is_healthy()

                if not healthy:
                    config = self._configs.get(name)
                    if config and config.auto_recover:
                        logger.warning(f"Service {name} unhealthy, attempting recovery")
                        success = await service.recover()

                        if not success:
                            logger.error(f"❌ Recovery failed for {name}")
                    else:
                        logger.warning(f"Service {name} unhealthy (auto-recover disabled)")
                else:
                    # Update health status
                    service._health.healthy = True
                    service._health.last_check = datetime.now()

            except Exception as e:
                logger.error(f"Error checking health of {name}: {e}")

    def _calculate_dependency_levels(self) -> Dict[int, List[str]]:
        """Calculate dependency levels for topological sorting"""
        levels = {}
        visiting = set()

        for name in self._configs.keys():
            self._calc_level(name, levels, visiting)

        return levels

    def _calc_level(
        self,
        name: str,
        levels: Dict[int, List[str]],
        visiting: set
    ) -> int:
        """Recursively calculate dependency level"""
        # Find existing level
        for level, services in levels.items():
            if name in services:
                return level

        if name in visiting:
            logger.warning(f"Circular dependency detected: {name}")
            return 0

        visiting.add(name)

        config = self._configs.get(name)
        max_dep_level = -1

        if config:
            for dep in config.dependencies:
                dep_level = self._calc_level(dep, levels, visiting)
                max_dep_level = max(max_dep_level, dep_level)

        my_level = max_dep_level + 1

        if my_level not in levels:
            levels[my_level] = []
        levels[my_level].append(name)

        visiting.remove(name)
        return my_level
