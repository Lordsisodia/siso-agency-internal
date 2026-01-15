#!/usr/bin/env python3
"""
Plan Phase: Analyst → PM → Architect
Generates deterministic blueprint from user requirements

Based on BMAD-METHOD planning phase
"""

from pathlib import Path
from typing import Dict, Any, List
import yaml


class PlanPhase:
    """
    Phase 1: Planning

    Sequence:
    1. Load requirements
    2. Analyst agent: Requirements analysis and stakeholder questions
    3. PM agent: User stories and roadmap
    4. Architect agent: Technical design and architecture
    5. Generate deterministic blueprint artifact

    Output:
    - Blueprint YAML file
    - Blueprint summary markdown
    """

    def __init__(self, blackbox_root: Path):
        self.blackbox_root = Path(blackbox_root)
        self.agents_dir = self.blackbox_root / "core" / "agents"
        self.prompts_dir = self.blackbox_root / "core" / "prompts"

    def execute(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute plan phase

        Args:
            requirements: Requirements dictionary

        Returns:
            Blueprint dictionary
        """
        print("Starting Plan Phase...\n")

        # Step 1: Analyst - Requirements Analysis
        print("📊 Step 1: Analyst - Requirements Analysis")
        analysis = self._run_analyst(requirements)
        print("✅ Analyst complete\n")

        # Step 2: PM - User Stories & Roadmap
        print("📋 Step 2: PM - User Stories & Roadmap")
        stories = self._run_pm(analysis, requirements)
        print("✅ PM complete\n")

        # Step 3: Architect - Technical Design
        print("🏗️  Step 3: Architect - Technical Design")
        design = self._run_architect(stories, analysis, requirements)
        print("✅ Architect complete\n")

        # Step 4: Generate Blueprint
        print("📦 Step 4: Generating Blueprint")
        blueprint = self._generate_blueprint(requirements, analysis, stories, design)
        print("✅ Blueprint generated\n")

        return blueprint

    def _run_analyst(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run analyst agent

        Focus:
        - Requirements completeness
        - Stakeholder questions
        - Constraint identification
        - Risk assessment
        """
        # In production, this would call the analyst agent
        # For now, we'll create a structured analysis

        analysis = {
            "requirements_summary": requirements.get("description", ""),
            "stakeholder_questions": [
                "What is the primary business goal?",
                "Who are the end users?",
                "What are the success metrics?",
                "What are the technical constraints?",
                "What is the timeline?"
            ],
            "identified_constraints": requirements.get("constraints", []),
            "risks": [
                "Scope creep",
                "Technical complexity",
                "Resource availability"
            ],
            "assumptions": requirements.get("assumptions", []),
            "dependencies": requirements.get("dependencies", {})
        }

        # Display analysis
        print(f"   - Requirements: {len(analysis['requirements_summary'])} chars")
        print(f"   - Questions: {len(analysis['stakeholder_questions'])}")
        print(f"   - Constraints: {len(analysis['identified_constraints'])}")
        print(f"   - Risks: {len(analysis['risks'])}")

        return analysis

    def _run_pm(self, analysis: Dict[str, Any], requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run PM (Product Manager) agent

        Focus:
        - User story creation
        - Acceptance criteria
        - Prioritization
        - Roadmap planning
        """
        # Convert existing user stories or create new ones
        user_stories = requirements.get("user_stories", [])

        if not user_stories:
            # Generate user stories from requirements
            user_stories = self._generate_user_stories(requirements)

        stories = {
            "user_stories": user_stories,
            "epics": self._group_into_epics(user_stories),
            "prioritization": self._prioritize_stories(user_stories),
            "roadmap": self._create_roadmap(user_stories),
            "acceptance_criteria": requirements.get("acceptance_criteria", [])
        }

        # Display stories
        print(f"   - User Stories: {len(stories['user_stories'])}")
        print(f"   - Epics: {len(stories['epics'])}")
        print(f"   - Sprints: {len(stories['roadmap'])}")

        return stories

    def _run_architect(self, stories: Dict[str, Any],
                       analysis: Dict[str, Any],
                       requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run architect agent

        Focus:
        - System architecture
        - Technology choices
        - Data models
        - API design
        - File structure
        """
        design = {
            "architecture": {
                "overview": self._create_architecture_overview(requirements),
                "patterns": ["layered", "mvc", "repository"],
                "reasoning": "Scalable, maintainable architecture"
            },
            "data_models": self._design_data_models(requirements),
            "api_endpoints": self._design_api_endpoints(requirements),
            "ui_components": self._design_ui_components(requirements),
            "file_structure": self._design_file_structure(requirements),
            "technology_stack": self._select_technology_stack(requirements)
        }

        # Display design
        print(f"   - Data Models: {len(design['data_models'])}")
        print(f"   - API Endpoints: {len(design['api_endpoints'])}")
        print(f"   - UI Components: {len(design['ui_components'])}")
        print(f"   - Files: {len(design['file_structure']['create'])} to create, {len(design['file_structure']['modify'])} to modify")

        return design

    def _generate_blueprint(self,
                           requirements: Dict[str, Any],
                           analysis: Dict[str, Any],
                           stories: Dict[str, Any],
                           design: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate final blueprint artifact
        """
        from datetime import datetime

        blueprint_type = self._determine_blueprint_type(requirements)
        blueprint_name = requirements.get("title", "Unnamed Feature").lower().replace(" ", "-")

        blueprint = {
            "blueprint": {
                "metadata": {
                    "version": "1.0",
                    "blueprint_type": blueprint_type,
                    "name": blueprint_name,
                    "description": requirements.get("description", ""),
                    "created_by": "architect",
                    "created_at": datetime.now().isoformat(),
                    "parent_requirement": "user-provided"
                },
                "requirements": {
                    "user_stories": stories["user_stories"],
                    "constraints": analysis["identified_constraints"],
                    "assumptions": analysis["assumptions"],
                    "dependencies": analysis["dependencies"]
                },
                "design": {
                    "architecture": design["architecture"],
                    "data_models": design["data_models"],
                    "api_endpoints": design["api_endpoints"],
                    "ui_components": design["ui_components"],
                    "file_structure": design["file_structure"]
                },
                "implementation": {
                    "dependencies": design["technology_stack"].get("dependencies", []),
                    "environment_variables": [],
                    "configuration": [],
                    "tasks": self._create_implementation_tasks(stories, design)
                },
                "validation": {
                    "success_criteria": self._define_success_criteria(stories),
                    "test_cases": self._create_test_cases(stories, design),
                    "performance_targets": [],
                    "security_considerations": []
                },
                "artifacts": {
                    "inputs": ["requirements.md"],
                    "outputs": design["file_structure"]["create"],
                    "documentation": []
                },
                "version_control": {
                    "branch_strategy": "feature-branch",
                    "commit_message_format": "conventional",
                    "pr_template": "standard"
                },
                "rollout": {
                    "deployment_strategy": "standard",
                    "rollback_plan": "git revert",
                    "monitoring": []
                }
            }
        }

        return blueprint

    # Helper methods

    def _generate_user_stories(self, requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate user stories from requirements"""
        # This is a placeholder - in production, agent would generate these
        return [
            {
                "id": "US-001",
                "title": "Core Feature",
                "description": requirements.get("description", ""),
                "acceptance_criteria": ["Given", "When", "Then"],
                "priority": "high",
                "story_points": 5
            }
        ]

    def _group_into_epics(self, stories: List[Dict]) -> List[Dict]:
        """Group user stories into epics"""
        return [{"id": "Epic-1", "name": "Main Feature", "stories": [s.get("id") for s in stories]}]

    def _prioritize_stories(self, stories: List[Dict]) -> Dict:
        """Prioritize stories"""
        return {"high": [s.get("id") for s in stories if s.get("priority") == "high"],
                "medium": [s.get("id") for s in stories if s.get("priority") == "medium"],
                "low": [s.get("id") for s in stories if s.get("priority") == "low"]}

    def _create_roadmap(self, stories: List[Dict]) -> List[Dict]:
        """Create delivery roadmap"""
        return [
            {"sprint": 1, "stories": [s.get("id") for s in stories[:3]], "duration": "1 week"},
            {"sprint": 2, "stories": [s.get("id") for s in stories[3:6]], "duration": "1 week"}
        ]

    def _create_architecture_overview(self, requirements: Dict) -> str:
        """Create architecture overview"""
        return f"Layered architecture for: {requirements.get('title', 'Feature')}"

    def _design_data_models(self, requirements: Dict) -> List[Dict]:
        """Design data models"""
        return []

    def _design_api_endpoints(self, requirements: Dict) -> List[Dict]:
        """Design API endpoints"""
        return []

    def _design_ui_components(self, requirements: Dict) -> List[Dict]:
        """Design UI components"""
        return []

    def _design_file_structure(self, requirements: Dict) -> Dict:
        """Design file structure"""
        return {
            "create": [],
            "modify": [],
            "delete": []
        }

    def _select_technology_stack(self, requirements: Dict) -> Dict:
        """Select technology stack"""
        return {
            "backend": "python",
            "frontend": "typescript",
            "database": "postgresql",
            "dependencies": []
        }

    def _create_implementation_tasks(self, stories: Dict, design: Dict) -> List[Dict]:
        """Create implementation tasks"""
        return []

    def _define_success_criteria(self, stories: Dict) -> List[Dict]:
        """Define success criteria"""
        return [
            {"criterion": "All user stories completed", "metric": "stories", "threshold": "100%"}
        ]

    def _create_test_cases(self, stories: Dict, design: Dict) -> List[Dict]:
        """Create test cases"""
        return []

    def _determine_blueprint_type(self, requirements: Dict) -> str:
        """Determine blueprint type from requirements"""
        desc = requirements.get("description", "").lower()
        if "bug" in desc or "fix" in desc:
            return "bugfix"
        elif "refactor" in desc or "clean" in desc:
            return "refactor"
        elif "research" in desc or "investigate" in desc:
            return "research"
        else:
            return "feature"
