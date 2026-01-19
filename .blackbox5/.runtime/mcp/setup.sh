#!/usr/bin/env bash

# One-time setup for MCP crash prevention

set -e

echo "Setting up MCP crash prevention..."
echo ""

# Create directories
mkdir -p ~/.mcp-logs
echo "✓ Created log directory"

# Install Python dependency
echo ""
echo "Installing psutil..."
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine
pip install psutil -q
echo "✓ Installed psutil"

# Make scripts executable
chmod +x /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/.runtime/mcp/mcp-monitor-daemon.sh
echo "✓ Made scripts executable"

# Install LaunchDaemon
cp /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/.runtime/mcp/com.siso.mcp-monitor.plist ~/Library/LaunchAgents/
echo "✓ Installed LaunchDaemon"

# Load the daemon
launchctl load ~/Library/LaunchAgents/com.siso.mcp-monitor.plist 2>/dev/null || \
    launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.siso.mcp-monitor.plist
echo "✓ Started MCP monitor daemon"

# Add aliases to shell
SHELL_PROFILE="$HOME/.zshrc"
if [ ! -f "$SHELL_PROFILE" ]; then
    SHELL_PROFILE="$HOME/.bashrc"
fi

if ! grep -q "# MCP Crash Prevention (Black Box 5)" "$SHELL_PROFILE" 2>/dev/null; then
    cat >> "$SHELL_PROFILE" << 'EOF'

# MCP Crash Prevention (Black Box 5)
alias mcp-status='cat ~/.mcp-logs/mcp-state.json'
alias mcp-logs='tail -f ~/.mcp-logs/mcp-monitor.log'
alias mcp-cleanup='pkill -9 -f "mcp-server" && pkill -9 -f "npm exec.*mcp"'
alias mcp-stop='launchctl unload ~/Library/LaunchAgents/com.siso.mcp-monitor.plist'
alias mcp-start='launchctl load ~/Library/LaunchAgents/com.siso.mcp-monitor.plist'
EOF
    echo "✓ Added aliases to $SHELL_PROFILE"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Setup Complete!                         ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "The MCP monitor daemon is now running in the background."
echo "It will automatically clean up excess MCP processes every 60 seconds."
echo ""
echo "Commands:"
echo "  mcp-status  - Check current status"
echo "  mcp-logs    - View logs"
echo "  mcp-cleanup - Manual cleanup"
echo "  mcp-stop    - Stop daemon"
echo "  mcp-start   - Start daemon"
echo ""
echo "Next: Restart your shell or run: source $SHELL_PROFILE"
echo ""
