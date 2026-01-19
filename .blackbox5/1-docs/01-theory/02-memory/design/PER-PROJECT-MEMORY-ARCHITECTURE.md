# BlackBox5 Per-Project Memory Architecture

**Date:** 2025-01-18
**Status:** Design Complete
**Projects:** SISO-INTERNAL, Luminel, _TEMPLATE

---

## Overview

This architecture defines how BlackBox5 organizes memory across multiple projects. Each project has its own isolated memory space while sharing the same engine code.

---

## Part 1: High-Level Architecture

### 📁 Project Memory Structure

```
~/DEV/SISO-ECOSYSTEM/
├── SISO-INTERNAL/
│   ├── .blackbox5/
│   │   ├── engine/              # Shared engine code (committed)
│   │   └── memory/             # SISO-INTERNAL memory (gitignored)
│   │
│   └── src/
│
├── Luminel/
│   ├── .blackbox5/
│   │   ├── engine/              # Symlink to shared engine (optional)
│   │   └── memory/             # Luminel memory (gitignored)
│   │
│   └── src/
│
└── _TEMPLATE/
    ├── .blackbox5/
    │   ├── engine/              # Symlink to shared engine (optional)
    │   └── memory/             # Template structure (committed)
    │
    └── src/
```

### 🔑 Key Principles

1. **Engine is Shared Code** - Committed to git, symlinked or copied
2. **Memory is Per-Project Data** - Gitignored, isolated per project
3. **Template is Reference** - Shows standardized structure
4. **All Runs Locally** - Zero hosting costs

---

## Part 2: Per-Project Memory Layout

### 📊 Complete Memory Structure

```
.blackbox5/memory/
│
├── agents/                      # TIER 1: Agent Memory
│   ├── active/                  # Currently running agents
│   │   ├── {agent-id}/
│   │   │   ├── session.json    # Agent session state
│   │   │   ├── context.json    # Current context
│   │   │   └── snapshot.json   # Periodic snapshots
│   │   │
│   │   └── .active-agents      # List of active agent IDs
│   │
│   ├── history/                 # Completed agent sessions
│   │   ├── 2025/
│   │   │   ├── 01/
│   │   │   │   └── 18/
│   │   │   │       ├── agent-{uuid}-{timestamp}.json
│   │   │   │       └── agent-{uuid}-{timestamp}.json
│   │   │   │
│   │   │   └── 02/
│   │   │
│   │   └── index.db            # SQLite: Agent history index
│   │
│   └── metrics/                 # Agent performance metrics
│       ├── performance.db      # SQLite: Performance data
│       └── analytics/          # Aggregate statistics
│
├── tasks/                       # TIER 1: Task Memory
│   ├── working/                # Active tasks (Working Memory)
│   │   ├── {issue-number}/
│   │   │   ├── task.md         # Task specification
│   │   │   ├── progress.md     # Progress tracking (you edit this)
│   │   │   ├── notes.md        # Technical notes (optional)
│   │   │   ├── context.json    # Structured context
│   │   │   └── .last_sync      # Sync timestamp
│   │   │
│   │   └── .active-tasks       # List of active task IDs
│   │
│   ├── completed/              # Completed tasks (Extended Memory)
│   │   ├── {issue-number}/
│   │   │   ├── task.md
│   │   │   ├── final-report.md # Completion summary
│   │   │   ├── outcome.json    # Task outcome (patterns, gotchas)
│   │   │   ├── diff.patch      # Code changes
│   │   │   └── artifacts/      # Generated files
│   │   │
│   │   └── index.db            # SQLite: Completed task index
│   │
│   └── archived/               # Old tasks (Archival Memory)
│       ├── yearly/
│       │   ├── 2024.tar.gz
│       │   └── 2025.tar.gz
│       │
│       └── .archive-index      # Archive manifest
│
├── github/                      # TIER 1: GitHub Integration
│   ├── issues/                 # GitHub issue records
│   │   ├── {issue-number}/
│   │   │   ├── issue.json      # Raw issue data from GitHub
│   │   │   ├── comments/       # Comment history
│   │   │   │   ├── {comment-id}.json
│   │   │   │   └── {comment-id}.json
│   │   │   ├── events.json     # Issue events (labels, assignments, etc.)
│   │   │   └── sync-log.json   # Sync history
│   │   │
│   │   └── index.db            # SQLite: Issue index
│   │
│   ├── pull-requests/          # PR records (same structure as issues)
│   │   ├── {pr-number}/
│   │   │   ├── pr.json
│   │   │   ├── comments/
│   │   │   ├── reviews/
│   │   │   └── events.json
│   │
│   └── sync/                   # Sync state
│       ├── .last-sync          # Last successful sync timestamp
│       ├── pending/            # Pending outbound updates
│       └── conflicts/          # Sync conflict resolution
│
├── technical/                   # TIER 2: Technical Structures
│   ├── vibe-kanban/            # Vibe Kanban state
│   │   ├── boards/
│   │   │   ├── {board-id}/
│   │   │   │   ├── columns.json
│   │   │   │   ├── cards.json
│   │   │   │   └── settings.json
│   │   │
│   │   └── sync-state.json    # Vibe sync state
│   │
│   ├── thought-processes/      # Thought process records
│   │   ├── sessions/
│   │   │   ├── {session-id}/
│   │   │   │   ├── steps.json  # Sequential thinking steps
│   │   │   │   ├── reasoning.md # Human-readable reasoning
│   │   │   │   └── conclusion.json
│   │   │
│   │   └── patterns/           # Common thinking patterns
│   │       ├── problem-solving.json
│   │       └── decision-making.json
│   │
│   └── git-trees/              # Git tree structures
│       ├── commits/            # Commit analysis
│       │   ├── {commit-hash}/
│       │   │   ├── metadata.json
│       │   │   ├── diff.json
│       │   │   └── impact-analysis.json
│       │
│       ├── branches/           # Branch tracking
│       │   └── {branch-name}/
│       │       └── state.json
│       │
│       └── history.db          # SQLite: Git history index
│
├── work-history/                # TIER 3: Work History
│   ├── daily/                  # Daily work logs
│   │   ├── 2025/
│   │   │   ├── 01/
│   │   │   │   ├── 18.md
│   │   │   │   └── 19.md
│   │   │
│   │   └── index.db            # SQLite: Daily log index
│   │
│   ├── sessions/               # Work sessions
│   │   ├── {session-id}/
│   │   │   ├── session.json    # Session metadata
│   │   │   ├── tasks/          # Tasks worked on
│   │   │   ├── agents/         # Agents invoked
│   │   │   ├── timeline.json   # Event timeline
│   │   │   └── summary.md      # Human-readable summary
│   │
│   │   └── index.db            # SQLite: Session index
│   │
│   ├── milestones/             # Project milestones
│   │   ├── {milestone-id}/
│   │   │   ├── milestone.json
│   │   │   ├── tasks/          # Associated tasks
│   │   │   └── retrospective.md
│   │
│   └── analytics/              # Work analytics
│       ├── velocity.json       # Development velocity
│       ├── throughput.json     # Task completion rate
│       └── trends.json         # Long-term trends
│
├── extended/                    # TIER 2: Extended Memory (ChromaDB)
│   ├── chroma-db/              # Vector database
│   │   ├── chroma.sqlite3     # ChromaDB storage
│   │   └── data/              # Embedding data
│   │
│   └── collections/            # ChromaDB collections
│       ├── code-embeddings     # Code semantic search
│       ├── task-similarity     # Similar task search
│       ├── pattern-matching    # Pattern recognition
│       └── documentation       # Documentation search
│
├── archival/                    # TIER 3: Archival Memory
│   ├── snapshots/              # System snapshots
│   │   ├── daily/
│   │   │   └── snapshot-2025-01-18.tar.gz
│   │   ├── weekly/
│   │   └── monthly/
│   │
│   ├── exports/                # Exported data
│   │   ├── github-export.json
│   │   ├── tasks-export.json
│   │   └── full-export-{date}.tar.gz
│   │
│   └── backups/                # Emergency backups
│       └── backup-{timestamp}.tar.gz
│
├── brain-index/                 # Brain System Index
│   ├── postgres-index/         # PostgreSQL index files
│   │   └── .connection         # DB connection info
│   │
│   ├── neo4j-index/            # Neo4j index files
│   │   └── .connection         # DB connection info
│   │
│   └── episodes/               # Episode metadata
│       ├── PATTERN/
│       ├── GOTCHA/
│       ├── TASK_OUTCOME/
│       └── CODEBASE_DISCOVERY/
│
└── .memory-config              # Memory configuration
    ├── tiers.json              # Tier configuration
    ├── retention.json          # Retention policies
    └── indexing.json           # Indexing rules
```

---

## Part 3: Database Schema Distribution

### 📊 Where Data Lives

```
┌─────────────────────────────────────────────────────────────────┐
│                    BLACKBOX5 DATA STORAGE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FILESYSTEM (Working Memory)                                   │
│  ├─ agents/active/              # Active agent sessions        │
│  ├─ tasks/working/              # Active tasks                 │
│  ├─ github/issues/              # GitHub issue records         │
│  ├─ technical/vibe-kanban/      # Vibe state                  │
│  └─ work-history/daily/         # Daily logs                   │
│                                                                 │
│  SQLITE (Working + Extended Memory)                            │
│  ├─ agents/history/index.db     # Agent history index          │
│  ├─ tasks/completed/index.db    # Completed task index         │
│  ├─ github/issues/index.db      # Issue index                  │
│  ├─ technical/git-trees/history.db  # Git history             │
│  └─ work-history/sessions/index.db  # Session index           │
│                                                                 │
│  CHROMADB (Extended Memory)                                    │
│  ├─ extended/chroma-db/          # Vector embeddings           │
│  └─ extended/collections/        # Semantic collections        │
│    ├─ code-embeddings           # Code search                 │
│    ├─ task-similarity           # Task similarity             │
│    └─ pattern-matching          # Pattern recognition         │
│                                                                 │
│  POSTGRESQL (Brain - Structured)                               │
│  ├─ episodes                    # Episode storage             │
│  ├─ patterns                    # Pattern library             │
│  ├─ gotchas                     # Gotcha library              │
│  └─ codebase_metadata           # Codebase structure          │
│                                                                 │
│  NEO4J (Brain - Knowledge Graph)                               │
│  ├─ code_nodes                  # Code relationships          │
│  ├─ task_nodes                  # Task relationships          │
│  ├─ pattern_nodes               # Pattern relationships       │
│  └─ dependency_graph            # Dependency mapping          │
│                                                                 │
│  ARCHIVAL (Filesystem + Compression)                           │
│  ├─ archival/snapshots/          # System snapshots           │
│  ├─ tasks/archived/              # Compressed tasks           │
│  └─ archival/backups/            # Emergency backups          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 4: Data Flow Between Components

### 🔄 How Data Moves Through Memory

```
┌──────────────────┐
│   AGENT STARTS   │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ TIER 1: WORKING MEMORY (Fast, Session-based)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Agent creates session:                                  │
│     agents/active/{agent-id}/session.json                  │
│                                                             │
│  2. Agent works on task:                                    │
│     tasks/working/{issue-number}/progress.md               │
│                                                             │
│  3. Agent records reasoning:                                │
│     technical/thought-processes/{session-id}/steps.json    │
│                                                             │
│  4. Sync to GitHub:                                         │
│     github/sync/pending/ → GitHub API                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │
         │ Task Complete
         ▼
┌─────────────────────────────────────────────────────────────┐
│ TIER 2: EXTENDED MEMORY (Searchable, Semantic)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  5. Store in ChromaDB:                                      │
│     extended/chroma-db/ → Vector embeddings                 │
│     - Code patterns                                         │
│     - Task similarities                                     │
│     - Solution approaches                                   │
│                                                             │
│  6. Update Brain (PostgreSQL):                              │
│     Brain → PATTERN, GOTCHA, TASK_OUTCOME episodes          │
│                                                             │
│  7. Update Knowledge Graph (Neo4j):                         │
│     Brain → Code relationships, dependencies                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │
         │ Age Out (30 days)
         ▼
┌─────────────────────────────────────────────────────────────┐
│ TIER 3: ARCHIVAL MEMORY (Cold Storage, Compressed)          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  8. Compress task:                                          │
│     tasks/completed/ → tasks/archived/yearly/2025.tar.gz   │
│                                                             │
│  9. Archive agent session:                                  │
│     agents/active/ → agents/history/2025/01/18/            │
│                                                             │
│  10. Create system snapshot:                                │
│      archival/snapshots/monthly/snapshot-2025-01.tar.gz    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 5: Project-Specific Implementations

### 📁 SISO-INTERNAL Memory Layout

```
SISO-INTERNAL/.blackbox5/memory/
│
├── agents/
│   ├── active/
│   │   └── coder-agent-abc123/
│   │       ├── session.json       # Coder agent working on issue #52
│   │       ├── context.json       # Has context: files, issue, progress
│   │       └── snapshot.json      # Last snapshot: 2 min ago
│   │
│   ├── history/
│   │   └── 2025/01/18/
│   │       ├── planner-agent-def456-20250118-143022.json
│   │       └── coder-agent-ghi789-20250118-150145.json
│   │
│   └── metrics/
│       └── performance.db        # Agent performance over time
│
├── tasks/
│   ├── working/
│   │   ├── 52/                   # Active: GitHub Issues Integration Demo
│   │   │   ├── task.md
│   │   │   ├── progress.md       # Currently 0% complete
│   │   │   ├── notes.md
│   │   │   └── context.json
│   │   │
│   │   └── .active-tasks         # Contains: ["52"]
│   │
│   ├── completed/
│   │   └── index.db              # 127 completed tasks indexed
│   │
│   └── archived/
│       └── yearly/
│           ├── 2024.tar.gz       # Contains 89 tasks from 2024
│           └── 2023.tar.gz       # Contains 234 tasks from 2023
│
├── github/
│   ├── issues/
│   │   ├── 52/
│   │   │   ├── issue.json        # GitHub issue data
│   │   │   ├── comments/
│   │   │   ├── events.json       # Label changes, etc.
│   │   │   └── sync-log.json     # Last sync: 2025-01-18T13:20:00Z
│   │   │
│   │   └── index.db
│   │
│   └── sync/
│       ├── .last-sync
│       └── pending/
│
├── technical/
│   ├── vibe-kanban/
│   │   └── boards/
│   │       └── main/
│   │           ├── columns.json
│   │           └── cards.json
│   │
│   ├── thought-processes/
│   │   └── sessions/
│   │       └── think-session-123/
│   │           ├── steps.json
│   │           └── reasoning.md
│   │
│   └── git-trees/
│       └── commits/
│           └── c79d4f39/
│               ├── metadata.json
│               └── impact-analysis.json
│
├── work-history/
│   ├── daily/
│   │   └── 2025/01/
│   │       ├── 18.md             # Today's work log
│   │       └── 17.md             # Yesterday's work log
│   │
│   ├── sessions/
│   │   └── session-20250118-001/
│   │       ├── session.json      # Started: 2025-01-18 14:30
│   │       ├── tasks/            # Worked on issue #52
│   │       └── timeline.json
│   │
│   └── analytics/
│       ├── velocity.json         # SISO velocity: 12 tasks/week
│       └── trends.json
│
├── extended/
│   └── chroma-db/
│       └── chroma.sqlite3       # 15,432 code embeddings
│
├── archival/
│   └── snapshots/
│       └── daily/
│           └── snapshot-2025-01-18.tar.gz
│
└── brain-index/
    ├── postgres-index/
    │   └── .connection          # localhost:5432/blackbox5_brain
    │
    └── neo4j-index/
        └── .connection          # localhost:7687
```

### 📁 Luminel Memory Layout

```
Luminel/.blackbox5/memory/
│
├── agents/
│   ├── active/
│   │   └── qa-agent-xyz789/     # QA agent working on Luminel PR #23
│   │
│   └── history/
│       └── 2025/01/
│           └── 15/              # Luminel-specific agent sessions
│
├── tasks/
│   ├── working/
│   │   ├── 12/                  # Active: Add OAuth to Luminel
│   │   └── 13/                  # Active: Fix responsive layout
│   │
│   └── completed/
│       └── index.db             # 45 Luminel tasks completed
│
├── github/
│   ├── issues/
│   │   ├── 12/
│   │   └── 13/
│   │
│   └── pull-requests/           # Luminel uses PRs heavily
│       ├── 23/
│       │   ├── pr.json
│       │   ├── reviews/
│       │   └── events.json
│       │
│       └── 24/
│
├── technical/
│   ├── vibe-kanban/
│   │   └── boards/
│   │       └── luminel-dev/      # Luminel-specific board
│   │
│   ├── thought-processes/
│   │   └── sessions/
│   │
│   └── git-trees/
│       └── branches/
│           └── feature/oauth/   # OAuth feature branch state
│
├── work-history/
│   ├── daily/
│   │   └── 2025/01/
│   │       ├── 18.md
│   │
│   └── analytics/
│       ├── velocity.json         # Luminel velocity: 8 tasks/week
│
└── extended/
    └── chroma-db/
        └── chroma.sqlite3       # 8,234 Luminel code embeddings
```

### 📁 _TEMPLATE Memory Layout

```
_TEMPLATE/.blackbox5/memory/
│
├── agents/
│   ├── active/
│   │   └── .gitkeep
│   │
│   ├── history/
│   │   └── .gitkeep
│   │
│   └── metrics/
│       └── .gitkeep
│
├── tasks/
│   ├── working/
│   │   └── .gitkeep
│   │
│   ├── completed/
│   │   └── .gitkeep
│   │
│   └── archived/
│       └── .gitkeep
│
├── github/
│   ├── issues/
│   │   └── .gitkeep
│   │
│   ├── pull-requests/
│   │   └── .gitkeep
│   │
│   └── sync/
│       └── .gitkeep
│
├── technical/
│   ├── vibe-kanban/
│   │   └── README.md            # Vibe Kanban setup instructions
│   │
│   ├── thought-processes/
│   │   └── README.md            # Thought process format
│   │
│   └── git-trees/
│       └── README.md            # Git tree format
│
├── work-history/
│   ├── daily/
│   │   └── README.md            # Daily log format
│   │
│   ├── sessions/
│   │   └── README.md            # Session format
│   │
│   └── analytics/
│       └── .gitkeep
│
├── extended/
│   └── chroma-db/
│       └── .gitkeep
│
├── archival/
│   └── .gitkeep
│
├── brain-index/
│   ├── postgres-index/
│   │   └── README.md            # Brain connection setup
│   │
│   └── neo4j-index/
│       └── README.md
│
└── .memory-config
    ├── tiers.json               # Tier size limits
    ├── retention.json           # Retention policies
    └── indexing.json            # What to index
```

---

## Part 6: Configuration Files

### 📝 .memory-config/tiers.json

```json
{
  "working_memory": {
    "max_size_mb": 10,
    "location": "./agents/active",
    "retention_days": 1,
    "compaction_interval": "hourly"
  },
  "extended_memory": {
    "max_size_mb": 500,
    "location": "./extended/chroma-db",
    "retention_days": 30,
    "compaction_interval": "daily"
  },
  "archival_memory": {
    "max_size_gb": 5,
    "location": "./archival",
    "retention_days": -1,
    "compaction_interval": "weekly"
  }
}
```

### 📝 .memory-config/retention.json

```json
{
  "agents": {
    "active_sessions": "1 day",
    "history": "90 days",
    "metrics": "365 days"
  },
  "tasks": {
    "working": "30 days",
    "completed": "365 days",
    "archived": "permanent"
  },
  "github": {
    "issues": "permanent",
    "comments": "365 days",
    "events": "90 days"
  },
  "technical": {
    "thought_processes": "90 days",
    "git_trees": "365 days",
    "vibe_kanban": "session"
  },
  "work_history": {
    "daily_logs": "365 days",
    "sessions": "365 days",
    "analytics": "permanent"
  }
}
```

### 📝 .memory-config/indexing.json

```json
{
  "chromadb": {
    "collections": {
      "code-embeddings": {
        "description": "Code semantic search",
        "embedding_model": "all-MiniLM-L6-v2",
        "chunk_size": 500
      },
      "task-similarity": {
        "description": "Similar task search",
        "embedding_model": "all-MiniLM-L6-v2",
        "chunk_size": 1000
      },
      "pattern-matching": {
        "description": "Pattern recognition",
        "embedding_model": "all-MiniLM-L6-v2",
        "chunk_size": 2000
      }
    }
  },
  "brain": {
    "postgresql": {
      "connection": "localhost:5432/blackbox5_brain",
      "episodes": ["PATTERN", "GOTCHA", "TASK_OUTCOME", "CODEBASE_DISCOVERY"]
    },
    "neo4j": {
      "connection": "bolt://localhost:7687",
      "nodes": ["code", "tasks", "patterns", "dependencies"]
    }
  }
}
```

---

## Part 7: Memory Initialization Script

### 🚀 Initialization Command

```bash
# Initialize memory for a project
blackbox5 memory init [--template] [--from-existing]

# Options:
#   --template: Create from _TEMPLATE
#   --from-existing: Import from existing project
```

### 📝 Memory Initialization Script

```python
# .blackbox5/engine/scripts/init_memory.py

import os
import shutil
from pathlib import Path
import json

def init_memory(project_path: Path, template_path: Path | None = None):
    """Initialize memory for a project"""

    memory_path = project_path / ".blackbox5" / "memory"

    # Create directory structure
    directories = [
        "agents/active",
        "agents/history",
        "agents/metrics",
        "tasks/working",
        "tasks/completed",
        "tasks/archived/yearly",
        "github/issues",
        "github/pull-requests",
        "github/sync/pending",
        "github/sync/conflicts",
        "technical/vibe-kanban/boards",
        "technical/thought-processes/sessions",
        "technical/git-trees/commits",
        "technical/git-trees/branches",
        "work-history/daily",
        "work-history/sessions",
        "work-history/milestones",
        "work-history/analytics",
        "extended/chroma-db",
        "extended/collections",
        "archival/snapshots/daily",
        "archival/snapshots/weekly",
        "archival/snapshots/monthly",
        "archival/exports",
        "archival/backups",
        "brain-index/postgres-index",
        "brain-index/neo4j-index",
        "brain-index/episodes/PATTERN",
        "brain-index/episodes/GOTCHA",
        "brain-index/episodes/TASK_OUTCOME",
        "brain-index/episodes/CODEBASE_DISCOVERY",
    ]

    for dir_path in directories:
        (memory_path / dir_path).mkdir(parents=True, exist_ok=True)
        (memory_path / dir_path / ".gitkeep").touch()

    # Create configuration files
    config_path = memory_path / ".memory-config"
    config_path.mkdir(exist_ok=True)

    # tiers.json
    tiers = {
        "working_memory": {
            "max_size_mb": 10,
            "location": "./agents/active",
            "retention_days": 1,
        },
        "extended_memory": {
            "max_size_mb": 500,
            "location": "./extended/chroma-db",
            "retention_days": 30,
        },
        "archival_memory": {
            "max_size_gb": 5,
            "location": "./archival",
            "retention_days": -1,
        },
    }
    (config_path / "tiers.json").write_text(json.dumps(tiers, indent=2))

    # retention.json
    retention = {
        "agents": {"active_sessions": "1 day", "history": "90 days"},
        "tasks": {"working": "30 days", "completed": "365 days"},
        "github": {"issues": "permanent"},
        "technical": {"thought_processes": "90 days"},
        "work_history": {"daily_logs": "365 days"},
    }
    (config_path / "retention.json").write_text(json.dumps(retention, indent=2))

    # Initialize SQLite databases
    init_sqlite_databases(memory_path)

    # Initialize ChromaDB collections
    init_chromadb_collections(memory_path)

    print(f"✅ Memory initialized at: {memory_path}")
    print(f"📊 Project: {project_path.name}")
    print(f"🧠 Brain: localhost:5432/blackbox5_brain")
    print(f"📦 Extended Memory: ChromaDB at {memory_path}/extended/chroma-db")

def init_sqlite_databases(memory_path: Path):
    """Initialize SQLite databases"""

    import sqlite3

    # Agent history index
    db = memory_path / "agents/history/index.db"
    conn = sqlite3.connect(db)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            agent_type TEXT,
            start_time TEXT,
            end_time TEXT,
            tasks_worked_on TEXT,
            outcome TEXT
        )
    """)
    conn.commit()
    conn.close()

    # Completed task index
    db = memory_path / "tasks/completed/index.db"
    conn = sqlite3.connect(db)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            issue_number INTEGER PRIMARY KEY,
            title TEXT,
            completed_at TEXT,
            patterns_learned TEXT,
            gotchas_identified TEXT
        )
    """)
    conn.commit()
    conn.close()

    print("✅ SQLite databases initialized")

def init_chromadb_collections(memory_path: Path):
    """Initialize ChromaDB collections"""

    import chromadb

    client = chromadb.PersistentClient(path=str(memory_path / "extended" / "chroma-db"))

    collections = {
        "code-embeddings": "Code semantic search",
        "task-similarity": "Similar task search",
        "pattern-matching": "Pattern recognition",
    }

    for name, description in collections.items():
        try:
            client.get_collection(name=name)
        except:
            client.create_collection(
                name=name,
                metadata={"description": description}
            )

    print("✅ ChromaDB collections initialized")
```

---

## Part 8: Git Configuration

### 📝 .gitignore for Memory

```gitignore
# BlackBox5 Memory (per-project data)
.blackbox5/memory/

# Keep engine code
!.blackbox5/engine/

# Keep template structure
!.blackbox5/memory/.gitkeep
!.blackbox5/memory/**/.gitkeep
!.blackbox5/memory/**/README.md
!.blackbox5/memory/.memory-config/*.json
```

---

## Part 9: Integration Points

### 🔗 How Components Connect

```
┌─────────────────────────────────────────────────────────────┐
│                    BLACKBOX5 MEMORY FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. AGENT CREATES SESSION                                   │
│     ├─ Register: agents/active/{id}/session.json           │
│     ├─ Log to: work-history/sessions/{id}/                 │
│     └─ Track in: agents/history/index.db                   │
│                                                             │
│  2. AGENT WORKS ON TASK                                     │
│     ├─ Load: tasks/working/{issue}/                         │
│     ├─ Update: progress.md                                 │
│     ├─ Reasoning: technical/thought-processes/{id}/        │
│     └─ Git trees: technical/git-trees/commits/{hash}/      │
│                                                             │
│  3. SYNC TO GITHUB                                          │
│     ├─ Read: tasks/working/{issue}/progress.md             │
│     ├─ Format: github/sync/ccpm_sync.py                    │
│     ├─ Push: GitHub CLI                                    │
│     └─ Record: github/issues/{issue}/sync-log.json         │
│                                                             │
│  4. TASK COMPLETION                                         │
│     ├─ Move: tasks/working/ → tasks/completed/             │
│     ├─ Store: outcome.json (patterns, gotchas)            │
│     ├─ Embed: extended/chroma-db/ (vector search)          │
│     ├─ Brain: PostgreSQL + Neo4j episodes                  │
│     └─ Archive: tasks/archived/yearly/ (after 30 days)     │
│                                                             │
│  5. WORK HISTORY                                            │
│     ├─ Daily: work-history/daily/{date}.md                 │
│     ├─ Session: work-history/sessions/{id}/                │
│     └─ Analytics: work-history/analytics/*.json            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 10: Usage Examples

### 💻 Working with SISO-INTERNAL Memory

```bash
# Initialize memory for SISO-INTERNAL
cd ~/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
blackbox5 memory init

# Create a task (creates task in memory + GitHub issue)
blackbox5 task create --title "Add OAuth login" --labels "type:feature"

# Work on task (agent reads from memory, updates progress)
blackbox5 task work 52

# Sync progress to GitHub (reads from memory, posts comment)
blackbox5 task sync 52

# Complete task (archives to extended memory, stores in brain)
blackbox5 task complete 52

# View agent history
blackbox5 agent history

# Search similar tasks (uses ChromaDB)
blackbox5 task search "authentication"
```

### 💻 Working with Luminel Memory

```bash
# Initialize memory for Luminel
cd ~/DEV/SISO-ECOSYSTEM/Luminel
blackbox5 memory init

# Luminel has its own isolated memory
# No cross-contamination with SISO-INTERNAL

blackbox5 task create --title "Fix responsive layout"
blackbox5 task work 12
```

---

## Part 11: Memory Dashboard

### 📊 Memory Statistics

```bash
# Check memory usage
blackbox5 memory stats

# Output:
Memory Statistics for: SISO-INTERNAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Working Memory: 8.2 MB / 10 MB (82%)
  ├─ Active agents: 1
  ├─ Active tasks: 1
  └─ GitHub sync: Pending 1 update

📚 Extended Memory: 234.5 MB / 500 MB (47%)
  ├─ ChromaDB embeddings: 15,432
  ├─ Code snippets: 1,234
  └─ Patterns: 456

🗄️ Archival Memory: 1.2 GB / 5 GB (24%)
  ├─ Archived tasks: 312
  ├─ Snapshots: 30
  └─ Backups: 5

🧠 Brain Index:
  ├─ PostgreSQL episodes: 89
  ├─ Neo4j nodes: 1,234
  └─ Neo4j relationships: 3,456
```

---

## Summary

### Key Architecture Decisions

1. **Per-Project Memory Isolation**
   - Each project (SISO-INTERNAL, Luminel) has its own `.blackbox5/memory/`
   - No cross-contamination between projects
   - Shared engine code via symlinks or copies

2. **Four Memory Components**
   - **Agent/Task Memory**: History of all agents and tasks
   - **GitHub Integration**: Issues, PRs, comments, sync state
   - **Technical Structures**: Vibe Kanban, thought processes, Git trees
   - **Work History**: Comprehensive work logs and analytics

3. **Three-Tier Storage**
   - **Working Memory** (10 MB): Active sessions, current tasks
   - **Extended Memory** (500 MB): ChromaDB vector search, completed tasks
   - **Archival Memory** (5 GB): Compressed historical data

4. **Database Distribution**
   - **SQLite**: Fast indexes (agents, tasks, GitHub, git)
   - **ChromaDB**: Semantic search (code, tasks, patterns)
   - **PostgreSQL**: Brain episodes (patterns, gotchas)
   - **Neo4j**: Knowledge graph (relationships)

5. **Template-Based Initialization**
   - `_TEMPLATE` provides standardized structure
   - New projects copy template and customize
   - Gitignore ensures data isolation

6. **All Local, All Free**
   - SQLite: Built-in
   - ChromaDB: Python package
   - PostgreSQL + Neo4j: Docker local
   - Zero hosting costs

---

## Next Steps

**Would you like me to:**
1. Create the memory initialization script?
2. Set up the SISO-INTERNAL memory structure?
3. Set up the Luminel memory structure?
4. Create the _TEMPLATE structure?
5. Implement the memory management CLI commands?
