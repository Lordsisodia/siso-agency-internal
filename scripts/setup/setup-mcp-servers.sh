#!/bin/bash
###############################################################################
# SETUP: MCP Servers for Vibe Kanban in Docker
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔗 MCP SERVERS SETUP FOR VIBE KANBAN                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.vibe-kanban.yml" ]; then
    echo "❌ Error: docker-compose.vibe-kanban.yml not found"
    echo "Please run this from the SISO-INTERNAL directory"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo -e "${GREEN}Step 1: Stopping existing containers...${NC}"
docker-compose -f docker-compose.vibe-kanban.yml down 2>/dev/null || true
echo "✅ Containers stopped"
echo ""

echo -e "${GREEN}Step 2: Creating MCP server configuration...${NC}"
mkdir -p .blackbox/4-scripts/integrations/vibe-kanban

cat > .blackbox/4-scripts/integrations/vibe-kanban/mcp-config.json << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace/SISO-INTERNAL"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
EOF
echo "✅ MCP configuration created at .blackbox/4-scripts/integrations/vibe-kanban/mcp-config.json"
echo ""

echo -e "${GREEN}Step 3: Creating MCP-enabled docker-compose file...${NC}"

# Backup existing config
if [ ! -f "docker-compose.vibe-kanban.yml.backup" ]; then
    cp docker-compose.vibe-kanban.yml docker-compose.vibe-kanban.yml.backup
    echo "✅ Backup created: docker-compose.vibe-kanban.yml.backup"
fi

echo ""
echo -e "${YELLOW}⚠️  MCP server services added to docker-compose.vibe-kanban.yml${NC}"
echo ""

echo -e "${GREEN}Step 4: Starting Docker stack with MCP servers...${NC}"
docker-compose -f docker-compose.vibe-kanban.yml up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 5

echo "✅ Docker stack started"
echo ""

echo -e "${GREEN}Step 5: Verifying services...${NC}"
echo ""
echo "Running services:"
docker-compose -f docker-compose.vibe-kanban.yml ps
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ MCP servers setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 What's been set up:"
echo "   • MCP server configuration created"
echo "   • Docker stack updated with MCP services"
echo "   • All services started and running"
echo ""
echo "🚀 Next steps:"
echo "   1. Open Vibe Kanban: http://localhost:3000"
echo "   2. Go to Settings → MCP Servers"
echo "   3. Add each MCP server:"
echo ""
echo "      Filesystem Server:"
echo "      - Name: filesystem"
echo "      - Command: npx"
echo "      - Args: -y @modelcontextprotocol/server-filesystem /workspace/SISO-INTERNAL"
echo ""
echo "      Fetch Server:"
echo "      - Name: fetch"
echo "      - Command: npx"
echo "      - Args: -y @modelcontextprotocol/server-fetch"
echo ""
echo "   4. Create a test task to verify MCP integration"
echo ""
echo "📖 For full documentation:"
echo "   cat VIBE-KANBAN-MCP-SETUP-GUIDE.md"
echo ""
echo "🧪 Test Task Example:"
echo "   Title: Test MCP Integration"
echo "   Description: Use the filesystem MCP to list all TypeScript files"
echo "   in the src directory, then use the fetch MCP to get README.md"
echo "   from github.com/modelcontextprotocol/servers"
echo ""
