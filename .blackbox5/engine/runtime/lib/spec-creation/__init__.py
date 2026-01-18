"""
Structured Spec Creation for Blackbox4
Based on GitHub Spec Kit

This module provides a comprehensive system for creating, validating, and managing
structured specifications. It integrates with Blackbox4 Phase 1 (context variables)
and Phase 2 (hierarchical tasks) to provide a complete spec creation workflow.
"""

from .spec_types import (
    StructuredSpec,
    UserStory,
    FunctionalRequirement,
    ProjectConstitution
)
from .questioning import (
    QuestioningEngine,
    QuestionArea,
    SequentialQuestioner
)
from .validation import (
    ValidationResult,
    SpecValidator,
    ValidationError
)
from .prd_templates import (
    PRDTemplate,
    PRDSection,
    ProjectType,
    generate_web_app_prd,
    generate_mobile_app_prd,
    generate_api_prd,
    generate_library_prd,
    generate_system_prd,
    generate_generic_prd,
    get_template_for_project_type
)

__all__ = [
    # Core spec types
    'StructuredSpec',
    'UserStory',
    'FunctionalRequirement',
    'ProjectConstitution',

    # Questioning system
    'QuestioningEngine',
    'SequentialQuestioner',
    'QuestionArea',

    # Validation
    'ValidationResult',
    'SpecValidator',
    'ValidationError',

    # PRD templates
    'PRDTemplate',
    'PRDSection',
    'ProjectType',

    # Convenience functions
    'generate_web_app_prd',
    'generate_mobile_app_prd',
    'generate_api_prd',
    'generate_library_prd',
    'generate_system_prd',
    'generate_generic_prd',
    'get_template_for_project_type',

    # Quick creation helpers
    'create_spec',
    'create_user_story',
    'create_requirement',
    'create_constitution',
]


def create_spec(
    project_name: str,
    overview: str = "",
    project_type: ProjectType = ProjectType.GENERIC
) -> StructuredSpec:
    """
    Quick helper to create a new spec.

    Args:
        project_name: Name of the project
        overview: Brief project overview
        project_type: Type of project for PRD template

    Returns:
        StructuredSpec instance
    """
    spec = StructuredSpec(
        project_name=project_name,
        overview=overview
    )
    spec.metadata['project_type'] = project_type.value
    return spec


def create_user_story(
    story_id: str,
    as_a: str,
    i_want: str,
    so_that: str,
    acceptance_criteria: list = None,
    priority: str = "medium",
    story_points: int = None
) -> UserStory:
    """
    Quick helper to create a user story.

    Args:
        story_id: Unique story identifier
        as_a: Who is the user
        i_want: What does the user want
        so_that: Why does the user want it
        acceptance_criteria: List of acceptance criteria
        priority: Story priority (high, medium, low)
        story_points: Story point estimate

    Returns:
        UserStory instance
    """
    return UserStory(
        id=story_id,
        as_a=as_a,
        i_want=i_want,
        so_that=so_that,
        acceptance_criteria=acceptance_criteria or [],
        priority=priority,
        story_points=story_points
    )


def create_requirement(
    req_id: str,
    title: str,
    description: str,
    priority: str = "medium",
    dependencies: list = None,
    acceptance_tests: list = None
) -> FunctionalRequirement:
    """
    Quick helper to create a functional requirement.

    Args:
        req_id: Unique requirement identifier
        title: Requirement title
        description: Requirement description
        priority: Requirement priority (high, medium, low)
        dependencies: List of requirement IDs this depends on
        acceptance_tests: List of acceptance tests

    Returns:
        FunctionalRequirement instance
    """
    return FunctionalRequirement(
        id=req_id,
        title=title,
        description=description,
        priority=priority,
        dependencies=dependencies or [],
        acceptance_tests=acceptance_tests or []
    )


def create_constitution(
    vision: str,
    tech_stack: dict = None,
    quality_standards: list = None,
    architectural_principles: list = None,
    constraints: list = None
) -> ProjectConstitution:
    """
    Quick helper to create a project constitution.

    Args:
        vision: Project vision statement
        tech_stack: Dict of technology choices
        quality_standards: List of quality standards
        architectural_principles: List of architectural principles
        constraints: List of project constraints

    Returns:
        ProjectConstitution instance
    """
    return ProjectConstitution(
        vision=vision,
        tech_stack=tech_stack or {},
        quality_standards=quality_standards or [],
        architectural_principles=architectural_principles or [],
        constraints=constraints or []
    )
