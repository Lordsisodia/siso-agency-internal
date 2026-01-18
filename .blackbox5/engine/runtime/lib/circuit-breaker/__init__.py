"""
Circuit Breaker System for Ralph Runtime

Enhanced circuit breaker implementation with comprehensive failsafe detection,
metrics tracking, and Ralph Runtime integration.

Basic Usage:
    from circuit_breaker import CircuitBreaker, circuit_breaker_protected

    # Direct usage
    breaker = CircuitBreaker("my-service", failure_threshold=5)
    result = breaker.call(lambda: risky_operation())

    # Decorator usage
    @circuit_breaker_protected("my-service", failure_threshold=5)
    def my_function():
        return risky_operation()

Ralph Runtime Integration:
    from circuit_breaker import RalphCircuitBreaker, AgentExecutionContext

    ralph_breaker = RalphCircuitBreaker()
    context = AgentExecutionContext(
        agent_id="agent-1",
        agent_name="ResearchAgent",
        session_id="session-123"
    )
    ralph_breaker.monitor_agent(context)
    result = ralph_breaker.execute_agent("agent-1", agent_function, args)
"""

from circuit_breaker import (
    CircuitBreaker,
    CircuitBreakerState,
    CircuitBreakerConfig,
    CircuitBreakerMetrics,
    CallResult,
    CircuitBreakerOpenError,
    circuit_breaker_protected
)

from ralph_circuit_breaker import (
    RalphCircuitBreaker,
    RalphCircuitBreakerConfig,
    AgentExecutionContext,
    AgentStatus,
    AgentPausedError,
    FailsafeTriggeredError
)

from failsafe_detector import (
    FailsafeDetector,
    FailsafeCondition,
    FailsafeSeverity,
    ResourceThresholds,
    ErrorThresholds,
    TaskThresholds
)

from circuit_breaker_config import (
    CircuitBreakerConfig as CBConfig,
    RetryStrategy,
    BackoffStrategy,
    RetryConfig,
    BackoffConfig,
    DEFAULT_CONSERVATIVE,
    DEFAULT_MODERATE,
    DEFAULT_AGGRESSIVE,
    CIRCUIT_BREAKER_PRESETS,
    get_preset,
    list_presets,
    create_custom_config
)

from metrics import (
    CircuitBreakerMetrics as CBMetrics,
    MetricSnapshot,
    TimeSeriesMetric,
    MetricsAggregator
)

__version__ = "1.0.0"
__all__ = [
    # Core circuit breaker
    "CircuitBreaker",
    "CircuitBreakerState",
    "CircuitBreakerConfig",
    "CircuitBreakerMetrics",
    "CallResult",
    "CircuitBreakerOpenError",
    "circuit_breaker_protected",

    # Ralph integration
    "RalphCircuitBreaker",
    "RalphCircuitBreakerConfig",
    "AgentExecutionContext",
    "AgentStatus",
    "AgentPausedError",
    "FailsafeTriggeredError",

    # Failsafe detection
    "FailsafeDetector",
    "FailsafeCondition",
    "FailsafeSeverity",
    "ResourceThresholds",
    "ErrorThresholds",
    "TaskThresholds",

    # Configuration
    "CBConfig",
    "RetryStrategy",
    "BackoffStrategy",
    "RetryConfig",
    "BackoffConfig",
    "DEFAULT_CONSERVATIVE",
    "DEFAULT_MODERATE",
    "DEFAULT_AGGRESSIVE",
    "CIRCUIT_BREAKER_PRESETS",
    "get_preset",
    "list_presets",
    "create_custom_config",

    # Metrics
    "CBMetrics",
    "MetricSnapshot",
    "TimeSeriesMetric",
    "MetricsAggregator"
]


def create_circuit_breaker(
    name: str,
    preset: str = "moderate",
    **kwargs
) -> CircuitBreaker:
    """
    Convenience function to create circuit breaker with preset

    Args:
        name: Circuit breaker name
        preset: Configuration preset name
        **kwargs: Configuration overrides

    Returns:
        Configured CircuitBreaker instance
    """
    config = create_custom_config(preset, **kwargs)
    return CircuitBreaker(name, config)


def create_ralph_circuit_breaker(**kwargs) -> RalphCircuitBreaker:
    """
    Convenience function to create Ralph circuit breaker

    Args:
        **kwargs: Configuration overrides

    Returns:
        Configured RalphCircuitBreaker instance
    """
    config = RalphCircuitBreakerConfig(**kwargs)
    return RalphCircuitBreaker(config)
