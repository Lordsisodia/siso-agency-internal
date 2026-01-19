#!/usr/bin/env python3
"""
Agent Orchestrator Demo
=======================

Demonstrates the multi-agent orchestration capabilities of BlackBox5.

This example shows:
- Starting agents with unique IDs
- Sequential workflow execution
- Parallel task execution
- Agent memory persistence
- Result aggregation
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "engine"))

from core.Orchestrator import (
    AgentOrchestrator,
    WorkflowStep,
    AgentState,
    WorkflowState,
    create_orchestrator
)


def print_section(title: str):
    """Print a formatted section header."""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def print_subsection(title: str):
    """Print a formatted subsection header."""
    print(f"\n{title}")
    print("-" * len(title))


def demo_basic_agents():
    """Demonstrate basic agent creation and management."""
    print_section("1. Basic Agent Management")

    # Create orchestrator
    orchestrator = create_orchestrator(
        event_bus=None,
        task_router=None,
        memory_base_path=Path(".demo_memory"),
        max_concurrent_agents=5
    )

    # Start multiple agents
    print_subsection("Starting Agents")
    dev1_id = orchestrator.start_agent("developer", task="Build user API")
    print(f"✓ Started agent: {dev1_id}")

    dev2_id = orchestrator.start_agent("developer", task="Build admin API")
    print(f"✓ Started agent: {dev2_id}")

    tester_id = orchestrator.start_agent("tester", task="Write API tests")
    print(f"✓ Started agent: {tester_id}")

    # List all agents
    print_subsection("All Agents")
    agents = orchestrator.list_agents()
    for agent in agents:
        print(f"  • {agent['agent_id']} ({agent['agent_type']}) - {agent['state']}")

    # Filter by type
    print_subsection("Developers Only")
    developers = orchestrator.list_agents(agent_type="developer")
    for dev in developers:
        print(f"  • {dev['agent_id']} - {dev['state']}")

    # Get statistics
    print_subsection("Statistics")
    stats = orchestrator.get_statistics()
    print(f"  Total agents: {stats['total_agents']}")
    print(f"  By type: {stats['agents_by_type']}")
    print(f"  By state: {stats['agents_by_state']}")

    return orchestrator


def demo_sequential_workflow(orchestrator):
    """Demonstrate sequential workflow execution."""
    print_section("2. Sequential Workflow Execution")

    # Define workflow
    workflow = [
        WorkflowStep(
            agent_type="planner",
            task="Create implementation plan for authentication system"
        ),
        WorkflowStep(
            agent_type="developer",
            task="Implement login endpoint"
        ),
        WorkflowStep(
            agent_type="developer",
            task="Implement registration endpoint"
        ),
        WorkflowStep(
            agent_type="tester",
            task="Test authentication flow"
        ),
        WorkflowStep(
            agent_type="reviewer",
            task="Review authentication implementation"
        ),
    ]

    # Execute workflow
    print_subsection("Executing Workflow")
    print("Workflow steps:")
    for i, step in enumerate(workflow, 1):
        print(f"  {i}. {step.agent_type}: {step.task}")

    result = orchestrator.execute_workflow(workflow, workflow_id="auth_workflow")

    # Display results
    print_subsection("Workflow Results")
    print(f"  State: {result.state.value}")
    print(f"  Progress: {result.steps_completed}/{result.steps_total}")
    print(f"  Started: {result.started_at}")
    print(f"  Completed: {result.completed_at}")

    print_subsection("Agent Results")
    for agent_id, agent_result in result.results.items():
        print(f"  • {agent_id}:")
        print(f"    - Status: {agent_result['status']}")
        print(f"    - Output: {agent_result['output']}")


async def demo_parallel_execution(orchestrator):
    """Demonstrate parallel task execution."""
    print_section("3. Parallel Task Execution")

    # Define parallel tasks
    tasks = [
        WorkflowStep(
            agent_type="developer",
            task="Implement user profile feature"
        ),
        WorkflowStep(
            agent_type="developer",
            task="Implement user settings feature"
        ),
        WorkflowStep(
            agent_type="developer",
            task="Implement user notifications feature"
        ),
        WorkflowStep(
            agent_type="tester",
            task="Write integration tests"
        ),
    ]

    print_subsection("Executing Tasks in Parallel")
    print("Tasks:")
    for i, task in enumerate(tasks, 1):
        print(f"  {i}. {task.agent_type}: {task.task}")

    # Execute in parallel
    results = await orchestrator.parallel_execute(tasks)

    # Display results
    print_subsection("Parallel Execution Results")
    successful = sum(1 for r in results if r.success)
    print(f"  Completed: {successful}/{len(results)}")

    print_subsection("Individual Results")
    for result in results:
        status = "✓ SUCCESS" if result.success else "✗ FAILED"
        print(f"  {status} - {result.agent_id} ({result.agent_type})")
        if result.success:
            print(f"    Duration: {result.duration:.3f}s")
            print(f"    Result: {result.result}")
        else:
            print(f"    Error: {result.error}")


def demo_custom_agent_ids(orchestrator):
    """Demonstrate custom agent IDs."""
    print_section("4. Custom Agent IDs")

    # Start agents with custom IDs
    print_subsection("Starting Agents with Custom IDs")

    custom_agents = [
        ("auth_developer", "developer", "Build authentication"),
        ("auth_tester", "tester", "Test authentication"),
        ("auth_reviewer", "reviewer", "Review authentication"),
    ]

    for agent_id, agent_type, task in custom_agents:
        orchestrator.start_agent(
            agent_type=agent_type,
            task=task,
            agent_id=agent_id
        )
        print(f"✓ Started {agent_id}")

    # Verify custom IDs
    print_subsection("Custom ID Agents")
    for agent_id, _, _ in custom_agents:
        status = orchestrator.get_agent_status(agent_id)
        print(f"  • {status['agent_id']}: {status['state']}")


def demo_workflow_with_dependencies():
    """Demonstrate workflow with dependencies."""
    print_section("5. Workflow with Dependencies")

    orchestrator = create_orchestrator(
        memory_base_path=Path(".demo_memory_deps")
    )

    # Define workflow with dependencies
    workflow = [
        WorkflowStep(
            agent_type="researcher",
            task="Research authentication best practices",
            agent_id="auth_researcher"
        ),
        WorkflowStep(
            agent_type="planner",
            task="Create authentication plan based on research",
            agent_id="auth_planner",
            depends_on=["auth_researcher"]
        ),
        WorkflowStep(
            agent_type="developer",
            task="Implement backend authentication",
            agent_id="backend_dev",
            depends_on=["auth_planner"]
        ),
        WorkflowStep(
            agent_type="developer",
            task="Implement frontend authentication",
            agent_id="frontend_dev",
            depends_on=["auth_planner"]
        ),
        WorkflowStep(
            agent_type="tester",
            task="Test full authentication flow",
            agent_id="auth_tester",
            depends_on=["backend_dev", "frontend_dev"]
        ),
    ]

    print_subsection("Workflow with Dependencies")
    print("Workflow:")
    for i, step in enumerate(workflow, 1):
        deps = f" (depends on: {', '.join(step.depends_on)})" if step.depends_on else ""
        print(f"  {i}. {step.agent_type}: {step.task}{deps}")

    result = orchestrator.execute_workflow(workflow)

    print_subsection("Results")
    print(f"  State: {result.state.value}")
    print(f"  Steps: {result.steps_completed}/{result.steps_total}")


def demo_agent_memory():
    """Demonstrate agent memory persistence."""
    print_section("6. Agent Memory Persistence")

    orchestrator = create_orchestrator(
        memory_base_path=Path(".demo_memory_persist")
    )

    # Start agent and add memory
    print_subsection("First Agent Session")
    agent_id = orchestrator.start_agent(
        "developer",
        task="Build feature",
        memory_enabled=True
    )

    agent = orchestrator._agents[agent_id]
    agent.memory["patterns"] = "Use React hooks for state management"
    agent.memory["gotchas"] = "API requires auth token in headers"
    agent.memory["libraries"] = ["axios", "react-router", "zustand"]

    print(f"✓ Agent {agent_id} accumulated memory:")
    print(f"  - Patterns: {agent.memory.get('patterns')}")
    print(f"  - Gotchas: {agent.memory.get('gotchas')}")
    print(f"  - Libraries: {', '.join(agent.memory.get('libraries', []))}")

    # Save and stop
    orchestrator._save_agent_memory(agent_id, agent.memory)
    orchestrator.stop_agent(agent_id)
    print(f"✓ Saved memory and stopped agent")

    # Restart with same ID
    print_subsection("Second Agent Session (Memory Preserved)")
    agent_id_2 = orchestrator.start_agent(
        "developer",
        task="Continue work",
        agent_id=agent_id,
        memory_enabled=True
    )

    agent_2 = orchestrator._agents[agent_id_2]
    print(f"✓ Restarted agent with preserved memory:")
    print(f"  - Patterns: {agent_2.memory.get('patterns')}")
    print(f"  - Gotchas: {agent_2.memory.get('gotchas')}")
    print(f"  - Libraries: {', '.join(agent_2.memory.get('libraries', []))}")


def demo_cleanup(orchestrator):
    """Demonstrate agent cleanup."""
    print_section("7. Agent Cleanup")

    # Get current statistics
    print_subsection("Before Cleanup")
    stats_before = orchestrator.get_statistics()
    print(f"  Total agents: {stats_before['total_agents']}")
    print(f"  By state: {stats_before['agents_by_state']}")

    # Clean up old agents
    print_subsection("Cleaning Up")
    cleaned = orchestrator.cleanup_completed_agents(older_than_seconds=0)
    print(f"✓ Cleaned up {cleaned} agents")

    # Get statistics after
    print_subsection("After Cleanup")
    stats_after = orchestrator.get_statistics()
    print(f"  Total agents: {stats_after['total_agents']}")
    print(f"  By state: {stats_after['agents_by_state']}")


def main():
    """Run all demonstrations."""
    print("\n" + "🚀" * 30)
    print("  BlackBox5 Agent Orchestrator Demo")
    print("🚀" * 30)

    # Basic agents
    orchestrator = demo_basic_agents()

    # Sequential workflow
    demo_sequential_workflow(orchestrator)

    # Parallel execution (async)
    print("\nRunning parallel execution demo...")
    asyncio.run(demo_parallel_execution(orchestrator))

    # Custom IDs
    demo_custom_agent_ids(orchestrator)

    # Dependencies
    demo_workflow_with_dependencies()

    # Memory persistence
    demo_agent_memory()

    # Cleanup
    demo_cleanup(orchestrator)

    # Final summary
    print_section("Demo Complete")
    print("The orchestrator successfully demonstrated:")
    print("  ✓ Unique agent ID generation")
    print("  ✓ Sequential workflow execution")
    print("  ✓ Parallel task execution")
    print("  ✓ Custom agent IDs")
    print("  ✓ Workflow dependencies")
    print("  ✓ Agent memory persistence")
    print("  ✓ Agent cleanup and statistics")
    print("\nFor more information, see:")
    print("  .blackbox5/engine/core/ORCHESTRATOR_README.md")
    print()


if __name__ == "__main__":
    main()
