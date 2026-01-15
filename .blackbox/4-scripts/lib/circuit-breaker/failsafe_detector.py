#!/usr/bin/env python3
"""
Failsafe Detector for Ralph Runtime

This module provides comprehensive failsafe detection for autonomous
agent execution, monitoring resources, error rates, and dangerous conditions.
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum, auto
import psutil
import threading


class FailsafeSeverity(Enum):
    """Severity levels for failsafe conditions"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class FailsafeCondition:
    """Represents a failsafe condition"""
    condition_type: str
    severity: str
    message: str
    threshold: float
    current_value: float
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)


class ResourceThresholds:
    """Resource monitoring thresholds"""

    def __init__(
        self,
        cpu_percent: float = 90.0,
        memory_percent: float = 90.0,
        disk_percent: float = 90.0,
        temperature: Optional[float] = None
    ):
        self.cpu_percent = cpu_percent
        self.memory_percent = memory_percent
        self.disk_percent = disk_percent
        self.temperature = temperature


class ErrorThresholds:
    """Error rate thresholds"""

    def __init__(
        self,
        error_rate_percent: float = 50.0,
        consecutive_errors: int = 5,
        error_window_seconds: int = 60
    ):
        self.error_rate_percent = error_rate_percent
        self.consecutive_errors = consecutive_errors
        self.error_window_seconds = error_window_seconds


class TaskThresholds:
    """Task execution thresholds"""

    def __init__(
        self,
        max_iterations: int = 100,
        max_duration_seconds: int = 300,
        stuck_detection_iterations: int = 10
    ):
        self.max_iterations = max_iterations
        self.max_duration_seconds = max_duration_seconds
        self.stuck_detection_iterations = stuck_detection_iterations


class FailsafeDetector:
    """
    Comprehensive Failsafe Detection

    Monitors system resources, error rates, and task execution
    to detect dangerous conditions that require intervention.
    """

    def __init__(self, config) -> None:
        """
        Initialize failsafe detector

        Args:
            config: RalphCircuitBreakerConfig instance
        """
        self.config = config
        self.resource_thresholds = ResourceThresholds(
            cpu_percent=config.cpu_threshold,
            memory_percent=config.memory_threshold,
            disk_percent=config.disk_threshold
        )
        self.error_thresholds = ErrorThresholds()
        self.task_thresholds = TaskThresholds(
            stuck_detection_iterations=config.stuck_task_threshold
        )

        self._error_history: List[Dict] = []
        self._task_history: Dict[str, Dict] = {}
        self._lock = threading.RLock()

    def check_all(self) -> List[FailsafeCondition]:
        """
        Check all failsafe conditions

        Returns:
            List of triggered failsafe conditions
        """
        conditions = []

        # Check resources
        conditions.extend(self.check_resource_limits())

        # Check error rates
        conditions.extend(self.check_error_rate())

        # Check stuck tasks
        conditions.extend(self.check_stuck_tasks())

        return conditions

    def check_resource_limits(self) -> List[FailsafeCondition]:
        """
        Check system resource limits

        Returns:
            List of triggered resource conditions
        """
        conditions = []

        try:
            # CPU
            cpu_percent = psutil.cpu_percent(interval=1)
            if cpu_percent >= self.resource_thresholds.cpu_percent:
                conditions.append(FailsafeCondition(
                    condition_type="high_cpu",
                    severity=self._get_severity(cpu_percent, 95, 99),
                    message=f"High CPU usage: {cpu_percent:.1f}%",
                    threshold=self.resource_thresholds.cpu_percent,
                    current_value=cpu_percent,
                    metadata={'cpu_count': psutil.cpu_count()}
                ))

            # Memory
            memory = psutil.virtual_memory()
            if memory.percent >= self.resource_thresholds.memory_percent:
                conditions.append(FailsafeCondition(
                    condition_type="high_memory",
                    severity=self._get_severity(memory.percent, 95, 98),
                    message=f"High memory usage: {memory.percent:.1f}%",
                    threshold=self.resource_thresholds.memory_percent,
                    current_value=memory.percent,
                    metadata={
                        'available_gb': memory.available / (1024**3),
                        'total_gb': memory.total / (1024**3)
                    }
                ))

            # Disk
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            if disk_percent >= self.resource_thresholds.disk_percent:
                conditions.append(FailsafeCondition(
                    condition_type="high_disk",
                    severity=self._get_severity(disk_percent, 95, 98),
                    message=f"High disk usage: {disk_percent:.1f}%",
                    threshold=self.resource_thresholds.disk_percent,
                    current_value=disk_percent,
                    metadata={
                        'free_gb': disk.free / (1024**3),
                        'total_gb': disk.total / (1024**3)
                    }
                ))

        except Exception as e:
            # Log but don't fail - resource monitoring is best-effort
            pass

        return conditions

    def check_error_rate(self) -> List[FailsafeCondition]:
        """
        Check error rates against thresholds

        Returns:
            List of triggered error conditions
        """
        conditions = []

        with self._lock:
            now = datetime.now()
            window_start = now - timedelta(
                seconds=self.error_thresholds.error_window_seconds
            )

            # Filter errors within window
            recent_errors = [
                e for e in self._error_history
                if datetime.fromisoformat(e['timestamp']) >= window_start
            ]

            if not recent_errors:
                return conditions

            # Calculate error rate
            total_calls = sum(e['total_calls'] for e in recent_errors)
            total_errors = sum(e['error_count'] for e in recent_errors)

            if total_calls > 0:
                error_rate = (total_errors / total_calls) * 100
                if error_rate >= self.error_thresholds.error_rate_percent:
                    conditions.append(FailsafeCondition(
                        condition_type="high_error_rate",
                        severity=self._get_severity(error_rate, 70, 90),
                        message=f"High error rate: {error_rate:.1f}%",
                        threshold=self.error_thresholds.error_rate_percent,
                        current_value=error_rate,
                        metadata={
                            'total_errors': total_errors,
                            'total_calls': total_calls
                        }
                    ))

            # Check consecutive errors
            consecutive_errors = self._get_consecutive_errors()
            if consecutive_errors >= self.error_thresholds.consecutive_errors:
                conditions.append(FailsafeCondition(
                    condition_type="consecutive_errors",
                    severity="high",
                    message=f"Consecutive errors detected: {consecutive_errors}",
                    threshold=self.error_thresholds.consecutive_errors,
                    current_value=consecutive_errors
                ))

        return conditions

    def check_stuck_tasks(self) -> List[FailsafeCondition]:
        """
        Check for stuck or looping tasks

        Returns:
            List of triggered stuck task conditions
        """
        conditions = []

        with self._lock:
            now = datetime.now()

            for task_id, task_info in self._task_history.items():
                # Check iteration count
                if task_info.get('iterations', 0) >= self.task_thresholds.max_iterations:
                    conditions.append(FailsafeCondition(
                        condition_type="max_iterations",
                        severity="high",
                        message=f"Task exceeded max iterations: {task_info['iterations']}",
                        threshold=self.task_thresholds.max_iterations,
                        current_value=task_info['iterations'],
                        metadata={'task_id': task_id}
                    ))

                # Check duration
                if 'start_time' in task_info:
                    duration = (now - task_info['start_time']).total_seconds()
                    if duration >= self.task_thresholds.max_duration_seconds:
                        conditions.append(FailsafeCondition(
                            condition_type="max_duration",
                            severity="high",
                            message=f"Task exceeded max duration: {duration:.0f}s",
                            threshold=self.task_thresholds.max_duration_seconds,
                            current_value=duration,
                            metadata={'task_id': task_id}
                        ))

                # Check for stuck condition (no progress)
                if 'last_progress' in task_info:
                    progress_stuck = (now - task_info['last_progress']).total_seconds()
                    if progress_stuck > 120:  # No progress for 2 minutes
                        conditions.append(FailsafeCondition(
                            condition_type="stuck_task",
                            severity="medium",
                            message=f"Task appears stuck (no progress for {progress_stuck:.0f}s)",
                            threshold=120,
                            current_value=progress_stuck,
                            metadata={'task_id': task_id}
                        ))

        return conditions

    def check_confidence(self, confidence: float) -> List[FailsafeCondition]:
        """
        Check confidence level

        Args:
            confidence: Confidence value (0-1)

        Returns:
            List of triggered confidence conditions
        """
        conditions = []
        threshold = 0.3

        if confidence < threshold:
            conditions.append(FailsafeCondition(
                condition_type="low_confidence",
                severity="medium" if confidence > 0.1 else "high",
                message=f"Low confidence detected: {confidence:.2f}",
                threshold=threshold,
                current_value=confidence
            ))

        return conditions

    def record_error(self, error_count: int = 1, total_calls: int = 1) -> None:
        """
        Record error occurrence

        Args:
            error_count: Number of errors
            total_calls: Total calls made
        """
        with self._lock:
            self._error_history.append({
                'timestamp': datetime.now().isoformat(),
                'error_count': error_count,
                'total_calls': total_calls
            })

            # Keep only recent history
            if len(self._error_history) > 1000:
                self._error_history = self._error_history[-1000:]

    def record_task_start(self, task_id: str) -> None:
        """
        Record task start

        Args:
            task_id: Task identifier
        """
        with self._lock:
            self._task_history[task_id] = {
                'start_time': datetime.now(),
                'iterations': 0,
                'last_progress': datetime.now()
            }

    def record_task_progress(self, task_id: str, iterations: int = None) -> None:
        """
        Record task progress

        Args:
            task_id: Task identifier
            iterations: Iteration count
        """
        with self._lock:
            if task_id in self._task_history:
                self._task_history[task_id]['last_progress'] = datetime.now()
                if iterations is not None:
                    self._task_history[task_id]['iterations'] = iterations

    def record_task_complete(self, task_id: str) -> None:
        """
        Record task completion

        Args:
            task_id: Task identifier
        """
        with self._lock:
            if task_id in self._task_history:
                del self._task_history[task_id]

    def _get_consecutive_errors(self) -> int:
        """Get count of consecutive errors"""
        if not self._error_history:
            return 0

        count = 0
        for error in reversed(self._error_history):
            if error['error_count'] > 0:
                count += 1
            else:
                break

        return count

    def _get_severity(
        self,
        value: float,
        high_threshold: float,
        critical_threshold: float
    ) -> str:
        """
        Determine severity based on value

        Args:
            value: Current value
            high_threshold: Threshold for high severity
            critical_threshold: Threshold for critical severity

        Returns:
            Severity level
        """
        if value >= critical_threshold:
            return "critical"
        elif value >= high_threshold:
            return "high"
        else:
            return "medium"

    def get_status(self) -> Dict[str, Any]:
        """Get current failsafe detector status"""
        with self._lock:
            return {
                'resource_thresholds': {
                    'cpu_percent': self.resource_thresholds.cpu_percent,
                    'memory_percent': self.resource_thresholds.memory_percent,
                    'disk_percent': self.resource_thresholds.disk_percent
                },
                'error_thresholds': {
                    'error_rate_percent': self.error_thresholds.error_rate_percent,
                    'consecutive_errors': self.error_thresholds.consecutive_errors,
                    'error_window_seconds': self.error_thresholds.error_window_seconds
                },
                'task_thresholds': {
                    'max_iterations': self.task_thresholds.max_iterations,
                    'max_duration_seconds': self.task_thresholds.max_duration_seconds,
                    'stuck_detection_iterations': self.task_thresholds.stuck_detection_iterations
                },
                'error_history_size': len(self._error_history),
                'active_tasks': len(self._task_history),
                'conditions': self.check_all()
            }

    def reset(self) -> None:
        """Reset all detector state"""
        with self._lock:
            self._error_history.clear()
            self._task_history.clear()
