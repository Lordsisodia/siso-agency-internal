#!/usr/bin/env bash

# Quick Setup Script for MCP Crash Prevention
# Run this once to set up all the prevention mechanisms

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BLACKBOX_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BLACKBOX_HOME"

echo -e "${BLUE}Setting up MCP Crash Prevention...${NC}"
echo ""

# 1. Create log directory
echo -e "${BLUE}[1/5]${NC} Creating log directories..."
mkdir -p ~/.mcp-logs
mkdir -p ~/.mcp-singleton-locks
echo -e "${GREEN}  ✓ Created ~/.mcp-logs${NC}"
echo -e "${GREEN}  ✓ Created ~/.mcp-singleton-locks${NC}"

# 2. Copy LaunchDaemon plist
echo ""
echo -e "${BLUE}[2/5]${NC} Installing LaunchDaemon..."
cp 4-scripts/com.siso.mcp-monitor.plist ~/Library/LaunchAgents/
echo -e "${GREEN}  ✓ Copied plist to ~/Library/LaunchAgents/${NC}"

# 3. Load the service
echo ""
echo -e "${BLUE}[3/5]${NC} Loading LaunchDaemon..."
launchctl load ~/Library/LaunchAgents/com.siso.mcp-monitor.plist 2>/dev/null || \
    launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.siso.mcp-monitor.plist
echo -e "${GREEN}  ✓ LaunchDaemon loaded${NC}"

# 4. Add aliases to shell profile
echo ""
echo -e "${BLUE}[4/5]${NC} Adding aliases to shell profile..."
SHELL_PROFILE="$HOME/.zshrc"
if [ ! -f "$SHELL_PROFILE" ]; then
    SHELL_PROFILE="$HOME/.bashrc"
fi

if ! grep -q "mcp-health" "$SHELL_PROFILE" 2>/dev/null; then
    cat >> "$SHELL_PROFILE" << 'EOF'

# MCP Crash Prevention Aliases
export BLACKBOX_HOME="$(cd ~/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox && pwd)"
alias mcp-health='$BLACKBOX_HOME/4-scripts/startup-health-check.sh'
alias mcp-cleanup='$BLACKBOX_HOME/4-scripts/cleanup-mcp-processes.sh'
alias mcp-status='cat ~/.mcp-logs/mcp-state.json'
alias mcp-logs='tail -f ~/.mcp-logs/mcp-monitor.log'
EOF
    echo -e "${GREEN}  ✓ Added aliases to $SHELL_PROFILE${NC}"
else
    echo -e "${YELLOW}  ⚠ Aliases already exist in $SHELL_PROFILE${NC}"
fi

# 5. Verify setup
echo ""
echo -e "${BLUE}[5/5]${NC} Verifying setup..."
sleep 2

if launchctl list | grep -q "com.siso.mcp-monitor"; then
    echo -e "${GREEN}  ✓ LaunchDaemon is running${NC}"
else
    echo -e "${YELLOW}  ⚠ LaunchDaemon may not be running yet${NC}"
fi

# Show summary
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup Complete!                         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Restart your shell or run:"
echo "   source $SHELL_PROFILE"
echo ""
echo "2. Run health check before starting agents:"
echo "   mcp-health"
echo ""
echo "3. Monitor MCP servers while running:"
echo "   mcp-logs"
echo ""
echo "4. View current status:"
echo "   mcp-status"
echo ""
echo "For detailed documentation, see:"
echo "   .blackbox/.docs/MCP-CRASH-PREVENTION.md"
echo ""
