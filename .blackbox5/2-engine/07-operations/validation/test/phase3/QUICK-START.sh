#!/usr/bin/env bash
# Quick Start Guide for Phase 3 Testing
# This script provides a quick reference for running Phase 3 tests

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Phase 3 Testing - Quick Start Guide                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Show options
echo -e "${YELLOW}Choose an option:${NC}"
echo ""
echo "  1) Run ALL Phase 3 tests (recommended)"
echo "  2) Run spec creation tests only"
echo "  3) Run questioning tests only"
echo "  4) Run validation tests only"
echo "  5) Run integration tests only"
echo "  6) Run end-to-end test"
echo "  7) Show test statistics"
echo "  8) View README"
echo "  9) Exit"
echo ""

read -p "Enter choice [1-9]: " choice

case $choice in
    1)
        echo -e "\n${GREEN}Running all Phase 3 tests...${NC}\n"
        ./validate-phase3.sh
        ;;
    2)
        echo -e "\n${GREEN}Running spec creation tests...${NC}\n"
        ./test-spec-creation.sh
        ;;
    3)
        echo -e "\n${GREEN}Running questioning tests...${NC}\n"
        ./test-questioning.sh
        ;;
    4)
        echo -e "\n${GREEN}Running validation tests...${NC}\n"
        ./test-validation.sh
        ;;
    5)
        echo -e "\n${GREEN}Running integration tests...${NC}\n"
        ./test-integration.sh
        ;;
    6)
        echo -e "\n${GREEN}Running end-to-end test...${NC}\n"
        ./end-to-end-test.py
        ;;
    7)
        echo -e "\n${GREEN}Test Statistics:${NC}\n"
        echo "Total Test Suites: 5"
        echo "Total Test Cases: 44"
        echo "End-to-End Steps: 7"
        echo ""
        echo "Breakdown:"
        echo "  - Spec Creation: 12 tests"
        echo "  - Questioning: 8 tests"
        echo "  - Validation: 8 tests"
        echo "  - Integration: 8 tests"
        echo "  - End-to-End: 7 steps"
        echo ""
        echo "Total Lines of Code: ~3,172"
        echo "Total Size: ~95KB"
        ;;
    8)
        if [[ -f "README.md" ]]; then
            echo -e "\n${GREEN}Opening README...${NC}\n"
            cat README.md
        else
            echo -e "\n${YELLOW}README.md not found${NC}\n"
        fi
        ;;
    9)
        echo -e "\n${GREEN}Goodbye!${NC}\n"
        exit 0
        ;;
    *)
        echo -e "\n${YELLOW}Invalid choice. Please run again.${NC}\n"
        exit 1
        ;;
esac

echo ""
