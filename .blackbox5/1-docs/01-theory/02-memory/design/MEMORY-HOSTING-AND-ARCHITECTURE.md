# BlackBox5 Memory Architecture - Hosting & Per-Project Structure

**Date:** 2025-01-18
**Questions Answered:**
1. Can memory run locally or do you need paid hosting?
2. How does per-project memory work?
3. What's the actual architecture?

---

## Part 1: Hosting & Costs

### 🎉 Good News: It Can Run 100% Locally!

**All memory components can run on your local machine. ZERO hosting costs.**

```
┌─────────────────────────────────────────────────────────────┐
│              BLACKBOX5 MEMORY (All Local)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🖥️ YOUR LAPTOP/DESKTOP                                   │
│  ├─ .blackbox5/engine/           # Shared engine code         │
│  ├─ .blackbox5/memory/           # SISO-INTERNAL memory      │
│  ├─ project-1/.blackbox5/memory/  # Project 1 memory        │
│  ├─ project-2/.blackbox5/memory/  # Project 2 memory        │
│  └─ project-3/.blackbox5/memory/  # Project 3 memory        │
│                                                              │
│  🗄️ LOCAL DATABASES:                                        │
│  ├─ SQLite (working memory)       # Free, built-in          │
│  ├─ ChromaDB (extended memory)    # Free, local embedding   │
│  ├─ PostgreSQL (brain)            # Free, local Docker      │
│  └─ Neo4j (brain graph)           # Free, local Docker      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 💰 Cost Breakdown

| Component | Local Option | Cloud Option | Cost |
|-----------|-------------|--------------|------|
| **Working Memory** | SQLite | Redis Cloud | **FREE** (SQLite) |
| **Extended Memory** | ChromaDB | Pinecone | **FREE** (ChromaDB) |
| **Archival Memory** | Filesystem | S3 | **FREE** (filesystem) |
| **Brain (PostgreSQL)** | Docker local | Cloud SQL | **FREE** (Docker) |
| **Brain (Neo4j)** | Docker local | AuraDB | **FREE** (Docker) |
| **GitHub CLI** | Local only | - | **FREE** |

**Total Cost for Local Development: $0**

---

## Part 2: Per-Project Memory Architecture

### 🏗️ The Structure

```
~/
├── SISO-INTERNAL/                 # Your main repo
│   ├── .blackbox5/
│   │   ├── engine/               # Shared engine (code only)
│   │   └── memory/              # SISO-INTERNAL memory (data)
│   │       ├── working/          # Active sessions
│   │       ├── extended/         # ChromaDB index
│   │       └── archival/         # Old data
│   │
│   └── src/                     # Your code
│
├── my-project-2/
│   ├── .blackbox5/
│   │   └── memory/              # Project 2 memory
│   │       ├── working/
│   │       ├── extended/
│   │       └── archival/
│   │
│   └── src/
│
└── client-website/
    ├── .blackbox5/
    │   └── memory/              # Client website memory
    │       ├── working/
    │       ├── extended/
    │       └── archival/
    │
    └── src/
```

### 🔑 Key Principles

1. **Engine is Shared** (Code Only)
   - Location: `.blackbox5/engine/`
   - Contains: Agent definitions, skills, workflows, brain system
   - This is REFERENCE CODE - not your data

2. **Memory is Per-Project** (Data Only)
   - Each project has its own `.blackbox5/memory/`
   - SISO-INTERNAL has: `SISO-INTERNAL/.blackbox5/memory/`
   - my-project-2 has: `my-project-2/.blackbox5/memory/`
   - This is YOUR DATA - specific to each project

3. **Gitignore the Data**
   ```gitignore
   # Memory data (per-project)
   .blackbox5/memory/
   ```

4. **Commit the Engine**
   - Engine code IS committed (it's shared)
   - Memory data is NOT committed (it's project-specific)

---

## Part 3: How Memory Actually Works

### 📊 The Three-Tier System

Based on BlackBox4's proven architecture:

```
TIER 1: Working Memory (10 MB)          FAST, Session-based
├─ What: Current task context, active files
├─ Backend: SQLite (embedded, fast)
├─ Location: .blackbox5/memory/working/
└─ Lifetime: Current session, auto-compacts

TIER 2: Extended Memory (500 MB)        SEARCHABLE, Semantic
├─ What: Codebase embeddings, past tasks, patterns
├─ Backend: ChromaDB (vector database)
├─ Location: .blackbox5/memory/extended/
└─ Lifetime: Project lifetime, searchable

TIER 3: Archival Memory (5 GB)          COLD STORAGE, Compressed
├─ What: Old sessions, completed tasks, snapshots
├─ Backend: Filesystem (compressed tar.gz)
├─ Location: .blackbox5/memory/archival/
└─ Lifetime: Permanent, for reference
```

### 🔄 Data Flow Example

```
1. YOU CREATE A TASK
   ├─ GitHub issue created
   └─ Local context created: memory/working/tasks/52/

2. YOU WORK ON THE TASK
   ├─ Make code changes
   ├─ Update progress.md locally
   └─ Commit to git

3. AGENT READS CONTEXT
   ├─ Reads from: memory/working/tasks/52/progress.md
   ├─ Searches: memory/extended/ (similar past tasks)
   └─ Loads patterns from brain

4. SYNC PROGRESS
   ├─ Posts structured comment to GitHub
   └─ Updates last_sync timestamp

5. TASK COMPLETED
   ├─ Stores learnings in brain (PATTERN, GOTCHA episodes)
   ├─ Compresses to: memory/archival/tasks/52.tar.gz
   └─ Removes from: memory/working/tasks/52/
```

---

## Part 4: The Brain System (Knowledge Graph)

### 🧠 What is the Brain?

The brain is a **separate system** that provides:

1. **Semantic Search** - Find related tasks, patterns, gotchas
2. **Knowledge Graph** - Understand relationships between code
3. **Persistent Learning** - Store and retrieve patterns

**Brain Location:**
```
.blackbox5/engine/brain/    # Engine code (shared)
.blackbox5/memory/brain-index/  # Project index (per-project)
```

### 🗄️ Brain Databases (Local, Free)

**PostgreSQL** (Structured data):
```bash
# Run locally with Docker
docker run -d \
  --name blackbox5-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=blackbox5_brain \
  -p 5432:5432 \
  -v ~/blackbox5-brain-data:/var/lib/postgresql \
  postgres:15
```

**Neo4j** (Knowledge graph):
```bash
# Run locally with Docker
docker run -d \
  --name blackbox5-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -v ~/blackbox5-neo4j-data:/data \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:5
```

**ChromaDB** (Vector search):
```bash
# Runs embedded in Python (no Docker needed)
pip install chromadb
# Stores in: .blackbox5/memory/extended/chroma-db/
```

**Total storage:** ~1-2 GB for all databases per project

---

## Part 5: Configuration Per Project

### 📁 SISO-INTERNAL Structure

```
SISO-INTERNAL/
├── .blackbox5/
│   ├── engine/                 # Shared code (committed)
│   │   ├── .agents/
│   │   ├── .skills/
│   │   ├── .workflows/
│   │   ├── brain/             # Brain system (committed)
│   │   └── templates/
│   │
│   └── memory/                # SISO-INTERNAL data (gitignored)
│       ├── working/           # Current session
│       ├── extended/          # ChromaDB index
│       │   └── chroma-db/    # Vector DB
│       ├── archival/          # Old data
│       └── brain-index/       # Project index
│
├── config.yml                 # Project config (committed)
├── src/                       # Your code
└── .gitignore                 # Ignore memory/
```

### 📁 my-project-2 Structure

```
my-project-2/
├── .blackbox5/
│   └── memory/                # Project 2 data (gitignored)
│       ├── working/
│       ├── extended/
│       └── archival/
│
├── config.yml                 # Different config
└── src/
```

---

## Part 6: Actual Implementation

### 🚀 How It Works in Practice

**Scenario 1: Working on SISO-INTERNAL**

```bash
cd ~/SISO-INTERNAL

# Start brain databases (one-time setup)
docker-compose -f .blackbox5/docker-compose.brain.yml up -d

# Initialize memory for this project
blackbox5 memory init

# Create a task
blackbox5 task create 52

# Work on task (agent reads from memory)
blackbox5 task work 52

# Sync progress
blackbox5 task sync 52

# Complete task
blackbox5 task complete 52
```

**Scenario 2: Working on Different Project**

```bash
cd ~/my-project-2

# Same engine, different memory
blackbox5 memory init

# Tasks here use this project's memory
# No cross-contamination with SISO-INTERNAL
```

### 💾 Where Data Lives

```
~/
├── SISO-INTERNAL/
│   └── .blackbox5/memory/          # SISO data
│       ├── working/
│       ├── extended/chroma-db/
│       └── archival/
│
├── my-project-2/
│   └── .blackbox5/memory/          # Project 2 data
│       ├── working/
│       ├── extended/chroma-db/
│       └── archival/
│
└── blackbox5-brain-data/           # Shared brain DB (optional)
```

---

## Part 7: Resource Requirements

### 💻 System Requirements

**For local development:**
- **RAM:** 8 GB minimum (16 GB recommended)
- **Storage:** 10 GB free space per project
- **Docker:** Required for PostgreSQL and Neo4j

**What uses what:**
- ChromaDB: ~100-500 MB per project
- PostgreSQL: ~100 MB shared
- Neo4j: ~500 MB shared
- Working memory: ~10 MB per active session
- Archival: Grows over time

### 🚀 Quick Start (All Local)

```bash
# 1. Install dependencies
brew install docker docker-compose
pip install chromadb

# 2. Start brain databases
cd ~/SISO-INTERNAL
docker-compose -f .blackbox5/docker-compose.brain.yml up -d

# 3. Initialize memory
mkdir -p .blackbox5/memory/{working,extended,archival}

# 4. Start using
blackbox5 task create 52
```

---

## Part 8: Docker Compose Setup

### 🐳 Simple Docker Compose for Brain

```yaml
# .blackbox5/docker-compose.brain.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: blackbox5-postgres
    environment:
      POSTGRES_DB: blackbox5_brain
      POSTGRES_USER: blackbox5
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - ~/blackbox5-data/postgres:/var/lib/postgresql/data

  neo4j:
    image: neo4j:5
    container_name: blackbox5-neo4j
    environment:
      NEO4J_AUTH: neo4j/password
    ports:
      - "7474:7474"
      - "7687:7687"
    volumes:
      - ~/blackbox5-data/neo4j:/data

volumes:
  blackbox5-data:
    driver: local
```

**Start with:** `docker-compose -f .blackbox5/docker-compose.brain.yml up -d`

---

## Summary: Answers to Your Questions

### Q1: Can memory run locally?

**YES! 100% local, ZERO hosting costs.**

### Q2: How does per-project memory work?

**Each project has its own `.blackbox5/memory/` folder:**
- `SISO-INTERNAL/.blackbox5/memory/`
- `my-project-2/.blackbox5/memory/`
- `client-website/.blackbox5/memory/`

**Engine is shared code, memory is per-project data.**

### Q3: How does memory actually work?

**Three tiers:**
1. **Working Memory** (SQLite) - Current session, fast
2. **Extended Memory** (ChromaDB) - Semantic search, vector embeddings
3. **Archival Memory** (Files) - Long-term storage, compressed

**Brain provides:**
- Semantic search across all memory
- Knowledge graph of code relationships
- Pattern and gotcha storage

**All runs locally with Docker + Python. No cloud services needed.**

---

## Next Steps

**Would you like me to:**
1. Create the Docker Compose setup?
2. Implement the memory initialization script?
3. Build the first memory tier (working memory)?
4. Set up the per-project structure?
