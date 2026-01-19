"""
BlackBox5 Integration Tests

Comprehensive integration tests for the BlackBox5 multi-agent system
with GLM API integration.

Tests cover:
- GLM client functionality
- Event bus (Redis)
- Agent memory system
- Multi-agent orchestration
- MCP integration
- End-to-end workflows
"""

import pytest
import os
import sys
import json
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Dict, List

# Add engine to path
engine_path = Path(__file__).parent.parent / "engine"
sys.path.insert(0, str(engine_path))

from core.GLMClient import GLMClient, GLMClientMock, create_glm_client
from core.event_bus import RedisEventBus, EventBusConfig, MemoryEventBus
from core.AgentClient import BlackBox5AgentClient
from core.Orchestrator import AgentOrchestrator
from core.MCPIntegration import MCPManager


# ============================================================================
# Test Fixtures
# ============================================================================

@pytest.fixture
def glm_mock_client():
    """Create a mock GLM client for testing"""
    return create_glm_client(mock=True)


@pytest.fixture
def event_bus_config():
    """Event bus configuration"""
    return EventBusConfig(
        host="localhost",
        port=6379,
        db=0,
        retry_attempts=3,
        retry_delay=1
    )


@pytest.fixture
async def redis_event_bus(event_bus_config):
    """Create and connect Redis event bus"""
    event_bus = RedisEventBus(event_bus_config)
    await event_bus.connect()
    yield event_bus
    await event_bus.disconnect()


@pytest.fixture
def memory_event_bus():
    """Create in-memory event bus for testing"""
    return MemoryEventBus()


@pytest.fixture
def project_dir(tmp_path):
    """Create a temporary project directory"""
    project = tmp_path / "test_project"
    project.mkdir()
    (project / "test.py").write_text("print('Hello, World!')")
    (project / "README.md").write_text("# Test Project")
    return project


# ============================================================================
# GLM Client Tests
# ============================================================================

class TestGLMClient:
    """Test GLM client functionality"""

    def test_mock_client_creation(self, glm_mock_client):
        """Test mock client can be created"""
        assert glm_mock_client is not None
        assert isinstance(glm_mock_client, GLMClientMock)

    def test_mock_client_chat(self, glm_mock_client):
        """Test mock client chat"""
        response = glm_mock_client.create([
            {"role": "user", "content": "Hello!"}
        ])
        assert response.content is not None
        assert "[MOCK GLM RESPONSE]" in response.content
        assert response.usage["total_tokens"] > 0

    def test_mock_client_tracks_calls(self, glm_mock_client):
        """Test mock client tracks API calls"""
        glm_mock_client.create([{"role": "user", "content": "Test"}])
        assert len(glm_mock_client.calls) == 1
        assert glm_mock_client.calls[0]["messages"][0]["content"] == "Test"

    @pytest.mark.asyncio
    async def test_mock_client_async(self, glm_mock_client):
        """Test mock client async chat"""
        response = await glm_mock_client.acreate([
            {"role": "user", "content": "Async test"}
        ])
        assert response.content is not None

    def test_real_client_requires_api_key(self):
        """Test real client requires API key"""
        # Temporarily remove API key
        original_key = os.environ.get("GLM_API_KEY")
        os.environ.pop("GLM_API_KEY", None)

        with pytest.raises(Exception) as exc_info:
            GLMClient()

        assert "API key" in str(exc_info.value).lower()

        # Restore API key
        if original_key:
            os.environ["GLM_API_KEY"] = original_key

    @pytest.mark.skipif(
        not os.getenv("GLM_API_KEY"),
        reason="GLM_API_KEY not set"
    )
    def test_real_glm_client_chat(self):
        """Test real GLM API (only if API key is available)"""
        client = GLMClient()
        response = client.create([
            {"role": "user", "content": "Say 'Hello from GLM!' in one sentence."}
        ])
        assert response.content is not None
        assert len(response.content) > 0
        assert response.model == "glm-4.7"


# ============================================================================
# Event Bus Tests
# ============================================================================

class TestEventBus:
    """Test event bus functionality"""

    @pytest.mark.asyncio
    async def test_redis_event_bus_connect(self, redis_event_bus):
        """Test Redis event bus connection"""
        assert redis_event_bus.is_connected

    @pytest.mark.asyncio
    async def test_redis_event_bus_publish_subscribe(self, redis_event_bus):
        """Test Redis pub/sub"""
        received = []

        async def handler(event):
            received.append(event)

        await redis_event_bus.subscribe("test.topic", handler)
        await redis_event_bus.publish("test.topic", {"message": "Hello"})

        # Wait a bit for message to propagate
        await asyncio.sleep(0.5)

        assert len(received) > 0
        assert received[0]["message"] == "Hello"

    @pytest.mark.asyncio
    async def test_memory_event_bus_publish_subscribe(self, memory_event_bus):
        """Test in-memory event bus"""
        received = []

        def handler(event):
            received.append(event)

        memory_event_bus.subscribe("test.topic", handler)
        memory_event_bus.publish("test.topic", {"message": "Test"})

        assert len(received) == 1
        assert received[0]["message"] == "Test"

    @pytest.mark.asyncio
    async def test_event_bus_multiple_subscribers(self, redis_event_bus):
        """Test multiple subscribers receive events"""
        results = {"count1": 0, "count2": 0}

        async def handler1(event):
            results["count1"] += 1

        async def handler2(event):
            results["count2"] += 1

        await redis_event_bus.subscribe("multi.test", handler1)
        await redis_event_bus.subscribe("multi.test", handler2)
        await redis_event_bus.publish("multi.test", {"data": "test"})

        await asyncio.sleep(0.5)

        assert results["count1"] == 1
        assert results["count2"] == 1


# ============================================================================
# Agent Client Tests
# ============================================================================

class TestAgentClient:
    """Test BlackBox5 agent client"""

    def test_agent_client_creation(self, project_dir):
        """Test agent client can be created"""
        client = BlackBox5AgentClient(
            agent_type="developer",
            project_dir=project_dir
        )
        assert client is not None
        assert client.agent_type == "developer"

    def test_agent_client_project_index(self, project_dir):
        """Test project index scanning"""
        client = BlackBox5AgentClient(
            agent_type="developer",
            project_dir=project_dir
        )
        index = client.load_project_index()
        assert "files" in index
        assert len(index["files"]) >= 2  # test.py and README.md

    def test_agent_client_capability_detection(self, project_dir):
        """Test capability detection"""
        client = BlackBox5AgentClient(
            agent_type="developer",
            project_dir=project_dir
        )
        capabilities = client.detect_project_capabilities(
            client.load_project_index()
        )
        # Should detect Python project
        assert capabilities.get("is_python") == True


# ============================================================================
# Multi-Agent Orchestrator Tests
# ============================================================================

class TestOrchestrator:
    """Test multi-agent orchestration"""

    @pytest.mark.asyncio
    async def test_orchestrator_creation(self):
        """Test orchestrator can be created"""
        orchestrator = AgentOrchestrator()
        assert orchestrator is not None
        assert len(orchestrator.active_agents) == 0

    @pytest.mark.asyncio
    async def test_orchestrator_start_agent(self):
        """Test starting an agent"""
        orchestrator = AgentOrchestrator()
        agent_id = await orchestrator.start_agent(
            agent_type="developer",
            task="Write a simple function"
        )
        assert agent_id is not None
        assert "developer" in agent_id
        assert agent_id in orchestrator.active_agents

    @pytest.mark.asyncio
    async def test_orchestrator_parallel_execution(self):
        """Test parallel agent execution"""
        orchestrator = AgentOrchestrator()

        tasks = [
            {"type": "developer", "task": "Task 1"},
            {"type": "developer", "task": "Task 2"},
            {"type": "developer", "task": "Task 3"}
        ]

        results = await orchestrator.parallel_execute(tasks)

        assert len(results) == 3
        assert all(r is not None for r in results)


# ============================================================================
# MCP Integration Tests
# ============================================================================

class TestMCPIntegration:
    """Test MCP server integration"""

    def test_mcp_manager_creation(self):
        """Test MCP manager can be created"""
        manager = MCPManager()
        assert manager is not None

    def test_mcp_discover_servers(self):
        """Test MCP server discovery"""
        manager = MCPManager()
        servers = manager.discover_mcp_servers()
        # Should return at least empty list
        assert isinstance(servers, list)


# ============================================================================
# End-to-End Workflow Tests
# ============================================================================

class TestWorkflows:
    """Test complete workflows"""

    @pytest.mark.asyncio
    async def test_simple_task_workflow(self):
        """Test simple single-agent workflow"""
        orchestrator = AgentOrchestrator()

        result = await orchestrator.execute_workflow([
            {
                "agent_type": "developer",
                "task": "Create a simple Python function",
                "dependencies": []
            }
        ])

        assert result is not None
        assert "developer" in result

    @pytest.mark.asyncio
    async def test_sequential_workflow(self):
        """Test sequential multi-step workflow"""
        orchestrator = AgentOrchestrator()

        workflow = [
            {
                "agent_type": "developer",
                "task": "Step 1: Write code",
                "dependencies": []
            },
            {
                "agent_type": "tester",
                "task": "Step 2: Test code",
                "dependencies": ["step-1"]
            },
            {
                "agent_type": "developer",
                "task": "Step 3: Fix bugs",
                "dependencies": ["step-2"]
            }
        ]

        result = await orchestrator.execute_sequential(workflow)
        assert result is not None
        assert len(result) == 3

    @pytest.mark.asyncio
    async def test_parallel_workflow(self):
        """Test parallel workflow"""
        orchestrator = AgentOrchestrator()

        tasks = [
            {
                "agent_type": "researcher",
                "task": "Research topic A",
                "dependencies": []
            },
            {
                "agent_type": "researcher",
                "task": "Research topic B",
                "dependencies": []
            },
            {
                "agent_type": "analyst",
                "task": "Analyze findings",
                "dependencies": ["task-0", "task-1"]
            }
        ]

        result = await orchestrator.execute_wave(tasks)
        assert result is not None


# ============================================================================
# Integration Test: Real GLM API
# ============================================================================

@pytest.mark.integration
class TestRealGLMIntegration:
    """Integration tests with real GLM API"""

    @pytest.mark.skipif(
        not os.getenv("GLM_API_KEY"),
        reason="GLM_API_KEY not set"
    )
    @pytest.mark.asyncio
    async def test_glm_agent_task_execution(self):
        """Test executing a task with real GLM API"""
        client = GLMClient()

        response = client.create([
            {
                "role": "system",
                "content": "You are a helpful coding assistant."
            },
            {
                "role": "user",
                "content": "Write a Python function to calculate fibonacci numbers."
            }
        ])

        assert response.content is not None
        assert "def" in response.content or "fibonacci" in response.content.lower()

    @pytest.mark.skipif(
        not os.getenv("GLM_API_KEY"),
        reason="GLM_API_KEY not set"
    )
    @pytest.mark.asyncio
    async def test_glm_conversation_context(self):
        """Test GLM maintains conversation context"""
        client = GLMClient()

        conversation = [
            {"role": "user", "content": "My name is Alice"}
        ]

        # First message
        response1 = client.create(conversation)
        conversation.append({
            "role": "assistant",
            "content": response1.content
        })

        # Second message
        conversation.append({
            "role": "user",
            "content": "What's my name?"
        })
        response2 = client.create(conversation)

        # Should remember the name
        assert "Alice" in response2.content


# ============================================================================
# System Health Tests
# ============================================================================

class TestSystemHealth:
    """Test system health and diagnostics"""

    def test_redis_health(self):
        """Test Redis is healthy"""
        import redis
        r = redis.Redis(host="localhost", port=6379, db=0)
        assert r.ping()
        r.close()

    def test_python_version(self):
        """Test Python version compatibility"""
        version = sys.version_info
        assert version.major == 3
        assert version.minor >= 9

    def test_required_modules(self):
        """Test required modules are available"""
        required_modules = [
            "redis",
            "yaml",
            "pytest",
            "pathlib"
        ]

        for module in required_modules:
            __import__(module)


# ============================================================================
# Performance Tests
# ============================================================================

class TestPerformance:
    """Test system performance"""

    @pytest.mark.asyncio
    async def test_event_bus_performance(self):
        """Test event bus can handle high throughput"""
        bus = MemoryEventBus()
        received = []

        def handler(event):
            received.append(event)

        bus.subscribe("perf.test", handler)

        # Publish 100 events
        for i in range(100):
            bus.publish("perf.test", {"index": i})

        assert len(received) == 100

    def test_mock_client_performance(self):
        """Test mock client performance"""
        client = GLMClientMock()
        import time

        start = time.time()
        for _ in range(10):
            client.create([{"role": "user", "content": "Test"}])
        elapsed = time.time() - start

        # Should complete 10 calls in less than 1 second
        assert elapsed < 1.0


# ============================================================================
# Configuration Tests
# ============================================================================

class TestConfiguration:
    """Test configuration loading"""

    def test_config_file_exists(self):
        """Test config file exists"""
        config_path = Path(__file__).parent.parent / "engine" / "config.yml"
        assert config_path.exists()

    def test_glm_configured(self):
        """Test GLM is configured"""
        config_path = Path(__file__).parent.parent / "engine" / "config.yml"
        content = config_path.read_text()
        assert "glm:" in content
        assert "enabled: true" in content


# ============================================================================
# Main Test Runner
# ============================================================================

if __name__ == "__main__":
    # Run tests with verbose output
    pytest.main([__file__, "-v", "-s", "--tb=short"])
