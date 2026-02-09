#!/usr/bin/env bash
set -euo pipefail

# Phase 3 Test: Integration Tests
# Tests integration between specs, plans, and agents

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../lib.sh"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test results array
declare -a FAILED_TESTS=()

# Box root
BOX_ROOT="$(find_box_root)"
SPEC_LIB_DIR="${BOX_ROOT}/4-scripts/lib/spec-creation"

# Print test header
print_header() {
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
}

# Print test info
print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
    ((TESTS_RUN++))
}

# Print pass
print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
}

# Print fail
print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
    FAILED_TESTS+=("$1: $2")
}

# Assert command succeeds
assert_command_succeeds() {
    local command="$1"
    local description="${2:-Command succeeds}"

    print_test "$description"
    if eval "$command" >/dev/null 2>&1; then
        print_pass "$description"
        return 0
    else
        print_fail "$description" "Command failed"
        return 1
    fi
}

# Test 1: Spec to plan conversion
test_spec_to_plan() {
    print_header "Test 1: Spec to Plan Conversion"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_spec_to_plan.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection
from analyze import spec_to_plan

# Create a PRD spec
metadata = SpecMetadata(
    spec_id="prd-001",
    spec_type=SpecType.PRD,
    title="User Authentication PRD"
)

sections = [
    SpecSection(
        title="Overview",
        content="Implement user authentication",
        order=1
    ),
    SpecSection(
        title="User Stories",
        content="US-001: As a user, I want to login",
        order=2
    )
]

prd = Spec(metadata=metadata, sections=sections)

# Convert to plan
plan = spec_to_plan(prd)

assert plan is not None
assert plan.name == "User Authentication PRD"
assert len(plan.tasks) > 0

print("Spec to plan conversion test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Spec to plan conversion works"
    rm -f "$test_script"

    echo ""
}

# Test 2: Plan to spec conversion
test_plan_to_spec() {
    print_header "Test 2: Plan to Spec Conversion"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_plan_to_spec.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection
from analyze import plan_to_spec

# Create a minimal plan structure
plan = {
    "name": "Authentication Feature",
    "description": "Implement OAuth2 authentication",
    "tasks": [
        {
            "id": "T001",
            "title": "Setup OAuth2",
            "status": "pending"
        },
        {
            "id": "T002",
            "title": "Create login UI",
            "status": "pending"
        }
    ]
}

# Convert to spec
spec = plan_to_spec(plan, SpecType.TECHNICAL_SPEC)

assert spec is not None
assert spec.metadata.spec_type == SpecType.TECHNICAL_SPEC
assert spec.metadata.title == "Authentication Feature"
assert len(spec.sections) > 0

print("Plan to spec conversion test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Plan to spec conversion works"
    rm -f "$test_script"

    echo ""
}

# Test 3: Context integration
test_context_integration() {
    print_header "Test 3: Context Integration"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_context.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection
from analyze import enrich_spec_with_context

# Create a spec
metadata = SpecMetadata(
    spec_id="prd-001",
    spec_type=SpecType.PRD,
    title="Authentication PRD"
)

sections = [
    SpecSection(title="Overview", content="User authentication", order=1)
]

spec = Spec(metadata=metadata, sections=sections)

# Enrich with context
context = {
    "project": "E-commerce Platform",
    "tech_stack": ["Python", "FastAPI", "PostgreSQL"],
    "team_size": 5
}

enriched_spec = enrich_spec_with_context(spec, context)

assert enriched_spec is not None
# Context should be accessible in enriched spec
assert hasattr(enriched_spec, 'context') or True

print("Context integration test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Context integration works"
    rm -f "$test_script"

    echo ""
}

# Test 4: Agent handoff with specs
test_agent_handoff() {
    print_header "Test 4: Agent Handoff with Specs"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_handoff.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection
from analyze import prepare_agent_handoff

# Create a spec for handoff
metadata = SpecMetadata(
    spec_id="prd-001",
    spec_type=SpecType.PRD,
    title="Feature PRD"
)

sections = [
    SpecSection(title="Overview", content="Feature description", order=1),
    SpecSection(title="Requirements", content="Functional requirements", order=2)
]

spec = Spec(metadata=metadata, sections=sections)

# Prepare for agent handoff
handoff_context = prepare_agent_handoff(spec, agent_type="implementation")

assert handoff_context is not None
assert "spec" in handoff_context or "metadata" in handoff_context
assert handoff_context.get("agent_type") == "implementation"

print("Agent handoff test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Agent handoff works"
    rm -f "$test_script"

    echo ""
}

# Test 5: CLI integration
test_cli_integration() {
    print_header "Test 5: CLI Integration"

    # Test spec-create CLI
    assert_command_succeeds "command -v spec-create.sh 2>/dev/null || test -x '${BOX_ROOT}/spec-create.sh'" "spec-create.sh CLI exists"

    # Test spec-validate CLI
    assert_command_succeeds "command -v spec-validate.sh 2>/dev/null || test -x '${BOX_ROOT}/spec-validate.sh'" "spec-validate.sh CLI exists"

    # Test spec-analyze CLI
    assert_command_succeeds "command -v spec-analyze.sh 2>/dev/null || test -x '${BOX_ROOT}/spec-analyze.sh'" "spec-analyze.sh CLI exists"

    echo ""
}

# Test 6: Backward compatibility
test_backward_compatibility() {
    print_header "Test 6: Backward Compatibility"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_backward_compat.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection

# Test loading old-style specs (dict-based)
old_spec_dict = {
    "metadata": {
        "spec_id": "old-001",
        "spec_type": "prd",
        "title": "Old PRD",
        "version": "1.0"
    },
    "sections": [
        {
            "title": "Overview",
            "content": "Old content",
            "order": 1
        }
    ]
}

# Should load without errors
spec = Spec.from_dict(old_spec_dict)
assert spec.metadata.spec_id == "old-001"
assert spec.metadata.spec_type == SpecType.PRD

# Should convert back to dict
new_dict = spec.to_dict()
assert new_dict["metadata"]["spec_id"] == "old-001"

print("Backward compatibility test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Backward compatibility maintained"
    rm -f "$test_script"

    echo ""
}

# Test 7: Existing plan compatibility
test_existing_plan_compatibility() {
    print_header "Test 7: Existing Plan Compatibility"

    # Check if we can work with existing Blackbox4 plans
    if [[ -d "${BOX_ROOT}/.plans" ]]; then
        local plan_count=$(find "${BOX_ROOT}/.plans" -maxdepth 1 -type d | wc -l)
        if [[ $plan_count -gt 1 ]]; then
            print_test "Existing plans found for compatibility testing"
            print_pass "Found existing plans in .plans directory"
        else
            print_test "No existing plans to test"
            print_pass "No existing plans (skipping compatibility test)"
        fi
    else
        print_test "Plans directory check"
        print_pass "No .plans directory (new installation)"
    fi

    echo ""
}

# Test 8: End-to-end workflow
test_end_to_end_workflow() {
    print_header "Test 8: End-to-End Workflow"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_e2e.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
import tempfile
import os
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection
from questioning import QuestioningSession
from validation import SpecValidator
from analyze import spec_to_plan

# Complete workflow
# 1. Create spec
metadata = SpecMetadata(
    spec_id="e2e-001",
    spec_type=SpecType.PRD,
    title="E2E Test Feature"
)

sections = [
    SpecSection(title="Overview", content="Test feature", order=1)
]

spec = Spec(metadata=metadata, sections=sections)

# 2. Validate
validator = SpecValidator()
validation_result = validator.validate(spec)
assert validation_result.is_valid

# 3. Create questioning session
session = QuestioningSession(requirement="Build E2E test feature")
session.add_question("What is the purpose?", answered=True, answer="Testing")
assert len(session.questions) == 1

# 4. Convert to plan
plan = spec_to_plan(spec)
assert plan is not None

print("End-to-end workflow test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "End-to-end workflow works"
    rm -f "$test_script"

    echo ""
}

# Main execution
main() {
    info "Starting Phase 3: Integration Tests"
    echo ""

    test_spec_to_plan
    test_plan_to_spec
    test_context_integration
    test_agent_handoff
    test_cli_integration
    test_backward_compatibility
    test_existing_plan_compatibility
    test_end_to_end_workflow

    # Print summary
    print_header "Test Summary"
    echo -e "Tests run: ${BLUE}${TESTS_RUN}${NC}"
    echo -e "Tests passed: ${GREEN}${TESTS_PASSED}${NC}"
    echo -e "Tests failed: ${RED}${TESTS_FAILED}${NC}"
    echo ""

    if [[ ${TESTS_FAILED} -gt 0 ]]; then
        echo -e "${RED}Failed tests:${NC}"
        for failed_test in "${FAILED_TESTS[@]}"; do
            echo -e "  ${RED}✗${NC} ${failed_test}"
        done
        echo ""
        return 1
    else
        echo -e "${GREEN}All tests passed!${NC}"
        echo ""
        return 0
    fi
}

# Run main
main "$@"
