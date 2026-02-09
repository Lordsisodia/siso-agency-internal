# Blackbox4 Final Architecture

**Status**: 🎨 Final Design
**Created**: 2026-01-15
**Goal**: Simple, intuitive, agent-navigable structure

---

## 🎯 Design Principles

1. **Maximum 6-7 items per level** - Use nested folders to organize
2. **No empty folders** - Every folder has a purpose
3. **Intuitive at a glance** - Clear naming and organization
4. **Numbered folders** - For logical ordering (except dot-folders)
5. **Keep what works** - Don't change things that are already good

---

## 📁 Root Structure (5 dot-folders + 7 regular folders)

```
blackbox4/
│
├── .config/              # System configuration
├── .docs/                # ALL documentation
├── .memory/              # 3-tier memory system
├── .plans/               # Active project plans
├── .runtime/             # Runtime/state data
│
├── 1-agents/             # ALL agent definitions
├── 2-frameworks/         # Framework patterns & templates
├── 3-modules/            # Domain modules
├── 4-scripts/            # All executable scripts
├── 5-templates/          # Document/file templates
├── 6-tools/              # Helper utilities
└── 7-workspace/          # Active workspace
```

**Note**: Numbered folders (1-7) for clear ordering. Dot-folders stay unnumbered.

---

## 1️⃣ Agents Directory

### Current Problem: 17+ folders, overwhelming
### Solution: 6 logical folders with nested organization

```
1-agents/
├── README.md
│
├── 1-core/               # Core agent system
│   ├── prompt.md
│   └── templates/
│       ├── agent-template.md
│       └── runbook-template.md
│
├── 2-bmad/               # BMAD methodology (keep as-is, well-organized)
│   ├── core/
│   ├── modules/
│   └── workflows/
│
├── 3-research/           # All research agents
│   ├── deep-research/
│   ├── feature-research/
│   ├── oss-discovery/
│   └── docs-feedback/
│
├── 4-specialists/        # Specialist agents
│   ├── orchestrator/
│   ├── architect/
│   └── [other-specialists]/
│
├── 5-enhanced/           # Enhanced AI agents (Oh-My-OpenCode)
│   ├── oracle.md         # GPT-5.2 architect
│   ├── librarian.md      # Claude/Gemini researcher
│   └── explore.md        # Grok/Gemini navigator
│
└── .skills/              # Skills system (reorganized)
    ├── README.md
    │
    ├── 1-core/           # Core skills
    │   ├── deep-research.md
    │   ├── docs-routing.md
    │   ├── feedback-triage.md
    │   ├── github-cli.md
    │   ├── long-run-ops.md
    │   └── notifications.md
    │
    ├── 2-mcp/            # MCP integration skills
    │   ├── supabase.md
    │   ├── shopify.md
    │   ├── github.md
    │   ├── serena.md
    │   ├── playwright.md
    │   ├── filesystem.md
    │   └── sequential-thinking.md
    │
    └── 3-workflow/       # Workflow-specific skills
        ├── ui-cycle.md
        └── [more-workflows]/
```

### What Changed:
- **17 folders → 6 folders** (65% reduction)
- **Logical grouping**: core, bmad, research, specialists, enhanced
- **Skills reorganized**: 3 categories (core, mcp, workflow)
- **Numbered ordering**: 1-6 for clarity
- **Removed**: `_template` (moved to core/templates), `custom` (not used), `module` (empty), `expert` (empty), `simple` (empty), `ralph-agent` (moved to specialists), `ohmy-opencode` (moved to enhanced)

---

## 2️⃣ Frameworks Directory

```
2-frameworks/
├── README.md
│
├── 1-bmad/               # BMAD framework patterns
│   ├── 4-phase-methodology.md
│   ├── workflows/
│   └── agents/
│
├── 2-speckit/            # Spec Kit patterns
│   ├── slash-commands/
│   └── templates/
│
├── 3-metagpt/            # MetaGPT templates
│   └── templates/
│
└── 4-swarm/              # Swarm patterns
    ├── patterns/
    └── examples/
```

### What Changed:
- **Centralized** all framework patterns
- **Numbered** 1-4 for ordering
- **Self-contained** per framework
- **Easy to add** new frameworks

---

## 3️⃣ Modules Directory

**Keep as-is** (already well-organized):

```
3-modules/
├── README.md
├── context/
├── domain/
├── first-principles/
├── implementation/
├── kanban/
├── planning/
└── research/
```

---

## 4️⃣ Scripts Directory

**Keep as-is** (already well-organized):

```
4-scripts/
├── lib.sh
├── check-blackbox.sh
├── compact-context.sh
├── new-plan.sh
├── [... all scripts ...]
└── python/
    ├── validate-docs.py
    └── plan-status.py
```

---

## 5️⃣ Templates Directory

```
5-templates/
├── README.md
│
├── 1-documents/          # Document templates
│   ├── prd.md
│   ├── api-design.md
│   ├── competitive-analysis.md
│   └── [more-docs]/
│
├── 2-plans/              # Plan templates
│   └── plan-template.md
│
└── 3-code/               # Code templates (if needed)
    └── [code-templates]/
```

---

## 6️⃣ Tools Directory

```
6-tools/
├── README.md
├── validation/
├── migration/
└── maintenance/
```

---

## 7️⃣ Workspace Directory

**Keep as-is** (active workspace):

```
7-workspace/
├── [active-work]/
└── [more-work]/
```

---

## 📁 Dot-Folders

### .config/ - System Configuration

```
.config/
├── blackbox4.yaml
├── mcp-servers.json
├── agents.yaml
└── memory.yaml
```

### .docs/ - Unified Documentation

**Current Problem**: Empty folders, not intuitive
**Solution**: Hierarchical, no empty folders, intuitive names

```
.docs/
├── INDEX.md              # Start here
│
├── 1-getting-started/    # New user guides
│   ├── quick-start.md
│   ├── user-guide.md
│   └── agent-guide.md
│
├── 2-reference/          # Technical reference
│   ├── architecture.md
│   ├── configuration.md
│   ├── directory-structure.md
│   └── api-reference.md
│
├── 3-components/         # Component documentation
│   ├── agents.md
│   ├── skills.md
│   ├── memory.md
│   └── modules.md
│
├── 4-frameworks/         # Framework documentation
│   ├── bmad.md
│   ├── speckit.md
│   ├── metagpt.md
│   └── swarm.md
│
├── 5-workflows/          # Workflow guides
│   ├── manual-mode.md
│   ├── autonomous-mode.md
│   └── bmad-phases.md
│
└── 6-archives/           # Historical docs
    ├── analysis/
    ├── testing/
    └── roadmap/
```

### What Changed:
- **Empty folders removed**: `agents/`, `architecture/` (0B each)
- **Numbered 1-6**: Clear ordering
- **Intuitive names**: `getting-started` instead of `user-guides`
- **Hierarchical**: Easy to navigate
- **Archives at end**: Historical stuff doesn't clutter main view

### .memory/ - 3-Tier Memory

```
.memory/
├── working/              # 10MB - Active session
├── extended/             # 500MB - Project knowledge
└── archival/             # 5GB - Historical records
```

**Empty folders removed**: `agents/`, `handoffs/`, `shared/agent-updates/`

### .plans/ - Active Project Plans

```
.plans/
├── _template/
│   ├── README.md
│   ├── checklist.md
│   └── artifacts/
│
└── active/
    └── [timestamp_goal]/
        ├── README.md
        ├── checklist.md
        ├── artifacts/
        └── [ralph-files]/
```

**Moved from**: `agents/.plans/` → `.plans/`

### .runtime/ - Runtime Data

```
.runtime/
├── .ralph/               # Ralph state
├── cache/
├── locks/
└── state/
```

---

## 📊 Before vs After

| Aspect | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Root folders** | 13 (scattered) | 12 (organized) | ✅ Logical |
| **Dot-folders** | 4 | 5 | ✅ Complete |
| **Agents categories** | 17+ | 6 | ✅ **65% reduction** |
| **Skills categories** | Flat (19 files) | 3 categories | ✅ Organized |
| **Documentation** | Flat, empty dirs | Numbered, hierarchical | ✅ Intuitive |
| **Empty folders** | 6+ | 0 | ✅ None |
| **Max items per level** | 17+ | 6-7 | ✅ Navigable |

---

## ✅ Key Benefits

### 1. **Intuitive at a Glance**
- **Numbered folders**: 1-7 ordering
- **Logical names**: Core, BMAD, Research, etc.
- **Max 7 items**: Never overwhelming

### 2. **Scalable**
- **Nested organization**: Easy to add more
- **Clear hierarchy**: Know where things go
- **Framework-agnostic**: Easy to add new frameworks

### 3. **Agent-Navigable**
- **Predictable paths**: Always know where to look
- **Clear purpose**: Each folder has one job
- **No empty dirs**: Only what's needed

### 4. **Easy to Maintain**
- **Consistent structure**: Same pattern everywhere
- **Numbered ordering**: No ambiguity
- **Clear naming**: No confusion

---

## 🚀 Migration Checklist

### Phase 1: Create New Structure
```bash
cd blackbox4

# Create numbered folders
mkdir -p 1-agents 2-frameworks 3-modules 4-scripts 5-templates 6-tools 7-workspace

# Create dot-folders
mkdir -p .config .docs .memory .plans .runtime
```

### Phase 2: Reorganize Agents (6 folders)
```bash
cd 1-agents

# Create new structure
mkdir -p 1-core 2-bmad 3-research 4-specialists 5-enhanced
mkdir -p .skills/{1-core,2-mcp,3-workflow}

# Move content
mv _core/* 1-core/
mv _template/templates 1-core/
mv bmad/* 2-bmad/
mv deep-research feature-research oss-discovery docs-feedback 3-research/
mv orchestrator ralph-agent 4-specialists/
mv ohmy-opencode/* 5-enhanced/
```

### Phase 3: Reorganize Skills
```bash
cd .skills

# Move core skills
mv {deep-research,docs-routing,feedback-triage,github-cli,long-run-ops,notifications-*} 1-core/

# MCP skills already organized
mv mcp-skills/* 2-mcp/

# Workflow skills
mv ui-cycle 3-workflow/
```

### Phase 4: Reorganize Documentation
```bash
cd .docs

# Create numbered structure
mkdir -p {1-getting-started,2-reference,3-components,4-frameworks,5-workflows,6-archives}

# Move content
mv user-guides/* 1-getting-started/
mv {reference,architecture,extra-docs}/* 2-reference/
mv {agents,memory,modules} 3-components/
mv testing roadmap 6-archives/
# etc...
```

### Phase 5: Move Plans
```bash
# Move plans to top-level
mv agents/.plans/* .plans/active/
```

---

## 🎯 Success Criteria

✅ **Maximum 7 items per level** (except in deep archives)
✅ **No empty folders**
✅ **Numbered folders** 1-7 for ordering
✅ **Intuitive names** at a glance
✅ **Nested organization** for scalability
✅ **Agents**: 17 folders → 6 folders
✅ **Skills**: Flat → 3 categories
✅ **Documentation**: Empty dirs removed, hierarchical

---

**Status**: ✅ Final Design - Ready for Implementation
**Next**: Review and approve, then execute migration

---

## 🤔 Questions for Review

1. **Numbered folders** - Do you like 1-7 numbering for clear ordering?
2. **6 agent categories** - Core, BMAD, Research, Specialists, Enhanced - does this make sense?
3. **3 skill categories** - Core, MCP, Workflow - is this the right split?
4. **Documentation structure** - 1-6 numbered sections - intuitive?
5. **Any other concerns** with this layout?
