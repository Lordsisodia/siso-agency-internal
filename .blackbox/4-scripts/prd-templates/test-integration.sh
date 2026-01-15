#!/bin/bash
#
# Integration Test for PRD Template System
# Tests complete workflow from spec validation to PRD generation
#

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLE_SPEC="$SCRIPT_DIR/examples/web-app-spec.json"
TEST_OUTPUT="$SCRIPT_DIR/examples/test-prd.md"

echo -e "${BLUE}=== PRD Template System Integration Test ===${NC}\n"

# Test 1: List Templates
echo -e "${YELLOW}Test 1: List available templates${NC}"
python3 "$SCRIPT_DIR/generate_prd.py" template-list
echo ""

# Test 2: Validate Spec
echo -e "${YELLOW}Test 2: Validate example spec${NC}"
python3 "$SCRIPT_DIR/generate_prd.py" validate --spec "$EXAMPLE_SPEC"
echo ""

# Test 3: Generate PRD (web-app template)
echo -e "${YELLOW}Test 3: Generate PRD with web-app template${NC}"
python3 "$SCRIPT_DIR/generate_prd.py" generate \
    --spec "$EXAMPLE_SPEC" \
    --template web-app \
    --output "$TEST_OUTPUT" \
    --var "STATUS=Testing" \
    --var "TEST_MODE=true"
echo ""

# Test 4: Verify Output
echo -e "${YELLOW}Test 4: Verify generated PRD${NC}"
if [ -f "$TEST_OUTPUT" ]; then
    echo -e "${GREEN}✓ PRD file created${NC}"
    LINES=$(wc -l < "$TEST_OUTPUT")
    echo "  Lines: $LINES"

    # Check for key sections
    if grep -q "# Product Requirements Document" "$TEST_OUTPUT"; then
        echo -e "${GREEN}✓ Header found${NC}"
    fi
    if grep -q "## Executive Summary" "$TEST_OUTPUT"; then
        echo -e "${GREEN}✓ Executive Summary section found${NC}"
    fi
    if grep -q "## User Stories" "$TEST_OUTPUT"; then
        echo -e "${GREEN}✓ User Stories section found${NC}"
    fi
    if grep -q "## Functional Requirements" "$TEST_OUTPUT"; then
        echo -e "${GREEN}✓ Functional Requirements section found${NC}"
    fi
    if grep -q "## Technical Architecture" "$TEST_OUTPUT"; then
        echo -e "${GREEN}✓ Technical Architecture section found${NC}"
    fi
else
    echo "Error: PRD file not created"
    exit 1
fi
echo ""

# Test 5: Test Wrapper Script
echo -e "${YELLOW}Test 5: Test wrapper script${NC}"
cd "$SCRIPT_DIR/../.."
./generate-prd.sh list
echo ""

# Summary
echo -e "${BLUE}=== Integration Test Complete ===${NC}"
echo -e "${GREEN}All tests passed!${NC}\n"
echo "Generated files:"
echo "  - $TEST_OUTPUT"
echo ""
echo "You can review the generated PRD at:"
echo "  $TEST_OUTPUT"
