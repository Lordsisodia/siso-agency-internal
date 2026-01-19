# BlackBox5 Memory Separation Implementation Plan

**Date:** 2025-01-18
**Status:** Planning Phase
**Version:** 1.0.0

---

## Executive Summary

This plan outlines the separation of memory from the BlackBox5 engine to achieve:
1. **Per-project memory** - Each project has its own brain/memory
2. **Shared engine** - Engine code is framework-agnostic and reusable
3. **Template system** - Engine provides memory templates for initialization
4. **Clear separation** - Memory data lives outside the engine directory

---

## Analysis Summary

### Current State

```
.blackbox5/engine/
├── memory/              # ❌ Currently in engine (should be per-project)
│   ├── agents/
│   ├── working/
│   ├── extended/
│   ├── archival/
│   └── memory-bank/
├── brain/               # ✅ Correctly separated (knowledge graph system)
├── .agents/            # ✅ Agent definitions
├── .skills/            # ✅ Skill definitions
└── .workflows/         # ✅ Workflow templates
```

### Target State

```
.blackbox5/
├── engine/             # ✅ Shared engine (framework-agnostic)
│   ├── .agents/       # Agent definitions
│   ├── .skills/       # Skill definitions
│   ├── .workflows/    # Workflow templates
│   ├── brain/         # Brain system (metadata, search)
│   ├── runtime/       # Runtime scripts
│   └── templates/     # 🆕 Memory templates
│       ├── memory/    # Memory structure templates
│       └── config/    # Configuration templates
│
├── memory/            # 🆕 Per-project memory (gitignored)
│   ├── working/       # Active session data
│   ├── extended/      # Semantic search index
│   ├── archival/      # Historical data
│   └── brain-index/   # Project brain index
│
└── config.yml         # 🆕 Project configuration
```

---

## Architecture Design

### 1. Three-Tier Memory System

Based on BlackBox4's proven architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    BLACKBOX5 MEMORY SYSTEM                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TIER 1: Working Memory (10 MB)                             │
│  ├── Active session state                                   │
│  ├── Agent handoffs                                         │
│  ├── Shared context                                         │
│  └── Auto-compaction when full                              │
│                                                              │
│  TIER 2: Extended Memory (500 MB)                           │
│  ├── ChromaDB/Vector store                                  │
│  ├── Semantic search capabilities                           │
│  ├── Project state persistence                              │
│  └── Timeline and work queue                                │
│                                                              │
│  TIER 3: Archival Memory (5 GB)                             │
│  ├── Project history                                        │
│  ├── Session archives                                       │
│  └── Cold storage for reference                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Memory vs Brain Separation

**Memory** (Runtime Data):
- Per-project working state
- Session data and context
- Agent interactions
- Task history
- Gitignored (not committed)

**Brain** (Knowledge System):
- Metadata schema
- Semantic search index
- Relationship graph
- Shared across projects
- Committed to repository

### 3. Configuration Structure

```yaml
# .blackbox5/config.yml (per-project)
project:
  name: "my-project"
  version: "1.0.0"

# Engine reference (shared)
engine:
  path: "../shared/blackbox5-engine"  # Or installed location
  version: "5.0.0"

# Memory configuration (per-project)
memory:
  working:
    path: "./memory/working"
    max_size_mb: 10
    auto_compact: true
  extended:
    path: "./memory/extended"
    backend: "chromadb"
    max_size_mb: 500
  archival:
    path: "./memory/archival"
    max_size_gb: 5

# Brain configuration (shared or per-project)
brain:
  enabled: true
  index_path: "./memory/brain-index"
  search_backend: "chromadb"
  auto_index: true
  index_paths:
    - "src/"
    - "docs/"
    - ".blackbox5/memory/working/"
```

---

## Implementation Plan

### Phase 1: Template System Setup

**Objective:** Create memory templates in the engine

**Tasks:**
1. Create `.blackbox5/engine/templates/memory/` directory structure
2. Create template files for each memory tier
3. Create initialization scripts
4. Create configuration templates

**Deliverables:**
- `.blackbox5/engine/templates/memory/working/README.md`
- `.blackbox5/engine/templates/memory/extended/README.md`
- `.blackbox5/engine/templates/memory/archival/README.md`
- `.blackbox5/engine/templates/memory/init-memory.py`
- `.blackbox5/engine/templates/config.example.yml`

**Success Criteria:**
- Templates can be copied to create new project memory
- All documentation is clear and comprehensive
- Initialization script works standalone

---

### Phase 2: Move Memory Templates

**Objective:** Move current memory structure to templates

**Tasks:**
1. Copy `.blackbox5/engine/memory/` to `.blackbox5/engine/templates/memory/`
2. Remove project-specific data (keep only structure)
3. Update all documentation to reflect template nature
4. Add initialization instructions

**Deliverables:**
- Clean template structure
- Updated README files
- Migration guide for existing projects

**Success Criteria:**
- Templates contain no project-specific data
- Documentation clearly explains template vs instance

---

### Phase 3: Update Engine Code

**Objective:** Update engine to use configurable memory paths

**Tasks:**
1. Update `.blackbox5/engine/core/` to read memory paths from config
2. Update `.blackbox5/engine/runtime/` scripts for flexible paths
3. Add memory initialization check on startup
4. Update brain system for flexible index paths

**Files to Modify:**
- `.blackbox5/engine/core/manifest.py` - Update memory path resolution
- `.blackbox5/engine/runtime/memory/auto-compact.sh` - Use config paths
- `.blackbox5/engine/brain/ingest/ingester.py` - Flexible index paths
- All memory-related imports and references

**Success Criteria:**
- Engine runs with any memory path configuration
- No hardcoded memory paths in engine code
- Backward compatibility maintained

---

### Phase 4: Create Migration Script

**Objective:** Help existing projects migrate to new structure

**Tasks:**
1. Create script to detect old structure
2. Backup existing memory
3. Create new memory structure from templates
4. Migrate data to new structure
5. Update configuration file
6. Clean up old structure (optional)

**Deliverables:**
- `.blackbox5/engine/scripts/migrate-memory.sh`
- Migration documentation
- Rollback capabilities

**Success Criteria:**
- Zero data loss during migration
- Works on existing BlackBox5 projects
- Clear progress reporting

---

### Phase 5: Update Documentation

**Objective:** Document new architecture and usage

**Tasks:**
1. Update `.blackbox5/engine/README.md` with new structure
2. Create memory architecture documentation
3. Update quick start guides
4. Create troubleshooting guide

**Deliverables:**
- `.blackbox5/docs/MEMORY-ARCHITECTURE.md`
- `.blackbox5/docs/MEMRY-MIGRATION-GUIDE.md`
- Updated `.blackbox5/engine/README.md`

**Success Criteria:**
- New users can set up memory from scratch
- Existing users can migrate without issues
- All edge cases documented

---

## Directory Structure

### Final Engine Structure

```
.blackbox5/engine/
├── .agents/                 # Agent definitions
├── .skills/                 # Skill definitions
├── .workflows/              # Workflow templates
├── brain/                   # Brain system (metadata, search)
├── core/                    # Core engine code
├── runtime/                 # Runtime scripts
├── frameworks/              # Framework implementations
├── templates/               # 🆕 Template system
│   ├── memory/             # Memory structure templates
│   │   ├── working/
│   │   ├── extended/
│   │   ├── archival/
│   │   └── init-memory.py
│   └── config/
│       └── config.example.yml
├── scripts/                 # 🆕 Utility scripts
│   ├── migrate-memory.sh
│   └── init-project.sh
├── api/                     # API server
├── tools/                   # Tools and utilities
└── README.md
```

### Per-Project Structure

```
my-project/
├── .blackbox5/
│   ├── config.yml          # Project configuration
│   └── memory/             # Project memory (gitignored)
│       ├── working/        # Active session data
│       ├── extended/       # Semantic search index
│       ├── archival/       # Historical data
│       └── brain-index/    # Project brain index
└── src/                    # Project source code
```

---

## Configuration Example

### Minimal Project Config

```yaml
# .blackbox5/config.yml
project:
  name: "my-project"

engine:
  version: "5.0.0"

memory:
  working: "./memory/working"
  extended: "./memory/extended"
  archival: "./memory/archival"

brain:
  enabled: true
  index_path: "./memory/brain-index"
```

### Advanced Project Config

```yaml
# .blackbox5/config.yml
project:
  name: "my-project"
  version: "1.0.0"

engine:
  path: "../shared/blackbox5-engine"
  version: "5.0.0"

# Memory tiers
memory:
  working:
    path: "./memory/working"
    max_size_mb: 10
    auto_compact: true
    compact_threshold: 0.9

  extended:
    path: "./memory/extended"
    backend: "chromadb"
    max_size_mb: 500
    embedding_model: "nomic-ai/nomic-embed-text-v1"

  archival:
    path: "./memory/archival"
    max_size_gb: 5
    compression: "gzip"

# Brain configuration
brain:
  enabled: true
  index_path: "./memory/brain-index"
  search_backend: "chromadb"
  auto_index: true
  index_paths:
    - "src/"
    - "docs/"
    - "tests/"
  exclude_patterns:
    - "node_modules/"
    - "*.pyc"
    - ".git/"

# Services
services:
  brain:
    enabled: true
    lazy: true
  agents:
    enabled: true
    lazy: true
```

---

## Key Insights from BlackBox4

### What Worked Well

1. **Dot-directory structure** - `.memory/` clearly separate from code
2. **Configuration-driven** - Paths configurable, not hardcoded
3. **Metadata-first** - Every artifact has structured metadata
4. **Semantic search** - Vector embeddings for intelligent retrieval
5. **Auto-scaling** - Tier-aware management policies
6. **Clear separation** - Brain vs Memory vs State

### What to Avoid

1. **Hardcoded paths** - Makes engine inflexible
2. **Mixed concerns** - Don't put data in engine directory
3. **Tight coupling** - Engine should work with any memory backend
4. **Manual management** - Automate memory tier management

---

## Migration Strategy

### For New Projects

```bash
# 1. Create project directory
mkdir my-project && cd my-project

# 2. Initialize BlackBox5
blackbox5 init

# 3. Creates:
#    - .blackbox5/config.yml
#    - .blackbox5/memory/ (from templates)
#    - .blackbox5/memory/brain-index/
```

### For Existing Projects

```bash
# 1. Backup current setup
cp -r .blackbox5 .blackbox5.backup

# 2. Run migration script
.blackbox5/engine/scripts/migrate-memory.sh

# 3. Review changes
cat .blackbox5/config.yml

# 4. Test engine
blackbox5 doctor

# 5. Remove backup if successful
rm -rf .blackbox5.backup
```

---

## Success Metrics

### Technical Metrics
- [ ] Zero hardcoded memory paths in engine code
- [ ] Memory initialization works from templates
- [ ] Configuration file controls all memory paths
- [ ] Migration script completes without data loss
- [ ] Brain system indexes project memory correctly

### User Experience Metrics
- [ ] New project setup takes < 5 minutes
- [ ] Existing project migration takes < 10 minutes
- [ ] Documentation is clear and comprehensive
- [ ] Error messages are helpful and actionable

### Architecture Metrics
- [ ] Clear separation between engine and memory
- [ ] Engine is framework-agnostic
- [ ] Memory is per-project
- [ ] Templates are reusable
- [ ] Configuration is flexible

---

## Risk Mitigation

### Risk 1: Breaking Existing Projects

**Mitigation:**
- Comprehensive migration script
- Backup before migration
- Rollback capabilities
- Extensive testing

### Risk 2: Configuration Complexity

**Mitigation:**
- Sensible defaults
- Interactive setup wizard
- Configuration validation
- Clear examples

### Risk 3: Data Loss During Migration

**Mitigation:**
- Read-only migration (copy, don't move)
- Verification steps
- Backup requirements
- Test migrations

---

## Next Steps

1. **Review and approve this plan** - Get stakeholder alignment
2. **Set up development environment** - Create test project
3. **Begin Phase 1** - Create template system
4. **Test each phase** - Ensure quality before proceeding
5. **Gather feedback** - Iterate based on testing

---

## Questions for Discussion

1. **Engine Location:** Should engine be installed globally or per-project?
2. **Configuration Format:** YAML vs JSON vs TOML?
3. **Memory Defaults:** What are sensible defaults for each tier?
4. **Backward Compatibility:** How long to support old structure?
5. **Brain Indexing:** Should brain index be in memory or separate?

---

**Status:** Ready for Review
**Next Action:** Stakeholder approval and Phase 1 kickoff
