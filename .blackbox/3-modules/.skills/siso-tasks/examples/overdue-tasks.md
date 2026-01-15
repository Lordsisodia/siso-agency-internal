# Example: Show Overdue Tasks

## Command
`/tasks overdue`

## Description
Show all tasks that are past their due date, ordered by how overdue they are.

## SQL Query
```sql
SELECT
  id,
  title,
  priority,
  status,
  due_date,
  EXTRACT(DAY FROM NOW() - due_date) as days_overdue
FROM tasks
WHERE due_date IS NOT NULL
  AND due_date < NOW()
  AND status NOT IN ('done', 'completed')
ORDER BY due_date ASC
LIMIT 50;
```

## Expected Output
```
⚠️  OVERDUE Tasks (52 found)

🔴 CRITICALLY OVERDUE (30+ days)
  • [d6b7361a-...] Complete workshop resit urgently
    Priority: urgent | Status: pending
    Due: 2025-07-12 | 187 days overdue

  • [1645ed99-...] Order 50th birthday present for dad
    Priority: medium | Status: done
    Due: 2025-07-12 | 187 days overdue

🟠 SIGNIFICANTLY OVERDUE (14-30 days)
  • [c56e583e-...] Buy dad birthday present
    Priority: medium | Status: done
    Due: 2025-12-20 | 27 days overdue

🟡 MODERATELY OVERDUE (7-14 days)
  • [Task entries from early January]

🟢 RECENTLY OVERDUE (1-7 days)
  • [More recent overdue items]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 OVERDUE BREAKDOWN BY PRIORITY
  🔴 Urgent:    2 tasks
  🟠 High:     28 tasks
  🟡 Medium:   18 tasks
  🟢 Low:       4 tasks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 OVERDUE BREAKDOWN BY STATUS
  ⏸️  Pending:       48 tasks
  🔄  In Progress:    4 tasks
```

## Use Cases
- Debt repayment - clear overdue items
- Triage - decide which overdue tasks still matter
- Due date audit - are dates realistic?
- Process review - why do tasks go overdue?
- Client communication - manage expectations

## Handling Overdue Tasks

### Decision Framework
For each overdue task, ask:

```
1. Is this still relevant?
   YES → Continue to #2
   NO  → Mark as completed/cancelled

2. Can it be completed quickly?
   YES → Do it now
   NO  → Continue to #3

3. Is the due date still meaningful?
   YES → Keep, reprioritize
   NO  → Update due date or remove due date

4. What's the actual priority?
   → Re-evaluate urgent/high/medium/low
```

### Actions
```
🗑️  CANCELLED        No longer relevant
✅  COMPLETED        Actually done, just not marked
📅  RESCHEDULED      New due date set
🔄  IN PROGRESS      actively working on
⏸️  DEFERRED         waiting on something
```

## Prevention Strategies

### Review Practices
- Weekly overdue review
- Monthly due date audit
- Quarterly task cleanup
- Adjust due dates to be realistic

### Setting Better Due Dates
```
❌ BAD: "ASAP", "urgent", "yesterday"
✅ GOOD: Specific dates with buffer

❌ BAD: Every task is due today
✅ GOOD: Spread due dates realistically

❌ BAD: Due dates never change
✅ GOOD: Adjust based on reality
```

### Process Improvements
- Break large tasks into smaller chunks
- Add check-ins before due dates
- Flag tasks at risk early
- Celebrate on-time completions

## Notes
- 52 tasks is 51.5% of all tasks - very high!
- Some may be old/unimportant tasks
- Consider mass cleanup of ancient overdue items
- Urgent overdue tasks need immediate attention
- Use this for regular task hygiene
