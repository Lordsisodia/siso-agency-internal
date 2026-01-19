#!/usr/bin/env python3
"""
Test Multi-Agent Workflow

This demonstrates BlackBox5's multi-agent orchestration capabilities.
"""

import os
import sys
import asyncio
from pathlib import Path

# Add engine to path
engine_path = Path(__file__).parent.parent / "engine"
sys.path.insert(0, str(engine_path))

from core.Orchestrator import AgentOrchestrator
from core.GLMClient import create_glm_client
from core.event_bus import RedisEventBus, EventBusConfig

async def test_single_agent():
    """Test single agent execution"""
    print("="*60)
    print("Test 1: Single Agent Execution")
    print("="*60)

    orchestrator = AgentOrchestrator()

    # Start a single agent
    agent_id = await orchestrator.start_agent(
        agent_type="developer",
        task="Create a simple Python hello world function"
    )

    print(f"\n✅ Agent started: {agent_id}")
    print(f"Active agents: {len(orchestrator._agents)}")

    # Stop the agent
    await orchestrator.stop_agent(agent_id)
    print(f"✅ Agent stopped: {agent_id}")

    return True

async def test_sequential_workflow():
    """Test sequential multi-agent workflow"""
    print("\n" + "="*60)
    print("Test 2: Sequential Workflow")
    print("="*60)

    orchestrator = AgentOrchestrator()

    # Define sequential workflow
    workflow = [
        {
            "agent_type": "developer",
            "task": "Write a Python function to calculate fibonacci",
            "dependencies": []
        },
        {
            "agent_type": "tester",
            "task": "Write tests for the fibonacci function",
            "dependencies": ["step-0"]
        },
        {
            "agent_type": "developer",
            "task": "Fix any bugs found in tests",
            "dependencies": ["step-1"]
        }
    ]

    print("\n📋 Workflow:")
    for i, step in enumerate(workflow):
        deps = step.get("dependencies", [])
        deps_str = f" (depends on: {', '.join(deps)})" if deps else ""
        print(f"  {i+1}. [{step['agent_type']}] {step['task']}{deps_str}")

    # Execute sequential workflow
    result = await orchestrator.execute_sequential(workflow)

    print(f"\n✅ Workflow completed!")
    print(f"Results: {len(result)} steps executed")

    return True

async def test_parallel_workflow():
    """Test parallel multi-agent workflow"""
    print("\n" + "="*60)
    print("Test 3: Parallel Workflow")
    print("="*60)

    orchestrator = AgentOrchestrator()

    # Define parallel tasks
    tasks = [
        {
            "agent_type": "researcher",
            "task": "Research Python best practices",
            "dependencies": []
        },
        {
            "agent_type": "researcher",
            "task": "Research testing frameworks",
            "dependencies": []
        },
        {
            "agent_type": "analyst",
            "task": "Analyze research findings",
            "dependencies": ["task-0", "task-1"]
        }
    ]

    print("\n📋 Parallel Tasks:")
    for i, task in enumerate(tasks):
        deps = task.get("dependencies", [])
        deps_str = f" (waits for: {', '.join(deps)})" if deps else ""
        print(f"  {i+1}. [{task['agent_type']}] {task['task']}{deps_str}")

    # Execute parallel workflow
    result = await orchestrator.execute_wave(tasks)

    print(f"\n✅ Parallel workflow completed!")
    print(f"Results: {len(result)} tasks executed")

    return True

async def test_event_driven_workflow():
    """Test event-driven workflow with Redis"""
    print("\n" + "="*60)
    print("Test 4: Event-Driven Workflow")
    print("="*60)

    # Create event bus
    config = EventBusConfig(
        host="localhost",
        port=6379,
        db=0
    )
    event_bus = RedisEventBus(config)
    await event_bus.connect()

    print("\n📡 Connected to Redis event bus")

    # Track events
    events_received = []

    async def event_handler(event):
        events_received.append(event)
        print(f"  📨 Event received: {event.get('type', 'unknown')}")

    # Subscribe to agent events
    await event_bus.subscribe("agent.*", event_handler)

    # Create orchestrator with event bus
    orchestrator = AgentOrchestrator(event_bus=event_bus)

    # Execute a simple workflow
    agent_id = await orchestrator.start_agent(
        agent_type="developer",
        task="Create a simple function"
    )

    print(f"\n✅ Agent started: {agent_id}")

    # Wait for events
    await asyncio.sleep(1)

    # Cleanup
    await orchestrator.stop_agent(agent_id)
    await event_bus.disconnect()

    print(f"\n✅ Events received: {len(events_received)}")

    return True

async def run_all_tests():
    """Run all workflow tests"""
    print("\n" + "="*60)
    print("BlackBox5 Multi-Agent Workflow Tests")
    print("="*60)

    tests = [
        ("Single Agent", test_single_agent),
        ("Sequential Workflow", test_sequential_workflow),
        ("Parallel Workflow", test_parallel_workflow),
        ("Event-Driven Workflow", test_event_driven_workflow),
    ]

    results = {}

    for name, test_func in tests:
        try:
            print(f"\n{'='*60}")
            print(f"Running: {name}")
            print('='*60)
            result = await test_func()
            results[name] = result
        except Exception as e:
            print(f"\n❌ {name} failed: {e}")
            results[name] = False

    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {name}: {status}")

    print(f"\nTotal: {passed}/{total} tests passed")

    return passed == total

if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
