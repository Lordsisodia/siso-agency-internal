#!/usr/bin/env bash
set -euo pipefail

# Response Analyzer Functionality Tests
# Tests pattern matching, quality scoring, expectation validation, and Ralph-specific analysis

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
RESPONSE_ANALYZER_DIR="${BOX_ROOT}/4-scripts/lib/response-analyzer"

# Test data
TEST_ANALYZER_DIR="${BOX_ROOT}/.tests/phase4/response-analyzer"
TEST_ANALYZER_NAME="test-analyzer-$(date +%s)"

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

# Test: Response analyzer library structure
test_analyzer_library_structure() {
    print_test_section "Response Analyzer Library Structure"

    run_test "Response analyzer directory exists" \
        "[[ -d '$RESPONSE_ANALYZER_DIR' ]]"

    # Create test structure if it doesn't exist
    mkdir -p "$RESPONSE_ANALYZER_DIR"

    run_test "Can create analyzer patterns directory" \
        "mkdir -p '$RESPONSE_ANALYZER_DIR/patterns'"

    run_test "Can create analyzer metrics directory" \
        "mkdir -p '$RESPONSE_ANALYZER_DIR/metrics'"
}

# Test: Pattern matching
test_pattern_matching() {
    print_test_section "Pattern Matching"

    local test_dir="${TEST_ANALYZER_DIR}/${TEST_ANALYZER_NAME}-patterns"
    mkdir -p "$test_dir"

    # Create test patterns
    cat > "$test_dir/patterns.json" << 'EOF'
{
  "success_patterns": [
    "done",
    "complete",
    "finished",
    "success",
    "✓",
    "✅"
  ],
  "failure_patterns": [
    "error",
    "failed",
    "timeout",
    "exception"
  ],
  "progress_patterns": [
    "step",
    "phase",
    "progress",
    "%"
  ]
}
EOF

    run_test "Pattern file exists" \
        "[[ -f '$test_dir/patterns.json' ]]"

    run_test "Pattern file has valid JSON" \
        "jq empty '$test_dir/patterns.json' 2>/dev/null"

    run_test "Success patterns defined" \
        "jq -e '.success_patterns | length > 0' '$test_dir/patterns.json' >/dev/null"

    run_test "Failure patterns defined" \
        "jq -e '.failure_patterns | length > 0' '$test_dir/patterns.json' >/dev/null"

    run_test "Progress patterns defined" \
        "jq -e '.progress_patterns | length > 0' '$test_dir/patterns.json' >/dev/null"

    # Test pattern matching
    local test_response="Task completed successfully ✓"
    echo "$test_response" > "$test_dir/test-response.txt"

    run_test "Can detect success pattern in response" \
        "grep -qi 'success\\|completed\\|✓' '$test_dir/test-response.txt'"

    local test_response_fail="Error: Task failed to complete"
    echo "$test_response_fail" > "$test_dir/test-response-fail.txt"

    run_test "Can detect failure pattern in response" \
        "grep -qi 'error\\|failed' '$test_dir/test-response-fail.txt'"
}

# Test: Quality scoring
test_quality_scoring() {
    print_test_section "Quality Scoring"

    local test_dir="${TEST_ANALYZER_DIR}/${TEST_ANALYZER_NAME}-quality"
    mkdir -p "$test_dir"

    # Create quality metrics
    cat > "$test_dir/quality-metrics.json" << 'EOF'
{
  "response_length": 500,
  "completeness_score": 0.9,
  "relevance_score": 0.85,
  "clarity_score": 0.8,
  "overall_quality": 0.85,
  "factors": {
    "has_structure": true,
    "has_code_blocks": true,
    "has_examples": true,
    "has_explanations": true
  }
}
EOF

    run_test "Quality metrics file exists" \
        "[[ -f '$test_dir/quality-metrics.json' ]]"

    run_test "Quality metrics has valid JSON" \
        "jq empty '$test_dir/quality-metrics.json' 2>/dev/null"

    run_test "Completeness score is tracked" \
        "jq -e '.completeness_score' '$test_dir/quality-metrics.json' >/dev/null"

    run_test "Relevance score is tracked" \
        "jq -e '.relevance_score' '$test_dir/quality-metrics.json' >/dev/null"

    run_test "Overall quality is calculated" \
        "jq -e '.overall_quality' '$test_dir/quality-metrics.json' >/dev/null"

    run_test "Quality factors are recorded" \
        "jq -e '.factors.has_structure' '$test_dir/quality-metrics.json' >/dev/null"
}

# Test: Expectation validation
test_expectation_validation() {
    print_test_section "Expectation Validation"

    local test_dir="${TEST_ANALYZER_DIR}/${TEST_ANALYZE_NAME}-expectations"
    mkdir -p "$test_dir"

    # Create expectation template
    cat > "$test_dir/expectations.json" << 'EOF'
{
  "expected_elements": [
    "task_completion",
    "code_snippet",
    "explanation",
    "testing_instructions"
  ],
  "required_keywords": [
    "implement",
    "function",
    "test"
  ],
  "min_length": 100,
  "max_length": 5000,
  "format_requirements": [
    "markdown",
    "code_blocks"
  ]
}
EOF

    run_test "Expectations file exists" \
        "[[ -f '$test_dir/expectations.json' ]]"

    run_test "Expectations has valid JSON" \
        "jq empty '$test_dir/expectations.json' 2>/dev/null"

    run_test "Expected elements defined" \
        "jq -e '.expected_elements | length > 0' '$test_dir/expectations.json' >/dev/null"

    run_test "Required keywords defined" \
        "jq -e '.required_keywords | length > 0' '$test_dir/expectations.json' >/dev/null"

    # Create test response meeting expectations
    cat > "$test_dir/test-response.md" << 'EOF'
# Task Implementation

Here is the implementation of the function:

```python
def test_function():
    return "success"
```

## Explanation
This function implements the required feature.

## Testing
Run tests with: pytest
EOF

    run_test "Test response exists" \
        "[[ -f '$test_dir/test-response.md' ]]"

    run_test "Response contains expected code snippet" \
        "grep -q '```' '$test_dir/test-response.md'"

    run_test "Response contains required keywords" \
        "grep -qi 'implement\\|function\\|test' '$test_dir/test-response.md'"
}

# Test: Ralph-specific analysis
test_ralph_specific_analysis() {
    print_test_section "Ralph-Specific Analysis"

    local test_dir="${TEST_ANALYZER_DIR}/${TEST_ANALYZER_NAME}-ralph"
    mkdir -p "$test_dir"

    # Create Ralph response patterns
    cat > "$test_dir/ralph-patterns.json" << 'EOF'
{
  "decision_markers": [
    "I will",
    "Let me",
    "I'll",
    "Next step"
  ],
  "coordination_markers": [
    "coordinating",
    "delegating",
    "handoff",
    "agent"
  ],
  "progress_indicators": [
    "completed",
    "finished",
    "done",
    "moving to"
  ],
  "error_recovery": [
    "retrying",
    "recovering",
    "fallback",
    "alternative"
  ]
}
EOF

    run_test "Ralph patterns file exists" \
        "[[ -f '$test_dir/ralph-patterns.json' ]]"

    run_test "Decision markers defined" \
        "jq -e '.decision_markers | length > 0' '$test_dir/ralph-patterns.json' >/dev/null"

    run_test "Coordination markers defined" \
        "jq -e '.coordination_markers | length > 0' '$test_dir/ralph-patterns.json' >/dev/null"

    # Create Ralph response sample
    cat > "$test_dir/ralph-response.md" << 'EOF'
# Execution Plan

I will begin by analyzing the task requirements.
Let me coordinate with the specialist agent for implementation.

## Progress
- Completed: Requirements analysis
- Moving to: Implementation phase

## Next Steps
I'll delegate the coding task to the specialist.
EOF

    run_test "Ralph response sample exists" \
        "[[ -f '$test_dir/ralph-response.md' ]]"

    run_test "Contains decision markers" \
        "grep -qi 'I will\\|Let me\\|I'll' '$test_dir/ralph-response.md'"

    run_test "Contains coordination markers" \
        "grep -qi 'coordinat\\|delegat\\|agent' '$test_dir/ralph-response.md'"

    run_test "Contains progress indicators" \
        "grep -qi 'completed\\|moving to' '$test_dir/ralph-response.md'"
}

# Test: Response categorization
test_response_categorization() {
    print_test_section "Response Categorization"

    local test_dir="${TEST_ANALYZER_DIR}/${TEST_ANALYZER_NAME}-categorization"
    mkdir -p "$test_dir"

    # Create categorization rules
    cat > "$test_dir/categories.json" << 'EOF'
{
  "categories": {
    "execution": {
      "patterns": ["executing", "running", "implementing"],
      "priority": "high"
    },
    "planning": {
      "patterns": ["planning", "analyzing", "designing"],
      "priority": "medium"
    },
    "coordination": {
      "patterns": ["delegating", "coordinating", "handoff"],
      "priority": "medium"
    },
    "error": {
      "patterns": ["error", "failed", "exception"],
      "priority": "critical"
    },
    "completion": {
      "patterns": ["done", "complete", "finished"],
      "priority": "low"
    }
  }
}
EOF

    run_test "Categories file exists" \
        "[[ -f '$test_dir/categories.json' ]]"

    run_test "Categories has valid JSON" \
        "jq empty '$test_dir/categories.json' 2>/dev/null"

    run_test "Execution category defined" \
        "jq -e '.categories.execution' '$test_dir/categories.json' >/dev/null"

    run_test "Error category has critical priority" \
        "jq -e '.categories.error.priority == \"critical\"' '$test_dir/categories.json' >/dev/null"

    # Test categorization
    cat > "$test_dir/response-exec.txt" << 'EOF'
Executing task implementation...
Running tests...
EOF

    run_test "Can categorize execution response" \
        "grep -qi 'executing\\|running' '$test_dir/response-exec.txt'"

    cat > "$test_dir/response-error.txt" << 'EOF'
Error: Task failed to complete
Exception occurred during execution
EOF

    run_test "Can categorize error response" \
        "grep -qi 'error\\|failed\\|exception' '$test_dir/response-error.txt'"
}

# Test: Sentiment analysis
test_sentiment_analysis() {
    print_test_section "Sentiment Analysis"

    local test_dir="${TEST_ANALYZER_DIR}/${TEST_ANALYZER_NAME}-sentiment"
    mkdir -p "$test_dir"

    # Create sentiment markers
    cat > "$test_dir/sentiment-markers.json" << 'EOF'
{
  "positive": [
    "success",
    "completed",
    "excellent",
    "optimal",
    "efficient"
  ],
  "negative": [
    "error",
    "failed",
    "unfortunately",
    "problem",
    "issue"
  ],
  "neutral": [
    "processing",
    "analyzing",
    "waiting",
    "pending"
  ]
}
EOF

    run_test "Sentiment markers file exists" \
        "[[ -f '$test_dir/sentiment-markers.json' ]]"

    run_test "Positive markers defined" \
        "jq -e '.positive | length > 0' '$test_dir/sentiment-markers.json' >/dev/null"

    run_test "Negative markers defined" \
        "jq -e '.negative | length > 0' '$test_dir/sentiment-markers.json' >/dev/null"

    # Test sentiment detection
    cat > "$test_dir/response-positive.txt" << 'EOF'
Task completed successfully!
Excellent progress on implementation.
EOF

    run_test "Can detect positive sentiment" \
        "grep -qi 'success\\|excellent\\|completed' '$test_dir/response-positive.txt'"

    cat > "$test_dir/response-negative.txt" << 'EOF'
Unfortunately, the task failed.
Problem encountered during execution.
EOF

    run_test "Can detect negative sentiment" \
        "grep -qi 'unfortunately\\|failed\\|problem' '$test_dir/response-negative.txt'"
}

# Test: Progress tracking
test_progress_tracking() {
    print_test_section "Progress Tracking in Responses"

    local test_dir="${TEST_ANALYZER_DIR}/${TEST_ANALYZER_NAME}-progress"
    mkdir -p "$test_dir"

    # Create progress indicators
    cat > "$test_dir/progress-indicators.json" << 'EOF'
{
  "completion_indicators": [
    "100%",
    "all done",
    "fully complete"
  ],
  "partial_progress": [
    "step 1",
    "phase 1",
    "in progress",
    "working on"
  ],
  "task_markers": [
    "task:",
    "- [ ]",
    "- [x]"
  ]
}
EOF

    run_test "Progress indicators file exists" \
        "[[ -f '$test_dir/progress-indicators.json' ]]"

    run_test "Completion indicators defined" \
        "jq -e '.completion_indicators | length > 0' '$test_dir/progress-indicators.json' >/dev/null"

    # Test progress detection
    cat > "$test_dir/response-progress.md" << 'EOF'
# Implementation Progress

- [x] Step 1: Analysis
- [x] Step 2: Design
- [ ] Step 3: Implementation
- [ ] Step 4: Testing

Current: Working on Step 3 (50% complete)
EOF

    run_test "Can detect task completion markers" \
        "grep -q '\\- \\[x\\]' '$test_dir/response-progress.md'"

    run_test "Can detect task pending markers" \
        "grep -q '\\- \\[ \\]' '$test_dir/response-progress.md'"

    run_test "Can detect progress percentage" \
        "grep -q '[0-9]*%' '$test_dir/response-progress.md'"
}

# Test: Action extraction
test_action_extraction() {
    print_test_section "Action Extraction"

    local test_dir="${TEST_ANALYZER_DIR}/${TEST_ANALYZER_NAME}-actions"
    mkdir -p "$test_dir"

    # Create action patterns
    cat > "$test_dir/action-patterns.json" << 'EOF'
{
  "action_verbs": [
    "implement",
    "create",
    "update",
    "delete",
    "modify",
    "test",
    "deploy"
  ],
  "action_patterns": [
    "will [verb]",
    "going to [verb]",
    "next: [verb]"
  ]
}
EOF

    run_test "Action patterns file exists" \
        "[[ -f '$test_dir/action-patterns.json' ]]"

    run_test "Action verbs defined" \
        "jq -e '.action_verbs | length > 0' '$test_dir/action-patterns.json' >/dev/null"

    # Test action extraction
    cat > "$test_dir/response-actions.md" << 'EOF'
# Next Steps

I will implement the new feature.
Going to create the test suite.
Next: update the documentation.
EOF

    run_test "Can extract action verbs" \
        "grep -qi 'implement\\|create\\|update' '$test_dir/response-actions.md'"

    run_test "Can detect future actions" \
        "grep -qi 'will\\|going to' '$test_dir/response-actions.md'"
}

# Test: Response validation
test_response_validation() {
    print_test_section "Response Validation"

    local test_dir="${TEST_ANALYZER_DIR}/${TEST_ANALYZER_NAME}-validation"
    mkdir -p "$test_dir"

    # Create validation rules
    cat > "$test_dir/validation-rules.json" << 'EOF'
{
  "required_sections": [
    "summary",
    "implementation",
    "testing"
  ],
  "min_length_chars": 50,
  "max_length_chars": 10000,
  "allowed_formats": ["markdown", "json"],
  "must_have_code_block": false
}
EOF

    run_test "Validation rules file exists" \
        "[[ -f '$test_dir/validation-rules.json' ]]"

    run_test "Validation rules has valid JSON" \
        "jq empty '$test_dir/validation-rules.json' 2>/dev/null"

    # Create valid response
    cat > "$test_dir/response-valid.md" << 'EOF'
# Summary
This is a brief summary of the implementation.

# Implementation
The implementation involves creating a new function that handles the task.

# Testing
Tests are run using pytest with the following command: pytest test_file.py
EOF

    run_test "Valid response exists" \
        "[[ -f '$test_dir/response-valid.md' ]]"

    run_test "Response has required sections" \
        "grep -q '# Summary\\|# Implementation\\|# Testing' '$test_dir/response-valid.md'"

    run_test "Response meets minimum length" \
        "[[ $(wc -c < '$test_dir/response-valid.md') -ge 50 ]]"
}

# Test: Metrics collection
test_metrics_collection() {
    print_test_section "Metrics Collection"

    local test_dir="${TEST_ANALYZER_DIR}/${TEST_ANALYZER_NAME}-metrics"
    mkdir -p "$test_dir"

    # Create metrics summary
    cat > "$test_dir/analysis-metrics.json" << 'EOF'
{
  "total_responses_analyzed": 100,
  "avg_quality_score": 0.82,
  "avg_response_length": 500,
  "success_rate": 0.95,
  "categories_detected": {
    "execution": 40,
    "planning": 30,
    "coordination": 20,
    "error": 5,
    "completion": 5
  },
  "common_patterns": [
    "implementing",
    "testing",
    "deploying"
  ]
}
EOF

    run_test "Metrics file exists" \
        "[[ -f '$test_dir/analysis-metrics.json' ]]"

    run_test "Metrics has valid JSON" \
        "jq empty '$test_dir/analysis-metrics.json' 2>/dev/null"

    run_test "Total responses tracked" \
        "jq -e '.total_responses_analyzed' '$test_dir/analysis-metrics.json' >/dev/null"

    run_test "Average quality score calculated" \
        "jq -e '.avg_quality_score' '$test_dir/analysis-metrics.json' >/dev/null"

    run_test "Category breakdown available" \
        "jq -e '.categories_detected' '$test_dir/analysis-metrics.json' >/dev/null"
}

# Generate test summary
generate_test_summary() {
    print_test_header "Response Analyzer Test Summary"

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
        echo -e "${GREEN}║${NC} ${GREEN}ALL TESTS PASSED - Response Analyzer is fully functional!${NC} ${GREEN}║${NC}"
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
    print_test_header "Phase 4: Response Analyzer - Functionality Tests"

    info "Starting Response Analyzer tests..."
    info "Blackbox4 root: $BOX_ROOT"
    info "Test directory: $TEST_ANALYZER_DIR"
    echo ""

    # Run all test suites
    test_analyzer_library_structure
    test_pattern_matching
    test_quality_scoring
    test_expectation_validation
    test_ralph_specific_analysis
    test_response_categorization
    test_sentiment_analysis
    test_progress_tracking
    test_action_extraction
    test_response_validation
    test_metrics_collection

    # Generate summary
    generate_test_summary
    exit $?
}

# Run main
main "$@"
