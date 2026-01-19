#!/usr/bin/env python3
"""
End-to-End Test for BlackBox5
Testing the critical path: Task → Agent → LLM → Tool → Result
"""

import sys
import asyncio
from pathlib import Path

# Setup paths
sys.path.insert(0, 'engine')

print("=" * 60)
print("BLACKBOX5 END-TO-END TEST")
print("=" * 60)
print()

# Test 1: GLM Client
print("Test 1: GLM Client")
print("-" * 40)

try:
    from engine.core.GLMClient import create_glm_client

    # Create mock client
    client = create_glm_client(mock=True)
    print("✅ Mock GLM client created")

    # Test it
    response = client.create([
        {"role": "user", "content": "Say hello"}
    ])
    print(f"✅ GLM response: {response.content[:50]}...")
    print()
except Exception as e:
    print(f"❌ GLM Client failed: {e}")
    print()

# Test 2: Agent
print("Test 2: Agent Execution")
print("-" * 40)

try:
    from engine.agents.agents.DeveloperAgent import DeveloperAgent
    from engine.agents.core.BaseAgent import Task

    # Create agent
    agent = DeveloperAgent(use_mock_llm=True)
    print("✅ DeveloperAgent created")

    # Create task
    task = Task(
        id="test-001",
        description="Write a hello world function in Python",
        type="implementation"
    )
    print(f"✅ Task created: {task.description}")

    # Execute
    print("⏳ Executing task...")
    result = agent.execute_sync(task)

    if result.success:
        print(f"✅ Agent execution successful")
        print(f"   Output: {result.output[:100]}...")
    else:
        print(f"❌ Agent execution failed: {result.error}")
    print()
except Exception as e:
    print(f"❌ Agent test failed: {type(e).__name__}: {str(e)[:100]}")
    import traceback
    traceback.print_exc()
    print()

# Test 3: Tools
print("Test 3: Tool Execution")
print("-" * 40)

try:
    from engine.tools.registry import get_tool

    # Test file_read
    file_tool = get_tool("file_read")
    print("✅ file_read tool retrieved")

    # Read a file
    result = asyncio.run(file_tool.run(path="README.md"))

    if result.success:
        print(f"✅ Tool execution successful")
        print(f"   Read {len(result.data)} characters")
        print(f"   Preview: {result.data[:100]}...")
    else:
        print(f"❌ Tool execution failed: {result.error}")
    print()
except Exception as e:
    print(f"❌ Tool test failed: {type(e).__name__}: {str(e)[:100]}")
    import traceback
    traceback.print_exc()
    print()

# Test 4: Full End-to-End
print("Test 4: Full End-to-End (Agent + Tool)")
print("-" * 40)

try:
    from engine.agents.agents.DeveloperAgent import DeveloperAgent
    from engine.agents.core.BaseAgent import Task
    from engine.tools.registry import get_tool

    # Create agent with tool access
    agent = DeveloperAgent(
        use_mock_llm=True,
        tools=[get_tool("file_read")]
    )
    print("✅ Agent created with file_read tool")

    # Task that requires tool use
    task = Task(
        id="e2e-001",
        description="Read the file at FIRST-PRINCIPLES-ANALYSIS.md and tell me what it says",
        type="analysis"
    )

    print(f"✅ Task: {task.description}")
    print("⏳ Executing...")

    result = agent.execute_sync(task)

    if result.success:
        print(f"✅ END-TO-END SUCCESSFUL!")
        print(f"   Output: {result.output[:200]}...")
    else:
        print(f"❌ E2E failed: {result.error}")
    print()
except Exception as e:
    print(f"❌ E2E test failed: {type(e).__name__}: {str(e)[:100]}")
    import traceback
    traceback.print_exc()
    print()

print("=" * 60)
print("TEST SUMMARY")
print("=" * 60)
print("If all tests passed ✅, BlackBox5 is WORKING")
print("If any failed ❌, that's what we need to fix")
print("=" * 60)
