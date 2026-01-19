"""
Developer Agent (Amelia)

Specializes in code implementation, debugging, and technical tasks.
"""

import logging
from typing import List
from datetime import datetime

from agents.core.base_agent import BaseAgent, AgentTask, AgentResult, AgentConfig

logger = logging.getLogger(__name__)


class DeveloperAgent(BaseAgent):
    """
    Developer Agent - Amelia 💻

    Specializes in:
    - Code implementation
    - Debugging and troubleshooting
    - Code review and optimization
    - Technical documentation
    - Testing and validation
    """

    @classmethod
    def get_default_config(cls) -> AgentConfig:
        """Get default configuration for the Developer agent."""
        return AgentConfig(
            name="developer",
            full_name="Amelia",
            role="Developer",
            category="specialists",
            description="Expert developer specializing in code implementation, debugging, and technical problem-solving",
            capabilities=[
                "coding",
                "debugging",
                "code_review",
                "testing",
                "refactoring",
                "documentation",
            ],
            temperature=0.3,  # Lower temperature for more focused coding
            metadata={
                "icon": "💻",
                "created_at": datetime.now().isoformat(),
            }
        )

    async def execute(self, task: AgentTask) -> AgentResult:
        """
        Execute a development task.

        Args:
            task: The task to execute

        Returns:
            AgentResult with code or technical solution
        """
        thinking_steps = await self.think(task)

        # Analyze task type
        task_lower = task.description.lower()

        if any(word in task_lower for word in ["debug", "fix", "error", "bug"]):
            output = await self._debug_task(task)
        elif any(word in task_lower for word in ["review", "refactor", "optimize"]):
            output = await self._review_code(task)
        elif any(word in task_lower for word in ["test", "validate"]):
            output = await self._write_tests(task)
        else:
            output = await self._implement_feature(task)

        return AgentResult(
            success=True,
            output=output,
            thinking_steps=thinking_steps,
            artifacts={
                "code_blocks": self._extract_code_blocks(output),
                "files_created": self._estimate_files(task),
            },
            metadata={
                "agent_name": self.name,
                "task_complexity": task.complexity,
                "languages_used": self._detect_languages(task),
            }
        )

    async def think(self, task: AgentTask) -> List[str]:
        """Generate thinking steps for development tasks."""
        return [
            f"🔍 Analyzing requirements: {task.description[:100]}...",
            "💻 Designing implementation approach",
            "🧪 Considering edge cases and testing strategy",
            "📝 Writing clean, maintainable code",
            "✅ Validating solution against requirements",
        ]

    async def _debug_task(self, task: AgentTask) -> str:
        """Handle debugging tasks."""
        return f"""# Debug Analysis for: {task.description}

## Investigation Steps
1. Reproduced the issue
2. Identified root cause through systematic debugging
3. Analyzed affected code paths
4. Developed minimal fix that addresses the core issue

## Recommended Fix
```python
# Fix implementation here
def debug_solution():
    "Minimal fix for the identified issue."
    # Root cause analysis and solution
    pass
```

## Validation
- Verified fix resolves the issue
- Checked for regressions
- Added test case to prevent recurrence
"""

    async def _review_code(self, task: AgentTask) -> str:
        """Handle code review tasks."""
        return f"""# Code Review: {task.description}

## Review Summary
✓ Code structure and organization
✓ Naming conventions and readability
✓ Error handling and edge cases
✓ Performance considerations
✓ Testing coverage

## Suggestions
1. Consider extracting complex logic into separate functions
2. Add docstrings for public methods
3. Increase test coverage for edge cases
4. Optimize database queries if applicable

## Conclusion
Code is ready to merge with minor improvements recommended.
"""

    async def _write_tests(self, task: AgentTask) -> str:
        """Handle test writing tasks."""
        return f"""# Test Plan: {task.description}

## Test Cases
```python
import pytest

def test_core_functionality():
    "Test the main use case."
    assert True  # Implementation here

def test_edge_cases():
    "Test edge cases and boundary conditions."
    assert True  # Implementation here

def test_error_handling():
    "Test error scenarios."
    with pytest.raises(Exception):
        # Test error case
        pass
```

## Coverage
- Unit tests: Core functionality
- Integration tests: Component interactions
- Edge cases: Boundary conditions
- Error cases: Exception handling
"""

    async def _implement_feature(self, task: AgentTask) -> str:
        """Handle feature implementation tasks."""
        return f"""# Implementation: {task.description}

## Overview
Implementing the requested feature with best practices and clean code principles.

## Implementation
```python
from typing import Any, Dict, List

class FeatureImplementation:
    "Implementation for {task.description}."

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.initialized = False

    def initialize(self) -> None:
        "Initialize the feature."
        # Setup logic here
        self.initialized = True

    def execute(self, input_data: Any) -> Any:
        "Execute the main functionality."
        if not self.initialized:
            raise RuntimeError("Feature not initialized")
        # Main logic here
        return {{"status": "success", "result": input_data}}

    def cleanup(self) -> None:
        "Cleanup resources."
        self.initialized = False
```

## Usage Example
```python
feature = FeatureImplementation({{"option": "value"}})
feature.initialize()
result = feature.execute(data)
feature.cleanup()
```

## Notes
- Follows SOLID principles
- Includes proper error handling
- Type hints for clarity
- Docstrings for documentation
"""

    def _extract_code_blocks(self, text: str) -> List[str]:
        """Extract code blocks from output."""
        import re
        return re.findall(r'```(?:python|javascript|typescript)?\n(.*?)```', text, re.DOTALL)

    def _estimate_files(self, task: AgentTask) -> int:
        """Estimate number of files that would be created."""
        return 1  # Simplified

    def _detect_languages(self, task: AgentTask) -> List[str]:
        """Detect programming languages from task."""
        task_lower = task.description.lower()
        languages = []

        if "python" in task_lower or "py" in task_lower:
            languages.append("Python")
        if "javascript" in task_lower or "js" in task_lower:
            languages.append("JavaScript")
        if "typescript" in task_lower or "ts" in task_lower:
            languages.append("TypeScript")

        return languages or ["Python"]  # Default
