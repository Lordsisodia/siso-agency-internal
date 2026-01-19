#!/usr/bin/env python3
"""
HOW TO USE GSD WITH BLACKBOX5 AGENTS
=====================================

This guide shows you exactly how to use the GSD framework with your
existing BlackBox5 agents to get 10x faster parallel execution.

There are 3 ways to use GSD:
1. Quick Start - Use the orchestrator directly
2. Integration - Hook into your existing agent workflow
3. Advanced - Build custom GSD-powered workflows
"""

import asyncio
import sys
from pathlib import Path

# Add engine to path
sys.path.insert(0, str(Path(__file__).parent.parent / "engine"))

from core.Orchestrator import AgentOrchestrator, WorkflowStep


# =============================================================================
# METHOD 1: QUICK START - Use Orchestrator Directly
# =============================================================================

async def quick_start_example():
    """
    Simplest way to use GSD - just define tasks and run.
    """

    print("\n" + "="*80)
    print("METHOD 1: QUICK START - Direct Orchestrator Usage")
    print("="*80 + "\n")

    # Step 1: Create orchestrator with GSD features
    orchestrator = AgentOrchestrator(
        memory_base_path=Path(".blackbox5/gsd_examples/quick_start"),
        enable_checkpoints=True,           # Save state after each wave
        enable_atomic_commits=True,         # Commit after each task
        enable_state_management=True        # Update STATE.md
    )

    # Step 2: Define your tasks with dependencies
    # The depends_on list creates the wave structure automatically
    tasks = [
        # Wave 1: Independent tasks (run in parallel)
        WorkflowStep(
            agent_type="developer",
            task="Setup database schema",
            agent_id="task_db",
            depends_on=[]  # No dependencies = Wave 1
        ),
        WorkflowStep(
            agent_type="developer",
            task="Create UI mockups",
            agent_id="task_ui",
            depends_on=[]  # No dependencies = Wave 1
        ),

        # Wave 2: Depends on Wave 1 tasks
        WorkflowStep(
            agent_type="developer",
            task="Implement user model",
            agent_id="task_user_model",
            depends_on=["task_db"]  # Waits for task_db = Wave 2
        ),

        # Wave 3: Depends on Wave 2
        WorkflowStep(
            agent_type="tester",
            task="Write integration tests",
            agent_id="task_tests",
            depends_on=["task_user_model"]  # Waits for user model = Wave 3
        ),
    ]

    # Step 3: Execute with wave-based parallelization
    print("🚀 Starting workflow with wave-based execution...\n")
    result = await orchestrator.execute_wave_based(
        tasks=tasks,
        workflow_id="quick_start_example"
    )

    # Step 4: Check results
    print(f"\n✅ Workflow completed!")
    print(f"  - Tasks: {result.steps_completed}/{result.steps_total}")
    print(f"  - Waves: {result.waves_completed}")
    print(f"  - Time: {(result.completed_at - result.started_at).total_seconds():.1f}s")

    # Step 5: View STATE.md for human-readable progress
    state_file = Path(".blackbox5/gsd_examples/quick_start/STATE.md")
    if state_file.exists():
        print(f"\n📄 Progress saved to: {state_file}")
        print("\n" + state_file.read_text())


# =============================================================================
# METHOD 2: INTEGRATION - Use With Your Existing Agents
# =============================================================================

async def integration_example():
    """
    Use GSD with your existing BlackBox5 agent classes.
    """

    print("\n" + "="*80)
    print("METHOD 2: INTEGRATION - With Existing Agent Classes")
    print("="*80 + "\n")

    # Import your existing agents
    try:
        from agents.agents.DeveloperAgent import DeveloperAgent
        from agents.agents.ArchitectAgent import ArchitectAgent
        from agents.agents.AnalystAgent import AnalystAgent
    except ImportError as e:
        print(f"⚠️  Agent import failed: {e}")
        print("    Using generic agent types instead...\n")
        # Fall back to generic types
        DeveloperAgent = None
        ArchitectAgent = None
        AnalystAgent = None

    orchestrator = AgentOrchestrator(
        memory_base_path=Path(".blackbox5/gsd_examples/integration"),
        enable_checkpoints=True,
        enable_state_management=True
    )

    # Define tasks using your agent types
    tasks = [
        # Planning phase (Wave 1)
        WorkflowStep(
            agent_type="architect",  # or ArchitectAgent if available
            task="Design system architecture",
            agent_id="task_arch",
            depends_on=[],
            metadata={"priority": "urgent", "tags": ["planning"]}
        ),
        WorkflowStep(
            agent_type="analyst",  # or AnalystAgent if available
            task="Analyze requirements",
            agent_id="task_analysis",
            depends_on=[],
            metadata={"priority": "urgent", "tags": ["planning"]}
        ),

        # Implementation phase (Wave 2)
        WorkflowStep(
            agent_type="developer",  # or DeveloperAgent if available
            task="Implement core features",
            agent_id="task_impl",
            depends_on=["task_arch", "task_analysis"],  # Wait for both
            metadata={"priority": "high", "tags": ["implementation"]}
        ),

        # Testing phase (Wave 3)
        WorkflowStep(
            agent_type="tester",
            task="Write and run tests",
            agent_id="task_test",
            depends_on=["task_impl"],
            metadata={"priority": "medium", "tags": ["testing"]}
        ),
    ]

    print("🚀 Running workflow with custom agents...\n")
    result = await orchestrator.execute_wave_based(
        tasks=tasks,
        workflow_id="integration_example"
    )

    print(f"\n✅ Completed {result.steps_completed} tasks in {result.waves_completed} waves")


# =============================================================================
# METHOD 3: ADVANCED - Custom GSD Workflow
# =============================================================================

async def advanced_example():
    """
    Build a complete GSD-powered workflow with all features.
    """

    print("\n" + "="*80)
    print("METHOD 3: ADVANCED - Full GSD Workflow")
    print("="*80 + "\n")

    from core.todo_manager import TodoManager
    from core.context_extractor import ContextExtractor
    from core.anti_pattern_detector import AntiPatternDetector

    # Step 1: Capture ideas with Todo Manager
    print("📝 Step 1: Capturing ideas...")
    todo_manager = TodoManager(
        storage_path=".blackbox5/gsd_examples/advanced/todos.json"
    )

    todo_manager.quick_add(
        "Build user authentication system",
        priority="urgent",
        tags=["feature", "security"]
    )

    # Step 2: Scan for code quality issues
    print("🔍 Step 2: Scanning for anti-patterns...")
    detector = AntiPatternDetector()
    violations = detector.scan(
        Path.cwd(),
        file_patterns=['*.py']
    )
    print(f"  Found {len(violations)} code quality issues")

    # Step 3: Extract context for planning
    print("📚 Step 3: Extracting context...")
    context_extractor = ContextExtractor(
        codebase_path=Path.cwd(),
        max_context_tokens=5000
    )

    context = await context_extractor.extract_context(
        task_id="adv-001",
        task_description="Build authentication with database and API"
    )
    print(f"  Extracted {context.total_tokens} tokens of relevant context")

    # Step 4: Build workflow with dependencies
    print("\n🌊 Step 4: Building workflow...")

    tasks = [
        # Wave 1: Research & Planning
        WorkflowStep(
            agent_type="analyst",
            task="Research authentication best practices",
            agent_id="task_research",
            depends_on=[]
        ),
        WorkflowStep(
            agent_type="architect",
            task="Design authentication architecture",
            agent_id="task_arch_design",
            depends_on=[]
        ),

        # Wave 2: Foundation
        WorkflowStep(
            agent_type="developer",
            task="Setup database schema",
            agent_id="task_db_schema",
            depends_on=["task_arch_design"]
        ),

        # Wave 3: Implementation
        WorkflowStep(
            agent_type="developer",
            task="Implement authentication API",
            agent_id="task_api",
            depends_on=["task_db_schema", "task_research"]
        ),
        WorkflowStep(
            agent_type="developer",
            task="Build frontend login form",
            agent_id="task_frontend",
            depends_on=["task_api"]
        ),

        # Wave 4: Testing & Docs
        WorkflowStep(
            agent_type="tester",
            task="Write integration tests",
            agent_id="task_tests",
            depends_on=["task_api", "task_frontend"]
        ),
        WorkflowStep(
            agent_type="developer",
            task="Write API documentation",
            agent_id="task_docs",
            depends_on=["task_api"]
        ),
    ]

    # Step 5: Execute with full GSD features
    print("\n🚀 Step 5: Executing with full GSD features...\n")

    orchestrator = AgentOrchestrator(
        memory_base_path=Path(".blackbox5/gsd_examples/advanced"),
        enable_checkpoints=True,
        checkpoint_frequency=1,      # Save after every wave
        checkpoint_retention=5,      # Keep last 5 checkpoints
        enable_atomic_commits=True,
        enable_state_management=True
    )

    result = await orchestrator.execute_wave_based(
        tasks=tasks,
        workflow_id="advanced_workflow"
    )

    # Step 6: Show results
    print(f"\n✅ Workflow completed!")
    print(f"  - Tasks: {result.steps_completed}/{result.steps_total}")
    print(f"  - Waves: {result.waves_completed}")

    print("\n🌊 Wave breakdown:")
    for i, wave in enumerate(result.wave_details, 1):
        print(f"  Wave {i}: {wave.success_count} succeeded, {wave.failure_count} failed")

    # Step 7: Show artifacts
    print("\n📁 Artifacts created:")
    print(f"  - STATE.md: .blackbox5/gsd_examples/advanced/STATE.md")
    print(f"  - Checkpoints: .blackbox5/gsd_examples/advanced/checkpoints/")
    print(f"  - Todos: .blackbox5/gsd_examples/advanced/todos.json")


# =============================================================================
# CRASH RECOVERY EXAMPLE
# =============================================================================

async def crash_recovery_example():
    """
    Demonstrate checkpoint-based crash recovery.
    """

    print("\n" + "="*80)
    print("CRASH RECOVERY: Resume from Checkpoint")
    print("="*80 + "\n")

    orchestrator = AgentOrchestrator(
        memory_base_path=Path(".blackbox5/gsd_examples/recovery"),
        enable_checkpoints=True
    )

    # Simulate a workflow that might crash
    tasks = [
        WorkflowStep(agent_type="developer", task="Task 1", agent_id="t1", depends_on=[]),
        WorkflowStep(agent_type="developer", task="Task 2", agent_id="t2", depends_on=["t1"]),
        WorkflowStep(agent_type="developer", task="Task 3", agent_id="t3", depends_on=["t2"]),
    ]

    # Run workflow (saves checkpoints automatically)
    result = await orchestrator.execute_wave_based(
        tasks=tasks,
        workflow_id="recovery_example"
    )

    # List available checkpoints
    import os
    checkpoint_dir = Path(".blackbox5/gsd_examples/recovery/checkpoints")
    if checkpoint_dir.exists():
        checkpoints = list(checkpoint_dir.glob("*.json"))
        print(f"\n💾 Saved {len(checkpoints)} checkpoints:")
        for cp in checkpoints:
            print(f"  - {cp.stem}")

    # To resume from a crash:
    print("\n📝 To resume from a crash:")
    print("  1. Find checkpoint ID from checkpoint dir")
    print("  2. Load checkpoint: orchestrator.load_checkpoint(checkpoint_id)")
    print("  3. Resume: orchestrator.resume_workflow(checkpoint_id, remaining_tasks)")


# =============================================================================
# MAIN MENU
# =============================================================================

async def main():
    """Run all examples."""

    print("\n" + "="*80)
    print("🚀 BLACKBOX5 GSD USAGE EXAMPLES")
    print("="*80)

    print("\nThis guide shows you 3 ways to use GSD:")
    print("  1. Quick Start - Use orchestrator directly (simplest)")
    print("  2. Integration - Use with your existing agents")
    print("  3. Advanced - Full GSD workflow with all features")
    print("  4. Crash Recovery - Resume from checkpoints")

    # Run examples
    await quick_start_example()
    await integration_example()
    await advanced_example()
    await crash_recovery_example()

    print("\n" + "="*80)
    print("📚 SUMMARY: How to Use GSD")
    print("="*80 + "\n")

    print("1️⃣  QUICK START (Easiest):")
    print("   ```python")
    print("   from core.Orchestrator import AgentOrchestrator, WorkflowStep")
    print()
    print("   orchestrator = AgentOrchestrator(")
    print("       enable_checkpoints=True,")
    print("       enable_atomic_commits=True,")
    print("       enable_state_management=True")
    print("   )")
    print()
    print("   tasks = [")
    print("       WorkflowStep(agent_type='developer', task='Task 1',")
    print("                   agent_id='t1', depends_on=[]),")
    print("       WorkflowStep(agent_type='developer', task='Task 2',")
    print("                   agent_id='t2', depends_on=['t1']),")
    print("   ]")
    print()
    print("   result = await orchestrator.execute_wave_based(tasks)")
    print("   ```")

    print("\n2️⃣  KEY POINT: Use `depends_on` to define dependencies")
    print("   - Empty depends_on = Wave 1 (runs first)")
    print("   - depends_on=['t1'] = Wave 2 (waits for t1)")
    print("   - Orchestrator automatically organizes into waves")

    print("\n3️⃣  BENEFITS:")
    print("   - 10x faster (parallel execution)")
    print("   - Never lose work (checkpoints + commits)")
    print("   - Human progress tracking (STATE.md)")
    print("   - Autonomous error recovery")

    print("\n4️⃣  FILES CREATED:")
    print("   - STATE.md - Human-readable progress")
    print("   - checkpoints/ - Crash recovery state")
    print("   - commits/ - Atomic git commits")

    print("\n" + "="*80 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
