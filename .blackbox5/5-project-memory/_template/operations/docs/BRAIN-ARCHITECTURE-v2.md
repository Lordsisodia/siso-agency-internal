# Blackbox4 Brain Architecture v2.0

**Last Updated:** 2026-01-15
**Status:** Design Specification

---

## Problem Statement

**v1 Problem:** Documentation-based approach fails because:
- ❌ Human-readable, not machine-queryable
- ❌ Static, requires manual updates
- ❌ No relationships between items
- ❌ High maintenance burden
- ❌ Can't answer complex queries

**v2 Solution:** Machine-native, queryable, intelligent brain

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  BLACKBOX4 BRAIN v2.0                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FILE SYSTEM (Storage Layer)                                 │
│  ├── Every artifact has metadata.yaml                       │
│  └── Files watched/indexed automatically                    │
│           ↓                                                  │
│  METADATA EXTRACTION (Ingestion Layer)                      │
│  ├── Parse metadata.yaml from each file                    │
│  ├── Extract embeddings (text-embedding-3-small)            │
│  ├── Extract relationships (imports, references)            │
│  └── Update all databases                                   │
│           ↓                                                  │
│  QUERY LAYER (Multiple Query Engines)                       │
│  ├── PostgreSQL (structured queries)                       │
│  │   ├── Exact match: "Find all agents of type specialist" │
│  │   ├── Filters: "Find all skills created after 2025"     │
│  │   └── Aggregations: "Count agents by category"         │
│  ├── Neo4j (graph queries)                                 │
│  │   ├── Relationships: "What uses this library?"         │
│  │   ├── Traversals: "Find all dependencies of X"         │
│  │   ├── Impact: "What breaks if I change X?"             │
│  │   └── Paths: "Shortest path from A to B"              │
│  └── pgvector (semantic search)                            │
│      ├── Similarity: "Find agents similar to orchestrator"│
│      ├── Semantic: "Find documentation about testing"     │
│      └── Fuzzy: "Find things like 'task management'"      │
│           ↓                                                  │
│  AI INTERFACE (Query API)                                   │
│  └── Natural language → Structured queries                 │
│      "Where should I put a new specialist agent?"          │
│        → Parses intent → Routes to appropriate DB         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Metadata Schema (Foundation)

### metadata.yaml Specification

Every artifact (agent, skill, library, etc.) MUST have a `metadata.yaml` file:

```yaml
# metadata.yaml - Required for all artifacts

# Core Identification
id: "unique-id"
type: "agent"  # agent|skill|plan|library|script|template|document|test|config|module|framework|tool|workspace|example
name: "orchestrator"
category: "specialist"  # Varies by type
version: "1.0.0"

# Location
path: "1-agents/4-specialists/orchestrator.md"
created: "2026-01-15"
modified: "2026-01-15"

# Content
description: "Main orchestrator agent for coordinating other agents"
tags: ["orchestration", "coordination", "agent-handoff"]
keywords: ["orchestrate", "coordinate", "delegate", "multi-agent"]

# Relationships
depends_on:
  - id: "deep-research-skill"
    type: "skill"
  - id: "agent-handoff-script"
    type: "script"

used_by:
  - id: "ralph-agent"
    type: "agent"

relates_to:
  - id: "ralph-runtime"
    type: "library"
    relationship: "uses"

# Classification
phase: 4  # Phase 1-4, null if not phase-related
layer: "intelligence"  # intelligence|execution|testing|documentation|system

# AI/Discovery
embedding_id: "emb-orchestrator-123"  # Reference to embedding vector
search_vector: [0.1, 0.2, ...]  # Optional: inline embedding

# Status
status: "active"  # active|deprecated|archived|experimental
stability: "high"  # high|medium|low

# Ownership
owner: "core-team"
maintainer: "ai-system"

# Documentation
docs:
  primary: ".docs/2-reference/agents.md#orchestrator"
  examples: "1-agents/4-specialists/orchestrator-examples/"
  api: ".docs/2-reference/agents-api.md"

# Metrics (optional)
usage_count: 150
last_used: "2026-01-15"
success_rate: 0.95
```

### File Placement

```
artifact-name/
├── metadata.yaml          ← REQUIRED
├── artifact.md            (or .py, .sh, etc.)
├── examples/              (if applicable)
│   └── metadata.yaml      ← REQUIRED (examples metadata)
└── tests/                 (if applicable)
    └── metadata.yaml      ← REQUIRED (tests metadata)
```

---

## Phase 2: SQLite + Ripgrep (Quick Start)

### PostgreSQL Schema (Structured Queries)

```sql
-- Artifacts table
CREATE TABLE artifacts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    category TEXT,
    name TEXT NOT NULL,
    path TEXT UNIQUE NOT NULL,
    description TEXT,
    tags TEXT[],
    keywords TEXT[],
    created TIMESTAMP,
    modified TIMESTAMP,
    phase INTEGER,
    layer TEXT,
    status TEXT,
    stability TEXT,
    owner TEXT,
    maintainer TEXT,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP,
    success_rate FLOAT
);

-- Relationships table
CREATE TABLE relationships (
    from_id TEXT NOT NULL,
    to_id TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    strength FLOAT DEFAULT 1.0,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (from_id, to_id, relationship_type),
    FOREIGN KEY (from_id) REFERENCES artifacts(id),
    FOREIGN KEY (to_id) REFERENCES artifacts(id)
);

-- Embeddings table (pgvector)
CREATE TABLE embeddings (
    artifact_id TEXT PRIMARY KEY,
    vector vector(1536),  -- OpenAI embedding size
    FOREIGN KEY (artifact_id) REFERENCES artifacts(id)
);

-- Indexes for performance
CREATE INDEX idx_artifacts_type ON artifacts(type);
CREATE INDEX idx_artifacts_category ON artifacts(category);
CREATE INDEX idx_artifacts_phase ON artifacts(phase);
CREATE INDEX idx_artifacts_layer ON artifacts(layer);
CREATE INDEX idx_artifacts_tags ON artifacts USING GIN(tags);
CREATE INDEX idx_artifacts_keywords ON artifacts USING GIN(keywords);
CREATE INDEX idx_relationships_from ON relationships(from_id);
CREATE INDEX idx_relationships_to ON relationships(to_id);
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat(vector vector_cosine_ops);
```

### Query Examples

**Structured Queries (PostgreSQL):**

```sql
-- Find all specialist agents
SELECT name, path, description
FROM artifacts
WHERE type = 'agent' AND category = 'specialist' AND status = 'active';

-- Find all Phase 4 artifacts
SELECT type, category, COUNT(*)
FROM artifacts
WHERE phase = 4
GROUP BY type, category;

-- Find unused artifacts (not used in >30 days)
SELECT name, path, last_used
FROM artifacts
WHERE last_used < CURRENT_DATE - INTERVAL '30 days';

-- Find agents by tag
SELECT name, path
FROM artifacts
WHERE type = 'agent' AND 'orchestration' = ANY(tags);

-- Find what depends on a library
SELECT a.name, a.path, r.relationship_type
FROM artifacts a
JOIN relationships r ON r.from_id = a.id
WHERE r.to_id = 'ralph-runtime';
```

**Graph Queries (Neo4j - Cypher):**

```cypher
-- Find all dependencies of an agent
MATCH (a:Artifact {id: 'orchestrator'})-[:DEPENDS_ON*]->(dep)
RETURN dep.name, dep.type, dep.path;

-- Find impact if I change X
MATCH (x:Artifact {id: 'ralph-runtime'})<-[:USED_BY*]-(affected)
RETURN affected.name, affected.type;

-- Find shortest path between two artifacts
MATCH path = shortestPath(
  (a:Artifact {id: 'agent-a'})-[:RELATES_TO*]-(b:Artifact {id: 'agent-b'})
)
RETURN path;

-- Find orphaned artifacts (no relationships)
MATCH (a:Artifact)
WHERE NOT (a)-[:RELATES_TO]-()
RETURN a.name, a.type;
```

**Semantic Search (pgvector):**

```sql
-- Find similar artifacts by description
SELECT a.name, a.path, a.description,
       1 - (e.vector <=> '[query_vector]') as similarity
FROM artifacts a
JOIN embeddings e ON e.artifact_id = a.id
ORDER BY e.vector <=> '[query_vector]'
LIMIT 10;

-- Hybrid: semantic + filters
SELECT a.name, a.path, a.description,
       1 - (e.vector <=> '[query_vector]') as similarity
FROM artifacts a
JOIN embeddings e ON e.artifact_id = a.id
WHERE a.type = 'agent' AND a.status = 'active'
ORDER BY e.vector <=> '[query_vector]'
LIMIT 10;
```

---

## Phase 3: Natural Language Interface

### AI Query Parser

Convert natural language to structured queries:

```python
# Pseudocode for AI query parser
class BrainQuery:
    def parse(self, query: str):
        intent = self.detect_intent(query)

        if intent == "placement":
            return self.parse_placement(query)
        elif intent == "discovery":
            return self.parse_discovery(query)
        elif intent == "relationship":
            return self.parse_relationship(query)
        elif intent == "semantic":
            return self.parse_semantic(query)

    def parse_placement(self, query):
        # "Where should I put a new specialist agent?"
        # → INSERT INTO artifacts ... RETURN path

        # Extract type and category
        type_match = re.search(r'(agent|skill|library|...)', query)
        category_match = re.search(r'(specialist|core|bmad|...)', query)

        # Query placement rules
        result = db.execute("""
            SELECT path
            FROM artifacts
            WHERE type = %s AND category = %s
            LIMIT 1
        """, (type_match, category_match))

        return f"Place at: {result['path']}"

    def parse_relationship(self, query):
        # "What uses the ralph-runtime library?"
        # → MATCH (ralph)<-[:USED_BY]-(x) RETURN x

        # Extract subject
        subject = self.extract_entity(query)

        # Query graph database
        result = neo4j.execute("""
            MATCH (subject:Artifact {name: $subject})<-[:USED_BY]-(user)
            RETURN user.name, user.type, user.path
        """, {"subject": subject})

        return self.format_results(result)

    def parse_semantic(self, query):
        # "Find agents similar to orchestrator"
        # → SELECT ... ORDER BY vector <=> [query_vector]

        # Get query embedding
        query_embedding = openai.embed(query)

        # Semantic search
        result = db.execute("""
            SELECT a.name, a.path,
                   1 - (e.vector <=> %s) as similarity
            FROM artifacts a
            JOIN embeddings e ON e.artifact_id = a.id
            WHERE a.type = 'agent'
            ORDER BY e.vector <=> %s
            LIMIT 10
        """, (query_embedding, query_embedding))

        return self.format_results(result)
```

---

## Phase 4: Automatic Indexing

### File Watcher + Auto-Update

```python
# Pseudocode for automatic indexing
import asyncio
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class BrainIndexer(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return

        # Parse metadata.yaml
        metadata = self.parse_metadata(event.src_path)

        # Insert into PostgreSQL
        self.db.insert('artifacts', metadata)

        # Create embedding
        embedding = self.create_embedding(metadata['description'])
        self.db.insert('embeddings', {
            'artifact_id': metadata['id'],
            'vector': embedding
        })

        # Extract relationships
        relationships = self.extract_relationships(event.src_path)
        for rel in relationships:
            self.db.insert('relationships', rel)

    def on_modified(self, event):
        # Update existing records
        self.on_created(event)  # Same logic, just updates

    def on_deleted(self, event):
        # Mark as deleted or remove
        self.db.execute("DELETE FROM artifacts WHERE path = %s",
                       (event.src_path,))

# Start file watcher
observer = Observer()
observer.schedule(BrainIndexer(), path='.', recursive=True)
observer.start()
```

---

## Implementation Roadmap

### Week 1: Metadata Schema
- [ ] Define complete metadata.yaml specification
- [ ] Create metadata.yaml for all existing artifacts
- [ ] Create metadata validation script
- [ ] Add metadata.yaml to all templates

### Week 2: PostgreSQL + Basic Queries
- [ ] Set up PostgreSQL with pgvector
- [ ] Create schema (artifacts, relationships, embeddings)
- [ ] Build metadata parser/ingester
- [ ] Create basic query interface
- [ ] Implement structured queries

### Week 3: Neo4j + Relationship Queries
- [ ] Set up Neo4j
- [ ] Build relationship extractor
- [ ] Implement graph queries
- [ ] Create relationship visualization

### Week 4: Embeddings + Semantic Search
- [ ] Set up OpenAI embeddings (or local model)
- [ ] Generate embeddings for all artifacts
- [ ] Implement semantic search
- [ ] Create hybrid queries (semantic + filters)

### Week 5: Natural Language Interface
- [ ] Build query parser
- [ ] Implement intent detection
- [ ] Create natural language interface
- [ ] Integrate with AI agents

### Week 6: Auto-Indexing
- [ ] Implement file watcher
- [ ] Auto-update on file changes
- [ ] Incremental embedding updates
- [ ] Performance optimization

---

## Comparison: v1 vs v2

| Aspect | v1 (Documentation) | v2 (Machine-Native) |
|--------|-------------------|---------------------|
| **Query** | Manual search | SQL/Cypher/Semantic |
| **Updates** | Manual editing | Automatic indexing |
| **Relationships** | Implied | Explicit graph |
| **Discovery** | Keyword search | Semantic similarity |
| **Scalability** | ~1000 items | ~1M+ items |
| **Maintenance** | High (manual) | Low (automatic) |
| **AI Integration** | Read docs | Query databases |

---

## Query Examples

### For AI Agents

**Placement:**
```
AI: "Where should I put a new specialist agent for data analysis?"
Brain:
  1. Parse: type=agent, category=specialist, domain=data
  2. Query: SELECT path FROM artifacts WHERE type='agent' AND category='specialist' LIMIT 1
  3. Result: "1-agents/4-specialists/"
  4. Answer: "Place at: 1-agents/4-specialists/data-analyst.md"
```

**Discovery:**
```
AI: "Find all libraries related to task management"
Brain:
  1. Parse: domain=task, type=library
  2. Semantic search: ORDER BY vector <=> [task_management_embedding]
  3. Filter: WHERE type='library'
  4. Answer: Returns ranked list with similarity scores
```

**Relationships:**
```
AI: "What will break if I modify the orchestrator agent?"
Brain:
  1. Parse: entity=orchestrator, query=impact
  2. Graph query: MATCH (o)<-[:DEPENDS_ON*]-(affected) RETURN affected
  3. Answer: Returns dependency tree
```

**Similarity:**
```
AI: "Find agents similar to the orchestrator"
Brain:
  1. Parse: entity=orchestrator, query=similar
  2. Semantic search: ORDER BY vector <=> orchestrator_embedding
  3. Answer: Returns similar agents with scores
```

---

## Tech Stack

### Required

- **PostgreSQL 15+** with **pgvector** extension
- **Neo4j 5+** (Community Edition OK)
- **Python 3.9+** with:
  - `asyncpg` (PostgreSQL async)
  - `neo4j` (Neo4j driver)
  - `watchdog` (file watching)
  - `openai` (embeddings) or `sentence-transformers` (local)
  - `pyyaml` (metadata parsing)

### Optional (Local Embeddings)

- **sentence-transformers** - Local embeddings (no API needed)
- **all-MiniLM-L6-v2** - Fast, good quality
- **text-embedding-3-small** - OpenAI (better, API required)

---

## File Structure

```
.blackbox4/
├── 9-brain/                          ← NEW: Brain system
│   ├── metadata/                      ← Metadata specs
│   │   ├── schema.yaml                ← Complete schema
│   │   └── examples/                  ← Example metadata files
│   ├── ingest/                        ← Ingestion scripts
│   │   ├── parser.py                  ← Parse metadata.yaml
│   │   ├── indexer.py                 ← Build/update indexes
│   │   └── watcher.py                 ← File watcher
│   ├── query/                         ← Query interface
│   │   ├── parser.py                  ← Natural language parser
│   │   ├── sql.py                     ← PostgreSQL queries
│   │   ├── graph.py                   ← Neo4j queries
│   │   └── vector.py                  ← Vector search
│   ├── databases/                     ← Database configs
│   │   ├── postgresql/                 ← PostgreSQL setup
│   │   ├── neo4j/                     ← Neo4j setup
│   │   └── init.sql                   ← Schema initialization
│   ├── api/                           ← Query API
│   │   └── brain_api.py               ← Main API
│   └── tests/                         ← Tests
│       └── test_brain.py              ← Brain tests
│
├── [existing directories...]
```

---

## Success Metrics

- ✅ AI can place items correctly: >95% accuracy
- ✅ AI can find anything: <1 second query time
- ✅ AI can reason about relationships: Graph queries work
- ✅ Auto-indexing: Updates in <5 seconds after file change
- ✅ Semantic search: Relevant results in top 5
- ✅ Scalability: Handles 10,000+ artifacts
- ✅ Maintenance: Minimal manual updates required

---

## Next Steps

1. **Review this design** - Does this address your needs?
2. **Choose priority** - Start with metadata? PostgreSQL? Full stack?
3. **Create implementation plan** - Break into phases
4. **Begin implementation** - Start with Week 1 (metadata schema)

---

**Status:** Design Complete
**Version:** 2.0.0
**Last Updated:** 2026-01-15
**Maintainer:** Blackbox4 Core Team
