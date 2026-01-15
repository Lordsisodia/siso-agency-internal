# Quick Start Guide
**Status**: Ready for Implementation

## Overview

This guide gets you started with Oh-My-OpenCode integrations in Blackbox3 within 15 minutes.

## Prerequisites

1. **Blackbox3 installed** in your project
2. **Oh-My-OpenCode available** (for reference)
3. **jq installed** for JSON manipulation
4. **Python 3.8+** for hook scripts

## Installation Steps

### 1. Enable MCPs (2 minutes)

\`\`\`bash
# Install MCP manager and enable key MCPs
blackbox3 mcp-enable github
blackbox3 mcp-enable playwright
blackbox3 mcp-enable context7
\`\`\`

### 2. Load Enhanced Agents (1 minute)

\`\`\`bash
# Load Omo agents
blackbox3 load --agent=ommo:oracle
blackbox3 load --agent=ommo:librarian
blackbox3 load --agent=ommo:explore
\`\`\`

### 3. Test Background Tasks (2 minutes)

\`\`\`bash
# Start a background task
blackbox3 background-add "Test agent" --agent=ommo:explore

# List and monitor
blackbox3 background-list

# Wait for completion
blackbox3 background-wait <task_id>

# Check status
blackbox3 background-status <task_id>
\`\`\`

### 4. Use Magic Keywords (3 minutes)

\`\`\`bash
# Try ultrawork mode
blackbox3 new-plan "Build full app ultrawork"

# System automatically enables all advanced features
\`\`\`

### 5. Verify Session Management (5 minutes)

\`\`\`bash
# List your sessions
blackbox3 session-list

# Search in previous sessions
blackbox3 session-search "vendor swap pattern"
\`\`\`

## What You Get

1. **Multi-model orchestration** - Different AI models for different tasks
2. **Parallel execution** - Run multiple agents at once
3. **Official docs** - Context7 access
4. **GitHub search** - Grep.app integration
5. **Browser automation** - Playwright MCP
6. **Codebase navigation** - LSP tools for agents
7. **Session history** - Never lose important conversations
8. **Smart compaction** - Auto-manage token limits

## Common Workflows

### Workflow 1: Full-Stack Development

\`\`\`bash
blackbox3 new-plan "Build e-commerce platform ultrawork"

# System automatically:
# 1. Frontend UI agent builds UI (Gemini, background)
# 2. Backend agent builds API (Claude, parallel)
# 3. Librarian researches similar patterns (parallel)
# 4. Oracle reviews architecture (parallel)
# 5. All tasks complete, integrated
\`\`\`

### Workflow 2: Deep Code Analysis

\`\`\`bash
blackbox3 new-plan "Investigate performance issue analyze"

# System automatically:
# 1. Explore finds all performance code (LSP, ast-grep)
# 2. Librarian researches similar issues (Context7, grep.app)
# 3. Oracle analyzes architecture (parallel)
# 4. Synthesize into comprehensive report
\`\`\`

### Workflow 3: Bug Investigation

\`\`\`bash
blackbox3 new-plan "Find root cause of bug analyze"

# System automatically:
# 1. Explore searches for error patterns
# 2. Librarian finds GitHub issues with similar errors
# 3. Oracle analyzes fix strategies
# 4. Multi-agent debugging session
\`\`\`

## Troubleshooting

### MCP not loading?

\`\`\`bash
# Check if MCP is enabled
blackbox3 mcp-status

# Manually verify config
cat ~/.config/opencode/oh-my-opencode.json

# Common issues:
# - MCP not enabled in config
# - Npx not installed
# - Network access blocked
\`\`\`

### Hooks not working?

\`\`\`bash
# Check hooks config
cat blackbox3/.opencode/hooks.json

# Common issues:
# - JSON syntax error
# - Script not executable
# - Missing dependencies
\`\`\`

### Background tasks failing?

\`\`\`bash
# Check task status
blackbox3 background-status <task_id>

# Common issues:
# - Agent not loading
# - Task stuck in 'running' state
- - Output not retrieved
\`\`\`

## Next Steps

1. Read detailed implementation guides for each feature:
   - 01-MCP-INTEGRATION.md
   - 02-ENHANCED-AGENTS.md
   - 03-LSP-INTEGRATION.md
   - 04-BACKGROUND-TASKS.md
   - 05-SESSION-MANAGEMENT.md
   - 06-KEYWORD-DETECTION.md
   - 07-ADANCED-HOOKS.md
   - 08-AUTO-COMPACTION.md
   - 09-CORE-UPDATES.md

2. Customize for your needs:
   - Disable features you don\'t use
   - Add custom MCPs
   - Create custom agents
   - Configure agents with your preferred models

3. Explore advanced workflows:
   - Combine multiple agents
   - Use LSP tools directly
   - Implement custom hooks
   - Build with Ralph integration

## Support Resources

- **Oh-My-OpenCode Documentation**: https://github.com/code-yeongyu/oh-my-opencode
- **MCP Servers List**: https://github.com/wong2/awesome-mcp-servers
- **MCP Specification**: https://github.com/modelcontextprotocol
- **Blackbox3 Community**: Ask in your project channels

---

**Ready to power up your development workflow! 🚀**
