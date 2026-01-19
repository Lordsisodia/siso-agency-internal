# BlackBox5 Skills Consolidation Plan

**Date**: 2025-01-18
**Objective**: Consolidate all skills from 4 locations into ONE canonical skills folder

---

## Current State Analysis

### Skills Locations Found

1. **`.blackbox5/engine/agents/.skills`** (Legacy)
   - Flat structure with 10 skill categories
   - Mixed organization pattern
   - Contains some skills not yet migrated

2. **`.blackbox5/engine/agents/.skills-new`** (Target Structure)
   - Well-organized by 5 top-level categories
   - 37+ skills already properly structured
   - **This will be our canonical location**

3. **`.blackbox5/engine/skills/`**
   - Contains: `siso-tasks/`, `verify/`, `workflow/`
   - Minimal content, should be migrated

4. **`.blackbox5/engine/modules/.skills/`**
   - Contains: `verify/`, `workflow/`
   - **Should NOT exist** - modules shouldn't have their own skills

---

## Target Structure

```
.blackbox5/engine/agents/.skills/
├── collaboration-communication/
│   ├── collaboration/           # notifications, skill-creator, code-review, etc.
│   ├── thinking-methodologies/  # deep-research, first-principles, etc.
│   └── automation/              # ui-cycle, task-automation, etc.
├── integration-connectivity/
│   ├── api-integrations/        # rest-api, graphql-api, webhooks
│   ├── database-operations/     # sql-queries, orm-patterns, migrations
│   └── mcp-integrations/        # supabase, filesystem, playwright, etc.
├── development-workflow/
│   ├── coding-assistance/       # refactoring, code-generation
│   ├── testing-quality/         # unit-testing, integration-testing, linting
│   └── deployment-ops/          # long-run-ops, docker, ci-cd
├── core-infrastructure/
│   └── development-tools/       # github-cli, git-worktrees
└── knowledge-documentation/
    ├── documentation/           # docs-routing, feedback-triage
    └── planning-architecture/   # writing-plans, system-design
```

---

## Migration Mapping

### From `.blackbox5/engine/agents/.skills` → `.skills` (Canonical)

| Old Path | New Path | Action |
|----------|----------|--------|
| `.skills/collaboration/*` | `.skills/collaboration-communication/collaboration/*` | Move |
| `.skills/thinking/*` | `.skills/collaboration-communication/thinking-methodologies/*` | Move |
| `.skills/automation/*` | `.skills/collaboration-communication/automation/*` | Move |
| `.skills/documentation/*` | `.skills/knowledge-documentation/documentation/*` | Move |
| `.skills/testing/*` | `.skills/development-workflow/testing-quality/*` | Move |
| `.skills/development/*` | `.skills/development-workflow/coding-assistance/*` | Move |
| `.skills/git-workflow/*` | `.skills/core-infrastructure/development-tools/*` | Move |
| `.skills/mcp-integrations/*` | `.skills/integration-connectivity/mcp-integrations/*` | Move |

### From `.blackbox5/engine/skills/` → `.skills` (Canonical)

| Old Path | New Path | Action |
|----------|----------|--------|
| `skills/verify/*` | `.skills/development-workflow/testing-quality/verify` | Move |
| `skills/workflow/*` | `.skills/development-workflow/deployment-ops/workflow` | Move |
| `skills/siso-tasks/*` | `.skills/knowledge-documentation/documentation/siso-tasks` | Move |

### From `.blackbox5/engine/modules/.skills/` → `.skills` (Canonical)

| Old Path | New Path | Action |
|----------|----------|--------|
| `modules/.skills/*` | **DELETE** - Already exists in canonical location | Remove |

---

## Duplicate Resolution

The following skills exist in BOTH `.skills` and `.skills-new`:

1. **All collaboration skills** - Keep `.skills-new` version (newer format)
2. **All thinking skills** - Keep `.skills-new` version
3. **All MCP integration skills** - Keep `.skills-new` version
4. **Development tools** - Keep `.skills-new` version

**Action**: Overwrite `.skills` content with `.skills-new` content during migration

---

## Migration Steps

### Phase 1: Preparation
1. ✅ Backup current skills folders
2. ✅ Create migration mapping document
3. ✅ Identify all duplicates and conflicts

### Phase 2: Structure Setup
4. Create canonical folder structure in `.skills`
5. Create all required subdirectories

### Phase 3: Content Migration
6. Migrate unique content from old `.skills`
7. Migrate content from `engine/skills/`
8. Ensure all `.skills-new` content is in place

### Phase 4: Cleanup
9. Remove old `.skills` folder
10. Remove `engine/skills/` folder
11. Remove `engine/modules/.skills/` folder
12. Update any references in code

### Phase 5: Verification
13. Verify all skills are present
14. Test skill loading
15. Update documentation

---

## Files to Update After Migration

1. `.blackbox5/engine/agents/core/SkillManager.py` - Update skills path
2. `.blackbox5/engine/agents/core/AgentLoader.py` - Update skills path
3. Any hardcoded paths to `.skills-new`
4. Documentation references

---

## Risk Mitigation

1. **Backup before migration**: All folders will be backed up to `.backup-skills-{timestamp}`
2. **Incremental migration**: Move category by category
3. **Verification after each step**: Check skill loading
4. **Rollback plan**: Keep backups until verification complete

---

## Success Criteria

- ✅ All skills in ONE location: `.blackbox5/engine/agents/.skills/`
- ✅ No duplicate skills
- ✅ No skills lost
- ✅ Clean, hierarchical organization
- ✅ All code references updated
- ✅ Documentation updated

---

**Status**: Ready to execute
**Next Action**: Run migration script
