# Architecture Memory

This folder contains **Architecture Memory** - validation, dependencies, and enforcement state.

## Structure

```
architecture/
├── validation.json      # Architecture validation results
├── dependencies.json    # Dependency graph
├── duplicates.json      # Duplicate detection results
└── evolution.json       # Architecture evolution history
```

## Purpose

### Validation
- Track architecture validation results
- Record rule violations
- Monitor compliance

### Dependencies
- Component dependency graph
- Import relationships
- Circular dependency detection

### Duplicates
- Duplicate code detection
- Similar component identification
- Refactoring opportunities

### Evolution
- Architecture changes over time
- Major refactoring history
- Technical debt tracking

## Usage

After architecture validation, update `validation.json`:

```json
{
  "last_validated": "2025-01-19T10:00:00Z",
  "status": "passed",
  "violations": [],
  "warnings": [
    {
      "type": "warning",
      "message": "Component deeply nested",
      "file": "src/components/..."
    }
  ]
}
```
