"""
Black Box 5 Engine - Bash Tool

Tool for executing shell commands.
"""

import asyncio
import shlex
from typing import Optional, Dict, Any
import logging

from .base import BaseTool, ToolResult, ToolParameter, ToolRisk

logger = logging.getLogger("BashTool")


class BashExecuteTool(BaseTool):
    """
    Tool for executing shell commands.

    Supports:
    - Running shell commands with timeout
    - Capturing stdout/stderr
    - Working directory control
    - Environment variable control
    """

    name = "bash_execute"
    description = "Execute a shell command with optional timeout"
    risk = ToolRisk.HIGH
    parameters = [
        ToolParameter(
            name="command",
            type="str",
            description="Shell command to execute",
            required=True,
            min_length=1
        ),
        ToolParameter(
            name="timeout",
            type="int",
            description="Maximum execution time in seconds (default: 120)",
            required=False,
            default=120
        ),
        ToolParameter(
            name="cwd",
            type="str",
            description="Working directory for command execution",
            required=False,
            default=None
        ),
        ToolParameter(
            name="env",
            type="dict",
            description="Environment variables for command",
            required=False,
            default=None
        ),
        ToolParameter(
            name="shell",
            type="bool",
            description="Use shell for command execution",
            required=False,
            default=True
        ),
        ToolParameter(
            name="capture_output",
            type="bool",
            description="Capture stdout/stderr",
            required=False,
            default=True
        )
    ]

    async def run(self, **kwargs) -> ToolResult:
        """
        Execute a shell command.

        Args:
            command: Shell command to execute
            timeout: Maximum execution time in seconds
            cwd: Working directory
            env: Environment variables
            shell: Whether to use shell
            capture_output: Whether to capture output

        Returns:
            ToolResult with command output
        """
        # Validate parameters
        error = self.validate_parameters(kwargs)
        if error:
            return ToolResult(success=False, error=error)

        command = kwargs["command"]
        timeout = kwargs.get("timeout", 120)
        cwd = kwargs.get("cwd")
        env = kwargs.get("env")
        shell = kwargs.get("shell", True)
        capture_output = kwargs.get("capture_output", True)

        try:
            # Security check for dangerous commands
            if self._is_dangerous_command(command):
                logger.warning(f"Potentially dangerous command blocked: {command}")
                return ToolResult(
                    success=False,
                    error=f"Command contains potentially dangerous operations and was blocked: {command}"
                )

            # Prepare environment
            import os
            process_env = os.environ.copy()
            if env:
                process_env.update(env)

            # Prepare working directory
            work_dir = None
            if cwd:
                from pathlib import Path
                work_dir = Path(cwd).resolve()
                if not work_dir.exists():
                    return ToolResult(
                        success=False,
                        error=f"Working directory does not exist: {cwd}"
                    )

            # Execute command
            logger.info(f"Executing command: {command[:100]}...")

            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE if capture_output else None,
                stderr=asyncio.subprocess.PIPE if capture_output else None,
                cwd=work_dir,
                env=process_env
            )

            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=timeout
                )

                # Decode output
                stdout_text = stdout.decode('utf-8') if stdout else ""
                stderr_text = stderr.decode('utf-8') if stderr else ""

                # Prepare metadata
                metadata = {
                    "command": command,
                    "exit_code": process.returncode,
                    "timeout": timeout,
                    "cwd": str(work_dir) if work_dir else None,
                    "timed_out": False
                }

                # Check if command succeeded
                if process.returncode == 0:
                    return ToolResult(
                        success=True,
                        data={
                            "stdout": stdout_text,
                            "stderr": stderr_text,
                            "exit_code": process.returncode
                        },
                        metadata=metadata
                    )
                else:
                    # Command failed but executed
                    return ToolResult(
                        success=False,
                        error=f"Command failed with exit code {process.returncode}",
                        data={
                            "stdout": stdout_text,
                            "stderr": stderr_text,
                            "exit_code": process.returncode
                        },
                        metadata=metadata
                    )

            except asyncio.TimeoutError:
                # Kill process on timeout
                try:
                    process.kill()
                    await process.wait()
                except Exception:
                    pass

                return ToolResult(
                    success=False,
                    error=f"Command timed out after {timeout} seconds",
                    metadata={
                        "command": command,
                        "timeout": timeout,
                        "timed_out": True,
                        "cwd": str(work_dir) if work_dir else None
                    }
                )

        except PermissionError:
            return ToolResult(
                success=False,
                error=f"Permission denied executing command: {command[:100]}"
            )
        except FileNotFoundError:
            return ToolResult(
                success=False,
                error=f"Command or working directory not found"
            )
        except Exception as e:
            logger.exception(f"Error executing command")
            return ToolResult(
                success=False,
                error=f"Error executing command: {str(e)}"
            )

    def _is_dangerous_command(self, command: str) -> bool:
        """
        Check for potentially dangerous commands.

        This is a basic safety check. In production, you'd want more sophisticated filtering.
        """
        dangerous_patterns = [
            "rm -rf /",
            "rm -rf /*",
            "mkfs",
            "dd if=/dev/zero",
            ":(){ :|:& };:",  # fork bomb
            "chmod 000",
            "chown -R"
        ]

        command_lower = command.lower()
        for pattern in dangerous_patterns:
            if pattern.lower() in command_lower:
                return True

        return False
