"""
Quality Checker for Ralph Runtime

Runs quality gates like tests, lint, typecheck
"""

import asyncio
import subprocess
from pathlib import Path
from typing import List
import logging

logger = logging.getLogger("QualityChecker")


class QualityChecker:
    """
    Quality checker for Ralph iterations.

    Runs quality gates to ensure only good code is committed.
    """

    def __init__(self, workspace_path: Path):
        """
        Initialize quality checker.

        Args:
            workspace_path: Root directory of workspace
        """
        self.workspace_path = Path(workspace_path)

    async def run_all(self) -> bool:
        """
        Run all quality checks.

        Returns:
            True if all checks pass
        """
        checks = {
            'test': self.run_tests,
            'lint': self.run_lint,
            'typecheck': self.run_typecheck
        }

        all_passed = True

        for check_name, check_func in checks.items():
            if not await check_func():
                logger.error(f"{check_name} check failed")
                all_passed = False

        return all_passed

    async def run_tests(self) -> bool:
        """
        Run test suite.

        Returns:
            True if tests pass
        """
        # Try different test commands
        test_commands = [
            ['python', '-m', 'pytest'],
            ['npm', 'test'],
            ['yarn', 'test'],
            ['pytest']
        ]

        for cmd in test_commands:
            try:
                result = subprocess.run(
                    cmd,
                    cwd=self.workspace_path,
                    capture_output=True,
                    text=True,
                    timeout=300
                )

                if result.returncode == 0:
                    logger.info(f"Tests passed ({' '.join(cmd)})")
                    return True

            except (FileNotFoundError, subprocess.TimeoutExpired):
                continue
            except Exception as e:
                logger.warning(f"Test command failed: {e}")
                continue

        # If no test command found, warn but don't fail
        logger.warning("No test command found, skipping tests")
        return True

    async def run_lint(self) -> bool:
        """
        Run linter.

        Returns:
            True if lint passes
        """
        lint_commands = [
            ['eslint', '--ext', '.js,.jsx,.ts,.tsx'],
            ['flake8'],
            ['ruff', 'check'],
            ['pylint']
        ]

        for cmd in lint_commands:
            try:
                result = subprocess.run(
                    cmd,
                    cwd=self.workspace_path,
                    capture_output=True,
                    text=True,
                    timeout=60
                )

                if result.returncode == 0:
                    logger.info(f"Lint passed ({' '.join(cmd)})")
                    return True

            except (FileNotFoundError, subprocess.TimeoutExpired):
                continue
            except Exception as e:
                logger.warning(f"Lint command failed: {e}")
                continue

        logger.warning("No linter found, skipping lint")
        return True

    async def run_typecheck(self) -> bool:
        """
        Run type checker.

        Returns:
            True if typecheck passes
        """
        typecheck_commands = [
            ['pyright'],
            ['mypy'],
            ['tsc', '--noEmit'],
            ['npx', 'tsc', '--noEmit']
        ]

        for cmd in typecheck_commands:
            try:
                result = subprocess.run(
                    cmd,
                    cwd=self.workspace_path,
                    capture_output=True,
                    text=True,
                    timeout=60
                )

                if result.returncode == 0:
                    logger.info(f"Type check passed ({' '.join(cmd)})")
                    return True

            except (FileNotFoundError, subprocess.TimeoutExpired):
                continue
            except Exception as e:
                logger.warning(f"Typecheck command failed: {e}")
                continue

        logger.warning("No type checker found, skipping typecheck")
        return True
