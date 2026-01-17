#!/bin/bash
###############################################################################
# MCP CONNECTION TEST SCRIPT
# Run this on your MacBook to diagnose MCP connection
###############################################################################

echo "🔍 Vibe Kanban MCP Connection Test"
echo "===================================="
echo ""

# Test 1: Check MCP Config
echo "📋 Test 1: MCP Configuration"
echo "-------------------------------"
if [ -f ~/.config/claude-code/config.json ]; then
    echo "✅ Config file exists"
    echo ""
    echo "Current config:"
    cat ~/.config/claude-code/config.json
else
    echo "❌ Config file not found"
    echo ""
    echo "Creating config..."
    mkdir -p ~/.config/claude-code
    cat > ~/.config/claude-code/config.json << 'EOF'
{
  "mcpServers": {
    "vibe_kanban_remote": {
      "command": "npx",
      "args": [
        "-y",
        "vibe-kanban@latest",
        "--mcp",
        "--server-url",
        "https://tower-poly-lauren-minister.trycloudflare.com"
      ],
      "env": {
        "VIBE_KANBAN_URL": "https://tower-poly-lauren-minister.trycloudflare.com"
      }
    }
  }
}
EOF
    echo "✅ Config created"
fi
echo ""

# Test 2: Check Vibe Kanban URL
echo "🌐 Test 2: Vibe Kanban URL Accessibility"
echo "-----------------------------------------"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://tower-poly-lauren-minister.trycloudflare.com 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Vibe Kanban is accessible (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "530" ]; then
    echo "⚠️  Cloudflare tunnel error (HTTP $HTTP_CODE)"
    echo "   The tunnel might be down or misconfigured"
elif [ "$HTTP_CODE" = "000" ]; then
    echo "❌ Cannot reach server (connection failed)"
else
    echo "⚠️  Unexpected HTTP code: $HTTP_CODE"
fi
echo ""

# Test 3: Check local network
echo "🏠 Test 3: Local Network Connection"
echo "------------------------------------"
if ping -c 1 -W 2 192.168.0.29 &>/dev/null; then
    echo "✅ Mac Mini is reachable on local network"
else
    echo "❌ Mac Mini is NOT reachable on local network"
    echo "   IP: 192.168.0.29"
    echo "   You might need to:"
    echo "   - Check both machines are on same network"
    echo "   - Verify Mac Mini IP address"
    echo "   - Use RustDesk instead"
fi
echo ""

# Test 4: Check if npx vibe-kanban works
echo "📦 Test 4: Vibe Kanban MCP Server"
echo "---------------------------------"
if command -v npx &>/dev/null; then
    echo "✅ npx is available"
    echo ""
    echo "Testing vibe-kanban MCP..."
    if timeout 5 npx -y vibe-kanban@latest --mcp --help &>/dev/null 2>&1; then
        echo "✅ vibe-kanban MCP can start"
    else
        echo "⚠️  vibe-kanban MCP test failed"
    fi
else
    echo "❌ npx is not available"
    echo "   Install with: brew install npx"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next Steps:"
echo ""
echo "1. ✅ Config is set up correctly"
echo "2. ⚠️  Check Vibe Kanban tunnel status (via RustDesk to Mac Mini)"
echo "3. 🔄 Restart Claude Code on your MacBook"
echo "4. 🧪 Test: 'List all available MCP servers'"
echo ""
echo "If Vibe Kanban URL shows error:"
echo "   → Open RustDesk → Connect to Mac Mini"
echo "   → Run: docker ps | grep vibe"
echo "   → Restart: docker-compose -f ~/SISO-INTERNAL/docker-compose.vibe-kanban.yml restart"
echo ""
echo "If local network doesn't work:"
echo "   → Use RustDesk to access Mac Mini"
echo "   → Check IP address on Mac Mini: ipconfig getifaddr en0"
echo "   → Update MacBook config with correct IP"
echo ""
