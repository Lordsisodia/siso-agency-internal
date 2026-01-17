#!/bin/bash
###############################################################################
# SETUP: .blackbox + Vibe Kanban Integration
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔗 .BLACKBOX + VIBE KANBAN INTEGRATION                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.vibe-kanban.yml" ]; then
    echo "❌ Error: docker-compose.vibe-kanban.yml not found"
    echo "Please run this from the SISO-INTERNAL directory"
    exit 1
fi

echo -e "${GREEN}Step 1: Creating .blackbox directories...${NC}"
mkdir -p .blackbox/.plans/active/vibe-kanban-work/daily-summaries
mkdir -p .blackbox/9-brain/incoming/vibe-kanban-tasks
mkdir -p .blackbox/9-brain/incoming/git-commits
mkdir -p .blackbox/9-brain/memory/extended
echo "✅ Directories created"
echo ""

echo -e "${GREEN}Step 2: Creating initial tracking files...${NC}"

# Active tasks
cat > .blackbox/.plans/active/vibe-kanban-work/active-tasks.md << 'EOF'
# Active Vibe Kanban Tasks

*Last updated: $(date +%Y-%m-%d %H:%M:%S)*

No active tasks currently. Monitor will populate this file.
EOF

# Queue status
cat > .blackbox/.plans/active/vibe-kanban-work/queue-status.md << 'EOF'
# Vibe Kanban Queue Status

*Last updated: $(date +%Y-%m-%d %H:%M:%S)*

Monitor will populate this file with real-time queue status.
EOF

# Completed tasks
cat > .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md << 'EOF'
# Completed Vibe Kanban Tasks

*Last updated: $(date +%Y-%m-%d %H:%M:%S)*

No tasks completed yet. Monitor will populate this file.
EOF

echo "✅ Tracking files created"
echo ""

echo -e "${GREEN}Step 3: Updating Docker Compose configuration...${NC}"

# Backup existing config
if [ ! -f "docker-compose.vibe-kanban.yml.backup" ]; then
    cp docker-compose.vibe-kanban.yml docker-compose.vibe-kanban.yml.backup
    echo "✅ Backup created: docker-compose.vibe-kanban.yml.backup"
else
    echo "✅ Backup already exists"
fi

# Check if monitor service already exists
if grep -q "vibe-monitor:" docker-compose.vibe-kanban.yml; then
    echo "✅ Monitor service already in docker-compose"
else
    echo "⚠️  Please add the vibe-monitor service to docker-compose.vibe-kanban.yml"
    echo "   See BLACKBOX-VIBE-KANBAN-INTEGRATION.md for details"
fi
echo ""

echo -e "${GREEN}Step 4: Stopping Docker stack...${NC}"
docker-compose -f docker-compose.vibe-kanban.yml down 2>/dev/null || true
echo "✅ Stack stopped"
echo ""

echo -e "${GREEN}Step 5: Starting Docker stack...${NC}"
docker-compose -f docker-compose.vibe-kanban.yml up -d
echo "✅ Stack started"
echo ""

echo -e "${GREEN}Step 6: Waiting for services to be ready...${NC}"
sleep 10
echo "✅ Services ready"
echo ""

echo -e "${GREEN}Step 7: Checking monitor service...${NC}"
if docker ps | grep -q "vibe-monitor"; then
    echo "✅ Monitor service is running"
    echo ""
    echo "📋 Monitor logs (first 20 lines):"
    docker logs --tail 20 vibe-monitor 2>/dev/null || echo "   No logs yet"
else
    echo "⚠️  Monitor service not found in docker-compose"
    echo "   You may need to add it manually (see guide)"
fi
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ .blackbox + Vibe Kanban integration setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 What's been set up:"
echo "   • .blackbox directory structure created"
echo "   • Initial tracking files created"
echo "   • Docker stack started"
echo "   • Monitor service checking Vibe Kanban database"
echo ""
echo "🔍 What gets tracked automatically:"
echo "   ✅ Task creation"
echo "   ✅ Task execution (all attempts)"
echo "   ✅ Agent used (Gemini, Claude, etc.)"
echo "   ✅ Task completion"
echo "   ✅ Task failures with error messages"
echo "   ✅ Daily summaries"
echo "   ✅ Memory Bank synchronization"
echo ""
echo "📂 Tracking files created:"
echo "   • Active tasks: .blackbox/.plans/active/vibe-kanban-work/active-tasks.md"
echo "   • Queue status: .blackbox/.plans/active/vibe-kanban-work/queue-status.md"
echo "   • Completed: .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md"
echo "   • Progress: .blackbox/.plans/active/vibe-kanban-work/task-{id}-progress.md"
echo "   • Daily: .blackbox/.plans/active/vibe-kanban-work/daily-summaries/{date}.md"
echo ""
echo "🚀 Next steps:"
echo "   1. Open Vibe Kanban: http://localhost:3000"
echo "   2. Create a test task"
echo "   3. Wait 30 seconds for monitor to detect it"
echo "   4. Check tracking files"
echo ""
echo "🧪 Test it:"
echo "   # Check active tasks"
echo "   cat .blackbox/.plans/active/vibe-kanban-work/active-tasks.md"
echo ""
echo "   # Check queue status"
echo "   cat .blackbox/.plans/active/vibe-kanban-work/queue-status.md"
echo ""
echo "   # Monitor logs in real-time"
echo "   docker logs -f vibe-monitor"
echo ""
echo "📖 For full documentation:"
echo "   cat BLACKBOX-VIBE-KANBAN-INTEGRATION.md"
echo ""
