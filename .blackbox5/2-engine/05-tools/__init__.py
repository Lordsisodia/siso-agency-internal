"""
Black Box 5 Engine - Tools

Tools are composable capabilities that agents can use to perform
specific actions like reading files, running commands, etc.

Organized by purpose:
- core: Base infrastructure and registry
- execution: Running code and commands
- file-ops: File operations
- git: Git repository operations
- utils: Helper utilities
"""

# Core infrastructure
from .core.base import BaseTool, ToolResult, ToolParameter, ToolRisk
from .core.registry import ToolRegistry, get_tool, list_tools, register_tool

# Execution tools
from .execution.bash_tool import BashExecuteTool

# File operations
from .file_ops.file_tools import FileReadTool, FileWriteTool
from .file_ops.search_tool import SearchTool

__all__ = [
    # Core
    "BaseTool",
    "ToolResult",
    "ToolParameter",
    "ToolRisk",
    "ToolRegistry",
    "get_tool",
    "list_tools",
    "register_tool",

    # Execution
    "BashExecuteTool",

    # File operations
    "FileReadTool",
    "FileWriteTool",
    "SearchTool",
]
