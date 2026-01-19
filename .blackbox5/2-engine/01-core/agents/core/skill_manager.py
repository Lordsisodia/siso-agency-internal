"""
Skill Manager for Blackbox 5

This module provides skill discovery, loading, and management functionality.
Skills are reusable capabilities that can be attached to agents.
"""

import asyncio
import importlib
import importlib.util
import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Set, Any
from enum import Enum

logger = logging.getLogger(__name__)


class SkillType(Enum):
    """Types of skills."""
    OPERATION = "operation"      # Executable operations
    WORKFLOW = "workflow"        # Multi-step workflows
    KNOWLEDGE = "knowledge"      # Knowledge retrieval
    INTEGRATION = "integration"  # External system integrations
    TOOL = "tool"               # Utility tools


@dataclass
class Skill:
    """Represents a skill that can be used by agents."""
    name: str
    description: str
    category: str
    skill_type: SkillType = SkillType.OPERATION
    capabilities: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    enabled: bool = True

    def to_dict(self) -> Dict[str, Any]:
        """Convert skill to dictionary."""
        return {
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "type": self.skill_type.value,
            "capabilities": self.capabilities,
            "metadata": self.metadata,
            "enabled": self.enabled,
        }


class SkillManager:
    """
    Skill discovery and management system.

    Loads, organizes, and provides access to skills that agents can use.
    Supports skill discovery from Python modules and JSON definitions.
    """

    def __init__(self, skills_path: Optional[Path] = None):
        """
        Initialize the skill manager.

        Args:
            skills_path: Path to directory containing skill definitions
        """
        self.skills_path = skills_path or Path.cwd() / ".skills"
        self._skills: Dict[str, Skill] = {}
        self._skills_by_category: Dict[str, List[str]] = {}
        self._agent_skill_map: Dict[str, List[str]] = {}  # agent_name -> [skill_names]

        logger.info(f"SkillManager initialized with path: {self.skills_path}")

    async def load_all(self) -> List[Skill]:
        """
        Load all available skills from the configured path.

        Returns:
            List of loaded skills
        """
        logger.info("Loading all skills...")

        if not self.skills_path.exists():
            logger.warning(f"Skills path does not exist: {self.skills_path}")
            return []

        # Load JSON skills
        await self._load_json_skills()

        # Load Python skills
        await self._load_python_skills()

        # Organize by category
        self._organize_skills()

        logger.info(f"Loaded {len(self._skills)} skills")

        return list(self._skills.values())

    async def _load_json_skills(self) -> None:
        """Load skills from JSON definition files."""
        json_files = list(self.skills_path.rglob("*.json"))

        for json_file in json_files:
            try:
                with open(json_file, 'r') as f:
                    data = json.load(f)

                if 'name' not in data or 'description' not in data:
                    logger.debug(f"Skipping invalid skill file: {json_file}")
                    continue

                # Create skill
                skill_type = SkillType(data.get('type', 'operation'))
                skill = Skill(
                    name=data['name'],
                    description=data['description'],
                    category=data.get('category', 'general'),
                    skill_type=skill_type,
                    capabilities=data.get('capabilities', []),
                    metadata=data.get('metadata', {}),
                    enabled=data.get('enabled', True)
                )

                self._skills[skill.name] = skill
                logger.debug(f"Loaded JSON skill: {skill.name}")

            except Exception as e:
                logger.debug(f"Failed to load skill from {json_file}: {e}")

    async def _load_python_skills(self) -> None:
        """Load skills from Python modules."""
        python_files = list(self.skills_path.rglob("*.py"))

        for py_file in python_files:
            # Skip __init__ and test files
            if py_file.name.startswith("__") or "test" in py_file.name.lower():
                continue

            try:
                await self._load_skill_from_file(py_file)
            except Exception as e:
                logger.debug(f"Failed to load skills from {py_file}: {e}")

    async def _load_skill_from_file(self, file_path: Path) -> None:
        """
        Load skills from a Python file.

        Args:
            file_path: Path to Python file
        """
        # Create module spec
        module_name = f"skill_{file_path.stem}"
        spec = importlib.util.spec_from_file_location(module_name, file_path)

        if spec is None or spec.loader is None:
            return

        # Load module
        module = importlib.util.module_from_spec(spec)

        import sys
        sys_modules = sys.modules
        sys_modules[module_name] = module

        try:
            spec.loader.exec_module(module)
        except Exception as e:
            logger.debug(f"Failed to load skill module {module_name}: {e}")
            return

        # Find skill definitions
        for name, obj in vars(module).items():
            if name.startswith('_') or not inspect.isclass(obj):
                continue

            # Check if it's a skill class
            if hasattr(obj, '__skill_name__') or name.endswith('Skill'):
                try:
                    skill_info = getattr(obj, '__skill_info__', {})
                    skill = Skill(
                        name=getattr(obj, '__skill_name__', name),
                        description=skill_info.get('description', obj.__doc__ or ''),
                        category=skill_info.get('category', 'general'),
                        skill_type=SkillType(skill_info.get('type', 'operation')),
                        capabilities=skill_info.get('capabilities', []),
                        metadata=skill_info,
                    )
                    self._skills[skill.name] = skill
                    logger.debug(f"Loaded Python skill: {skill.name}")
                except Exception as e:
                    logger.debug(f"Failed to create skill from {name}: {e}")

    def _organize_skills(self) -> None:
        """Organize skills by category."""
        self._skills_by_category.clear()

        for skill_name, skill in self._skills.items():
            if skill.category not in self._skills_by_category:
                self._skills_by_category[skill.category] = []
            self._skills_by_category[skill.category].append(skill_name)

    def get_skill(self, name: str) -> Optional[Skill]:
        """
        Get a skill by name.

        Args:
            name: Skill name

        Returns:
            Skill or None if not found
        """
        return self._skills.get(name)

    def get_skills_by_category(self, category: str) -> List[Skill]:
        """
        Get all skills in a category.

        Args:
            category: Category name

        Returns:
            List of skills in the category
        """
        skill_names = self._skills_by_category.get(category, [])
        return [self._skills[name] for name in skill_names if name in self._skills]

    def list_categories(self) -> List[str]:
        """
        List all skill categories.

        Returns:
            List of category names
        """
        return sorted(self._skills_by_category.keys())

    def get_skills_for_agent(self, agent_name: str) -> List[Skill]:
        """
        Get skills that are available for a specific agent.

        Args:
            agent_name: Name of the agent

        Returns:
            List of skills available to the agent
        """
        # Check if agent has specific skills mapped
        if agent_name in self._agent_skill_map:
            skill_names = self._agent_skill_map[agent_name]
            return [self._skills[name] for name in skill_names if name in self._skills]

        # Return all enabled skills by default
        return [s for s in self._skills.values() if s.enabled]

    def map_skill_to_agent(self, skill_name: str, agent_name: str) -> bool:
        """
        Map a skill to an agent.

        Args:
            skill_name: Name of the skill
            agent_name: Name of the agent

        Returns:
            True if mapped successfully, False otherwise
        """
        if skill_name not in self._skills:
            logger.warning(f"Skill not found: {skill_name}")
            return False

        if agent_name not in self._agent_skill_map:
            self._agent_skill_map[agent_name] = []

        if skill_name not in self._agent_skill_map[agent_name]:
            self._agent_skill_map[agent_name].append(skill_name)
            logger.info(f"Mapped skill '{skill_name}' to agent '{agent_name}'")

        return True

    def register_skill(self, skill: Skill) -> None:
        """
        Register a new skill.

        Args:
            skill: Skill to register
        """
        self._skills[skill.name] = skill

        if skill.category not in self._skills_by_category:
            self._skills_by_category[skill.category] = []

        if skill.name not in self._skills_by_category[skill.category]:
            self._skills_by_category[skill.category].append(skill.name)

        logger.info(f"Registered skill: {skill.name}")

    def unregister_skill(self, name: str) -> bool:
        """
        Unregister a skill.

        Args:
            name: Name of skill to unregister

        Returns:
            True if unregistered, False if not found
        """
        if name in self._skills:
            skill = self._skills[name]
            category = skill.category

            del self._skills[name]

            if category in self._skills_by_category:
                self._skills_by_category[category].remove(name)

            # Remove from agent mappings
            for agent_name in self._agent_skill_map:
                if name in self._agent_skill_map[agent_name]:
                    self._agent_skill_map[agent_name].remove(name)

            logger.info(f"Unregistered skill: {name}")
            return True

        return False


# Import inspect for Python skill loading
import inspect
