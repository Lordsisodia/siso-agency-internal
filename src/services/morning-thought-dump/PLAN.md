# 🧠 Morning Thought Dump AI - Complete Function Plan

**Date**: October 9, 2025
**AI Model**: GPT-5 Nano (gpt-4o-mini)
**Purpose**: Conversational AI that understands user's existing tasks and helps organize the day

---

## 🎯 REQUIRED FUNCTIONS (AI Tools)

### 1. **get_todays_tasks**
**Purpose**: Fetch all incomplete tasks for today

**Supabase Queries**:
```sql
-- Deep Work Tasks
SELECT *, subtasks:deep_work_subtasks(*)
FROM deep_work_tasks
WHERE userId = 'abc123'
  AND currentDate = '2025-10-09'
  AND completed = false;

-- Light Work Tasks
SELECT *, subtasks:light_work_subtasks(*)
FROM light_work_tasks
WHERE userId = 'abc123'
  AND currentDate = '2025-10-09'
  AND completed = false;
```

**Returns**:
```json
{
  "deepWorkTasks": [
    {
      "id": "task-123",
      "title": "Fix login authentication bug",
      "priority": "HIGH",
      "estimatedDuration": 90,
      "subtasks": [
        { "id": "sub-1", "title": "Debug OAuth flow", "completed": false },
        { "id": "sub-2", "title": "Update integration tests", "completed": false }
      ]
    }
  ],
  "lightWorkTasks": [...],
  "summary": {
    "totalDeepWork": 3,
    "totalLightWork": 5,
    "totalSubtasks": 12,
    "estimatedTimeHours": 4.5
  }
}
```

**When AI Calls**: User asks "what do I have today?" or "what tasks?"

---

### 2. **get_task_by_title**
**Purpose**: Find specific task by name/title (fuzzy match)

**Supabase Query**:
```sql
SELECT *, subtasks:*_subtasks(*)
FROM deep_work_tasks
WHERE userId = 'abc123'
  AND title ILIKE '%login%bug%'
UNION
SELECT *, subtasks:*_subtasks(*)
FROM light_work_tasks
WHERE userId = 'abc123'
  AND title ILIKE '%login%bug%';
```

**Returns**:
```json
{
  "task": {
    "id": "task-123",
    "title": "Fix login authentication bug",
    "workType": "deep",
    "priority": "HIGH",
    "estimatedDuration": 90,
    "subtasks": [...]
  }
}
```

**When AI Calls**: User mentions specific task name

---

### 3. **get_urgent_tasks**
**Purpose**: Get all HIGH and URGENT priority tasks

**Supabase Query**:
```sql
SELECT *
FROM deep_work_tasks
WHERE userId = 'abc123'
  AND currentDate = '2025-10-09'
  AND priority IN ('HIGH', 'URGENT')
  AND completed = false
UNION
SELECT *
FROM light_work_tasks
WHERE userId = 'abc123'
  AND currentDate = '2025-10-09'
  AND priority IN ('HIGH', 'URGENT')
  AND completed = false;
```

**Returns**:
```json
{
  "urgentTasks": [
    { "title": "Fix login bug", "workType": "deep", "priority": "HIGH" },
    { "title": "Client emails", "workType": "light", "priority": "HIGH" }
  ],
  "count": 2
}
```

**When AI Calls**: User asks "what's urgent?" or "priorities?"

---

### 4. **get_deep_work_tasks_only**
**Purpose**: Get only deep work tasks (for focus time planning)

**Supabase Query**:
```sql
SELECT *, subtasks:deep_work_subtasks(*)
FROM deep_work_tasks
WHERE userId = 'abc123'
  AND currentDate = '2025-10-09'
  AND completed = false
ORDER BY priority DESC, estimatedDuration DESC;
```

**Returns**:
```json
{
  "deepWorkTasks": [...],
  "totalEstimatedHours": 3.5,
  "requiresFocusBlocks": 4
}
```

**When AI Calls**: User talks about "deep work" or "focus time"

---

### 5. **get_light_work_tasks_only**
**Purpose**: Get only light work tasks (for quick wins)

**Supabase Query**:
```sql
SELECT *, subtasks:light_work_subtasks(*)
FROM light_work_tasks
WHERE userId = 'abc123'
  AND currentDate = '2025-10-09'
  AND completed = false
ORDER BY priority DESC;
```

**Returns**:
```json
{
  "lightWorkTasks": [...],
  "totalTasks": 5,
  "totalEstimatedMinutes": 120
}
```

**When AI Calls**: User talks about "quick tasks" or "light work"

---

### 6. **get_task_subtasks**
**Purpose**: Get all subtasks for a specific parent task

**Supabase Query**:
```sql
-- Check deep work
SELECT * FROM deep_work_subtasks
WHERE taskId = 'task-123'
ORDER BY createdAt;

-- Check light work
SELECT * FROM light_work_subtasks
WHERE taskId = 'task-123'
ORDER BY createdAt;
```

**Returns**:
```json
{
  "subtasks": [
    {
      "id": "sub-1",
      "title": "Debug OAuth flow",
      "completed": false,
      "estimatedTime": "30m",
      "priority": "HIGH",
      "requiresFocus": true
    },
    {
      "id": "sub-2",
      "title": "Update integration tests",
      "completed": false,
      "estimatedTime": "30m"
    }
  ],
  "completedCount": 0,
  "totalCount": 2
}
```

**When AI Calls**: User asks "what are the subtasks?" or "break that down"

---

### 7. **get_tasks_by_estimated_time**
**Purpose**: Find tasks by time constraint

**Supabase Query**:
```sql
SELECT *
FROM deep_work_tasks
WHERE userId = 'abc123'
  AND currentDate = '2025-10-09'
  AND estimatedDuration <= 60  -- For "under 1 hour"
  AND completed = false;
```

**Returns**:
```json
{
  "tasks": [...],
  "matchingTasks": 4
}
```

**When AI Calls**: User says "what can I do in 30 minutes?" or "quick tasks"

---

### 8. **search_tasks_by_keyword**
**Purpose**: Full-text search across tasks and subtasks

**Supabase Query**:
```sql
SELECT *, subtasks:deep_work_subtasks(*)
FROM deep_work_tasks
WHERE userId = 'abc123'
  AND (
    title ILIKE '%email%' OR
    description ILIKE '%email%'
  );
```

**Returns**:
```json
{
  "matchingTasks": [...],
  "searchTerm": "email",
  "resultsCount": 2
}
```

**When AI Calls**: User mentions keyword like "email", "bug", "client"

---

## 🧪 TEST FUNCTIONS

### Test File: `morningThoughtDumpTools.test.ts`

```typescript
// Test each function returns real data
describe('Morning Thought Dump Tools', () => {
  it('get_todays_tasks returns real Supabase data', async () => {
    const result = await tools.get_todays_tasks({ includeCompleted: false });
    expect(result.deepWorkTasks).toBeDefined();
    expect(result.lightWorkTasks).toBeDefined();
    console.log('✅ Real tasks:', result);
  });

  it('get_urgent_tasks filters by priority', async () => {
    const result = await tools.get_urgent_tasks();
    expect(result.urgentTasks.every(t =>
      t.priority === 'HIGH' || t.priority === 'URGENT'
    )).toBe(true);
  });

  it('get_task_subtasks returns nested data', async () => {
    const result = await tools.get_task_subtasks({ taskId: 'real-task-id' });
    expect(result.subtasks).toBeArray();
  });
});
```

---

## 📁 FOLDER STRUCTURE

```
src/services/morning-thought-dump/
├── PLAN.md (this file)
├── morningThoughtDumpAI.ts (GPT-5 Nano service)
├── tools/
│   ├── index.ts (exports all tools)
│   ├── taskQueryTools.ts (8 functions above)
│   ├── toolDefinitions.ts (function schemas for GPT)
│   └── toolExecutor.ts (executes function calls)
├── types.ts (interfaces)
└── __tests__/
    └── toolQueries.test.ts (verify Supabase returns data)
```

---

**Ready to build?** I'll create all files and test each function returns real Supabase data.
