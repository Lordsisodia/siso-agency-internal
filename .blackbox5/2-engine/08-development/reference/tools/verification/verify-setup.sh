#!/bin/bash

# BlackBox5 Setup Verification Script
# This script verifies that BlackBox5 is properly configured

echo "🔍 BlackBox5 Setup Verification"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

# Function to check a requirement
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $1${NC}"
        ((FAILED++))
    fi
}

# 1. Check Python version
echo "📋 Checking Python version..."
python3 --version | grep -E "Python 3\.(9|10|11|12)" > /dev/null 2>&1
check "Python 3.9+ installed"

# 2. Check Redis
echo ""
echo "📋 Checking Redis..."
redis-cli ping > /dev/null 2>&1
check "Redis is running"

# 3. Check GLM API key
echo ""
echo "📋 Checking GLM API key..."
if [ -n "$GLM_API_KEY" ]; then
    echo -e "${GREEN}✅ GLM_API_KEY is set${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  GLM_API_KEY not set (will use mock client)${NC}"
fi

# 4. Check BlackBox5 files
echo ""
echo "📋 Checking BlackBox5 files..."

FILES=(
    ".blackbox5/engine/core/GLMClient.py"
    ".blackbox5/engine/core/Client.py"
    ".blackbox5/engine/core/agent_manager.py"
    ".blackbox5/engine/core/orchestrator.py"
    ".blackbox5/engine/config.yml"
    ".blackbox5/bb5.py"
    ".blackbox5/custom_agents/frontend_developer/agent.md"
    ".blackbox5/custom_agents/backend_developer/agent.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $file${NC}"
        ((FAILED++))
    fi
done

# 5. Check Python dependencies
echo ""
echo "📋 Checking Python dependencies..."

python3 -c "import sys; sys.path.insert(0, '.blackbox5/engine'); import asyncio" > /dev/null 2>&1
check "asyncio available"

python3 -c "import sys; sys.path.insert(0, '.blackbox5/engine'); from typing import Union" > /dev/null 2>&1
check "typing module available"

python3 -c "import sys; sys.path.insert(0, '.blackbox5/engine'); from enum import Enum" > /dev/null 2>&1
check "enum module available"

# 6. Test import
echo ""
echo "📋 Testing BlackBox5 imports..."
python3 <<EOF
import sys
sys.path.insert(0, '.blackbox5/engine')

try:
    from core.GLMClient import GLMClient, create_glm_client
    print("✅ GLMClient imports")
except Exception as e:
    print(f"❌ GLMClient import failed: {e}")
    sys.exit(1)

try:
    from core.task_types import Task, TaskType, TaskPriority, TaskStatus
    print("✅ task_types imports")
except Exception as e:
    print(f"❌ task_types import failed: {e}")
    sys.exit(1)

try:
    from core.agent_manager import AgentManager
    print("✅ agent_manager imports")
except Exception as e:
    print(f"❌ agent_manager import failed: {e}")
    sys.exit(1)

try:
    from core.orchestrator import AgentOrchestrator
    print("✅ orchestrator imports")
except Exception as e:
    print(f"❌ orchestrator import failed: {e}")
    sys.exit(1)
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All imports successful${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Import test failed${NC}"
    ((FAILED++))
fi

# 7. Summary
echo ""
echo "=================================="
echo "📊 Summary"
echo "=================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! BlackBox5 is ready to use.${NC}"
    echo ""
    echo "💡 Next steps:"
    echo "   1. Try interactive mode:"
    echo "      python .blackbox5/bb5.py --interactive"
    echo ""
    echo "   2. Run a simple task:"
    echo '      python .blackbox5/bb5.py "Add console.log to RewardCatalog.tsx"'
    echo ""
    echo "   3. View examples:"
    echo "      python .blackbox5/examples/real-world-tasks.py"
    echo ""
    echo "   4. Read the quick start guide:"
    echo "      cat .blackbox5/QUICKSTART.md"
else
    echo -e "${RED}⚠️  Some checks failed. Please fix the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  • Redis not running: brew services start redis"
    echo "  • GLM_API_KEY not set: export GLM_API_KEY='your-key'"
    echo "  • Python version: Use Python 3.9+"
fi

exit $FAILED
