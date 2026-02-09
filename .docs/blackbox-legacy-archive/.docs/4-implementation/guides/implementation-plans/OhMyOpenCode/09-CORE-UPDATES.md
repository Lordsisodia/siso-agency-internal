# Core System Updates for Blackbox3
**Status**: Planning Phase

## Overview

Update Blackbox3\'s core files to support all new integrations from Oh-My-OpenCode.

## Files to Update

### 1. Agent Core Prompt

**File**: `agents/_core/prompt.md`

```markdown
# Blackbox3 Core Agent Prompt

## Agent System

Blackbox3 supports multiple agent systems:

### BMAD Agents (Built-in)
12 specialized agents for role-based development:
- Analyst, PM, Architect, Dev, QA, Security, SM, UX Designer, etc.

### Oh-My-OpenCode Agents (Enhanced)
Specialized agents with multi-model orchestration:
- Oracle (Omo): Architecture expert using GPT-5.2
- Librarian (Omo): Research specialist using Claude Sonnet 4.5 or Gemini 3 Flash
- Explore (Omo): Fast codebase explorer using Grok Code or Gemini 3 Flash
- Frontend-UI/UX-Engineer (Omo): UI/UX developer using Gemini 3 Pro High
- Document-Writer (Omo): Technical writer using Gemini 3 Flash
- Multimodal-Looker (Omo): Visual content analyzer using Gemini 3 Flash

### Custom Agents
Create your own agents for specific needs.

### Enhanced Agent Features

All agents now support:

1. **Multi-Model Orchestration**
   - Use different models for different tasks
   - GPT-5.2 for strategy
   - Claude Opus 4.5 for coding
   - Gemini for frontend
   - Claude Sonnet for research

2. **LSP Tools for Agents**
   - Type info: \`lsp_hover\`
   - Navigation: \`lsp_goto_definition\`, \`lsp_find_references\`
   - Search: \`lsp_document_symbols\`, \`lsp_workspace_symbols\`
   - Actions: \`lsp_code_actions\`, \`lsp_rename\`
   - Analysis: \`ast_grep_search\`, \`ast_grep_replace\`

3. **Parallel Agent Execution**
   - Background tasks for parallel work
   - Task management and monitoring
   - Wait for results when needed

4. **Advanced MCP Integration**
   - Context7: Official documentation
   - Exa: Real-time web search
   - Grep.app: Ultra-fast GitHub search
   - GitHub: Official GitHub integration
   - Playwright: Browser automation
   - SQLite: Local database
   - Chroma: Vector search for memory
   - Supabase: Production backend

5. **Session Management**
   - Cross-session search: Find previous solutions
   - Session history: Never lose important conversations
   - Metadata tracking: Agents used, tokens consumed

## Loading Agents

Use \`blackbox3 load --agent=<name>\` to load Oh-My-OpenCode agents:

\`\`\`
blackbox3 load --agent=ommo:oracle
blackbox3 load --agent=ommo:librarian
blackbox3 load --agent=ommo:explore
blackbox3 load --agent=ommo:frontend-ui-ux-engineer
\`\`\`

Falls back to BMAD agents if Omo agent not found.

## Agent Coordination

Agents can work together for complex tasks:

1. **Oracle**: Architecture review
2. **Librarian**: Research and examples
3. **Explore**: Fast codebase navigation
4. **Frontend UI/UX-Engineer**: UI development

Example:

\`\`\`
User: "Build a payment system with vendor swap support"

# Oracle runs in parallel
blackbox3 load oracle "Review this architecture for vendor swap compliance"

# Librarian runs in parallel
blackbox3 load librarian "Find payment processing examples from Context7"

# Explore finds all implementations
blackbox3 load explore "Find all usages of processPayment function"

# Results integrated
\`\`\`

## Keyword Detection

The system automatically detects magic keywords in your prompts:

### ultrawork / ulw
- Maximum performance mode
- All agents and hooks enabled
- Parallel execution activated
- Background tasks for everything

### search / find
- Deep research mode
- Parallel Explore + Librarian agents
- Context7 + Grep.app MCPs enabled

### analyze / investigate
- Multi-phase expert consultation
- Oracle → Explore → Librarian synthesis
- Deep analysis workflow

These keywords are automatically detected - no configuration needed!

## Next Steps

See individual integration guides for:
- MCP Integration
- Enhanced Agents
- LSP Tools
- Background Tasks
- Session Management
- Advanced Hooks
- Auto-Compaction
