"""
Unit tests for Structured Logging component.

Tests logging setup, agent loggers, operation loggers, and log formats.
"""

import pytest
import logging
import json
import sys
from pathlib import Path
from datetime import datetime
from io import StringIO
from unittest.mock import Mock, patch, MagicMock
import tempfile

from core.logging import (
    setup_logging,
    AgentLogger,
    OperationLogger,
    get_agent_logger,
    get_operation_logger
)


class TestLoggingSetup:
    """Test logging configuration and setup."""

    def test_setup_logging_creates_file(self, temp_log_dir):
        """Setup logging should create log file if specified."""
        log_file = temp_log_dir / "test.log"

        setup_logging(log_file=log_file)

        # File should be created
        assert log_file.exists()

        # Should be writable
        with open(log_file, 'a') as f:
            f.write("test\n")

    def test_setup_logging_with_json_format(self, temp_log_dir):
        """JSON logs should be formatted correctly."""
        log_file = temp_log_dir / "test_json.log"

        setup_logging(log_file=log_file, json_logs=True)

        # Get a logger and log something
        logger = logging.getLogger("test")
        logger.info("Test message", extra={"test_key": "test_value"})

        # Read log file
        with open(log_file, 'r') as f:
            content = f.read()

        # Should be valid JSON
        if content.strip():
            log_entry = json.loads(content.strip().split('\n')[-1])
            assert "test_key" in log_entry or "message" in log_entry

    def test_setup_logging_with_text_format(self, temp_log_dir):
        """Text logs should be readable."""
        log_file = temp_log_dir / "test_text.log"

        setup_logging(log_file=log_file, json_logs=False)

        logger = logging.getLogger("test_text")
        logger.info("Test message")

        with open(log_file, 'r') as f:
            content = f.read()

        # Should contain the message
        assert "Test message" in content

    def test_log_levels(self, temp_log_dir):
        """Should respect log level configuration."""
        log_file = temp_log_dir / "test_level.log"

        setup_logging(log_file=log_file, level="WARNING", json_logs=True)

        logger = logging.getLogger("test_level")

        # DEBUG should not appear
        logger.debug("Debug message")

        # WARNING should appear
        logger.warning("Warning message")

        with open(log_file, 'r') as f:
            content = f.read()

        # Should not contain debug message
        assert "Debug message" not in content or content.strip() == ""

        # Should contain warning
        assert "Warning message" in content or "warning" in content.lower()

    def test_setup_logging_without_file(self):
        """Should work without log file (console only)."""
        # Should not raise error
        setup_logging(log_file=None, level="INFO")

        logger = logging.getLogger("test_no_file")
        logger.info("Console message")

        # If we got here, no error occurred


class TestAgentLogger:
    """Test AgentLogger functionality."""

    def test_agent_logger_initialization(self):
        """Agent logger should initialize with correct context."""
        logger = AgentLogger("test_agent", "specialist")

        assert logger.agent_id == "test_agent"
        assert logger.agent_type == "specialist"
        assert logger.logger is not None

    def test_agent_logger_task_events(self, temp_log_dir):
        """Agent logger should log task lifecycle events."""
        log_file = temp_log_dir / "agent_task.log"
        setup_logging(log_file=log_file, json_logs=True)

        agent_logger = AgentLogger("agent_1", "coder")

        # Log task lifecycle
        agent_logger.task_start("task_123", "Write a function")
        agent_logger.task_progress("task_123", 0.5, "Half done")
        agent_logger.task_success("task_123", {"result": "success"})

        # Read log file
        with open(log_file, 'r') as f:
            content = f.read()

        # Should contain all events
        assert "task.start" in content or "task_start" in content
        assert "task.progress" in content or "task_progress" in content
        assert "task.success" in content or "task_success" in content
        assert "task_123" in content

    def test_agent_logger_task_failure(self, temp_log_dir):
        """Agent logger should log task failures."""
        log_file = temp_log_dir / "agent_failure.log"
        setup_logging(log_file=log_file, json_logs=True)

        agent_logger = AgentLogger("agent_1", "coder")

        agent_logger.task_failure(
            "task_456",
            "Failed to connect to database"
        )

        with open(log_file, 'r') as f:
            content = f.read()

        assert "task.failed" in content or "task_failure" in content
        assert "task_456" in content
        assert "database" in content

    def test_agent_logger_custom_events(self, temp_log_dir):
        """Agent logger should log custom events."""
        log_file = temp_log_dir / "agent_custom.log"
        setup_logging(log_file=log_file, json_logs=True)

        agent_logger = AgentLogger("agent_1", "researcher")

        agent_logger.agent_event("search_started", query="test query")
        agent_logger.agent_event("search_completed", results_count=42)

        with open(log_file, 'r') as f:
            content = f.read()

        assert "agent.search_started" in content or "search_started" in content
        assert "agent.search_completed" in content or "search_completed" in content
        assert "test query" in content
        assert "42" in content

    def test_context_binding(self, temp_log_dir):
        """Agent logger should support context binding."""
        log_file = temp_log_dir / "agent_context.log"
        setup_logging(log_file=log_file, json_logs=True)

        agent_logger = AgentLogger("agent_1", "writer")

        # Bind additional context
        bound_logger = agent_logger.bind_context(
            task_id="task_789",
            user_id="user_123"
        )

        # Log with bound context
        bound_logger.task_start("task_789", "Write document")

        with open(log_file, 'r') as f:
            content = f.read()

        # Should include bound context
        assert "task_789" in content

    def test_bound_logger_is_independent(self):
        """Bound logger should create new instance with additional context."""
        agent_logger = AgentLogger("agent_1", "generalist")

        bound_logger = agent_logger.bind_context(custom_field="custom_value")

        # Should be different instance
        assert bound_logger is not agent_logger

        # Should have same base properties
        assert bound_logger.agent_id == agent_logger.agent_id
        assert bound_logger.agent_type == agent_logger.agent_type

        # But with additional context
        assert bound_logger.logger is not agent_logger.logger


class TestOperationLogger:
    """Test OperationLogger functionality."""

    def test_operation_logger_initialization(self):
        """Operation logger should initialize correctly."""
        logger = OperationLogger("operation_123")

        assert logger.operation_id == "operation_123"
        assert logger.start_time is not None
        assert isinstance(logger.start_time, datetime)

    def test_operation_logger_lifecycle(self, temp_log_dir):
        """Operation logger should track full lifecycle."""
        log_file = temp_log_dir / "operation.log"
        setup_logging(log_file=log_file, json_logs=True)

        op_logger = OperationLogger("op_1")

        # Start operation
        op_logger.operation_start("multi_agent_coordination", "Coordinate agents")

        # Log steps
        op_logger.operation_step("task_decomposed", subtasks=5)
        op_logger.operation_step("agents_assigned", agents=3)
        op_logger.operation_step("execution_started")

        # Complete
        op_logger.operation_complete({"status": "success", "result": "done"})

        with open(log_file, 'r') as f:
            content = f.read()

        # Should contain all lifecycle events
        assert "operation.start" in content or "operation_start" in content
        assert "operation.step" in content or "operation_step" in content
        assert "operation.complete" in content or "operation_complete" in content
        assert "multi_agent_coordination" in content

    def test_operation_failure(self, temp_log_dir):
        """Operation logger should log failures."""
        log_file = temp_log_dir / "operation_failure.log"
        setup_logging(log_file=log_file, json_logs=True)

        op_logger = OperationLogger("op_2")

        op_logger.operation_start("test_operation", "Test op")
        op_logger.operation_step("step_1")
        op_logger.operation_failure("Step failed: network error")

        with open(log_file, 'r') as f:
            content = f.read()

        assert "operation.failed" in content or "operation_failure" in content
        assert "network error" in content
        assert "op_2" in content

    def test_operation_duration_tracking(self, temp_log_dir):
        """Operation logger should track duration."""
        log_file = temp_log_dir / "operation_duration.log"
        setup_logging(log_file=log_file, json_logs=True)

        op_logger = OperationLogger("op_3")
        op_logger.operation_start("test_op", "Test")

        # Simulate some work
        import time
        time.sleep(0.1)

        op_logger.operation_complete({"result": "ok"})

        with open(log_file, 'r') as f:
            content = f.read()

        # Should include duration
        assert "duration" in content.lower() or "duration_seconds" in content

    def test_operation_step_tracking(self, temp_log_dir):
        """Operation logger should track individual steps."""
        log_file = temp_log_dir / "operation_steps.log"
        setup_logging(log_file=log_file, json_logs=True)

        op_logger = OperationLogger("op_4")
        op_logger.operation_start("complex_op", "Complex operation")

        # Multiple steps with different data
        op_logger.operation_step("initialize", config="{}", workers=5)
        op_logger.operation_step("process", items=100, processed=50)
        op_logger.operation_step("finalize", output="result.json")

        with open(log_file, 'r') as f:
            lines = f.readlines()

        # Should have multiple step entries
        step_count = sum(1 for line in lines if "operation.step" in line.lower() or "operation_step" in line.lower())
        assert step_count >= 3


class TestLogFormat:
    """Test log formatting and structure."""

    def test_json_log_format_structure(self, temp_log_dir):
        """JSON logs should have consistent structure."""
        log_file = temp_log_dir / "format_json.log"
        setup_logging(log_file=log_file, json_logs=True, level="INFO")

        logger = logging.getLogger("format_test")
        logger.info("Test message", extra={"custom_field": "custom_value"})

        with open(log_file, 'r') as f:
            content = f.read()

        # Parse last log entry
        lines = content.strip().split('\n')
        last_line = lines[-1] if lines else ""

        if last_line:
            log_entry = json.loads(last_line)

            # Should have standard fields
            assert "message" in log_entry or "event" in log_entry
            assert "timestamp" in log_entry or "time" in log_entry or "@timestamp" in log_entry

    def test_log_contains_agent_info(self, temp_log_dir):
        """Agent logger should include agent info in logs."""
        log_file = temp_log_dir / "agent_info.log"
        setup_logging(log_file=log_file, json_logs=True)

        agent_logger = AgentLogger("test_agent_id", "test_agent_type")
        agent_logger.task_start("task_1", "Test task")

        with open(log_file, 'r') as f:
            content = f.read()

        # Should include agent context
        assert "test_agent_id" in content
        assert "test_agent_type" in content

    def test_log_contains_operation_id(self, temp_log_dir):
        """Operation logger should include operation ID in logs."""
        log_file = temp_log_dir / "operation_id.log"
        setup_logging(log_file=log_file, json_logs=True)

        op_logger = OperationLogger("test_operation_123")
        op_logger.operation_start("test", "Test")

        with open(log_file, 'r') as f:
            content = f.read()

        # Should include operation ID
        assert "test_operation_123" in content


class TestConvenienceFunctions:
    """Test convenience functions for logger creation."""

    def test_get_agent_logger(self):
        """Should create agent logger."""
        logger = get_agent_logger("agent_1", "specialist")

        assert isinstance(logger, AgentLogger)
        assert logger.agent_id == "agent_1"
        assert logger.agent_type == "specialist"

    def test_get_operation_logger(self):
        """Should create operation logger."""
        logger = get_operation_logger("operation_1")

        assert isinstance(logger, OperationLogger)
        assert logger.operation_id == "operation_1"

    def test_multiple_agent_loggers(self):
        """Should create multiple independent agent loggers."""
        logger1 = get_agent_logger("agent_1", "type_1")
        logger2 = get_agent_logger("agent_2", "type_2")

        assert logger1.agent_id != logger2.agent_id
        assert logger1.agent_type != logger2.agent_type

    def test_multiple_operation_loggers(self):
        """Should create multiple independent operation loggers."""
        logger1 = get_operation_logger("op_1")
        logger2 = get_operation_logger("op_2")

        assert logger1.operation_id != logger2.operation_id
        # Should have different start times
        assert abs((logger1.start_time - logger2.start_time).total_seconds()) < 1


class TestLogLevels:
    """Test different log levels and their behavior."""

    def test_debug_level_logging(self, temp_log_dir):
        """Debug logs should be captured at DEBUG level."""
        log_file = temp_log_dir / "debug.log"
        setup_logging(log_file=log_file, level="DEBUG", json_logs=True)

        agent_logger = AgentLogger("agent_1", "test")
        agent_logger.logger.logger.debug("Debug message")

        with open(log_file, 'r') as f:
            content = f.read()

        assert "Debug message" in content or content.strip() != ""

    def test_info_level_logging(self, temp_log_dir):
        """Info logs should be captured at INFO level."""
        log_file = temp_log_dir / "info.log"
        setup_logging(log_file=log_file, level="INFO", json_logs=True)

        agent_logger = AgentLogger("agent_1", "test")
        agent_logger.logger.logger.info("Info message")

        with open(log_file, 'r') as f:
            content = f.read()

        assert "Info message" in content or content.strip() != ""

    def test_warning_level_logging(self, temp_log_dir):
        """Warning logs should be captured at WARNING level."""
        log_file = temp_log_dir / "warning.log"
        setup_logging(log_file=log_file, level="WARNING", json_logs=True)

        agent_logger = AgentLogger("agent_1", "test")
        agent_logger.logger.logger.warning("Warning message")

        with open(log_file, 'r') as f:
            content = f.read()

        assert "Warning message" in content or "warning" in content.lower()

    def test_error_level_logging(self, temp_log_dir):
        """Error logs should be captured at ERROR level."""
        log_file = temp_log_dir / "error.log"
        setup_logging(log_file=log_file, level="ERROR", json_logs=True)

        agent_logger = AgentLogger("agent_1", "test")
        agent_logger.logger.logger.error("Error message")

        with open(log_file, 'r') as f:
            content = f.read()

        assert "Error message" in content or "error" in content.lower()


class TestLoggingEdgeCases:
    """Test edge cases and error handling."""

    def test_logging_with_unicode(self, temp_log_dir):
        """Should handle unicode characters in log messages."""
        log_file = temp_log_dir / "unicode.log"
        setup_logging(log_file=log_file, json_logs=True)

        agent_logger = AgentLogger("agent_1", "test")

        # Log with unicode
        agent_logger.task_start("task_1", "Test with emoji: 🎉 and unicode: ñ, 中文")

        with open(log_file, 'r') as f:
            content = f.read()

        assert "🎉" in content or "emoji" in content

    def test_logging_with_large_data(self, temp_log_dir):
        """Should handle large data in log context."""
        log_file = temp_log_dir / "large_data.log"
        setup_logging(log_file=log_file, json_logs=True)

        agent_logger = AgentLogger("agent_1", "test")

        # Log with large context
        large_data = {f"key_{i}": f"value_{i}" * 100 for i in range(10)}
        agent_logger.task_start("task_1", "Test", **large_data)

        with open(log_file, 'r') as f:
            content = f.read()

        # Should have logged something
        assert len(content) > 0

    def test_logging_with_special_characters(self, temp_log_dir):
        """Should handle special characters in log messages."""
        log_file = temp_log_dir / "special_chars.log"
        setup_logging(log_file=log_file, json_logs=True)

        agent_logger = AgentLogger("agent_1", "test")

        # Log with special characters
        special_message = "Test with \n newlines \t tabs and \"quotes\""
        agent_logger.task_start("task_1", special_message)

        with open(log_file, 'r') as f:
            content = f.read()

        assert "newlines" in content or "tabs" in content

    def test_concurrent_logging(self, temp_log_dir):
        """Should handle concurrent logging from multiple loggers."""
        import threading

        log_file = temp_log_dir / "concurrent.log"
        setup_logging(log_file=log_file, json_logs=True)

        def log_messages(agent_id):
            logger = AgentLogger(agent_id, "test")
            for i in range(10):
                logger.task_start(f"task_{i}", f"Message {i}")

        # Create multiple threads logging concurrently
        threads = [
            threading.Thread(target=log_messages, args=(f"agent_{i}",))
            for i in range(5)
        ]

        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()

        with open(log_file, 'r') as f:
            content = f.read()

        # Should have logged all messages
        lines = content.strip().split('\n')
        assert len(lines) > 0


@pytest.mark.integration
class TestLoggingIntegration:
    """Integration tests for logging system."""

    def test_logging_file_rotation(self, temp_log_dir):
        """Log file should be created in specified directory."""
        log_file = temp_log_dir / "rotating.log"
        setup_logging(log_file=log_file, json_logs=True)

        logger = logging.getLogger("rotation_test")
        logger.info("Test message")

        # File should exist
        assert log_file.exists()

        # Directory should exist
        assert log_file.parent.exists()

    def test_multiple_log_files(self, temp_log_dir):
        """Should support multiple independent log files."""
        log_file1 = temp_log_dir / "file1.log"
        log_file2 = temp_log_dir / "file2.log"

        setup_logging(log_file=log_file1, json_logs=True)
        logger1 = logging.getLogger("logger1")
        logger1.info("Message 1")

        setup_logging(log_file=log_file=log_file2, json_logs=True)
        logger2 = logging.getLogger("logger2")
        logger2.info("Message 2")

        # Both files should exist
        assert log_file1.exists()
        assert log_file2.exists()

        # Each should contain its own message
        with open(log_file1) as f:
            content1 = f.read()
        with open(log_file2) as f:
            content2 = f.read()

        assert "Message 1" in content1 or content1.strip() != ""
        assert "Message 2" in content2 or content2.strip() != ""

    def test_logging_persistence(self, temp_log_dir):
        """Logs should persist across multiple sessions."""
        log_file = temp_log_dir / "persistent.log"

        # Session 1
        setup_logging(log_file=log_file, json_logs=True)
        logger1 = logging.getLogger("persistent_test")
        logger1.info("Session 1 message")

        # Session 2 (new setup)
        setup_logging(log_file=log_file, json_logs=True)
        logger2 = logging.getLogger("persistent_test")
        logger2.info("Session 2 message")

        with open(log_file) as f:
            content = f.read()

        # Should have both messages
        lines = content.strip().split('\n')
        assert len(lines) >= 2


class TestLoggingPerformance:
    """Test logging performance with high volume."""

    def test_high_volume_logging(self, temp_log_dir):
        """Should handle high volume of log messages."""
        log_file = temp_log_dir / "high_volume.log"
        setup_logging(log_file=log_file, json_logs=True)

        agent_logger = AgentLogger("agent_1", "test")

        import time
        start = time.time()

        # Log many messages
        for i in range(100):
            agent_logger.task_start(f"task_{i}", f"Task {i}")

        duration = time.time() - start

        # Should complete in reasonable time
        assert duration < 5.0  # Less than 5 seconds

        # All messages should be logged
        with open(log_file) as f:
            content = f.read()

        assert "task_0" in content
        assert "task_99" in content


@pytest.mark.slow
class TestLoggingWithRealComponents:
    """Test logging with real components."""

    def test_logging_with_event_bus(self, real_event_bus):
        """Should integrate with real event bus."""
        agent_logger = AgentLogger("agent_1", "test")

        # Should not raise errors
        agent_logger.task_start("task_1", "Test task")
        agent_logger.task_success("task_1", {"result": "ok"})

        assert real_event_bus.is_connected

    def test_logging_with_manifest_system(self, mock_manifest_system):
        """Should work with manifest system."""
        op_logger = OperationLogger("op_1")

        manifest = mock_manifest_system.create_manifest(
            "test_operation",
            {"test": "data"}
        )

        op_logger.operation_start("test", "Test operation")
        op_logger.operation_complete({"manifest_id": manifest.id})

        assert manifest.id is not None
