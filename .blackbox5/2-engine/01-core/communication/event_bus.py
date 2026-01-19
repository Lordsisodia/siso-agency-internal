"""
Redis-based event bus implementation for BlackBox 5.

This module provides a production-ready event bus using Redis pub/sub
for distributed agent communication and system coordination.
"""

import logging
import threading
import time
from typing import Callable, Dict, List, Optional, Set, Any
from contextlib import contextmanager
from dataclasses import dataclass
from enum import Enum
import json

try:
    import redis
    from redis.exceptions import ConnectionError, RedisError
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

from .events import (
    BaseEvent,
    EventMetadata,
    Topics,
    EventType,
    Priority,
    validate_event,
    EventSchemaError
)
from .exceptions import (
    EventBusError,
    RedisConnectionError,
    RedisPubSubError,
    EventValidationError,
    EventSerializationError,
    format_exception
)


# Configure logging
logger = logging.getLogger(__name__)


class EventBusState(str, Enum):
    """Event bus connection states."""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    RECONNECTING = "reconnecting"
    SHUTTING_DOWN = "shutting_down"


@dataclass
class EventBusConfig:
    """Configuration for Redis event bus."""
    host: str = "localhost"
    port: int = 6379
    db: int = 0
    password: Optional[str] = None
    socket_timeout: float = 5.0
    socket_connect_timeout: float = 5.0
    connection_pool_size: int = 10
    max_retries: int = 3
    retry_delay: float = 1.0
    pubsub_timeout: float = 1.0
    enable_reconnection: bool = True
    reconnection_delay: float = 2.0
    max_reconnection_attempts: int = 10


class RedisEventBus:
    """
    Redis-based event bus for distributed event publishing and subscribing.

    Features:
    - Thread-safe pub/sub operations
    - Automatic reconnection
    - Event validation
    - Pattern-based topic subscription
    - Circuit breaker integration
    - Comprehensive error handling
    """

    def __init__(self, config: Optional[EventBusConfig] = None):
        """
        Initialize the Redis event bus.

        Args:
            config: Event bus configuration

        Raises:
            RedisConnectionError: If Redis is not available
        """
        if not REDIS_AVAILABLE:
            raise RedisConnectionError(
                "Redis package not installed. Install with: pip install redis"
            )

        self.config = config or EventBusConfig()
        self._state = EventBusState.DISCONNECTED
        self._redis_client: Optional['redis.Redis'] = None
        self._pubsub: Optional['redis.client.PubSub'] = None
        self._subscribers: Dict[str, Set[Callable]] = {}
        self._subscriber_lock = threading.Lock()
        self._listener_thread: Optional[threading.Thread] = None
        self._stop_listening = threading.Event()
        self._reconnection_thread: Optional[threading.Thread] = None
        self._connection_pool: Optional['redis.ConnectionPool'] = None

        logger.info(
            f"Initializing Redis event bus for {self.config.host}:{self.config.port}"
        )

    @property
    def state(self) -> EventBusState:
        """Get current connection state."""
        return self._state

    @property
    def is_connected(self) -> bool:
        """Check if connected to Redis."""
        return self._state == EventBusState.CONNECTED

    def connect(self) -> None:
        """
        Establish connection to Redis.

        Raises:
            RedisConnectionError: If connection fails
        """
        if self._state in (EventBusState.CONNECTED, EventBusState.CONNECTING):
            return

        self._state = EventBusState.CONNECTING
        logger.info(f"Connecting to Redis at {self.config.host}:{self.config.port}")

        try:
            # Create connection pool
            self._connection_pool = redis.ConnectionPool(
                host=self.config.host,
                port=self.config.port,
                db=self.config.db,
                password=self.config.password,
                socket_timeout=self.config.socket_timeout,
                socket_connect_timeout=self.config.socket_connect_timeout,
                max_connections=self.config.connection_pool_size,
                decode_responses=True
            )

            # Create Redis client
            self._redis_client = redis.Redis(
                connection_pool=self._connection_pool
            )

            # Test connection
            self._redis_client.ping()

            # Create pubsub instance
            self._pubsub = self._redis_client.pubsub()

            self._state = EventBusState.CONNECTED
            logger.info("Successfully connected to Redis event bus")

        except ConnectionError as e:
            self._state = EventBusState.DISCONNECTED
            raise RedisConnectionError(
                f"Failed to connect to Redis: {str(e)}",
                host=self.config.host,
                port=self.config.port
            ) from e
        except Exception as e:
            self._state = EventBusState.DISCONNECTED
            raise RedisConnectionError(
                f"Unexpected error connecting to Redis: {str(e)}",
                host=self.config.host,
                port=self.config.port
            ) from e

    def disconnect(self) -> None:
        """Disconnect from Redis and cleanup resources."""
        if self._state == EventBusState.DISCONNECTED:
            return

        self._state = EventBusState.SHUTTING_DOWN
        logger.info("Disconnecting from Redis event bus")

        # Stop listener thread
        self._stop_listening.set()
        if self._listener_thread:
            self._listener_thread.join(timeout=5.0)
            self._listener_thread = None

        # Stop reconnection thread
        if self._reconnection_thread:
            self._reconnection_thread.join(timeout=2.0)
            self._reconnection_thread = None

        # Close pubsub
        if self._pubsub:
            try:
                self._pubsub.close()
            except Exception as e:
                logger.warning(f"Error closing pubsub: {e}")
            self._pubsub = None

        # Close connection pool
        if self._connection_pool:
            try:
                self._connection_pool.disconnect()
            except Exception as e:
                logger.warning(f"Error closing connection pool: {e}")
            self._connection_pool = None

        self._redis_client = None
        self._state = EventBusState.DISCONNECTED
        logger.info("Disconnected from Redis event bus")

    def publish(self, topic: str, event: BaseEvent) -> str:
        """
        Publish an event to a topic.

        Args:
            topic: The topic to publish to
            event: The event to publish

        Returns:
            The number of clients that received the event

        Raises:
            EventBusError: If publishing fails
        """
        if not self.is_connected:
            raise EventBusError(
                "Cannot publish event: not connected to Redis",
                connection_error=True
            )

        try:
            # Validate event
            validate_event(event)

            # Serialize event
            event_json = event.to_json()

            # Publish to Redis
            result = self._redis_client.publish(topic, event_json)

            logger.debug(
                f"Published event {event.metadata.event_id} "
                f"(type: {event.metadata.event_type}) to topic '{topic}', "
                f"delivered to {result} subscribers"
            )

            return result

        except EventSchemaError as e:
            raise EventValidationError(
                f"Event validation failed: {str(e)}",
                event_type=event.metadata.event_type
            ) from e
        except (ConnectionError, RedisError) as e:
            self._handle_connection_error()
            raise RedisPubSubError(
                f"Failed to publish event: {str(e)}",
                operation="publish",
                channel=topic
            ) from e
        except Exception as e:
            raise EventBusError(
                f"Unexpected error publishing event: {str(e)}"
            ) from e

    def subscribe(
        self,
        topic: str,
        callback: Callable[[str, BaseEvent], None]
    ) -> None:
        """
        Subscribe to a topic with a callback.

        Args:
            topic: The topic to subscribe to (supports wildcards)
            callback: Function to call when events are received

        Raises:
            EventBusError: If subscription fails
        """
        if not self.is_connected:
            raise EventBusError(
                "Cannot subscribe: not connected to Redis",
                connection_error=True
            )

        if not callable(callback):
            raise EventBusError("Callback must be callable")

        try:
            with self._subscriber_lock:
                # Add callback to subscribers
                if topic not in self._subscribers:
                    self._subscribers[topic] = set()
                self._subscribers[topic].add(callback)

                # Subscribe to Redis channel
                self._pubsub.subscribe(topic)

                logger.debug(f"Subscribed to topic: {topic}")

            # Start listener thread if not already running
            if not self._listener_thread or not self._listener_thread.is_alive():
                self._start_listener_thread()

        except (ConnectionError, RedisError) as e:
            self._handle_connection_error()
            raise RedisPubSubError(
                f"Failed to subscribe to topic: {str(e)}",
                operation="subscribe",
                channel=topic
            ) from e
        except Exception as e:
            raise EventBusError(
                f"Unexpected error subscribing to topic: {str(e)}"
            ) from e

    def psubscribe(
        self,
        pattern: str,
        callback: Callable[[str, BaseEvent], None]
    ) -> None:
        """
        Subscribe to topics matching a pattern.

        Args:
            pattern: The pattern to match (e.g., "agent.*")
            callback: Function to call when events are received

        Raises:
            EventBusError: If subscription fails
        """
        if not self.is_connected:
            raise EventBusError(
                "Cannot subscribe: not connected to Redis",
                connection_error=True
            )

        if not callable(callback):
            raise EventBusError("Callback must be callable")

        try:
            with self._subscriber_lock:
                # Add callback to pattern subscribers
                if pattern not in self._subscribers:
                    self._subscribers[pattern] = set()
                self._subscribers[pattern].add(callback)

                # Subscribe to Redis pattern
                self._pubsub.psubscribe(pattern)

                logger.debug(f"Subscribed to pattern: {pattern}")

            # Start listener thread if not already running
            if not self._listener_thread or not self._listener_thread.is_alive():
                self._start_listener_thread()

        except (ConnectionError, RedisError) as e:
            self._handle_connection_error()
            raise RedisPubSubError(
                f"Failed to subscribe to pattern: {str(e)}",
                operation="psubscribe",
                channel=pattern
            ) from e
        except Exception as e:
            raise EventBusError(
                f"Unexpected error subscribing to pattern: {str(e)}"
            ) from e

    def unsubscribe(self, topic: str, callback: Optional[Callable] = None) -> None:
        """
        Unsubscribe from a topic.

        Args:
            topic: The topic to unsubscribe from
            callback: Specific callback to remove (if None, removes all)
        """
        try:
            with self._subscriber_lock:
                if topic not in self._subscribers:
                    return

                if callback:
                    self._subscribers[topic].discard(callback)
                    if not self._subscribers[topic]:
                        # No more callbacks for this topic
                        self._pubsub.unsubscribe(topic)
                        del self._subscribers[topic]
                else:
                    # Remove all callbacks for this topic
                    self._subscribers[topic].clear()
                    self._pubsub.unsubscribe(topic)
                    del self._subscribers[topic]

                logger.debug(f"Unsubscribed from topic: {topic}")

        except (ConnectionError, RedisError) as e:
            logger.warning(f"Error unsubscribing from topic: {e}")
        except Exception as e:
            logger.error(f"Unexpected error unsubscribing: {e}")

    def unsubscribe_all(self) -> None:
        """Unsubscribe from all topics."""
        try:
            with self._subscriber_lock:
                topics = list(self._subscribers.keys())
                for topic in topics:
                    self._pubsub.unsubscribe(topic)
                    self._pubsub.punsubscribe(topic)
                self._subscribers.clear()

                logger.debug("Unsubscribed from all topics")

        except Exception as e:
            logger.error(f"Error unsubscribing from all topics: {e}")

    def _start_listener_thread(self) -> None:
        """Start the background listener thread."""
        self._stop_listening.clear()
        self._listener_thread = threading.Thread(
            target=self._listen_for_events,
            daemon=True,
            name="RedisEventListener"
        )
        self._listener_thread.start()
        logger.debug("Started event listener thread")

    def _listen_for_events(self) -> None:
        """
        Background thread that listens for published events.

        This runs in a separate thread and calls registered callbacks
        when events are received.
        """
        logger.info("Event listener thread started")

        while not self._stop_listening.is_set():
            try:
                if not self.is_connected:
                    time.sleep(0.1)
                    continue

                # Get message with timeout
                message = self._pubsub.get_message(
                    timeout=self.config.pubsub_timeout
                )

                if message and message['type'] in ('message', 'pmessage'):
                    self._handle_message(message)

            except (ConnectionError, RedisError) as e:
                logger.warning(f"Connection error in listener: {e}")
                self._handle_connection_error()
                time.sleep(self.config.reconnection_delay)
            except Exception as e:
                logger.error(f"Error in event listener: {e}")
                time.sleep(0.5)

        logger.info("Event listener thread stopped")

    def _handle_message(self, message: Dict[str, Any]) -> None:
        """
        Handle a received message from Redis.

        Args:
            message: The message from Redis
        """
        try:
            # Extract channel/pattern and data
            channel = message.get('channel')
            pattern = message.get('pattern')
            data = message.get('data')

            if not data:
                return

            # Deserialize event
            event = BaseEvent.from_json(data)

            logger.debug(
                f"Received event {event.metadata.event_id} "
                f"(type: {event.metadata.event_type}) "
                f"from channel '{channel}'"
            )

            # Find and call matching callbacks
            with self._subscriber_lock:
                # Try exact channel match
                callbacks = set()

                if channel in self._subscribers:
                    callbacks.update(self._subscribers[channel])

                # Try pattern match
                if pattern and pattern in self._subscribers:
                    callbacks.update(self._subscribers[pattern])

                # Execute callbacks
                for callback in callbacks:
                    try:
                        callback(channel, event)
                    except Exception as e:
                        logger.error(
                            f"Error in event callback: {e}",
                            exc_info=True
                        )

        except EventSerializationError as e:
            logger.error(f"Failed to deserialize event: {e}")
        except Exception as e:
            logger.error(f"Error handling message: {e}", exc_info=True)

    def _handle_connection_error(self) -> None:
        """Handle connection errors and attempt reconnection."""
        if self._state != EventBusState.CONNECTED:
            return

        self._state = EventBusState.RECONNECTING
        logger.warning("Connection lost, attempting reconnection...")

        if self.config.enable_reconnection:
            if not self._reconnection_thread or not self._reconnection_thread.is_alive():
                self._reconnection_thread = threading.Thread(
                    target=self._reconnection_loop,
                    daemon=True,
                    name="RedisReconnector"
                )
                self._reconnection_thread.start()

    def _reconnection_loop(self) -> None:
        """Background thread that attempts to reconnect."""
        for attempt in range(self.config.max_reconnection_attempts):
            if self._stop_listening.is_set():
                break

            try:
                logger.info(
                    f"Reconnection attempt {attempt + 1}/"
                    f"{self.config.max_reconnection_attempts}"
                )

                # Try to reconnect
                self.disconnect()
                self.connect()

                # Resubscribe to all topics
                with self._subscriber_lock:
                    for topic in self._subscribers.keys():
                        if '*' in topic:
                            self._pubsub.psubscribe(topic)
                        else:
                            self._pubsub.subscribe(topic)

                logger.info("Reconnection successful")
                return

            except Exception as e:
                logger.warning(f"Reconnection attempt {attempt + 1} failed: {e}")
                time.sleep(self.config.reconnection_delay)

        logger.error("Max reconnection attempts reached")
        self._state = EventBusState.DISCONNECTED

    @contextmanager
    def auto_reconnect(self):
        """
        Context manager that ensures connection and handles reconnection.

        Example:
            with event_bus.auto_reconnect():
                event_bus.publish(topic, event)
        """
        was_connected = self.is_connected

        if not was_connected:
            self.connect()

        try:
            yield self
        except (ConnectionError, RedisError) as e:
            self._handle_connection_error()
            raise
        finally:
            if not was_connected and self.is_connected:
                self.disconnect()


# Singleton instance for global access
_global_event_bus: Optional[RedisEventBus] = None
_global_bus_lock = threading.Lock()


def get_event_bus(config: Optional[EventBusConfig] = None) -> RedisEventBus:
    """
    Get the global event bus instance.

    Args:
        config: Configuration for the event bus (only used on first call)

    Returns:
        The global RedisEventBus instance
    """
    global _global_event_bus

    with _global_bus_lock:
        if _global_event_bus is None:
            _global_event_bus = RedisEventBus(config)
            _global_event_bus.connect()

        return _global_event_bus


def shutdown_event_bus() -> None:
    """Shutdown the global event bus."""
    global _global_event_bus

    with _global_bus_lock:
        if _global_event_bus:
            _global_event_bus.disconnect()
            _global_event_bus = None
