# Structured Spec Creation Library for Blackbox4

A comprehensive Python library for creating, managing, and validating structured specifications in Blackbox4. Inspired by GitHub Spec Kit workflows and integrated with Blackbox4's Phase 1 (Context Variables) and Phase 2 (Hierarchical Tasks).

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Components](#core-components)
- [Integration with Blackbox4](#integration-with-blackbox4)
- [Advanced Usage](#advanced-usage)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

## Overview

This library provides a structured approach to specification creation with:

- **Structured Data Models**: Type-safe classes for specs, user stories, requirements, and constitutions
- **Sequential Questioning**: Intelligent gap analysis and question generation
- **Multi-format Output**: Generate both PRD markdown and JSON artifacts
- **Validation**: Comprehensive spec completeness and clarity checking
- **PRD Templates**: Specialized templates for different project types
- **Cross-Artifact Validation**: Ensure consistency across spec documents

## Features

### Core Capabilities

- **Spec Types** (`spec_types.py`)
  - `StructuredSpec`: Main specification container
  - `UserStory`: User stories with acceptance criteria
  - `FunctionalRequirement`: Requirements with dependencies
  - `ProjectConstitution`: Vision, tech stack, quality standards

- **Questioning System** (`questioning.py`)
  - `QuestioningEngine`: Basic gap analysis and question generation
  - `SequentialQuestioner`: Advanced adaptive questioning
  - Five questioning areas: Completeness, Clarity, Consistency, Feasibility, Testability

- **Validation** (`validation.py`)
  - `SpecValidator`: Comprehensive validation
  - Cross-artifact validation (PRD vs stories, requirements vs constitution)
  - Traceability checking across documents
  - Inconsistency detection

- **PRD Templates** (`prd_templates.py`)
  - Multiple project type templates (Web App, Mobile, API, Library, System)
  - Customizable sections
  - Auto-fill from spec data

## Installation

Located at: `4-scripts/lib/spec-creation/`

```python
import sys
sys.path.append('4-scripts/lib')

from spec_creation import (
    StructuredSpec,
    UserStory,
    FunctionalRequirement,
    ProjectConstitution,
    QuestioningEngine,
    SequentialQuestioner,
    SpecValidator,
    PRDTemplate,
    create_spec,
    create_user_story,
    create_requirement,
    create_constitution
)
```

## Quick Start

### Basic Spec Creation

```python
from spec_creation import create_spec, create_user_story, create_constitution

# Create a new spec
spec = create_spec(
    project_name="E-commerce Platform",
    overview="A modern e-commerce platform for small businesses",
    project_type="web_app"
)

# Add user stories
spec.add_user_story(create_user_story(
    story_id="US-001",
    as_a="shop owner",
    i_want="to manage my product catalog",
    so_that="customers can browse and purchase items",
    acceptance_criteria=[
        "Can add/edit/delete products",
        "Can upload product images",
        "Can set prices and inventory"
    ],
    priority="high"
))

# Add constitution
spec.constitution = create_constitution(
    vision="Empower small businesses with affordable e-commerce",
    tech_stack={
        "frontend": "Next.js",
        "backend": "Python/FastAPI",
        "database": "PostgreSQL"
    },
    quality_standards=[
        "100% API test coverage",
        "Response time < 200ms"
    ]
)

# Save spec (generates both JSON and PRD)
prd_path = spec.save("specs/ecommerce-spec.json")
print(f"PRD generated at: {prd_path}")
```

### Validation

```python
from spec_creation import SpecValidator

validator = SpecValidator()

# Validate spec
result = validator.validate(spec)

if result.is_valid:
    print("Spec is valid!")
else:
    print(f"Found {len(result.errors)} issues:")
    for error in result.errors:
        print(f"[{error.level}] {error.message}")
```

### Questioning

```python
from spec_creation import SequentialQuestioner

questioner = SequentialQuestioner()

# Get questioning strategy
strategy = questioner.get_questioning_strategy(spec)
print(f"Approach: {strategy['recommended_approach']}")
print(f"Focus areas: {strategy['focus_areas']}")

# Generate questions
questions = questioner.generate_questions(spec)
for q in questions:
    print(f"{q['question']} (Priority: {q['priority']})")
```

## Core Components

### 1. StructuredSpec

The main container for complete specifications.

```python
spec = StructuredSpec(
    project_name="My Project",
    overview="Project overview..."
)

# Add content
spec.add_user_story(story)
spec.add_requirement(requirement)
spec.add_clarification("Question", "Answer")

# Save to files
prd_path = spec.save("output/project-spec.json")

# Load from file
spec = StructuredSpec.load("output/project-spec.json")
```

### 2. UserStory

Represent user stories with acceptance criteria.

```python
story = UserStory(
    id="US-001",
    as_a="product manager",
    i_want="to track project metrics",
    so_that="I can make data-driven decisions",
    acceptance_criteria=[
        "Can view key metrics on dashboard",
        "Can export metrics as CSV"
    ],
    priority="high",
    story_points=5
)
```

### 3. FunctionalRequirement

Define functional requirements with dependencies.

```python
req = FunctionalRequirement(
    id="FR-001",
    title="User Authentication",
    description="Implement secure user authentication",
    priority="high",
    dependencies=["FR-002", "FR-003"],
    acceptance_tests=[
        "Users can register with email/password",
        "Users can login with valid credentials"
    ]
)
```

### 4. ProjectConstitution

Define project vision, principles, and standards.

```python
constitution = ProjectConstitution(
    vision="To become the leading platform...",
    tech_stack={
        "frontend": "React + TypeScript",
        "backend": "Node.js + Express",
        "database": "PostgreSQL"
    },
    quality_standards=[
        "All code must be reviewed",
        "Test coverage must be > 80%"
    ],
    architectural_principles=[
        "Microservices where appropriate",
        "API-first design"
    ],
    constraints=[
        "Budget: $50k for Q1",
        "Timeline: MVP by end of Q2"
    ]
)

spec.constitution = constitution
```

### 5. QuestioningEngine

Generate questions to identify gaps and improve specs.

```python
engine = QuestioningEngine()

# Analyze gaps
gaps = engine.analyze_gaps(spec)
for gap in gaps:
    print(f"[{gap['severity']}] {gap['description']}")
    print(f"  Recommendation: {gap['recommendation']}")

# Generate section-specific questions
questions = engine.generate_questions("overview")
for q in questions:
    print(f"{q['question']} (Priority: {q['priority']})")

# Generate comprehensive report
report = engine.generate_questioning_report(spec)
print(report)
```

### 6. SequentialQuestioner

Advanced sequential questioning with adaptive strategies.

```python
questioner = SequentialQuestioner()

# Identify gaps
gaps = questioner.identify_gaps(spec)

# Generate questions with focus areas
questions = questioner.generate_questions(
    spec,
    focus_areas=['user_stories', 'functional_requirements']
)

# Process answers
answers = [
    {
        'question_id': 'q1',
        'question': 'What is the primary problem?',
        'answer': 'The problem is...',
        'impact': 'clarification'
    }
]
spec = questioner.process_answers(spec, answers)

# Get questioning strategy
strategy = questioner.get_questioning_strategy(spec)
```

### 7. SpecValidator

Validate specs and cross-check artifacts.

```python
validator = SpecValidator()

# Validate spec
result = validator.validate(spec)

# Cross-artifact validation
errors = validator.validate_prd_vs_user_stories(
    "specs/prd.md",
    "specs/user-stories.md"
)

errors = validator.validate_requirements_vs_constitution(
    "specs/requirements.md",
    "specs/constitution.md"
)

errors = validator.validate_traceability("specs/")

# Find inconsistencies
inconsistencies = validator.find_inconsistencies(spec)

# Generate validation report
report = validator.generate_validation_report(spec)
validator.save_report("validation-report.md", spec)
```

### 8. PRDTemplate

Generate PRDs with different templates.

```python
from spec_creation import PRDTemplate, ProjectType

# Create template for specific project type
template = PRDTemplate(ProjectType.WEB_APP)

# Generate PRD from spec
prd = template.generate_prd(spec)

# Available templates
# - ProjectType.WEB_APP
# - ProjectType.MOBILE_APP
# - ProjectType.API
# - ProjectType.LIBRARY
# - ProjectType.SYSTEM
# - ProjectType.GENERIC

# Convenience functions
from spec_creation import (
    generate_web_app_prd,
    generate_mobile_app_prd,
    generate_api_prd
)

prd = generate_web_app_prd(spec)
```

## Integration with Blackbox4

### Phase 1: Context Variables

Specs can access context variables from the Swarm-based context system:

```python
from spec_creation import create_spec
from context_variables import Context, context_var

# Create context
ctx = Context()
ctx['project_type'] = 'web_app'
ctx['target_audience'] = 'small businesses'

# Create spec with context
spec = create_spec(
    project_name="My Project",
    overview=f"Project for {ctx['target_audience']}"
)
spec.metadata['context'] = dict(ctx)
```

### Phase 2: Hierarchical Tasks

User stories and requirements can be converted to hierarchical tasks:

```python
from hierarchical_tasks import HierarchicalTask
from spec_creation import StructuredSpec

# Load spec
spec = StructuredSpec.load("specs/project-spec.json")

# Convert user stories to hierarchical tasks
tasks = []
for story in spec.user_stories:
    task = HierarchicalTask(
        description=story.i_want,
        expected_output=story.so_that
    )

    # Add requirements as child tasks
    for req in spec.functional_requirements:
        if req.id in story.metadata.get('requirements', []):
            child = HierarchicalTask(
                description=req.title,
                expected_output=req.description,
                parent_task=task
            )

    tasks.append(task)

# Save to checklist.md format
checklist_content = "\n".join(t.to_checklist_item() for t in tasks)
```

### Planning Module Integration

Specs inform project planning:

```python
from spec_creation import StructuredSpec
from planning import ProjectPlan

# Load spec
spec = StructuredSpec.load("specs/project-spec.json")

# Create project plan
plan = ProjectPlan(
    project_name=spec.project_name,
    overview=spec.overview
)

# Add user stories as features
for story in spec.user_stories:
    plan.add_feature(
        title=story.i_want,
        description=story.so_that,
        priority=story.priority
    )

# Add constitution constraints
if spec.constitution:
    plan.constraints = spec.constitution.constraints
    plan.tech_stack = spec.constitution.tech_stack
```

## Advanced Usage

### Custom Validation Rules

```python
validator = SpecValidator()

# Set custom rules
validator.set_rule('overview_min_length', 100)
validator.set_rule('min_user_stories', 3)
validator.set_rule('require_constitution', True)

# Validate with custom rules
result = validator.validate(spec)
```

### Custom PRD Sections

```python
from spec_creation import PRDTemplate, PRDSection

template = PRDTemplate()

# Add custom section
custom_section = PRDSection(
    "API Documentation",
    "Custom API documentation content...",
    [
        PRDSection("Endpoints", "Endpoint descriptions..."),
        PRDSection("Authentication", "Auth flow...")
    ]
)

template.add_custom_section(custom_section)

# Generate PRD
prd = template.generate_prd(spec)
```

### Export to Different Formats

```python
# Export as JSON
spec_dict = spec.to_dict()
import json
with open('spec.json', 'w') as f:
    json.dump(spec_dict, f, indent=2)

# Export as PRD markdown
prd = spec._save_prd(Path('spec-prd.md'))

# Export as hierarchical tasks
tasks = [
    HierarchicalTask(
        description=story.i_want,
        expected_output=story.so_that
    )
    for story in spec.user_stories
]
```

## API Reference

### StructuredSpec

- `add_user_story(story: UserStory)`: Add a user story
- `add_requirement(req: FunctionalRequirement)`: Add a requirement
- `add_clarification(question: str, answer: str)`: Add Q&A
- `save(filepath: str) -> str`: Save to JSON and PRD
- `to_dict() -> Dict`: Convert to dictionary
- `load(filepath: str) -> StructuredSpec`: Load from JSON

### UserStory

- `to_dict() -> Dict`: Convert to dictionary
- `from_dict(data: Dict) -> UserStory`: Create from dict

### FunctionalRequirement

- `to_dict() -> Dict`: Convert to dictionary
- `from_dict(data: Dict) -> FunctionalRequirement`: Create from dict

### ProjectConstitution

- `to_dict() -> Dict`: Convert to dictionary
- `from_dict(data: Dict) -> ProjectConstitution`: Create from dict

### QuestioningEngine

- `generate_questions(section: str, context: Dict) -> List[Dict]`: Generate questions
- `analyze_gaps(spec: StructuredSpec) -> List[Dict]`: Analyze for gaps
- `generate_questioning_report(spec: StructuredSpec) -> str`: Generate report

### SequentialQuestioner

- `identify_gaps(spec: StructuredSpec) -> List[Dict]`: Identify gaps
- `generate_questions(spec: StructuredSpec, focus_areas: List[str]) -> List[Dict]`: Generate questions
- `process_answers(spec: StructuredSpec, answers: List[Dict]) -> StructuredSpec`: Process answers
- `get_questioning_strategy(spec: StructuredSpec) -> Dict`: Get strategy

### SpecValidator

- `validate(spec: StructuredSpec) -> ValidationResult`: Validate spec
- `validate_prd_vs_user_stories(prd_file: str, stories_file: str) -> List[ValidationError]`: Cross-validate
- `validate_requirements_vs_constitution(req_file: str, const_file: str) -> List[ValidationError]`: Cross-validate
- `validate_traceability(spec_dir: str) -> List[ValidationError]`: Check traceability
- `find_inconsistencies(spec: StructuredSpec) -> List[ValidationError]`: Find inconsistencies
- `generate_validation_report(spec: StructuredSpec) -> str`: Generate report
- `save_report(filepath: str, spec: StructuredSpec) -> str`: Save report

### PRDTemplate

- `generate_prd(spec: StructuredSpec) -> str`: Generate PRD from spec
- `add_custom_section(section: PRDSection)`: Add custom section
- `get_template_structure() -> List[PRDSection]`: Get template structure

## Best Practices

1. **Start with Overview**: Always begin with a clear project overview (minimum 50 characters)

2. **User Stories First**: Define user stories before functional requirements

3. **Acceptance Criteria**: Every story and requirement needs acceptance criteria

4. **Constitution Early**: Set the constitution early to guide decisions

5. **Iterate with Questioning**: Use the questioning engine to identify gaps and iterate

6. **Validate Frequently**: Run validation throughout the spec creation process

7. **Cross-Artifact Validation**: Ensure consistency between PRD, stories, and requirements

8. **Version Control**: Save different versions as you refine the spec

9. **Use Project Types**: Select appropriate project type for best PRD template

10. **Integrate with Tasks**: Convert specs to hierarchical tasks for implementation planning

## File Structure

```
spec-creation/
├── __init__.py           # Public API exports and helpers
├── spec_types.py         # Data models (StructuredSpec, UserStory, etc.)
├── questioning.py        # QuestioningEngine and SequentialQuestioner
├── validation.py         # SpecValidator and cross-artifact validation
├── prd_templates.py      # PRDTemplate for different project types
├── analyze.py           # Spec analysis tool
├── examples/            # Usage examples
│   ├── basic_validation.py
│   ├── comprehensive_validation.py
│   └── README.md
└── README.md            # This file
```

## Contributing

When extending this library:

1. Maintain backward compatibility
2. Add type hints to all new functions
3. Update this README with new features
4. Add examples for new functionality
5. Test with realistic spec scenarios
6. Ensure integration with Phase 1 and Phase 2

## License

Part of Blackbox4 - Internal use only.
