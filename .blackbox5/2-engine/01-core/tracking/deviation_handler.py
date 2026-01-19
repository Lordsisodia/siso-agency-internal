"""
4-Rule Deviation Handling - Autonomous Error Recovery

This module implements Component 4 of the GSD framework: Deviation Handling.
It provides autonomous recovery from common task failures using the 4-Rule system:

1. Bug Fix Rule: Fix code bugs (test failures, runtime errors)
2. Missing Dependency Rule: Install missing packages
3. Task Blockage Rule: Unblock external dependencies
4. Critical Addition Rule: Add missing critical features
"""

from enum import Enum
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List
from datetime import datetime
import re
import logging

logger = logging.getLogger(__name__)


class DeviationType(Enum):
    """Types of deviations that can be recovered from"""
    BUG = "bug"  # Test failure, runtime error in code
    MISSING_DEPENDENCY = "missing_dep"  # ImportError, ModuleNotFoundError
    BLOCKAGE = "blockage"  # External API timeout, network error
    CRITICAL_MISSING = "critical_missing"  # Validation error, missing required field
    UNKNOWN = "unknown"  # Unrecognized deviation


@dataclass
class Deviation:
    """Represents a detected deviation"""
    deviation_type: DeviationType
    error_message: str
    error_type: str
    context: Dict[str, Any]
    suggested_fixes: List[str]
    timestamp: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'deviation_type': self.deviation_type.value,
            'error_message': self.error_message,
            'error_type': self.error_type,
            'context': self.context,
            'suggested_fixes': self.suggested_fixes,
            'timestamp': self.timestamp.isoformat()
        }

    def __str__(self) -> str:
        """String representation"""
        return f"Deviation({self.deviation_type.value}: {self.error_type}: {self.error_message})"


class DeviationHandler:
    """
    Detects and handles task execution deviations using the 4-Rule system.

    The 4 Rules:
    1. Bug Fix Rule: Attempt to fix code bugs
    2. Missing Dependency Rule: Install missing packages
    3. Task Blockage Rule: Unblock external dependencies
    4. Critical Addition Rule: Add missing critical features

    This class provides:
    - Deviation detection from errors
    - Classification by type
    - Suggested fixes based on error analysis
    - Autonomous recovery attempts
    - Recovery attempt limiting to prevent infinite loops
    """

    def __init__(self, max_recovery_attempts: int = 3):
        """
        Initialize deviation handler.

        Args:
            max_recovery_attempts: Maximum recovery attempts per deviation type
        """
        self.max_recovery_attempts = max_recovery_attempts
        self.recovery_history: List[Dict[str, Any]] = []

        # Error patterns for deviation detection
        self.bug_patterns = [
            re.compile(r"AssertionError", re.IGNORECASE),
            re.compile(r"TestFailed", re.IGNORECASE),
            re.compile(r"Traceback.*Error", re.IGNORECASE),
            re.compile(r"Failed.*test", re.IGNORECASE),
            re.compile(r"NameError", re.IGNORECASE),
            re.compile(r"AttributeError", re.IGNORECASE),
            re.compile(r"TypeError", re.IGNORECASE),
            re.compile(r"ValueError", re.IGNORECASE),
        ]

        self.dependency_patterns = [
            re.compile(r"ImportError", re.IGNORECASE),
            re.compile(r"ModuleNotFoundError", re.IGNORECASE),
            re.compile(r"No module named", re.IGNORECASE),
            re.compile(r"cannot import", re.IGNORECASE),
        ]

        self.blockage_patterns = [
            re.compile(r"Timeout", re.IGNORECASE),
            re.compile(r"Connection.*refused", re.IGNORECASE),
            re.compile(r"Connection.*reset", re.IGNORECASE),
            re.compile(r"Network.*unreachable", re.IGNORECASE),
            re.compile(r"API.*error", re.IGNORECASE),
            re.compile(r"HTTP.*5\d\d", re.IGNORECASE),  # 5xx server errors
            re.compile(r"ReadTimeout", re.IGNORECASE),
            re.compile(r"ConnectTimeout", re.IGNORECASE),
        ]

        self.critical_patterns = [
            re.compile(r"ValidationError", re.IGNORECASE),
            re.compile(r"required.*field", re.IGNORECASE),
            re.compile(r"missing.*required", re.IGNORECASE),
            re.compile(r"KeyError.*required", re.IGNORECASE),
            re.compile(r"\bNotFound\b", re.IGNORECASE),  # Word boundary to avoid ModuleNotFoundError
        ]

    def detect_deviation(
        self,
        error: Exception,
        task_context: Dict[str, Any]
    ) -> Optional[Deviation]:
        """
        Detect deviation type from error.

        Analyzes the error message and type to classify the deviation.
        Returns a Deviation object with suggested fixes if recognized,
        or None if the error is unrecoverable.

        Args:
            error: The exception that occurred
            task_context: Context about the task (description, files, etc.)

        Returns:
            Deviation object if detected, None if unrecoverable
        """
        error_message = str(error)
        error_type = type(error).__name__

        logger.debug(f"Detecting deviation from {error_type}: {error_message[:100]}")

        # For pattern matching, include both error type and message
        # This ensures we catch exceptions where str(error) doesn't include the type
        full_error_text = f"{error_type}: {error_message}"

        # Check each deviation type in order of priority
        # Critical patterns checked first for "required field" errors
        if self._matches_patterns(full_error_text, self.critical_patterns):
            return Deviation(
                deviation_type=DeviationType.CRITICAL_MISSING,
                error_message=error_message,
                error_type=error_type,
                context=task_context,
                suggested_fixes=self._suggest_critical_fixes(full_error_text, task_context)
            )

        # Dependency patterns checked second
        elif self._matches_patterns(full_error_text, self.dependency_patterns):
            return Deviation(
                deviation_type=DeviationType.MISSING_DEPENDENCY,
                error_message=error_message,
                error_type=error_type,
                context=task_context,
                suggested_fixes=self._suggest_dependency_fixes(full_error_text)
            )

        # Blockage patterns checked third
        elif self._matches_patterns(full_error_text, self.blockage_patterns):
            return Deviation(
                deviation_type=DeviationType.BLOCKAGE,
                error_message=error_message,
                error_type=error_type,
                context=task_context,
                suggested_fixes=self._suggest_blockage_fixes(full_error_text, task_context)
            )

        # Bug patterns checked last (catch-all for most errors)
        elif self._matches_patterns(full_error_text, self.bug_patterns):
            return Deviation(
                deviation_type=DeviationType.BUG,
                error_message=error_message,
                error_type=error_type,
                context=task_context,
                suggested_fixes=self._suggest_bug_fixes(full_error_text, task_context)
            )

        return None

    def _matches_patterns(
        self,
        error_message: str,
        patterns: List[re.Pattern]
    ) -> bool:
        """Check if error message matches any pattern"""
        return any(pattern.search(error_message) for pattern in patterns)

    def _suggest_bug_fixes(
        self,
        error_message: str,
        context: Dict[str, Any]
    ) -> List[str]:
        """
        Suggest fixes for bugs based on error analysis.

        Parses the error message for clues like:
        - File and line number from traceback
        - Variable names from NameError
        - Attribute names from AttributeError
        - Type information from TypeError
        """
        fixes = []

        # Extract file and line from traceback
        traceback_match = re.search(r'File "([^"]+)", line (\d+)', error_message)
        if traceback_match:
            file_path = traceback_match.group(1)
            line_num = traceback_match.group(2)
            fixes.append(f"Check {file_path}:{line_num} for the bug")

        # Check for common error types
        if "NameError" in error_message:
            match = re.search(r"name '(\w+)' is not defined", error_message)
            if match:
                var_name = match.group(1)
                fixes.append(f"Define variable: {var_name}")

        elif "AttributeError" in error_message:
            match = re.search(r"'(\w+)' object has no attribute '(\w+)'", error_message)
            if match:
                obj_type, attr = match.groups()
                fixes.append(f"Add attribute '{attr}' to {obj_type} object")
                fixes.append(f"Check spelling of attribute '{attr}'")

            # Handle 'NoneType' has no attribute
            match = re.search(r"'NoneType' object has no attribute '(\w+)'", error_message)
            if match:
                attr = match.group(1)
                fixes.append(f"Object is None when trying to access '{attr}'")
                fixes.append(f"Add check: if obj is not None before accessing '{attr}'")

        elif "TypeError" in error_message:
            if "not callable" in error_message:
                fixes.append("Object is not callable - check that you're calling a function")
                fixes.append("Verify the object is callable (has __call__ method)")
            elif "unsupported operand" in error_message:
                fixes.append("Check operand types for this operation")
            elif "must be str" in error_message or "must be int" in error_message:
                fixes.append("Convert value to correct type before operation")
            elif "takes" in error_message and "positional argument" in error_message:
                fixes.append("Check number of arguments passed to function")

        elif "ValueError" in error_message:
            if "invalid literal" in error_message:
                fixes.append("Check value format and type conversion")
            elif "could not convert" in error_message:
                fixes.append("Verify value can be converted to target type")

        elif "AssertionError" in error_message:
            fixes.append("Check assertion condition")
            fixes.append("Verify expected vs actual values")

        return fixes

    def _suggest_dependency_fixes(self, error_message: str) -> List[str]:
        """Suggest fixes for missing dependencies"""
        fixes = []

        # Extract package name from error
        match = re.search(r"No module named '([^']+)'", error_message)
        if match:
            package = match.group(1)
            fixes.append(f"pip install {package}")
            fixes.append(f"Check if package name is correct: {package}")

        match = re.search(r"cannot import name '([^']+)' from '([^']+)'", error_message)
        if match:
            name, module = match.groups()
            fixes.append(f"Check if '{name}' exists in module '{module}'")
            fixes.append(f"Try: pip install {module}")
            fixes.append(f"Verify module version supports '{name}'")

        match = re.search(r"ImportError: ([^\n]+)", error_message)
        if match:
            fixes.append(f"Resolve import error: {match.group(1)}")

        return fixes

    def _suggest_blockage_fixes(
        self,
        error_message: str,
        context: Dict[str, Any]
    ) -> List[str]:
        """Suggest fixes for task blockages"""
        fixes = []

        if "timeout" in error_message.lower():
            fixes.append("Increase timeout value")
            fixes.append("Check if service is running and accessible")
            fixes.append("Verify network connection")

        if "connection" in error_message.lower():
            if "refused" in error_message.lower():
                fixes.append("Check if service is running on target host")
                fixes.append("Verify port number is correct")
            elif "reset" in error_message.lower():
                fixes.append("Check if service was restarted")
                fixes.append("Verify network stability")
            else:
                fixes.append("Check network connectivity")
                fixes.append("Verify service endpoint URL")

        if "api" in error_message.lower():
            fixes.append("Check API key and authentication")
            fixes.append("Verify API rate limits")
            fixes.append("Check API endpoint URL")

        if "HTTP" in error_message:
            match = re.search(r"HTTP (\d+)", error_message)
            if match:
                status_code = match.group(1)
                if status_code.startswith('5'):
                    fixes.append(f"Server error {status_code} - retry later")
                    fixes.append("Check service status page")
                elif status_code == '401':
                    fixes.append("Check authentication credentials")
                elif status_code == '403':
                    fixes.append("Check API permissions")
                elif status_code == '404':
                    fixes.append("Verify endpoint URL is correct")
                    fixes.append("Check if resource exists")

        return fixes

    def _suggest_critical_fixes(
        self,
        error_message: str,
        context: Dict[str, Any]
    ) -> List[str]:
        """Suggest fixes for critical missing features"""
        fixes = []

        match = re.search(r"required.*field.*['\"]([^'\"]+)['\"]", error_message)
        if match:
            field = match.group(1)
            fixes.append(f"Add required field: {field}")
            fixes.append(f"Include '{field}' in request/data")

        match = re.search(r"KeyError: ['\"]([^'\"]+)['\"]", error_message)
        if match:
            key = match.group(1)
            fixes.append(f"Add missing key: {key}")
            fixes.append(f"Check if '{key}' exists in dictionary")

        if "NotFound" in error_message:
            match = re.search(r"(\w+) not found", error_message, re.IGNORECASE)
            if match:
                entity = match.group(1)
                fixes.append(f"Create or verify {entity} exists")

        if "ValidationError" in error_message:
            fixes.append("Validate all required fields are present")
            fixes.append("Check field types and formats")
            fixes.append("Verify data constraints")

        return fixes

    async def recover_from_deviation(
        self,
        deviation: Deviation,
        task: Any,
        tools: Any
    ) -> bool:
        """
        Attempt to recover from a deviation.

        Checks recovery attempt limits and applies the appropriate
        recovery strategy based on deviation type.

        Args:
            deviation: The detected deviation
            task: The task that failed
            tools: Tool system for recovery actions (file ops, bash, etc.)

        Returns:
            True if recovery successful, False otherwise
        """
        # Get task ID for tracking
        task_id = getattr(task, 'task_id', getattr(task, 'agent_id', 'unknown'))

        # Check recovery attempt limit for this task and deviation type
        recent_attempts = [
            r for r in self.recovery_history
            if r['task_id'] == task_id
            and r['deviation_type'] == deviation.deviation_type.value
        ]

        if len(recent_attempts) >= self.max_recovery_attempts:
            logger.warning(
                f"Max recovery attempts ({self.max_recovery_attempts}) reached "
                f"for {deviation.deviation_type.value} on task {task_id}"
            )
            return False

        # Record recovery attempt
        self.recovery_history.append({
            'timestamp': datetime.now().isoformat(),
            'deviation_type': deviation.deviation_type.value,
            'error_message': deviation.error_message,
            'task_id': task_id,
        })

        logger.info(f"Attempting recovery for {deviation.deviation_type.value}: {deviation.error_type}")

        # Apply recovery strategy based on deviation type
        try:
            if deviation.deviation_type == DeviationType.BUG:
                return await self._recover_bug(deviation, task, tools)

            elif deviation.deviation_type == DeviationType.MISSING_DEPENDENCY:
                return await self._recover_dependency(deviation, tools)

            elif deviation.deviation_type == DeviationType.BLOCKAGE:
                return await self._recover_blockage(deviation, task, tools)

            elif deviation.deviation_type == DeviationType.CRITICAL_MISSING:
                return await self._recover_critical(deviation, task, tools)

        except Exception as e:
            logger.error(f"Recovery attempt failed with exception: {e}")
            return False

        return False

    async def _recover_bug(
        self,
        deviation: Deviation,
        task: Any,
        tools: Any
    ) -> bool:
        """
        Bug Fix Rule: Attempt to fix the bug.

        Strategy:
        1. Analyze error message to find file location
        2. Read the problematic file
        3. Apply heuristic fixes based on error type
        4. Write fixed content back
        5. Return True if fix applied

        Note: This is a simple heuristic-based approach. More sophisticated
        implementations could use LLM-based code generation for fixes.
        """
        logger.info(f"Attempting bug fix recovery for: {deviation.error_message[:100]}")

        # Extract file location from error
        file_match = re.search(r'File "([^"]+)", line (\d+)', deviation.error_message)
        if not file_match:
            logger.warning("Could not extract file location from error")
            return False

        file_path = file_match.group(1)
        line_num = int(file_match.group(2))

        # Try to read and fix the file
        try:
            # Use provided tools or fallback to direct file operations
            if tools and hasattr(tools, 'run'):
                # Using tool system
                result = await tools.run(
                    operation="file_read",
                    path=file_path
                )
                if not result.get('success'):
                    return False
                content = result.get('data', '')

                # Apply fixes
                fixed_content = self._apply_bug_fixes(
                    content,
                    line_num,
                    deviation.suggested_fixes,
                    deviation.error_message
                )

                # Write back
                await tools.run(
                    operation="file_write",
                    path=file_path,
                    content=fixed_content
                )
            else:
                # Direct file operations (fallback)
                with open(file_path, 'r') as f:
                    content = f.read()

                fixed_content = self._apply_bug_fixes(
                    content,
                    line_num,
                    deviation.suggested_fixes,
                    deviation.error_message
                )

                with open(file_path, 'w') as f:
                    f.write(fixed_content)

            logger.info(f"Applied bug fix to {file_path}:{line_num}")
            return True

        except FileNotFoundError:
            logger.error(f"File not found: {file_path}")
            return False
        except Exception as e:
            logger.error(f"Bug fix failed: {e}")
            return False

    def _apply_bug_fixes(
        self,
        content: str,
        line_num: int,
        suggested_fixes: List[str],
        error_message: str
    ) -> str:
        """Apply heuristic fixes to content"""
        lines = content.splitlines()

        # Simple heuristic fixes
        for fix in suggested_fixes:
            if "Define variable" in fix:
                var_match = re.search(r"Define variable: (\w+)", fix)
                if var_match:
                    var_name = var_match.group(1)
                    # Add variable definition before the line
                    insert_line = line_num - 1
                    if insert_line < len(lines):
                        lines.insert(insert_line, f"{var_name} = None  # Auto-fixed")
                    break

            elif "Add check" in fix and "None" in fix:
                # Add None check before the problematic line
                insert_line = line_num - 1
                if insert_line < len(lines):
                    indent_match = re.match(r'(\s*)', lines[insert_line])
                    indent = indent_match.group(1) if indent_match else ''
                    lines.insert(insert_line, f"{indent}# Auto-fix: Check for None")
                    lines.insert(insert_line + 1, f"{indent}if obj is not None:")
                    # Indent the original line
                    if insert_line + 2 < len(lines):
                        lines[insert_line + 2] = indent + "    " + lines[insert_line + 2].lstrip()
                break

        return "\n".join(lines)

    async def _recover_dependency(
        self,
        deviation: Deviation,
        tools: Any
    ) -> bool:
        """
        Missing Dependency Rule: Install missing package.

        Strategy:
        1. Parse import error for package name
        2. Run pip install
        3. Verify installation success

        Note: This is a simple implementation. More sophisticated versions
        could handle different package managers (npm, cargo, etc.)
        """
        logger.info(f"Attempting dependency recovery for: {deviation.error_message[:100]}")

        # Extract package name
        package_match = re.search(r"No module named '([^']+)'", deviation.error_message)
        if not package_match:
            logger.warning("Could not extract package name from error")
            return False

        package = package_match.group(1)

        try:
            if tools and hasattr(tools, 'run'):
                # Using tool system
                result = await tools.run(
                    operation="bash_execute",
                    command=f"pip install {package}",
                    timeout=120
                )
                success = result.get('success', False)
            else:
                # Direct subprocess (fallback)
                import subprocess
                result = subprocess.run(
                    ['pip', 'install', package],
                    capture_output=True,
                    text=True,
                    timeout=120
                )
                success = result.returncode == 0

            if success:
                logger.info(f"Successfully installed package: {package}")
                return True
            else:
                logger.warning(f"Failed to install package: {package}")
                return False

        except Exception as e:
            logger.error(f"Dependency install failed: {e}")
            return False

    async def _recover_blockage(
        self,
        deviation: Deviation,
        task: Any,
        tools: Any
    ) -> bool:
        """
        Task Blockage Rule: Attempt to unblock task.

        Strategy:
        1. Identify blockage type (timeout, connection, etc.)
        2. Apply appropriate unblocking action
        3. Retry with adjusted parameters

        Note: Most blockages require human intervention or significant
        retries. This implementation logs suggestions for now.
        """
        logger.info(f"Attempting blockage recovery for: {deviation.error_message[:100]}")

        # Log suggestions for manual intervention
        for suggestion in deviation.suggested_fixes:
            logger.info(f"Blockage suggestion: {suggestion}")

        # Blockage recovery typically requires:
        # - Retrying with exponential backoff
        # - Checking service health
        # - Verifying credentials
        # These are better handled at the orchestrator level

        return False  # Blockage recovery requires orchestrator-level retry logic

    async def _recover_critical(
        self,
        deviation: Deviation,
        task: Any,
        tools: Any
    ) -> bool:
        """
        Critical Addition Rule: Add missing critical feature.

        Strategy:
        1. Identify what's missing
        2. Generate implementation
        3. Add to codebase

        Note: Critical additions usually require human design decisions.
        This implementation logs suggestions for now.
        """
        logger.info(f"Attempting critical recovery for: {deviation.error_message[:100]}")

        # Log suggestions for implementation
        for suggestion in deviation.suggested_fixes:
            logger.info(f"Critical suggestion: {suggestion}")

        # Critical additions typically require:
        # - Understanding the domain model
        # - Designing the feature
        # - Implementing with proper validation
        # These are better handled by human developers

        return False  # Critical additions require human intervention

    def get_recovery_statistics(self) -> Dict[str, Any]:
        """
        Get statistics on recovery attempts.

        Returns:
            Dictionary with recovery statistics by type
        """
        by_type = {
            'bug': 0,
            'missing_dep': 0,
            'blockage': 0,
            'critical_missing': 0
        }

        for recovery in self.recovery_history:
            dev_type = recovery['deviation_type']
            if dev_type in by_type:
                by_type[dev_type] += 1

        return {
            'total_attempts': len(self.recovery_history),
            'by_type': by_type,
            'max_attempts_per_type': self.max_recovery_attempts
        }

    def clear_recovery_history(self) -> None:
        """Clear recovery history (useful for testing or fresh starts)"""
        self.recovery_history.clear()
        logger.info("Recovery history cleared")

    def get_recent_recoveries(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get most recent recovery attempts.

        Args:
            limit: Maximum number of recent recoveries to return

        Returns:
            List of recent recovery attempts
        """
        return self.recovery_history[-limit:]
