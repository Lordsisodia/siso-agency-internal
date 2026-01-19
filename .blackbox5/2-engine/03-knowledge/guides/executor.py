#!/usr/bin/env python3
"""
Step Executor - Executes individual steps.

This is the "hands" of the system. It does what the guide says.
"""

import subprocess
from typing import Dict, Any, Optional
from pathlib import Path
import re

from .recipe import CurrentStep


class StepExecutor:
    """
    Executes individual steps defined by recipes.

    The executor is dumb - it just runs commands and reports results.
    All intelligence is in the guide/recipe system.
    """

    def __init__(self, project_path: Path):
        self.project_path = project_path

    def execute(self, step: CurrentStep) -> Dict[str, Any]:
        """
        Execute a step and return the result.

        This is straightforward command execution.
        No intelligence required - just run and report.
        """
        try:
            result = subprocess.run(
                step.command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=60,
                cwd=self.project_path
            )

            output = result.stdout if result.stdout else ""
            error = result.stderr if result.stderr else None

            # Check if command succeeded
            success = result.returncode == 0

            return {
                "success": success,
                "output": output,
                "error": error,
                "returncode": result.returncode
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": "",
                "error": f"Command timed out after 60 seconds",
                "returncode": -1
            }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": str(e),
                "returncode": -1
            }

    def dry_run(self, step: CurrentStep) -> Dict[str, Any]:
        """
        Show what would be executed without running it.

        Useful for preview or debugging.
        """
        return {
            "would_execute": step.command,
            "expected_output": step.expected_output,
            "working_directory": str(self.project_path)
        }
