#!/usr/bin/env python3
"""
CLI interface for the Guide System.

Demonstrates how even a dumb agent (or human) can use Blackbox 5.
"""

import sys
import json
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from guides import Guide


def print_section(title: str):
    """Print a section header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def print_step(step: dict):
    """Print a step nicely."""
    print(f"Step {step['step_number']} of {step['total_steps']}: {step['name']}")
    print(f"Description: {step['description']}")
    print(f"\nInstruction:")
    print(f"  {step['instruction']}")
    if step['command']:
        print(f"\nCommand to run:")
        print(f"  $ {step['command']}")
    print(f"\nExpected: {step['expected_output']}")


def demo_interactive():
    """Demonstrate interactive guide usage."""
    guide = Guide(".")

    print_section("Blackbox 5 Guide System - Interactive Demo")

    # 1. List available operations
    print("1. Available Operations")
    print("-" * 40)
    operations = guide.list_operations()
    for op in operations:
        print(f"  • {op['name']}: {op['description']}")
        print(f"    Category: {op['category']}, Steps: {op['steps_count']}")

    # 2. Check context for a file
    print("\n2. Context Check")
    print("-" * 40)
    context = {
        "file_path": "example.py",
        "file_name": "example.py"
    }
    suggestions = guide.check_context("file_written", context)
    for suggestion in suggestions:
        print(f"  • {suggestion['operation']}: {suggestion['suggestion']}")

    # 3. Start an operation
    print("\n3. Starting Operation")
    print("-" * 40)
    result = guide.start_operation("test_python_code", context)

    if "error" in result:
        print(f"Error: {result['error']}")
        return

    recipe_id = result["recipe_id"]
    print(f"Recipe ID: {recipe_id}")
    print(f"Operation: {result['operation']}")
    print()
    print_step(result["step"])

    # 4. Simulate step execution
    print("\n4. Executing Step")
    print("-" * 40)
    print("(In real usage, agent would run the command and provide output)")
    print("Simulating execution with empty output...")
    execution_result = guide.execute_step(recipe_id, output="", execute_for_me=False)

    print(f"\nAction: {execution_result['action']}")
    print(f"Message: {execution_result['message']}")

    if execution_result['step']:
        print("\nNext step:")
        print_step(execution_result['step'])

    # 5. Show summary
    print("\n5. Recipe Summary")
    print("-" * 40)
    summary = guide.get_recipe_status(recipe_id)
    print(json.dumps(summary, indent=2))


def demo_automated():
    """Demonstrate fully automated guide usage."""
    guide = Guide(".")

    print_section("Blackbox 5 Guide System - Automated Demo")

    # Quick test a file
    print("Quick-testing example.py...")
    print("-" * 40)

    result = guide.quick_test("example.py")

    if "error" in result:
        print(f"Error: {result['error']}")
        return

    print(f"Recipe ID: {result['recipe_id']}")
    print(f"Operation: {result['operation']}")
    print()
    print_step(result['step'])

    # In automated mode, execute everything
    print("\nExecuting full recipe automatically...")
    print("-" * 40)

    result = guide.execute_full_recipe(
        "test_python_code",
        {"file_path": "example.py", "file_name": "example.py"}
    )

    print(json.dumps(result, indent=2))


def demo_dumb_agent():
    """
    Demonstrate how a "dumb" agent would use the guide system.

    A dumb agent doesn't plan or make decisions - it just follows instructions.
    """
    guide = Guide(".")

    print_section("Blackbox 5 - Dumb Agent Demo")

    print("Scenario: Agent just wrote a file called 'my_script.py'")
    print()

    # Step 1: Agent tells system what it did
    print("Agent: I just wrote my_script.py")
    print("-" * 40)

    # Step 2: System checks context and offers help
    suggestions = guide.check_context("file_written", {
        "file_path": "my_script.py",
        "file_name": "my_script.py"
    })

    if suggestions:
        print(f"System: {suggestions[0]['suggestion']}")
        print()

        # Step 3: Agent accepts (dumb agent just says yes)
        print("Agent: Yes")
        print("-" * 40)

        # Step 4: System starts recipe and gives first step
        result = guide.start_operation("test_python_code", {
            "file_path": "my_script.py",
            "file_name": "my_script.py"
        })

        recipe_id = result["recipe_id"]
        step = result["step"]

        print(f"System: Starting recipe '{result['operation']}'")
        print()
        print_step(step)
        print()

        # Step 5: Agent executes step (dumb agent just runs the command)
        print("Agent: [runs command]")
        print("-" * 40)

        # For demo, simulate success
        execution_result = guide.execute_step(recipe_id, output="", execute_for_me=False)

        print(f"System: {execution_result['message']}")
        print()

        if execution_result['step']:
            print("System: Next step...")
            print_step(execution_result['step'])

    print("\nNotice: The agent didn't need to:")
    print("  - Know what operations exist")
    print("  - Decide what to do")
    print("  - Plan the sequence")
    print("  - Handle errors (system provides fixes)")
    print("\nThe agent just needed to:")
    print("  - Report what it did")
    print("  - Follow instructions")
    print("  - Execute commands")


def main():
    """Main CLI entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Blackbox 5 Guide System CLI")
    parser.add_argument("mode", nargs="?", default="interactive",
                       choices=["interactive", "automated", "dumb"],
                       help="Demo mode")
    parser.add_argument("--file", "-f", help="File to test")
    parser.add_argument("--auto", "-a", action="store_true",
                       help="Execute automatically without prompting")

    args = parser.parse_args()

    if args.mode == "interactive":
        demo_interactive()
    elif args.mode == "automated":
        demo_automated()
    elif args.mode == "dumb":
        demo_dumb_agent()


if __name__ == "__main__":
    main()
