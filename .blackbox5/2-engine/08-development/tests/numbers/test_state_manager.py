"""
Tests for STATE.md Management System

Comprehensive test suite for StateManager including:
- STATE.md file creation and updates
- Markdown formatting
- Parsing existing STATE.md files
- Loading workflow state
- Resume information extraction
- Edge cases and error handling
"""

import pytest
from pathlib import Path
from datetime import datetime
from tempfile import TemporaryDirectory
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from engine.core.state_manager import StateManager, TaskState, WorkflowState


class TestTaskState:
    """Test TaskState dataclass and markdown conversion"""

    def test_task_state_creation(self):
        """Test creating a TaskState"""
        task = TaskState(
            task_id="task1",
            description="Test task",
            status="pending",
            wave_id=1
        )

        assert task.task_id == "task1"
        assert task.description == "Test task"
        assert task.status == "pending"
        assert task.wave_id == 1
        assert task.files_modified == []
        assert task.commit_hash is None
        assert task.error is None

    def test_task_state_with_optional_fields(self):
        """Test TaskState with optional fields populated"""
        task = TaskState(
            task_id="task2",
            description="Complex task",
            status="completed",
            wave_id=2,
            files_modified=["file1.py", "file2.py"],
            commit_hash="abc123",
            error="Some error"
        )

        assert len(task.files_modified) == 2
        assert task.commit_hash == "abc123"
        assert task.error == "Some error"

    def test_task_state_to_markdown_completed(self):
        """Test markdown conversion for completed task"""
        task = TaskState(
            task_id="task1",
            description="Test task",
            status="completed",
            wave_id=1,
            commit_hash="abc123"
        )

        md = task.to_markdown()
        assert "- [x]" in md
        assert "**task1**" in md
        assert "Test task" in md
        assert "Commit:" in md
        assert "`abc123`" in md

    def test_task_state_to_markdown_in_progress(self):
        """Test markdown conversion for in-progress task"""
        task = TaskState(
            task_id="task2",
            description="Working on it",
            status="in_progress",
            wave_id=1
        )

        md = task.to_markdown()
        assert "- [~]" in md
        assert "**task2**" in md
        assert "Working on it" in md

    def test_task_state_to_markdown_pending(self):
        """Test markdown conversion for pending task"""
        task = TaskState(
            task_id="task3",
            description="To do",
            status="pending",
            wave_id=2
        )

        md = task.to_markdown()
        assert "- [ ]" in md
        assert "**task3**" in md

    def test_task_state_to_markdown_with_files(self):
        """Test markdown conversion includes files modified"""
        task = TaskState(
            task_id="task1",
            description="Test",
            status="completed",
            wave_id=1,
            files_modified=["file1.py", "file2.py", "file3.py", "file4.py"]
        )

        md = task.to_markdown()
        assert "Files:" in md
        assert "file1.py" in md
        assert "file2.py" in md
        assert "file3.py" in md
        assert "(+1 more)" in md  # Should show 3 files + "1 more"

    def test_task_state_to_markdown_with_error(self):
        """Test markdown conversion includes error message"""
        task = TaskState(
            task_id="task1",
            description="Failed task",
            status="failed",
            wave_id=1,
            error="Something went wrong"
        )

        md = task.to_markdown()
        assert "Error:" in md
        assert "Something went wrong" in md


class TestWorkflowState:
    """Test WorkflowState dataclass and markdown conversion"""

    def test_workflow_state_creation(self):
        """Test creating a WorkflowState"""
        workflow = WorkflowState(
            workflow_id="wf1",
            workflow_name="Test Workflow",
            current_wave=1,
            total_waves=4,
            tasks={},
            started_at=datetime.now(),
            updated_at=datetime.now()
        )

        assert workflow.workflow_id == "wf1"
        assert workflow.workflow_name == "Test Workflow"
        assert workflow.current_wave == 1
        assert workflow.total_waves == 4

    def test_workflow_state_to_markdown_basic(self):
        """Test basic markdown conversion"""
        workflow = WorkflowState(
            workflow_id="wf1",
            workflow_name="Test Workflow",
            current_wave=2,
            total_waves=4,
            tasks={},
            started_at=datetime(2025, 1, 15, 10, 0, 0),
            updated_at=datetime(2025, 1, 15, 12, 0, 0)
        )

        md = workflow.to_markdown()

        assert "# Workflow: Test Workflow" in md
        assert "**Workflow ID:** `wf1`" in md
        assert "**Status:** Wave 2/4" in md
        assert "**Started:** 2025-01-15 10:00:00" in md
        assert "**Updated:** 2025-01-15 12:00:00" in md

    def test_workflow_state_with_completed_tasks(self):
        """Test markdown with completed tasks"""
        workflow = WorkflowState(
            workflow_id="wf1",
            workflow_name="Test",
            current_wave=2,
            total_waves=4,
            tasks={
                "task1": TaskState("task1", "Task 1", "completed", 1, commit_hash="abc123"),
                "task2": TaskState("task2", "Task 2", "completed", 1)
            },
            started_at=datetime.now(),
            updated_at=datetime.now()
        )

        md = workflow.to_markdown()

        assert "## ✅ Completed (2 tasks)" in md
        assert "- [x] **task1**: Task 1" in md
        assert "- [x] **task2**: Task 2" in md
        assert "Commit: `abc123`" in md

    def test_workflow_state_with_in_progress_tasks(self):
        """Test markdown with in-progress tasks"""
        workflow = WorkflowState(
            workflow_id="wf1",
            workflow_name="Test",
            current_wave=2,
            total_waves=4,
            tasks={
                "task3": TaskState("task3", "Task 3", "in_progress", 2)
            },
            started_at=datetime.now(),
            updated_at=datetime.now()
        )

        md = workflow.to_markdown()

        assert "## 🔄 In Progress (1 tasks)" in md
        assert "- [~] **task3**: Task 3" in md

    def test_workflow_state_with_pending_tasks(self):
        """Test markdown with pending tasks grouped by wave"""
        workflow = WorkflowState(
            workflow_id="wf1",
            workflow_name="Test",
            current_wave=2,
            total_waves=4,
            tasks={
                "task4": TaskState("task4", "Task 4", "pending", 3),
                "task5": TaskState("task5", "Task 5", "pending", 3),
                "task6": TaskState("task6", "Task 6", "pending", 4)
            },
            started_at=datetime.now(),
            updated_at=datetime.now()
        )

        md = workflow.to_markdown()

        assert "## 📋 Pending (3 tasks)" in md
        assert "### Wave 3" in md
        assert "### Wave 4" in md
        assert "- [ ] **task4**: Task 4" in md
        assert "- [ ] **task6**: Task 6" in md

    def test_workflow_state_with_failed_tasks(self):
        """Test markdown with failed tasks"""
        workflow = WorkflowState(
            workflow_id="wf1",
            workflow_name="Test",
            current_wave=2,
            total_waves=4,
            tasks={
                "task7": TaskState("task7", "Task 7", "failed", 2, error="Failed")
            },
            started_at=datetime.now(),
            updated_at=datetime.now()
        )

        md = workflow.to_markdown()

        assert "## ❌ Failed (1 tasks)" in md
        assert "- [ ] **task7**: Task 7" in md
        assert "Error: Failed" in md

    def test_workflow_state_with_notes(self):
        """Test markdown includes notes section"""
        workflow = WorkflowState(
            workflow_id="wf1",
            workflow_name="Test",
            current_wave=1,
            total_waves=4,
            tasks={},
            started_at=datetime.now(),
            updated_at=datetime.now(),
            notes=["Note 1", "Note 2"]
        )

        md = workflow.to_markdown()

        assert "## Notes" in md
        assert "- Note 1" in md
        assert "- Note 2" in md

    def test_workflow_state_with_metadata(self):
        """Test markdown includes metadata section"""
        workflow = WorkflowState(
            workflow_id="wf1",
            workflow_name="Test",
            current_wave=1,
            total_waves=4,
            tasks={},
            started_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={"version": "1.0", "author": "test"}
        )

        md = workflow.to_markdown()

        assert "## Metadata" in md
        assert "**version:** 1.0" in md
        assert "**author:** test" in md

    def test_workflow_state_progress_bar(self):
        """Test progress bar is correctly calculated"""
        workflow = WorkflowState(
            workflow_id="wf1",
            workflow_name="Test",
            current_wave=2,
            total_waves=4,
            tasks={},
            started_at=datetime.now(),
            updated_at=datetime.now()
        )

        md = workflow.to_markdown()

        # 2/4 = 50% = 10 filled out of 20
        assert "**Progress:**" in md
        assert "50%" in md
        # Check for progress bar characters
        assert "█" in md  # Filled
        assert "░" in md  # Empty


class TestStateManager:
    """Test StateManager class"""

    def test_state_manager_initialization(self):
        """Test StateManager initialization"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            assert manager.state_path == state_path

    def test_state_manager_default_path(self):
        """Test StateManager with default path"""
        manager = StateManager()
        assert manager.state_path == Path("STATE.md")

    def test_initialize_creates_file(self):
        """Test initialize creates STATE.md file"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            waves = [
                [
                    {"task_id": "task1", "description": "First task"},
                    {"task_id": "task2", "description": "Second task"}
                ],
                [
                    {"task_id": "task3", "description": "Third task"}
                ]
            ]

            manager.initialize(
                workflow_id="wf1",
                workflow_name="Test Workflow",
                total_waves=2,
                all_waves=waves
            )

            assert state_path.exists()
            content = state_path.read_text()
            assert "# Workflow: Test Workflow" in content
            assert "task1" in content
            assert "task2" in content
            assert "task3" in content

    def test_initialize_with_metadata(self):
        """Test initialize includes metadata"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            waves = [[{"task_id": "task1", "description": "Task"}]]

            manager.initialize(
                workflow_id="wf1",
                workflow_name="Test",
                total_waves=1,
                all_waves=waves,
                metadata={"version": "1.0", "priority": "high"}
            )

            content = state_path.read_text()
            assert "**version:** 1.0" in content
            assert "**priority:** high" in content

    def test_update_creates_file(self):
        """Test update creates STATE.md file"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            manager.update(
                workflow_id="wf1",
                workflow_name="Test Workflow",
                wave_id=1,
                total_waves=3,
                completed_tasks=[],
                current_wave_tasks=[
                    {"task_id": "task1", "description": "Task 1", "result": {"success": True}}
                ],
                pending_waves=[
                    [{"task_id": "task2", "description": "Task 2"}],
                    [{"task_id": "task3", "description": "Task 3"}]
                ]
            )

            assert state_path.exists()
            content = state_path.read_text()
            assert "# Workflow: Test Workflow" in content
            assert "Wave 1/3" in content

    def test_update_with_completed_tasks(self):
        """Test update includes completed tasks"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            manager.update(
                workflow_id="wf1",
                workflow_name="Test",
                wave_id=2,
                total_waves=3,
                completed_tasks=[
                    {
                        "task_id": "task1",
                        "description": "Wave 1 Task",
                        "wave_id": 1,
                        "commit_hash": "abc123",
                        "result": {"files_modified": ["file1.py"]}
                    }
                ],
                current_wave_tasks=[],
                pending_waves=[]
            )

            content = state_path.read_text()
            assert "## ✅ Completed" in content
            assert "- [x] **task1**: Wave 1 Task" in content
            assert "Commit: `abc123`" in content
            assert "Files:" in content

    def test_update_with_current_wave_tasks(self):
        """Test update includes current wave tasks"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            manager.update(
                workflow_id="wf1",
                workflow_name="Test",
                wave_id=1,
                total_waves=2,
                completed_tasks=[],
                current_wave_tasks=[
                    {
                        "task_id": "task1",
                        "description": "Current task",
                        "result": {"success": True}
                    },
                    {
                        "task_id": "task2",
                        "description": "In progress",
                        "result": {}
                    }
                ],
                pending_waves=[]
            )

            content = state_path.read_text()
            assert "## 🔄 In Progress" in content
            assert "**task1**: Current task" in content
            assert "**task2**: In progress" in content

    def test_update_with_pending_waves(self):
        """Test update includes pending waves"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            manager.update(
                workflow_id="wf1",
                workflow_name="Test",
                wave_id=1,
                total_waves=3,
                completed_tasks=[],
                current_wave_tasks=[],
                pending_waves=[
                    [{"task_id": "task2", "description": "Wave 2 task"}],
                    [{"task_id": "task3", "description": "Wave 3 task"}]
                ]
            )

            content = state_path.read_text()
            assert "## 📋 Pending" in content
            assert "### Wave 2" in content
            assert "### Wave 3" in content
            assert "**task2**: Wave 2 task" in content
            assert "**task3**: Wave 3 task" in content

    def test_update_with_commit_hash(self):
        """Test update applies commit hash to completed tasks"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            manager.update(
                workflow_id="wf1",
                workflow_name="Test",
                wave_id=1,
                total_waves=1,
                completed_tasks=[],
                current_wave_tasks=[
                    {"task_id": "task1", "description": "Task", "result": {"success": True}}
                ],
                pending_waves=[],
                commit_hash="def456"
            )

            content = state_path.read_text()
            assert "Commit: `def456`" in content

    def test_update_with_notes(self):
        """Test update includes notes"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            manager.update(
                workflow_id="wf1",
                workflow_name="Test",
                wave_id=1,
                total_waves=1,
                completed_tasks=[],
                current_wave_tasks=[],
                pending_waves=[],
                notes=["Important note", "Another note"]
            )

            content = state_path.read_text()
            assert "## Notes" in content
            assert "- Important note" in content
            assert "- Another note" in content

    def test_update_preserves_started_at(self):
        """Test update preserves started_at from existing state"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            # Create initial state
            manager.initialize(
                workflow_id="wf1",
                workflow_name="Test",
                total_waves=2,
                all_waves=[[{"task_id": "task1", "description": "Task"}]]
            )

            # Get original started_at
            original_state = manager.load_state()
            original_started = original_state.started_at

            # Update
            manager.update(
                workflow_id="wf1",
                workflow_name="Test",
                wave_id=1,
                total_waves=2,
                completed_tasks=[],
                current_wave_tasks=[{"task_id": "task1", "description": "Task", "result": {"success": True}}],
                pending_waves=[]
            )

            # Check started_at is preserved (within 1 second to account for parsing)
            updated_state = manager.load_state()
            time_diff = abs((updated_state.started_at - original_started).total_seconds())
            assert time_diff < 1.0  # Should be within 1 second

    def test_parse_state_basic(self):
        """Test parsing basic STATE.md content"""
        content = """# Workflow: Test Workflow

**Workflow ID:** `wf1`
**Status:** Wave 2/4
**Started:** 2025-01-15 10:00:00
**Updated:** 2025-01-15 12:00:00

---

## ✅ Completed (2 tasks)
- [x] **task1**: First task
  - Commit: `abc123`

## 🔄 In Progress (1 tasks)
- [~] **task2**: Second task

## 📋 Pending (1 tasks)
### Wave 3
- [ ] **task3**: Third task
"""

        manager = StateManager()
        state = manager.parse_state(content)

        assert state is not None
        assert state.workflow_name == "Test Workflow"
        assert state.workflow_id == "wf1"
        assert state.current_wave == 2
        assert state.total_waves == 4
        assert len(state.tasks) == 3
        assert state.tasks["task1"].status == "completed"
        assert state.tasks["task1"].commit_hash == "abc123"
        assert state.tasks["task2"].status == "in_progress"
        assert state.tasks["task3"].status == "pending"

    def test_parse_state_with_failed_tasks(self):
        """Test parsing STATE.md with failed tasks"""
        content = """# Workflow: Test

**Status:** Wave 1/2

## ❌ Failed (1 tasks)
- [ ] **task1**: Failed task
  - Error: Something broke
"""

        manager = StateManager()
        state = manager.parse_state(content)

        assert state is not None
        assert state.tasks["task1"].status == "failed"
        assert state.tasks["task1"].error == "Something broke"

    def test_parse_state_with_notes(self):
        """Test parsing STATE.md with notes"""
        content = """# Workflow: Test

**Status:** Wave 1/1

## Notes
- First note
- Second note
"""

        manager = StateManager()
        state = manager.parse_state(content)

        assert state is not None
        assert len(state.notes) == 2
        assert "First note" in state.notes
        assert "Second note" in state.notes

    def test_parse_state_handles_malformed(self):
        """Test parsing handles malformed content gracefully"""
        content = "Invalid content without proper headers"

        manager = StateManager()
        state = manager.parse_state(content)

        # Should still return a state object with defaults
        assert state is not None
        assert state.workflow_name == "Unknown"

    def test_load_state_when_not_exists(self):
        """Test load_state returns None when file doesn't exist"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            state = manager.load_state()
            assert state is None

    def test_load_state_when_exists(self):
        """Test load_state loads existing file"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            # Create file
            manager.initialize(
                workflow_id="wf1",
                workflow_name="Test",
                total_waves=1,
                all_waves=[[{"task_id": "task1", "description": "Task"}]]
            )

            # Load it
            state = manager.load_state()
            assert state is not None
            assert state.workflow_name == "Test"
            assert len(state.tasks) == 1

    def test_get_resume_info(self):
        """Test getting resume information"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            manager.update(
                workflow_id="wf1",
                workflow_name="Test",
                wave_id=2,
                total_waves=4,
                completed_tasks=[
                    {"task_id": "task1", "description": "Done", "wave_id": 1, "result": {"success": True}}
                ],
                current_wave_tasks=[
                    {"task_id": "task2", "description": "Working", "result": {"success": True}}
                ],
                pending_waves=[
                    [{"task_id": "task3", "description": "Todo"}]
                ]
            )

            resume_info = manager.get_resume_info()

            assert resume_info is not None
            assert resume_info['workflow_id'] == "wf1"
            assert resume_info['current_wave'] == 2
            assert resume_info['resume_wave'] == 3  # Next wave
            assert resume_info['total_waves'] == 4
            assert 'task1' in resume_info['completed_tasks']
            assert 'task2' in resume_info['completed_tasks']  # Current wave task completed

    def test_get_resume_info_with_failures(self):
        """Test resume info with failed tasks resumes from current wave"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            manager.update(
                workflow_id="wf1",
                workflow_name="Test",
                wave_id=2,
                total_waves=4,
                completed_tasks=[],
                current_wave_tasks=[
                    {"task_id": "task1", "description": "Working", "result": {}},  # In progress
                    {"task_id": "task2", "description": "Failed", "result": {"error": "Error"}}  # Failed
                ],
                pending_waves=[
                    [{"task_id": "task3", "description": "Todo"}]
                ]
            )

            resume_info = manager.get_resume_info()

            # Should resume from current wave (2) because there are failures
            assert resume_info['resume_wave'] == 2
            assert 'task2' in resume_info['failed_tasks']

    def test_add_note(self):
        """Test adding a note to existing state"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            # Initialize with note
            manager.update(
                workflow_id="wf1",
                workflow_name="Test",
                wave_id=1,
                total_waves=1,
                completed_tasks=[],
                current_wave_tasks=[],
                pending_waves=[],
                notes=["Original note"]
            )

            # Add another note
            manager.add_note("New note")

            content = state_path.read_text()
            assert "Original note" in content
            assert "New note" in content

    def test_add_note_when_no_state(self):
        """Test add_note handles missing state gracefully"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            # Should not crash, just log warning
            manager.add_note("Test note")

            assert not state_path.exists()

    def test_clear(self):
        """Test clearing STATE.md file"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            # Create file
            manager.initialize(
                workflow_id="wf1",
                workflow_name="Test",
                total_waves=1,
                all_waves=[[{"task_id": "task1", "description": "Task"}]]
            )

            assert state_path.exists()

            # Clear it
            manager.clear()

            assert not state_path.exists()

    def test_clear_when_not_exists(self):
        """Test clear handles non-existent file"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            # Should not crash
            manager.clear()

            assert not state_path.exists()


class TestEdgeCases:
    """Test edge cases and error handling"""

    def test_empty_task_list(self):
        """Test workflow with no tasks"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            manager.update(
                workflow_id="wf1",
                workflow_name="Empty Workflow",
                wave_id=0,
                total_waves=0,
                completed_tasks=[],
                current_wave_tasks=[],
                pending_waves=[]
            )

            content = state_path.read_text()
            assert "# Workflow: Empty Workflow" in content
            assert "Wave 0/0" in content

    def test_no_pending_waves(self):
        """Test workflow with no pending waves"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            manager.update(
                workflow_id="wf1",
                workflow_name="Complete Workflow",
                wave_id=3,
                total_waves=3,
                completed_tasks=[
                    {"task_id": "task1", "description": "Done", "wave_id": 1, "result": {"success": True}}
                ],
                current_wave_tasks=[],
                pending_waves=[]
            )

            content = state_path.read_text()
            assert "Wave 3/3" in content
            # Should not show pending section
            assert "## 📋 Pending" not in content

    def test_tasks_with_various_description_fields(self):
        """Test tasks get description from various fields"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            manager.update(
                workflow_id="wf1",
                workflow_name="Test",
                wave_id=1,
                total_waves=1,
                completed_tasks=[
                    {"task_id": "task1", "task": "Using task field"},
                    {"task_id": "task2", "description": "Using description field"},
                    {"task_id": "task3", "prompt": "Using prompt field"}
                ],
                current_wave_tasks=[],
                pending_waves=[]
            )

            content = state_path.read_text()
            assert "Using task field" in content
            assert "Using description field" in content
            assert "Using prompt field" in content

    def test_tasks_with_various_id_fields(self):
        """Test tasks get ID from various fields"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            manager.update(
                workflow_id="wf1",
                workflow_name="Test",
                wave_id=1,
                total_waves=1,
                completed_tasks=[
                    {"task_id": "id1", "description": "Task 1"},
                    {"agent_id": "id2", "description": "Task 2"}
                ],
                current_wave_tasks=[],
                pending_waves=[]
            )

            content = state_path.read_text()
            assert "**id1**" in content
            assert "**id2**" in content

    def test_long_description_truncation(self):
        """Test long descriptions in prompt field are truncated"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            long_desc = "A" * 200  # Long description

            manager.update(
                workflow_id="wf1",
                workflow_name="Test",
                wave_id=1,
                total_waves=1,
                completed_tasks=[
                    {"task_id": "task1", "prompt": long_desc}
                ],
                current_wave_tasks=[],
                pending_waves=[]
            )

            content = state_path.read_text()
            # Should be truncated to 100 chars
            assert len([line for line in content.split('\n') if long_desc[:100] in line]) > 0

    def test_multiple_waves_with_same_wave_id(self):
        """Test tasks from multiple waves with same wave_id are grouped"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            manager.update(
                workflow_id="wf1",
                workflow_name="Test",
                wave_id=2,
                total_waves=3,
                completed_tasks=[
                    {"task_id": "task1", "description": "Wave 1a", "wave_id": 1, "result": {"success": True}},
                    {"task_id": "task2", "description": "Wave 1b", "wave_id": 1, "result": {"success": True}},
                    {"task_id": "task3", "description": "Wave 2a", "wave_id": 2, "result": {"success": True}}
                ],
                current_wave_tasks=[],
                pending_waves=[]
            )

            content = state_path.read_text()
            # Should show "### Wave 1" and "### Wave 2" headers since there are multiple waves
            assert "### Wave 1" in content
            assert "### Wave 2" in content

    def test_unicode_characters(self):
        """Test handling of unicode characters in descriptions"""
        with TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "STATE.md"
            manager = StateManager(state_path)

            manager.update(
                workflow_id="wf1",
                workflow_name="Tëst Wörkflow",
                wave_id=1,
                total_waves=1,
                completed_tasks=[
                    {"task_id": "task1", "description": "Task with émojis 🎉 and spëcial çhars"}
                ],
                current_wave_tasks=[],
                pending_waves=[]
            )

            content = state_path.read_text()
            assert "Tëst Wörkflow" in content
            assert "émojis 🎉" in content
            assert "spëcial çhars" in content


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
