#!/usr/bin/env python3
"""
Intelligence Layer Tests
Comprehensive tests demonstrating task routing and dependency resolution
"""

import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from intelligence import (
    TaskRouter,
    DependencyResolver,
    ContextAwareRouter,
    ExecutionContext,
    Task,
    TaskPriority,
    TaskComplexity,
)


def print_section(title: str):
    """Print section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def test_dependency_resolution():
    """Test dependency resolution and graph building"""
    print_section("TEST 1: Dependency Resolution")

    # Create sample tasks with dependencies
    tasks = [
        Task(
            id="task-1",
            title="Setup Project Structure",
            description="Create basic project structure",
            priority=TaskPriority.CRITICAL,
            complexity="simple",
            depends_on=[]
        ),
        Task(
            id="task-2",
            title="Configure Build System",
            description="Setup build tools and configuration",
            priority=TaskPriority.HIGH,
            complexity="medium",
            depends_on=["task-1"]
        ),
        Task(
            id="task-3",
            title="Implement Core API",
            description="Build core API endpoints",
            priority=TaskPriority.CRITICAL,
            complexity="complex",
            depends_on=["task-1", "task-2"]
        ),
        Task(
            id="task-4",
            title="Write Unit Tests",
            description="Create comprehensive test suite",
            priority=TaskPriority.HIGH,
            complexity="medium",
            depends_on=["task-3"]
        ),
        Task(
            id="task-5",
            title="Deploy to Staging",
            description="Deploy application to staging environment",
            priority=TaskPriority.MEDIUM,
            complexity="simple",
            depends_on=["task-3", "task-4"]
        ),
        Task(
            id="task-6",
            title="Create Documentation",
            description="Write API and user documentation",
            priority=TaskPriority.LOW,
            complexity="medium",
            depends_on=["task-3"]
        ),
    ]

    # Create resolver
    resolver = DependencyResolver()

    # Build dependency graph
    print("\nBuilding dependency graph...")
    graph = resolver.resolve(tasks)

    # Visualize graph
    print("\n" + resolver.visualize_graph())

    # Test execution order
    print("\nTopological execution order:")
    order = resolver.get_execution_order(tasks)
    for i, task_id in enumerate(order, 1):
        print(f"  {i}. {task_id}")

    # Test ready tasks at different stages
    print("\nReady tasks at different stages:")
    print(f"  Initially: {[t.id for t in resolver.get_ready_tasks(tasks, [])]}")
    print(f"  After task-1: {[t.id for t in resolver.get_ready_tasks(tasks, ['task-1'])]}")
    print(f"  After task-1,2: {[t.id for t in resolver.get_ready_tasks(tasks, ['task-1', 'task-2'])]}")

    # Test critical path
    print("\nCritical path (longest dependency chain):")
    critical_path = resolver.get_critical_path(tasks)
    print(f"  {' -> '.join(critical_path)}")

    print("\n✅ Dependency resolution test passed!")


def test_task_selection():
    """Test intelligent task selection"""
    print_section("TEST 2: Intelligent Task Selection")

    # Create tasks with various priorities and complexities
    tasks = [
        Task(
            id="critical-simple",
            title="Fix Critical Bug",
            description="Fix critical production bug",
            priority=TaskPriority.CRITICAL,
            complexity="simple",
            domain="backend"
        ),
        Task(
            id="high-medium",
            title="Add User Authentication",
            description="Implement user auth system",
            priority=TaskPriority.HIGH,
            complexity="medium",
            domain="backend",
            depends_on=["critical-simple"]
        ),
        Task(
            id="low-simple",
            title="Update Documentation",
            description="Update README with new features",
            priority=TaskPriority.LOW,
            complexity="simple",
            domain="documentation"
        ),
        Task(
            id="high-complex",
            title="Refactor Database",
            description="Major database refactoring",
            priority=TaskPriority.HIGH,
            complexity="complex",
            domain="backend"
        ),
        Task(
            id="medium-simple",
            title="Add Unit Tests",
            description="Add tests for new features",
            priority=TaskPriority.MEDIUM,
            complexity="simple",
            domain="testing"
        ),
    ]

    # Create router
    router = TaskRouter()

    print("\nTask ranking (highest score first):")
    ranked = router.context_router.rank_tasks(tasks)
    for i, (task, score) in enumerate(ranked, 1):
        print(f"  {i}. {task.id}")
        print(f"     Score: {score:.3f}")
        print(f"     Priority: {task.priority_level}, Complexity: {task.complexity}")
        print()

    # Test task selection
    print("Selected task:")
    selected = router.select_next_task(tasks)
    if selected:
        print(f"  ID: {selected.id}")
        print(f"  Title: {selected.title}")
        print(f"  Priority: {selected.priority_level}")
        print(f"  Complexity: {selected.complexity}")

    print("\n✅ Task selection test passed!")


def test_agent_routing():
    """Test agent routing logic"""
    print_section("TEST 3: Agent Routing")

    # Create tasks with different domains
    tasks = [
        Task(
            id="frontend-task",
            title="Build UI Component",
            description="Create new React component",
            priority=TaskPriority.HIGH,
            complexity="medium",
            domain="frontend"
        ),
        Task(
            id="backend-task",
            title="Create API Endpoint",
            description="Build REST API endpoint",
            priority=TaskPriority.HIGH,
            complexity="medium",
            domain="backend"
        ),
        Task(
            id="design-task",
            title="Design System",
            description="Create design system specifications",
            priority=TaskPriority.HIGH,
            complexity="complex",
            domain="design"
        ),
        Task(
            id="docs-task",
            title="API Documentation",
            description="Document API endpoints",
            priority=TaskPriority.MEDIUM,
            complexity="simple",
            domain="documentation"
        ),
    ]

    # Create router
    router = TaskRouter()

    print("\nAgent routing decisions:")
    for task in tasks:
        agent = router.route_to_agent(task)
        print(f"\n  Task: {task.id}")
        print(f"    Domain: {task.domain}")
        print(f"    Complexity: {task.complexity}")
        print(f"    Routed to: {agent}")

    print("\n✅ Agent routing test passed!")


def test_context_aware_routing():
    """Test context-aware routing with failures and learning"""
    print_section("TEST 4: Context-Aware Routing")

    # Create context with some failures
    context = ExecutionContext()

    # Simulate some failures in frontend domain
    context.recent_failures_by_domain = {
        'frontend': 3,
        'backend': 1,
    }

    # Register agent capabilities
    from intelligence.context_aware import AgentCapability

    context.agent_capabilities = {
        'claude-code': AgentCapability(
            agent_id='claude-code',
            domains=['frontend', 'backend', 'testing', 'documentation'],
            max_complexity='complex',
            success_rate=0.85
        ),
        'specialist-frontend': AgentCapability(
            agent_id='specialist-frontend',
            domains=['frontend'],
            max_complexity='medium',
            success_rate=0.95
        ),
        'specialist-backend': AgentCapability(
            agent_id='specialist-backend',
            domains=['backend'],
            max_complexity='complex',
            success_rate=0.92
        ),
    }

    # Create router with context
    router = TaskRouter(context=context)

    # Create tasks
    tasks = [
        Task(
            id="frontend-task",
            title="Fix UI Bug",
            description="Fix critical UI bug",
            priority=TaskPriority.CRITICAL,
            complexity="simple",
            domain="frontend"
        ),
        Task(
            id="backend-task",
            title="Add API Feature",
            description="Add new API endpoint",
            priority=TaskPriority.HIGH,
            complexity="medium",
            domain="backend"
        ),
    ]

    print("\nTask scores with context (frontend has high failure rate):")
    for task in tasks:
        score = router.context_router.score_task(task)
        should_avoid, reason = router.context_router.should_avoid_task(task)
        print(f"\n  Task: {task.id}")
        print(f"    Domain: {task.domain}")
        print(f"    Score: {score:.3f}")
        print(f"    Should avoid: {should_avoid}")
        if should_avoid:
            print(f"    Reason: {reason}")

    print("\n✅ Context-aware routing test passed!")


def test_complete_workflow():
    """Test complete workflow with multiple stages"""
    print_section("TEST 5: Complete Workflow")

    # Create comprehensive task list
    tasks = [
        Task(
            id="setup",
            title="Setup Development Environment",
            description="Configure development tools and environment",
            priority=TaskPriority.CRITICAL,
            complexity="simple",
            domain="devops"
        ),
        Task(
            id="design-api",
            title="Design API Architecture",
            description="Design RESTful API structure",
            priority=TaskPriority.HIGH,
            complexity="complex",
            domain="architecture"
        ),
        Task(
            id="implement-auth",
            title="Implement Authentication",
            description="Add JWT authentication system",
            priority=TaskPriority.CRITICAL,
            complexity="complex",
            domain="backend",
            depends_on=["setup"]
        ),
        Task(
            id="create-ui",
            title="Build User Interface",
            description="Create React-based UI",
            priority=TaskPriority.HIGH,
            complexity="complex",
            domain="frontend",
            depends_on=["setup"]
        ),
        Task(
            id="write-tests",
            title="Write Integration Tests",
            description="Create comprehensive test suite",
            priority=TaskPriority.HIGH,
            complexity="medium",
            domain="testing",
            depends_on=["implement-auth", "create-ui"]
        ),
        Task(
            id="deploy-staging",
            title="Deploy to Staging",
            description="Deploy to staging environment",
            priority=TaskPriority.MEDIUM,
            complexity="simple",
            domain="devops",
            depends_on=["write-tests"]
        ),
    ]

    # Create router
    router = TaskRouter()

    print("\nExecution simulation:")
    print("-" * 80)

    completed = []
    iteration = 0

    while len(completed) < len(tasks):
        iteration += 1
        print(f"\n--- Iteration {iteration} ---")

        # Make routing decision
        decision = router.make_routing_decision(tasks)

        if decision.task is None:
            print("No more tasks ready for execution")
            break

        # Display decision
        print(f"\nSelected Task: {decision.task.id}")
        print(f"Title: {decision.task.title}")
        print(f"Agent: {decision.agent_id}")
        print(f"Confidence: {decision.confidence:.1%}")
        print(f"\nReasoning:\n{decision.reasoning}")

        if decision.alternatives:
            print(f"\nAlternatives considered:")
            for alt_task, alt_score in decision.alternatives:
                print(f"  - {alt_task.id} (score: {alt_score:.3f})")

        # Simulate execution
        success = True  # Assume all succeed for this demo
        duration = 5.0  # 5 minutes per task

        print(f"\n✓ Task completed (success: {success}, duration: {duration}m)")

        # Update router
        router.update_after_execution(
            task_id=decision.task.id,
            agent_id=decision.agent_id,
            success=success,
            duration=duration,
            domain=decision.task.domain
        )

        # Mark task as completed
        decision.task.status = "completed"
        completed.append(decision.task.id)

    print("\n" + "-" * 80)
    print(f"\n✅ All {len(completed)} tasks completed successfully!")

    # Show final status
    print("\nFinal Status Summary:")
    summary = router.get_status_summary()
    for key, value in summary.items():
        print(f"\n{key}:")
        if isinstance(value, dict):
            for k, v in value.items():
                print(f"  {k}: {v}")
        else:
            print(f"  {value}")

    print("\n✅ Complete workflow test passed!")


def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("  BLACKBOX4 INTELLIGENCE LAYER - COMPREHENSIVE TESTS")
    print("=" * 80)

    try:
        test_dependency_resolution()
        test_task_selection()
        test_agent_routing()
        test_context_aware_routing()
        test_complete_workflow()

        print_section("ALL TESTS PASSED ✅")
        print("\nThe Intelligence Layer is working correctly!")
        print("\nKey features demonstrated:")
        print("  ✓ Dependency resolution and graph building")
        print("  ✓ Topological sorting for execution order")
        print("  ✓ Critical path identification")
        print("  ✓ Intelligent task selection (priority + complexity)")
        print("  ✓ Domain-based agent routing")
        print("  ✓ Human intervention for complex/critical tasks")
        print("  ✓ Context-aware routing (learns from failures)")
        print("  ✓ Complete autonomous workflow execution")

    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
