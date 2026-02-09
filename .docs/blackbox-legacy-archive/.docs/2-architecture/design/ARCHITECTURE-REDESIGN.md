# Blackbox4 Architecture Redesign

**Status**: 🎨 Design Phase
**Created**: 2026-01-15
**Goal**: Design scalable, agent-navigable architecture for Blackbox4

---

## 🔍 Current Blackbox3 Issues Found

### Issue 1: Too Many Root Directories (13 total)
**Current**:
```
.config/
.docs/
.memory/
.ralph/
agents/
core/
modules/
ralph/          # DUPLICATE of .ralph/
research/
scripts/
shared/
test/
tools/
workspace/
```

**Problems**:
- **13 directories** is too many for quick navigation
- **`ralph/` and `.ralph/` are duplicated** (ralph/ = 23MB, .ralph/ = 16KB config)
- **No clear separation** between "system" and "user" spaces
- **Agents are scattered** across multiple locations

---

### Issue 2: Documentation System Not Scalable
**Current `.docs/` structure**:
```
.docs/
├── agents/              # EMPTY (0B)
├── architecture/        # EMPTY (0B)
├── benchmark/          # 32K
├── extra-docs/         # 72K
├── first-principles/   # 20K
├── improvement/        # 8K
├── memory/             # 16K
├── reference/          # 28K
├── roadmap/            # 132K
├── testing/            # 72K
├── user-guides/        # 56K
├── workflows/          # 48K
└── analysis/           # 128K
```

**Problems**:
- **Empty directories** (`agents/`, `architecture/`) confuse navigation
- **Inconsistent categorization** (what goes where?)
- **Flat structure** doesn't scale as we add frameworks
- **No clear hierarchy** for agents vs workflows vs architecture

---

### Issue 3: Empty Memory Folders
**Current `.memory/` structure**:
```
.memory/
├── agents/              # EMPTY
├── handoffs/            # EMPTY
└── shared/
    └── agent-updates/   # EMPTY
```

**Problems**:
- **All agent memory folders are empty**
- **Unclear purpose** vs. the actual memory system
- **Not integrated** with current workflows

---

### Issue 4: Ralph Integration Confusing
**Current situation**:
```
ralph/          # 23MB - Full Ralph clone
.ralph/         # 16KB - Config only
agents/
└── ralph-agent/   # Another Ralph integration
```

**Problems**:
- **Three Ralph locations** instead of one
- **Unclear which to use**
- **`ralph/` is a full git clone** (should be external)
- **Configuration scattered** across multiple places

---

### Issue 5: Agents Directory Overwhelming
**Current `agents/` structure** (363 files):
```
agents/
├── _core/              # Core agent templates
├── _template/          # Agent templates
├── .plans/             # 15+ plan directories
├── .skills/            # Skills system
├── .timeline/          # Timeline tracking
├── bmad/               # BMAD agents
├── custom/             # Custom agents
├── deep-research/      # Research agents
├── docs-feedback/      # Feedback agents
├── expert/             # Expert agents
├── feature-research/   # Feature research
├── module/             # Module agents
├── ohmy-opencode/      # OpenCode agents
├── orchestrator/       # Orchestrator agents
├── oss-discovery/      # OSS discovery
├── ralph-agent/        # Ralph agents (duplicate?)
└── simple/             # Simple agents
```

**Problems**:
- **18+ agent categories** - too many to navigate quickly
- **Inconsistent naming** (some with dashes, some without)
- **No clear hierarchy** or purpose grouping
- **Mixed concerns** (agents vs plans vs skills vs timeline)

---

## 🎯 Design Principles for Blackbox4

### 1. **Agent-Navigable Structure**
- Clear, predictable paths
- Maximum 6 dot-folders (system)
- Maximum 6-10 regular folders (user)
- Logical grouping by function

### 2. **Scalable Organization**
- Hierarchical, not flat
- Clear expansion points for new frameworks
- No empty directories
- Consistent naming conventions

### 3. **Separation of Concerns**
- System vs. user space
- Runtime vs. documentation
- Agents vs. plans vs. skills
- Code vs. configuration vs. data

### 4. **Framework Agnostic**
- Easy to add new frameworks
- Clear integration points
- Minimal framework-specific clutter

---

## 🏗️ Proposed Blackbox4 Structure

### Root Layout (6 dot-folders + 8 regular folders)

```
blackbox4/
│
├── .config/              # System configuration
├── .docs/                # ALL documentation (unified)
├── .memory/              # 3-tier memory system
├── .opencode/            # Oh-My-OpenCode integration
├── .plans/               # Active project plans
└── .runtime/             # Runtime/state data
│
├── agents/               # ALL agent definitions
├── frameworks/           # Framework patterns & templates
├── modules/              # Domain modules
├── scripts/              # ALL executable scripts
├── templates/            # Document/file templates
└── tools/                # Helper utilities
```

---

## 📁 Detailed Structure

### 1. Dot-Folders (System Space)

#### `.config/` - System Configuration
```
.config/
├── blackbox4.yaml           # Main configuration
├── mcp-servers.json         # MCP server configs
├── agents.yaml              # Agent registry
├── memory.yaml              # Memory configuration
└── frameworks.yaml          # Framework integration settings
```

**Rationale**: All system configuration in one place. Easy to backup, version control, and modify.

---

#### `.docs/` - Unified Documentation
```
.docs/
├── INDEX.md                 # Master documentation index
│
├── guides/                  # User guides (HOW-TO)
│   ├── quick-start.md
│   ├── user-guide.md
│   ├── agent-guide.md
│   └── framework-guide.md
│
├── reference/               # Technical reference
│   ├── architecture.md      # System architecture
│   ├── api-reference.md     # API documentation
│   ├── configuration.md     # Config reference
│   └── directory-structure.md
│
├── components/              # Component documentation
│   ├── agents/              # Agent system docs
│   ├── skills/              # Skills system docs
│   ├── memory/              # Memory system docs
│   ├── modules/             # Module docs
│   └── ralph/               # Ralph integration docs
│
├── frameworks/              # Framework-specific docs
│   ├── bmad/                # BMAD methodology
│   ├── speckit/             # Spec Kit patterns
│   ├── metagpt/             # MetaGPT templates
│   └── swarm/               # Swarm patterns
│
├── workflows/               # Workflow documentation
│   ├── manual-mode.md       # Manual workflow
│   ├── autonomous-mode.md   # Autonomous workflow
│   ├── bmad-phases.md       # BMAD 4-phase
│   └── examples/            # Workflow examples
│
└── changelog/               # Version history
    └── CHANGELOG.md
```

**Rationale**:
- **Hierarchical** structure scales well
- **Clear separation**: guides vs reference vs components
- **No empty dirs** - only create when content exists
- **Easy to add** new framework docs under `frameworks/`

---

#### `.memory/` - 3-Tier Memory System
```
.memory/
├── working/                 # 10MB - Active session
│   ├── current-session.md
│   └── compact/             # Auto-compacted sessions
│
├── extended/                # 500MB - Project knowledge
│   ├── chroma-db/           # Vector database
│   ├── entities.json        # Knowledge graph
│   └── goals.json          # Goal tracking
│
└── archival/                # 5GB - Historical records
    ├── sessions/            # Session history
    └── projects/            # Project archives
```

**Rationale**:
- **Remove empty folders** (`agents/`, `handoffs/`)
- **Clear 3-tier hierarchy**
- **Aligned with actual usage**
- **Easy to understand**: working → extended → archival

---

#### `.opencode/` - Oh-My-OpenCode Integration
```
.opencode/
├── mcp-servers.json         # MCP server configurations
├── background-tasks.json    # Background task queue
├── keywords.json            # Magic word definitions
├── sessions/                # Session metadata
└── agents/                  # Enhanced agent definitions
    ├── oracle.agent.yaml    # GPT-5.2 architect
    ├── librarian.agent.yaml # Claude/Gemini researcher
    └── explore.agent.yaml   # Grok/Gemini navigator
```

**Rationale**:
- **Self-contained** OpenCode integration
- **Clear separation** from base agents
- **Easy to enable/disable**
- **All OpenCode config in one place**

---

#### `.plans/` - Active Project Plans
```
.plans/
├── _template/               # Plan template
│   ├── README.md
│   ├── checklist.md
│   ├── status.md
│   └── artifacts/
│
└── active/                  # Active projects
    ├── YYYY-MM-DD_HHMM_goal-name/
    │   ├── README.md
    │   ├── checklist.md
    │   ├── status.md
    │   ├── artifacts/
    │   ├── PROMPT.md         # Generated (for Ralph)
    │   └── @fix_plan.md      # Generated (for Ralph)
    └── ...
```

**Rationale**:
- **Moved from `agents/.plans/`** to reduce clutter in agents/
- **Clear purpose**: this is where WORK happens
- **Template included** for easy plan creation
- **Ralph files** kept with plans (generated)

---

#### `.runtime/` - Runtime/State Data
```
.runtime/
├── .ralph/                  # Ralph runtime state
│   ├── exit-state.json
│   ├── last-response.md
│   └── logs/
│
├── cache/                   # Runtime cache
├── locks/                   # Process locks
└── state/                   # Application state
```

**Rationale**:
- **All runtime data in one place**
- **Ralph state** clearly separated from config
- **Easy to ignore** in version control
- **Clear what's runtime** vs. what's configuration

---

### 2. Regular Folders (User Space)

#### `agents/` - ALL Agent Definitions (Reorganized)
```
agents/
├── _registry.yaml           # Master agent registry
│
├── core/                    # Core agent system
│   ├── prompt.md           # Base agent template
│   ├── protocols/          # Agent protocols
│   └── behaviors/          # Shared behaviors
│
├── standard/                # Standard agent library
│   ├── bmad/               # BMAD methodology agents (12+)
│   ├── enhanced/           # Oracle, Librarian, Explore
│   ├── research/           # Deep-research, feature-research
│   ├── validation/         # Vendor-swap, multi-tenant validators
│   └── specialist/         # Domain-specific specialists
│
├── custom/                  # User-defined agents
│   └── [your-agents]/
│
└── .skills/                 # Skills system
    ├── _registry.yaml
    ├── core/               # Core skills (9 files)
    └── mcp/                # MCP-specific skills (10 files)
```

**Key Changes**:
- **Reduced from 18+ categories to 4 logical groups**
- **`core/`**: Base templates and protocols
- **`standard/`**: All built-in agents (BMAD, enhanced, research, validation, specialist)
- **`custom/`**: User's own agents
- **`.skills/`**: Skills system (stays as-is)

**Rationale**:
- **Logical grouping**: by purpose, not by framework
- **Easy navigation**: 4 folders instead of 18
- **Scalable**: new agents go into appropriate `standard/` subfolder
- **Clear expansion**: users add to `custom/`

---

#### `frameworks/` - Framework Patterns & Templates
```
frameworks/
├── bmad/                    # BMAD Framework
│   ├── README.md
│   ├── agents/             # Agent definitions
│   ├── workflows/          # 4-phase workflows
│   └── templates/          # BMAD templates
│
├── speckit/                 # Spec Kit Patterns
│   ├── README.md
│   ├── slash-commands/     # Command patterns
│   └── templates/          # Spec templates
│
├── metagpt/                 # MetaGPT Templates
│   ├── README.md
│   └── templates/          # Document templates
│
├── swarm/                   # Swarm Patterns
│   ├── README.md
│   ├── patterns/           # Swarm patterns
│   └── examples/           # Usage examples
│
└── [new-frameworks]/        # Easy to add more
    └── ...
```

**Rationale**:
- **One place** for all framework patterns
- **Self-contained** per framework
- **Easy to add** new frameworks
- **Clear separation**: patterns vs. implementation

---

#### `modules/` - Domain Modules (Keep as-is)
```
modules/
├── context/                 # Context management
├── domain/                  # Domain knowledge
├── first-principles/        # First-principles reasoning
├── implementation/          # Implementation patterns
├── kanban/                  # Task board management
├── planning/                # Planning patterns
└── research/                # Research patterns
```

**Rationale**:
- **Working well** in Blackbox3
- **Clear purpose**
- **Scalable**
- **Keep as-is**

---

#### `scripts/` - ALL Executable Scripts (Keep as-is)
```
scripts/
├── lib.sh                    # Shared utilities
├── check-blackbox.sh         # System validation
├── compact-context.sh        # Auto-compression
├── new-plan.sh              # Plan creation
├── [... 5,810+ lines of bash ...]
└── python/                  # Python scripts
    ├── validate-docs.py
    └── plan-status.py
```

**Rationale**:
- **Working well** in Blackbox3
- **All scripts in one place**
- **Keep as-is**

---

#### `templates/` - Document/File Templates
```
templates/
├── documents/               # Document templates
│   ├── prd.md              # PRD template
│   ├── api-design.md       # API design template
│   ├── competitive-analysis.md
│   └── [more-docs]/
│
├── plans/                   # Plan templates
│   └── plan-template.md
│
└── code/                    # Code templates (if needed)
    └── [code-templates]/
```

**Rationale**:
- **Centralized template library**
- **Easy to find and use**
- **Clear separation**: documents vs. plans vs. code

---

#### `tools/` - Helper Utilities
```
tools/
├── validation/              # Validation tools
├── migration/               # Migration scripts
├── maintenance/             # Maintenance utilities
└── [more-tools]/
```

**Rationale**:
- **Non-script tools** (scripts go in `scripts/`)
- **Helper utilities**
- **Easy to extend**

---

## 🔄 Integration Points

### Ralph Integration
**Current (confusing)**:
```
ralph/          # 23MB git clone
.ralph/         # 16KB config
agents/ralph-agent/  # Another integration
```

**Proposed (clean)**:
```
.ralph/                 # External (symlink to ralph-claude-code/)
.runtime/.ralph/        # Runtime state only
agents/standard/enhanced/  # Enhanced agents (Oracle, Librarian, Explore)
```

**Action**:
1. **Remove** `ralph/` (full git clone) - keep as external
2. **Symlink** `.ralph/` to external `ralph-claude-code/.ralph/`
3. **Consolidate** Ralph agents into `agents/standard/enhanced/`
4. **Move** runtime state to `.runtime/.ralph/`

---

## 📊 Comparison: Before vs After

| Aspect | Blackbox3 | Blackbox4 (Proposed) | Improvement |
|--------|-----------|---------------------|-------------|
| **Root directories** | 13 | 14 (6 dot + 8 regular) | ✅ Better organized |
| **Dot-folders** | 4 | 6 | ✅ Clear system space |
| **Empty folders** | 3+ | 0 | ✅ No empty dirs |
| **Agent categories** | 18+ | 4 | ✅ 78% reduction |
| **Documentation** | Flat, scattered | Hierarchical, unified | ✅ Scalable |
| **Ralph locations** | 3 | 1 (symlinked) | ✅ Consolidated |
| **Framework docs** | Multiple places | One `frameworks/` folder | ✅ Centralized |
| **Plans location** | In `agents/.plans/` | Top-level `.plans/` | ✅ Easier access |

---

## ✅ Benefits of New Structure

### 1. **Agent-Navigable**
- **Predictable paths**: Always know where things are
- **Logical grouping**: By function, not by framework
- **Clear hierarchy**: Easy to understand relationships

### 2. **Scalable**
- **Easy to add**: New frameworks go in `frameworks/`
- **Easy to extend**: New agents go in `agents/standard/` or `agents/custom/`
- **No flat structures**: Hierarchical organization scales infinitely

### 3. **Maintainable**
- **No duplicates**: One place for everything
- **No empty dirs**: Only create when needed
- **Clear naming**: Consistent conventions

### 4. **Framework Agnostic**
- **Modular**: Easy to add/remove frameworks
- **Clear integration points**: `.opencode/`, `frameworks/`, `agents/standard/`
- **Minimal coupling**: Frameworks don't pollute root

---

## 🚀 Migration Strategy

### Phase 1: Create New Structure (5 min)
```bash
cd blackbox4

# Create dot-folders
mkdir -p .config .docs .memory .opencode .plans .runtime

# Create regular folders
mkdir -p agents frameworks modules scripts templates tools

# Create substructures (see detailed structure above)
```

### Phase 2: Move Content (10 min)
```bash
# Move documentation to unified .docs/
# (Reorganize from scattered locations)

# Move plans to top-level .plans/
mv agents/.plans/* .plans/active/

# Move Ralph config to .ralph/ (as symlink)
# (Remove ralph/ git clone)

# Reorganize agents into 4 categories
# (core/, standard/, custom/, .skills/)
```

### Phase 3: Update References (5 min)
```bash
# Update script paths
# Update documentation links
# Update configuration files
```

### Phase 4: Validate (2 min)
```bash
# Run validation checks
# Test navigation
# Verify all content moved
```

---

## 🎯 Success Criteria

The new architecture is successful when:

1. ✅ **Maximum 6 dot-folders** at root
2. ✅ **Maximum 10 regular folders** at root
3. ✅ **No empty directories**
4. ✅ **Agents organized into 4 logical groups**
5. ✅ **Documentation unified in `.docs/`**
6. ✅ **Ralph consolidated to one location**
7. ✅ **Framework patterns in `frameworks/`**
8. ✅ **Plans at top-level `.plans/`**
9. ✅ **All references updated**
10. ✅ **Easy to add new frameworks**

---

## 📝 Next Steps

1. ✅ **Review this design** - Does it meet your needs?
2. ✅ **Create migration script** - Automate the moves
3. ✅ **Execute migration** - Build new structure
4. ✅ **Validate** - Ensure everything works
5. ✅ **Document** - Update all references

---

**Status**: ✅ Design Complete - Ready for Review
**Questions for discussion**:
- Do you agree with the 6 dot-folder limit?
- Should plans be at `.plans/` or stay in `agents/`?
- Should Ralph be a symlink or a wrapper?
- Any other concerns with this structure?
