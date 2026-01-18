"""
Black Box 5 Engine - Skill Manager

Manages skill loading, parsing, and execution.
Skills are composable capabilities that agents can use.
"""

import yaml
import asyncio
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger("SkillManager")


class SkillType(Enum):
    """Skill types"""
    WORKFLOW = "workflow"
    ACTION = "action"
    VERIFY = "verify"
    ANALYSIS = "analysis"


class SkillComplexity(Enum):
    """Skill complexity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class SkillRisk(Enum):
    """Skill risk levels"""
    LOW = "low"
    MEDIUM = "medium"
    CRITICAL = "critical"


@dataclass
class Skill:
    """A skill definition"""
    name: str
    description: str
    type: SkillType
    agent: str  # Which agent can use this (or "all")
    complexity: SkillComplexity
    risk: SkillRisk
    context_cost: str  # low, medium, high
    tags: List[str]
    version: str
    category: str  # Directory category
    body: str  # Markdown body
    file_path: Path  # Source file

    # Metadata
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

    def can_be_used_by(self, agent_name: str) -> bool:
        """Check if an agent can use this skill"""
        return self.agent == "all" or self.agent == agent_name

    def get_context_cost(self) -> int:
        """Get estimated context cost in tokens"""
        cost_map = {"low": 1000, "medium": 5000, "high": 15000}
        return cost_map.get(self.context_cost, 5000)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "name": self.name,
            "description": self.description,
            "type": self.type.value,
            "agent": self.agent,
            "complexity": self.complexity.value,
            "risk": self.risk.value,
            "context_cost": self.context_cost,
            "tags": self.tags,
            "version": self.version,
            "category": self.category,
            "body": self.body,
            "file_path": str(self.file_path),
            "metadata": self.metadata
        }


class SkillManager:
    """
    Manages the skill system.

    Skills are loaded from `.skills/` directory and can be:
    - Composed with agents
    - Executed standalone
    - Combined into workflows
    """

    def __init__(self, skills_path: Optional[Path] = None):
        if skills_path is None:
            # Default to .blackbox5/engine/agents/.skills
            engine_root = Path(__file__).parent.parent.parent
            skills_path = engine_root / "agents" / ".skills"

        self.skills_path = skills_path
        self._skills: Dict[str, Skill] = {}
        self._categories: Dict[str, List[str]] = {}

    async def load_all(self) -> Dict[str, Skill]:
        """
        Load all skills from the filesystem.

        Returns:
            Dictionary mapping skill names to Skill objects
        """
        if not self.skills_path.exists():
            logger.warning(f"Skills path not found: {self.skills_path}")
            return {}

        logger.info(f"Loading skills from {self.skills_path}")

        # Scan categories
        for category_dir in self.skills_path.iterdir():
            if not category_dir.is_dir():
                continue

            category = category_dir.name
            self._categories[category] = []

            # Load skills in this category
            for skill_file in category_dir.glob("*.md"):
                skill = await self._load_skill(skill_file, category)
                if skill:
                    self._skills[skill.name] = skill
                    self._categories[category].append(skill.name)

        logger.info(f"Loaded {len(self._skills)} skills in {len(self._categories)} categories")

        return self._skills

    async def _load_skill(self, skill_file: Path, category: str) -> Optional[Skill]:
        """Load a single skill from markdown file"""
        try:
            content = skill_file.read_text()

            # Parse YAML frontmatter
            if not content.startswith("---"):
                logger.debug(f"No YAML frontmatter in {skill_file}")
                return None

            parts = content.split("---", 2)
            if len(parts) < 3:
                logger.debug(f"Invalid YAML frontmatter in {skill_file}")
                return None

            frontmatter = parts[1]
            body = parts[2].strip()

            # Parse YAML
            metadata = yaml.safe_load(frontmatter)

            # Extract required fields
            name = metadata.get("name")
            if not name:
                logger.debug(f"No name in {skill_file}")
                return None

            description = metadata.get("description", "")
            type_str = metadata.get("type", "action")
            agent = metadata.get("agent", "all")
            complexity_str = metadata.get("complexity", "medium")
            risk_str = metadata.get("risk", "low")
            context_cost = metadata.get("context_cost", "medium")
            tags = metadata.get("tags", [])
            version = metadata.get("version", "1.0.0")

            # Create skill
            skill = Skill(
                name=name,
                description=description,
                type=SkillType(type_str),
                agent=agent,
                complexity=SkillComplexity(complexity_str),
                risk=SkillRisk(risk_str),
                context_cost=context_cost,
                tags=tags,
                version=version,
                category=category,
                body=body,
                file_path=skill_file,
                metadata=metadata
            )

            return skill

        except yaml.YAMLError as e:
            logger.error(f"YAML error in {skill_file}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error loading skill {skill_file}: {e}")
            return None

    def get_skill(self, name: str) -> Optional[Skill]:
        """Get a skill by name"""
        return self._skills.get(name)

    def get_skills_for_agent(self, agent_name: str) -> List[Skill]:
        """Get all skills that an agent can use"""
        return [
            skill for skill in self._skills.values()
            if skill.can_be_used_by(agent_name)
        ]

    def get_skills_by_type(self, skill_type: SkillType) -> List[Skill]:
        """Get all skills of a specific type"""
        return [
            skill for skill in self._skills.values()
            if skill.type == skill_type
        ]

    def get_skills_by_category(self, category: str) -> List[Skill]:
        """Get all skills in a category"""
        return [
            skill for skill in self._skills.values()
            if skill.category == category
        ]

    def get_skills_by_tag(self, tag: str) -> List[Skill]:
        """Get all skills with a specific tag"""
        return [
            skill for skill in self._skills.values()
            if tag in skill.tags
        ]

    def search_skills(self, query: str) -> List[Skill]:
        """Search skills by name or description"""
        query_lower = query.lower()

        return [
            skill for skill in self._skills.values()
            if query_lower in skill.name.lower() or
               query_lower in skill.description.lower() or
               any(query_lower in tag.lower() for tag in skill.tags)
        ]

    def list_categories(self) -> List[str]:
        """List all skill categories"""
        return list(self._categories.keys())

    def list_skill_names(self) -> List[str]:
        """List all skill names"""
        return list(self._skills.keys())

    def get_category_summary(self) -> Dict[str, Dict[str, Any]]:
        """Get summary of skills by category"""
        summary = {}

        for category, skills in self._categories.items():
            summary[category] = {
                "count": len(skills),
                "skills": skills
            }

        return summary

    async def execute_skill(
        self,
        skill_name: str,
        context: Dict[str, Any]
    ) -> Any:
        """
        Execute a skill.

        This is a placeholder - actual execution depends on the skill type.

        Args:
            skill_name: Name of skill to execute
            context: Execution context

        Returns:
            Skill execution result
        """
        skill = self.get_skill(skill_name)

        if not skill:
            raise ValueError(f"Skill not found: {skill_name}")

        logger.info(f"Executing skill: {skill_name}")

        # Skill execution depends on type
        if skill.type == SkillType.WORKFLOW:
            return await self._execute_workflow(skill, context)
        elif skill.type == SkillType.ACTION:
            return await self._execute_action(skill, context)
        elif skill.type == SkillType.VERIFY:
            return await self._execute_verify(skill, context)
        else:
            logger.warning(f"Unknown skill type: {skill.type}")
            return None

    async def _execute_workflow(self, skill: Skill, context: Dict[str, Any]) -> Any:
        """Execute a workflow skill"""
        # Parse the workflow steps from skill body
        # Execute each step
        # Return result
        logger.debug(f"Executing workflow: {skill.name}")
        return {"workflow": skill.name, "status": "executed"}

    async def _execute_action(self, skill: Skill, context: Dict[str, Any]) -> Any:
        """Execute an action skill"""
        logger.debug(f"Executing action: {skill.name}")
        return {"action": skill.name, "status": "executed"}

    async def _execute_verify(self, skill: Skill, context: Dict[str, Any]) -> bool:
        """Execute a verification skill"""
        logger.debug(f"Executing verification: {skill.name}")
        return True

    def compose_skills(self, skill_names: List[str]) -> str:
        """
        Compose multiple skills into a workflow.

        Args:
            skill_names: List of skill names to compose

        Returns:
            Composed workflow description
        """
        skills = [self.get_skill(name) for name in skill_names]
        skills = [s for s in skills if s]

        if not skills:
            return "No skills to compose"

        composition = f"# Composed Workflow\n\n"
        composition += f"This workflow combines {len(skills)} skills:\n\n"

        for i, skill in enumerate(skills, 1):
            composition += f"## {i}. {skill.name}\n"
            composition += f"{skill.description}\n"
            composition += f"**Complexity:** {skill.complexity.value} | "
            composition += f"**Risk:** {skill.risk.value} | "
            composition += f"**Context Cost:** {skill.context_cost}\n\n"

        return composition
