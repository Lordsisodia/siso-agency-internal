"""
Production Memory System Tests

Tests for the simplified, production-grade memory system.
Run with: python -m pytest tests/test_memory_system.py -v
"""

import pytest
import tempfile
import shutil
import sys
from pathlib import Path
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from engine.memory import (
    Message,
    WorkingMemory,
    PersistentMemory,
    ProductionMemorySystem,
    create_message,
    get_memory_system
)


class TestMessage:
    """Test Message dataclass"""

    def test_create_message(self):
        """Test message creation"""
        msg = Message(
            role="user",
            content="Hello, world!",
            timestamp="2025-01-18T10:00:00",
            agent_id="agent-1",
            task_id="task-1"
        )

        assert msg.role == "user"
        assert msg.content == "Hello, world!"
        assert msg.agent_id == "agent-1"
        assert msg.task_id == "task-1"

    def test_message_serialization(self):
        """Test message to_dict conversion"""
        msg = Message(
            role="user",
            content="Test",
            timestamp="2025-01-18T10:00:00"
        )

        data = msg.to_dict()
        assert data["role"] == "user"
        assert data["content"] == "Test"

        # Test deserialization
        restored = Message.from_dict(data)
        assert restored.role == msg.role
        assert restored.content == msg.content

    def test_message_hash(self):
        """Test message hash generation"""
        msg1 = Message(
            role="user",
            content="Test",
            timestamp="2025-01-18T10:00:00"
        )

        msg2 = Message(
            role="user",
            content="Test",
            timestamp="2025-01-18T10:00:00"
        )

        # Same content should produce same hash
        assert msg1.get_hash() == msg2.get_hash()

        # Different content should produce different hash
        msg3 = Message(
            role="user",
            content="Different",
            timestamp="2025-01-18T10:00:00"
        )

        assert msg1.get_hash() != msg3.get_hash()


class TestWorkingMemory:
    """Test WorkingMemory implementation"""

    def test_add_message(self):
        """Test adding messages to working memory"""
        memory = WorkingMemory(max_messages=10)
        msg = create_message("user", "Hello")

        memory.add_message(msg)
        assert memory.size() == 1

    def test_max_messages_limit(self):
        """Test that max_messages limit is enforced"""
        memory = WorkingMemory(max_messages=3)

        # Add 5 messages
        for i in range(5):
            memory.add_message(create_message("user", f"Message {i}"))

        # Should only keep last 3
        assert memory.size() == 3

        messages = memory.get_messages()
        assert messages[0].content == "Message 2"
        assert messages[1].content == "Message 3"
        assert messages[2].content == "Message 4"

    def test_get_messages_with_limit(self):
        """Test getting messages with limit"""
        memory = WorkingMemory(max_messages=100)

        for i in range(10):
            memory.add_message(create_message("user", f"Message {i}"))

        messages = memory.get_messages(limit=3)
        assert len(messages) == 3
        assert messages[0].content == "Message 7"
        assert messages[1].content == "Message 8"
        assert messages[2].content == "Message 9"

    def test_filter_by_role(self):
        """Test filtering messages by role"""
        memory = WorkingMemory(max_messages=100)

        memory.add_message(create_message("user", "User message"))
        memory.add_message(create_message("assistant", "Assistant message"))
        memory.add_message(create_message("user", "Another user message"))

        user_messages = memory.get_messages(role="user")
        assert len(user_messages) == 2

        assistant_messages = memory.get_messages(role="assistant")
        assert len(assistant_messages) == 1

    def test_filter_by_task_id(self):
        """Test filtering messages by task_id"""
        memory = WorkingMemory(max_messages=100)

        memory.add_message(create_message("user", "Task 1 message", task_id="task-1"))
        memory.add_message(create_message("user", "Task 2 message", task_id="task-2"))
        memory.add_message(create_message("user", "Another task 1 message", task_id="task-1"))

        task1_messages = memory.get_messages(task_id="task-1")
        assert len(task1_messages) == 2

    def test_get_context(self):
        """Test getting formatted context"""
        memory = WorkingMemory(max_messages=100)

        memory.add_message(create_message("user", "Hello"))
        memory.add_message(create_message("assistant", "Hi there!"))

        context = memory.get_context(limit=10)
        assert "user: Hello" in context
        assert "assistant: Hi there!" in context

    def test_clear(self):
        """Test clearing working memory"""
        memory = WorkingMemory(max_messages=100)

        memory.add_message(create_message("user", "Hello"))
        assert memory.size() == 1

        memory.clear()
        assert memory.size() == 0


class TestPersistentMemory:
    """Test PersistentMemory implementation"""

    @pytest.fixture
    def temp_db(self):
        """Create temporary database"""
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = Path(tmpdir) / "test.db"
            yield db_path

    def test_database_initialization(self, temp_db):
        """Test that database is initialized correctly"""
        memory = PersistentMemory(temp_db)

        # Check that tables exist
        import sqlite3
        with sqlite3.connect(temp_db) as conn:
            cursor = conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            )
            tables = [row[0] for row in cursor.fetchall()]
            assert "messages" in tables

    def test_store_message(self, temp_db):
        """Test storing messages"""
        memory = PersistentMemory(temp_db)
        msg = create_message("user", "Hello, world!")

        result = memory.store_message(msg)
        assert result is True

    def test_deduplication(self, temp_db):
        """Test that duplicate messages are not stored"""
        memory = PersistentMemory(temp_db)

        # Create messages with same timestamp to test hash-based deduplication
        timestamp = "2025-01-18T10:00:00"
        msg1 = Message(role="user", content="Test", timestamp=timestamp)
        msg2 = Message(role="user", content="Test", timestamp=timestamp)

        memory.store_message(msg1)
        memory.store_message(msg2)

        messages = memory.get_messages(limit=100)
        # Should only have one message due to deduplication
        assert len(messages) == 1

    def test_retrieve_messages(self, temp_db):
        """Test retrieving stored messages"""
        memory = PersistentMemory(temp_db)

        memory.store_message(create_message("user", "Message 1"))
        memory.store_message(create_message("assistant", "Message 2"))

        messages = memory.get_messages()
        assert len(messages) == 2
        assert messages[0].content == "Message 1"
        assert messages[1].content == "Message 2"

    def test_filter_by_task_id(self, temp_db):
        """Test filtering by task_id"""
        memory = PersistentMemory(temp_db)

        memory.store_message(create_message("user", "Task 1", task_id="task-1"))
        memory.store_message(create_message("user", "Task 2", task_id="task-2"))

        task1_messages = memory.get_messages(task_id="task-1")
        assert len(task1_messages) == 1
        assert task1_messages[0].content == "Task 1"


class TestProductionMemorySystem:
    """Test integrated ProductionMemorySystem"""

    @pytest.fixture
    def temp_project(self):
        """Create temporary project directory"""
        with tempfile.TemporaryDirectory() as tmpdir:
            project_path = Path(tmpdir)
            yield project_path

    def test_initialization(self, temp_project):
        """Test system initialization"""
        memory = ProductionMemorySystem(
            project_path=temp_project,
            project_name="test-project"
        )

        assert memory.project_name == "test-project"
        assert memory.memory_dir.exists()

        # Check database was created
        assert (memory.memory_dir / "messages.db").exists()

    def test_add_message(self, temp_project):
        """Test adding messages"""
        memory = ProductionMemorySystem(
            project_path=temp_project,
            project_name="test-project"
        )

        msg = create_message("user", "Hello")
        memory.add(msg)

        # Should be in working memory
        assert memory.working.size() == 1

        # Should be in persistent memory
        persistent_msgs = memory.persistent.get_messages()
        assert len(persistent_msgs) == 1

    def test_get_context(self, temp_project):
        """Test getting context"""
        memory = ProductionMemorySystem(
            project_path=temp_project,
            project_name="test-project"
        )

        memory.add(create_message("user", "Hello"))
        memory.add(create_message("assistant", "Hi!"))

        context = memory.get_context(limit=10)
        assert "user: Hello" in context
        assert "assistant: Hi!" in context

    def test_search(self, temp_project):
        """Test keyword search"""
        memory = ProductionMemorySystem(
            project_path=temp_project,
            project_name="test-project"
        )

        memory.add(create_message("user", "I need help with Python"))
        memory.add(create_message("assistant", "Sure, I can help with Python"))
        memory.add(create_message("user", "What about JavaScript?"))

        results = memory.search("Python")
        assert len(results) == 2

    def test_clear_working(self, temp_project):
        """Test clearing working memory"""
        memory = ProductionMemorySystem(
            project_path=temp_project,
            project_name="test-project"
        )

        memory.add(create_message("user", "Hello"))
        assert memory.working.size() == 1

        memory.clear_working()
        assert memory.working.size() == 0

        # Persistent storage should still have the message
        persistent = memory.persistent.get_messages()
        assert len(persistent) == 1

    def test_get_stats(self, temp_project):
        """Test getting memory statistics"""
        memory = ProductionMemorySystem(
            project_path=temp_project,
            project_name="test-project"
        )

        memory.add(create_message("user", "Hello"))

        stats = memory.get_stats()
        assert stats["working_memory_size"] == 1
        assert stats["project_name"] == "test-project"
        assert "memory_directory" in stats


class TestConvenienceFunctions:
    """Test convenience functions"""

    def test_create_message(self):
        """Test create_message helper"""
        msg = create_message(
            "user",
            "Test message",
            agent_id="agent-1",
            task_id="task-1"
        )

        assert msg.role == "user"
        assert msg.content == "Test message"
        assert msg.agent_id == "agent-1"
        assert msg.task_id == "task-1"
        assert msg.timestamp is not None  # Should auto-generate

    def test_get_memory_system(self):
        """Test get_memory_system helper"""
        with tempfile.TemporaryDirectory() as tmpdir:
            project_path = Path(tmpdir)
            memory = get_memory_system(project_path, project_name="test")

            assert isinstance(memory, ProductionMemorySystem)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
