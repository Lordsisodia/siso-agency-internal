# 🔍 Vibe Kanban: Viewing Agent Responses & MCP Tool Guide

## Can You See Agent Responses? YES! ✅

When you assign a task to an agent (Gemini, Claude Code, etc.) in Vibe Kanban, you get **complete visibility** into everything the agent does:

---

## 📊 What You Can See During & After Execution

### 1. Real-Time Execution Monitoring
While the agent is working, you see:
- ✅ **Agent's reasoning** - Watch the agent think through the problem
- ✅ **Commands executed** - Every shell command the agent runs
- ✅ **File operations** - Files created, modified, deleted (with diffs!)
- ✅ **Tool usage** - API calls, searches, MCP tool invocations
- ✅ **Agent messages** - Status updates and responses
- ✅ **Expandable actions** - Click any file change to see exact modifications

### 2. Code Review Interface (After Completion)
When a task completes, it automatically moves to **"In Review"** column:
- ✅ **Full diff view** - See all code changes side-by-side
- ✅ **Line-by-line review** - Click any line to add comments
- ✅ **Multiple file comments** - Add feedback across all changed files
- ✅ **Submit feedback** - Send all comments back to agent at once
- ✅ **Task returns to In Progress** - Agent addresses your feedback

### 3. Task Completion Summary
When done, you see:
- ✅ **Final agent message** - What the agent says about completion
- ✅ **All commits made** - Git commits linked to task
- ✅ **Files changed** - Complete list of modified files
- ✅ **Execution time** - How long the task took
- ✅ **Process logs** - Full execution history

---

## 🎯 How to View Agent Responses

### During Execution:
1. **Click on the task** in In Progress column
2. **Watch real-time logs** in the main panel
3. **See each action** as it happens
4. **Expand file changes** to see diffs
5. **Chat with agent** - Send follow-up questions anytime

### After Completion:
1. **Task moves to "In Review"** automatically
2. **Click the task** to open it
3. **Click Diff icon** (📋) to see all changes
4. **Add comments** by clicking (+) on any line
5. **Click Send** to submit feedback to agent

### View Process History:
1. **Click triple dot** (⋮) in top right
2. **Select "View Processes"**
3. **See all sessions** with execution timelines
4. **Click any process** for detailed logs

---

## 🤖 MCP Integration: Powerful Automation

Vibe Kanban has a **built-in MCP server** that lets external tools (like Claude Desktop, Raycast, or even other AI agents!) control Vibe Kanban programmatically.

### Available MCP Tools:

#### Project Operations:
- **`list_projects`** - Get all projects with metadata
- **`list_repos`** - List repositories in a project

#### Task Management:
- **`list_tasks`** - Get tasks by status (todo, in-progress, in-review, done)
- **`create_task`** - Create new tasks with title/description
- **`get_task`** - Get full task details
- **`update_task`** - Update task title/description/status
- **`delete_task`** - Delete a task

#### Task Execution:
- **`start_workspace_session`** - Start agent on a task
  - Choose executor: claude-code, gemini, codex, amp, cursor-agent, etc.
  - Specify repos and branches
  - Creates isolated worktree automatically

#### Context:
- **`get_context`** - Get current workspace info (within active session)

---

## 💡 Prompt Examples for MCP Tools

### Example 1: Create Tasks from Plan

```
I need to build a user authentication system with:
- User registration with email validation
- Login/logout functionality
- Password reset capability
- Session management
- Protected routes

Then turn this plan into tasks in Vibe Kanban.
```

**What happens:** The MCP client automatically calls `create_task` for each feature, populating your Kanban board!

### Example 2: List and Start Tasks

```
List all todo tasks in my project, then start working on "Add user profile page" using Claude Code on the main branch.
```

**What happens:**
1. MCP calls `list_projects` to find project ID
2. MCP calls `list_tasks` with status="todo"
3. MCP calls `start_workspace_session` with:
   - task_id: "user-profile-task-id"
   - executor: "claude-code"
   - repos: [{ repo_id: "xxx", base_branch: "main" }]

### Example 3: Auto-Generate Tasks from Agent

```
Explore this codebase and create a comprehensive plan for refactoring the user service. Then use Vibe Kanban MCP to create individual tasks for each step of the plan.
```

**What happens:** The agent explores, plans, then uses MCP tools to auto-populate tasks!

### Example 4: Review and Iterate

```
Show me the code changes from the last completed task. If the changes look good, mark the task as done. Otherwise, add review comments asking for improvements.
```

**What happens:** MCP calls `get_task`, shows diffs, then either updates status or adds comments!

### Example 5: Parallel Execution

```
Create 5 tasks for testing the payment system, then start 3 of them in parallel using Gemini on the test branch.
```

**What happens:** Multiple workspace sessions started simultaneously!

### Example 6: Daily Standup Automation

```
List all in-progress tasks, show me the latest agent messages from each, and summarize what's been accomplished today.
```

**What happens:**
1. `list_tasks` with status="in-progress"
2. `get_task` for each to read agent messages
3. AI summarizes the progress

### Example 7: Autonomous Task Pipeline

```
For each task in the todo column:
1. Read the task description
2. If it's high priority, start it with Claude Code
3. If it's low priority, keep it for later
```

**What happens:** Automated task prioritization and execution!

### Example 8: Code Review Workflow

```
Get all tasks in "In Review" status. For each one:
1. Show me the diffs
2. If changes look good, update task to "Done"
3. If changes need work, add review comments
```

**What happens:** Automated code review workflow!

### Example 9: Multi-Agent Coordination

```
Create a task for "Add dark mode UI". Start it with Claude Code for frontend work. Then create another task for "Add dark mode API" and start it with Gemini for backend work. Run both in parallel.
```

**What happens:** Two agents working on different parts simultaneously!

### Example 10: Project Overview

```
List all my projects, show me task counts by status for each, and tell me which project needs attention most.
```

**What happens:**
1. `list_projects` gets all projects
2. `list_tasks` for each project with different statuses
3. AI analyzes and prioritizes

---

## 🔧 Setting Up MCP Integration

### Option 1: Claude Desktop
Add to your Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "vibe_kanban": {
      "command": "npx",
      "args": ["-y", "vibe-kanban@latest", "--mcp"]
    }
  }
}
```

### Option 2: Raycast
Use Raycast's MCP server installer:
1. Open Raycast
2. Go to MCP Server Installer
3. Add Vibe Kanban server
4. Use command: `npx -y vibe-kanban@latest --mcp`

### Option 3: Within Vibe Kanban (Internal Agents)
Configure an agent to use Vibe Kanban MCP:
1. Go to Settings → Agent Profiles
2. Create custom profile
3. Add MCP server configuration
4. Agent can now create/manage tasks!

---

## 🎯 Complete Workflow Example

```
You: I need to build a blog engine with:
- Post creation and editing
- Markdown support
- Tag system
- Search functionality
Turn this into tasks.

[Agent uses MCP create_task for each feature]

You: Now start the "Post creation" task with Claude Code.

[Agent uses MCP start_workspace_session]

[You watch Claude Code work in real-time]

[Claude Code completes, task moves to In Review]

You: Show me the diffs.

[Agent uses MCP get_task, displays changes]

You: Looks good! Mark it as done.

[Agent uses MCP update_task to set status=done]

You: Now start the next task!

[Repeat...]
```

---

## 🚀 Advanced: Agent-Orchestrated Agents

You can have AI agents that:
1. **Plan** complex features
2. **Create tasks** automatically via MCP
3. **Start other agents** to execute tasks
4. **Review results** and iterate
5. **Manage entire project lifecycle** autonomously!

Example agent prompt:
```
You are a project manager agent. Your job is to:
1. Receive high-level feature requests
2. Break them down into tasks
3. Create tasks in Vibe Kanban using MCP
4. Prioritize and schedule tasks
5. Start execution with appropriate agents
6. Monitor progress
7. Review completed work
8. Iterate until complete

Use the Vibe Kanban MCP tools for all task operations.
```

---

## 📋 Quick Reference: MCP Tool Parameters

### create_task
```
Required:
- project_id: UUID
- title: string
- description: string

Returns: task_id, confirmation
```

### start_workspace_session
```
Required:
- task_id: UUID
- executor: string (claude-code, gemini, codex, amp, etc.)
- repos: array of [{repo_id, base_branch}]

Optional:
- variant: string (for different agent configurations)

Returns: workspace_id, session details
```

### list_tasks
```
Required:
- project_id: UUID

Optional:
- status: todo | in-progress | in-review | done
- limit: number (max results)

Returns: array of tasks with execution state
```

---

## 💪 Pro Tips

1. **Watch While It Works** - Keep the task open to see real-time progress
2. **Chat During Execution** - Send follow-up questions anytime
3. **Review Everything** - Always check diffs before merging
4. **Use MCP for Automation** - Create task pipelines that run themselves
5. **Combine Agents** - Use Claude for planning, Gemini for execution
6. **Iterate Fast** - Use review comments to refine results
7. **Track Everything** - All agent work goes to .blackbox automatically

---

## 🎁 Summary

**You get COMPLETE visibility into agent work:**

✅ Real-time execution monitoring
✅ Full code diffs after completion
✅ Line-by-line review with comments
✅ Chat with agents anytime
✅ Process history and logs
✅ MCP tools for automation
✅ Multi-agent orchestration
✅ Autonomous task management

**With MCP, you can:**
- Create tasks from plans automatically
- Start agents programmatically
- Build autonomous workflows
- Coordinate multiple agents
- Review and iterate automatically
- Manage entire projects from prompts

**Everything tracked to .blackbox automatically!** 🎉
