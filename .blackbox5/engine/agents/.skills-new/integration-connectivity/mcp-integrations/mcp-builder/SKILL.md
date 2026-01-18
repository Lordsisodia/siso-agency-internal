---
name: mcp-builder
category: mcp
version: 1.0.0
description: Build custom Model Context Protocol servers to extend Claude's capabilities
author: anthropics/skills
verified: true
tags: [mcp, integration, development, api]
---

# MCP Builder

## Overview
Create high-quality Model Context Protocol (MCP) servers that integrate Claude with external tools, APIs, and data sources.

## When to Use This Skill
✅ Building custom tool integrations for Claude
✅ Connecting Claude to internal APIs or databases
✅ Creating reusable Claude capabilities
✅ Extending Claude with external data sources

## MCP Server Structure

### Basic Package Structure
```
my-mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts      # Main server entry point
│   └── tools/        # Tool implementations
└── README.md
```

### Minimal Server Example
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "my-server",
  version: "1.0.0"
});

// Define a tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "my-tool") {
    return {
      content: [{
        type: "text",
        text: "Tool result here"
      }]
    };
  }
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: "my-tool",
      description: "Does something useful",
      inputSchema: {
        type: "object",
        properties: {
          param: { type: "string" }
        }
      }
    }]
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

## Best Practices

### Tool Design
- **Single responsibility**: Each tool does one thing well
- **Clear inputs**: Use JSON Schema for validation
- **Helpful errors**: Return actionable error messages
- **Idempotent when possible**: Safe to retry

### Error Handling
```typescript
try {
  const result = await externalApiCall(params);
  return { content: [{ type: "text", text: result }] };
} catch (error) {
  return {
    content: [{
      type: "text",
      text: `Error: ${error.message}. Check API key and permissions.`
    }],
    isError: true
  };
}
```

### Resource Management
- Close connections properly
- Use timeouts for external calls
- Handle rate limiting gracefully
- Log important operations

## Common MCP Patterns

### API Integration
```typescript
// Weather API example
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get-weather") {
    const location = request.params.arguments?.location;
    const weather = await weatherAPI.get(location);
    return {
      content: [{
        type: "text",
        text: `Weather in ${location}: ${weather.temp}°F`
      }]
    };
  }
});
```

### Database Queries
```typescript
// Database query example
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "query-db") {
    const query = request.params.arguments?.query;
    const results = await db.execute(query);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(results, null, 2)
      }]
    };
  }
});
```

## Testing Your MCP Server

### Manual Testing
```bash
# Run server
node build/index.js

# Test from Claude Code
# "Use the get-weather tool for San Francisco"
```

### Integration Testing
Create test configuration in MCP client settings:
```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/server/build/index.js"]
    }
  }
}
```

## Security Considerations
- Validate all input parameters
- Sanitize data before external API calls
- Use environment variables for secrets
- Implement rate limiting
- Never log sensitive data
- Use authentication for protected resources

## Integration with Claude
When building MCP servers, say:
- "Help me create an MCP server for [API/service]"
- "Add a tool to my MCP server that [does X]"
- "Debug my MCP server implementation"

Claude will:
- Structure the server correctly
- Implement tool handlers
- Add proper error handling
- Write JSON Schema for inputs
- Create documentation
