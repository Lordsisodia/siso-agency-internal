#!/usr/bin/env python3
"""
Operation Registry - Declares what operations are available.

This is the "menu" that agents can read to see what's possible.
No discovery required - the system announces its capabilities.
"""

from typing import Dict, List, Callable, Any, Optional
from dataclasses import dataclass, field
from pathlib import Path
import yaml
import re


@dataclass
class TriggerCondition:
    """When to offer an operation."""
    event: str  # "file_written", "file_modified", "agent_idle", etc.
    pattern: Optional[str] = None  # File pattern to match
    min_confidence: float = 0.5  # Minimum confidence to offer


@dataclass
class StepDefinition:
    """Definition of a single step in an operation."""
    name: str
    description: str
    action: str  # "run_command", "check_file", "modify_file", etc.
    command_template: Optional[str] = None
    expected_output: Optional[str] = None
    timeout: int = 60
    retry_on_failure: bool = True
    fix_template: Optional[str] = None  # Command to auto-fix issues


@dataclass
class Operation:
    """An operation that can be performed."""
    name: str
    description: str
    category: str  # "testing", "validation", "generation", etc.
    triggers: List[TriggerCondition]
    steps: List[StepDefinition]
    dependencies: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def matches_context(self, event: str, context: Dict[str, Any]) -> bool:
        """Check if this operation matches the current context."""
        for trigger in self.triggers:
            if trigger.event == event:
                if trigger.pattern:
                    # Check if pattern matches
                    if "file_path" in context:
                        if re.match(trigger.pattern, context["file_path"]):
                            return True
                else:
                    return True
        return False


class OperationRegistry:
    """
    Registry of all available operations.

    Operations declare themselves - agents don't need to discover them.
    """

    def __init__(self):
        self.operations: Dict[str, Operation] = {}
        self._load_builtin_operations()

    def _load_builtin_operations(self):
        """Load built-in operations from definitions."""
        # Define testing operations
        self.register(Operation(
            name="test_python_code",
            description="Validate and test Python code",
            category="testing",
            triggers=[
                TriggerCondition(
                    event="file_written",
                    pattern=r".*\.py$"
                )
            ],
            steps=[
                StepDefinition(
                    name="validate_syntax",
                    description="Check Python syntax",
                    action="run_command",
                    command_template="python -m py_compile {file_path}",
                    expected_output="",  # No output = success
                    timeout=10,
                    fix_template=None  # Syntax errors need manual fix
                ),
                StepDefinition(
                    name="run_linter",
                    description="Check code quality with pylint",
                    action="run_command",
                    command_template="pylint {file_path} --output-format=json",
                    expected_output="JSON with score",
                    timeout=30,
                    fix_template="autopep8 --in-place {file_path}"
                ),
                StepDefinition(
                    name="type_check",
                    description="Check types with mypy",
                    action="run_command",
                    command_template="mypy {file_path}",
                    expected_output="Success or error report",
                    timeout=30,
                    fix_template=None
                ),
                StepDefinition(
                    name="generate_tests",
                    description="Generate unit tests",
                    action="generate_file",
                    command_template="blackbox5 generate-tests {file_path}",
                    expected_output="Test file created",
                    timeout=60,
                    fix_template=None
                ),
                StepDefinition(
                    name="run_tests",
                    description="Run generated tests",
                    action="run_command",
                    command_template="pytest test_{file_name} -v",
                    expected_output="Test results",
                    timeout=120,
                    fix_template=None
                )
            ]
        ))

        self.register(Operation(
            name="test_javascript_code",
            description="Validate and test JavaScript/TypeScript code",
            category="testing",
            triggers=[
                TriggerCondition(
                    event="file_written",
                    pattern=r".*\.(:?js|jsx|ts|tsx)$"
                )
            ],
            steps=[
                StepDefinition(
                    name="validate_syntax",
                    description="Check syntax",
                    action="run_command",
                    command_template="node --check {file_path}",
                    expected_output="",
                    timeout=10,
                    fix_template=None
                ),
                StepDefinition(
                    name="run_linter",
                    description="Check code quality with ESLint",
                    action="run_command",
                    command_template="npx eslint {file_path} --format=json",
                    expected_output="JSON report",
                    timeout=30,
                    fix_template="npx eslint {file_path} --fix"
                ),
                StepDefinition(
                    name="type_check",
                    description="Check TypeScript types",
                    action="run_command",
                    command_template="npx tsc --noEmit {file_path}",
                    expected_output="Success or type errors",
                    timeout=30,
                    fix_template=None
                ),
                StepDefinition(
                    name="generate_tests",
                    description="Generate Jest tests",
                    action="generate_file",
                    command_template="blackbox5 generate-tests {file_path}",
                    expected_output="Test file created",
                    timeout=60,
                    fix_template=None
                ),
                StepDefinition(
                    name="run_tests",
                    description="Run Jest tests",
                    action="run_command",
                    command_template="npx jest {test_file_path} --verbose",
                    expected_output="Test results",
                    timeout=120,
                    fix_template=None
                )
            ]
        ))

        self.register(Operation(
            name="validate_database_migration",
            description="Validate database migration",
            category="database",
            triggers=[
                TriggerCondition(
                    event="file_written",
                    pattern=r".*migrations/.*\.sql$"
                )
            ],
            steps=[
                StepDefinition(
                    name="validate_syntax",
                    description="Check SQL syntax",
                    action="run_command",
                    command_template="psql -f {file_path} --dry-run",
                    expected_output="Valid SQL",
                    timeout=10,
                    fix_template=None
                ),
                StepDefinition(
                    name="test_on_copy",
                    description="Test migration on database copy",
                    action="run_command",
                    command_template="blackbox5 test-migration {file_path} --dry-run",
                    expected_output="Migration tested",
                    timeout=60,
                    fix_template=None
                ),
                StepDefinition(
                    name="verify_rollback",
                    description="Verify rollback works",
                    action="run_command",
                    command_template="blackbox5 rollback-migration {file_path} --verify",
                    expected_output="Rollback verified",
                    timeout=60,
                    fix_template=None
                )
            ]
        ))

        # Add more operations as needed...

    def register(self, operation: Operation):
        """Register an operation."""
        self.operations[operation.name] = operation

    def get(self, name: str) -> Optional[Operation]:
        """Get an operation by name."""
        return self.operations.get(name)

    def list_all(self) -> List[Operation]:
        """List all registered operations."""
        return list(self.operations.values())

    def list_by_category(self, category: str) -> List[Operation]:
        """List operations by category."""
        return [op for op in self.operations.values() if op.category == category]

    def find_matching(self, event: str, context: Dict[str, Any]) -> List[Operation]:
        """Find operations that match the current context."""
        matching = []
        for op in self.operations.values():
            if op.matches_context(event, context):
                matching.append(op)
        return matching

    def load_from_file(self, path: Path):
        """Load operations from a YAML file."""
        with open(path) as f:
            data = yaml.safe_load(f)

        for op_data in data.get("operations", []):
            triggers = [
                TriggerCondition(**t) for t in op_data.get("triggers", [])
            ]
            steps = [
                StepDefinition(**s) for s in op_data.get("steps", [])
            ]
            operation = Operation(
                name=op_data["name"],
                description=op_data["description"],
                category=op_data["category"],
                triggers=triggers,
                steps=steps,
                dependencies=op_data.get("dependencies", []),
                metadata=op_data.get("metadata", {})
            )
            self.register(operation)

    def save_to_file(self, path: Path):
        """Save operations to a YAML file."""
        data = {
            "operations": []
        }

        for op in self.operations.values():
            op_data = {
                "name": op.name,
                "description": op.description,
                "category": op.category,
                "triggers": [
                    {
                        "event": t.event,
                        "pattern": t.pattern,
                        "min_confidence": t.min_confidence
                    }
                    for t in op.triggers
                ],
                "steps": [
                    {
                        "name": s.name,
                        "description": s.description,
                        "action": s.action,
                        "command_template": s.command_template,
                        "expected_output": s.expected_output,
                        "timeout": s.timeout,
                        "retry_on_failure": s.retry_on_failure,
                        "fix_template": s.fix_template
                    }
                    for s in op.steps
                ],
                "dependencies": op.dependencies,
                "metadata": op.metadata
            }
            data["operations"].append(op_data)

        with open(path, "w") as f:
            yaml.dump(data, f, default_flow_style=False)


# Global registry instance
_registry = None


def get_registry() -> OperationRegistry:
    """Get the global operation registry."""
    global _registry
    if _registry is None:
        _registry = OperationRegistry()
    return _registry
