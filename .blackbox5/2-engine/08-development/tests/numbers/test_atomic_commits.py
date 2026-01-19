"""
Tests for Atomic Commit Manager
"""

import json
import tempfile
import sys
from pathlib import Path
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock

import pytest

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from engine.core.atomic_commit_manager import (
    AtomicCommitManager,
    TaskCommitInfo,
    create_atomic_commit_manager
)
from engine.operations.tools.git_ops import GitOps, CommitInfo


@pytest.fixture
def temp_history_path():
    """Create a temporary path for commit history."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        path = Path(f.name)
    yield path
    # Cleanup
    if path.exists():
        path.unlink()


@pytest.fixture
def mock_git_ops():
    """Create a mock GitOps instance."""
    mock = Mock(spec=GitOps)
    mock.get_modified_files.return_value = []
    mock.commit_task.return_value = "abc123"
    mock.create_rollback_commit.return_value = "def456"
    mock.get_commit_info.return_value = CommitInfo(
        hash="abc123",
        short_hash="abc123",
        author="Test Author",
        date=datetime.now(),
        message="test: test commit",
        files_changed=["test.py"],
        full_hash="abc123full"
    )
    return mock


@pytest.fixture
def atomic_commit_manager(temp_history_path, mock_git_ops):
    """Create an AtomicCommitManager with mocks."""
    manager = AtomicCommitManager(
        git_ops=mock_git_ops,
        history_path=temp_history_path
    )
    return manager


class TestTaskCommitInfo:
    """Test TaskCommitInfo dataclass."""

    def test_to_dict(self):
        """Test serialization to dict."""
        info = TaskCommitInfo(
            task_id="task_1",
            commit_hash="abc123",
            commit_type="feat",
            scope="auth",
            description="Add login feature",
            files=["auth.py"],
            timestamp=datetime.now()
        )

        data = info.to_dict()

        assert data["task_id"] == "task_1"
        assert data["commit_hash"] == "abc123"
        assert data["commit_type"] == "feat"
        assert data["scope"] == "auth"
        assert isinstance(data["timestamp"], str)

    def test_from_dict(self):
        """Test deserialization from dict."""
        data = {
            "task_id": "task_1",
            "commit_hash": "abc123",
            "commit_type": "feat",
            "scope": "auth",
            "description": "Add login feature",
            "files": ["auth.py"],
            "timestamp": "2025-01-19T10:00:00",
            "wave_id": 1,
            "rollback_commit": "def456"
        }

        info = TaskCommitInfo.from_dict(data)

        assert info.task_id == "task_1"
        assert info.commit_hash == "abc123"
        assert info.commit_type == "feat"
        assert info.wave_id == 1
        assert info.rollback_commit == "def456"


class TestAtomicCommitManager:
    """Test AtomicCommitManager class."""

    def test_initialization(self, temp_history_path, mock_git_ops):
        """Test manager initialization."""
        manager = AtomicCommitManager(
            git_ops=mock_git_ops,
            history_path=temp_history_path
        )

        assert manager.git_ops == mock_git_ops
        assert manager.history_path == temp_history_path
        assert manager.commit_history == []
        assert temp_history_path.parent.exists()

    def test_create_snapshot(self, atomic_commit_manager, mock_git_ops):
        """Test creating git state snapshot."""
        mock_git_ops.get_modified_files.return_value = [
            "file1.py",
            "file2.py"
        ]

        snapshot = atomic_commit_manager.create_snapshot()

        assert snapshot == ["file1.py", "file2.py"]
        mock_git_ops.get_modified_files.assert_called_once()

    def test_detect_task_changes(self, atomic_commit_manager, mock_git_ops):
        """Test detecting changed files after task."""
        # Before snapshot
        before_snapshot = ["old_file.py"]

        # After task - new files
        mock_git_ops.get_modified_files.return_value = [
            "old_file.py",
            "new_file.py",
            "modified_file.py"
        ]

        changes = atomic_commit_manager.detect_task_changes(
            task_id="task_1",
            before_snapshot=before_snapshot
        )

        # Should detect new files
        assert "new_file.py" in changes
        assert "modified_file.py" in changes

    def test_commit_task_result(self, atomic_commit_manager, mock_git_ops):
        """Test creating atomic commit for task."""
        mock_git_ops.commit_task.return_value = "abc123"

        commit_info = atomic_commit_manager.commit_task_result(
            task_id="task_1",
            task_type="feat",
            scope="auth",
            description="Add login feature",
            files=["auth.py", "login.py"],
            body="Task ID: task_1",
            wave_id=1
        )

        assert commit_info is not None
        assert commit_info.task_id == "task_1"
        assert commit_info.commit_hash == "abc123"
        assert commit_info.commit_type == "feat"
        assert commit_info.scope == "auth"
        assert commit_info.wave_id == 1

        # Verify git_ops was called correctly
        mock_git_ops.commit_task.assert_called_once()
        call_args = mock_git_ops.commit_task.call_args
        assert call_args[1]["task_type"] == "feat"
        assert call_args[1]["scope"] == "auth"
        assert "auth.py" in call_args[1]["files"]

        # Verify history was saved
        assert len(atomic_commit_manager.commit_history) == 1

    def test_commit_task_result_no_files(self, atomic_commit_manager):
        """Test commit with no files returns None."""
        commit_info = atomic_commit_manager.commit_task_result(
            task_id="task_1",
            task_type="feat",
            scope="auth",
            description="No files",
            files=[]
        )

        assert commit_info is None
        assert len(atomic_commit_manager.commit_history) == 0

    def test_commit_task_result_invalid_type(self, atomic_commit_manager):
        """Test commit with invalid type raises ValueError."""
        with pytest.raises(ValueError, match="Invalid type"):
            atomic_commit_manager.commit_task_result(
                task_id="task_1",
                task_type="invalid",
                scope="auth",
                description="Test",
                files=["test.py"]
            )

    def test_rollback_task(self, atomic_commit_manager, mock_git_ops):
        """Test rolling back a task commit."""
        # First create a commit
        atomic_commit_manager.commit_task_result(
            task_id="task_1",
            task_type="feat",
            scope="auth",
            description="Add login",
            files=["auth.py"]
        )

        # Rollback
        rollback_hash = atomic_commit_manager.rollback_task("task_1")

        assert rollback_hash == "def456"
        mock_git_ops.create_rollback_commit.assert_called_once_with("abc123")

        # Verify rollback was recorded
        commit_info = atomic_commit_manager.get_task_commit("task_1")
        assert commit_info.rollback_commit == "def456"

    def test_rollback_task_not_found(self, atomic_commit_manager):
        """Test rollback of non-existent task raises ValueError."""
        with pytest.raises(ValueError, match="No commit found"):
            atomic_commit_manager.rollback_task("nonexistent_task")

    def test_get_commit_history(self, atomic_commit_manager):
        """Test retrieving commit history."""
        # Create multiple commits
        atomic_commit_manager.commit_task_result(
            task_id="task_1",
            task_type="feat",
            scope="auth",
            description="Feature 1",
            files=["auth.py"]
        )
        atomic_commit_manager.commit_task_result(
            task_id="task_2",
            task_type="fix",
            scope="auth",
            description="Fix 1",
            files=["auth.py"]
        )
        atomic_commit_manager.commit_task_result(
            task_id="task_3",
            task_type="test",
            scope="auth",
            description="Test 1",
            files=["test_auth.py"],
            wave_id=2
        )

        # Get all history
        all_history = atomic_commit_manager.get_commit_history()
        assert len(all_history) == 3

        # Filter by task_id
        task_history = atomic_commit_manager.get_commit_history(task_id="task_1")
        assert len(task_history) == 1
        assert task_history[0].task_id == "task_1"

        # Filter by wave_id
        wave_history = atomic_commit_manager.get_commit_history(wave_id=2)
        assert len(wave_history) == 1
        assert wave_history[0].task_id == "task_3"

        # Test limit
        limited = atomic_commit_manager.get_commit_history(limit=2)
        assert len(limited) == 2

    def test_get_task_commit(self, atomic_commit_manager):
        """Test getting specific task commit."""
        atomic_commit_manager.commit_task_result(
            task_id="task_1",
            task_type="feat",
            scope="auth",
            description="Feature",
            files=["auth.py"]
        )

        commit_info = atomic_commit_manager.get_task_commit("task_1")

        assert commit_info is not None
        assert commit_info.task_id == "task_1"

        # Test non-existent task
        none_info = atomic_commit_manager.get_task_commit("nonexistent")
        assert none_info is None

    def test_infer_commit_type(self, atomic_commit_manager):
        """Test inferring commit type from description."""
        test_cases = [
            ("test authentication", "", "test"),
            ("fix login bug", "", "fix"),
            ("refactor auth module", "", "refactor"),
            ("optimize database queries", "", "perf"),
            ("update README", "", "docs"),
            ("add new feature", "", "feat"),
            ("code style fixes", "", "style"),
            ("routine maintenance", "", "chore"),
            ("feature work", "test", "test"),  # Category overrides description
        ]

        for desc, category, expected in test_cases:
            result = atomic_commit_manager.infer_commit_type(desc, category)
            assert result == expected, f"Failed for: {desc}, {category}"

    def test_get_statistics(self, atomic_commit_manager):
        """Test getting commit statistics."""
        # Create some commits
        atomic_commit_manager.commit_task_result(
            task_id="task_1",
            task_type="feat",
            scope="auth",
            description="Feature 1",
            files=["auth.py"]
        )
        atomic_commit_manager.commit_task_result(
            task_id="task_2",
            task_type="feat",
            scope="auth",
            description="Feature 2",
            files=["login.py"]
        )
        atomic_commit_manager.commit_task_result(
            task_id="task_3",
            task_type="fix",
            scope="auth",
            description="Fix",
            files=["auth.py"]
        )

        stats = atomic_commit_manager.get_statistics()

        assert stats["total_commits"] == 3
        assert stats["by_type"]["feat"] == 2
        assert stats["by_type"]["fix"] == 1
        assert stats["by_scope"]["auth"] == 3
        assert stats["with_rollback"] == 0
        assert stats["latest_commit"] is not None

    def test_clear_history(self, atomic_commit_manager):
        """Test clearing commit history."""
        # Create commits
        for i in range(3):
            atomic_commit_manager.commit_task_result(
                task_id=f"task_{i}",
                task_type="feat",
                scope="test",
                description=f"Test {i}",
                files=[f"test{i}.py"]
            )

        assert len(atomic_commit_manager.commit_history) == 3

        # Clear all
        count = atomic_commit_manager.clear_history()
        assert count == 3
        assert len(atomic_commit_manager.commit_history) == 0

    def test_clear_history_old_only(self, atomic_commit_manager):
        """Test clearing only old commits."""
        # Create recent and old commits
        old_commit = TaskCommitInfo(
            task_id="old_task",
            commit_hash="old123",
            commit_type="feat",
            scope="test",
            description="Old",
            files=["old.py"],
            timestamp=datetime.now() - timedelta(days=10)
        )

        recent_commit = TaskCommitInfo(
            task_id="recent_task",
            commit_hash="new123",
            commit_type="feat",
            scope="test",
            description="Recent",
            files=["new.py"],
            timestamp=datetime.now()
        )

        atomic_commit_manager.commit_history = [old_commit, recent_commit]

        # Clear commits older than 5 days
        count = atomic_commit_manager.clear_history(older_than_days=5)

        assert count == 1
        assert len(atomic_commit_manager.commit_history) == 1
        assert atomic_commit_manager.commit_history[0].task_id == "recent_task"

    def test_history_persistence(self, temp_history_path, mock_git_ops):
        """Test that history is persisted and loaded."""
        # Create manager and add commit
        manager1 = AtomicCommitManager(
            git_ops=mock_git_ops,
            history_path=temp_history_path
        )

        manager1.commit_task_result(
            task_id="task_1",
            task_type="feat",
            scope="auth",
            description="Feature",
            files=["auth.py"]
        )

        # Create new manager instance - should load history
        manager2 = AtomicCommitManager(
            git_ops=mock_git_ops,
            history_path=temp_history_path
        )

        assert len(manager2.commit_history) == 1
        assert manager2.commit_history[0].task_id == "task_1"


class TestCreateAtomicCommitManager:
    """Test factory function."""

    def test_factory_creates_manager(self):
        """Test that factory creates AtomicCommitManager."""
        manager = create_atomic_commit_manager()

        assert isinstance(manager, AtomicCommitManager)
        assert manager.git_ops is not None
        assert manager.history_path is not None


@pytest.mark.integration
class TestGitOpsIntegration:
    """Integration tests with real GitOps (requires git repo)."""

    def test_git_ops_get_modified_files(self):
        """Test GitOps.get_modified_files() works."""
        git_ops = GitOps()
        files = git_ops.get_modified_files()

        assert isinstance(files, list)

    def test_git_ops_get_current_head(self):
        """Test GitOps.get_current_head() works."""
        git_ops = GitOps()
        head = git_ops.get_current_head()

        assert isinstance(head, str)
        assert len(head) >= 7  # Short hash length (varies by git version)

    def test_git_ops_get_commit_history(self):
        """Test GitOps.get_commit_history() works."""
        git_ops = GitOps()
        history = git_ops.get_commit_history(count=5)

        assert isinstance(history, list)
        assert len(history) <= 5
        if history:
            assert isinstance(history[0], CommitInfo)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
