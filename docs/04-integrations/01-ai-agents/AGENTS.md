# SISO Internal - Codex Agent Instructions

## 🎯 Project Context
You are working on **SISO-INTERNAL**, a React + TypeScript + Vite + Supabase PWA application.

## 🔧 MCP Tools Available in This Project

### 🗄️ **Supabase MCP (Project-Specific)**
**Tool Name:** `siso-internal-supabase`
**When to Use:** Database operations, migrations, schema changes, querying data

**Available Operations:**
- `search_docs` - Search Supabase documentation
- `list_tables` - List all database tables
- `list_extensions` - List database extensions
- `list_migrations` - List migration history
- `apply_migration` - Apply DDL migrations
- `execute_sql` - Execute raw SQL queries
- `get_logs` - Fetch project logs (api, postgres, auth, storage, realtime)
- `get_advisors` - Check for security/performance advisories
- `generate_typescript_types` - Generate TypeScript types from database
- `list_edge_functions` - List Edge Functions
- `deploy_edge_function` - Deploy Edge Functions
- `create_branch` - Create development branches
- `merge_branch` - Merge branch migrations to production

**Project Details:**
- **Supabase URL:** `https://avdgyrepwrvsvwgxrccr.supabase.co`
- **Project Ref:** `avdgyrepwrvsvwgxrccr`
- **Access Token:** Pre-configured in environment

**Best Practices:**
1. **ALWAYS use `apply_migration` for DDL operations** (CREATE TABLE, ALTER TABLE, etc.)
2. **Name migrations descriptively** in snake_case (e.g., `add_photo_nutrition_table`)
3. **Check advisors after DDL changes** to catch missing RLS policies
4. **Generate TypeScript types** after schema changes
5. **Use branches for testing** major migrations before production

### 🧠 **Zen MCP (Multi-Model AI)**
**Tool Name:** `zen`
**When to Use:** Complex reasoning, code generation, multi-model analysis

**Available Models:**
- `gpt-free` (default) - Fast, free OpenRouter models
- `gemini-2.5-pro` - 1M context, deep reasoning
- `gpt-5-pro` - Advanced reasoning
- Various Groq, Cerebras models for speed

**Use Cases:**
- Complex architectural decisions
- Code review and refactoring suggestions
- Multi-step problem solving
- Consensus building across models

### 🔍 **Serena MCP (Code Intelligence)**
**Tool Name:** `serena`
**When to Use:** Codebase navigation, symbol search, refactoring

**Available Operations:**
- `read_file` - Read file contents
- `find_symbol` - Find classes, functions, methods
- `find_referencing_symbols` - Find all references to a symbol
- `get_symbols_overview` - Get file structure
- `replace_symbol_body` - Safe symbol-level refactoring
- `search_for_pattern` - Regex search across codebase

**Best Practices:**
1. Use `get_symbols_overview` before editing files
2. Use `find_referencing_symbols` before renaming
3. Prefer symbol-level operations over regex when possible

### 📁 **Filesystem MCP**
**Tool Name:** `filesystem`
**When to Use:** File operations, directory navigation

**Scope:** `/Users/shaansisodia` (home directory)

### 🌐 **Fetch MCP (Web Content)**
**Tool Name:** `fetch`
**When to Use:** Fetching external documentation, APIs, web content

### 🧩 **Clear Thought MCP (Advanced Reasoning)**
**Tool Name:** `clear-thought`
**When to Use:** Complex problem decomposition, structured thinking

## 📋 Project-Specific Rules

### Database Operations
1. **ALWAYS check current schema** before making changes:
   ```
   Use siso-internal-supabase.list_tables to see current tables
   ```

2. **For new tables, always include:**
   - `id` (UUID, primary key, default gen_random_uuid())
   - `user_id` (UUID, foreign key to auth.users)
   - `created_at` (timestamptz, default now())
   - `updated_at` (timestamptz, updated via trigger)
   - RLS policies for user isolation

3. **After schema changes:**
   ```
   1. Use siso-internal-supabase.get_advisors type="security"
   2. Use siso-internal-supabase.generate_typescript_types
   3. Update src/types/database.types.ts
   ```

### Code Patterns
1. **Copy existing patterns** - Look for similar components before creating new ones
2. **Mobile-first PWA** - All UI must work on mobile
3. **TypeScript strict mode** - No `any` types allowed
4. **Test-driven** - Write tests before implementation

### File Organization
- **Features:** `/src/ecosystem/internal/lifelock/` (wellness features)
- **Components:** `/src/components/` (shared UI)
- **Services:** `/src/services/` (business logic)
- **Database:** `/src/services/database/` (Supabase operations)

## 🚫 Never Do This
- Don't create new service patterns (use existing Supabase patterns)
- Don't create micro-hooks (combine into existing hooks)
- Don't create files in `/shared/` or `/refactored/`
- Don't skip RLS policies on new tables
- Don't hardcode API keys or secrets

## ✅ Always Do This
1. **Check if Supabase MCP tools can help** before writing manual queries
2. **Use `siso-internal-supabase.apply_migration`** for all DDL
3. **Run advisors** after database changes
4. **Generate types** after schema changes
5. **Copy working patterns** from similar features

## 🎯 Workflow Examples

### Adding a New Database Table
```
1. Design schema (use zen for complex decisions)
2. Write migration SQL
3. Apply: siso-internal-supabase.apply_migration
4. Check: siso-internal-supabase.get_advisors type="security"
5. Generate: siso-internal-supabase.generate_typescript_types
6. Update: src/types/database.types.ts
7. Add RLS policies in follow-up migration if needed
```

### Refactoring Code
```
1. Use serena.find_symbol to locate target
2. Use serena.find_referencing_symbols to find usage
3. Use serena.replace_symbol_body for safe refactoring
4. Test changes
5. Run typecheck: npm run typecheck
```

### Complex Architecture Decisions
```
1. Use clear-thought for problem decomposition
2. Use zen with consensus mode for multi-model validation
3. Document decision in code comments
4. Update AGENTS.md if it affects future development
```

## 📊 Quick Reference

| Task | Primary Tool | Command Pattern |
|------|-------------|-----------------|
| Database query | `siso-internal-supabase` | `execute_sql` |
| Schema change | `siso-internal-supabase` | `apply_migration` |
| Find function | `serena` | `find_symbol` |
| Complex reasoning | `zen` or `clear-thought` | Model-specific |
| File operations | `filesystem` | Standard file ops |
| External docs | `fetch` | URL-based |

## 🔄 Development Workflow

1. **Start:** Check current state with `list_tables`, `get_logs`
2. **Plan:** Use `zen` or `clear-thought` for complex decisions
3. **Implement:** Use `serena` for navigation, Supabase MCP for DB
4. **Validate:** Run advisors, generate types, test
5. **Commit:** Follow git commit message conventions

---

*This file provides project-specific context to Codex. The MCP tools are available globally, but these instructions help use them effectively in the SISO-INTERNAL project.*
