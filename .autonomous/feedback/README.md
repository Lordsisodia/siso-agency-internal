# Feedback Directory

**Purpose:** Feedback collection and processing system.

---

## Directory Structure

```
feedback/
├── incoming/       # Raw feedback
├── processed/      # Reviewed feedback
├── actions/        # Action items from feedback
└── README.md       # This file
```

---

## Feedback Flow

1. **Incoming** - New feedback arrives
2. **Review** - Feedback is reviewed
3. **Process** - Valid feedback moved to processed/
4. **Action** - Tasks created in actions/

---

## Feedback Format

```markdown
---
run_id: "run-20260209_143000"
timestamp: "2026-02-09T14:30:00Z"
type: "improvement"
category: "lib"
severity: "low"
---

# Brief Title

## Observation
What was noticed.

## Context
When/where it occurred.

## Suggestion
What could improve.

## Impact
Expected benefit.
```

---

## Types

- `improvement` - Make something better
- `bug` - Fix something broken
- `observation` - Notable pattern
- `question` - Needs investigation

---

## Categories

- `lib` - Library code
- `agent` - Agent definitions
- `workflow` - Workflows
- `docs` - Documentation
- `other` - Everything else
