"""
Structured Specification Types
Based on GitHub Spec Kit specify workflow
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
from pathlib import Path


@dataclass
class UserStory:
    """Represents a user story with acceptance criteria."""
    id: str
    as_a: str
    i_want: str
    so_that: str
    acceptance_criteria: List[str] = field(default_factory=list)
    priority: str = "medium"  # high, medium, low
    story_points: Optional[int] = None
    tags: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'as_a': self.as_a,
            'i_want': self.i_want,
            'so_that': self.so_that,
            'acceptance_criteria': self.acceptance_criteria,
            'priority': self.priority,
            'story_points': self.story_points,
            'tags': self.tags
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'UserStory':
        return cls(**data)


@dataclass
class FunctionalRequirement:
    """Represents a functional requirement."""
    id: str
    title: str
    description: str
    priority: str = "medium"
    dependencies: List[str] = field(default_factory=list)
    acceptance_tests: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'dependencies': self.dependencies,
            'acceptance_tests': self.acceptance_tests
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'FunctionalRequirement':
        return cls(**data)


@dataclass
class ProjectConstitution:
    """Project constitution defining vision, principles, and standards."""
    vision: str
    tech_stack: Dict[str, str] = field(default_factory=dict)
    quality_standards: List[str] = field(default_factory=list)
    architectural_principles: List[str] = field(default_factory=list)
    constraints: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'vision': self.vision,
            'tech_stack': self.tech_stack,
            'quality_standards': self.quality_standards,
            'architectural_principles': self.architectural_principles,
            'constraints': self.constraints
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ProjectConstitution':
        return cls(**data)


@dataclass
class StructuredSpec:
    """Main structured specification container."""
    project_name: str
    overview: str = ""
    user_stories: List[UserStory] = field(default_factory=list)
    functional_requirements: List[FunctionalRequirement] = field(default_factory=list)
    constitution: Optional[ProjectConstitution] = None
    clarifications: List[Dict[str, str]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def add_user_story(self, story: UserStory) -> None:
        """Add a user story to the spec."""
        self.user_stories.append(story)

    def add_requirement(self, requirement: FunctionalRequirement) -> None:
        """Add a functional requirement to the spec."""
        self.functional_requirements.append(requirement)

    def add_clarification(self, question: str, answer: str) -> None:
        """Add a Q&A clarification."""
        self.clarifications.append({'question': question, 'answer': answer})

    def to_dict(self) -> Dict[str, Any]:
        """Convert spec to dictionary."""
        return {
            'project_name': self.project_name,
            'overview': self.overview,
            'user_stories': [story.to_dict() for story in self.user_stories],
            'functional_requirements': [req.to_dict() for req in self.functional_requirements],
            'constitution': self.constitution.to_dict() if self.constitution else None,
            'clarifications': self.clarifications,
            'metadata': self.metadata,
            'created_at': self.created_at
        }

    def save(self, filepath: str) -> str:
        """Save spec to JSON file and generate PRD."""
        # Save JSON
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)

        with open(filepath, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)

        # Generate PRD
        prd_path = filepath.parent / f"{filepath.stem.replace('-spec', '')}-prd.md"
        self._save_prd(prd_path)

        return str(prd_path)

    def _save_prd(self, filepath: Path) -> None:
        """Generate and save PRD markdown."""
        lines = [
            f"# Product Requirements Document: {self.project_name}",
            "",
            f"**Created:** {self.created_at}",
            f"**Status:** Draft",
            "",
            "## Overview",
            "",
            self.overview or "No overview provided.",
            ""
        ]

        # User Stories
        if self.user_stories:
            lines.extend([
                "## User Stories",
                ""
            ])
            for story in self.user_stories:
                lines.extend([
                    f"### {story.id}: {story.i_want}",
                    "",
                    f"**As a:** {story.as_a}",
                    f"**I want:** {story.i_want}",
                    f"**So that:** {story.so_that}",
                    f"**Priority:** {story.priority}",
                    ""
                ])
                if story.acceptance_criteria:
                    lines.append("**Acceptance Criteria:**")
                    for ac in story.acceptance_criteria:
                        lines.append(f"- {ac}")
                    lines.append("")

        # Functional Requirements
        if self.functional_requirements:
            lines.extend([
                "## Functional Requirements",
                ""
            ])
            for req in self.functional_requirements:
                lines.extend([
                    f"### {req.id}: {req.title}",
                    "",
                    req.description,
                    "",
                    f"**Priority:** {req.priority}",
                    ""
                ])

        # Constitution
        if self.constitution:
            lines.extend([
                "## Project Constitution",
                "",
                "### Vision",
                "",
                self.constitution.vision,
                ""
            ])

            if self.constitution.tech_stack:
                lines.extend([
                    "### Tech Stack",
                    ""
                ])
                for tech, choice in self.constitution.tech_stack.items():
                    lines.append(f"- **{tech}:** {choice}")
                lines.append("")

            if self.constitution.quality_standards:
                lines.extend([
                    "### Quality Standards",
                    ""
                ])
                for standard in self.constitution.quality_standards:
                    lines.append(f"- {standard}")
                lines.append("")

            if self.constitution.architectural_principles:
                lines.extend([
                    "### Architectural Principles",
                    ""
                ])
                for principle in self.constitution.architectural_principles:
                    lines.append(f"- {principle}")
                lines.append("")

        # Clarifications
        if self.clarifications:
            lines.extend([
                "## Clarifications",
                ""
            ])
            for qa in self.clarifications:
                lines.extend([
                    f"**Q:** {qa['question']}",
                    f"**A:** {qa['answer']}",
                    ""
                ])

        with open(filepath, 'w') as f:
            f.write('\n'.join(lines))

    @classmethod
    def load(cls, filepath: str) -> 'StructuredSpec':
        """Load spec from JSON file."""
        with open(filepath, 'r') as f:
            data = json.load(f)

        spec = cls(
            project_name=data['project_name'],
            overview=data.get('overview', ''),
            clarifications=data.get('clarifications', []),
            metadata=data.get('metadata', {}),
            created_at=data.get('created_at', datetime.now().isoformat())
        )

        # Load user stories
        for story_data in data.get('user_stories', []):
            spec.user_stories.append(UserStory.from_dict(story_data))

        # Load requirements
        for req_data in data.get('functional_requirements', []):
            spec.functional_requirements.append(FunctionalRequirement.from_dict(req_data))

        # Load constitution
        if data.get('constitution'):
            spec.constitution = ProjectConstitution.from_dict(data['constitution'])

        return spec
