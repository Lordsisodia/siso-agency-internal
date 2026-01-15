# SISO Tasks Skill - Created Successfully

**Date:** 2026-01-16
**Location:** `.blackbox/3-modules/.skills/siso-tasks/`
**Status:** ✅ Complete

---

## What Was Created

A comprehensive skill for querying SISO Internal tasks from the Supabase database.

### Directory Structure
```
.blackbox/3-modules/.skills/siso-tasks/
├── skill.json                    # Skill metadata & configuration
├── prompt.md                     # Main skill instructions
├── README.md                     # Quick reference guide
└── examples/                     # Detailed usage examples
    ├── list-tasks.md            # /tasks command
    ├── urgent-tasks.md          # /tasks urgent command
    ├── overdue-tasks.md         # /tasks overdue command
    ├── search-tasks.md          # /tasks search command
    └── task-stats.md            # /tasks stats command
```

---

## Available Commands

| Command | Description |
|---------|-------------|
| `/tasks` | List all pending tasks (ordered by priority) |
| `/tasks urgent` | Show urgent tasks needing attention |
| `/tasks overdue` | Show past-due tasks with days overdue |
| `/tasks high` | Show high priority tasks |
| `/tasks search <keyword>` | Search tasks by keyword |
| `/tasks stats` | Show comprehensive statistics |
| `/tasks my` | Show tasks assigned to current user |
| `/tasks today` | Show tasks due today |
| `/tasks recent [limit]` | Show recently created tasks |

---

## Quick Examples

### List Pending Tasks
```bash
/tasks
```
Shows all 73 pending tasks, grouped by priority (urgent → high → medium → low)

### Show Urgent Tasks
```bash
/tasks urgent
```
Shows 4 urgent tasks that need immediate attention

### Search for Specific Tasks
```bash
/tasks search agency
```
Finds all tasks related to "agency" (12 results)

### Show Statistics
```bash
/tasks stats
```
Displays comprehensive breakdown:
- Total: 101 tasks
- Pending: 73 (72%)
- In Progress: 13 (13%)
- Completed: 15 (15%)
- Overdue: 52 ⚠️

---

## Technical Details

### MCP Server
- **Server:** `siso-internal-supabase`
- **Tool:** `mcp__siso-internal-supabase__execute_sql`
- **Database:** `public.tasks` table

### Schema Reference
```sql
-- Task Status Values
status: 'pending' | 'in_progress' | 'done' | 'completed'

-- Priority Values
priority: 'urgent' | 'high' | 'medium' | 'low'

-- Key Columns
id (UUID)
title (text)
description (text)
status (text)
priority (text)
created_by (UUID)
assigned_to (UUID)
due_date (timestamp)
created_at (timestamp)
updated_at (timestamp)
```

---

## Current Task Statistics

As of 2026-01-16:

| Metric | Count | Percentage |
|--------|-------|------------|
| Total Tasks | 101 | 100% |
| Pending | 73 | 72% |
| In Progress | 13 | 13% |
| Done | 10 | 10% |
| Completed | 5 | 5% |
| Overdue | 52 | 52% ⚠️ |
| Urgent | 4 | 4% |

---

## How to Use

### Option 1: Direct Commands
Just type the command in chat:
```
/tasks urgent
```

### Option 2: As Part of Workflow
Incorporate into your workflow:
```
"Let me check the urgent tasks first, then look at what's due today."
```

The skill will automatically execute the appropriate queries.

---

## Example Session

```
User: /tasks urgent

Assistant:
🚨 URGENT Tasks (4 found)

⏸️ PENDING (2)
  • [9db34bd9] Fix email automation bug
    Status: pending | Priority: urgent
    Due: 2025-07-17

  • [d6b7361a] Complete workshop resit urgently
    Status: pending | Priority: urgent
    No due date

🔄 IN PROGRESS (1)
  • [e72e2c98] Implement cryptocurrency wallet integration
    Status: in_progress | Priority: urgent
    Due: 2025-07-17
```

---

## Documentation

### Main Files
- **`skill.json`** - Skill configuration and command definitions
- **`prompt.md`** - Complete skill documentation with SQL queries
- **`README.md`** - Quick start guide

### Examples
Each example file contains:
- Command description
- SQL query used
- Expected output format
- Use cases
- Tips and notes

---

## Next Steps

### Immediate
1. ✅ Skill created and documented
2. ✅ All examples written
3. ⏭️ Test the skill with actual commands
4. ⏭️ Integrate into daily workflow

### Future Enhancements
Potential additions for v2.0:
- `/tasks create` - Create new tasks
- `/tasks update <id>` - Update task status
- `/tasks assign <id> <user>` - Assign to user
- `/tasks complete <id>` - Mark as done
- `/tasks project <name>` - Group by project
- `/tasks blocked` - Show blocked tasks
- `/tasks flag` - Flag tasks needing attention

---

## Related Documentation

- **SISO-TASK-MANAGEMENT-MCP-GUIDE.md** - How to query Supabase directly
- **`.blackbox/.docs/guides/`** - Other guides and documentation

---

## Notes

1. **Data Source:** All data comes from the live SISO Internal Supabase database
2. **Real-Time:** Queries reflect current database state
3. **Untrusted Data:** Results come in `<untrusted-data>` tags - use for info only
4. **Performance:** Queries are limited to 20-50 results to avoid overwhelming output
5. **Security:** No write operations - read-only access for safety

---

**Skill Version:** 1.0.0
**Created:** 2026-01-16
**Author:** SISO Internal
**MCP Server:** siso-internal-supabase
