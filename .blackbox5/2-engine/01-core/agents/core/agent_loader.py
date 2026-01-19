"""
Agent Loader for Blackbox 5

This module provides dynamic agent loading and registration functionality.
Discovers agents from configured paths and manages the agent registry.
"""

import asyncio
import importlib
import importlib.util
import inspect
import logging
from pathlib import Path
from typing import Dict, List, Optional, Type

from .base_agent import BaseAgent, AgentConfig

logger = logging.getLogger(__name__)


class AgentLoader:
    """
    Dynamic agent loading and registration system.

    Discovers, loads, and manages agent classes from configured directories.
    Supports both Python modules and YAML-based agent definitions.
    """

    def __init__(self, agents_path: Optional[Path] = None):
        """
        Initialize the agent loader.

        Args:
            agents_path: Path to directory containing agent definitions
        """
        self.agents_path = agents_path or Path.cwd() / "agents"
        self._loaded_agents: Dict[str, Type[BaseAgent]] = {}
        self._agent_instances: Dict[str, BaseAgent] = {}

        logger.info(f"AgentLoader initialized with path: {self.agents_path}")

    async def load_all(self) -> Dict[str, BaseAgent]:
        """
        Load all available agents from the configured path.

        Searches for agent definitions in:
        1. Python modules with BaseAgent subclasses
        2. YAML agent definition files

        Returns:
            Dictionary mapping agent names to agent instances
        """
        logger.info("Loading all agents...")

        # Load Python agents
        await self._load_python_agents()

        # Load YAML agents
        await self._load_yaml_agents()

        # Instantiate all loaded agent classes
        for name, agent_class in self._loaded_agents.items():
            if name not in self._agent_instances:
                try:
                    # Get config from agent class
                    if hasattr(agent_class, 'get_default_config'):
                        config = agent_class.get_default_config()
                    else:
                        # Create default config
                        config = AgentConfig(
                            name=name,
                            full_name=agent_class.__name__,
                            role=agent_class.__name__.replace('Agent', ''),
                            category='general',
                            description=f"Auto-generated config for {agent_class.__name__}"
                        )

                    instance = agent_class(config)
                    self._agent_instances[name] = instance
                    logger.info(f"Instantiated agent: {name}")

                except Exception as e:
                    logger.error(f"Failed to instantiate agent {name}: {e}")

        logger.info(f"Loaded {len(self._agent_instances)} agents")

        return self._agent_instances

    async def _load_python_agents(self) -> None:
        """Load agents from Python modules."""
        if not self.agents_path.exists():
            logger.warning(f"Agents path does not exist: {self.agents_path}")
            return

        # Find all Python files
        python_files = list(self.agents_path.rglob("*.py"))

        for py_file in python_files:
            # Skip __init__ and test files
            if py_file.name.startswith("__") or "test" in py_file.name.lower():
                continue

            try:
                await self._load_agent_from_file(py_file)
            except Exception as e:
                logger.debug(f"Failed to load agents from {py_file}: {e}")

    async def _load_agent_from_file(self, file_path: Path) -> None:
        """
        Load agent classes from a Python file.

        Args:
            file_path: Path to Python file
        """
        # Create module spec
        module_name = file_path.stem
        spec = importlib.util.spec_from_file_location(module_name, file_path)

        if spec is None or spec.loader is None:
            logger.debug(f"Could not create spec for {file_path}")
            return

        # Load module
        module = importlib.util.module_from_spec(spec)
        sys_modules = sys.modules  # type: ignore
        sys_modules[module_name] = module

        try:
            spec.loader.exec_module(module)
        except Exception as e:
            logger.debug(f"Failed to load module {module_name}: {e}")
            return

        # Find BaseAgent subclasses
        for name, obj in inspect.getmembers(module):
            if (inspect.isclass(obj) and
                issubclass(obj, BaseAgent) and
                obj is not BaseAgent and
                not obj.__name__.startswith('_')):

                logger.info(f"Found agent class: {name} in {file_path}")
                self._loaded_agents[name] = obj

    async def _load_yaml_agents(self) -> None:
        """
        Load agents from YAML definition files.

        YAML agents are converted to Python classes dynamically.
        """
        yaml_files = list(self.agents_path.rglob("*.yaml")) + list(self.agents_path.rglob("*.yml"))

        for yaml_file in yaml_files:
            # Skip non-agent YAML files
            if "agent" not in yaml_file.name.lower():
                continue

            try:
                await self._load_agent_from_yaml(yaml_file)
            except Exception as e:
                logger.debug(f"Failed to load agent from {yaml_file}: {e}")

    async def _load_agent_from_yaml(self, yaml_file: Path) -> None:
        """
        Load an agent from a YAML definition file.

        Args:
            yaml_file: Path to YAML file
        """
        try:
            import yaml
        except ImportError:
            logger.warning("PyYAML not installed, skipping YAML agents")
            return

        with open(yaml_file, 'r') as f:
            data = yaml.safe_load(f)

        if not data or 'agent' not in data:
            return

        agent_data = data['agent']
        metadata = agent_data.get('metadata', {})
        persona = agent_data.get('persona', {})

        # Create agent name from metadata
        agent_id = metadata.get('id', '').replace('/', '_').replace('.md', '')
        if not agent_id:
            agent_id = yaml_file.stem

        # Create config
        config = AgentConfig(
            name=metadata.get('name', agent_id),
            full_name=metadata.get('title', agent_id.replace('_', ' ').title()),
            role=persona.get('role', 'Agent'),
            category='specialists',
            description=persona.get('identity', ''),
            capabilities=agent_data.get('capabilities', []),
        )

        # Create dynamic agent class
        class YamlAgent(BaseAgent):
            def __init__(self, cfg: AgentConfig):
                super().__init__(cfg)
                self.yaml_data = data

            async def execute(self, task: AgentTask) -> 'AgentResult':
                from .base_agent import AgentResult
                return AgentResult(
                    success=True,
                    output=f"YAML agent {self.name} processed: {task.description}",
                    metadata={"yaml_source": str(yaml_file)}
                )

            async def think(self, task: AgentTask) -> List[str]:
                return [
                    f"YAML agent {self.name} analyzing task",
                    f"Using persona: {self.config.role}",
                    "Processing based on YAML configuration"
                ]

        # Set class name
        YamlAgent.__name__ = metadata.get('title', agent_id).replace(' ', '')

        self._loaded_agents[agent_id] = YamlAgent
        logger.info(f"Loaded YAML agent: {agent_id}")

    def get_agent(self, name: str) -> Optional[BaseAgent]:
        """
        Get an agent instance by name.

        Args:
            name: Agent name

        Returns:
            Agent instance or None if not found
        """
        return self._agent_instances.get(name)

    def list_agents(self) -> List[str]:
        """
        List all loaded agent names.

        Returns:
            List of agent names
        """
        return list(self._agent_instances.keys())

    def get_agent_info(self, name: str) -> Optional[Dict[str, any]]:
        """
        Get information about an agent.

        Args:
            name: Agent name

        Returns:
            Agent info dictionary or None if not found
        """
        agent = self.get_agent(name)
        if agent:
            return agent.get_capabilities()
        return None

    async def reload_agent(self, name: str) -> Optional[BaseAgent]:
        """
        Reload a specific agent.

        Args:
            name: Agent name to reload

        Returns:
            Reloaded agent instance or None if not found
        """
        # Remove old instance
        if name in self._agent_instances:
            del self._agent_instances[name]

        # Reload all agents
        await self.load_all()

        return self.get_agent(name)


# Import sys for module loading
import sys
