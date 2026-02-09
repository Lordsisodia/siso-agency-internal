"""
.blackbox v3 - Agent Loader
Load and initialize agents with their configuration
"""

import yaml
from pathlib import Path
from typing import Dict, Any, Optional, List


class AgentLoader:
    """Load and initialize agents with their configuration"""

    def __init__(self, blackbox_root: Path):
        """
        Initialize agent loader

        Args:
            blackbox_root: Path to .blackbox3 directory
        """
        self.blackbox_root = Path(blackbox_root)
        self.config_cache = {}

    def load_agent(self, agent_id: str) -> Dict[str, Any]:
        """
        Load agent by ID

        Args:
            agent_id: Agent ID (e.g., "agents/orchestrator")

        Returns:
            Agent state dictionary with merged configs

        Example:
            loader = AgentLoader(".blackbox3")
            orchestrator = loader.load_agent("agents/orchestrator")
        """
        # Resolve agent path
        agent_path = self._resolve_agent_path(agent_id)

        if not agent_path.exists():
            raise FileNotFoundError(f"Agent not found: {agent_id}")

        # Load agent YAML
        with open(agent_path, 'r') as f:
            agent_config = yaml.safe_load(f)

        # Extract module name
        module = agent_config['agent']['metadata']['module']

        # Load module config
        module_config = self._load_module_config(module)

        # Load project config
        project_config = self._load_project_config()

        # Load project status
        status_config = self._load_project_status()

        # Merge all configs
        agent_state = {
            'agent': agent_config['agent'],
            'module': module_config,
            'project': project_config,
            'status': status_config,
            'paths': self._resolve_paths(agent_config, module_config)
        }

        return agent_state

    def _resolve_agent_path(self, agent_id: str) -> Path:
        """Resolve agent ID to file path"""
        # Try core agents first
        core_path = self.blackbox_root / f"agents/{agent_id}.agent.yaml"
        if core_path.exists():
            return core_path

        # Try module agents
        module_path = self.blackbox_root / f"{agent_id}.agent.yaml"
        if module_path.exists():
            return module_path

        # Try direct path
        direct_path = self.blackbox_root / agent_id
        if direct_path.exists():
            return direct_path

        raise FileNotFoundError(f"Cannot resolve agent path: {agent_id}")

    def _load_module_config(self, module: str) -> Dict[str, Any]:
        """Load module configuration"""
        if module == "core":
            config_path = self.blackbox_root / "core" / "config.yaml"
        else:
            config_path = self.blackbox_root / f"modules/{module}/config.yaml"

        if config_path.exists():
            with open(config_path, 'r') as f:
                return yaml.safe_load(f)
        return {}

    def _load_project_config(self) -> Dict[str, Any]:
        """Load root project configuration"""
        config_path = self.blackbox_root / "config.yaml"

        with open(config_path, 'r') as f:
            return yaml.safe_load(f)

    def _load_project_status(self) -> Dict[str, Any]:
        """Load project status"""
        status_path = self.blackbox_root / "project-status.yaml"

        if status_path.exists():
            with open(status_path, 'r') as f:
                return yaml.safe_load(f)
        return {}

    def _resolve_paths(self, agent_config: Dict, module_config: Dict) -> Dict[str, str]:
        """Resolve all paths for this agent"""
        project_root = self.blackbox_root.parent
        module = agent_config['agent']['metadata']['module']

        return {
            'project_root': str(project_root),
            'blackbox_root': str(self.blackbox_root),
            'config_file': str(self.blackbox_root / "config.yaml"),
            'status_file': str(self.blackbox_root / "project-status.yaml"),
            'module_root': str(self.blackbox_root / f"modules/{module}") if module != "core" else str(self.blackbox_root / "core"),
            'module_data': str(self.blackbox_root / f"modules/{module}/data") if module != "core" else str(self.blackbox_root / "core/data"),
            'artifacts_root': str(self.blackbox_root / "artifacts"),
            'shared_data': str(self.blackbox_root / "shared/data")
        }

    def list_agents(self, module: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all available agents

        Args:
            module: Optional module filter

        Returns:
            List of agent metadata
        """
        agents = []

        if module == "core" or module is None:
            core_agents = self.blackbox_root / "agents"
            if core_agents.exists():
                for agent_file in core_agents.glob("*.agent.yaml"):
                    if agent_file.name.startswith("_"):
                        continue  # Skip templates
                    agent_info = self._parse_agent_info(agent_file)
                    if agent_info:
                        agents.append(agent_info)

        if module is None:
            # List all modules
            modules_dir = self.blackbox_root / "modules"
            if modules_dir.exists():
                for module_dir in modules_dir.iterdir():
                    if module_dir.is_dir() and (module_dir / "agents").exists():
                        for agent_file in (module_dir / "agents").glob("*.agent.yaml"):
                            agent_info = self._parse_agent_info(agent_file)
                            if agent_info:
                                agents.append(agent_info)
        elif module and module != "core":
            module_agents = self.blackbox_root / f"modules/{module}/agents"
            if module_agents.exists():
                for agent_file in module_agents.glob("*.agent.yaml"):
                    agent_info = self._parse_agent_info(agent_file)
                    if agent_info:
                        agents.append(agent_info)

        return agents

    def _parse_agent_info(self, agent_file: Path) -> Optional[Dict[str, Any]]:
        """Parse agent metadata from file"""
        try:
            with open(agent_file, 'r') as f:
                config = yaml.safe_load(f)

            metadata = config['agent']['metadata']
            return {
                'id': metadata['id'],
                'name': metadata['name'],
                'title': metadata['title'],
                'icon': metadata['icon'],
                'module': metadata['module'],
                'version': metadata.get('version', '1.0.0')
            }
        except Exception as e:
            print(f"Warning: Could not parse agent file {agent_file}: {e}")
            return None


if __name__ == "__main__":
    # Test agent loader
    loader = AgentLoader(".blackbox3")

    # List all agents
    print("Available Agents:")
    print("=" * 50)
    agents = loader.list_agents()
    for agent in agents:
        print(f"{agent['icon']} {agent['name']} - {agent['title']}")
        print(f"   Module: {agent['module']}")
        print(f"   ID: {agent['id']}")
        print()
