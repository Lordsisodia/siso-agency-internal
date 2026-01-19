#!/usr/bin/env python3
"""
Wave-Based Execution Example

Demonstrates the wave-based execution orchestrator with various dependency patterns.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from engine.core.Orchestrator import (
    AgentOrchestrator,
    WorkflowStep,
)


def print_separator(title: str):
    """Print a section separator."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80 + "\n")


async def example_linear_chain():
    """Example: Linear chain of tasks."""
    print_separator("Example 1: Linear Chain (A → B → C)")

    orchestrator = AgentOrchestrator()

    tasks = [
        WorkflowStep(
            agent_type="developer",
            task="Setup database",
            agent_id="setup_db"
        ),
        WorkflowStep(
            agent_type="developer",
            task="Build API",
            agent_id="build_api",
            depends_on=["setup_db"]
        ),
        WorkflowStep(
            agent_type="tester",
            task="Integration tests",
            agent_id="integration_tests",
            depends_on=["build_api"]
        ),
    ]

    print("Tasks:")
    for task in tasks:
        deps = f" (depends on: {task.depends_on})" if task.depends_on else ""
        print(f"  - {task.agent_id}: {task.task}{deps}")

    result = await orchestrator.execute_wave_based(tasks, workflow_id="linear_chain")

    print(f"\nResult:")
    print(f"  State: {result.state.value}")
    print(f"  Steps: {result.steps_completed}/{result.steps_total}")
    print(f"  Waves: {result.waves_completed}")

    print(f"\nWave Breakdown:")
    for wave in result.wave_details:
        duration = (wave.completed_at - wave.started_at).total_seconds()
        print(f"  Wave {wave.wave_number}: {len(wave.task_ids)} tasks, "
              f"{wave.success_count} succeeded, {duration:.3f}s")
        print(f"    Tasks: {', '.join(wave.task_ids)}")


async def example_diamond_pattern():
    """Example: Diamond pattern with parallel execution."""
    print_separator("Example 2: Diamond Pattern (A → [B,C] → D)")

    orchestrator = AgentOrchestrator()

    tasks = [
        WorkflowStep(
            agent_type="developer",
            task="Setup infrastructure",
            agent_id="setup"
        ),
        WorkflowStep(
            agent_type="developer",
            task="Build frontend",
            agent_id="frontend",
            depends_on=["setup"]
        ),
        WorkflowStep(
            agent_type="developer",
            task="Build backend",
            agent_id="backend",
            depends_on=["setup"]
        ),
        WorkflowStep(
            agent_type="tester",
            task="Integration tests",
            agent_id="integration",
            depends_on=["frontend", "backend"]
        ),
    ]

    print("Tasks:")
    for task in tasks:
        deps = f" (depends on: {', '.join(task.depends_on)})" if task.depends_on else ""
        print(f"  - {task.agent_id}: {task.task}{deps}")

    result = await orchestrator.execute_wave_based(tasks, workflow_id="diamond_pattern")

    print(f"\nResult:")
    print(f"  State: {result.state.value}")
    print(f"  Steps: {result.steps_completed}/{result.steps_total}")
    print(f"  Waves: {result.waves_completed}")

    print(f"\nWave Breakdown:")
    for wave in result.wave_details:
        duration = (wave.completed_at - wave.started_at).total_seconds()
        print(f"  Wave {wave.wave_number}: {len(wave.task_ids)} tasks, "
              f"{wave.success_count} succeeded, {duration:.3f}s")
        print(f"    Tasks: {', '.join(wave.task_ids)}")

    print(f"\n  Speedup: Wave 2 executed 2 tasks in parallel!")


async def example_complex_dag():
    """Example: Complex DAG with multiple levels."""
    print_separator("Example 3: Complex DAG (Multi-Level Dependencies)")

    orchestrator = AgentOrchestrator()

    tasks = [
        WorkflowStep(agent_type="dev", task="Setup DB", agent_id="setup_db"),
        WorkflowStep(agent_type="dev", task="Setup UI Framework", agent_id="setup_ui"),
        WorkflowStep(
            agent_type="dev",
            task="Build User Service",
            agent_id="user_service",
            depends_on=["setup_db"]
        ),
        WorkflowStep(
            agent_type="dev",
            task="Build UI Components",
            agent_id="ui_components",
            depends_on=["setup_ui"]
        ),
        WorkflowStep(
            agent_type="dev",
            task="Build API Gateway",
            agent_id="api_gateway",
            depends_on=["setup_db", "setup_ui"]
        ),
        WorkflowStep(
            agent_type="dev",
            task="Build Frontend Pages",
            agent_id="frontend_pages",
            depends_on=["ui_components"]
        ),
        WorkflowStep(
            agent_type="tester",
            task="E2E Tests",
            agent_id="e2e_tests",
            depends_on=["user_service", "api_gateway", "frontend_pages"]
        ),
    ]

    print("Tasks:")
    for task in tasks:
        deps = f" (depends on: {', '.join(task.depends_on)})" if task.depends_on else ""
        print(f"  - {task.agent_id}: {task.task}{deps}")

    result = await orchestrator.execute_wave_based(tasks, workflow_id="complex_dag")

    print(f"\nResult:")
    print(f"  State: {result.state.value}")
    print(f"  Steps: {result.steps_completed}/{result.steps_total}")
    print(f"  Waves: {result.waves_completed}")

    print(f"\nWave Breakdown:")
    for wave in result.wave_details:
        duration = (wave.completed_at - wave.started_at).total_seconds()
        print(f"  Wave {wave.wave_number}: {len(wave.task_ids)} tasks, "
              f"{wave.success_count} succeeded, {duration:.3f}s")
        print(f"    Tasks: {', '.join(wave.task_ids)}")

    print(f"\n  Sequential would take: 7 steps")
    print(f"  Wave-based took: {result.waves_completed} waves")
    print(f"  Speedup: ~{7/result.waves_completed:.1f}x faster")


async def example_circular_dependency():
    """Example: Circular dependency detection."""
    print_separator("Example 4: Circular Dependency Detection")

    orchestrator = AgentOrchestrator()

    tasks = [
        WorkflowStep(
            agent_type="dev",
            task="Task A",
            agent_id="task_a",
            depends_on=["task_c"]  # Creates cycle
        ),
        WorkflowStep(
            agent_type="dev",
            task="Task B",
            agent_id="task_b",
            depends_on=["task_a"]
        ),
        WorkflowStep(
            agent_type="dev",
            task="Task C",
            agent_id="task_c",
            depends_on=["task_b"]
        ),
    ]

    print("Tasks (with circular dependency):")
    for task in tasks:
        deps = f" (depends on: {', '.join(task.depends_on)})" if task.depends_on else ""
        print(f"  - {task.agent_id}: {task.task}{deps}")

    result = await orchestrator.execute_wave_based(tasks, workflow_id="circular")

    print(f"\nResult:")
    print(f"  State: {result.state.value}")
    print(f"  Error: {result.errors.get('circular_dependency', 'None')}")


async def main():
    """Run all examples."""
    print("\n" + "=" * 80)
    print("  WAVE-BASED EXECUTION ORCHESTRATOR - EXAMPLES")
    print("=" * 80)

    await example_linear_chain()
    await example_diamond_pattern()
    await example_complex_dag()
    await example_circular_dependency()

    print("\n" + "=" * 80)
    print("  All examples completed!")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
