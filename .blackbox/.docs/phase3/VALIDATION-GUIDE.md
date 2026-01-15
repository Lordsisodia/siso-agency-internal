# Validation Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Phase:** 3 - Structured Spec Creation

---

## Table of Contents

1. [Overview](#overview)
2. [Validation Types](#validation-types)
3. [Cross-Artifact Validation](#cross-artifact-validation)
4. [Understanding Reports](#understanding-reports)
5. [Auto-Fix Capabilities](#auto-fix-capabilities)
6. [CI/CD Integration](#cicd-integration)
7. [Examples](#examples)

---

## Overview

The SpecValidator in Blackbox4 provides comprehensive validation of structured specifications, checking for completeness, clarity, consistency, and adherence to best practices.

### What is Spec Validation?

Spec validation is the process of verifying that a specification:
- Contains all required components
- Uses clear and unambiguous language
- Maintains internal consistency
- Is feasible given constraints
- Can be tested and verified

### Validation Goals

1. **Completeness** - All necessary components are present
2. **Clarity** - Language is unambiguous
3. **Consistency** - No contradictions
4. **Feasibility** - Achievable within constraints
5. **Testability** - Success can be measured

---

## Validation Types

### 1. Completeness Validation

Checks that all required components are present.

```python
from spec_creation.validation import SpecValidator

validator = SpecValidator()

# Validate completeness
result = validator.validate(spec)

print(f"Completeness Score: {result.completeness_score}%")
print(f"Missing Components: {result.missing_components}")

# Example output:
# Completeness Score: 75%
# Missing Components:
#   - No user stories for 'admin' user type
#   - Constitution constraints not defined
#   - No acceptance criteria for US-005
```

**Completeness Checks:**
- ✅ Overview present and non-empty
- ✅ At least one user story
- ✅ At least one functional requirement
- ✅ Constitution defined
- ✅ All stories have acceptance criteria
- ✅ All requirements have acceptance tests
- ✅ All user types covered

### 2. Clarity Validation

Checks that language is unambiguous and specific.

```python
# Validate clarity
result = validator.validate(spec)

print(f"Clarity Score: {result.clarity_score}%")
print(f"Ambiguous Terms: {result.ambiguous_terms}")

for ambiguity in result.ambiguous_terms:
    print(f"\n[Ambiguity] {ambiguity['term']}")
    print(f"  Location: {ambiguity['location']}")
    print(f"  Issue: {ambiguity['issue']}")
    print(f"  Suggestion: {ambiguity['suggestion']}")
```

**Clarity Checks:**
- ✅ No vague terms ("fast", "easy", "user-friendly")
- ✅ No undefined acronyms
- ✅ No subjective criteria
- ✅ Specific metrics where applicable
- ✅ Clear descriptions

### 3. Consistency Validation

Checks for contradictions and conflicts.

```python
# Validate consistency
result = validator.validate(spec)

print(f"Consistency Score: {result.consistency_score}%")
print(f"Conflicts Found: {len(result.conflicts)}")

for conflict in result.conflicts:
    print(f"\n[Conflict] {conflict['type']}")
    print(f"  Location: {conflict['location']}")
    print(f"  Issue: {conflict['issue']}")
    print(f"  Resolution: {conflict['resolution']}")
```

**Consistency Checks:**
- ✅ No contradictory requirements
- ✅ Priorities are consistent
- ✅ Timeline aligns with scope
- ✅ Budget aligns with requirements
- ✅ Tech stack is consistent
- ✅ Dependencies exist

### 4. Feasibility Validation

Checks that requirements are achievable given constraints.

```python
# Validate feasibility
result = validator.validate(spec)

print(f"Feasibility Score: {result.feasibility_score}%")
print(f"Feasibility Issues: {len(result.feasibility_issues)}")

for issue in result.feasibility_issues:
    print(f"\n[Feasibility] {issue['severity']}")
    print(f"  Issue: {issue['issue']}")
    print(f"  Constraints: {issue['constraints']}")
    print(f"  Suggestion: {issue['suggestion']}")
```

**Feasibility Checks:**
- ✅ Timeline sufficient for scope
- ✅ Budget sufficient for requirements
- ✅ Team skills match tech stack
- ✅ No impossible technical requirements
- ✅ Dependencies are realistic

### 5. Testability Validation

Checks that success can be measured.

```python
# Validate testability
result = validator.validate(spec)

print(f"Testability Score: {result.testability_score}%")
print(f"Untestable Items: {len(result.untestable_items)}")

for item in result.untestable_items:
    print(f"\n[Untestable] {item['location']}")
    print(f"  Issue: {item['issue']}")
    print(f"  Suggestion: {item['suggestion']}")
```

**Testability Checks:**
- ✅ All stories have measurable acceptance criteria
- ✅ All requirements have testable conditions
- ✅ No subjective criteria
- ✅ Success is quantifiable
- ✅ Test conditions are specific

---

## Cross-Artifact Validation

### What is Cross-Artifact Validation?

Cross-artifact validation ensures consistency across related documents:
- Spec ↔ Plan (checklist.md)
- Spec ↔ Kanban cards
- Spec ↔ Documentation
- Spec ↔ Code (when available)

### Spec ↔ Plan Validation

```python
from spec_creation.validation import SpecValidator
from spec_creation import spec_from_plan

# Load spec and plan
spec = StructuredSpec.load("specs/ecommerce.json")
plan_path = ".plans/ecommerce-project"

validator = SpecValidator()

# Cross-validate with plan
result = validator.validate_with_plan(spec, plan_path)

print(f"Plan-Spec Consistency: {result.plan_consistency}%")
print(f"Missing in Spec: {result.missing_in_spec}")
print(f"Missing in Plan: {result.missing_in_plan}")
```

**Checks:**
- All plan tasks covered in spec
- All spec stories have plan tasks
- Milestones align
- Dependencies match

### Spec ↔ Domain Rules Validation

```python
# Define domain rules
ecommerce_rules = {
    "required_user_types": ["customer", "admin", "guest"],
    "required_sections": ["user_stories", "requirements", "constitution"],
    "min_user_stories": 5,
    "min_requirements": 3,
    "required_tech_stack": ["frontend", "backend", "database"],
    "performance_requirements": ["response_time", "concurrent_users"],
    "security_requirements": ["authentication", "authorization", "data_protection"]
}

# Validate with domain rules
result = validator.validate_with_domain_rules(
    spec,
    context={"domain": "ecommerce", "rules": ecommerce_rules}
)

print(f"Domain Compliance: {result.domain_compliance}%")
print(f"Rule Violations: {len(result.rule_violations)}")
```

### Multi-Spec Validation

```python
# Validate multiple specs together
specs = [
    StructuredSpec.load("specs/frontend.json"),
    StructuredSpec.load("specs/backend.json"),
    StructuredSpec.load("specs/api.json")
]

result = validator.validate_multi_spec(specs)

print(f"Cross-Spec Consistency: {result.cross_spec_consistency}%")
print(f"Dependency Issues: {len(result.dependency_issues)}")
print(f"Interface Mismatches: {len(result.interface_mismatches)}")
```

**Cross-Spec Checks:**
- Shared requirements are consistent
- Dependencies are valid
- Interfaces match
- No duplicated functionality

---

## Understanding Reports

### Validation Report Structure

```python
result = validator.validate(spec)

# Report structure:
{
    "is_valid": bool,              # Overall validity
    "completeness_score": float,   # 0-100
    "clarity_score": float,        # 0-100
    "consistency_score": float,    # 0-100
    "feasibility_score": float,    # 0-100
    "testability_score": float,    # 0-100
    "overall_score": float,        # 0-100
    "errors": [],                  # Critical issues
    "warnings": [],                # Non-critical issues
    "suggestions": [],             # Improvements
    "missing_components": [],      # Missing items
    "conflicts": [],               # Contradictions
    "ambiguous_terms": [],         # Unclear language
    "feasibility_issues": [],      # Feasibility problems
    "untestable_items": []         # Untestable items
}
```

### Reading the Report

```python
# Overall assessment
if result.is_valid:
    print("✅ Spec is valid")
else:
    print("❌ Spec has issues that need addressing")

# Score interpretation
if result.overall_score >= 90:
    grade = "A - Excellent"
elif result.overall_score >= 80:
    grade = "B - Good"
elif result.overall_score >= 70:
    grade = "C - Acceptable"
elif result.overall_score >= 60:
    grade = "D - Needs Improvement"
else:
    grade = "F - Inadequate"

print(f"Overall Grade: {grade} ({result.overall_score:.0f}%)")

# Address errors first
if result.errors:
    print(f"\n❌ {len(result.errors)} Critical Errors:")
    for error in result.errors:
        print(f"  [{error['severity']}] {error['message']}")
        print(f"    Location: {error['location']}")
        print(f"    Fix: {error['suggestion']}")

# Then warnings
if result.warnings:
    print(f"\n⚠️  {len(result.warnings)} Warnings:")
    for warning in result.warnings:
        print(f"  - {warning['message']}")

# Finally suggestions
if result.suggestions:
    print(f"\n💡 {len(result.suggestions)} Suggestions:")
    for suggestion in result.suggestions:
        print(f"  - {suggestion['message']}")
```

### Score Breakdown

```python
# Analyze individual scores
scores = {
    "Completeness": result.completeness_score,
    "Clarity": result.clarity_score,
    "Consistency": result.consistency_score,
    "Feasibility": result.feasibility_score,
    "Testability": result.testability_score
}

print("Score Breakdown:")
for category, score in scores.items():
    bar = "█" * int(score / 5)
    status = "✅" if score >= 80 else "⚠️" if score >= 60 else "❌"
    print(f"  {status} {category:15} {score:5.1f}% {bar}")

# Identify weak areas
weak_areas = [cat for cat, score in scores.items() if score < 70]
if weak_areas:
    print(f"\nWeak Areas: {', '.join(weak_areas)}")
```

---

## Auto-Fix Capabilities

### What is Auto-Fix?

Auto-fix automatically resolves common validation issues:
- Default values for missing fields
- Standard formatting
- ID generation
- Priority normalization

### Using Auto-Fix

```python
# Validate first
result = validator.validate(spec)

if not result.is_valid:
    print(f"Found {len(result.errors)} errors")

    # Auto-fix what we can
    auto_fixable = [e for e in result.errors if e.get('auto_fixable')]
    print(f"Can auto-fix {len(auto_fixable)} errors")

    # Apply auto-fix
    if auto_fixable:
        fixed_spec = validator.auto_fix(spec, result.errors)

        # Re-validate
        new_result = validator.validate(fixed_spec)
        print(f"Before: {result.overall_score:.0f}%")
        print(f"After:  {new_result.overall_score:.0f}%")

        # Save fixed version
        fixed_spec.save("specs/ecommerce-fixed.json")
```

### Auto-Fixable Issues

**1. Missing IDs**
```python
# Before
story = UserStory(as_a="user", i_want="login")  # No ID

# After auto-fix
story.id = "US-001"  # Auto-generated
```

**2. Invalid Priorities**
```python
# Before
story = UserStory(..., priority="urgent")  # Invalid

# After auto-fix
story.priority = "critical"  # Normalized
```

**3. Empty Acceptance Criteria**
```python
# Before
story = UserStory(..., acceptance_criteria=[])

# After auto-fix
story.acceptance_criteria = [
    "To be defined: Specify measurable acceptance criteria"
]
```

**4. Missing Constitution**
```python
# Before
spec.constitution = None

# After auto-fix
spec.constitution = ProjectConstitution(
    vision="To be defined",
    tech_stack={},
    quality_standards=[],
    constraints=[]
)
```

### Manual Fixes

Some issues require manual intervention:

```python
# Identify manual fixes needed
manual_fixes = [
    e for e in result.errors
    if not e.get('auto_fixable')
]

print(f"Requires manual review: {len(manual_fixes)} issues")

for issue in manual_fixes:
    print(f"\n[{issue['severity']}] {issue['message']}")
    print(f"  Location: {issue['location']}")
    print(f"  Action Required: {issue['suggestion']}")
```

---

## CI/CD Integration

### Pre-Commit Validation

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Validating specs..."

# Find all spec files
specs=$(find . -name "*-spec.json" -o -name "*-spec.json")

# Validate each
for spec in $specs; do
    echo "Validating $spec..."

    python3 -c "
import sys
sys.path.append('4-scripts/lib')
from spec_creation import StructuredSpec
from spec_creation.validation import SpecValidator

spec = StructuredSpec.load('$spec')
validator = SpecValidator()
result = validator.validate(spec)

if not result.is_valid:
    print(f'❌ Validation failed for $spec')
    print(f'Overall score: {result.overall_score:.0f}%')
    for error in result.errors:
        print(f'  - {error[\"message\"]}')
    sys.exit(1)

print(f'✅ $spec validated ({result.overall_score:.0f}%)')
"

    if [ $? -ne 0 ]; then
        echo "Commit blocked: Fix validation errors first"
        exit 1
    fi
done

echo "✅ All specs validated successfully"
```

### GitHub Actions

```yaml
# .github/workflows/spec-validation.yml
name: Spec Validation

on:
  push:
    paths:
      - 'specs/**'
  pull_request:
    paths:
      - 'specs/**'

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'

    - name: Validate specs
      run: |
        python3 -c "
import sys
sys.path.append('4-scripts/lib')
from spec_creation import StructuredSpec
from spec_creation.validation import SpecValidator
import os
import json

specs_dir = 'specs'
failed = []

for filename in os.listdir(specs_dir):
    if filename.endswith('-spec.json'):
        filepath = os.path.join(specs_dir, filename)
        spec = StructuredSpec.load(filepath)
        validator = SpecValidator()
        result = validator.validate(spec)

        if not result.is_valid or result.overall_score < 70:
            failed.append({
                'file': filename,
                'score': result.overall_score,
                'errors': result.errors
            })

if failed:
    print('❌ Validation failed for:')
    for f in failed:
        print(f'  {f[\"file\"]} ({f[\"score\"]:.0f}%)')
    sys.exit(1)

print('✅ All specs validated')
"
```

### Automated Quality Gates

```python
# quality_gate.py
import sys
sys.path.append('4-scripts/lib')

from spec_creation import StructuredSpec
from spec_creation.validation import SpecValidator

def quality_gate(spec_path, threshold=80):
    """Enforce quality threshold"""

    spec = StructuredSpec.load(spec_path)
    validator = SpecValidator()
    result = validator.validate(spec)

    # Quality gate rules
    if result.overall_score < threshold:
        print(f"❌ FAILED: Overall score {result.overall_score:.0f}% below threshold {threshold}%")
        return False

    if result.completeness_score < threshold:
        print(f"❌ FAILED: Completeness {result.completeness_score:.0f}% below threshold {threshold}%")
        return False

    if len(result.errors) > 0:
        print(f"❌ FAILED: {len(result.errors)} critical errors")
        return False

    print(f"✅ PASSED: Quality gate ({result.overall_score:.0f}%)")
    return True

if __name__ == "__main__":
    if not quality_gate(sys.argv[1], threshold=int(sys.argv[2])):
        sys.exit(1)
```

---

## Examples

### Example 1: Complete Validation

```python
from spec_creation import StructuredSpec
from spec_creation.validation import SpecValidator

# Load spec
spec = StructuredSpec.load("specs/ecommerce.json")

# Validate
validator = SpecValidator()
result = validator.validate(spec)

# Print report
print("=" * 60)
print("VALIDATION REPORT")
print("=" * 60)

print(f"\nOverall: {result.overall_score:.0f}% {'✅' if result.is_valid else '❌'}")
print(f"  Completeness: {result.completeness_score:.0f}%")
print(f"  Clarity: {result.clarity_score:.0f}%")
print(f"  Consistency: {result.consistency_score:.0f}%")
print(f"  Feasibility: {result.feasibility_score:.0f}%")
print(f"  Testability: {result.testability_score:.0f}%")

if result.errors:
    print(f"\n❌ ERRORS ({len(result.errors)}):")
    for error in result.errors:
        print(f"  - {error['message']}")
        print(f"    Location: {error['location']}")

if result.warnings:
    print(f"\n⚠️  WARNINGS ({len(result.warnings)}):")
    for warning in result.warnings:
        print(f"  - {warning['message']}")

if result.suggestions:
    print(f"\n💡 SUGGESTIONS ({len(result.suggestions)}):")
    for suggestion in result.suggestions[:5]:
        print(f"  - {suggestion['message']}")
```

### Example 2: Domain-Specific Validation

```python
# Define e-commerce domain rules
ecommerce_rules = {
    "required_user_stories": [
        "product_browsing",
        "shopping_cart",
        "checkout",
        "payment",
        "order_management"
    ],
    "required_requirements": [
        "user_authentication",
        "product_management",
        "payment_processing",
        "order_fulfillment"
    ],
    "required_constitution_items": [
        "tech_stack",
        "security_standards",
        "performance_requirements"
    ]
}

# Validate with domain rules
result = validator.validate_with_domain_rules(
    spec,
    context={"domain": "ecommerce", "rules": ecommerce_rules}
)

print(f"E-commerce Compliance: {result.domain_compliance:.0f}%")

# Missing required items
for item in result.missing_required_items:
    print(f"  Missing: {item}")
```

### Example 3: Auto-Fix and Re-Validate

```python
# Initial validation
result = validator.validate(spec)
print(f"Initial Score: {result.overall_score:.0f}%")
print(f"Errors: {len(result.errors)}")

# Auto-fix what we can
fixed_spec = validator.auto_fix(spec, result.errors)

# Re-validate
new_result = validator.validate(fixed_spec)
print(f"After Auto-Fix: {new_result.overall_score:.0f}%")
print(f"Errors: {len(new_result.errors)}")

# Manual fixes remaining
manual = [e for e in new_result.errors if not e.get('auto_fixable')]
print(f"Manual fixes needed: {len(manual)}")

for issue in manual:
    print(f"\n  - {issue['message']}")
    print(f"    Location: {issue['location']}")
    print(f"    Suggestion: {issue['suggestion']}")
```

### Example 4: Comparison Validation

```python
# Compare two versions
spec_v1 = StructuredSpec.load("specs/ecommerce-v1.json")
spec_v2 = StructuredSpec.load("specs/ecommerce-v2.json")

result_v1 = validator.validate(spec_v1)
result_v2 = validator.validate(spec_v2)

print(f"Version 1: {result_v1.overall_score:.0f}%")
print(f"Version 2: {result_v2.overall_score:.0f}%")
print(f"Improvement: {result_v2.overall_score - result_v1.overall_score:.0f}%")

# What changed?
added_stories = len(spec_v2.user_stories) - len(spec_v1.user_stories)
added_reqs = len(spec_v2.functional_requirements) - len(spec_v1.functional_requirements)

print(f"Added {added_stories} user stories")
print(f"Added {added_reqs} requirements")
```

---

## Best Practices

### 1. Validate Early and Often

Don't wait until the end:
```python
# Validate after each major addition
spec.add_user_story(story)
result = validator.validate(spec)
if result.completeness_score < 50:
    # Address issues before continuing
    pass
```

### 2. Set Quality Thresholds

Define minimum acceptable scores:
```python
MIN_SCORE = 80

result = validator.validate(spec)
if result.overall_score < MIN_SCORE:
    # Don't proceed until score improves
    pass
```

### 3. Use Auto-Fix Cautiously

Auto-fix is a starting point, not a final solution:
```python
fixed_spec = validator.auto_fix(spec, errors)
# Always review auto-fixed content
# Manual review is still needed
```

### 4. Track Validation History

Monitor spec quality over time:
```python
import json
from datetime import datetime

history = []

# After each validation
history.append({
    "timestamp": datetime.now().isoformat(),
    "score": result.overall_score,
    "completeness": result.completeness_score,
    "clarity": result.clarity_score,
    "consistency": result.consistency_score
})

# Save history
with open("spec-validation-history.json", "w") as f:
    json.dump(history, f, indent=2)
```

### 5. Integrate with Workflow

Make validation part of your development process:
- Pre-commit hooks
- CI/CD pipelines
- Pull request checks
- Documentation generation

---

## Conclusion

The SpecValidator provides comprehensive validation to ensure specifications are complete, clear, consistent, feasible, and testable. By integrating validation into your workflow, you can catch issues early and maintain high-quality specs.

**Key Takeaways:**
- Validate early and often
- Use auto-fix for common issues
- Set quality thresholds
- Track validation history
- Integrate with CI/CD

**Next Steps:**
- Read [Integration Guide](INTEGRATION-GUIDE.md)
- Read [API Reference](API-REFERENCE.md)
- Explore [Examples](EXAMPLES.md)
