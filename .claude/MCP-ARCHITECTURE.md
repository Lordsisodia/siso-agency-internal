# MCP Architecture - Claude Code (VSCode Terminal)

## 📍 **CORRECT CONFIG LOCATIONS**

### **Global MCPs** (All Projects)
**File:** `~/.config/claude/config.json`
**Scope:** Universal tools available everywhere

### **Project MCPs** (This Project Only)
**File:** `./.claude/mcp.json`
**Scope:** Project-specific tools

---

## 🌍 **GLOBAL MCPs** (Universal Super Powers)

### 1. **zen-mcp** ✅
**Purpose:** Multi-model orchestration for 10x reasoning
**Tools:** 15 tools - chat, thinkdeep, planner, consensus, debug, codereview, testgen, etc.
**Models:** Gemini Pro (1M context), GPT-5, Groq (fast), Cerebras
**Use Cases:**
- Complex architecture decisions → `thinkdeep`
- Multi-path exploration → `planner`
- Validation → `consensus` (multiple models agree/disagree)
- Deep debugging → `debug`

### 2. **serena** ✅
**Purpose:** Semantic code intelligence
**Tools:** 26 tools - find_symbol, replace_symbol_body, search_for_pattern, etc.
**Use Cases:**
- Navigate codebase → `find_symbol`
- Refactor safely → `replace_symbol_body`
- Trace dependencies → `find_referencing_symbols`
- Understand structure → `get_symbols_overview`

### 3. **clear-thought** 🆕
**Purpose:** Advanced reasoning (26 reasoning modes)
**Replaces:** sequential-thinking
**Key Modes:**
- `tree_of_thought` - Multiple solution paths
- `mcts` - Monte Carlo optimal strategies
- `systems_thinking` - Complex interconnections
- `scientific_method` - Hypothesis testing
- `socratic_method` - Deep questioning
- `beam_search` - Best-path finding

### 4. **filesystem** ✅
**Purpose:** Safe file system operations
**Scope:** `/Users/shaansisodia`

### 5. **brave-search** ✅
**Purpose:** Web search capability

### 6. **github** ✅
**Purpose:** GitHub operations

---

## 📁 **PROJECT-SPECIFIC MCPs** (SISO-INTERNAL Only)

### 1. **supabase** ✅
**Purpose:** Project database operations
**Project:** `avdgyrepwrvsvwgxrccr`
**Use Cases:**
- Migrations → `apply_migration`
- Queries → `execute_sql`
- Edge functions → `deploy_edge_function`
- Diagnostics → `get_advisors`

### 2. **neo4j-memory** 🆕
**Purpose:** Project knowledge graph
**Use Cases:**
- Store facts → `create_memory` (people, features, decisions)
- Connect concepts → `create_connection` (WORKS_ON, DEPENDS_ON)
- Query knowledge → `search_memories` (find related context)
- Multi-hop queries → "What decisions led to this bug?"

### 3. **memory-bank** 🆕
**Purpose:** File-based project memory
**Location:** `./.claude/memory/`
**Use Cases:**
- Session notes → `write_memory_bank_file`
- Context persistence → `read_memory_bank_file`
- Project docs → `initialize_memory_bank`

---

## 🎯 **USAGE PATTERNS**

### **Complex Feature Development:**
```
1. zen-mcp (thinkdeep) → Analyze requirements deeply
2. clear-thought (tree_of_thought) → Explore 3+ solution paths
3. serena (find_symbol) → Locate existing patterns
4. neo4j-memory (search_memories) → Check past similar work
5. supabase (execute_sql) → Implement DB changes
6. neo4j-memory (create_connection) → Link feature → implementation
```

### **Deep Debugging:**
```
1. zen-mcp (debug) → Systematic investigation
2. serena (find_referencing_symbols) → Trace all usages
3. clear-thought (causal_analysis) → Root cause analysis
4. neo4j-memory (search_memories) → "Have we seen this before?"
```

### **Architecture Decisions:**
```
1. clear-thought (systems_thinking) → Understand interconnections
2. zen-mcp (consensus) → Validate with multiple models
3. neo4j-memory (create_memory) → Document decision + rationale
4. memory-bank (write) → Store architecture diagrams
```

---

## 🚀 **RESTART REQUIRED**

After updating MCP configs, restart Claude Code:

```bash
# 1. Exit current Claude Code session
# Type: exit

# 2. Restart Claude Code in terminal
claude
```

---

## ✅ **VERIFICATION CHECKLIST**

After restart, verify:
- [ ] `mcp__zen-mcp__chat` available
- [ ] `mcp__serena__find_symbol` available
- [ ] `mcp__clear-thought__*` available
- [ ] `mcp__supabase__execute_sql` available
- [ ] `mcp__neo4j-memory__search_memories` available
- [ ] `mcp__memory-bank__write_memory_bank_file` available

---

## 📊 **MCP SUMMARY**

**Global:** 6 MCPs (universal tools)
**Project:** 3 MCPs (project-specific memory + database)
**Total:** 9 MCPs

**Philosophy:**
- Global = Universal reasoning + code intelligence
- Project = Isolated memory + database
- No cross-project memory pollution

---

*Optimized for Claude Code in VSCode Terminal*
*Last updated: 2025-10-05*
