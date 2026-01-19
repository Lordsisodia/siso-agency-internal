# Agent Quick Reference - Project Memory

**For AI Agents**: This is your cheat sheet for working with the project memory system.

---

## 🚀 3-Step Quick Start

### Step 1: Always Read Index First
```bash
cat .blackbox5/project-memory/INDEX.yaml
```

### Step 2: Use Query Templates
```bash
# Browse available queries
cat .blackbox5/project-memory/QUERY-TEMPLATES.md
```

### Step 3: Execute Workflow
```bash
# Follow the workflow in AGENT-API.md
cat .blackbox5/project-memory/AGENT-API.md
```

---

## 🎯 Most Common Operations

### 1. "What should I work on?"
```yaml
# Copy this:
query: "Find next steps"
file: ".blackbox5/project-memory/INDEX.yaml"
section: "next_steps.immediate"

# Result: List of immediate tasks with priorities
```

### 2. "Find everything for [feature]"
```yaml
# Copy this:
query: "Search by feature"
file: ".blackbox5/project-memory/INDEX.yaml"
section: "search_index.keywords.[feature]"

# Result: All files related to the feature
```

### 3. "Find research for [feature]"
```yaml
# Copy this:
path: ".blackbox5/project-memory/siso-internal/research/[feature]/"
files_to_read:
  - "metadata.yaml"
  - "STACK.md"
  - "FEATURES.md"
  - "ARCHITECTURE.md"
  - "PITFALLS.md"
  - "SUMMARY.md"
```

### 4. "Create task context"
```yaml
# Copy this:
command: "cp .blackbox5/project-memory/_template/tasks/_template.yaml .blackbox5/project-memory/siso-internal/tasks/active/[TASK-ID].yaml"
# Then edit the YAML file
```

### 5. "Update timeline"
```yaml
# Copy this:
file: ".blackbox5/project-memory/siso-internal/timeline.yaml"
add_to:
  - "milestones" (for major milestones)
  - "events" (for all events)
update:
  - "tasks_completed"
  - "progress_percentage"
```

---

## 📁 File Locations

### Core Files
```
.blackbox5/project-memory/
├── INDEX.yaml              # START HERE - Central index
├── AGENT-API.md            # API documentation
├── QUERY-TEMPLATES.md      # Copy-paste queries
└── AGENT-QUICK-REFERENCE.md # This file
```

### Project Files
```
.blackbox5/project-memory/siso-internal/
├── project.yaml            # Project metadata
├── context.yaml            # Project context
├── timeline.yaml           # Project timeline
├── research/               # Research findings
├── plans/                  # PRDs, epics, tasks
├── tasks/                  # Task contexts
└── decisions/              # Decisions
```

### Templates
```
.blackbox5/project-memory/_template/
├── research/_template.yaml
├── plans/_template-*.md
├── tasks/_template.yaml
└── decisions/_template*.md
```

---

## 🔍 Search Patterns

### By Type
| Type | Index Section | Example |
|------|---------------|---------|
| Research | `quick_find.research` | Get all research files |
| PRDs | `quick_find.prds` | Get all PRD files |
| Epics | `quick_find.epics` | Get all epic files |
| Tasks | `quick_find.tasks` | Get all task files |
| Decisions | `search_index.keywords.decision` | Get all decisions |

### By Status
| Status | Index Section | Example |
|--------|---------------|---------|
| Active | `status.active_tasks` | 5 active tasks |
| Completed | `status.completed_tasks` | 4 completed tasks |
| Pending | `status.pending_tasks` | 18 pending tasks |

### By Agent
| Agent | Index Section | Example |
|-------|---------------|---------|
| John | `agents.john` | PM work |
| Winston | `agents.winston` | Architect work |
| Arthur | `agents.arthur` | Developer work |

---

## ✏️ Create Patterns

### New Research
```yaml
template: "_template/research/_template.yaml"
destination: "siso-internal/research/[feature]/metadata.yaml"
time: "10-15 minutes"
```

### New PRD
```yaml
template: "_template/plans/_template-prd.md"
destination: "siso-internal/plans/[feature]/prd.md"
time: "15-20 minutes"
```

### New Epic
```yaml
template: "_template/plans/_template-epic.md"
destination: "siso-internal/plans/[feature]/epic.md"
time: "10-15 minutes"
```

### New Task Context
```yaml
template: "_template/tasks/_template.yaml"
destination: "siso-internal/tasks/active/[TASK-ID].yaml"
time: "5 minutes"
```

### New Decision
```yaml
template: "_template/decisions/_template.yaml"
destination: "siso-internal/decisions/[category]/[DEC-ID].yaml"
time: "10-15 minutes"
```

---

## 🎯 Query Numbers (Quick Reference)

| # | Query | File |
|---|-------|------|
| 1 | Find All Files for Feature | QUERY-TEMPLATES.md |
| 2 | Find All Research Files | QUERY-TEMPLATES.md |
| 3 | Find Active Tasks | QUERY-TEMPLATES.md |
| 4 | Find Work by Agent | QUERY-TEMPLATES.md |
| 5 | Find Next Steps | QUERY-TEMPLATES.md |
| 6-10 | Find Operations | QUERY-TEMPLATES.md |
| 11-16 | Create Operations | QUERY-TEMPLATES.md |
| 17-20 | Interface Operations | QUERY-TEMPLATES.md |
| 21-22 | Complete Workflows | QUERY-TEMPLATES.md |

---

## 📊 Current Status (Quick View)

```yaml
# From INDEX.yaml - status section
active_tasks: 5
completed_tasks: 4
pending_tasks: 18
overall_progress: "17%"

milestones:
  completed: 6
  pending: 3

next_immediate:
  - "Sync User Profile to GitHub"
  - "Implement User Profile Tasks"
```

---

## ⚡ Speed Tips

### Fastest Way to Find Something
```bash
# 1. Read INDEX.yaml
cat .blackbox5/project-memory/INDEX.yaml

# 2. Use grep to find keyword
grep -i "[keyword]" .blackbox5/project-memory/INDEX.yaml

# 3. Go to the file path
# (found in INDEX.yaml)
```

### Fastest Way to Create Something
```bash
# 1. Copy template
cp .blackbox5/project-memory/_template/[type]/_template* [destination]

# 2. Edit the file
# (fill in bracketed values)

# 3. Update INDEX.yaml
# (add new entry to appropriate section)
```

### Fastest Way to Understand Something
```bash
# Read in this order:
1. INDEX.yaml (overview)
2. [project]/metadata.yaml (context)
3. [project]/content.md (details)
```

---

## 🔗 Documentation Links

| Document | Purpose | Lines |
|----------|---------|-------|
| INDEX.yaml | Central index | 200+ |
| AGENT-API.md | API documentation | 500+ |
| QUERY-TEMPLATES.md | Copy-paste queries | 400+ |
| AGENT-QUICK-REFERENCE.md | This file | 300+ |
| AI-QUICK-START.md | Quick start guide | 350+ |
| AI-OPTIMIZED-SYSTEM.md | System overview | 400+ |

---

## ✅ Checklist for Agents

### Before Starting Work
- [ ] Read INDEX.yaml
- [ ] Check status section
- [ ] Check next_steps
- [ ] Read relevant task context

### During Work
- [ ] Follow specification
- [ ] Document progress
- [ ] Track time spent

### After Work
- [ ] Create/update task context
- [ ] Update timeline.yaml
- [ ] Update INDEX.yaml if needed
- [ ] Mark task as complete

---

## 🆘 Troubleshooting

### Problem: Can't find a file
```yaml
solution:
  1. "Check INDEX.yaml - search_index"
  2. "Check INDEX.yaml - quick_find"
  3. "Use find command: find .blackbox5/project-memory/ -name '*[keyword]*'"
```

### Problem: Don't know what to work on
```yaml
solution:
  1. "Check INDEX.yaml - next_steps.immediate"
  2. "Check INDEX.yaml - status"
  3. "Check timeline.yaml - upcoming work"
```

### Problem: Need to create something new
```yaml
solution:
  1. "Find template in _template/"
  2. "Copy template to destination"
  3. "Fill in bracketed values"
  4. "Update INDEX.yaml"
```

### Problem: Index is out of sync
```yaml
solution:
  1. "Scan directories for actual files"
  2. "Update INDEX.yaml with correct paths"
  3. "Rebuild search_index section"
```

---

## 🎓 Learning Path

### Beginner (First Time)
1. Read this file (AGENT-QUICK-REFERENCE.md)
2. Read INDEX.yaml
3. Try Query 5: "Find Next Steps"
4. Try Query 15: "Create Task Context"

### Intermediate (Routine Work)
1. Use QUERY-TEMPLATES.md for copy-paste queries
2. Use AGENT-API.md for detailed operations
3. Follow workflows for common tasks

### Advanced (Complex Work)
1. Design custom queries based on templates
2. Optimize workflows for efficiency
3. Contribute improvements to the system

---

## 💡 Best Practices

1. **Always read INDEX.yaml first** - It's the map
2. **Use query templates** - They're proven patterns
3. **Update INDEX.yaml after changes** - Keep it current
4. **Create task contexts** - Complete traceability
5. **Update timeline** - Track progress

---

## 📞 Need Help?

| Need | Go To |
|------|-------|
| Find something | INDEX.yaml → search_index |
| Do something | QUERY-TEMPLATES.md |
| Understand API | AGENT-API.md |
| Get started | AI-QUICK-START.md |
| Quick lookup | This file |

---

---

## 🆕 Task Management System (New!)

### Quick Task Commands

All commands can be run with:
```python
from engine.interface.cli.task_commands import CommandName
CommandName().run({'arg': 'value'})
```

### Most Common Task Operations

#### "Find where task code lives"
```python
TaskWhereCommand().run({'task_id': 'TASK-admin-overview'})
```
Shows: Domain path, page path, existing files, shared components, refactor history

#### "Get task context"
```python
TaskContextCommand().run({'task_id': 'TASK-admin-overview'})
```
Shows: Project principles → User needs → Domain context → Feature details

#### "See refactor history"
```python
TaskRefactorCommand().run({'task_id': 'TASK-admin-overview'})
```
Shows: What changed, lessons learned, gotchas discovered, patterns emerged

#### "Start a new task"
```python
TaskStartCommand().run({
    'task_id': 'TASK-admin-overview',
    'type': 'page-task',
    'domain': 'admin',
    'feature': '1-overview'
})
```
Creates: Task directory with workspace (insights.md, gotchas.md, decisions.md, data.json)

#### "Complete a task"
```python
TaskCompleteCommand().run({
    'task_id': 'TASK-admin-overview',
    'outcome': 'success'
})
```
Updates: CODE-INDEX.yaml with completion status

### Code Navigation Commands

#### "Show codebase stats"
```python
CodeStatsCommand().run({})
```
Shows: Total domains, files, domain status overview

#### "Find components"
```python
CodeFindCommand().run({'type': 'component', 'domain': 'admin'})
```

#### "Domain info"
```python
DomainInfoCommand().run({'domain': 'admin'})
```
Shows: All pages, components, domain context, refactor history

### Context Search

#### "Search all context"
```python
ContextSearchCommand().run({'query': 'authentication'})
```
Searches: DOMAIN-CONTEXT.md, FIRST-PRINCIPLES.md, and all context files

### Task Workspace

Each task has a workspace:
```
.blackbox5/memory/project-memory/siso-internal/tasks/working/TASK-XXXX-XX-XX-domain-name/
├── task.md                    # Task definition
├── workspace/
│   ├── insights.md           # Learning and discoveries
│   ├── gotchas.md            # Pitfalls and workarounds
│   ├── decisions.md          # Architectural decisions
│   ├── data.json             # Task-specific data
│   └── iterations/           # Iteration history
└── artifacts/                 # Generated files
```

### Task Types

1. **Epic** - Large feature spanning multiple pages
2. **Page Task** - Individual page with 6 sub-steps
3. **Subtask** - Breaking down page tasks

### First Principles Hierarchy

```
docs/project/FIRST-PRINCIPLES.md  # Project purpose
    ↓
docs/project/USERS.md             # Who we serve
    ↓
docs/project/ROADMAP.md            # Where we're going
    ↓
context/domains/{domain}/DOMAIN-CONTEXT.md  # Domain specifics
    ↓
tasks/working/TASK-XXXX/task.md    # Task details
```

### Best Practices

1. **Always start with context**
   ```python
   TaskContextCommand().run({'task_id': 'TASK-...'})
   ```

2. **Document as you go**
   - Update workspace/insights.md immediately
   - Record gotchas when you hit them
   - Note decisions with rationale

3. **Check existing code first**
   ```python
   TaskWhereCommand().run({'task_id': 'TASK-...'})
   ```

4. **Complete tasks properly** (updates CODE-INDEX for future agents)

---

**Status**: ✅ Ready for Agent Use
**Version**: 2.0 (Added Task Management System)
**Last Updated**: 2026-01-19

**Print this reference or keep it handy for quick access!**
