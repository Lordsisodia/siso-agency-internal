#!/usr/bin/env bash

# Blackbox4 Feature Integration Script
# Quick setup for all new features

set -e

BLACKBOX4_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LIB_DIR="$BLACKBOX4_HOME/4-scripts/lib"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "${BLUE}======================================${NC}"
echo "${BLUE}Blackbox4 Feature Integration${NC}"
echo "${BLUE}======================================${NC}"
echo ""

# Initialize all systems
echo "${BLUE}[1/8] Initializing Magic Word Detection...${NC}"
"$LIB_DIR/keyword-detector.sh" init

echo ""
echo "${BLUE}[2/8] Initializing Background Task Manager...${NC}"
"$LIB_DIR/background-manager.sh" >/dev/null 2>&1 || true

echo ""
echo "${BLUE}[3/8] Initializing Hooks Manager...${NC}"
"$LIB_DIR/hooks-manager.sh" init

echo ""
echo "${BLUE}[4/8] Initializing MCP Server Manager...${NC}"
"$LIB_DIR/mcp-manager.sh" init

echo ""
echo "${BLUE}[5/8] Initializing BMAD Phase Tracker...${NC}"
"$LIB_DIR/bmad-tracker.sh" init

echo ""
echo "${BLUE}[6/8] Initializing Auto-Compaction System...${NC}"
"$LIB_DIR/auto-compact.sh" init

echo ""
echo "${BLUE}[7/8] Initializing Notification System...${NC}"
"$LIB_DIR/notify.sh" init

echo ""
echo "${BLUE}[8/8] Initializing Vendor Validator...${NC}"
"$LIB_DIR/vendor-validator.sh" init

echo ""
echo "${GREEN}======================================${NC}"
echo "${GREEN}✓ All Features Initialized!${NC}"
echo "${GREEN}======================================${NC}"
echo ""

echo "${BLUE}Quick Start Commands:${NC}"
echo ""
echo "1. ${YELLOW}Magic Words${NC}:"
echo "   keyword-detector.sh detect \"Build system ultrawork\""
echo ""
echo "2. ${YELLOW}Background Tasks${NC}:"
echo "   background-manager.sh add \"Research auth\" --agent librarian"
echo "   background-manager.sh list"
echo ""
echo "3. ${YELLOW}Hooks${NC}:"
echo "   hooks-manager.sh list"
echo "   hooks-manager.sh enable"
echo ""
echo "4. ${YELLOW}MCP Servers${NC}:"
echo "   mcp-manager.sh list"
echo "   mcp-manager.sh enable supabase"
echo ""
echo "5. ${YELLOW}BMAD Tracker${NC}:"
echo "   bmad-tracker.sh status"
echo "   bmad-tracker.sh phase build"
echo ""
echo "6. ${YELLOW}Auto-Compaction${NC}:"
echo "   auto-compact.sh status"
echo "   auto-compact.sh working"
echo ""
echo "7. ${YELLOW}Notifications${NC}:"
echo "   notify.sh send \"Task Complete\" \"Finished working\""
echo "   notify.sh test"
echo ""
echo "8. ${YELLOW}Vendor Validator${NC}:"
echo "   vendor-validator.sh scan file.py"
echo "   vendor-validator.sh scan-dir ./src \"*.py\""
echo ""
echo "${GREEN}For detailed help, run any script with 'help'${NC}"
echo ""
echo "${BLUE}Documentation${NC}:"
echo "  → .docs/FEATURE-OPPORTUNITIES.md"
echo "  → .docs/4-implementation/README.md"
