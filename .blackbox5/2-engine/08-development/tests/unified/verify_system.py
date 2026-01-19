#!/usr/bin/env python3
"""
BlackBox5 System Verification

Quick verification that BlackBox5 components are working correctly.
"""

import sys
import os
import asyncio
from pathlib import Path

# Add engine to path
engine_path = Path(__file__).parent.parent / "engine"
sys.path.insert(0, str(engine_path))

def print_header(text):
    """Print a formatted header"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def print_result(name, passed, details=""):
    """Print test result"""
    status = "✓ PASS" if passed else "✗ FAIL"
    print(f"  {name}: {status}")
    if details:
        print(f"    {details}")

def test_python_version():
    """Test Python version"""
    print("✓ Testing Python version...")
    version = sys.version_info
    passed = version.major == 3 and version.minor >= 9
    print_result("Python Version", passed, f"Python {version.major}.{version.minor}.{version.micro}")
    return passed

def test_dependencies():
    """Test required dependencies"""
    print("✓ Testing dependencies...")
    required = ["redis", "yaml", "requests", "httpx"]
    results = []
    for module in required:
        try:
            __import__(module)
            print_result(f"  {module}", True)
            results.append(True)
        except ImportError:
            print_result(f"  {module}", False)
            results.append(False)
    return all(results)

def test_redis_connection():
    """Test Redis connection"""
    print("✓ Testing Redis connection...")
    try:
        import redis
        r = redis.Redis(host="localhost", port=6379, db=0)
        r.ping()
        print_result("Redis Connection", True)
        r.close()
        return True
    except Exception as e:
        print_result("Redis Connection", False, str(e))
        return False

def test_glm_client():
    """Test GLM client"""
    print("✓ Testing GLM client...")
    try:
        from core.GLMClient import create_glm_client

        # Test mock client
        client = create_glm_client(mock=True)
        response = client.create([{"role": "user", "content": "Test"}])
        passed = response.content is not None

        print_result("GLM Mock Client", passed)

        # Check API key
        if os.getenv("GLM_API_KEY"):
            print_result("GLM API Key", True, "API key found")
        else:
            print_result("GLM API Key", False, "Set GLM_API_KEY environment variable")

        return passed
    except Exception as e:
        print_result("GLM Client", False, str(e))
        return False

def test_event_bus():
    """Test event bus"""
    print("✓ Testing event bus...")
    try:
        from core.event_bus import RedisEventBus, EventBusConfig
        import asyncio

        async def test():
            config = EventBusConfig(
                host="localhost",
                port=6379,
                db=0
            )
            bus = RedisEventBus(config)
            await bus.connect()

            received = []

            async def handler(event):
                received.append(event)

            await bus.subscribe("test.topic", handler)
            await bus.publish("test.topic", {"msg": "test"})

            await asyncio.sleep(0.5)

            await bus.disconnect()
            return len(received) > 0

        passed = asyncio.run(test())
        print_result("Redis Event Bus", passed)
        return passed
    except Exception as e:
        print_result("Event Bus", False, str(e))
        return False

def test_agent_client():
    """Test agent client"""
    print("✓ Testing agent client...")
    try:
        from core.AgentClient import create_client
        import tempfile

        with tempfile.TemporaryDirectory() as tmpdir:
            # Create test files
            project_dir = Path(tmpdir)
            (project_dir / "test.py").write_text("print('hello')")
            (project_dir / "package.json").write_text('{"name": "test"}')

            client = create_client(
                project_dir=project_dir,
                model="glm-4.7"
            )
            index = client.load_project_index()
            passed = "files" in index and len(index["files"]) >= 2

        print_result("Agent Client", passed, f"Found {len(index['files'])} files")
        return passed
    except Exception as e:
        print_result("Agent Client", False, str(e)[:200])
        return False

def test_mcp_integration():
    """Test MCP integration"""
    print("✓ Testing MCP integration...")
    try:
        from core.MCPIntegration import MCPManager

        manager = MCPManager()
        servers = manager.discover_mcp_servers()

        passed = isinstance(servers, list)
        print_result("MCP Manager", passed, f"Found {len(servers)} servers")
        return passed
    except Exception as e:
        print_result("MCP Integration", False, str(e))
        return False

def test_orchestrator():
    """Test orchestrator"""
    print("✓ Testing orchestrator...")
    try:
        from core.Orchestrator import AgentOrchestrator
        import asyncio

        async def test():
            orchestrator = AgentOrchestrator()
            passed = len(orchestrator._agents) == 0

            if passed:
                # Test starting an agent
                agent_id = await orchestrator.start_agent(
                    agent_type="developer",
                    task="Test task"
                )
                passed = agent_id is not None and "developer" in agent_id

            return passed

        passed = asyncio.run(test())
        print_result("Orchestrator", passed)
        return passed
    except Exception as e:
        print_result("Orchestrator", False, str(e)[:100])
        return False

def test_configuration():
    """Test configuration"""
    print("✓ Testing configuration...")
    try:
        config_path = Path(__file__).parent.parent / "engine" / "config.yml"
        passed = config_path.exists()

        if passed:
            content = config_path.read_text()
            glm_configured = "glm:" in content
            print_result("Config File", True)
            print_result("GLM Configured", glm_configured)
            return glm_configured

        print_result("Config File", False, "config.yml not found")
        return False
    except Exception as e:
        print_result("Configuration", False, str(e))
        return False

def main():
    """Run all tests"""
    print_header("BlackBox5 System Verification")

    results = {
        "Python Version": test_python_version(),
        "Dependencies": test_dependencies(),
        "Redis": test_redis_connection(),
        "GLM Client": test_glm_client(),
        "Event Bus": test_event_bus(),
        "Agent Client": test_agent_client(),
        "MCP Integration": test_mcp_integration(),
        "Orchestrator": test_orchestrator(),
        "Configuration": test_configuration(),
    }

    print_header("Test Results")

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {test}: {status}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! BlackBox5 is ready to use.")
        print("\nQuick Start:")
        print("  1. Export GLM API key: export GLM_API_KEY=your_key_here")
        print("  2. Run a task: python .blackbox5/tests/run_example_task.py")
        return 0
    else:
        failed = total - passed
        print(f"\n⚠️  {failed} test(s) failed.")
        print("\nTroubleshooting:")
        if not results.get("Redis"):
            print("  - Make sure Redis is running: brew services start redis")
        if not results.get("GLM Client"):
            print("  - Set GLM_API_KEY environment variable")
        return 1

if __name__ == "__main__":
    sys.exit(main())
