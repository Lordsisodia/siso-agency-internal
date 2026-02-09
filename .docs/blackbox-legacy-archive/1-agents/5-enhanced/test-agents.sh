#!/bin/bash
#
# Test script for OhMyOpenCode agents integration
# Verifies that all agent files are present and valid
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BB3_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results
PASS=0
FAIL=0

# Test functions
test_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASS++)) || true
}

test_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAIL++)) || true
}

test_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo "=== OhMyOpenCode Agent Integration Tests ==="
echo

# Test 1: Directory structure
test_info "Test 1: Checking directory structure..."

REQUIRED_DIRS=(
    "agents/ohmy-opencode"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [[ -d "${BB3_ROOT}/${dir}" ]]; then
        test_pass "Directory exists: ${dir}"
    else
        test_fail "Directory missing: ${dir}"
    fi
done

echo

# Test 2: Agent definition files
test_info "Test 2: Checking agent definition files..."

REQUIRED_FILES=(
    "agents/ohmy-opencode/oracle-agent.md"
    "agents/ohmy-opencode/librarian-agent.md"
    "agents/ohmy-opencode/explore-agent.md"
    "agents/ohmy-opencode/README.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "${BB3_ROOT}/${file}" ]]; then
        test_pass "File exists: ${file}"
    else
        test_fail "File missing: ${file}"
    fi
done

echo

# Test 3: Executable scripts
test_info "Test 3: Checking executable scripts..."

SCRIPTS=(
    "agents/ohmy-opencode/run-agent.sh"
    "agents/ohmy-opencode/status.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [[ -f "${BB3_ROOT}/${script}" ]]; then
        if [[ -x "${BB3_ROOT}/${script}" ]]; then
            test_pass "Script executable: ${script}"
        else
            test_fail "Script not executable: ${script}"
        fi
    else
        test_fail "Script missing: ${script}"
    fi
done

echo

# Test 4: Agent file content validation
test_info "Test 4: Validating agent file content..."

# Check Oracle agent
ORACLE_FILE="${BB3_ROOT}/agents/ohmy-opencode/oracle-agent.md"
if grep -q "Agent ID:" "$ORACLE_FILE" && \
   grep -q "## Overview" "$ORACLE_FILE" && \
   grep -q "## Capabilities" "$ORACLE_FILE" && \
   grep -q "## Integration with .blackbox4" "$ORACLE_FILE"; then
    test_pass "Oracle agent file structure valid"
else
    test_fail "Oracle agent file structure invalid"
fi

# Check Librarian agent
LIBRARIAN_FILE="${BB3_ROOT}/agents/ohmy-opencode/librarian-agent.md"
if grep -q "Agent ID:" "$LIBRARIAN_FILE" && \
   grep -q "## Overview" "$LIBRARIAN_FILE" && \
   grep -q "## Capabilities" "$LIBRARIAN_FILE" && \
   grep -q "## Integration with .blackbox4" "$LIBRARIAN_FILE"; then
    test_pass "Librarian agent file structure valid"
else
    test_fail "Librarian agent file structure invalid"
fi

# Check Explore agent
EXPLORE_FILE="${BB3_ROOT}/agents/ohmy-opencode/explore-agent.md"
if grep -q "Agent ID:" "$EXPLORE_FILE" && \
   grep -q "## Overview" "$EXPLORE_FILE" && \
   grep -q "## Capabilities" "$EXPLORE_FILE" && \
   grep -q "## Integration with .blackbox4" "$EXPLORE_FILE"; then
    test_pass "Explore agent file structure valid"
else
    test_fail "Explore agent file structure invalid"
fi

echo

# Test 5: Script syntax validation
test_info "Test 5: Validating script syntax..."

if bash -n "${SCRIPT_DIR}/run-agent.sh" 2>/dev/null; then
    test_pass "run-agent.sh syntax valid"
else
    test_fail "run-agent.sh syntax invalid"
fi

if bash -n "${SCRIPT_DIR}/status.sh" 2>/dev/null; then
    test_pass "status.sh syntax valid"
else
    test_fail "status.sh syntax invalid"
fi

echo

# Test 6: Source implementation reference
test_info "Test 6: Checking source implementation references..."

SOURCE_DIR="/Users/shaansisodia/DEV/AI-HUB/Open Code/src/agents"

if [[ -d "$SOURCE_DIR" ]]; then
    test_pass "OhMyOpenCode source directory exists"

    # Check for source files
    if [[ -f "${SOURCE_DIR}/oracle.ts" ]]; then
        test_pass "Oracle source implementation exists"
    else
        test_fail "Oracle source implementation missing"
    fi

    if [[ -f "${SOURCE_DIR}/librarian.ts" ]]; then
        test_pass "Librarian source implementation exists"
    else
        test_fail "Librarian source implementation missing"
    fi

    if [[ -f "${SOURCE_DIR}/explore.ts" ]]; then
        test_pass "Explore source implementation exists"
    else
        test_fail "Explore source implementation missing"
    fi
else
    test_fail "OhMyOpenCode source directory not found"
fi

echo

# Test 7: Integration points
test_info "Test 7: Checking integration points..."

# Check for Ralph integration
if [[ -d "${BB3_ROOT}/agents/ralph-agent" ]]; then
    test_pass "Ralph agent directory exists (for integration)"
else
    test_fail "Ralph agent directory missing"
fi

# Check for BMAD integration
if [[ -d "${BB3_ROOT}/agents/bmad" ]]; then
    test_pass "BMAD agents directory exists (for integration)"
else
    test_fail "BMAD agents directory missing"
fi

echo

# Test 8: Background task directory
test_info "Test 8: Checking background task setup..."

BG_DIR="${BB3_ROOT}/.background"
if [[ -d "$BG_DIR" ]] || mkdir -p "$BG_DIR" 2>/dev/null; then
    test_pass "Background task directory available"
else
    test_fail "Cannot create background task directory"
fi

echo

# Summary
echo "=== Test Summary ==="
echo -e "${GREEN}Passed: ${PASS}${NC}"
echo -e "${RED}Failed: ${FAIL}${NC}"
echo

if [[ $FAIL -eq 0 ]]; then
    echo -e "${GREEN}All tests passed!${NC}"
    echo
    echo "The OhMyOpenCode agents are ready to use in .blackbox4."
    echo
    echo "Example usage:"
    echo "  cd ${BB3_ROOT}"
    echo "  ./agents/ohmy-opencode/run-agent.sh oracle \"Review architecture\""
    echo "  ./agents/ohmy-opencode/run-agent.sh librarian \"Research docs\""
    echo "  ./agents/ohmy-opencode/run-agent.sh explore \"Find code\""
    exit 0
else
    echo -e "${RED}Some tests failed. Please review the output above.${NC}"
    exit 1
fi
