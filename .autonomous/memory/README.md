# Memory Directory

**Purpose:** Persistent memory storage for the autonomous system.

---

## Directory Structure

```
memory/
├── short_term/    # Temporary working memory
├── long_term/     # Persistent insights and knowledge
├── episodic/      # Run/session records
└── README.md      # This file
```

---

## Memory Types

### Short-Term Memory

- **Purpose:** Working memory for current tasks
- **Lifespan:** Current session only
- **Contents:** Active context, temporary data, scratchpad

### Long-Term Memory

- **Purpose:** Persistent insights and learnings
- **Lifespan:** Permanent (until deleted)
- **Contents:**
  - Insights from completed tasks
  - Best practices discovered
  - Common pitfalls and solutions
  - Architecture decisions

### Episodic Memory

- **Purpose:** Records of runs and sessions
- **Lifespan:** Permanent for significant runs
- **Contents:**
  - Run summaries
  - Decisions made
  - Outcomes achieved
  - Lessons learned

---

## Storage Format

All memory entries use YAML with frontmatter:

```yaml
---
key: "unique-identifier"
created: "2026-02-09T10:00:00Z"
modified: "2026-02-09T10:00:00Z"
version: 1
type: "insight"
category: "testing"
---

# Content here
```
