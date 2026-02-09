# Blackbox4 Validation System

Comprehensive validation and cross-artifact validation system for Blackbox4 Phase 3.

## Overview

The validation system provides tools to:
- Validate individual specifications for completeness, consistency, and quality
- Validate traceability across multiple project artifacts
- Generate reports in multiple formats (HTML, Markdown, JSON)
- Automatically fix common validation issues
- Integrate with CI/CD pipelines

## Components

### 1. Spec Validator (`spec_validator.py`)

Enhanced validation engine that extends the base validation library with comprehensive checks.

**Features:**
- **Completeness Validation**: Checks all required fields are present and populated
- **Consistency Validation**: Ensures internal consistency (IDs, formats, dependencies)
- **Quality Validation**: Assesses content quality (specificity, measurability, clarity)
- **Scoring System**: Provides scores for completeness, consistency, quality, and overall

**Validation Checks:**
- Project metadata (name, created timestamp)
- Overview quality and length
- User story structure and completeness
- Functional requirements
- Constitution elements (vision, tech stack, quality standards)
- ID uniqueness and format
- Priority consistency
- Circular dependency detection

### 2. Cross-Artifact Validator (`cross_artifact_validator.py`)

Validates consistency and traceability across multiple project documents.

**Features:**
- **PRD vs Stories**: Ensures user stories implement PRD requirements
- **Requirements vs Architecture**: Verifies architecture addresses requirements
- **Plan vs Requirements**: Confirms implementation plan covers all requirements
- **Traceability Validation**: Checks end-to-end traceability chains
- **Traceability Matrix**: Generates relationship mapping between artifacts

**Supported Artifacts:**
- PRD (JSON or Markdown)
- User Stories (JSON or Markdown)
- Architecture Documentation (JSON or Markdown)
- Implementation Plans (JSON or Markdown)

### 3. Validation Report Generator (`validation_report.py`)

Generates professional validation reports in multiple formats.

**Output Formats:**
- **HTML**: Interactive, styled HTML report with color-coded issues
- **Markdown**: Clean, readable Markdown documentation
- **JSON**: Machine-readable format for CI/CD integration

**Report Features:**
- Overall validation score
- Issue breakdown by severity (critical, warning, info)
- Category-based issue grouping
- Traceability matrix visualization
- Suggestions and guidance for each issue
- Professional styling for HTML output

### 4. Auto-Fix Module (`auto_fix.py`)

Automatically fixes common validation issues.

**Auto-Fix Capabilities:**
- **Missing IDs**: Generates IDs for stories (US-001, US-002, etc.)
- **Formatting**: Fixes spacing, punctuation, and formatting issues
- **Priority Normalization**: Standardizes priority values (must, should, could, wont)
- **Timestamp Addition**: Adds missing creation timestamps
- **Dry Run Mode**: Preview changes before applying

**Limitations:**
- Only fixes structural/formatting issues
- Content quality issues require manual review
- Always creates backup before modifying

### 5. Validation CLI (`validate_spec.sh`)

Command-line interface for easy access to all validation features.

## Installation

The validation system is part of Blackbox4 Phase 3. No additional installation required.

**Prerequisites:**
- Python 3.7+
- Bash shell

## Usage

### Command-Line Interface

The `validate_spec.sh` wrapper provides an easy CLI:

```bash
# Validate a spec file
./validate_spec.sh validate -s my-spec.json

# Validate with HTML report
./validate_spec.sh validate -s my-spec.json -f html -o report.html

# Run cross-artifact validation
./validate_spec.sh cross-artifact -p .plans/my-project

# Auto-fix issues
./validate_spec.sh auto-fix -s my-spec.json -o fixed-spec.json

# Run all validations
./validate_spec.sh all -p .plans/my-project -f html -o report

# Dry run auto-fix
./validate_spec.sh auto-fix -s my-spec.json --dry-run
```

### Python API

#### Spec Validator

```python
from spec_validator import EnhancedSpecValidator
from spec_types import StructuredSpec

# Load spec
spec = StructuredSpec.from_file('my-spec.json')

# Create validator
validator = EnhancedSpecValidator()

# Validate
result = validator.validate_spec(spec)

# Check results
if result.is_valid:
    print("Spec is valid!")
else:
    print(f"Found {len(result.errors)} issues")

# Get scores
scores = validator.get_scores()
print(f"Overall score: {scores['overall']:.1f}%")
```

#### Cross-Artifact Validator

```python
from cross_artifact_validator import CrossArtifactValidator

# Create validator
validator = CrossArtifactValidator()

# Load artifacts
validator.load_artifact('prd', 'prd.json')
validator.load_artifact('stories', 'stories.json')

# Run validations
issues = validator.validate_prd_vs_stories()
issues.extend validator.validate_requirements_vs_architecture()
issues.extend validator.validate_plan_vs_requirements()

# Get traceability matrix
matrix = validator.get_traceability_matrix()
```

#### Validation Report

```python
from validation_report import ValidationReport

# Create report
report = ValidationReport("My Project")

# Add issues
for error in validation_result.errors:
    report.add_issue(error)

# Set scores
report.set_scores(validator.get_scores())

# Generate reports
html = report.generate_html('report.html')
markdown = report.generate_markdown('report.md')
json_data = report.generate_json('report.json')
```

#### Auto-Fix

```python
from auto_fix import AutoFixer

# Create fixer
fixer = AutoFixer(dry_run=False)

# Apply fixes
fixed_spec, fixes_applied = fixer.fix_spec(spec, validation_result)

# Get fix report
report = fixer.get_fix_report()
print(f"Applied {report['summary']['total_applied']} fixes")
```

## Validation Rules

### Completeness Rules

| Rule | Description | Severity |
|------|-------------|----------|
| `overview_min_length` | Overview must be at least 50 characters | Critical |
| `min_user_stories` | At least 1 user story required | Critical |
| `require_acceptance_criteria` | Stories must have acceptance criteria | Warning |
| `require_constitution` | Constitution recommended | Info |

### Consistency Rules

| Rule | Description | Severity |
|------|-------------|----------|
| `unique_story_ids` | All story IDs must be unique | Critical |
| `unique_requirement_ids` | All requirement IDs must be unique | Critical |
| `story_id_format` | Story IDs must match US-### format | Warning |
| `requirement_id_format` | Requirement IDs must match FR-### format | Warning |
| `valid_priorities` | Priorities must be: must, should, could, wont | Warning |
| `no_circular_deps` | No circular dependencies allowed | Critical |

### Quality Rules

| Rule | Description | Severity |
|------|-------------|----------|
| `overview_word_count` | Overview should be at least 20 words | Warning |
| `no_vague_terms` | Avoid vague terms (etc, various, maybe) | Info |
| `acceptance_criteria_count` | Average 2+ criteria per story | Info |
| `measurable_stories` | 50%+ stories should be measurable | Info |

## Understanding Validation Reports

### Score Interpretation

- **90-100%**: Excellent - Spec is well-formed and complete
- **70-89%**: Good - Minor issues to address
- **50-69%**: Fair - Several issues need attention
- **Below 50%**: Poor - Significant problems exist

### Issue Severity Levels

- **Critical**: Must fix before proceeding (blocks progress)
- **Warning**: Should fix (may cause problems later)
- **Info**: Nice to have (improves quality)

### Issue Categories

- **metadata**: Project metadata and timestamps
- **overview**: Project overview and description
- **user_stories**: User story structure and content
- **requirements**: Functional requirements
- **constitution**: Project constitution elements
- **dependencies**: Story and requirement dependencies
- **traceability**: Cross-artifact traceability

## CI/CD Integration

### Exit Codes

The validation system uses standard exit codes for CI/CD integration:

```bash
# Exit codes
0  # Success (no critical issues)
1  # Validation failed (critical issues found)
2  # Execution error
```

### GitHub Actions Example

```yaml
name: Validate Spec

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Validate Spec
        run: |
          cd .blackbox4
          ./4-scripts/validation/validate_spec.sh validate \
            -s plans/my-spec.json \
            -f json \
            -o validation-report.json

      - name: Upload Report
        uses: actions/upload-artifact@v2
        with:
          name: validation-report
          path: validation-report.json
```

### GitLab CI Example

```yaml
validate:
  stage: test
  script:
    - cd .blackbox4
    - ./4-scripts/validation/validate_spec.sh all -p plans/my-project -f html -o report
  artifacts:
    paths:
      - report.html
    expire_in: 1 week
```

## Auto-Fix Capabilities

### What Can Be Auto-Fixed

- Missing IDs (US-001, FR-001, etc.)
- Priority normalization (high -> must, low -> could)
- Formatting issues (extra spaces, punctuation)
- Missing timestamps
- Duplicate ID detection

### What Requires Manual Review

- Overview content quality
- User story specificity
- Acceptance criteria completeness
- Constitution elements
- Circular dependencies (analysis provided)

### Using Auto-Fix Safely

1. **Always use dry-run first**:
   ```bash
   ./validate_spec.sh auto-fix -s my-spec.json --dry-run
   ```

2. **Keep backups**:
   ```bash
   cp my-spec.json my-spec.json.backup
   ```

3. **Review the fix report**:
   ```bash
   ./validate_spec.sh auto-fix -s my-spec.json --report fixes.json
   cat fixes.json
   ```

4. **Apply fixes**:
   ```bash
   ./validate_spec.sh auto-fix -s my-spec.json -o fixed-spec.json
   ```

## Configuration

### Customizing Validation Rules

```python
from spec_validator import EnhancedSpecValidator

validator = EnhancedSpecValidator()

# Customize rules
validator.set_rule('overview_min_length', 100)
validator.set_rule('min_user_stories', 3)
validator.set_rule('require_acceptance_criteria', True)
validator.set_rule('require_constitution', True)

# Run validation with custom rules
result = validator.validate_spec(spec)
```

### Configuring Auto-Fix Behavior

```python
from auto_fix import AutoFixer

# Create fixer with dry-run enabled
fixer = AutoFixer(dry_run=True)

# Preview fixes
fixed_spec, fixes = fixer.fix_spec(spec, validation_result)

# Apply fixes for real
fixer = AutoFixer(dry_run=False)
fixed_spec, fixes = fixer.fix_spec(spec, validation_result)
```

## Troubleshooting

### Common Issues

**Issue**: Module not found errors
```bash
# Solution: Ensure lib directory is in Python path
export PYTHONPATH="${PYTHONPATH}:.blackbox4/4-scripts/lib"
```

**Issue**: Permission denied on scripts
```bash
# Solution: Make scripts executable
chmod +x .blackbox4/4-scripts/validation/*.py
chmod +x .blackbox4/4-scripts/validation/*.sh
```

**Issue**: JSON parse errors
```bash
# Solution: Validate JSON syntax first
python3 -m json.tool my-spec.json
```

### Debug Mode

Enable verbose output for debugging:

```bash
./validate_spec.sh validate -s my-spec.json --verbose
```

## Best Practices

1. **Validate Early and Often**
   - Run validation after each significant change
   - Don't wait until the end to validate

2. **Address Critical Issues First**
   - Critical issues block progress
   - Warnings and info can be addressed iteratively

3. **Use Auto-Fix Carefully**
   - Always dry-run first
   - Review changes before committing
   - Keep backups

4. **Maintain Traceability**
   - Ensure stories trace to requirements
   - Keep requirements traceable to architecture
   - Update traceability as specs evolve

5. **Generate Reports for Documentation**
   - HTML for stakeholders
   - Markdown for documentation
   - JSON for CI/CD and automation

## Advanced Usage

### Custom Validation Rules

```python
from spec_validator import EnhancedSpecValidator, ValidationResult

class CustomValidator(EnhancedSpecValidator):
    def validate_custom_rule(self, spec, result):
        # Your custom validation logic
        if some_condition:
            result.add_error(
                'warning',
                'custom',
                'Custom validation message',
                'Suggestion for fixing'
            )

# Use custom validator
validator = CustomValidator()
result = validator.validate_spec(spec)
```

### Batch Validation

```bash
# Validate all specs in a directory
for spec in plans/*-spec.json; do
    echo "Validating $spec..."
    ./validate_spec.sh validate -s "$spec" -f json -o "${spec%.json}-report.json"
done
```

### Integration with Testing

```python
# In your test suite
def test_spec_validation():
    spec = load_test_spec()
    validator = EnhancedSpecValidator()
    result = validator.validate_spec(spec)

    # Assert no critical issues
    critical = [e for e in result.errors if e.level == 'critical']
    assert len(critical) == 0, f"Found {len(critical)} critical issues"

    # Assert minimum score
    assert validator.get_scores()['overall'] >= 70
```

## File Structure

```
.blackbox4/4-scripts/validation/
├── spec_validator.py              # Enhanced spec validation
├── cross_artifact_validator.py    # Cross-artifact validation
├── validation_report.py           # Report generation
├── auto_fix.py                    # Auto-fix capabilities
├── validate_spec.sh               # CLI wrapper
├── check-blackbox.sh              # Blackbox validation
├── check-dependencies.sh          # Dependency checking
├── lib.sh                         # Validation library functions
└── README.md                      # This file
```

## Contributing

When extending the validation system:

1. **Add new validators** to `spec_validator.py`
2. **Follow the existing pattern** for validation results
3. **Add tests** for new validation rules
4. **Update this README** with new capabilities
5. **Maintain backward compatibility**

## Support

For issues or questions:
1. Check this README first
2. Review validation reports for detailed error messages
3. Use `--verbose` flag for debugging
4. Check existing issues in the Blackbox4 repository

## Version History

- **v1.0.0** (2025-01-15): Initial release
  - Spec validator with completeness, consistency, quality checks
  - Cross-artifact validation
  - Multi-format report generation
  - Auto-fix capabilities
  - CLI wrapper

## License

Part of the Blackbox4 system. See project LICENSE for details.
