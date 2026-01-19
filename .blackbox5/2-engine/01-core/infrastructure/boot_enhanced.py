#!/usr/bin/env python3
"""
Black Box 5 Engine - Enhanced Boot

Enhanced boot system with:
- Multi-strategy configuration loading
- Service registry with lifecycle management
- Health monitoring
- Graceful shutdown
- Run level management

Usage:
    python -m engine.core.boot_enhanced
"""

import asyncio
import os
import sys
import signal
from pathlib import Path
from typing import Optional
import logging

# Add engine to path
engine_root = Path(__file__).parent.parent
sys.path.insert(0, str(engine_root))

from core.kernel import EngineKernel, RunLevel, SystemStatus, ServiceConfig
from core.config import ConfigManager, Config
from core.registry import ServiceRegistry, Service
from core.health import HealthMonitor, BuiltInChecks
from core.lifecycle import LifecycleManager, LifecycleState


# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("Boot")


class BootConfig:
    """Configuration for the boot process"""
    def __init__(self, config_path: Optional[Path] = None):
        self.config_path = config_path
        self.config: Optional[Config] = None
        self.kernel: Optional[EngineKernel] = None
        self.registry: Optional[ServiceRegistry] = None
        self.health_monitor: Optional[HealthMonitor] = None
        self.lifecycle: Optional[LifecycleManager] = None


async def load_config(config_path: Optional[Path] = None) -> Config:
    """Load configuration with multi-strategy fallback"""
    logger.info("🔧 Loading configuration...")

    try:
        config = ConfigManager.load(
            config_path=config_path,
            schema={
                "required_fields": ["engine"],
                "types": {
                    "engine.log_level": "str",
                    "api.port": "int"
                },
                "ranges": {
                    "api.port": (1, 65535)
                }
            }
        )

        logger.info(f"✅ Configuration loaded from: {config.source}")
        return config

    except Exception as e:
        logger.error(f"❌ Failed to load configuration: {e}")
        raise


async def initialize_core_systems(config: Config) -> BootConfig:
    """Initialize core engine systems"""
    boot_config = BootConfig()
    boot_config.config = config

    logger.info("🔌 Initializing core systems...")

    # 1. Initialize Kernel
    logger.info("  → EngineKernel")
    kernel = kernel  # Use singleton instance
    kernel._status = SystemStatus.INITIALIZING
    boot_config.kernel = kernel

    # 2. Initialize Service Registry
    logger.info("  → ServiceRegistry")
    registry = ServiceRegistry()
    boot_config.registry = registry

    # 3. Initialize Health Monitor
    logger.info("  → HealthMonitor")
    health_monitor = HealthMonitor(service_registry=registry)

    # Register built-in health checks
    health_monitor.register_check(
        "disk_space",
        BuiltInChecks.disk_space(min_percent_free=10.0),
        interval=60
    )
    health_monitor.register_check(
        "memory_available",
        BuiltInChecks.memory_available(min_mb=100),
        interval=30
    )

    boot_config.health_monitor = health_monitor

    # 4. Initialize Lifecycle Manager
    logger.info("  → LifecycleManager")
    lifecycle = LifecycleManager()
    boot_config.lifecycle = lifecycle

    # Setup lifecycle hooks
    lifecycle.register_hook(
        LifecycleState.STOPPING,
        lambda: logger.info("🛑 Shutdown initiated"),
        before=True
    )

    lifecycle.register_hook(
        LifecycleState.STOPPED,
        lambda: logger.info("✅ Shutdown complete"),
        before=False
    )

    logger.info("✅ Core systems initialized")
    return boot_config


async def register_services(boot_config: BootConfig) -> None:
    """Register engine services"""
    logger.info("📦 Registering services...")

    config = boot_config.config
    registry = boot_config.registry

    # Get service configurations
    services_config = config.get("services", {})

    # Core services (these will be implemented)
    # For now, we'll create placeholder configs

    # TODO: Implement actual service classes
    # These are placeholder registrations for the architecture

    logger.info("  → Placeholder services registered")
    logger.info("  (Actual services will be implemented in Phase 3)")

    logger.info("✅ Services registered")


async def start_engine(boot_config: BootConfig) -> None:
    """Start the engine"""
    logger.info("🚀 Starting engine...")

    lifecycle = boot_config.lifecycle
    kernel = boot_config.kernel
    registry = boot_config.registry
    health_monitor = boot_config.health_monitor

    # Define initialization function
    async def init_engine():
        # Start all registered services
        await registry.start_all()

        # Start health monitoring
        await health_monitor.start_health_monitor(
            interval=boot_config.config.get("health.check_interval", 30)
        )

    # Define startup function
    async def start_engine_func():
        # Update kernel status
        kernel._status = SystemStatus.READY

        # Log run level
        logger.info(f"🎯 Run level: {kernel.run_level.name}")
        logger.info(f"📊 Status: {kernel.status.value}")

    # Define error handler
    async def on_error(error: Exception):
        logger.error(f"Engine startup failed: {error}")
        kernel._status = SystemStatus.ERROR
        kernel._run_level = RunLevel.DEAD

    # Initialize using lifecycle manager
    success = await lifecycle.initialize(
        init_func=init_engine,
        on_error=on_error
    )

    if not success:
        logger.error("❌ Initialization failed")
        return

    # Start engine
    success = await lifecycle.start(
        start_func=start_engine_func,
        on_error=on_error
    )

    if not success:
        logger.error("❌ Startup failed")
        return

    logger.info("✅ Engine started successfully")


async def shutdown_engine(boot_config: BootConfig) -> None:
    """Shutdown the engine gracefully"""
    logger.info("🛑 Shutting down engine...")

    lifecycle = boot_config.lifecycle
    registry = boot_config.registry
    health_monitor = boot_config.health_monitor
    kernel = boot_config.kernel

    # Define shutdown function
    async def shutdown_func():
        # Stop health monitoring
        await health_monitor.stop_health_monitor()

        # Stop all services
        await registry.stop_all()

        # Update kernel status
        kernel._status = SystemStatus.OFFLINE
        kernel._run_level = RunLevel.DEAD

    # Shutdown with timeout
    timeout = boot_config.config.get("engine.shutdown_timeout", 30)
    await lifecycle.shutdown(shutdown_func, timeout=timeout)


async def run_api_server(boot_config: BootConfig) -> None:
    """Run the API server (placeholder for now)"""
    # TODO: Implement FastAPI server
    logger.info("🌐 API server would start here")
    logger.info("   (FastAPI server will be implemented in Phase 4)")

    # For now, just wait for shutdown
    await boot_config.lifecycle.wait_for_shutdown()


async def main():
    """Main boot sequence"""
    logger.info("=" * 60)
    logger.info("Black Box 5 Engine - Enhanced Boot")
    logger.info("=" * 60)

    boot_config: Optional[BootConfig] = None
    lifecycle = None

    try:
        # Phase 1: Load Configuration
        config_path = None
        if len(sys.argv) > 1:
            config_path = Path(sys.argv[1])

        config = await load_config(config_path)

        # Phase 2: Initialize Core Systems
        boot_config = await initialize_core_systems(config)
        lifecycle = boot_config.lifecycle

        # Setup signal handlers
        loop = asyncio.get_running_loop()
        lifecycle.setup_signal_handlers(loop)

        # Phase 3: Register Services
        await register_services(boot_config)

        # Phase 4: Start Engine
        await start_engine(boot_config)

        # Phase 5: Run Server
        await run_api_server(boot_config)

    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
    finally:
        # Cleanup
        if boot_config:
            await shutdown_engine(boot_config)

    logger.info("Goodbye!")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Interrupted")
        sys.exit(0)
