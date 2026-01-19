"""
Black Box 5 Engine - File Tools

Tools for reading and writing files.
"""

from pathlib import Path
from typing import Optional, Dict, Any
import logging

from .base import BaseTool, ToolResult, ToolParameter, ToolRisk

logger = logging.getLogger("FileTools")


class FileReadTool(BaseTool):
    """
    Tool for reading file contents.

    Supports:
    - Reading text files
    - Reading with line limits (head/tail)
    - Binary file detection
    """

    name = "file_read"
    description = "Read the contents of a file from the filesystem"
    risk = ToolRisk.LOW
    parameters = [
        ToolParameter(
            name="path",
            type="str",
            description="Absolute path to the file to read",
            required=True,
            min_length=1
        ),
        ToolParameter(
            name="offset",
            type="int",
            description="Line number to start reading from (0-indexed)",
            required=False,
            default=0
        ),
        ToolParameter(
            name="limit",
            type="int",
            description="Maximum number of lines to read",
            required=False,
            default=None
        ),
        ToolParameter(
            name="encoding",
            type="str",
            description="Text encoding to use",
            required=False,
            default="utf-8"
        )
    ]

    async def run(self, **kwargs) -> ToolResult:
        """
        Read file contents.

        Args:
            path: Absolute path to file
            offset: Optional line offset
            limit: Optional line limit
            encoding: Text encoding (default: utf-8)

        Returns:
            ToolResult with file contents or error
        """
        # Validate parameters
        error = self.validate_parameters(kwargs)
        if error:
            return ToolResult(success=False, error=error)

        path_str = kwargs["path"]
        offset = kwargs.get("offset", 0)
        limit = kwargs.get("limit")
        encoding = kwargs.get("encoding", "utf-8")

        try:
            path = Path(path_str).resolve()

            # Security check: ensure path is within allowed directories
            if not self._is_path_allowed(path):
                return ToolResult(
                    success=False,
                    error=f"Access to path '{path}' is not allowed"
                )

            # Check if file exists
            if not path.exists():
                return ToolResult(
                    success=False,
                    error=f"File not found: {path}"
                )

            # Check if it's a file (not directory)
            if not path.is_file():
                return ToolResult(
                    success=False,
                    error=f"Path is not a file: {path}"
                )

            # Check file size (warn if > 10MB)
            file_size = path.stat().st_size
            if file_size > 10 * 1024 * 1024:  # 10MB
                logger.warning(f"Reading large file: {path} ({file_size} bytes)")

            # Read file
            try:
                content = path.read_text(encoding=encoding)
            except UnicodeDecodeError:
                return ToolResult(
                    success=False,
                    error=f"Failed to decode file with encoding '{encoding}'. File may be binary."
                )

            # Apply line limits if specified
            lines = content.splitlines(keepends=True)

            if offset > 0:
                if offset >= len(lines):
                    return ToolResult(
                        success=False,
                        error=f"Offset {offset} exceeds file length ({len(lines)} lines)"
                    )
                lines = lines[offset:]

            if limit is not None:
                lines = lines[:limit]

            content = "".join(lines)

            # Get file metadata
            metadata = {
                "path": str(path),
                "size": file_size,
                "lines": len(content.splitlines()),
                "encoding": encoding,
                "is_binary": False,
                "truncated": limit is not None or offset > 0
            }

            return ToolResult(
                success=True,
                data=content,
                metadata=metadata
            )

        except PermissionError:
            return ToolResult(
                success=False,
                error=f"Permission denied reading file: {path_str}"
            )
        except Exception as e:
            logger.exception(f"Error reading file: {path_str}")
            return ToolResult(
                success=False,
                error=f"Error reading file: {str(e)}"
            )

    def _is_path_allowed(self, path: Path) -> bool:
        """
        Check if path is within allowed directories.

        For now, allow all paths. In production, you'd want to restrict
        to specific project directories.
        """
        # TODO: Implement proper path filtering
        # For security, could check against allowed base paths
        return True


class FileWriteTool(BaseTool):
    """
    Tool for writing to files.

    Supports:
    - Creating new files
    - Overwriting existing files
    - Creating parent directories
    """

    name = "file_write"
    description = "Write content to a file (creates or overwrites)"
    risk = ToolRisk.MEDIUM
    parameters = [
        ToolParameter(
            name="path",
            type="str",
            description="Absolute path to the file to write",
            required=True,
            min_length=1
        ),
        ToolParameter(
            name="content",
            type="str",
            description="Content to write to the file",
            required=True
        ),
        ToolParameter(
            name="create_dirs",
            type="bool",
            description="Create parent directories if they don't exist",
            required=False,
            default=True
        ),
        ToolParameter(
            name="encoding",
            type="str",
            description="Text encoding to use",
            required=False,
            default="utf-8"
        ),
        ToolParameter(
            name="backup",
            type="bool",
            description="Create backup of existing file",
            required=False,
            default=False
        )
    ]

    async def run(self, **kwargs) -> ToolResult:
        """
        Write content to a file.

        Args:
            path: Absolute path to file
            content: Content to write
            create_dirs: Create parent directories if needed
            encoding: Text encoding (default: utf-8)
            backup: Create backup of existing file

        Returns:
            ToolResult with write status
        """
        # Validate parameters
        error = self.validate_parameters(kwargs)
        if error:
            return ToolResult(success=False, error=error)

        path_str = kwargs["path"]
        content = kwargs["content"]
        create_dirs = kwargs.get("create_dirs", True)
        encoding = kwargs.get("encoding", "utf-8")
        backup = kwargs.get("backup", False)

        try:
            path = Path(path_str).resolve()

            # Security check
            if not self._is_path_allowed(path):
                return ToolResult(
                    success=False,
                    error=f"Access to path '{path}' is not allowed"
                )

            # Create parent directories if needed
            if create_dirs and path.parent != Path("."):
                path.parent.mkdir(parents=True, exist_ok=True)

            # Create backup if file exists and backup requested
            backup_path = None
            if path.exists() and backup:
                import shutil
                backup_path = path.with_suffix(path.suffix + ".bak")
                shutil.copy2(path, backup_path)
                logger.info(f"Created backup: {backup_path}")

            # Write file
            path.write_text(content, encoding=encoding)

            # Get metadata
            metadata = {
                "path": str(path),
                "size": len(content.encode(encoding)),
                "bytes_written": len(content.encode(encoding)),
                "encoding": encoding,
                "created": not path.exists(),
                "backup_path": str(backup_path) if backup_path else None
            }

            logger.info(f"Wrote {metadata['size']} bytes to {path}")

            return ToolResult(
                success=True,
                data={"path": str(path), "bytes_written": metadata["size"]},
                metadata=metadata
            )

        except PermissionError:
            return ToolResult(
                success=False,
                error=f"Permission denied writing to file: {path_str}"
            )
        except Exception as e:
            logger.exception(f"Error writing file: {path_str}")
            return ToolResult(
                success=False,
                error=f"Error writing file: {str(e)}"
            )

    def _is_path_allowed(self, path: Path) -> bool:
        """Check if path is within allowed directories"""
        # TODO: Implement proper path filtering
        return True
