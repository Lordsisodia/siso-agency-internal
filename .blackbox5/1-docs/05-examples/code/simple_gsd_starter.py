#!/usr/bin/env python3
"""
SIMPLE GSD STARTER GUIDE
=========================

This is the simplest way to start using GSD with BlackBox5.

Copy this code and modify for your needs.
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "engine"))

from core.Orchestrator import AgentOrchestrator, WorkflowStep


async def main():
    """
    SIMPLE GSD WORKFLOW EXAMPLE

    This shows you exactly how to use GSD in 3 steps:
    1. Create orchestrator with GSD enabled
    2. Define tasks with dependencies
    3. Execute with wave-based parallelization
    """

    print("\n" + "="*70)
    print("🚀 SIMPLE GSD STARTER GUIDE")
    print("="*70 + "\n")

    # ============================================================
    # STEP 1: CREATE ORCHESTRATOR WITH GSD FEATURES
    # ============================================================

    print("Step 1: Creating orchestrator with GSD features...\n")

    orchestrator = AgentOrchestrator(
        memory_base_path=Path(".blackbox5/my_gsd_workspace"),
        enable_checkpoints=True,           # Enable crash recovery
        enable_atomic_commits=True,         # Enable automatic commits
        enable_state_management=True        # Enable STATE.md progress tracking
    )

    print("✅ Orchestrator created with:")
    print("   - Checkpoint protocol (crash recovery)")
    print("   - Atomic commits (per-task git commits)")
    print("   - STATE.md management (human progress)")

    # ============================================================
    # STEP 2: DEFINE YOUR TASKS WITH DEPENDENCIES
    # ============================================================

    print("\nStep 2: Defining tasks with dependencies...\n")

    tasks = [
        # WAVE 1: Independent tasks (run in parallel)
        WorkflowStep(
            agent_type="developer",
            task="Setup database schema",
            agent_id="task_db",
            depends_on=[]  # Empty = runs first
        ),
        WorkflowStep(
            agent_type="developer",
            task="Design UI mockups",
            agent_id="task_ui",
            depends_on=[]  # Empty = runs first (parallel with task_db)
        ),

        # WAVE 2: Depends on Wave 1
        WorkflowStep(
            agent_type="developer",
            task="Implement user model",
            agent_id="task_user_model",
            depends_on=["task_db"]  # Waits for task_db
        ),

        # WAVE 3: Depends on Wave 2
        WorkflowStep(
            agent_type="tester",
            task="Write integration tests",
            agent_id="task_tests",
            depends_on=["task_user_model"]  # Waits for user model
        ),
    ]

    print("✅ Created 4 tasks with dependencies:")
    print("   Wave 1: [task_db, task_ui] → parallel execution")
    print("   Wave 2: [task_user_model] → waits for task_db")
    print("   Wave 3: [task_tests] → waits for task_user_model")

    # ============================================================
    # STEP 3: EXECUTE WITH WAVE-BASED PARALLELIZATION
    # ============================================================

    print("\nStep 3: Executing with wave-based parallelization...\n")

    result = await orchestrator.execute_wave_based(
        tasks=tasks,
        workflow_id="my_first_gsd_workflow"
    )

    # ============================================================
    # RESULTS
    # ============================================================

    print("\n" + "="*70)
    print("✅ WORKFLOW COMPLETED!")
    print("="*70 + "\n")

    print(f"Tasks completed: {result.steps_completed}/{result.steps_total}")
    print(f"Waves executed: {result.waves_completed}")
    print(f"Duration: {(result.completed_at - result.started_at).total_seconds():.1f}s")

    print("\n🌊 Wave execution details:")
    for i, wave in enumerate(result.wave_details, 1):
        print(f"   Wave {i}: {wave.success_count} succeeded, {wave.failure_count} failed")

    # Show STATE.md
    state_file = Path(".blackbox5/my_gsd_workspace/STATE.md")
    if state_file.exists():
        print(f"\n📄 Progress saved to: {state_file}")
        print("\n--- STATE.md Contents ---")
        print(state_file.read_text())
        print("--- End of STATE.md ---")

    # ============================================================
    # SUMMARY: HOW TO USE GSD
    # ============================================================

    print("\n" + "="*70)
    print("📚 SUMMARY: HOW TO USE GSD")
    print("="*70 + "\n")

    print("1️⃣  Create orchestrator with GSD features:")
    print("   ```python")
    print("   orchestrator = AgentOrchestrator(")
    print("       enable_checkpoints=True,")
    print("       enable_atomic_commits=True,")
    print("       enable_state_management=True")
    print("   )")
    print("   ```")

    print("\n2️⃣  Define tasks with dependencies using `depends_on`:")
    print("   ```python")
    print("   tasks = [")
    print("       WorkflowStep(agent_type='developer', task='Task 1',")
    print("                   agent_id='t1', depends_on=[]),")
    print("       WorkflowStep(agent_type='developer', task='Task 2',")
    print("                   agent_id='t2', depends_on=['t1']),")
    print("   ]")
    print("   ```")

    print("\n3️⃣  Execute with wave-based parallelization:")
    print("   ```python")
    print("   result = await orchestrator.execute_wave_based(tasks)")
    print("   ```")

    print("\n💡 KEY POINTS:")
    print("   - Empty `depends_on` = Wave 1 (runs first)")
    print("   - `depends_on=['t1']` = Wave 2 (waits for t1)")
    print("   - Orchestrator auto-organizes into waves")
    print("   - Tasks within a wave run in PARALLEL")

    print("\n🚀 BENEFITS:")
    print("   - 10x faster execution (parallelization)")
    print("   - Never lose work (checkpoints + commits)")
    print("   - Human-readable progress (STATE.md)")

    print("\n📁 FILES CREATED:")
    print(f"   - {state_file}")
    print(f"   - .blackbox5/my_gsd_workspace/checkpoints/")

    print("\n" + "="*70 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
