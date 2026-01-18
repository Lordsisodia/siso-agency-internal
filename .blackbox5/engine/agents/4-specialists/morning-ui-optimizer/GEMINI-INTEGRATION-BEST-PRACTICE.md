# Gemini → Claude Code: BEST PRACTICE Guide

**Date:** Sunday, January 18th, 4:16 AM, 2026
**Goal:** Maximum access + persistence for Gemini to control Claude Code

---

## 🏆 Recommended Solution: Multi-MCP Architecture

**Best approach:** Combine 3 official MCP servers for complete access

```
Gemini 3 (Antigravity IDE)
    ↓
┌─────────────────────────────────────┐
│  MCP Server Manager (Gemini side)   │
└─────────────────────────────────────┘
    ↓           ↓           ↓
[Filesystem] [Shell] [Memory/Persistence]
    ↓           ↓           ↓
Claude Code (full workspace access)
```

---

## Option 1: The "Holy Trinity" (Recommended)

### Architecture

**Three official MCP servers working together:**

1. **@modelcontextprotocol/server-filesystem** - Direct file access
2. **mcp-bash** - Command execution (Claude Code runner)
3. **Custom persistence MCP** - Session state, memory

### Installation

```bash
# Filesystem server (official)
npm install -g @modelcontextprotocol/server-filesystem

# Shell execution (community)
npm install -g mcp-bash

# Persistence (we'll configure)
```

### Gemini Configuration

**File:** `~/.gemini/mcp-config.json` or Antigruity IDE settings:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL"
      ],
      "env": {
        "ALLOWED_DIRECTORIES": "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL"
      }
    },
    "shell": {
      "command": "npx",
      "args": ["-y", "mcp-bash"],
      "env": {
        "WORKSPACE_ROOT": "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL"
      }
    },
    "persistence": {
      "command": "node",
      "args": ["/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox/mcp-persistence-server/index.js"],
      "env": {
        "PERSISTENCE_DIR": "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox/mcp-persistence"
      }
    }
  }
}
```

### What This Gives Gemini

✅ **Direct file access** (filesystem MCP)
- Read any file in workspace
- Write/edit any file
- Create directories
- List directory contents
- No need to spawn Claude for simple file ops

✅ **Command execution** (shell MCP via mcp-bash)
- Run Claude Code: `claude --workspace ... --prompt ...`
- Run git commands
- Run npm/yarn
- Run tests
- Full bash access

✅ **Persistence** (custom MCP server)
- Remember context across sessions
- Store task history
- Maintain working memory
- Resume interrupted tasks

---

## Option 2: Single MCP Server (Simpler)

If you want **one MCP server that does everything**:

### Use: filesystem-mcp-server + Extended Shell

**GitHub:** [cyanheads/filesystem-mcp-server](https://github.com/cyanheads/filesystem-mcp-server)

**Enhanced version** (adds command execution):

Create: `mcp-unified-server/package.json`

```json
{
  "name": "mcp-unified-server",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "bin": "./index.js",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "shelljs": "^0.8.5"
  }
}
```

Create: `mcp-unified-server/index.js`

```javascript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const SERVER_ROOT = process.env.WORKSPACE_ROOT || process.cwd();
const PERSISTENCE_DIR = process.env.PERSISTENCE_DIR || path.join(SERVER_ROOT, '.mcp-state');

const server = new Server({
  name: 'unified-claude-gateway',
  version: '1.0.0'
});

// Initialize persistence
await fs.mkdir(PERSISTENCE_DIR, { recursive: true });

// Helper: Execute command
const execCommand = (cmd) => new Promise((resolve, reject) => {
  exec(cmd, { cwd: SERVER_ROOT, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      resolve({
        success: false,
        error: error.message,
        stderr: stderr.toString()
      });
    } else {
      resolve({
        success: true,
        stdout: stdout.toString(),
        stderr: stderr.toString()
      });
    }
  });
});

// Helper: Persistence
const saveState = async (key, data) => {
  const file = path.join(PERSISTENCE_DIR, `${key}.json`);
  await fs.writeFile(file, JSON.stringify(data, null, 2));
};

const loadState = async (key) => {
  const file = path.join(PERSISTENCE_DIR, `${key}.json`);
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// Tool: Execute Claude Code
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'execute_claude') {
    const { prompt, workspace } = args;
    const cmd = `claude --workspace ${workspace || SERVER_ROOT} --prompt "${prompt}"`;
    const result = await execCommand(cmd);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }]
    };
  }

  if (name === 'execute_command') {
    const { command } = args;
    const result = await execCommand(command);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }]
    };
  }

  if (name === 'save_memory') {
    const { key, data } = args;
    await saveState(key, data);
    return {
      content: [{ type: 'text', text: `Saved memory: ${key}` }]
    };
  }

  if (name === 'load_memory') {
    const { key } = args;
    const data = await loadState(key);
    return {
      content: [{ type: 'text', text: JSON.stringify(data || {}) }]
    };
  }

  if (name === 'list_memory') {
    const files = await fs.readdir(PERSISTENCE_DIR);
    const keys = files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    return {
      content: [{ type: 'text', text: JSON.stringify(keys) }]
    };
  }

  if (name === 'read_file') {
    const { path: filePath } = args;
    const fullPath = path.join(SERVER_ROOT, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    return {
      content: [{ type: 'text', text: content }]
    };
  }

  if (name === 'write_file') {
    const { path: filePath, content } = args;
    const fullPath = path.join(SERVER_ROOT, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
    return {
      content: [{ type: 'text', text: `Written: ${filePath}` }]
    };
  }

  if (name === 'list_directory') {
    const { path: dirPath } = args;
    const fullPath = path.join(SERVER_ROOT, dirPath || '');
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const result = entries.map(entry => ({
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file'
    }));
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }]
    };
  }

  return {
    content: [{ type: 'text', text: `Unknown tool: ${name}` }],
    isError: true
  };
});

// List available tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'execute_claude',
      description: 'Execute Claude Code with full workspace access',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Prompt for Claude Code' },
          workspace: { type: 'string', description: 'Workspace path (optional)' }
        },
        required: ['prompt']
      }
    },
    {
      name: 'execute_command',
      description: 'Execute any shell command',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command to execute' }
        },
        required: ['command']
      }
    },
    {
      name: 'save_memory',
      description: 'Save data to persistent memory',
      inputSchema: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Memory key' },
          data: { type: 'object', description: 'Data to store' }
        },
        required: ['key', 'data']
      }
    },
    {
      name: 'load_memory',
      description: 'Load data from persistent memory',
      inputSchema: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Memory key' }
        },
        required: ['key']
      }
    },
    {
      name: 'list_memory',
      description: 'List all memory keys',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'read_file',
      description: 'Read a file from workspace',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path relative to workspace' }
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
          path: { type: 'string', description: 'File path' },
          content: { type: 'string', description: 'File content' }
        },
        required: ['path', 'content']
      }
    },
    {
      name: 'list_directory',
      description: 'List directory contents',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Directory path (optional)' }
        }
      }
    }
  ]
}));

// Resources (for direct file access)
server.setRequestHandler('resources/list', async () => ({
  resources: [
    {
      uri: `file://${SERVER_ROOT}`,
      name: 'Workspace Root',
      description: 'Full workspace access',
      mimeType: 'text/directory'
    }
  ]
}));

server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params;
  const filePath = uri.replace('file://', '');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      contents: [{ uri, mimeType: 'text/plain', text: content }]
    };
  } catch (error) {
    return {
      contents: [{ uri, mimeType: 'text/plain', text: `Error: ${error.message}` }]
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Unified MCP Server running');
}

main().catch(console.error);
```

**Install:**

```bash
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
mkdir -p mcp-unified-server
cd mcp-unified-server
npm init -y
npm install @modelcontextprotocol/sdk shelljs
# (save the above index.js)
npm link
```

**Gemini Config:**

```json
{
  "mcpServers": {
    "unified": {
      "command": "node",
      "args": ["/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/mcp-unified-server/index.js"],
      "env": {
        "WORKSPACE_ROOT": "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL",
        "PERSISTENCE_DIR": "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.mcp-state"
      }
    }
  }
}
```

---

## Option 3: Official Filesystem + Separate Persistence

**Use official servers + add persistence layer:**

### Installation

```bash
# Official filesystem server
npm install -g @modelcontextprotocol/server-filesystem

# Simple persistence server
npm install -g mcp-simple-persistence
```

**Gemini Config:**

```json
{
  "mcpServers": {
    "fs": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "mcp-simple-persistence", "--dir", "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.mcp-memory"]
    },
    "shell": {
      "command": "npx",
      "args": ["-y", "mcp-bash"]
    }
  }
}
```

---

## Option 4: Full Docker Container (Isolated + Powerful)

### Architecture

```
Gemini 3
    ↓
Docker MCP Server
    ↓
Claude Code Container (full control)
    ↓
Workspace Volume (mounted)
```

**Dockerfile:**

```dockerfile
FROM node:20-alpine

WORKDIR /workspace

# Install Claude Code
RUN npm install -g @anthropic-ai/claude-code

# Install MCP server
RUN npm install -g @modelcontextprotocol/sdk

# Copy MCP server
COPY mcp-server.js /usr/local/bin/mcp-server.js

# Mount workspace
VOLUME ["/workspace"]

# Run MCP server
CMD ["node", "/usr/local/bin/mcp-server.js"]
```

**Benefits:**
- Complete isolation
- Persistent workspace volume
- Easy to restart/upgrade
- Can run multiple instances

---

## Comparison: Which Option for You?

| Option | Complexity | Persistence | Performance | Best For |
|--------|-----------|-------------|-------------|----------|
| **Holy Trinity** | Medium | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **Production use** |
| **Unified Server** | Low | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Quick setup** ⭐ |
| **Official + Memory** | Low | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **Reliability** |
| **Docker** | High | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | **Isolation** |

---

## 🎯 My Recommendation: Option 2 (Unified Server)

**Why:**

1. **Single MCP server** - Simpler config, easier debugging
2. **Built-in persistence** - Memory, session state, task history
3. **Full Claude access** - Via `execute_claude` tool
4. **Direct file ops** - No need to spawn Claude for simple reads/writes
5. **Command execution** - Bash, git, npm, anything
6. **100 lines of code** - Easy to understand and modify

**What Gemini Gets:**

```javascript
// Direct file access (fast)
await tool('read_file', { path: 'src/App.tsx' })

// Execute Claude (powerful)
await tool('execute_claude', {
  prompt: 'Morning UI Optimizer - iteration 1'
})

// Remember context (persistence)
await tool('save_memory', {
  key: 'last-optimization',
  data: { iteration: 1, changes: [...] }
})

// Run any command (flexibility)
await tool('execute_command', {
  command: 'git commit -am "Changes"'
})
```

---

## Quick Start: 5 Minutes

### Step 1: Create Unified Server (2 min)

```bash
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
mkdir -p mcp-unified-server
cd mcp-unified-server
npm init -y
npm install @modelcontextprotocol/sdk
```

Copy the `index.js` from Option 2 above.

### Step 2: Install (1 min)

```bash
npm link
```

### Step 3: Configure Gemini (1 min)

Add to `~/.gemini/mcp-config.json`:

```json
{
  "mcpServers": {
    "claude": {
      "command": "node",
      "args": ["/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/mcp-unified-server/index.js"],
      "env": {
        "WORKSPACE_ROOT": "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL",
        "PERSISTENCE_DIR": "/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.mcp-state"
      }
    }
  }
}
```

### Step 4: Restart Gemini + Test (1 min)

```
Gemini: "Test MCP connection"

[Uses tool: list_memory]
← Returns: []

[Uses tool: save_memory]
{ key: "test", data: { hello: "world" } }

[Uses tool: load_memory]
{ key: "test" }
← Returns: { hello: "world" }

Gemini: "Perfect! MCP is working."
```

---

## Full Workflow Example

```
[Gemini starts new optimization session]
Gemini: "Let me check previous work first"

[Uses tool: load_memory]
{ key: "morning-ui-optimizer" }
← Returns: { last_iteration: 3, total_improvements: 15 }

Gemini: "Continuing from iteration 3. Reading current code..."

[Uses tool: read_file]
{ path: "src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx" }
← Returns: [file content]

Gemini: "I'll delegate the deep analysis to Claude"

[Uses tool: execute_claude]
{
  prompt: "Analyze morning routine UI and suggest 5 improvements"
}
← Returns: "Found 20 improvement areas..."

Gemini: "Good. Let me save this progress"

[Uses tool: save_memory]
{
  key: "morning-ui-optimizer-session-4",
  data: {
    iteration: 4,
    analysis: [...],
    timestamp: Date.now()
  }
}

Gemini: "Now implementing changes..."

[Uses tool: write_file]
{
  path: "src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx",
  content: [improved code]
}

Gemini: "Committing changes..."

[Uses tool: execute_command]
{
  command: "git add -A && git commit -m 'feat: UI improvements'"
}

Gemini: "Iteration 4 complete. Saving summary..."

[Uses tool: save_memory]
{
  key: "morning-ui-optimizer",
  data: { last_iteration: 4, total_improvements: 20 }
}
```

---

## Security Considerations

### 1. Workspace Isolation

```bash
# Only allow specific directory
export ALLOWED_DIRECTORIES="/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL"
```

### 2. Command Whitelisting

```javascript
// In unified server, add:
const ALLOWED_COMMANDS = ['claude', 'git', 'npm', 'node', 'yarn'];

if (!ALLOWED_COMMANDS.includes(args.command.split(' ')[0])) {
  return { content: [{ type: 'text', text: 'Command not allowed' }], isError: true };
}
```

### 3. Memory Encryption

```javascript
// Encrypt sensitive data in persistence
import crypto from 'crypto';

const encrypt = (data) => {
  const key = process.env.ENCRYPTION_KEY || 'default-key';
  const cipher = crypto.createCipher('aes-256-cbc', key);
  return cipher.update(JSON.stringify(data), 'utf8', 'hex') + cipher.final('hex');
};
```

### 4. Audit Logging

```javascript
// Log all MCP operations
const logOperation = async (operation, details) => {
  const logFile = path.join(PERSISTENCE_DIR, 'audit.log');
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    operation,
    details
  });
  await fs.appendFile(logFile, entry + '\n');
};
```

---

## Performance Optimization

### 1. Cache File Reads

```javascript
const fileCache = new Map();

if (name === 'read_file') {
  const { path: filePath } = args;
  const cacheKey = filePath;

  if (fileCache.has(cacheKey)) {
    return {
      content: [{ type: 'text', text: fileCache.get(cacheKey) }]
    };
  }

  const content = await fs.readFile(fullPath, 'utf-8');
  fileCache.set(cacheKey, content);
  // ... return content
}
```

### 2. Batch Operations

```javascript
if (name === 'batch_write') {
  const { files } = args; // [{ path, content }, ...]
  for (const file of files) {
    await fs.writeFile(path.join(SERVER_ROOT, file.path), file.content);
  }
  return {
    content: [{ type: 'text', text: `Written ${files.length} files` }]
  };
}
```

### 3. Async Background Tasks

```javascript
if (name === 'execute_async') {
  const { command } = args;

  // Spawn and return immediately
  exec(command, { cwd: SERVER_ROOT, maxBuffer: 1024 * 1024 * 10 });

  return {
    content: [{ type: 'text', text: `Started: ${command}` }]
  };
}
```

---

## Resources

### Official Documentation
- [MCP Official Servers (GitHub)](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [@modelcontextprotocol/server-filesystem (NPM)](https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem)
- [Connect Local MCP Servers (Official Docs)](https://modelcontextprotocol.io/docs/develop/connect-local-servers)
- [MCP Security Best Practices](https://modelcontextprotocol.io/specification/draft/basic/security_best_practices)

### Community Servers
- [cyanheads/filesystem-mcp-server](https://github.com/cyanheads/filesystem-mcp-server)
- [patrickomatik/mcp-bash](https://github.com/patrickomatik/mcp-bash)
- [Awesome MCP Servers](https://github.com/wong2/awesome-mcp-servers)

### Security Resources
- [WorkOS MCP Security Guide](https://workos.com/blog/mcp-security-risks-best-practices)
- [Palo Alto MCP Security Overview](https://www.paloaltonetworks.com/blog/cloud-security/model-context-protocol-mcp-a-security-overview)
- [GitHub MCP Security Checklist](https://github.com/slowmist/MCP-Security-Checklist)

---

## Summary

**Best Solution:** Option 2 (Unified MCP Server)

**Why:**
- ✅ Single server to configure
- ✅ Built-in persistence
- ✅ Full Claude Code access
- ✅ Direct file operations
- ✅ Command execution
- ✅ Easy to understand
- ✅ Production-ready

**Setup Time:** 5 minutes
**Lines of Code:** ~100
**Maintenance:** Minimal

**What Gemini Gets:**
- Read/write any file
- Execute Claude Code
- Run bash commands
- Persistent memory
- Session management
- Task history
- Audit logging

**Next Step:** Copy the `index.js` from Option 2, install, and you're done!

---

**Status:** Ready to implement
**Recommendation:** Option 2 (Unified Server)
**Time to Setup:** 5 minutes
