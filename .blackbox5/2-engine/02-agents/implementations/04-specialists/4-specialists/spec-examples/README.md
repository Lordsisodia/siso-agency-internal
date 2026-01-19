# Spec Creation Examples

Comprehensive examples demonstrating spec creation capabilities in Blackbox4.

## Overview

This directory contains practical examples for creating, validating, and managing project specifications using the Blackbox4 spec creation system. Each example demonstrates different aspects of the spec creation workflow.

## Features Demonstrated

### 1. Interactive Spec Creation
**File:** `interactive_spec_example.py`

Demonstrates how to:
- Create a complete spec programmatically
- Add user stories with acceptance criteria
- Define functional requirements with dependencies
- Set project constitution (vision, tech stack, quality standards)
- Generate PRD documentation
- Run validation checks
- Generate questioning reports

**Key Concepts:**
- StructuredSpec data model
- UserStory and FunctionalRequirement types
- ProjectConstitution for project governance
- Automated PRD generation

### 2. Auto-Spec from Requirement
**File:** `auto_spec_from_requirement.py`

Demonstrates how to:
- Parse unstructured requirement text
- Automatically generate structured specs
- Extract user stories from requirements
- Infer functional requirements
- Map constraints and success criteria

**Key Concepts:**
- Requirement analysis and parsing
- Automated story extraction
- Constraint identification
- Success criteria derivation

### 3. Cross-Artifact Validation
**File:** `validation_example.py`

Demonstrates how to:
- Validate PRD against user stories
- Check traceability across documents
- Identify inconsistencies between artifacts
- Generate validation reports
- Handle missing dependencies

**Key Concepts:**
- Cross-document validation
- Traceability verification
- Inconsistency detection
- Severity-based reporting

## Usage

### Running Examples

Each example can be run directly:

```bash
# Interactive spec creation
python interactive_spec_example.py

# Auto-spec from requirement
python auto_spec_from_requirement.py

# Validation example
python validation_example.py
```

### Expected Output

#### Interactive Spec Example
```
============================================================
Interactive Spec Creation Example
============================================================

Working in: /tmp/spec_example_xyz

✅ Spec created successfully!

============================================================
Generated PRD Preview
============================================================

# Product Requirements Document: E-Commerce Platform

## Overview
This project aims to build a modern e-commerce platform...

## User Stories

### US-001: Shopper Product Search
**As a** shopper
**I want** to browse and search for products
**So that** I can find items I want to purchase

...

✅ Files saved:
   PRD: /tmp/spec_example_xyz/ecommerce-spec.prd.md
   JSON: /tmp/spec_example_xyz/ecommerce-spec.json
```

#### Auto-Spec Example
```
============================================================
Auto-Spec Generation from Requirement
============================================================

Requirement:
I need to build a task management application for remote teams...

============================================================

✅ Auto-generated spec from requirement!

Project: Remote Task Manager
User Stories: 4
Functional Requirements: 3

✅ PRD generated: auto-spec.prd.md
✅ Questioning report: questioning-report.md
```

#### Validation Example
```
============================================================
Spec Validation Example
============================================================

Running cross-artifact validations...

1. Validating PRD vs User Stories...
   ✅ User story US-001 found in both documents
   ✅ User story US-002 found in both documents
   ❌ User story US-003 in stories.md but not in PRD

2. Validating Requirements vs Constitution...
   ⚠️  Constitution missing quality standards for FR-001

3. Validating Traceability...
   ✅ All user stories traced to requirements

============================================================
Overall Validation Report
============================================================

High severity: 1
Medium severity: 1
Low severity: 0

Total: 2 issues
```

## Integration with Blackbox4 Planning System

### Spec to Plan Conversion

Specs created using these examples can be automatically converted into Blackbox4 plans:

```python
from spec_types import StructuredSpec

# Create spec
spec = StructuredSpec(project_name="My Project")
# ... populate spec ...

# Save to planning directory
plan_dir = "/path/to/blackbox4/3-plans/2025-01-15-my-project/"
spec.save_to_plan(plan_dir)
```

### Kanban Integration

User stories from specs can be imported into the Kanban system:

```bash
# Import stories to kanban
python /path/to/blackbox4/4-scripts/lib/kanban/import_stories.py \
  --spec spec.json \
  --board "Backlog"
```

### Context Management

Specs integrate with the context system for agent access:

```python
from context_manager import ContextManager

ctx = ContextManager()
ctx.register_spec("my-project", spec_path="spec.json")
```

## Spec Data Model

### StructuredSpec

Main container for all specification data:

```python
spec = StructuredSpec(
    project_name="Project Name",
    version="1.0.0",
    created="2025-01-15"
)

spec.overview = "Project description..."
spec.user_stories = [UserStory(...)]
spec.functional_requirements = [FunctionalRequirement(...)]
spec.constitution = ProjectConstitution(...)
spec.assumptions = ["assumption1", ...]
spec.success_criteria = ["criteria1", ...]
```

### UserStory

Represents a user story with acceptance criteria:

```python
story = UserStory(
    id="US-001",
    as_a="user type",
    i_want="action",
    so_that="benefit",
    acceptance_criteria=["criterion1", ...],
    priority="high|medium|low",
    dependencies=["US-002", ...]
)
```

### FunctionalRequirement

Represents a functional requirement:

```python
req = FunctionalRequirement(
    id="FR-001",
    title="Requirement Title",
    description="Detailed description",
    priority="high|medium|low",
    dependencies=["FR-002", ...],
    acceptance_criteria=["criterion1", ...]
)
```

### ProjectConstitution

Defines project governance and standards:

```python
constitution = ProjectConstitution(
    vision="Project vision statement",
    tech_stack={"component": "technology"},
    quality_standards=["standard1", ...],
    architectural_principles=["principle1", ...],
    constraints=["constraint1", ...]
)
```

## Validation Rules

### Completeness Validation

- All user stories must have acceptance criteria
- All functional requirements must have descriptions
- Constitution must define tech stack
- Project must have at least 3 user stories

### Cross-Artifact Validation

- User stories in PRD must match user stories document
- All requirements must be traceable to user stories
- Constitution quality standards must align with requirements
- Dependencies must be bidirectional

### Consistency Validation

- Priority levels must be consistent
- IDs must be unique and properly formatted
- Tech stack choices must be compatible
- Constraints must be realistic

## Best Practices

### 1. Start with User Stories
Begin by defining user stories to capture requirements from user perspective.

### 2. Define Acceptance Criteria
Always include specific, measurable acceptance criteria for each story.

### 3. Establish Dependencies
Clearly document dependencies between stories and requirements.

### 4. Set Quality Standards
Define measurable quality standards in the constitution.

### 5. Validate Early
Run validation checks frequently to catch inconsistencies early.

### 6. Use Questioning Reports
Review questioning reports to identify gaps and ambiguities.

## Advanced Usage

### Custom Validation Rules

Create custom validation rules:

```python
from validation import SpecValidator, ValidationResult

class CustomValidator(SpecValidator):
    def validate_custom_rule(self, spec):
        results = []
        # Custom validation logic
        results.append(ValidationResult(
            is_valid=True,
            message="Custom rule passed",
            location="custom",
            severity="low"
        ))
        return results
```

### Custom Questioning Patterns

Extend the questioning engine:

```python
from questioning import QuestioningEngine

class CustomQuestioningEngine(QuestioningEngine):
    def generate_custom_questions(self, spec):
        questions = []
        # Custom question generation
        return questions
```

## Troubleshooting

### Import Errors

Ensure the spec-creation library is in the Python path:

```python
import sys
sys.path.insert(0, '/path/to/blackbox4/4-scripts/lib/spec-creation')
```

### Validation Failures

Review validation report for specific issues:

```python
validator = SpecValidator()
results = validator.validate_completeness(spec)
for result in results:
    print(f"{result.severity}: {result.message}")
```

### Missing Dependencies

Check that all dependencies are defined in both directions:

```python
# If FR-002 depends on FR-001
# FR-001 should list FR-002 as a dependent
```

## Related Documentation

- [Spec Creation Library](../../4-scripts/lib/spec-creation/README.md)
- [Planning System](../../3-plans/README.md)
- [Kanban System](../../4-scripts/lib/kanban/README.md)
- [Agent System](../README.md)

## Support

For issues or questions about spec creation:

1. Check the validation report for specific issues
2. Review the questioning report for gaps
3. Consult the main spec creation documentation
4. Check example outputs for reference

## License

Part of the Blackbox4 system. See main project LICENSE for details.
