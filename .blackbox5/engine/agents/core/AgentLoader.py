"""
Black Box 5 Engine - Agent Loader

Loads agent configurations from the organized agent directory structure.
Parses YAML configs and prompts to instantiate agents.
"""

import yaml
import asyncio
from pathlib import Path
from typing import Dict, List, Optional, Type
import logging

from .BaseAgent import (
    BaseAgent,
    BMADAgent,
    GSDAgent,
    SpecialistAgent,
    AgentConfig,
    create_agent
)

logger = logging.getLogger("AgentLoader")


class AgentLoader:
    """
    Loads agents from the filesystem.

    Scans the organized agent directory structure and loads:
    - Agent configurations (YAML)
    - Agent prompts (Markdown)
    - Agent templates
    - Agent skills
    """

    def __init__(self, agents_path: Optional[Path] = None):
        if agents_path is None:
            # Default to engine/agents
            engine_root = Path(__file__).parent.parent.parent
            agents_path = engine_root / "agents"

        self.agents_path = agents_path
        self._agents: Dict[str, BaseAgent] = {}
        self._configs: Dict[str, AgentConfig] = {}
        self._skills: Dict[str, Dict] = {}

    async def load_all(self) -> Dict[str, BaseAgent]:
        """
        Load all agents from the filesystem.

        Returns:
            Dictionary mapping agent names to agent instances
        """
        logger.info(f"Loading agents from {self.agents_path}")

        # Load from each category
        categories = ["1-core", "2-bmad", "3-research", "4-specialists", "5-enhanced"]

        for category in categories:
            category_path = self.agents_path / category
            if category_path.exists():
                await self._load_category(category, category_path)

        # Load skills
        await self._load_skills()

        logger.info(f"Loaded {len(self._agents)} agents")

        return self._agents

    async def _load_category(self, category: str, category_path: Path) -> None:
        """Load all agents in a category"""
        logger.debug(f"Loading category: {category}")

        # Scan for agent directories
        for item in category_path.iterdir():
            if not item.is_dir():
                continue

            # Skip certain directories
            if item.name in ["templates", "examples", "schemas", "prompts", "context"]:
                continue

            # Load agent from this directory
            agent = await self._load_agent_directory(category, item)
            if agent:
                self._agents[agent.name] = agent

    async def _load_agent_directory(
        self,
        category: str,
        agent_dir: Path
    ) -> Optional[BaseAgent]:
        """Load a single agent from its directory"""
        # Look for agent.md or prompt.md
        agent_md = agent_dir / "agent.md"
        prompt_md = agent_dir / "prompt.md"
        config_yaml = agent_dir / "config.yaml"

        # Determine agent type from category
        agent_type = self._determine_agent_type(category)

        # Parse agent configuration
        config = None

        if config_yaml.exists():
            config = await self._parse_config_yaml(config_yaml, category)
        elif agent_md.exists():
            config = await self._parse_agent_md(agent_md, category)
        elif prompt_md.exists():
            config = await self._parse_prompt_md(prompt_md, category)

        if not config:
            logger.debug(f"No config found for {agent_dir.name}")
            return None

        # Set paths
        config.base_path = agent_dir
        if prompt_md.exists():
            config.prompt_path = prompt_md

        # Determine agent class
        agent_class = self._get_agent_class(agent_type, category)

        # Create agent instance
        try:
            agent = agent_class(config)
            await agent.initialize()
            return agent
        except Exception as e:
            logger.error(f"Failed to load agent {config.name}: {e}")
            return None

    def _determine_agent_type(self, category: str) -> str:
        """Determine agent type from category"""
        type_map = {
            "1-core": "bmad",  # Core agents use BMAD patterns
            "2-bmad": "bmad",
            "3-research": "bmad",  # Research agents use BMAD patterns
            "4-specialists": "specialist",
            "5-enhanced": "bmad"
        }
        return type_map.get(category, "bmad")

    def _get_agent_class(self, agent_type: str, category: str) -> Type[BaseAgent]:
        """Get the agent class for this type"""
        class_map = {
            "bmad": BMADAgent,
            "gsd": GSDAgent,
            "specialist": SpecialistAgent
        }
        return class_map.get(agent_type, BaseAgent)

    async def _parse_config_yaml(
        self,
        config_path: Path,
        category: str
    ) -> Optional[AgentConfig]:
        """Parse agent config from YAML file"""
        try:
            with open(config_path, "r") as f:
                data = yaml.safe_load(f)

            return AgentConfig(
                name=data.get("name", config_path.parent.name),
                full_name=data.get("full_name", data.get("name", "")),
                role=data.get("role", ""),
                category=category,
                icon=data.get("icon", "🤖"),
                description=data.get("description", ""),
                capabilities=data.get("capabilities", []),
                tools=data.get("tools", []),
                artifacts=data.get("artifacts", []),
                communication_style=data.get("communication_style", "professional"),
                context_budget=data.get("context_budget"),
                parallel_execution=data.get("parallel_execution", False)
            )
        except Exception as e:
            logger.error(f"Failed to parse {config_path}: {e}")
            return None

    async def _parse_agent_md(
        self,
        agent_md: Path,
        category: str
    ) -> Optional[AgentConfig]:
        """Parse agent config from agent.md file"""
        try:
            content = agent_md.read_text()

            # Simple parsing - look for key patterns
            name = agent_md.parent.name
            full_name = self._extract_field(content, "Full Name") or name
            role = self._extract_field(content, "Role") or "specialist"
            icon = self._extract_icon(content) or "🤖"
            description = self._extract_field(content, "Description") or ""
            capabilities = self._extract_list(content, "Capabilities")

            return AgentConfig(
                name=name,
                full_name=full_name,
                role=role,
                category=category,
                icon=icon,
                description=description,
                capabilities=capabilities,
                tools=[],
                artifacts=[]
            )
        except Exception as e:
            logger.error(f"Failed to parse {agent_md}: {e}")
            return None

    async def _parse_prompt_md(
        self,
        prompt_md: Path,
        category: str
    ) -> Optional[AgentConfig]:
        """Parse agent config from prompt.md file"""
        try:
            content = prompt_md.read_text()

            name = prompt_md.parent.name
            role = self._infer_role_from_content(content)
            icon = "🤖"
            description = "Agent"
            capabilities = []

            return AgentConfig(
                name=name,
                full_name=name,
                role=role,
                category=category,
                icon=icon,
                description=description,
                capabilities=capabilities,
                tools=[],
                artifacts=[]
            )
        except Exception as e:
            logger.error(f"Failed to parse {prompt_md}: {e}")
            return None

    def _extract_field(self, content: str, field: str) -> Optional[str]:
        """Extract a field value from markdown content"""
        # Look for patterns like "Field: value" or "**Field:** value"
        import re

        patterns = [
            rf"{field}:\s*(.+?)(?:\n|$)",
            rf"\*\*{field}\*\*:\s*(.+?)(?:\n|$)",
            rf"#{field}\s*(.+?)(?:\n|$)"
        ]

        for pattern in patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        return None

    def _extract_icon(self, content: str) -> Optional[str]:
        """Extract emoji icon from content"""
        import re
        emojis = re.findall(r'([\U0001F300-\U0001F9FF])', content)
        return emojis[0] if emojis else None

    def _extract_list(self, content: str, field: str) -> List[str]:
        """Extract a list field from markdown content"""
        import re

        # Look for bullet lists under a heading
        pattern = rf"{field}.*?\n((?:[\-*]\s+.+\n?)+)"
        match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)

        if match:
            list_text = match.group(1)
            items = re.findall(r'[\-*]\s+(.+)', list_text)
            return [item.strip() for item in items]

        return []

    def _infer_role_from_content(self, content: str) -> str:
        """Infer agent role from prompt content"""
        content_lower = content.lower()

        if "architect" in content_lower or "system design" in content_lower:
            return "architect"
        elif "developer" in content_lower or "implementation" in content_lower:
            return "developer"
        elif "analyst" in content_lower or "research" in content_lower:
            return "analyst"
        elif "pm" in content_lower or "project" in content_lower:
            return "pm"
        elif "orchestrat" in content_lower:
            return "orchestrator"
        else:
            return "specialist"

    async def _load_skills(self) -> Dict[str, Dict]:
        """Load all skills from .skills directory"""
        skills_path = self.agents_path / ".skills"

        if not skills_path.exists():
            return {}

        logger.debug(f"Loading skills from {skills_path}")

        for category_dir in skills_path.iterdir():
            if not category_dir.is_dir():
                continue

            category = category_dir.name
            self._skills[category] = {}

            for skill_file in category_dir.glob("*.md"):
                skill = await self._load_skill(skill_file, category)
                if skill:
                    self._skills[category][skill["name"]] = skill

        logger.debug(f"Loaded {sum(len(s) for s in self._skills.values())} skills")

        return self._skills

    async def _load_skill(self, skill_file: Path, category: str) -> Optional[Dict]:
        """Load a single skill from markdown file"""
        try:
            content = skill_file.read_text()

            # Parse YAML frontmatter
            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 3:
                    frontmatter = parts[1]
                    body = parts[2]

                    # Parse YAML
                    import yaml
                    metadata = yaml.safe_load(frontmatter)

                    return {
                        "name": metadata.get("name", skill_file.stem),
                        "description": metadata.get("description", ""),
                        "type": metadata.get("type", "action"),
                        "agent": metadata.get("agent", "all"),
                        "complexity": metadata.get("complexity", "medium"),
                        "risk": metadata.get("risk", "low"),
                        "context_cost": metadata.get("context_cost", "medium"),
                        "tags": metadata.get("tags", []),
                        "version": metadata.get("version", "1.0.0"),
                        "category": category,
                        "body": body.strip(),
                        "file_path": skill_file
                    }

        except Exception as e:
            logger.error(f"Failed to load skill {skill_file}: {e}")
            return None

    def get_agent(self, name: str) -> Optional[BaseAgent]:
        """Get a loaded agent by name"""
        return self._agents.get(name)

    def get_agents_by_category(self, category: str) -> List[BaseAgent]:
        """Get all agents in a category"""
        return [
            agent for agent in self._agents.values()
            if agent.category == category
        ]

    def get_agents_by_role(self, role: str) -> List[BaseAgent]:
        """Get all agents with a specific role"""
        return [
            agent for agent in self._agents.values()
            if agent.role == role
        ]

    def get_skill(self, category: str, name: str) -> Optional[Dict]:
        """Get a specific skill"""
        category_skills = self._skills.get(category, {})
        return category_skills.get(name)

    def get_all_skills(self) -> Dict[str, Dict]:
        """Get all loaded skills"""
        all_skills = {}
        for category_skills in self._skills.values():
            all_skills.update(category_skills)
        return all_skills

    def list_agents(self) -> List[str]:
        """List all loaded agent names"""
        return list(self._agents.keys())

    def list_skills(self) -> List[str]:
        """List all loaded skill names"""
        return list(self.get_all_skills().keys())
