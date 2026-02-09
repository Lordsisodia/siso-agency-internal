# SISO Autonomous Task Skill

Autonomous task management for SISO Blackbox. Enables spawning sub-agents to complete tasks with full lifecycle management.

## Overview

This skill provides commands for:
- Creating autonomous subtasks linked to parent tasks
- Spawning specialized sub-agents (researcher, coder, reviewer, etc.)
- Tracking task state through the lifecycle
- Managing agent-only metadata vs user-visible summaries

## Task Lifecycle

```
pending → planned → executing → verifying → completed
   ↓          ↓          ↓           ↓
 failed ←────┴──────────┴───────────┘
```

## Commands

### /autonomous create

Create a new autonomous subtask.

```
/autonomous create parent_task_id=abc123 title="Research auth options" agent_role=researcher priority=high
```

### /autonomous spawn

Spawn a sub-agent to work on a subtask. The agent will:
1. Read the subtask context
2. Execute the work based on its role
3. Update status and metadata

```
/autonomous spawn subtask_id=uuid-123 context={"focus_area": "oauth2"}
```

### /autonomous status

Update subtask status and metadata.

```
/autonomous status subtask_id=uuid-123 status=executing agent_metadata={"started_at": "..."}
```

### /autonomous context

Get full context including agent_metadata.

```
/autonomous context subtask_id=uuid-123
```

### /autonomous list

List subtasks for a parent task.

```
/autonomous list parent_task_id=abc123 status=pending
```

### /autonomous plan

Spawn a planner agent to create an execution plan.

```
/autonomous plan parent_task_id=abc123
```

## Agent Roles

| Role | Purpose |
|------|---------|
| planner | Breaks down tasks into subtasks |
| researcher | Gathers information and analyzes |
| coder | Implements code changes |
| reviewer | Reviews and validates work |
| architect | Designs systems and patterns |
| verifier | Final verification before completion |

## Agent Metadata Structure

```json
{
  "spawned_agents": [
    {
      "agent_id": "uuid",
      "role": "researcher",
      "status": "completed",
      "started_at": "2026-02-09T10:00:00Z",
      "completed_at": "2026-02-09T10:30:00Z"
    }
  ],
  "execution_plan": {
    "phases": ["research", "design", "implement"],
    "current_phase": "research"
  },
  "context_snapshots": [...],
  "verification_results": {
    "passed": true,
    "notes": "..."
  },
  "internal_notes": "Agent reasoning and decisions",
  "artifacts": ["file1.ts", "file2.ts"]
}
```

## Database Schema

Uses `autonomous_subtasks` table with:
- Core fields: id, parent_task_id, title, description, status, priority
- Agent metadata: JSONB field for internal agent data
- User summary: Text field for user-visible description
- Verification: Fields for verification workflow

## Usage Patterns

### Pattern 1: Simple Autonomous Task

1. User creates task and marks as autonomous-eligible
2. Monitor picks up task
3. Spawns planner → creates subtasks
4. Spawns execution agents
5. Updates status to completed
6. User sees summary in UI

### Pattern 2: Human-in-the-Loop

1. Task created with verification_required=true
2. Agents execute but stop at "verifying" state
3. User reviews in UI
4. User approves → status → completed

### Pattern 3: Continuous Improvement

1. Task agent analyzes codebase
2. Creates autonomous subtasks for improvements
3. Agents implement improvements
4. Verification agent validates
5. Loop continues for new issues

## Integration

This skill integrates with:
- SISO-Internal Supabase (autonomous_subtasks table)
- Claude Code sub-agent spawning
- Task detail UI (for metadata display)
- Continuous monitor (edge function)

## Security

- RLS policies ensure users only see their own subtasks
- Agent metadata is JSONB (flexible but queryable)
- Service role key required for monitor operations