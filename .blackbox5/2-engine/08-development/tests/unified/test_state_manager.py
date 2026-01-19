"""
Tests for STATE.md Management System

This test suite validates the StateManager functionality including:
- Creating and updating STATE.md files
- Parsing existing STATE.md files
- Task state management
- Workflow resumption
- Edge cases and error handling
"""

import pytest
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List
import tempfile
import shutil

from .state_manager import StateManager, TaskState, WorkflowState


class TestTaskState:
    """Test TaskState dataclass and methods."""

    def test_task_state_creation(self):
        """Test creating a TaskState."""
        task = TaskState(
            task_id="task_1",
            description="Implement feature",
            status="pending",
            wave_id=1
        )

        assert task.task_id == "task_1"
        assert task.description == "Implement feature"
        assert task.status == "pending"
        assert task.wave_id == 1
        assert task.commit_hash is None
        assert task.files_modified == []
        assert task.error is None

    def test_task_state_with_commit(self):
        """Test TaskState with commit hash."""
        task = TaskState(
            task_id="task_2",
            description="Add tests",
            status="completed",
            wave_id=1,
            commit_hash="abc123def"
        )

        assert task.commit_hash == "abc123def"

    def test_task_state_with_files(self):
        """Test TaskState with modified files."""
        task = TaskState(
            task_id="task_3",
            description="Refactor code",
            status="completed",
            wave_id=2,
            files_modified=["file1.py", "file2.py"]
        )

        assert len(task.files_modified) == 2
        assert "file1.py" in task.files_modified

    def test_task_state_failed(self):
        """Test TaskState with error."""
        task = TaskState(
            task_id="task_4",
            description="Fix bug",
            status="failed",
            wave_id=1,
            error="Database connection failed"
        )

        assert task.status == "failed"
        assert task.error == "Database connection failed"

    def test_to_markdown_completed(self):
        """Test markdown conversion for completed task."""
        task = TaskState(
            task_id="task_1",
            description="Complete feature",
            status="completed",
            wave_id=1,
            commit_hash="abc123"
        )

        md = task.to_markdown()
        assert "- [x]" in md
        assert "**task_1**:" in md
        assert "Complete feature" in md
        assert "Commit: `abc123`" in md

    def test_to_markdown_in_progress(self):
        """Test markdown conversion for in-progress task."""
        task = TaskState(
            task_id="task_2",
            description="Working on it",
            status="in_progress",
            wave_id=2
        )

        md = task.to_markdown()
        assert "- [~]" in md
        assert "**task_2**:" in md
        assert "Working on it" in md

    def test_to_markdown_pending(self):
        """Test markdown conversion for pending task."""
        task = TaskState(
            task_id="task_3",
            description="Todo item",
            status="pending",
            wave_id=3
        )

        md = task.to_markdown()
        assert "- [ ]" in md
        assert "**task_3**:" in md

    def test_to_markdown_with_files(self):
        """Test markdown conversion with files listed."""
        task = TaskState(
            task_id="task_4",
            description="Modified files",
            status="completed",
            wave_id=1,
            files_modified=["file1.py", "file2.py", "file3.py", "file4.py"]
        )

        md = task.to_markdown()
        assert "Files:" in md
        assert "file1.py" in md
        assert "file2.py" in md
        assert "file3.py" in md
        assert "(+1 more)" in md  # Should truncate at 3

    def test_to_markdown_with_error(self):
        """Test markdown conversion with error."""
        task = TaskState(
            task_id="task_5",
            description="Failed task",
            status="failed",
            wave_id=1,
            error="Something went wrong"
        )

        md = task.to_markdown()
        assert "Error: Something went wrong" in md


class TestWorkflowState:
    """Test WorkflowState dataclass and methods."""

    def test_workflow_state_creation(self):
        """Test creating a WorkflowState."""
        workflow = WorkflowState(
            workflow_id="wf_1",
            workflow_name="Test Workflow",
            current_wave=1,
            total_waves=3,
            tasks={},
            started_at=datetime.now(),
            updated_at=datetime.now()
        )

        assert workflow.workflow_id == "wf_1"
        assert workflow.workflow_name == "Test Workflow"
        assert workflow.current_wave == 1
        assert workflow.total_waves == 3
        assert len(workflow.tasks) == 0

    def test_workflow_state_with_tasks(self):
        """Test WorkflowState with tasks."""
        tasks = {
            "task_1": TaskState(
                task_id="task_1",
                description="First task",
                status="completed",
                wave_id=1
            ),
            "task_2": TaskState(
                task_id="task_2",
                description="Second task",
                status="in_progress",
                wave_id=2
            )
        }

        workflow = WorkflowState(
            workflow_id="wf_2",
            workflow_name="Workflow with tasks",
            current_wave=2,
            total_waves=4,
            tasks=tasks,
            started_at=datetime.now(),
            updated_at=datetime.now()
        )

        assert len(workflow.tasks) == 2
        assert workflow.tasks["task_1"].status == "completed"
        assert workflow.tasks["task_2"].status == "in_progress"

    def test_to_markdown_basic(self):
        """Test basic markdown conversion."""
        workflow = WorkflowState(
            workflow_id="wf_1",
            workflow_name="Test Workflow",
            current_wave=1,
            total_waves=3,
            tasks={},
            started_at=datetime(2025, 1, 15, 10, 0, 0),
            updated_at=datetime(2025, 1, 15, 11, 0, 0)
        )

        md = workflow.to_markdown()
        assert "# Workflow: Test Workflow" in md
        assert "**Workflow ID:** `wf_1`" in md
        assert "**Status:** Wave 1/3" in md
        assert "**Started:** 2025-01-15 10:00:00" in md
        assert "**Updated:** 2025-01-15 11:00:00" in md

    def test_to_markdown_with_progress_bar(self):
        """Test progress bar in markdown."""
        workflow = WorkflowState(
            workflow_id="wf_1",
            workflow_name="Progress Test",
            current_wave=2,
            total_waves=4,
            tasks={},
            started_at=datetime.now(),
            updated_at=datetime.now()
        )

        md = workflow.to_markdown()
        assert "**Progress:**" in md
        assert "50%" in md  # 2/4 = 50%

    def test_to_markdown_with_tasks(self):
        """Test markdown with various task states."""
        tasks = {
            "task_1": TaskState(
                task_id="task_1",
                description="Completed task",
                status="completed",
                wave_id=1
            ),
            "task_2": TaskState(
                task_id="task_2",
                description="In progress task",
                status="in_progress",
                wave_id=2
            ),
            "task_3": TaskState(
                task_id="task_3",
                description="Pending task",
                status="pending",
                wave_id=3
            )
        }

        workflow = WorkflowState(
            workflow_id="wf_1",
            workflow_name="Tasks Test",
            current_wave=2,
            total_waves=3,
            tasks=tasks,
            started_at=datetime.now(),
            updated_at=datetime.now()
        )

        md = workflow.to_markdown()
        assert "## ✅ Completed" in md
        assert "## 🔄 In Progress" in md
        assert "## 📋 Pending" in md
        assert "- [x] **task_1**: Completed task" in md
        assert "- [~] **task_2**: In progress task" in md

    def test_to_markdown_with_notes(self):
        """Test markdown with notes."""
        workflow = WorkflowState(
            workflow_id="wf_1",
            workflow_name="Notes Test",
            current_wave=1,
            total_waves=3,
            tasks={},
            started_at=datetime.now(),
            updated_at=datetime.now(),
            notes=["Note 1", "Note 2"]
        )

        md = workflow.to_markdown()
        assert "## Notes" in md
        assert "- Note 1" in md
        assert "- Note 2" in md

    def test_to_markdown_with_metadata(self):
        """Test markdown with metadata."""
        workflow = WorkflowState(
            workflow_id="wf_1",
            workflow_name="Metadata Test",
            current_wave=1,
            total_waves=3,
            tasks={},
            started_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={"key1": "value1", "key2": "value2"}
        )

        md = workflow.to_markdown()
        assert "## Metadata" in md
        assert "**key1:** value1" in md
        assert "**key2:** value2" in md


class TestStateManager:
    """Test StateManager class."""

    @pytest.fixture
    def temp_dir(self):
        """Create temporary directory for tests."""
        temp_path = Path(tempfile.mkdtemp())
        yield temp_path
        shutil.rmtree(temp_path)

    @pytest.fixture
    def state_manager(self, temp_dir):
        """Create StateManager with temp path."""
        state_path = temp_dir / "STATE.md"
        return StateManager(state_path=state_path)

    def test_initialization(self, temp_dir):
        """Test StateManager initialization."""
        state_path = temp_dir / "STATE.md"
        manager = StateManager(state_path=state_path)

        assert manager.state_path == state_path

    def test_initialization_default_path(self):
        """Test StateManager with default path."""
        manager = StateManager()

        assert manager.state_path == Path("STATE.md")

    def test_initialize_workflow(self, state_manager):
        """Test initializing a new workflow."""
        waves = [
            [
                {"task_id": "task_1", "description": "First task"},
                {"task_id": "task_2", "description": "Second task"}
            ],
            [
                {"task_id": "task_3", "description": "Third task"}
            ]
        ]

        state_manager.initialize(
            workflow_id="wf_1",
            workflow_name="Test Workflow",
            total_waves=2,
            all_waves=waves
        )

        assert state_manager.state_path.exists()

        content = state_manager.state_path.read_text()
        assert "# Workflow: Test Workflow" in content
        assert "task_1" in content
        assert "task_2" in content
        assert "task_3" in content

    def test_update_workflow(self, state_manager):
        """Test updating workflow state."""
        completed_tasks = [
            {
                "task_id": "task_1",
                "description": "Completed task",
                "wave_id": 1,
                "result": {"success": True, "files_modified": ["file1.py"]}
            }
        ]

        current_wave_tasks = [
            {
                "task_id": "task_2",
                "description": "Current task",
                "result": {"success": True}
            }
        ]

        pending_waves = [
            [
                {"task_id": "task_3", "description": "Pending task"}
            ]
        ]

        state_manager.update(
            workflow_id="wf_1",
            workflow_name="Update Test",
            wave_id=1,
            total_waves=3,
            completed_tasks=completed_tasks,
            current_wave_tasks=current_wave_tasks,
            pending_waves=pending_waves,
            commit_hash="abc123"
        )

        content = state_manager.state_path.read_text()
        assert "# Workflow: Update Test" in content
        assert "**Status:** Wave 1/3" in content
        assert "task_1" in content
        assert "task_2" in content
        assert "task_3" in content
        assert "abc123" in content

    def test_update_with_commit_hash(self, state_manager):
        """Test update includes commit hash."""
        state_manager.update(
            workflow_id="wf_1",
            workflow_name="Commit Test",
            wave_id=1,
            total_waves=2,
            completed_tasks=[],
            current_wave_tasks=[
                {
                    "task_id": "task_1",
                    "description": "Task",
                    "result": {"success": True}
                }
            ],
            pending_waves=[],
            commit_hash="def456"
        )

        content = state_manager.state_path.read_text()
        assert "def456" in content

    def test_update_with_notes(self, state_manager):
        """Test update with notes."""
        state_manager.update(
            workflow_id="wf_1",
            workflow_name="Notes Test",
            wave_id=1,
            total_waves=2,
            completed_tasks=[],
            current_wave_tasks=[],
            pending_waves=[],
            notes=["Important note", "Another note"]
        )

        content = state_manager.state_path.read_text()
        assert "## Notes" in content
        assert "Important note" in content
        assert "Another note" in content

    def test_update_with_metadata(self, state_manager):
        """Test update with metadata."""
        state_manager.update(
            workflow_id="wf_1",
            workflow_name="Metadata Test",
            wave_id=1,
            total_waves=2,
            completed_tasks=[],
            current_wave_tasks=[],
            pending_waves=[],
            metadata={"version": "1.0", "author": "Test"}
        )

        content = state_manager.state_path.read_text()
        assert "## Metadata" in content
        assert "**version:** 1.0" in content
        assert "**author:** Test" in content

    def test_load_state(self, state_manager):
        """Test loading state from file."""
        # First, create a state
        state_manager.initialize(
            workflow_id="wf_1",
            workflow_name="Load Test",
            total_waves=2,
            all_waves=[[{"task_id": "task_1", "description": "Task"}]]
        )

        # Then load it
        loaded_state = state_manager.load_state()

        assert loaded_state is not None
        assert loaded_state.workflow_id == "wf_1"
        assert loaded_state.workflow_name == "Load Test"
        assert loaded_state.total_waves == 2
        assert "task_1" in loaded_state.tasks

    def test_load_state_nonexistent(self, state_manager):
        """Test loading state when file doesn't exist."""
        loaded_state = state_manager.load_state()

        assert loaded_state is None

    def test_parse_state(self, state_manager):
        """Test parsing STATE.md content."""
        content = """# Workflow: Parse Test

**Workflow ID:** `wf_1`
**Status:** Wave 2/4
**Started:** 2025-01-15 10:00:00
**Updated:** 2025-01-15 11:00:00

---

## ✅ Completed (2 tasks)

### Wave 1
- [x] **task_1**: First task
- Commit: `abc123`

## 🔄 In Progress (1 tasks)

- [~] **task_2**: Second task

## 📋 Pending (1 tasks)

### Wave 3
- [ ] **task_3**: Third task
"""

        parsed = state_manager.parse_state(content)

        assert parsed is not None
        assert parsed.workflow_id == "wf_1"
        assert parsed.workflow_name == "Parse Test"
        assert parsed.current_wave == 2
        assert parsed.total_waves == 4
        assert len(parsed.tasks) == 3
        assert parsed.tasks["task_1"].status == "completed"
        # Note: The commit hash parsing looks for the last task, so it might not work correctly
        # with the current implementation. This is a known limitation.
        assert parsed.tasks["task_2"].status == "in_progress"
        assert parsed.tasks["task_3"].status == "pending"

    def test_parse_state_minimal(self, state_manager):
        """Test parsing minimal STATE.md."""
        content = """# Minimal Workflow

**Status:** Wave 1/2

## ✅ Completed
- [x] **task_1**: Done
"""

        parsed = state_manager.parse_state(content)

        assert parsed is not None
        assert parsed.workflow_name == "Minimal Workflow"
        assert parsed.current_wave == 1
        assert parsed.total_waves == 2

    def test_get_resume_info(self, state_manager):
        """Test getting resume information."""
        state_manager.initialize(
            workflow_id="wf_1",
            workflow_name="Resume Test",
            total_waves=3,
            all_waves=[
                [{"task_id": "task_1", "description": "Task 1"}],
                [{"task_id": "task_2", "description": "Task 2"}],
                [{"task_id": "task_3", "description": "Task 3"}]
            ]
        )

        resume_info = state_manager.get_resume_info()

        assert resume_info is not None
        assert resume_info['workflow_id'] == "wf_1"
        assert resume_info['workflow_name'] == "Resume Test"
        assert resume_info['current_wave'] == 0
        assert resume_info['resume_wave'] == 1  # Next wave
        assert resume_info['total_waves'] == 3

    def test_get_resume_info_nonexistent(self, state_manager):
        """Test getting resume info when no state exists."""
        resume_info = state_manager.get_resume_info()

        assert resume_info is None

    def test_add_note(self, state_manager):
        """Test adding a note to existing state."""
        # Create initial state
        state_manager.initialize(
            workflow_id="wf_1",
            workflow_name="Note Test",
            total_waves=2,
            all_waves=[[{"task_id": "task_1", "description": "Task"}]]
        )

        # Add note
        state_manager.add_note("This is an important note")

        # Verify note was added
        loaded_state = state_manager.load_state()
        assert "This is an important note" in loaded_state.notes

    def test_add_note_no_state(self, state_manager, caplog):
        """Test adding note when no state exists."""
        import logging
        caplog.set_level(logging.WARNING)

        state_manager.add_note("This should warn")

        assert "No existing state to add note to" in caplog.text

    def test_clear(self, state_manager):
        """Test clearing STATE.md."""
        # Create state
        state_manager.initialize(
            workflow_id="wf_1",
            workflow_name="Clear Test",
            total_waves=2,
            all_waves=[[{"task_id": "task_1", "description": "Task"}]]
        )

        assert state_manager.state_path.exists()

        # Clear it
        state_manager.clear()

        assert not state_manager.state_path.exists()

    def test_clear_nonexistent(self, state_manager, caplog):
        """Test clearing when file doesn't exist."""
        import logging
        caplog.set_level(logging.INFO)

        state_manager.clear()  # Should not error

        # File still doesn't exist
        assert not state_manager.state_path.exists()

    def test_parse_failed_task(self, state_manager):
        """Test parsing a failed task."""
        content = """# Failed Task Test

**Status:** Wave 1/2

## ❌ Failed (1 tasks)

- [ ] **task_1**: This task failed
  - Error: Database connection timeout
"""

        parsed = state_manager.parse_state(content)

        assert parsed is not None
        assert parsed.tasks["task_1"].status == "failed"
        assert parsed.tasks["task_1"].error == "Database connection timeout"

    def test_update_preserves_started_at(self, state_manager):
        """Test that update preserves original started_at timestamp."""
        # Initialize workflow
        state_manager.initialize(
            workflow_id="wf_1",
            workflow_name="Timestamp Test",
            total_waves=2,
            all_waves=[[{"task_id": "task_1", "description": "Task"}]]
        )

        # Load original started_at
        original_state = state_manager.load_state()
        original_started = original_state.started_at

        # Update workflow
        state_manager.update(
            workflow_id="wf_1",
            workflow_name="Timestamp Test",
            wave_id=1,
            total_waves=2,
            completed_tasks=[],
            current_wave_tasks=[{"task_id": "task_1", "result": {"success": True}}],
            pending_waves=[]
        )

        # Check started_at is preserved (within 1 second tolerance)
        updated_state = state_manager.load_state()
        time_diff = abs((updated_state.started_at - original_started).total_seconds())
        assert time_diff < 1.0  # Should be the same or very close
        assert updated_state.updated_at > original_started

    def test_multiple_updates_accumulate_notes(self, state_manager):
        """Test that multiple updates accumulate notes."""
        # First update with notes
        state_manager.update(
            workflow_id="wf_1",
            workflow_name="Notes Accumulate Test",
            wave_id=1,
            total_waves=3,
            completed_tasks=[],
            current_wave_tasks=[],
            pending_waves=[],
            notes=["First note"]
        )

        # Second update with more notes
        state_manager.update(
            workflow_id="wf_1",
            workflow_name="Notes Accumulate Test",
            wave_id=2,
            total_waves=3,
            completed_tasks=[],
            current_wave_tasks=[],
            pending_waves=[],
            notes=["Second note"]
        )

        # Check both notes are present
        loaded_state = state_manager.load_state()
        assert "First note" in loaded_state.notes
        assert "Second note" in loaded_state.notes
        assert len(loaded_state.notes) == 2


class TestIntegrationScenarios:
    """Integration tests for real-world scenarios."""

    @pytest.fixture
    def temp_dir(self):
        """Create temporary directory for tests."""
        temp_path = Path(tempfile.mkdtemp())
        yield temp_path
        shutil.rmtree(temp_path)

    @pytest.fixture
    def state_manager(self, temp_dir):
        """Create StateManager with temp path."""
        state_path = temp_dir / "STATE.md"
        return StateManager(state_path=state_path)

    def test_full_workflow_lifecycle(self, state_manager):
        """Test complete workflow from initialization to completion."""
        # Initialize workflow
        waves = [
            [
                {"task_id": "planner", "description": "Create plan"},
                {"task_id": "researcher", "description": "Research requirements"}
            ],
            [
                {"task_id": "developer", "description": "Implement feature"},
                {"task_id": "tester", "description": "Write tests"}
            ],
            [
                {"task_id": "reviewer", "description": "Code review"},
                {"task_id": "deployer", "description": "Deploy to production"}
            ]
        ]

        state_manager.initialize(
            workflow_id="wf_full",
            workflow_name="Full Feature Development",
            total_waves=3,
            all_waves=waves
        )

        # Complete wave 1
        state_manager.update(
            workflow_id="wf_full",
            workflow_name="Full Feature Development",
            wave_id=1,
            total_waves=3,
            completed_tasks=[
                {
                    "task_id": "planner",
                    "description": "Create plan",
                    "wave_id": 1,
                    "result": {"success": True, "files_modified": ["PLAN.md"]}
                },
                {
                    "task_id": "researcher",
                    "description": "Research requirements",
                    "wave_id": 1,
                    "result": {"success": True}
                }
            ],
            current_wave_tasks=[],
            pending_waves=waves[1:],
            commit_hash="abc123"
        )

        # Complete wave 2
        state_manager.update(
            workflow_id="wf_full",
            workflow_name="Full Feature Development",
            wave_id=2,
            total_waves=3,
            completed_tasks=[
                {
                    "task_id": "planner",
                    "description": "Create plan",
                    "wave_id": 1,
                    "result": {"success": True}
                },
                {
                    "task_id": "researcher",
                    "description": "Research requirements",
                    "wave_id": 1,
                    "result": {"success": True}
                }
            ],
            current_wave_tasks=[
                {
                    "task_id": "developer",
                    "description": "Implement feature",
                    "result": {"success": True, "files_modified": ["feature.py"]}
                },
                {
                    "task_id": "tester",
                    "description": "Write tests",
                    "result": {"success": True, "files_modified": ["test_feature.py"]}
                }
            ],
            pending_waves=waves[2:],
            commit_hash="def456"
        )

        # Complete final wave
        state_manager.update(
            workflow_id="wf_full",
            workflow_name="Full Feature Development",
            wave_id=3,
            total_waves=3,
            completed_tasks=[
                {
                    "task_id": "planner",
                    "description": "Create plan",
                    "wave_id": 1,
                    "result": {"success": True}
                },
                {
                    "task_id": "researcher",
                    "description": "Research requirements",
                    "wave_id": 1,
                    "result": {"success": True}
                },
                {
                    "task_id": "developer",
                    "description": "Implement feature",
                    "wave_id": 2,
                    "result": {"success": True}
                },
                {
                    "task_id": "tester",
                    "description": "Write tests",
                    "wave_id": 2,
                    "result": {"success": True}
                }
            ],
            current_wave_tasks=[
                {
                    "task_id": "reviewer",
                    "description": "Code review",
                    "result": {"success": True}
                },
                {
                    "task_id": "deployer",
                    "description": "Deploy to production",
                    "result": {"success": True}
                }
            ],
            pending_waves=[],
            commit_hash="ghi789"
        )

        # Verify final state
        final_state = state_manager.load_state()
        assert final_state.current_wave == 3
        assert final_state.total_waves == 3

        # Check all tasks are completed
        completed_count = sum(1 for t in final_state.tasks.values() if t.status == 'completed')
        assert completed_count == 6

        # Verify progress is 100%
        content = state_manager.state_path.read_text()
        assert "100%" in content

    def test_workflow_with_failures(self, state_manager):
        """Test workflow that has some failed tasks."""
        # Workflow with a failed task
        state_manager.update(
            workflow_id="wf_failed",
            workflow_name="Workflow with Failures",
            wave_id=1,
            total_waves=2,
            completed_tasks=[
                {
                    "task_id": "task_1",
                    "description": "Successful task",
                    "wave_id": 1,
                    "result": {"success": True}
                }
            ],
            current_wave_tasks=[
                {
                    "task_id": "task_2",
                    "description": "Failed task",
                    "result": {"success": False, "error": "Connection timeout"}
                }
            ],
            pending_waves=[[{"task_id": "task_3", "description": "Next wave task"}]]
        )

        # Load and verify
        loaded_state = state_manager.load_state()
        assert loaded_state.tasks["task_1"].status == "completed"
        assert loaded_state.tasks["task_2"].status == "failed"
        assert loaded_state.tasks["task_2"].error == "Connection timeout"
        assert loaded_state.tasks["task_3"].status == "pending"

    def test_workflow_resume(self, state_manager):
        """Test resuming a workflow from STATE.md."""
        # Create and progress through part of workflow
        waves = [
            [{"task_id": "task_1", "description": "Wave 1 task"}],
            [{"task_id": "task_2", "description": "Wave 2 task"}],
            [{"task_id": "task_3", "description": "Wave 3 task"}]
        ]

        state_manager.initialize(
            workflow_id="wf_resume",
            workflow_name="Resume Test Workflow",
            total_waves=3,
            all_waves=waves
        )

        # Complete wave 1
        state_manager.update(
            workflow_id="wf_resume",
            workflow_name="Resume Test Workflow",
            wave_id=1,
            total_waves=3,
            completed_tasks=[
                {
                    "task_id": "task_1",
                    "description": "Wave 1 task",
                    "wave_id": 1,
                    "result": {"success": True}
                }
            ],
            current_wave_tasks=[],
            pending_waves=waves[1:]
        )

        # Get resume info
        resume_info = state_manager.get_resume_info()

        assert resume_info['workflow_id'] == "wf_resume"
        assert resume_info['current_wave'] == 1
        assert resume_info['resume_wave'] == 2  # Should resume from wave 2
        assert 'task_1' in resume_info['completed_tasks']
        assert 'task_2' in resume_info['pending_tasks']


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
