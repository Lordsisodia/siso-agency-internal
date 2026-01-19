---
name: siso-internal
category: integration-connectivity/mcp-integrations
version: 1.0.0
description: Complete guide to SISO Internal task management and operations system with Claude Code
author: blackbox5/mcp
verified: true
tags: [mcp, siso, task-management, projects, crm]
---

# SISO Internal Task Management System Skills

<context>
**SISO Internal** is your internal task management, project tracking, and operations system built on Supabase.

**Database:** SISO Internal Supabase
- **Project Ref:** `avdgyrepwrvsvwgxrccr`
- **URL:** `https://avdgyrepwrvsvwgxrccr.supabase.co`
- **Access:** Available globally in all Claude instances

**Core Tables:**
- `projects` - Project tracking and management
- `tasks` - Individual task items with status tracking
- `clients` - Client information and relationships
- `partnerships` - Partner relationships and revenue tracking
- `issues` - Bugs and issues tracking
- `team` - Team member information and availability
- `communications` - Internal notes, client comms, meeting notes

This is your single source of truth for all project work, task assignments, and client management.
</context>

<instructions>
When working with SISO Internal, always check the system before starting work and update it after completing work. Use SISO to get context on projects, tasks, and clients.

Query SISO first to understand what's on your plate, then update it as you make progress. Cross-reference SISO tasks with actual codebase work.
</instructions>

<workflow>
  <phase name="Daily Startup">
    <goal>Understand priorities and plan work</goal>
    <steps>
      <step>Query SISO for today's tasks</step>
      <step>Check project deadlines this week</step>
      <step>Review new messages/notes</step>
      <step>Update task statuses</step>
      <step>Log any blockers or issues</step>
    </steps>
  </phase>

  <phase name="Project Work">
    <goal>Execute on assigned tasks</goal>
    <steps>
      <step>Get project context from SISO</step>
      <step>Review task details and requirements</step>
      <step>Execute work in codebase</step>
      <step>Update task status in SISO</step>
      <step>Log time spent</step>
    </steps>
  </phase>

  <phase name="Client Work">
    <goal>Manage client relationships</goal>
    <steps>
      <step>Review client details and history</step>
      <step>Check project status</step>
      <step>Log meeting notes</step>
      <step>Create follow-up tasks</step>
      <step>Update project as needed</step>
    </steps>
  </phase>

  <phase name="Issue Resolution">
    <goal>Track and resolve bugs/issues</goal>
    <steps>
      <step>Create issue in SISO</step>
      <step>Assign severity and priority</step>
      <step>Implement fix in codebase</step>
      <step>Update issue status</step>
      <step>Log resolution details</step>
    </steps>
  </phase>
</workflow>

<available_skills>
  <skill_group name="Project Management">
    <skill name="query_projects">
      <purpose>Query projects from SISO</purpose>
      <usage>Show all active projects assigned to me</usage>
      <parameters>
        <param name="status">Filter by status (active, completed, archived)</param>
        <param name="assigned_to">Filter by assignee</param>
        <param name="client_id">Filter by client</param>
        <param name="priority">Filter by priority level</param>
      </parameters>
    </skill>
    <skill name="create_project">
      <purpose>Create a new project in SISO</purpose>
      <usage>Create a new project for client Acme with priority high</usage>
      <parameters>
        <param name="client_id">Client reference</param>
        <param name="name">Project name</param>
        <param name="description">Project details</param>
        <param name="status">Initial status</param>
        <param name="priority">Priority level</param>
        <param name="assigned_to">Team member assignment</param>
        <param name="start_date">Project start date</param>
        <param name="due_date">Project deadline</param>
      </parameters>
    </skill>
    <skill name="update_project_status">
      <purpose>Update project status and details</purpose>
      <usage>Update project status to 'in_progress'</usage>
    </skill>
  </skill_group>

  <skill_group name="Task Management">
    <skill name="query_tasks">
      <purpose>Query tasks from SISO</purpose>
      <usage>Show all my tasks for today</usage>
      <parameters>
        <param name="assigned_to">Filter by assignee</param>
        <param name="status">Filter by status</param>
        <param name="project_id">Filter by project</param>
        <param name="priority">Filter by priority</param>
        <param name="due_date">Filter by due date</param>
      </parameters>
    </skill>
    <skill name="create_task">
      <purpose>Create a new task in SISO</purpose>
      <usage>Create task: implement homepage with priority high</usage>
      <parameters>
        <param name="project_id">Associated project</param>
        <param name="title">Task title</param>
        <param name="description">Task details</param>
        <param name="assigned_to">Assignee</param>
        <param name="status">Initial status</param>
        <param name="priority">Task priority</param>
        <param name="due_date">Task deadline</param>
        <param name="estimated_hours">Time estimate</param>
        <param name="tags">Task tags/labels</param>
      </parameters>
    </skill>
    <skill name="update_task_status">
      <purpose>Update task status and progress</purpose>
      <usage>Mark task 456 as complete</usage>
    </skill>
    <skill name="log_time">
      <purpose>Log time spent on a task</purpose>
      <usage>Log 2 hours for task 123</usage>
    </skill>
  </skill_group>

  <skill_group name="Client Management">
    <skill name="query_clients">
      <purpose>Query clients from SISO</purpose>
      <usage>Show all active clients</usage>
      <parameters>
        <param name="status">Filter by status (active, inactive, prospect)</param>
        <param name="industry">Filter by industry</param>
        <param name="location">Filter by location</param>
      </parameters>
    </skill>
    <skill name="create_client">
      <purpose>Create a new client in SISO</purpose>
      <usage>Add new client Acme Corp with email contact@example.com</usage>
      <parameters>
        <param name="company_name">Client company name</param>
        <param name="contact_name">Primary contact</param>
        <param name="email">Contact email</param>
        <param name="phone">Contact phone</param>
        <param name="status">Client status</param>
        <param name="industry">Client industry</param>
        <param name="notes">Additional notes</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Partnership Management">
    <skill name="query_partnerships">
      <purpose>Query partnerships from SISO</purpose>
      <usage>Show all active partnerships by revenue</usage>
    </skill>
    <skill name="create_partnership">
      <purpose>Create a new partnership</purpose>
      <usage>Create partnership with Acme Corp with revenue share 20%</usage>
    </skill>
  </skill_group>

  <skill_group name="Issue Tracking">
    <skill name="query_issues">
      <purpose>Query issues from SISO</purpose>
      <usage>Show all open critical issues</usage>
      <parameters>
        <param name="status">Filter by status (open, in_progress, resolved)</param>
        <param name="severity">Filter by severity</param>
        <param name="project_id">Filter by project</param>
        <param name="assigned_to">Filter by assignee</param>
      </parameters>
    </skill>
    <skill name="create_issue">
      <purpose>Create a new issue in SISO</purpose>
      <usage>Report bug: login not working</usage>
      <parameters>
        <param name="project_id">Related project</param>
        <param name="title">Issue title</param>
        <param name="description">Issue details</param>
        <param name="severity">Severity level</param>
        <param name="assigned_to">Assignee</param>
        <param name="status">Initial status</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Team Coordination">
    <skill name="query_team">
      <purpose>Query team members</purpose>
      <usage>Show all team members by role</usage>
    </skill>
    <skill name="update_assignment">
      <purpose>Reassign tasks or projects</purpose>
      <usage>Assign task 123 to john</usage>
    </skill>
  </skill_group>

  <skill_group name="Communications">
    <skill name="log_communication">
      <purpose>Log a communication note</purpose>
      <usage>Record decision: use React for frontend</usage>
      <parameters>
        <param name="project_id">Related project</param>
        <param name="type">Communication type</param>
        <param name="notes">Communication content</param>
        <param name="participants">People involved</param>
        <param name="logged_by">Who logged it</param>
      </parameters>
    </skill>
    <skill name="query_communications">
      <purpose>Query communications log</purpose>
      <usage>Show recent communications for project 123</usage>
    </skill>
  </skill_group>
</available_skills>

<best_practices>
  <do>
    <item>Check SISO before starting work</item>
    <item>Update task status daily</item>
    <item>Log important communications</item>
    <item>Use SISO as single source of truth</item>
    <item>Cross-reference projects</item>
    <item>Track time accurately</item>
    <item>Review tasks before meetings</item>
    <item>Assign tasks clearly</item>
    <item>Update SISO after completing work</item>
    <item>Get project context from SISO</item>
  </do>
  <dont>
    <item>Skip updating task status</item>
    <item>Work without checking assignments</item>
    <item>Forget to log decisions</item>
    <item>Ignore priority levels</item>
    <item>Miss deadlines</item>
    <item>Duplicate work</item>
    <item>Work on wrong tasks</item>
    <item>Lose track of time</item>
  </dont>
</best_practices>

<rules>
  <rule priority="high">Always check SISO before starting work</rule>
  <rule priority="high">Update SISO after completing work</rule>
  <rule priority="medium">Log all important decisions and communications</rule>
  <rule priority="medium">Use SISO for project context before coding</rule>
  <rule priority="low">Keep task time tracking accurate</rule>
</rules>

<error_handling>
  <error>
    <condition>Can't find project</condition>
    <solution>
      <step>Check project name spelling</step>
      <step>Verify project exists in SISO</step>
      <step>Use partial match with LIKE</step>
    </solution>
  </error>
  <error>
    <condition>Tasks not showing</condition>
    <solution>
      <step>Check assigned_to field</step>
      <step>Verify task status filter</step>
      <step>Check due_date range</step>
    </solution>
  </error>
  <error>
    <condition>Client missing</condition>
    <solution>
      <step>Search for variations of name</step>
      <step>Check if client is archived</step>
      <step>Verify client status</step>
    </solution>
  </error>
  <error>
    <condition>Permission denied</condition>
    <solution>
      <step>Verify SISO credentials</step>
      <step>Check table permissions</step>
      <step>Ensure RLS policies allow access</step>
    </solution>
  </error>
</error_handling>

<integration_notes>
  <comparison>
    <system>
      <name>SISO Internal Supabase</name>
      <uses>Task management, project tracking, client information</uses>
      <examples>
        <example>"Show my tasks for today"</example>
        <example>"Get client Acme details"</example>
        <example>"Create task for project 123"</example>
      </examples>
    </system>
    <system>
      <name>Lumelle Supabase</name>
      <uses>Application data, partner platform, customer features</uses>
      <examples>
        <example>"Get all products"</example>
        <example>"Show recent orders"</example>
        <example>"Create new user account"</example>
      </examples>
    </system>
    <note>Use SISO for internal operations, Lumelle for application data</note>
  </comparison>
  <integration>
    <platform>Lumelle</platform>
    <workflows>
      <workflow>Cross-Reference Projects</workflow>
      <workflow>Sync Status Updates</workflow>
      <workflow>Client Handoff (when Lumelle becomes active client)</workflow>
    </workflows>
  </integration>
</integration_notes>

<examples>
  <example>
    <scenario>Morning Startup</scenario>
    <sql>
      SELECT t.*, p.name as project_name, c.company_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE t.assigned_to = 'shaansisodia'
        AND t.status IN ('todo', 'in_progress')
        AND (t.due_date >= CURRENT_DATE OR t.due_date IS NULL)
      ORDER BY t.priority DESC, t.due_date ASC;
    </sql>
  </example>
  <example>
    <scenario>Weekly Review</scenario>
    <sql>
      SELECT p.*, c.company_name,
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_tasks
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.status = 'active'
      GROUP BY p.id
      ORDER BY p.due_date ASC;
    </sql>
  </example>
  <example>
    <scenario>Client Meeting Prep</scenario>
    <sql>
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
    </sql>
  </example>
  <example>
    <scenario>Deadline Check</scenario>
    <sql>
      SELECT t.*, p.name as project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.due_date >= CURRENT_DATE
        AND t.due_date <= CURRENT_DATE + INTERVAL '7 days'
        AND t.status != 'done'
      ORDER BY t.due_date ASC;
    </sql>
  </example>
</examples>

<quick_reference>
  <category name="Personal Productivity">
    <command>"What are my tasks today?"</command>
    <command>"What's my highest priority task?"</command>
    <command>"Show my deadlines this week"</command>
  </category>
  <category name="Project Management">
    <command>"Show status of all active projects"</command>
    <command>"Get tasks for Lumelle project"</command>
    <command>"What's the timeline for Acme website?"</command>
  </category>
  <category name="Team Coordination">
    <command>"Show team workload"</command>
    <command>"Who's available for new tasks?"</command>
    <command>"What's john working on?"</command>
  </category>
  <category name="Client Management">
    <command>"Get details for Acme Corp"</command>
    <command>"Show recent communications with client"</command>
    <command>"What projects do we have for Acme?"</command>
  </category>
</quick_reference>

<data_integrity>
  <section name="Preventing Duplicates">
    <sql>SELECT company_name, COUNT(*) FROM clients GROUP BY company_name HAVING COUNT(*) > 1;</sql>
  </section>
  <section name="Maintaining Relationships">
    <sql>SELECT * FROM tasks WHERE project_id NOT IN (SELECT id FROM projects);</sql>
  </section>
  <section name="Data Cleanup">
    <sql>UPDATE projects SET status = 'archived' WHERE status = 'completed' AND completed_date < CURRENT_DATE - INTERVAL '90 days';</sql>
  </section>
</data_integrity>

<advanced_features>
  <feature>Reporting</feature>
  <capabilities>
    <capability>Generate project status report</capability>
    <capability>Create client summary</capability>
    <capability>Show team velocity</capability>
    <capability>Calculate project profitability</capability>
  </capabilities>
  <feature>Analytics</feature>
  <capabilities>
    <capability>Get task completion trends</capability>
    <capability>Show revenue by partnership</capability>
    <capability>Analyze team performance</capability>
    <capability>Track issue resolution time</capability>
  </capabilities>
  <feature>Forecasting</feature>
  <capabilities>
    <capability>Predict project completion date</capability>
    <capability>Estimate resource needs</capability>
    <capability>Forecast revenue</capability>
    <capability>Plan team capacity</capability>
  </capabilities>
</advanced_features>
