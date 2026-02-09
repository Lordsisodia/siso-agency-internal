# Autonomous Task System Implementation

## Overview

This implementation adds autonomous subtask capabilities to SISO Blackbox, allowing agents to:
1. Break down tasks into subtasks automatically
2. Spawn specialized sub-agents (researcher, coder, reviewer, etc.)
3. Track progress through a state machine
4. Store agent-only metadata with user-visible summaries
5. Run continuously in a monitoring loop

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
├─────────────────────────────────────────────────────────────────┤
│  EnhancedTaskDetailModal                                         │
│  └── AutonomousSubtasksSection (new tab)                        │
│      ├── Shows subtask cards with status                        │
│      ├── Expandable agent metadata (hidden by default)          │
│      └── Enable/disable autonomous mode                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  autonomousTaskService.ts                                        │
│  ├── enableAutonomousMode()                                     │
│  ├── createAutonomousSubtask()                                  │
│  ├── updateAutonomousSubtask()                                  │
│  ├── subscribeToSubtasks() (realtime)                           │
│  └── triggerAutonomousPlanning()                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  autonomous_subtasks table                                       │
│  ├── Core fields (id, title, status, priority)                  │
│  ├── agent_metadata JSONB (agent-only data)                     │
│  ├── summary TEXT (user-visible)                                │
│  ├── assigned_agent_role                                        │
│  └── verification_required / verification_notes                 │
│                                                                  │
│  deep_work_tasks.is_autonomous_eligible (new column)            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CONTINUOUS MONITOR                             │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Edge Functions                                         │
│  ├── autonomous-monitor (cron-triggered)                        │
│  │   └── Polls for pending subtasks, prepares agent prompts     │
│  └── autonomous-webhook                                         │
│      └── Receives agent completion reports                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SKILL SYSTEM                                 │
├─────────────────────────────────────────────────────────────────┤
│  siso-autonomous-task skill                                      │
│  ├── /autonomous create                                         │
│  ├── /autonomous spawn                                          │
│  ├── /autonomous status                                         │
│  ├── /autonomous context                                        │
│  ├── /autonomous list                                           │
│  └── /autonomous plan                                           │
│                                                                  │
│  Agent role templates:                                           │
│  - planner: Breaks down tasks                                   │
│  - researcher: Gathers information                              │
│  - coder: Implements changes                                    │
│  - reviewer: Reviews code                                       │
│  - architect: Designs systems                                   │
│  - verifier: Final verification                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Task Lifecycle

```
User marks task as autonomous-eligible
            │
            ▼
┌───────────────────────┐
│ Monitor detects task  │
└───────────────────────┘
            │
            ▼
┌───────────────────────┐
│ Spawns planner agent  │
└───────────────────────┘
            │
            ▼
┌───────────────────────┐     ┌───────────────────────┐
│ Planner creates       │────▶│ Subtasks created in   │
│ execution plan        │     │ 'pending' state       │
└───────────────────────┘     └───────────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            │                             │                             │
            ▼                             ▼                             ▼
┌───────────────────┐         ┌───────────────────┐         ┌───────────────────┐
│ Researcher Agent  │         │ Coder Agent       │         │ Reviewer Agent    │
│ pending→executing │         │ pending→executing │         │ pending→executing │
│ →completed        │         │ →completed        │         │ →completed        │
└───────────────────┘         └───────────────────┘         └───────────────────┘
            │                             │                             │
            └─────────────────────────────┼─────────────────────────────┘
                                          │
                                          ▼
                            ┌───────────────────────┐
                            │ Verifier Agent        │
                            │ (if required)         │
                            │ verifying→completed   │
                            └───────────────────────┘
                                          │
                                          ▼
                            ┌───────────────────────┐
                            │ All subtasks complete │
                            │ Parent task updated   │
                            └───────────────────────┘
```

## File Structure

```
supabase/
├── migrations/
│   └── 20250209_create_autonomous_subtasks_table.sql
├── functions/
│   ├── autonomous-monitor/
│   │   ├── index.ts          # Main monitor logic
│   │   ├── deno.json
│   │   └── DEPLOY.md
│   └── autonomous-webhook/
│       ├── index.ts          # Agent completion webhook
│       └── deno.json

src/
├── services/
│   └── autonomousTaskService.ts   # Service layer
├── domains/tasks/components/
│   ├── AutonomousSubtasksSection.tsx   # UI component
│   └── EnhancedTaskDetailModal.tsx     # Updated with new tab

.blackbox/3-modules/.skills/
└── siso-autonomous-task/
    ├── skill.json
    ├── SKILL.md
    └── src/
        ├── index.ts
        ├── lib/
        │   ├── supabase.ts
        │   └── agents.ts
        └── commands/
            ├── create.ts
            ├── spawn.ts
            ├── status.ts
            ├── context.ts
            ├── list.ts
            └── plan.ts
```

## Database Schema

### autonomous_subtasks

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| parent_task_id | TEXT | FK to deep_work_tasks |
| title | TEXT | Subtask title |
| description | TEXT | Detailed description |
| status | TEXT | pending/planned/executing/verifying/completed/failed |
| priority | TEXT | low/medium/high/critical |
| agent_metadata | JSONB | Agent-only data |
| summary | TEXT | User-visible summary |
| assigned_agent_role | TEXT | researcher/coder/reviewer/architect/planner/verifier |
| started_at | TIMESTAMPTZ | When agent started |
| completed_at | TIMESTAMPTZ | When agent finished |
| estimated_duration_min | INTEGER | Estimated time |
| verification_required | BOOLEAN | Needs verification |
| verification_notes | TEXT | Verifier notes |

## Usage

### Enable Autonomous Mode for a Task

1. Open task detail modal
2. Click "Autonomous" tab
3. Click "Enable Autonomous Mode"
4. System automatically creates a planner subtask
5. Monitor picks up planner task and spawns agent
6. Agent creates execution subtasks
7. Execution agents work on subtasks in parallel
8. Verifier reviews completed work
9. User sees summary in UI (can expand for agent metadata)

### Creating Subtasks Manually (via Skill)

```
/autonomous create parent_task_id=abc123 title="Research auth options" agent_role=researcher priority=high
```

### Spawning an Agent (via Skill)

```
/autonomous spawn subtask_id=uuid-123 context={"focus_area": "oauth2"}
```

### Updating Status (via Skill)

```
/autonomous status subtask_id=uuid-123 status=completed agent_metadata={"result": "found 3 options"} summary="Found OAuth2, JWT, and Session options"
```

## Deployment

### Deploy Edge Functions

```bash
supabase functions deploy autonomous-monitor
supabase functions deploy autonomous-webhook
```

### Set Environment Variables

```bash
supabase secrets set AUTONOMOUS_WEBHOOK_TOKEN=your-secure-token
```

### Set Up Cron Trigger

In Supabase dashboard:
- Function: `autonomous-monitor`
- Schedule: `* * * * *` (every minute)

## Security

- RLS policies ensure users only see their own subtasks
- Webhook endpoint requires Bearer token
- Agent metadata is JSONB (flexible but queryable)
- Service role key used for monitor operations

## Future Enhancements

1. **Agent Pool Management**: Limit concurrent agents per user
2. **Cost Tracking**: Track token usage per subtask
3. **Agent Chat**: Allow users to chat with active agents
4. **Retry Logic**: Automatic retry for failed subtasks
5. **Parallel Limits**: Configurable max parallel agents
6. **Human Checkpoints**: Require approval at specific states
7. **Agent Memory**: Persist agent learnings across tasks