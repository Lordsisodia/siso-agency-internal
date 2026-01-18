"""
Black Box 5 Engine - Agent System Examples

Demonstrates how to use the agent system for various tasks.
"""

import asyncio
from pathlib import Path

# Add engine to path
import sys
engine_root = Path(__file__).parent
sys.path.insert(0, str(engine_root))

from core import (
    AgentLoader,
    AgentRouter,
    SkillManager,
    ExecutionOrchestrator,
    Task,
    AgentConfig,
    BMADAgent,
    create_agent
)


async def example_1_load_agents():
    """Example 1: Load all agents"""
    print("=" * 60)
    print("Example 1: Loading Agents")
    print("=" * 60)

    # Create loader
    loader = AgentLoader()

    # Load all agents
    agents = await loader.load_all()

    print(f"\n✅ Loaded {len(agents)} agents:")
    for name in loader.list_agents():
        agent = loader.get_agent(name)
        print(f"  - {name}: {agent.role} ({agent.category})")

    # List agents by category
    print(f"\n📊 By Category:")
    for category in ["1-core", "2-bmad", "3-research", "4-specialists"]:
        category_agents = loader.get_agents_by_category(category)
        print(f"  {category}: {len(category_agents)} agents")

    return loader


async def example_2_route_tasks(loader):
    """Example 2: Route tasks to agents"""
    print("\n" + "=" * 60)
    print("Example 2: Routing Tasks")
    print("=" * 60)

    # Create router
    router = AgentRouter(loader)

    # Define test tasks
    tasks = [
        Task(
            id="1",
            description="Fix login bug",
            type="implementation",
            complexity="simple"
        ),
        Task(
            id="2",
            description="Design API architecture",
            type="architecture",
            complexity="medium"
        ),
        Task(
            id="3",
            description="Research competitors",
            type="research",
            complexity="medium"
        ),
        Task(
            id="4",
            description="Build partnership system",
            type="implementation",
            complexity="complex"
        )
    ]

    print("\n📋 Routing Tasks:")
    for task in tasks:
        agent = router.route(task)
        if agent:
            reason = router.get_routing_reason(task, agent.name)
            print(f"\n  Task: {task.description}")
            print(f"    → Agent: {agent.name}")
            print(f"    Reason: {reason}")
        else:
            print(f"\n  Task: {task.description}")
            print(f"    → No agent found")


async def example_3_execute_simple_task(loader):
    """Example 3: Execute a simple task"""
    print("\n" + "=" * 60)
    print("Example 3: Executing a Simple Task")
    print("=" * 60)

    # Create orchestrator
    router = AgentRouter(loader)
    orchestrator = ExecutionOrchestrator(router, loader)

    # Define a simple task
    task = Task(
        id="test-1",
        description="Create a README for this project",
        type="documentation",
        complexity="simple",
        context={"project_root": str(Path(__file__).parent.parent)}
    )

    print(f"\n🎯 Task: {task.description}")

    # Execute
    result = await orchestrator.execute_task(task)

    print(f"\n✅ Result:")
    print(f"  Success: {result.success}")
    print(f"  Agent: {result.agent}")
    print(f"  Duration: {result.duration:.2f}s")

    if result.error:
        print(f"  Error: {result.error}")


async def example_4_parallel_execution(loader):
    """Example 4: Execute tasks in parallel (wave)"""
    print("\n" + "=" * 60)
    print("Example 4: Parallel Execution (Wave)")
    print("=" * 60)

    # Create orchestrator
    router = AgentRouter(loader)
    orchestrator = ExecutionOrchestrator(router, loader)

    # Define tasks for Wave 1 (independent)
    wave1_tasks = [
        Task(
            id="w1-1",
            description="Fix header alignment",
            type="implementation",
            complexity="simple",
            wave=1
        ),
        Task(
            id="w1-2",
            description="Update footer links",
            type="implementation",
            complexity="simple",
            wave=1
        ),
        Task(
            id="w1-3",
            description="Add favicon",
            type="implementation",
            complexity="simple",
            wave=1
        )
    ]

    print(f"\n🌊 Wave 1: {len(wave1_tasks)} independent tasks")

    # Execute wave
    results = await orchestrator.execute_wave(wave1_tasks)

    print(f"\n✅ Results:")
    for task_id, result in results.items():
        status = "✅" if result.success else "❌"
        print(f"  {status} {task_id}: {result.agent} ({result.duration:.2f}s)")


async def example_5_load_skills():
    """Example 5: Load and use skills"""
    print("\n" + "=" * 60)
    print("Example 5: Loading Skills")
    print("=" * 60)

    # Create skill manager
    skill_manager = SkillManager()

    # Load all skills
    skills = await skill_manager.load_all()

    print(f"\n✅ Loaded {len(skills)} skills")

    # List by category
    for category in skill_manager.list_categories():
        category_skills = skill_manager.get_skills_by_category(category)
        print(f"\n  {category}/: {len(category_skills)} skills")
        for skill in category_skills[:3]:  # Show first 3
            print(f"    - {skill.name}: {skill.description}")

    # Search for skills
    print(f"\n🔍 Searching for 'planning':")
    planning_skills = skill_manager.search_skills("planning")
    for skill in planning_skills:
        print(f"  - {skill.name} ({skill.type.value})")

    return skill_manager


async def example_6_compose_skills(skill_manager):
    """Example 6: Compose skills into workflow"""
    print("\n" + "=" * 60)
    print("Example 6: Composing Skills")
    print("=" * 60)

    # Compose multiple skills
    workflow = skill_manager.compose_skills([
        "atomic-planning",
        "goal-backward"
    ])

    print("\n📋 Composed Workflow:")
    print(workflow)


async def example_7_custom_agent():
    """Example 7: Create a custom agent"""
    print("\n" + "=" * 60)
    print("Example 7: Creating Custom Agent")
    print("=" * 60)

    # Define agent config
    config = AgentConfig(
        name="my-custom-agent",
        full_name="My Custom Agent",
        role="specialist",
        category="4-specialists",
        icon="🚀",
        description="A custom agent for my specific needs",
        capabilities=["custom-task", "custom-analysis"],
        tools=["read", "write", "edit"],
        communication_style="friendly"
    )

    # Create agent
    agent = create_agent("specialist", config)

    print(f"\n✅ Created agent: {agent.name}")
    print(f"  Role: {agent.role}")
    print(f"  Capabilities: {', '.join(agent.config.capabilities)}")

    # Initialize
    await agent.initialize()

    # Load prompt
    prompt = agent.load_prompt()
    print(f"\n📝 Prompt:\n{prompt[:200]}...")


async def main():
    """Run all examples"""
    print("🚀 Black Box 5 Agent System Examples\n")

    # Example 1: Load agents
    loader = await example_1_load_agents()

    # Example 2: Route tasks
    await example_2_route_tasks(loader)

    # Example 3: Execute simple task
    # await example_3_execute_simple_task(loader)  # Uncomment to run

    # Example 4: Parallel execution
    # await example_4_parallel_execution(loader)  # Uncomment to run

    # Example 5: Load skills
    skill_manager = await example_5_load_skills()

    # Example 6: Compose skills
    await example_6_compose_skills(skill_manager)

    # Example 7: Custom agent
    await example_7_custom_agent()

    print("\n" + "=" * 60)
    print("✅ All examples complete!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
