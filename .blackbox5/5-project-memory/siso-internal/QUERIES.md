# QUERIES.md - Agent Query Guide

> **Purpose**: Help agents find information quickly without browsing file systems
> **Principle**: Query layer > browse layer for AI agents

**Last Updated**: 2026-01-19
**Maintainer**: Update when adding new query patterns

---

## 🎯 Quick Reference

| Question | Query | Files to Check |
|----------|-------|----------------|
| What are we working on? | `active work` | `ACTIVE.md`, `STATE.yaml` |
| What was just completed? | `recent work` | `WORK-LOG.md` |
| What's planned for [feature]? | `[feature] planning` | `plans/active/[feature]/` |
| Why did we decide [X]? | `[X] decision` | `decisions/*/DEC-*-[X].md` |
| What do we know about [topic]? | `[topic] research` | `knowledge/research/*/[topic]*/` |
| What's the status of [task]? | `[task-id] status` | `STATE.yaml`, `tasks/active/[task-id].md` |

---

## 📊 Query Patterns

### Pattern 1: "What are we working on?"

**Agent Types**: John (PM), Winston (Architect), Arthur (Dev)

**Query**: `active work`

**What to Check**:
1. **First**: `ACTIVE.md` - Single view dashboard
2. **Then**: `STATE.yaml` - Source of truth for details
3. **Context**: Task context bundles in `tasks/active/*-CONTEXT.md`

**Example Response Structure**:
```
Active Features: [from STATE.yaml active_features]
Active Tasks: [from STATE.yaml active_tasks]
Blockers: [from ACTIVE.md blockers section]
Next Actions: [from ACTIVE.md next_actions section]
```

**When to Use**:
- Agent session starts
- Context handoff between agents
- Status check requests

---

### Pattern 2: "What was just completed?"

**Agent Types**: All agents

**Query**: `recent work` or `what's new`

**What to Check**:
1. **First**: `WORK-LOG.md` - Reverse chronological log
2. **Then**: `STATE.yaml` recent_work section
3. **Context**: Individual task files for details

**Example Response Structure**:
```
Most Recent Work:
[Date] - [Title]
- Time invested: [X hours]
- Description: [from WORK-LOG.md]
- Deliverables: [links]
- Related: [feature/decision links]
```

**When to Use**:
- Getting up to speed after being away
- Understanding recent changes
- Progress updates

---

### Pattern 3: "What's the plan for [feature]?"

**Agent Types**: Winston (Architect), Arthur (Dev)

**Query**: `[feature] planning` or `[feature] epic`

**What to Check**:
1. **First**: `plans/active/[feature]/XREF.md` - Cross-reference index
2. **Then**: `plans/active/[feature]/epic.md` - Full epic
3. **Context**: PRD at `plans/prds/active/[feature].md`

**Example Response Structure**:
```
[Feature Name] Planning Status:
- Status: [from XREF.md]
- PRD: [link] - [status]
- Epic: [link] - [status]
- Tasks: [count] total, [completed] completed
- Research: [link to research folder]
- Decisions: [count] architectural, [count] scope, [count] technical
```

**When to Use**:
- Starting implementation work
- Understanding feature scope
- Finding related decisions

---

### Pattern 4: "Why did we decide [X]?"

**Agent Types**: Winston (Architect), Felix (Security)

**Query**: `[X] decision` or `why [X]`

**What to Check**:
1. **First**: `STATE.yaml` decisions_* sections for index
2. **Then**: `decisions/*/DEC-*-[X].md` for full context
3. **Context**: Related features from XREF files

**Example Response Structure**:
```
Decision: [Title]
- Type: [architectural/scope/technical]
- Date: [date]
- Status: [accepted/proposed/deprecated]
- Context: [from decision context section]
- Decision: [what was decided]
- Alternatives: [what was considered]
- Consequences: [positive and negative]
- Implementation: [how it was implemented]
```

**When to Use**:
- Questioning architectural choices
- Understanding scope boundaries
- Debugging technical issues

---

### Pattern 5: "What do we know about [topic]?"

**Agent Types**: All agents (especially Winston, Arthur)

**Query**: `[topic] research` or `what is [topic]`

**What to Check**:
1. **First**: `knowledge/research/INDEX.md` - Research catalog
2. **Then**: `knowledge/research/*/[topic]*/` - Research folder
3. **Context**: 4D analysis files (STACK, FEATURES, ARCHITECTURE, PITFALLS)

**Example Response Structure**:
```
[Topic] Research:
- Status: [active/archived]
- Framework: 4D Analysis
- Location: [path]

Key Findings:
- Technology: [from STACK.md]
- Features: [from FEATURES.md]
- Architecture: [from ARCHITECTURE.md]
- Pitfalls: [from PITFALLS.md]

Summary: [from SUMMARY.md]

Related:
- Features: [from metadata.yaml]
- Decisions: [from metadata.yaml]
- Tasks: [from metadata.yaml]
```

**When to Use**:
- Learning about new technologies
- Understanding system components
- Researching implementation approaches

---

### Pattern 6: "What's the status of [task-id]?"

**Agent Types**: John (PM), Arthur (Dev)

**Query**: `[task-id] status` or `[task-id]`

**What to Check**:
1. **First**: `STATE.yaml` active_tasks or completed_tasks
2. **Then**: `tasks/active/[task-id].md` for full details
3. **Context**: `tasks/active/[task-id]-CONTEXT.md` for related info

**Example Response Structure**:
```
[Task ID]: [Task Name]
- Status: [pending/in_progress/completed]
- Priority: [high/medium/low]
- Type: [planning/implementation/infrastructure]

Description: [from task file]

Progress:
- Created: [date]
- Started: [date/null]
- Completed: [date/null]
- GitHub Issue: #[number/null]

Deliverables: [list]
Dependencies: [list]
Related: [feature links]
```

**When to Use**:
- Task status checks
- Progress updates
- Finding task context

---

### Pattern 7: "What needs to be done?"

**Agent Types**: John (PM), Arthur (Dev)

**Query**: `upcoming work` or `what's next`

**What to Check**:
1. **First**: `ACTIVE.md` upcoming section
2. **Then**: `STATE.yaml` upcoming_work section
3. **Context**: Individual task files for details

**Example Response Structure**:
```
Upcoming Work (Priority Order):

1. [Task Name]
   - Priority: [high/medium/low]
   - Estimated: [date]
   - Effort: [time]
   - Dependencies: [list]

2. [Task Name]
   - Priority: [high/medium/low]
   - Estimated: [date]
   - Effort: [time]
   - Dependencies: [list]

Blockers: [from ACTIVE.md]
```

**When to Use**:
- Planning next work session
- Prioritizing tasks
- Resource allocation

---

### Pattern 8: "What's the GitHub sync status?"

**Agent Types**: Dexter (DevOps), John (PM)

**Query**: `github sync` or `sync status`

**What to Check**:
1. **First**: `operations/github/SYNC-STATE.md` - Detailed sync status
2. **Then**: `STATE.yaml` github_sync section
3. **Context**: Individual task files for issue numbers

**Example Response Structure**:
```
GitHub Sync Status:
- Repository: [name]
- Last Sync: [date]
- Completion: [percentage]%

Synced Items: [count]
- [Task]: #[issue]

Pending Sync: [count]
- [Epic]: [estimated issue]
- [Tasks]: [estimated issue range]

Not Tracked: [count items]
- [list of items not in GitHub]

Next Sync: [from pending_tasks]
```

**When to Use**:
- Before syncing to GitHub
- Checking if something is tracked
- Understanding sync coverage

---

## 🤖 Agent-Specific Queries

### John (PM)
**Common Queries**:
- `active work status` - Overall project status
- `upcoming work` - What's next
- `[feature] progress` - Feature completion percentage
- `blockers` - What's blocking progress

**Primary Files**:
- `ACTIVE.md`
- `STATE.yaml`
- `plans/active/*/XREF.md`

---

### Winston (Architect)
**Common Queries**:
- `[feature] architecture` - Technical architecture
- `[decision] rationale` - Why we decided X
- `[topic] research` - Technology research
- `system patterns` - Architecture patterns

**Primary Files**:
- `plans/active/*/ARCHITECTURE.md`
- `decisions/architectural/*.md`
- `knowledge/research/*/ARCHITECTURE.md`

---

### Arthur (Dev)
**Common Queries**:
- `[task] context` - Task details and dependencies
- `[feature] tasks` - Implementation task list
- `[component] docs` - Component documentation
- `api contracts` - API specifications

**Primary Files**:
- `plans/active/*/epic.md`
- `tasks/active/*-CONTEXT.md`
- `plans/active/*/[0-9]*.md`

---

### Dexter (DevOps)
**Common Queries**:
- `deployment status` - Current deployment state
- `github sync` - Sync status
- `infrastructure decisions` - Infrastructure choices
- `monitoring setup` - Observability configuration

**Primary Files**:
- `operations/github/SYNC-STATE.md`
- `operations/deployments/*.md`
- `decisions/technical/*.md`

---

### Felix (Security)
**Common Queries**:
- `security decisions` - Security-related decisions
- `[feature] security` - Security considerations
- `audit findings` - Security audit results
- `risks` - Project risks

**Primary Files**:
- `decisions/architectural/*security*.md`
- `plans/active/*/epic.md` (security sections)
- `STATE.yaml` risks section

---

## 🔍 Search Strategies

### When You Don't Know the Exact Location

1. **Use INDEX files first**:
   - `knowledge/research/INDEX.md` - Research catalog
   - `plans/active/*/XREF.md` - Feature cross-reference
   - `CODE-INDEX.yaml` - Code index

2. **Search STATE.yaml**:
   - All tasks, features, decisions indexed
   - Single source of truth

3. **Use ACTIVE.md for active work**:
   - All active items in one place

4. **Use WORK-LOG.md for recent work**:
   - Reverse chronological order

### Finding Related Information

**From a Task**:
1. Read task file
2. Check `-CONTEXT.md` bundle
3. Follow feature links to XREF
4. Follow decision links to decision files
5. Follow research links to research folder

**From a Decision**:
1. Read decision file
2. Check related features in XREF
3. Check related tasks in epic
4. Check implementation in code

**From Research**:
1. Check metadata.yaml for related items
2. Follow feature links to XREF
3. Follow decision links to decision files

---

## 📝 Query Best Practices

### For Agents

1. **Start with dashboards** (ACTIVE.md, STATE.yaml)
2. **Follow the breadcrumb trail** (task → context → feature → research)
3. **Check STATE.yaml first** for status/type questions
4. **Use XREF files** for feature-wide context
5. **Check CONTEXT bundles** for task-specific context

### For Humans

1. **Use ACTIVE.md** for quick status checks
2. **Use WORK-LOG.md** for recent changes
3. **Use generate-dashboards.sh** to refresh views
4. **Update STATE.yaml** when state changes
5. **Use quick-create scripts** to add new items

---

## 🚀 Quick Start

### New Agent Session

```bash
# 1. Check what's active
cat ACTIVE.md

# 2. Check recent work
cat WORK-LOG.md

# 3. Get specific task context
cat tasks/active/TASK-*-CONTEXT.md

# 4. Find related planning
cat plans/active/*/XREF.md
```

### Before Making Changes

```bash
# 1. Check if there's a relevant decision
ls decisions/*/DEC-*[keyword]*

# 2. Check research if technical decision
grep -r "[keyword]" knowledge/research/

# 3. Check current state
grep -r "[keyword]" STATE.yaml ACTIVE.md
```

### After Completing Work

```bash
# 1. Update STATE.yaml
# [edit STATE.yaml]

# 2. Add to WORK-LOG.md
# [edit WORK-LOG.md]

# 3. Update dashboards
./scripts/generate-dashboards.sh
```

---

## 📚 Related Documents

- **ACTIVE.md**: Active work dashboard
- **WORK-LOG.md**: Work log
- **STATE.yaml**: Single source of truth
- **_NAMING.md**: File naming conventions
- **README.md**: Project memory overview

---

**Maintenance**: Update this file when:
- Adding new query patterns
- Changing file structure
- Adding new agent types
- Discovering better search strategies

**Principle**: Make it easy for agents to find information without browsing file systems.
