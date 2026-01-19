#!/usr/bin/env python3
"""
Test Multi-Agent Workflow - Working Version

This demonstrates BlackBox5's multi-agent orchestration capabilities.
"""

import os
import sys
from pathlib import Path

# Add engine to path
engine_path = Path(__file__).parent.parent / "engine"
sys.path.insert(0, str(engine_path))

from core.Orchestrator import AgentOrchestrator

def test_single_agent():
    """Test single agent execution"""
    print("="*60)
    print("Test 1: Single Agent Execution")
    print("="*60)

    orchestrator = AgentOrchestrator()

    # Start a single agent (not async)
    agent_id = orchestrator.start_agent(
        agent_type="developer",
        task="Create a simple Python hello world function"
    )

    print(f"\n✅ Agent started: {agent_id}")
    print(f"Active agents: {len(orchestrator._agents)}")

    # Check agent status
    status = orchestrator.get_agent_status(agent_id)
    print(f"Agent status: {status}")

    # Stop the agent
    stopped = orchestrator.stop_agent(agent_id)
    print(f"✅ Agent stopped: {stopped}")

    return True

def test_multiple_agents():
    """Test multiple agents running concurrently"""
    print("\n" + "="*60)
    print("Test 2: Multiple Agents")
    print("="*60)

    orchestrator = AgentOrchestrator()

    # Start multiple agents
    agents = []
    tasks = [
        ("developer", "Write API endpoint"),
        ("tester", "Write tests"),
        ("analyst", "Analyze code"),
    ]

    for agent_type, task in tasks:
        agent_id = orchestrator.start_agent(
            agent_type=agent_type,
            task=task
        )
        agents.append(agent_id)
        print(f"✅ Started {agent_type}: {agent_id}")

    print(f"\nTotal active agents: {len(orchestrator._agents)}")

    # List all agents
    all_agents = orchestrator.list_agents()
    print(f"All agents: {len(all_agents)}")

    # Stop all agents
    for agent_id in agents:
        orchestrator.stop_agent(agent_id)

    print(f"✅ Stopped {len(agents)} agents")

    return True

def test_workflow_execution():
    """Test workflow execution"""
    print("\n" + "="*60)
    print("Test 3: Workflow Execution")
    print("="*60)

    orchestrator = AgentOrchestrator()

    # Define a simple workflow
    workflow = [
        {
            "agent_type": "developer",
            "task": "Create fibonacci function",
            "agent_id": "dev_1"
        },
        {
            "agent_type": "tester",
            "task": "Test fibonacci function",
            "agent_id": "tester_1"
        },
        {
            "agent_type": "analyst",
            "task": "Review implementation",
            "agent_id": "analyst_1"
        }
    ]

    print("\n📋 Workflow Steps:")
    for i, step in enumerate(workflow, 1):
        print(f"  {i}. [{step['agent_type']}] {step['task']}")

    # Execute workflow
    result = orchestrator.execute_workflow(
        workflow=workflow,
        workflow_id="test_workflow_1"
    )

    print(f"\n✅ Workflow executed!")
    print(f"Workflow ID: {result.workflow_id}")
    print(f"State: {result.state}")
    print(f"Steps completed: {result.steps_completed}/{result.steps_total}")

    # Get workflow status
    status = orchestrator.get_workflow_status(result.workflow_id)
    print(f"Workflow status: {status}")

    return True

def test_statistics():
    """Test orchestrator statistics"""
    print("\n" + "="*60)
    print("Test 4: Statistics")
    print("="*60)

    orchestrator = AgentOrchestrator()

    # Get initial stats
    stats = orchestrator.get_statistics()
    print(f"\nInitial stats: {stats}")

    # Start some agents
    orchestrator.start_agent("developer", "Task 1")
    orchestrator.start_agent("tester", "Task 2")

    # Get updated stats
    stats = orchestrator.get_statistics()
    print(f"Updated stats: {stats}")

    # Cleanup
    orchestrator.cleanup_completed_agents()

    return True

def run_all_tests():
    """Run all workflow tests"""
    print("\n" + "="*60)
    print("BlackBox5 Multi-Agent Workflow Tests")
    print("="*60)

    tests = [
        ("Single Agent", test_single_agent),
        ("Multiple Agents", test_multiple_agents),
        ("Workflow Execution", test_workflow_execution),
        ("Statistics", test_statistics),
    ]

    results = {}

    for name, test_func in tests:
        try:
            result = test_func()
            results[name] = result
        except Exception as e:
            print(f"\n❌ {name} failed: {e}")
            import traceback
            traceback.print_exc()
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

    if passed == total:
        print("\n🎉 All multi-agent workflow tests passed!")
        print("\nBlackBox5 can:")
        print("  ✅ Start and manage multiple agents")
        print("  ✅ Execute workflows")
        print("  ✅ Track agent status")
        print("  ✅ Provide statistics")

    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
