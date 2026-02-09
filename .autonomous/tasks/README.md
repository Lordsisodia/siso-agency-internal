# Tasks Directory

**Purpose:** Task management for SISO-Internal autonomous system.

---

## Directory Structure

```
tasks/
├── active/       # Pending and in-progress tasks
├── completed/    # Completed tasks
├── templates/    # Task templates
└── README.md     # This file
```

---

## Task Lifecycle

1. **Created** - Task file created in `active/`
2. **Pending** - Waiting to be started
3. **In Progress** - Currently being worked on
4. **Blocked** - Waiting for dependency or issue resolution
5. **Completed** - Done, moved to `completed/`
6. **Abandoned** - Cancelled, kept in `completed/` for reference

---

## Task File Format

Tasks are markdown files with YAML frontmatter:

```markdown
---
id: "TASK-001"
status: "pending"
priority: "high"
created: "2026-02-09T10:00:00Z"
---

# TASK-001: Task Title

**Status:** pending
**Priority:** high
**Created:** 2026-02-09T10:00:00Z

---

## Objective

Clear one-sentence goal.

## Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Context

Background information.

## Approach

1. Step 1
2. Step 2

## Rollback Strategy

How to undo if things go wrong.

---

## Completion

**Completed:**
**Run Folder:**
**Agent:**
**Path Used:**
**Phase Gates:**
**Decisions Recorded:**
```

---

## Creating New Tasks

Use the template:

```bash
cp templates/TASK-TEMPLATE.md active/TASK-XXX.md
```

Then edit and customize for your task.
