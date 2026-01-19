#!/usr/bin/env python3
"""
Simple Agent Test Script

This script tests the agent implementations.
Run from the .blackbox5/engine directory.

Usage:
    cd .blackbox5/engine
    python3 test_agents_simple.py
"""

import asyncio
import sys
from pathlib import Path

# Import from local modules
from agents.agents.DeveloperAgent import create_developer_agent
from agents.agents.AnalystAgent import create_analyst_agent
from agents.agents.ArchitectAgent import create_architect_agent
from agents.core.BaseAgent import Task


def print_header(text):
    print(f"\n{'='*70}")
    print(f"  {text}")
    print(f"{'='*70}\n")


async def test_developer_agent():
    """Test the Developer Agent"""
    print_header("Testing Developer Agent (Amelia 💻)")

    agent = create_developer_agent(use_mock_llm=True)
    await agent.initialize()

    task = Task(
        id="test-dev-001",
        description="Write a hello world function in Python with tests",
        type="implementation",
        complexity="simple"
    )

    print(f"Task: {task.description}")
    print(f"Agent: {agent.name}")
    print(f"Role: {agent.role}\n")

    result = await agent.execute(task)

    print(f"✓ Success: {result.success}")
    print(f"✓ Duration: {result.duration:.2f}s")
    print(f"✓ Output: {result.output.get('summary', 'No output')[:200]}...")

    return result


async def test_analyst_agent():
    """Test the Analyst Agent"""
    print_header("Testing Analyst Agent (Mary 📊)")

    agent = create_analyst_agent(use_mock_llm=True)
    await agent.initialize()

    task = Task(
        id="test-analyst-001",
        description="Analyze the competitive landscape for project management tools",
        type="research",
        complexity="medium"
    )

    print(f"Task: {task.description}")
    print(f"Agent: {agent.name}")
    print(f"Role: {agent.role}\n")

    result = await agent.execute(task)

    print(f"✓ Success: {result.success}")
    print(f"✓ Duration: {result.duration:.2f}s")
    print(f"✓ Frameworks: {result.output.get('frameworks_used', [])}")

    return result


async def test_architect_agent():
    """Test the Architect Agent"""
    print_header("Testing Architect Agent (Alex 🏗️)")

    agent = create_architect_agent(use_mock_llm=True)
    await agent.initialize()

    task = Task(
        id="test-arch-001",
        description="Design a scalable microservices architecture",
        type="architecture",
        complexity="complex"
    )

    print(f"Task: {task.description}")
    print(f"Agent: {agent.name}")
    print(f"Role: {agent.role}\n")

    result = await agent.execute(task)

    print(f"✓ Success: {result.success}")
    print(f"✓ Duration: {result.duration:.2f}s")
    print(f"✓ Patterns: {result.output.get('patterns_detected', [])}")

    return result


async def test_multi_agent_workflow():
    """Test multiple agents working together"""
    print_header("Testing Multi-Agent Workflow")

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
    task1 = Task(id="wf-001", description="Analyze requirements", type="research", complexity="medium")
    result1 = await analyst.execute(task1)
    print(f"  ✓ {analyst.name} completed ({result1.duration:.2f}s)")

    # Phase 2: Architecture
    print("\n📍 Phase 2: Technical Architecture")
    task2 = Task(id="wf-002", description="Design architecture", type="architecture", complexity="complex")
    result2 = await architect.execute(task2)
    print(f"  ✓ {architect.name} completed ({result2.duration:.2f}s)")

    # Phase 3: Implementation
    print("\n📍 Phase 3: Implementation")
    task3 = Task(id="wf-003", description="Implement features", type="implementation", complexity="medium")
    result3 = await developer.execute(task3)
    print(f"  ✓ {developer.name} completed ({result3.duration:.2f}s)")

    total_duration = result1.duration + result2.duration + result3.duration
    print(f"\n📊 Total workflow duration: {total_duration:.2f}s")


async def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("  BlackBox5 Agent System - Test Suite")
    print("="*70)
    print("\nTesting agent implementations with MOCK LLM mode.\n")

    try:
        # Test individual agents
        await test_developer_agent()
        await test_analyst_agent()
        await test_architect_agent()

        # Test workflow
        await test_multi_agent_workflow()

        print_header("All Tests Passed! ✓")
        print("\nAgents are working correctly and can be imported:")
        print("  from agents.agents import create_developer_agent")
        print("  from agents.agents import create_analyst_agent")
        print("  from agents.agents import create_architect_agent")
        print()

    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
