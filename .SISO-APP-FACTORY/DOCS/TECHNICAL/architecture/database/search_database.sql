-- Search all task tables for large tasks from 5 months ago
SELECT 'PersonalTask' as table_name, id, title, "workType", "createdAt", 
       (SELECT COUNT(*) FROM "PersonalSubtask" ps WHERE ps."taskId" = pt.id) as subtask_count
FROM "PersonalTask" pt 
WHERE "userId" = 'user_31c4PuaPdFf9abejhmzrN9kcill'
AND "createdAt" < '2025-08-31'
ORDER BY subtask_count DESC, "createdAt" DESC;

-- Also check AutomationTask table
SELECT 'AutomationTask' as table_name, id, title, description, "createdAt"
FROM "AutomationTask" 
WHERE "userId" = 'user_31c4PuaPdFf9abejhmzrN9kcill'
ORDER BY "createdAt" DESC;

-- Search for any tasks with more than 10 subtasks
SELECT pt.id, pt.title, pt."workType", pt."createdAt", COUNT(ps.id) as subtask_count
FROM "PersonalTask" pt
LEFT JOIN "PersonalSubtask" ps ON pt.id = ps."taskId"
WHERE pt."userId" = 'user_31c4PuaPdFf9abejhmzrN9kcill'
GROUP BY pt.id, pt.title, pt."workType", pt."createdAt"
HAVING COUNT(ps.id) > 10
ORDER BY subtask_count DESC;
