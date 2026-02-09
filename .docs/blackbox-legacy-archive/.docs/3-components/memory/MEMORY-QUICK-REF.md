# Memory Architecture - Quick Reference

**Fast lookup for common commands**

---

## Token Management

```bash
# Count tokens
./scripts/utils/token-count.py file.md

# Directory summary
./scripts/utils/token-count.py data/decisions

# Find large files
./scripts/utils/token-count.py --find-large --threshold 50000 data/
```

---

## Memory Tiers

```bash
# Check status
./scripts/manage-memory-tiers.sh status

# Compact working
./scripts/manage-memory-tiers.sh compact working

# Archive old
./scripts/manage-memory-tiers.sh archive
```

---

## Semantic Search

```bash
# Build index
./scripts/build-semantic-index.sh

# Search
python modules/research/semantic_search.py search --query "your query"

# Stats
python modules/research/semantic_search.py stats
```

---

## Shared Memory

```bash
# Register agent
python runtime/shared_memory.py --agent-id my-agent --register

# Update state
python runtime/shared_memory.py --agent-id my-agent --update "key" "value"

# Get state
python runtime/shared_memory.py --agent-id my-agent --get-state
```

---

## Agent Handoffs

```bash
# Create handoff
./scripts/agent-handoff.sh handoff from-agent to-agent context-dir "message"

# List handoffs
./scripts/agent-handoff.sh list
```

---

## Goal Tracking

```bash
# Set goal
python runtime/goal_tracking.py --agent-id my-agent --set-goal "Goal text"

# Create plan
python runtime/goal_tracking.py \
    --agent-id my-agent \
    --create-plan "Plan description" \
    --add-action "Action 1"

# Check status
python runtime/goal_tracking.py --agent-id my-agent --status
```

---

## Knowledge Graph

```bash
# Add entity
python runtime/knowledge_graph.py add-entity \
    --type "decision" --name "Name" --description "Description"

# Stats
python runtime/knowledge_graph.py stats
```

---

## Testing

```bash
# Run integration tests
./tests/integration/test-memory-architecture.sh
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| High token count | `./scripts/utils/token-count.py --find-large data/` |
| Search not working | `./scripts/build-semantic-index.sh --force` |
| Shared memory issues | `python runtime/shared_memory.py --agent-id X --get-state` |

---

**See [MEMORY-ARCHITECTURE.md](MEMORY-ARCHITECTURE.md) for complete documentation**
