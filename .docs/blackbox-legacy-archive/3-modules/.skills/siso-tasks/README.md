# SISO Tasks Skill

Quick access to SISO Internal tasks from Supabase database.

## Quick Start

```bash
# List all pending tasks
/tasks

# Show urgent tasks
/tasks urgent

# Show overdue tasks
/tasks overdue

# Search for tasks
/tasks search agency

# Show statistics
/tasks stats

# Show today's tasks
/tasks today

# Show recent tasks
/tasks recent 20
```

## Commands

| Command | Description |
|---------|-------------|
| `/tasks` | List all pending tasks by priority |
| `/tasks urgent` | Show urgent tasks needing attention |
| `/tasks overdue` | Show past-due tasks |
| `/tasks high` | Show high priority tasks |
| `/tasks search <keyword>` | Search tasks by keyword |
| `/tasks stats` | Show task statistics |
| `/tasks my` | Show your assigned tasks |
| `/tasks today` | Show tasks due today |
| `/tasks recent [limit]` | Show recent tasks |

## Current Statistics

- **Total Tasks:** 101
- **Pending:** 73 (72%)
- **In Progress:** 13 (13%)
- **Completed:** 15 (15%)
- **Overdue:** 52 ⚠️
- **Urgent:** 4

## Files

- `skill.json` - Skill metadata and configuration
- `prompt.md` - Main skill instructions
- `examples/` - Usage examples
  - `list-tasks.md` - List pending tasks
  - `urgent-tasks.md` - Show urgent tasks
  - `overdue-tasks.md` - Show overdue tasks
  - `search-tasks.md` - Search by keyword
  - `task-stats.md` - Show statistics

## MCP Server

Uses: `siso-internal-supabase`

Primary tool: `mcp__siso-internal-supabase__execute_sql`

## Database Schema

**Table:** `public.tasks`

**Status Values:** `pending`, `in_progress`, `done`, `completed`

**Priority Values:** `urgent`, `high`, `medium`, `low`

## Examples

See the `examples/` directory for detailed examples with SQL queries and expected output.

## Version

1.0.0 - Created 2026-01-16
