# Interface Layer

**Purpose**: User and programmatic interfaces to Blackbox4

---

## Overview

The interface layer provides multiple ways to interact with Blackbox4:
- **CLI**: Command-line interface for terminal users
- **API**: REST/GraphQL API for programmatic access
- **Future**: Web UI, desktop apps, mobile apps

This layer implements **Layer 1: Interface Layer (Glass Box)** from the architecture, providing full visibility into how interactions are handled.

---

## Structure

```
interface/
├── cli/              # Command-line interface
├── api/              # REST/GraphQL API
└── README.md         # This file
```

---

## Design Principles

### Glass Box Interface
- ✅ **Visible**: All commands and endpoints documented
- ✅ **Transparent**: Request/response schemas exposed
- ✅ **Debuggable**: Full logging of all interactions
- ✅ **Observable**: Real-time monitoring of usage

### Consistent Experience
- Same concepts across CLI and API
- Shared validation and error handling
- Unified authentication and authorization
- Common request/response patterns

---

## CLI (`cli/`)

### Overview

The CLI provides terminal-based access to all Blackbox4 functionality.

### Command Structure
```bash
blackbox4 <command> <subcommand> [options]
```

### Core Commands

#### Plan Management
```bash
# Create new plan
blackbox4 plan create "your goal here"

# List active plans
blackbox4 plan list

# Show plan status
blackbox4 plan status <plan-id>

# Update plan
blackbox4 plan update <plan-id> --status="in_progress"
```

#### Agent Operations
```bash
# List available agents
blackbox4 agent list

# Show agent details
blackbox4 agent info <agent-name>

# Invoke agent manually
blackbox4 agent invoke <agent-name> --task="..." --context="..."

# Route task to best agent
blackbox4 agent route --task="..." --requirements="..."
```

#### Execution Control
```bash
# Run manual mode
blackbox4 run <plan-id> --mode=manual

# Run autonomous mode
blackbox4 run <plan-id> --mode=autonomous

# Pause execution
blackbox4 run pause <execution-id>

# Resume execution
blackbox4 run resume <execution-id>
```

#### Ralph Operations
```bash
# Generate Ralph files
blackbox4 ralph generate <plan-id>

# Run autonomous loop
blackbox4 ralph autonomous <plan-id>

# Show Ralph status
blackbox4 ralph status <plan-id>

# Analyze Ralph response
blackbox4 ralph analyze <plan-id>
```

#### Monitoring
```bash
# Show system status
blackbox4 monitor status

# Show active tasks
blackbox4 monitor tasks

# Show agent pool
blackbox4 monitor agents

# Stream real-time events
blackbox4 monitor events --follow
```

#### Configuration
```bash
# Show current config
blackbox4 config show

# Validate config
blackbox4 config validate

# Set config value
blackbox4 config set <key> <value>
```

### CLI Features

#### Interactive Mode
```bash
blackbox4 interactive
# Enters interactive REPL with:
# - Auto-completion
# - Command history
# - Inline help
# - Real-time feedback
```

#### Batch Mode
```bash
blackbox4 batch commands.txt
# Executes commands from file
```

#### Output Formats
```bash
# JSON output
blackbox4 plan list --output=json

# Table output
blackbox4 plan list --output=table

# Verbose output
blackbox4 plan list --verbose
```

---

## API (`api/`)

### Overview

The API provides programmatic access to Blackbox4 functionality via REST and GraphQL.

### REST API

#### Base URL
```
http://localhost:8080/api/v1
```

#### Authentication
```http
Authorization: Bearer <token>
```

#### Endpoints

##### Plans
```http
# List plans
GET /api/v1/plans

# Create plan
POST /api/v1/plans
Content-Type: application/json
{
  "goal": "your goal here",
  "context": {...}
}

# Get plan
GET /api/v1/plans/{plan_id}

# Update plan
PUT /api/v1/plans/{plan_id}
Content-Type: application/json
{
  "status": "in_progress",
  "checklist": [...]
}

# Delete plan
DELETE /api/v1/plans/{plan_id}
```

##### Agents
```http
# List agents
GET /api/v1/agents

# Get agent
GET /api/v1/agents/{agent_name}

# Invoke agent
POST /api/v1/agents/{agent_name}/invoke
Content-Type: application/json
{
  "task": {...},
  "context": {...}
}

# Route task
POST /api/v1/agents/route
Content-Type: application/json
{
  "task": {...},
  "requirements": [...]
}
```

##### Execution
```http
# Start execution
POST /api/v1/executions
Content-Type: application/json
{
  "plan_id": "...",
  "mode": "manual | autonomous"
}

# Get execution
GET /api/v1/executions/{execution_id}

# Pause execution
POST /api/v1/executions/{execution_id}/pause

# Resume execution
POST /api/v1/executions/{execution_id}/resume

# Cancel execution
DELETE /api/v1/executions/{execution_id}
```

##### Monitoring
```http
# Get system status
GET /api/v1/monitor/status

# Get events
GET /api/v1/monitor/events?limit=100&follow=true

# Get metrics
GET /api/v1/monitor/metrics

# Get logs
GET /api/v1/monitor/logs?execution_id=...
```

### GraphQL API

#### Endpoint
```
http://localhost:8080/graphql
```

#### Example Query
```graphql
query GetPlan($id: ID!) {
  plan(id: $id) {
    id
    goal
    status
    checklist {
      task
      status
      assignee
    }
    artifacts {
      filename
      url
    }
  }
}
```

#### Example Mutation
```graphql
mutation CreatePlan($goal: String!) {
  createPlan(goal: $goal) {
    id
    goal
    status
    createdAt
  }
}
```

---

## Request/Response Schemas

### Plan Schema
```json
{
  "id": "plan_20260115_100000",
  "goal": "Build a new feature",
  "status": "active | completed | archived",
  "createdAt": "2026-01-15T10:00:00Z",
  "context": {
    "user": "user_shaansi",
    "project": "my-project",
    "background": "..."
  },
  "checklist": [
    {
      "task": "Do something",
      "status": "pending | in_progress | completed",
      "assignee": "agent_name",
      "priority": "high | medium | low"
    }
  ],
  "artifacts": [
    {
      "filename": "output.md",
      "url": "/plans/.../artifacts/output.md",
      "type": "document | code | image"
    }
  ]
}
```

### Agent Schema
```json
{
  "name": "oracle",
  "type": "enhanced | specialist | bmad | research",
  "description": "Architecture expert",
  "capabilities": ["architecture_review", "pattern_detection"],
  "model": "gpt-5.2",
  "status": "available | busy | offline",
  "performance": {
    "success_rate": 0.95,
    "avg_latency_seconds": 18,
    "total_executions": 1234
  }
}
```

### Execution Schema
```json
{
  "id": "exec_20260115_103000",
  "plan_id": "plan_20260115_100000",
  "mode": "manual | autonomous",
  "status": "running | paused | completed | failed",
  "startedAt": "2026-01-15T10:30:00Z",
  "completedAt": "2026-01-15T11:00:00Z",
  "progress": {
    "total_tasks": 10,
    "completed_tasks": 7,
    "percentage": 70
  },
  "current_agent": "oracle",
  "metrics": {
    "duration_seconds": 1800,
    "total_tokens": 45000,
    "estimated_cost": 2.45
  }
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": [
      {
        "field": "goal",
        "issue": "Required field missing"
      }
    ],
    "request_id": "req_abc123",
    "timestamp": "2026-01-15T10:30:00Z"
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid request data
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## Rate Limiting

### Default Limits
```yaml
rate_limits:
  - endpoint: /api/v1/*
    limit: 100 requests/minute
  - endpoint: /api/v1/executions
    limit: 10 requests/minute
```

### Response Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642258800
```

---

## Logging

All interface interactions are logged to `.runtime/monitor/events.json`:
```json
{
  "event_type": "interface_request",
  "interface": "cli | api",
  "command": "plan create",
  "endpoint": "/api/v1/plans",
  "method": "POST",
  "timestamp": "2026-01-15T10:30:00Z",
  "user": "user_shaansi",
  "request_id": "req_abc123",
  "duration_ms": 123
}
```

---

## Glass Box Properties

- ✅ **Visible**: All commands and endpoints documented
- ✅ **Transparent**: Request/response schemas exposed
- ✅ **Debuggable**: Full request/response logging
- ✅ **Observable**: Real-time monitoring of all interactions

---

**Part of**: Blackbox4 Interface Layer (Layer 1)
**Purpose**: User and Programmatic Access
**Principle**: Glass Box Interface
