# Blackbox4 Discovery Index

**Last Updated:** 2026-01-15
**Purpose:** Find anything in seconds without searching

---

## 🧠 AI Navigation

**For AI:** Use the **Brain Architecture v2.0** system to understand Blackbox4's organization and make intelligent routing decisions.

- **Brain System:** `9-brain/` - Machine-native intelligence system (NEW)
- **Brain v2 Design:** `BRAIN-ARCHITECTURE-v2.md` - Complete v2.0 design specification
- **Brain v1 Reference:** `.docs/BRAIN-ARCHITECTURE.md` - Original v1 documentation
- **Routing:** Use `1-agents/.skills/1-core/intelligent-routing.md` skill for placement/discovery decisions
- **Metadata:** `9-brain/metadata/schema.yaml` - Complete metadata schema specification

**Quick AI Commands:**
```
"Use the brain system to find all [type] artifacts"
"Use intelligent-routing to determine where to place this new [type]"
"Apply BRAIN-ARCHITECTURE-v2 to understand the system structure"
"Query the brain for artifacts similar to [artifact-name]"
```

---

## Quick Answers: "Where do I find...?"

### 🚀 Most Common Questions

| I want to... | Go to... | File/Pattern | Command |
|--------------|----------|-------------|---------|
| **Create a new plan** | `.plans/active/` | `checklist.md` | `./4-scripts/planning/new-plan.sh "goal"` |
| **Find all agents** | `1-agents/` | `*.md` | `find 1-agents/ -name "*.md"` |
| **Create a new agent** | `1-agents/4-specialists/` | `*.md` | Copy from template |
| **Define agent skills** | `1-agents/.skills/` | `*.md` | `ls 1-agents/.skills/` |
| **Add shared code** | `4-scripts/lib/` | `*.py` | `ls 4-scripts/lib/` |
| **Run a script** | `4-scripts/` | `*.sh` | `./4-scripts/[script-name].sh` |
| **See runtime state** | `.runtime/` | `*.json` | `ls .runtime/` |
| **Read documentation** | `.docs/` | `*.md` | `ls .docs/` |
| **Run tests** | `8-testing/` | `test*.sh` | `./8-testing/validate-all.sh` |
| **View active plans** | `.plans/active/` | `*` | `ls .plans/active/` |
| **Check configuration** | `.config/` | `*.yaml` | `ls .config/` |
| **See system state** | `.memory/working/` | `*` | `ls .memory/working/` |

---

## By Category

### 📋 Plans & Projects

| What | Location | Key Files |
|------|----------|-----------|
| **Active plans** | `.plans/active/` | `checklist.md`, `status.md` |
| **Plan templates** | `.plans/_template/` | `README.md`, `checklist.md` |
| **Completed plans** | `.plans/completed/` | `*` |
| **Project workspace** | `7-workspace/` | `*` |

### 🤖 Agents

| What | Location | Key Files |
|------|----------|-----------|
| **All agents** | `1-agents/` | `*` |
| **Core agents** | `1-agents/1-core/` | `*.md` |
| **BMAD agents** | `1-agents/2-bmad/` | `*.md` |
| **Research agents** | `1-agents/3-research/` | `*.md` |
| **Specialist agents** | `1-agents/4-specialists/` | `*.md` |
| **Enhanced agents** | `1-agents/5-enhanced/` | `*.md` |
| **Agent skills** | `1-agents/.skills/` | `*.md` |

### 📚 Frameworks

| What | Location | Key Files |
|------|----------|-----------|
| **Framework patterns** | `2-frameworks/` | `*` |
| **BMAD methodology** | `2-frameworks/1-bmad/` | `*.md` |
| **Spec Kit patterns** | `2-frameworks/2-speckit/` | `*.md` |
| **MetaGPT templates** | `2-frameworks/3-metagpt/` | `*.md` |
| **Swarm patterns** | `2-frameworks/4-swarm/` | `*.md` |

### 🧩 Modules

| What | Location | Key Files |
|------|----------|-----------|
| **All modules** | `3-modules/` | `*` |
| **Context module** | `3-modules/context/` | `agents/*.md` |
| **Planning module** | `3-modules/planning/` | `*.md` |
| **Research module** | `3-modules/research/` | `*.md` |
| **Kanban module** | `3-modules/kanban/` | `*.md` |

### 🔧 Scripts & Libraries

| What | Location | Key Files |
|------|----------|-----------|
| **All scripts** | `4-scripts/` | `*.sh`, `*.py` |
| **Agent scripts** | `4-scripts/agents/` | `*.sh` |
| **Planning scripts** | `4-scripts/planning/` | `*.sh` |
| **Libraries** | `4-scripts/lib/` | `*/` |
| **Context Variables lib** | `4-scripts/lib/context-variables/` | `*.py` |
| **Hierarchical Tasks lib** | `4-scripts/lib/hierarchical-tasks/` | `*.py` |
| **Spec Creation lib** | `4-scripts/lib/spec-creation/` | `*.py` |
| **Ralph Runtime lib** | `4-scripts/lib/ralph-runtime/` | `*.py` |
| **Circuit Breaker lib** | `4-scripts/lib/circuit-breaker/` | `*.py` |
| **Response Analyzer lib** | `4-scripts/lib/response-analyzer/` | `*.py` |

### 📖 Documentation

| What | Location | Key Files |
|------|----------|-----------|
| **All docs** | `.docs/` | `*` |
| **Getting started** | `.docs/1-getting-started/` | `*.md` |
| **Architecture** | `.docs/2-architecture/` | `*.md` |
| **Components** | `.docs/3-components/` | `*.md` |
| **Frameworks docs** | `.docs/4-frameworks/` | `*.md` |
| **Workflows** | `.docs/5-workflows/` | `*.md` |
| **Phase 1 docs** | `.docs/phase1/` | `*.md` |
| **Phase 2 docs** | `.docs/phase2/` | `*.md` |
| **Phase 3 docs** | `.docs/phase3/` | `*.md` |
| **Phase 4 docs** | `.docs/phase4/` | `*.md` |

### 🎨 Templates

| What | Location | Key Files |
|------|----------|-----------|
| **All templates** | `5-templates/` | `*` |
| **Document templates** | `5-templates/1-documents/` | `*.md` |
| **Plan templates** | `5-templates/2-plans/` | `*` |
| **Code templates** | `5-templates/3-code/` | `*` |
| **Spec templates** | `5-templates/specs/` | `*` |

### 🛠️ Tools

| What | Location | Key Files |
|------|----------|-----------|
| **All tools** | `6-tools/` | `*` |
| **Maintenance tools** | `6-tools/maintenance/` | `*.sh` |
| **Migration tools** | `6-tools/migration/` | `*.sh` |
| **Validation tools** | `6-tools/validation/` | `*.sh` |

### 🏗️ Workspace

| What | Location | Key Files |
|------|----------|-----------|
| **Active workspace** | `7-workspace/workspace/` | `*` |
| **Projects** | `7-workspace/projects/` | `*` |
| **Artifacts** | `7-workspace/artifacts/` | `*` |
| **Benchmarks** | `7-workspace/workspace/benchmarks/` | `*` |

### 🧪 Testing

| What | Location | Key Files |
|------|----------|-----------|
| **All tests** | `8-testing/` | `*` |
| **Unit tests** | `8-testing/unit/` | `*.py` |
| **Integration tests** | `8-testing/integration/` | `*.py` |
| **Phase 3 tests** | `8-testing/phase3/` | `*.sh` |
| **Phase 4 tests** | `8-testing/phase4/` | `*.sh` |
| **E2E tests** | `8-testing/e2e/` | `*.py` |

### 🧠 Brain System (NEW)

| What | Location | Key Files |
|------|----------|-----------|
| **Brain system** | `9-brain/` | `*` |
| **Metadata schema** | `9-brain/metadata/` | `schema.yaml` |
| **Metadata examples** | `9-brain/metadata/examples/` | `*-metadata.yaml` |
| **Validator script** | `9-brain/ingest/` | `validator.py` |
| **Template generator** | `9-brain/ingest/` | `template.py` |
| **Database configs** | `9-brain/databases/` | `postgresql/`, `neo4j/` |
| **Query interface** | `9-brain/query/` | `*` |
| **Brain API** | `9-brain/api/` | `*` |
| **Brain tests** | `9-brain/tests/` | `*` |

### ⚙️ Configuration

| What | Location | Key Files |
|------|----------|-----------|
| **All config** | `.config/` | `*.yaml` |
| **Main config** | `.config/` | `blackbox4.yaml` |
| **MCP servers** | `.config/` | `mcp-servers.json` |
| **Agent registry** | `.config/` | `agents.yaml` |
| **Memory config** | `.config/` | `memory.yaml` |

### 💾 Memory & State

| What | Location | Key Files |
|------|----------|-----------|
| **Working memory** | `.memory/working/` | `*` |
| **Extended memory** | `.memory/extended/` | `*` |
| **Archival memory** | `.memory/archival/` | `*` |
| **Runtime state** | `.runtime/` | `*.json` |
| **Ralph state** | `.runtime/.ralph/` | `*` |

---

## By File Type

### Python Files (*.py)

| Location | Purpose |
|----------|---------|
| `4-scripts/lib/*/` | All libraries |
| `4-scripts/python/` | Core Python scripts |
| `1-agents/*/*.py` | Agent-specific Python code |
| `8-testing/unit/` | Unit tests |

### Shell Scripts (*.sh)

| Location | Purpose |
|----------|---------|
| `4-scripts/` | All executable scripts |
| `4-scripts/agents/` | Agent execution scripts |
| `4-scripts/planning/` | Planning scripts |
| `4-scripts/testing/` | Test scripts |
| `6-tools/*/` | Tool scripts |
| `*.sh` (root) | Wrapper scripts |

### Markdown Files (*.md)

| Location | Purpose |
|----------|---------|
| `.docs/` | Documentation |
| `1-agents/*/` | Agent definitions |
| `.plans/*/' | Plan documents |
| `*.md` (root) | System documentation |

### YAML Files (*.yaml)

| Location | Purpose |
|----------|---------|
| `.config/` | Configuration |
| `.plans/*/` | Plan metadata |
| `4-scripts/*/` | Script configuration |

### JSON Files (*.json)

| Location | Purpose |
|----------|---------|
| `.runtime/` | Runtime state |
| `.config/` | Configuration (some) |
| `.memory/` | Memory data |

---

## By Phase

### Phase 1: Context Variables

| What | Location |
|------|----------|
| **Library** | `4-scripts/lib/context-variables/` |
| **Examples** | `1-agents/4-specialists/context-examples/` |
| **Tests** | `4-scripts/testing/test-context-variables.sh` |
| **Docs** | `.docs/phase1/` or `PHASE1-COMPLETE.md` |

### Phase 2: Hierarchical Tasks

| What | Location |
|------|----------|
| **Libraries** | `4-scripts/lib/hierarchical-tasks/`, `4-scripts/lib/task-breakdown/` |
| **Examples** | `1-agents/4-specialists/hierarchical-examples/` |
| **Tests** | `4-scripts/testing/test-hierarchical-tasks.sh` |
| **Docs** | `.docs/phase2/` or `PHASE2-COMPLETE.md` |

### Phase 3: Structured Spec Creation

| What | Location |
|------|----------|
| **Library** | `4-scripts/lib/spec-creation/` |
| **Examples** | `1-agents/4-specialists/spec-examples/` |
| **Tests** | `4-scripts/testing/phase3/` |
| **Docs** | `.docs/phase3/` or `PHASE3-COMPLETE.md` |

### Phase 4: Ralph Runtime

| What | Location |
|------|----------|
| **Libraries** | `4-scripts/lib/ralph-runtime/`, `4-scripts/lib/circuit-breaker/`, `4-scripts/lib/response-analyzer/` |
| **Examples** | `1-agents/4-specialists/ralph-examples/` |
| **Tests** | `4-scripts/testing/phase4/` |
| **Docs** | `.docs/phase4/` or `PHASE4-COMPLETE.md` |

---

## Search Patterns

### Find agents by type

```bash
# Core agents
find 1-agents/1-core/ -name "*.md"

# BMAD agents
find 1-agents/2-bmad/ -name "*.md"

# Research agents
find 1-agents/3-research/ -name "*.md"

# Specialist agents
find 1-agents/4-specialists/ -name "*.md"
```

### Find libraries by phase

```bash
# Phase 1
ls 4-scripts/lib/context-variables/

# Phase 2
ls 4-scripts/lib/hierarchical-tasks/
ls 4-scripts/lib/task-breakdown/

# Phase 3
ls 4-scripts/lib/spec-creation/

# Phase 4
ls 4-scripts/lib/ralph-runtime/
ls 4-scripts/lib/circuit-breaker/
ls 4-scripts/lib/response-analyzer/
```

### Find documentation

```bash
# All docs
find .docs/ -name "*.md"

# Phase-specific docs
find .docs/phase* -name "*.md"

# Framework docs
find .docs/4-frameworks/ -name "*.md"
```

---

## Quick Reference Commands

```bash
# List all agents
ls 1-agents/*/*.md

# List all libraries
ls 4-scripts/lib/*/

# List all scripts
ls 4-scripts/*.sh

# View active plans
ls .plans/active/

# Run all tests
./8-testing/validate-all.sh

# Check system health
cat manifest.yaml

# View main config
cat .config/blackbox4.yaml

# === BRAIN SYSTEM COMMANDS (NEW) ===

# Generate metadata template
cd 9-brain/ingest
python template.py --interactive

# Validate metadata file
python validator.py path/to/metadata.yaml

# Validate all metadata in directory
python validator.py --directory 1-agents/

# Check metadata schema
python validator.py --schema

# View brain system documentation
cat 9-brain/README.md
```

---

## Brain System Workflows (NEW)

### Workflow: Add Metadata to Artifact

1. Generate metadata: `cd 9-brain/ingest && python template.py --interactive`
2. Place in artifact directory: `my-artifact/metadata.yaml`
3. Validate: `python validator.py my-artifact/metadata.yaml`
4. Commit with artifact

### Workflow: Validate All Metadata

1. Run validator: `cd 9-brain/ingest && python validator.py --directory .`
2. Fix any errors reported
3. Re-validate to confirm

### Workflow: Find Artifacts Using Brain

1. Check metadata: `find . -name "metadata.yaml"`
2. Read metadata: `cat path/to/metadata.yaml`
3. Follow relationships in metadata
4. (Future) Use query API: `curl "http://localhost:8000/api/v1/query?q=..."`

---

## Common Workflows

### Workflow: Create New Agent

1. Copy template: `1-agents/4-specialists/.template/agent.md`
2. Place in: `1-agents/4-specialists/my-agent.md`
3. Create examples: `1-agents/4-specialists/my-agent/examples/`
4. Add test: `8-testing/unit/agents/test-my-agent.md`
5. Update docs: `.docs/2-reference/agents.md`

### Workflow: Add Library

1. Create in: `4-scripts/lib/my-library/`
2. Add `__init__.py`
3. Create tests: `8-testing/unit/libraries/test-my-library.py`
4. Add examples: `1-agents/4-specialists/my-library-examples/`
5. Document: `.docs/2-reference/libraries.md`

### Workflow: Create New Plan

1. Run: `./4-scripts/planning/new-plan.sh "my goal"`
2. Location: `.plans/active/YYYY-MM-DD_HHMM_my-goal/`
3. Edit: `README.md`, `checklist.md`
4. Work: Execute tasks in `checklist.md`
5. Track: Update `status.md`

---

## Tips

1. **Use the numbered prefixes** - They indicate logical order (1-8)
2. **Check the README** - Each major directory should have a README.md
3. **Look for examples** - Most components have examples in `1-agents/4-specialists/*-examples/`
4. **Read the docs** - `.docs/` has comprehensive documentation
5. **Check the manifest** - `manifest.yaml` shows phase completion status

---

**Need help?** Check `.docs/1-getting-started/` for detailed guides.

**Found something wrong?** Update this index to help others!
