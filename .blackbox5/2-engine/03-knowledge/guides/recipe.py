#!/usr/bin/env python3
"""
Recipe Engine - Converts operations into step-by-step guides.

The recipe manages all state so the agent doesn't have to.
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from enum import Enum
import json
from pathlib import Path
from datetime import datetime

from .registry import Operation, StepDefinition


class RecipeStatus(Enum):
    """Status of a recipe."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"


@dataclass
class StepResult:
    """Result of executing a step."""
    step_number: int
    status: str  # "success", "failed", "skipped"
    output: str
    error: Optional[str] = None
    retry_count: int = 0
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class CurrentStep:
    """The current step to execute."""
    step_number: int
    total_steps: int
    name: str
    description: str
    instruction: str
    command: str
    expected_output: str
    can_retry: bool
    can_skip: bool


@dataclass
class NextStep:
    """What to do next."""
    action: str  # "proceed", "retry", "fix", "abort"
    step: Optional[CurrentStep] = None
    fix_instruction: Optional[str] = None
    fix_command: Optional[str] = None
    message: str = ""


class Recipe:
    """
    A recipe is a step-by-step guide for completing an operation.

    The recipe tracks all state so the agent doesn't need to.
    """

    def __init__(self, operation: Operation, context: Dict[str, Any], recipe_id: str = None):
        self.operation = operation
        self.context = context
        self.id = recipe_id or self._generate_id()
        self.status = RecipeStatus.PENDING
        self.current_step_index = 0
        self.step_results: List[StepResult] = []
        self.created_at = datetime.now().isoformat()
        self.updated_at = datetime.now().isoformat()
        self.metadata: Dict[str, Any] = {}

    def _generate_id(self) -> str:
        """Generate a unique recipe ID."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{self.operation.name}_{timestamp}"

    def start(self) -> CurrentStep:
        """Start the recipe and return the first step."""
        self.status = RecipeStatus.IN_PROGRESS
        self.updated_at = datetime.now().isoformat()
        return self._get_current_step()

    def get_current_step(self) -> Optional[CurrentStep]:
        """Get the current step to execute."""
        if self.current_step_index >= len(self.operation.steps):
            return None

        step_def = self.operation.steps[self.current_step_index]
        return self._build_current_step(step_def)

    def _build_current_step(self, step_def: StepDefinition) -> CurrentStep:
        """Build a CurrentStep from a StepDefinition."""
        # Render command template with context
        command = self._render_template(step_def.command_template, self.context)

        return CurrentStep(
            step_number=self.current_step_index + 1,
            total_steps=len(self.operation.steps),
            name=step_def.name,
            description=step_def.description,
            instruction=self._generate_instruction(step_def),
            command=command,
            expected_output=step_def.expected_output or "Check output",
            can_retry=step_def.retry_on_failure,
            can_skip=False  # Most steps can't be skipped
        )

    def _generate_instruction(self, step_def: StepDefinition) -> str:
        """Generate human-readable instruction for the step."""
        instruction = f"{step_def.description}\n\n"
        instruction += f"Action: {step_def.action}\n"
        if step_def.command_template:
            rendered_cmd = self._render_template(step_def.command_template, self.context)
            instruction += f"Command: {rendered_cmd}\n"
        if step_def.expected_output:
            instruction += f"Expected: {step_def.expected_output}\n"
        return instruction

    def _render_template(self, template: str, context: Dict[str, Any]) -> str:
        """Render a template string with context."""
        if template is None:
            return ""

        result = template
        for key, value in context.items():
            placeholder = f"{{{key}}}"
            result = result.replace(placeholder, str(value))

        return result

    def execute_step(self, output: str, error: Optional[str] = None) -> NextStep:
        """
        Execute the current step with the given output.

        Returns what to do next.
        """
        step_def = self.operation.steps[self.current_step_index]

        # Determine if step succeeded
        success = self._check_success(step_def, output, error)

        # Record result
        result = StepResult(
            step_number=self.current_step_index + 1,
            status="success" if success else "failed",
            output=output,
            error=error
        )
        self.step_results.append(result)

        if success:
            return self._proceed_to_next()
        else:
            return self._handle_failure(step_def, output, error)

    def _check_success(self, step_def: StepDefinition, output: str, error: Optional[str]) -> bool:
        """Check if the step succeeded."""
        if error:
            return False

        # Check expected output if specified
        if step_def.expected_output:
            # Simple heuristic: if expected output is mentioned, success
            # This can be made more sophisticated
            if step_def.expected_output.lower() in output.lower():
                return True

        # If no error and output exists, consider it success
        return True

    def _proceed_to_next(self) -> NextStep:
        """Proceed to the next step."""
        self.current_step_index += 1
        self.updated_at = datetime.now().isoformat()

        if self.current_step_index >= len(self.operation.steps):
            # Recipe complete
            self.status = RecipeStatus.COMPLETED
            return NextStep(
                action="complete",
                message=f"✅ Recipe '{self.operation.name}' completed successfully!",
                step=None
            )

        # Get next step
        next_step_def = self.operation.steps[self.current_step_index]
        next_step = self._build_current_step(next_step_def)

        return NextStep(
            action="proceed",
            step=next_step,
            message=f"✅ Step {self.current_step_index} complete. Moving to step {self.current_step_index + 1}."
        )

    def _handle_failure(self, step_def: StepDefinition, output: str, error: Optional[str]) -> NextStep:
        """Handle step failure."""
        if step_def.fix_template:
            # We can auto-fix
            fix_command = self._render_template(step_def.fix_template, self.context)
            return NextStep(
                action="fix",
                fix_instruction="Something went wrong. Run this fix:",
                fix_command=fix_command,
                message=f"❌ Step failed. Auto-fix available."
            )
        elif step_def.retry_on_failure:
            # Can retry
            return NextStep(
                action="retry",
                step=self._get_current_step(),
                message=f"❌ Step failed. You can retry or check the error manually."
            )
        else:
            # Cannot proceed
            self.status = RecipeStatus.FAILED
            return NextStep(
                action="abort",
                message=f"❌ Recipe failed at step {self.current_step_index + 1}: {error or 'Unknown error'}",
                step=None
            )

    def retry_step(self):
        """Retry the current step."""
        if self.current_step_index < len(self.step_results):
            # Increment retry count
            self.step_results[-1].retry_count += 1

    def skip_step(self):
        """Skip the current step (if allowed)."""
        self.current_step_index += 1
        self.updated_at = datetime.now().isoformat()

    def pause(self):
        """Pause the recipe."""
        self.status = RecipeStatus.PAUSED
        self.updated_at = datetime.now().isoformat()

    def resume(self):
        """Resume a paused recipe."""
        self.status = RecipeStatus.IN_PROGRESS
        self.updated_at = datetime.now().isoformat()

    def get_summary(self) -> Dict[str, Any]:
        """Get a summary of the recipe."""
        successful = sum(1 for r in self.step_results if r.status == "success")
        failed = sum(1 for r in self.step_results if r.status == "failed")

        return {
            "id": self.id,
            "operation": self.operation.name,
            "status": self.status.value,
            "progress": {
                "current": self.current_step_index,
                "total": len(self.operation.steps),
                "percent": int(self.current_step_index / len(self.operation.steps) * 100)
            },
            "results": {
                "successful": successful,
                "failed": failed,
                "total": len(self.step_results)
            },
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    def to_dict(self) -> Dict[str, Any]:
        """Convert recipe to dictionary for serialization."""
        return {
            "id": self.id,
            "operation": self.operation.name,
            "context": self.context,
            "status": self.status.value,
            "current_step_index": self.current_step_index,
            "step_results": [
                {
                    "step_number": r.step_number,
                    "status": r.status,
                    "output": r.output,
                    "error": r.error,
                    "retry_count": r.retry_count,
                    "timestamp": r.timestamp
                }
                for r in self.step_results
            ],
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any], operation: Operation) -> "Recipe":
        """Restore recipe from dictionary."""
        recipe = cls(operation, data["context"], data["id"])
        recipe.status = RecipeStatus(data["status"])
        recipe.current_step_index = data["current_step_index"]
        recipe.created_at = data["created_at"]
        recipe.updated_at = data["updated_at"]
        recipe.metadata = data.get("metadata", {})

        # Restore step results
        for r_data in data["step_results"]:
            result = StepResult(
                step_number=r_data["step_number"],
                status=r_data["status"],
                output=r_data["output"],
                error=r_data.get("error"),
                retry_count=r_data.get("retry_count", 0),
                timestamp=r_data["timestamp"]
            )
            recipe.step_results.append(result)

        return recipe
