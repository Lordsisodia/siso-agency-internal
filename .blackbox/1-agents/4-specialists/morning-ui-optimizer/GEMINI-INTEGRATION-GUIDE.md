# Gemini to Claude Code Integration Guide

**Date:** Sunday, January 18th, 4:16 AM, 2026
**Purpose:** Enable Google's Gemini 3 (Antigravity IDE) to offload compute to Claude Code via MCP

---

## Overview

Yes! There are several ways to integrate Gemini with Claude Code using the Model Context Protocol (MCP). This enables Gemini to act as an orchestrator that delegates complex tasks to Claude Code for execution.

---

## Approach 1: REST API Wrapper MCP Server (Recommended)

### Architecture

```
Gemini 3 (Antigravity IDE)
    ↓ HTTP REST API
MCP Server (REST Wrapper)
    ↓ MCP Protocol
Claude Code (with MCP tools)
```

### Implementation

Create a simple REST API that wraps Claude Code capabilities:

**server.js** (Node.js/Express):
```javascript
import express from 'express';
import { spawn } from 'child_process';

const app = express();
app.use(express.json());

// Queue for Claude Code tasks
const taskQueue = [];
const results = new Map();

// Endpoint for Gemini to submit tasks
app.post('/api/claude-task', async (req, res) => {
  const { taskId, prompt, files, tools } = req.body;

  // Spawn Claude Code process
  const claude = spawn('claude', ['--prompt', prompt]);

  let output = '';
  claude.stdout.on('data', (data) => {
    output += data.toString();
  });

  claude.on('close', (code) => {
    results.set(taskId, {
      success: code === 0,
      output,
      timestamp: new Date().toISOString()
    });
  });

  res.json({ status: 'queued', taskId });
});

// Endpoint for Gemini to check results
app.get('/api/claude-task/:taskId', (req, res) => {
  const result = results.get(req.params.taskId);
  if (result) {
    res.json(result);
  } else {
    res.json({ status: 'processing' });
  }
});

app.listen(3000, () => {
  console.log('MCP REST Server running on port 3000');
});
```

### Gemini Usage

In Gemini (Antigravity IDE), you can then call:

```javascript
// Gemini prompts Claude Code
const response = await fetch('http://localhost:3000/api/claude-task', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskId: 'morning-ui-iteration-1',
    prompt: `Run the Morning UI Optimizer agent for iteration 1...`,
    tools: ['sequential-thinking', 'supabase', 'chrome-devtools'],
    files: ['.blackbox/1-agents/4-specialists/morning-ui-optimizer/PROMPT.md']
  })
});

// Poll for results
const result = await fetch(`/api/claude-task/morning-ui-iteration-1`);
const data = await result.json();
```

---

## Approach 2: Remote MCP Server

### Architecture

```
Gemini 3 (Antigravity IDE)
    ↓ Remote MCP Connection
MCP Server (Claude Code Gateway)
    ↓ Local MCP
Claude Code (with file access)
```

### Implementation

Based on [Atlassian's Remote MCP Server](https://www.atlassian.com/blog/announcements/remote-mcp-server) and [Cloudflare's Remote MCP Guide](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/):

**mcp-server-claude-gateway/package.json**:
```json
{
  "name": "mcp-server-claude-gateway",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "bin": {
    "mcp-server-claude-gateway": "./index.js"
  }
}
```

**mcp-server-claude-gateway/index.js**:
```javascript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { spawn } from 'child_process';

const server = new Server({
  name: 'claude-code-gateway',
  version: '1.0.0'
});

// Tool: Execute Claude Code task
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'execute_claude_task') {
    const { prompt, workspace } = args;

    return new Promise((resolve) => {
      const claude = spawn('claude', ['--workspace', workspace, '--prompt', prompt]);

      let output = '';
      let error = '';

      claude.stdout.on('data', (data) => {
        output += data.toString();
      });

      claude.stderr.on('data', (data) => {
        error += data.toString();
      });

      claude.on('close', (code) => {
        resolve({
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: code === 0,
              output,
              error: error || null,
              exitCode: code
            })
          }]
        });
      });
    });
  }
});

// List available tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'execute_claude_task',
      description: 'Execute a Claude Code task with full access to workspace',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The prompt to send to Claude Code'
          },
          workspace: {
            type: 'string',
            description: 'Path to the workspace directory'
          }
        },
        required: ['prompt', 'workspace']
      }
    },
    {
      name: 'read_file',
      description: 'Read a file from the workspace',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to the file'
          }
        },
        required: ['path']
      }
    },
    {
      name: 'write_file',
      description: 'Write content to a file',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to the file'
          },
          content: {
            type: 'string',
            description: 'Content to write'
          }
        },
        required: ['path', 'content']
      }
    }
  ]
}));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

### Gemini Configuration

Configure Antigravity IDE to connect to this MCP server:

**.gemini-mcp-config.json**:
```json
{
  "mcpServers": {
    "claude-code-gateway": {
      "command": "node",
      "args": ["/path/to/mcp-server-claude-gateway/index.js"],
      "env": {
        "CLAUDE_CODE_PATH": "/usr/local/bin/claude"
      }
    }
  }
}
```

### Usage in Gemini

```
Gemini: "I need to run the Morning UI Optimizer. Let me delegate this to Claude Code."

[Uses MCP tool: execute_claude_task]
{
  "prompt": "Run the Morning UI Optimizer agent - iteration 1",
  "workspace": "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL"
}

[Receives Claude Code output]
"Gemini: Claude Code completed the optimization. Here's what changed..."
```

---

## Approach 3: Claude Code as MCP Server (Native)

### Architecture

```
Gemini 3 (Antigravity IDE)
    ↓ SSE/WebSocket
Claude Code MCP Server (native)
    ↓ Direct tool access
Filesystem, Git, etc.
```

### Implementation

Claude Code can be extended to act as an MCP server directly. This requires contributing to the Claude Code project to add MCP server mode.

**Feature Request** for Claude Code:
```yaml
feature: "MCP Server Mode"
description: "Run Claude Code as an MCP server that other AI systems can connect to"
implementation:
  - Add --mcp-server flag
  - Expose tools via MCP protocol
  - Support SSE/WebSocket transport
  - Allow remote connections with auth
tools:
  - filesystem (read, write, edit)
  - git (commit, push, pull)
  - bash (command execution)
  - sequential-thinking (reasoning)
  - custom workspace tools
```

### Gemini Usage

If Claude Code supports MCP server mode:

```javascript
// Gemini connects to Claude Code MCP server
const mcpClient = new MCPClient('ws://localhost:6900');

const result = await mcpClient.callTool('execute_task', {
  prompt: 'Morning UI Optimizer iteration 1',
  workspace: '/path/to/project'
});
```

---

## Approach 4: File-Based Coordination (Simplest)

### Architecture

```
Gemini 3
    ↓ Write task file
Shared Directory
    ↓ Read task file
Claude Code (watching)
    ↓ Write result file
Shared Directory
    ↓ Read result
Gemini 3
```

### Implementation

**Gemini side** (Antigravity IDE extension):
```javascript
// Write task file
await fs.writeFile(
  '/shared/tasks/morning-ui-iteration-1.json',
  JSON.stringify({
    id: 'morning-ui-iteration-1',
    prompt: 'Run Morning UI Optimizer',
    workspace: '/path/to/project',
    timestamp: Date.now()
  })
);

// Watch for result
const watcher = fs.watch('/shared/results/', async (eventType, filename) => {
  if (filename === 'morning-ui-iteration-1.json') {
    const result = JSON.parse(
      await fs.readFile('/shared/results/morning-ui-iteration-1.json')
    );
    console.log('Claude Code completed:', result);
  }
});
```

**Claude Code side** (watch script):
```bash
#!/bin/bash
# claude-watcher.sh

while true; do
  for task in /shared/tasks/*.json; do
    if [ -f "$task" ]; then
      # Execute task
      WORKSPACE=$(jq -r '.workspace' "$task")
      PROMPT=$(jq -r '.prompt' "$task")
      TASK_ID=$(jq -r '.id' "$task")

      # Run Claude Code
      claude --workspace "$WORKSPACE" --prompt "$PROMPT" \
        > "/shared/results/$TASK_ID.json" 2>&1

      # Remove task
      rm "$task"
    fi
  done
  sleep 1
done
```

---

## Comparison

| Approach | Complexity | Latency | Reliability | Best For |
|----------|-----------|---------|-------------|----------|
| REST API Wrapper | Medium | Medium | High | Quick integration |
| Remote MCP Server | High | Low | High | Production use |
| Claude Code MCP Server | Very High | Lowest | Highest | Native integration |
| File-Based | Low | High | Medium | Testing/PoC |

---

## Recommended Setup

For your use case (Morning UI Optimizer), I recommend **Approach 2: Remote MCP Server** because:

1. **Standard protocol** - Uses official MCP SDK
2. **Secure** - Can add authentication
3. **Flexible** - Gemini stays in control
4. **Observable** - Can log all interactions
5. **Scalable** - Can add more Claude Code workers

---

## Step-by-Step: Implementing Approach 2

### Step 1: Create MCP Server

```bash
mkdir -p mcp-server-claude-gateway
cd mcp-server-claude-gateway
npm init -y
npm install @modelcontextprotocol/sdk
```

### Step 2: Implement the server (code above)

### Step 3: Configure Gemini Antigravity IDE

Add to your Antigravity IDE settings:

```json
{
  "mcp.servers": {
    "claude-code": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-claude-gateway/index.js"]
    }
  }
}
```

### Step 4: Test from Gemini

```
Gemini: "Test connection to Claude Code"
[Uses tool: execute_claude_task]
{
  "prompt": "Echo 'Hello from Gemini'",
  "workspace": "/tmp"
}
```

### Step 5: Run Morning UI Optimizer

```
Gemini: "I want to improve the morning routine UI. Let me use Claude Code for this."

[Uses tool: execute_claude_task]
{
  "prompt": "Read .blackbox/1-agents/4-specialists/morning-ui-optimizer/PROMPT.md and execute the Morning UI Optimizer agent - iteration 1",
  "workspace": "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL"
}

[Receives detailed analysis, options, implementation]

Gemini: "Claude Code has analyzed the UI and proposed 5 options. Based on this, I recommend the hybrid approach. Let me have Claude implement it..."

[Uses tool: execute_claude_task]
{
  "prompt": "Implement Option 3 (Moderate) with elements from Option 4. Focus on removing redundant elements and consolidating stats.",
  "workspace": "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL"
}
```

---

## Security Considerations

1. **Authentication** - Add API keys to the MCP server
2. **Sandboxing** - Run Claude Code in isolated environments
3. **Rate Limiting** - Prevent abuse
4. **Audit Logging** - Log all Claude Code executions
5. **Workspace Restrictions** - Limit accessible directories

---

## Performance Optimization

1. **Persistent Claude Code Process** - Keep Claude Code running
2. **Task Queue** - Queue multiple requests
3. **Caching** - Cache file reads
4. **Parallel Workers** - Multiple Claude Code instances
5. **Streaming** - Stream output back to Gemini

---

## Example: Full Integration

**Gemini orchestrates, Claude executes:**

```
[Gemini analyzes requirements]
Gemini: "The morning routine needs UI improvements. I'll delegate this to Claude Code."

[Gemini calls Claude via MCP]
→ execute_claude_task({
    prompt: "Morning UI Optimizer - analyze current state",
    workspace: "/path/to/project"
  })

[Claude analyzes code with sequential-thinking]
← Returns: "Found 15 areas for improvement"

[Gemini reviews and prioritizes]
Gemini: "Focus on these 5: wake-up display, stats, chart, labels, spacing"

[Gemini calls Claude via MCP]
→ execute_claude_task({
    prompt: "Generate 5 design options for these 5 areas",
    workspace: "/path/to/project"
  })

[Claude generates options]
← Returns: "5 options ready (Conservative → Radical)"

[Gemini evaluates and selects]
Gemini: "Go with hybrid of Options 2 and 3"

[Gemini calls Claude via MCP]
→ execute_claude_task({
    prompt: "Implement hybrid solution from Options 2 and 3",
    workspace: "/path/to/project"
  })

[Claude implements changes]
← Returns: "Changes implemented, committed to git"

[Gemini validates]
Gemini: "Excellent. Let me verify with screenshots..."
```

---

## Resources

- [MCP Protocol Guide (2026)](https://www.pythonalchemist.com/blog/mcp-protocol)
- [Atlassian's Remote MCP Server](https://www.atlassian.com/blog/announcements/remote-mcp-server)
- [Cloudflare Remote MCP Servers](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/)
- [Azure API Management as MCP Server](https://learn.microsoft.com/en-us/azure/api-management/export-rest-mcp-server)
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)

---

**Status:** Ready for implementation
**Next Step:** Choose approach and implement MCP server
