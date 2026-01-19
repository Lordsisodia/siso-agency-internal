#!/usr/bin/env python3
"""
Circuit Breaker Configuration

This module provides configuration classes and default settings
for circuit breakers and failsafe detection.
"""

from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum


class RetryStrategy(Enum):
    """Retry strategies"""
    NONE = "none"
    FIXED_DELAY = "fixed_delay"
    EXPONENTIAL_BACKOFF = "exponential_backoff"
    LINEAR_BACKOFF = "linear_backoff"


class BackoffStrategy(Enum):
    """Backoff strategies"""
    FIXED = "fixed"
    EXPONENTIAL = "exponential"
    LINEAR = "linear"
    RANDOM_JITTER = "random_jitter"


@dataclass
class CircuitBreakerThresholds:
    """Thresholds for circuit breaker state transitions"""
    failure_threshold: int = 5
    success_threshold: int = 2
    half_open_max_calls: int = 3
    consecutive_failures: int = 5
    consecutive_successes: int = 2


@dataclass
class CircuitBreakerTimeouts:
    """Timeout settings for circuit breaker"""
    open_timeout_ms: int = 60000
    call_timeout_ms: int = 30000
    half_open_timeout_ms: int = 30000
    recovery_timeout_ms: int = 120000


@dataclass
class RetryConfig:
    """Retry configuration"""
    strategy: RetryStrategy = RetryStrategy.EXPONENTIAL_BACKOFF
    max_attempts: int = 3
    initial_delay_ms: int = 1000
    max_delay_ms: int = 10000
    backoff_multiplier: float = 2.0
    jitter: bool = True
    jitter_factor: float = 0.1


@dataclass
class BackoffConfig:
    """Backoff configuration"""
    strategy: BackoffStrategy = BackoffStrategy.EXPONENTIAL
    initial_delay_ms: int = 1000
    max_delay_ms: int = 30000
    multiplier: float = 2.0
    add_jitter: bool = True
    jitter_factor: float = 0.1


@dataclass
class CircuitBreakerConfig:
    """
    Complete Circuit Breaker Configuration

    Provides comprehensive configuration for circuit breaker behavior,
    including thresholds, timeouts, and retry strategies.
    """

    # Thresholds
    failure_threshold: int = 5
    success_threshold: int = 2
    half_open_max_calls: int = 3
    sliding_window_size: int = 100

    # Timeouts
    timeout_ms: int = 60000
    call_timeout_ms: int = 30000

    # Retry settings
    retry_enabled: bool = False
    retry_config: RetryConfig = field(default_factory=RetryConfig)

    # Backoff settings
    backoff_config: BackoffConfig = field(default_factory=BackoffConfig)

    # Monitoring
    enable_metrics: bool = True
    enable_health_checks: bool = True
    health_check_interval_ms: int = 5000

    # Notifications
    notify_on_state_change: bool = True
    notify_on_failure: bool = True

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'thresholds': {
                'failure_threshold': self.failure_threshold,
                'success_threshold': self.success_threshold,
                'half_open_max_calls': self.half_open_max_calls,
                'sliding_window_size': self.sliding_window_size
            },
            'timeouts': {
                'timeout_ms': self.timeout_ms,
                'call_timeout_ms': self.call_timeout_ms
            },
            'retry': {
                'enabled': self.retry_enabled,
                'strategy': self.retry_config.strategy.value,
                'max_attempts': self.retry_config.max_attempts,
                'initial_delay_ms': self.retry_config.initial_delay_ms,
                'max_delay_ms': self.retry_config.max_delay_ms,
                'backoff_multiplier': self.retry_config.backoff_multiplier,
                'jitter': self.retry_config.jitter,
                'jitter_factor': self.retry_config.jitter_factor
            },
            'backoff': {
                'strategy': self.backoff_config.strategy.value,
                'initial_delay_ms': self.backoff_config.initial_delay_ms,
                'max_delay_ms': self.backoff_config.max_delay_ms,
                'multiplier': self.backoff_config.multiplier,
                'add_jitter': self.backoff_config.add_jitter,
                'jitter_factor': self.backoff_config.jitter_factor
            },
            'monitoring': {
                'enable_metrics': self.enable_metrics,
                'enable_health_checks': self.enable_health_checks,
                'health_check_interval_ms': self.health_check_interval_ms
            },
            'notifications': {
                'notify_on_state_change': self.notify_on_state_change,
                'notify_on_failure': self.notify_on_failure
            }
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CircuitBreakerConfig':
        """Create from dictionary"""
        config = cls()

        if 'thresholds' in data:
            t = data['thresholds']
            config.failure_threshold = t.get('failure_threshold', config.failure_threshold)
            config.success_threshold = t.get('success_threshold', config.success_threshold)
            config.half_open_max_calls = t.get('half_open_max_calls', config.half_open_max_calls)
            config.sliding_window_size = t.get('sliding_window_size', config.sliding_window_size)

        if 'timeouts' in data:
            t = data['timeouts']
            config.timeout_ms = t.get('timeout_ms', config.timeout_ms)
            config.call_timeout_ms = t.get('call_timeout_ms', config.call_timeout_ms)

        if 'retry' in data:
            r = data['retry']
            config.retry_enabled = r.get('enabled', config.retry_enabled)
            config.retry_config = RetryConfig(
                strategy=RetryStrategy(r.get('strategy', 'exponential_backoff')),
                max_attempts=r.get('max_attempts', 3),
                initial_delay_ms=r.get('initial_delay_ms', 1000),
                max_delay_ms=r.get('max_delay_ms', 10000),
                backoff_multiplier=r.get('backoff_multiplier', 2.0),
                jitter=r.get('jitter', True),
                jitter_factor=r.get('jitter_factor', 0.1)
            )

        return config


# Default configurations for different scenarios

DEFAULT_CONSERVATIVE = CircuitBreakerConfig(
    failure_threshold=3,
    success_threshold=3,
    timeout_ms=120000,
    call_timeout_ms=60000,
    retry_enabled=True,
    retry_config=RetryConfig(
        strategy=RetryStrategy.EXPONENTIAL_BACKOFF,
        max_attempts=2,
        initial_delay_ms=2000,
        max_delay_ms=10000
    )
)

DEFAULT_MODERATE = CircuitBreakerConfig(
    failure_threshold=5,
    success_threshold=2,
    timeout_ms=60000,
    call_timeout_ms=30000,
    retry_enabled=True,
    retry_config=RetryConfig(
        strategy=RetryStrategy.EXPONENTIAL_BACKOFF,
        max_attempts=3,
        initial_delay_ms=1000,
        max_delay_ms=10000
    )
)

DEFAULT_AGGRESSIVE = CircuitBreakerConfig(
    failure_threshold=10,
    success_threshold=1,
    timeout_ms=30000,
    call_timeout_ms=15000,
    retry_enabled=False
)


# Preset configurations for specific use cases

CIRCUIT_BREAKER_PRESETS: Dict[str, CircuitBreakerConfig] = {
    'conservative': DEFAULT_CONSERVATIVE,
    'moderate': DEFAULT_MODERATE,
    'aggressive': DEFAULT_AGGRESSIVE,
    'critical_service': CircuitBreakerConfig(
        failure_threshold=2,
        success_threshold=3,
        timeout_ms=180000,
        call_timeout_ms=90000,
        retry_enabled=True,
        retry_config=RetryConfig(
            strategy=RetryStrategy.EXPONENTIAL_BACKOFF,
            max_attempts=3,
            initial_delay_ms=3000,
            max_delay_ms=15000
        )
    ),
    'non_critical_service': CircuitBreakerConfig(
        failure_threshold=8,
        success_threshold=1,
        timeout_ms=30000,
        call_timeout_ms=10000,
        retry_enabled=False
    ),
    'external_api': CircuitBreakerConfig(
        failure_threshold=5,
        success_threshold=2,
        timeout_ms=60000,
        call_timeout_ms=30000,
        retry_enabled=True,
        retry_config=RetryConfig(
            strategy=RetryStrategy.EXPONENTIAL_BACKOFF,
            max_attempts=3,
            initial_delay_ms=1000,
            max_delay_ms=8000
        )
    ),
    'database': CircuitBreakerConfig(
        failure_threshold=3,
        success_threshold=2,
        timeout_ms=30000,
        call_timeout_ms=10000,
        retry_enabled=True,
        retry_config=RetryConfig(
            strategy=RetryStrategy.LINEAR_BACKOFF,
            max_attempts=2,
            initial_delay_ms=500,
            max_delay_ms=2000
        )
    ),
    'agent_execution': CircuitBreakerConfig(
        failure_threshold=4,
        success_threshold=2,
        timeout_ms=90000,
        call_timeout_ms=120000,
        retry_enabled=False
    ),
    'file_operations': CircuitBreakerConfig(
        failure_threshold=3,
        success_threshold=2,
        timeout_ms=10000,
        call_timeout_ms=5000,
        retry_enabled=True,
        retry_config=RetryConfig(
            strategy=RetryStrategy.FIXED_DELAY,
            max_attempts=2,
            initial_delay_ms=1000,
            max_delay_ms=1000
        )
    )
}


def get_preset(name: str) -> Optional[CircuitBreakerConfig]:
    """
    Get preset configuration by name

    Args:
        name: Preset name

    Returns:
        Configuration or None if not found
    """
    return CIRCUIT_BREAKER_PRESETS.get(name)


def list_presets() -> List[str]:
    """List available preset names"""
    return list(CIRCUIT_BREAKER_PRESETS.keys())


def create_custom_config(
    preset: str = 'moderate',
    **overrides
) -> CircuitBreakerConfig:
    """
    Create custom configuration from preset with overrides

    Args:
        preset: Base preset name
        **overrides: Configuration overrides

    Returns:
        Custom configuration
    """
    config = get_preset(preset) or DEFAULT_MODERATE

    for key, value in overrides.items():
        if hasattr(config, key):
            setattr(config, key, value)

    return config
