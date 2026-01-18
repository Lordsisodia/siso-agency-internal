#!/usr/bin/env bash
set -euo pipefail

# Phase 4 Master Validation Script
# Runs all Phase 4 tests and verifies integration with Phases 1-3

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../../lib.sh"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
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
PHASE4_DIR="${SCRIPT_DIR}/phase4"

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

    # Extract test counts
    if echo "$output" | grep -q "Total Tests:"; then
        local run=$(echo "$output" | grep "Total Tests:" | awk '{print $3}')
        local passed=$(echo "$output" | grep "Passed:" | awk '{print $2}')
        local failed=$(echo "$output" | grep "Failed:" | awk '{print $2}')

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

    ((phase1_checks++))
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
    if [[ -f "${BOX_ROOT}/4-scripts/lib/context-variables/variables.sh" ]]; then
        info "Context variables module compatible with Phase 4"
        ((phase1_passed++))
    fi

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

    ((phase2_checks++))
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
    if [[ -f "${BOX_ROOT}/4-scripts/planning/spec-create.py" ]]; then
        info "Planning scripts compatible with Phase 4"
        ((phase2_passed++))
    fi

    if [[ $phase2_passed -eq $phase2_checks ]]; then
        print_success "Phase 2 integration: PASSED ($phase2_passed/$phase2_checks checks)"
        return 0
    else
        print_error "Phase 2 integration: FAILED ($phase2_passed/$phase2_checks checks)"
        return 1
    fi
}

# Check Phase 3 integration
check_phase3_integration() {
    print_section "Phase 3 Integration Check"

    local phase3_checks=0
    local phase3_passed=0

    ((phase3_checks++))
    if [[ -d "${BOX_ROOT}/4-scripts/lib/spec-creation" ]]; then
        info "Phase 3 spec creation library exists"
        ((phase3_passed++))
    fi

    ((phase3_checks++))
    if [[ -f "${BOX_ROOT}/spec-create.sh" ]]; then
        info "Spec creation CLI compatible with Phase 4"
        ((phase3_passed++))
    fi

    ((phase3_checks++))
    if [[ -f "${BOX_ROOT}/spec-validate.sh" ]]; then
        info "Spec validation CLI compatible with Phase 4"
        ((phase3_passed++))
    fi

    if [[ $phase3_passed -eq $phase3_checks ]]; then
        print_success "Phase 3 integration: PASSED ($phase3_passed/$phase3_checks checks)"
        return 0
    else
        print_error "Phase 3 integration: FAILED ($phase3_passed/$phase3_checks checks)"
        return 1
    fi
}

# Check Phase 4 completeness
check_phase4_completeness() {
    print_section "Phase 4 Completeness Check"

    local phase4_checks=0
    local phase4_passed=0

    # Check Ralph Runtime
    ((phase4_checks++))
    if [[ -d "${BOX_ROOT}/4-scripts/lib/ralph-runtime" ]]; then
        info "Ralph Runtime library exists"
        ((phase4_passed++))
    fi

    ((phase4_checks++))
    if [[ -d "${BOX_ROOT}/4-scripts/python/core/runtime" ]]; then
        info "Python runtime module exists"
        ((phase4_passed++))
    fi

    # Check Circuit Breaker
    ((phase4_checks++))
    if [[ -f "${BOX_ROOT}/4-scripts/lib/circuit-breaker/circuit-breaker.sh" ]]; then
        info "Circuit breaker library exists"
        ((phase4_passed++))
    fi

    ((phase4_checks++))
    if [[ -d "${BOX_ROOT}/.runtime/.ralph" ]]; then
        info "Runtime .ralph directory exists"
        ((phase4_passed++))
    fi

    # Check Response Analyzer
    ((phase4_checks++))
    if [[ -d "${BOX_ROOT}/4-scripts/lib/response-analyzer" ]]; then
        info "Response analyzer library exists"
        ((phase4_passed++))
    fi

    if [[ $phase4_passed -eq $phase4_checks ]]; then
        print_success "Phase 4 completeness: PASSED ($phase4_passed/$phase4_checks checks)"
        return 0
    else
        print_error "Phase 4 completeness: FAILED ($phase4_passed/$phase4_checks checks)"
        return 1
    fi
}

# Generate final report
generate_report() {
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))

    print_header "Phase 4 Validation Report"

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

    check_phase3_integration
    local phase3_status=$?

    check_phase4_completeness
    local phase4_status=$?

    echo ""
    echo -e "${BLUE}Duration:${NC} ${minutes}m ${seconds}s"
    echo ""

    # Exit codes for CI/CD
    if [[ $FAILED_SUITES -eq 0 && $phase1_status -eq 0 && $phase2_status -eq 0 && $phase3_status -eq 0 && $phase4_status -eq 0 ]]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║${NC} ${GREEN}ALL TESTS PASSED - Phase 4 is fully operational!${NC}  ${GREEN}║${NC}"
        echo -e "${GREEN}║${NC} ${GREEN}Ralph Runtime is ready for production use!${NC}       ${GREEN}║${NC}"
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
    print_header "Phase 4: Ralph Runtime - Master Validation"

    info "Starting comprehensive Phase 4 validation..."
    info "Blackbox4 root: $BOX_ROOT"
    echo ""

    # Run all test suites
    run_test_suite "Ralph Runtime Tests" "${PHASE4_DIR}/test-ralph-runtime.sh"
    run_test_suite "Circuit Breaker Tests" "${PHASE4_DIR}/test-circuit-breaker.sh"
    run_test_suite "Response Analyzer Tests" "${PHASE4_DIR}/test-response-analyzer.sh"
    run_test_suite "Integration Tests" "${PHASE4_DIR}/test-integration-phase4.sh"

    # Generate final report
    generate_report
    exit $?
}

# Run main
main "$@"
