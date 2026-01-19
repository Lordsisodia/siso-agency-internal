"""
Pytest configuration and shared fixtures for Blackbox 5 tests.

This module provides common test fixtures and utilities for testing
Blackbox 5 core components including event bus, task router, logging,
manifest system, and circuit breaker.
"""

import pytest
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional
from unittest.mock import Mock, MagicMock, AsyncMock, patch
from datetime import datetime
import tempfile
import shutil
import json
import uuid

# Add engine directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "engine"))


# ============================================================================
# Event Bus Fixtures
# ============================================================================

@pytest.fixture
def mock_redis():
    """Create a mock Redis client for testing."""
    redis_mock = MagicMock()
    redis_mock.ping.return_value = True
    redis_mock.publish.return_value = 1
    redis_mock.get_message.return_value = None
    return redis_mock


@pytest.fixture
def mock_event_bus(mock_redis):
    """Create a mock event bus for testing."""
    from core.event_bus import EventBusConfig, EventBusState

    event_bus_mock = Mock()
    event_bus_mock.state = EventBusState.CONNECTED
    event_bus_mock.is_connected = True
    event_bus_mock.config = EventBusConfig()

    # Mock publish method
    event_bus_mock.publish = Mock(return_value=1)

    # Mock subscribe method
    event_bus_mock.subscribe = Mock()

    # Mock psubscribe method
    event_bus_mock.psubscribe = Mock()

    return event_bus_mock


@pytest.fixture
def real_event_bus():
    """Create a real event bus instance for integration tests."""
    from core.event_bus import RedisEventBus, EventBusConfig

    # Use a different DB for testing to avoid conflicts
    config = EventBusConfig(db=15)  # Test DB

    # Try to connect, skip if Redis not available
    try:
        bus = RedisEventBus(config)
        bus.connect()
        yield bus
        bus.disconnect()
    except Exception as e:
        pytest.skip(f"Redis not available: {e}")


# ============================================================================
# Agent Registry Fixtures
# ============================================================================

@pytest.fixture
def sample_agent_capabilities():
    """Sample agent capabilities for testing."""
    from core.task_types import AgentCapabilities, AgentType

    capabilities = [
        AgentCapabilities(
            agent_id="generalist_1",
            agent_type=AgentType.GENERALIST,
            domains=["general", "writing", "analysis"],
            tools=["read", "write", "search"],
            max_complexity=0.5,
            success_rate=0.85,
            avg_response_time=2.0
        ),
        AgentCapabilities(
            agent_id="specialist_coder",
            agent_type=AgentType.SPECIALIST,
            domains=["coding", "debugging", "testing"],
            tools=["write_file", "read_file", "execute_code", "test"],
            max_complexity=0.8,
            success_rate=0.92,
            avg_response_time=3.5
        ),
        AgentCapabilities(
            agent_id="specialist_researcher",
            agent_type=AgentType.SPECIALIST,
            domains=["research", "analysis", "data_gathering"],
            tools=["web_search", "read", "analyze"],
            max_complexity=0.7,
            success_rate=0.88,
            avg_response_time=4.0
        ),
        AgentCapabilities(
            agent_id="manager",
            agent_type=AgentType.MANAGER,
            domains=["coordination", "planning", "integration"],
            tools=["delegate", "monitor", "integrate"],
            max_complexity=1.0,
            success_rate=0.95,
            avg_response_time=1.0
        ),
        AgentCapabilities(
            agent_id="executor",
            agent_type=AgentType.EXECUTOR,
            domains=["execution", "simple_tasks"],
            tools=["execute", "report"],
            max_complexity=0.3,
            success_rate=0.90,
            avg_response_time=1.5
        ),
    ]
    return capabilities


@pytest.fixture
def mock_agent_registry(sample_agent_capabilities):
    """Create a mock agent registry with sample agents."""
    registry_mock = Mock()

    # Create a dict of agents by ID
    agents_dict = {cap.agent_id: cap for cap in sample_agent_capabilities}

    # Mock get_all method
    registry_mock.get_all = Mock(return_value=agents_dict)

    # Mock get_agent method
    def get_agent(agent_id: str):
        return agents_dict.get(agent_id)

    registry_mock.get_agent = Mock(side_effect=get_agent)

    # Mock get_by_type method
    def get_by_type(agent_type):
        return [cap for cap in sample_agent_capabilities if cap.agent_type == agent_type]

    registry_mock.get_by_type = Mock(side_effect=get_by_type)

    # Mock get_by_domain method
    def get_by_domain(domain: str):
        return [cap for cap in sample_agent_capabilities if domain in cap.domains]

    registry_mock.get_by_domain = Mock(side_effect=get_by_domain)

    return registry_mock


# ============================================================================
# Skill Manager Fixtures
# ============================================================================

@pytest.fixture
def mock_skill_manager():
    """Create a mock skill manager for testing."""
    skill_manager_mock = Mock()

    # Mock skills list
    skills = {
        "code_generation": {"domain": "coding", "complexity": 0.6},
        "web_search": {"domain": "research", "complexity": 0.4},
        "data_analysis": {"domain": "analysis", "complexity": 0.7},
        "writing": {"domain": "writing", "complexity": 0.3},
        "debugging": {"domain": "debugging", "complexity": 0.5},
    }

    skill_manager_mock.get_all_skills = Mock(return_value=skills)
    skill_manager_mock.get_skill = Mock(side_effect=lambda name: skills.get(name))
    skill_manager_mock.has_skill = Mock(side_effect=lambda name: name in skills)

    return skill_manager_mock


# ============================================================================
# Circuit Breaker Fixtures
# ============================================================================

@pytest.fixture
def mock_circuit_breaker():
    """Create a mock circuit breaker for testing."""
    from core.circuit_breaker_types import CircuitState

    cb_mock = Mock()
    cb_mock.state = CircuitState.CLOSED
    cb_mock.is_closed = True
    cb_mock.is_open = False
    cb_mock.is_half_open = False

    # Mock call method
    cb_mock.call = Mock(side_effect=lambda func, *args, **kwargs: func(*args, **kwargs))

    # Mock stats
    cb_mock.get_stats = Mock(return_value={
        'service_id': 'test_service',
        'state': 'CLOSED',
        'current_failures': 0,
        'total_calls': 0,
        'total_failures': 0,
        'total_successes': 0,
    })

    return cb_mock


@pytest.fixture
def real_circuit_breaker():
    """Create a real circuit breaker for integration tests."""
    from core.circuit_breaker import CircuitBreaker

    cb = CircuitBreaker("test_service")
    yield cb
    cb.reset()


# ============================================================================
# Manifest System Fixtures
# ============================================================================

@pytest.fixture
def temp_manifest_dir():
    """Create a temporary directory for manifest files."""
    temp_dir = tempfile.mkdtemp(prefix="bb5_manifests_")
    yield Path(temp_dir)
    # Cleanup
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def mock_manifest_system(temp_manifest_dir):
    """Create a mock manifest system for testing."""
    from core.manifest import ManifestSystem, ManifestStatus

    manifest_system = ManifestSystem(manifest_dir=temp_manifest_dir)

    # Track created manifests
    created_manifests = []

    # Wrap create_manifest to track
    original_create = manifest_system.create_manifest

    def tracked_create(operation_type, metadata=None):
        manifest = original_create(operation_type, metadata)
        created_manifests.append(manifest)
        return manifest

    manifest_system.create_manifest = Mock(side_effect=tracked_create)
    manifest_system.created_manifests = created_manifests

    return manifest_system


# ============================================================================
# Task Fixtures
# ============================================================================

@pytest.fixture
def sample_tasks():
    """Create sample tasks for testing."""
    from core.task_types import Task, TaskPriority

    return {
        "simple": Task(
            task_id="task_simple_1",
            description="Write a simple function",
            prompt="Write a function to add two numbers",
            required_tools=[],
            domain="coding",
            priority=TaskPriority.NORMAL,
            context={},
            metadata={}
        ),
        "moderate": Task(
            task_id="task_moderate_1",
            description="Debug and fix a complex function",
            prompt="Debug this function that handles edge cases and fix any issues found" * 5,
            required_tools=["read_file", "execute_code", "test"],
            domain="debugging",
            priority=TaskPriority.HIGH,
            context={"file": "complex_function.py"},
            metadata={}
        ),
        "complex": Task(
            task_id="task_complex_1",
            description="Design and implement a complete microservice architecture",
            prompt="Design a microservice architecture for a scalable e-commerce platform" * 20,
            required_tools=["design", "code", "test", "deploy", "document"],
            domain="system_architecture",
            priority=TaskPriority.CRITICAL,
            context={"scale": "enterprise", "users": "1M+"},
            metadata={}
        ),
        "multi_tool": Task(
            task_id="task_multi_tool_1",
            description="Research and analyze market trends",
            prompt="Conduct comprehensive market research and analysis" * 10,
            required_tools=["web_search", "analyze", "visualize", "report"],
            domain="research",
            priority=TaskPriority.HIGH,
            context={"industries": ["tech", "finance"]},
            metadata={}
        ),
    }


# ============================================================================
# Logging Fixtures
# ============================================================================

@pytest.fixture
def temp_log_dir():
    """Create a temporary directory for log files."""
    temp_dir = tempfile.mkdtemp(prefix="bb5_logs_")
    yield Path(temp_dir)
    # Cleanup
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def capture_logs():
    """Capture log output for testing."""
    import logging
    from io import StringIO

    log_capture = StringIO()
    handler = logging.StreamHandler(log_capture)
    handler.setLevel(logging.DEBUG)

    logger = logging.getLogger("blackbox5")
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)

    yield log_capture

    logger.removeHandler(handler)
    handler.close()


# ============================================================================
# ChromaDB Fixtures
# ============================================================================

@pytest.fixture
def mock_chromadb():
    """Create a mock ChromaDB client for testing."""
    chromadb_mock = MagicMock()

    # Mock collection
    collection_mock = MagicMock()
    collection_mock.add = Mock()
    collection_mock.query = Mock(return_value={
        "ids": [["doc1", "doc2"]],
        "documents": [["content1", "content2"]],
        "metadatas": [[{"source": "test"}, {"source": "test"}]],
        "distances": [[0.1, 0.3]]
    })

    chromadb_mock.get_or_create_collection = Mock(return_value=collection_mock)

    return chromadb_mock


@pytest.fixture
def real_chromadb():
    """Create a real ChromaDB instance for integration tests."""
    try:
        import chromadb
        client = chromadb.Client()
        yield client
    except ImportError:
        pytest.skip("ChromaDB not installed")
    except Exception as e:
        pytest.skip(f"ChromaDB not available: {e}")


# ============================================================================
# Neo4j Fixtures
# ============================================================================

@pytest.fixture
def mock_neo4j():
    """Create a mock Neo4j driver for testing."""
    neo4j_mock = MagicMock()

    # Mock session
    session_mock = MagicMock()
    session_mock.run = Mock(return_value=[
        {"n": {"content": "test content", "metadata": {}}}
    ])
    session_mock.close = Mock()

    # Mock driver
    neo4j_mock.session = Mock(return_value=session_mock)
    neo4j_mock.verify_connectivity = Mock(return_value=True)
    neo4j_mock.close = Mock()

    return neo4j_mock


@pytest.fixture
def real_neo4j():
    """Create a real Neo4j connection for integration tests."""
    try:
        from neo4j import GraphDatabase

        driver = GraphDatabase.driver(
            "bolt://localhost:7687",
            auth=("neo4j", "password")
        )
        driver.verify_connectivity()
        yield driver
        driver.close()
    except ImportError:
        pytest.skip("Neo4j driver not installed")
    except Exception as e:
        pytest.skip(f"Neo4j not available: {e}")


# ============================================================================
# Integration Test Fixtures
# ============================================================================

@pytest.fixture
def full_system_integration():
    """
    Create a full integration test setup with all components.
    This combines all the major components for end-to-end testing.
    """
    components = {}

    # Create temp directories
    temp_dirs = {
        "manifests": tempfile.mkdtemp(prefix="bb5_manifests_"),
        "logs": tempfile.mkdtemp(prefix="bb5_logs_"),
        "memory": tempfile.mkdtemp(prefix="bb5_memory_"),
    }
    components["temp_dirs"] = temp_dirs

    # Setup event bus (skip if Redis unavailable)
    try:
        from core.event_bus import RedisEventBus, EventBusConfig
        config = EventBusConfig(db=15)
        bus = RedisEventBus(config)
        bus.connect()
        components["event_bus"] = bus
    except Exception:
        components["event_bus"] = None

    # Setup circuit breaker
    from core.circuit_breaker import CircuitBreaker
    components["circuit_breaker"] = CircuitBreaker("test_integration", event_bus=components["event_bus"])

    # Setup task router
    from core.task_router import TaskRouter
    components["task_router"] = TaskRouter(event_bus=components["event_bus"])

    # Setup manifest system
    from core.manifest import ManifestSystem
    components["manifest_system"] = ManifestSystem(manifest_dir=Path(temp_dirs["manifests"]))

    # Setup logging
    from core.logging import setup_logging
    log_file = Path(temp_dirs["logs"]) / "test.log"
    setup_logging(log_file=log_file, level="DEBUG")
    components["log_file"] = log_file

    yield components

    # Cleanup
    if components["event_bus"]:
        components["event_bus"].disconnect()

    for temp_dir in temp_dirs.values():
        shutil.rmtree(temp_dir, ignore_errors=True)


# ============================================================================
# Helper Functions
# ============================================================================

def create_test_task(
    task_id: str = "test_task",
    description: str = "Test task description",
    prompt: str = "Test prompt",
    required_tools: List[str] = None,
    domain: str = "general",
    priority: str = "normal",
    context: Dict[str, Any] = None,
    metadata: Dict[str, Any] = None
):
    """Helper function to create test tasks."""
    from core.task_types import Task, TaskPriority

    return Task(
        task_id=task_id,
        description=description,
        prompt=prompt,
        required_tools=required_tools or [],
        domain=domain,
        priority=TaskPriority(priority.lower()),
        context=context or {},
        metadata=metadata or {}
    )


def assert_routing_decision(
    decision,
    expected_strategy: str = None,
    expected_agent_type: str = None,
    min_confidence: float = 0.0,
    min_duration: float = 0.0
):
    """Helper to assert routing decision properties."""
    from core.task_types import ExecutionStrategy, AgentType

    if expected_strategy:
        assert decision.strategy == ExecutionStrategy(expected_strategy), \
            f"Expected strategy {expected_strategy}, got {decision.strategy.value}"

    if expected_agent_type:
        assert decision.agent_type == AgentType(expected_agent_type), \
            f"Expected agent type {expected_agent_type}, got {decision.agent_type.value}"

    if min_confidence > 0:
        assert decision.confidence >= min_confidence, \
            f"Expected confidence >= {min_confidence}, got {decision.confidence}"

    if min_duration > 0:
        assert decision.estimated_duration >= min_duration, \
            f"Expected duration >= {min_duration}, got {decision.estimated_duration}"


def wait_for_condition(condition, timeout=5.0, interval=0.1):
    """Helper to wait for a condition to be true."""
    import time

    start = time.time()
    while time.time() - start < timeout:
        if condition():
            return True
        time.sleep(interval)
    return False


# ============================================================================
# Test Configuration
# ============================================================================

def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests (deselect with '-m \"not integration\"')"
    )
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )


@pytest.fixture(autouse=True)
def reset_singletons():
    """Reset singleton instances between tests."""
    yield

    # Reset circuit breaker registry
    from core.circuit_breaker import CircuitBreaker
    CircuitBreaker.reset_all()

    # Reset event bus singleton
    from core.event_bus import _global_event_bus, shutdown_event_bus
    shutdown_event_bus()
