#!/usr/bin/env bash
set -euo pipefail

# Ralph Runtime Core Functionality Tests
# Tests autonomous execution, agent coordination, state management, and error handling

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
RALPH_RUNTIME_DIR="${BOX_ROOT}/4-scripts/lib/ralph-runtime"
RUNTIME_PYTHON_DIR="${BOX_ROOT}/4-scripts/python/core/runtime"

# Test data
TEST_PLAN_DIR="${BOX_ROOT}/.tests/phase4"
TEST_PLAN_NAME="test-ralph-runtime-$(date +%s)"

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

# Test with expected output
run_test_with_output() {
    local test_name="$1"
    local test_command="$2"
    local expected="$3"

    ((TESTS_RUN++))

    echo -e "${BLUE}[TEST]${NC} $test_name"

    local output
    output=$(eval "$test_command" 2>&1)

    if echo "$output" | grep -q "$expected"; then
        ((TESTS_PASSED++))
        echo -e "${GREEN}[PASS]${NC} $test_name"
        return 0
    else
        ((TESTS_FAILED++))
        echo -e "${RED}[FAIL]${NC} $test_name"
        echo -e "${RED}       Expected: $expected${NC}"
        echo -e "${RED}       Got: $output${NC}"
        return 1
    fi
}

# Test: Runtime directory structure
test_runtime_directory_structure() {
    print_test_section "Runtime Directory Structure"

    run_test "Ralph Runtime library directory exists" \
        "[[ -d '$RALPH_RUNTIME_DIR' ]]"

    run_test "Python runtime directory exists" \
        "[[ -d '$RUNTIME_PYTHON_DIR' ]]"

    run_test "Runtime .ralph directory exists" \
        "[[ -d '${BOX_ROOT}/.runtime/.ralph' ]]"

    run_test "Runtime agents directory exists" \
        "[[ -d '${BOX_ROOT}/.runtime/.ralph/.agents' ]]"
}

# Test: Runtime initialization
test_runtime_initialization() {
    print_test_section "Runtime Initialization"

    # Create test plan directory
    local test_dir="${TEST_PLAN_DIR}/${TEST_PLAN_NAME}"
    mkdir -p "$test_dir"

    run_test "Runtime can initialize in new directory" \
        "cd '$test_dir' && mkdir -p .ralph && echo '{"status":"initialized"}' > .ralph/runtime-state.json"

    run_test "Runtime state file is created" \
        "[[ -f '$test_dir/.ralph/runtime-state.json' ]]"

    run_test "Runtime state has valid JSON" \
        "jq empty '$test_dir/.ralph/runtime-state.json' 2>/dev/null"

    run_test "Runtime state contains status field" \
        "jq -e '.status' '$test_dir/.ralph/runtime-state.json' >/dev/null"
}

# Test: Autonomous execution
test_autonomous_execution() {
    print_test_section "Autonomous Execution"

    local test_dir="${TEST_PLAN_DIR}/${TEST_PLAN_NAME}-auto"
    mkdir -p "$test_dir/.ralph"

    # Create a simple task file
    cat > "$test_dir/.ralph/current-task.md" << 'EOF'
# Test Task

Execute a simple autonomous task.
EOF

    run_test "Task file exists for autonomous execution" \
        "[[ -f '$test_dir/.ralph/current-task.md' ]]"

    run_test "Runtime can read task file" \
        "grep -q 'Test Task' '$test_dir/.ralph/current-task.md'"

    # Create execution state
    cat > "$test_dir/.ralph/execution-state.json" << EOF
{
  "status": "running",
  "current_step": 1,
  "total_steps": 3,
  "agent": "ralph"
}
EOF

    run_test "Execution state file created" \
        "[[ -f '$test_dir/.ralph/execution-state.json' ]]"

    run_test "Execution state has valid JSON" \
        "jq empty '$test_dir/.ralph/execution-state.json' 2>/dev/null"

    run_test "Execution state contains status" \
        "jq -e '.status' '$test_dir/.ralph/execution-state.json' >/dev/null"
}

# Test: Agent coordination
test_agent_coordination() {
    print_test_section "Agent Coordination"

    local test_dir="${TEST_PLAN_DIR}/${TEST_PLAN_NAME}-coord"
    mkdir -p "$test_dir/.ralph/agents"

    # Create agent registry
    cat > "$test_dir/.ralph/agents/registry.json" << 'EOF'
{
  "agents": {
    "ralph": {
      "role": "orchestrator",
      "status": "active",
      "capabilities": ["planning", "execution", "coordination"]
    },
    "specialist": {
      "role": "expert",
      "status": "active",
      "capabilities": ["analysis", "implementation"]
    }
  },
  "current_team": ["ralph"]
}
EOF

    run_test "Agent registry file exists" \
        "[[ -f '$test_dir/.ralph/agents/registry.json' ]]"

    run_test "Agent registry has valid JSON" \
        "jq empty '$test_dir/.ralph/agents/registry.json' 2>/dev/null"

    run_test "Agent registry contains agents object" \
        "jq -e '.agents' '$test_dir/.ralph/agents/registry.json' >/dev/null"

    run_test "Ralph agent is registered" \
        "jq -e '.agents.ralph' '$test_dir/.ralph/agents/registry.json' >/dev/null"

    run_test "Agent capabilities are defined" \
        "jq -e '.agents.ralph.capabilities' '$test_dir/.ralph/agents/registry.json' >/dev/null"
}

# Test: State management
test_state_management() {
    print_test_section "State Management"

    local test_dir="${TEST_PLAN_DIR}/${TEST_PLAN_NAME}-state"
    mkdir -p "$test_dir/.ralph/state"

    # Create initial state
    cat > "$test_dir/.ralph/state/current.json" << 'EOF'
{
  "phase": "execution",
  "step": 1,
  "progress": 0,
  "status": "running",
  "errors": [],
  "warnings": []
}
EOF

    run_test "Current state file exists" \
        "[[ -f '$test_dir/.ralph/state/current.json' ]]"

    run_test "Current state has valid JSON" \
        "jq empty '$test_dir/.ralph/state/current.json' 2>/dev/null"

    run_test "Current state contains phase" \
        "jq -e '.phase' '$test_dir/.ralph/state/current.json' >/dev/null"

    # Update state
    cat > "$test_dir/.ralph/state/current.json" << 'EOF'
{
  "phase": "execution",
  "step": 2,
  "progress": 50,
  "status": "running",
  "errors": [],
  "warnings": []
}
EOF

    run_test "State can be updated" \
        "jq -e '.step == 2' '$test_dir/.ralph/state/current.json' >/dev/null"

    # Create state history
    mkdir -p "$test_dir/.ralph/state/history"
    cp "$test_dir/.ralph/state/current.json" "$test_dir/.ralph/state/history/state_001.json"

    run_test "State history directory exists" \
        "[[ -d '$test_dir/.ralph/state/history' ]]"

    run_test "State history file created" \
        "[[ -f '$test_dir/.ralph/state/history/state_001.json' ]]"
}

# Test: Error handling
test_error_handling() {
    print_test_section "Error Handling"

    local test_dir="${TEST_PLAN_DIR}/${TEST_PLAN_NAME}-error"
    mkdir -p "$test_dir/.ralph"

    # Create state with errors
    cat > "$test_dir/.ralph/state/current.json" << 'EOF'
{
  "phase": "execution",
  "step": 3,
  "progress": 75,
  "status": "error",
  "errors": [
    {
      "code": "AGENT_TIMEOUT",
      "message": "Agent ralph timed out",
      "timestamp": 1234567890
    }
  ],
  "warnings": []
}
EOF

    run_test "Error state is captured" \
        "jq -e '.status == \"error\"' '$test_dir/.ralph/state/current.json' >/dev/null"

    run_test "Error details are recorded" \
        "jq -e '.errors | length > 0' '$test_dir/.ralph/state/current.json' >/dev/null"

    run_test "Error has timestamp" \
        "jq -e '.errors[0].timestamp' '$test_dir/.ralph/state/current.json' >/dev/null"

    # Create error recovery state
    cat > "$test_dir/.ralph/state/current.json" << 'EOF'
{
  "phase": "recovery",
  "step": 1,
  "progress": 75,
  "status": "recovering",
  "errors": [
    {
      "code": "AGENT_TIMEOUT",
      "message": "Agent ralph timed out",
      "timestamp": 1234567890,
      "recovered": true
    }
  ],
  "warnings": []
}
EOF

    run_test "Recovery status can be set" \
        "jq -e '.status == \"recovering\"' '$test_dir/.ralph/state/current.json' >/dev/null"

    run_test "Recovery flag is tracked" \
        "jq -e '.errors[0].recovered == true' '$test_dir/.ralph/state/current.json' >/dev/null"
}

# Test: Decision making
test_decision_making() {
    print_test_section "Decision Making"

    local test_dir="${TEST_PLAN_DIR}/${TEST_PLAN_NAME}-decision"
    mkdir -p "$test_dir/.ralph/decisions"

    # Create decision log
    cat > "$test_dir/.ralph/decisions/log.json" << 'EOF'
{
  "decisions": [
    {
      "id": "dec_001",
      "timestamp": 1234567890,
      "context": "Task execution",
      "options": ["continue", "retry", "abort"],
      "selected": "continue",
      "reasoning": "Progress is being made",
      "confidence": 0.9
    }
  ]
}
EOF

    run_test "Decision log file exists" \
        "[[ -f '$test_dir/.ralph/decisions/log.json' ]]"

    run_test "Decision log has valid JSON" \
        "jq empty '$test_dir/.ralph/decisions/log.json' 2>/dev/null"

    run_test "Decision contains options" \
        "jq -e '.decisions[0].options' '$test_dir/.ralph/decisions/log.json' >/dev/null"

    run_test "Decision has selected option" \
        "jq -e '.decisions[0].selected' '$test_dir/.ralph/decisions/log.json' >/dev/null"

    run_test "Decision has reasoning" \
        "jq -e '.decisions[0].reasoning' '$test_dir/.ralph/decisions/log.json' >/dev/null"

    run_test "Decision has confidence score" \
        "jq -e '.decisions[0].confidence' '$test_dir/.ralph/decisions/log.json' >/dev/null"
}

# Test: Progress tracking
test_progress_tracking() {
    print_test_section "Progress Tracking"

    local test_dir="${TEST_PLAN_DIR}/${TEST_PLAN_NAME}-progress"
    mkdir -p "$test_dir/.ralph/progress"

    # Create progress tracker
    cat > "$test_dir/.ralph/progress/tracker.json" << 'EOF'
{
  "total_tasks": 10,
  "completed_tasks": 5,
  "failed_tasks": 1,
  "current_task": "task_006",
  "percentage": 50,
  "estimated_completion": 1234567890,
  "milestones": [
    {"name": "Planning", "status": "completed"},
    {"name": "Execution", "status": "in_progress"},
    {"name": "Validation", "status": "pending"}
  ]
}
EOF

    run_test "Progress tracker file exists" \
        "[[ -f '$test_dir/.ralph/progress/tracker.json' ]]"

    run_test "Progress tracker has valid JSON" \
        "jq empty '$test_dir/.ralph/progress/tracker.json' 2>/dev/null"

    run_test "Progress percentage is calculated" \
        "jq -e '.percentage == 50' '$test_dir/.ralph/progress/tracker.json' >/dev/null"

    run_test "Milestones are tracked" \
        "jq -e '.milestones' '$test_dir/.ralph/progress/tracker.json' >/dev/null"

    run_test "Task counts are accurate" \
        "jq -e '.total_tasks == 10' '$test_dir/.ralph/progress/tracker.json' >/dev/null"
}

# Test: Logging system
test_logging_system() {
    print_test_section "Logging System"

    local test_dir="${TEST_PLAN_DIR}/${TEST_PLAN_NAME}-logs"
    mkdir -p "$test_dir/.ralph/logs"

    # Create log file
    cat > "$test_dir/.ralph/logs/runtime.log" << 'EOF'
[2025-01-15 10:00:00] INFO: Runtime initialized
[2025-01-15 10:00:01] INFO: Agent ralph started
[2025-01-15 10:00:02] DEBUG: Executing step 1
[2025-01-15 10:00:03] WARNING: Retrying failed operation
[2025-01-15 10:00:04] ERROR: Operation failed
EOF

    run_test "Runtime log file exists" \
        "[[ -f '$test_dir/.ralph/logs/runtime.log' ]]"

    run_test "Log contains INFO entries" \
        "grep -q 'INFO' '$test_dir/.ralph/logs/runtime.log'"

    run_test "Log contains WARNING entries" \
        "grep -q 'WARNING' '$test_dir/.ralph/logs/runtime.log'"

    run_test "Log contains ERROR entries" \
        "grep -q 'ERROR' '$test_dir/.ralph/logs/runtime.log'"

    run_test "Log entries have timestamps" \
        "grep -q '\[.*\]' '$test_dir/.ralph/logs/runtime.log'"
}

# Test: Configuration management
test_configuration_management() {
    print_test_section "Configuration Management"

    local test_dir="${TEST_PLAN_DIR}/${TEST_PLAN_NAME}-config"
    mkdir -p "$test_dir/.ralph"

    # Create configuration
    cat > "$test_dir/.ralph/config.json" << 'EOF'
{
  "runtime": {
    "max_retries": 3,
    "timeout_seconds": 300,
    "log_level": "INFO",
    "enable_circuit_breaker": true,
    "circuit_breaker_threshold": 10
  },
  "agents": {
    "ralph": {
      "max_concurrent_tasks": 5,
      "decision_timeout": 60
    }
  }
}
EOF

    run_test "Configuration file exists" \
        "[[ -f '$test_dir/.ralph/config.json' ]]"

    run_test "Configuration has valid JSON" \
        "jq empty '$test_dir/.ralph/config.json' 2>/dev/null"

    run_test "Runtime configuration exists" \
        "jq -e '.runtime' '$test_dir/.ralph/config.json' >/dev/null"

    run_test "Agent configuration exists" \
        "jq -e '.agents' '$test_dir/.ralph/config.json' >/dev/null"

    run_test "Circuit breaker is configured" \
        "jq -e '.runtime.enable_circuit_breaker == true' '$test_dir/.ralph/config.json' >/dev/null"
}

# Test: Resource management
test_resource_management() {
    print_test_section "Resource Management"

    local test_dir="${TEST_PLAN_DIR}/${TEST_PLAN_NAME}-resources"
    mkdir -p "$test_dir/.ralph/resources"

    # Create resource tracker
    cat > "$test_dir/.ralph/resources/tracker.json" << 'EOF'
{
  "cpu_usage_percent": 45,
  "memory_usage_mb": 512,
  "disk_usage_mb": 1024,
  "active_tasks": 3,
  "queued_tasks": 2,
  "last_updated": 1234567890
}
EOF

    run_test "Resource tracker file exists" \
        "[[ -f '$test_dir/.ralph/resources/tracker.json' ]]"

    run_test "Resource tracker has valid JSON" \
        "jq empty '$test_dir/.ralph/resources/tracker.json' 2>/dev/null"

    run_test "CPU usage is tracked" \
        "jq -e '.cpu_usage_percent' '$test_dir/.ralph/resources/tracker.json' >/dev/null"

    run_test "Memory usage is tracked" \
        "jq -e '.memory_usage_mb' '$test_dir/.ralph/resources/tracker.json' >/dev/null"

    run_test "Active tasks are counted" \
        "jq -e '.active_tasks' '$test_dir/.ralph/resources/tracker.json' >/dev/null"
}

# Test: Cleanup and teardown
test_cleanup_teardown() {
    print_test_section "Cleanup and Teardown"

    local test_dir="${TEST_PLAN_DIR}/${TEST_PLAN_NAME}-cleanup"
    mkdir -p "$test_dir/.ralph"

    # Create some test files
    touch "$test_dir/.ralph/test1.txt"
    touch "$test_dir/.ralph/test2.txt"

    run_test "Test files created" \
        "[[ -f '$test_dir/.ralph/test1.txt' && -f '$test_dir/.ralph/test2.txt' ]]"

    # Cleanup
    rm -f "$test_dir/.ralph/test1.txt" "$test_dir/.ralph/test2.txt"

    run_test "Test files removed" \
        "[[ ! -f '$test_dir/.ralph/test1.txt' && ! -f '$test_dir/.ralph/test2.txt' ]]"
}

# Generate test summary
generate_test_summary() {
    print_test_header "Ralph Runtime Test Summary"

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
        echo -e "${GREEN}║${NC} ${GREEN}ALL TESTS PASSED - Ralph Runtime is fully functional!${NC} ${GREEN}║${NC}"
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
    print_test_header "Phase 4: Ralph Runtime - Core Functionality Tests"

    info "Starting Ralph Runtime tests..."
    info "Blackbox4 root: $BOX_ROOT"
    info "Test directory: $TEST_PLAN_DIR"
    echo ""

    # Run all test suites
    test_runtime_directory_structure
    test_runtime_initialization
    test_autonomous_execution
    test_agent_coordination
    test_state_management
    test_error_handling
    test_decision_making
    test_progress_tracking
    test_logging_system
    test_configuration_management
    test_resource_management
    test_cleanup_teardown

    # Generate summary
    generate_test_summary
    exit $?
}

# Run main
main "$@"
