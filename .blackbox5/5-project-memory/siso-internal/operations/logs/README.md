# Agent Logs

This folder contains **System Logs** - operational logs from agents and workflows.

## Structure

```
logs/
└── agent-logs/
    ├── {agent-name}-{date}.log
    ├── {workflow-name}-{date}.log
    └── system-{date}.log
```

## Purpose

Logs provide:

### Debugging
- Error tracking
- Exception logs
- Stack traces

### Audit
- What agents were run
- What tools were called
- What actions were taken

### Performance
- Execution time
- Resource usage
- Bottlenecks

## Log Format

```
{TIMESTAMP} [{LEVEL}] {AGENT}: {MESSAGE}
```

Example:
```
2025-01-19T10:00:00Z [INFO] frontend-developer: Starting task "Build navbar"
2025-01-19T10:05:00Z [INFO] frontend-developer: Created component
2025-01-19T10:10:00Z [INFO] frontend-developer: Task completed successfully
```

## Rotation

Logs should be rotated daily and compressed after 7 days.
