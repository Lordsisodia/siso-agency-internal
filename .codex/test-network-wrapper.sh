#!/bin/zsh

echo "🧪 Testing Codex Network Access Wrapper"
echo "========================================"
echo ""

# Source the .zshrc to load the function
source ~/.zshrc 2>/dev/null

echo "1️⃣ Checking if codex function is defined..."
if typeset -f codex > /dev/null; then
    echo "   ✅ codex function found!"
    typeset -f codex | head -3
else
    echo "   ❌ codex function NOT found"
    echo "   Please open a NEW terminal window or run: source ~/.zshrc"
fi

echo ""
echo "2️⃣ Checking if codex-nonetwork alias is defined..."
if alias codex-nonetwork > /dev/null 2>&1; then
    echo "   ✅ codex-nonetwork alias found!"
    alias codex-nonetwork
else
    echo "   ❌ codex-nonetwork alias NOT found"
    echo "   Please open a NEW terminal window or run: source ~/.zshrc"
fi

echo ""
echo "3️⃣ Verifying ~/.zshrc contains the wrapper..."
if grep -q "CODEX NETWORK ACCESS WRAPPER" ~/.zshrc; then
    echo "   ✅ Wrapper code found in ~/.zshrc"
    echo ""
    echo "   Code in ~/.zshrc:"
    echo "   ─────────────────────────────────────────"
    grep -A 8 "CODEX NETWORK ACCESS WRAPPER" ~/.zshrc
else
    echo "   ❌ Wrapper code NOT found in ~/.zshrc"
fi

echo ""
echo "4️⃣ Testing codex --version..."
if command -v codex > /dev/null; then
    echo "   ✅ Codex binary found at: $(which codex)"
    codex --version 2>&1 | head -1
else
    echo "   ❌ Codex binary NOT found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To activate the wrapper, run ONE of these:"
echo ""
echo "  Option 1: source ~/.zshrc"
echo "  Option 2: Open a new terminal window"
echo ""
echo "Then test:"
echo ""
echo "  cd ~/DEV/SISO-ECOSYSTEM/SISO-INTERNAL"
echo "  codex"
echo ""
echo "Inside Codex, run:"
echo "  /mcp"
echo ""
echo "You should see 20+ MCP tools available! 🚀"
echo ""
