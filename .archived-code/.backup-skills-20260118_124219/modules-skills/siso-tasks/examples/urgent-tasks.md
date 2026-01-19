# Example: Show Urgent Tasks

## Command
`/tasks urgent`

## Description
Show all urgent tasks that need immediate attention, grouped by status.

## SQL Query
```sql
SELECT
  id,
  title,
  description,
  status,
  due_date,
  created_at
FROM tasks
WHERE priority = 'urgent'
  AND status NOT IN ('done', 'completed')
ORDER BY
  CASE status
    WHEN 'pending' THEN 1
    WHEN 'in_progress' THEN 2
  END,
  due_date ASC;
```

## Expected Output
```
🚨 URGENT Tasks (4 found)

⏸️ PENDING (2)
  • [9db34bd9-...] Fix email automation bug
    Description: Maintenance: Debug and fix email sending issues
    Due: 2025-07-17 | Created: 2025-07-10

  • [d6b7361a-...] Complete workshop resit urgently
    Description: Implementation of new functionality with HIGH PRIORITY
    No due date | Created: 2025-07-12

🔄 IN PROGRESS (1)
  • [e72e2c98-...] Implement cryptocurrency wallet integration
    Description: Deep work task: Build secure wallet connection
    Due: 2025-07-17 | Created: 2025-07-10

✅ CONSIDER COMPLETING (1)
  • [Task in progress, near completion]
```

## Use Cases
- Triage session - what needs immediate attention
- Morning review - prioritize urgent items
- Crisis management - identify blockers
- Resource allocation - assign urgent work

## Notes
- Shows pending tasks first, then in-progress
- Sorted by due date within each status group
- Excludes completed/done tasks
- Includes full description for context
