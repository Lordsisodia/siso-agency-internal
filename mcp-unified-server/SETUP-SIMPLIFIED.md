# ✅ MCP Server Setup - Simplified Approach

## Issue Found

The custom MCP server has compatibility issues with the current MCP SDK.
**Solution:** Use the pre-built `mcp-bash` server instead!

---

## Recommended Setup: Use Pre-Built mcp-bash

This is the **simplest, most reliable** approach:

### Step 1: Install mcp-bash

```bash
npm install -g mcp-bash
```

### Step 2: Configure Gemini

Create or edit this file: `~/.gemini-mcp-config.json`

```json
{
  "mcpServers": {
    "claude": {
      "command": "npx",
      "args": ["-y", "mcp-bash"],
      "env": {
        "WORKSPACE": "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL"
      }
    }
  }
}
```

### Step 3: Restart Gemini Antigravity IDE

Close and reopen the IDE to load the MCP server.

---

## What Gemini Gets With mcp-bash

Gemini can execute **any command**, including:

```javascript
// Run Claude Code
execute_command("claude --prompt 'Morning UI Optimizer iteration 1'")

// Read files
execute_command("cat src/App.tsx")

// Write files
execute_command("echo 'content' > file.txt")

// Git operations
execute_command("git add -A && git commit -m 'changes'")

// NPM commands
execute_command("npm install")

// Anything!
execute_command("any command you want")
```

---

## Alternative: Use Official Filesystem Server

For more control, combine multiple servers:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL"
      ]
    },
    "shell": {
      "command": "npx",
      "args": ["-y", "mcp-bash"]
    }
  }
}
```

This gives Gemini:
- Direct file read/write (filesystem MCP)
- Command execution (mcp-bash)

---

## Quick Test

Once configured, test in Gemini:

```
Gemini: "Test MCP connection"

[Uses tool: execute_command]
{ command: "echo 'Hello from MCP!' && pwd" }

Expected output:
{ success: true, output: "Hello from MCP!\n/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL" }
```

---

## Running Morning UI Optimizer

Once MCP is working:

```
Gemini: "I want to run the Morning UI Optimizer. Let me execute it."

[Uses tool: execute_command]
{
  command: "claude --prompt 'Read .blackbox/1-agents/4-specialists/morning-ui-optimizer/PROMPT.md and execute the Morning UI Optimizer agent for iteration 1'"
}
```

---

## Why This Approach

| Factor | Custom Server | mcp-bash |
|--------|--------------|----------|
| Setup Time | 30+ min | **2 min** ✅ |
| Complexity | High (100+ lines) | **Zero code** ✅ |
| Maintenance | You maintain it | **Upstream maintains** ✅ |
| Reliability | SDK issues | **Battle-tested** ✅ |
| Features | Custom | **Everything needed** ✅ |

---

## Status

✅ **Approach:** Use pre-built `mcp-bash` server
✅ **Setup Time:** 2 minutes
✅ **Reliability:** Production-ready
✅ **Maintenance:** None (upstream)

**Next:** Install mcp-bash and configure Gemini!

---

## Resources

- [mcp-bash GitHub](https://github.com/patrickomatik/mcp-bash)
- [Official MCP Servers](https://github.com/modelcontextprotocol/servers)
- [Awesome MCP Servers](https://github.com/wong2/awesome-mcp-servers)
