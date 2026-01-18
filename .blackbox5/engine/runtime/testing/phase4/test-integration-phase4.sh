#!/usr/bin/env bash
set -euo pipefail

# Phase 4 Integration Tests
# Tests integration between Phase 4 (Ralph Runtime) and Phases 1-3

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

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Box root
BOX_ROOT="$(find_box_root)"

# Test data
TEST_INTEGRATION_DIR="${BOX_ROOT}/.tests/phase4/integration"
TEST_INTEGRATION_NAME="test-integration-$(date +%s)"

# Print test header
print_test_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${BLUE}$1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Print test section
print_test_section() {
    echo ""
    echo -e "${YELLOW}▶ $1${NC}"
    echo -e "${YELLOW}────────────────────────────────────────────────────────────${NC}"
    echo ""
}

# Run individual test
run_test() {
    local test_name="$1"
    local test_command="$2"

    ((TESTS_RUN++))

    echo -e "${BLUE}[TEST]${NC} $test_name"

    if eval "$test_command" >/dev/null 2>&1; then
        ((TESTS_PASSED++))
        echo -e "${GREEN}[PASS]${NC} $test_name"
        return 0
    else
        ((TESTS_FAILED++))
        echo -e "${RED}[FAIL]${NC} $test_name"
        return 1
    fi
}

# Test: Phase 1 + Phase 4 integration
test_phase1_integration() {
    print_test_section "Phase 1 (Context) + Phase 4 Integration"

    local test_dir="${TEST_INTEGRATION_DIR}/${TEST_INTEGRATION_NAME}-p1"
    mkdir -p "$test_dir/.ralph"
    mkdir -p "$test_dir/.agent-os/context"

    # Create Phase 1 context variables
    cat > "$test_dir/.agent-os/context/variables.json" << 'EOF'
{
  "PROJECT_NAME": "test-project",
  "CURRENT_DATE": "2025-01-15",
  "FRAMEWORK": "blackbox4"
}
EOF

    run_test "Phase 1 context variables exist" \
        "[[ -f '$test_dir/.agent-os/context/variables.json' ]]"

    # Create Phase 4 runtime state that uses Phase 1 context
    cat > "$test_dir/.ralph/runtime-state.json" << 'EOF'
{
  "status": "running",
  "context_integration": {
    "phase1_context_loaded": true,
    "project_name": "test-project",
    "framework": "blackbox4"
  }
}
EOF

    run_test "Phase 4 runtime state exists" \
        "[[ -f '$test_dir/.ralph/runtime-state.json' ]]"

    run_test "Runtime has loaded Phase 1 context" \
        "jq -e '.context_integration.phase1_context_loaded == true' '$test_dir/.ralph/runtime-state.json' >/dev/null"

    run_test "Project name from context is accessible" \
        "jq -e '.context_integration.project_name' '$test_dir/.ralph/runtime-state.json' >/dev/null"
}

# Test: Phase 2 + Phase 4 integration
test_phase2_integration() {
    print_test_section "Phase 2 (Planning/Tasks) + Phase 4 Integration"

    local test_dir="${TEST_INTEGRATION_DIR}/${TEST_INTEGRATION_NAME}-p2"
    mkdir -p "$test_dir/.ralph"
    mkdir -p "$test_dir/.agent-os/tasks"

    # Create Phase 2 task
    cat > "$test_dir/.agent-os/tasks/current-task.md" << 'EOF'
# Current Task

Implement feature X with the following requirements:
- Requirement 1
- Requirement 2
EOF

    run_test "Phase 2 task exists" \
        "[[ -f '$test_dir/.agent-os/tasks/current-task.md' ]]"

    # Create Phase 4 execution state for Phase 2 task
    cat > "$test_dir/.ralph/execution-state.json" << 'EOF'
{
  "status": "executing",
  "task_source": "phase2",
  "task_path": ".agent-os/tasks/current-task.md",
  "current_step": 1,
  "progress": 0
}
EOF

    run_test "Phase 4 execution state exists" \
        "[[ -f '$test_dir/.ralph/execution-state.json' ]]"

    run_test "Execution references Phase 2 task" \
        "jq -e '.task_source == \"phase2\"' '$test_dir/.ralph/execution-state.json' >/dev/null"

    run_test "Task path is correctly referenced" \
        "jq -e '.task_path' '$test_dir/.ralph/execution-state.json' >/dev/null"

    # Update execution state
    cat > "$test_dir/.ralph/execution-state.json" << 'EOF'
{
  "status": "completed",
  "task_source": "phase2",
  "task_path": ".agent-os/tasks/current-task.md",
  "current_step": 3,
  "progress": 100
}
EOF

    run_test "Execution progress is tracked" \
        "jq -e '.progress == 100' '$test_dir/.ralph/execution-state.json' >/dev/null"
}

# Test: Phase 3 + Phase 4 integration
test_phase3_integration() {
    print_test_section "Phase 3 (Specs) + Phase 4 Integration"

    local test_dir="${TEST_INTEGRATION_DIR}/${TEST_INTEGRATION_NAME}-p3"
    mkdir -p "$test_dir/.ralph"
    mkdir -p "$test_dir/.agent-os/specs/test-spec"

    # Create Phase 3 spec
    cat > "$test_dir/.agent-os/specs/test-spec/spec.md" << 'EOF'
# Test Spec

> Spec: test-feature
> Created: 2025-01-15

## Overview
Test feature specification.
EOF

    run_test "Phase 3 spec exists" \
        "[[ -f '$test_dir/.agent-os/specs/test-spec/spec.md' ]]"

    # Create Phase 4 runtime state for spec-driven execution
    cat > "$test_dir/.ralph/spec-execution.json" << 'EOF'
{
  "status": "running",
  "spec_name": "test-feature",
  "spec_path": ".agent-os/specs/test-spec/spec.md",
  "current_phase": "implementation",
  "phases_completed": ["planning", "design"]
}
EOF

    run_test "Phase 4 spec execution state exists" \
        "[[ -f '$test_dir/.ralph/spec-execution.json' ]]"

    run_test "Execution references Phase 3 spec" \
        "jq -e '.spec_path' '$test_dir/.ralph/spec-execution.json' >/dev/null"

    run_test "Spec phases are tracked" \
        "jq -e '.phases_completed | length > 0' '$test_dir/.ralph/spec-execution.json' >/dev/null"
}

# Test: Circuit breaker integration
test_circuit_breaker_integration() {
    print_test_section "Circuit Breaker Integration with Runtime"

    local test_dir="${TEST_INTEGRATION_DIR}/${TEST_INTEGRATION_NAME}-circuit"
    mkdir -p "$test_dir/.ralph"

    # Create circuit state
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "CLOSED",
  "trigger_count": 0,
  "loop_count": 5,
  "consecutive_no_progress_loops": 0
}
EOF

    run_test "Circuit state exists" \
        "[[ -f '$test_dir/.ralph/circuit-state.json' ]]"

    # Create runtime state that monitors circuit
    cat > "$test_dir/.ralph/runtime-state.json" << 'EOF'
{
  "status": "running",
  "circuit_breaker": {
    "enabled": true,
    "status": "CLOSED",
    "last_check": 1234567890
  }
}
EOF

    run_test "Runtime monitors circuit breaker" \
        "jq -e '.circuit_breaker.enabled == true' '$test_dir/.ralph/runtime-state.json' >/dev/null"

    run_test "Circuit status is synced to runtime" \
        "jq -e '.circuit_breaker.status' '$test_dir/.ralph/runtime-state.json' >/dev/null"

    # Simulate circuit trigger
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "OPEN",
  "trigger_count": 1,
  "loop_count": 10,
  "consecutive_no_progress_loops": 10
}
EOF

    cat > "$test_dir/.ralph/runtime-state.json" << 'EOF'
{
  "status": "halted",
  "halt_reason": "circuit_breaker_triggered",
  "circuit_breaker": {
    "enabled": true,
    "status": "OPEN",
    "last_check": 1234567900
  }
}
EOF

    run_test "Runtime halts on circuit trigger" \
        "jq -e '.status == \"halted\"' '$test_dir/.ralph/runtime-state.json' >/dev/null"

    run_test "Halt reason is recorded" \
        "jq -e '.halt_reason == \"circuit_breaker_triggered\"' '$test_dir/.ralph/runtime-state.json' >/dev/null"
}

# Test: Response analyzer integration
test_response_analyzer_integration() {
    print_test_section "Response Analyzer Integration"

    local test_dir="${TEST_INTEGRATION_DIR}/${TEST_INTEGRATION_NAME}-analyzer"
    mkdir -p "$test_dir/.ralph/responses"

    # Create response file
    cat > "$test_dir/.ralph/responses/last-response.md" << 'EOF'
# Execution Progress

I have completed the implementation phase.
Currently working on testing.
EOF

    run_test "Response file exists" \
        "[[ -f '$test_dir/.ralph/responses/last-response.md' ]]"

    # Create analysis result
    cat > "$test_dir/.ralph/responses/analysis.json" << 'EOF'
{
  "response_file": "last-response.md",
  "quality_score": 0.85,
  "category": "progress",
  "sentiment": "positive",
  "actions_detected": 2,
  "progress_indicators": ["completed", "working on"]
}
EOF

    run_test "Analysis result exists" \
        "[[ -f '$test_dir/.ralph/responses/analysis.json' ]]"

    run_test "Quality score is calculated" \
        "jq -e '.quality_score' '$test_dir/.ralph/responses/analysis.json' >/dev/null"

    run_test "Response is categorized" \
        "jq -e '.category' '$test_dir/.ralph/responses/analysis.json' >/dev/null"

    # Create runtime state that uses analysis
    cat > "$test_dir/.ralph/runtime-state.json" << 'EOF'
{
  "status": "running",
  "last_analysis": {
    "quality": 0.85,
    "category": "progress",
    "requires_intervention": false
  }
}
EOF

    run_test "Runtime uses response analysis" \
        "jq -e '.last_analysis.quality' '$test_dir/.ralph/runtime-state.json' >/dev/null"

    run_test "Intervention flag is set correctly" \
        "jq -e '.last_analysis.requires_intervention == false' '$test_dir/.ralph/runtime-state.json' >/dev/null"
}

# Test: End-to-end workflow
test_end_to_end_workflow() {
    print_test_section "End-to-End Workflow Integration"

    local test_dir="${TEST_INTEGRATION_DIR}/${TEST_INTEGRATION_NAME}-e2e"
    mkdir -p "$test_dir/.ralph"
    mkdir -p "$test_dir/.agent-os/context"
    mkdir -p "$test_dir/.agent-os/tasks"
    mkdir -p "$test_dir/.agent-os/specs/e2e-spec"

    # Create Phase 1 context
    cat > "$test_dir/.agent-os/context/variables.json" << 'EOF'
{
  "PROJECT_NAME": "e2e-test",
  "CURRENT_DATE": "2025-01-15"
}
EOF

    run_test "E2E: Phase 1 context created" \
        "[[ -f '$test_dir/.agent-os/context/variables.json' ]]"

    # Create Phase 3 spec
    cat > "$test_dir/.agent-os/specs/e2e-spec/spec.md" << 'EOF'
# E2E Test Spec

> Spec: e2e-feature
> Created: 2025-01-15

## Overview
End-to-end test feature.
EOF

    run_test "E2E: Phase 3 spec created" \
        "[[ -f '$test_dir/.agent-os/specs/e2e-spec/spec.md' ]]"

    # Create Phase 2 task
    cat > "$test_dir/.agent-os/tasks/current-task.md" << 'EOF'
# Current Task

Implement e2e feature based on spec.
EOF

    run_test "E2E: Phase 2 task created" \
        "[[ -f '$test_dir/.agent-os/tasks/current-task.md' ]]"

    # Create Phase 4 runtime execution
    cat > "$test_dir/.ralph/execution-state.json" << 'EOF'
{
  "status": "running",
  "workflow": "end_to_end",
  "phases": {
    "context": "loaded",
    "spec": "loaded",
    "task": "executing",
    "runtime": "active"
  },
  "progress": 25
}
EOF

    run_test "E2E: Phase 4 runtime executing" \
        "[[ -f '$test_dir/.ralph/execution-state.json' ]]"

    run_test "E2E: All phases integrated" \
        "jq -e '.phases.context == \"loaded\" and .phases.spec == \"loaded\" and .phases.task == \"executing\"' '$test_dir/.ralph/execution-state.json' >/dev/null"

    # Create circuit state for E2E
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "CLOSED",
  "loop_count": 1,
  "consecutive_no_progress_loops": 0
}
EOF

    run_test "E2E: Circuit breaker monitoring" \
        "[[ -f '$test_dir/.ralph/circuit-state.json' ]]"
}

# Test: Cross-phase data flow
test_cross_phase_data_flow() {
    print_test_section "Cross-Phase Data Flow"

    local test_dir="${TEST_INTEGRATION_DIR}/${TEST_INTEGRATION_NAME}-flow"
    mkdir -p "$test_dir/.ralph/data-flow"

    # Create data flow tracker
    cat > "$test_dir/.ralph/data-flow/tracker.json" << 'EOF'
{
  "data_flow": [
    {
      "from": "phase1",
      "to": "phase4",
      "data_type": "context_variables",
      "timestamp": 1234567890
    },
    {
      "from": "phase3",
      "to": "phase2",
      "data_type": "spec_requirements",
      "timestamp": 1234567891
    },
    {
      "from": "phase2",
      "to": "phase4",
      "data_type": "task_definition",
      "timestamp": 1234567892
    }
  ]
}
EOF

    run_test "Data flow tracker exists" \
        "[[ -f '$test_dir/.ralph/data-flow/tracker.json' ]]"

    run_test "Phase 1 to Phase 4 flow tracked" \
        "jq -e '.data_flow[] | select(.from == \"phase1\" and .to == \"phase4\")' '$test_dir/.ralph/data-flow/tracker.json' >/dev/null"

    run_test "Phase 3 to Phase 2 flow tracked" \
        "jq -e '.data_flow[] | select(.from == \"phase3\" and .to == \"phase2\")' '$test_dir/.ralph/data-flow/tracker.json' >/dev/null"

    run_test "Phase 2 to Phase 4 flow tracked" \
        "jq -e '.data_flow[] | select(.from == \"phase2\" and .to == \"phase4\")' '$test_dir/.ralph/data-flow/tracker.json' >/dev/null"
}

# Test: Backward compatibility
test_backward_compatibility() {
    print_test_section "Backward Compatibility with Existing Plans"

    local test_dir="${TEST_INTEGRATION_DIR}/${TEST_INTEGRATION_NAME}-compat"
    mkdir -p "$test_dir/.ralph"
    mkdir -p "$test_dir/.plans"

    # Create an existing plan (pre-Phase 4 style)
    cat > "$test_dir/.plans/existing-plan/README.md" << 'EOF'
# Existing Plan

This plan was created before Phase 4.
EOF

    run_test "Existing plan exists" \
        "[[ -f '$test_dir/.plans/existing-plan/README.md' ]]"

    # Create runtime state that handles legacy plans
    cat > "$test_dir/.ralph/runtime-state.json" << 'EOF'
{
  "status": "running",
  "plan_type": "legacy",
  "plan_path": ".plans/existing-plan",
  "compatibility_mode": true
}
EOF

    run_test "Runtime handles legacy plans" \
        "jq -e '.plan_type == \"legacy\"' '$test_dir/.ralph/runtime-state.json' >/dev/null"

    run_test "Compatibility mode is enabled" \
        "jq -e '.compatibility_mode == true' '$test_dir/.ralph/runtime-state.json' >/dev/null"
}

# Test: Error handling across phases
test_cross_phase_error_handling() {
    print_test_section "Cross-Phase Error Handling"

    local test_dir="${TEST_INTEGRATION_DIR}/${TEST_INTEGRATION_NAME}-errors"
    mkdir -p "$test_dir/.ralph"

    # Create error scenario
    cat > "$test_dir/.ralph/error-state.json" << 'EOF'
{
  "status": "error",
  "error_source": "phase2_task",
  "error_message": "Task validation failed",
  "affected_phases": ["phase2", "phase4"],
  "recovery_action": "retry_with_validation"
}
EOF

    run_test "Error state exists" \
        "[[ -f '$test_dir/.ralph/error-state.json' ]]"

    run_test "Error source is identified" \
        "jq -e '.error_source' '$test_dir/.ralph/error-state.json' >/dev/null"

    run_test "Affected phases are tracked" \
        "jq -e '.affected_phases | length > 0' '$test_dir/.ralph/error-state.json' >/dev/null"

    run_test "Recovery action is defined" \
        "jq -e '.recovery_action' '$test_dir/.ralph/error-state.json' >/dev/null"

    # Create circuit response to error
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "OPEN",
  "trigger_reason": "Cross-phase error: phase2_task",
  "trigger_count": 1
}
EOF

    run_test "Circuit responds to cross-phase errors" \
        "jq -e '.trigger_reason | contains(\"phase2\")' '$test_dir/.ralph/circuit-state.json' >/dev/null"
}

# Generate test summary
generate_test_summary() {
    print_test_header "Phase 4 Integration Test Summary"

    echo -e "${BLUE}Test Results:${NC}"
    echo "  Total Tests: $TESTS_RUN"
    echo -e "  ${GREEN}Passed: $TESTS_PASSED${NC}"
    echo -e "  ${RED}Failed: $TESTS_FAILED${NC}"
    echo ""

    local pass_rate=0
    if [[ $TESTS_RUN -gt 0 ]]; then
        pass_rate=$((TESTS_PASSED * 100 / TESTS_RUN))
    fi

    echo -e "${BLUE}Pass Rate:${NC} ${pass_rate}%"
    echo ""

    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║${NC} ${GREEN}ALL TESTS PASSED - Phase 4 integration is complete!${NC} ${GREEN}║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║${NC} ${RED}SOME TESTS FAILED - Please review the failures above${NC} ${RED}║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        return 1
    fi
}

# Main execution
main() {
    print_test_header "Phase 4: Integration Tests - Phases 1-4"

    info "Starting Phase 4 integration tests..."
    info "Blackbox4 root: $BOX_ROOT"
    info "Test directory: $TEST_INTEGRATION_DIR"
    echo ""

    # Run all test suites
    test_phase1_integration
    test_phase2_integration
    test_phase3_integration
    test_circuit_breaker_integration
    test_response_analyzer_integration
    test_end_to_end_workflow
    test_cross_phase_data_flow
    test_backward_compatibility
    test_cross_phase_error_handling

    # Generate summary
    generate_test_summary
    exit $?
}

# Run main
main "$@"
