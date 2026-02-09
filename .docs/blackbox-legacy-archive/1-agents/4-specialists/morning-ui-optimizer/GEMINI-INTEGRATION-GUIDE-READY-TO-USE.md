# Gemini → Claude Code: Ready-to-Use Solutions

**Date:** Sunday, January 18th, 4:16 AM, 2026
**Updated:** No custom code needed - use existing MCP servers!

---

## Quick Answer: Use Existing MCP Servers!

You don't need to write any code. There are **pre-built, open-source MCP servers** that can execute shell commands. Just install and configure!

---

## Option 1: mcp-bash (Simplest, Recommended)

**GitHub:** [patrickomatik/mcp-bash](https://github.com/patrickomatik/mcp-bash)

### Installation (One Command)

```bash
npm install -g mcp-bash
```

### Gemini Configuration

Add to your Antigravity IDE MCP config:

```json
{
  "mcpServers": {
    "bash": {
      "command": "npx",
      "args": ["-y", "mcp-bash"]
    }
  }
}
```

### Usage from Gemini

```
Gemini: "Run the Morning UI Optimizer using Claude Code"

[Uses tool: execute_command]
{
  "command": "claude",
  "args": [
    "--workspace", "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL",
    "--prompt", "Read .blackbox/1-agents/4-specialists/morning-ui-optimizer/PROMPT.md and execute"
  ]
}
```

That's it! No custom server code needed.

---

## Option 2: shell-mcp-server (Secure, Directory-Restricted)

**GitHub:** [blazickjp/shell-mcp-server](https://github.com/blazickjp/shell-mcp-server)

### Installation

```bash
npm install -g shell-mcp-server
```

### Gemini Configuration

```json
{
  "mcpServers": {
    "shell": {
      "command": "npx",
      "args": ["-y", "shell-mcp-server", "--allowed-dir", "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL"]
    }
  }
}
```

### Usage

Same as Option 1, but with directory restrictions for security.

---

## Option 3: super-shell-mcp (With Approval System)

**GitHub:** [cfdude/super-shell-mcp](https://github.com/cfdude/super-shell-mcp)

### Features
- Command whitelisting
- Built-in approval mechanisms
- Available as Claude Desktop Extension

### Installation

```bash
npm install -g super-shell-mcp
```

### Gemini Configuration

```json
{
  "mcpServers": {
    "super-shell": {
      "command": "npx",
      "args": ["-y", "super-shell-mcp"]
    }
  }
}
```

---

## Option 4: Official MCP Servers Collection

**GitHub:** [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

This is the **official Anthropic repository** with reference implementations.

### Available Servers

```bash
# Browse and install any official server
npx @modelcontextprotocol/server-github
npx @modelcontextprotocol/server-filesystem
npx @modelcontextprotocol/server-postgres
# ... and more
```

---

## Option 5: Awesome MCP Servers (Curated List)

**GitHub:** [wong2/awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers)

A curated list of **community-built MCP servers**.

### Notable Servers

- [GitHub MCP Server](https://lobehub.com/mcp/cyanheads-github-mcp-server) - GitHub API integration
- [atlas-mcp-server](https://github.com/cyanheads/atlas-mcp-server) - Project management databases
- [pty-mcp-server](https://github.com/phoityne/pty-mcp-server) - Windows shell environment

---

## Complete Setup: 5 Minutes

### Step 1: Install mcp-bash (30 seconds)

```bash
npm install -g mcp-bash
```

### Step 2: Configure Gemini (1 minute)

Add to `~/.gemini/mcp-config.json` or Antigravity IDE settings:

```json
{
  "mcpServers": {
    "bash": {
      "command": "npx",
      "args": ["-y", "mcp-bash"]
    }
  }
}
```

### Step 3: Restart Gemini (30 seconds)

Close and reopen Antigravity IDE to load MCP servers.

### Step 4: Test from Gemini (1 minute)

```
Gemini: "Test MCP connection"

[Uses tool: execute_command]
{
  "command": "echo",
  "args": ["Hello from Gemini through MCP!"]
}
```

### Step 5: Run Morning UI Optimizer (2 minutes)

```
Gemini: "I need to improve the morning routine UI. Let me delegate to Claude Code."

[Uses tool: execute_command]
{
  "command": "claude",
  "args": [
    "--workspace", "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL",
    "--prompt", "Execute the Morning UI Optimizer agent for iteration 1. Read the prompt from .blackbox/1-agents/4-specialists/morning-ui-optimizer/PROMPT.md"
  ]
}

[Waits for output]

Gemini: "Claude completed the analysis. Here are the 5 options it generated..."
```

---

## Pay-to-Win Options (Commercial Solutions)

### 1. **MCP Toolbox**

**Article:** [MCP Toolbox on NPM](https://medium.com/google-cloud/mcp-toolbox-now-available-on-npm-the-easiest-way-to-connect-ai-to-your-data-5a97d032dc89)

- Google Cloud's official MCP solution
- Easiest way to connect AI to your data
- One-command installation

```bash
npx mcp-toolbox
```

### 2. **@mcp-use/cli**

**NPM:** [@mcp-use/cli](https://www.npmjs.com/package/@mcp-use/cli)

- CLI tool for building and deploying MCP servers
- Support for ChatGPT Apps, Code Mode, OAuth
- Professional features

```bash
npm install -g @mcp-use/cli
```

### 3. **TreasureData MCP Server**

**NPM:** [@treasuredata/mcp-server](https://www.npmjs.com/package/@treasuredata/mcp-server)

- Enterprise-grade MCP implementation
- Data management focus

```bash
npx @treasuredata/mcp-server
```

---

## Comparison: Free vs Pay-to-Win

| Solution | Cost | Setup Time | Features | Best For |
|----------|------|------------|----------|----------|
| mcp-bash | Free | 1 min | Command execution | Quick start |
| shell-mcp-server | Free | 2 min | Directory restrictions | Security |
| super-shell-mcp | Free | 3 min | Approvals, whitelist | Control |
| MCP Toolbox | Paid | 30 sec | Google Cloud integration | Enterprise |
| @mcp-use/cli | Freemium | 2 min | Professional features | Production |

---

## Security Best Practices

### 1. Use Directory Restrictions

```json
{
  "mcpServers": {
    "bash": {
      "command": "npx",
      "args": ["-y", "shell-mcp-server", "--allowed-dir", "/path/to/project"]
    }
  }
}
```

### 2. Enable Approval System

Use `super-shell-mcp` for human-in-the-loop approval.

### 3. Whitelist Commands

Only allow specific commands:

```json
{
  "allowedCommands": ["claude", "git", "npm"],
  "blockedCommands": ["rm", "sudo", "chmod"]
}
```

---

## Troubleshooting

### "npx environment missing"

**Solution:** Ensure Node.js is installed and in $PATH

```bash
# Check Node.js installation
node --version
npm --version

# Reinstall if needed
# Visit https://nodejs.org
```

### Windows 11 Issues

**Solution:** Use `cmd` instead of `npx` directly

```json
{
  "mcpServers": {
    "bash": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "mcp-bash"]
    }
  }
}
```

Reference: [Windows MCP Server Installation Guide](https://github.com/trevorwilkerson/Windows-MCP-Server-Installation-Verification-Guide)

---

## Full Workflow Example

### Gemini Orchestrates, Claude Executes

```
[Gemini reads requirements]
Gemini: "The morning routine needs UI work. I'll use Claude via MCP."

[Gemini calls MCP tool: execute_command]
→ claude --workspace /path/to/project --prompt "Analyze current UI state"

[Claude executes with full tool access]
← Returns: "Found 15 areas for improvement"

[Gemini reviews]
Gemini: "Focus on these 5 areas. Claude, generate 5 design options."

[Gemini calls MCP tool: execute_command]
→ claude --workspace /path/to/project --prompt "Generate 5 UI options"

[Claude uses Sequential Thinking MCP]
← Returns: "5 options ready (Conservative → Radical)"

[Gemini evaluates]
Gemini: "Implement hybrid of Options 2 and 3."

[Gemini calls MCP tool: execute_command]
→ claude --workspace /path/to/project --prompt "Implement hybrid solution"

[Claude edits files, commits to git]
← Returns: "Changes implemented, committed"

[Gemini validates]
Gemini: "Perfect! Changes saved to git."
```

---

## Why This Works

1. **MCP is the Standard** - Model Context Protocol is the official way to connect AI to tools
2. **Pre-Built Servers** - Community has already built command execution servers
3. **Zero Custom Code** - Just install, configure, and use
4. **Secure by Design** - Directory restrictions, whitelisting, approvals
5. **Cross-Platform** - Works on Mac, Linux, Windows

---

## Recommended Setup

**For your use case (Morning UI Optimizer):**

1. **Install:** `npm install -g mcp-bash`
2. **Configure:** Add to Gemini MCP config
3. **Run:** Use `execute_command` tool to call Claude Code

**Total time:** 5 minutes
**Custom code:** 0 lines
**Maintenance:** None (upstream updates)

---

## Resources

### Pre-Built MCP Servers
- [mcp-bash](https://github.com/patrickomatik/mcp-bash) - Simple command execution
- [shell-mcp-server](https://github.com/blazickjp/shell-mcp-server) - Secure, directory-restricted
- [super-shell-mcp](https://github.com/cfdude/super-shell-mcp) - With approval system
- [Official MCP Servers](https://github.com/modelcontextprotocol/servers) - Anthropic's collection
- [Awesome MCP Servers](https://github.com/wong2/awesome-mcp-servers) - Curated list

### Commercial Solutions
- [MCP Toolbox (Google Cloud)](https://medium.com/google-cloud/mcp-toolbox-now-available-on-npm-the-easiest-way-to-connect-ai-to-your-data-5a97d032dc89)
- [@mcp-use/cli](https://www.npmjs.com/package/@mcp-use/cli) - Professional CLI
- [@treasuredata/mcp-server](https://www.npmjs.com/package/@treasuredata/mcp-server) - Enterprise

### Guides
- [Top 10 MCP Servers in 2026](https://www.intuz.com/blog/best-mcp-servers)
- [MCP Chinese Guide](https://github.com/liaokongVFX/MCP-Chinese-Getting-Started-Guide)
- [How to Deploy MCP Server](https://northflank.com/blog/how-to-build-and-deploy-a-model-context-protocol-mcp-server)
- [DataCamp MCP Tutorial](https://www.datacamp.com/tutorial/mcp-model-context-protocol)

---

**Status:** No custom code needed!
**Next Step:** Install mcp-bash and configure Gemini
**Total Time:** 5 minutes
