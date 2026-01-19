"""
Structured Logging System for Blackbox 5
"""

import structlog
import logging
import sys
from pathlib import Path
from typing import Any, Dict, Optional
from datetime import datetime
import json


def setup_logging(
    level: str = "INFO",
    log_file: Optional[Path] = None,
    json_logs: bool = True
) -> None:
    """
    Configure structured logging for Blackbox 5.

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR)
        log_file: Optional file to write logs to
        json_logs: Whether to output JSON logs (default: True)
    """
    # Configure structlog
    processors = [
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    if json_logs:
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(structlog.dev.ConsoleRenderer())

    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
        wrapper_class=structlog.stdlib.BoundLogger,
    )

    # Configure standard logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, level.upper()),
    )

    # Add file handler if specified
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(getattr(logging, level.upper()))
        logging.getLogger().addHandler(file_handler)


class AgentLogger:
    """
    Structured logger for agents with automatic context binding.
    """

    def __init__(self, agent_id: str, agent_type: str):
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.logger = structlog.get_logger()
        self.logger = self.logger.bind(
            agent_id=agent_id,
            agent_type=agent_type
        )

    def task_start(self, task_id: str, task_description: str, **kwargs):
        """Log task start"""
        self.logger.info(
            "task.start",
            task_id=task_id,
            task_description=task_description,
            **kwargs
        )

    def task_progress(self, task_id: str, progress: float, message: str, **kwargs):
        """Log task progress"""
        self.logger.info(
            "task.progress",
            task_id=task_id,
            progress=progress,
            message=message,
            **kwargs
        )

    def task_success(self, task_id: str, result: Any, **kwargs):
        """Log task success"""
        self.logger.info(
            "task.success",
            task_id=task_id,
            result_type=type(result).__name__,
            **kwargs
        )

    def task_failure(self, task_id: str, error: str, exc_info=False, **kwargs):
        """Log task failure"""
        self.logger.error(
            "task.failed",
            task_id=task_id,
            error=error,
            exc_info=exc_info,
            **kwargs
        )

    def agent_event(self, event_type: str, **kwargs):
        """Log agent event"""
        self.logger.info(
            f"agent.{event_type}",
            **kwargs
        )

    def bind_context(self, **kwargs) -> 'AgentLogger':
        """Create new logger with additional context"""
        new_logger = AgentLogger(self.agent_id, self.agent_type)
        new_logger.logger = self.logger.bind(**kwargs)
        return new_logger


class OperationLogger:
    """
    Logger for tracking multi-agent operations.
    """

    def __init__(self, operation_id: str):
        self.operation_id = operation_id
        self.logger = structlog.get_logger()
        self.logger = self.logger.bind(operation_id=operation_id)
        self.start_time = datetime.now()

    def operation_start(self, operation_type: str, description: str, **kwargs):
        """Log operation start"""
        self.logger.info(
            "operation.start",
            operation_type=operation_type,
            description=description,
            **kwargs
        )

    def operation_step(self, step: str, **kwargs):
        """Log operation step"""
        self.logger.info(
            "operation.step",
            step=step,
            **kwargs
        )

    def operation_complete(self, result: Any, **kwargs):
        """Log operation completion"""
        duration = (datetime.now() - self.start_time).total_seconds()
        self.logger.info(
            "operation.complete",
            duration_seconds=duration,
            result_type=type(result).__name__,
            **kwargs
        )

    def operation_failure(self, error: str, exc_info=False, **kwargs):
        """Log operation failure"""
        duration = (datetime.now() - self.start_time).total_seconds()
        self.logger.error(
            "operation.failed",
            duration_seconds=duration,
            error=error,
            exc_info=exc_info,
            **kwargs
        )


# Convenience functions
def get_agent_logger(agent_id: str, agent_type: str) -> AgentLogger:
    """Get a logger for an agent"""
    return AgentLogger(agent_id, agent_type)


def get_operation_logger(operation_id: str) -> OperationLogger:
    """Get a logger for an operation"""
    return OperationLogger(operation_id)
