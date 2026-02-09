#!/usr/bin/env python3
"""
Model Profile Manager for Blackbox3
Scale-adaptive intelligence based on task complexity

Based on BMAD-METHOD model profiles
"""

from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import yaml


class ModelProfileManager:
    """
    Manages model profile selection and switching

    Profiles:
    - fast: Quick, low-cost, simple tasks
    - balanced: General-purpose, good quality
    - hq: High quality, complex tasks

    Auto-switching based on:
    - Task complexity
    - Token count
    - Importance level
    """

    def __init__(self, config_path: Path):
        """
        Initialize model profile manager

        Args:
            config_path: Path to model-profiles.yaml
        """
        self.config_path = Path(config_path)
        self.profiles = self._load_profiles()
        self.defaults = self.profiles.get('defaults', {})
        self.auto_upgrade_rules = self.profiles.get('auto_upgrade', [])

    def _load_profiles(self) -> Dict[str, Any]:
        """Load model profiles from config"""
        if not self.config_path.exists():
            return self._default_profiles()

        with open(self.config_path, 'r') as f:
            return yaml.safe_load(f)

    def _default_profiles(self) -> Dict[str, Any]:
        """Default profiles if config not found"""
        return {
            "profiles": {
                "fast": {
                    "model_id": "claude-3-5-haiku-20250108",
                    "max_tokens": 16384,
                    "temperature": 0.7
                },
                "balanced": {
                    "model_id": "claude-3-5-sonnet-20241022",
                    "max_tokens": 8192,
                    "temperature": 0.5
                },
                "hq": {
                    "model_id": "claude-3-5-sonnet-20241022",
                    "max_tokens": 200000,
                    "temperature": 0.3
                }
            },
            "defaults": {
                "orchestrator": "balanced",
                "dev": "balanced"
            }
        }

    def get_profile_for_agent(self,
                             agent_type: str,
                             task_complexity: str = "medium",
                             token_count: int = 0,
                             importance: str = "normal") -> str:
        """
        Select appropriate model profile for agent and task

        Args:
            agent_type: Type of agent (e.g., "architect", "dev")
            task_complexity: simple | medium | complex
            token_count: Estimated token count
            importance: low | normal | high | critical

        Returns:
            Profile name (fast, balanced, hq)
        """
        # Start with default profile for agent type
        profile = self.defaults.get(agent_type, 'balanced')

        # Apply auto-upgrade rules
        for rule in self.auto_upgrade_rules:
            condition = rule.get('condition')
            target = rule.get('target_profile')

            # Check condition
            if self._evaluate_condition(condition, task_complexity, token_count, importance):
                profile = target

        return profile

    def _evaluate_condition(self,
                           condition: str,
                           task_complexity: str,
                           token_count: int,
                           importance: str) -> bool:
        """Evaluate auto-upgrade condition"""
        # Task complexity conditions
        if f"task_complexity == '{task_complexity}'" == condition:
            return True

        # Token count conditions
        if "token_count > " in condition:
            threshold = int(condition.split("> ")[1])
            return token_count > threshold

        if "token_count < " in condition:
            threshold = int(condition.split("< ")[1])
            return token_count < threshold

        # Importance conditions
        if f"importance == '{importance}'" == condition:
            return True

        return False

    def get_model_config(self, profile_name: str) -> Dict[str, Any]:
        """
        Get model configuration for profile

        Args:
            profile_name: Name of profile (fast, balanced, hq)

        Returns:
            Model configuration dictionary
        """
        profiles = self.profiles.get('profiles', {})

        if profile_name not in profiles:
            raise ValueError(f"Unknown profile: {profile_name}")

        return profiles[profile_name]

    def get_all_profiles(self) -> Dict[str, Dict[str, Any]]:
        """Get all available profiles"""
        return self.profiles.get('profiles', {})

    def get_profile_summary(self, profile_name: str) -> Dict[str, Any]:
        """
        Get summary information for a profile

        Args:
            profile_name: Name of profile

        Returns:
            Profile summary
        """
        config = self.get_model_config(profile_name)

        return {
            "name": config.get('name', profile_name),
            "description": config.get('description', ''),
            "model_id": config.get('model_id', ''),
            "max_tokens": config.get('max_tokens', 0),
            "temperature": config.get('temperature', 0.7),
            "timeout": config.get('timeout', 60),
            "cost_level": config.get('cost_level', 'unknown'),
            "use_cases": config.get('use_cases', []),
            "capabilities": config.get('capabilities', []),
            "limitations": config.get('limitations', [])
        }

    def estimate_cost(self, profile_name: str, input_tokens: int, output_tokens: int) -> float:
        """
        Estimate cost for using profile

        Args:
            profile_name: Name of profile
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens

        Returns:
            Estimated cost in USD
        """
        config = self.get_model_config(profile_name)
        cost_per_1m = config.get('estimated_cost_per_1m_tokens', 3.0)

        total_tokens = input_tokens + output_tokens
        cost = (total_tokens / 1_000_000) * cost_per_1m

        return cost

    def check_cost_limits(self, profile_name: str,
                         input_tokens: int,
                         output_tokens: int) -> Dict[str, Any]:
        """
        Check if operation is within cost limits

        Args:
            profile_name: Name of profile
            input_tokens: Input token count
            output_tokens: Output token count

        Returns:
            {
                "within_limits": bool,
                "estimated_cost": float,
                "limits": dict,
                "warning": str (if over limit)
            }
        """
        cost_limits = self.profiles.get('cost_limits', {})
        estimated_cost = self.estimate_cost(profile_name, input_tokens, output_tokens)

        max_operation = cost_limits.get('max_cost_per_operation', 1.0)

        within_limits = estimated_cost <= max_operation

        result = {
            "within_limits": within_limits,
            "estimated_cost": estimated_cost,
            "limits": cost_limits,
            "max_cost_per_operation": max_operation
        }

        if not within_limits:
            result['warning'] = f"Estimated cost ${estimated_cost:.4f} exceeds limit ${max_operation}"

        return result

    def get_optimal_profile(self,
                           agent_type: str,
                           requirements: Dict[str, Any]) -> str:
        """
        Get optimal profile based on requirements analysis

        Args:
            agent_type: Agent type
            requirements: Requirements dict with:
                - complexity: simple | medium | complex
                - token_estimate: int
                - importance: low | normal | high | critical
                - time_constraint: bool
                - quality_requirement: low | medium | high

        Returns:
            Optimal profile name
        """
        complexity = requirements.get('complexity', 'medium')
        tokens = requirements.get('token_estimate', 0)
        importance = requirements.get('importance', 'normal')
        quality = requirements.get('quality_requirement', 'medium')
        time_constrained = requirements.get('time_constraint', False)

        # High quality requirement → hq
        if quality == 'high' or importance == 'critical':
            return 'hq'

        # Time constrained → fast or balanced
        if time_constrained:
            if complexity == 'simple':
                return 'fast'
            else:
                return 'balanced'

        # Use standard selection
        return self.get_profile_for_agent(agent_type, complexity, tokens, importance)

    def get_profile_stats(self) -> Dict[str, Any]:
        """
        Get statistics about profiles

        Returns:
            Profile statistics
        """
        profiles = self.get_all_profiles()

        stats = {
            "total_profiles": len(profiles),
            "profiles": list(profiles.keys()),
            "defaults": self.defaults,
            "auto_upgrade_rules": len(self.auto_upgrade_rules),
            "cost_limits": self.profiles.get('cost_limits', {})
        }

        return stats

    def should_upgrade_profile(self,
                             current_profile: str,
                             new_requirements: Dict[str, Any]) -> Tuple[bool, str, str]:
        """
        Determine if profile should be upgraded based on requirements

        Args:
            current_profile: Current profile name
            new_requirements: New requirements dict

        Returns:
            (should_upgrade, current_profile, suggested_profile)
        """
        complexity = new_requirements.get('complexity', 'medium')
        tokens = new_requirements.get('token_estimate', 0)
        importance = new_requirements.get('importance', 'normal')

        suggested_profile = self.get_profile_for_agent(
            "generic",  # Don't use agent default
            complexity,
            tokens,
            importance
        )

        # Define upgrade hierarchy
        profile_hierarchy = {
            'fast': 1,
            'balanced': 2,
            'hq': 3
        }

        current_level = profile_hierarchy.get(current_profile, 0)
        suggested_level = profile_hierarchy.get(suggested_profile, 0)

        should_upgrade = suggested_level > current_level

        return (should_upgrade, current_profile, suggested_profile)


class ModelProfileSelector:
    """
    Utility class for easy profile selection in agents

    Usage:
        selector = ModelProfileSelector(config_path)
        profile = selector.select_profile("architect", requirements)
        config = selector.get_config(profile)
    """

    def __init__(self, config_path: Path):
        self.manager = ModelProfileManager(config_path)

    def select_profile(self,
                     agent_type: str,
                     requirements: Optional[Dict[str, Any]] = None) -> str:
        """
        Select profile for agent

        Args:
            agent_type: Type of agent
            requirements: Optional requirements dict

        Returns:
            Selected profile name
        """
        if requirements is None:
            # Use default for agent type
            return self.manager.defaults.get(agent_type, 'balanced')

        return self.manager.get_optimal_profile(agent_type, requirements)

    def get_config(self, profile_name: str) -> Dict[str, Any]:
        """Get configuration for profile"""
        return self.manager.get_model_config(profile_name)

    def get_profile_with_config(self,
                               agent_type: str,
                               requirements: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Get profile name and configuration together

        Args:
            agent_type: Type of agent
            requirements: Optional requirements

        Returns:
            {
                "profile": "profile_name",
                "config": {...}
            }
        """
        profile = self.select_profile(agent_type, requirements)
        config = self.get_config(profile)

        return {
            "profile": profile,
            "config": config
        }
