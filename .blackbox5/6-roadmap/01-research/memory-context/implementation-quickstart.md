# Agent Memory Implementation Quickstart

**Companion to**: [Iterative Research Findings](./iterative-research-findings.md)
**Purpose**: Actionable implementation guide for BlackBox5
**Last Updated**: 2025-01-19

---

## TL;DR - What to Build First

### Week 1-2: Foundation (DO THIS FIRST)
```python
# 1. Three-tier storage
Tier 1: Recent messages (PostgreSQL, last 50)
Tier 2: Summaries (PostgreSQL, last 10 consolidation cycles)
Tier 3: Long-term (PostgreSQL + pgvector)

# 2. Basic retrieval
Vector similarity + metadata filters (time, importance)

# 3. Simple consolidation
Every 10 messages → LLM summarization → store in Tier 2
```

### Week 3-4: Enhancement
```python
# 1. Importance scoring
importance = 0.4 * recency + 0.3 * frequency + 0.2 * semantic + 0.1 * user

# 2. Compression
Summarize raw messages → keep metadata (timestamp, entities, topics)

# 3. Basic analytics
Track memory growth, retrieval patterns, consolidation quality
```

---

## Tech Stack Recommendations

### Storage Backend
**Start with**: PostgreSQL 16+ with pgvector extension
**Why**: Single database, ACID guarantees, mature ecosystem
**Migrate to**: Pinecone or Qdrant when > 1M vectors

### Vector Database
**Start with**: pgvector (built into PostgreSQL)
**Why**: Zero additional infrastructure, good enough for < 1M vectors
**Migrate to**: Dedicated vector DB when needed

### Embedding Model
**Start with**: OpenAI text-embedding-3-small
- Cost: $0.02 per 1M tokens
- Dimensions: 1536
- Performance: Good enough for most use cases
**Upgrade to**: text-embedding-3-large or fine-tuned model if needed

### LLM for Consolidation
**Start with**: GPT-4o-mini
- Cost: $0.15 per 1M input tokens, $0.60 per 1M output tokens
- Speed: Fast
- Quality: Good for summarization
**Upgrade to**: GPT-4o for critical consolidations

---

## Data Model

### Core Tables

```sql
-- Memory store (all memories)
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    user_id UUID,
    tier TEXT NOT NULL CHECK (tier IN ('buffer', 'summary', 'longterm')),

    -- Content
    content TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('message', 'summary', 'reflection')),

    -- Vector (for semantic search)
    embedding vector(1536),

    -- Metadata
    importance_score FLOAT DEFAULT 0.5,
    access_count INT DEFAULT 0,
    last_accessed_at TIMESTAMP,

    -- Temporal
    created_at TIMESTAMP DEFAULT NOW(),
    consolidated_at TIMESTAMP,

    -- Relationships
    parent_memory_id UUID REFERENCES memories(id),
    conversation_id UUID,
    message_ids JSONB, -- Array of source message IDs

    -- Indexes
    INDEX idx_memories_agent_tier (agent_id, tier),
    INDEX idx_memories_importance (importance_score DESC),
    INDEX idx_memories_created (created_at DESC)
);

-- For vector search
CREATE INDEX idx_memories_embedding ON memories
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Conversations (for grouping)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    user_id UUID,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    message_count INT DEFAULT 0,

    -- Consolidation tracking
    last_consolidation_at TIMESTAMP,
    consolidation_count INT DEFAULT 0,

    INDEX idx_conversations_agent (agent_id),
    INDEX idx_conversations_user (user_id)
);

-- Memory access log (for analytics)
CREATE TABLE memory_accesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID REFERENCES memories(id),
    access_type TEXT NOT NULL, -- 'retrieval', 'consolidation', 'manual'
    context JSONB,
    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_accesses_memory (memory_id),
    INDEX idx_accesses_created (created_at DESC)
);
```

---

## Core Algorithms

### 1. Importance Scoring

```python
import math
from datetime import datetime, timedelta

def calculate_importance(memory: Memory, context: dict) -> float:
    """Calculate memory importance score (0-1)"""

    # 1. Recency score (exponential decay)
    time_since_access = (datetime.now() - memory.last_accessed_at).total_seconds()
    decay_lambda = 0.1  # Adjust for decay rate
    recency_score = math.exp(-decay_lambda * time_since_access / 3600)  # Hours

    # 2. Access frequency score
    # Normalize: 0 accesses → 0, 10+ accesses → 1
    frequency_score = min(memory.access_count / 10.0, 1.0)

    # 3. Semantic importance score
    semantic_score = calculate_semantic_importance(memory.content)

    # 4. User feedback score (if provided)
    user_score = memory.user_boost if memory.user_boost else 0.5

    # Weighted combination
    importance = (
        0.4 * recency_score +
        0.3 * frequency_score +
        0.2 * semantic_score +
        0.1 * user_score
    )

    return min(max(importance, 0.0), 1.0)

def calculate_semantic_importance(content: str) -> float:
    """Rule-based semantic importance"""
    score = 0.0

    # Has entities (names, places, etc.)
    if has_entities(content):
        score += 0.3

    # Is question
    if '?' in content:
        score += 0.2

    # Has strong sentiment
    if has_strong_sentiment(content):
        score += 0.2

    # Contains task/action
    if has_task_keywords(content):
        score += 0.2

    # Length (prefer medium length)
    word_count = len(content.split())
    if 10 <= word_count <= 100:
        score += 0.1

    return min(score, 1.0)
```

### 2. Hybrid Search

```python
from typing import List
import numpy as np

async def search_memories(
    query: str,
    agent_id: str,
    limit: int = 10,
    filters: dict = None
) -> List[Memory]:
    """Hybrid search: vector + metadata filtering"""

    # 1. Generate query embedding
    query_embedding = await generate_embedding(query)

    # 2. Build SQL query with filters
    sql = """
        SELECT
            id, content, importance_score,
            1 - (embedding <=> $1::vector) as similarity
        FROM memories
        WHERE agent_id = $2
          AND tier = 'longterm'
    """

    params = [query_embedding, agent_id]

    # 3. Add metadata filters
    if filters:
        if filters.get('min_importance'):
            sql += " AND importance_score >= $" + str(len(params) + 1)
            params.append(filters['min_importance'])

        if filters.get('max_age_hours'):
            sql += " AND created_at >= NOW() - ($" + str(len(params) + 1) + " * INTERVAL '1 hour')"
            params.append(filters['max_age_hours'])

        if filters.get('content_type'):
            sql += " AND content_type = $" + str(len(params) + 1)
            params.append(filters['content_type'])

    # 4. Order by similarity and importance
    sql += " ORDER BY similarity DESC, importance_score DESC"

    # 5. Limit
    sql += " LIMIT $" + str(len(params) + 1)
    params.append(limit * 3)  # Get more for reranking

    # 6. Execute
    results = await db.execute(sql, params)

    # 7. Rerank (optional, for precision)
    if len(results) > limit:
        results = await rerank_results(query, results, limit)

    return results[:limit]

async def rerank_results(
    query: str,
    results: List[dict],
    limit: int
) -> List[dict]:
    """Rerank using cross-encoder or LLM"""

    # Simple approach: use LLM to score relevance
    scores = []
    for result in results:
        score = await score_relevance(query, result['content'])
        scores.append(score)

    # Sort by reranked scores
    indexed = list(enumerate(results))
    indexed.sort(key=lambda x: scores[x[0]], reverse=True)

    return [r for i, r in indexed[:limit]]
```

### 3. Consolidation

```python
from datetime import datetime

async def consolidate_conversation(conversation_id: str) -> dict:
    """Consolidate conversation into summary"""

    # 1. Get recent messages (Tier 1)
    messages = await db.execute("""
        SELECT content, created_at
        FROM memories
        WHERE conversation_id = $1
          AND tier = 'buffer'
        ORDER BY created_at ASC
        LIMIT 50
    """, [conversation_id])

    if len(messages) < 10:
        return {"status": "skipped", "reason": "too_few_messages"}

    # 2. Generate summary using LLM
    prompt = f"""
    Summarize the following conversation into key points:
    {format_messages(messages)}

    Include:
    - Main topics discussed
    - Decisions made
    - Action items
    - Important entities (people, places, dates)

    Be concise but preserve important details.
    """

    summary = await llm_complete(prompt, model="gpt-4o-mini")

    # 3. Extract entities (optional, for graph)
    entities = await extract_entities(messages)

    # 4. Create summary memory (Tier 2)
    summary_memory = await db.execute("""
        INSERT INTO memories (
            agent_id, user_id, tier,
            content, content_type,
            embedding, importance_score,
            conversation_id, message_ids
        )
        VALUES ($1, $2, 'summary', $3, 'summary',
                $4, $5, $6, $7)
        RETURNING *
    """, [
        agent_id, user_id,
        summary,
        await generate_embedding(summary),
        0.7,  # Summaries get higher importance
        conversation_id,
        [m['id'] for m in messages]
    ])

    # 5. Mark source messages for deletion (or archive)
    await db.execute("""
        UPDATE memories
        SET tier = 'archived'
        WHERE id = ANY($1)
    """, [[m['id'] for m in messages]])

    # 6. Update conversation
    await db.execute("""
        UPDATE conversations
        SET consolidation_count = consolidation_count + 1,
            last_consolidation_at = NOW()
        WHERE id = $1
    """, [conversation_id])

    return {
        "status": "success",
        "summary_memory_id": summary_memory['id'],
        "messages_consolidated": len(messages)
    }

# Schedule: Run every 10 messages or 10 minutes
async def consolidation_worker():
    """Background worker for consolidation"""

    while True:
        # Find conversations needing consolidation
        conversations = await db.execute("""
            SELECT c.id, c.message_count,
                   COUNT(m.id) as buffer_count
            FROM conversations c
            LEFT JOIN memories m ON m.conversation_id = c.id AND m.tier = 'buffer'
            WHERE c.ended_at IS NULL  -- Active conversations
              OR c.ended_at > NOW() - INTERVAL '1 hour'  -- Recent ended
            GROUP BY c.id, c.message_count
            HAVING COUNT(m.id) >= 10  # Need 10+ messages
            ORDER BY c.last_consolidation_at ASC NULLS FIRST
            LIMIT 10
        """)

        for conv in conversations:
            try:
                await consolidate_conversation(conv['id'])
            except Exception as e:
                logger.error(f"Consolidation failed for {conv['id']}: {e}")

        # Sleep
        await asyncio.sleep(60)  # Check every minute
```

### 4. Retrieval

```python
async def retrieve_context(
    query: str,
    agent_id: str,
    max_tokens: int = 4000
) -> dict:
    """Retrieve relevant context within token limit"""

    context = {
        "buffer": [],
        "summaries": [],
        "longterm": [],
        "tokens_used": 0
    }

    # 1. Get recent buffer memories (highest priority)
    buffer_memories = await db.execute("""
        SELECT content, created_at
        FROM memories
        WHERE agent_id = $1 AND tier = 'buffer'
        ORDER BY created_at DESC
        LIMIT 20
    """, [agent_id])

    for mem in buffer_memories:
        tokens = count_tokens(mem['content'])
        if context["tokens_used"] + tokens > max_tokens:
            break
        context["buffer"].append(mem)
        context["tokens_used"] += tokens

    # 2. Get summaries if space remains
    if context["tokens_used"] < max_tokens * 0.7:
        summary_memories = await db.execute("""
            SELECT content, created_at
            FROM memories
            WHERE agent_id = $1 AND tier = 'summary'
            ORDER BY created_at DESC
            LIMIT 5
        """, [agent_id])

        for mem in summary_memories:
            tokens = count_tokens(mem['content'])
            if context["tokens_used"] + tokens > max_tokens:
                break
            context["summaries"].append(mem)
            context["tokens_used"] += tokens

    # 3. Search long-term if space remains
    if context["tokens_used"] < max_tokens * 0.8:
        longterm_memories = await search_memories(
            query=query,
            agent_id=agent_id,
            limit=5,
            filters={"min_importance": 0.6}
        )

        for mem in longterm_memories:
            tokens = count_tokens(mem['content'])
            if context["tokens_used"] + tokens > max_tokens:
                break
            context["longterm"].append(mem)
            context["tokens_used"] += tokens

    return context

def format_context(context: dict) -> str:
    """Format context for LLM prompt"""

    parts = []

    if context["buffer"]:
        parts.append("## Recent Messages")
        parts.extend([m['content'] for m in context["buffer"]])

    if context["summaries"]:
        parts.append("\n## Previous Topics")
        parts.extend([m['content'] for m in context["summaries"]])

    if context["longterm"]:
        parts.append("\n## Relevant Information")
        parts.extend([m['content'] for m in context["longterm"]])

    return "\n".join(parts)
```

---

## Testing Strategy

### Unit Tests

```python
import pytest

@pytest.mark.asyncio
async def test_importance_scoring():
    """Test importance scoring calculation"""

    # Recent memory should have high recency score
    recent = Memory(created_at=datetime.now(), access_count=5)
    score = calculate_importance(recent, {})
    assert score > 0.7

    # Old memory should have low recency score
    old = Memory(
        created_at=datetime.now() - timedelta(days=30),
        access_count=5
    )
    score = calculate_importance(old, {})
    assert score < 0.5

    # Frequently accessed should have high frequency score
    frequent = Memory(access_count=20)
    score = calculate_importance(frequent, {})
    assert score > 0.7

@pytest.mark.asyncio
async def test_consolidation():
    """Test conversation consolidation"""

    # Create test conversation
    conv_id = await create_conversation(messages=15)

    # Run consolidation
    result = await consolidate_conversation(conv_id)

    # Verify
    assert result["status"] == "success"
    assert result["messages_consolidated"] == 15

    # Check summary created
    summaries = await db.execute(
        "SELECT * FROM memories WHERE conversation_id = $1 AND tier = 'summary'",
        [conv_id]
    )
    assert len(summaries) == 1

@pytest.mark.asyncio
async def test_retrieval():
    """Test memory retrieval"""

    # Create test memories
    await create_test_memories(agent_id="test-agent")

    # Search
    results = await search_memories(
        query="project deadline",
        agent_id="test-agent",
        limit=5
    )

    # Verify
    assert len(results) <= 5
    assert all(r['similarity'] > 0.5 for r in results)
```

### Integration Tests

```python
@pytest.mark.asyncio
async def test_end_to_end_memory():
    """Test complete memory workflow"""

    # 1. Create conversation
    conv = await create_conversation()

    # 2. Add messages
    for i in range(12):
        await add_message(conv['id'], f"Message {i}")

    # 3. Trigger consolidation
    result = await consolidate_conversation(conv['id'])
    assert result["status"] == "success"

    # 4. Search for context
    context = await retrieve_context(
        query="What happened?",
        agent_id=conv['agent_id']
    )

    # 5. Verify results
    assert len(context["buffer"]) > 0
    assert len(context["summaries"]) > 0
    assert context["tokens_used"] < 4000
```

### Performance Tests

```python
@pytest.mark.asyncio
async def test_search_performance():
    """Test search performance under load"""

    # Create 10K memories
    await create_test_memories(count=10000)

    # Measure search time
    start = time.time()
    results = await search_memories(
        query="test query",
        agent_id="test-agent",
        limit=10
    )
    duration = time.time() - start

    # Assert p95 < 100ms
    assert duration < 0.1

@pytest.mark.asyncio
async def test_consolidation_performance():
    """Test consolidation performance"""

    # Create conversation with 100 messages
    conv = await create_conversation_with_messages(100)

    # Measure consolidation time
    start = time.time()
    result = await consolidate_conversation(conv['id'])
    duration = time.time() - start

    # Assert consolidation < 5 seconds
    assert duration < 5.0
```

---

## Monitoring & Analytics

### Key Metrics

```python
# Track these metrics

# 1. Memory growth
memory_count_tier = """
    SELECT tier, COUNT(*)
    FROM memories
    GROUP BY tier
"""

# 2. Retrieval performance
avg_search_latency = """
    SELECT
        AVG(duration) as avg_latency,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY duration) as p95
    FROM memory_accesses
    WHERE access_type = 'retrieval'
      AND created_at > NOW() - INTERVAL '1 hour'
"""

# 3. Consolidation quality
compression_ratio = """
    SELECT
        AVG(LENGTH(m1.content) / NULLIF(LENGTH(m2.content), 0)) as ratio
    FROM memories m1
    JOIN memories m2 ON m2.parent_memory_id = m1.id
    WHERE m1.tier = 'buffer' AND m2.tier = 'summary'
"""

# 4. Memory access patterns
access_distribution = """
    SELECT
        DATE_TRUNC('hour', created_at) as hour,
        COUNT(*) as access_count
    FROM memory_accesses
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY hour
    ORDER BY hour
"""

# 5. Importance score distribution
importance_distribution = """
    SELECT
        CASE
            WHEN importance_score < 0.3 THEN 'low'
            WHEN importance_score < 0.7 THEN 'medium'
            ELSE 'high'
        END as level,
        COUNT(*) as count
    FROM memories
    GROUP BY level
"""
```

### Dashboard Queries

```python
async def get_memory_stats(agent_id: str) -> dict:
    """Get memory system statistics"""

    stats = {}

    # Memory counts by tier
    stats['by_tier'] = await db.execute("""
        SELECT tier, COUNT(*), SUM(LENGTH(content)) as total_bytes
        FROM memories
        WHERE agent_id = $1
        GROUP BY tier
    """, [agent_id])

    # Recent activity
    stats['recent_activity'] = await db.execute("""
        SELECT
            DATE_TRUNC('hour', created_at) as hour,
            COUNT(*) FILTER (WHERE tier = 'buffer') as new_messages,
            COUNT(*) FILTER (WHERE tier = 'summary') as consolidations
        FROM memories
        WHERE agent_id = $1
          AND created_at > NOW() - INTERVAL '24 hours'
        GROUP BY hour
        ORDER BY hour
    """, [agent_id])

    # Retrieval performance
    stats['retrieval_perf'] = await db.execute("""
        SELECT
            AVG(duration) as avg_latency_ms,
            percentile_cont(0.95) WITHIN GROUP (ORDER BY duration) as p95_latency_ms
        FROM memory_accesses ma
        JOIN memories m ON m.id = ma.memory_id
        WHERE m.agent_id = $1
          AND ma.access_type = 'retrieval'
          AND ma.created_at > NOW() - INTERVAL '1 hour'
    """, [agent_id])

    # Storage growth
    stats['storage_growth'] = await db.execute("""
        SELECT
            DATE_TRUNC('day', created_at) as day,
            SUM(LENGTH(content)) as bytes_added
        FROM memories
        WHERE agent_id = $1
          AND created_at > NOW() - INTERVAL '30 days'
        GROUP BY day
        ORDER BY day
    """, [agent_id])

    return stats
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] PostgreSQL 16+ with pgvector extension installed
- [ ] Database schema created and indexed
- [ ] Embedding API configured (OpenAI or alternative)
- [ ] LLM API configured for consolidation
- [ ] Connection pooling configured (PgBouncer or similar)
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured

### Configuration

```python
# config.py
from pydantic import BaseModel

class MemoryConfig(BaseModel):
    # Database
    database_url: str = "postgresql://user:pass@localhost/dbname"
    pool_size: int = 20
    max_overflow: int = 10

    # Embeddings
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    embedding_batch_size: int = 100

    # LLM
    consolidation_model: str = "gpt-4o-mini"
    consolidation_temperature: float = 0.3

    # Memory
    buffer_size: int = 50  # Messages to keep in buffer
    consolidation_interval: int = 10  # Messages between consolidation
    max_context_tokens: int = 4000

    # Retrieval
    default_search_limit: int = 10
    min_importance_threshold: float = 0.5
    max_age_hours: int = 720  # 30 days

    # Scoring
    recency_decay_lambda: float = 0.1
    importance_weights: dict = {
        "recency": 0.4,
        "frequency": 0.3,
        "semantic": 0.2,
        "user": 0.1
    }
```

### Migration Path

```sql
-- Migration from simple storage to three-tier system

-- Phase 1: Add tier column
ALTER TABLE memories ADD COLUMN tier TEXT DEFAULT 'buffer';

-- Phase 2: Add embeddings
ALTER TABLE memories ADD COLUMN embedding vector(1536);
CREATE INDEX idx_memories_embedding ON memories
USING ivfflat (embedding vector_cosine_ops);

-- Phase 3: Populate embeddings (background job)
-- Run in batches to avoid timeout
UPDATE memories
SET embedding = generate_embedding(content)
WHERE embedding IS NULL
LIMIT 1000;

-- Phase 4: Add importance scoring
ALTER TABLE memories ADD COLUMN importance_score FLOAT DEFAULT 0.5;
ALTER TABLE memories ADD COLUMN access_count INT DEFAULT 0;
ALTER TABLE memories ADD COLUMN last_accessed_at TIMESTAMP;

-- Phase 5: Create consolidation tables
CREATE TABLE conversations (...); -- See schema above

-- Phase 6: Backfill conversations
INSERT INTO conversations (id, agent_id, started_at)
SELECT DISTINCT
    gen_random_uuid(),
    agent_id,
    MIN(created_at)
FROM memories
GROUP BY agent_id;
```

---

## Cost Optimization

### Embedding Costs

```python
# Batch embeddings to reduce API calls
async def batch_generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings in batches"""

    embeddings = []
    batch_size = 100  # OpenAI max is 2048

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        response = await openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=batch
        )
        embeddings.extend([e.embedding for e in response.data])

    return embeddings

# Cache embeddings for frequently accessed content
embedding_cache = LRUCache(maxsize=10000)

async def get_cached_embedding(text: str) -> List[float]:
    """Get embedding with caching"""

    cache_key = hashlib.md5(text.encode()).hexdigest()

    if cache_key in embedding_cache:
        return embedding_cache[cache_key]

    embedding = await generate_embedding(text)
    embedding_cache[cache_key] = embedding

    return embedding
```

### Storage Costs

```python
# Archive old memories to cold storage
async def archive_old_memories():
    """Move memories older than 90 days to archive"""

    await db.execute("""
        UPDATE memories
        SET tier = 'archived'
        WHERE tier = 'longterm'
          AND created_at < NOW() - INTERVAL '90 days'
          AND access_count < 5  # Rarely accessed
    """)

# Compress large content
async def compress_large_memories():
    """Compress memories larger than 10KB"""

    large_memories = await db.execute("""
        SELECT id, content
        FROM memories
        WHERE LENGTH(content) > 10000
          AND tier = 'longterm'
    """)

    for memory in large_memories:
        compressed = await compress_text(memory['content'])
        await db.execute("""
            UPDATE memories
            SET content = $1
            WHERE id = $2
        """, [compressed, memory['id']])
```

---

## Common Pitfalls

### 1. Not Measuring Retrieval Quality
**Problem**: You optimize for latency but lose relevance
**Solution**: Track both latency AND human-rated relevance

### 2. Over-Consolidating
**Problem**: Summarize too aggressively, lose important details
**Solution**: Conservative compression, keep raw data for critical convos

### 3. Ignoring Access Patterns
**Problem**: Treat all memories equally
**Solution**: Track access, prioritize frequently-used memories

### 4. No Cleanup Strategy
**Problem**: Memory grows forever, costs explode
**Solution**: Regular pruning, archiving, importance-based deletion

### 5. Poor Error Handling
**Problem**: Consolidation fails, memory system breaks
**Solution**: Retry logic, dead letter queue, alerting

### 6. No A/B Testing
**Problem**: Deploy changes, regret immediately
**Solution**: Gradual rollout, A/B testing, quick rollback

---

## Quick Reference Commands

```bash
# Database setup
createdb agent_memory
psql agent_memory -c "CREATE EXTENSION vector;"

# Run migrations
psql agent_memory < schema.sql

# Start consolidation worker
python -m memory.consolidation_worker

# Monitor performance
psql agent_memory -c "SELECT * FROM memory_stats();"

# Manual consolidation
python -m memory.consolidate --conversation-id <id>

# Search test
python -m memory.search --query "test query" --agent-id <id>

# Backup
pg_dump agent_memory > backup_$(date +%Y%m%d).sql

# Restore
psql agent_memory < backup_20250119.sql
```

---

**Next Steps**:
1. ✅ Read full research findings: [iterative-research-findings.md](./iterative-research-findings.md)
2. 🚀 Implement Phase 1 (Foundation) - Weeks 1-4
3. 📊 Set up monitoring and analytics
4. 🧪 Write comprehensive tests
5. 🚀 Gradual rollout and iteration

**Questions? Refer to**:
- [Iterative Research Findings](./iterative-research-findings.md) - Full research
- [Implementation Examples](../examples/) - Code examples
- [Testing Guide](../testing/) - Test strategies
