# Vibe Kanban + Black Box Agent Integration Plan

## Overview

This document outlines how to make Claude Code agents automatically aware of and use the Black Box system when working on tasks from Vibe Kanban.

## Problem Statement

When agents receive tasks from Vibe Kanban, they need to:
1. ✅ Know what the Black Box is and how to use it
2. ✅ Always update information in the Memory Bank
3. ✅ Track their tasks and make plans there
4. ✅ Follow through on everything stored there

## Solution Architecture

```
┌─────────────────┐
│  Vibe Kanban    │
│  (Task Source)  │
└────────┬────────┘
         │ assigns task
         ▼
┌─────────────────────────────────────────┐
│         Claude Code Agent               │
│  ┌─────────────────────────────────┐   │
│  │  1. Receive Task                │   │
│  │  2. Load Black Box Context      │◄──┼───┐
│  │  3. Check Memory Bank           │◄──┼───│
│  │  4. Execute Work                │   │   │
│  │  5. Update Memory Bank          │───┼───┐│
│  │  6. Track Progress              │───┼───┤│
│  └─────────────────────────────────┘   │ ││
│                                        │ ││
└────────────────────────────────────────┘ ││
         ▲            ▲            ▲     ││
         │            │            │     ││
         │            │            └─────┘│
         │            └──────────────────┘
         │         ┌──────────────────┐
         └─────────┤  Black Box       │
                   │  - Memory Bank   │
                   │  - Domain Knowledge│
                   │  - Skills        │
                   │  - Context       │
                   └──────────────────┘
```

## Implementation Plan

### Phase 1: Agent Prompt Template System

Create a universal agent prompt template that gets injected into every task.

#### 1.1 Universal Black Box Context Template

**File**: `.blackbox5/templates/agent-context-template.md`

```markdown
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
```bash
# Read active context
cat .blackbox5/engine/memory/memory-bank/active-context.md

# Read current progress
cat .blackbox5/engine/memory/memory-bank/progress.md

# Check for relevant domain knowledge
find .blackbox5/engine/domains/ -name "*.md" | grep -i <relevant-domain>
```

### 2. During Work
- Update `progress.md` with what you're working on
- Document decisions in `decision-log.md`
- Update `active-context.md` with current state

### 3. After Completing Work
- Mark tasks as complete in progress.md
- Create or update memory artifacts
- Document outcomes and next steps

## Memory Bank Files

- **active-context.md**: Current working context and state
- **progress.md**: Task progress tracking
- **decision-log.md**: Architecture and design decisions
- **product-context.md**: Product and feature knowledge
- **system-patterns.md**: Reusable system patterns

## Domain Knowledge Structure

```
.blackbox5/engine/domains/
├── _map.md                    # Domain index
├── auth/                      # Authentication system
├── analytics/                 # Analytics & tracking
├── lifelock/                  # Core product features
├── admin/                     # Admin interfaces
└── shared/                    # Shared components
```

## Key Skills to Use

The system has 40+ skills for common patterns:
- **Git Workflow**: `using-git-worktrees`, `github-cli`
- **MCP Integration**: `supabase`, `filesystem`, `playwright`
- **Development**: `test-driven-development`, `systematic-debugging`
- **Thinking**: `deep-research`, `first-principles-thinking`, `intelligent-routing`

Always check if a skill exists before implementing from scratch.

## MCP Tools Available

- **Supabase**: Database operations, migrations, auth
- **Filesystem**: Advanced file operations
- **Playwright/Chrome DevTools**: Browser automation
- **Sequential Thinking**: Chain-of-thought reasoning
- **Memory Bank MCP**: Read/write memory banks
- **Vibe Kanban MCP**: Task management

## Critical Rules

1. **NEVER work in isolation**: Always load context first
2. **ALWAYS update memory**: Document what you did and why
3. **USE existing patterns**: Check skills and domain knowledge first
4. **THINK before coding**: Use planning skills for complex tasks
5. **TRACK progress**: Keep progress.md up to date
6. **DOCUMENT decisions**: Use decision-log.md for architectural choices
```

#### 1.2 Task-Specific Prompt Template

**File**: `.blackbox5/templates/task-prompt-template.md`

```markdown
# Task: {TASK_NAME}

## Task Description
{TASK_DESCRIPTION}

## Vibe Kanban Context
- **Project**: {PROJECT_NAME}
- **Task ID**: {TASK_ID}
- **Status**: {TASK_STATUS}
- **Executor**: Claude Code

## Pre-Work Checklist

Before starting this task, you MUST:

- [ ] Read active context: `cat .blackbox5/engine/memory/memory-bank/active-context.md`
- [ ] Read progress: `cat .blackbox5/engine/memory/memory-bank/progress.md`
- [ ] Check for related decisions: `cat .blackbox5/engine/memory/memory-bank/decision-log.md`
- [ ] Search for relevant domain knowledge: `find .blackbox5/engine/domains/ -name "*.md" | xargs grep -l "{KEYWORDS}"`
- [ ] Check for existing skills: `find .blackbox5/engine/.agents/.skills/ -name "SKILL.md" | xargs grep -l "{KEYWORDS}"`

## During Work

As you work on this task:

1. **Update Progress**: Continuously update `progress.md`
   ```markdown
   ## {TASK_NAME}
   - Status: In Progress
   - Started: {TIMESTAMP}
   - Agent: Claude Code
   - Last Update: {TIMESTAMP}
   - Next Steps: {NEXT_STEPS}
   ```

2. **Document Decisions**: For any architectural choices, update `decision-log.md`
   ```markdown
   ## Decision: {DECISION_TITLE}
   - Context: {CONTEXT}
   - Options: {OPTIONS}
   - Choice: {CHOICE}
   - Rationale: {RATIONALE}
   ```

3. **Use Skills**: Check if a relevant skill exists before implementing
   ```bash
   find .blackbox5/engine/.agents/.skills/ -name "SKILL.md" | xargs grep -i "{KEYWORD}"
   ```

## Post-Work Checklist

Before marking this task complete:

- [ ] Update `progress.md` with final status
- [ ] Document any changes in `active-context.md`
- [ ] Record all decisions in `decision-log.md`
- [ ] Create/update relevant domain knowledge
- [ ] Update Vibe Kanban task status
- [ ] Link any created files/artifacts

## Expected Outcomes

{EXPECTED_OUTCOMES}

## Related Context

{RELATED_CONTEXT}
```

### Phase 2: Vibe Kanban Task Templates

Create standardized task templates in Vibe Kanban that include Black Box instructions.

#### 2.1 Task Template Structure

**Vibe Kanban Task Template**: "Black Box Aware Task"

```yaml
name: "Black Box Aware Task"
description: "Task with automatic Black Box integration"

template:
  title: "{{TASK_NAME}}"

  description: |
    # Task: {{TASK_NAME}}

    ## Black Box Integration

    This task requires Black Box system awareness. You will:

    1. Load context from Memory Bank before starting
    2. Update progress tracking during work
    3. Document decisions as you make them
    4. Use existing skills and patterns

    ## Task Details

    {{TASK_DESCRIPTION}}

    ## Instructions

    See the Black Box system guide for detailed workflows.

  metadata:
    requires_blackbox: true
    auto_context_load: true
    auto_progress_tracking: true
    auto_decision_logging: true

  executor: "claude-code"
```

#### 2.2 Task Categories

Create task templates for different categories:

1. **Feature Development**
2. **Bug Fix**
3. **Research Task**
4. **Refactoring**
5. **Documentation**
6. **Testing**

Each template has category-specific Black Box instructions.

### Phase 3: Automated Context Injection

Create a system that automatically injects Black Box context into agent prompts.

#### 3.1 Context Injection Script

**File**: `.blackbox5/scripts/inject-blackbox-context.sh`

```bash
#!/bin/bash

# Inject Black Box context into agent prompts

TASK_ID="$1"
TASK_DESC="$2"
PROJECT_DIR="$3"

# Load Black Box context
ACTIVE_CONTEXT=$(cat "$PROJECT_DIR/.blackbox5/engine/memory/memory-bank/active-context.md")
PROGRESS=$(cat "$PROJECT_DIR/.blackbox5/engine/memory/memory-bank/progress.md")
DECISION_LOG=$(cat "$PROJECT_DIR/.blackbox5/engine/memory/memory-bank/decision-log.md")

# Generate prompt
cat << EOF
# Black Box System Context

## Active Context
$ACTIVE_CONTEXT

## Current Progress
$PROGRESS

## Recent Decisions
$DECISION_LOG

---

# Task: $TASK_ID

## Description
$TASK_DESC

## Instructions
You are working in the Black Box system. Before starting:
1. Review the context above
2. Check for relevant domain knowledge
3. Look for existing skills to use
4. Document your work as you go

See .blackbox5/templates/agent-context-template.md for full documentation.
EOF
```

#### 3.2 Memory Bank MCP Auto-Sync

**File**: `.blackbox5/engine/memory/auto-sync.py`

```python
"""
Automatically sync Memory Bank with Vibe Kanban tasks
"""

import asyncio
from pathlib import Path
from datetime import datetime

class MemoryBankAutoSync:
    """Automatically update Memory Bank based on agent actions"""

    def __init__(self, memory_bank_path: Path):
        self.memory_bank_path = memory_bank_path
        self.progress_file = memory_bank_path / "progress.md"
        self.decision_log = memory_bank_path / "decision-log.md"
        self.active_context = memory_bank_path / "active-context.md"

    async def update_progress(self, task_id: str, status: str, notes: str = ""):
        """Update progress tracking for a task"""
        progress = self.progress_file.read_text()

        # Add or update task entry
        timestamp = datetime.now().isoformat()
        entry = f"""
## Task {task_id}
- Status: {status}
- Updated: {timestamp}
- Notes: {notes}
"""

        self.progress_file.write_text(progress + entry)

    async def log_decision(self, title: str, context: str, choice: str, rationale: str):
        """Log a decision to the decision log"""
        log = self.decision_log.read_text()

        timestamp = datetime.now().isoformat()
        entry = f"""
## Decision: {title}
- Timestamp: {timestamp}

### Context
{context}

### Decision
{choice}

### Rationale
{rationale}
"""

        self.decision_log.write_text(log + entry)

    async def update_active_context(self, context: str):
        """Update the active context"""
        self.active_context.write_text(context)
```

### Phase 4: Agent Skill Integration

Create skills that agents can use to interact with the Black Box.

#### 4.1 Memory Bank Management Skill

**File**: `.blackbox5/engine/.agents/.skills/core-infrastructure/memory-bank-management/SKILL.md`

```markdown
# Skill: Memory Bank Management

## Purpose
Manage the Memory Bank system to maintain context across agent sessions.

## When to Use
- Starting a new task
- Completing work on a task
- Making architectural decisions
- Tracking progress

## Usage

### Read Active Context
\`\`\`bash
cat .blackbox5/engine/memory/memory-bank/active-context.md
\`\`\`

### Update Progress
\`\`\`bash
# Append to progress.md
echo "## Task {TASK_ID}" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Status: {STATUS}" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Updated: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .blackbox5/engine/memory/memory-bank/progress.md
\`\`\`

### Log Decision
\`\`\`bash
# Append to decision-log.md
cat >> .blackbox5/engine/memory/memory-bank/decision-log.md << 'EOF'
## Decision: {TITLE}
- Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)

### Context
{CONTEXT}

### Decision
{DECISION}

### Rationale
{RATIONALE}
EOF
\`\`\`

### Search Domain Knowledge
\`\`\`bash
# Find relevant domain files
find .blackbox5/engine/domains/ -name "*.md" | xargs grep -l "{KEYWORD}"
\`\`\`

### Find Skills
\`\`\`bash
# Find relevant skills
find .blackbox5/engine/.agents/.skills/ -name "SKILL.md" | xargs grep -l "{KEYWORD}"
\`\`\`

## Examples

### Starting a Task
\`\`\`bash
# Load context
cat .blackbox5/engine/memory/memory-bank/active-context.md

# Check progress
cat .blackbox5/engine/memory/memory-bank/progress.md

# Update that we're starting
echo "## Task: Implement Feature X" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Status: Starting" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Agent: Claude Code" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .blackbox5/engine/memory/memory-bank/progress.md
\`\`\`

### Completing a Task
\`\`\`bash
# Update progress
echo "- Status: Complete" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Outcome: Successfully implemented Feature X" >> .blackbox5/engine/memory/memory-bank/progress.md
\`\`\`

## MCP Integration

Use the Memory Bank MCP server for programmatic access:

\`\`\`python
# Read memory bank
read_memory_bank_file("progress.md")

# Write to memory bank
write_memory_bank_file("progress.md", content)

# Track progress
track_progress(action, description, update_active_context=True)
\`\`\`

## Related Skills
- Domain Knowledge Navigation
- Agent Context Assembly
- Decision Documentation
```

### Phase 5: Vibe Kanban Integration

Configure Vibe Kanban to automatically include Black Box context in tasks.

#### 5.1 Vibe Kanban Agent Configuration

In Vibe Kanban Settings → Agent Profiles → Claude Code:

```yaml
name: "Claude Code with Black Box"
executor: "claude-code"

system_prompt: |
  You are a Claude Code agent working in the Black Box system.

  Before starting any task:
  1. Load active context from .blackbox5/engine/memory/memory-bank/active-context.md
  2. Check progress from .blackbox5/engine/memory/memory-bank/progress.md
  3. Review recent decisions from .blackbox5/engine/memory/memory-bank/decision-log.md
  4. Search for relevant domain knowledge in .blackbox5/engine/domains/
  5. Check for existing skills in .blackbox5/engine/.agents/.skills/

  During work:
  - Continuously update progress.md
  - Document decisions in decision-log.md
  - Use existing skills and patterns
  - Update active-context.md with current state

  After work:
  - Mark task as complete in progress.md
  - Document outcomes and next steps
  - Update Vibe Kanban task status

env:
  BLACKBOX_HOME: ".blackbox5"
  MEMORY_BANK_PATH: ".blackbox5/engine/memory/memory-bank"
  DOMAIN_KNOWLEDGE_PATH: ".blackbox5/engine/domains"
  SKILLS_PATH: ".blackbox5/engine/.agents/.skills"

mcp_servers:
  - memory-bank-mcp
  - vibe-kanban
  - filesystem
```

#### 5.2 Task Creation Workflow

When creating tasks in Vibe Kanban:

1. **Select Template**: "Black Box Aware Task"
2. **Fill Details**: Task name, description, expected outcomes
3. **Auto-Inject**: Vibe Kanban automatically adds Black Box context
4. **Assign**: Assign to Claude Code agent
5. **Track**: Agent automatically updates Memory Bank

### Phase 6: Testing & Validation

Validate the integration works end-to-end.

#### 6.1 Test Scenarios

1. **Simple Task**: Create a simple task, verify agent loads context
2. **Complex Task**: Multi-step task, verify progress tracking
3. **Decision Making**: Task requiring decisions, verify decision logging
4. **Skill Usage**: Task with existing skill, verify skill is used
5. **Memory Persistence**: Stop and restart, verify context is preserved

#### 6.2 Validation Checklist

- [ ] Agent loads active context before starting
- [ ] Agent checks progress for related work
- [ ] Agent searches domain knowledge
- [ ] Agent uses existing skills when available
- [ ] Agent updates progress during work
- [ ] Agent documents decisions
- [ ] Agent updates active context
- [ ] Memory persists across sessions
- [ ] Vibe Kanban task status updates

## Implementation Timeline

### Week 1: Foundation
- [ ] Create agent context template
- [ ] Create task prompt template
- [ ] Set up Memory Bank auto-sync script

### Week 2: Integration
- [ ] Create Vibe Kanban task templates
- [ ] Configure agent profiles
- [ ] Set up context injection system

### Week 3: Skills & Automation
- [ ] Create Memory Bank management skill
- [ ] Implement auto-tracking hooks
- [ ] Create decision logging skill

### Week 4: Testing & Refinement
- [ ] Test end-to-end workflows
- [ ] Refine based on agent behavior
- [ ] Document best practices

## Success Metrics

1. **Context Loading**: 100% of tasks load context before starting
2. **Progress Tracking**: 100% of tasks update progress.md
3. **Decision Logging**: All architectural decisions logged
4. **Skill Usage**: Agents use existing skills when available
5. **Memory Persistence**: Context preserved across sessions
6. **Task Completion**: Tasks marked complete in both systems

## Troubleshooting

### Agent Not Loading Context
- Check agent profile configuration
- Verify system prompt includes Black Box instructions
- Check Memory Bank files exist and are readable

### Progress Not Being Updated
- Verify Memory Bank write permissions
- Check if agent is using progress tracking skill
- Look for errors in agent logs

### Decisions Not Being Logged
- Verify decision-log.md exists
- Check if agent is using decision logging skill
- Review agent prompt for decision documentation instructions

### Context Not Persisting
- Verify Memory Bank files are being saved
- Check file system permissions
- Review Memory Bank MCP server logs

## Next Steps

1. **Review this plan** with the team
2. **Create templates** in `.blackbox5/templates/`
3. **Configure Vibe Kanban** with agent profiles
4. **Test with simple task** to validate workflow
5. **Iterate and refine** based on agent behavior
6. **Scale to all 6 agents** once validated

## References

- Black Box Documentation: `.blackbox5/engine/memory/README.md`
- Agent System: `.blackbox5/engine/.agents/`
- Skills: `.blackbox5/engine/.agents/.skills/`
- Memory Bank: `.blackbox5/engine/memory/memory-bank/`
- Vibe Kanban Docs: `docs/VIBE-KANBAN-LOCAL-SETUP.md`
