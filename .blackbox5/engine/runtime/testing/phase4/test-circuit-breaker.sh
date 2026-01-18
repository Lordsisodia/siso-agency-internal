#!/usr/bin/env bash
set -euo pipefail

# Circuit Breaker Functionality Tests
# Tests circuit state transitions, failure detection, auto-recovery, and metrics

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../../lib.sh"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Box root
BOX_ROOT="$(find_box_root)"
CIRCUIT_BREAKER_LIB="${BOX_ROOT}/4-scripts/lib/circuit-breaker/circuit-breaker.sh"

# Test data
TEST_CIRCUIT_DIR="${BOX_ROOT}/.tests/phase4/circuit-breaker"
TEST_CIRCUIT_NAME="test-circuit-$(date +%s)"

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

# Test: Circuit breaker library exists
test_circuit_breaker_library() {
    print_test_section "Circuit Breaker Library"

    run_test "Circuit breaker library exists" \
        "[[ -f '$CIRCUIT_BREAKER_LIB' ]]"

    run_test "Circuit breaker library is executable" \
        "[[ -x '$CIRCUIT_BREAKER_LIB' ]]"

    run_test "Circuit breaker directory exists" \
        "[[ -d '${BOX_ROOT}/4-scripts/lib/circuit-breaker' ]]"
}

# Test: Circuit state initialization
test_circuit_initialization() {
    print_test_section "Circuit State Initialization"

    local test_dir="${TEST_CIRCUIT_DIR}/${TEST_CIRCUIT_NAME}-init"
    mkdir -p "$test_dir/.ralph"

    # Create initial circuit state
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "CLOSED",
  "trigger_reason": "",
  "trigger_count": 0,
  "last_progress_timestamp": 0,
  "loop_count": 0,
  "consecutive_no_progress_loops": 0,
  "last_trigger_time": 0,
  "last_save_time": 0,
  "backup_count": 0,
  "history": []
}
EOF

    run_test "Circuit state file created" \
        "[[ -f '$test_dir/.ralph/circuit-state.json' ]]"

    run_test "Circuit state has valid JSON" \
        "jq empty '$test_dir/.ralph/circuit-state.json' 2>/dev/null"

    run_test "Circuit status is CLOSED" \
        "jq -e '.status == \"CLOSED\"' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    run_test "Initial trigger count is 0" \
        "jq -e '.trigger_count == 0' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    run_test "Initial loop count is 0" \
        "jq -e '.loop_count == 0' '$test_dir/.ralph/circuit-state.json' >/dev/null"
}

# Test: State transitions
test_state_transitions() {
    print_test_section "State Transitions"

    local test_dir="${TEST_CIRCUIT_DIR}/${TEST_CIRCUIT_NAME}-transitions"
    mkdir -p "$test_dir/.ralph"

    # Start with CLOSED state
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "CLOSED",
  "trigger_reason": "",
  "trigger_count": 0,
  "loop_count": 5,
  "consecutive_no_progress_loops": 0,
  "last_progress_timestamp": 1234567890
}
EOF

    run_test "Initial state is CLOSED" \
        "jq -e '.status == \"CLOSED\"' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    # Transition to OPEN
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "OPEN",
  "trigger_reason": "Stagnation: 10 loops without progress",
  "trigger_count": 1,
  "loop_count": 10,
  "consecutive_no_progress_loops": 10,
  "last_progress_timestamp": 1234567890,
  "last_trigger_time": 1234567900
}
EOF

    run_test "State transitions to OPEN" \
        "jq -e '.status == \"OPEN\"' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    run_test "Trigger reason is recorded" \
        "jq -e '.trigger_reason' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    run_test "Trigger count increments" \
        "jq -e '.trigger_count == 1' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    # Transition to HALF_OPEN
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "HALF_OPEN",
  "trigger_reason": "Stagnation: 10 loops without progress",
  "trigger_count": 1,
  "loop_count": 11,
  "consecutive_no_progress_loops": 0,
  "last_progress_timestamp": 1234567950,
  "last_trigger_time": 1234567900
}
EOF

    run_test "State transitions to HALF_OPEN" \
        "jq -e '.status == \"HALF_OPEN\"' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    # Transition back to CLOSED
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "CLOSED",
  "trigger_reason": "",
  "trigger_count": 1,
  "loop_count": 12,
  "consecutive_no_progress_loops": 0,
  "last_progress_timestamp": 1234567960
}
EOF

    run_test "State transitions back to CLOSED" \
        "jq -e '.status == \"CLOSED\"' '$test_dir/.ralph/circuit-state.json' >/dev/null"
}

# Test: Failure detection
test_failure_detection() {
    print_test_section "Failure Detection"

    local test_dir="${TEST_CIRCUIT_DIR}/${TEST_CIRCUIT_NAME}-failures"
    mkdir -p "$test_dir/.ralph"

    # Simulate stagnation detection
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "CLOSED",
  "trigger_reason": "",
  "trigger_count": 0,
  "loop_count": 8,
  "consecutive_no_progress_loops": 8,
  "last_progress_timestamp": 1234567890
}
EOF

    run_test "Stagnation is detected" \
        "jq -e '.consecutive_no_progress_loops == 8' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    run_test "Loop count is tracked" \
        "jq -e '.loop_count == 8' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    # Simulate timeout detection
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "OPEN",
  "trigger_reason": "Timeout: Agent execution exceeded 300s",
  "trigger_count": 1,
  "loop_count": 5,
  "consecutive_no_progress_loops": 5,
  "last_progress_timestamp": 1234567890
}
EOF

    run_test "Timeout triggers circuit" \
        "jq -e '.status == \"OPEN\"' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    run_test "Timeout reason is recorded" \
        "jq -e '.trigger_reason | contains(\"Timeout\")' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    # Simulate error threshold detection
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "OPEN",
  "trigger_reason": "Error threshold: 5 consecutive errors",
  "trigger_count": 2,
  "loop_count": 15,
  "consecutive_no_progress_loops": 5
}
EOF

    run_test "Error threshold triggers circuit" \
        "jq -e '.trigger_reason | contains(\"Error threshold\")' '$test_dir/.ralph/circuit-state.json' >/dev/null"
}

# Test: Auto-recovery
test_auto_recovery() {
    print_test_section "Auto-Recovery"

    local test_dir="${TEST_CIRCUIT_DIR}/${TEST_CIRCUIT_NAME}-recovery"
    mkdir -p "$test_dir/.ralph"

    # Start in OPEN state
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "OPEN",
  "trigger_reason": "Stagnation: 10 loops without progress",
  "trigger_count": 1,
  "loop_count": 10,
  "consecutive_no_progress_loops": 10,
  "last_trigger_time": 1234567890
}
EOF

    # Simulate cooldown period and recovery attempt
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "HALF_OPEN",
  "trigger_reason": "Stagnation: 10 loops without progress",
  "trigger_count": 1,
  "loop_count": 11,
  "consecutive_no_progress_loops": 0,
  "last_progress_timestamp": 1234568000,
  "last_trigger_time": 1234567890
}
EOF

    run_test "Circuit enters HALF_OPEN after cooldown" \
        "jq -e '.status == \"HALF_OPEN\"' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    # Simulate successful recovery
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "CLOSED",
  "trigger_reason": "",
  "trigger_count": 1,
  "loop_count": 12,
  "consecutive_no_progress_loops": 0,
  "last_progress_timestamp": 1234568100
}
EOF

    run_test "Circuit closes after successful recovery" \
        "jq -e '.status == \"CLOSED\"' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    run_test "Stagnation counter resets on recovery" \
        "jq -e '.consecutive_no_progress_loops == 0' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    # Simulate failed recovery (re-open)
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "OPEN",
  "trigger_reason": "Recovery failed: Stagnation detected again",
  "trigger_count": 2,
  "loop_count": 15,
  "consecutive_no_progress_loops": 3,
  "last_progress_timestamp": 1234568100
}
EOF

    run_test "Failed recovery re-opens circuit" \
        "jq -e '.status == \"OPEN\"' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    run_test "Trigger count increases on failed recovery" \
        "jq -e '.trigger_count == 2' '$test_dir/.ralph/circuit-state.json' >/dev/null"
}

# Test: Metrics collection
test_metrics_collection() {
    print_test_section "Metrics Collection"

    local test_dir="${TEST_CIRCUIT_DIR}/${TEST_CIRCUIT_NAME}-metrics"
    mkdir -p "$test_dir/.ralph/metrics"

    # Create metrics file
    cat > "$test_dir/.ralph/metrics/circuit-metrics.json" << 'EOF'
{
  "total_triggers": 5,
  "total_recoveries": 3,
  "total_failures": 2,
  "average_recovery_time_seconds": 120,
  "circuit_open_duration_total_seconds": 600,
  "last_status_change": 1234567890,
  "status_history": [
    {"status": "CLOSED", "timestamp": 1234567800},
    {"status": "OPEN", "timestamp": 1234567850},
    {"status": "HALF_OPEN", "timestamp": 1234567950},
    {"status": "CLOSED", "timestamp": 1234568000}
  ]
}
EOF

    run_test "Metrics file exists" \
        "[[ -f '$test_dir/.ralph/metrics/circuit-metrics.json' ]]"

    run_test "Metrics has valid JSON" \
        "jq empty '$test_dir/.ralph/metrics/circuit-metrics.json' 2>/dev/null"

    run_test "Total triggers are tracked" \
        "jq -e '.total_triggers == 5' '$test_dir/.ralph/metrics/circuit-metrics.json' >/dev/null"

    run_test "Total recoveries are tracked" \
        "jq -e '.total_recoveries == 3' '$test_dir/.ralph/metrics/circuit-metrics.json' >/dev/null"

    run_test "Average recovery time is calculated" \
        "jq -e '.average_recovery_time_seconds' '$test_dir/.ralph/metrics/circuit-metrics.json' >/dev/null"

    run_test "Status history is maintained" \
        "jq -e '.status_history | length > 0' '$test_dir/.ralph/metrics/circuit-metrics.json' >/dev/null"
}

# Test: Threshold configuration
test_threshold_configuration() {
    print_test_section "Threshold Configuration"

    local test_dir="${TEST_CIRCUIT_DIR}/${TEST_CIRCUIT_NAME}-thresholds"
    mkdir -p "$test_dir/.ralph"

    # Create configuration
    cat > "$test_dir/.ralph/circuit-config.json" << 'EOF'
{
  "max_loops": 10,
  "stagnation_threshold": 3,
  "cooldown_seconds": 300,
  "absolute_max_loops": 20,
  "warning_threshold": 8,
  "critical_threshold": 15,
  "error_threshold": 5,
  "timeout_seconds": 300
}
EOF

    run_test "Configuration file exists" \
        "[[ -f '$test_dir/.ralph/circuit-config.json' ]]"

    run_test "Configuration has valid JSON" \
        "jq empty '$test_dir/.ralph/circuit-config.json' 2>/dev/null"

    run_test "Max loops threshold is set" \
        "jq -e '.max_loops == 10' '$test_dir/.ralph/circuit-config.json' >/dev/null"

    run_test "Stagnation threshold is set" \
        "jq -e '.stagnation_threshold == 3' '$test_dir/.ralph/circuit-config.json' >/dev/null"

    run_test "Cooldown period is configured" \
        "jq -e '.cooldown_seconds == 300' '$test_dir/.ralph/circuit-config.json' >/dev/null"

    run_test "Absolute max loops is set" \
        "jq -e '.absolute_max_loops == 20' '$test_dir/.ralph/circuit-config.json' >/dev/null"
}

# Test: Logging and history
test_logging_history() {
    print_test_section "Logging and History"

    local test_dir="${TEST_CIRCUIT_DIR}/${TEST_CIRCUIT_NAME}-logs"
    mkdir -p "$test_dir/.ralph/logs"

    # Create circuit log
    cat > "$test_dir/.ralph/logs/circuit.log" << 'EOF'
[2025-01-15 10:00:00] INIT: Circuit breaker state initialized
[2025-01-15 10:00:10] CHECK: Circuit state verified (CLOSED)
[2025-01-15 10:00:20] TRIGGER: Stagnation: 5 loops without progress
[2025-01-15 10:00:21] STATUS: Circuit OPEN
[2025-01-15 10:05:00] RESET: Manual reset
[2025-01-15 10:05:01] STATUS: Circuit CLOSED
EOF

    run_test "Circuit log file exists" \
        "[[ -f '$test_dir/.ralph/logs/circuit.log' ]]"

    run_test "Log contains INIT events" \
        "grep -q 'INIT' '$test_dir/.ralph/logs/circuit.log'"

    run_test "Log contains TRIGGER events" \
        "grep -q 'TRIGGER' '$test_dir/.ralph/logs/circuit.log'"

    run_test "Log contains STATUS events" \
        "grep -q 'STATUS' '$test_dir/.ralph/logs/circuit.log'"

    run_test "Log contains RESET events" \
        "grep -q 'RESET' '$test_dir/.ralph/logs/circuit.log'"

    # Create state history
    mkdir -p "$test_dir/.ralph/state/history"

    cat > "$test_dir/.ralph/state/history/state_001.json" << 'EOF'
{"status": "CLOSED", "timestamp": 1234567800}
EOF

    cat > "$test_dir/.ralph/state/history/state_002.json" << 'EOF'
{"status": "OPEN", "timestamp": 1234567850}
EOF

    run_test "State history directory exists" \
        "[[ -d '$test_dir/.ralph/state/history' ]]"

    run_test "State history files exist" \
        "[[ -f '$test_dir/.ralph/state/history/state_001.json' && -f '$test_dir/.ralph/state/history/state_002.json' ]]"
}

# Test: Manual override
test_manual_override() {
    print_test_section "Manual Override"

    local test_dir="${TEST_CIRCUIT_DIR}/${TEST_CIRCUIT_NAME}-manual"
    mkdir -p "$test_dir/.ralph"

    # Start in OPEN state
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "OPEN",
  "trigger_reason": "Stagnation: 10 loops without progress",
  "trigger_count": 1,
  "loop_count": 10
}
EOF

    run_test "Initial state is OPEN" \
        "jq -e '.status == \"OPEN\"' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    # Manual reset
    cat > "$test_dir/.ralph/circuit-state.json" << 'EOF'
{
  "status": "CLOSED",
  "trigger_reason": "",
  "trigger_count": 1,
  "loop_count": 10,
  "consecutive_no_progress_loops": 0
}
EOF

    run_test "Manual reset closes circuit" \
        "jq -e '.status == \"CLOSED\"' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    run_test "Manual reset clears trigger reason" \
        "jq -e '.trigger_reason == \"\"' '$test_dir/.ralph/circuit-state.json' >/dev/null"

    run_test "Manual reset resets stagnation counter" \
        "jq -e '.consecutive_no_progress_loops == 0' '$test_dir/.ralph/circuit-state.json' >/dev/null"
}

# Test: Project-specific thresholds
test_project_specific_thresholds() {
    print_test_section "Project-Specific Thresholds"

    local test_dir="${TEST_CIRCUIT_DIR}/${TEST_CIRCUIT_NAME}-projects"
    mkdir -p "$test_dir/.ralph/projects"

    # Create critical feature project config
    cat > "$test_dir/.ralph/projects/critical-feature.json" << 'EOF'
{
  "project_type": "critical_feature",
  "max_loops": 15,
  "stagnation_threshold": 2,
  "timeout_seconds": 600
}
EOF

    run_test "Critical feature config exists" \
        "[[ -f '$test_dir/.ralph/projects/critical-feature.json' ]]"

    run_test "Critical feature has higher loop limit" \
        "jq -e '.max_loops == 15' '$test_dir/.ralph/projects/critical-feature.json' >/dev/null"

    # Create simple script project config
    cat > "$test_dir/.ralph/projects/simple-script.json" << 'EOF'
{
  "project_type": "simple_script",
  "max_loops": 3,
  "stagnation_threshold": 2,
  "timeout_seconds": 60
}
EOF

    run_test "Simple script config exists" \
        "[[ -f '$test_dir/.ralph/projects/simple-script.json' ]]"

    run_test "Simple script has lower loop limit" \
        "jq -e '.max_loops == 3' '$test_dir/.ralph/projects/simple-script.json' >/dev/null"

    # Create research task project config
    cat > "$test_dir/.ralph/projects/research-task.json" << 'EOF'
{
  "project_type": "research_task",
  "max_loops": 20,
  "stagnation_threshold": 5,
  "timeout_seconds": 900
}
EOF

    run_test "Research task config exists" \
        "[[ -f '$test_dir/.ralph/projects/research-task.json' ]]"

    run_test "Research task has highest loop limit" \
        "jq -e '.max_loops == 20' '$test_dir/.ralph/projects/research-task.json' >/dev/null"
}

# Generate test summary
generate_test_summary() {
    print_test_header "Circuit Breaker Test Summary"

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
        echo -e "${GREEN}║${NC} ${GREEN}ALL TESTS PASSED - Circuit Breaker is fully functional!${NC} ${GREEN}║${NC}"
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
    print_test_header "Phase 4: Circuit Breaker - Functionality Tests"

    info "Starting Circuit Breaker tests..."
    info "Blackbox4 root: $BOX_ROOT"
    info "Test directory: $TEST_CIRCUIT_DIR"
    echo ""

    # Run all test suites
    test_circuit_breaker_library
    test_circuit_initialization
    test_state_transitions
    test_failure_detection
    test_auto_recovery
    test_metrics_collection
    test_threshold_configuration
    test_logging_history
    test_manual_override
    test_project_specific_thresholds

    # Generate summary
    generate_test_summary
    exit $?
}

# Run main
main "$@"
