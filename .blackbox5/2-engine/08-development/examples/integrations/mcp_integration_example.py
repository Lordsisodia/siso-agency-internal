"""
BlackBox5 Agent with MCP Integration Example
=============================================

This example demonstrates how to integrate the MCP Integration system
with a BlackBox5 agent to provide access to external MCP tools.

Usage:
    python mcp_integration_example.py
"""

import logging
import sys
from pathlib import Path

# Import standard library modules BEFORE adding local paths
# This prevents conflicts with local files named after stdlib modules

# Add BlackBox5 to path
sys.path.insert(0, str(Path(__file__).parent.parent / "engine" / "core"))

from MCPIntegration import MCPManager


class BlackBox5Agent:
    """
    Example BlackBox5 agent with MCP server integration.

    This agent can discover, start, and interact with MCP servers
    to extend its capabilities with external tools.
    """

    def __init__(self, name: str, required_servers: list = None):
        """
        Initialize the agent.

        Args:
            name: Agent name
            required_servers: List of MCP server IDs this agent needs
        """
        self.name = name
        self.required_servers = required_servers or []
        self.mcp_manager = MCPManager()
        self.available_tools = {}

    def initialize(self):
        """Initialize the agent and start required MCP servers."""
        print(f"🤖 Initializing {self.name}...")
        print()

        # Discover available servers
        servers = self.mcp_manager.discover_mcp_servers()
        print(f"📋 Discovered {len(servers)} MCP servers:")
        for server in servers:
            status = "✓" if server["running"] else "○"
            print(f"  {status} {server['name']} ({server['type']})")
        print()

        # Start required servers
        for server_id in self.required_servers:
            if self.mcp_manager.start_server(server_id):
                print(f"✓ Started MCP server: {server_id}")
            else:
                print(f"✗ Failed to start MCP server: {server_id}")
        print()

        # Collect available tools
        self._collect_tools()

    def _collect_tools(self):
        """Collect available tools from all running servers."""
        print("🔧 Collecting available tools...")
        self.available_tools = {}

        for server_id in self.mcp_manager.get_running_servers():
            config = self.mcp_manager.get_server_config(server_id)
            if config:
                # In a full implementation, this would query the server
                # for its actual tools. For now, we use a placeholder.
                self.available_tools[server_id] = {
                    "server_name": config.name,
                    "server_type": config.server_type,
                    "tools": ["tool1", "tool2", "tool3"],  # Placeholder
                }

                print(f"  • {config.name}: {len(self.available_tools[server_id]['tools'])} tools")
        print()

    def execute_task(self, task: str):
        """
        Execute a task using available MCP tools.

        Args:
            task: Task description
        """
        print(f"📝 Executing task: {task}")
        print()

        # Check what tools we have available
        if not self.available_tools:
            print("⚠ No MCP tools available")
            return

        print("Available MCP tools:")
        for server_id, server_data in self.available_tools.items():
            print(f"  {server_data['server_name']}:")
            for tool in server_data['tools']:
                print(f"    - {tool}")
        print()

        # In a full implementation, this would:
        # 1. Analyze the task
        # 2. Select appropriate tools
        # 3. Execute tools via MCP protocol
        # 4. Return results

        print("✓ Task execution (placeholder - full MCP protocol not implemented)")

    def shutdown(self):
        """Shutdown the agent and stop all MCP servers."""
        print()
        print(f"🛑 Shutting down {self.name}...")

        running_servers = self.mcp_manager.get_running_servers()
        if running_servers:
            print(f"Stopping {len(running_servers)} MCP servers...")
            self.mcp_manager.stop_all_servers()
            print("✓ All servers stopped")
        else:
            print("No servers to stop")


def example_1_basic_agent():
    """Example 1: Basic agent with MCP servers."""
    print("=" * 70)
    print("Example 1: Basic Agent with MCP Integration")
    print("=" * 70)
    print()

    # Create an agent that needs specific MCP servers
    agent = BlackBox5Agent(
        name="CoderAgent",
        required_servers=[
            "context7",  # Documentation lookup
            "filesystem",  # File operations
        ]
    )

    try:
        # Initialize the agent (starts MCP servers)
        agent.initialize()

        # Execute a task
        agent.execute_task("Add user authentication to the app")

    finally:
        # Cleanup
        agent.shutdown()

    print()
    print("✓ Example 1 completed")


def example_2_context_manager():
    """Example 2: Using context manager for automatic cleanup."""
    print("=" * 70)
    print("Example 2: Agent with Context Manager")
    print("=" * 70)
    print()

    # Using MCPManager as context manager
    with MCPManager() as manager:
        # Discover servers
        servers = manager.discover_mcp_servers()
        print(f"Found {len(servers)} servers")
        print()

        # Start an HTTP server (if available in config)
        for server in servers:
            if server["type"] == "http":
                if manager.start_server(server["id"]):
                    print(f"✓ Started {server['name']}")
                    break

        running = manager.get_running_servers()
        print(f"Running servers: {running}")

    # Servers automatically stopped when exiting context
    print()
    print("✓ Servers automatically stopped (context manager)")

    print()
    print("✓ Example 2 completed")


def example_3_custom_config():
    """Example 3: Agent with custom MCP configuration."""
    print("=" * 70)
    print("Example 3: Custom MCP Configuration")
    print("=" * 70)
    print()

    # Create manager with custom config path
    import tempfile
    import json

    # Create a temporary config
    temp_dir = tempfile.mkdtemp()
    config_path = Path(temp_dir) / ".mcp.json"

    custom_config = {
        "mcpServers": {
            "test-server": {
                "command": "echo",
                "args": ["test"],
            }
        }
    }

    with open(config_path, "w") as f:
        json.dump(custom_config, f)

    print(f"Created custom config at: {config_path}")
    print()

    # Use custom config
    with MCPManager(config_path=config_path) as manager:
        servers = manager.discover_mcp_servers()
        print(f"Loaded {len(servers)} servers from custom config")
        for server in servers:
            print(f"  - {server['name']} ({server['type']})")

    print()
    print("✓ Example 3 completed")


def main():
    """Run all examples."""
    print()
    print("╔" + "═" * 68 + "╗")
    print("║" + " " * 15 + "BlackBox5 MCP Integration Examples" + " " * 18 + "║")
    print("╚" + "═" * 68 + "╝")
    print()

    try:
        # Run examples
        example_1_basic_agent()
        print()

        example_2_context_manager()
        print()

        example_3_custom_config()
        print()

        print("=" * 70)
        print("✓ All examples completed successfully!")
        print("=" * 70)
        print()
        print("Key Takeaways:")
        print("  1. Agents can discover and start MCP servers automatically")
        print("  2. Context managers ensure proper cleanup")
        print("  3. Custom configurations can be loaded from any path")
        print("  4. The system integrates seamlessly with BlackBox5 agents")
        print()

    except Exception as e:
        print()
        print("=" * 70)
        print(f"✗ Example failed: {e}")
        print("=" * 70)
        import traceback
        traceback.print_exc()
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
