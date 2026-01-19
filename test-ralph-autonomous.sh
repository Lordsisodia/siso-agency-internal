#!/bin/bash
# Test Ralph's Autonomous Operation
# Demonstrates Ralph fetching and analyzing GitHub issues autonomously

set -e

WORKSPACE="$(pwd)"
cd "$WORKSPACE"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Ralph Runtime - Autonomous Test Demonstration          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
STATE_FILE="$WORKSPACE/.blackbox5/engine/operations/runtime/ralph/github_state.json"
OUTPUT_DIR="$WORKSPACE/.blackbox5/engine/runtime/ralph/framework-github"
PRD_FILE="$WORKSPACE/prd-framework-github-continuous.json"
RALPH_PYTHON="$WORKSPACE/.blackbox5/engine/operations/runtime/ralph/ralph_runtime.py"

echo -e "${CYAN}📋 Test Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Workspace:    $WORKSPACE"
echo "PRD File:     $PRD_FILE"
echo "Ralph Engine: $RALPH_PYTHON"
echo "State File:   $STATE_FILE"
echo ""

# Verify files exist
echo -e "${BLUE}🔍 Verifying files...${NC}"
if [ ! -f "$PRD_FILE" ]; then
    echo -e "${RED}✗ PRD file not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ PRD file exists${NC}"

if [ ! -f "$RALPH_PYTHON" ]; then
    echo -e "${RED}✗ Ralph runtime not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Ralph runtime exists${NC}"

# Check GitHub CLI
echo ""
echo -e "${BLUE}🔍 Checking GitHub CLI...${NC}"
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✓ GitHub CLI installed${NC}"
    gh --version | head -1
else
    echo -e "${RED}✗ GitHub CLI not found${NC}"
    echo "Install with: brew install gh"
    exit 1
fi

# Check GitHub auth
echo ""
echo -e "${BLUE}🔍 Checking GitHub authentication...${NC}"
if gh auth status &> /dev/null; then
    echo -e "${GREEN}✓ GitHub authenticated${NC}"
else
    echo -e "${RED}✗ GitHub not authenticated${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 Starting Ralph Autonomous Test${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Backup existing state file
if [ -f "$STATE_FILE" ]; then
    echo -e "${YELLOW}→ Backing up existing state file${NC}"
    cp "$STATE_FILE" "${STATE_FILE}.backup.$(date +%s)"
fi

# Create test output directory
mkdir -p "$OUTPUT_DIR"

# Run Ralph for 3 iterations
echo -e "${BLUE}→ Running Ralph for 3 autonomous iterations...${NC}"
echo ""

for i in 1 2 3; do
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}Iteration $i/3${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Run Ralph
    python3 "$RALPH_PYTHON" \
        --workspace "$WORKSPACE" \
        --prd "$PRD_FILE" \
        --max-iterations 1

    echo ""
    echo -e "${BLUE}→ Checking state...${NC}"

    if [ -f "$STATE_FILE" ]; then
        TOTAL_SEEN=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('total_seen', 0))" 2>/dev/null || echo "0")
        echo -e "${GREEN}  ✓ Total issues seen: $TOTAL_SEEN${NC}"

        # Show last few lines of state
        echo "  State file contents:"
        cat "$STATE_FILE" | python3 -m json.tool | head -10
    else
        echo -e "${YELLOW}  ⚠️  State file not created yet${NC}"
    fi

    echo ""
    echo -e "${BLUE}→ Checking output files...${NC}"

    if [ -d "$OUTPUT_DIR" ]; then
        for file in "$OUTPUT_DIR"/*.md; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                filesize=$(du -h "$file" | cut -f1)
                echo -e "${GREEN}  ✓ $filename ($filesize)${NC}"
            fi
        done
    fi

    if [ $i -lt 3 ]; then
        echo ""
        echo -e "${YELLOW}→ Waiting 3 seconds before next iteration...${NC}"
        sleep 3
    fi
done

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Test Complete!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Show final results
echo -e "${BLUE}📊 Final Results${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "$STATE_FILE" ]; then
    echo "State File:"
    cat "$STATE_FILE" | python3 -m json.tool
else
    echo -e "${YELLOW}⚠️  State file not created${NC}"
fi

echo ""
echo "Output Files:"
if [ -d "$OUTPUT_DIR" ]; then
    ls -lh "$OUTPUT_DIR"/*.md 2>/dev/null || echo "No output files yet"
else
    echo -e "${YELLOW}⚠️  Output directory not found${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Key Observations:${NC}"
echo ""
echo "1. Ralph fetches real GitHub issues using GitHub CLI"
echo "2. State file prevents re-analyzing the same issues"
echo "3. Each iteration only processes NEW issues"
echo "4. Ralph can run continuously, catching new issues as they appear"
echo ""
echo -e "${BLUE}To run Ralph continuously:${NC}"
echo "  bash .blackbox5/engine/operations/runtime/ralph/start-framework-research.sh"
echo ""
echo -e "${BLUE}To monitor in real-time:${NC}"
echo "  bash .blackbox5/engine/operations/runtime/ralph/monitor-autonomous.sh"
echo ""
