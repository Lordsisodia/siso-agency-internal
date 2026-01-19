# Blackbox4 Planning Tools

Command-line tools for structured specification creation and management in Blackbox4.

## Overview

These tools implement the GitHub Spec Kit workflow for creating structured, validated specifications with:
- Interactive spec creation
- User story management
- Project constitution definition
- Automated questioning workflow
- PRD generation

## Tools

### spec-create

Main tool for creating structured specifications.

#### Usage

```bash
# Interactive spec creation
./spec-create.sh "My Project" --interactive

# Create from requirement text
./spec-create.sh "My Project" --requirement "As a user, I want to login so that I can access my account"

# Create with questioning workflow
./spec-create.sh "My Project" --interactive --question

# Specify output directory
./spec-create.sh "My Project" --output ./specs/my-project
```

#### Options

- `project` (required): Project name
- `--interactive, -i`: Interactive spec creation mode
- `--requirement, -r`: Requirement text to convert to spec
- `--output, -o`: Output directory (default: `.plans/{timestamp}_{project}_spec`)
- `--question, -q`: Run questioning workflow after spec creation
- `--template, -t`: Spec template type (`basic` or `full`, default: `basic`)

#### Interactive Mode

In interactive mode, you'll be prompted to provide:

1. **Project Overview**: A brief description of the project
2. **User Stories**: User stories with acceptance criteria
   - Format: "As a <role>, I want <goal>, So that <benefit>"
   - Add multiple acceptance criteria per story
3. **Project Constitution** (optional):
   - Vision statement
   - Tech stack choices
   - Quality standards
   - Architectural principles

#### Questioning Workflow

The questioning workflow validates your spec and generates:
- Validation report with critical issues, warnings, and recommendations
- Suggested questions across categories:
  - Scope
  - Users
  - Technical
  - Business
  - Risks

You can then add clarifications to address gaps in the specification.

## Output Structure

When you create a spec, the following files are generated:

```
.plans/{timestamp}_{project}_spec/
├── {project}-spec.json          # Structured spec data
├── {project}-prd.md              # Human-readable PRD
└── questioning-report.md         # Validation report (if --question used)
```

## Examples

### Example 1: Quick Spec Creation

```bash
./spec-create.sh "User Authentication" --requirement "As a user, I want to login with email so that I can access my account securely"
```

### Example 2: Interactive Spec with Constitution

```bash
./spec-create.sh "E-commerce Platform" --interactive --question
```

### Example 3: Custom Output Location

```bash
./spec-create.sh "Mobile App" --interactive --output ./specs/mobile-app
```

## Data Structures

### StructuredSpec

The main specification container containing:
- `project_name`: Name of the project
- `overview`: Project description
- `user_stories`: List of UserStory objects
- `functional_requirements`: List of FunctionalRequirement objects
- `constitution`: Optional ProjectConstitution object
- `clarifications`: List of Q&A pairs
- `metadata`: Additional metadata
- `created_at`: ISO timestamp

### UserStory

Represents a user story with:
- `id`: Unique identifier (e.g., "US-001")
- `as_a`: User role
- `i_want`: Desired feature
- `so_that`: Benefit/value
- `acceptance_criteria`: List of acceptance criteria
- `priority`: Priority level (high/medium/low)
- `story_points`: Optional story point estimate
- `tags`: Optional tags

### ProjectConstitution

Defines project principles:
- `vision`: Project vision statement
- `tech_stack`: Dictionary of technology choices
- `quality_standards`: List of quality standards
- `architectural_principles`: List of architectural principles
- `constraints`: List of constraints

## Integration with Blackbox4

These tools integrate with the Blackbox4 ecosystem:

1. **Plans Directory**: Specs are created in `.plans/` by default
2. **Agent OS Compatible**: Output follows Agent OS conventions
3. **PRD Generation**: Automatic PRD markdown generation
4. **Validation**: Built-in validation ensures spec quality

## Library Usage

You can also use the spec creation library directly in Python:

```python
import sys
sys.path.insert(0, '../lib/spec-creation')

from spec_types import StructuredSpec, UserStory, ProjectConstitution
from questioning import QuestioningEngine

# Create spec
spec = StructuredSpec(project_name="My Project")
spec.overview = "Project description"

# Add user story
story = UserStory(
    id="US-001",
    as_a="user",
    i_want="feature",
    so_that="benefit"
)
spec.add_user_story(story)

# Validate
engine = QuestioningEngine()
report = engine.generate_questioning_report(spec)
print(report)
```

## Contributing

When adding new features:
1. Update library files in `../lib/spec-creation/`
2. Maintain backward compatibility
3. Add tests for new functionality
4. Update this README

## License

Part of the Blackbox4 project.
