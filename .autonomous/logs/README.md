# Logs Directory

**Purpose:** Store execution logs, agent communications, and event logs.

---

## Directory Structure

```
logs/
├── execution_logs/       # Logs from autonomous runs
├── agent_communications/ # Inter-agent message logs
├── event_logs/          # System event logs
└── README.md            # This file
```

---

## Log Formats

### Execution Logs

JSON Lines format (`.jsonl`):
```json
{"timestamp": "2026-02-09T10:00:00Z", "type": "execution_start", "run_id": "run-20260209_100000", "message": "..."}
```

### Agent Communications

JSON Lines format with from/to fields:
```json
{"timestamp": "2026-02-09T10:05:00Z", "from": "planner", "to": "execution", "message": "..."}
```

### Event Logs

Structured events for system monitoring:
```json
{"timestamp": "2026-02-09T10:10:00Z", "type": "task_complete", "task_id": "TASK-001", "status": "success"}
```

---

## Retention Policy

- Execution logs: 30 days
- Agent communications: 14 days
- Event logs: 90 days

Archive older logs to `logs/archive/`.
