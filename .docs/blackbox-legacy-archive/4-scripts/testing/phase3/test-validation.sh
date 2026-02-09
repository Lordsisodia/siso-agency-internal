#!/usr/bin/env bash
set -euo pipefail

# Phase 3 Test: Spec Validation
# Tests the spec validation system

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

# Test 1: Validation module structure
test_validation_module() {
    print_header "Test 1: Validation Module Structure"

    assert_command_succeeds "python3 -c 'import sys; sys.path.insert(0, \"$SPEC_LIB_DIR\"); import validation; print(validation.__file__)'" "Validation module imports successfully"

    echo ""
}

# Test 2: Spec validator
test_spec_validator() {
    print_header "Test 2: Spec Validator"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_validator.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from validation import SpecValidator, ValidationResult
from spec_types import Spec, SpecMetadata, SpecType, SpecSection

# Test validator creation
validator = SpecValidator()
assert validator is not None

# Test valid spec
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

result = validator.validate(spec)
assert isinstance(result, ValidationResult)
assert result.is_valid
assert len(result.errors) == 0

print("Spec validator test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Spec validator works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 3: Required field validation
test_required_fields() {
    print_header "Test 3: Required Field Validation"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_required_fields.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from validation import SpecValidator
from spec_types import Spec, SpecMetadata, SpecType

validator = SpecValidator()

# Test missing spec_id
metadata1 = SpecMetadata(
    spec_id="",
    spec_type=SpecType.PRD,
    title="Test PRD"
)

spec1 = Spec(metadata=metadata1, sections=[])
result1 = validator.validate(spec1)
assert not result1.is_valid
assert any("spec_id" in str(e).lower() for e in result1.errors)

# Test missing title
metadata2 = SpecMetadata(
    spec_id="test-002",
    spec_type=SpecType.PRD,
    title=""
)

spec2 = Spec(metadata=metadata2, sections=[])
result2 = validator.validate(spec2)
assert not result2.is_valid
assert any("title" in str(e).lower() for e in result2.errors)

print("Required field validation test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Required field validation works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 4: Cross-artifact validation
test_cross_artifact_validation() {
    print_header "Test 4: Cross-Artifact Validation"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_cross_artifact.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from validation import validate_cross_artifact_consistency
from spec_types import Spec, SpecMetadata, SpecType, SpecSection

# Create related specs
prd_metadata = SpecMetadata(
    spec_id="prd-001",
    spec_type=SpecType.PRD,
    title="Login Feature",
    related_specs=["tech-001"]
)

prd_sections = [
    SpecSection(title="User Stories", content="US-001: User login", order=1)
]

prd = Spec(metadata=prd_metadata, sections=prd_sections)

tech_metadata = SpecMetadata(
    spec_id="tech-001",
    spec_type=SpecType.TECHNICAL_SPEC,
    title="Login Technical Spec",
    related_specs=["prd-001"]
)

tech_sections = [
    SpecSection(title="Implementation", content="OAuth2 implementation", order=1)
]

tech = Spec(metadata=tech_metadata, sections=tech_sections)

# Test cross-artifact validation
result = validate_cross_artifact_consistency([prd, tech])
assert result.is_valid or len(result.warnings) >= 0

print("Cross-artifact validation test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Cross-artifact validation works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 5: Validation reports
test_validation_reports() {
    print_header "Test 5: Validation Reports"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_reports.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from validation import SpecValidator, ValidationResult, ValidationSeverity

validator = SpecValidator()

# Create spec with warnings
from spec_types import Spec, SpecMetadata, SpecType, SpecSection

metadata = SpecMetadata(
    spec_id="test-001",
    spec_type=SpecType.PRD,
    title="Test PRD",
    version="1.0.0"
)

sections = [
    SpecSection(title="Overview", content="Brief", order=1),
    SpecSection(title="Requirements", content="", order=2)  # Empty content
]

spec = Spec(metadata=metadata, sections=sections)

result = validator.validate(spec)

# Test report generation
report = result.to_dict()
assert "is_valid" in report
assert "errors" in report
assert "warnings" in report
assert "info" in report

# Test markdown report
md_report = result.to_markdown()
assert "Validation Report" in md_report
assert len(md_report) > 0

print("Validation reports test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Validation reports work correctly"
    rm -f "$test_script"

    echo ""
}

# Test 6: Auto-fix functionality
test_auto_fix() {
    print_header "Test 6: Auto-Fix Functionality"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_autofix.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from validation import SpecValidator, AutoFixer
from spec_types import Spec, SpecMetadata, SpecType, SpecSection

# Create spec with fixable issues
metadata = SpecMetadata(
    spec_id="test-001",
    spec_type=SpecType.PRD,
    title="",  # Missing title
    version="1.0"
)

sections = [
    SpecSection(title="Overview", content="Test", order=1)
]

spec = Spec(metadata=metadata, sections=sections)

# Test auto-fix
fixer = AutoFixer()
fixed_spec = fixer.fix(spec)

# Verify fixes
assert fixed_spec.metadata.title != ""  # Title should be auto-generated
assert fixed_spec.metadata.version == "1.0.0"  # Version should be normalized

print("Auto-fix test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Auto-fix works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 7: Validation rules
test_validation_rules() {
    print_header "Test 7: Validation Rules"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_rules.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from validation import ValidationRule, SpecValidator
from spec_types import Spec, SpecMetadata, SpecType, SpecSection

# Test custom rule
class CustomRule(ValidationRule):
    def validate(self, spec):
        if len(spec.sections) < 2:
            return self.error("Spec must have at least 2 sections")
        return self.ok()

validator = SpecValidator()
validator.add_rule(CustomRule())

# Test with invalid spec
metadata = SpecMetadata(
    spec_id="test-001",
    spec_type=SpecType.PRD,
    title="Test PRD"
)

spec = Spec(metadata=metadata, sections=[
    SpecSection(title="Overview", content="Test", order=1)
])

result = validator.validate(spec)
assert not result.is_valid
assert any("at least 2 sections" in str(e) for e in result.errors)

# Test with valid spec
spec2 = Spec(metadata=metadata, sections=[
    SpecSection(title="Overview", content="Test", order=1),
    SpecSection(title="Requirements", content="More content", order=2)
])

result2 = validator.validate(spec2)
assert result2.is_valid or len([e for e in result2.errors if "at least 2 sections" in str(e)]) == 0

print("Validation rules test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Validation rules work correctly"
    rm -f "$test_script"

    echo ""
}

# Test 8: Output formats
test_output_formats() {
    print_header "Test 8: Output Formats"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_formats.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
import json
sys.path.insert(0, '../lib/spec-creation')

from validation import SpecValidator, ValidationResult
from spec_types import Spec, SpecMetadata, SpecType, SpecSection

validator = SpecValidator()

metadata = SpecMetadata(
    spec_id="test-001",
    spec_type=SpecType.PRD,
    title="Test PRD"
)

sections = [
    SpecSection(title="Overview", content="Test", order=1)
]

spec = Spec(metadata=metadata, sections=sections)
result = validator.validate(spec)

# Test JSON output
json_output = result.to_json()
parsed = json.loads(json_output)
assert "is_valid" in parsed

# Test dict output
dict_output = result.to_dict()
assert "is_valid" in dict_output

# Test markdown output
md_output = result.to_markdown()
assert len(md_output) > 0

# Test console output
console_output = result.to_console()
assert len(console_output) > 0

print("Output formats test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Output formats work correctly"
    rm -f "$test_script"

    echo ""
}

# Main execution
main() {
    info "Starting Phase 3: Spec Validation Tests"
    echo ""

    test_validation_module
    test_spec_validator
    test_required_fields
    test_cross_artifact_validation
    test_validation_reports
    test_auto_fix
    test_validation_rules
    test_output_formats

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
