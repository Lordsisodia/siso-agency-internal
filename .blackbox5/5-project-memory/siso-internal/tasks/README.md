# Task Memory

This folder contains **TaskMemory** - all task-related information.

## Structure

```
tasks/
├── working/             # Active tasks
│   └── {task-id}/
│       ├── task.md           # Task description
│       ├── progress.md       # Progress updates
│       ├── context.json      # Task context
│       └── artifacts/        # Generated files
│
├── completed/           # Completed tasks
│   └── {task-id}/
│       ├── task.md
│       ├── final-report.md   # Final summary
│       ├── outcome.json      # Results, patterns, gotchas
│       └── artifacts/
│
└── archived/            # Old tasks (compressed)
```

## Task Flow

### 1. Create Task

When starting a task, create folder in `working/`:

```bash
tasks/working/task-{timestamp}-{slug}/
```

### 2. Track Progress

Update `progress.md` with developments:

```markdown
# Progress

## 2025-01-19 10:00
- Started work on feature X
- Created initial component structure

## 2025-01-19 11:30
- Implemented core functionality
- Added tests
```

### 3. Complete Task

When done, move to `completed/` and create:

- `final-report.md` - What was accomplished
- `outcome.json` - Patterns discovered, gotchas found

### 4. Archive

After 30 days, compress and move to `archived/`.

## Task Template

See `working/_template/` for task template.
