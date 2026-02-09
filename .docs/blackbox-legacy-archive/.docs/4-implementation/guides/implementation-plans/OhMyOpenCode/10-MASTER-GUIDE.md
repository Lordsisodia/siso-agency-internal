# Master Implementation Guide
**Status**: Planning Phase Complete  
**Created**: 2026-01-15

## Overview

This is the complete implementation guide for adding Oh-My-OpenCode features to Blackbox3. All components are planned and ready for implementation.

## Feature Summary

| Feature | Status | Priority | Files | Impact |
|---------|--------|----------|-------|--------|
| MCP Integration | Planned | **P0** | 3 files + manager script | Access Context7, GitHub, Supabase, Playwright, etc. |
| Enhanced Agents | Planned | **P0** | 4 agent definitions + loader update | Multi-model orchestration with Oracle, Librarian, Explore |
| LSP Tools for Agents | Planned | **P1** | 1 skill + agent updates | Give agents IDE superpowers |
| Background Tasks | Planned | **P1** | 1 manager script | Parallel agent execution like a team |
| Session Management | Planned | **P1** | 1 manager script | Never lose context, cross-session search |
| Keyword Detection | Planned | **P1** | 1 detector skill + core update | One word mode switching (ultrawork) |
| Advanced Hooks | Planned | **P1** | 1 config + 3 scripts | Code quality, validation, automation |
| Auto-Compaction | Planned | **P2** | 1 manager script | Prevent token limits, smart context management |

## Implementation Priority

### Phase 1 (Week 1): Core Integrations
1. ✅ MCP Integration System
2. ✅ Enhanced Agents (Oracle, Librarian, Explore)
3. ✅ LSP Tools for Agents

### Phase 2 (Week 2): Advanced Features
4. ⏳ Background Task System
5. ⏳ Session Management

### Phase 3 (Week 3): Intelligence Layer
6. ⏳ Keyword Detection
7. ⏳ Advanced Hooks
8. ⏳ Auto-Compaction

### Phase 4 (Week 4): Polish & Documentation
9. ⏳ Documentation Complete
10. ⏳ Testing & Bug Fixes

## Directory Structure

All implementation files organized under \`blackbox3/\`:

\`\`\`
blackbox3/
├── .opencode/
│   ├── mcp-servers.json          # MCP configurations
│   └── hooks.json                # Hook definitions
├── scripts/
│   ├── mcp-manager.sh              # MCP management
│   ├── background-manager.sh         # Background tasks
│   ├── session-manager.sh           # Session management
│   ├── compaction-manager.sh         # Auto-compaction
│   └── hooks/                     # Hook scripts
│       ├── validate-changes.py
│       ├── inject-context.py
│       ├── analyze-command.py
│       └── session-summary.py
├── agents/
│   └── oh-my-opencode/           # Enhanced agent definitions
│       ├── oracle.agent.yaml
│       ├── librarian.agent.yaml
│       ├── explore.agent.yaml
│       ├── frontend-ui-ux-engineer.agent.yaml
│       ├── document-writer.agent.yaml
│       └── multimodal-looker.agent.yaml
├── skills/
│   └── with-lsp.md               # LSP tools for agents
├── agents/_core/
│   ├── prompt.md                    # Updated with Omo info
│   └── load.bash                   # Enhanced agent loader
└── docs/
    ├── MCP-INTEGRATION.md
    ├── ENHANCED-AGENTS.md
    ├── LSP-INTEGRATION.md
    ├── BACKGROUND-TASKS.md
    ├── SESSION-MANAGEMENT.md
    ├── KEYWORD-DETECTION.md
    ├── ADVANCED-HOOKS.md
    ├── AUTO-COMPACTION.md
    ├── WHATS-NEW.md
    └── QUICKSTART.md
\`\`\`

## Usage Examples

### Example 1: Multi-Agent Development with MCPs

\`\`\`
# Create new plan with magic keywords
blackbox3 new-plan "Build payment processing system ultrawork"

# System automatically:
# - Enables parallel agents (Oracle, Librarian, Explore)
# - Uses Context7 for payment API docs
# - Uses GitHub MCP for example implementations
# - Runs all agents in background
\`\`\`

### Example 2: Codebase Navigation with LSP

\`\`\`
# Load enhanced Explore agent
blackbox3 load --agent=ommo:explore

# Ask to find all usages
User: "Find all usages of the processPayment function"

# Agent now uses:
# - lsp_find_references: Finds all usages across entire workspace
# - lsp_goto_definition: Jumps to definition
# - ast_grep_search: Finds patterns
# Returns line numbers for easy navigation
\`\`\`

### Example 3: Deep Research with Session Search

\`\`\`
# Search for previous solutions
blackbox3 session search "How did we handle vendor swap before?"

# Returns:
# - All sessions that mention "vendor swap"
# - Relevant message snippets
# - Links to source repositories
\`\`\`

### Example 4: Continuous Improvement with Auto-Compaction

\`\`\`
# Auto-compaction enabled at 85%
blackbox3 compact configure --threshold 85

# Benefits:
# - Session continues for hours instead of hitting token limits
# - Critical context (AGENTS.md, plans, recent activity) preserved
# - 50% headroom always available
\`\`\`

## Quick Start

After installing all components:

1. **Enable MCPs**:
   \`blackbox3 mcp-enable github\`
   \`blackbox3 mcp-enable playwright\`
   \`blackbox3 mcp-enable context7\`

2. **Load Enhanced Agents**:
   \`blackbox3 load --agent=ommo:oracle\`
   \`blackbox3 load --agent=ommo:librarian\`
   \`blackbox3 load --agent=ommo:explore\`

3. **Test with ultrawork**:
   \`blackbox3 new-plan "Test new feature ultrawork"\`

All features will automatically activate!

## Key Benefits

### 1. Multi-Model Orchestration
- **Oracle** (GPT-5.2): Strategic architecture
- **Librarian** (Sonnet 4.5): Research and examples
- **Explore** (Grok/Gemini): Fast codebase navigation
- **Frontend** (Gemini 3 Pro): UI/UX development

### 2. Parallel Execution
- Run multiple agents simultaneously
- Background task management
- Wait for results when needed

### 3. LSP Superpowers
- Navigate code like in VS Code
- Find all usages across workspace
- Rename symbols safely
- Apply refactorings automatically

### 4. MCP Ecosystem
- Context7: Official docs for any library
- Grep.app: GitHub code search
- GitHub: Official integration
- Playwright: Browser automation
- SQLite, Chroma, Supabase: Database options

### 5. Session Intelligence
- Never lose important conversations
- Search across all sessions
- Reuse previous solutions
- Track agent performance

### 6. Advanced Automation
- Code quality hooks
- Automated testing
- Auto-compaction to prevent limits
- Context preservation

## Migration Path

If you have an existing Blackbox3 setup:

1. **Preserve**: Your existing plans, BMAD agents, memory system
2. **Add**: These new capabilities on top
3. **Enhance**: Your workflows with new features
4. **Optional**: Disable any features you don\'t need

All configurations are independent - use what you want!

## Architecture Notes

### Integration Philosophy

Blackbox3 maintains its identity while borrowing the best components:

**What We Keep from Oh-My-OpenCode**:
- MCP server management system
- Background task architecture
- Session persistence and search
- Hook execution framework

**What We Don't Use**:
- Full Oh-My-OpenCode plugin (too complex, requires OpenCode)
- The orchestrator (we use our own manual + agent system)
- Built-in skills (we have our own skills system)

**Why This Works**:
- Clean separation of concerns
- Blackbox3 owns the workflow and orchestration
- We only call into Oh-My-OpenCode features when needed
- Maintains Blackbox3\'s file-based, human-centric approach

## Success Criteria

All phases complete when:
- [ ] All MCP servers loadable and functional
- [ ] All Omo agents loadable and working
- [ ] LSP tools available to agents
- [ ] Background tasks execute reliably
- [ ] Session management fully functional
- [ ] Keywords detected and mode switching works
- [ ] All hooks functional
- [ ] Auto-compaction prevents token limits
- [ ] All documentation complete
- [ ] Testing shows no regressions

**Overall Goal**: Transform Blackbox3 into the most powerful AI development framework by integrating Oh-My-OpenCode\'s proven capabilities.

---

**Document Status**: ✅ Complete  
**Last Updated**: 2026-01-15
