"""
State Management Package

Provides event-driven communication and state tracking for Blackbox5.
"""

from state.event_bus import EventBus, RedisEventBus, EventBusConfig, Event

__all__ = [
    "EventBus",
    "RedisEventBus",
    "EventBusConfig",
    "Event",
]
