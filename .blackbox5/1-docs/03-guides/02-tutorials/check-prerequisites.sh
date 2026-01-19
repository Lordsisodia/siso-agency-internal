#!/bin/bash
# Check Prerequisites Script
# Verifies all required components are installed and configured

echo "=========================================="
echo "Checking Prerequisites"
echo "=========================================="
echo ""

PASS=0
FAIL=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

check_pass() {
    echo -e "${GREEN}✅${NC} $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}❌${NC} $1"
    ((FAIL++))
}

# Check Python version
echo "1. Checking Python version..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

    if [ "$PYTHON_MAJOR" -ge 3 ] && [ "$PYTHON_MINOR" -ge 10 ]; then
        check_pass "Python $PYTHON_VERSION (required: 3.10+)"
    else
        check_fail "Python $PYTHON_VERSION (required: 3.10+)"
    fi
else
    check_fail "Python 3 not found"
fi
echo ""

# Check Node.js version
echo "2. Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d. -f1)

    if [ "$NODE_MAJOR" -ge 18 ]; then
        check_pass "Node.js $NODE_VERSION (required: 18+)"
    else
        check_fail "Node.js $NODE_VERSION (required: 18+)"
    fi
else
    check_fail "Node.js not found"
fi
echo ""

# Check Git configuration
echo "3. Checking Git configuration..."
if command -v git &> /dev/null; then
    GIT_NAME=$(git config user.name)
    GIT_EMAIL=$(git config user.email)

    if [ -n "$GIT_NAME" ] && [ -n "$GIT_EMAIL" ]; then
        check_pass "Git configured ($GIT_NAME <$GIT_EMAIL>)"
    else
        check_fail "Git not configured (run: git config --global user.name 'Your Name')"
    fi
else
    check_fail "Git not found"
fi
echo ""

# Check Python dependencies
echo "4. Checking Python dependencies..."
MISSING_DEPS=0

if python3 -c "import httpx" 2>/dev/null; then
    check_pass "httpx installed"
else
    check_fail "httpx not installed"
    ((MISSING_DEPS++))
fi

if python3 -c "import pydantic" 2>/dev/null; then
    check_pass "pydantic installed"
else
    check_fail "pydantic not installed"
    ((MISSING_DEPS++))
fi

if [ $MISSING_DEPS -eq 0 ]; then
    check_pass "All Python dependencies installed"
fi
echo ""

# Check Vibe Kanban server
echo "5. Checking Vibe Kanban server..."
if command -v curl &> /dev/null; then
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        check_pass "Vibe Kanban running (http://localhost:3001)"
    else
        check_fail "Vibe Kanban not accessible (start with: docker run -d -p 3001:3001 vibekanban/server)"
    fi
else
    check_fail "curl not found (cannot check Vibe Kanban)"
fi
echo ""

# Check project structure
echo "6. Checking project structure..."
if [ -d ".blackbox5" ]; then
    check_pass ".blackbox5 directory exists"
else
    check_fail ".blackbox5 directory not found"
fi
echo ""

# Check AgentMemory
echo "7. Checking AgentMemory module..."
if python3 -c "from blackbox5.engine.knowledge.memory.AgentMemory import AgentMemory" 2>/dev/null; then
    check_pass "AgentMemory module accessible"
else
    check_fail "AgentMemory module not found (add to PYTHONPATH)"
fi
echo ""

# Check Vibe Kanban Manager
echo "8. Checking Vibe Kanban Manager..."
if python3 -c "from blackbox5.engine.integrations.vibe import VibeKanbanManager" 2>/dev/null; then
    check_pass "VibeKanbanManager accessible"
else
    check_fail "VibeKanbanManager not found"
fi
echo ""

# Check Ralphy integration
echo "9. Checking Ralphy integration..."
if [ -f ".blackbox5/2-engine/07-operations/runtime/ralphy-bb5-integrated.sh" ]; then
    check_pass "Ralphy integrated wrapper exists"
else
    check_fail "Ralphy integrated wrapper not found"
fi

if [ -f ".blackbox5/2-engine/07-operations/runtime/ralphy/blackbox_integration.py" ]; then
    check_pass "Ralphy Blackbox integration module exists"
else
    check_fail "Ralphy Blackbox integration module not found"
fi
echo ""

# Check Project Memory structure
echo "10. Checking Project Memory structure..."
if [ -d ".blackbox5/5-project-memory/siso-internal/operations/agents" ]; then
    check_pass "Project Memory agents directory exists"
else
    check_fail "Project Memory agents directory not found (run: mkdir -p .blackbox5/5-project-memory/siso-internal/operations/agents)"
fi

if [ -d ".blackbox5/5-project-memory/siso-internal/operations/ralphy" ]; then
    check_pass "Project Memory ralphy directory exists"
else
    check_fail "Project Memory ralphy directory not found (run: mkdir -p .blackbox5/5-project-memory/siso-internal/operations/ralphy)"
fi
echo ""

# Summary
echo "=========================================="
echo "Summary"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $PASS"
echo -e "${RED}Failed:${NC} $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready to run.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Please fix the issues above.${NC}"
    exit 1
fi
