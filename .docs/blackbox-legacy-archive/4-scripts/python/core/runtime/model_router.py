#!/usr/bin/env python3
"""
Model Router - Smart routing for GLM-4 and other models
Implements hierarchical model selection based on task complexity
"""

from pathlib import Path
from typing import Dict, Any, Optional, List
from enum import Enum
import re


class TaskComplexity(Enum):
    """Task complexity levels"""
    STRATEGIC_THINKING = "strategic_thinking"  # HQ model required
    CODE_WITH_FRAMEWORK = "code_with_framework"  # Balanced with framework
    STANDARD_EXECUTION = "standard_execution"  # Balanced
    VALIDATION = "validation"  # Fast model
    SIMPLE_OPERATION = "simple_operation"  # Fastest model


class ModelConfig:
    """Model configuration"""
    def __init__(self,
                 model: str,
                 provider: str,
                 temperature: float,
                 max_tokens: int,
                 framework: Optional[str] = None,
                 reason: str = ""):
        self.model = model
        self.provider = provider
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.framework = framework
        self.reason = reason

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "model": self.model,
            "provider": self.provider,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "framework": self.framework,
            "reason": self.reason
        }


class ModelRouter:
    """
    Routes tasks to appropriate models based on complexity

    Routing Strategy:
    - Strategic Thinking: GLM-4 Plus (current) → Claude Opus (future)
    - Code with Framework: Claude Sonnet / GLM-4 with framework
    - Standard Execution: Claude Sonnet / GLM-4
    - Validation: Claude Haiku / GLM-4 Fast
    - Simple Operations: Claude Haiku / GLM-4 Fast
    """

    def __init__(self, config_path: Optional[Path] = None):
        """Initialize model router"""
        self.config_path = config_path or Path(__file__).parent.parent.parent / "shared" / "schemas" / "model-router.yaml"

        # Load model configurations
        self.models = self._load_models()

        # Default to GLM-4 if available
        self.primary_model = "glm-4-plus"
        self.fallback_model = "claude-sonnet"

    def _load_models(self) -> Dict[str, Dict[str, Any]]:
        """Load available model configurations"""
        # Current models (GLM-4)
        # Future models (Claude)
        return {
            "glm-4-plus": {
                "provider": "zhipu",
                "model": "glm-4-plus",
                "temperature": 0.3,
                "max_tokens": 128000,
                "tier": "hq",
                "cost_per_1k_tokens": 0.005
            },
            "glm-4": {
                "provider": "zhipu",
                "model": "glm-4",
                "temperature": 0.5,
                "max_tokens": 128000,
                "tier": "balanced",
                "cost_per_1k_tokens": 0.003
            },
            "glm-4-flash": {
                "provider": "zhipu",
                "model": "glm-4-flash",
                "temperature": 0.7,
                "max_tokens": 128000,
                "tier": "fast",
                "cost_per_1k_tokens": 0.0001
            },
            "claude-opus": {
                "provider": "anthropic",
                "model": "claude-opus-4-20250514",
                "temperature": 0.3,
                "max_tokens": 200000,
                "tier": "hq",
                "cost_per_1k_tokens": 0.015
            },
            "claude-sonnet": {
                "provider": "anthropic",
                "model": "claude-sonnet-4-20250514",
                "temperature": 0.5,
                "max_tokens": 200000,
                "tier": "balanced",
                "cost_per_1k_tokens": 0.003
            },
            "claude-haiku": {
                "provider": "anthropic",
                "model": "claude-haiku-4-20250514",
                "temperature": 0.7,
                "max_tokens": 200000,
                "tier": "fast",
                "cost_per_1k_tokens": 0.001
            }
        }

    def route(self,
              task: Any,
              context: Optional[Dict[str, Any]] = None) -> ModelConfig:
        """
        Route task to appropriate model

        Args:
            task: Task (dict or Task object) with description, type, etc.
            context: Additional context (codebase, patterns, etc.)

        Returns:
            ModelConfig for the task
        """
        complexity = self._analyze_complexity(task, context)

        # Route based on complexity
        if complexity == TaskComplexity.STRATEGIC_THINKING:
            return self._get_hq_config()

        elif complexity == TaskComplexity.CODE_WITH_FRAMEWORK:
            return self._get_framework_config(context)

        elif complexity == TaskComplexity.STANDARD_EXECUTION:
            return self._get_balanced_config()

        elif complexity == TaskComplexity.VALIDATION:
            return self._get_fast_config()

        else:  # SIMPLE_OPERATION
            return self._get_fastest_config()

    def _analyze_complexity(self,
                           task: Any,
                           context: Optional[Dict[str, Any]]) -> TaskComplexity:
        """Analyze task complexity"""

        # Handle both dict and Task objects
        if hasattr(task, 'type'):
            task_type = task.type.lower()
            description = task.description.lower()
            importance = getattr(task, 'importance', None)
        else:
            task_type = task.get("type", "").lower()
            description = task.get("description", "").lower()
            importance = task.get("importance", None)

        # Strategic thinking indicators
        strategic_keywords = [
            "architect", "design", "plan", "strategy", "analyze",
            "research", "break down", "decompose", "evaluate",
            "complex", "system", "architecture"
        ]

        # Code with framework indicators
        framework_keywords = [
            "implement", "code", "build", "create", "feature",
            "function", "component", "module"
        ]

        # Validation indicators
        validation_keywords = [
            "validate", "check", "verify", "test", "review",
            "lint", "format", "inspect"
        ]

        # Simple operation indicators
        simple_keywords = [
            "list", "show", "get", "fetch", "read",
            "display", "print", "log"
        ]

        # Check for strategic thinking
        if (task_type in ["planning", "architecture", "analysis"] or
            any(kw in description for kw in strategic_keywords) or
            importance == "high"):
            return TaskComplexity.STRATEGIC_THINKING

        # Check for code with framework
        if (context and context.get("framework") or
            task_type in ["implementation", "coding"] or
            any(kw in description for kw in framework_keywords)):
            return TaskComplexity.CODE_WITH_FRAMEWORK

        # Check for validation
        if (task_type in ["validation", "testing", "review"] or
            any(kw in description for kw in validation_keywords)):
            return TaskComplexity.VALIDATION

        # Check for simple operations
        if (task_type in ["information", "listing"] or
            any(kw in description for kw in simple_keywords)):
            return TaskComplexity.SIMPLE_OPERATION

        # Default to standard execution
        return TaskComplexity.STANDARD_EXECUTION

    def _get_hq_config(self) -> ModelConfig:
        """Get HQ model configuration (for strategic thinking)"""
        # Prefer GLM-4 Plus (current), fallback to Claude Opus (future)
        if self.primary_model in ["glm-4-plus", "claude-opus"]:
            model_config = self.models[self.primary_model]
        else:
            model_config = self.models["glm-4-plus"]

        return ModelConfig(
            model=model_config["model"],
            provider=model_config["provider"],
            temperature=model_config["temperature"],
            max_tokens=model_config["max_tokens"],
            reason="Strategic thinking requires highest quality reasoning"
        )

    def _get_framework_config(self, context: Dict[str, Any]) -> ModelConfig:
        """Get framework-aware model configuration"""
        framework = context.get("framework", "standard") if context else "standard"

        # For framework-based tasks, use balanced model
        model_config = self.models[self.primary_model]
        if model_config["tier"] == "hq":
            # Downgrade to balanced if primary is HQ
            model_config = self.models["glm-4"]

        return ModelConfig(
            model=model_config["model"],
            provider=model_config["provider"],
            temperature=model_config["temperature"],
            max_tokens=model_config["max_tokens"],
            framework=framework,
            reason=f"Code execution with {framework} framework"
        )

    def _get_balanced_config(self) -> ModelConfig:
        """Get balanced model configuration"""
        model_config = self.models[self.primary_model]
        if model_config["tier"] == "hq":
            model_config = self.models["glm-4"]

        return ModelConfig(
            model=model_config["model"],
            provider=model_config["provider"],
            temperature=model_config["temperature"],
            max_tokens=model_config["max_tokens"],
            reason="Standard execution requires balanced quality/speed"
        )

    def _get_fast_config(self) -> ModelConfig:
        """Get fast model configuration"""
        # Use fastest available model
        if "glm-4-flash" in self.models:
            model_config = self.models["glm-4-flash"]
        else:
            model_config = self.models["claude-haiku"]

        return ModelConfig(
            model=model_config["model"],
            provider=model_config["provider"],
            temperature=model_config["temperature"],
            max_tokens=model_config["max_tokens"],
            reason="Validation and quick checks use fast model"
        )

    def _get_fastest_config(self) -> ModelConfig:
        """Get fastest model configuration"""
        # Use absolute fastest
        if "glm-4-flash" in self.models:
            model_config = self.models["glm-4-flash"]
        else:
            model_config = self.models["claude-haiku"]

        return ModelConfig(
            model=model_config["model"],
            provider=model_config["provider"],
            temperature=0.7,  # Higher temp for creative tasks
            max_tokens=model_config["max_tokens"],
            reason="Simple operations use fastest model"
        )

    def estimate_cost(self,
                      model_config: ModelConfig,
                      input_tokens: int,
                      output_tokens: int) -> float:
        """Estimate cost for a task"""
        model_name = model_config.model

        if model_name in self.models:
            cost_per_1k = self.models[model_name]["cost_per_1k_tokens"]
            total_tokens = input_tokens + output_tokens
            return (total_tokens / 1000) * cost_per_1k

        return 0.0

    def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available models"""
        models_list = []

        for model_name, config in self.models.items():
            models_list.append({
                "name": model_name,
                "provider": config["provider"],
                "tier": config["tier"],
                "max_tokens": config["max_tokens"],
                "cost_per_1k": config["cost_per_1k_tokens"]
            })

        return sorted(models_list, key=lambda x: x["cost_per_1k"])

    def set_primary_model(self, model_name: str):
        """Set primary model (for GLM-4 vs Claude preference)"""
        if model_name in self.models:
            self.primary_model = model_name
        else:
            raise ValueError(f"Unknown model: {model_name}")


# Singleton instance
_router_instance = None

def get_router() -> ModelRouter:
    """Get singleton router instance"""
    global _router_instance
    if _router_instance is None:
        _router_instance = ModelRouter()
    return _router_instance
