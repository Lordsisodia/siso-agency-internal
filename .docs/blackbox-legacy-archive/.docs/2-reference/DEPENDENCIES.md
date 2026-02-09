# Blackbox4 Dependencies

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**System:** .blackbox4

---

## Overview

Blackbox4 is a **local-first AI agent orchestration system** that runs on bash scripts and integrates with Claude Code CLI. This document catalogs all required dependencies.

---

## Core Runtime Dependencies

### 1. **Claude Code CLI** (Required)
**Purpose:** Primary interface and execution environment

**Minimum Version:** Claude Code CLI (latest)
**Install:** https://claude.ai/code

**Usage:**
- All agent execution happens through Claude Code
- MCP server integration
- Tool invocation

**Models Required:**
- `claude-opus-4.5` or `claude-opus-4-5-20251101` - Heavy reasoning (Oracle, strategic tasks)
- `claude-sonnet-4.5` or `claude-sonnet-4-5-20251101` - Standard tasks (Librarian, research)
- `claude-haiku-4.0` or `claude-haiku-4-0-20251101` - Fast, cheap tasks (Explore, simple lookups)

**Verification:**
```bash
claude --version
claude model list
```

---

### 2. **Bash 4.0+** (Required)
**Purpose:** Script execution and automation

**Minimum Version:** Bash 4.0 (for associative arrays)
**Default on:** macOS (zsh with bash compatibility), Linux (bash 4.0+)

**Key Features Used:**
- Associative arrays: `declare -A agents`
- Process substitution: `<(command)`
- Null-delimited streams: `while read -r -d ''`
- Regex matching: `[[ $var =~ pattern ]]`

**Verification:**
```bash
bash --version  # Should be 4.0+
```

---

## MCP Server Dependencies

### 1. **Supabase MCP Server** (Optional)
**Purpose:** Database operations, edge functions, type generation

**Required for:**
- Database queries and migrations
- Edge function deployment
- TypeScript type generation
- Project management

**Environment Variables:**
```bash
export SUPABASE_ACCESS_TOKEN=your_token
export SUPABASE_PROJECT_REF=your_project_ref
```

**Documentation:** [Supabase MCP](https://github.com/supabase/supabase-mcp)

**Verification:**
```bash
mcp list-servers | grep supabase
```

---

### 2. **GitHub MCP Server** (Optional)
**Purpose:** GitHub operations (issues, PRs, repos)

**Required for:**
- Issue/PR management
- Repository operations
- Code search
- Workflow triggers

**Environment Variables:**
```bash
export GITHUB_ACCESS_TOKEN=your_token
```

**Verification:**
```bash
gh auth status
```

---

### 3. **Filesystem MCP Server** (Required)
**Purpose:** File operations across the codebase

**Required for:**
- File reading/writing
- Directory traversal
- File searching
- Path manipulation

**Capabilities:**
- `read_file`
- `write_file`
- `edit_file`
- `search_files`
- `directory_tree`

**Verification:**
```bash
mcp list-servers | grep filesystem
```

---

### 4. **Sequential Thinking MCP Server** (Optional)
**Purpose:** Complex reasoning and planning

**Required for:**
- Multi-step reasoning
- Complex analysis
- Planning tasks
- Debugging

**Verification:**
```bash
mcp list-servers | grep sequential-thinking
```

---

### 5. **Playwright MCP Server** (Optional)
**Purpose:** Browser automation and testing

**Required for:**
- Web scraping
- Browser testing
- UI automation
- Screenshot capture

**Environment Variables:**
```bash
export PLAYWRIGHT_HEADLESS=true
```

---

### 6. **Chrome DevTools MCP Server** (Optional)
**Purpose:** Advanced browser automation

**Required for:**
- Performance testing
- Advanced debugging
- Network inspection
- Console monitoring

---

### 7. **Context7 MCP Server** (Recommended)
**Purpose:** Up-to-date library documentation

**Required for:**
- Fetching latest docs
- Library code examples
- Version-specific information
- API references

**Verification:**
```bash
mcp list-servers | grep context7
```

---

### 8. **Fetch MCP Server** (Optional)
**Purpose:** HTTP requests and web scraping

**Required for:**
- Fetching URLs
- Web scraping
- API calls
- Content extraction

---

### 9. **DuckDuckGo MCP Server** (Optional)
**Purpose:** Web search capabilities

**Required for:**
- Web research
- Information gathering
- Competitive analysis
- Trend research

---

## System Tools

### 1. **find** (Required)
**Purpose:** File searching

**Used by:**
- Agent discovery
- File location
- Pattern matching

---

### 2. **grep** (Required)
**Purpose:** Content searching

**Used by:**
- Code search
- Pattern matching
- Content filtering

---

### 3. **jq** (Recommended)
**Purpose:** JSON parsing

**Used by:**
- Config file parsing
- JSON processing
- API response handling

**Install:**
```bash
brew install jq  # macOS
apt install jq  # Ubuntu/Debian
```

---

### 4. **yq** (Optional)
**Purpose:** YAML parsing

**Used by:**
- Config file parsing
- YAML processing
- Manifest handling

**Install:**
```bash
brew install yq  # macOS
```

---

## Optional Dependencies

### 1. **Python 3.10+** (Optional)
**Purpose:** Advanced scripts and tooling

**Used by:**
- Validation scripts (`4-scripts/python/`)
- Custom tools
- Data processing

**Verification:**
```bash
python3 --version
```

---

### 2. **Node.js 20+** (Optional)
**Purpose:** JavaScript-based tools

**Used by:**
- Some MCP servers
- Build tools
- Package management

**Verification:**
```bash
node --version
```

---

## Dependency Check Script

Run the dependency check script to verify all dependencies:

```bash
cd .blackbox4
./4-scripts/check-dependencies.sh
```

**Expected Output:**
```
=== Blackbox4 Dependency Check ===

✅ Claude Code CLI: installed
✅ Bash: 5.1.0 (4.0+ required)
✅ Filesystem MCP: connected
⚠️  Supabase MCP: not configured (optional)
✅ GitHub MCP: connected
⚠️  Sequential Thinking: not configured (optional)
⚠️  Playwright: not configured (optional)
✅ jq: 1.6
⚠️  yq: not installed (optional)

Status: 5/7 core dependencies satisfied
```

---

## Quick Install

### macOS
```bash
# Install core tools
brew install jq yq

# Install Claude Code CLI
# Visit: https://claude.ai/code

# Install MCP servers (optional)
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-filesystem
```

### Ubuntu/Debian
```bash
# Install core tools
sudo apt update
sudo apt install -y bash jq

# Install yq
sudo snap install yq

# Install Claude Code CLI
# Visit: https://claude.ai/code
```

---

## Troubleshooting

### Claude Code CLI not found
**Error:** `claude: command not found`

**Solution:**
1. Install Claude Code CLI from https://claude.ai/code
2. Add to PATH: `export PATH="$PATH:/path/to/claude"`

### Bash version too old
**Error:** `Syntax error near '('` (associative arrays not supported)

**Solution:**
```bash
# macOS: Install newer bash
brew install bash

# Add to shell profile
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
```

### MCP server not connected
**Error:** `MCP server 'supabase' not found`

**Solution:**
1. Check MCP configuration: `cat ~/.claude/mcp.json`
2. Install missing MCP server
3. Restart Claude Code CLI

---

## Version Compatibility Matrix

| **Component** | **Minimum** | **Recommended** | **Tested With** |
|---------------|-------------|-----------------|-----------------|
| **Claude Code CLI** | Latest | Latest | 2025-01-15 |
| **Bash** | 4.0 | 5.0+ | 5.1.0 |
| **macOS** | 11.0+ | 13.0+ | Ventura (13.6) |
| **Ubuntu** | 20.04 | 22.04+ | 22.04 LTS |
| **Claude Opus** | 4.5 | 4.5 | claude-opus-4-5-20251101 |
| **Claude Sonnet** | 4.5 | 4.5 | claude-sonnet-4-5-20251101 |
| **Claude Haiku** | 4.0 | 4.0 | claude-haiku-4-0-20251101 |

---

## Dependency Updates

### Updating Claude Models
Claude models are updated automatically by the CLI. No action needed.

### Updating MCP Servers
```bash
# Update all MCP servers
npm update -g @modelcontextprotocol/*

# Update specific server
npm update -g @modelcontextprotocol/server-supabase
```

### Updating Bash Scripts
All bash scripts are in `.blackbox4/4-scripts/`. Pull latest changes:
```bash
git pull origin main
```

---

## Security Considerations

### 1. API Tokens
**Never commit:** `.env`, `.env.local`, or files with API tokens

**Use instead:**
- Environment variables
- `~/.claude/mcp.json` for MCP server config
- System keychain

### 2. MCP Server Permissions
MCP servers have access to:
- Filesystem (read/write)
- Network (HTTP requests)
- System commands

**Review:** Regularly audit `.claude/mcp.json` for server permissions

### 3. Claude Code CLI Access
The CLI has access to:
- All files in working directory
- MCP servers
- System commands (bash)

**Best Practice:** Review agent prompts before execution

---

## Contributing

When adding new dependencies:

1. Update this document
2. Add verification check to `4-scripts/check-dependencies.sh`
3. Add install instructions to Quick Install section
4. Update version compatibility matrix
5. Document security considerations

---

**Last Reviewed:** 2026-01-15
**Next Review:** 2026-02-15
**Maintainer:** Blackbox4 Team
