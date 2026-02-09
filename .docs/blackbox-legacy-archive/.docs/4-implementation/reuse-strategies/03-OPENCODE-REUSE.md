# 03 - Oh-My-OpenCode Reuse Strategy

**Status:** ✅ Ready to Copy (PATH UPDATES ONLY)
**Source:** `Open Code/`
**Destination:** `blackbox4/`

**Action:** Copy components, update paths with sed. No code rewriting.

---

## 📦 What You're Getting

### A. MCP Integration System

**Source:** `Open Code/.opencode/`

**Components:**

| Component | Size | Purpose | Action |
|-----------|------|---------|--------|
| `mcp-servers.json` | ~5KB | MCP server configurations | Copy |
| `background-tasks.json` | ~3KB | Background task queue | Copy |
| `sessions/` | Variable | Session metadata | Copy |

**What it does:**
- Manages 8+ curated MCP servers
- Queues and executes background tasks
- Tracks session state and metadata

---

### B. Enhanced Agents (Oracle, Librarian, Explore)

**Source:** `Open Code/agents_summary.md`

**Agents:**

| Agent | Model | Purpose | Files |
|-------|-------|---------|-------|
| **Oracle** | GPT-5.2 | Architecture expert | agent.yaml, prompt.md, examples/ |
| **Librarian** | Claude/Gemini | Research specialist | agent.yaml, prompt.md, workflows/ |
| **Explore** | Grok/Gemini | Codebase navigator | agent.yaml, prompt.md, tools/ |

**What they do:**
- **Oracle**: Architecture review, pattern detection, system design guidance
- **Librarian**: Deep research, documentation lookup, cross-reference
- **Explore**: Fast codebase navigation, semantic search, find anything

---

### C. LSP Tools (10+ IDE Superpowers)

**Source:** `Open Code/.opencode/lsp-tools.json` (in MCP)

**Tools:**

| Tool | Purpose | Action |
|------|---------|--------|
| Navigation | Jump to definitions, references | Copy |
| Search | Find symbols, files, text | Copy |
| Refactor | Safe code transformations | Copy |
| Diagnostics | Error/warning analysis | Copy |
| Hover | Quick info on hover | Copy |
| Completion | Auto-completion suggestions | Copy |
| Signature | Function/method signatures | Copy |
| Documentations | Access documentation | Copy |
| Code Actions | Quick fixes and refactorings | Copy |
| Inlay Hints | Inline type info | Copy |

**What it does:** Gives agents IDE-level code understanding capabilities.

---

### D. Skills System (19 Total)

**Source:** `Open Code/.opencode/skills/`

**Structure:**

```
skills/
├── core/                      # Core skills (9 files)
│   ├── deep-research.md
│   ├── docs-routing.md
│   ├── feedback-triage.md
│   ├── github-cli.md
│   ├── long-run-ops.md
│   ├── notifications-local.md
│   ├── notifications-mobile.md
│   └── notifications-telegram.md
└── mcp/                        # MCP-specific skills (10 files)
    ├── 1-supabase-skills.md (5.7KB)
    ├── 2-shopify-skills.md (7.5KB)
    ├── 3-github-skills.md (9.3KB)
    ├── 4-serena-skills.md (7.9KB)
    ├── 5-chromedevtools-skills.md (10KB)
    ├── 6-playwright-skills.md (14KB)
    ├── 7-filesystem-skills.md (11KB)
    ├── 8-sequential-thinking-skills.md (11KB)
    └── 9-siso-internal-skills.md (14KB)
```

**Total:** 19 skills, 164KB of structured workflows.

---

## 🚀 Copy and Update Commands

```bash
# 1. Copy Oh-My-OpenCode integration
cp -r "Open Code/.opencode" blackbox4/

# 2. Copy skills (or merge with existing)
if [[ -d "blackbox4/agents/.skills" ]]; then
    echo "Merging skills..."
    cp -r "Open Code/.opencode/skills/"* blackbox4/agents/.skills/
else
    echo "Copying skills..."
    cp -r "Open Code/.opencode/skills" blackbox4/agents/.skills
fi

# 3. Copy agent registry
cp "Open Code/agents_summary.md" blackbox4/agents/_registry.yaml

# 4. Update paths in .opencode files
find blackbox4/.opencode -type f -exec sed -i '' 's|Open Code|blackbox4|g' {} \;

# 5. Update paths in skills
find blackbox4/agents/.skills -type f -exec sed -i '' 's|Open Code|blackbox4|g' {} \;

# 6. Make scripts executable
find blackbox4/.opencode -type f -name "*.sh" -exec chmod +x {} \;
```

---

## ✅ What You Get After Copy

1. ✅ **MCP Integration System** - Manage 8+ MCP servers
2. ✅ **Background Task Manager** - Queue and execute tasks in parallel
3. ✅ **Session Manager** - Track session state and metadata
4. ✅ **3 Enhanced Agents** - Oracle, Librarian, Explore
5. ✅ **10+ LSP Tools** - Give agents IDE superpowers
6. ✅ **19 Skills** - Core + MCP-specific workflows
7. ✅ **Full Documentation** - All usage guides and examples

**Total New Code Written:** 0 lines (just path updates)
**Total Code Reused:** 100% of Oh-My-OpenCode integration

---

## 🎯 Usage Examples

### Use Enhanced Agents

```bash
cd blackbox4

# Load Oracle for architecture review
# "Read: agents/_core/oracle.agent.yaml"
# "Review this architecture and suggest improvements"

# Load Librarian for research
# "Read: agents/_core/librarian.agent.yaml"
# "Research best practices for multi-tenant SaaS"

# Load Explore for code navigation
# "Read: agents/_core/explore.agent.yaml"
# "Find all files that handle user authentication"
```

### Use MCP Skills

```bash
# Use GitHub skill
# "Use agents/.skills/mcp/3-github-skills.md to manage this PR"

# Use Playwright skill
# "Use agents/.skills/mcp/6-playwright-skills.md to test this flow"

# Use Supabase skill
# "Use agents/.skills/mcp/1-supabase-skills.md to create this table"
```

### Use Background Tasks

```bash
# Start background task manager
cd blackbox4
./.opencode/scripts/start-background-manager.sh

# Queue tasks
# "Queue: Run deep research on 5 competitors in parallel"

# Monitor progress
# Show: Task queue status and results"
```

---

## 📊 Integration Summary

| Component | Source | Size | Action | Status After |
|-----------|--------|------|--------|--------------|
| **MCP System** | `.opencode/` | ~8KB | Copy + path updates | ✅ Working |
| **Background Tasks** | `.opencode/` | ~3KB | Copy + path updates | ✅ Working |
| **Sessions** | `.opencode/` | Variable | Copy + path updates | ✅ Working |
| **Enhanced Agents** | `agents_summary.md` | 3 agents | Copy | ✅ Working |
| **Skills** | `.opencode/skills/` | 164KB | Copy + path updates | ✅ Working |

**Total Code to Write:** 0 lines
**Total Code to Reuse:** 100% of Oh-My-OpenCode
**Path Updates:** 2 find/sed commands

---

## 🔧 Path Updates Required

### Files That Need Path Updates

After copying, these files have paths to update:

```bash
# .opencode/mcp-servers.json
# Update: "base_path": "/path/to/mcp/servers"

# .opencode/background-tasks.json
# Update: "session_root": "/path/to/blackbox4/.memory/sessions"

# All skills files
# Update: References to "Open Code" → "blackbox4"

# Agent definitions
# Update: Import paths for skills, tools
```

**All done by:** The sed commands in the copy section above.

---

## ✅ Success Criteria

After completing this section:

1. ✅ `.opencode/` directory exists in `blackbox4/`
2. ✅ All paths updated to `blackbox4/` (not `Open Code/`)
3. ✅ MCP configuration loads correctly
4. ✅ Background task manager starts without errors
5. ✅ 3 enhanced agents load successfully
6. ✅ 19 skills are accessible
7. ✅ LSP tools are configured
8. ✅ All documentation is available

---

## 🎯 Next Step

**Go to:** `04-BMAD-REUSE.md`

**BMAD agents are already in Blackbox3, just add phase tracking.**
