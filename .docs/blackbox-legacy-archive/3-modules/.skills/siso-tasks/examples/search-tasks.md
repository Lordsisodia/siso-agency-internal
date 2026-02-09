# Example: Search Tasks by Keyword

## Command
`/tasks search <keyword>`

## Description
Search for tasks by keyword in title or description. Case-insensitive.

## SQL Query Template
```sql
SELECT
  id,
  title,
  description,
  status,
  priority,
  due_date
FROM tasks
WHERE title ILIKE '%<keyword>%'
   OR description ILIKE '%<keyword>%'
ORDER BY
  CASE priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  created_at DESC
LIMIT 20;
```

## Example: Search for "agency"

### Query
```sql
WHERE title ILIKE '%agency%' OR description ILIKE '%agency%'
```

### Expected Output
```
🔍 Search Results: "agency" (12 found)

🔴 URGENT
  • [413893cd-...] [SISO Agency App] Update admin navigation
    Status: completed | Priority: medium
    Description: Quick fix for admin sidebar navigation issues

🟠 HIGH
  • [1a942e0e-...] [SISO Agency App] Build client onboarding dashboard
    Status: pending | Priority: high
    Description: Complex development of new dashboard interface for agency clients

  • [8523ad92-...] [We Are Excusions] Design travel booking interface
    Status: pending | Priority: high
    Description: Creative work: Design wireframes and mockups for excursion booking system

🟡 MEDIUM
  • [b34578cf-...] [We Are Excusions] Client call to discuss requirements
    Status: pending | Priority: medium
    Description: Client communication: Meeting to review travel platform requirements

🟢 LOW
  • [8b53528c-...] [Instagram Marketing] Analyze lead generation metrics
    Status: pending | Priority: low
    Description: Deep work: Complex analysis of Instagram marketing performance
```

## Example: Search for "crypto"

### Query
```sql
WHERE title ILIKE '%crypto%' OR description ILIKE '%crypto%'
```

### Expected Output
```
🔍 Search Results: "crypto" (2 found)

🔴 URGENT
  • [e72e2c98-...] [Ubahcrypt] Implement cryptocurrency wallet integration
    Status: pending | Priority: high
    Due: 2025-07-17
    Description: Deep work task: Build secure wallet connection for Ubah crypto transactions

🟡 MEDIUM
  • [4983c5a9-...] [Ubahcrypt] Review blockchain security protocols
    Status: pending | Priority: medium
    Due: 2025-07-17
    Description: Light work: Quick review of security measures and documentation
```

## Use Cases
- Find all tasks for a specific project
- Locate tasks related to a feature
- Search by client name
- Find tasks with specific keywords
- Research task history

## Tips
- Use single keywords for best results
- Try variations (e.g., "dashboard" vs "dashboards")
- Search works on both title and description
- Results are limited to 20 most relevant
- Ordered by priority then recency

## Common Searches
- `/tasks search agency` - All agency-related work
- `/tasks search client` - Client-facing tasks
- `/tasks search design` - Design tasks
- `/tasks search meeting` - Meeting-related tasks
- `/tasks search review` - Review tasks
