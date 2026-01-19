#!/bin/bash

# =============================================================================
# VIBE WEBHOOK SERVER - Start Script
# For .blackbox integration with hosted Vibe Kanban
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     VIBE WEBHOOK SERVER - LOCAL SETUP                  ║${NC}"
echo -e "${BLUE}║     For .blackbox Integration                           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running. Please start Docker Desktop.${NC}"
    echo -e "  Run: open -a Docker"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Stop existing
echo -e "\n${YELLOW}► Stopping existing webhook server...${NC}"
cd "$PROJECT_ROOT"
docker-compose -f docker-compose.vibe-webhook-only.yml down 2>/dev/null || true

# Start webhook server
echo -e "${YELLOW}► Starting webhook server...${NC}"
docker-compose -f docker-compose.vibe-webhook-only.yml up -d

# Wait
echo -e "${YELLOW}► Waiting for server to start...${NC}"
sleep 3

# Check status
if docker ps | grep -q "vibe-webhook-server-local"; then
    echo -e "${GREEN}✓ Webhook server is running${NC}"
else
    echo -e "${RED}✗ Failed to start${NC}"
    docker-compose -f docker-compose.vibe-webhook-only.yml logs
    exit 1
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Webhook server ready!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📍 Webhook Server: ${GREEN}http://localhost:5001${NC}"
echo -e "📍 Vibe Kanban:    ${GREEN}https://matching-mpg-accomplish-basics.trycloudflare.com${NC}"
echo ""
echo -e "${YELLOW}Resource Usage:${NC}"
echo -e "  • Webhook Server: ~64-128MB RAM"
echo ""
echo -e "${YELLOW}Commands:${NC}"
echo -e "  • View logs:  ${GREEN}docker-compose -f docker-compose.vibe-webhook-only.yml logs -f${NC}"
echo -e "  • Stop:       ${GREEN}docker-compose -f docker-compose.vibe-webhook-only.yml down${NC}"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
