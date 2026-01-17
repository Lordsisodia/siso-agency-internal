#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_ROOT = process.env.WORKSPACE_ROOT || path.join(__dirname, '..');
const PERSISTENCE_DIR = process.env.PERSISTENCE_DIR || path.join(SERVER_ROOT, '.mcp-state');

const server = new Server({
  name: 'unified-claude-gateway',
  version: '1.0.0'
});

// Initialize persistence
await fs.mkdir(PERSISTENCE_DIR, { recursive: true });

// Helper: Execute command
const execCommand = (cmd) => new Promise((resolve) => {
  exec(cmd, { cwd: SERVER_ROOT, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    resolve({
      success: !error,
      output: stdout?.toString() || '',
      error: error?.message || stderr?.toString() || null,
      exitCode: error ? 1 : 0
    });
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

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Execute Claude Code
    if (name === 'execute_claude') {
      const { prompt, workspace } = args;
      const ws = workspace || SERVER_ROOT;
      const cmd = `cd "${ws}" && claude --prompt "${prompt.replace(/"/g, '\\"')}"`;
      const result = await execCommand(cmd);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    }

    // Execute any command
    if (name === 'execute_command') {
      const { command } = args;
      const result = await execCommand(command);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    }

    // Save to memory
    if (name === 'save_memory') {
      const { key, data } = args;
      await saveState(key, data);
      return {
        content: [{ type: 'text', text: `✅ Saved memory: ${key}` }]
      };
    }

    // Load from memory
    if (name === 'load_memory') {
      const { key } = args;
      const data = await loadState(key);
      return {
        content: [{ type: 'text', text: JSON.stringify(data || {}, null, 2) }]
      };
    }

    // List all memory keys
    if (name === 'list_memory') {
      const files = await fs.readdir(PERSISTENCE_DIR);
      const keys = files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
      return {
        content: [{ type: 'text', text: JSON.stringify(keys, null, 2) }]
      };
    }

    // Read file
    if (name === 'read_file') {
      const { path: filePath } = args;
      const fullPath = path.join(SERVER_ROOT, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return {
        content: [{ type: 'text', text: content }]
      };
    }

    // Write file
    if (name === 'write_file') {
      const { path: filePath, content } = args;
      const fullPath = path.join(SERVER_ROOT, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');
      return {
        content: [{ type: 'text', text: `✅ Written: ${filePath}` }]
      };
    }

    // List directory
    if (name === 'list_directory') {
      const { path: dirPath } = args;
      const fullPath = path.join(SERVER_ROOT, dirPath || '');
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      const result = entries.map(entry => ({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file'
      }));
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    }

    return {
      content: [{ type: 'text', text: `❌ Unknown tool: ${name}` }],
      isError: true
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `❌ Error: ${error.message}` }],
      isError: true
    };
  }
});

// List available tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'execute_claude',
      description: 'Execute Claude Code with full workspace access. Use this for complex tasks requiring AI reasoning.',
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
      description: 'Execute any shell command (bash, git, npm, etc.)',
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
      description: 'Save data to persistent memory (survives restarts)',
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
        properties: {},
        required: []
      }
    },
    {
      name: 'read_file',
      description: 'Read a file from workspace',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path' }
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
        },
        required: []
      }
    }
  ]
}));

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('✅ Unified MCP Server running');
  console.error(`📁 Workspace: ${SERVER_ROOT}`);
  console.error(`💾 Persistence: ${PERSISTENCE_DIR}`);
}

main().catch(console.error);
