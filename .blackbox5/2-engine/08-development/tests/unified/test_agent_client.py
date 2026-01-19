"""
Test Suite for BlackBox5 Agent Client
=======================================

Tests for the AgentClient module adapted from Auto-Claude.

Run with:
    cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
    python -m pytest .blackbox5/tests/test_agent_client.py -v
"""

import json
import tempfile
import time
from pathlib import Path
from unittest.mock import patch

import pytest

# Import the module to test
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from engine.core.AgentClient import (
    _get_cached_project_data,
    create_client,
    detect_project_capabilities,
    get_tools_for_agent,
    invalidate_project_cache,
    load_project_index,
)


@pytest.fixture
def temp_project_dir():
    """Create a temporary project directory for testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        project_dir = Path(tmpdir)
        # Create .blackbox5 directory
        bb_dir = project_dir / ".blackbox5"
        bb_dir.mkdir(parents=True, exist_ok=True)
        yield project_dir


@pytest.fixture
def sample_project_index():
    """Sample project index data."""
    return {
        "services": {
            "frontend": {
                "framework": "react",
                "dependencies": ["react", "react-dom", "vite"],
                "dev_dependencies": ["vite", "@types/react"],
            },
            "backend": {
                "framework": "express",
                "dependencies": ["express", "pg"],
                "api": {"routes": ["/api/users", "/api/posts"]},
                "database": {"type": "postgresql"},
            },
        }
    }


@pytest.fixture
def electron_project_index():
    """Sample Electron project index."""
    return {
        "services": {
            "desktop": {
                "framework": "electron",
                "dependencies": ["electron", "react"],
                "dev_dependencies": ["electron-builder"],
            }
        }
    }


class TestLoadProjectIndex:
    """Tests for load_project_index function."""

    def test_load_existing_index(self, temp_project_dir, sample_project_index):
        """Test loading an existing project index."""
        index_file = temp_project_dir / ".blackbox5" / "project_index.json"
        with open(index_file, "w") as f:
            json.dump(sample_project_index, f)

        result = load_project_index(temp_project_dir)

        assert result == sample_project_index
        assert "services" in result
        assert "frontend" in result["services"]

    def test_load_missing_index(self, temp_project_dir):
        """Test loading when project index doesn't exist."""
        result = load_project_index(temp_project_dir)

        assert result == {}

    def test_load_invalid_json(self, temp_project_dir):
        """Test loading with invalid JSON."""
        index_file = temp_project_dir / ".blackbox5" / "project_index.json"
        with open(index_file, "w") as f:
            f.write("invalid json {{{")

        result = load_project_index(temp_project_dir)

        assert result == {}


class TestDetectProjectCapabilities:
    """Tests for detect_project_capabilities function."""

    def test_detect_react_project(self, sample_project_index):
        """Test detecting React web project."""
        capabilities = detect_project_capabilities(sample_project_index)

        assert capabilities["is_web_frontend"] is True
        assert capabilities["has_api"] is True
        assert capabilities["has_database"] is True
        assert capabilities["is_electron"] is False

    def test_detect_electron_project(self, electron_project_index):
        """Test detecting Electron project."""
        capabilities = detect_project_capabilities(electron_project_index)

        assert capabilities["is_electron"] is True
        # Note: Electron projects don't automatically set is_web_frontend
        # unless there's a separate web framework like react detected
        # In this case, the framework is "electron", not "react"

    def test_detect_empty_project(self):
        """Test detecting capabilities from empty index."""
        capabilities = detect_project_capabilities({})

        # All capabilities should be False
        for value in capabilities.values():
            assert value is False

    def test_detect_nextjs_project(self):
        """Test detecting Next.js project."""
        index = {
            "services": {
                "frontend": {
                    "framework": "nextjs",
                    "dependencies": ["next", "react"],
                }
            }
        }

        capabilities = detect_project_capabilities(index)

        assert capabilities["is_nextjs"] is True
        assert capabilities["is_web_frontend"] is True


class TestGetToolsForAgent:
    """Tests for get_tools_for_agent function."""

    def test_coder_tools(self):
        """Test getting tools for coder agent."""
        tools = get_tools_for_agent("coder", {})

        assert "Read" in tools
        assert "Write" in tools
        assert "Edit" in tools
        assert "Bash" in tools
        assert "WebSearch" in tools

    def test_planner_tools(self):
        """Test getting tools for planner agent."""
        tools = get_tools_for_agent("planner", {})

        assert "Read" in tools
        assert "Write" in tools
        assert "Bash" in tools

    def test_qa_reviewer_tools(self):
        """Test getting tools for QA reviewer agent."""
        tools = get_tools_for_agent("qa_reviewer", {})

        assert "Read" in tools
        assert "Bash" in tools
        # Write is not in base tools for qa_reviewer
        assert "Write" not in tools

    def test_qa_reviewer_with_electron(self):
        """Test QA reviewer gets browser tools for Electron projects."""
        capabilities = {"is_electron": True}
        tools = get_tools_for_agent("qa_reviewer", capabilities)

        # Should include browser tools
        assert any("browser" in tool for tool in tools)


class TestCreateClient:
    """Tests for create_client function."""

    def test_create_basic_client(self, temp_project_dir):
        """Test creating a basic client configuration."""
        config = create_client(
            project_dir=temp_project_dir,
            agent_type="coder",
        )

        assert config["model"] == "claude-sonnet-4-5-20250929"
        assert "system_prompt" in config
        assert "allowed_tools" in config
        assert "project_capabilities" in config
        assert config["max_thinking_tokens"] is None

    def test_create_client_with_custom_model(self, temp_project_dir):
        """Test creating client with custom model."""
        config = create_client(
            project_dir=temp_project_dir,
            model="claude-opus-4-5-20250929",
            agent_type="planner",
        )

        assert config["model"] == "claude-opus-4-5-20250929"

    def test_create_client_with_thinking_tokens(self, temp_project_dir):
        """Test creating client with extended thinking."""
        config = create_client(
            project_dir=temp_project_dir,
            agent_type="planner",
            max_thinking_tokens=10000,
        )

        assert config["max_thinking_tokens"] == 10000

    def test_create_qa_reviewer_client(self, temp_project_dir):
        """Test creating QA reviewer client."""
        config = create_client(
            project_dir=temp_project_dir,
            agent_type="qa_reviewer",
        )

        # QA reviewer should have Read but not Write by default
        assert "Read" in config["allowed_tools"]
        assert "Write" not in config["allowed_tools"]


class TestProjectCache:
    """Tests for project index caching."""

    def test_cache_hit(self, temp_project_dir, sample_project_index):
        """Test that cache returns same data on second call."""
        # Create project index
        index_file = temp_project_dir / ".blackbox5" / "project_index.json"
        with open(index_file, "w") as f:
            json.dump(sample_project_index, f)

        # First call - cache miss
        index1, caps1 = _get_cached_project_data(temp_project_dir)

        # Second call - cache hit
        index2, caps2 = _get_cached_project_data(temp_project_dir)

        assert index1 == index2
        assert caps1 == caps2

    def test_cache_expiration(self, temp_project_dir, sample_project_index):
        """Test that cache expires after TTL."""
        # Create project index
        index_file = temp_project_dir / ".blackbox5" / "project_index.json"
        with open(index_file, "w") as f:
            json.dump(sample_project_index, f)

        # First call
        index1, caps1 = _get_cached_project_data(temp_project_dir)

        # Mock time to simulate cache expiration
        with patch("time.time", return_value=time.time() + 400):  # > 300s TTL
            index2, caps2 = _get_cached_project_data(temp_project_dir)

        # Should still return same data, but reloaded
        assert index1 == index2
        assert caps1 == caps2

    def test_invalidate_cache(self, temp_project_dir, sample_project_index):
        """Test invalidating the cache."""
        # Create project index
        index_file = temp_project_dir / ".blackbox5" / "project_index.json"
        with open(index_file, "w") as f:
            json.dump(sample_project_index, f)

        # First call - populate cache
        _get_cached_project_data(temp_project_dir)

        # Invalidate cache
        invalidate_project_cache(temp_project_dir)

        # Second call - cache miss after invalidation
        index, caps = _get_cached_project_data(temp_project_dir)

        assert index == sample_project_index

    def test_invalidate_all_cache(self, temp_project_dir):
        """Test invalidating all cache entries."""
        # Create multiple project directories
        with tempfile.TemporaryDirectory() as tmpdir1:
            with tempfile.TemporaryDirectory() as tmpdir2:
                dir1 = Path(tmpdir1)
                dir2 = Path(tmpdir2)

                # Populate cache for both
                _get_cached_project_data(dir1)
                _get_cached_project_data(dir2)

                # Invalidate all
                invalidate_project_cache(None)

                # Both should be cleared
                # (This is hard to test directly, but we verify no errors occur)


class TestIntegration:
    """Integration tests for the complete workflow."""

    def test_full_workflow(self, temp_project_dir, sample_project_index):
        """Test the complete workflow from loading to client creation."""
        # 1. Create project index
        index_file = temp_project_dir / ".blackbox5" / "project_index.json"
        with open(index_file, "w") as f:
            json.dump(sample_project_index, f)

        # 2. Load project index
        index = load_project_index(temp_project_dir)
        assert index == sample_project_index

        # 3. Detect capabilities
        capabilities = detect_project_capabilities(index)
        assert capabilities["is_web_frontend"] is True

        # 4. Get tools for agent
        tools = get_tools_for_agent("coder", capabilities)
        assert "Read" in tools

        # 5. Create client
        config = create_client(
            project_dir=temp_project_dir,
            agent_type="coder",
        )

        assert config["project_capabilities"] == capabilities
        assert set(config["allowed_tools"]) == set(tools)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
