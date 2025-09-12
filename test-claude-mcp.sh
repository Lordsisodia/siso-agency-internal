#!/bin/bash

echo "🧪 Testing Claude Code MCP Integration"
echo "====================================="
echo ""

echo "Step 1: Check if Claude Code can see Codex MCP tools..."
echo ""

# Create a simple test prompt
cat > /tmp/claude-mcp-test.txt << 'EOF'
I want to test MCP integration. Can you:

1. List what MCP tools are available to you
2. If you see any Codex-related MCP tools, use them to create a simple TypeScript function that adds two numbers
3. Show me the exact tool names and capabilities you have access to

This is a test to verify MCP integration is working correctly.
EOF

echo "Test prompt created. About to run Claude Code..."
echo "Press Ctrl+C if it hangs for more than 30 seconds."
echo ""

# Run Claude Code with the test
claude "$(cat /tmp/claude-mcp-test.txt)"