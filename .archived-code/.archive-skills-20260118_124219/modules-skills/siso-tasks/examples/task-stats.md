# Example: Task Statistics

## Command
`/tasks stats`

## Description
Show comprehensive task statistics including status breakdown, priority distribution, and overdue count.

## SQL Query

### Main Stats
```sql
SELECT
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN status = 'done' THEN 1 END) as done,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent,
  COUNT(CASE WHEN priority = 'high' THEN 1 END) as high,
  COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium,
  COUNT(CASE WHEN priority = 'low' THEN 1 END) as low,
  COUNT(CASE WHEN due_date IS NOT NULL AND due_date < NOW() THEN 1 END) as overdue
FROM tasks;
```

### Detailed Breakdown
```sql
SELECT
  status,
  priority,
  COUNT(*) as count
FROM tasks
GROUP BY status, priority
ORDER BY status, priority;
```

## Expected Output
```
📊 SISO Task Statistics

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 OVERVIEW
  Total Tasks:     101
  Active Tasks:    86 (pending + in_progress)
  Completed:       15 (done + completed)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 STATUS BREAKDOWN
  ⏸️  Pending:      73 (72.3%)
  🔄  In Progress:  13 (12.9%)
  ✅  Done:         10 (9.9%)
  ✨  Completed:     5 (5.0%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 PRIORITY BREAKDOWN
  🔴  Urgent:        4 (4.0%)
  🟠  High:         42 (41.6%)
  🟡  Medium:       38 (37.6%)
  🟢  Low:          17 (16.8%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  ATTENTION NEEDED
  🚨  Overdue:      52 tasks (past due date)
  🔥  Urgent:        2 tasks (urgent + pending)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 STATUS × PRIORITY MATRIX

                │ Urgent │ High  │ Medium │ Low   │ Total
────────────────┼────────┼───────┼────────┼───────┼───────
Pending         │    2   │  42   │   23   │   6   │  73
In Progress     │    1   │   8   │    4   │   0   │  13
Done            │    0   │   2   │    7   │   1   │  10
Completed       │    0   │   2   │    2   │   1   │   5
────────────────┼────────┼───────┼────────┼───────┼───────
Total           │    3   │  54   │   36   │   8   │ 101

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 RECOMMENDATIONS
  • Focus on 2 urgent pending tasks
  • 52 overdue tasks need attention
  • 42 high priority tasks in queue
  • Consider triaging oldest pending tasks
```

## Use Cases
- Weekly team meetings - share task overview
- Planning sessions - understand workload
- Management reporting - high-level stats
- Resource allocation - balance priorities
- Health check - identify bottlenecks

## Key Metrics to Watch

### Healthy Indicators
- Pending < 50% of total
- In Progress 10-20% of total
- Overdue < 10% of total
- Urgent < 5% of total

### Warning Signs
- Overdue > 25% (⚠️ You have 52%!)
- Urgent pending > 5
- In Progress > 30% (may indicate bottleneck)
- High priority pending > 40

### Action Items Based on Stats
```
IF overdue > 25% THEN
  → Schedule task triage session
  → Review due dates - are they realistic?
  → Consider reprioritizing

IF urgent pending > 5 THEN
  → Immediate attention required
  → Assign resources to urgent items
  → Block out focused work time

IF in_progress > 30% THEN
  → Check for blocked tasks
  → Are tasks too large?
  → Consider breaking down

IF high priority > 40 THEN
  → Priority inflation?
  → Re-evaluate priority definitions
  → Consider medium/low tasks
```

## Notes
- Statistics are real-time
- Reflects current database state
- Useful for trend tracking over time
- Can be run daily/weekly for monitoring
