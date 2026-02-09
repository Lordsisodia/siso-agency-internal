# Blackbox3 + Oh-My-OpenCode Integration
**Complete Implementation Plan**

---

## 📋 What This Is

This plan contains all files and configurations needed to add Oh-My-OpenCode\'s powerful features to your Blackbox3 development framework.

## 🎯 What You Get

### High-Value Features

1. **MCP Integration** (Context7, Exa, Grep.app, GitHub, Playwright, etc.)
2. **Enhanced Agents** (Oracle, Librarian, Explore, Frontend-UI/UX-Engineer, etc.)
3. **LSP Tools** (Give agents IDE-level superpowers)
4. **Background Task System** (Run agents in parallel like a team)
5. **Session Management** (Never lose important conversations)
6. **Keyword Detection** (ultrawork, search, analyze modes)
7. **Advanced Hooks** (Code quality, validation, automation)
8. **Auto-Compaction** (Smart context management, prevent token limits)

## 📂 File Structure

All implementation files are organized under \`blackbox3/\`:

\`\`\`
blackbox3/
├── .opencode/
│   ├── mcp-servers.json          # MCP configurations
│   └── hooks.json                # Hook definitions
├── scripts/
│   ├── mcp-manager.sh              # MCP management CLI
│   ├── background-manager.sh         # Background task manager
│   ├── session-manager.sh           # Session management CLI
│   ├── compaction-manager.sh         # Auto-compaction manager
│   └── hooks/                     # Hook scripts
├── agents/
│   ├── oh-my-opencode/           # Enhanced Omo agents
│   │   ├── oracle.agent.yaml
│   │   ├── librarian.agent.yaml
│   │   ├── explore.agent.yaml
│   │   ├── frontend-ui-ux-engineer.agent.yaml
│   │   ├── document-writer.agent.yaml
│   │   └── multimodal-looker.agent.yaml
│   └── _core/
│       ├── prompt.md                # Updated with Omo keywords
│       └── load.bash                # Enhanced agent loader
├── skills/
│   └── with-lsp.md               # LSP tools for agents
└── docs/
    ├── MCP-INTEGRATION.md
    ├── ENHANCED-AGENTS.md
    ├── LSP-INTEGRATION.md
    ├── BACKGROUND-TASKS.md
    ├── SESSION-MANAGEMENT.md
    ├── KEYWORD-DETECTION.md
    ├── ADVANCED-HOOKS.md
    ├── AUTO-COMPACTION.md
    ├── CORE-UPDATES.md
    ├── QUICKSTART.md
    └── README.md (this file)
\`\`\`

## 🚀 Getting Started

### Prerequisites Check

\`\`\`bash
# Check if jq is installed
if ! command -v jq &>/dev/null; then
    echo "❌ jq not installed. Installing..."
    brew install jq
else
    echo "✅ jq is installed"
fi
\`\`\`

### Step 1: Enable MCPs (5 minutes)

\`\`\`bash
# Enable built-in MCPs
blackbox3 mcp-enable context7
blackbox3 mcp-enable websearch_exa
blackbox3 mcp-enable grep_app
blackbox3 mcp-enable github
blackbox3 mcp-enable playwright

# Add community MCPs (if needed)
blackbox3 mcp-add sqlite --command "npx" --args "-y @modelcontextprotocol/sqlite"
blackbox3 mcp-add chroma --command "npx" --args "-y @chroma-core/mcp-server"
\`\`\`

### Step 2: Load Enhanced Agents (2 minutes)

\`\`\`bash
# Load Omo agents
blackbox3 load --agent=ommo:oracle
blackbox3 load --agent=ommo:librarian
blackbox3 load --agent=ommo:explore
\`\`\`

### Step 3: Test Features (10 minutes)

\`\`\`bash
# Test background tasks
blackbox3 background-add "Test task" --agent=ommo:librarian

# Test keyword detection
blackbox3 new-plan "Test ultrawork feature"

# Check MCP status
blackbox3 mcp-status
\`\`\`

### Step 4: Verify Session Management (5 minutes)

\`\`\`bash
# List sessions
blackbox3 session-list

# Search for previous solutions
blackbox3 session-search "vendor swap pattern"
\`\`\`

## ✨ What\'s New

### Parallel Agent Work

Instead of single-threaded execution, you can now:
- Run Oracle for architecture review while Librarian researches
- Let Explore navigate codebase while you implement features
- Multiple background tasks running simultaneously
- Get notifications when tasks complete

### LSP Superpowers

Your agents now have IDE-level capabilities:
- \`lsp_hover\`: Type info at cursor
- \`lsp_goto_definition\`: Jump to definitions
- \`lsp_find_references\`: Find all usages
- \`ast_grep_search\`: Structural code patterns
- \`lsp_rename\`: Safe refactoring

### Never Lose Context

- Session history: Access all past conversations
- Cross-session search: Find solutions from any time
- Agent performance tracking: See what worked and what didn\'t

### Magic Keywords

Just include these in your prompts:
- \`ultrawork\` or \`ulw\`: Maximum performance mode
- \`search\`, \`find\`, \`look for\`: Deep research mode
- \`analyze\`, \`investigate\`: Deep analysis mode

### Smart Compaction

Auto-compaction at 85% usage keeps you working longer:
- Preserves AGENTS.md context
- Keeps plan files
- Maintains 50% headroom
- Prevents token limit errors

## 📚 Documentation

Read the detailed guides in the docs/ directory:
- \`docs/01-MCP-INTEGRATION.md\` - How MCPs work
- \`docs/02-ENHANCED-AGENTS.md\` - Enhanced agents setup
- \`docs/00-QUICKSTART.md\` - This guide

## 🔧 Configuration

All features are configurable:

### Disable Features

\`\`\`bash
# Disable specific MCPs
blackbox3 mcp-disable playwright

# Disable keyword detection
blackbox3 set-mode normal

# Disable auto-compaction
blackbox3 compact disable
\`\`\`

### Custom MCPs

\`\`\`bash
# Add custom MCP
blackbox3 mcp-add my-custom-mcp --command "node" --args "/path/to/server"
blackbox3 mcp-add my-custom-mcp --url "https://example.com/mcp"
\`\`\`

### Agent Customization

\`\`\`yaml
# Edit agent models (in agents/oh-my-opencode/*.agent.yaml)
# Change agent personas
# Add custom tools
\`\`\`

## 🤔 Troubleshooting

### MCP Issues

**Problem**: MCP not loading
\`\`\`bash
# Check config
cat ~/.config/opencode/oh-my-opencode.json | jq '.mcpServers'

# Manually verify MCP server is running
# Check MCP documentation for requirements
\`\`\`

**Problem**: Agents not loading
\`\`\`bash
# Verify agent files exist
ls agents/oh-my-opencode/

# Check agent is in correct format
# Ensure YAML is valid
\`\`\`

### Background Tasks

**Problem**: Task stuck in 'running' state
\`\`\`bash
# Check task status
blackbox3 background-status <task_id>

# Manually cancel task
blackbox3 background-cancel <task_id>

# Restart background manager if needed
\`\`\`

## 💡 Best Practices

### 1. Agent Selection

- Use **Oracle** for: Architecture reviews, debugging, strategic decisions
- Use **Librarian** for: Research, documentation, code examples
- Use **Explore** for: Fast codebase navigation, pattern searches
- Use **Frontend-UI/UX-Engineer** for: UI/UX development
- Use **Document-Writer** for: Documentation, technical writing
- Use **Multimodal-Looker** for: Image/PDF analysis

### 2. Parallel Execution

- Background tasks are perfect for:
  - Independent research (Librarian finding examples)
  - Parallel development (Frontend while you work on backend)
  - Multiple searches (Explore + Librarian)

### 3. LSP Tools

- Faster than grep for navigation
- Use \`lsp_find_references\` before refactoring
- Use \`ast_grep_search\` for structural patterns
- Use \`lsp_diagnostics\` to catch errors early

### 4. Session Management

- Use \`session-list\` to see all sessions
- Use \`session-search\` to find previous solutions
- Regularly check \`session-info\` to track agent performance

### 5. Keyword Detection

- Start with \`ultrawork\` for complex, time-sensitive projects
- Use \`search\` mode for research tasks
- Use \`analyze\` mode for debugging/analysis
- No configuration needed - keywords are auto-detected

## 🎓 Success Criteria

Your setup is complete when:
- [ ] At least 3 MCPs are enabled and functional
- [ ] Omo agents load successfully
- [ ] You can run background tasks
- [ ] Session management works
- [ ] Keyword detection works
- [ ] You have tested one parallel workflow

---

**Status**: ✅ Planning Complete  
**Next**: Review the implementation guides and add files to your Blackbox3 folder

**Estimated Setup Time**: 15-20 minutes  
**Estimated Value**: Unlimited (multi-agent superpowers! 🚀)
