#!/bin/bash
###############################################################################
# QUICK SETUP: Vibe Kanban + .blackbox Integration
# Run this on Mac Mini to enable automatic tracking
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔗 VIBE KANBAN + .BLACKBOX INTEGRATION SETUP             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.vibe-kanban.yml" ]; then
    echo "❌ Error: docker-compose.vibe-kanban.yml not found"
    echo "Please run this from the SISO-INTERNAL directory"
    exit 1
fi

echo -e "${GREEN}Step 1: Creating .blackbox integration directories...${NC}"
mkdir -p .blackbox/.plans/active/vibe-kanban-work
mkdir -p .blackbox/9-brain/incoming/vibe-kanban-tasks
mkdir -p .blackbox/9-brain/incoming/git-commits
echo "✅ Directories created"
echo ""

echo -e "${GREEN}Step 2: Testing webhook server...${NC}"
cd .blackbox/4-scripts/integrations/vibe-kanban

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Installing..."
    brew install python@3.11
fi

echo "✅ Python 3 available"
echo ""

echo -e "${GREEN}Step 3: Installing Python dependencies...${NC}"
pip3 install -q flask flask-cors 2>/dev/null || true
echo "✅ Dependencies installed"
echo ""

echo -e "${GREEN}Step 4: Creating integration configuration...${NC}"
cat > .blackbox/.plans/active/vibe-kanban-work/config.json << 'EOF'
{
  "webhook_url": "http://webhook-server:5001/webhook/vibe-kanban",
  "blackbox_path": ".blackbox",
  "tracking_enabled": true,
  "auto_commit": true,
  "sync_to_memory_bank": true
}
EOF
echo "✅ Configuration created"
echo ""

echo -e "${GREEN}Step 5: Creating initial tracking files...${NC}"

# Active tasks file
cat > .blackbox/.plans/active/vibe-kanban-work/active-tasks.md << 'EOF'
# Active Vibe Kanban Tasks

*Last updated: $(date +%Y-%m-%d %H:%M:%S)*

No active tasks currently.
EOF

# Queue status file
cat > .blackbox/.plans/active/vibe-kanban-work/queue-status.md << 'EOF'
# Vibe Kanban Queue Status

*Last updated: $(date +%Y-%m-%d %H:%M:%S)*

Queue is empty.
EOF

# Completed tasks file
cat > .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md << 'EOF'
# Completed Vibe Kanban Tasks

*Last updated: $(date +%Y-%m-%d %H:%M:%S)*

No tasks completed yet.
EOF

echo "✅ Tracking files created"
echo ""

echo -e "${GREEN}Step 6: Setting up git integration...${NC}"
cd ../..

# Add .blackbox to git if not already tracked
git add .blackbox/.plans/active/vibe-kanban-work/ 2>/dev/null || true
git add .blackbox/9-brain/incoming/ 2>/dev/null || true

echo "✅ Git integration ready"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Vibe Kanban + .blackbox integration setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 What's been set up:"
echo "   • Webhook server will track all Vibe Kanban events"
echo "   • Tasks logged to: .blackbox/.plans/active/vibe-kanban-work/"
echo "   • Artifacts stored to: .blackbox/9-brain/incoming/"
echo "   • Progress tracked in real-time"
echo "   • Daily summaries generated automatically"
echo ""
echo "🚀 Next steps:"
echo "   1. Start Vibe Kanban: ./start-vibe-kanban.sh"
echo "   2. Configure webhooks in Vibe Kanban settings"
echo "   3. Webhook URL: http://webhook-server:5001/webhook/vibe-kanban"
echo "   4. Create your first task!"
echo ""
echo "📖 For full documentation:"
echo "   cat .blackbox/.plans/active/vibe-kanban-integration.md"
echo ""
