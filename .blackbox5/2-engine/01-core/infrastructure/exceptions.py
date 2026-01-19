"""
Custom exceptions for BlackBox 5 core system.

This module defines all custom exceptions used throughout
the BlackBox 5 engine for proper error handling and reporting.
"""

from typing import Optional, Any, Dict


class BlackBoxError(Exception):
    """Base exception for all BlackBox 5 errors."""

    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.error_code = error_code or self.__class__.__name__
        self.details = details or {}
        super().__init__(self.message)

    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for serialization."""
        return {
            'error_type': self.__class__.__name__,
            'error_code': self.error_code,
            'message': self.message,
            'details': self.details
        }


class EventBusError(BlackBoxError):
    """Base exception for event bus related errors."""

    def __init__(
        self,
        message: str,
        connection_error: bool = False,
        details: Optional[Dict[str, Any]] = None
    ):
        self.connection_error = connection_error
        super().__init__(message, details=details)


class RedisConnectionError(EventBusError):
    """Raised when Redis connection fails or is lost."""

    def __init__(
        self,
        message: str = "Failed to connect to Redis",
        host: Optional[str] = None,
        port: Optional[int] = None,
        retry_count: Optional[int] = None
    ):
        details = {}
        if host:
            details['host'] = host
        if port:
            details['port'] = port
        if retry_count is not None:
            details['retry_count'] = retry_count

        super().__init__(
            message=message,
            connection_error=True,
            details=details
        )


class RedisPubSubError(EventBusError):
    """Raised when Redis pub/sub operations fail."""

    def __init__(
        self,
        message: str,
        operation: Optional[str] = None,
        channel: Optional[str] = None
    ):
        details = {}
        if operation:
            details['operation'] = operation
        if channel:
            details['channel'] = channel

        super().__init__(message, details=details)


class EventValidationError(BlackBoxError):
    """Raised when event validation fails."""

    def __init__(
        self,
        message: str,
        event_type: Optional[str] = None,
        validation_errors: Optional[list] = None
    ):
        details = {}
        if event_type:
            details['event_type'] = event_type
        if validation_errors:
            details['validation_errors'] = validation_errors

        super().__init__(message, details=details)


class EventSerializationError(BlackBoxError):
    """Raised when event serialization/deserialization fails."""

    def __init__(
        self,
        message: str,
        event_data: Optional[Any] = None,
        serialization_format: Optional[str] = None
    ):
        details = {}
        if event_data:
            details['event_data'] = str(event_data)[:200]  # Truncate large data
        if serialization_format:
            details['format'] = serialization_format

        super().__init__(message, details=details)


class CircuitBreakerOpenError(BlackBoxError):
    """Raised when circuit breaker is open and operations are blocked."""

    def __init__(
        self,
        message: str = "Circuit breaker is open",
        service: Optional[str] = None,
        remaining_time: Optional[float] = None,
        failure_count: Optional[int] = None
    ):
        details = {}
        if service:
            details['service'] = service
        if remaining_time is not None:
            details['remaining_seconds'] = remaining_time
        if failure_count is not None:
            details['failure_count'] = failure_count

        super().__init__(message, details=details)


class CircuitBreakerError(BlackBoxError):
    """General circuit breaker related errors."""

    def __init__(
        self,
        message: str,
        state: Optional[str] = None,
        threshold: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        all_details = details or {}
        if state:
            all_details['state'] = state
        if threshold:
            all_details['threshold'] = threshold

        super().__init__(message, details=all_details)


class AgentNotFoundError(BlackBoxError):
    """Raised when an agent cannot be found."""

    def __init__(
        self,
        message: str = "Agent not found",
        agent_id: Optional[str] = None,
        agent_type: Optional[str] = None
    ):
        details = {}
        if agent_id:
            details['agent_id'] = agent_id
        if agent_type:
            details['agent_type'] = agent_type

        super().__init__(message, details=details)


class AgentError(BlackBoxError):
    """Base exception for agent-related errors."""

    def __init__(
        self,
        message: str,
        agent_id: Optional[str] = None,
        agent_type: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        all_details = details or {}
        if agent_id:
            all_details['agent_id'] = agent_id
        if agent_type:
            all_details['agent_type'] = agent_type

        super().__init__(message, details=all_details)


class AgentInitializationError(AgentError):
    """Raised when agent initialization fails."""

    def __init__(
        self,
        message: str = "Failed to initialize agent",
        agent_id: Optional[str] = None,
        agent_type: Optional[str] = None,
        initialization_error: Optional[str] = None
    ):
        details = {}
        if initialization_error:
            details['initialization_error'] = initialization_error

        super().__init__(
            message,
            agent_id=agent_id,
            agent_type=agent_type,
            details=details
        )


class AgentExecutionError(AgentError):
    """Raised when agent execution fails."""

    def __init__(
        self,
        message: str = "Agent execution failed",
        agent_id: Optional[str] = None,
        task_id: Optional[str] = None,
        execution_error: Optional[str] = None
    ):
        details = {}
        if task_id:
            details['task_id'] = task_id
        if execution_error:
            details['execution_error'] = execution_error

        super().__init__(
            message,
            agent_id=agent_id,
            details=details
        )


class ConfigurationError(BlackBoxError):
    """Raised when configuration is invalid or missing."""

    def __init__(
        self,
        message: str,
        config_key: Optional[str] = None,
        config_file: Optional[str] = None,
        expected_type: Optional[str] = None
    ):
        details = {}
        if config_key:
            details['config_key'] = config_key
        if config_file:
            details['config_file'] = config_file
        if expected_type:
            details['expected_type'] = expected_type

        super().__init__(message, details=details)


class StateError(BlackBoxError):
    """Raised when system state is invalid for an operation."""

    def __init__(
        self,
        message: str,
        current_state: Optional[str] = None,
        expected_state: Optional[str] = None,
        operation: Optional[str] = None
    ):
        details = {}
        if current_state:
            details['current_state'] = current_state
        if expected_state:
            details['expected_state'] = expected_state
        if operation:
            details['operation'] = operation

        super().__init__(message, details=details)


class TimeoutError(BlackBoxError):
    """Raised when an operation times out."""

    def __init__(
        self,
        message: str = "Operation timed out",
        timeout_seconds: Optional[float] = None,
        operation: Optional[str] = None
    ):
        details = {}
        if timeout_seconds:
            details['timeout_seconds'] = timeout_seconds
        if operation:
            details['operation'] = operation

        super().__init__(message, details=details)


class RetryError(BlackBoxError):
    """Raised when retry attempts are exhausted."""

    def __init__(
        self,
        message: str = "Retry attempts exhausted",
        retry_count: Optional[int] = None,
        last_error: Optional[str] = None
    ):
        details = {}
        if retry_count:
            details['retry_count'] = retry_count
        if last_error:
            details['last_error'] = last_error

        super().__init__(message, details=details)


class ValidationError(BlackBoxError):
    """Raised when input validation fails."""

    def __init__(
        self,
        message: str,
        field: Optional[str] = None,
        value: Optional[Any] = None,
        constraint: Optional[str] = None
    ):
        details = {}
        if field:
            details['field'] = field
        if value is not None:
            details['value'] = str(value)[:200]
        if constraint:
            details['constraint'] = constraint

        super().__init__(message, details=details)


# Exception handling utilities
def format_exception(error: Exception) -> Dict[str, Any]:
    """
    Format exception for logging or API responses.

    Args:
        error: The exception to format

    Returns:
        Dictionary with exception details
    """
    if isinstance(error, BlackBoxError):
        return error.to_dict()

    return {
        'error_type': error.__class__.__name__,
        'message': str(error),
        'details': {}
    }


def is_connection_error(error: Exception) -> bool:
    """
    Check if error is a connection-related error.

    Args:
        error: The exception to check

    Returns:
        True if connection error
    """
    return isinstance(error, (RedisConnectionError, EventBusError)) and (
        getattr(error, 'connection_error', False) or
        'connection' in str(error).lower()
    )


def is_recoverable_error(error: Exception) -> bool:
    """
    Check if error is recoverable (can be retried).

    Args:
        error: The exception to check

    Returns:
        True if recoverable
    """
    recoverable_types = (
        RedisConnectionError,
        TimeoutError,
        RetryError
    )

    return isinstance(error, recoverable_types)
