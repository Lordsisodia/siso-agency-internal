"""
Handoff Context Integration
Integrates context variables with agent handoff system
"""

from typing import Any, Dict, Optional
import subprocess
import json
from pathlib import Path


class HandoffContext:
    """
    Manages context during agent handoffs
    Integrates Python context variables with bash agent-handoff.sh

    Note: AgentContext is injected by the handoff-with-context.py script
    to avoid circular import issues with the types.py naming conflict.
    """

    def __init__(
        self,
        from_agent: str,
        to_agent: str,
        context_vars: Optional[Dict[str, Any]] = None,
        message: str = "Handing off work",
        AgentContext=None,
        context_var=None
    ):
        """
        Initialize handoff context

        Args:
            from_agent: Source agent name
            to_agent: Target agent name
            context_vars: Context variables to transfer
            message: Handoff message
            AgentContext: AgentContext class (injected)
            context_var: context_var class (injected)
        """
        self.from_agent = from_agent
        self.to_agent = to_agent
        self.context_vars = context_vars or {}
        self.message = message

        # Use injected AgentContext if available, otherwise use dict
        if AgentContext is not None:
            self.context = AgentContext(self.context_vars)
        else:
            # Fallback to simple dict wrapper
            self.context = type('SimpleContext', (), {
                'to_dict': lambda: self.context_vars,
                'to_json': lambda: json.dumps(self.context_vars, indent=2, default=str)
            })()

        # Determine paths
        self.script_dir = Path(__file__).parent.parent.parent
        self.handoff_script = self.script_dir / "agents" / "agent-handoff.sh"
        self.memory_dir = self.script_dir / ".memory" / "handoffs"

    def prepare_context(self) -> Dict[str, Any]:
        """
        Prepare context for handoff

        Returns:
            Context dictionary with metadata
        """
        return {
            "handoff_type": "context_aware",
            "from_agent": self.from_agent,
            "to_agent": self.to_agent,
            "message": self.message,
            "context_variables": self.context.to_dict()
        }

    def execute_handoff(
        self,
        context_dir: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute handoff using bash script

        Args:
            context_dir: Additional context directory path

        Returns:
            Handoff result dictionary
        """
        # Prepare context
        handoff_context = self.prepare_context()

        # Default context directory
        if context_dir is None:
            context_dir = str(self.script_dir / ".runtime" / "handoff_context")

        # Build command
        cmd = [
            str(self.handoff_script),
            "handoff",
            self.from_agent,
            self.to_agent,
            context_dir,
            self.message
        ]

        try:
            # Execute bash handoff script
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )

            return {
                "success": True,
                "from_agent": self.from_agent,
                "to_agent": self.to_agent,
                "context": handoff_context,
                "bash_output": result.stdout,
                "context_dir": context_dir
            }

        except subprocess.CalledProcessError as e:
            return {
                "success": False,
                "from_agent": self.from_agent,
                "to_agent": self.to_agent,
                "error": str(e),
                "stderr": e.stderr
            }

    def load_agent(self, agent_name: str) -> Dict[str, Any]:
        """
        Load agent configuration from Blackbox4 structure

        Args:
            agent_name: Name of agent to load

        Returns:
            Agent configuration dictionary
        """
        # Agents directory structure
        agents_dir = self.script_dir.parent / "1-agents"

        # Common agent paths
        agent_paths = [
            agents_dir / "1-core" / agent_name,
            agents_dir / "2-bmad" / agent_name,
            agents_dir / "3-research" / agent_name,
            agents_dir / "4-specialists" / agent_name,
            agents_dir / "5-enhanced" / agent_name,
        ]

        for agent_path in agent_paths:
            if agent_path.exists():
                # Look for agent configuration
                config_file = agent_path / "agent.yaml"
                prompt_file = agent_path / "prompt.md"

                agent_config = {
                    "name": agent_name,
                    "path": str(agent_path),
                    "exists": True
                }

                if config_file.exists():
                    with open(config_file, 'r') as f:
                        try:
                            import yaml
                            agent_config["config"] = yaml.safe_load(f)
                        except:
                            agent_config["config"] = None

                if prompt_file.exists():
                    with open(prompt_file, 'r') as f:
                        agent_config["prompt"] = f.read()

                return agent_config

        return {
            "name": agent_name,
            "exists": False,
            "error": f"Agent {agent_name} not found"
        }

    def save_context_file(
        self,
        filepath: Optional[str] = None
    ) -> str:
        """
        Save context to JSON file

        Args:
            filepath: Target file path

        Returns:
            Path to saved file
        """
        if filepath is None:
            filepath = str(
                self.memory_dir /
                f"{self.from_agent}-to-{self.to_agent}-context.json"
            )

        # Ensure directory exists
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)

        # Save context
        with open(filepath, 'w') as f:
            f.write(self.context.to_json())

        return filepath

    def __repr__(self) -> str:
        return (
            f"HandoffContext(from={self.from_agent}, "
            f"to={self.to_agent}, vars={len(self.context_vars)})"
        )
