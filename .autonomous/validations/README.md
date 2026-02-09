# Validations Directory

**Purpose:** Validation results, check results, and verification outputs.

---

## Directory Structure

```
validations/
├── pre-flight/     # Pre-execution checks
├── post-flight/    # Post-execution validations
├── schemas/        # Validation schemas
└── README.md       # This file
```

---

## Validation Types

### Pre-Flight Checks

Run before execution:
- Environment validation
- Dependency checks
- Configuration validation

### Post-Flight Validations

Run after execution:
- Output verification
- State validation
- Success criteria check

---

## Validation Reports

Validation results stored as:

```
{timestamp}-{validation-type}.yaml
```

Example:
```yaml
---
validation:
  type: "pre-flight"
  timestamp: "2026-02-09T10:00:00Z"
  status: "passed"
checks:
  - name: "python_version"
    status: "passed"
    message: "Python 3.12 found"
  - name: "dependencies"
    status: "passed"
    message: "All dependencies installed"
```
