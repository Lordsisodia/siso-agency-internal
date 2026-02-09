# Config Directory

**Purpose:** Configuration files for the autonomous system.

---

## Directory Structure

```
config/
├── system.yaml       # System configuration
├── agents.yaml       # Agent overrides
├── routes.yaml       # Path routing
└── README.md         # This file
```

---

## Configuration Files

### system.yaml

Global system settings:
- Context budget limits
- Logging levels
- Default timeouts

### agents.yaml

Agent configuration overrides.

### routes.yaml

Path routing configuration (similar to BlackBox5 routes.yaml).

---

## Environment Variables

Configuration can be overridden via environment variables:

- `SISO_AUTONOMOUS_ROOT` - Root path
- `SISO_LOG_LEVEL` - Logging level
- `SISO_CONTEXT_MAX_TOKENS` - Context budget
