#!/usr/bin/env python3
"""
Blueprint Loader and Generator
Manages blueprint templates and generates typed blueprints
"""

from pathlib import Path
from typing import Dict, Any, Optional, List
import yaml
import json
from datetime import datetime


class BlueprintLoader:
    """
    Loads and manages blueprint templates

    Supports:
    - Feature blueprints
    - Bugfix blueprints
    - Refactor blueprints
    - Research blueprints
    """

    def __init__(self, blackbox_root: Path):
        """
        Initialize blueprint loader

        Args:
            blackbox_root: Path to Blackbox3 root
        """
        self.blackbox_root = Path(blackbox_root)
        self.templates_dir = self.blackbox_root / "shared" / "templates"
        self.schemas_dir = self.blackbox_root / "shared" / "schemas"

    def get_template(self, blueprint_type: str) -> Optional[Dict[str, Any]]:
        """
        Get blueprint template by type

        Args:
            blueprint_type: Type of blueprint (feature, bugfix, refactor, research)

        Returns:
            Template dictionary or None if not found
        """
        template_path = self.templates_dir / f"{blueprint_type}-blueprint-example.yaml"

        if not template_path.exists():
            return None

        with open(template_path, 'r') as f:
            return yaml.safe_load(f)

    def list_templates(self) -> List[str]:
        """
        List available blueprint templates

        Returns:
            List of template names
        """
        templates = []

        for template_file in self.templates_dir.glob("*-blueprint-example.yaml"):
            name = template_file.stem.replace("-blueprint-example", "")
            templates.append(name)

        return templates

    def load_blueprint(self, blueprint_path: Path) -> Optional[Dict[str, Any]]:
        """
        Load existing blueprint

        Args:
            blueprint_path: Path to blueprint file

        Returns:
            Blueprint dictionary or None if not found
        """
        if not blueprint_path.exists():
            return None

        with open(blueprint_path, 'r') as f:
            data = yaml.safe_load(f)

        # Handle blueprint structure (could be wrapped or direct)
        if 'blueprint' not in data:
            return data

        blueprint_data = data['blueprint']

        # Check for duplicate metadata sections (templates have metadata at start and end)
        # The structure is: blueprint -> [metadata, requirements, ..., deliverables, metadata]
        # We need to merge both metadata sections
        sections = list(blueprint_data.keys())
        if sections.count('metadata') > 1:
            # Get the first metadata (has blueprint_type, name, etc.)
            # Get the last metadata (has tags, references, etc.)
            metadata_sections = [k for k in sections if k == 'metadata']

            # Extract first metadata (at the beginning)
            first_meta_key = metadata_sections[0]
            first_metadata = blueprint_data[first_meta_key]

            # Extract last metadata (after deliverables)
            # The blueprint_data dict can only have one 'metadata' key, so we need
            # to parse the YAML differently or handle it specially
            # For now, just use the first metadata section which has the core fields
            # The tags/references can be accessed separately if needed

            # Keep the first metadata (with blueprint_type)
            # Remove the duplicate at the end
            # This is handled by the fact that dict keys are unique
            # So we just need to make sure the first one has all required fields
            pass

        return data

    def validate_blueprint_type(self, blueprint: Dict[str, Any]) -> str:
        """
        Determine blueprint type from content

        Args:
            blueprint: Blueprint dictionary

        Returns:
            Blueprint type (feature, bugfix, refactor, research)
        """
        metadata = blueprint.get('blueprint', {}).get('metadata', {})
        blueprint_type = metadata.get('blueprint_type', 'feature')

        # Auto-detect if not specified
        if not blueprint_type or blueprint_type == "feature":
            requirements = blueprint.get('blueprint', {}).get('requirements', {})

            if requirements.get('bug_report'):
                return "bugfix"
            elif requirements.get('current_state'):
                return "refactor"
            elif requirements.get('research_question'):
                return "research"
            else:
                return "feature"

        return blueprint_type

    def get_blueprint_schema(self) -> Dict[str, Any]:
        """
        Get blueprint artifacts schema

        Returns:
            Schema dictionary
        """
        schema_path = self.schemas_dir / "blueprint-artifacts.yaml"

        with open(schema_path, 'r') as f:
            return yaml.safe_load(f)


class BlueprintGenerator:
    """
    Generates blueprints from templates and requirements
    """

    def __init__(self, blackbox_root: Path):
        """
        Initialize blueprint generator

        Args:
            blackbox_root: Path to Blackbox3 root
        """
        self.blackbox_root = Path(blackbox_root)
        self.loader = BlueprintLoader(blackbox_root)
        self.blueprints_dir = self.blackbox_root / ".blackbox3" / "artifacts" / "blueprints"

        # Ensure directory exists
        self.blueprints_dir.mkdir(parents=True, exist_ok=True)

    def create_blueprint(self,
                        blueprint_type: str,
                        requirements: Dict[str, Any],
                        metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create blueprint from requirements

        Args:
            blueprint_type: Type of blueprint
            requirements: Requirements dictionary
            metadata: Optional metadata (created_by, priority, etc.)

        Returns:
            Blueprint dictionary
        """
        # Get template
        template = self.loader.get_template(blueprint_type)

        if not template:
            # Create minimal blueprint structure
            blueprint = self._create_minimal_blueprint(blueprint_type, requirements)
        else:
            # Use template as base
            blueprint = template.copy()
            blueprint['blueprint']['requirements'] = requirements

        # Update metadata
        if metadata:
            blueprint['blueprint']['metadata'].update(metadata)

        # Ensure blueprint_type is set
        if 'blueprint_type' not in blueprint['blueprint']['metadata']:
            blueprint['blueprint']['metadata']['blueprint_type'] = blueprint_type

        # Add timestamps
        now = datetime.now()
        if 'created_at' not in blueprint['blueprint']['metadata']:
            blueprint['blueprint']['metadata']['created_at'] = now.isoformat()

        return blueprint

    def _create_minimal_blueprint(self,
                                  blueprint_type: str,
                                  requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Create minimal blueprint structure"""
        return {
            "blueprint": {
                "metadata": {
                    "blueprint_type": blueprint_type,
                    "name": requirements.get("title", "untitled"),
                    "version": "1.0",
                    "created_at": datetime.now().isoformat(),
                    "created_by": "system",
                    "priority": "medium",
                    "complexity": "medium"
                },
                "requirements": requirements,
                "design": {
                    "architecture": {
                        "overview": "",
                        "components": [],
                        "data_flow": "",
                        "integration_points": []
                    },
                    "file_structure": {
                        "create": [],
                        "modify": [],
                        "delete": []
                    },
                    "testing_strategy": {
                        "unit_tests": [],
                        "integration_tests": [],
                        "e2e_tests": []
                    }
                },
                "implementation": {
                    "dependencies": [],
                    "tasks": [],
                    "phases": []
                },
                "validation": {
                    "success_criteria": [],
                    "acceptance_tests": []
                },
                "deliverables": {
                    "code": [],
                    "documentation": [],
                    "tests": []
                }
            }
        }

    def generate_feature_blueprint(self,
                                    title: str,
                                    description: str,
                                    user_stories: List[Dict[str, Any]],
                                    **kwargs) -> Dict[str, Any]:
        """
        Generate feature blueprint

        Args:
            title: Feature title
            description: Feature description
            user_stories: List of user stories
            **kwargs: Additional metadata (priority, complexity, etc.)

        Returns:
            Blueprint dictionary
        """
        requirements = {
            "title": title,
            "description": description,
            "user_stories": user_stories,
            "constraints": kwargs.get('constraints', {}),
            "dependencies": kwargs.get('dependencies', {})
        }

        metadata = {
            "name": kwargs.get('name', title.lower().replace(" ", "-")),
            "priority": kwargs.get('priority', "medium"),
            "complexity": kwargs.get('complexity', "medium"),
            "created_by": kwargs.get('created_by', "system")
        }

        return self.create_blueprint("feature", requirements, metadata)

    def generate_bugfix_blueprint(self,
                                   title: str,
                                   bug_report: Dict[str, Any],
                                   **kwargs) -> Dict[str, Any]:
        """
        Generate bugfix blueprint

        Args:
            title: Bug title
            bug_report: Bug report dictionary
            **kwargs: Additional metadata

        Returns:
            Blueprint dictionary
        """
        requirements = {
            "title": title,
            "description": bug_report.get('description', ''),
            "bug_report": bug_report,
            "constraints": kwargs.get('constraints', {}),
            "dependencies": kwargs.get('dependencies', {})
        }

        metadata = {
            "name": kwargs.get('name', title.lower().replace(" ", "-")),
            "priority": kwargs.get('priority', "high"),
            "complexity": kwargs.get('complexity', "medium"),
            "created_by": kwargs.get('created_by', "system")
        }

        return self.create_blueprint("bugfix", requirements, metadata)

    def generate_refactor_blueprint(self,
                                     title: str,
                                     current_state: Dict[str, Any],
                                     refactoring_strategy: Dict[str, Any],
                                     **kwargs) -> Dict[str, Any]:
        """
        Generate refactor blueprint

        Args:
            title: Refactoring title
            current_state: Current code state
            refactoring_strategy: Refactoring approach
            **kwargs: Additional metadata

        Returns:
            Blueprint dictionary
        """
        requirements = {
            "title": title,
            "description": kwargs.get('description', ''),
            "current_state": current_state,
            "constraints": kwargs.get('constraints', {}),
            "dependencies": kwargs.get('dependencies', {})
        }

        # Add strategy to design
        blueprint = self.create_blueprint("refactor", requirements, {
            "name": kwargs.get('name', title.lower().replace(" ", "-")),
            "priority": kwargs.get('priority', "medium"),
            "complexity": kwargs.get('complexity', "medium"),
            "created_by": kwargs.get('created_by', "system")
        })

        blueprint['blueprint']['design']['refactoring_strategy'] = refactoring_strategy

        return blueprint

    def generate_research_blueprint(self,
                                     title: str,
                                     research_question: Dict[str, Any],
                                     **kwargs) -> Dict[str, Any]:
        """
        Generate research blueprint

        Args:
            title: Research title
            research_question: Research question and methodology
            **kwargs: Additional metadata

        Returns:
            Blueprint dictionary
        """
        requirements = {
            "title": title,
            "description": kwargs.get('description', ''),
            "research_question": research_question,
            "constraints": kwargs.get('constraints', {}),
            "dependencies": kwargs.get('dependencies', {})
        }

        metadata = {
            "name": kwargs.get('name', title.lower().replace(" ", "-")),
            "priority": kwargs.get('priority', "low"),
            "complexity": kwargs.get('complexity', "complex"),
            "created_by": kwargs.get('created_by', "system")
        }

        return self.create_blueprint("research", requirements, metadata)

    def save_blueprint(self,
                       blueprint: Dict[str, Any],
                       blueprint_name: Optional[str] = None) -> Path:
        """
        Save blueprint to file

        Args:
            blueprint: Blueprint dictionary
            blueprint_name: Optional name (uses metadata name if not provided)

        Returns:
            Path to saved blueprint
        """
        metadata = blueprint['blueprint']['metadata']
        blueprint_type = metadata.get('blueprint_type', 'feature')

        if not blueprint_name:
            blueprint_name = metadata.get('name', 'untitled')

        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M')
        filename = f"{timestamp}_{blueprint_type}_{blueprint_name}.yaml"
        blueprint_path = self.blueprints_dir / filename

        # Save blueprint
        with open(blueprint_path, 'w') as f:
            yaml.safe_dump(blueprint, f, default_flow_style=False, sort_keys=False)

        return blueprint_path

    def list_blueprints(self,
                       blueprint_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List blueprints, optionally filtered by type

        Args:
            blueprint_type: Optional type filter

        Returns:
            List of blueprint summaries
        """
        blueprints = []

        for blueprint_file in self.blueprints_dir.glob("*.yaml"):
            blueprint = self.loader.load_blueprint(blueprint_file)

            if not blueprint:
                continue

            metadata = blueprint.get('blueprint', {}).get('metadata', {})
            bp_type = metadata.get('blueprint_type', 'feature')

            # Apply filter
            if blueprint_type and bp_type != blueprint_type:
                continue

            blueprints.append({
                "name": metadata.get('name', 'unknown'),
                "type": bp_type,
                "title": blueprint.get('blueprint', {}).get('requirements', {}).get('title', ''),
                "created_at": metadata.get('created_at', ''),
                "priority": metadata.get('priority', 'medium'),
                "complexity": metadata.get('complexity', 'medium'),
                "file": str(blueprint_file)
            })

        # Sort by created_at (newest first)
        blueprints.sort(key=lambda x: x.get('created_at', ''), reverse=True)

        return blueprints


class BlueprintValidator:
    """
    Validates blueprint completeness and correctness
    """

    def __init__(self, blackbox_root: Path):
        """
        Initialize blueprint validator

        Args:
            blackbox_root: Path to Blackbox3 root
        """
        self.blackbox_root = Path(blackbox_root)
        self.loader = BlueprintLoader(blackbox_root)

    def validate(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate blueprint

        Args:
            blueprint: Blueprint dictionary

        Returns:
            Validation result with errors and warnings
        """
        errors = []
        warnings = []

        # Check required top-level sections
        if 'blueprint' not in blueprint:
            errors.append("Missing 'blueprint' section")
            return {"valid": False, "errors": errors, "warnings": warnings}

        bp = blueprint['blueprint']

        # Validate metadata
        if 'metadata' not in bp:
            errors.append("Missing 'metadata' section")
        else:
            metadata = bp['metadata']
            required_metadata = ['blueprint_type', 'name', 'created_at', 'created_by']
            for field in required_metadata:
                if field not in metadata:
                    errors.append(f"Missing metadata field: {field}")

        # Validate requirements
        if 'requirements' not in bp:
            errors.append("Missing 'requirements' section")

        # Validate design
        if 'design' not in bp:
            errors.append("Missing 'design' section")

        # Validate implementation
        if 'implementation' not in bp:
            errors.append("Missing 'implementation' section")

        # Validate validation section
        if 'validation' not in bp:
            errors.append("Missing 'validation' section")

        # Type-specific validation
        blueprint_type = bp.get('metadata', {}).get('blueprint_type', 'feature')
        type_validation = self._validate_by_type(blueprint_type, bp)
        errors.extend(type_validation['errors'])
        warnings.extend(type_validation['warnings'])

        # Check if valid
        valid = len(errors) == 0

        return {
            "valid": valid,
            "errors": errors,
            "warnings": warnings
        }

    def _validate_by_type(self,
                          blueprint_type: str,
                          blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Type-specific validation

        Args:
            blueprint_type: Type of blueprint
            blueprint: Blueprint dictionary

        Returns:
            Validation result
        """
        errors = []
        warnings = []

        requirements = blueprint.get('requirements', {})

        if blueprint_type == 'feature':
            if not requirements.get('user_stories'):
                errors.append("Feature blueprint missing user_stories")

        elif blueprint_type == 'bugfix':
            if not requirements.get('bug_report'):
                errors.append("Bugfix blueprint missing bug_report")

        elif blueprint_type == 'refactor':
            if not requirements.get('current_state'):
                errors.append("Refactor blueprint missing current_state")

        elif blueprint_type == 'research':
            if not requirements.get('research_question'):
                errors.append("Research blueprint missing research_question")

        return {"errors": errors, "warnings": warnings}
