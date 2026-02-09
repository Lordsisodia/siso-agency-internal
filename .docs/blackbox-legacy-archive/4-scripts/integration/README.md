# Spec Integration

Integration scripts that connect spec creation with existing Blackbox4 systems.

## Overview

This directory contains integration scripts that bridge the spec creation system with other Blackbox4 components:

- **Phase 1**: Context variables in spec metadata
- **Phase 2**: Hierarchical tasks from user stories
- **agent-handoff.sh**: Spec passing between agents
- **new-plan.sh**: Auto-create spec with new plan
- **hierarchical-plan.py**: Two-way sync with specs

## Files

### Core Integration Scripts

- **spec_to_plan.py** - Convert specs to hierarchical plans
- **plan_to_spec.py** - Convert plans to specs
- **context_aware_spec.py** - Phase 1 context integration
- **handoff_to_spec.py** - Agent handoff integration
- **spec_cli.py** - Unified CLI for all spec operations
- **integrate_spec.sh** - Main wrapper script

## Usage

### Quick Start

```bash
# Create a new spec
./integrate_spec.sh create my-project --interactive

# Convert spec to plan
./integrate_spec.sh spec-to-plan .specs/my-spec.json .plans/my-project

# Convert plan to spec
./integrate_spec.sh plan-to-spec .plans/my-project .specs

# Validate spec
./integrate_spec.sh validate .specs/my-spec.json

# Run questioning workflow
./integrate_spec.sh question .specs/my-spec.json
```

### Using the Unified CLI

```bash
# Create spec
./integrate_spec.sh cli create my-project --interactive

# List all specs
./integrate_spec.sh cli list --verbose

# Show spec info
./integrate_spec.sh cli info .specs/my-spec.json

# Convert formats
./integrate_spec.sh cli convert .specs/my-spec.json .plans/my-project
./integrate_spec.sh cli convert --reverse .plans/my-project .specs
```

### Context-Aware Specs

```bash
# Create tenant-specific spec
./integrate_spec.sh context create-spec --project my-app --tenant tenant-1

# Validate spec context
./integrate_spec.sh context validate .specs/my-spec.json

# Filter spec by environment
./integrate_spec.sh context filter .specs/my-spec.json --environment production

# Enhance spec with context
./integrate_spec.sh context enhance .specs/my-spec.json --add-context '{"region": "eu-west-1"}'
```

### Handoff Integration

```bash
# Create spec during handoff
./integrate_spec.sh handoff create --from agent-1 --to agent-2 --project my-app

# Package spec for handoff
./integrate_spec.sh handoff package .specs/my-spec.json --from agent-1 --to agent-2

# Load spec from handoff
./integrate_spec.sh handoff load .memory/handoffs/handoff-123.json

# Create continuation spec
./integrate_spec.sh handoff continue .specs/my-spec.json --agent agent-3 --reason "Implementation phase"
```

## Integration Points

### Phase 1: Context Variables

Specs integrate with Phase 1 context variables through `context_aware_spec.py`:

- Environment context (tenant, environment, region)
- Blackbox4 runtime context (version, paths)
- Project context (created at, created by)
- Git context (branch, commit)

```python
# Context is automatically collected
context = {
    'environment': {
        'tenant_id': 'default',
        'environment': 'development',
        'region': 'us-east-1'
    },
    'blackbox4': {
        'version': '4.0',
        'root': '/path/to/blackbox4'
    },
    'project': {
        'created_at': '2024-01-15T10:00:00',
        'created_by': 'user'
    }
}
```

### Phase 2: Hierarchical Tasks

Specs convert to hierarchical task structures:

- User stories → Parent tasks
- Functional requirements → Child subtasks
- Dependencies → Task dependencies
- Acceptance criteria → Task validation

```markdown
# Tasks
- [ ] US-001: Implement user authentication
  - [ ] FR-001: Create login form
  - [ ] FR-002: Implement password hashing
  - [ ] FR-003: Add session management
```

### Agent Handoff

Specs integrate with agent handoff system:

- Specs can be created during handoff
- Specs can be passed between agents
- Specs can be continued by new agents
- Handoff context is preserved in spec metadata

```json
{
  "type": "spec_handoff",
  "spec_name": "my-project",
  "from_agent": "architect",
  "to_agent": "dev",
  "context_variables": {
    "spec_path": ".specs/my-project-spec.json"
  }
}
```

## Migration Guide

### Existing Plans to Specs

If you have existing plans and want to migrate to specs:

```bash
# Convert plan to spec
./integrate_spec.sh plan-to-spec .plans/existing-project .specs

# Review and refine the generated spec
./integrate_spec.sh question .specs/existing-project-spec.json

# Validate the spec
./integrate_spec.sh validate .specs/existing-project-spec.json --context-aware
```

### Specs to New Plans

If you want to create a plan from a spec:

```bash
# Convert spec to plan
./integrate_spec.sh spec-to-plan .specs/my-project-spec.json .plans/my-project

# The plan will include:
# - checklist.md with hierarchical tasks
# - plan.json with spec metadata
# - Copy of the original spec
```

## Context Variable Usage

### Tenant-Specific Specs

Create specs that are tenant-aware:

```bash
# Create spec for specific tenant
./integrate_spec.sh context create-spec \
  --project my-app \
  --tenant tenant-1 \
  --output .specs/tenant-1
```

### Environment Filtering

Filter spec content by environment:

```bash
# Filter for production
./integrate_spec.sh context filter \
  .specs/my-spec.json \
  --environment production \
  --output .specs/my-spec-prod.json
```

### Context Validation

Validate spec context integration:

```bash
# Check context coverage
./integrate_spec.sh context validate .specs/my-spec.json

# Output:
# Valid: Yes
# Context Coverage:
#   environment: present
#   blackbox4: present
#   project: present
#   git: present
```

## Agent Handoff Patterns

### Pattern 1: Spec Created During Handoff

```bash
# Agent 1 creates spec during handoff to Agent 2
./integrate_spec.sh handoff create \
  --from architect \
  --to dev \
  --project authentication-system \
  --context '{"message": "Design complete, starting implementation"}'
```

### Pattern 2: Spec Passed Between Agents

```bash
# Package existing spec for handoff
./integrate_spec.sh handoff package \
  .specs/my-spec.json \
  --from agent-1 \
  --to agent-2 \
  --message "Continuing work"

# Agent 2 loads spec from handoff
./integrate_spec.sh handoff load .memory/handoffs/handoff-123.json
```

### Pattern 3: Spec Continuation

```bash
# Create continuation spec for new phase
./integrate_spec.sh handoff continue \
  .specs/my-spec.json \
  --agent qa-engineer \
  --reason "Starting QA phase"
```

## Backward Compatibility

All integrations maintain backward compatibility:

- **Existing plans work unchanged**: No changes required to existing plans
- **Spec creation is optional**: Plans can still be used without specs
- **Two-way conversion**: Convert freely between specs and plans
- **No breaking changes**: All existing scripts continue to work

### Using Existing Workflows

```bash
# Existing plan workflow still works
./4-scripts/planning/new-plan.sh my-project

# New workflow with spec
./4-scripts/integration/integrate_spec.sh create my-project --interactive
./4-scripts/integration/integrate_spec.sh spec-to-plan .specs/my-project-spec.json .plans/my-project
```

## Troubleshooting

### Python Not Found

```bash
# Set Python binary
export PYTHON_BIN=python3

# Or use specific version
export PYTHON_BIN=/usr/bin/python3.9
```

### Import Errors

```bash
# Ensure lib directory is in path
export PYTHONPATH="${PYTHONPATH}:/path/to/blackbox4/4-scripts/lib"
```

### Permission Errors

```bash
# Make scripts executable
chmod +x .blackbox4/4-scripts/integration/*.sh
chmod +x .blackbox4/4-scripts/integration/*.py
```

## Best Practices

### 1. Always Validate Specs

```bash
# Validate before using
./integrate_spec.sh validate .specs/my-spec.json --context-aware
```

### 2. Use Context-Aware Specs

```bash
# Create with context for better integration
./integrate_spec.sh context create-spec --project my-app --tenant tenant-1
```

### 3. Run Questioning Workflow

```bash
# Identify gaps and clarifications
./integrate_spec.sh question .specs/my-spec.json
```

### 4. Maintain Sync Between Spec and Plan

```bash
# Keep spec and plan in sync
./integrate_spec.sh spec-to-plan .specs/my-spec.json .plans/my-project
# ... work on plan ...
./integrate_spec.sh plan-to-spec .plans/my-project .specs/my-spec-updated.json
```

### 5. Use Handoff Integration

```bash
# Pass specs between agents
./integrate_spec.sh handoff package .specs/my-spec.json --from agent-1 --to agent-2
```

## Advanced Usage

### Custom Context Variables

```bash
# Add custom context to spec
./integrate_spec.sh context enhance .specs/my-spec.json \
  --add-context '{"custom_field": "value", "priority": "high"}'
```

### Filtering by Multiple Criteria

```bash
# Combine filters
./integrate_spec.sh context filter .specs/my-spec.json \
  --tenant tenant-1 \
  --environment production
```

### Dry Run Mode

```bash
# Preview conversions
./integrate_spec.sh spec-to-plan .specs/my-spec.json .plans/my-project --dry-run
./integrate_spec.sh plan-to-spec .plans/my-project .specs --dry-run
```

## Related Documentation

- [Spec Creation Guide](../lib/spec-creation/README.md)
- [Hierarchical Tasks](../lib/hierarchical-tasks/README.md)
- [Context Variables](../lib/context-variables/README.md)
- [Agent Handoff](../agents/README.md)
- [Planning System](../planning/README.md)

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the related documentation
3. Check the Blackbox4 main README
4. Open an issue in the repository
