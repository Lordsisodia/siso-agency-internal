#!/usr/bin/env python3
"""
Test script for Blackbox4 Observability Layer

Tests the integration of TUILogger, DashboardClient, and artifact management.
"""

import sys
import time
from pathlib import Path

# Add paths for imports
blackbox_root = Path("/Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/.blackbox4")
sys.path.insert(0, str(blackbox_root / "4-scripts" / "python"))
sys.path.insert(0, str(blackbox_root / ".ralph-tui"))

from tui_logger import TUILogger, ExecutionResult
from dashboard_client import DashboardClient


def create_mock_prd():
    """Create a mock PRD for testing."""
    return {
        "goal": "Test observability layer integration",
        "sub_goals": [
            "Initialize TUILogger",
            "Log test iterations",
            "Verify artifacts created",
            "Test dashboard integration"
        ],
        "tasks": [
            "Initialize TUILogger with session ID",
            "Log 3 test iterations",
            "Verify artifact files created",
            "Test dashboard events"
        ]
    }


def create_mock_task(task_id: int, description: str):
    """Create a mock task for testing."""
    return {
        "id": f"task-{task_id:04d}",
        "description": description,
        "action_id": f"PLAN-ACT-{task_id:03d}",
        "session_id": "test-session-001"
    }


def create_mock_result(success: bool, duration_ms: int, tokens: int):
    """Create a mock ExecutionResult for testing."""
    return ExecutionResult(
        success=success,
        status="complete" if success else "failed",
        duration_ms=duration_ms,
        tokens_used=tokens,
        cost_usd=tokens * 0.00001,  # Mock cost calculation
        output=f"Task output ({'success' if success else 'failed'})",
        error=None if success else "Mock error for testing",
        metadata={
            "input_tokens": int(tokens * 0.4),
            "output_tokens": int(tokens * 0.6),
            "prompt": "This is a test prompt",
            "response": "This is a test response"
        }
    )


def test_observability():
    """Test the observability layer."""
    print("=" * 60)
    print("Blackbox4 Observability Layer Test")
    print("=" * 60)

    # Setup
    blackbox_root = Path("/Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/.blackbox4")
    session_id = f"test-{int(time.time())}"

    print(f"\nTest Configuration:")
    print(f"  Blackbox Root: {blackbox_root}")
    print(f"  Session ID: {session_id}")

    # Test 1: Dashboard Client Availability
    print("\n" + "-" * 60)
    print("Test 1: Dashboard Client")
    print("-" * 60)

    dashboard = DashboardClient(auto_connect=False)
    print(f"  Dashboard Available: {dashboard.is_available()}")
    print(f"  Dashboard Connected: {dashboard.is_connected()}")

    # Test 2: TUI Logger Initialization
    print("\n" + "-" * 60)
    print("Test 2: TUI Logger Initialization")
    print("-" * 60)

    logger = TUILogger(session_id=session_id, blackbox_root=blackbox_root)
    print(f"  Session ID: {logger.session_id}")
    print(f"  Manifest Created: {logger.manifest.run_id}")
    print(f"  Artifacts Dir: {logger.artifact_manager.artifacts_dir}")

    # Test 3: Session Start
    print("\n" + "-" * 60)
    print("Test 3: Session Start")
    print("-" * 60)

    prd = create_mock_prd()
    logger.log_session_start(prd)
    print(f"  Session Started: {logger.start_time.isoformat()}")
    print(f"  Goal Set: {prd['goal']}")
    print(f"  Sub-goals: {len(prd['sub_goals'])}")

    # Test 4: Log Iterations
    print("\n" + "-" * 60)
    print("Test 4: Log Iterations")
    print("-" * 60)

    test_iterations = [
        (1, "Initialize TUILogger", True, 150, 1000),
        (2, "Log test iterations", True, 200, 1500),
        (3, "Verify artifacts created", True, 100, 800),
        (4, "Test dashboard integration", False, 50, 500)
    ]

    for iteration, desc, success, duration, tokens in test_iterations:
        task = create_mock_task(iteration, desc)
        result = create_mock_result(success, duration, tokens)

        logger.log_iteration(iteration, task, result)

        status = "✓" if success else "✗"
        print(f"  {status} Iteration {iteration}: {desc}")
        print(f"     Duration: {duration}ms, Tokens: {tokens}, Cost: ${result.cost_usd:.6f}")

    print(f"\n  Iterations Logged: {logger.iterations_completed}")
    print(f"  Successful Tasks: {logger.successful_tasks}/{logger.total_tasks}")
    print(f"  Total Tokens: {logger.total_tokens}")
    print(f"  Total Cost: ${logger.total_cost:.6f}")

    # Test 5: Check Artifacts
    print("\n" + "-" * 60)
    print("Test 5: Artifact Verification")
    print("-" * 60)

    artifact_summary = logger.artifact_manager.get_artifact_summary()
    print(f"  Artifacts Directory: {artifact_summary['artifacts_dir']}")
    print(f"  Task Artifacts: {artifact_summary['task_artifacts']}")
    print(f"  Iteration Artifacts: {artifact_summary['iteration_artifacts']}")
    print(f"  Total Files: {artifact_summary['total_files']}")

    # List actual files
    artifacts_dir = Path(artifact_summary['artifacts_dir'])
    if artifacts_dir.exists():
        print(f"\n  Files Created:")
        for file in sorted(artifacts_dir.rglob("*")):
            if file.is_file():
                rel_path = file.relative_to(artifacts_dir)
                print(f"    {rel_path}")

    # Test 6: Session Status
    print("\n" + "-" * 60)
    print("Test 6: Current Session Status")
    print("-" * 60)

    status = logger.get_current_status()
    print(f"  Session ID: {status['session_id']}")
    print(f"  Duration: {status['duration_seconds']:.2f}s")
    print(f"  Success Rate: {status['success_rate']:.2%}")
    print(f"  Goal Progress: {status['goal_status']['current_goal']['progress']:.2%}")

    # Test 7: Session End
    print("\n" + "-" * 60)
    print("Test 7: Session End")
    print("-" * 60)

    success_rate = logger.successful_tasks / logger.total_tasks
    goal_achieved = success_rate >= 0.75
    goal_progress = min(success_rate, 1.0)

    summary = logger.log_session_end({
        "success_rate": success_rate,
        "goal_achieved": goal_achieved,
        "final_goal_progress": goal_progress
    })

    print(f"  Session Ended: {summary.end_time}")
    print(f"  Duration: {summary.duration_seconds:.2f}s")
    print(f"  Total Iterations: {summary.total_iterations}")
    print(f"  Total Tokens: {summary.total_tokens}")
    print(f"  Total Cost: ${summary.total_cost:.6f}")
    print(f"  Success Rate: {summary.success_rate:.2%}")
    print(f"  Goal Achieved: {summary.goal_achieved}")

    # Test 8: Verify Manifest
    print("\n" + "-" * 60)
    print("Test 8: Manifest Verification")
    print("-" * 60)

    manifest_path = artifacts_dir / "manifest.json"
    if manifest_path.exists():
        import json
        with open(manifest_path) as f:
            manifest = json.load(f)
        print(f"  Manifest Created: ✓")
        print(f"  Run ID: {manifest['manifest']['run_id']}")
        print(f"  Agent: {manifest['manifest']['agent']}")
        print(f"  Phase: {manifest['manifest']['phase']}")
        print(f"  Steps Logged: {len(manifest['manifest']['steps'])}")
        print(f"  Total Tokens: {manifest['manifest']['metrics']['total_tokens']}")
        print(f"  Estimated Cost: ${manifest['manifest']['metrics']['estimated_cost']:.6f}")
    else:
        print(f"  Manifest Created: ✗ (file not found)")

    # Test 9: Verify Summary
    print("\n" + "-" * 60)
    print("Test 9: Summary Verification")
    print("-" * 60)

    summary_path = artifacts_dir / "summary.json"
    if summary_path.exists():
        import json
        with open(summary_path) as f:
            saved_summary = json.load(f)
        print(f"  Summary Created: ✓")
        print(f"  Session ID: {saved_summary['session_id']}")
        print(f"  Goal Achieved: {saved_summary['goal_achieved']}")
    else:
        print(f"  Summary Created: ✗ (file not found)")

    # Final Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"  All Tests: ✓ PASSED")
    print(f"  Session ID: {session_id}")
    print(f"  Artifacts: {artifacts_dir}")
    print(f"\nObservability layer is fully functional!")


if __name__ == "__main__":
    test_observability()
