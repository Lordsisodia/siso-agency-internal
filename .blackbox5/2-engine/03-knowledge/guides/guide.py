#!/usr/bin/env python3
"""
Guide - Main interface for agents.

This is what agents interact with. Simple, clear, minimal.
"""

from typing import Dict, List, Any, Optional
from pathlib import Path
import subprocess
import json

from .registry import OperationRegistry, get_registry, Operation
from .recipe import Recipe, CurrentStep, NextStep
from .executor import StepExecutor
from .catalog import GuideCatalog, get_catalog, GuideMatch


class Guide:
    """
    The Guide is the main interface for agents.

    It makes Blackbox 5 easy to use by:
    1. Announcing available operations (no discovery)
    2. Detecting when help is needed (context aware)
    3. Providing step-by-step instructions (no planning)
    4. Executing and verifying steps (no diagnosis)
    5. Providing exact error recovery (no ambiguity)

    The Guide uses smart routing to connect agents to the right guide
    automatically, without agents needing to know guide names.
    """

    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path).resolve()
        self.registry = get_registry()
        self.catalog = get_catalog()
        self.executor = StepExecutor(self.project_path)
        self.active_recipes: Dict[str, Recipe] = {}

    # ========== AGENT API: Discovery ==========

    def list_operations(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all available operations.

        This is how agents discover what's possible.
        The system announces its capabilities - no exploration needed.
        """
        if category:
            ops = self.registry.list_by_category(category)
        else:
            ops = self.registry.list_all()

        return [
            {
                "name": op.name,
                "description": op.description,
                "category": op.category,
                "steps_count": len(op.steps)
            }
            for op in ops
        ]

    def check_context(self, event: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Check if any guides match the current context.

        The system proactively offers help based on what the agent is doing.
        Agent doesn't need to ask - the system volunteers suggestions.
        """
        matches = self.catalog.find_by_context(event, context)

        return [
            {
                "guide": match.guide_name,
                "description": match.description,
                "suggestion": match.suggestion,
                "confidence": match.confidence,
                "estimated_time": match.estimated_time,
                "difficulty": match.difficulty
            }
            for match in matches
        ]

    def get_top_suggestion(self, event: str, context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Get the single best guide suggestion for the current context.

        This is what the system uses to offer help proactively.
        Only returns high-confidence matches (>= 0.7).
        """
        match = self.catalog.get_top_suggestion(event, context)

        if not match:
            return None

        return {
            "guide": match.guide_name,
            "description": match.description,
            "suggestion": match.suggestion,
            "confidence": match.confidence,
            "estimated_time": match.estimated_time,
            "difficulty": match.difficulty
        }

    def find_by_intent(self, intent: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Find guides based on agent intent.

        Agent says what they want (e.g., "test this code"),
        system finds the right guide.
        """
        matches = self.catalog.find_by_intent(intent, context)

        return [
            {
                "guide": match.guide_name,
                "description": match.description,
                "suggestion": match.suggestion,
                "confidence": match.confidence,
                "estimated_time": match.estimated_time
            }
            for match in matches
        ]

    def search_guides(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for guides by keyword.

        This is the fallback when agent wants to browse.
        """
        matches = self.catalog.search(query)

        return [
            {
                "guide": match.guide_name,
                "description": match.description,
                "confidence": match.confidence,
                "estimated_time": match.estimated_time,
                "difficulty": match.difficulty
            }
            for match in matches
        ]

    def list_categories(self) -> List[str]:
        """List all available guide categories."""
        return self.catalog.list_categories()

    def browse_category(self, category: str) -> List[Dict[str, Any]]:
        """Browse guides in a category."""
        matches = self.catalog.browse_category(category)

        return [
            {
                "guide": match.guide_name,
                "description": match.description,
                "estimated_time": match.estimated_time,
                "difficulty": match.difficulty
            }
            for match in matches
        ]

    # ========== AGENT API: Recipe Management ==========

    def start_operation(self, operation_name: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Start an operation and get the first step.

        The agent doesn't need to plan - just say what to do.
        The system returns the first step immediately.
        """
        operation = self.registry.get(operation_name)
        if not operation:
            return {
                "error": f"Operation '{operation_name}' not found"
            }

        # Create recipe
        recipe = Recipe(operation, context)
        self.active_recipes[recipe.id] = recipe

        # Start recipe
        current_step = recipe.start()

        return {
            "recipe_id": recipe.id,
            "operation": operation_name,
            "step": self._serialize_step(current_step),
            "summary": recipe.get_summary()
        }

    def get_current_step(self, recipe_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the current step for a recipe.

        Useful for resuming or checking state.
        """
        recipe = self.active_recipes.get(recipe_id)
        if not recipe:
            return None

        current_step = recipe.get_current_step()
        if not current_step:
            return None

        return self._serialize_step(current_step)

    # ========== AGENT API: Execution ==========

    def execute_step(self, recipe_id: str, output: Optional[str] = None,
                    execute_for_me: bool = True) -> Dict[str, Any]:
        """
        Execute the current step.

        If execute_for_me=True, the system executes the command.
        If execute_for_me=False, the agent provides the output.

        Returns what to do next.
        """
        recipe = self.active_recipes.get(recipe_id)
        if not recipe:
            return {
                "error": f"Recipe '{recipe_id}' not found"
            }

        current_step = recipe.get_current_step()
        if not current_step:
            return {
                "error": "No current step"
            }

        # Execute step if requested
        if execute_for_me:
            execution_result = self.executor.execute(current_step)
            output = execution_result["output"]
            error = execution_result.get("error")
        else:
            # Agent provided output
            error = None

        # Process result
        next_action = recipe.execute_step(output, error)

        return {
            "recipe_id": recipe_id,
            "action": next_action.action,
            "message": next_action.message,
            "step": self._serialize_step(next_action.step) if next_action.step else None,
            "fix_instruction": next_action.fix_instruction,
            "fix_command": next_action.fix_command,
            "summary": recipe.get_summary()
        }

    def retry_step(self, recipe_id: str) -> Dict[str, Any]:
        """Retry the current step."""
        recipe = self.active_recipes.get(recipe_id)
        if not recipe:
            return {"error": f"Recipe '{recipe_id}' not found"}

        recipe.retry_step()
        current_step = recipe.get_current_step()

        return {
            "message": "Step ready for retry",
            "step": self._serialize_step(current_step) if current_step else None
        }

    def skip_step(self, recipe_id: str) -> Dict[str, Any]:
        """Skip the current step."""
        recipe = self.active_recipes.get(recipe_id)
        if not recipe:
            return {"error": f"Recipe '{recipe_id}' not found"}

        recipe.skip_step()
        current_step = recipe.get_current_step()

        return {
            "message": "Step skipped",
            "step": self._serialize_step(current_step) if current_step else None,
            "summary": recipe.get_summary()
        }

    def pause_recipe(self, recipe_id: str) -> Dict[str, Any]:
        """Pause a recipe."""
        recipe = self.active_recipes.get(recipe_id)
        if not recipe:
            return {"error": f"Recipe '{recipe_id}' not found"}

        recipe.pause()

        return {
            "message": f"Recipe '{recipe_id}' paused",
            "summary": recipe.get_summary()
        }

    def resume_recipe(self, recipe_id: str) -> Dict[str, Any]:
        """Resume a paused recipe."""
        recipe = self.active_recipes.get(recipe_id)
        if not recipe:
            return {"error": f"Recipe '{recipe_id}' not found"}

        recipe.resume()
        current_step = recipe.get_current_step()

        return {
            "message": f"Recipe '{recipe_id}' resumed",
            "step": self._serialize_step(current_step) if current_step else None
        }

    # ========== AGENT API: Status ==========

    def get_recipe_status(self, recipe_id: str) -> Optional[Dict[str, Any]]:
        """Get the status of a recipe."""
        recipe = self.active_recipes.get(recipe_id)
        if not recipe:
            return None

        return recipe.get_summary()

    def list_active_recipes(self) -> List[Dict[str, Any]]:
        """List all active recipes."""
        return [
            recipe.get_summary()
            for recipe in self.active_recipes.values()
        ]

    # ========== Helper Methods ==========

    def _serialize_step(self, step: CurrentStep) -> Dict[str, Any]:
        """Serialize a CurrentStep to dictionary."""
        return {
            "step_number": step.step_number,
            "total_steps": step.total_steps,
            "name": step.name,
            "description": step.description,
            "instruction": step.instruction,
            "command": step.command,
            "expected_output": step.expected_output,
            "can_retry": step.can_retry,
            "can_skip": step.can_skip
        }

    # ========== Convenience Methods ==========

    def quick_test(self, file_path: str) -> Dict[str, Any]:
        """
        Quick test a file - auto-detect type and start testing.

        Convenience method for the most common use case.
        """
        file_path = str(file_path)
        context = {"file_path": file_path, "file_name": Path(file_path).name}

        # Find matching operation
        matching = self.registry.find_matching("file_written", context)

        if not matching:
            return {
                "error": f"No testing operation found for {file_path}"
            }

        # Use first match
        operation = matching[0]
        return self.start_operation(operation.name, context)

    def execute_full_recipe(self, operation_name: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a full recipe from start to finish.

        Executes all steps automatically. Use when you want the system
        to do everything without agent intervention.
        """
        # Start operation
        start_result = self.start_operation(operation_name, context)

        if "error" in start_result:
            return start_result

        recipe_id = start_result["recipe_id"]

        # Execute all steps
        while True:
            result = self.execute_step(recipe_id, execute_for_me=True)

            if result["action"] == "complete":
                return {
                    "status": "success",
                    "summary": result["summary"]
                }
            elif result["action"] == "abort":
                return {
                    "status": "failed",
                    "error": result["message"],
                    "summary": result["summary"]
                }
            elif result["action"] == "fix":
                # Apply fix and continue
                if result["fix_command"]:
                    self._run_command(result["fix_command"])
                # Continue with same step
            elif result["action"] == "retry":
                # Just retry
                continue
            else:
                # Proceed to next step
                continue

    def _run_command(self, command: str) -> Dict[str, Any]:
        """Run a command and return result."""
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=60,
                cwd=self.project_path
            )
            return {
                "output": result.stdout,
                "error": result.stderr if result.stderr else None,
                "returncode": result.returncode
            }
        except subprocess.TimeoutExpired:
            return {
                "output": "",
                "error": "Command timed out",
                "returncode": -1
            }
