# Spec Validation System

The Spec Validation System provides cross-artifact validation for Blackbox4 specs, based on the Spec Kit analyze workflow.

## Overview

The validation system ensures that spec artifacts are:
- **Consistent**: PRDs align with user stories, requirements match constitution
- **Complete**: All required sections and fields are present
- **Traceable**: Requirements can be traced from user stories to implementation

## Components

### ValidationResult

Represents the result of a validation check.

```python
result = ValidationResult(
    is_valid=False,
    message="User story US-001 not referenced in PRD",
    severity="medium",
    location="Story US-001"
)
```

**Attributes:**
- `is_valid` (bool): Whether the validation passed
- `message` (str): Descriptive message
- `severity` (str): "high", "medium", or "low"
- `location` (str): Where the issue was found

### SpecValidator

Main validator class that performs cross-artifact validation.

```python
from spec_creation import SpecValidator

validator = SpecValidator()
```

## Validation Methods

### 1. validate_prd_vs_user_stories()

Validates that PRD aligns with user stories.

**Checks:**
- PRD references all user stories
- PRD doesn't reference non-existent stories
- PRD has User Stories section

```python
results = validator.validate_prd_vs_user_stories(
    "specs/my-spec/prd.md",
    "specs/my-spec/user-stories.md"
)
```

### 2. validate_requirements_vs_constitution()

Validates that requirements align with project constitution.

**Checks:**
- Technology stack consistency
- Architectural principle compliance

```python
results = validator.validate_requirements_vs_constitution(
    "specs/my-spec/functional-requirements.md",
    "specs/my-spec/constitution.md"
)
```

### 3. validate_traceability()

Validates that requirements are traceable from user stories to implementation.

**Checks:**
- Required artifacts exist
- User stories trace to functional requirements
- Traceability references are present

```python
results = validator.validate_traceability("specs/my-spec")
```

### 4. validate_completeness()

Validates that a StructuredSpec is complete.

**Checks:**
- Overview is present and sufficient
- User stories have acceptance criteria
- Functional requirements are defined
- Assumptions and success criteria are documented

```python
results = validator.validate_completeness(spec)
```

## Generating Reports

### Text Report

```python
report = validator.generate_validation_report()
print(report)
```

**Output:**
```markdown
# Spec Validation Report

**Total Issues Found:** 5

## High Severity Issues (2)

### PRD structure
PRD missing User Stories section

### Story US-001
User story US-001 not referenced in PRD

## Medium Severity Issues (2)

### Traceability
User stories section doesn't trace to functional requirements

### Success Criteria
No success criteria defined (recommended)

## Validation Failed

Critical issues must be addressed before proceeding.
```

### Save Report to File

```python
report_path = validator.save_report("specs/my-spec/validation-report.md")
```

## Examples

See the examples directory for complete usage examples:

- **basic_validation.py**: Simple validation examples
- **comprehensive_validation.py**: Full workflow with mock data

Run examples:

```bash
cd 4-scripts/lib/spec-creation/examples
python basic_validation.py
python comprehensive_validation.py
```

## Integration with Spec Kit Workflow

The validation system integrates with the Spec Kit `analyze` workflow:

1. **Parse**: Spec artifacts are parsed into structured data
2. **Validate**: Cross-artifact validation is performed
3. **Report**: Issues are identified and reported
4. **Fix**: Issues are addressed and specs are re-validated

## Best Practices

1. **Validate Early**: Run validation after creating each major artifact
2. **Fix High Severity First**: Address critical issues before proceeding
3. **Review Medium Severity**: Evaluate warnings for potential improvements
4. **Document Low Severity**: Track minor issues for future reference
5. **Automate**: Integrate validation into CI/CD pipeline

## Exit Codes

When used in scripts, the validator can help determine workflow success:

- **0**: All validations passed (no issues or only low severity)
- **1**: Validation failed with medium severity issues
- **2**: Validation failed with high severity issues

## Contributing

To add new validation rules:

1. Add method to `SpecValidator` class
2. Return `List[ValidationResult]` from method
3. Update documentation
4. Add examples and tests
