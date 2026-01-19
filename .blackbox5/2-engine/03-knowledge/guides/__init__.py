#!/usr/bin/env python3
"""
Blackbox 5 Guide System

Makes Blackbox 5 easy to use for ANY agent - smart or dumb.

The core insight: Move all intelligence from the agent to the system.
The agent just needs to be able to read instructions and execute commands.
"""

from .guide import Guide
from .operation import Step, Trigger
from .registry import OperationRegistry, get_registry, Operation, TriggerCondition, StepDefinition
from .recipe import Recipe, RecipeStatus, CurrentStep, NextStep, StepResult
from .executor import StepExecutor

__version__ = "1.0.0"
__all__ = [
    "Guide",
    "Operation",
    "Step",
    "StepDefinition",
    "Trigger",
    "TriggerCondition",
    "OperationRegistry",
    "get_registry",
    "Recipe",
    "RecipeStatus",
    "CurrentStep",
    "NextStep",
    "StepResult",
    "StepExecutor",
]
