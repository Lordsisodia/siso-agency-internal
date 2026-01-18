---
name: mcp-builder
category: integration-connectivity/mcp-integrations
version: 1.0.0
description: Build custom Model Context Protocol servers to extend Claude's capabilities
author: blackbox5/mcp
verified: true
tags: [mcp, integration, development, api]
---

# MCP Builder

<context>
Create high-quality Model Context Protocol (MCP) servers that integrate Claude with external tools, APIs, and data sources.

**When to Use:**
- Building custom tool integrations for Claude
- Connecting Claude to internal APIs or databases
- Creating reusable Claude capabilities
- Extending Claude with external data sources
</context>

<instructions>
When building MCP servers, follow the standard MCP SDK patterns. Use TypeScript for type safety, implement proper error handling, and document all tools clearly.

Each tool should have a single responsibility, clear JSON Schema validation, and helpful error messages.
</instructions>

<workflow>
  <phase name="Server Structure">
    <goal>Set up basic MCP server foundation</goal>
    <steps>
      <step>Initialize project with package.json</step>
      <step>Install MCP SDK dependencies</step>
      <step>Create main server entry point</step>
      <step>Configure transport layer (stdio or SSE)</step>
    </steps>
  </phase>

  <phase name="Tool Implementation">
    <goal>Define and implement server tools</goal>
    <steps>
      <step>Define tool with name and description</step>
      <step>Create JSON Schema for input validation</step>
      <step>Implement tool handler function</step>
      <step>Add proper error handling</step>
    </steps>
  </phase>

  <phase name="Testing">
    <goal>Verify server works correctly</goal>
    <steps>
      <step>Test each tool manually</step>
      <step>Validate input schemas</step>
      <step>Check error responses</step>
      <step>Test with Claude Code</step>
    </steps>
  </phase>

  <phase name="Integration">
    <goal>Deploy and configure server</goal>
    <steps>
      <step>Build TypeScript to JavaScript</step>
      <step>Add server to Claude configuration</step>
      <step>Test integration with Claude</step>
      <step>Document usage and capabilities</step>
    </steps>
  </phase>
</workflow>

<available_skills>
  <skill_group name="Server Setup">
    <skill name="create_minimal_server">
      <purpose>Create a basic MCP server</purpose>
      <usage>Help me create an MCP server for [API/service]</usage>
    </skill>
    <skill name="configure_transport">
      <purpose>Set up stdio or SSE transport</purpose>
      <usage>Configure server to use stdio transport</usage>
    </skill>
    <skill name="add_tool_list_handler">
      <purpose>Implement tool listing capability</purpose>
      <usage>Add listTools request handler</usage>
    </skill>
  </skill_group>

  <skill_group name="Tool Development">
    <skill name="define_tool">
      <purpose>Create a new tool with schema</purpose>
      <usage>Add a tool to my MCP server that [does X]</usage>
    </skill>
    <skill name="create_json_schema">
      <purpose>Define input validation schema</purpose>
      <usage>Create JSON Schema for tool inputs</usage>
    </skill>
    <skill name="implement_handler">
      <purpose>Write tool handler function</purpose>
      <usage>Implement the tool logic</usage>
    </skill>
  </skill_group>

  <skill_group name="Integration Patterns">
    <skill name="api_integration">
      <purpose>Connect to external API</purpose>
      <usage>Integrate with REST API</usage>
    </skill>
    <skill name="database_integration">
      <purpose>Query database from MCP</purpose>
      <usage>Add database query capability</usage>
    </skill>
    <skill name="file_operations">
      <purpose>Read/write files through MCP</purpose>
      <usage>Add file system access</usage>
    </skill>
  </skill_group>

  <skill_group name="Best Practices">
    <skill name="add_error_handling">
      <purpose>Implement proper error responses</purpose>
      <usage>Add error handling to tool</usage>
    </skill>
    <skill name="add_validation">
      <purpose>Validate input parameters</purpose>
      <usage>Add input validation</usage>
    </skill>
    <skill name="add_documentation">
      <purpose>Document tool usage</purpose>
      <usage>Add tool documentation</usage>
    </skill>
  </skill_group>
</available_skills>

<best_practices>
  <do>
    <item>Use TypeScript for type safety</item>
    <item>Give tools single responsibility</item>
    <item>Use JSON Schema for validation</item>
    <item>Return helpful error messages</item>
    <item>Make tools idempotent when possible</item>
    <item>Close connections properly</item>
    <item>Use timeouts for external calls</item>
    <item>Handle rate limiting gracefully</item>
    <item>Log important operations</item>
  </do>
  <dont>
    <item>Mix multiple responsibilities in one tool</item>
    <item>Skip input validation</item>
    <item>Return cryptic error messages</item>
    <item>Forget error handling</item>
    <item>Hardcode credentials</item>
    <item>Log sensitive data</item>
    <item>Ignore rate limits</item>
  </dont>
</best_practices>

<rules>
  <rule priority="high">Always validate input parameters with JSON Schema</rule>
  <rule priority="high">Never hardcode secrets or credentials</rule>
  <rule priority="high">Use environment variables for sensitive data</rule>
  <rule priority="medium">Implement proper error handling for all tools</rule>
  <rule priority="medium">Add timeout handling for external calls</rule>
  <rule priority="low">Include usage examples in documentation</rule>
</rules>

<error_handling>
  <error>
    <condition>Tool not found</condition>
    <solution>
      <step>Verify tool is registered in server</step>
      <step>Check tool name spelling</step>
      <step>Ensure listTools includes the tool</step>
    </solution>
  </error>
  <error>
    <condition>Invalid input</condition>
    <solution>
      <step>Return clear validation error</step>
      <step>Specify which field is invalid</step>
      <step>Provide example of valid input</step>
    </solution>
  </error>
  <error>
    <condition>API connection failed</condition>
    <solution>
      <step>Return actionable error message</step>
      <step>Suggest checking API credentials</step>
      <step>Recommend verifying permissions</step>
    </solution>
  </error>
  <error>
    <condition>Rate limit exceeded</condition>
    <solution>
      <step>Implement exponential backoff</step>
      <step>Return helpful retry message</step>
      <step>Consider caching responses</step>
    </solution>
  </error>
</error_handling>

<integration_notes>
  <configuration>
    <type>Claude Desktop Config</type>
    <example>
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
    </example>
  </configuration>
</integration_notes>

<examples>
  <example>
    <scenario>API Integration</scenario>
    <description>Weather API integration</description>
    <steps>
      <step>Create server with stdio transport</step>
      <step>Define get-weather tool</step>
      <step>Implement API call handler</step>
      <step>Add error handling for API failures</step>
    </steps>
  </example>
  <example>
    <scenario>Database Query</scenario>
    <description>Query database through MCP</description>
    <steps>
      <step>Define query-db tool</step>
      <step>Add SQL parameter validation</step>
      <step>Implement database connection</step>
      <step>Return formatted results</step>
    </steps>
  </example>
  <example>
    <scenario>File Operations</scenario>
    <description>Read and write files</description>
    <steps>
      <step>Define read-file tool</step>
      <step>Define write-file tool</step>
      <step>Add path validation</step>
      <step>Implement file operations</step>
    </steps>
  </example>
</examples>

<security_considerations>
  <consideration>Input Validation</consideration>
  <description>Validate all input parameters with JSON Schema</description>
  <consideration>Secrets Management</consideration>
  <description>Use environment variables for sensitive data</description>
  <consideration>Rate Limiting</consideration>
  <description>Implement rate limiting for external API calls</description>
  <consideration>Logging</consideration>
  <description>Never log sensitive data (passwords, tokens)</description>
  <consideration>Authentication</consideration>
  <description>Use authentication for protected resources</description>
  <consideration>Sanitization</consideration>
  <description>Sanitize data before external API calls</description>
</security_considerations>

<advanced_features>
  <feature>Resources</feature>
  <description>Expose data sources that Claude can read</description>
  <feature>Prompts</feature>
  <description>Provide reusable prompt templates</feature>
  <feature>Tools</feature>
  <description>Executable functions Claude can call</description>
</advanced_features>
