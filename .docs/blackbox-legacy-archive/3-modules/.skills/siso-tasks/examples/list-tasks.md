# Example: List All Pending Tasks

## Command
`/tasks`

## Description
List all pending tasks ordered by priority (urgent → high → medium → low), then by creation date.

## SQL Query
```sql
SELECT
  id,
  title,
  priority,
  due_date,
  created_at
FROM tasks
WHERE status = 'pending'
ORDER BY
  CASE priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  created_at ASC
LIMIT 50;
```

## Expected Output
```
📋 Pending Tasks (73 found)

🔴 URGENT (2)
  • [c56e583e-...] Fix email automation bug
    Due: 2025-07-17 | Priority: urgent

  • [d6b7361a-...] Complete workshop resit
    No due date | Priority: urgent

🟠 HIGH (42)
  • [1a942e0e-...] Build client onboarding dashboard
    Due: 2025-07-17 | Priority: high

  • [e72e2c98-...] Implement wallet integration
    Due: 2025-07-17 | Priority: high

🟡 MEDIUM (23)
  • [e56e581f-...] Weekly team standup
    Due: 2025-07-17 | Priority: medium

🟢 LOW (6)
  • [8b53528c-...] Analyze lead generation metrics
    Due: 2025-07-17 | Priority: low
```

## Use Cases
- Daily task review
- Planning work session
- Understanding current workload
- Identifying what needs attention

## Notes
- Limited to 50 results to avoid overwhelming output
- Most urgent tasks appear first
- Tasks without due dates are included
