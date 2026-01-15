#!/usr/bin/env bash
set -euo pipefail

# Phase 3 Test: Questioning Workflow
# Tests the intelligent questioning system

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

# Test 1: Questioning module exists and imports
test_questioning_module() {
    print_header "Test 1: Questioning Module Structure"

    assert_command_succeeds "python3 -c 'import sys; sys.path.insert(0, \"$SPEC_LIB_DIR\"); import questioning; print(questioning.__file__)'" "Questioning module imports successfully"

    echo ""
}

# Test 2: Question creation
test_question_creation() {
    print_header "Test 2: Question Creation"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_question_creation.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from questioning import Question, QuestionCategory, QuestionPriority

# Test basic question creation
question = Question(
    id="Q001",
    text="What is the primary goal?",
    category=QuestionCategory.FUNCTIONAL,
    priority=QuestionPriority.HIGH
)

assert question.id == "Q001"
assert question.text == "What is the primary goal?"
assert question.category == QuestionCategory.FUNCTIONAL
assert question.priority == QuestionPriority.HIGH

# Test optional fields
question2 = Question(
    id="Q002",
    text="What constraints exist?",
    category=QuestionCategory.TECHNICAL,
    priority=QuestionPriority.MEDIUM,
    context="This relates to system architecture",
    depends_on=["Q001"]
)

assert question2.context == "This relates to system architecture"
assert len(question2.depends_on) == 1
assert question2.depends_on[0] == "Q001"

print("Question creation test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Question creation works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 3: Gap analysis
test_gap_analysis() {
    print_header "Test 3: Gap Analysis"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_gap_analysis.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from questioning import identify_gaps, Gap

# Test gap identification
requirement = "Build a login system"
current_spec = {
    "sections": [
        {"title": "Overview", "content": "Basic login functionality"}
    ]
}

gaps = identify_gaps(requirement, current_spec)

assert isinstance(gaps, list)
assert len(gaps) > 0

# Check gap structure
gap = gaps[0]
assert isinstance(gap, Gap)
assert gap.category is not None
assert gap.description is not None
assert gap.severity is not None

print("Gap analysis test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Gap analysis works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 4: Question strategies
test_question_strategies() {
    print_header "Test 4: Question Strategies"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_strategies.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from questioning import QuestionStrategy, get_strategy

# Test strategy retrieval
prd_strategy = get_strategy("prd")
assert prd_strategy is not None
assert prd_strategy.name == "prd"

technical_strategy = get_strategy("technical-spec")
assert technical_strategy is not None
assert technical_strategy.name == "technical-spec"

# Test strategy methods
assert hasattr(prd_strategy, 'generate_questions')
assert hasattr(prd_strategy, 'prioritize_questions')

# Test question generation from strategy
requirement = "Build a user authentication system"
questions = prd_strategy.generate_questions(requirement)
assert isinstance(questions, list)
assert len(questions) > 0

print("Question strategies test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Question strategies work correctly"
    rm -f "$test_script"

    echo ""
}

# Test 5: Question priority calculation
test_priority_calculation() {
    print_header "Test 5: Priority Calculation"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_priority.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from questioning import Question, QuestionPriority, calculate_priority

# Test priority calculation
question1 = Question(
    id="Q001",
    text="What is the core functionality?",
    category="functional",
    priority=QuestionPriority.HIGH
)

question2 = Question(
    id="Q002",
    text="What colors should be used?",
    category="ui",
    priority=QuestionPriority.LOW
)

# High priority question should have higher score
score1 = calculate_priority(question1, {})
score2 = calculate_priority(question2, {})
assert score1 > score2

# Test context-aware priority
context = {"focus": "security"}
security_question = Question(
    id="Q003",
    text="What security measures are needed?",
    category="security",
    priority=QuestionPriority.HIGH
)

security_score = calculate_priority(security_question, context)
assert security_score > score1

print("Priority calculation test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Priority calculation works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 6: Question dependencies
test_question_dependencies() {
    print_header "Test 6: Question Dependencies"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_dependencies.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from questioning import Question, sort_questions_by_dependency

# Create questions with dependencies
q1 = Question(id="Q001", text="What is the goal?", category="functional", priority="high")
q2 = Question(id="Q002", text="How will users access it?", category="functional", priority="medium", depends_on=["Q001"])
q3 = Question(id="Q003", text="What data needs storing?", category="technical", priority="high", depends_on=["Q001"])
q4 = Question(id="Q004", text="What database?", category="technical", priority="medium", depends_on=["Q002", "Q003"])

questions = [q4, q2, q1, q3]
sorted_questions = sort_questions_by_dependency(questions)

# Q1 should be first (no dependencies)
assert sorted_questions[0].id == "Q001"

# Q2 and Q3 should come after Q1
q2_index = next(i for i, q in enumerate(sorted_questions) if q.id == "Q002")
q3_index = next(i for i, q in enumerate(sorted_questions) if q.id == "Q003")
assert q2_index > 0
assert q3_index > 0

# Q4 should come after Q2 and Q3
q4_index = next(i for i, q in enumerate(sorted_questions) if q.id == "Q004")
assert q4_index > q2_index
assert q4_index > q3_index

print("Question dependencies test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Question dependencies work correctly"
    rm -f "$test_script"

    echo ""
}

# Test 7: Session persistence
test_session_persistence() {
    print_header "Test 7: Session Persistence"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_session.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
import json
import tempfile
import os
sys.path.insert(0, '../lib/spec-creation')

from questioning import QuestioningSession

# Create a session
session = QuestioningSession(requirement="Build a login system")

# Add questions
session.add_question("What authentication method?", answered=False, answer="OAuth2")
session.add_question("What data to store?", answered=True, answer="User credentials")

# Save session
with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
    session_path = f.name
    session.save(session_path)

# Load session
loaded_session = QuestioningSession.load(session_path)
assert loaded_session.requirement == "Build a login system"
assert len(loaded_session.questions) == 2

# Check answer persistence
q1 = next(q for q in loaded_session.questions if "authentication" in q.text)
assert q1.answer == "OAuth2"

# Cleanup
os.unlink(session_path)

print("Session persistence test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Session persistence works correctly"
    rm -f "$test_script"

    echo ""
}

# Test 8: Interactive CLI simulation
test_interactive_cli() {
    print_header "Test 8: Interactive CLI Simulation"

    local test_script="${BOX_ROOT}/4-scripts/testing/phase3/.test_cli.py"

    cat > "$test_script" << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.insert(0, '../lib/spec-creation')

from questioning import QuestioningSession, simulate_questioning

# Create session
session = QuestioningSession(requirement="Build a REST API")

# Simulate questioning workflow
responses = [
    "JSON",
    "PostgreSQL",
    "User authentication"
]

for i, response in enumerate(responses):
    session.add_question(
        f"Question {i+1}?",
        answered=True,
        answer=response
    )

# Verify session state
assert len(session.questions) == 3
assert all(q.answered for q in session.questions)
assert session.questions[0].answer == "JSON"

# Test completion check
assert session.is_complete() or len(session.get_unanswered_questions()) == 0

print("Interactive CLI simulation test passed!")
EOF

    chmod +x "$test_script"
    assert_command_succeeds "python3 $test_script" "Interactive CLI simulation works correctly"
    rm -f "$test_script"

    echo ""
}

# Main execution
main() {
    info "Starting Phase 3: Questioning Workflow Tests"
    echo ""

    test_questioning_module
    test_question_creation
    test_gap_analysis
    test_question_strategies
    test_priority_calculation
    test_question_dependencies
    test_session_persistence
    test_interactive_cli

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
