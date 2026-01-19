# Blackbox4 vs Blackbox5: What We Need to Port

**Date:** 2026-01-18
**Source:** https://github.com/Lordsisodia/blackbox4
**Purpose:** Identify critical components to port from Blackbox4 to Blackbox5

---

## Executive Summary

**Blackbox4 has production-ready components that Blackbox5 is missing.**

**Critical Gaps:**
1. Three-tier memory system with semantic search
2. Ralph TUI runtime for autonomous execution
3. Built-in Kanban task management
4. BMAD agent framework
5. Advanced brain architecture v2.0

---

## Part 1: Critical Components to Port

### 🔴 PRIORITY 1: Three-Tier Memory System

**What Blackbox4 Has:**
```
📁 Working Memory (.memory/)
├── agents/          # Active agent states
├── handoffs/        # Agent handoff contexts
└── shared/          # Shared state between agents

📁 Extended Memory (.memory/extended/)
├── chroma/          # Vector store for semantic search
├── sessions/        # Session documentation (4-file structure)
└── work-queue.json  # Task management

📁 Archival Memory (.memory/archive/)
└── history/         # Compressed session archives
```

**Key Features:**
- Semantic search with ChromaDB
- Timeline tracking (timeline.md)
- Work queue management (work-queue.json)
- Session documentation (4 files per session)
- Automatic archival and compaction

**What Blackbox5 Has:**
- Basic brain system (PostgreSQL + Neo4j)
- No semantic search interface for agents
- No working memory structure
- No session tracking

**Implementation Needed:**
```python
# .blackbox5/engine/memory/three_tier.py
class ThreeTierMemory:
    def __init__(self):
        self.working = WorkingMemory()      # Active session
        self.extended = ExtendedMemory()    # ChromaDB semantic
        self.archival = ArchivalMemory()    # Long-term storage

    def store(self, information, tier="working"):
        pass

    def retrieve(self, query, tier="all"):
        pass

    def semantic_search(self, query, n_results=10):
        pass
```

**Effort:** 2-3 weeks

---

### 🔴 PRIORITY 2: Ralph TUI Runtime

**What Blackbox4 Has:**
- Terminal-based autonomous execution
- Real-time monitoring and progress tracking
- Workspace session management
- Task queue visualization
- Agent state inspection

**Location:** `.ralph-tui/`

**Key Features:**
- TUI-based agent execution
- Real-time log streaming
- Interactive task management
- Workspace sessions with state
- Progress bars and metrics

**What Blackbox5 Has:**
- CLI tools for viewing logs and manifests
- No interactive runtime
- No real-time monitoring

**Implementation Needed:**
```python
# .blackbox5/engine/runtime/ralph.py
class RalphRuntime:
    def __init__(self):
        self.task_queue = []
        self.active_sessions = {}

    async def run_interactive(self):
        # TUI loop with rich/textual
        pass

    def add_task(self, task):
        pass

    def show_progress(self):
        pass
```

**Effort:** 3-4 weeks

---

### 🟡 PRIORITY 3: Built-in Kanban System

**What Blackbox4 Has:**
- Task boards with status columns
- Project-based organization
- Workspace sessions
- Progress metrics

**Features:**
- Todo → In Progress → Review → Done workflow
- Task priorities and tags
- Assignment to agents
- Time tracking

**What Blackbox5 Has:**
- Manifest system (operation tracking)
- No task board UI
- No project management

**Implementation Needed:**
```python
# .blackbox5/engine/kanban.py
class KanbanBoard:
    def __init__(self):
        self.columns = {
            "todo": [],
            "in_progress": [],
            "review": [],
            "done": []
        }

    def add_task(self, task, column="todo"):
        pass

    def move_task(self, task_id, to_column):
        pass

    def get_metrics(self):
        pass
```

**Effort:** 2 weeks

---

### 🟡 PRIORITY 4: BMAD Agent Framework

**What Blackbox4 Has:**
- Business Model Agent Development methodology
- 8 specialized BMAD agents:
  - Master (orchestration)
  - Architect (system design)
  - Dev (implementation)
  - PM (project management)
  - QA (quality assurance)
  - UX (user experience)
  - Tech Writer (documentation)
  - Analyst (requirements)

**Key Features:**
- Structured agent handoffs
- Role-based specialization
- Documentation requirements
- Quality gates

**What Blackbox5 Has:**
- BaseAgent class
- No BMAD methodology
- No specialized roles

**Implementation Needed:**
```python
# .blackbox5/engine/agents/bmad/
class BMADMasterAgent(BaseAgent):
    async def execute(self, task):
        # Decompose task
        # Assign to specialists
        # Integrate results
        pass

class BMADArchitectAgent(BaseAgent):
    async def execute(self, task):
        # System design
        # Architecture decisions
        pass
# ... etc for all 8 BMAD agents
```

**Effort:** 2-3 weeks

---

### 🟢 PRIORITY 5: Brain Architecture v2.0

**What Blackbox4 Has:**
- Triple database architecture:
  - PostgreSQL (structured queries)
  - Neo4j (graph relationships)
  - pgvector (semantic search)
- Metadata schema for all artifacts
- Automatic indexing and ingestion
- Natural language query interface

**Key Features:**
- `metadata.yaml` for every artifact
- Automatic relationship extraction
- Embedding generation
- Multi-database query routing

**What Blackbox5 Has:**
- Brain system with PostgreSQL + Neo4j
- No unified metadata schema
- No automatic ingestion
- No semantic search API

**Implementation Needed:**
```python
# .blackbox5/engine/brain/metadata.py
class MetadataExtractor:
    def extract(self, artifact_path):
        # Parse metadata.yaml
        # Extract embeddings
        # Find relationships
        pass

# .blackbox5/engine/brain/query.py
class UnifiedQueryEngine:
    def query(self, natural_language):
        # Parse intent
        # Route to appropriate DB
        # Return results
        pass
```

**Effort:** 3-4 weeks

---

## Part 2: File Structure to Adopt

### Blackbox4 Structure (Superior)
```
.blackbox4/
├── .config/          # Framework configuration
├── .memory/          # Three-tier memory system
│   ├── working/      # Active session data
│   ├── extended/     # Semantic search
│   └── archive/      # Historical data
├── .plans/           # Planning system
├── .ralph-tui/       # TUI runtime
├── 1-agents/        # Agent definitions
├── 2-frameworks/    # Integration frameworks
├── 3-modules/       # Functional modules
├── 4-scripts/       # Utility scripts
├── 5-templates/     # Document templates
├── 6-tools/         # Development tools
├── 7-workspace/     # Active workspaces
├── 8-testing/       # Test suites
├── 9-brain/         # Brain architecture
└── manifest.yaml    # System manifest
```

### Blackbox5 Current Structure
```
.blackbox5/
├── engine/
│   ├── agents/      # Agent system (mostly empty)
│   ├── core/        # Core components
│   ├── brain/       # Brain system
│   ├── memory/      # Memory (scattered)
│   └── runtime/     # CLI tools
└── gui/             # React frontend
```

### Recommended Blackbox5 Structure
```
.blackbox5/
├── .config/          # NEW: Configuration
├── .memory/          # NEW: Three-tier system
│   ├── working/
│   ├── extended/
│   └── archive/
├── .plans/           # NEW: Planning
├── .ralph-tui/       # NEW: TUI runtime
├── engine/
│   ├── .agents/      # EXISTING: Base agents
│   ├── core/         # EXISTING: Core components
│   ├── brain/        # EXISTING: Brain system
│   ├── memory/       # ENHANCE: Add three-tier
│   ├── runtime/      # ENHANCE: Add Ralph
│   └── kanban/       # NEW: Task management
└── gui/              # EXISTING: Frontend
```

---

## Part 3: Session Documentation Pattern

### Blackbox4's 4-File Structure

Every session creates 4 files:
```
.memory/extended/sessions/{session-id}/
├── 00-summary.md      # What was done
├── 01-achievements.md # What was accomplished
├── 02-materials.md    # What was created
└── 03-analysis.md     # Lessons learned
```

**Benefits:**
- Structured documentation
- Easy to search and review
- Clear separation of concerns
- Supports learning and improvement

**Implementation Needed:**
```python
# .blackbox5/engine/memory/session.py
class SessionDocumentation:
    def create_session(self, session_id):
        return {
            "summary": "",
            "achievements": [],
            "materials": [],
            "analysis": ""
        }

    def update_summary(self, text):
        pass

    def add_achievement(self, achievement):
        pass

    def add_material(self, material):
        pass

    def add_analysis(self, analysis):
        pass
```

---

## Part 4: Work Queue System

### Blackbox4's Work Queue

**File:** `.memory/extended/work-queue.json`

```json
{
  "queue": [
    {
      "id": "task-1",
      "title": "Implement feature X",
      "status": "todo",
      "priority": "high",
      "assigned_to": "dev-agent",
      "created": "2026-01-18T10:00:00Z",
      "dependencies": []
    }
  ],
  "active": null,
  "completed": []
}
```

**Features:**
- JSON-based task storage
- Priority ordering
- Dependency tracking
- Agent assignment
- Status tracking

**Implementation Needed:**
```python
# .blackbox5/engine/kanban/work_queue.py
class WorkQueue:
    def __init__(self, queue_path):
        self.queue_path = queue_path
        self.queue = self._load()

    def add_task(self, task):
        pass

    def get_next_task(self):
        pass

    def complete_task(self, task_id):
        pass
```

---

## Part 5: Timeline Tracking

### Blackbox4's Timeline System

**File:** `.memory/timeline.md`

```markdown
# Timeline

## 2026-01-18

### 10:00 - Task Started
- Agent: dev-agent
- Task: Implement feature X
- Status: in_progress

### 10:30 - Subtask Completed
- Agent: dev-agent
- Achievement: Created base class
- Materials: feature_x.py

### 11:00 - Task Completed
- Agent: dev-agent
- Result: Feature implemented
- Next: Testing
```

**Benefits:**
- Chronological event tracking
- Easy to review progress
- Supports debugging and analysis

**Implementation Needed:**
```python
# .blackbox5/engine/memory/timeline.py
class Timeline:
    def __init__(self, timeline_path):
        self.timeline_path = timeline_path

    def log_event(self, timestamp, event_type, details):
        pass

    def get_events(self, date=None):
        pass
```

---

## Part 6: Metadata Schema

### Blackbox4's Universal Metadata

**Every artifact has `metadata.yaml`:**

```yaml
# Core Identification
id: "unique-id"
type: "agent"  # agent|skill|plan|library|etc
name: "orchestrator"
category: "specialist"
version: "1.0.0"

# Location
path: "1-agents/4-specialists/orchestrator.md"
created: "2026-01-15"
modified: "2026-01-15"

# Content
description: "Main orchestrator agent"
tags: ["orchestration", "coordination"]
keywords: ["orchestrate", "coordinate"]

# Relationships
depends_on:
  - id: "deep-research-skill"
    type: "skill"
used_by:
  - id: "ralph-agent"
    type: "agent"

# Classification
phase: 4
layer: "intelligence"

# AI/Discovery
embedding_id: "emb-orchestrator-123"
search_vector: [0.1, 0.2, ...]

# Status
status: "active"
stability: "high"

# Ownership
owner: "core-team"
maintainer: "ai-system"
```

**Benefits:**
- Machine-queryable
- Automatic indexing
- Relationship tracking
- Semantic search

---

## Part 7: Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. **Three-tier memory structure**
   - Create directory structure
   - Implement basic storage/retrieval
   - Add session documentation

2. **Work queue system**
   - JSON-based task storage
   - Add/update/complete operations
   - Priority ordering

### Phase 2: Intelligence (Week 3-4)
3. **Semantic search**
   - Integrate ChromaDB
   - Add embedding generation
   - Implement similarity search

4. **Timeline tracking**
   - Markdown-based event logging
   - Chronological queries
   - Session history

### Phase 3: Execution (Week 5-6)
5. **Ralph TUI runtime**
   - Terminal-based UI
   - Real-time monitoring
   - Workspace sessions

6. **Kanban system**
   - Task board UI
   - Status management
   - Progress metrics

### Phase 4: Intelligence (Week 7-8)
7. **Metadata schema**
   - Standardize artifact metadata
   - Automatic extraction
   - Relationship indexing

8. **Unified query engine**
   - Natural language interface
   - Multi-database routing
   - Result aggregation

---

## Part 8: Quick Wins

### Can Implement in 1-2 Days

1. **Work Queue JSON**
   ```python
   # Simple JSON file for task management
   import json

   work_queue = {
       "queue": [],
       "active": None,
       "completed": []
   }

   with open(".memory/extended/work-queue.json", "w") as f:
       json.dump(work_queue, f, indent=2)
   ```

2. **Timeline Markdown**
   ```python
   # Simple markdown logging
   def log_event(event_type, details):
       timestamp = datetime.now().isoformat()
       with open(".memory/timeline.md", "a") as f:
           f.write(f"\n## {timestamp}\n")
           f.write(f"### {event_type}\n")
           f.write(f"{details}\n")
   ```

3. **Session Documentation**
   ```python
   # 4-file structure for sessions
   def create_session(session_id):
       session_dir = f".memory/extended/sessions/{session_id}"
       os.makedirs(session_dir, exist_ok=True)

       files = {
           "00-summary.md": "# Summary\n",
           "01-achievements.md": "# Achievements\n",
           "02-materials.md": "# Materials\n",
           "03-analysis.md": "# Analysis\n"
       }

       for filename, content in files.items():
           with open(f"{session_dir}/{filename}", "w") as f:
               f.write(content)
   ```

---

## Conclusion

**Blackbox4 has production-ready systems that Blackbox5 desperately needs.**

**Critical Priorities:**
1. **Three-tier memory** - Enables persistent, searchable intelligence
2. **Work queue** - Simple task management
3. **Timeline** - Event tracking and debugging
4. **Session docs** - Structured learning and improvement

**Nice-to-Have:**
1. Ralph TUI runtime - Interactive execution
2. Kanban system - Visual task management
3. BMAD framework - Structured development
4. Brain v2.0 - Advanced querying

**Recommendation:**
Start with quick wins (work queue, timeline, sessions) in Week 1, then tackle semantic search and TUI runtime in Weeks 2-4.

---

**Next Action:** Implement work queue system (1 day effort)
