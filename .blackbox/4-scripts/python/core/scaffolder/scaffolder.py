#!/usr/bin/env python3
"""
Template Scaffolder for Blackbox3
Generate agents, projects, and workflows from templates
"""

from pathlib import Path
from typing import Dict, Any, Optional, List
import yaml
import os
from datetime import datetime


class TemplateScaffolder:
    """
    Scaffolds agents, projects, and workflows from templates

    Supports:
    - Agent creation (simple, expert, module, orchestrator)
    - Project creation (minimal, standard, multi-repo)
    - Workflow creation (sequential, parallel, hierarchical)
    """

    def __init__(self, blackbox_root: Path):
        """
        Initialize template scaffolder

        Args:
            blackbox_root: Path to Blackbox3 root
        """
        self.blackbox_root = Path(blackbox_root)
        self.templates_dir = self.blackbox_root / "shared" / "schemas"
        self.agents_dir = self.blackbox_root / "core" / "agents"
        self.projects_dir = self.blackbox_root / "projects"

        # Load templates
        self.agent_templates = self._load_agent_templates()

    def _load_agent_templates(self) -> Dict[str, Any]:
        """Load agent templates from schema"""
        schema_path = self.templates_dir / "agent-templates.yaml"

        if not schema_path.exists():
            return {}

        with open(schema_path, 'r') as f:
            data = yaml.safe_load(f)

        return data.get('agent_templates', {})

    def scaffold_agent(self,
                      name: str,
                      agent_type: str = "simple",
                      options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Scaffold a new agent from template

        Args:
            name: Agent name
            agent_type: Type of agent (simple, expert, module, orchestrator)
            options: Additional options (domain, description, etc.)

        Returns:
            Scaffold result with created files
        """
        options = options or {}

        # Get template
        template = self.agent_templates.get(agent_type)

        if not template:
            return {
                "success": False,
                "error": f"Unknown agent type: {agent_type}"
            }

        # Create agent directory
        agent_dir = self.agents_dir / agent_type
        agent_name_dir = agent_dir / name

        if agent_name_dir.exists():
            return {
                "success": False,
                "error": f"Agent already exists: {agent_name_dir}"
            }

        agent_name_dir.mkdir(parents=True, exist_ok=True)

        # Create files from template
        created_files = []

        structure = template.get('structure', {})
        files = structure.get('files', [])

        for file_spec in files:
            file_path = agent_name_dir / file_spec['path']
            template_name = file_spec.get('template')

            # Create directory if needed
            file_path.parent.mkdir(parents=True, exist_ok=True)

            # Generate content from template
            content = self._generate_file_content(
                template_name,
                name=name,
                agent_type=agent_type,
                options=options
            )

            # Write file
            if content:
                file_path.write_text(content)
                created_files.append(str(file_path))

        # Create sidecar if needed
        if template.get('sidecar', False):
            sidecar_structure = template.get('sidecar_structure', [])
            sidecar_dir = agent_name_dir / "sidecar"

            for subdir in sidecar_structure:
                (sidecar_dir / subdir).mkdir(parents=True, exist_ok=True)
                created_files.append(str(sidecar_dir / subdir))

            # Create .gitkeep files
            for subdir in sidecar_structure:
                (sidecar_dir / subdir / ".gitkeep").write_text("")

        return {
            "success": True,
            "agent_name": name,
            "agent_type": agent_type,
            "directory": str(agent_name_dir),
            "files_created": created_files
        }

    def _generate_file_content(self,
                             template_name: str,
                             name: str,
                             agent_type: str,
                             options: Dict[str, Any]) -> Optional[str]:
        """
        Generate file content from template

        Args:
            template_name: Name of template
            name: Agent name
            agent_type: Type of agent
            options: Additional options

        Returns:
            Generated content or None
        """
        # Load template definitions
        template_files = self.agent_templates.get('template_files', {})
        template_content = template_files.get(template_name)

        if not template_content:
            return None

        # Generate class name from agent name
        class_name = ''.join(
            word.capitalize()
            for word in name.replace('-', ' ').replace('_', ' ').split()
        )

        # Replace placeholders
        content = template_content
        content = content.replace('{name}', name)
        content = content.replace('{ClassName}', class_name)
        content = content.replace('{type}', agent_type)

        # Replace options
        if 'domain' in options:
            content = content.replace('{domain}', options['domain'])
        else:
            content = content.replace('{domain}', name)

        if 'description' in options:
            content = content.replace('{description}', options['description'])
        else:
            content = content.replace('{description}', f"{name} agent")

        if 'purpose' in options:
            content = content.replace('{purpose}', options['purpose'])
        else:
            content = content.replace('{purpose}', f"{name} operations")

        return content

    def list_agent_templates(self) -> List[Dict[str, Any]]:
        """
        List available agent templates

        Returns:
            List of template information
        """
        templates = []

        for agent_type, template in self.agent_templates.items():
            if isinstance(template, dict) and 'name' in template:
                templates.append({
                    "type": agent_type,
                    "name": template['name'],
                    "description": template.get('description', ''),
                    "complexity": template.get('complexity', 'unknown'),
                    "sidecar": template.get('sidecar', False)
                })

        return templates

    def scaffold_project(self,
                        name: str,
                        project_type: str = "minimal",
                        options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Scaffold a new project from template

        Args:
            name: Project name
            project_type: Type of project (minimal, standard, multi_repo)
            options: Additional options

        Returns:
            Scaffold result
        """
        options = options or {}

        # Create project directory
        project_dir = self.projects_dir / name

        if project_dir.exists():
            return {
                "success": False,
                "error": f"Project already exists: {project_dir}"
            }

        project_dir.mkdir(parents=True, exist_ok=True)

        # Create README
        readme_content = f"""# {name} Project

Generated by Blackbox3 Template Scaffolder.
Project Type: {project_type}

## Getting Started

1. Configure agents in `.config/agents.yaml`
2. Define workflows in `.config/workflows.yaml`
3. Run your agents

## Structure
"""

        readme_path = project_dir / "README.md"
        readme_path.write_text(readme_content)

        # Create config directory
        config_dir = project_dir / "config"
        config_dir.mkdir(exist_ok=True)

        # Create project config
        project_config = {
            "name": name,
            "type": project_type,
            "created_at": datetime.now().isoformat(),
            "version": "1.0.0"
        }

        config_path = config_dir / "project.yaml"
        with open(config_path, 'w') as f:
            yaml.safe_dump(project_config, f, default_flow_style=False)

        # Create agents config
        agents_config = {
            "agents": [],
            "workflows": []
        }

        agents_config_path = config_dir / "agents.yaml"
        with open(agents_config_path, 'w') as f:
            yaml.safe_dump(agents_config, f, default_flow_style=False)

        created_files = [
            str(readme_path),
            str(config_path),
            str(agents_config_path)
        ]

        # Create additional directories based on project type
        if project_type in ["standard", "multi_repo"]:
            for dir_name in ["agents", "artifacts", "docs"]:
                (project_dir / dir_name).mkdir(exist_ok=True)
                created_files.append(str(project_dir / dir_name))

        if project_type == "standard":
            (project_dir / "workflows").mkdir(exist_ok=True)
            (project_dir / "tests").mkdir(exist_ok=True)
            (project_dir / "scripts").mkdir(exist_ok=True)

        if project_type == "multi_repo":
            repos_config = {"repos": []}
            repos_path = config_dir / "repos.yaml"
            with open(repos_path, 'w') as f:
                yaml.safe_dump(repos_config, f, default_flow_style=False)
            created_files.append(str(repos_path))

        return {
            "success": True,
            "project_name": name,
            "project_type": project_type,
            "directory": str(project_dir),
            "files_created": created_files
        }

    def list_projects(self) -> List[Dict[str, Any]]:
        """
        List all projects

        Returns:
            List of project information
        """
        projects = []

        if not self.projects_dir.exists():
            return projects

        for project_dir in self.projects_dir.iterdir():
            if not project_dir.is_dir():
                continue

            config_path = project_dir / "config" / "project.yaml"

            if config_path.exists():
                with open(config_path, 'r') as f:
                    config = yaml.safe_load(f)

                projects.append({
                    "name": config.get('name', project_dir.name),
                    "type": config.get('type', 'unknown'),
                    "created_at": config.get('created_at', ''),
                    "directory": str(project_dir)
                })

        return projects


class WorkflowGenerator:
    """
    Generates workflow definitions
    """

    def __init__(self, blackbox_root: Path):
        """
        Initialize workflow generator

        Args:
            blackbox_root: Path to Blackbox3 root
        """
        self.blackbox_root = Path(blackbox_root)

    def generate_sequential_workflow(self,
                                   name: str,
                                   steps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate sequential workflow

        Args:
            name: Workflow name
            steps: List of steps (agent, input, output)

        Returns:
            Workflow definition
        """
        return {
            "name": name,
            "type": "sequential",
            "steps": steps,
            "created_at": datetime.now().isoformat()
        }

    def generate_parallel_workflow(self,
                                  name: str,
                                  parallel_steps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate parallel workflow

        Args:
            name: Workflow name
            parallel_steps: List of parallel step groups

        Returns:
            Workflow definition
        """
        return {
            "name": name,
            "type": "parallel",
            "steps": parallel_steps,
            "created_at": datetime.now().isoformat()
        }

    def generate_hierarchical_workflow(self,
                                      name: str,
                                      hierarchy: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate hierarchical workflow

        Args:
            name: Workflow name
            hierarchy: Hierarchy definition

        Returns:
            Workflow definition
        """
        return {
            "name": name,
            "type": "hierarchical",
            "hierarchy": hierarchy,
            "created_at": datetime.now().isoformat()
        }
