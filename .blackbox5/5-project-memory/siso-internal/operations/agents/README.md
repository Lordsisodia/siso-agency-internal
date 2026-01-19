# Agent Memory

This folder contains **AgentMemory** - persistent memory for all agents.

## Structure

```
agents/
├── active/              # Currently running agent sessions
│   └── {agent-id}/
│       ├── session.json       # Current session state
│       ├── context.json       # Agent context
│       └── snapshot.json      # Latest snapshot
│
└── history/             # Past agent sessions + learnings
    ├── sessions/        # Named sessions (HistorySessions)
    │   ├── {session-name}/
    │   │   ├── sessions.json    # Session records
    │   │   ├── insights.json    # Learned patterns
    │   │   ├── patterns.json    # Discovered patterns
    │   │   └── metrics.json     # Performance metrics
    ├── patterns/        # Cross-session patterns
    └── metrics/         # Aggregate metrics
```

## Usage

### Creating a New Agent Session

When an agent starts, create a session in `active/`:

```json
{
  "agent_id": "frontend-developer",
  "agent_type": "specialist",
  "session_start": "2025-01-19T10:00:00Z",
  "task": "Build feature X",
  "context": {...}
}
```

### Saving Agent Insights

Agents should save insights to `history/sessions/{session-name}/insights.json`:

```json
{
  "insights": [
    {
      "content": "Use TypeScript for type safety",
      "category": "pattern",
      "confidence": 0.9,
      "timestamp": "2025-01-19T10:30:00Z"
    }
  ]
}
```

### Categories

- `pattern` - Reusable patterns discovered
- `gotcha` - Common pitfalls to avoid
- `discovery` - New findings about codebase
- `optimization` - Performance optimizations

## Agent Isolation

Each agent has isolated memory. Agents can share patterns through the `patterns/` folder.
