#!/bin/zsh

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧪 COMPREHENSIVE CODEX WRAPPER TEST                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Login Shell
echo "1️⃣ Testing LOGIN SHELL (zsh -l)..."
result=$(zsh -l -c 'type codex' 2>&1)
if echo "$result" | grep -q "shell function"; then
    echo "   ✅ PASS: codex is a shell function"
    echo "   📍 Source: $(echo "$result" | grep -o 'from.*')"
else
    echo "   ❌ FAIL: codex is NOT a shell function"
    echo "   Result: $result"
fi
echo ""

# Test 2: Interactive Shell
echo "2️⃣ Testing INTERACTIVE SHELL (zsh -i)..."
result=$(zsh -i -c 'type codex' 2>&1)
if echo "$result" | grep -q "shell function"; then
    echo "   ✅ PASS: codex is a shell function"
    echo "   📍 Source: $(echo "$result" | grep -o 'from.*')"
else
    echo "   ❌ FAIL: codex is NOT a shell function"
    echo "   Result: $result"
fi
echo ""

# Test 3: Function Definition
echo "3️⃣ Checking function definition..."
result=$(zsh -l -c 'typeset -f codex' 2>&1)
if echo "$result" | grep -q 'network_access="enabled"'; then
    echo "   ✅ PASS: Function includes network_access=\"enabled\""
else
    echo "   ❌ FAIL: Function missing network_access flag"
    echo "   Result: $result"
fi
echo ""

# Test 4: Alias Definition
echo "4️⃣ Checking codex-nonetwork alias..."
result=$(zsh -l -c 'alias codex-nonetwork' 2>&1)
if echo "$result" | grep -q 'network_access="restricted"'; then
    echo "   ✅ PASS: Alias includes network_access=\"restricted\""
else
    echo "   ❌ FAIL: Alias missing or incorrect"
    echo "   Result: $result"
fi
echo ""

# Test 5: Command Expansion Simulation
echo "5️⃣ Simulating: codex mcp list"
echo "   When you run 'codex mcp list', it expands to:"
result=$(zsh -l -c 'typeset -f codex | grep "command codex"')
echo "   → $result mcp list"
echo ""

# Test 6: Config Files
echo "6️⃣ Checking config files..."
if grep -q "codex()" ~/.zprofile 2>/dev/null; then
    echo "   ✅ ~/.zprofile contains wrapper"
else
    echo "   ⚠️  ~/.zprofile missing wrapper (ok if in .zshrc)"
fi

if grep -q "codex()" ~/.zshrc 2>/dev/null; then
    echo "   ✅ ~/.zshrc contains wrapper"
else
    echo "   ❌ ~/.zshrc missing wrapper"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If all tests passed above, then:"
echo ""
echo "✅ Opening a NEW TERMINAL and running 'codex' will use:"
echo "   command codex -c 'network_access=\"enabled\"'"
echo ""
echo "✅ MCPs will have network access"
echo ""
echo "✅ You'll see 20+ MCP tools with /mcp command"
echo ""
echo "To test in YOUR terminal:"
echo "1. Open a BRAND NEW terminal window"
echo "2. Run: type codex"
echo "3. Run: cd ~/DEV/SISO-ECOSYSTEM/SISO-INTERNAL"
echo "4. Run: codex"
echo "5. Inside Codex: /mcp"
echo ""
