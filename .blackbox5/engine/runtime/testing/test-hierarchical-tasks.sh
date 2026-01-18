#!/usr/bin/env bash
#
# Test Hierarchical Tasks Implementation
# Tests Phase 2: Hierarchical Tasks from CrewAI
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_test() { echo -e "${BLUE}[TEST]${NC} $1"; ((TESTS_RUN++)); }
test_pass() { echo -e "${GREEN}[PASS]${NC} $1"; ((TESTS_PASSED++)); }
test_fail() { echo -e "${RED}[FAIL]${NC} $1"; ((TESTS_FAILED++)); }

# Test 1: Verify hierarchical-tasks library
test_hierarchical_library_exists() {
    log_test "Hierarchical tasks library exists"

    if [[ -d "$PROJECT_ROOT/4-scripts/lib/hierarchical-tasks" ]]; then
        test_pass "Directory exists"
    else
        test_fail "Directory not found"
        return 1
    fi

    local required_files=(
        "__init__.py"
        "hierarchical_task.py"
        "crewai_task.py"
        "README.md"
    )

    for file in "${required_files[@]}"; do
        if [[ -f "$PROJECT_ROOT/4-scripts/lib/hierarchical-tasks/$file" ]]; then
            test_pass "File exists: $file"
        else
            test_fail "File missing: $file"
        fi
    done
}

# Test 2: Verify task-breakdown library
test_breakdown_library_exists() {
    log_test "Task breakdown library exists"

    if [[ -d "$PROJECT_ROOT/4-scripts/lib/task-breakdown" ]]; then
        test_pass "Directory exists"
    else
        test_fail "Directory not found"
        return 1
    fi

    local required_files=(
        "write_tasks.py"
        "project_manager.py"
        "README.md"
    )

    for file in "${required_files[@]}"; do
        if [[ -f "$PROJECT_ROOT/4-scripts/lib/task-breakdown/$file" ]]; then
            test_pass "File exists: $file"
        else
            test_fail "File missing: $file"
        fi
    done
}

# Test 3: Verify hierarchical plan manager
test_plan_manager_exists() {
    log_test "Hierarchical plan manager exists"

    if [[ -f "$PROJECT_ROOT/4-scripts/planning/hierarchical-plan.py" ]]; then
        test_pass "hierarchical-plan.py exists"
    else
        test_fail "hierarchical-plan.py not found"
    fi

    if [[ -x "$PROJECT_ROOT/4-scripts/planning/hierarchical-plan.py" ]]; then
        test_pass "hierarchical-plan.py is executable"
    else
        test_fail "hierarchical-plan.py is not executable"
    fi
}

# Test 4: Verify wrapper scripts
test_wrapper_scripts_exist() {
    log_test "Wrapper scripts exist"

    if [[ -f "$PROJECT_ROOT/hierarchical-plan.sh" ]]; then
        test_pass "hierarchical-plan.sh exists"
    else
        test_fail "hierarchical-plan.sh not found"
    fi

    if [[ -f "$PROJECT_ROOT/auto-breakdown.sh" ]]; then
        test_pass "auto-breakdown.sh exists"
    else
        test_fail "auto-breakdown.sh not found"
    fi
}

# Test 5: Verify example scripts
test_example_scripts_exist() {
    log_test "Example scripts exist"

    if [[ -d "$PROJECT_ROOT/1-agents/4-specialists/hierarchical-examples" ]]; then
        test_pass "Examples directory exists"
    else
        test_fail "Examples directory not found"
        return 1
    fi

    local examples=(
        "simple_hierarchy.py"
        "auto_breakdown_example.py"
        "checklist_integration.py"
        "README.md"
    )

    for example in "${examples[@]}"; do
        if [[ -f "$PROJECT_ROOT/1-agents/4-specialists/hierarchical-examples/$example" ]]; then
            test_pass "Example exists: $example"
        else
            test_fail "Example missing: $example"
        fi
    done
}

# Test 6: Test Python imports
test_python_imports() {
    log_test "Python module imports"

    cd "$PROJECT_ROOT"

    # Test hierarchical tasks import
    if python3 -c "import sys; sys.path.insert(0, '4-scripts/lib/hierarchical-tasks'); from hierarchical_task import HierarchicalTask" 2>/dev/null; then
        test_pass "Can import HierarchicalTask"
    else
        test_fail "Cannot import HierarchicalTask"
    fi

    # Test task breakdown import
    if python3 -c "import sys; sys.path.insert(0, '4-scripts/lib/task-breakdown'); from write_tasks import TaskBreakdownEngine" 2>/dev/null; then
        test_pass "Can import TaskBreakdownEngine"
    else
        test_fail "Cannot import TaskBreakdownEngine"
    fi
}

# Test 7: Test basic functionality
test_basic_functionality() {
    log_test "Basic functionality test"

    cd "$PROJECT_ROOT"

    # Test creating a simple hierarchy
    python3 << 'EOF'
import sys
sys.path.insert(0, '4-scripts/lib/hierarchical-tasks')
from hierarchical_task import HierarchicalTask

# Create root
root = HierarchicalTask(description="Root task")
child1 = HierarchicalTask(description="Child 1", parent_task=root)
child2 = HierarchicalTask(description="Child 2", parent_task=root)

# Verify structure
assert root.parent_task is None
assert child1.parent_task == root
assert child2.parent_task == root
assert len(root.children) == 2
assert child1.get_depth() == 1

print("✅ Basic hierarchy test passed")
EOF

    if [[ $? -eq 0 ]]; then
        test_pass "Basic functionality works"
    else
        test_fail "Basic functionality test failed"
    fi
}

# Run all tests
main() {
    log_info "Starting Phase 2: Hierarchical Tasks Tests"
    log_info "Project root: $PROJECT_ROOT"
    echo ""

    test_hierarchical_library_exists
    echo ""

    test_breakdown_library_exists
    echo ""

    test_plan_manager_exists
    echo ""

    test_wrapper_scripts_exist
    echo ""

    test_example_scripts_exist
    echo ""

    test_python_imports
    echo ""

    test_basic_functionality
    echo ""

    # Summary
    log_info "Test Summary:"
    echo "  Tests Run:    $TESTS_RUN"
    echo -e "  ${GREEN}Tests Passed:  $TESTS_PASSED${NC}"
    if [[ $TESTS_FAILED -gt 0 ]]; then
        echo -e "  ${RED}Tests Failed:  $TESTS_FAILED${NC}"
    fi
    echo ""

    if [[ $TESTS_FAILED -eq 0 ]]; then
        log_info "✅ All tests passed! Phase 2 is complete."
        return 0
    else
        log_error "❌ Some tests failed."
        return 1
    fi
}

main "$@"
