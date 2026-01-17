#!/bin/bash
###############################################################################
# START VIBE KANBAN ON MAC MINI
# This script starts Vibe Kanban and all related services
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🚀 STARTING VIBE KANBAN ON MAC MINI                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Navigate to project
cd ~/SISO-INTERNAL

# Check if docker-compose file exists
if [ ! -f "docker-compose.vibe-kanban.yml" ]; then
    echo -e "${YELLOW}⚠️  docker-compose.vibe-kanban.yml not found${NC}"
    echo "Please ensure the file exists in: ~/SISO-INTERNAL"
    exit 1
fi

echo -e "${GREEN}Starting Vibe Kanban services...${NC}"
docker-compose -f docker-compose.vibe-kanban.yml up -d

echo ""
echo -e "${BLUE}⏳ Waiting for services to start (15 seconds)...${NC}"
sleep 15

# Check if services are running
echo ""
echo -e "${GREEN}Checking service status...${NC}"
docker-compose -f docker-compose.vibe-kanban.yml ps

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Vibe Kanban is running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 Access Vibe Kanban at:"
echo "   • Local:    http://localhost:3000"
echo "   • Network: http://$(hostname -f | sed 's/\.local//'):3000"
echo ""
echo "🔧 Management Commands:"
echo "   • View logs:    docker-compose -f docker-compose.vibe-kanban.yml logs -f"
echo "   • Stop:         docker-compose -f docker-compose.vibe-kanban.yml down"
echo "   • Restart:      docker-compose -f docker-compose.vibe-kanban.yml restart"
echo "   • Status:       docker-compose -f docker-compose.vibe-kanban.yml ps"
echo ""
echo "📱 To Access from Vietnam/Thailand:"
echo "   Option 1 (SSH Tunnel):"
echo "     ssh -L 3000:localhost:3000 username@mac-mini-ip"
echo "     Then open: http://localhost:3000"
echo ""
echo "   Option 2 (Cloudflare Tunnel):"
echo "     cloudflared tunnel --url http://localhost:3000"
echo ""
echo "   Option 3 (Tailscale - Recommended):"
echo "     Install Tailscale on both machines"
echo "     Access via: http://mac-mini-tailscale-ip:3000"
echo ""
echo "📖 For setup guide:"
echo "   cat .blackbox/.plans/active/vibe-kanban-docker-setup.md"
echo ""
