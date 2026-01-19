#!/usr/bin/env python3
"""
Test Checkpoint Protocol System

Comprehensive tests for the checkpoint/recovery functionality in BlackBox5 Orchestrator.
"""

import os
import sys
import json
import tempfile
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

# Add engine to path
engine_path = Path(__file__).parent.parent / "engine"
sys.path.insert(0, str(engine_path))

from core.Orchestrator import (
    AgentOrchestrator,
    WorkflowCheckpoint,
    WorkflowStep,
    WorkflowResult,
    WorkflowState,
    AgentConfig,
    AgentInstance,
    AgentState,
)


class TestCheckpointProtocol:
    """Test suite for checkpoint protocol system."""

    def __init__(self):
        """Initialize test suite."""
        self.temp_dir = None
        self.orchestrator = None

    def setup(self):
        """Set up test environment."""
        # Create temporary directory for test
        self.temp_dir = tempfile.mkdtemp(prefix="checkpoint_test_")
        memory_path = Path(self.temp_dir) / "agent_memory"

        # Create orchestrator with checkpoints enabled
        self.orchestrator = AgentOrchestrator(
            memory_base_path=memory_path,
            enable_checkpoints=True,
            checkpoint_frequency=1,
            checkpoint_retention=3,
        )

        print(f"✅ Setup complete. Temp dir: {self.temp_dir}")

    def teardown(self):
        """Clean up test environment."""
        if self.temp_dir and os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
            print(f"✅ Teardown complete. Cleaned: {self.temp_dir}")

    def test_01_save_checkpoint_after_wave(self):
        """Test saving checkpoint after wave completion."""
        print("\n" + "="*60)
        print("Test 1: Save Checkpoint After Wave Completion")
        print("="*60)

        # Create a workflow
        workflow_id = "test_workflow_1"
        workflow_result = WorkflowResult(
            workflow_id=workflow_id,
            state=WorkflowState.RUNNING,
            steps_completed=3,
            steps_total=10,
            started_at=datetime.now(),
            results={
                "developer_1": {"task": "Task 1", "status": "completed"},
                "developer_2": {"task": "Task 2", "status": "completed"},
                "tester_1": {"task": "Task 3", "status": "completed"},
            }
        )
        self.orchestrator._workflows[workflow_id] = workflow_result

        # Start some agents
        agent_id_1 = self.orchestrator.start_agent(
            agent_type="developer",
            task="Test task 1",
            agent_id="developer_1"
        )
        agent_id_2 = self.orchestrator.start_agent(
            agent_type="tester",
            task="Test task 2",
            agent_id="tester_1"
        )

        # Add some memory to agents
        self.orchestrator._agents[agent_id_1].memory = {
            "tasks_completed": 5,
            "last_action": "Implemented feature X"
        }
        self.orchestrator._agents[agent_id_2].memory = {
            "tests_run": 10,
            "bugs_found": 2
        }

        # Save checkpoint
        checkpoint_id = self.orchestrator.save_checkpoint(workflow_id, wave_id=1)

        # Verify checkpoint was saved
        assert checkpoint_id == f"{workflow_id}_wave1", "Checkpoint ID mismatch"

        checkpoint_path = self.orchestrator._get_checkpoint_path(checkpoint_id)
        assert checkpoint_path.exists(), "Checkpoint file not created"

        # Verify checkpoint contents
        with open(checkpoint_path, 'r') as f:
            data = json.load(f)

        assert data["workflow_id"] == workflow_id, "Workflow ID mismatch"
        assert data["wave_id"] == 1, "Wave ID mismatch"
        assert data["steps_completed"] == 3, "Steps completed mismatch"
        assert len(data["completed_tasks"]) == 3, "Completed tasks count mismatch"
        assert len(data["agent_memories"]) == 2, "Agent memories count mismatch"

        print(f"✅ Checkpoint saved: {checkpoint_id}")
        print(f"   - Workflow: {data['workflow_id']}")
        print(f"   - Wave: {data['wave_id']}")
        print(f"   - Steps: {data['steps_completed']}/{data['steps_total']}")
        print(f"   - Completed tasks: {len(data['completed_tasks'])}")
        print(f"   - Agent memories: {len(data['agent_memories'])}")

        return True

    def test_02_load_checkpoint(self):
        """Test loading checkpoint from disk."""
        print("\n" + "="*60)
        print("Test 2: Load Checkpoint from Disk")
        print("="*60)

        # First, create a checkpoint
        workflow_id = "test_workflow_2"
        workflow_result = WorkflowResult(
            workflow_id=workflow_id,
            state=WorkflowState.RUNNING,
            steps_completed=5,
            steps_total=15,
            started_at=datetime.now(),
            results={
                "developer_1": {"task": "Task 1", "status": "completed"},
            }
        )
        self.orchestrator._workflows[workflow_id] = workflow_result

        agent_id = self.orchestrator.start_agent(
            agent_type="developer",
            task="Test task",
            agent_id="developer_1"
        )
        self.orchestrator._agents[agent_id].memory = {
            "tasks_completed": 10,
            "last_action": "Built API"
        }

        checkpoint_id = self.orchestrator.save_checkpoint(workflow_id, wave_id=2)

        # Now load it
        checkpoint = self.orchestrator.load_checkpoint(checkpoint_id)

        # Verify loaded checkpoint
        assert checkpoint.checkpoint_id == checkpoint_id, "Checkpoint ID mismatch"
        assert checkpoint.workflow_id == workflow_id, "Workflow ID mismatch"
        assert checkpoint.wave_id == 2, "Wave ID mismatch"
        assert checkpoint.steps_completed == 5, "Steps completed mismatch"
        assert len(checkpoint.completed_tasks) == 1, "Completed tasks count mismatch"
        assert len(checkpoint.agent_memories) == 1, "Agent memories count mismatch"
        assert checkpoint.agent_memories["developer_1"]["tasks_completed"] == 10, "Memory data mismatch"

        print(f"✅ Checkpoint loaded: {checkpoint.checkpoint_id}")
        print(f"   - Workflow: {checkpoint.workflow_id}")
        print(f"   - Wave: {checkpoint.wave_id}")
        print(f"   - Timestamp: {checkpoint.timestamp}")
        print(f"   - State: {checkpoint.workflow_state}")

        return True

    def test_03_checkpoint_not_found(self):
        """Test loading non-existent checkpoint raises FileNotFoundError."""
        print("\n" + "="*60)
        print("Test 3: Handle Missing Checkpoint")
        print("="*60)

        try:
            self.orchestrator.load_checkpoint("nonexistent_checkpoint")
            print("❌ Should have raised FileNotFoundError")
            return False
        except FileNotFoundError as e:
            print(f"✅ Correctly raised FileNotFoundError: {e}")
            return True

    def test_04_resume_workflow(self):
        """Test resuming workflow from checkpoint."""
        print("\n" + "="*60)
        print("Test 4: Resume Workflow from Checkpoint")
        print("="*60)

        # Create initial workflow and checkpoint
        workflow_id = "test_workflow_resume"
        workflow_result = WorkflowResult(
            workflow_id=workflow_id,
            state=WorkflowState.RUNNING,
            steps_completed=3,
            steps_total=6,
            started_at=datetime.now(),
            results={
                "developer_1": {"task": "Task 1", "status": "completed"},
                "developer_2": {"task": "Task 2", "status": "completed"},
                "tester_1": {"task": "Task 3", "status": "completed"},
            }
        )
        self.orchestrator._workflows[workflow_id] = workflow_result

        # Start agents and add memory
        for i in range(1, 4):
            agent_type = "developer" if i <= 2 else "tester"
            agent_id = f"{agent_type}_{i}"
            self.orchestrator.start_agent(
                agent_type=agent_type,
                task=f"Task {i}",
                agent_id=agent_id
            )
            self.orchestrator._agents[agent_id].memory = {
                "tasks_completed": i,
                "last_action": f"Completed task {i}"
            }

        # Save checkpoint after wave 1
        checkpoint_id = self.orchestrator.save_checkpoint(workflow_id, wave_id=1)
        print(f"✅ Saved checkpoint: {checkpoint_id}")

        # Define remaining tasks
        remaining_tasks = [
            WorkflowStep(agent_type="developer", task="Task 4", agent_id="developer_4"),
            WorkflowStep(agent_type="tester", task="Task 5", agent_id="tester_2"),
            WorkflowStep(agent_type="reviewer", task="Task 6", agent_id="reviewer_1"),
        ]

        # Resume workflow
        result = self.orchestrator.resume_workflow(checkpoint_id, remaining_tasks)

        # Verify resumed workflow
        assert result.workflow_id == workflow_id, "Workflow ID mismatch"
        assert result.steps_completed == 6, f"Expected 6 steps, got {result.steps_completed}"
        assert len(result.results) == 6, f"Expected 6 results, got {len(result.results)}"
        assert result.state == WorkflowState.COMPLETED, "Workflow state should be COMPLETED"

        # Verify agent memories were restored
        assert "developer_1" in self.orchestrator._agents, "developer_1 should exist"
        assert self.orchestrator._agents["developer_1"].memory["tasks_completed"] == 1, "Memory not restored"

        print(f"✅ Workflow resumed successfully")
        print(f"   - Steps: {result.steps_completed}/{result.steps_total}")
        print(f"   - State: {result.state.value}")
        print(f"   - Results: {len(result.results)}")

        return True

    def test_05_fresh_agent_instances(self):
        """Test that resume creates fresh agent instances."""
        print("\n" + "="*60)
        print("Test 5: Fresh Agent Instances on Resume")
        print("="*60)

        # Create checkpoint with some agents
        workflow_id = "test_fresh_agents"
        workflow_result = WorkflowResult(
            workflow_id=workflow_id,
            state=WorkflowState.RUNNING,
            steps_completed=1,
            steps_total=2,
            started_at=datetime.now(),
            results={"developer_1": {"task": "Task 1", "status": "completed"}}
        )
        self.orchestrator._workflows[workflow_id] = workflow_result

        agent_id = self.orchestrator.start_agent(
            agent_type="developer",
            task="Task 1",
            agent_id="developer_1"
        )
        original_memory = {"context": "original session"}
        self.orchestrator._agents[agent_id].memory = original_memory

        checkpoint_id = self.orchestrator.save_checkpoint(workflow_id, wave_id=1)

        # Clear agents (simulate new session)
        self.orchestrator._agents.clear()

        # Resume should create fresh instances
        remaining_tasks = [
            WorkflowStep(agent_type="developer", task="Task 2", agent_id="developer_2"),
        ]

        result = self.orchestrator.resume_workflow(checkpoint_id, remaining_tasks)

        # Verify fresh agent created with restored memory
        assert "developer_1" in self.orchestrator._agents, "developer_1 should be recreated"
        assert self.orchestrator._agents["developer_1"].memory == original_memory, "Memory should be restored"
        assert self.orchestrator._agents["developer_1"].state == AgentState.IDLE, "Agent should be IDLE"

        print(f"✅ Fresh agent instances created with restored memory")
        print(f"   - developer_1 state: {self.orchestrator._agents['developer_1'].state.value}")
        print(f"   - developer_1 memory: {self.orchestrator._agents['developer_1'].memory}")

        return True

    def test_06_cleanup_old_checkpoints(self):
        """Test cleanup of old checkpoints."""
        print("\n" + "="*60)
        print("Test 6: Cleanup Old Checkpoints")
        print("="*60)

        # Create orchestrator with higher retention to allow more checkpoints
        orchestrator_high_retention = AgentOrchestrator(
            memory_base_path=Path(self.temp_dir) / "agent_memory_cleanup",
            enable_checkpoints=True,
            checkpoint_retention=10,  # Allow up to 10 checkpoints
        )

        workflow_id = "test_cleanup"

        # Create multiple checkpoints
        for i in range(5):
            workflow_result = WorkflowResult(
                workflow_id=workflow_id,
                state=WorkflowState.RUNNING,
                steps_completed=i,
                steps_total=10,
                started_at=datetime.now(),
                results={f"agent_{i}": {"task": f"Task {i}", "status": "completed"}}
            )
            orchestrator_high_retention._workflows[workflow_id] = workflow_result

            # Small delay to ensure different timestamps
            import time
            time.sleep(0.01)

            checkpoint_id = orchestrator_high_retention.save_checkpoint(workflow_id, wave_id=i)
            print(f"   Created checkpoint: {checkpoint_id}")

        # Count checkpoints before cleanup
        checkpoint_files = list(orchestrator_high_retention.checkpoint_base_path.glob(f"{workflow_id}_wave*.json"))
        print(f"   Checkpoints before cleanup: {len(checkpoint_files)}")

        # Verify all 5 checkpoints exist (retention is 10, so all should be kept)
        assert len(checkpoint_files) == 5, f"Expected 5 checkpoints before cleanup, found {len(checkpoint_files)}"

        # Cleanup keeping only 3 most recent
        removed = orchestrator_high_retention.cleanup_old_checkpoints(workflow_id, keep_latest=3)

        # Count checkpoints after cleanup
        checkpoint_files_after = list(orchestrator_high_retention.checkpoint_base_path.glob(f"{workflow_id}_wave*.json"))
        print(f"   Checkpoints after cleanup: {len(checkpoint_files_after)}")
        print(f"   Removed: {removed}")

        assert removed == 2, f"Expected to remove 2 checkpoints, removed {removed}"
        assert len(checkpoint_files_after) == 3, f"Expected 3 checkpoints, found {len(checkpoint_files_after)}"

        print(f"✅ Cleanup successful")

        return True

    def test_07_atomic_checkpoint_write(self):
        """Test that checkpoint writes are atomic (temp file + rename)."""
        print("\n" + "="*60)
        print("Test 7: Atomic Checkpoint Write")
        print("="*60)

        workflow_id = "test_atomic"
        workflow_result = WorkflowResult(
            workflow_id=workflow_id,
            state=WorkflowState.RUNNING,
            steps_completed=1,
            steps_total=5,
            started_at=datetime.now(),
            results={"agent_1": {"task": "Task 1", "status": "completed"}}
        )
        self.orchestrator._workflows[workflow_id] = workflow_result

        checkpoint_id = self.orchestrator.save_checkpoint(workflow_id, wave_id=1)

        # Verify no .tmp file remains
        temp_files = list(self.orchestrator.checkpoint_base_path.glob("*.tmp"))
        assert len(temp_files) == 0, f"Found {len(temp_files)} temp files that should have been cleaned up"

        # Verify final checkpoint exists
        checkpoint_path = self.orchestrator._get_checkpoint_path(checkpoint_id)
        assert checkpoint_path.exists(), "Checkpoint file not found"

        print(f"✅ Atomic write verified")
        print(f"   - No temp files remaining")
        print(f"   - Checkpoint file exists: {checkpoint_path.name}")

        return True

    def test_08_multi_session_workflow(self):
        """Test workflow spanning multiple sessions."""
        print("\n" + "="*60)
        print("Test 8: Multi-Session Workflow")
        print("="*60)

        workflow_id = "test_multi_session"

        # Session 1: Execute first 3 tasks
        print("   Session 1: Execute first 3 tasks")
        orchestrator_1 = AgentOrchestrator(
            memory_base_path=Path(self.temp_dir) / "agent_memory",
            enable_checkpoints=True,
        )

        workflow_result_1 = WorkflowResult(
            workflow_id=workflow_id,
            state=WorkflowState.RUNNING,
            steps_completed=3,
            steps_total=6,
            started_at=datetime.now(),
            results={
                "developer_1": {"task": "Task 1", "status": "completed"},
                "developer_2": {"task": "Task 2", "status": "completed"},
                "tester_1": {"task": "Task 3", "status": "completed"},
            }
        )
        orchestrator_1._workflows[workflow_id] = workflow_result_1

        for i in range(1, 4):
            agent_type = "developer" if i <= 2 else "tester"
            agent_id = f"{agent_type}_{i}"
            orchestrator_1.start_agent(agent_type=agent_type, task=f"Task {i}", agent_id=agent_id)
            orchestrator_1._agents[agent_id].memory = {"session": 1, "task": i}

        checkpoint_id_1 = orchestrator_1.save_checkpoint(workflow_id, wave_id=1)
        print(f"   - Saved checkpoint: {checkpoint_id_1}")

        # Simulate session 1 ending (orchestrator_1 destroyed)

        # Session 2: Resume and complete remaining tasks
        print("   Session 2: Resume and complete remaining tasks")
        orchestrator_2 = AgentOrchestrator(
            memory_base_path=Path(self.temp_dir) / "agent_memory",
            enable_checkpoints=True,
        )

        remaining_tasks = [
            WorkflowStep(agent_type="developer", task="Task 4", agent_id="developer_3"),
            WorkflowStep(agent_type="tester", task="Task 5", agent_id="tester_2"),
            WorkflowStep(agent_type="reviewer", task="Task 6", agent_id="reviewer_1"),
        ]

        result = orchestrator_2.resume_workflow(checkpoint_id_1, remaining_tasks)

        # Verify workflow completed
        assert result.steps_completed == 6, f"Expected 6 steps, got {result.steps_completed}"
        assert result.state == WorkflowState.COMPLETED, "Workflow should be completed"
        assert len(result.results) == 6, f"Expected 6 results, got {len(result.results)}"

        # Verify memories from session 1 were preserved
        assert "developer_1" in orchestrator_2._agents, "developer_1 should exist"
        assert orchestrator_2._agents["developer_1"].memory.get("session") == 1, "Session 1 memory not preserved"

        print(f"✅ Multi-session workflow successful")
        print(f"   - Session 1: 3 tasks completed")
        print(f"   - Session 2: 3 tasks completed")
        print(f"   - Total: {result.steps_completed} tasks")
        print(f"   - Memory preserved across sessions")

        return True

    def test_09_checkpoints_disabled(self):
        """Test that checkpoints can be disabled."""
        print("\n" + "="*60)
        print("Test 9: Checkpoints Disabled")
        print("="*60)

        # Create orchestrator with checkpoints disabled
        orchestrator_no_cp = AgentOrchestrator(
            memory_base_path=Path(self.temp_dir) / "agent_memory_no_cp",
            enable_checkpoints=False,
        )

        workflow_id = "test_no_checkpoint"
        workflow_result = WorkflowResult(
            workflow_id=workflow_id,
            state=WorkflowState.RUNNING,
            steps_completed=1,
            steps_total=5,
            started_at=datetime.now(),
            results={"agent_1": {"task": "Task 1", "status": "completed"}}
        )
        orchestrator_no_cp._workflows[workflow_id] = workflow_result

        # Try to save checkpoint
        checkpoint_id = orchestrator_no_cp.save_checkpoint(workflow_id, wave_id=1)

        # Should return empty string (no checkpoint saved)
        assert checkpoint_id == "", "Checkpoint ID should be empty when disabled"

        # Verify no checkpoint directory created
        assert not orchestrator_no_cp.checkpoint_base_path.exists(), "Checkpoint directory should not exist"

        print(f"✅ Checkpoints correctly disabled")
        print(f"   - save_checkpoint returned empty string")
        print(f"   - No checkpoint directory created")

        return True

    def test_10_checkpoint_dataclass_serialization(self):
        """Test WorkflowCheckpoint dataclass to_dict and from_dict methods."""
        print("\n" + "="*60)
        print("Test 10: WorkflowCheckpoint Serialization")
        print("="*60)

        # Create a checkpoint
        timestamp = datetime.now()
        checkpoint = WorkflowCheckpoint(
            checkpoint_id="test_serialization_wave1",
            workflow_id="test_workflow",
            wave_id=1,
            timestamp=timestamp,
            workflow_state="running",
            steps_completed=5,
            steps_total=10,
            completed_tasks={"agent_1": {"task": "Task 1"}},
            agent_memories={"agent_1": {"memory": "data"}},
            metadata={"key": "value"}
        )

        # Convert to dict
        data = checkpoint.to_dict()

        # Verify dict structure
        assert data["checkpoint_id"] == checkpoint.checkpoint_id, "checkpoint_id mismatch"
        assert data["workflow_id"] == checkpoint.workflow_id, "workflow_id mismatch"
        assert data["wave_id"] == checkpoint.wave_id, "wave_id mismatch"
        assert data["timestamp"] == timestamp.isoformat(), "timestamp mismatch"
        assert data["workflow_state"] == checkpoint.workflow_state, "workflow_state mismatch"
        assert data["steps_completed"] == checkpoint.steps_completed, "steps_completed mismatch"
        assert data["steps_total"] == checkpoint.steps_total, "steps_total mismatch"
        assert data["completed_tasks"] == checkpoint.completed_tasks, "completed_tasks mismatch"
        assert data["agent_memories"] == checkpoint.agent_memories, "agent_memories mismatch"
        assert data["metadata"] == checkpoint.metadata, "metadata mismatch"

        # Convert back from dict
        restored = WorkflowCheckpoint.from_dict(data)

        # Verify restored object
        assert restored.checkpoint_id == checkpoint.checkpoint_id, "Restored checkpoint_id mismatch"
        assert restored.workflow_id == checkpoint.workflow_id, "Restored workflow_id mismatch"
        assert restored.wave_id == checkpoint.wave_id, "Restored wave_id mismatch"
        assert restored.workflow_state == checkpoint.workflow_state, "Restored workflow_state mismatch"
        assert restored.steps_completed == checkpoint.steps_completed, "Restored steps_completed mismatch"
        assert restored.steps_total == checkpoint.steps_total, "Restored steps_total mismatch"
        assert restored.completed_tasks == checkpoint.completed_tasks, "Restored completed_tasks mismatch"
        assert restored.agent_memories == checkpoint.agent_memories, "Restored agent_memories mismatch"
        assert restored.metadata == checkpoint.metadata, "Restored metadata mismatch"

        print(f"✅ WorkflowCheckpoint serialization successful")
        print(f"   - to_dict: All fields preserved")
        print(f"   - from_dict: All fields restored")

        return True


def run_tests():
    """Run all checkpoint protocol tests."""
    print("\n" + "="*60)
    print("Checkpoint Protocol System - Test Suite")
    print("="*60)

    test_suite = TestCheckpointProtocol()

    tests = [
        ("Save Checkpoint After Wave", test_suite.test_01_save_checkpoint_after_wave),
        ("Load Checkpoint from Disk", test_suite.test_02_load_checkpoint),
        ("Handle Missing Checkpoint", test_suite.test_03_checkpoint_not_found),
        ("Resume Workflow from Checkpoint", test_suite.test_04_resume_workflow),
        ("Fresh Agent Instances on Resume", test_suite.test_05_fresh_agent_instances),
        ("Cleanup Old Checkpoints", test_suite.test_06_cleanup_old_checkpoints),
        ("Atomic Checkpoint Write", test_suite.test_07_atomic_checkpoint_write),
        ("Multi-Session Workflow", test_suite.test_08_multi_session_workflow),
        ("Checkpoints Disabled", test_suite.test_09_checkpoints_disabled),
        ("WorkflowCheckpoint Serialization", test_suite.test_10_checkpoint_dataclass_serialization),
    ]

    results = {}

    for name, test_func in tests:
        try:
            test_suite.setup()
            result = test_func()
            results[name] = result
            test_suite.teardown()
        except Exception as e:
            print(f"\n❌ {name} failed with exception: {e}")
            import traceback
            traceback.print_exc()
            results[name] = False
            test_suite.teardown()

    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {name}: {status}")

    print(f"\nTotal: {passed}/{total} tests passed")

    return passed == total


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
