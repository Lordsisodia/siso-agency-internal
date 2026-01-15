#!/usr/bin/env bash
#
# Quick Validation Script for Phase 2
# Runs all example scripts to validate implementation
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Validation counters
VALIDATIONS_RUN=0
VALIDATIONS_PASSED=0
VALIDATIONS_FAILED=0

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_validation() { echo -e "${CYAN}[VALIDATE]${NC} $1"; ((VALIDATIONS_RUN++)); }
validation_pass() { echo -e "${GREEN}[PASS]${NC} $1"; ((VALIDATIONS_PASSED++)); }
validation_fail() { echo -e "${RED}[FAIL]${NC} $1"; ((VALIDATIONS_FAILED++)); }

# Validate example script
validate_example() {
    local example_name="$1"
    local example_path="$2"

    log_validation "Running: $example_name"

    if [[ ! -f "$example_path" ]]; then
        validation_fail "Example not found: $example_path"
        return 1
    fi

    cd "$PROJECT_ROOT"

    if python3 "$example_path" 2>&1; then
        validation_pass "$example_name executed successfully"
        return 0
    else
        validation_fail "$example_name failed with exit code $?"
        return 1
    fi
}

# Test simple hierarchy
validate_simple_hierarchy() {
    log_validation "Simple Hierarchy Example"

    local example_path="$PROJECT_ROOT/1-agents/4-specialists/hierarchical-examples/simple_hierarchy.py"

    if [[ ! -f "$example_path" ]]; then
        validation_fail "Example not found: $example_path"
        return 1
    fi

    cd "$PROJECT_ROOT"

    if python3 "$example_path" 2>&1 | tee /tmp/simple_hierarchy_output.log; then
        validation_pass "Simple hierarchy example works"
        return 0
    else
        validation_fail "Simple hierarchy example failed"
        cat /tmp/simple_hierarchy_output.log
        return 1
    fi
}

# Test auto breakdown
validate_auto_breakdown() {
    log_validation "Auto Breakdown Example"

    local example_path="$PROJECT_ROOT/1-agents/4-specialists/hierarchical-examples/auto_breakdown_example.py"

    if [[ ! -f "$example_path" ]]; then
        validation_fail "Example not found: $example_path"
        return 1
    fi

    cd "$PROJECT_ROOT"

    if python3 "$example_path" 2>&1 | tee /tmp/auto_breakdown_output.log; then
        validation_pass "Auto breakdown example works"
        return 0
    else
        validation_fail "Auto breakdown example failed"
        cat /tmp/auto_breakdown_output.log
        return 1
    fi
}

# Test checklist integration
validate_checklist_integration() {
    log_validation "Checklist Integration Example"

    local example_path="$PROJECT_ROOT/1-agents/4-specialists/hierarchical-examples/checklist_integration.py"

    if [[ ! -f "$example_path" ]]; then
        validation_fail "Example not found: $example_path"
        return 1
    fi

    cd "$PROJECT_ROOT"

    if python3 "$example_path" 2>&1 | tee /tmp/checklist_output.log; then
        validation_pass "Checklist integration example works"
        return 0
    else
        validation_fail "Checklist integration example failed"
        cat /tmp/checklist_output.log
        return 1
    fi
}

# Test hierarchical plan script
validate_hierarchical_plan() {
    log_validation "Hierarchical Plan Script"

    if [[ ! -f "$PROJECT_ROOT/4-scripts/planning/hierarchical-plan.py" ]]; then
        validation_fail "hierarchical-plan.py not found"
        return 1
    fi

    cd "$PROJECT_ROOT"

    # Test help output
    if python3 "$PROJECT_ROOT/4-scripts/planning/hierarchical-plan.py" --help 2>&1 | tee /tmp/plan_help.log | grep -q "Usage"; then
        validation_pass "Hierarchical plan script help works"
        return 0
    else
        validation_fail "Hierarchical plan script help failed"
        return 1
    fi
}

# Test wrapper scripts
validate_wrapper_scripts() {
    log_validation "Wrapper Scripts"

    # Test hierarchical-plan.sh
    if [[ -f "$PROJECT_ROOT/hierarchical-plan.sh" ]]; then
        if bash "$PROJECT_ROOT/hierarchical-plan.sh" --help 2>&1 | grep -q "Usage"; then
            validation_pass "hierarchical-plan.sh wrapper works"
        else
            validation_fail "hierarchical-plan.sh wrapper failed"
        fi
    else
        validation_fail "hierarchical-plan.sh not found"
    fi

    # Test auto-breakdown.sh
    if [[ -f "$PROJECT_ROOT/auto-breakdown.sh" ]]; then
        if bash "$PROJECT_ROOT/auto-breakdown.sh" --help 2>&1 | grep -q "Usage"; then
            validation_pass "auto-breakdown.sh wrapper works"
        else
            validation_fail "auto-breakdown.sh wrapper failed"
        fi
    else
        validation_fail "auto-breakdown.sh not found"
    fi
}

# Run integration test
validate_integration() {
    log_validation "Integration Test - End to End Flow"

    cd "$PROJECT_ROOT"

    # Create a test plan
    local test_plan_file="/tmp/test-hierarchical-plan.md"

    cat > "$test_plan_file" << 'EOF'
# Test Hierarchical Plan

## Objective
Test the hierarchical task breakdown system.

## Tasks
1. Create root task
2. Break down into subtasks
3. Generate checklist
EOF

    # Test hierarchical plan creation
    if python3 "$PROJECT_ROOT/4-scripts/planning/hierarchical-plan.py" \
        --plan "$test_plan_file" \
        --output /tmp/hierarchical-test-output.json 2>&1 | tee /tmp/integration_test.log; then

        if [[ -f /tmp/hierarchical-test-output.json ]]; then
            validation_pass "Integration test created output file"
            return 0
        else
            validation_fail "Integration test did not create output file"
            return 1
        fi
    else
        validation_fail "Integration test failed"
        return 1
    fi
}

# Main validation flow
main() {
    log_info "Phase 2 Validation: Quick Example Script Tests"
    log_info "Project root: $PROJECT_ROOT"
    echo ""

    # Run all validations
    validate_simple_hierarchy
    echo ""

    validate_auto_breakdown
    echo ""

    validate_checklist_integration
    echo ""

    validate_hierarchical_plan
    echo ""

    validate_wrapper_scripts
    echo ""

    validate_integration
    echo ""

    # Summary
    log_info "Validation Summary:"
    echo "  Validations Run:    $VALIDATIONS_RUN"
    echo -e "  ${GREEN}Validations Passed:  $VALIDATIONS_PASSED${NC}"
    if [[ $VALIDATIONS_FAILED -gt 0 ]]; then
        echo -e "  ${RED}Validations Failed:  $VALIDATIONS_FAILED${NC}"
    fi
    echo ""

    if [[ $VALIDATIONS_FAILED -eq 0 ]]; then
        log_info "✅ All validations passed! Phase 2 examples are working."
        return 0
    else
        log_error "❌ Some validations failed."
        return 1
    fi
}

main "$@"
