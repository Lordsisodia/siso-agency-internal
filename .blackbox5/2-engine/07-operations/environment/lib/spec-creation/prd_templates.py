"""
PRD Template System for Blackbox4
Generates PRD markdown from structured specs with different templates
"""

from typing import Dict, List, Any, Optional
from enum import Enum
from dataclasses import dataclass


class ProjectType(Enum):
    """Types of projects with different PRD templates."""
    WEB_APP = "web_app"
    MOBILE_APP = "mobile_app"
    API = "api"
    LIBRARY = "library"
    SYSTEM = "system"
    GENERIC = "generic"


@dataclass
class PRDSection:
    """A PRD section with title and content."""
    title: str
    content: str
    subsections: List['PRDSection'] = None

    def __post_init__(self):
        if self.subsections is None:
            self.subsections = []

    def to_markdown(self, level: int = 1) -> str:
        """Convert section to markdown."""
        prefix = "#" * level
        lines = [f"{prefix} {self.title}", "", self.content, ""]

        for subsection in self.subsections:
            lines.append(subsection.to_markdown(level + 1))

        return "\n".join(lines)


class PRDTemplate:
    """
    PRD template generator with different project type templates.

    Supports:
    - Multiple project type templates
    - Custom sections
    - Fill-in template generation
    """

    def __init__(self, project_type: ProjectType = ProjectType.GENERIC):
        self.project_type = project_type
        self.custom_sections: List[PRDSection] = []

    def get_template_structure(self) -> List[PRDSection]:
        """
        Get the template structure based on project type.

        Returns:
            List of PRDSection objects defining the template
        """
        if self.project_type == ProjectType.WEB_APP:
            return self._web_app_template()
        elif self.project_type == ProjectType.MOBILE_APP:
            return self._mobile_app_template()
        elif self.project_type == ProjectType.API:
            return self._api_template()
        elif self.project_type == ProjectType.LIBRARY:
            return self._library_template()
        elif self.project_type == ProjectType.SYSTEM:
            return self._system_template()
        else:
            return self._generic_template()

    def _generic_template(self) -> List[PRDSection]:
        """Generic PRD template suitable for most projects."""
        return [
            PRDSection(
                "Product Requirements Document",
                "{{PROJECT_NAME}}",
                [
                    PRDSection("Overview", "{{OVERVIEW}}"),
                    PRDSection("User Stories", "{{USER_STORIES}}"),
                    PRDSection("Functional Requirements", "{{FUNCTIONAL_REQUIREMENTS}}"),
                    PRDSection("Project Constitution", "{{CONSTITUTION}}"),
                    PRDSection("Clarifications", "{{CLARIFICATIONS}}")
                ]
            )
        ]

    def _web_app_template(self) -> List[PRDSection]:
        """Web application specific PRD template."""
        return [
            PRDSection(
                "Product Requirements Document",
                "{{PROJECT_NAME}}",
                [
                    PRDSection(
                        "Executive Summary",
                        "{{OVERVIEW}}",
                        [
                            PRDSection("Problem Statement", "{{PROBLEM_STATEMENT}}"),
                            PRDSection("Target Audience", "{{TARGET_AUDIENCE}}"),
                            PRDSection("Success Metrics", "{{SUCCESS_METRICS}}")
                        ]
                    ),
                    PRDSection(
                        "User Experience",
                        "",
                        [
                            PRDSection("User Stories", "{{USER_STORIES}}"),
                            PRDSection("User Journeys", "{{USER_JOURNEYS}}"),
                            PRDSection("UI/UX Requirements", "{{UI_UX_REQUIREMENTS}}")
                        ]
                    ),
                    PRDSection(
                        "Functional Requirements",
                        "{{FUNCTIONAL_REQUIREMENTS}}",
                        [
                            PRDSection("Core Features", "{{CORE_FEATURES}}"),
                            PRDSection("Authentication & Authorization", "{{AUTH_REQUIREMENTS}}"),
                            PRDSection("Data Management", "{{DATA_MANAGEMENT}}"),
                            PRDSection("Integrations", "{{INTEGRATIONS}}")
                        ]
                    ),
                    PRDSection(
                        "Technical Architecture",
                        "",
                        [
                            PRDSection("Tech Stack", "{{TECH_STACK}}"),
                            PRDSection("Architecture Principles", "{{ARCHITECTURE_PRINCIPLES}}"),
                            PRDSection("Performance Requirements", "{{PERFORMANCE_REQUIREMENTS}}"),
                            PRDSection("Security Requirements", "{{SECURITY_REQUIREMENTS}}")
                        ]
                    ),
                    PRDSection(
                        "Quality Standards",
                        "{{QUALITY_STANDARDS}}",
                        [
                            PRDSection("Testing Strategy", "{{TESTING_STRATEGY}}"),
                            PRDSection("Code Quality", "{{CODE_QUALITY}}")
                        ]
                    ),
                    PRDSection("Clarifications", "{{CLARIFICATIONS}}")
                ]
            )
        ]

    def _mobile_app_template(self) -> List[PRDSection]:
        """Mobile application specific PRD template."""
        return [
            PRDSection(
                "Product Requirements Document",
                "{{PROJECT_NAME}}",
                [
                    PRDSection(
                        "Executive Summary",
                        "{{OVERVIEW}}",
                        [
                            PRDSection("Problem Statement", "{{PROBLEM_STATEMENT}}"),
                            PRDSection("Target Platforms", "{{TARGET_PLATFORMS}}"),
                            PRDSection("Success Metrics", "{{SUCCESS_METRICS}}")
                        ]
                    ),
                    PRDSection(
                        "User Experience",
                        "",
                        [
                            PRDSection("User Stories", "{{USER_STORIES}}"),
                            PRDSection("Mobile Interactions", "{{MOBILE_INTERACTIONS}}"),
                            PRDSection("Offline Functionality", "{{OFFLINE_FUNCTIONALITY}}")
                        ]
                    ),
                    PRDSection(
                        "Functional Requirements",
                        "{{FUNCTIONAL_REQUIREMENTS}}",
                        [
                            PRDSection("Core Features", "{{CORE_FEATURES}}"),
                            PRDSection("Device Features", "{{DEVICE_FEATURES}}"),
                            PRDSection("Push Notifications", "{{PUSH_NOTIFICATIONS}}"),
                            PRDSection("App Store Requirements", "{{APP_STORE_REQUIREMENTS}}")
                        ]
                    ),
                    PRDSection(
                        "Technical Architecture",
                        "",
                        [
                            PRDSection("Tech Stack", "{{TECH_STACK}}"),
                            PRDSection("Architecture Principles", "{{ARCHITECTURE_PRINCIPLES}}"),
                            PRDSection("Performance Requirements", "{{PERFORMANCE_REQUIREMENTS}}"),
                            PRDSection("Battery & Data Optimization", "{{BATTERY_OPTIMIZATION}}")
                        ]
                    ),
                    PRDSection(
                        "Quality Standards",
                        "{{QUALITY_STANDARDS}}",
                        [
                            PRDSection("Testing Strategy", "{{TESTING_STRATEGY}}"),
                            PRDSection("Device Compatibility", "{{DEVICE_COMPATIBILITY}}")
                        ]
                    ),
                    PRDSection("Clarifications", "{{CLARIFICATIONS}}")
                ]
            )
        ]

    def _api_template(self) -> List[PRDSection]:
        """API specific PRD template."""
        return [
            PRDSection(
                "API Requirements Document",
                "{{PROJECT_NAME}}",
                [
                    PRDSection(
                        "Executive Summary",
                        "{{OVERVIEW}}",
                        [
                            PRDSection("API Purpose", "{{API_PURPOSE}}"),
                            PRDSection("Target Consumers", "{{TARGET_CONSUMERS}}"),
                            PRDSection("Success Metrics", "{{SUCCESS_METRICS}}")
                        ]
                    ),
                    PRDSection(
                        "API Contract",
                        "",
                        [
                            PRDSection("Endpoints", "{{ENDPOINTS}}"),
                            PRDSection("Data Models", "{{DATA_MODELS}}"),
                            PRDSection("Authentication", "{{AUTHENTICATION}}"),
                            PRDSection("Rate Limiting", "{{RATE_LIMITING}}")
                        ]
                    ),
                    PRDSection(
                        "Functional Requirements",
                        "{{FUNCTIONAL_REQUIREMENTS}}",
                        [
                            PRDSection("Core Operations", "{{CORE_OPERATIONS}}"),
                            PRDSection("Error Handling", "{{ERROR_HANDLING}}"),
                            PRDSection("Pagination & Filtering", "{{PAGINATION}}")
                        ]
                    ),
                    PRDSection(
                        "Technical Architecture",
                        "",
                        [
                            PRDSection("Tech Stack", "{{TECH_STACK}}"),
                            PRDSection("API Style", "{{API_STYLE}}"),
                            PRDSection("Performance Requirements", "{{PERFORMANCE_REQUIREMENTS}}"),
                            PRDSection("Security Requirements", "{{SECURITY_REQUIREMENTS}}")
                        ]
                    ),
                    PRDSection(
                        "Quality Standards",
                        "{{QUALITY_STANDARDS}}",
                        [
                            PRDSection("Testing Strategy", "{{TESTING_STRATEGY}}"),
                            PRDSection("Documentation Requirements", "{{DOCUMENTATION_REQUIREMENTS}}")
                        ]
                    ),
                    PRDSection("Clarifications", "{{CLARIFICATIONS}}")
                ]
            )
        ]

    def _library_template(self) -> List[PRDSection]:
        """Library/SDK specific PRD template."""
        return [
            PRDSection(
                "Library Requirements Document",
                "{{PROJECT_NAME}}",
                [
                    PRDSection(
                        "Executive Summary",
                        "{{OVERVIEW}}",
                        [
                            PRDSection("Library Purpose", "{{LIBRARY_PURPOSE}}"),
                            PRDSection("Target Languages", "{{TARGET_LANGUAGES}}"),
                            PRDSection("Success Metrics", "{{SUCCESS_METRICS}}")
                        ]
                    ),
                    PRDSection(
                        "API Design",
                        "",
                        [
                            PRDSection("Public API", "{{PUBLIC_API}}"),
                            PRDSection("Usage Examples", "{{USAGE_EXAMPLES}}"),
                            PRDSection("Error Handling", "{{ERROR_HANDLING}}")
                        ]
                    ),
                    PRDSection(
                        "Functional Requirements",
                        "{{FUNCTIONAL_REQUIREMENTS}}",
                        [
                            PRDSection("Core Functionality", "{{CORE_FUNCTIONALITY}}"),
                            PRDSection("Dependencies", "{{DEPENDENCIES}}"),
                            PRDSection("Extensibility", "{{EXTENSIBILITY}}")
                        ]
                    ),
                    PRDSection(
                        "Technical Architecture",
                        "",
                        [
                            PRDSection("Tech Stack", "{{TECH_STACK}}"),
                            PRDSection("Architecture Principles", "{{ARCHITECTURE_PRINCIPLES}}"),
                            PRDSection("Performance Requirements", "{{PERFORMANCE_REQUIREMENTS}}")
                        ]
                    ),
                    PRDSection(
                        "Quality Standards",
                        "{{QUALITY_STANDARDS}}",
                        [
                            PRDSection("Testing Strategy", "{{TESTING_STRATEGY}}"),
                            PRDSection("Documentation Requirements", "{{DOCUMENTATION_REQUIREMENTS}}"),
                            PRDSection("Version Compatibility", "{{VERSION_COMPATIBILITY}}")
                        ]
                    ),
                    PRDSection("Clarifications", "{{CLARIFICATIONS}}")
                ]
            )
        ]

    def _system_template(self) -> List[PRDSection]:
        """System/Infrastructure specific PRD template."""
        return [
            PRDSection(
                "System Requirements Document",
                "{{PROJECT_NAME}}",
                [
                    PRDSection(
                        "Executive Summary",
                        "{{OVERVIEW}}",
                        [
                            PRDSection("System Purpose", "{{SYSTEM_PURPOSE}}"),
                            PRDSection("Scope", "{{SCOPE}}"),
                            PRDSection("Success Metrics", "{{SUCCESS_METRICS}}")
                        ]
                    ),
                    PRDSection(
                        "Functional Requirements",
                        "{{FUNCTIONAL_REQUIREMENTS}}",
                        [
                            PRDSection("Core Functionality", "{{CORE_FUNCTIONALITY}}"),
                            PRDSection("Integration Points", "{{INTEGRATION_POINTS}}"),
                            PRDSection("Data Flow", "{{DATA_FLOW}}")
                        ]
                    ),
                    PRDSection(
                        "Non-Functional Requirements",
                        "",
                        [
                            PRDSection("Performance", "{{PERFORMANCE}}"),
                            PRDSection("Scalability", "{{SCALABILITY}}"),
                            PRDSection("Reliability", "{{RELIABILITY}}"),
                            PRDSection("Security", "{{SECURITY}}"),
                            PRDSection("Maintainability", "{{MAINTAINABILITY}}")
                        ]
                    ),
                    PRDSection(
                        "Technical Architecture",
                        "",
                        [
                            PRDSection("Tech Stack", "{{TECH_STACK}}"),
                            PRDSection("Architecture Principles", "{{ARCHITECTURE_PRINCIPLES}}"),
                            PRDSection("Infrastructure", "{{INFRASTRUCTURE}}"),
                            PRDSection("Deployment", "{{DEPLOYMENT}}")
                        ]
                    ),
                    PRDSection(
                        "Quality Standards",
                        "{{QUALITY_STANDARDS}}",
                        [
                            PRDSection("Testing Strategy", "{{TESTING_STRATEGY}}"),
                            PRDSection("Monitoring & Logging", "{{MONITORING_LOGGING}}"),
                            PRDSection("Disaster Recovery", "{{DISASTER_RECOVERY}}")
                        ]
                    ),
                    PRDSection("Clarifications", "{{CLARIFICATIONS}}")
                ]
            )
        ]

    def add_custom_section(self, section: PRDSection) -> None:
        """Add a custom section to the template."""
        self.custom_sections.append(section)

    def generate_prd(self, spec: 'StructuredSpec') -> str:
        """
        Generate PRD markdown from a structured spec.

        Args:
            spec: StructuredSpec object

        Returns:
            Complete PRD markdown string
        """
        template = self.get_template_structure()
        placeholders = self._extract_placeholders(spec)

        # Fill template with spec data
        return self._fill_template(template, placeholders)

    def _extract_placeholders(self, spec: 'StructuredSpec') -> Dict[str, str]:
        """Extract placeholder values from spec."""
        placeholders = {
            'PROJECT_NAME': spec.project_name,
            'OVERVIEW': spec.overview or "No overview provided.",
        }

        # User Stories
        if spec.user_stories:
            user_stories_md = []
            for story in spec.user_stories:
                story_md = f"### {story.id}: {story.i_want}\n\n"
                story_md += f"**As a:** {story.as_a}\n"
                story_md += f"**I want:** {story.i_want}\n"
                story_md += f"**So that:** {story.so_that}\n"
                story_md += f"**Priority:** {story.priority}\n\n"

                if story.acceptance_criteria:
                    story_md += "**Acceptance Criteria:**\n"
                    for ac in story.acceptance_criteria:
                        story_md += f"- {ac}\n"
                    story_md += "\n"

                user_stories_md.append(story_md)

            placeholders['USER_STORIES'] = "\n".join(user_stories_md)
        else:
            placeholders['USER_STORIES'] = "No user stories defined."

        # Functional Requirements
        if spec.functional_requirements:
            requirements_md = []
            for req in spec.functional_requirements:
                req_md = f"### {req.id}: {req.title}\n\n"
                req_md += f"{req.description}\n\n"
                req_md += f"**Priority:** {req.priority}\n\n"

                if req.dependencies:
                    req_md += f"**Dependencies:** {', '.join(req.dependencies)}\n\n"

                if req.acceptance_tests:
                    req_md += "**Acceptance Tests:**\n"
                    for test in req.acceptance_tests:
                        req_md += f"- {test}\n"
                    req_md += "\n"

                requirements_md.append(req_md)

            placeholders['FUNCTIONAL_REQUIREMENTS'] = "\n".join(requirements_md)
        else:
            placeholders['FUNCTIONAL_REQUIREMENTS'] = "No functional requirements defined."

        # Constitution
        if spec.constitution:
            constitution_md = "### Vision\n\n"
            constitution_md += f"{spec.constitution.vision}\n\n"

            if spec.constitution.tech_stack:
                constitution_md += "### Tech Stack\n\n"
                for tech, choice in spec.constitution.tech_stack.items():
                    constitution_md += f"- **{tech}:** {choice}\n"
                constitution_md += "\n"

            if spec.constitution.quality_standards:
                constitution_md += "### Quality Standards\n\n"
                for standard in spec.constitution.quality_standards:
                    constitution_md += f"- {standard}\n"
                constitution_md += "\n"

            if spec.constitution.architectural_principles:
                constitution_md += "### Architectural Principles\n\n"
                for principle in spec.constitution.architectural_principles:
                    constitution_md += f"- {principle}\n"
                constitution_md += "\n"

            if spec.constitution.constraints:
                constitution_md += "### Constraints\n\n"
                for constraint in spec.constitution.constraints:
                    constitution_md += f"- {constraint}\n"
                constitution_md += "\n"

            placeholders['CONSTITUTION'] = constitution_md
            placeholders['TECH_STACK'] = self._format_tech_stack(spec.constitution.tech_stack)
            placeholders['QUALITY_STANDARDS'] = self._format_list(spec.constitution.quality_standards)
            placeholders['ARCHITECTURE_PRINCIPLES'] = self._format_list(spec.constitution.architectural_principles)
        else:
            placeholders['CONSTITUTION'] = "No constitution defined."
            placeholders['TECH_STACK'] = "Not specified"
            placeholders['QUALITY_STANDARDS'] = "Not specified"
            placeholders['ARCHITECTURE_PRINCIPLES'] = "Not specified"

        # Clarifications
        if spec.clarifications:
            clarifications_md = []
            for qa in spec.clarifications:
                qa_md = f"**Q:** {qa['question']}\n"
                qa_md += f"**A:** {qa['answer']}\n\n"
                clarifications_md.append(qa_md)

            placeholders['CLARIFICATIONS'] = "\n".join(clarifications_md)
        else:
            placeholders['CLARIFICATIONS'] = "No clarifications."

        # Add default values for missing placeholders
        defaults = {
            'PROBLEM_STATEMENT': 'To be defined',
            'TARGET_AUDIENCE': 'To be defined',
            'SUCCESS_METRICS': 'To be defined',
            'USER_JOURNEYS': 'To be defined',
            'UI_UX_REQUIREMENTS': 'To be defined',
            'CORE_FEATURES': 'To be defined',
            'AUTH_REQUIREMENTS': 'To be defined',
            'DATA_MANAGEMENT': 'To be defined',
            'INTEGRATIONS': 'To be defined',
            'PERFORMANCE_REQUIREMENTS': 'To be defined',
            'SECURITY_REQUIREMENTS': 'To be defined',
            'TESTING_STRATEGY': 'To be defined',
            'CODE_QUALITY': 'To be defined',
        }

        for key, value in defaults.items():
            if key not in placeholders:
                placeholders[key] = value

        return placeholders

    def _format_tech_stack(self, tech_stack: Dict[str, str]) -> str:
        """Format tech stack as markdown list."""
        if not tech_stack:
            return "Not specified"

        lines = []
        for tech, choice in tech_stack.items():
            lines.append(f"- **{tech}:** {choice}")

        return "\n".join(lines)

    def _format_list(self, items: List[str]) -> str:
        """Format list as markdown bullets."""
        if not items:
            return "Not specified"

        lines = []
        for item in items:
            lines.append(f"- {item}")

        return "\n".join(lines)

    def _fill_template(self, template: List[PRDSection], placeholders: Dict[str, str]) -> str:
        """Fill template sections with placeholder values."""
        lines = []

        for section in template:
            lines.append(self._fill_section(section, placeholders))

        return "\n".join(lines)

    def _fill_section(self, section: PRDSection, placeholders: Dict[str, str]) -> str:
        """Fill a single section with placeholders."""
        # Replace placeholders in content
        content = section.content
        for key, value in placeholders.items():
            placeholder = f"{{{{{key}}}}}"
            content = content.replace(placeholder, value)

        # Build section markdown
        lines = [f"# {section.title}", "", content, ""]

        # Fill subsections
        for subsection in section.subsections:
            lines.append(self._fill_subsection(subsection, placeholders, 2))

        return "\n".join(lines)

    def _fill_subsection(self, section: PRDSection, placeholders: Dict[str, str], level: int) -> str:
        """Fill a subsection with placeholders."""
        # Replace placeholders in content
        content = section.content
        for key, value in placeholders.items():
            placeholder = f"{{{{{key}}}}}"
            content = content.replace(placeholder, value)

        # Build section markdown
        prefix = "#" * level
        lines = [f"{prefix} {section.title}", "", content, ""]

        # Fill nested subsections
        for subsection in section.subsections:
            lines.append(self._fill_subsection(subsection, placeholders, level + 1))

        return "\n".join(lines)


def get_template_for_project_type(project_type_str: str) -> PRDTemplate:
    """
    Get a PRD template for a specific project type.

    Args:
        project_type_str: String representing project type

    Returns:
        PRDTemplate instance
    """
    try:
        project_type = ProjectType(project_type_str)
        return PRDTemplate(project_type)
    except ValueError:
        # Default to generic if unknown type
        return PRDTemplate(ProjectType.GENERIC)


# Convenience functions for quick template generation

def generate_web_app_prd(spec: 'StructuredSpec') -> str:
    """Generate a web app PRD from a spec."""
    template = PRDTemplate(ProjectType.WEB_APP)
    return template.generate_prd(spec)


def generate_mobile_app_prd(spec: 'StructuredSpec') -> str:
    """Generate a mobile app PRD from a spec."""
    template = PRDTemplate(ProjectType.MOBILE_APP)
    return template.generate_prd(spec)


def generate_api_prd(spec: 'StructuredSpec') -> str:
    """Generate an API PRD from a spec."""
    template = PRDTemplate(ProjectType.API)
    return template.generate_prd(spec)


def generate_library_prd(spec: 'StructuredSpec') -> str:
    """Generate a library PRD from a spec."""
    template = PRDTemplate(ProjectType.LIBRARY)
    return template.generate_prd(spec)


def generate_system_prd(spec: 'StructuredSpec') -> str:
    """Generate a system PRD from a spec."""
    template = PRDTemplate(ProjectType.SYSTEM)
    return template.generate_prd(spec)


def generate_generic_prd(spec: 'StructuredSpec') -> str:
    """Generate a generic PRD from a spec."""
    template = PRDTemplate(ProjectType.GENERIC)
    return template.generate_prd(spec)
