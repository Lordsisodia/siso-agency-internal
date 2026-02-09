#!/usr/bin/env python3
"""
Blackbox4 Intelligence Layer - Quick Start Example
Demonstrates basic usage of the intelligent task routing system
"""

import sys
from pathlib import Path

# Add runtime to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from intelligence import (
    TaskRouter,
    DependencyResolver,
    ContextAwareRouter,
    ExecutionContext,
    Task,
    TaskPriority,
    TaskComplexity,
)


def main():
    """Demonstrate basic intelligence layer usage"""

    print("=" * 80)
    print("Blackbox4 Intelligence Layer - Quick Start")
    print("=" * 80)

    # ============================================================
    # Example 1: Create tasks with dependencies
    # ============================================================
    print("\n### Example 1: Creating tasks with dependencies ###\n")

    tasks = [
        Task(
            id="setup",
            title="Setup Project",
            description="Initialize project structure",
            priority=TaskPriority.CRITICAL,
            complexity="simple",
        ),
        Task(
            id="api",
            title="Build API",
            description="Create REST API endpoints",
            priority=TaskPriority.HIGH,
            complexity="medium",
            depends_on=["setup"],
            domain="backend",
        ),
        Task(
            id="ui",
            title="Build UI",
            description="Create user interface",
            priority=TaskPriority.HIGH,
            complexity="complex",
            depends_on=["setup"],
            domain="frontend",
        ),
        Task(
            id="tests",
            title="Write Tests",
            description="Create test suite",
            priority=TaskPriority.MEDIUM,
            complexity="medium",
            depends_on=["api", "ui"],
            domain="testing",
        ),
        Task(
            id="docs",
            title="Write Docs",
            description="Create documentation",
            priority=TaskPriority.LOW,
            complexity="simple",
            depends_on=["api"],
            domain="documentation",
        ),
    ]

    print(f"Created {len(tasks)} tasks with dependencies")

    # ============================================================
    # Example 2: Resolve dependencies
    # ============================================================
    print("\n### Example 2: Resolving dependencies ###\n")

    resolver = DependencyResolver()
    graph = resolver.resolve(tasks)

    print("Execution order:")
    order = resolver.get_execution_order(tasks)
    for i, task_id in enumerate(order, 1):
        print(f"  {i}. {task_id}")

    # ============================================================
    # Example 3: Select tasks intelligently
    # ============================================================
    print("\n### Example 3: Intelligent task selection ###\n")

    router = TaskRouter()

    print("Task ranking:")
    ranked = router.context_router.rank_tasks(tasks)
    for i, (task, score) in enumerate(ranked, 1):
        print(f"  {i}. {task.id} (score: {score:.3f})")

    # ============================================================
    # Example 4: Route to agents
    # ============================================================
    print("\n### Example 4: Agent routing ###\n")

    print("Agent assignments:")
    for task in tasks:
        agent = router.route_to_agent(task)
        print(f"  {task.id} -> {agent}")

    # ============================================================
    # Example 5: Autonomous execution loop
    # ============================================================
    print("\n### Example 5: Autonomous execution loop ###\n")

    completed = []
    iteration = 0

    while len(completed) < len(tasks):
        iteration += 1
        print(f"\nIteration {iteration}:")

        # Select next task
        task = router.select_next_task(tasks)

        if task is None:
            print("  No more tasks ready")
            break

        # Route to agent
        agent = router.route_to_agent(task)

        print(f"  Executing: {task.title}")
        print(f"  Agent: {agent}")
        print(f"  Priority: {task.priority_level}")

        # Simulate execution
        success = True
        duration = 5.0

        # Update router
        router.update_after_execution(
            task_id=task.id,
            agent_id=agent,
            success=success,
            duration=duration,
            domain=task.domain
        )

        # Mark as completed
        task.status = "completed"
        completed.append(task.id)

    print(f"\n✅ Completed {len(completed)} tasks in {iteration} iterations")

    # ============================================================
    # Example 6: Context-aware routing
    # ============================================================
    print("\n### Example 6: Context-aware routing ###\n")

    # Create context with failures
    context = ExecutionContext()
    context.recent_failures_by_domain = {'frontend': 3}

    # Create router with context
    context_router = TaskRouter(context=context)

    # Score frontend vs backend tasks
    frontend_task = Task(
        id="ui-fix",
        title="Fix UI Bug",
        description="Fix critical UI bug",
        domain="frontend",
        priority=TaskPriority.HIGH,
        complexity="simple"
    )

    backend_task = Task(
        id="api-fix",
        title="Fix API Bug",
        description="Fix critical API bug",
        domain="backend",
        priority=TaskPriority.HIGH,
        complexity="simple"
    )

    frontend_score = context_router.context_router.score_task(frontend_task)
    backend_score = context_router.context_router.score_task(backend_task)

    print("Task scores with frontend failures:")
    print(f"  Frontend task: {frontend_score:.3f}")
    print(f"  Backend task: {backend_score:.3f}")
    print(f"  -> Backend task prioritized (frontend has recent failures)")

    print("\n" + "=" * 80)
    print("Quick Start Complete!")
    print("=" * 80)

    print("\nNext steps:")
    print("  - Read the full README.md for detailed documentation")
    print("  - Run tests/test_intelligence.py for comprehensive examples")
    print("  - Integrate TaskRouter into your autonomous agent loops")


if __name__ == "__main__":
    main()
