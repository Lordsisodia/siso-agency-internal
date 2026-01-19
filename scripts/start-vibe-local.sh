#!/bin/bash

# =============================================================================
# VIBE KANBAN - LOCAL SETUP (NPX METHOD)
# Optimized for laptop with 6 Claude agents
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     VIBE KANBAN - LOCAL SETUP                          ║${NC}"
echo -e "${BLUE}║     Optimized for 6 Claude Agents                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Install Node.js from: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) found${NC}"

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo -e "${RED}✗ npx is not available${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npx available${NC}"

# Stop any existing Vibe Kanban processes
echo -e "\n${YELLOW}► Stopping any existing Vibe Kanban processes...${NC}"
pkill -f "vibe-kanban" || true
sleep 2

# Clean start if requested
if [ "$1" == "--clean" ]; then
    echo -e "${YELLOW}► Cleaning up old data...${NC}"
    rm -rf ~/.vibe-kanban-data 2>/dev/null || true
    echo -e "${GREEN}✓ Cleanup complete${NC}"
fi

# Start Vibe Kanban with npx
echo -e "\n${YELLOW}► Starting Vibe Kanban...${NC}"
echo -e "${YELLOW}  This will download on first run (may take a minute)${NC}"

# Create data directory
mkdir -p ~/.vibe-kanban-data

# Set environment variables for minimal resource usage
export VIBE_KANBAN_PORT=3000
export VIBE_KANBAN_HOST=0.0.0.0
export DATABASE_URL="sqlite:$HOME/.vibe-kanban-data/vibe-kanban.db"
export RUST_LOG=warn
export NODE_OPTIONS="--max-old-space-size=512"

# Start in background with logging
nohup npx vibe-kanban > ~/.vibe-kanban-data/vibe-kanban.log 2>&1 &
PID=$!

echo -e "${GREEN}✓ Vibe Kanban started (PID: $PID)${NC}"

# Wait for it to be ready
echo -e "\n${YELLOW}► Waiting for Vibe Kanban to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Vibe Kanban is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Timed out waiting for Vibe Kanban${NC}"
        echo "Check logs: cat ~/.vibe-kanban-data/vibe-kanban.log"
        exit 1
    fi
    sleep 2
    echo -n "."
done

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Vibe Kanban is running!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📍 Access Vibe Kanban: ${GREEN}http://localhost:3000${NC}"
echo -e "📝 Logs:            ${GREEN}~/.vibe-kanban-data/vibe-kanban.log${NC}"
echo -e "📁 Data:            ${GREEN}~/.vibe-kanban-data/${NC}"
echo ""
echo -e "${YELLOW}Resource Usage:${NC}"
echo -e "  • Node.js Process:  ~200-400MB RAM"
echo -e "  • SQLite Database:  ~10-20MB RAM"
echo -e "  • Total:           ~210-420MB RAM"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  • View logs:       ${GREEN}tail -f ~/.vibe-kanban-data/vibe-kanban.log${NC}"
echo -e "  • Stop:            ${GREEN}pkill -f vibe-kanban${NC}"
echo -e "  • Restart:         ${GREEN}./scripts/start-vibe-local.sh${NC}"
echo -e "  • Clean restart:   ${GREEN}./scripts/start-vibe-local.sh --clean${NC}"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"

# Save PID for easy stopping
echo $PID > ~/.vibe-kanban-data/vibe-kanban.pid
