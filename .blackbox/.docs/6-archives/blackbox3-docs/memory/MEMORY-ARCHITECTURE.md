# Memory Architecture - Complete Guide

**Version:** 1.0.0
**Status:** Production Ready
**Last Updated:** 2025-01-12

---

## Table of Contents

1. [Overview](#overview)
2. [Three-Tier Memory System](#three-tier-memory-system)
3. [Token Management](#token-management)
4. [Semantic Search](#semantic-search)
5. [Shared Memory (Multi-Agent)](#shared-memory-multi-agent)
6. [Agent Handoffs](#agent-handoffs)
7. [Goal Tracking](#goal-tracking)
8. [Knowledge Graph](#knowledge-graph)
9. [Configuration](#configuration)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The Memory Architecture is a sophisticated system that manages context, enables semantic search, and coordinates multi-agent workflows. It consists of four main components:

1. **Three-Tier Memory** - Working, Extended, and Archival storage
2. **Semantic Search** - Vector-based content retrieval
3. **Shared Memory** - Multi-agent coordination
4. **Self-Awareness** - Goal tracking and progress monitoring

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Memory Architecture                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Working Memory (Session)                               │
│  ├── agents/.plans/{active_plan}/context/                      │
│  ├── Size: 10 MB                                        │
│  └── Retention: Session only                            │
│                                                          │
│  Extended Memory (Project Knowledge)                     │
│  ├── data/decisions/, data/context/, data/bmad/          │
│  ├── Size: 500 MB                                       │
│  └── Retention: Permanent                               │
│                                                          │
│  Archival Memory (Historical)                           │
│  ├── .docs/, .timeline/, agents/.plans/archive/                 │
│  ├── Size: 5 GB                                         │
│  └── Retention: Permanent                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Three-Tier Memory System

### Usage

#### Check Memory Status
```bash
./scripts/manage-memory-tiers.sh status
```

Output:
```
=== Working Memory ===
  agents/.plans/{active_plan}/context/
    Tokens: 12,345
    Files: 8

=== Extended Memory ===
  data/decisions/
    Tokens: 45,678
    Files: 23
```

#### Compact Memory
```bash
# Compact working memory
./scripts/manage-memory-tiers.sh compact working

# Auto-compact specific directory
./scripts/auto-compact.sh data/context
```

#### Archive Old Content
```bash
./scripts/manage-memory-tiers.sh archive
```

---

## Token Management

### Count Tokens

```bash
# Single file
./scripts/utils/token-count.py path/to/file.md

# Directory summary
./scripts/utils/token-count.py data/context

# Find files exceeding threshold
./scripts/utils/token-count.py --find-large --threshold 50000 data/

# JSON output
./scripts/utils/token-count.py data/decisions --json
```

### Auto-Compaction

When a file exceeds 50,000 tokens, the system automatically compacts it while preserving:
- Decision records
- Final summaries
- Key artifacts

Manual compaction:
```bash
./scripts/auto-compact.sh data/context
```

---

## Semantic Search

### Build Index

```bash
# Initial build
./scripts/build-semantic-index.sh

# Force rebuild
./scripts/build-semantic-index.sh --force
```

### Search

```bash
# Basic search
python modules/research/semantic_search.py search \
    --query "database schema decision" \
    --n-results 5

# Search within specific path
python modules/research/semantic_search.py search \
    --query "authentication implementation" \
    --filter-path "data/decisions"

# Get statistics
python modules/research/semantic_search.py stats
```

### Example Queries

```bash
# Find past decisions
python modules/research/semantic_search.py search \
    --query "API authentication design decision"

# Find implementation approaches
python modules/research/semantic_search.py search \
    --query "JWT token implementation best practices"
```

---

## Shared Memory (Multi-Agent)

### Register Agent

```bash
python runtime/shared_memory.py \
    --agent-id my-agent \
    --register
```

### Update Shared State

```bash
python runtime/shared_memory.py \
    --agent-id my-agent \
    --update "current_task" "Implementing feature X"
```

### Check State

```bash
# Get current state
python runtime/shared_memory.py \
    --agent-id my-agent \
    --get-state

# View recent activity
python runtime/shared_memory.py \
    --agent-id my-agent \
    --activity
```

---

## Agent Handoffs

### Create Handoff

```bash
./scripts/agent-handoff.sh handoff \
    <from_agent> \
    <to_agent> \
    <context_directory> \
    "Handoff message"
```

### Load Handoff

```bash
./scripts/agent-handoff.sh load \
    <agent_id> \
    <handoff_file>
```

### List Handoffs

```bash
./scripts/agent-handoff.sh list
```

---

## Goal Tracking

### Set Goal

```bash
python runtime/goal_tracking.py \
    --agent-id my-agent \
    --set-goal "Implement memory architecture"
```

### Create Plan

```bash
python runtime/goal_tracking.py \
    --agent-id my-agent \
    --create-plan "Phase 1: Foundation" \
    --add-action "Update config.yaml" \
    --add-action "Create token-count utility"
```

### Check Progress

```bash
# Get status
python runtime/goal_tracking.py \
    --agent-id my-agent \
    --status

# Get next action
python runtime/goal_tracking.py \
    --agent-id my-agent \
    --next-action
```

---

## Knowledge Graph

### Add Entity

```bash
python runtime/knowledge_graph.py add-entity \
    --type "decision" \
    --name "Use PostgreSQL" \
    --description "Selected PostgreSQL for primary database"
```

### Add Relationship

```bash
python runtime/knowledge_graph.py add-rel \
    --from DEC-12345678 \
    --to DEC-87654321 \
    --rel-type "depends_on"
```

### Query Graph

```bash
# Find dependencies
python runtime/knowledge_graph.py deps \
    --from DEC-12345678

# Get statistics
python runtime/knowledge_graph.py stats
```

---

## Configuration

Memory architecture settings in `config/config.yaml`:

```yaml
memory:
  tiers:
    working:
      paths: ["agents/.plans/{active_plan}/context/"]
      max_size_mb: 10
      retention: "session"
    extended:
      paths: ["data/decisions/", "data/context/"]
      max_size_mb: 500
      retention: "permanent"
  management:
    auto_compact: true
    compact_threshold_tokens: 50000
  semantic_search:
    enabled: true
    vector_db_path: "modules/research/vector-db"
```

---

## Best Practices

### For Token Management
1. Monitor token counts before adding large content
2. Structure files with clear headings for compaction
3. Always include final summaries
4. Archive completed work regularly

### For Semantic Search
1. Rebuild index after adding important content
2. Use natural language queries
3. Check multiple results, not just the first
4. Combine with grep for exact matches

### For Multi-Agent Work
1. Always register/unregister agents
2. Update shared state regularly
3. Use formal handoffs between agents
4. Check activity logs to understand context

---

## Troubleshooting

### High Token Count
```bash
# Find large files
./scripts/utils/token-count.py --find-large data/

# Compact them
./scripts/auto-compact.sh data/context
```

### Semantic Search Not Finding Results
```bash
# Rebuild index
./scripts/build-semantic-index.sh --force
```

### Shared Memory Out of Sync
```bash
# Check state
python runtime/shared_memory.py --agent-id my-agent --get-state
```

---

## Testing

Run integration tests:

```bash
./tests/integration/test-memory-architecture.sh
```

Expected output:
```
=== Test Summary ===
Passed: 13
Failed: 0
Total: 13

All tests passed!
```

---

## File Reference

| File | Purpose |
|------|---------|
| `scripts/utils/token-count.py` | Token counting utility |
| `scripts/auto-compact.sh` | Auto-compaction script |
| `scripts/manage-memory-tiers.sh` | Memory tier management |
| `scripts/build-semantic-index.sh` | Build search index |
| `scripts/agent-handoff.sh` | Agent handoff workflow |
| `modules/research/semantic_search.py` | Semantic search engine |
| `runtime/shared_memory.py` | Multi-agent coordination |
| `runtime/knowledge_graph.py` | Entity relationship graph |
| `runtime/goal_tracking.py` | Goal tracking framework |

---

## Dependencies

```bash
pip install -r modules/research/requirements.txt
```

Required:
- `chromadb>=0.4.0` - Vector database
- `sentence-transformers>=2.2.0` - Text embeddings
- `tiktoken` - Token counting
- `networkx` - Knowledge graph

---

**Built for Blackbox3 v3.0**
