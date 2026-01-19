"""
Test suite for AgentMemory system.

Tests session tracking, insight storage, context management,
and persistence for BlackBox5 agent memory.
"""

import pytest
import tempfile
import shutil
from pathlib import Path
from datetime import datetime, timezone
from time import sleep

from engine.memory.AgentMemory import (
    AgentMemory,
    MemorySession,
    MemoryInsight,
    MemoryContext
)


@pytest.fixture
def temp_memory_dir():
    """Create a temporary directory for memory storage."""
    temp_dir = Path(tempfile.mkdtemp())
    yield temp_dir
    # Cleanup
    if temp_dir.exists():
        shutil.rmtree(temp_dir)


@pytest.fixture
def agent_memory(temp_memory_dir):
    """Create an AgentMemory instance for testing."""
    return AgentMemory(
        agent_id="test-agent",
        memory_base_path=temp_memory_dir,
        auto_save=True
    )


class TestAgentMemoryBasics:
    """Test basic AgentMemory functionality."""

    def test_initialization(self, temp_memory_dir):
        """Memory should initialize with proper structure."""
        memory = AgentMemory(
            agent_id="test-agent",
            memory_base_path=temp_memory_dir
        )

        assert memory.agent_id == "test-agent"
        assert memory.memory_path == temp_memory_dir / "test-agent"
        assert memory.memory_path.exists()
        assert memory.context is not None
        assert memory.context.agent_id == "test-agent"

    def test_persistence(self, temp_memory_dir):
        """Memory should persist across instances."""
        agent_id = "persistent-agent"

        # Create first instance and add data
        memory1 = AgentMemory(
            agent_id=agent_id,
            memory_base_path=temp_memory_dir
        )
        session_id = memory1.add_session(
            task="Test task",
            result="Test result"
        )
        insight_id = memory1.add_insight(
            content="Test insight",
            category="pattern"
        )

        # Create second instance and verify data loaded
        memory2 = AgentMemory(
            agent_id=agent_id,
            memory_base_path=temp_memory_dir
        )

        assert len(memory2.sessions) == 1
        assert memory2.sessions[0].session_id == session_id
        assert len(memory2.insights) == 1
        assert memory2.insights[0].insight_id == insight_id


class TestSessions:
    """Test session tracking functionality."""

    def test_add_session(self, agent_memory):
        """Should store execution sessions."""
        session_id = agent_memory.add_session(
            task="Build feature",
            result="Feature built successfully",
            success=True,
            duration_seconds=120.5
        )

        assert session_id is not None
        assert len(agent_memory.sessions) == 1

        session = agent_memory.sessions[0]
        assert session.task == "Build feature"
        assert session.result == "Feature built successfully"
        assert session.success is True
        assert session.duration_seconds == 120.5

    def test_add_session_with_metadata(self, agent_memory):
        """Should store sessions with metadata."""
        metadata = {
            "files_modified": ["app.py", "utils.py"],
            "lines_changed": 150
        }

        session_id = agent_memory.add_session(
            task="Refactor code",
            result="Code refactored",
            metadata=metadata
        )

        session = agent_memory.sessions[0]
        assert session.metadata == metadata

    def test_get_sessions(self, agent_memory):
        """Should retrieve sessions."""
        # Add multiple sessions
        agent_memory.add_session("Task 1", "Result 1", success=True)
        sleep(0.01)  # Ensure different timestamps
        agent_memory.add_session("Task 2", "Result 2", success=False)
        sleep(0.01)
        agent_memory.add_session("Task 3", "Result 3", success=True)

        # Get all sessions
        all_sessions = agent_memory.get_sessions()
        assert len(all_sessions) == 3

        # Most recent should be last
        assert all_sessions[0]["task"] == "Task 3"

        # Get successful only
        successful = agent_memory.get_sessions(successful_only=True)
        assert len(successful) == 2

        # Limit results
        limited = agent_memory.get_sessions(limit=2)
        assert len(limited) == 2

    def test_session_statistics(self, agent_memory):
        """Should track session statistics in context."""
        agent_memory.add_session("Task 1", "Success", success=True)
        agent_memory.add_session("Task 2", "Failure", success=False)
        agent_memory.add_session("Task 3", "Success", success=True)

        stats = agent_memory.context.statistics
        assert stats["total_sessions"] == 3
        assert stats["successful_sessions"] == 2
        assert stats["failed_sessions"] == 1


class TestInsights:
    """Test insight storage functionality."""

    def test_add_insight(self, agent_memory):
        """Should store learned insights."""
        insight_id = agent_memory.add_insight(
            content="Use TypeScript for type safety",
            category="pattern",
            confidence=0.9
        )

        assert insight_id is not None
        assert len(agent_memory.insights) == 1

        insight = agent_memory.insights[0]
        assert insight.content == "Use TypeScript for type safety"
        assert insight.category == "pattern"
        assert insight.confidence == 0.9

    def test_add_insight_invalid_category(self, agent_memory):
        """Should reject invalid insight categories."""
        with pytest.raises(ValueError, match="Invalid category"):
            agent_memory.add_insight(
                content="Test",
                category="invalid_category"
            )

    def test_add_all_insight_categories(self, agent_memory):
        """Should accept all valid insight categories."""
        categories = ["pattern", "gotcha", "discovery", "optimization"]

        for category in categories:
            agent_memory.add_insight(
                content=f"Test {category}",
                category=category
            )

        assert len(agent_memory.insights) == 4

    def test_get_insights(self, agent_memory):
        """Should retrieve insights with filtering."""
        # Add various insights
        agent_memory.add_insight("Pattern 1", "pattern", confidence=0.9)
        agent_memory.add_insight("Gotcha 1", "gotcha", confidence=0.7)
        agent_memory.add_insight("Pattern 2", "pattern", confidence=0.5)
        agent_memory.add_insight("Discovery 1", "discovery", confidence=1.0)

        # Get all insights
        all_insights = agent_memory.get_insights()
        assert len(all_insights) == 4

        # Filter by category
        patterns = agent_memory.get_insights(category="pattern")
        assert len(patterns) == 2

        # Filter by confidence
        high_confidence = agent_memory.get_insights(min_confidence=0.8)
        assert len(high_confidence) == 2

        # Combined filters
        confident_patterns = agent_memory.get_insights(
            category="pattern",
            min_confidence=0.8
        )
        assert len(confident_patterns) == 1
        assert confident_patterns[0]["content"] == "Pattern 1"

    def test_insight_updates_context(self, agent_memory):
        """Insights should update context lists."""
        agent_memory.add_insight("Pattern A", "pattern")
        agent_memory.add_insight("Gotcha B", "gotcha")
        agent_memory.add_insight("Discovery C", "discovery")

        context = agent_memory.get_context()
        assert "Pattern A" in context["patterns"]
        assert "Gotcha B" in context["gotchas"]
        assert "Discovery C" in context["discoveries"]


class TestContext:
    """Test context management functionality."""

    def test_get_context(self, agent_memory):
        """Should retrieve accumulated context."""
        context = agent_memory.get_context()

        assert "patterns" in context
        assert "gotchas" in context
        assert "discoveries" in context
        assert "preferences" in context
        assert "statistics" in context
        assert "created_at" in context
        assert "updated_at" in context

    def test_update_context_patterns(self, agent_memory):
        """Should update context patterns."""
        agent_memory.update_context({
            "patterns": ["Pattern 1", "Pattern 2"]
        })

        context = agent_memory.get_context()
        assert "Pattern 1" in context["patterns"]
        assert "Pattern 2" in context["patterns"]

        # Adding again should not duplicate
        agent_memory.update_context({
            "patterns": ["Pattern 2", "Pattern 3"]
        })

        context = agent_memory.get_context()
        assert len(context["patterns"]) == 3  # 1, 2, 3 (no duplicate 2)

    def test_update_context_gotchas(self, agent_memory):
        """Should update context gotchas."""
        agent_memory.update_context({
            "gotchas": ["Gotcha 1", "Gotcha 2"]
        })

        context = agent_memory.get_context()
        assert "Gotcha 1" in context["gotchas"]
        assert "Gotcha 2" in context["gotchas"]

    def test_update_context_preferences(self, agent_memory):
        """Should update context preferences."""
        agent_memory.update_context({
            "preferences": {
                "language": "python",
                "style": "functional"
            }
        })

        context = agent_memory.get_context()
        assert context["preferences"]["language"] == "python"
        assert context["preferences"]["style"] == "functional"

    def test_update_context_merges_preferences(self, agent_memory):
        """Should merge preferences, not replace."""
        agent_memory.update_context({
            "preferences": {"key1": "value1"}
        })

        agent_memory.update_context({
            "preferences": {"key2": "value2"}
        })

        context = agent_memory.get_context()
        assert context["preferences"]["key1"] == "value1"
        assert context["preferences"]["key2"] == "value2"


class TestSearch:
    """Test search functionality."""

    def test_search_insights(self, agent_memory):
        """Should search insights by content."""
        agent_memory.add_insight(
            "Use React hooks for state management",
            "pattern"
        )
        agent_memory.add_insight(
            "Python async/await for concurrency",
            "pattern"
        )
        agent_memory.add_insight(
            "TypeScript interfaces provide type safety",
            "pattern"
        )

        # Search for "React"
        results = agent_memory.search_insights("React")
        assert len(results) == 1
        assert "React" in results[0]["content"]

        # Search for "for" - should match 2 insights
        results = agent_memory.search_insights("for")
        assert len(results) >= 2

    def test_search_is_case_insensitive(self, agent_memory):
        """Search should be case-insensitive."""
        agent_memory.add_insight("Use TypeScript", "pattern")

        results_lower = agent_memory.search_insights("typescript")
        results_upper = agent_memory.search_insights("TYPESCRIPT")
        results_mixed = agent_memory.search_insights("TypeScript")

        assert len(results_lower) == 1
        assert len(results_upper) == 1
        assert len(results_mixed) == 1

    def test_search_with_limit(self, agent_memory):
        """Should limit search results."""
        for i in range(10):
            agent_memory.add_insight(f"Pattern {i}", "pattern")

        results = agent_memory.search_insights("Pattern", limit=5)
        assert len(results) == 5


class TestStatistics:
    """Test statistics and reporting."""

    def test_get_statistics(self, agent_memory):
        """Should provide comprehensive statistics."""
        # Add sessions
        agent_memory.add_session("Task 1", "Success", success=True, duration_seconds=100)
        agent_memory.add_session("Task 2", "Failure", success=False, duration_seconds=50)
        agent_memory.add_session("Task 3", "Success", success=True, duration_seconds=150)

        # Add insights
        agent_memory.add_insight("Pattern 1", "pattern")
        agent_memory.add_insight("Gotcha 1", "gotcha")
        agent_memory.add_insight("Discovery 1", "discovery")

        stats = agent_memory.get_statistics()

        assert stats["total_sessions"] == 3
        assert stats["successful_sessions"] == 2
        assert stats["failed_sessions"] == 1
        assert stats["success_rate"] == 2/3
        assert stats["total_duration_seconds"] == 300
        assert stats["avg_duration_seconds"] == 100
        assert stats["total_insights"] == 3
        assert stats["insights_by_category"]["pattern"] == 1
        assert stats["insights_by_category"]["gotcha"] == 1
        assert stats["insights_by_category"]["discovery"] == 1

    def test_statistics_empty_memory(self, agent_memory):
        """Should handle empty memory."""
        stats = agent_memory.get_statistics()

        assert stats["total_sessions"] == 0
        assert stats["success_rate"] == 0
        assert stats["total_insights"] == 0


class TestMemoryManagement:
    """Test memory management operations."""

    def test_clear_memory_all(self, agent_memory):
        """Should clear all memory data."""
        agent_memory.add_session("Task", "Result")
        agent_memory.add_insight("Pattern", "pattern")

        agent_memory.clear_memory(keep_context=False)

        assert len(agent_memory.sessions) == 0
        assert len(agent_memory.insights) == 0
        assert len(agent_memory.context.patterns) == 0
        assert len(agent_memory.context.gotchas) == 0

    def test_clear_memory_keep_context(self, agent_memory):
        """Should clear sessions but preserve context."""
        agent_memory.add_session("Task", "Result")
        agent_memory.add_insight("Pattern", "pattern")

        original_patterns = agent_memory.context.patterns.copy()

        agent_memory.clear_memory(keep_context=True)

        assert len(agent_memory.sessions) == 0
        assert len(agent_memory.insights) == 0
        assert agent_memory.context.patterns == original_patterns

    def test_export_memory(self, agent_memory):
        """Should export memory to dictionary."""
        agent_memory.add_session("Task", "Result", success=True)
        agent_memory.add_insight("Pattern", "pattern")

        exported = agent_memory.export_memory()

        assert exported["agent_id"] == "test-agent"
        assert len(exported["sessions"]) == 1
        assert len(exported["insights"]) == 1
        assert exported["context"] is not None
        assert exported["statistics"] is not None

    def test_import_memory_replace(self, temp_memory_dir):
        """Should import and replace memory."""
        # Create source memory with data
        memory1 = AgentMemory(
            agent_id="agent1",
            memory_base_path=temp_memory_dir
        )
        memory1.add_session("Task 1", "Result 1")
        memory1.add_insight("Pattern 1", "pattern")

        exported = memory1.export_memory()

        # Create new memory and import
        memory2 = AgentMemory(
            agent_id="agent2",
            memory_base_path=temp_memory_dir
        )
        memory2.add_session("Task 2", "Result 2")  # This should be replaced

        memory2.import_memory(exported, merge=False)

        assert len(memory2.sessions) == 1
        assert memory2.sessions[0].task == "Task 1"
        assert len(memory2.insights) == 1

    def test_import_memory_merge(self, temp_memory_dir):
        """Should import and merge memory."""
        memory1 = AgentMemory(
            agent_id="agent1",
            memory_base_path=temp_memory_dir
        )
        memory1.add_session("Task 1", "Result 1")
        memory1.add_insight("Pattern 1", "pattern")

        exported = memory1.export_memory()

        memory2 = AgentMemory(
            agent_id="agent2",
            memory_base_path=temp_memory_dir
        )
        memory2.add_session("Task 2", "Result 2")
        memory2.add_insight("Pattern 2", "pattern")

        memory2.import_memory(exported, merge=True)

        assert len(memory2.sessions) == 2
        assert len(memory2.insights) == 2
        tasks = [s.task for s in memory2.sessions]
        assert "Task 1" in tasks
        assert "Task 2" in tasks


class TestAgentIsolation:
    """Test that different agents have isolated memory."""

    def test_agent_memory_isolation(self, temp_memory_dir):
        """Different agents should have separate memory."""
        memory1 = AgentMemory(
            agent_id="agent-1",
            memory_base_path=temp_memory_dir
        )
        memory2 = AgentMemory(
            agent_id="agent-2",
            memory_base_path=temp_memory_dir
        )

        memory1.add_session("Agent 1 task", "Result 1")
        memory1.add_insight("Agent 1 pattern", "pattern")

        memory2.add_session("Agent 2 task", "Result 2")
        memory2.add_insight("Agent 2 pattern", "pattern")

        # Agent 1 should only see its own data
        assert len(memory1.sessions) == 1
        assert len(memory1.insights) == 1
        assert memory1.sessions[0].task == "Agent 1 task"

        # Agent 2 should only see its own data
        assert len(memory2.sessions) == 1
        assert len(memory2.insights) == 1
        assert memory2.sessions[0].task == "Agent 2 task"

    def test_agent_separate_storage(self, temp_memory_dir):
        """Different agents should use separate storage files."""
        memory1 = AgentMemory(
            agent_id="agent-1",
            memory_base_path=temp_memory_dir
        )
        memory2 = AgentMemory(
            agent_id="agent-2",
            memory_base_path=temp_memory_dir
        )

        # Add data to trigger file creation
        memory1.add_session("Task 1", "Result 1")
        memory2.add_session("Task 2", "Result 2")

        path1 = temp_memory_dir / "agent-1"
        path2 = temp_memory_dir / "agent-2"

        assert path1.exists()
        assert path2.exists()
        assert path1 != path2

        # Each should have separate files (created after adding data)
        assert (path1 / "sessions.json").exists()
        assert (path2 / "sessions.json").exists()


class TestConcurrency:
    """Test thread-safe operations."""

    def test_concurrent_session_addition(self, agent_memory):
        """Should handle concurrent session additions safely."""
        import threading

        def add_sessions(count):
            for i in range(count):
                agent_memory.add_session(
                    f"Task {threading.get_ident()}_{i}",
                    f"Result {i}"
                )

        threads = []
        for _ in range(5):
            t = threading.Thread(target=add_sessions, args=(10,))
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        assert len(agent_memory.sessions) == 50

    def test_concurrent_insight_addition(self, agent_memory):
        """Should handle concurrent insight additions safely."""
        import threading

        def add_insights(count):
            for i in range(count):
                agent_memory.add_insight(
                    f"Pattern {threading.get_ident()}_{i}",
                    "pattern"
                )

        threads = []
        for _ in range(5):
            t = threading.Thread(target=add_insights, args=(10,))
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        assert len(agent_memory.insights) == 50
