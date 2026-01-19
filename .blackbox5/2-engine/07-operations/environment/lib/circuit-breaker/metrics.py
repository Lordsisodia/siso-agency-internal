#!/usr/bin/env python3
"""
Circuit Breaker Metrics

This module provides comprehensive metrics tracking, aggregation,
and export functionality for circuit breakers.
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json
from collections import defaultdict


@dataclass
class MetricSnapshot:
    """Snapshot of metrics at a point in time"""
    timestamp: datetime
    total_calls: int
    successful_calls: int
    failed_calls: int
    rejected_calls: int
    success_rate: float
    failure_rate: float
    avg_duration_ms: float


@dataclass
class TimeSeriesMetric:
    """Time series metric data point"""
    timestamp: datetime
    value: float
    labels: Dict[str, str] = field(default_factory=dict)


class CircuitBreakerMetrics:
    """
    Track and aggregate circuit breaker metrics

    Provides comprehensive metrics collection with support for
    time-series data, statistics, and export to various formats.
    """

    def __init__(self, name: str):
        """
        Initialize metrics tracker

        Args:
            name: Circuit breaker name
        """
        self.name = name
        self._call_history: List[Dict] = []
        self._state_transitions: List[Dict] = []
        self._snapshots: List[MetricSnapshot] = []
        self._time_series: Dict[str, List[TimeSeriesMetric]] = defaultdict(list)
        self._start_time = datetime.now()
        self._lock = None  # Simple implementation without locking

    def record_call(
        self,
        success: bool,
        duration_ms: float,
        error: Optional[Exception] = None
    ) -> None:
        """
        Record a call attempt

        Args:
            success: Whether call was successful
            duration_ms: Call duration in milliseconds
            error: Exception if failed
        """
        now = datetime.now()

        self._call_history.append({
            'timestamp': now.isoformat(),
            'success': success,
            'duration_ms': duration_ms,
            'error': str(error) if error else None
        })

        # Record time series
        self._record_time_series('calls', 1.0, {'result': 'success' if success else 'failure'})
        self._record_time_series('duration_ms', duration_ms)
        self._record_time_series('success_rate', 1.0 if success else 0.0)

    def record_state_transition(
        self,
        from_state: str,
        to_state: str,
        reason: str = ""
    ) -> None:
        """
        Record state transition

        Args:
            from_state: Previous state
            to_state: New state
            reason: Transition reason
        """
        now = datetime.now()

        self._state_transitions.append({
            'timestamp': now.isoformat(),
            'from': from_state,
            'to': to_state,
            'reason': reason
        })

        self._record_time_series('state_transition', 1.0, {
            'from': from_state,
            'to': to_state
        })

    def take_snapshot(self) -> MetricSnapshot:
        """
        Take snapshot of current metrics

        Returns:
            MetricSnapshot instance
        """
        stats = self.get_statistics()
        snapshot = MetricSnapshot(
            timestamp=datetime.now(),
            total_calls=stats['total_calls'],
            successful_calls=stats['successful_calls'],
            failed_calls=stats['failed_calls'],
            rejected_calls=stats['rejected_calls'],
            success_rate=stats['success_rate'],
            failure_rate=stats['failure_rate'],
            avg_duration_ms=stats['avg_duration_ms']
        )

        self._snapshots.append(snapshot)
        return snapshot

    def get_statistics(self) -> Dict[str, Any]:
        """
        Get current statistics

        Returns:
            Statistics dictionary
        """
        total_calls = len(self._call_history)
        successful_calls = len([c for c in self._call_history if c['success']])
        failed_calls = total_calls - successful_calls

        success_rate = 0.0
        if total_calls > 0:
            success_rate = (successful_calls / total_calls) * 100

        failure_rate = 100.0 - success_rate

        avg_duration = 0.0
        if self._call_history:
            durations = [c['duration_ms'] for c in self._call_history]
            avg_duration = sum(durations) / len(durations)

        return {
            'name': self.name,
            'total_calls': total_calls,
            'successful_calls': successful_calls,
            'failed_calls': failed_calls,
            'rejected_calls': 0,  # To be tracked separately
            'success_rate': round(success_rate, 2),
            'failure_rate': round(failure_rate, 2),
            'avg_duration_ms': round(avg_duration, 2),
            'state_transitions': len(self._state_transitions),
            'uptime_seconds': (datetime.now() - self._start_time).total_seconds()
        }

    def get_recent_history(self, minutes: int = 5) -> List[Dict]:
        """
        Get recent call history

        Args:
            minutes: Minutes of history to return

        Returns:
            List of recent calls
        """
        cutoff = datetime.now() - timedelta(minutes=minutes)

        return [
            call for call in self._call_history
            if datetime.fromisoformat(call['timestamp']) >= cutoff
        ]

    def get_percentiles(self, duration_field: str = 'duration_ms') -> Dict[str, float]:
        """
        Get percentile statistics

        Args:
            duration_field: Field to calculate percentiles for

        Returns:
            Dictionary with percentiles
        """
        values = [c[duration_field] for c in self._call_history if duration_field in c]

        if not values:
            return {}

        sorted_values = sorted(values)
        n = len(sorted_values)

        return {
            'p50': sorted_values[int(n * 0.5)],
            'p75': sorted_values[int(n * 0.75)],
            'p90': sorted_values[int(n * 0.90)],
            'p95': sorted_values[int(n * 0.95)],
            'p99': sorted_values[int(n * 0.99)]
        }

    def get_error_rates(self, window_minutes: int = 5) -> Dict[str, Any]:
        """
        Get error rates over time windows

        Args:
            window_minutes: Time window in minutes

        Returns:
            Error rate statistics
        """
        cutoff = datetime.now() - timedelta(minutes=window_minutes)
        recent_calls = [
            c for c in self._call_history
            if datetime.fromisoformat(c['timestamp']) >= cutoff
        ]

        if not recent_calls:
            return {'window_minutes': window_minutes, 'error_rate': 0.0}

        errors = len([c for c in recent_calls if not c['success']])
        error_rate = (errors / len(recent_calls)) * 100

        return {
            'window_minutes': window_minutes,
            'total_calls': len(recent_calls),
            'errors': errors,
            'error_rate': round(error_rate, 2)
        }

    def export_json(self, include_history: bool = False) -> str:
        """
        Export metrics as JSON

        Args:
            include_history: Whether to include full history

        Returns:
            JSON string
        """
        data = {
            'name': self.name,
            'start_time': self._start_time.isoformat(),
            'statistics': self.get_statistics(),
            'percentiles': self.get_percentiles(),
            'error_rates': self.get_error_rates()
        }

        if include_history:
            data['call_history'] = self._call_history[-100:]  # Last 100 calls
            data['state_transitions'] = self._state_transitions[-50:]  # Last 50 transitions

        return json.dumps(data, indent=2)

    def export_prometheus(self) -> str:
        """
        Export metrics in Prometheus format

        Returns:
            Prometheus format metrics
        """
        stats = self.get_statistics()

        lines = [
            f'# Circuit breaker metrics for {self.name}',
            f'# Generated at {datetime.now().isoformat()}',
            ''
        ]

        # Counter metrics
        lines.extend([
            f'circuit_breaker_calls_total{{name="{self.name}",result="success"}} {stats["successful_calls"]}',
            f'circuit_breaker_calls_total{{name="{self.name}",result="failure"}} {stats["failed_calls"]}',
            f'circuit_breaker_state_transitions_total{{name="{self.name}"}} {stats["state_transitions"]}',
            ''
        ])

        # Gauge metrics
        lines.extend([
            f'circuit_breaker_success_rate{{name="{self.name}"}} {stats["success_rate"]}',
            f'circuit_breaker_avg_duration_ms{{name="{self.name}"}} {stats["avg_duration_ms"]}',
            f'circuit_breaker_uptime_seconds{{name="{self.name}"}} {stats["uptime_seconds"]}',
            ''
        ])

        return '\n'.join(lines)

    def get_health_status(self) -> Dict[str, Any]:
        """
        Get health check status

        Returns:
            Health status dictionary
        """
        stats = self.get_statistics()
        error_rates = self.get_error_rates()

        # Determine health based on metrics
        is_healthy = (
            stats['success_rate'] >= 80.0 and
            error_rates['error_rate'] < 20.0 and
            stats['avg_duration_ms'] < 5000
        )

        return {
            'name': self.name,
            'healthy': is_healthy,
            'success_rate': stats['success_rate'],
            'error_rate': error_rates['error_rate'],
            'avg_duration_ms': stats['avg_duration_ms'],
            'uptime_seconds': stats['uptime_seconds'],
            'check_timestamp': datetime.now().isoformat()
        }

    def _record_time_series(
        self,
        metric_name: str,
        value: float,
        labels: Optional[Dict[str, str]] = None
    ) -> None:
        """
        Record time series metric

        Args:
            metric_name: Name of metric
            value: Metric value
            labels: Optional labels
        """
        metric = TimeSeriesMetric(
            timestamp=datetime.now(),
            value=value,
            labels=labels or {}
        )

        self._time_series[metric_name].append(metric)

        # Keep only recent data
        if len(self._time_series[metric_name]) > 1000:
            self._time_series[metric_name] = self._time_series[metric_name][-1000:]

    def get_time_series(
        self,
        metric_name: str,
        minutes: int = 5
    ) -> List[TimeSeriesMetric]:
        """
        Get time series data for metric

        Args:
            metric_name: Name of metric
            minutes: Minutes of data to return

        Returns:
            List of time series metrics
        """
        cutoff = datetime.now() - timedelta(minutes=minutes)
        metrics = self._time_series.get(metric_name, [])

        return [
            m for m in metrics
            if m.timestamp >= cutoff
        ]

    def reset(self) -> None:
        """Reset all metrics"""
        self._call_history.clear()
        self._state_transitions.clear()
        self._snapshots.clear()
        self._time_series.clear()
        self._start_time = datetime.now()


class MetricsAggregator:
    """
    Aggregate metrics from multiple circuit breakers
    """

    def __init__(self):
        self._metrics: Dict[str, CircuitBreakerMetrics] = {}

    def register(self, name: str, metrics: CircuitBreakerMetrics) -> None:
        """
        Register metrics for a circuit breaker

        Args:
            name: Circuit breaker name
            metrics: Metrics instance
        """
        self._metrics[name] = metrics

    def get_all_statistics(self) -> Dict[str, Dict]:
        """
        Get statistics for all circuit breakers

        Returns:
            Dictionary of statistics by name
        """
        return {
            name: metrics.get_statistics()
            for name, metrics in self._metrics.items()
        }

    def get_aggregate_statistics(self) -> Dict[str, Any]:
        """
        Get aggregate statistics across all circuit breakers

        Returns:
            Aggregate statistics
        """
        all_stats = self.get_all_statistics()

        total_calls = sum(s['total_calls'] for s in all_stats.values())
        total_successful = sum(s['successful_calls'] for s in all_stats.values())
        total_failed = sum(s['failed_calls'] for s in all_stats.values())

        success_rate = 0.0
        if total_calls > 0:
            success_rate = (total_successful / total_calls) * 100

        return {
            'total_breakers': len(self._metrics),
            'total_calls': total_calls,
            'total_successful': total_successful,
            'total_failed': total_failed,
            'overall_success_rate': round(success_rate, 2),
            'active_breakers': len([
                s for s in all_stats.values()
                if s.get('state') == 'CLOSED'
            ]),
            'open_breakers': len([
                s for s in all_stats.values()
                if s.get('state') == 'OPEN'
            ])
        }

    def export_all_json(self) -> str:
        """
        Export all metrics as JSON

        Returns:
            JSON string
        """
        return json.dumps({
            'aggregate': self.get_aggregate_statistics(),
            'breakers': self.get_all_statistics()
        }, indent=2)
