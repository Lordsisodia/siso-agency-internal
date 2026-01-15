#!/usr/bin/env bash
#
# Test Context Variables Implementation
# Tests Phase 1: Context Variables from Swarm
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
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

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
    ((TESTS_RUN++))
}

test_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
}

test_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
}

# Test 1: Verify context-variables library exists
test_context_library_exists() {
    log_test "Context variables library exists"

    if [[ -d "$PROJECT_ROOT/4-scripts/lib/context-variables" ]]; then
        test_pass "Directory exists"
    else
        test_fail "Directory not found"
        return 1
    fi

    local required_files=(
        "types.py"
        "swarm.py"
        "examples.py"
        "__init__.py"
        "README.md"
    )

    for file in "${required_files[@]}"; do
        if [[ -f "$PROJECT_ROOT/4-scripts/lib/context-variables/$file" ]]; then
            test_pass "File exists: $file"
        else
            test_fail "File missing: $file"
        fi
    done
}

# Test 2: Verify handoff-with-context script exists
test_handoff_script_exists() {
    log_test "Handoff with context script exists"

    if [[ -f "$PROJECT_ROOT/4-scripts/agents/handoff-with-context.py" ]]; then
        test_pass "Script exists"
    else
        test_fail "Script not found"
        return 1
    fi

    if [[ -x "$PROJECT_ROOT/4-scripts/agents/handoff-with-context.py" ]]; then
        test_pass "Script is executable"
    else
        test_fail "Script is not executable"
    fi
}

# Test 3: Verify example scripts exist
test_example_scripts_exist() {
    log_test "Example scripts exist"

    if [[ -d "$PROJECT_ROOT/1-agents/4-specialists/context-examples" ]]; then
        test_pass "Examples directory exists"
    else
        test_fail "Examples directory not found"
        return 1
    fi

    local examples=(
        "single_tenant.py"
        "multi_tenant.py"
        "README.md"
    )

    for example in "${examples[@]}"; do
        if [[ -f "$PROJECT_ROOT/1-agents/4-specialists/context-examples/$example" ]]; then
            test_pass "Example exists: $example"
        else
            test_fail "Example missing: $example"
        fi
    done
}

# Test 4: Test Python imports
test_python_imports() {
    log_test "Python module imports"

    cd "$PROJECT_ROOT"

    # Test importing context variables
    if python3 -c "import sys; sys.path.insert(0, '4-scripts/lib/context-variables'); from types import Agent, Response, Result" 2>/dev/null; then
        test_pass "Can import types from context-variables"
    else
        test_fail "Cannot import types"
    fi

    # Test importing Swarm
    if python3 -c "import sys; sys.path.insert(0, '4-scripts/lib/context-variables'); from swarm import Swarm" 2>/dev/null; then
        test_pass "Can import Swarm from context-variables"
    else
        test_fail "Cannot import Swarm"
    fi
}

# Test 5: Verify Swarm dependencies
test_swarm_dependencies() {
    log_test "Swarm dependencies"

    cd "$PROJECT_ROOT"

    # Check for pydantic
    if python3 -c "import pydantic" 2>/dev/null; then
        test_pass "pydantic is installed"
    else
        test_fail "pydantic not installed (run: pip3 install pydantic)"
    fi

    # Check for openai
    if python3 -c "import openai" 2>/dev/null; then
        test_pass "openai is installed"
    else
        test_fail "openai not installed (run: pip3 install openai)"
    fi
}

# Test 6: Test handoff-with-context imports
test_handoff_imports() {
    log_test "Handoff with context imports"

    cd "$PROJECT_ROOT"

    if python3 "$PROJECT_ROOT/4-scripts/agents/handoff-with-context.py" test-import 2>/dev/null; then
        test_pass "handoff-with-context.py imports successfully"
    else
        test_fail "handoff-with-context.py import failed"
    fi
}

# Test 7: Verify integration with existing agent handoff
test_existing_handoff_integration() {
    log_test "Integration with existing agent-handoff.sh"

    if [[ -f "$PROJECT_ROOT/4-scripts/agents/agent-handoff.sh" ]]; then
        test_pass "Existing agent-handoff.sh found"
    else
        test_fail "agent-handoff.sh not found"
    fi
}

# Run all tests
main() {
    log_info "Starting Phase 1: Context Variables Tests"
    log_info "Project root: $PROJECT_ROOT"
    echo ""

    test_context_library_exists
    echo ""

    test_handoff_script_exists
    echo ""

    test_example_scripts_exist
    echo ""

    test_python_imports
    echo ""

    test_swarm_dependencies
    echo ""

    test_handoff_imports
    echo ""

    test_existing_handoff_integration
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
        log_info "✅ All tests passed! Phase 1 is complete."
        return 0
    else
        log_error "❌ Some tests failed. Please review the errors above."
        return 1
    fi
}

main "$@"
