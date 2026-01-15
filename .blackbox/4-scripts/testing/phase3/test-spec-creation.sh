#!/usr/bin/env bash
set -euo pipefail

# Phase 3 Test: Spec Creation Library
# Tests the core spec creation functionality

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

# Assert file exists
assert_file_exists() {
    local file="$1"
    local description="${2:-File exists: $file}"

    print_test "$description"
    if [[ -f "$file" ]]; then
        print_pass "$description"
        return 0
    else
        print_fail "$description" "File not found: $file"
        return 1
    fi
}

# Assert directory exists
assert_dir_exists() {
    local dir="$1"
    local description="${2:-Directory exists: $dir}"

    print_test "$description"
    if [[ -d "$dir" ]]; then
        print_pass "$description"
        return 0
    else
        print_fail "$description" "Directory not found: $dir"
        return 1
    fi
}

# Assert Python import works
assert_python_import() {
    local module="$1"
    local description="${2:-Python import: $module}"

    print_test "$description"
    if python3 -c "import $module" 2>/dev/null; then
        print_pass "$description"
        return 0
    else
        print_fail "$description" "Failed to import $module"
        return 1
    fi
}

# Assert command succeeds
assert_command_succeeds() {
    local command="$1"
    local description="${2:-Command succeeds: $command}"

    print_test "$description"
    if eval "$command" >/dev/null 2>&1; then
        print_pass "$description"
        return 0
    else
        print_fail "$description" "Command failed"
        return 1
    fi
}

# Test 1: Spec creation library structure
test_library_structure() {
    print_header "Test 1: Spec Creation Library Structure"

    assert_dir_exists "$SPEC_LIB_DIR" "Spec creation library directory exists"
    assert_file_exists "${SPEC_LIB_DIR}/__init__.py" "__init__.py exists"
    assert_file_exists "${SPEC_LIB_DIR}/spec_types.py" "spec_types.py exists"
    assert_file_exists "${SPEC_LIB_DIR}/questioning.py" "questioning.py exists"
    assert_file_exists "${SPEC_LIB_DIR}/validation.py" "validation.py exists"
    assert_file_exists "${SPEC_LIB_DIR}/analyze.py" "analyze.py exists"
    assert_file_exists "${SPEC_LIB_DIR}/README.md" "README.md exists"
    assert_dir_exists "${SPEC_LIB_DIR}/examples" "Examples directory exists"

    echo ""
}

# Test 2: Python imports
test_python_imports() {
    print_header "Test 2: Python Imports"

    cd "$SPEC_LIB_DIR"

    assert_python_import "spec_types" "Import spec_types module"
    assert_python_import "questioning" "Import questioning module"
    assert_python_import "validation" "Import validation module"
    assert_python_import "analyze" "Import analyze module"

    echo ""
}

# Test 3: SpecType enum
test_spec_types() {
    print_header "Test 3: SpecType Enum"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_spec_types.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import SpecType, SpecMetadata, SpecSection, UserStory, AcceptanceCriterion

# Test SpecType enum
assert hasattr(SpecType, 'PRD')
assert hasattr(SpecType, 'TECHNICAL_SPEC')
assert hasattr(SpecType, 'API_SPEC')
assert hasattr(SpecType, 'DATABASE_SCHEMA')
assert hasattr(SpecType, 'TEST_PLAN')
assert hasattr(SpecType, 'UX_SPEC')

# Test SpecType values
assert SpecType.PRD.value == 'prd'
assert SpecType.TECHNICAL_SPEC.value == 'technical-spec'

# Test SpecMetadata creation
metadata = SpecMetadata(
    spec_id="test-001",
    spec_type=SpecType.PRD,
    title="Test PRD",
    version="1.0.0",
    status="draft"
)
assert metadata.spec_id == "test-001"
assert metadata.spec_type == SpecType.PRD
assert metadata.title == "Test PRD"

# Test UserStory
story = UserStory(
    id="US-001",
    as_a="user",
    i_want="to login",
    so_that="I can access my account"
)
assert story.id == "US-001"
assert story.as_a == "user"

# Test AcceptanceCriterion
criterion = AcceptanceCriterion(
    given="user is on login page",
    when="user enters valid credentials",
    then="user is redirected to dashboard"
)
assert criterion.given == "user is on login page"

print("All spec_types tests passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "SpecType enum and classes work correctly"
    rm -f "$test_script"

    echo ""
}

# Test 4: Spec serialization
test_spec_serialization() {
    print_header "Test 4: Spec Serialization"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_serialization.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
import json
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection

# Create a test spec
metadata = SpecMetadata(
    spec_id="test-001",
    spec_type=SpecType.PRD,
    title="Test PRD",
    version="1.0.0",
    status="draft"
)

sections = [
    SpecSection(
        title="Overview",
        content="This is a test PRD",
        order=1
    ),
    SpecSection(
        title="Requirements",
        content="Some requirements",
        order=2
    )
]

spec = Spec(
    metadata=metadata,
    sections=sections
)

# Test to_dict
spec_dict = spec.to_dict()
assert spec_dict['metadata']['spec_id'] == "test-001"
assert len(spec_dict['sections']) == 2
assert spec_dict['sections'][0]['title'] == "Overview"

# Test from_dict
spec2 = Spec.from_dict(spec_dict)
assert spec2.metadata.spec_id == spec.metadata.spec_id
assert len(spec2.sections) == len(spec.sections)

# Test to_json
spec_json = spec.to_json()
parsed = json.loads(spec_json)
assert parsed['metadata']['spec_id'] == "test-001"

# Test from_json
spec3 = Spec.from_json(spec_json)
assert spec3.metadata.spec_id == spec.metadata.spec_id

print("All serialization tests passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Spec serialization works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 5: PRD generation
test_prd_generation() {
    print_header "Test 5: PRD Generation"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_prd.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection, UserStory, AcceptanceCriterion

# Create a PRD
stories = [
    UserStory(
        id="US-001",
        as_a="user",
        i_want="to login",
        so_that="I can access my account"
    )
]

criteria = [
    AcceptanceCriterion(
        given="user is on login page",
        when="user enters valid credentials",
        then="user is redirected to dashboard"
    )
]

sections = [
    SpecSection(title="Overview", content="Test PRD", order=1),
    SpecSection(title="User Stories", content="", order=2, user_stories=stories),
    SpecSection(title="Acceptance Criteria", content="", order=3, acceptance_criteria=criteria)
]

metadata = SpecMetadata(
    spec_id="prd-001",
    spec_type=SpecType.PRD,
    title="Login Feature PRD",
    version="1.0.0"
)

prd = Spec(metadata=metadata, sections=sections)

# Verify structure
assert prd.metadata.spec_type == SpecType.PRD
assert len(prd.sections) == 3
assert len(prd.sections[1].user_stories) == 1
assert len(prd.sections[2].acceptance_criteria) == 1

print("PRD generation test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "PRD generation works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 6: Technical spec generation
test_technical_spec_generation() {
    print_header "Test 6: Technical Spec Generation"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_tech_spec.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection

# Create a technical spec
sections = [
    SpecSection(title="Technical Requirements", content="Must use Python 3.9+", order=1),
    SpecSection(title="Architecture", content="Microservices architecture", order=2),
    SpecSection(title="API Design", content="RESTful API", order=3)
]

metadata = SpecMetadata(
    spec_id="tech-001",
    spec_type=SpecType.TECHNICAL_SPEC,
    title="API Technical Specification",
    version="1.0.0"
)

tech_spec = Spec(metadata=metadata, sections=sections)

# Verify structure
assert tech_spec.metadata.spec_type == SpecType.TECHNICAL_SPEC
assert len(tech_spec.sections) == 3
assert tech_spec.sections[0].title == "Technical Requirements"

print("Technical spec generation test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Technical spec generation works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 7: Database schema spec
test_database_schema_spec() {
    print_header "Test 7: Database Schema Spec"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_db_spec.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection

# Create a database schema spec
sections = [
    SpecSection(title="Schema Changes", content="Create users table", order=1),
    SpecSection(title="Migrations", content="Migration path v1 to v2", order=2)
]

metadata = SpecMetadata(
    spec_id="db-001",
    spec_type=SpecType.DATABASE_SCHEMA,
    title="Users Table Schema",
    version="1.0.0"
)

db_spec = Spec(metadata=metadata, sections=sections)

# Verify structure
assert db_spec.metadata.spec_type == SpecType.DATABASE_SCHEMA
assert len(db_spec.sections) == 2

print("Database schema spec test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Database schema spec works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 8: API spec generation
test_api_spec_generation() {
    print_header "Test 8: API Spec Generation"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_api_spec.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection

# Create an API spec
sections = [
    SpecSection(title="Endpoints", content="GET /api/users", order=1),
    SpecSection(title="Controllers", content="UsersController", order=2)
]

metadata = SpecMetadata(
    spec_id="api-001",
    spec_type=SpecType.API_SPEC,
    title="Users API Specification",
    version="1.0.0"
)

api_spec = Spec(metadata=metadata, sections=sections)

# Verify structure
assert api_spec.metadata.spec_type == SpecType.API_SPEC
assert len(api_spec.sections) == 2

print("API spec generation test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "API spec generation works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 9: Test plan spec
test_test_plan_spec() {
    print_header "Test 9: Test Plan Spec"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_test_plan.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection

# Create a test plan spec
sections = [
    SpecSection(title="Test Coverage", content="Unit tests for all modules", order=1),
    SpecSection(title="Mocking Requirements", content="Mock external APIs", order=2)
]

metadata = SpecMetadata(
    spec_id="test-001",
    spec_type=SpecType.TEST_PLAN,
    title="Module Test Plan",
    version="1.0.0"
)

test_plan = Spec(metadata=metadata, sections=sections)

# Verify structure
assert test_plan.metadata.spec_type == SpecType.TEST_PLAN
assert len(test_plan.sections) == 2

print("Test plan spec test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Test plan spec works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 10: UX spec generation
test_ux_spec_generation() {
    print_header "Test 10: UX Spec Generation"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_ux_spec.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection

# Create a UX spec
sections = [
    SpecSection(title="User Flow", content="Login -> Dashboard", order=1),
    SpecSection(title="UI Components", content="Login form, dashboard", order=2)
]

metadata = SpecMetadata(
    spec_id="ux-001",
    spec_type=SpecType.UX_SPEC,
    title="Login UX Specification",
    version="1.0.0"
)

ux_spec = Spec(metadata=metadata, sections=sections)

# Verify structure
assert ux_spec.metadata.spec_type == SpecType.UX_SPEC
assert len(ux_spec.sections) == 2

print("UX spec generation test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "UX spec generation works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 11: Spec validation
test_spec_validation() {
    print_header "Test 11: Spec Validation"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_validation.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection

# Create valid spec
metadata = SpecMetadata(
    spec_id="test-001",
    spec_type=SpecType.PRD,
    title="Test PRD",
    version="1.0.0"
)

sections = [
    SpecSection(title="Overview", content="Test content", order=1)
]

spec = Spec(metadata=metadata, sections=sections)

# Test validation
assert spec.metadata.spec_id is not None
assert spec.metadata.spec_type is not None
assert spec.metadata.title is not None
assert len(spec.sections) > 0
assert all(s.title for s in spec.sections)

print("Spec validation test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Spec validation works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 12: Edge cases
test_edge_cases() {
    print_header "Test 12: Edge Cases"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_edge_cases.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import Spec, SpecMetadata, SpecType, SpecSection

# Test empty sections list
metadata = SpecMetadata(
    spec_id="test-001",
    spec_type=SpecType.PRD,
    title="Test PRD"
)

spec = Spec(metadata=metadata, sections=[])
assert len(spec.sections) == 0

# Test special characters in content
section = SpecSection(
    title="Test <>&\"",
    content="Content with 'quotes' and \"double quotes\"",
    order=1
)
assert '<' in section.title
assert '"' in section.content

# Test very long content
long_content = "A" * 10000
section = SpecSection(title="Long Content", content=long_content, order=1)
assert len(section.content) == 10000

print("Edge cases test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Edge cases handled correctly"
    rm -f "$test_script"

    echo ""
}

# Main execution
main() {
    info "Starting Phase 3: Spec Creation Tests"
    echo ""

    test_library_structure
    test_python_imports
    test_spec_types
    test_spec_serialization
    test_prd_generation
    test_technical_spec_generation
    test_database_schema_spec
    test_api_spec_generation
    test_test_plan_spec
    test_ux_spec_generation
    test_spec_validation
    test_edge_cases

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
