#!/usr/bin/env python3
"""
BlackBox5 Agent System Demo

This script demonstrates the working agent implementations.
Run this to see the agents in action!

Usage:
    python demo_agents.py
"""

import asyncio
import sys
from pathlib import Path

# Add the blackbox5 engine to path
blackbox_path = Path(__file__).parent / ".blackbox5" / "engine"
sys.path.insert(0, str(blackbox_path))

# Also add the agents directory
agents_path = blackbox_path / "agents"
sys.path.insert(0, str(agents_path))

from core.BaseAgent import Task
from agents import (
    create_developer_agent,
    create_analyst_agent,
    create_architect_agent
)


def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{'='*70}")
    print(f"  {text}")
    print(f"{'='*70}\n")


def print_result(agent_name: str, result):
    """Print agent execution result"""
    print(f"✓ Agent: {result.agent}")
    print(f"✓ Task ID: {result.task_id}")
    print(f"✓ Success: {result.success}")
    print(f"✓ Duration: {result.duration:.2f}s")

    if result.success:
        print(f"\n--- Output Preview ---")
        summary = result.output.get("summary", "No output")
        print(summary[:300] + "..." if len(summary) > 300 else summary)

        if result.artifacts:
            print(f"\n--- Artifacts ---")
            for artifact in result.artifacts[:5]:  # Show first 5
                print(f"  • {artifact}")
            if len(result.artifacts) > 5:
                print(f"  ... and {len(result.artifacts) - 5} more")

        # Show metadata
        metadata = result.metadata
        if metadata:
            print(f"\n--- Metadata ---")
            for key, value in list(metadata.items())[:3]:
                print(f"  • {key}: {value}")
    else:
        print(f"\n✗ Error: {result.error}")


async def demo_developer_agent():
    """Demonstrate the Developer Agent"""
    print_header("Developer Agent Demo (Amelia 💻)")

    agent = create_developer_agent(use_mock_llm=True)
    await agent.initialize()

    task = Task(
        id="demo-dev-001",
        description="Write a hello world function in Python with tests",
        type="implementation",
        complexity="simple"
    )

    print(f"Task: {task.description}")
    print(f"Type: {task.type} | Complexity: {task.complexity}\n")

    result = await agent.execute(task)
    print_result("Developer", result)


async def demo_analyst_agent():
    """Demonstrate the Analyst Agent"""
    print_header("Analyst Agent Demo (Mary 📊)")

    agent = create_analyst_agent(use_mock_llm=True)
    await agent.initialize()

    task = Task(
        id="demo-analysis-001",
        description="Analyze the competitive landscape for project management tools",
        type="research",
        complexity="medium",
        context={
            "focus": "SMB market",
            "region": "North America"
        }
    )

    print(f"Task: {task.description}")
    print(f"Type: {task.type} | Complexity: {task.complexity}")
    print(f"Context: {task.context}\n")

    result = await agent.execute(task)
    print_result("Analyst", result)


async def demo_architect_agent():
    """Demonstrate the Architect Agent"""
    print_header("Architect Agent Demo (Alex 🏗️)")

    agent = create_architect_agent(use_mock_llm=True)
    await agent.initialize()

    task = Task(
        id="demo-arch-001",
        description="Design a scalable microservices architecture for task management",
        type="architecture",
        complexity="complex",
        inputs={
            "requirements": "Handle 10k concurrent users",
            "constraints": ["PostgreSQL", "AWS"]
        }
    )

    print(f"Task: {task.description}")
    print(f"Type: {task.type} | Complexity: {task.complexity}")
    print(f"Requirements: {task.inputs['requirements']}\n")

    result = await agent.execute(task)
    print_result("Architect", result)


async def demo_multi_agent_workflow():
    """Demonstrate multiple agents working together"""
    print_header("Multi-Agent Workflow Demo")

    # Create all agents
    analyst = create_analyst_agent(use_mock_llm=True)
    architect = create_architect_agent(use_mock_llm=True)
    developer = create_developer_agent(use_mock_llm=True)

    await analyst.initialize()
    await architect.initialize()
    await developer.initialize()

    print("Workflow: Analysis → Architecture → Implementation\n")

    # Phase 1: Analysis
    print("📍 Phase 1: Business Analysis")
    analysis_task = Task(
        id="workflow-001",
        description="Analyze requirements for a task management system",
        type="research",
        complexity="medium"
    )
    analysis_result = await analyst.execute(analysis_task)
    print(f"  ✓ {analyst.name} completed analysis ({analysis_result.duration:.2f}s)")

    # Phase 2: Architecture
    print("\n📍 Phase 2: Technical Architecture")
    arch_task = Task(
        id="workflow-002",
        description="Design system architecture based on requirements",
        type="architecture",
        complexity="complex"
    )
    arch_result = await architect.execute(arch_task)
    print(f"  ✓ {architect.name} completed architecture design ({arch_result.duration:.2f}s)")

    # Phase 3: Implementation
    print("\n📍 Phase 3: Implementation")
    impl_task = Task(
        id="workflow-003",
        description="Implement core task management features",
        type="implementation",
        complexity="medium"
    )
    impl_result = await developer.execute(impl_task)
    print(f"  ✓ {developer.name} completed implementation ({impl_result.duration:.2f}s)")

    # Summary
    total_duration = analysis_result.duration + arch_result.duration + impl_result.duration
    print(f"\n📊 Workflow Summary:")
    print(f"  • Total phases: 3")
    print(f"  • Total duration: {total_duration:.2f}s")
    print(f"  • Agents involved: {analyst.name}, {architect.name}, {developer.name}")
    print(f"  • All tasks completed: ✓")


async def main():
    """Run all demonstrations"""
    print("\n" + "="*70)
    print("  BlackBox5 Agent System - Live Demo")
    print("="*70)
    print("\nThis demo showcases the working agent implementations.")
    print("Agents are using MOCK LLM mode for demonstration purposes.")
    print("In production, they would use the actual GLM API.\n")

    # Run individual agent demos
    await demo_developer_agent()
    await demo_analyst_agent()
    await demo_architect_agent()

    # Run multi-agent workflow
    await demo_multi_agent_workflow()

    print_header("Demo Complete!")
    print("✓ All agents demonstrated successfully")
    print("✓ Try importing and using them in your own code")
    print("\nExample:")
    print("  from engine.agents.agents import create_developer_agent")
    print("  agent = create_developer_agent()")
    print("  result = agent.execute_sync(task)")
    print()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nDemo interrupted by user.")
    except Exception as e:
        print(f"\n\nError running demo: {e}")
        import traceback
        traceback.print_exc()
