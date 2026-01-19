#!/usr/bin/env python3
"""
Demonstration of how agents discover guides.

Shows three ways to find the right guide:
1. Automatic (context-based)
2. Declarative (intent-based)
3. Exploratory (search/browse)
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from guides import Guide


def demo_automatic_discovery():
    """
    Layer 1: Automatic Context-Based Discovery

    Best for "dumb" agents - system offers help proactively.
    Agent doesn't need to know guide names or even that guides exist.
    """
    print("\n" + "="*70)
    print("LAYER 1: AUTOMATIC CONTEXT-BASED DISCOVERY")
    print("="*70)
    print("\nScenario: Agent just wrote a Python file")
    print("-"*70)

    guide = Guide(".")

    # Agent reports what it did
    print("Agent: I just wrote 'api/users.py'")
    print()

    # System checks context and offers help
    suggestion = guide.get_top_suggestion(
        "file_written",
        {"file_path": "api/users.py", "file_name": "users.py"}
    )

    if suggestion:
        print(f"System: {suggestion['suggestion']}")
        print(f"        (Confidence: {suggestion['confidence']:.0%})")
        print(f"        (Estimated time: {suggestion['estimated_time']})")
        print(f"        (Difficulty: {suggestion['difficulty']})")
        print()
        print("Agent: Yes")
        print()
        print("System: Starting guide 'test_python_code'...")
        print("[Guide proceeds step-by-step]")
    else:
        print("System: [No relevant guides available]")

    print("\n✓ Agent didn't need to:")
    print("  - Know guide names")
    print("  - Browse catalog")
    print("  - Search for anything")
    print("  - Even know guides exist")
    print("\n✓ Agent just needed to:")
    print("  - Report what it did")


def demo_intent_discovery():
    """
    Layer 2: Declarative Intent-Based Discovery

    Good for "medium" agents - agent states what they want,
    system figures out the right guide.
    """
    print("\n" + "="*70)
    print("LAYER 2: DECLARATIVE INTENT-BASED DISCOVERY")
    print("="*70)
    print("\nScenario: Agent wants to test code")
    print("-"*70)

    guide = Guide(".")

    # Agent declares intent (doesn't need to know guide names)
    print("Agent: I want to test this code")
    print()

    # System interprets intent and finds right guide
    matches = guide.find_by_intent(
        "test this code",
        {"file_path": "main.py", "file_name": "main.py"}
    )

    if matches:
        best_match = matches[0]
        print(f"System: I'll help you test this code.")
        print(f"        Using: {best_match['guide']}")
        print(f"        {best_match['description']}")
        print(f"        (Confidence: {best_match['confidence']:.0%})")
        print()
        print("Agent: Great, let's do it")
        print()
        print("System: Starting guide 'test_python_code'...")
        print("[Guide proceeds step-by-step]")
    else:
        print("System: I couldn't find a relevant guide")

    print("\n✓ Agent didn't need to:")
    print("  - Know guide names")
    print("  - Know file type matters")
    print("  - Browse or search")
    print("\n✓ Agent just needed to:")
    print("  - State intent in plain language")


def demo_exploratory_discovery():
    """
    Layer 3: Exploratory Search/Browse

    Fallback for "smart" agents or edge cases.
    When agent wants to explore what's available.
    """
    print("\n" + "="*70)
    print("LAYER 3: EXPLORATORY SEARCH/BROWSE")
    print("="*70)
    print("\nScenario: Agent wants to see what testing guides are available")
    print("-"*70)

    guide = Guide(".")

    # Option A: Browse by category
    print("\nOption A: Browse by category")
    print("Agent: What testing guides do you have?")
    print()

    categories = guide.list_categories()
    print(f"System: Available categories: {', '.join(categories)}")
    print()

    testing_guides = guide.browse_category("testing")
    print(f"System: Testing guides ({len(testing_guides)} available):")
    for g in testing_guides:
        print(f"        • {g['guide']}")
        print(f"          {g['description']}")
        print(f"          Time: {g['estimated_time']}, Difficulty: {g['difficulty']}")

    # Option B: Search
    print("\nOption B: Search by keyword")
    print("Agent: Find guides for 'docker'")
    print()

    results = guide.search_guides("docker")
    if results:
        print(f"System: Found {len(results)} guide(s):")
        for r in results:
            print(f"        • {r['guide']}")
            print(f"          {r['description']}")
            print(f"          (Relevance: {r['confidence']:.0%})")
    else:
        print("System: No guides found")

    print("\n✓ Use this when:")
    print("  - Agent wants to explore")
    print("  - Looking for specific capability")
    print("  - Context/intent didn't match")


def demo_all_three_layers():
    """
    Show how all three layers work together.
    """
    print("\n" + "="*70)
    print("HOW ALL THREE LAYERS WORK TOGETHER")
    print("="*70)

    guide = Guide(".")

    print("\nScenario: Agent writes a Dockerfile")
    print("-"*70)

    # Layer 1: System offers automatically
    print("\n[LAYER 1] System detects context and offers help:")
    suggestion = guide.get_top_suggestion(
        "file_written",
        {"file_path": "Dockerfile", "file_name": "Dockerfile"}
    )
    if suggestion:
        print(f"System: {suggestion['suggestion']}")
        print(f"        (Guide: {suggestion['guide']})")

    # Layer 2: Agent declares intent
    print("\n[LAYER 2] Agent declares intent:")
    print("Agent: I want to build a docker image")
    matches = guide.find_by_intent(
        "build docker image",
        {"file_path": "Dockerfile", "file_name": "Dockerfile"}
    )
    if matches:
        print(f"System: Found guide '{matches[0]['guide']}'")

    # Layer 3: Agent searches
    print("\n[LAYER 3] Agent searches explicitly:")
    print("Agent: Find docker guides")
    results = guide.search_guides("docker")
    if results:
        print(f"System: Found {len(results)} docker guide(s)")

    print("\n✓ All three layers work seamlessly together")
    print("✓ Agent can use whichever fits its capability level")


def demo_guide_routing():
    """
    Show how the system routes to the right guide based on context.
    """
    print("\n" + "="*70)
    print("SMART GUIDE ROUTING")
    print("="*70)
    print("\nThe system automatically selects the right guide based on:")
    print("- File type (.py, .js, .sql)")
    print("- File location (migrations/, api/)")
    print("- Event (file_written, git_commit)")
    print("- Agent intent (test, deploy, validate)")
    print("-"*70)

    guide = Guide(".")

    scenarios = [
        ("file_written", {"file_path": "main.py"}, "Python file → Python testing"),
        ("file_written", {"file_path": "app.tsx"}, "TypeScript file → JS testing"),
        ("file_written", {"file_path": "migrations/001.sql"}, "Migration → DB validation"),
        ("file_written", {"file_path": "Dockerfile"}, "Dockerfile → Docker validation"),
        ("git_stage", {}, "Git stage → Pre-commit validation"),
    ]

    print("\nHow routing works:")
    for event, context, description in scenarios:
        suggestion = guide.get_top_suggestion(event, context)
        if suggestion:
            print(f"\n{description}")
            print(f"  → Guide: {suggestion['guide']}")
            print(f"  → Confidence: {suggestion['confidence']:.0%}")

    print("\n✓ Agent doesn't need to know the routing logic")
    print("✓ System handles all the intelligence")


def main():
    """Run all demos."""
    print("\n" + "="*70)
    print("BLACKBOX 5 GUIDE DISCOVERY - HOW AGENTS FIND GUIDES")
    print("="*70)
    print("\nQuestion: If there are 100 guides, how does an agent")
    print("know which one to use?")
    print("\nAnswer: The agent doesn't need to know.")
    print("The system connects the agent to the right guide.")

    demo_automatic_discovery()
    demo_intent_discovery()
    demo_exploratory_discovery()
    demo_all_three_layers()
    demo_guide_routing()

    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    print("\nThe system has THREE ways to connect agent to guide:")
    print("\n1. AUTOMATIC (Best for dumb agents)")
    print("   - System monitors context")
    print("   - Proactively offers relevant guides")
    print("   - Agent just says 'yes' or 'no'")
    print("\n2. DECLARATIVE (Good for medium agents)")
    print("   - Agent states intent in plain language")
    print("   - System interprets and routes to right guide")
    print("   - No guide names needed")
    print("\n3. EXPLORATORY (For smart agents/edge cases)")
    print("   - Browse by category")
    print("   - Search by keyword")
    print("   - Fallback option")
    print("\n✓ Agent never needs to know guide names")
    print("✓ Agent never needs to browse a catalog")
    print("✓ System does all the 'figuring out'")
    print("\nThe guide catalog is rich and queryable:")
    print("  - Triggers (when to offer)")
    print("  - Intent patterns (how to request)")
    print("  - Metadata (for search)")
    print("  - Dependencies (prerequisites)")
    print("\nThen smart routing:")
    print("  - Monitors context")
    print("  - Interprets intent")
    print("  - Matches guides")
    print("  - Ranks by confidence")
    print("  - Offers best match")
    print()


if __name__ == "__main__":
    main()
