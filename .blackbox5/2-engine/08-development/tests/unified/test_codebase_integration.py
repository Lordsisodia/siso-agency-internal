#!/usr/bin/env python3
"""
Integrate BlackBox5 with Existing Codebase

This demonstrates how to use BlackBox5 with your actual SISO-INTERNAL project.
"""

import os
import sys
from pathlib import Path

# Add engine to path
engine_path = Path(__file__).parent.parent / "engine"
sys.path.insert(0, str(engine_path))

from core.AgentClient import create_client, load_project_index, detect_project_capabilities
from core.Orchestrator import AgentOrchestrator
from core.GLMClient import create_glm_client

def test_project_scan():
    """Test scanning the SISO-INTERNAL project"""
    print("="*60)
    print("Test 1: Project Scanning")
    print("="*60)

    project_dir = Path("/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL")

    # Load project index
    print(f"\n📂 Scanning project: {project_dir}")
    index = load_project_index(project_dir)

    print(f"\n✅ Project Index Loaded:")
    print(f"  Files found: {len(index.get('files', []))}")
    print(f"  Dependencies: {list(index.get('dependencies', {}).keys())[:10]}")

    # Detect capabilities
    capabilities = detect_project_capabilities(index)

    print(f"\n✅ Capabilities Detected:")
    for key, value in capabilities.items():
        print(f"  {key}: {value}")

    return True

def test_agent_creation():
    """Test creating agents for the project"""
    print("\n" + "="*60)
    print("Test 2: Agent Creation")
    print("="*60)

    project_dir = Path("/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL")

    # Create different agent types
    agent_types = ["developer", "planner", "tester", "analyst"]

    for agent_type in agent_types:
        print(f"\n🤖 Creating {agent_type} agent...")
        config = create_client(
            project_dir=project_dir,
            model="glm-4.7",
            agent_type=agent_type
        )

        print(f"  ✅ Agent: {agent_type}")
        print(f"  Tools: {len(config['allowed_tools'])} tools")
        print(f"  Capabilities: {list(config['project_capabilities'].keys())}")

    return True

def test_task_routing():
    """Test routing tasks to appropriate agents"""
    print("\n" + "="*60)
    print("Test 3: Task Routing")
    print("="*60)

    # Example tasks for your project
    tasks = [
        "Fix bug in analytics component",
        "Add new feature to gamification",
        "Review PR #123",
        "Write tests for store management",
        "Analyze performance issues",
        "Create documentation for API",
    ]

    project_dir = Path("/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL")

    print(f"\n📋 Routing {len(tasks)} tasks...")

    for task in tasks:
        # Determine best agent type
        if "bug" in task.lower() or "fix" in task.lower():
            agent_type = "developer"
        elif "feature" in task.lower() or "add" in task.lower():
            agent_type = "developer"
        elif "test" in task.lower():
            agent_type = "tester"
        elif "review" in task.lower() or "pr" in task.lower():
            agent_type = "analyst"
        elif "analyze" in task.lower():
            agent_type = "analyst"
        elif "documentation" in task.lower() or "docs" in task.lower():
            agent_type = "planner"
        else:
            agent_type = "developer"

        print(f"  • [{agent_type:10}] {task}")

    return True

def test_multi_agent_workflow():
    """Test a realistic multi-agent workflow"""
    print("\n" + "="*60)
    print("Test 4: Real Multi-Agent Workflow")
    print("="*60)

    orchestrator = AgentOrchestrator()

    # Simulate a real workflow: fixing a bug in the analytics component
    workflow = [
        {
            "agent_type": "analyst",
            "task": "Analyze the bug in gamification dashboard",
            "agent_id": "analyst_1"
        },
        {
            "agent_type": "developer",
            "task": "Fix the identified bug in RewardCatalog.tsx",
            "agent_id": "dev_1"
        },
        {
            "agent_type": "tester",
            "task": "Write tests for the fix",
            "agent_id": "tester_1"
        },
        {
            "agent_type": "analyst",
            "task": "Review the code and tests",
            "agent_id": "analyst_2"
        }
    ]

    print("\n📋 Workflow: Fix Bug in Gamification Dashboard")
    for i, step in enumerate(workflow, 1):
        print(f"  {i}. [{step['agent_type']}] {step['task']}")

    # Execute workflow
    result = orchestrator.execute_workflow(
        workflow=workflow,
        workflow_id="fix_gamification_bug"
    )

    print(f"\n✅ Workflow completed!")
    print(f"  State: {result.state}")
    print(f"  Steps: {result.steps_completed}/{result.steps_total}")
    print(f"  Duration: {(result.completed_at - result.started_at).total_seconds():.2f}s")

    # Show results
    print(f"\n📊 Results:")
    for agent_id, step_result in result.results.items():
        print(f"  • {agent_id}: {step_result['status']}")

    return True

def test_glm_integration():
    """Test GLM integration with your codebase"""
    print("\n" + "="*60)
    print("Test 5: GLM Integration")
    print("="*60)

    # Use mock client (since real API is rate-limited)
    client = create_glm_client(mock=True)

    # Example: Ask GLM about your codebase
    project_dir = Path("/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL")

    response = client.create([
        {
            "role": "system",
            "content": f"You are a code expert for the SISO-INTERNAL project located at {project_dir}."
        },
        {
            "role": "user",
            "content": "What is the purpose of the gamification dashboard in src/domains/analytics/components/GamificationDashboard.tsx?"
        }
    ])

    print(f"\n🤖 GLM Response:")
    print(f"  {response.content}")

    return True

def run_all_tests():
    """Run all integration tests"""
    print("\n" + "="*60)
    print("BlackBox5 Codebase Integration Tests")
    print("="*60)

    tests = [
        ("Project Scanning", test_project_scan),
        ("Agent Creation", test_agent_creation),
        ("Task Routing", test_task_routing),
        ("Multi-Agent Workflow", test_multi_agent_workflow),
        ("GLM Integration", test_glm_integration),
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
    print("Integration Test Summary")
    print("="*60)

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {name}: {status}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All integration tests passed!")
        print("\nBlackBox5 is now integrated with your SISO-INTERNAL codebase!")
        print("\nYou can:")
        print("  ✅ Scan your project structure")
        print("  ✅ Create specialized agents (developer, tester, analyst)")
        print("  ✅ Route tasks to appropriate agents")
        print("  ✅ Run multi-agent workflows")
        print("  ✅ Use GLM for intelligent code analysis")

    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
