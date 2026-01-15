# OhMyOpenCode Agents - Blackbox3 Integration

## Overview

This directory contains Blackbox3-compatible agent definitions for OhMyOpenCode's specialist agents. These agents are adapted from the original TypeScript implementations in `/Users/shaansisodia/DEV/AI-HUB/Open Code/src/agents/`.

## Available Agents

| Agent | ID | Model | Cost | Category | Purpose |
|-------|-----|-------|------|----------|---------|
| 🔮 Oracle | `oracle` | GPT-5.2 / Claude Opus 4.5 | EXPENSIVE | advisor | Strategic architecture reviews |
| 📚 Librarian | `librarian` | Claude Sonnet 4.5 | CHEAP | exploration | Documentation research |
| 🔍 Explore | `explore` | Grok Code | FREE | exploration | Fast codebase search |

## Quick Start

### Running Individual Agents

```bash
# From Blackbox3 root
cd /path/to/Blackbox3

# Oracle - Architecture review
./agents/run-agent.sh ohmy-opencode/oracle "Review the authentication system"

# Librarian - Documentation research
./agents/run-agent.sh ohmy-opencode/librarian "How do I implement JWT with Supabase?"

# Explore - Codebase search
./agents/run-agent.sh ohmy-opencode/explore "Where is user authentication implemented?"
```

### Using in Plans

Add to any `.plan` or `.agent.yaml` file:

```yaml
agent: ohmy-opencode/oracle
task: |
  Review our current microservices architecture.
  Concerns:
  - Service communication patterns
  - Data consistency approach
  - Deployment complexity
```

## Agent Details

### Oracle Agent

**Best for:**
- Architecture reviews and assessments
- Vendor swap analysis
- Design guidance
- Strategic planning

**Triggers:**
- "architecture review"
- "design guidance"
- "vendor swap"
- "technical assessment"

**Key Principles:**
- Simple over complex (unless complexity is justified)
- Boring technology over bleeding edge
- Buy over build (when appropriate)
- Scalability when needed, not preemptively

See [oracle-agent.md](./oracle-agent.md) for full details.

### Librarian Agent

**Best for:**
- Documentation research and discovery
- Code archaeology
- Knowledge synthesis
- Documentation generation

**Triggers:**
- "research documentation"
- "find docs for"
- "how do I"
- "explain how"

**Key Principles:**
- Primary sources over secondary
- Official documentation over blogs/tutorials
- Current versions over outdated
- Specific examples over general explanations

See [librarian-agent.md](./librarian-agent.md) for full details.

### Explore Agent

**Best for:**
- Finding code across multiple modules
- Cross-layer pattern discovery
- Unfamiliar codebase navigation
- Parallel comprehensive searches

**Triggers:**
- "where is"
- "find the code"
- "which file has"
- "how is X implemented"

**Key Principles:**
- Absolute paths only
- Launch parallel searches
- Address actual need, not literal request
- Provide actionable results

See [explore-agent.md](./explore-agent.md) for full details.

## Integration with Blackbox3

### Ralph Agent Integration

These OhMyOpenCode agents work seamlessly with Ralph (the autonomous loop engine):

```yaml
# In a Ralph plan
agents:
  - name: explore
    trigger: "unfamiliar module"
    purpose: "Understand codebase structure"

  - name: librarian
    trigger: "external library mentioned"
    purpose: "Research documentation"

  - name: oracle
    trigger: "architecture decision needed"
    purpose: "Strategic review"
```

### BMAD Integration

Works alongside existing BMAD agents:
- **Mary (Analyst)** - OhMyOpenCode provides research, Mary analyzes competitively
- **Winston (Architect)** - Oracle provides strategic review, Winston implements
- **Explore (Navigator)** - Explore provides quick search, BMAD explores deeply

## Background Task Execution

### Using Explore for Background Searches

```bash
# Launch explore in background for comprehensive search
./agents/run-agent.sh ohmy-opencode/explore "Find all API endpoints" --background

# Check status
./agents/status.sh ohmy-opencode/explore

# Retrieve results when ready
./agents/results.sh ohmy-opencode/explore
```

### Parallel Agent Execution

Fire multiple agents in parallel for comprehensive analysis:

```bash
# Search for all authentication-related code
./agents/run-agent.sh ohmy-opencode/explore "Find auth code" &
EXPLORE_PID=$!

# Research auth documentation
./agents/run-agent.sh ohmy-opencode/librarian "Auth best practices" &
LIBRARIAN_PID=$!

# Wait for both
wait $EXPLORE_PID $LIBRARIAN_PID
```

## MCP Skills Required

Each agent requires specific MCP skills:

| Agent | Required Skills |
|-------|----------------|
| Oracle | Context7 MCP, Sequential Thinking |
| Librarian | Context7 MCP, Web search MCP, Filesystem MCP |
| Explore | LSP tools, Filesystem MCP, Git commands |

## Model Specifications

| Agent | Default Model | Alternative | Temperature |
|-------|--------------|-------------|-------------|
| Oracle | GPT-5.2 | Claude Opus 4.5 | 0.7 |
| Librarian | Claude Sonnet 4.5 | Claude Opus 4.5 | 0.5 |
| Explore | Grok Code | GPT-4.1 | 0.1 |

## File Structure

```
ohmy-opencode/
├── README.md                    # This file
├── oracle-agent.md              # Oracle agent definition
├── librarian-agent.md           # Librarian agent definition
├── explore-agent.md             # Explore agent definition
└── run-agent.sh                 # Wrapper script (to be created)
```

## Source Implementation

These agent definitions are adapted from OhMyOpenCode's TypeScript implementations:
- **Source:** `/Users/shaansisodia/DEV/AI-HUB/Open Code/src/agents/`
- **TypeScript files:**
  - `oracle.ts` (118 lines)
  - `librarian.ts` (265 lines)
  - `explore.ts` (117 lines)
  - `types.ts` (type definitions)

## Improvements Over Original

This Blackbox3 integration adds:
1. **Markdown documentation** for each agent
2. **CLI wrapper scripts** for easy execution
3. **Ralph integration** for autonomous loops
4. **Plan integration** for structured workflows
5. **Background execution** support
6. **Parallel execution** patterns

## Troubleshooting

### Agent Not Found

```bash
# Verify agent file exists
ls -la agents/ohmy-opencode/

# Check wrapper script permissions
chmod +x agents/run-agent.sh
```

### Model Not Available

```bash
# Check available models
./agents/list-models.sh

# Override model for specific agent
./agents/run-agent.sh ohmy-opencode/oracle "Review architecture" --model claude-opus-4.5
```

### Background Task Issues

```bash
# Check task status
./agents/status.sh --all

# View task logs
./agents/logs.sh ohmy-opencode/explore

# Cancel stuck task
./agents/cancel.sh ohmy-opencode/explore
```

## See Also

- [Blackbox3 Documentation](../../.docs/) - Main Blackbox3 docs
- [Ralph Agent](../ralph-agent/) - Autonomous loop engine
- [BMAD Agents](../bmad/) - Full development team
- [OhMyOpenCode Source](../../../../Open Code/src/agents/) - Original TypeScript implementations
