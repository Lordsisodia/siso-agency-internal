#!/usr/bin/env python3
"""
Black Box 5 Engine - Tools Demo

Demonstrates how to use the tool system.
"""

import asyncio
from engine.tools.registry import get_tool, list_tools, get_all_tools_info


async def demo_file_tools():
    """Demonstrate file read/write tools"""
    print("\n" + "="*60)
    print("FILE TOOLS DEMO")
    print("="*60)

    # Write a file
    write_tool = get_tool("file_write")
    result = await write_tool.run(
        path="/tmp/demo.txt",
        content="Hello from BlackBox5 Tools!\nThis is a test file."
    )

    print(f"\n✓ Write file: {result.success}")
    if result.success:
        print(f"  Bytes written: {result.metadata['bytes_written']}")

    # Read the file
    read_tool = get_tool("file_read")
    result = await read_tool.run(path="/tmp/demo.txt")

    print(f"\n✓ Read file: {result.success}")
    if result.success:
        print(f"  Content preview: {result.data[:50]}...")
        print(f"  Lines: {result.metadata['lines']}")


async def demo_bash_tool():
    """Demonstrate bash execution tool"""
    print("\n" + "="*60)
    print("BASH TOOL DEMO")
    print("="*60)

    bash_tool = get_tool("bash_execute")

    # Run a simple command
    result = await bash_tool.run(
        command="echo 'Hello from bash!'"
    )

    print(f"\n✓ Execute command: {result.success}")
    if result.success:
        print(f"  Output: {result.data['stdout'].strip()}")
        print(f"  Exit code: {result.data['exit_code']}")


async def demo_search_tool():
    """Demonstrate search tool"""
    print("\n" + "="*60)
    print("SEARCH TOOL DEMO")
    print("="*60)

    # First, create some test files
    write_tool = get_tool("file_write")

    await write_tool.run(
        path="/tmp/search_test1.py",
        content="def hello():\n    print('Hello, World!')"
    )

    await write_tool.run(
        path="/tmp/search_test2.py",
        content="def goodbye():\n    print('Goodbye!')"
    )

    # Now search
    search_tool = get_tool("search")
    result = await search_tool.run(
        pattern="def",
        path="/tmp",
        file_pattern="*.py",
        use_regex=True
    )

    print(f"\n✓ Search completed: {result.success}")
    if result.success:
        print(f"  Files searched: {result.metadata['files_searched']}")
        print(f"  Total matches: {result.metadata['total_matches']}")
        print(f"  Files with matches: {result.metadata['files_with_matches']}")
        for match in result.data[:2]:  # Show first 2 matches
            print(f"    - {match['file']}: line {match['line_number']}")


async def demo_tool_info():
    """Demonstrate getting tool information"""
    print("\n" + "="*60)
    print("TOOL INFO DEMO")
    print("="*60)

    # List all tools
    tools = list_tools()
    print(f"\n✓ Available tools ({len(tools)}):")
    for tool in tools:
        print(f"  - {tool}")

    # Get detailed info for one tool
    from engine.tools.registry import get_tool_info
    info = get_tool_info("file_read")

    print(f"\n✓ Tool info for 'file_read':")
    print(f"  Description: {info['description']}")
    print(f"  Risk level: {info['risk']}")
    print(f"  Parameters ({len(info['parameters'])}):")
    for param in info['parameters']:
        print(f"    - {param['name']}: {param['type']} ({'required' if param['required'] else 'optional'})")


async def demo_workflow():
    """Demonstrate a workflow combining multiple tools"""
    print("\n" + "="*60)
    print("WORKFLOW DEMO: Create -> Write -> Read -> Search")
    print("="*60)

    # 1. Create a Python file with bash
    bash_tool = get_tool("bash_execute")
    await bash_tool.run(command="mkdir -p /tmp/workflow_demo")

    # 2. Write a file
    write_tool = get_tool("file_write")
    await write_tool.run(
        path="/tmp/workflow_demo/code.py",
        content="def process():\n    return 'processed'\n\ndef analyze():\n    return 'analyzed'"
    )

    # 3. Read it back
    read_tool = get_tool("file_read")
    result = await read_tool.run(path="/tmp/workflow_demo/code.py")
    print(f"\n✓ File created and read: {result.success}")

    # 4. Search for functions
    search_tool = get_tool("search")
    result = await search_tool.run(
        pattern=r"def \w+\(",
        path="/tmp/workflow_demo",
        use_regex=True
    )

    print(f"✓ Found {result.metadata['total_matches']} function definitions:")
    for match in result.data:
        print(f"    - {match['line_content'].strip()}")


async def main():
    """Run all demos"""
    print("\n" + "="*60)
    print("BLACKBOX5 TOOLS DEMONSTRATION")
    print("="*60)

    await demo_file_tools()
    await demo_bash_tool()
    await demo_search_tool()
    await demo_tool_info()
    await demo_workflow()

    print("\n" + "="*60)
    print("DEMO COMPLETE")
    print("="*60 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
