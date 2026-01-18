# PRD Templates & Generator

Blackbox4 Phase 3 - Professional PRD generation system for spec-to-PRD workflows.

## Overview

This system provides templates and tools to generate comprehensive Product Requirements Documents (PRDs) from spec data. It supports multiple project types with pre-built templates for web apps, mobile apps, API services, and full-stack projects.

## Features

- **Multiple Templates**: Pre-built templates for common project types
- **CLI Tool**: Command-line interface for easy PRD generation
- **Spec Integration**: Works with JSON spec files or spec directories
- **Custom Variables**: Support for custom template variables
- **Validation**: Validate specs before generating PRDs
- **Helper Functions**: Reusable functions for PRD data extraction

## Quick Start

### Installation

No installation required - the scripts are standalone Python files.

### Basic Usage

```bash
# Navigate to Blackbox4 scripts directory
cd "Black Box Factory/current/.blackbox4/4-scripts/prd-templates"

# Make scripts executable (first time only)
chmod +x generate_prd.py
chmod +x ../../generate-prd.sh

# List available templates
./generate_prd.py template-list

# Generate a PRD
./generate_prd.py generate \
  --spec .plans/my-project/spec.json \
  --template web-app \
  --output prd.md
```

### Using the Wrapper Script

```bash
cd "Black Box Factory/current/.blackbox4"

# Generate PRD with wrapper script
./generate-prd.sh \
  --spec .plans/my-project/spec.json \
  --template web-app \
  --output prd.md
```

## Templates

### Available Templates

1. **web-app-prd.md** - Web Application PRD
   - Single Page Applications (SPA)
   - Progressive Web Apps (PWA)
   - Server-Side Rendered (SSR) apps
   - Static sites with dynamic features

2. **mobile-app-prd.md** - Mobile Application PRD
   - iOS native apps
   - Android native apps
   - Cross-platform apps (React Native, Flutter)
   - Mobile-first web apps

3. **api-service-prd.md** - API/Service PRD
   - REST APIs
   - GraphQL APIs
   - Microservices
   - Backend services

4. **fullstack-prd.md** - Full-Stack Project PRD
   - Complete web applications
   - Projects with frontend + backend + database
   - Integrated systems with infrastructure

### Template Structure

All templates follow a consistent structure:

- **Executive Summary** - High-level project overview
- **Project Overview** - Vision, goals, audience
- **User Stories** - User-centric requirements
- **Functional Requirements** - Detailed feature specifications
- **Technical Architecture** - Technology stack and design
- **Performance Requirements** - Performance targets
- **Security Requirements** - Security and compliance
- **Testing Strategy** - Testing approach and tools
- **Launch Plan** - Phased rollout strategy
- **Success Metrics & KPIs** - Measurable outcomes

### Template Variables

Templates use placeholder variables that get filled during generation:

- `{{PROJECT_NAME}}` - Project name
- `{{VERSION}}` - Project version
- `{{DATE}}` - Current date
- `{{STATUS}}` - Project status
- `{{PROJECT_DESCRIPTION}}` - Project overview
- `{{VISION_STATEMENT}}` - Project vision
- `{{PROJECT_GOALS}}` - Key objectives
- `{{TARGET_AUDIENCE}}` - Target users
- `{{USER_STORIES}}` - Formatted user stories
- `{{CORE_FEATURES}}` - Feature specifications
- `{{TECH_STACK}}` - Technology stack details
- `{{KEY_METRICS}}` - Success metrics
- And many more...

## Spec Data Format

### JSON Spec Format

The generator expects JSON spec files with this structure:

```json
{
  "name": "Project Name",
  "version": "1.0.0",
  "status": "Planning",
  "description": "Project description...",
  "vision": "Vision statement...",
  "mission": "Mission statement...",
  "goals": ["Goal 1", "Goal 2"],
  "objectives": ["Objective 1", "Objective 2"],
  "target_audience": "Target users description",
  "users": "User descriptions",
  "user_stories": [
    {
      "role": "user",
      "action": "login to the system",
      "benefit": "access my dashboard"
    }
  ],
  "requirements": {
    "core": [
      {
        "title": "Feature 1",
        "description": "Feature description",
        "priority": "high"
      }
    ],
    "optional": [],
    "technical": []
  },
  "tech_stack": {
    "frontend": {
      "framework": "React",
      "ui": "Material-UI"
    },
    "backend": {
      "framework": "Express",
      "database": "PostgreSQL"
    }
  },
  "success_metrics": [
    {
      "name": "User Engagement",
      "target": "70% daily active users",
      "measurement": "Google Analytics"
    }
  ],
  "success_criteria": [
    "Launch with MVP features",
    "Onboard 100 beta users"
  ],
  "out_of_scope": "Features not included",
  "open_questions": "Questions to be resolved"
}
```

### Spec Directory Format

Alternatively, you can organize spec data in a directory:

```
.plans/my-project/
├── spec.md           # Markdown spec (auto-parsed)
├── spec.json         # JSON spec (preferred)
└── sub-specs/        # Additional spec files
    ├── technical-spec.md
    └── database-schema.md
```

## Commands

### Generate PRD

Generate a PRD from spec data:

```bash
./generate_prd.py generate \
  --spec .plans/my-project/spec.json \
  --template web-app \
  --output prd.md
```

#### Options

- `--spec, -s` - Path to spec JSON file or directory (required)
- `--template, -t` - Template name: web-app, mobile-app, api-service, fullstack (required)
- `--output, -o` - Output PRD file path (required)
- `--var` - Custom template variable (KEY=VALUE) (optional)

#### Custom Variables

Add custom variables to override defaults:

```bash
./generate_prd.py generate \
  --spec spec.json \
  --template web-app \
  --output prd.md \
  --var "STATUS=In Progress" \
  --var "VERSION=2.0.0" \
  --var "TEAM_SIZE=5 developers"
```

### Validate Spec

Validate a spec before generating PRD:

```bash
./generate_prd.py validate --spec .plans/my-project/spec.json
```

Output:
```
Validating spec: .plans/my-project/spec.json
==================================================
✓ Required fields present
✓ User stories found: 12
✓ Requirements found: 8 core
✓ Tech stack defined

✓ Spec is valid for PRD generation
```

### List Templates

List all available templates:

```bash
./generate_prd.py template-list
```

Output:
```
Available PRD Templates:
==================================================
  - web-app
  - mobile-app
  - api-service
  - fullstack

Use --template <name> to select a template
```

## Helper Functions

The `prd_helpers.py` module provides reusable functions:

### extract_user_stories()

Extract and parse user stories from spec data:

```python
from prd_helpers import extract_user_stories

stories = extract_user_stories(spec_data)
# Returns: [{'role': 'user', 'action': '...', 'benefit': '...'}]
```

### extract_requirements()

Extract functional requirements:

```python
from prd_helpers import extract_requirements

requirements = extract_requirements(spec_data)
# Returns: {'core': [...], 'optional': [...], 'technical': [...]}
```

### format_acceptance_criteria()

Format acceptance criteria into markdown:

```python
from prd_helpers import format_acceptance_criteria

criteria = ["User can login", "Password is encrypted"]
formatted = format_acceptance_criteria(criteria)
```

### build_tech_stack_section()

Build formatted tech stack section:

```python
from prd_helpers import build_tech_stack_section

tech_stack = {
    'frontend': {'framework': 'React', 'ui': 'Material-UI'},
    'backend': {'framework': 'Express', 'database': 'PostgreSQL'}
}
section = build_tech_stack_section(tech_stack)
```

### generate_project_context()

Generate complete template context:

```python
from prd_helpers import generate_project_context

context = generate_project_context(spec_data)
# Returns dict with all template variables filled
```

## Template Customization

### Creating Custom Templates

1. Copy an existing template:
```bash
cp templates/web-app-prd.md templates/custom-prd.md
```

2. Edit the template with your structure:
```markdown
# Custom PRD Template

> **Project:** {{PROJECT_NAME}}
> **Custom Field:** {{CUSTOM_VARIABLE}}

## Custom Section
{{CUSTOM_SECTION}}
```

3. Use it with the generator:
```bash
./generate_prd.py generate \
  --spec spec.json \
  --template custom \
  --output prd.md \
  --var "CUSTOM_VARIABLE=value" \
  --var "CUSTOM_SECTION=Custom content"
```

### Modifying Existing Templates

Templates are standard Markdown files with placeholder variables. To modify:

1. Open the template in your editor
2. Add, remove, or restructure sections
3. Use `{{VARIABLE_NAME}}` for dynamic content
4. Test generation with your spec

### Adding New Template Sections

Add new sections to templates:

```markdown
## New Section

### Subsection
{{NEW_VARIABLE}}

#### Details
- **Item 1:** {{ITEM_1}}
- **Item 2:** {{ITEM_2}}
```

Then provide values via:
- Spec data fields
- Custom variables with `--var`
- Helper functions in `prd_helpers.py`

## Integration with Spec Creation Library

The PRD generator integrates seamlessly with the spec creation library:

### From Spec Creation to PRD

1. **Create Spec**:
```bash
cd "Black Box Factory/current/.blackbox4"
./spec-create.sh --project "my-project" --type web-app
```

2. **Generate PRD**:
```bash
./generate-prd.sh \
  --spec .plans/my-project/spec.json \
  --template web-app \
  --output .plans/my-project/prd.md
```

3. **Update Spec**:
```bash
./spec-update.sh --project "my-project" --add-field "tech_stack"
```

4. **Regenerate PRD**:
```bash
./generate-prd.sh --spec .plans/my-project/spec.json --template web-app --output prd-updated.md
```

### Automated Workflow

Create a workflow script:

```bash
#!/bin/bash
# create-and-generate.sh

PROJECT_NAME=$1

# Create spec
./spec-create.sh --project "$PROJECT_NAME" --type web-app

# Generate PRD
./generate-prd.sh \
  --spec ".plans/$PROJECT_NAME/spec.json" \
  --template web-app \
  --output ".plans/$PROJECT_NAME/prd.md"

echo "✓ Spec and PRD created for $PROJECT_NAME"
```

## Examples

### Example 1: Web Application PRD

```bash
./generate_prd.py generate \
  --spec .plans/ecommerce-site/spec.json \
  --template web-app \
  --output ecommerce-prd.md \
  --var "STATUS=In Development" \
  --var "LAUNCH_DATE=Q2 2024"
```

### Example 2: Mobile App PRD

```bash
./generate_prd.py generate \
  --spec .plans/fitness-app/spec.json \
  --template mobile-app \
  --output fitness-app-prd.md \
  --var "PLATFORMS=iOS, Android" \
  --var "BIOMETRIC_AUTH=Face ID, Touch ID"
```

### Example 3: API Service PRD

```bash
./generate_prd.py generate \
  --spec .plans/payment-api/spec.json \
  --template api-service \
  --output payment-api-prd.md \
  --var "API_STYLE=REST" \
  --var "AUTH_METHOD=OAuth 2.0"
```

### Example 4: Full-Stack PRD

```bash
./generate_prd.py generate \
  --spec .plans/saas-platform/spec.json \
  --template fullstack \
  --output saas-platform-prd.md \
  --var "CLOUD_PROVIDER=AWS" \
  --var "DATABASE=PostgreSQL"
```

## Troubleshooting

### Template Not Found

**Error**: `Template 'xyz' not found`

**Solution**: Check available templates with:
```bash
./generate_prd.py template-list
```

### Spec File Not Found

**Error**: `Spec source not found`

**Solution**: Verify the path:
```bash
ls -la .plans/my-project/spec.json
```

### Invalid JSON

**Error**: `Invalid JSON in spec file`

**Solution**: Validate JSON:
```bash
python -m json.tool .plans/my-project/spec.json
```

### Unfilled Placeholders

**Warning**: `Unfilled placeholders: VAR1, VAR2`

**Solution**: Add custom variables:
```bash
./generate_prd.py generate \
  --spec spec.json \
  --template web-app \
  --output prd.md \
  --var "VAR1=value1" \
  --var "VAR2=value2"
```

## Best Practices

1. **Validate First**: Always validate specs before generating PRDs
2. **Use Custom Variables**: Override defaults with project-specific values
3. **Keep Specs Updated**: Regenerate PRDs when specs change
4. **Version Control**: Commit generated PRDs to version control
5. **Customize Templates**: Adapt templates to your organization's needs
6. **Document Variables**: Maintain a list of custom variables used

## File Structure

```
prd-templates/
├── templates/                    # PRD templates
│   ├── web-app-prd.md           # Web application template
│   ├── mobile-app-prd.md        # Mobile app template
│   ├── api-service-prd.md       # API/service template
│   └── fullstack-prd.md         # Full-stack template
├── generate_prd.py              # Main PRD generator script
├── prd_helpers.py               # Helper functions
├── README.md                    # This file
└── examples/                    # Example specs and PRDs (optional)
    ├── web-app-spec.json
    ├── web-app-prd.md
    └── ...
```

## Contributing

To add new templates or improve existing ones:

1. Follow the existing template structure
2. Use descriptive variable names
3. Include all standard sections
4. Test with real spec data
5. Update this README

## License

Part of Blackbox4 Phase 3. See project license for details.

## Support

For issues or questions:
1. Check this README first
2. Review template examples
3. Examine spec data format
4. Check generator error messages

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
**Status**: Production Ready
