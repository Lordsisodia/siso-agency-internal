#!/bin/bash
# Test Ralph Runtime + Vibe Kanban Integration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="$(pwd)"
RALPH_DIR="$SCRIPT_DIR"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Ralph Runtime + Vibe Kanban Integration Test           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Workspace: $WORKSPACE"
echo ""

# Test 1: Check if VibeIntegration module loads
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Loading VibeIntegration module"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 - << EOF
import sys
from pathlib import Path

ralph_path = Path("$WORKSPACE") / ".blackbox5" / "engine" / "runtime"
sys.path.insert(0, str(ralph_path))

try:
    from ralph.vibe_integration import VibeIntegration
    print("✅ VibeIntegration module loaded successfully")
except Exception as e:
    print(f"❌ Failed to load VibeIntegration: {e}")
    sys.exit(1)
EOF

echo ""

# Test 2: Test autonomous task detection
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Testing autonomous task detection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 - << EOF
import sys
from pathlib import Path

ralph_path = Path("$WORKSPACE") / ".blackbox5" / "engine" / "runtime"
sys.path.insert(0, str(ralph_path))

from ralph.vibe_integration import VibeIntegration

integration = VibeIntegration(Path("$WORKSPACE"))

# Test cases
test_tasks = [
    {
        "title": "[auto] Add dark mode toggle",
        "description": "Add dark mode to settings",
        "expected": True
    },
    {
        "title": "Fix login bug",
        "description": "Users cannot login",
        "expected": False
    },
    {
        "title": "[ralph] Refactor components",
        "description": "Clean up component structure",
        "expected": True
    },
    {
        "title": "[loop] Add tests",
        "description": "Add unit tests for API",
        "expected": True
    }
]

all_passed = True
for i, test in enumerate(test_tasks, 1):
    task = {"title": test["title"], "description": test["description"]}
    result = integration.is_autonomous_task(task)
    expected = test["expected"]
    status = "✅" if result == expected else "❌"

    print(f"{status} Test {i}: {test['title']}")
    print(f"   Expected: {expected}, Got: {result}")

    if result != expected:
        all_passed = False

if all_passed:
    print("\n✅ All autonomous task detection tests passed!")
else:
    print("\n❌ Some tests failed")
    sys.exit(1)
EOF

echo ""

# Test 3: Test PRD generation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Testing PRD generation from task"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 - << EOF
import sys
import json
from pathlib import Path

ralph_path = Path("$WORKSPACE") / ".blackbox5" / "engine" / "runtime"
sys.path.insert(0, str(ralph_path))

from ralph.vibe_integration import VibeIntegration

integration = VibeIntegration(Path("$WORKSPACE"))

# Test task
task = {
    "id": "test-task-1",
    "title": "[auto] Add user authentication",
    "description": "Implement JWT-based authentication with login and registration"
}

# Generate PRD
prd = integration.generate_prd_from_task(task)

print("✅ PRD generated successfully")
print("")
print("PRD Structure:")
print(f"  - Branch: {prd['branchName']}")
print(f"  - Stories: {len(prd['userStories'])}")
print("")

# Show each story
for story in prd['userStories']:
    print(f"  Story {story['id']}: {story['title']}")
    print(f"    - Priority: {story['priority']}")
    print(f"    - Agent: {story.get('agent', 'auto')}")
    print(f"    - Tools: {story.get('tools', [])}")
    print("")

# Validate PRD structure
required_fields = ['branchName', 'userStories']
missing_fields = [f for f in required_fields if f not in prd]

if missing_fields:
    print(f"❌ PRD missing required fields: {missing_fields}")
    sys.exit(1)

# Validate each story
for i, story in enumerate(prd['userStories']):
    story_required = ['id', 'title', 'priority', 'passes']
    story_missing = [f for f in story_required if f not in story]

    if story_missing:
        print(f"❌ Story {i+1} missing required fields: {story_missing}")
        sys.exit(1)

print("✅ PRD validation passed!")
EOF

echo ""

# Test 4: Create example PRD file
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Creating example PRD files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 << EOF
import sys
import json
from pathlib import Path

ralph_path = Path("$WORKSPACE") / ".blackbox5" / "engine" / "runtime"
sys.path.insert(0, str(ralph_path))

from ralph.vibe_integration import VibeIntegration

integration = VibeIntegration(Path("$WORKSPACE"))

# Example tasks
example_tasks = [
    {
        "id": "example-feature",
        "title": "[auto] Add dark mode toggle",
        "description": "Add a dark mode toggle to settings page with localStorage persistence"
    },
    {
        "id": "example-bugfix",
        "title": "[ralph] Fix login authentication error",
        "description": "Users are experiencing authentication errors when logging in with valid credentials"
    },
    {
        "id": "example-refactor",
        "title": "[loop] Refactor user service",
        "description": "Clean up and reorganize the user service module for better maintainability"
    }
]

for task in example_tasks:
    prd = integration.generate_prd_from_task(task)
    prd_path = Path("$WORKSPACE") / f"prd-{task['id']}.json"

    with open(prd_path, 'w') as f:
        json.dump(prd, f, indent=2)

    print(f"✅ Created: {prd_path.name}")
    print(f"   Branch: {prd['branchName']}")
    print(f"   Stories: {len(prd['userStories'])}")
    print("")
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ All tests passed!"
echo ""
echo "Example PRD files created:"
echo "  - prd-example-feature.json"
echo "  - prd-example-bugfix.json"
echo "  - prd-example-refactor.json"
echo ""
echo "Next steps:"
echo "  1. Review the generated PRD files"
echo "  2. Test Ralph Runtime with: .blackbox5/engine/runtime/ralph/start-ralph.sh"
echo "  3. Create a task in Vibe Kanban with [auto] tag"
echo ""
