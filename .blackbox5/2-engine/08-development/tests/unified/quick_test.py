#!/usr/bin/env python3
"""
BlackBox5 Quick Start Test

Quick verification that BlackBox5 components are working correctly.
Run this to verify the system is ready for use.
"""

import sys
import os
from pathlib import Path

# Add engine to path
engine_path = Path(__file__).parent.parent / "engine"
sys.path.insert(0, str(engine_path))

def print_header(text):
    """Print a formatted header"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def test_python_version():
    """Test Python version"""
    print("✓ Testing Python version...")
    version = sys.version_info
    assert version.major == 3 and version.minor >= 9, "Python 3.9+ required"
    print(f"  Python {version.major}.{version.minor}.{version.micro} - OK")

def test_dependencies():
    """Test required dependencies"""
    print("✓ Testing dependencies...")
    required = ["redis", "yaml", "requests", "httpx", "chromadb"]
    for module in required:
        try:
            __import__(module)
            print(f"  {module} - OK")
        except ImportError:
            print(f"  {module} - MISSING")
            return False
    return True

def test_redis_connection():
    """Test Redis connection"""
    print("✓ Testing Redis connection...")
    try:
        import redis
        r = redis.Redis(host="localhost", port=6379, db=0)
        r.ping()
        print("  Redis connection - OK")
        r.close()
        return True
    except Exception as e:
        print(f"  Redis connection - FAILED: {e}")
        return False

def test_glm_client():
    """Test GLM client"""
    print("✓ Testing GLM client...")
    try:
        from core.GLMClient import create_glm_client

        # Test mock client
        client = create_glm_client(mock=True)
        response = client.create([{"role": "user", "content": "Test"}])
        assert response.content is not None

        print("  GLM mock client - OK")

        # Test real client if API key exists
        if os.getenv("GLM_API_KEY"):
            print("  GLM API key found - Real client available")
        else:
            print("  GLM API key not found - Using mock only")

        return True
    except Exception as e:
        print(f"  GLM client - FAILED: {e}")
        return False

def test_event_bus():
    """Test event bus"""
    print("✓ Testing event bus...")
    try:
        from core.event_bus import MemoryEventBus

        bus = MemoryEventBus()
        received = []

        def handler(event):
            received.append(event)

        bus.subscribe("test", handler)
        bus.publish("test", {"msg": "test"})

        assert len(received) == 1
        print("  In-memory event bus - OK")
        return True
    except Exception as e:
        print(f"  Event bus - FAILED: {e}")
        return False

def test_agent_client():
    """Test agent client"""
    print("✓ Testing agent client...")
    try:
        from core.AgentClient import BlackBox5AgentClient
        import tempfile

        with tempfile.TemporaryDirectory() as tmpdir:
            client = BlackBox5AgentClient(
                agent_type="developer",
                project_dir=Path(tmpdir)
            )
            index = client.load_project_index()
            assert "files" in index

        print("  Agent client - OK")
        return True
    except Exception as e:
        print(f"  Agent client - FAILED: {e}")
        return False

def test_orchestrator():
    """Test orchestrator"""
    print("✓ Testing orchestrator...")
    try:
        from core.Orchestrator import AgentOrchestrator
        import asyncio

        async def test():
            orchestrator = AgentOrchestrator()
            assert len(orchestrator.active_agents) == 0
            return True

        result = asyncio.run(test())
        if result:
            print("  Orchestrator - OK")
        return result
    except Exception as e:
        print(f"  Orchestrator - FAILED: {e}")
        return False

def test_configuration():
    """Test configuration"""
    print("✓ Testing configuration...")
    try:
        config_path = Path(__file__).parent.parent / "engine" / "config.yml"
        assert config_path.exists(), "config.yml not found"

        content = config_path.read_text()
        assert "glm:" in content, "GLM not configured"

        print("  Configuration file - OK")
        print("  GLM configured - OK")
        return True
    except Exception as e:
        print(f"  Configuration - FAILED: {e}")
        return False

def main():
    """Run all tests"""
    print_header("BlackBox5 Quick Start Test")

    results = {
        "Python Version": test_python_version(),
        "Dependencies": test_dependencies(),
        "Redis": test_redis_connection(),
        "GLM Client": test_glm_client(),
        "Event Bus": test_event_bus(),
        "Agent Client": test_agent_client(),
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
        print("\nNext steps:")
        print("  1. Set GLM_API_KEY environment variable")
        print("  2. Run: python .blackbox5/tests/test_blackbox5_integration.py")
        print("  3. Start building with BlackBox5!")
        return 0
    else:
        print("\n⚠️  Some tests failed. Please fix the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
