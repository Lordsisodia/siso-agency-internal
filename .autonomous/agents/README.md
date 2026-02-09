# Agents Directory

**Purpose:** Agent registry for the autonomous system.

---

## Available Agents

| Agent | Type | Purpose |
|-------|------|---------|
| `analyzer/` | analyst | Research and pattern detection |
| `architect/` | architect | System design and patterns |
| `execution/` | executor | Task implementation |
| `executor/` | executor | Command execution |
| `metrics/` | analyst | Performance monitoring |
| `planner/` | coordinator | Task planning and coordination |
| `scout/` | explorer | Codebase exploration |

---

## Agent Definition

Each agent has an `agent.yaml` file:

```yaml
agent:
  id: "agent-id"
  name: "Agent Name"
  type: "agent-type"
  description: "What this agent does"

  capabilities:
    - capability-1
    - capability-2

  triggers:
    keywords:
      - keyword-1
      - keyword-2
    min_confidence: 0.70

  io:
    input_formats:
      - text
      - markdown
    output_formats:
      - markdown

  tools:
    - filesystem
    - read_file
```

---

## Agent Selection

The skill router automatically selects agents based on:
- Task keywords
- Confidence score
- Agent capabilities

---

## Adding New Agents

1. Create directory: `agents/{name}/`
2. Create `agent.yaml` with definition
3. Add capabilities and triggers
4. Test with skill router
