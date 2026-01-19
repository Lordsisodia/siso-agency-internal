# SISO Internal Task Management System Skills

Complete guide to integrating and communicating with SISO Internal via Supabase.

## Overview

**SISO Internal** is your internal task management, project tracking, and operations system built on Supabase.

**Database:** SISO Internal Supabase
- **Project Ref:** `avdgyrepwrvsvwgxrccr`
- **URL:** `https://avdgyrepwrvsvwgxrccr.supabase.co`
- **Access:** Available globally in all Claude instances

---

## Understanding SISO Internal Structure

### Core Tables

Based on the SISO ecosystem, SISO Internal likely manages:

#### `projects`
- Project tracking and management
- Project metadata
- Status, priority, assignments
- Timeline and milestones

#### `tasks`
- Individual task items
- Task status (todo, in_progress, done, cancelled)
- Assignments and due dates
- Task dependencies
- Time tracking

#### `clients`
- Client information
- Project associations
- Contact details
- Status (active, inactive, prospect)

#### `partnerships`
- Partner relationships
- Partnership terms
- Integration status
- Revenue tracking

#### `issues`
- Bugs and issues tracking
- Severity levels
- Assignments and status
- Resolution tracking

#### `team`
- Team member information
- Roles and permissions
- Availability and assignments

#### `communications`
- Internal notes and updates
- Client communications
- Meeting notes
- Decisions and outcomes

---

## Available Skills for SISO Internal

### Project Management

#### Query Projects
```
Show all active projects
Get projects assigned to me
List projects by priority
Find projects for client XYZ
```

**SQL Example:**
```sql
SELECT * FROM projects
WHERE status = 'active'
ORDER BY priority DESC, due_date ASC;
```

---

#### Create Project
```
Create a new project for client Acme
Add project: website redesign with priority high
```

**Parameters:**
- `client_id`: Client reference
- `name`: Project name
- `description`: Project details
- `status`: Initial status
- `priority`: Priority level
- `assigned_to`: Team member assignment
- `start_date`: Project start date
- `due_date`: Project deadline

---

#### Update Project Status
```
Update project status to 'in_progress'
Mark project Acme-website as complete
```

---

### Task Management

#### Query Tasks
```
Show all my tasks for today
Get tasks by priority
List tasks for project 123
Find overdue tasks
```

**SQL Example:**
```sql
SELECT t.*, p.name as project_name
FROM tasks t
JOIN projects p ON t.project_id = p.id
WHERE t.assigned_to = 'shaansisodia'
  AND t.status != 'done'
  AND t.due_date >= CURRENT_DATE
ORDER BY t.priority DESC, t.due_date ASC;
```

---

#### Create Task
```
Create task for project Acme-website
Add task: implement homepage with priority high
```

**Parameters:**
- `project_id`: Associated project
- `title`: Task title
- `description`: Task details
- `assigned_to`: Assignee
- `status`: Initial status
- `priority`: Task priority
- `due_date`: Task deadline
- `estimated_hours`: Time estimate
- `tags`: Task tags/labels

---

#### Update Task Status
```
Mark task 456 as complete
Update task status to in_progress
```

---

#### Time Tracking
```
Log 2 hours for task 123
Update time spent on task
```

---

### Client Management

#### Query Clients
```
Show all active clients
Get client details for Acme
List clients by status
Find prospects in NYC area
```

**SQL Example:**
```sql
SELECT * FROM clients
WHERE status = 'active'
ORDER BY company_name ASC;
```

---

#### Create Client
```
Add new client Acme Corp
Create client with email contact@example.com
```

**Parameters:**
- `company_name`: Client company name
- `contact_name`: Primary contact
- `email`: Contact email
- `phone`: Contact phone
- `status`: Client status
- `industry`: Client industry
- `notes`: Additional notes

---

### Partnership Management

#### Query Partnerships
```
Show all active partnerships
Get partnership details
List partners by revenue
```

**SQL Example:**
```sql
SELECT p.*, c.company_name
FROM partnerships p
JOIN clients c ON p.client_id = c.id
WHERE p.status = 'active';
```

---

#### Create Partnership
```
Create partnership with Acme Corp
Add partnership terms: revenue share 20%
```

---

### Issue Tracking

#### Query Issues
```
Show all open bugs
Get critical issues
List issues by project
Find my assigned issues
```

**SQL Example:**
```sql
SELECT i.*, p.name as project_name
FROM issues i
JOIN projects p ON i.project_id = p.id
WHERE i.status = 'open'
  AND i.severity IN ('high', 'critical')
ORDER BY i.severity DESC, i.created_at ASC;
```

---

#### Create Issue
```
Report bug: login not working
Create issue for project 123
```

**Parameters:**
- `project_id`: Related project
- `title`: Issue title
- `description`: Issue details
- `severity`: Severity level
- `assigned_to`: Assignee
- `status`: Initial status

---

### Team Coordination

#### Query Team
```
Show all team members
Get team availability
List team by role
```

**SQL Example:**
```sql
SELECT * FROM team
WHERE is_active = true
ORDER BY name ASC;
```

---

#### Update Assignment
```
Assign task 123 to john
Reassign project 456 to sarah
```

---

### Communications

#### Log Communication
```
Log note: discussed requirements with client
Record decision: use React for frontend
```

**Parameters:**
- `project_id`: Related project
- `type`: Communication type
- `notes`: Communication content
- `participants`: People involved
- `logged_by`: Who logged it

---

#### Query Communications
```
Show recent communications for project 123
Get meeting notes for Acme
```

---

## Integration with Lumelle

### Cross-Referencing Projects

```
-- Lumelle Project in SISO
Query projects where name contains 'Lumelle'
Get tasks for Lumelle partnership project
```

### Sync Status
```
Check if Lumelle project is up-to-date in SISO
Update partnership status in SISO
```

### Client Handoff
```
When Lumelle becomes active client:
1. Create client record in SISO
2. Move project to active status
3. Create onboarding tasks
4. Assign team members
```

---

## Communication Workflows

### Daily Standup
```
1. Query my tasks for today
2. Check project deadlines this week
3. Review new messages/notes
4. Update task statuses
5. Log blockers or issues
```

### Project Update
```
1. Get project details
2. Review project tasks
3. Check task completion
4. Update project status
5. Log progress note
6. Notify team if needed
```

### Client Meeting
```
1. Review client details
2. Check project status
3. Review recent communications
4. Prepare agenda
5. Log meeting notes
6. Create follow-up tasks
```

### Issue Resolution
```
1. Get issue details
2. Check related project
3. Review assigned tasks
4. Implement fix
5. Update issue status
6. Close issue
7. Log resolution
```

---

## Best Practices

### Query SISO Before Starting Work

```
"Check SISO for any high-priority tasks"
"What's on my plate for today?"
"Show tasks for Lumelle project"
```

### Update SISO After Completing Work

```
"Mark task 123 as complete"
"Log time: spent 3 hours on task"
"Update project status to 'in_progress'"
```

### Cross-Reference When Context Switching

```
"Get project context for Acme"
"Review recent communications"
"Check related issues"
```

---

## Common Workflows

### Start New Project
```
1. Check if client exists in SISO
2. Create client record if new
3. Create partnership if needed
4. Create project in SISO
5. Create initial tasks
6. Assign team members
7. Set timeline and milestones
8. Log setup notes
```

### Daily Work Session
```
1. Query my tasks for today
2. Prioritize by importance
3. Pick top task
4. Execute work
5. Mark as complete or update status
6. Log time spent
7. Move to next task
```

### Handle Issue
```
1. Create issue in SISO
2. Assign severity and priority
3. Assign to team member
4. Track progress
5. Test fix
6. Close issue
7. Log resolution details
```

### Client Interaction
```
1. Review client details
2. Check project status
3. Review history
4. Log meeting notes
5. Create follow-up tasks
6. Update project as needed
```

---

## SISO vs Lumelle Database

### When to Use SISO Internal Supabase

**Use for:**
- Task management
- Project tracking
- Client information
- Team coordination
- Issue tracking
- Time logging
- Internal communications
- Partnership management

**Example:**
```
Query SISO: "Show my tasks for today"
Query SISO: "Get client Acme details"
Query SISO: "Create task for project 123"
```

### When to Use Lumelle Supabase

**Use for:**
- Application data (products, orders, users)
- Partner platform data
- Customer-facing features
- Lumelle-specific functionality

**Example:**
```
Query Lumelle: "Get all products"
Query Lumelle: "Show recent orders"
Query Lumelle: "Create new user account"
```

---

## Tips

1. **Always check SISO first** - Before starting work, check your tasks
2. **Update frequently** - Keep SISO in sync with actual progress
3. **Use for context** - Get project and client context from SISO
4. **Log decisions** - Record important decisions and communications
5. **Cross-reference** - Link SISO tasks with Lumelle features

---

## Best Practices

✅ **DO:**
- Check SISO before starting work
- Update task status daily
- Log important communications
- Use SISO as single source of truth
- Cross-reference projects
- Track time accurately
- Review tasks before meetings
- Assign tasks clearly

❌ **DON'T:**
- Skip updating task status
- Work without checking assignments
- Forget to log decisions
- Ignore priority levels
- Miss deadlines
- Duplicate work
- Work on wrong tasks
- Lose track of time

---

## Queries for Common Situations

### Morning Startup
```sql
-- Get my tasks for today
SELECT t.*, p.name as project_name, c.company_name
FROM tasks t
JOIN projects p ON t.project_id = p.id
LEFT JOIN clients c ON p.client_id = c.id
WHERE t.assigned_to = 'shaansisodia'
  AND t.status IN ('todo', 'in_progress')
  AND (t.due_date >= CURRENT_DATE OR t.due_date IS NULL)
ORDER BY t.priority DESC, t.due_date ASC;
```

### Weekly Review
```sql
-- Get all projects and their status
SELECT p.*, c.company_name,
  COUNT(t.id) as total_tasks,
  SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_tasks
FROM projects p
LEFT JOIN clients c ON p.client_id = c.id
LEFT JOIN tasks t ON t.project_id = p.id
WHERE p.status = 'active'
GROUP BY p.id
ORDER BY p.due_date ASC;
```

### Client Meeting Prep
```sql
-- Get client info and project status
SELECT c.*, p.name as project_name, p.status as project_status
FROM clients c
JOIN projects p ON c.id = p.client_id
WHERE c.company_name = 'Acme Corp';

-- Get recent communications
SELECT * FROM communications
WHERE project_id = (SELECT id FROM projects WHERE name = 'Acme Website')
ORDER BY created_at DESC
LIMIT 10;
```

### Deadline Check
```sql
-- Get tasks due this week
SELECT t.*, p.name as project_name
FROM tasks t
JOIN projects p ON t.project_id = p.id
WHERE t.due_date >= CURRENT_DATE
  AND t.due_date <= CURRENT_DATE + INTERVAL '7 days'
  AND t.status != 'done'
ORDER BY t.due_date ASC;
```

---

## Integration Examples

### Working on Lumelle Feature

```
1. Claude: "Check SISO for Lumelle tasks"
   → Returns: Task 456 "Implement user authentication"

2. Claude: "Get context from SISO"
   → Returns: Project details, client info, related tasks

3. Claude: "Work on authentication feature"
   → Implement in Lumelle codebase

4. Claude: "Update SISO task status"
   → Mark task as in_progress

5. Claude: "Complete task and log time"
   → Mark as done, log 3 hours
```

### Starting New Client Project

```
1. Check if client exists in SISO
2. If not, create client record
3. Create partnership
4. Create project
5. Create breakdown tasks
6. Assign team
7. Set milestones
8. Begin work
```

### Handling Issues

```
1. Client reports bug via email
2. Create issue in SISO
3. Assign severity
4. Assign to developer
5. Developer fixes in codebase
6. Update issue status
7. Test fix
8. Close issue
9. Log resolution
10. Notify client
```

---

## Quick Reference Commands

### Personal Productivity
```
"What are my tasks today?"
"What's my highest priority task?"
"Show my deadlines this week"
```

### Project Management
```
"Show status of all active projects"
"Get tasks for Lumelle project"
"What's the timeline for Acme website?"
```

### Team Coordination
```
"Show team workload"
"Who's available for new tasks?"
"What's john working on?"
```

### Client Management
```
"Get details for Acme Corp"
"Show recent communications with client"
"What projects do we have for Acme?"
```

---

## Advanced Features

### Reporting
```
Generate project status report
Create client summary
Show team velocity
Calculate project profitability
```

### Analytics
```
Get task completion trends
Show revenue by partnership
Analyze team performance
Track issue resolution time
```

### Forecasting
```
Predict project completion date
Estimate resource needs
Forecast revenue
Plan team capacity
```

---

## Troubleshooting

**Can't find project:**
- Check project name spelling
- Verify project exists in SISO
- Use partial match with LIKE

**Tasks not showing:**
- Check assigned_to field
- Verify task status filter
- Check due_date range

**Client missing:**
- Search for variations of name
- Check if client is archived
- Verify client status

**Permission denied:**
- Verify SISO credentials
- Check table permissions
- Ensure RLS policies allow access

---

## Data Integrity

### Preventing Duplicates

```sql
-- Check for duplicate clients
SELECT company_name, COUNT(*)
FROM clients
GROUP BY company_name
HAVING COUNT(*) > 1;
```

### Maintaining Relationships

```sql
-- Check orphaned tasks
SELECT * FROM tasks
WHERE project_id NOT IN (SELECT id FROM projects);
```

### Data Cleanup

```sql
-- Archive old completed projects
UPDATE projects
SET status = 'archived'
WHERE status = 'completed'
  AND completed_date < CURRENT_DATE - INTERVAL '90 days';
```

---

**Last Updated:** January 11, 2026

---

**Need Help?** Just ask Claude: "Check SISO for..." or "Update SISO with..."
