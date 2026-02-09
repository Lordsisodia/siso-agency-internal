# Goals Directory

**Purpose:** High-level goal management for human-directed work.

---

## Directory Structure

```
goals/
├── active/         # Active goals
├── completed/      # Completed goals
├── templates/      # Goal templates
└── README.md       # This file
```

---

## Goal vs Task

**Goals** are high-level objectives:
- Human-defined
- Longer timeframe
- May spawn multiple tasks

**Tasks** are actionable work items:
- Autonomous or human-defined
- Short timeframe
- Single focus

---

## Goal Format

```markdown
---
id: "GOAL-001"
status: "active"
priority: "high"
created: "2026-02-09T10:00:00Z"
target: "2026-03-09"
owner: "human"
---

# GOAL-001: Goal Title

**Status:** active
**Priority:** high

---

## Objective

Clear statement of the high-level goal.

## Success Criteria

- [ ] Measurable outcome 1
- [ ] Measurable outcome 2

## Sub-Goals

- [ ] Sub-Goal 1 → Creates: TASK-001
- [ ] Sub-Goal 2 → Creates: TASK-002

## Progress Log

| Date | Event | Task Created |
|------|-------|--------------|
| 2026-02-09 | Goal created | - |
```

---

## Cascade to Tasks

Goals are broken down into tasks:

```
GOAL-001 (Improve Performance)
├── TASK-001 (Profile API)
├── TASK-002 (Optimize database)
└── TASK-003 (Add caching)
```
