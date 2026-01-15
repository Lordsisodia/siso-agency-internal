# ADR-002: Three-Tier Memory System

**Status:** Accepted
**Date:** 2026-01-15
**Decision Makers:** Blackbox4 Team
**Technical Story:**

## Context

AI agents need memory for:
- **Current context**: Active conversation/session
- **Project knowledge**: Medium-term information
- **Historical records**: Long-term archives

Existing approaches:
- **Single memory file**: Doesn't scale
- **Flat directory**: No organization
- **Pure event sourcing**: Expensive queries

## Decision

Implement **three-tier memory system**:

```
.memory/
├── working/      # 10MB - Hot, fast access
│   ├── current-session.md
│   └── compact/
├── extended/     # 500MB - Semantic search
│   ├── chroma-db/          # Vector embeddings
│   └── entities.json       # Knowledge graph
└── archival/     # 5GB - Cold storage
    ├── sessions/
    └── projects/
```

**Tiers:**

1. **Working Memory** (10MB)
   - Active session only
   - Direct file access
   - Auto-compacts when full

2. **Extended Memory** (500MB)
   - ChromaDB vector embeddings
   - Semantic search
   - Knowledge graph
   - Project-wide context

3. **Archival Memory** (5GB)
   - Historical sessions
   - Completed projects
   - Cold storage
   - Reference only

## Status

**Accepted** - Implemented with ChromaDB integration

## Consequences

### Positive

- **Performance optimized**: Hot/warm/cold tiers
- **Cost effective**: Don't search everything
- **Scalable**: Each tier has clear limits
- **Semantic search**: Vector embeddings for extended memory
- **Automatic management**: Auto-compaction, archiving

### Negative

- **Complexity**: More moving parts
- **Dependency**: Requires ChromaDB for extended memory
- **Data migration**: Moving data between tiers
- **Size limits**: Need to monitor tier sizes

## Alternatives Considered

1. **Single memory file** - Doesn't scale
2. **Pure event sourcing** - Expensive queries, no semantic search
3. **Unlimited flat storage** - Performance degrades

## Implementation

- Working memory: `.memory/working/current-session.md`
- Extended memory: ChromaDB at `.memory/extended/chroma-db/`
- Archival memory: `.memory/archival/`

**Auto-compaction:**
```bash
# When working memory exceeds 8MB
./4-scripts/compact-memory.sh
```

**Semantic search:**
```python
# Query extended memory
results = chroma_db.query(
    query_texts=["user authentication"],
    n_results=5
)
```

## Future Enhancements

- [ ] Automated archival based on age
- [ ] Tier-aware search routing
- [ ] Compression for archival storage
- [ ] Distributed extended memory

## See Also

- [Memory Architecture](../../3-components/memory/)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [ADR-004](./004-glass-box-orchestration.md) - Memory in system space
