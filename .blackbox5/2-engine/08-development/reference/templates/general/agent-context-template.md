# Black Box System Context

## What is the Black Box?

The **Black Box** is this project's AI agent runtime and knowledge management system. It consists of:

- **Memory Bank** (`.blackbox5/engine/memory/memory-bank/`): Persistent memory across all agent sessions
- **Domain Knowledge** (`.blackbox5/engine/domains/`): Project knowledge organized by subsystem
- **Agents** (`.blackbox5/engine/.agents/`): 285+ specialized agent configurations
- **Skills** (`.blackbox5/engine/.agents/.skills/`): 40+ reusable skill patterns
- **Tools** (MCP servers): Integration with external systems (Supabase, filesystem, etc.)

## Core Principles

1. **Memory-First**: Always update the Memory Bank with your work
2. **Context-Aware**: Load relevant context before starting work
3. **Plan-Track-Execute**: Make plans visible, track progress, follow through
4. **Use Skills**: Leverage existing skills instead of reinventing patterns

## Required Workflows

### 1. Before Starting Work

You MUST load context before doing any work:

```bash
# Read active context
cat .blackbox5/engine/memory/memory-bank/active-context.md

# Read current progress
cat .blackbox5/engine/memory/memory-bank/progress.md

# Check for relevant domain knowledge
find .blackbox5/engine/domains/ -name "*.md" | grep -i <relevant-domain>

# Check for existing skills
find .blackbox5/engine/.agents/.skills/ -name "SKILL.md" | xargs grep -i <keyword>
```

### 2. During Work

As you work, continuously update:

- **Update `progress.md`**: Track what you're working on
- **Document in `decision-log.md`**: Record architectural decisions
- **Update `active-context.md`**: Keep current state visible

### 3. After Completing Work

Before marking a task complete:

- Mark tasks as complete in `progress.md`
- Create or update memory artifacts
- Document outcomes and next steps

## Memory Bank Files

### active-context.md
Current working context and state. Update this when:
- Starting a new task
- Changing focus
- Completing major milestones

### progress.md
Task progress tracking. Update this:
- When starting a task
- As you make progress
- When completing a task

Format:
```markdown
## Task: {TASK_NAME}
- Status: {In Progress|Complete|Blocked}
- Started: {TIMESTAMP}
- Agent: {AGENT_NAME}
- Last Update: {TIMESTAMP}
- Next Steps: {NEXT_STEPS}
```

### decision-log.md
Architecture and design decisions. Add entries for:
- Technical choices
- Architecture decisions
- Library/framework selections
- Significant refactoring decisions

Format:
```markdown
## Decision: {DECISION_TITLE}
- Context: {CONTEXT}
- Options: {OPTIONS}
- Choice: {CHOICE}
- Rationale: {RATIONALE}
- Consequences: {CONSEQUENCES}
```

### product-context.md
Product and feature knowledge. Document:
- Feature descriptions
- User workflows
- Product decisions

### system-patterns.md
Reusable system patterns. Add:
- Common patterns you discover
- Best practices
- Anti-patterns to avoid

## Domain Knowledge Structure

```
.blackbox5/engine/domains/
├── _map.md                    # Domain index - START HERE
├── auth/                      # Authentication system
├── analytics/                 # Analytics & tracking
├── lifelock/                  # Core product features
│   ├── habits/               # Habit tracking
│   │   ├── gamification/     # Gamification system
│   │   │   ├── 1-earn/       # Earning points
│   │   │   ├── 2-spend/      # Spending points (store)
│   │   │   └── 3-track/      # Tracking progress
│   │   └── ...
│   └── ...
├── admin/                     # Admin interfaces
└── shared/                    # Shared components
```

**How to use domain knowledge**:
1. Start with `_map.md` to understand the structure
2. Navigate to relevant domain for your task
3. Read existing documentation before making changes
4. Update domain docs when you learn something new

## Key Skills to Use

The system has 40+ skills for common patterns. ALWAYS check if a skill exists before implementing from scratch:

### Development Skills
- **test-driven-development**: TDD workflow
- **systematic-debugging**: Debugging methodology
- **atomic-planning**: Breaking down tasks
- **atomic-execution**: Executing focused tasks

### Git & Workflow
- **using-git-worktrees**: Parallel development
- **github-cli**: GitHub operations
- **subagent-driven-development**: Delegating to specialists

### MCP Integration Skills
- **supabase**: Database operations, migrations, auth
- **filesystem**: File operations
- **playwright/chrome-devtools**: Browser automation
- **sequential-thinking**: Chain-of-thought reasoning

### Thinking Skills
- **deep-research**: In-depth investigation
- **first-principles-thinking**: Foundational reasoning
- **intelligent-routing**: Choosing the right approach
- **writing-plans**: Creating structured plans

**How to use skills**:
```bash
# Find relevant skills
find .blackbox5/engine/.agents/.skills/ -name "SKILL.md" | xargs grep -i <keyword>

# Read a skill
cat .blackbox5/engine/.agents/.skills/<category>/<skill-name>/SKILL.md
```

## MCP Tools Available

You have access to these MCP servers:

### Memory Bank MCP (`memory-bank-siso`)
- **read_memory_bank_file**: Read memory bank files
- **write_memory_bank_file**: Write to memory bank
- **track_progress**: Update progress tracking
- **log_decision**: Log decisions to decision log
- **update_active_context**: Update active context

### Vibe Kanban MCP (`vibe_kanban`)
- **list_projects**: List all projects
- **list_tasks**: List tasks in a project
- **create_task**: Create new tasks
- **get_task**: Get task details
- **update_task**: Update task status
- **start_workspace_session**: Start working on a task

### Supabase MCP (`siso-internal-supabase`)
- **execute_sql**: Run SQL queries
- **apply_migration**: Apply database migrations
- **list_tables**: List database tables
- **get_logs**: Get service logs

### Filesystem MCP (`filesystem`)
- Advanced file operations
- Directory traversal
- File search

### Playwright/Chrome DevTools MCP
- Browser automation
- Screenshot capture
- Page interaction

### Sequential Thinking MCP
- Chain-of-thought reasoning
- Thought progression tracking

## Critical Rules

1. **NEVER work in isolation**: Always load context first
2. **ALWAYS update memory**: Document what you did and why
3. **USE existing patterns**: Check skills and domain knowledge first
4. **THINK before coding**: Use planning skills for complex tasks
5. **TRACK progress**: Keep progress.md up to date
6. **DOCUMENT decisions**: Use decision-log.md for architectural choices

## Quick Start Checklist

Before starting ANY task:

- [ ] Read `active-context.md`
- [ ] Read `progress.md`
- [ ] Check `decision-log.md`
- [ ] Search domain knowledge
- [ ] Search for relevant skills
- [ ] Plan your approach

During work:

- [ ] Update `progress.md` as you go
- [ ] Document decisions in `decision-log.md`
- [ ] Use existing skills when available
- [ ] Update `active-context.md` when context changes

After completing work:

- [ ] Mark task complete in `progress.md`
- [ ] Document outcomes
- [ ] Update `active-context.md`
- [ ] Update Vibe Kanban task status
- [ ] Note next steps

## Getting Help

If you're unsure how to use the Black Box:

1. Check this template first
2. Look for relevant skills
3. Check domain knowledge
4. Read the Memory Bank README: `.blackbox5/engine/memory/README.md`

## Example Workflow

### Starting a Task

```bash
# 1. Load context
cat .blackbox5/engine/memory/memory-bank/active-context.md

# 2. Check progress
cat .blackbox5/engine/memory/memory-bank/progress.md

# 3. Find relevant domain knowledge
find .blackbox5/engine/domains/ -name "*.md" | xargs grep -l "gamification"

# 4. Check for skills
find .blackbox5/engine/.agents/.skills/ -name "SKILL.md" | xargs grep -l "supabase"

# 5. Update progress that you're starting
echo "## Task: Add new feature" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Status: Starting" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Agent: Claude Code" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .blackbox5/engine/memory/memory-bank/progress.md
```

### During Work

```bash
# Update progress
echo "- Last Update: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Current Step: Implementing X" >> .blackbox5/engine/memory/memory-bank/progress.md
```

### Making a Decision

```bash
# Log the decision
cat >> .blackbox5/engine/memory/memory-bank/decision-log.md << 'EOF'
## Decision: Use Supabase for new feature
- Context: Need to store user preferences
- Options: Local storage, Supabase, Custom backend
- Choice: Supabase
- Rationale: Already using Supabase, consistent with architecture
- Consequences: Requires migration, need to handle auth
EOF
```

### Completing Work

```bash
# Update progress
echo "- Status: Complete" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Outcome: Successfully implemented feature X" >> .blackbox5/engine/memory/memory-bank/progress.md
```

---

**Remember**: The Black Box is your team's collective brain. Use it, update it, and respect it. Everything you learn should be documented for future agents (and humans!) to benefit from.
