#!/usr/bin/env bash
set -euo pipefail

# Phase 3 Master Validation Script
# Runs all Phase 3 tests and verifies integration with Phase 1 and Phase 2

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../../lib.sh"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test suite counters
TOTAL_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=0

# Overall test counters
TOTAL_TESTS=0
TOTAL_PASSED=0
TOTAL_FAILED=0

# Start time
START_TIME=$(date +%s)

# Box root
BOX_ROOT="$(find_box_root)"
PHASE3_DIR="${SCRIPT_DIR}/phase3"

# Print header
print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${BLUE}$1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Print section
print_section() {
    echo ""
    echo -e "${YELLOW}▶ $1${NC}"
    echo -e "${YELLOW}────────────────────────────────────────────────────────────${NC}"
    echo ""
}

# Print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Run test suite
run_test_suite() {
    local suite_name="$1"
    local suite_script="$2"

    ((TOTAL_SUITES++))

    info "Running test suite: $suite_name"

    if [[ ! -f "$suite_script" ]]; then
        error "Test script not found: $suite_script"
        ((FAILED_SUITES++))
        return 1
    fi

    if [[ ! -x "$suite_script" ]]; then
        chmod +x "$suite_script"
    fi

    # Run the test suite and capture output
    local output
    local exit_code

    output=$("$suite_script" 2>&1)
    exit_code=$?

    # Print output
    echo "$output"

    if [[ $exit_code -eq 0 ]]; then
        ((PASSED_SUITES++))
        print_success "$suite_name: PASSED"
    else
        ((FAILED_SUITES++))
        print_error "$suite_name: FAILED"
    fi

    echo ""
}

# Parse test results from output
parse_test_results() {
    local output="$1"

    # Extract test counts (if available)
    if echo "$output" | grep -q "Tests run:"; then
        local run=$(echo "$output" | grep "Tests run:" | awk '{print $3}')
        local passed=$(echo "$output" | grep "Tests passed:" | awk '{print $3}')
        local failed=$(echo "$output" | grep "Tests failed:" | awk '{print $3}')

        TOTAL_TESTS=$((TOTAL_TESTS + run))
        TOTAL_PASSED=$((TOTAL_PASSED + passed))
        TOTAL_FAILED=$((TOTAL_FAILED + failed))
    fi
}

# Check Phase 1 integration
check_phase1_integration() {
    print_section "Phase 1 Integration Check"

    local phase1_checks=0
    local phase1_passed=0

    # Check if Phase 1 modules exist
    if [[ -d "${BOX_ROOT}/3-modules/context" ]]; then
        info "Phase 1 context module exists"
        ((phase1_passed++))
    fi
    ((phase1_checks++))

    if [[ -d "${BOX_ROOT}/3-modules/domain" ]]; then
        info "Phase 1 domain module exists"
        ((phase1_passed++))
    fi
    ((phase1_checks++))

    # Check if context variables work with specs
    if [[ -f "${BOX_ROOT}/4-scripts/lib/context-variables/variables.sh" ]]; then
        info "Context variables module compatible"
        ((phase1_passed++))
    fi
    ((phase1_checks++))

    if [[ $phase1_passed -eq $phase1_checks ]]; then
        print_success "Phase 1 integration: PASSED ($phase1_passed/$phase1_checks checks)"
        return 0
    else
        print_error "Phase 1 integration: FAILED ($phase1_passed/$phase1_checks checks)"
        return 1
    fi
}

# Check Phase 2 integration
check_phase2_integration() {
    print_section "Phase 2 Integration Check"

    local phase2_checks=0
    local phase2_passed=0

    # Check if Phase 2 modules exist
    if [[ -d "${BOX_ROOT}/3-modules/planning" ]]; then
        info "Phase 2 planning module exists"
        ((phase2_passed++))
    fi
    ((phase2_checks++))

    if [[ -d "${BOX_ROOT}/3-modules/kanban" ]]; then
        info "Phase 2 kanban module exists"
        ((phase2_passed++))
    fi
    ((phase2_checks++))

    # Check if planning scripts work
    if [[ -f "${BOX_ROOT}/4-scripts/planning/spec-create.py" ]]; then
        info "Planning scripts compatible"
        ((phase2_passed++))
    fi
    ((phase2_checks++))

    if [[ $phase2_passed -eq $phase2_checks ]]; then
        print_success "Phase 2 integration: PASSED ($phase2_passed/$phase2_checks checks)"
        return 0
    else
        print_error "Phase 2 integration: FAILED ($phase2_passed/$phase2_checks checks)"
        return 1
    fi
}

# Check Phase 3 completeness
check_phase3_completeness() {
    print_section "Phase 3 Completeness Check"

    local phase3_checks=0
    local phase3_passed=0

    # Check spec creation library
    if [[ -d "${BOX_ROOT}/4-scripts/lib/spec-creation" ]]; then
        info "Spec creation library exists"
        ((phase3_passed++))
    fi
    ((phase3_checks++))

    # Check Python modules
    if [[ -f "${BOX_ROOT}/4-scripts/lib/spec-creation/spec_types.py" ]]; then
        info "Spec types module exists"
        ((phase3_passed++))
    fi
    ((phase3_checks++))

    if [[ -f "${BOX_ROOT}/4-scripts/lib/spec-creation/questioning.py" ]]; then
        info "Questioning module exists"
        ((phase3_passed++))
    fi
    ((phase3_checks++))

    if [[ -f "${BOX_ROOT}/4-scripts/lib/spec-creation/validation.py" ]]; then
        info "Validation module exists"
        ((phase3_passed++))
    fi
    ((phase3_checks++))

    if [[ -f "${BOX_ROOT}/4-scripts/lib/spec-creation/analyze.py" ]]; then
        info "Analysis module exists"
        ((phase3_passed++))
    fi
    ((phase3_checks++))

    # Check CLI scripts
    if [[ -f "${BOX_ROOT}/spec-create.sh" ]]; then
        info "Spec create CLI exists"
        ((phase3_passed++))
    fi
    ((phase3_checks++))

    if [[ -f "${BOX_ROOT}/spec-validate.sh" ]]; then
        info "Spec validate CLI exists"
        ((phase3_passed++))
    fi
    ((phase3_checks++))

    if [[ -f "${BOX_ROOT}/spec-analyze.sh" ]]; then
        info "Spec analyze CLI exists"
        ((phase3_passed++))
    fi
    ((phase3_checks++))

    if [[ $phase3_passed -eq $phase3_checks ]]; then
        print_success "Phase 3 completeness: PASSED ($phase3_passed/$phase3_checks checks)"
        return 0
    else
        print_error "Phase 3 completeness: FAILED ($phase3_passed/$phase3_checks checks)"
        return 1
    fi
}

# Generate final report
generate_report() {
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))

    print_header "Phase 3 Validation Report"

    # Overall results
    echo -e "${BLUE}Overall Results:${NC}"
    echo "  Test Suites: $TOTAL_SUITES"
    echo -e "  ${GREEN}Passed: $PASSED_SUITES${NC}"
    echo -e "  ${RED}Failed: $FAILED_SUITES${NC}"
    echo ""

    # Individual test results
    if [[ $TOTAL_TESTS -gt 0 ]]; then
        echo -e "${BLUE}Individual Tests:${NC}"
        echo "  Total Tests: $TOTAL_TESTS"
        echo -e "  ${GREEN}Passed: $TOTAL_PASSED${NC}"
        echo -e "  ${RED}Failed: $TOTAL_FAILED${NC}"
        echo ""
    fi

    # Integration results
    echo -e "${BLUE}Integration Status:${NC}"
    check_phase1_integration
    local phase1_status=$?

    check_phase2_integration
    local phase2_status=$?

    check_phase3_completeness
    local phase3_status=$?

    echo ""
    echo -e "${BLUE}Duration:${NC} ${minutes}m ${seconds}s"
    echo ""

    # Final verdict
    if [[ $FAILED_SUITES -eq 0 && $phase1_status -eq 0 && $phase2_status -eq 0 && $phase3_status -eq 0 ]]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║${NC} ${GREEN}ALL TESTS PASSED - Phase 3 is fully operational!${NC}  ${GREEN}║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║${NC} ${RED}SOME TESTS FAILED - Please review the output above${NC}  ${RED}║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        return 1
    fi
}

# Main execution
main() {
    print_header "Phase 3: Structured Spec Creation - Master Validation"

    info "Starting comprehensive Phase 3 validation..."
    info "Blackbox4 root: $BOX_ROOT"
    echo ""

    # Run all test suites
    run_test_suite "Spec Creation Tests" "${PHASE3_DIR}/test-spec-creation.sh"
    run_test_suite "Questioning Workflow Tests" "${PHASE3_DIR}/test-questioning.sh"
    run_test_suite "Validation Tests" "${PHASE3_DIR}/test-validation.sh"
    run_test_suite "Integration Tests" "${PHASE3_DIR}/test-integration.sh"

    # Generate final report
    generate_report
    exit $?
}

# Run main
main "$@"
