"""
Black Box 5 Engine - Configuration Manager

Implements multi-strategy configuration loading with fallbacks:
1. Cache (fastest)
2. File (direct)
3. Registry (fallback)
4. Defaults (last resort)
"""

import os
import yaml
from pathlib import Path
from typing import Any, Dict, List, Optional, Type
from dataclasses import dataclass
from abc import ABC, abstractmethod
import logging

logger = logging.getLogger("ConfigManager")


class ConfigLoadError(Exception):
    """Raised when all config loading strategies fail"""
    pass


class ConfigValidationError(Exception):
    """Raised when config validation fails"""
    pass


@dataclass
class Config:
    """Configuration container with validation"""
    data: Dict[str, Any]
    source: str  # Where this config came from
    validated: bool = False

    def get(self, key: str, default: Any = None) -> Any:
        """Get config value with dot notation support"""
        keys = key.split(".")
        value = self.data

        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
            else:
                return default

        return value if value is not None else default

    def validate(self, schema: Dict[str, Any]) -> bool:
        """
        Validate config against a schema.

        Schema format:
        {
            "required_fields": ["field1", "field2"],
            "types": {"field1": "str", "field2": "int"},
            "ranges": {"port": (1, 65535)}
        }
        """
        # Check required fields
        for field in schema.get("required_fields", []):
            if self.get(field) is None:
                raise ConfigValidationError(f"Required field missing: {field}")

        # Check types
        for field, expected_type in schema.get("types", {}).items():
            value = self.get(field)
            if value is not None:
                if expected_type == "str" and not isinstance(value, str):
                    raise ConfigValidationError(f"Field {field} must be string")
                elif expected_type == "int" and not isinstance(value, int):
                    raise ConfigValidationError(f"Field {field} must be integer")
                elif expected_type == "bool" and not isinstance(value, bool):
                    raise ConfigValidationError(f"Field {field} must be boolean")

        # Check ranges
        for field, (min_val, max_val) in schema.get("ranges", {}).items():
            value = self.get(field)
            if value is not None and not (min_val <= value <= max_val):
                raise ConfigValidationError(
                    f"Field {field} must be between {min_val} and {max_val}"
                )

        self.validated = True
        return True


class ConfigStrategy(ABC):
    """Base class for config loading strategies"""

    @abstractmethod
    def load(self) -> Optional[Config]:
        """Attempt to load config, return None if not available"""
        pass

    @abstractmethod
    def priority(self) -> int:
        """Lower priority = tried first"""
        pass


class CacheStrategy(ConfigStrategy):
    """Load from in-memory cache (fastest)"""

    _cache: Optional[Config] = None

    def load(self) -> Optional[Config]:
        if CacheStrategy._cache:
            logger.debug("Config loaded from cache")
            return CacheStrategy._cache
        return None

    def priority(self) -> int:
        return 1

    @classmethod
    def set_cache(cls, config: Config):
        """Set the cached config"""
        cls._cache = config


class FileStrategy(ConfigStrategy):
    """Load from config file"""

    def __init__(self, config_path: Optional[Path] = None):
        self.config_path = config_path or self._find_config_path()

    def _find_config_path(self) -> Optional[Path]:
        """Find config.yml in standard locations"""
        # Check current directory
        cwd = Path.cwd()
        if (cwd / "config.yml").exists():
            return cwd / "config.yml"

        # Check .blackbox5 directory
        if (cwd / ".blackbox5" / "config.yml").exists():
            return cwd / ".blackbox5" / "config.yml"

        # Check parent of engine directory
        engine_dir = Path(__file__).parent.parent
        if (engine_dir / "config.yml").exists():
            return engine_dir / "config.yml"

        return None

    def load(self) -> Optional[Config]:
        if not self.config_path or not self.config_path.exists():
            return None

        try:
            with open(self.config_path, "r") as f:
                data = yaml.safe_load(f)

            logger.info(f"Config loaded from file: {self.config_path}")
            return Config(data=data, source=f"file:{self.config_path}")

        except Exception as e:
            logger.warning(f"Failed to load config from {self.config_path}: {e}")
            return None

    def priority(self) -> int:
        return 2


class RegistryStrategy(ConfigStrategy):
    """Load from service registry (placeholder for future)"""

    def load(self) -> Optional[Config]:
        # TODO: Implement service registry lookup
        # For now, this is a placeholder
        return None

    def priority(self) -> int:
        return 3


class DefaultStrategy(ConfigStrategy):
    """Load built-in defaults (last resort)"""

    def load(self) -> Optional[Config]:
        logger.warning("Using default configuration")

        defaults = {
            "engine": {
                "name": "Black Box 5",
                "version": "5.0.0",
                "log_level": "INFO"
            },
            "api": {
                "host": "127.0.0.1",
                "port": 8000,
                "enabled": True
            },
            "websocket": {
                "host": "127.0.0.1",
                "port": 8001,
                "enabled": True
            },
            "health": {
                "check_interval": 30,
                "enabled": True
            },
            "services": {
                "brain": {"enabled": True, "lazy": True},
                "agents": {"enabled": True, "lazy": True},
                "tools": {"enabled": True, "lazy": True}
            }
        }

        return Config(data=defaults, source="defaults")

    def priority(self) -> int:
        return 4


class ConfigManager:
    """
    Manages configuration loading with multi-strategy fallback.

    Usage:
        config = ConfigManager.load()
        value = config.get("api.port")
    """

    strategies: List[Type[ConfigStrategy]] = [
        CacheStrategy,
        FileStrategy,
        RegistryStrategy,
        DefaultStrategy
    ]

    @classmethod
    def load(
        cls,
        config_path: Optional[Path] = None,
        schema: Optional[Dict[str, Any]] = None,
        custom_strategies: Optional[List[Type[ConfigStrategy]]] = None
    ) -> Config:
        """
        Load configuration using strategy chain.

        Args:
            config_path: Optional path to config file
            schema: Optional validation schema
            custom_strategies: Optional custom strategy list

        Returns:
            Config object

        Raises:
            ConfigLoadError: If all strategies fail
            ConfigValidationError: If validation fails
        """
        strategies = custom_strategies or cls.strategies

        # Add config path to FileStrategy if provided
        if config_path:
            strategies = [
                s if s != FileStrategy else type(
                    f"FileStrategyWithPath",
                    (FileStrategy,),
                    {"__init__": lambda self: FileStrategy.__init__(self, config_path)}
                )
                for s in strategies
            ]

        # Try each strategy in priority order
        strategies_sorted = sorted(strategies, key=lambda s: s().priority())

        for strategy_class in strategies_sorted:
            try:
                strategy = strategy_class()
                config = strategy.load()

                if config:
                    # Validate if schema provided
                    if schema:
                        config.validate(schema)

                    # Cache the result
                    CacheStrategy.set_cache(config)

                    return config

            except Exception as e:
                logger.debug(f"Strategy {strategy_class.__name__} failed: {e}")
                continue

        # If we get here, all strategies failed
        raise ConfigLoadError("All configuration loading strategies failed")

    @classmethod
    def reload(cls) -> Config:
        """Reload configuration, bypassing cache"""
        # Clear cache
        CacheStrategy._cache = None
        return cls.load()

    @classmethod
    def watch(cls, callback: callable, interval: int = 1):
        """
        Watch config file for changes and call callback on change.

        Note: This is a simple implementation. For production, use
        a proper file watching library like `watchdog`.
        """
        import time

        last_mtime = None
        file_strategy = FileStrategy()
        config_path = file_strategy.config_path

        if not config_path:
            logger.warning("No config file to watch")
            return

        logger.info(f"Watching config file: {config_path}")

        while True:
            try:
                mtime = os.path.getmtime(config_path)
                if last_mtime and mtime != last_mtime:
                    logger.info("Config file changed, reloading...")
                    cls.reload()
                    callback()

                last_mtime = mtime
                time.sleep(interval)

            except KeyboardInterrupt:
                logger.info("Stopped watching config file")
                break
            except Exception as e:
                logger.error(f"Error watching config file: {e}")
                time.sleep(interval)
