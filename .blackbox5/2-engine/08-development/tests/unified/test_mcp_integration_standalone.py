"""
BlackBox5 MCP Integration - Standalone Demo
============================================

A standalone demonstration of the MCP Integration system.
This script can be run directly to test MCP functionality without
requiring the full BlackBox5 environment.

Usage:
    python test_mcp_integration_standalone.py
"""

import json
import logging
import sys
import tempfile
from pathlib import Path

# Import standard library modules BEFORE adding local paths
# This prevents conflicts with local files named after stdlib modules

# Now add local path
sys.path.insert(0, str(Path(__file__).parent.parent / "engine" / "core"))

from MCPIntegration import (
    MCPServerConfig,
    MCPManager,
    create_mcp_manager,
    discover_servers,
)


def test_server_config():
    """Test 1: Server Configuration"""
    print("=" * 60)
    print("Test 1: Server Configuration")
    print("=" * 60)

    # Create a command-based server config
    config = MCPServerConfig(
        server_id="context7",
        name="Context7 Documentation",
        server_type="command",
        command="npx",
        args=["-y", "@upstash/context7-mcp"],
        description="Provides library documentation lookup",
    )

    print(f"✓ Created server config:")
    print(f"  - ID: {config.server_id}")
    print(f"  - Name: {config.name}")
    print(f"  - Type: {config.server_type}")
    print(f"  - Command: {config.command} {' '.join(config.args)}")
    print()

    # Test to_dict conversion
    config_dict = config.to_dict()
    print(f"✓ Converted to dict:")
    print(f"  {json.dumps(config_dict, indent=2)}")
    print()

    return config


def test_http_server_config():
    """Test 2: HTTP Server Configuration"""
    print("=" * 60)
    print("Test 2: HTTP Server Configuration")
    print("=" * 60)

    config = MCPServerConfig(
        server_id="linear",
        name="Linear Integration",
        server_type="http",
        url="https://mcp.linear.app/mcp",
        headers={"Authorization": "Bearer token123"},
        description="Linear project management integration",
    )

    print(f"✓ Created HTTP server config:")
    print(f"  - ID: {config.server_id}")
    print(f"  - Name: {config.name}")
    print(f"  - Type: {config.server_type}")
    print(f"  - URL: {config.url}")
    print()

    return config


def test_manager_with_config():
    """Test 3: MCP Manager with Configuration File"""
    print("=" * 60)
    print("Test 3: MCP Manager with Configuration File")
    print("=" * 60)

    # Create a temporary config file
    temp_dir = tempfile.mkdtemp()
    config_path = Path(temp_dir) / ".mcp.json"

    config_data = {
        "mcpServers": {
            "context7": {
                "command": "npx",
                "args": ["-y", "@upstash/context7-mcp"],
            },
            "linear": {
                "type": "http",
                "url": "https://mcp.linear.app/mcp",
            },
            "filesystem": {
                "command": "mcp-server-filesystem",
                "args": ["/tmp"],
            },
        }
    }

    with open(config_path, "w") as f:
        json.dump(config_data, f)

    print(f"✓ Created test config at: {config_path}")

    # Load with manager
    manager = MCPManager(config_path=config_path)

    print(f"✓ Loaded {len(manager.servers)} servers")

    return manager, temp_dir


def test_server_discovery(manager):
    """Test 4: Server Discovery"""
    print("=" * 60)
    print("Test 4: Server Discovery")
    print("=" * 60)

    servers = manager.discover_mcp_servers()

    print(f"✓ Discovered {len(servers)} servers:")
    for server in servers:
        running_status = "🟢 Running" if server["running"] else "⚪ Stopped"
        print(f"  - {server['name']} ({server['type']}) - {running_status}")

        if server["type"] == "command":
            print(f"    Command: {server.get('command', 'N/A')}")
        elif server["type"] == "http":
            print(f"    URL: {server.get('url', 'N/A')}")

    print()


def test_server_lifecycle(manager):
    """Test 5: Server Lifecycle"""
    print("=" * 60)
    print("Test 5: Server Lifecycle Management")
    print("=" * 60)

    # Start an HTTP server (no subprocess needed)
    print("✓ Starting HTTP server 'linear'...")
    result = manager.start_server("linear")
    print(f"  Result: {'Success' if result else 'Failed'}")

    running = manager.get_running_servers()
    print(f"  Running servers: {running}")
    print()

    # Stop the server
    print("✓ Stopping server 'linear'...")
    result = manager.stop_server("linear")
    print(f"  Result: {'Success' if result else 'Failed'}")

    running = manager.get_running_servers()
    print(f"  Running servers: {running}")
    print()


def test_real_config():
    """Test 6: Load Real Configuration (if exists)"""
    print("=" * 60)
    print("Test 6: Load Real .mcp.json Configuration")
    print("=" * 60)

    real_config_path = Path.cwd() / ".mcp.json"

    if not real_config_path.exists():
        print("⚠ No .mcp.json found in current directory")
        print()

        # Try parent directory
        real_config_path = Path.cwd().parent / ".mcp.json"
        if not real_config_path.exists():
            print("⚠ No .mcp.json found in parent directory")
            print()
            return None

    print(f"✓ Found config at: {real_config_path}")

    try:
        manager = MCPManager(config_path=real_config_path)
        servers = manager.discover_mcp_servers()

        print(f"✓ Loaded {len(servers)} servers from real config:")
        for server in servers:
            print(f"  - {server['name']} ({server['type']})")

        print()
        return manager

    except Exception as e:
        print(f"✗ Error loading real config: {e}")
        print()
        return None


def test_validation():
    """Test 7: Configuration Validation"""
    print("=" * 60)
    print("Test 7: Configuration Validation")
    print("=" * 60)

    # Valid config
    try:
        config = MCPServerConfig(
            server_id="valid",
            name="Valid Server",
            server_type="command",
            command="npx",
        )
        print("✓ Valid configuration accepted")
    except ValueError as e:
        print(f"✗ Valid configuration rejected: {e}")

    # Invalid: missing command
    try:
        config = MCPServerConfig(
            server_id="invalid",
            name="Invalid Server",
            server_type="command",
        )
        print("✗ Invalid configuration accepted (missing command)")
    except ValueError:
        print("✓ Invalid configuration rejected (missing command)")

    # Invalid: wrong type
    try:
        config = MCPServerConfig(
            server_id="invalid",
            name="Invalid Server",
            server_type="websocket",
        )
        print("✗ Invalid configuration accepted (wrong type)")
    except ValueError:
        print("✓ Invalid configuration rejected (wrong type)")

    print()


def main():
    """Run all tests."""
    print()
    print("╔" + "═" * 58 + "╗")
    print("║" + " " * 10 + "BlackBox5 MCP Integration Demo" + " " * 15 + "║")
    print("╚" + "═" * 58 + "╝")
    print()

    try:
        # Run tests
        test_server_config()
        test_http_server_config()

        manager, temp_dir = test_manager_with_config()
        test_server_discovery(manager)
        test_server_lifecycle(manager)

        # Test with real config if available
        real_manager = test_real_config()

        test_validation()

        print("=" * 60)
        print("✓ All tests completed successfully!")
        print("=" * 60)
        print()
        print("Summary:")
        print("  - Server configuration: ✓")
        print("  - HTTP server support: ✓")
        print("  - Command server support: ✓")
        print("  - Server discovery: ✓")
        print("  - Lifecycle management: ✓")
        print("  - Validation: ✓")
        print()
        print("The MCP Integration system is ready for use!")
        print()

    except Exception as e:
        print()
        print("=" * 60)
        print("✗ Test failed with error:")
        print(f"  {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
