# SISO Internal Lab — Task System

This is the task backlog for SISO Internal Lab.

## Structure

```
.tasks/
├── task_schema.json   # JSON schema for tasks
├── module.json       # Module configuration
├── backlog/           # Tasks waiting to be worked on
├── in_progress/      # Tasks currently being worked on
├── completed/        # Finished tasks
└── _trash/           # Deleted tasks
```

## Creating a Task

1. Copy `task_schema.json` as a template
2. Create a new folder in `backlog/` with name `TASK-XXXX`
3. Add `task.json` inside with the task details
4. Required fields: `id`, `title`, `status`, `priority`, `target_agent`, `created_at`

## Task Lifecycle

- **backlog** → Ready to be worked on
- **in_progress** → Currently being worked on
- **completed** → Finished
- **blocked** → Waiting on something
- **cancelled** → Not needed
