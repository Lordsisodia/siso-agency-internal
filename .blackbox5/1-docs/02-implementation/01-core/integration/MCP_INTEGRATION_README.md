# BlackBox5 MCP Integration System

## Overview

The BlackBox5 MCP (Model Context Protocol) Integration System provides comprehensive management for MCP servers, enabling BlackBox5 agents to discover, initialize, and interact with external MCP tools and services.

## Features

### Core Capabilities

- **Server Discovery**: Automatically discover MCP servers from `.mcp.json` configuration files
- **Server Lifecycle Management**: Start, stop, and monitor MCP servers
- **Multi-Protocol Support**: Handle both command-based and HTTP-based MCP servers
- **Security Validation**: Validate server configurations to prevent security issues
- **Tool Enumeration**: Query available tools from MCP servers (placeholder for future implementation)
- **Thread-Safe Operations**: Safe concurrent access to server management

### Server Types

1. **Command-Based Servers**: Executed as subprocesses (e.g., `npx`, `python`, `uvx`)
2. **HTTP-Based Servers**: Communicate via HTTP/HTTPS endpoints

## Architecture

### Key Components

#### `MCPServerConfig`

Represents configuration for a single MCP server:

```python
config = MCPServerConfig(
    server_id="context7",
    name="Context7 Documentation",
    server_type="command",
    command="npx",
    args=["-y", "@upstash/context7-mcp"],
    description="Provides library documentation lookup"
)
```

#### `MCPManager`

Main class for managing MCP server lifecycle:

```python
manager = MCPManager(config_path=Path(".mcp.json"))

# Discover servers
servers = manager.discover_mcp_servers()

# Start a server
manager.start_server("context7")

# Stop a server
manager.stop_server("context7")

# Get server tools
tools = manager.get_server_tools("context7")
```

## Configuration

### `.mcp.json` Format

The system reads MCP server configurations from a `.mcp.json` file:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "linear": {
      "type": "http",
      "url": "https://mcp.linear.app/mcp",
      "headers": {
        "Authorization": "Bearer token123"
      }
    },
    "filesystem": {
      "command": "mcp-server-filesystem",
      "args": ["/path/to/allowed/directory"],
      "env": {
        "CUSTOM_ENV": "value"
      }
    }
  }
}
```

### Server Configuration Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes (auto) | Unique server identifier |
| `name` | string | No | Human-readable name |
| `type` | string | No | Server type: `command` (default) or `http` |
| `command` | string | For command type | Command to execute |
| `args` | array | No | Command arguments |
| `url` | string | For HTTP type | HTTP/HTTPS endpoint |
| `headers` | object | No | HTTP headers |
| `env` | object | No | Environment variables for command |
| `description` | string | No | Server description |

## Usage Examples

### Basic Usage

```python
from pathlib import Path
from blackbox5.engine.core.MCPIntegration import MCPManager

# Initialize manager (auto-loads .mcp.json from current directory)
manager = MCPManager()

# Discover all configured servers
servers = manager.discover_mcp_servers()
for server in servers:
    print(f"{server['name']} ({server['type']})")

# Start a server
if manager.start_server("context7"):
    print("Server started successfully")

# Check running servers
running = manager.get_running_servers()
print(f"Running: {running}")

# Stop the server
manager.stop_server("context7")
```

### Using Context Manager

```python
with MCPManager() as manager:
    manager.start_server("context7")
    # ... use the server ...
# Automatically stops all servers on exit
```

### Custom Configuration Path

```python
manager = MCPManager(config_path=Path("/custom/path/.mcp.json"))
```

### Convenience Functions

```python
from blackbox5.engine.core.MCPIntegration import discover_servers

# Quick discovery without creating a manager
servers = discover_servers()
```

## Security

### Validation

The system validates all server configurations:

- **Command Validation**: Ensures commands are present for command-based servers
- **Type Validation**: Only allows `command` or `http` server types
- **URL Validation**: Ensures URLs are present for HTTP-based servers
- **Field Validation**: Validates all required fields are present and correct types

### Security Considerations

1. **Command Execution**: Command-based servers are executed as subprocesses with the current user's permissions
2. **Environment Variables**: Server configurations can include environment variables
3. **HTTP Headers**: HTTP-based servers can include custom headers (e.g., for authentication)
4. **Filesystem Access**: File-based MCP servers (like `filesystem`) should be configured with restricted paths

## API Reference

### `MCPServerConfig`

#### Constructor

```python
MCPServerConfig(
    server_id: str,
    name: str,
    server_type: str = "command",
    command: Optional[str] = None,
    args: Optional[List[str]] = None,
    url: Optional[str] = None,
    headers: Optional[Dict[str, str]] = None,
    env: Optional[Dict[str, str]] = None,
    description: Optional[str] = None
)
```

#### Methods

- `to_dict() -> Dict[str, Any]`: Convert configuration to dictionary
- `from_dict(config: Dict[str, Any]) -> MCPServerConfig`: Create from dictionary (classmethod)
- `_validate() -> None`: Validate configuration (raises `ValueError` if invalid)

### `MCPManager`

#### Constructor

```python
MCPManager(config_path: Optional[Path] = None)
```

#### Methods

- `discover_mcp_servers() -> List[Dict[str, Any]]`: Discover and list all servers
- `start_server(server_id: str) -> bool`: Start a server
- `stop_server(server_id: str) -> bool`: Stop a running server
- `stop_all_servers() -> None`: Stop all running servers
- `get_server_tools(server_id: str) -> List[str]`: Get tools from server (placeholder)
- `get_server_config(server_id: str) -> Optional[MCPServerConfig]`: Get server configuration
- `validate_server(server_id: str) -> bool`: Validate server configuration
- `get_running_servers() -> List[str]`: Get list of running server IDs

### Convenience Functions

- `create_mcp_manager(config_path: Optional[Path] = None) -> MCPManager`: Create manager instance
- `discover_servers(config_path: Optional[Path] = None) -> List[Dict[str, Any]]`: Quick server discovery

## Testing

### Running Tests

```bash
# Run standalone demo
python3 .blackbox5/tests/test_mcp_integration_standalone.py

# Run unit tests (requires full BlackBox5 environment)
python3 .blackbox5/tests/test_mcp_integration.py
```

### Test Coverage

The test suite covers:

1. **Server Configuration**: Creating and validating server configurations
2. **HTTP Servers**: HTTP-based server configuration and management
3. **Command Servers**: Command-based server configuration and management
4. **Server Discovery**: Loading and discovering servers from config files
5. **Lifecycle Management**: Starting and stopping servers
6. **Validation**: Configuration validation and error handling
7. **Real Config**: Loading and testing with actual `.mcp.json` files

## Adaptation from Auto-Claude

This MCP Integration system is adapted from Auto-Claude's MCP integration with the following simplifications:

### What Was Kept

- Core server configuration model (`MCPServerConfig`)
- Server discovery from JSON files
- Basic lifecycle management (start/stop)
- Support for both command and HTTP servers
- Security validation principles

### What Was Simplified

- **Removed complex agent-specific tool filtering**: Auto-Claude has per-agent tool permissions; BlackBox5 uses a simpler model
- **Removed MCP SDK dependencies**: Auto-Claude uses the Claude Agent SDK; this is a standalone implementation
- **Simplified tool enumeration**: Full MCP protocol implementation for tool listing is a placeholder
- **Removed project-specific config**: Auto-Claude loads `.auto-claude/.env`; this uses a single `.mcp.json`
- **Simplified server management**: No caching, no project capabilities detection

### What Was Added

- **Context manager support**: For automatic cleanup
- **Standalone testing**: Can be tested without full BlackBox5 environment
- **Better documentation**: Comprehensive README and examples
- **Type hints**: Full type annotations for better IDE support

## Integration with BlackBox5

### Agent Integration

To integrate MCP servers with BlackBox5 agents:

```python
from blackbox5.engine.core.MCPIntegration import MCPManager

class BB5Agent:
    def __init__(self):
        self.mcp_manager = MCPManager()

        # Start required servers
        for server_id in self.get_required_servers():
            self.mcp_manager.start_server(server_id)

    def get_required_servers(self) -> List[str]:
        # Return list of server IDs this agent needs
        return ["context7", "filesystem"]

    def cleanup(self):
        self.mcp_manager.stop_all_servers()
```

### Tool Execution

To execute MCP server tools (future implementation):

```python
# Get available tools from a server
tools = manager.get_server_tools("context7")

# Execute a tool (pseudo-code - needs MCP protocol implementation)
result = execute_mcp_tool(
    server_id="context7",
    tool_name="resolve-library-id",
    params={"query": "react"}
)
```

## Future Enhancements

1. **Full MCP Protocol Implementation**: Complete tool enumeration and execution
2. **Tool Execution**: Execute MCP tools and return results
3. **Server Health Monitoring**: Check if servers are responsive
4. **Automatic Restart**: Restart crashed servers
5. **Tool Caching**: Cache tool metadata for performance
6. **Server Dependencies**: Handle servers that depend on other servers
7. **Configuration Hot Reload**: Reload config without restarting
8. **Metrics and Monitoring**: Track server usage and performance

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check that the command exists in PATH
   - Verify server configuration is valid
   - Check logs for error messages

2. **Config not loading**
   - Verify `.mcp.json` is valid JSON
   - Check file path is correct
   - Ensure file has read permissions

3. **Server stops immediately**
   - Check server logs (if available)
   - Verify server dependencies are installed
   - Test server command manually

## License

This MCP Integration system is part of BlackBox5 and follows the same license.

## Credits

Adapted from Auto-Claude's MCP integration system (https://github.com/AndyMik90/Auto-Claude)
