# PRD Templates - Quick Reference

Fast reference guide for the PRD Template System.

## Quick Commands

### Using Wrapper Script (Recommended)

```bash
cd "Black Box Factory/current/.blackbox4"

# List templates
./generate-prd.sh list

# Validate spec
./generate-prd.sh validate --spec .plans/my-project/spec.json

# Generate PRD
./generate-prd.sh generate \
  --spec .plans/my-project/spec.json \
  --template web-app \
  --output prd.md
```

### Using Python Script Directly

```bash
cd "4-scripts/prd-templates"

# List templates
python3 generate_prd.py template-list

# Validate spec
python3 generate_prd.py validate --spec examples/web-app-spec.json

# Generate PRD
python3 generate_prd.py generate \
  --spec examples/web-app-spec.json \
  --template web-app \
  --output prd.md
```

## Template Selection Guide

| Template | Use Case | Project Type |
|----------|----------|--------------|
| `web-app` | Web applications | SPA, PWA, SSR sites |
| `mobile-app` | Mobile applications | iOS, Android, Cross-platform |
| `api-service` | Backend services | REST API, GraphQL, Microservices |
| `fullstack` | Complete systems | Frontend + Backend + Database |

## Spec JSON Structure

```json
{
  "name": "Project Name",
  "version": "1.0.0",
  "status": "Planning",
  "description": "Project description",
  "vision": "Vision statement",
  "mission": "Mission statement",
  "goals": ["Goal 1", "Goal 2"],
  "target_audience": "Target users",
  "user_stories": [
    {
      "role": "user",
      "action": "do something",
      "benefit": "to achieve benefit"
    }
  ],
  "requirements": {
    "core": [...],
    "optional": [...],
    "technical": [...]
  },
  "tech_stack": {
    "frontend": {...},
    "backend": {...},
    "database": {...}
  },
  "success_metrics": [...],
  "success_criteria": [...],
  "out_of_scope": [...],
  "open_questions": [...]
}
```

## Common Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{PROJECT_NAME}}` | Project name | "Task Manager" |
| `{{VERSION}}` | Project version | "1.0.0" |
| `{{STATUS}}` | Project status | "Planning" |
| `{{PROJECT_DESCRIPTION}}` | Project overview | "A task management app..." |
| `{{TARGET_AUDIENCE}}` | Target users | "Small teams" |
| `{{VISION_STATEMENT}}` | Project vision | "To be the best..." |
| `{{USER_STORIES}}` | User stories (auto-formatted) | - |
| `{{CORE_FEATURES}}` | Feature list (auto-formatted) | - |
| `{{TECH_STACK}}` | Tech stack (auto-formatted) | - |

## Custom Variables

Override any template variable:

```bash
--var "STATUS=In Progress"
--var "VERSION=2.0.0"
--var "CUSTOM_FIELD=Custom Value"
```

## Workflow Integration

### Complete Workflow

```bash
# 1. Create spec
./spec-create.sh --project "my-app" --type web-app

# 2. Validate spec
./spec-validate.sh .plans/my-app/spec.json

# 3. Generate PRD
./generate-prd.sh \
  --spec .plans/my-app/spec.json \
  --template web-app \
  --output .plans/my-app/prd.md

# 4. Review and customize
# Edit .plans/my-app/prd.md
```

### Automated Script

```bash
#!/bin/bash
PROJECT=$1

./spec-create.sh --project "$PROJECT"
./generate-prd.sh \
  --spec ".plans/$PROJECT/spec.json" \
  --template web-app \
  --output ".plans/$PROJECT/prd.md"
```

## File Locations

```
.blackbox4/
├── generate-prd.sh                    # Wrapper script (use this!)
└── 4-scripts/prd-templates/
    ├── templates/                     # Template files
    │   ├── web-app-prd.md
    │   ├── mobile-app-prd.md
    │   ├── api-service-prd.md
    │   └── fullstack-prd.md
    ├── examples/                      # Example specs & PRDs
    │   ├── web-app-spec.json
    │   └── web-app-prd.md
    ├── generate_prd.py               # Python generator
    ├── prd_helpers.py                # Helper functions
    ├── README.md                     # Full documentation
    └── test-integration.sh           # Integration tests
```

## Troubleshooting

### Template Not Found
```bash
# List available templates
./generate-prd.sh list
```

### Spec Not Found
```bash
# Check path exists
ls -la .plans/my-project/spec.json
```

### Invalid JSON
```bash
# Validate JSON
python3 -m json.tool spec.json
```

### Unfilled Placeholders
Add custom variables with `--var "KEY=value"`

## Examples

### Web App
```bash
./generate-prd.sh generate \
  --spec spec.json \
  --template web-app \
  --output web-prd.md
```

### Mobile App
```bash
./generate-prd.sh generate \
  --spec spec.json \
  --template mobile-app \
  --var "PLATFORMS=iOS, Android" \
  --output mobile-prd.md
```

### API Service
```bash
./generate-prd.sh generate \
  --spec spec.json \
  --template api-service \
  --var "API_STYLE=REST" \
  --output api-prd.md
```

### Full Stack
```bash
./generate-prd.sh generate \
  --spec spec.json \
  --template fullstack \
  --var "CLOUD_PROVIDER=AWS" \
  --output fullstack-prd.md
```

## Getting Help

```bash
# Wrapper script help
./generate-prd.sh help

# Python script help
python3 4-scripts/prd-templates/generate_prd.py --help

# Full documentation
cat 4-scripts/prd-templates/README.md
```

## Tips

1. Always validate specs before generating PRDs
2. Use custom variables for project-specific values
3. Review generated PRDs and fill in placeholders
4. Keep specs updated and regenerate PRDs as needed
5. Commit PRDs to version control
6. Customize templates for your organization

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
