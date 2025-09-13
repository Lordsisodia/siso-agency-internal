#!/usr/bin/env node

/**
 * Manual MCP Test - Direct communication test
 */

import { spawn } from 'child_process';

console.log('🧪 Testing Codex MCP Server Directly\n');

// Test the exact command that's configured
const child = spawn('codex', ['mcp', '-c', 'model=gpt-5', '-c', 'model_reasoning_effort=high'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send an MCP initialization message
const initMessage = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {
      roots: {
        listChanged: true
      }
    },
    clientInfo: {
      name: "test-client",
      version: "1.0.0"
    }
  }
}) + '\n';

console.log('Sending initialization message...');
child.stdin.write(initMessage);

let output = '';
let errorOutput = '';

child.stdout.on('data', (data) => {
  output += data.toString();
  console.log('STDOUT:', data.toString());
});

child.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('STDERR:', data.toString());
});

child.on('close', (code) => {
  console.log(`\n📊 Test Results:`);
  console.log(`Exit code: ${code}`);
  console.log(`Stdout length: ${output.length} chars`);
  console.log(`Stderr length: ${errorOutput.length} chars`);
  
  if (code === 0 || output.length > 0) {
    console.log('✅ Codex MCP server is responding');
  } else {
    console.log('❌ Codex MCP server not working properly');
  }
});

// Kill after 10 seconds to prevent hanging
setTimeout(() => {
  child.kill();
  console.log('\n⏰ Test timed out after 10 seconds');
}, 10000);