"""
BlackBox5 MCP Integration Tests
================================

Unit tests for the MCP Integration system.

Tests cover:
- Server configuration validation
- Server discovery from config files
- Server lifecycle management (start/stop)
- Tool enumeration (placeholder)
- Security validation
"""

import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

# Import the MCP Integration module
import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "engine"))

from core.MCPIntegration import (
    MCPServerConfig,
    MCPManager,
    create_mcp_manager,
    discover_servers,
)


class TestMCPServerConfig(unittest.TestCase):
    """Test MCPServerConfig class."""

    def test_command_server_config(self):
        """Test creating a command-based server configuration."""
        config = MCPServerConfig(
            server_id="test-server",
            name="Test Server",
            server_type="command",
            command="npx",
            args=["-y", "@upstash/context7-mcp"],
            description="A test MCP server",
        )

        self.assertEqual(config.server_id, "test-server")
        self.assertEqual(config.name, "Test Server")
        self.assertEqual(config.server_type, "command")
        self.assertEqual(config.command, "npx")
        self.assertEqual(config.args, ["-y", "@upstash/context7-mcp"])
        self.assertEqual(config.description, "A test MCP server")

    def test_http_server_config(self):
        """Test creating an HTTP-based server configuration."""
        config = MCPServerConfig(
            server_id="http-server",
            name="HTTP Server",
            server_type="http",
            url="https://example.com/mcp",
            headers={"Authorization": "Bearer token123"},
        )

        self.assertEqual(config.server_id, "http-server")
        self.assertEqual(config.server_type, "http")
        self.assertEqual(config.url, "https://example.com/mcp")
        self.assertEqual(config.headers, {"Authorization": "Bearer token123"})

    def test_config_validation_missing_id(self):
        """Test that missing server_id raises ValueError."""
        with self.assertRaises(ValueError):
            MCPServerConfig(
                server_id="",
                name="Test",
                server_type="command",
                command="test",
            )

    def test_config_validation_missing_name(self):
        """Test that missing name raises ValueError."""
        with self.assertRaises(ValueError):
            MCPServerConfig(
                server_id="test",
                name="",
                server_type="command",
                command="test",
            )

    def test_config_validation_invalid_type(self):
        """Test that invalid server_type raises ValueError."""
        with self.assertRaises(ValueError):
            MCPServerConfig(
                server_id="test",
                name="Test",
                server_type="invalid",
                command="test",
            )

    def test_config_validation_command_missing_command(self):
        """Test that command-based server requires command field."""
        with self.assertRaises(ValueError):
            MCPServerConfig(
                server_id="test",
                name="Test",
                server_type="command",
            )

    def test_config_validation_http_missing_url(self):
        """Test that HTTP-based server requires url field."""
        with self.assertRaises(ValueError):
            MCPServerConfig(
                server_id="test",
                name="Test",
                server_type="http",
            )

    def test_to_dict_command_server(self):
        """Test converting command server config to dictionary."""
        config = MCPServerConfig(
            server_id="test-server",
            name="Test Server",
            server_type="command",
            command="npx",
            args=["-y", "package"],
        )

        result = config.to_dict()

        self.assertEqual(result["id"], "test-server")
        self.assertEqual(result["name"], "Test Server")
        self.assertEqual(result["type"], "command")
        self.assertEqual(result["command"], "npx")
        self.assertEqual(result["args"], ["-y", "package"])

    def test_to_dict_http_server(self):
        """Test converting HTTP server config to dictionary."""
        config = MCPServerConfig(
            server_id="http-server",
            name="HTTP Server",
            server_type="http",
            url="https://example.com/mcp",
        )

        result = config.to_dict()

        self.assertEqual(result["id"], "http-server")
        self.assertEqual(result["type"], "http")
        self.assertEqual(result["url"], "https://example.com/mcp")

    def test_from_dict(self):
        """Test creating config from dictionary."""
        data = {
            "id": "test-server",
            "name": "Test Server",
            "type": "command",
            "command": "npx",
            "args": ["-y", "package"],
            "description": "Test description",
        }

        config = MCPServerConfig.from_dict(data)

        self.assertEqual(config.server_id, "test-server")
        self.assertEqual(config.name, "Test Server")
        self.assertEqual(config.command, "npx")
        self.assertEqual(config.description, "Test description")


class TestMCPManager(unittest.TestCase):
    """Test MCPManager class."""

    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = tempfile.mkdtemp()
        self.config_path = Path(self.temp_dir) / ".mcp.json"

    def tearDown(self):
        """Clean up test fixtures."""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def _create_test_config(self, config_data):
        """Helper to create test config file."""
        with open(self.config_path, "w") as f:
            json.dump(config_data, f)

    def test_init_with_no_config(self):
        """Test initialization when config file doesn't exist."""
        manager = MCPManager(config_path=self.config_path)
        self.assertEqual(len(manager.servers), 0)

    def test_init_with_valid_config(self):
        """Test initialization with valid config file."""
        config_data = {
            "mcpServers": {
                "test-server": {
                    "command": "npx",
                    "args": ["-y", "test-package"],
                },
                "http-server": {
                    "type": "http",
                    "url": "https://example.com/mcp",
                },
            }
        }
        self._create_test_config(config_data)

        manager = MCPManager(config_path=self.config_path)

        self.assertEqual(len(manager.servers), 2)
        self.assertIn("test-server", manager.servers)
        self.assertIn("http-server", manager.servers)

    def test_discover_mcp_servers(self):
        """Test discovering MCP servers."""
        config_data = {
            "mcpServers": {
                "test-server": {
                    "command": "npx",
                    "args": ["-y", "test-package"],
                },
            }
        }
        self._create_test_config(config_data)

        manager = MCPManager(config_path=self.config_path)
        servers = manager.discover_mcp_servers()

        self.assertEqual(len(servers), 1)
        self.assertEqual(servers[0]["id"], "test-server")
        self.assertEqual(servers[0]["type"], "command")
        self.assertFalse(servers[0]["running"])

    def test_start_http_server(self):
        """Test starting an HTTP server."""
        config_data = {
            "mcpServers": {
                "http-server": {
                    "type": "http",
                    "url": "https://example.com/mcp",
                },
            }
        }
        self._create_test_config(config_data)

        manager = MCPManager(config_path=self.config_path)
        result = manager.start_server("http-server")

        self.assertTrue(result)
        self.assertIn("http-server", manager.running_servers)
        self.assertEqual(manager.running_servers["http-server"]["type"], "http")

    def test_start_command_server_mock(self):
        """Test starting a command server with mocked subprocess."""
        config_data = {
            "mcpServers": {
                "test-server": {
                    "command": "npx",
                    "args": ["-y", "test-package"],
                },
            }
        }
        self._create_test_config(config_data)

        manager = MCPManager(config_path=self.config_path)

        # Mock subprocess.Popen
        with patch("subprocess.Popen") as mock_popen:
            mock_process = Mock()
            mock_process.pid = 12345
            mock_popen.return_value = mock_process

            result = manager.start_server("test-server")

            self.assertTrue(result)
            self.assertIn("test-server", manager.running_servers)
            self.assertEqual(manager.running_servers["test-server"]["type"], "command")

    def test_start_unknown_server(self):
        """Test starting a server that doesn't exist."""
        manager = MCPManager(config_path=self.config_path)
        result = manager.start_server("unknown-server")

        self.assertFalse(result)

    def test_stop_server(self):
        """Test stopping a running server."""
        config_data = {
            "mcpServers": {
                "http-server": {
                    "type": "http",
                    "url": "https://example.com/mcp",
                },
            }
        }
        self._create_test_config(config_data)

        manager = MCPManager(config_path=self.config_path)
        manager.start_server("http-server")

        result = manager.stop_server("http-server")

        self.assertTrue(result)
        self.assertNotIn("http-server", manager.running_servers)

    def test_stop_all_servers(self):
        """Test stopping all running servers."""
        config_data = {
            "mcpServers": {
                "http-server": {
                    "type": "http",
                    "url": "https://example.com/mcp",
                },
                "http-server-2": {
                    "type": "http",
                    "url": "https://example2.com/mcp",
                },
            }
        }
        self._create_test_config(config_data)

        manager = MCPManager(config_path=self.config_path)
        manager.start_server("http-server")
        manager.start_server("http-server-2")

        manager.stop_all_servers()

        self.assertEqual(len(manager.running_servers), 0)

    def test_get_server_config(self):
        """Test getting server configuration."""
        config_data = {
            "mcpServers": {
                "test-server": {
                    "command": "npx",
                    "args": ["-y", "test-package"],
                },
            }
        }
        self._create_test_config(config_data)

        manager = MCPManager(config_path=self.config_path)
        config = manager.get_server_config("test-server")

        self.assertIsNotNone(config)
        self.assertEqual(config.server_id, "test-server")
        self.assertEqual(config.command, "npx")

    def test_get_server_config_not_found(self):
        """Test getting configuration for non-existent server."""
        manager = MCPManager(config_path=self.config_path)
        config = manager.get_server_config("unknown")

        self.assertIsNone(config)

    def test_validate_server(self):
        """Test validating a server configuration."""
        config_data = {
            "mcpServers": {
                "test-server": {
                    "command": "npx",
                    "args": ["-y", "test-package"],
                },
            }
        }
        self._create_test_config(config_data)

        manager = MCPManager(config_path=self.config_path)
        result = manager.validate_server("test-server")

        self.assertTrue(result)

    def test_get_running_servers(self):
        """Test getting list of running servers."""
        config_data = {
            "mcpServers": {
                "http-server": {
                    "type": "http",
                    "url": "https://example.com/mcp",
                },
            }
        }
        self._create_test_config(config_data)

        manager = MCPManager(config_path=self.config_path)
        manager.start_server("http-server")

        running = manager.get_running_servers()

        self.assertEqual(len(running), 1)
        self.assertIn("http-server", running)

    def test_context_manager(self):
        """Test using MCPManager as context manager."""
        config_data = {
            "mcpServers": {
                "http-server": {
                    "type": "http",
                    "url": "https://example.com/mcp",
                },
            }
        }
        self._create_test_config(config_data)

        with MCPManager(config_path=self.config_path) as manager:
            manager.start_server("http-server")
            self.assertIn("http-server", manager.running_servers)

        # Servers should be stopped after exiting context
        # Note: This test verifies the context manager interface exists


class TestConvenienceFunctions(unittest.TestCase):
    """Test convenience functions."""

    def test_create_mcp_manager(self):
        """Test create_mcp_manager function."""
        manager = create_mcp_manager()
        self.assertIsInstance(manager, MCPManager)

    def test_discover_servers(self):
        """Test discover_servers convenience function."""
        temp_dir = tempfile.mkdtemp()
        config_path = Path(temp_dir) / ".mcp.json"

        try:
            config_data = {
                "mcpServers": {
                    "test-server": {
                        "command": "npx",
                        "args": ["-y", "test"],
                    },
                }
            }
            with open(config_path, "w") as f:
                json.dump(config_data, f)

            servers = discover_servers(config_path)

            self.assertEqual(len(servers), 1)
            self.assertEqual(servers[0]["id"], "test-server")

        finally:
            import shutil
            shutil.rmtree(temp_dir, ignore_errors=True)


class TestRealConfig(unittest.TestCase):
    """Test with real .mcp.json configuration."""

    def test_load_real_config(self):
        """Test loading the actual .mcp.json from the project."""
        # Try to load the real config if it exists
        real_config_path = Path.cwd() / ".mcp.json"

        if not real_config_path.exists():
            self.skipTest("No .mcp.json found in current directory")

        manager = MCPManager(config_path=real_config_path)
        servers = manager.discover_mcp_servers()

        # Basic sanity checks
        self.assertIsInstance(servers, list)
        for server in servers:
            self.assertIn("id", server)
            self.assertIn("name", server)
            self.assertIn("type", server)
            self.assertIn("running", server)


if __name__ == "__main__":
    unittest.main()
