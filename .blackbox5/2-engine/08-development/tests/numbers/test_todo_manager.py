"""
Test suite for Todo Management System
"""

import pytest
import tempfile
import shutil
from pathlib import Path
from datetime import datetime
from engine.core.todo_manager import (
    TodoManager,
    Todo,
    Priority,
    TodoStatus
)


@pytest.fixture
def temp_storage():
    """Create temporary storage for testing"""
    temp_dir = tempfile.mkdtemp()
    storage_path = Path(temp_dir) / "todos.json"
    yield storage_path
    # Cleanup
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def todo_manager(temp_storage):
    """Create a TodoManager instance with temporary storage"""
    return TodoManager(storage_path=temp_storage)


class TestTodo:
    """Test Todo dataclass"""

    def test_todo_creation(self):
        """Test creating a todo"""
        todo = Todo(
            id="test123",
            description="Test todo",
            priority=Priority.NORMAL,
            status=TodoStatus.PENDING,
            tags=["test", "example"],
            created_at=datetime.now()
        )

        assert todo.id == "test123"
        assert todo.description == "Test todo"
        assert todo.priority == Priority.NORMAL
        assert todo.status == TodoStatus.PENDING
        assert todo.tags == ["test", "example"]
        assert todo.notes == ""
        assert todo.estimated_effort is None

    def test_todo_to_dict(self):
        """Test converting todo to dictionary"""
        now = datetime.now()
        todo = Todo(
            id="test123",
            description="Test todo",
            priority=Priority.URGENT,
            status=TodoStatus.PENDING,
            tags=["test"],
            created_at=now,
            notes="Test notes",
            estimated_effort="2h"
        )

        data = todo.to_dict()

        assert data['id'] == "test123"
        assert data['description'] == "Test todo"
        assert data['priority'] == "urgent"
        assert data['status'] == "pending"
        assert data['tags'] == ["test"]
        assert data['notes'] == "Test notes"
        assert data['estimated_effort'] == "2h"
        assert data['completed_at'] is None

    def test_todo_from_dict(self):
        """Test creating todo from dictionary"""
        data = {
            'id': "test123",
            'description': "Test todo",
            'priority': "urgent",
            'status': "pending",
            'tags': ["test"],
            'created_at': datetime.now().isoformat(),
            'completed_at': None,
            'notes': "Test notes",
            'estimated_effort': "2h"
        }

        todo = Todo.from_dict(data)

        assert todo.id == "test123"
        assert todo.description == "Test todo"
        assert todo.priority == Priority.URGENT
        assert todo.status == TodoStatus.PENDING
        assert todo.tags == ["test"]
        assert todo.notes == "Test notes"
        assert todo.estimated_effort == "2h"


class TestTodoManagerQuickAdd:
    """Test quick add functionality"""

    def test_quick_add_basic(self, todo_manager):
        """Test basic quick add"""
        todo_id = todo_manager.quick_add("Test todo")

        assert todo_id is not None
        assert len(todo_id) == 8  # UUID prefix

        todo = todo_manager.get(todo_id)
        assert todo is not None
        assert todo.description == "Test todo"
        assert todo.priority == Priority.NORMAL
        assert todo.status == TodoStatus.PENDING
        assert todo.tags == []

    def test_quick_add_with_priority(self, todo_manager):
        """Test quick add with priority"""
        todo_id = todo_manager.quick_add("Urgent todo", priority="urgent")

        todo = todo_manager.get(todo_id)
        assert todo.priority == Priority.URGENT

    def test_quick_add_with_tags(self, todo_manager):
        """Test quick add with tags"""
        todo_id = todo_manager.quick_add(
            "Tagged todo",
            tags=["feature", "backend"]
        )

        todo = todo_manager.get(todo_id)
        assert todo.tags == ["feature", "backend"]

    def test_quick_add_multiple(self, todo_manager):
        """Test adding multiple todos"""
        ids = []
        for i in range(5):
            todo_id = todo_manager.quick_add(f"Todo {i}")
            ids.append(todo_id)

        assert len(ids) == 5
        assert len(set(ids)) == 5  # All unique
        assert len(todo_manager.todos) == 5


class TestTodoManagerComplete:
    """Test completing todos"""

    def test_complete_todo(self, todo_manager):
        """Test marking todo as complete"""
        todo_id = todo_manager.quick_add("Test todo")

        result = todo_manager.complete(todo_id)

        assert result is True

        todo = todo_manager.get(todo_id)
        assert todo.status == TodoStatus.COMPLETED
        assert todo.completed_at is not None

    def test_complete_nonexistent(self, todo_manager):
        """Test completing non-existent todo"""
        result = todo_manager.complete("nonexistent")
        assert result is False

    def test_complete_already_completed(self, todo_manager):
        """Test completing already completed todo"""
        todo_id = todo_manager.quick_add("Test todo")
        todo_manager.complete(todo_id)

        # Complete again
        result = todo_manager.complete(todo_id)

        assert result is True
        todo = todo_manager.get(todo_id)
        assert todo.status == TodoStatus.COMPLETED


class TestTodoManagerUpdate:
    """Test updating todos"""

    def test_update_description(self, todo_manager):
        """Test updating description"""
        todo_id = todo_manager.quick_add("Original")

        result = todo_manager.update(todo_id, description="Updated")

        assert result is True
        todo = todo_manager.get(todo_id)
        assert todo.description == "Updated"

    def test_update_priority(self, todo_manager):
        """Test updating priority"""
        todo_id = todo_manager.quick_add("Test", priority="normal")

        result = todo_manager.update(todo_id, priority="urgent")

        assert result is True
        todo = todo_manager.get(todo_id)
        assert todo.priority == Priority.URGENT

    def test_update_status(self, todo_manager):
        """Test updating status"""
        todo_id = todo_manager.quick_add("Test")

        result = todo_manager.update(todo_id, status="in_progress")

        assert result is True
        todo = todo_manager.get(todo_id)
        assert todo.status == TodoStatus.IN_PROGRESS

    def test_update_tags(self, todo_manager):
        """Test updating tags"""
        todo_id = todo_manager.quick_add("Test", tags=["old"])

        result = todo_manager.update(todo_id, tags=["new", "tags"])

        assert result is True
        todo = todo_manager.get(todo_id)
        assert todo.tags == ["new", "tags"]

    def test_update_notes(self, todo_manager):
        """Test updating notes"""
        todo_id = todo_manager.quick_add("Test")

        result = todo_manager.update(todo_id, notes="Important note")

        assert result is True
        todo = todo_manager.get(todo_id)
        assert todo.notes == "Important note"

    def test_update_multiple_fields(self, todo_manager):
        """Test updating multiple fields at once"""
        todo_id = todo_manager.quick_add("Original", priority="low")

        result = todo_manager.update(
            todo_id,
            description="Updated",
            priority="urgent",
            status="in_progress",
            notes="Notes"
        )

        assert result is True
        todo = todo_manager.get(todo_id)
        assert todo.description == "Updated"
        assert todo.priority == Priority.URGENT
        assert todo.status == TodoStatus.IN_PROGRESS
        assert todo.notes == "Notes"

    def test_update_nonexistent(self, todo_manager):
        """Test updating non-existent todo"""
        result = todo_manager.update("nonexistent", description="Updated")
        assert result is False


class TestTodoManagerDelete:
    """Test deleting todos"""

    def test_delete_todo(self, todo_manager):
        """Test deleting a todo"""
        todo_id = todo_manager.quick_add("Test todo")

        result = todo_manager.delete(todo_id)

        assert result is True
        assert todo_manager.get(todo_id) is None
        assert len(todo_manager.todos) == 0

    def test_delete_nonexistent(self, todo_manager):
        """Test deleting non-existent todo"""
        result = todo_manager.delete("nonexistent")
        assert result is False


class TestTodoManagerList:
    """Test listing todos"""

    def test_list_all(self, todo_manager):
        """Test listing all todos"""
        todo_manager.quick_add("Todo 1", priority="urgent")
        todo_manager.quick_add("Todo 2", priority="normal")
        todo_manager.quick_add("Todo 3", priority="low")

        todos = todo_manager.list()

        assert len(todos) == 3

    def test_list_by_status(self, todo_manager):
        """Test filtering by status"""
        id1 = todo_manager.quick_add("Todo 1")
        id2 = todo_manager.quick_add("Todo 2")
        todo_manager.complete(id1)

        pending = todo_manager.list(status="pending")
        completed = todo_manager.list(status="completed")

        assert len(pending) == 1
        assert len(completed) == 1
        assert pending[0].id == id2
        assert completed[0].id == id1

    def test_list_by_priority(self, todo_manager):
        """Test filtering by priority"""
        todo_manager.quick_add("Normal", priority="normal")
        todo_manager.quick_add("Urgent", priority="urgent")
        todo_manager.quick_add("Low", priority="low")

        urgent = todo_manager.list(priority="urgent")

        assert len(urgent) == 1
        assert urgent[0].description == "Urgent"

    def test_list_by_tags(self, todo_manager):
        """Test filtering by tags"""
        todo_manager.quick_add("Backend", tags=["backend", "api"])
        todo_manager.quick_add("Frontend", tags=["frontend", "ui"])
        todo_manager.quick_add("Fullstack", tags=["backend", "frontend"])

        backend = todo_manager.list(tags=["backend"])
        fullstack = todo_manager.list(tags=["backend", "frontend"])

        assert len(backend) == 2
        assert len(fullstack) == 1

    def test_list_with_limit(self, todo_manager):
        """Test limiting results"""
        for i in range(10):
            todo_manager.quick_add(f"Todo {i}")

        todos = todo_manager.list(limit=5)

        assert len(todos) == 5

    def test_list_sorting(self, todo_manager):
        """Test sorting by priority and date"""
        todo_manager.quick_add("Low 1", priority="low")
        todo_manager.quick_add("Urgent 1", priority="urgent")
        todo_manager.quick_add("Normal 1", priority="normal")
        todo_manager.quick_add("Urgent 2", priority="urgent")

        todos = todo_manager.list()

        # Urgent items should come first
        assert todos[0].priority == Priority.URGENT
        assert todos[1].priority == Priority.URGENT
        assert todos[2].priority == Priority.NORMAL
        assert todos[3].priority == Priority.LOW


class TestTodoManagerSearch:
    """Test searching todos"""

    def test_search_description(self, todo_manager):
        """Test searching by description"""
        todo_manager.quick_add("Fix authentication bug")
        todo_manager.quick_add("Update documentation")
        todo_manager.quick_add("Auth refactoring")

        results = todo_manager.search("auth")

        assert len(results) == 2

    def test_search_notes(self, todo_manager):
        """Test searching by notes"""
        id1 = todo_manager.quick_add("Todo 1")
        id2 = todo_manager.quick_add("Todo 2")

        todo_manager.add_note(id1, "Important: security fix")
        todo_manager.add_note(id2, "Minor cleanup")

        results = todo_manager.search("security")

        assert len(results) == 1
        assert results[0].id == id1

    def test_search_tags(self, todo_manager):
        """Test searching by tags"""
        todo_manager.quick_add("Backend", tags=["backend", "api"])
        todo_manager.quick_add("Frontend", tags=["frontend"])

        results = todo_manager.search("backend")

        assert len(results) == 1

    def test_search_case_insensitive(self, todo_manager):
        """Test case-insensitive search"""
        todo_manager.quick_add("Fix AUTH bug")

        results = todo_manager.search("auth")

        assert len(results) == 1

    def test_search_empty_results(self, todo_manager):
        """Test search with no results"""
        todo_manager.quick_add("Test todo")

        results = todo_manager.search("nonexistent")

        assert len(results) == 0


class TestTodoManagerNotes:
    """Test adding notes"""

    def test_add_note_to_new_todo(self, todo_manager):
        """Test adding note to todo without notes"""
        todo_id = todo_manager.quick_add("Test todo")

        result = todo_manager.add_note(todo_id, "First note")

        assert result is True
        todo = todo_manager.get(todo_id)
        assert todo.notes == "First note"

    def test_add_note_to_existing_notes(self, todo_manager):
        """Test appending note to existing notes"""
        todo_id = todo_manager.quick_add("Test todo")
        todo_manager.add_note(todo_id, "First note")

        result = todo_manager.add_note(todo_id, "Second note")

        assert result is True
        todo = todo_manager.get(todo_id)
        assert "First note" in todo.notes
        assert "Second note" in todo.notes

    def test_add_note_to_nonexistent(self, todo_manager):
        """Test adding note to non-existent todo"""
        result = todo_manager.add_note("nonexistent", "Note")
        assert result is False


class TestTodoManagerStatistics:
    """Test statistics"""

    def test_statistics_empty(self, todo_manager):
        """Test statistics with no todos"""
        stats = todo_manager.get_statistics()

        assert stats['total'] == 0
        assert stats['by_status'] == {}
        assert stats['by_priority'] == {}
        assert stats['completed_ratio'] == 0

    def test_statistics_by_status(self, todo_manager):
        """Test statistics by status"""
        id1 = todo_manager.quick_add("Todo 1")
        id2 = todo_manager.quick_add("Todo 2")
        id3 = todo_manager.quick_add("Todo 3")

        todo_manager.update(id2, status="in_progress")
        todo_manager.complete(id3)

        stats = todo_manager.get_statistics()

        assert stats['total'] == 3
        assert stats['by_status']['pending'] == 1
        assert stats['by_status']['in_progress'] == 1
        assert stats['by_status']['completed'] == 1

    def test_statistics_by_priority(self, todo_manager):
        """Test statistics by priority"""
        todo_manager.quick_add("Urgent", priority="urgent")
        todo_manager.quick_add("Normal 1", priority="normal")
        todo_manager.quick_add("Normal 2", priority="normal")
        todo_manager.quick_add("Low", priority="low")

        stats = todo_manager.get_statistics()

        assert stats['by_priority']['urgent'] == 1
        assert stats['by_priority']['normal'] == 2
        assert stats['by_priority']['low'] == 1

    def test_completed_ratio(self, todo_manager):
        """Test completed ratio calculation"""
        for i in range(10):
            todo_id = todo_manager.quick_add(f"Todo {i}")
            if i < 5:
                todo_manager.complete(todo_id)

        stats = todo_manager.get_statistics()

        assert stats['completed_ratio'] == 0.5


class TestTodoManagerPersistence:
    """Test persistence functionality"""

    def test_save_and_load(self, temp_storage):
        """Test saving and loading todos"""
        # Create first manager and add todos
        manager1 = TodoManager(storage_path=temp_storage)
        id1 = manager1.quick_add("Todo 1", priority="urgent", tags=["test"])
        id2 = manager1.quick_add("Todo 2", priority="normal")
        manager1.complete(id1)

        # Create new manager instance (should load from disk)
        manager2 = TodoManager(storage_path=temp_storage)

        assert len(manager2.todos) == 2

        todo1 = manager2.get(id1)
        assert todo1 is not None
        assert todo1.description == "Todo 1"
        assert todo1.priority == Priority.URGENT
        assert todo1.status == TodoStatus.COMPLETED
        assert todo1.tags == ["test"]

        todo2 = manager2.get(id2)
        assert todo2 is not None
        assert todo2.description == "Todo 2"
        assert todo2.status == TodoStatus.PENDING

    def test_atomic_write(self, temp_storage):
        """Test atomic write behavior"""
        manager = TodoManager(storage_path=temp_storage)

        # Add multiple todos
        for i in range(100):
            manager.quick_add(f"Todo {i}")

        # Verify file exists and is valid
        assert temp_storage.exists()

        # Create new manager to verify all data was saved
        manager2 = TodoManager(storage_path=temp_storage)
        assert len(manager2.todos) == 100

    def test_corrupted_data_handling(self, temp_storage):
        """Test handling of corrupted data"""
        # Write invalid JSON
        with open(temp_storage, 'w') as f:
            f.write("{invalid json")

        # Should not crash, just start with empty todos
        manager = TodoManager(storage_path=temp_storage)
        assert len(manager.todos) == 0


class TestTodoManagerIntegration:
    """Integration tests for common workflows"""

    def test_idea_inbox_workflow(self, todo_manager):
        """Test typical idea capture workflow"""
        # Quick capture ideas
        id1 = todo_manager.quick_add("Refactor auth module")
        id2 = todo_manager.quick_add("Add dark mode", tags=["ui", "feature"])
        id3 = todo_manager.quick_add("Fix login bug", priority="urgent")

        # Organize with notes
        todo_manager.add_note(id1, "Consider using JWT tokens")
        todo_manager.add_note(id2, "Check design system for color palette")

        # Review and prioritize
        urgent = todo_manager.list(priority="urgent")
        assert len(urgent) == 1

        # Mark completed
        todo_manager.complete(id3)

        # Check progress
        stats = todo_manager.get_statistics()
        assert stats['total'] == 3
        assert stats['by_status']['completed'] == 1

    def test_project_tracking_workflow(self, todo_manager):
        """Test tracking multiple project todos"""
        # Project A todos
        p1 = todo_manager.quick_add("Design API", tags=["project-a", "design"])
        p2 = todo_manager.quick_add("Implement API", tags=["project-a", "backend"])
        p3 = todo_manager.quick_add("Test API", tags=["project-a", "testing"])

        # Project B todos
        p4 = todo_manager.quick_add("Design UI", tags=["project-b", "design"])
        p5 = todo_manager.quick_add("Implement UI", tags=["project-b", "frontend"])

        # Work on Project A
        todo_manager.update(p1, status="in_progress")
        todo_manager.complete(p1)
        todo_manager.update(p2, status="in_progress")

        # Check Project A status
        project_a = todo_manager.list(tags=["project-a"])
        assert len(project_a) == 3
        assert sum(1 for t in project_a if t.status == TodoStatus.COMPLETED) == 1
        assert sum(1 for t in project_a if t.status == TodoStatus.IN_PROGRESS) == 1

    def test_search_and_refine_workflow(self, todo_manager):
        """Test search-based workflow"""
        # Add various todos
        todo_manager.quick_add("Fix auth bug")
        todo_manager.quick_add("Update auth docs")
        todo_manager.quick_add("Refactor auth module")
        todo_manager.quick_add("Fix UI bug")
        todo_manager.quick_add("Update UI docs")

        # Find all auth-related
        auth_results = todo_manager.search("auth")
        assert len(auth_results) == 3

        # Add context note
        for todo in auth_results:
            todo_manager.add_note(todo.id, "Part of auth improvement sprint")

        # Find all bug fixes
        bug_results = todo_manager.search("bug")
        assert len(bug_results) == 2
