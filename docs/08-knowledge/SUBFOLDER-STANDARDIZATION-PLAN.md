# Subfolder Standardization Plan

## Current State Analysis

### 1-Morning-Routine ✅ (Excellent - Reference Implementation)
- Has all standard folders: docs/, domain/, hooks/, ui/
- Well organized with types/, utils/, xp/, services/ subfolders
- Features subfolder follows same pattern (ai-thought-dump)
- Has __tests__/ folder
- **This is the gold standard to follow**

### Projects Subfolders ⚠️ (Need Standardization)
- 1-discover: Only has ui/components (missing pages, docs, domain, hooks)
- 2-plan: Only has ui/components (missing pages, docs, domain, hooks)
- 3-build: Only has ui/components (missing pages, docs, domain, hooks)
- 4-review: Only has ui/components (missing pages, docs, domain, hooks)
- 5-archive: Empty (needs structure)

### Admin Subfolders ⚠️ (Need Standardization)
- 1-overview: Has ui/pages and ui/components (missing docs, domain, hooks)
- 2-clients: Has ui/pages, ui/components, ui/hooks (missing docs, domain)
- 3-partners: Has ui/pages and ui/components (missing docs, domain, hooks)
- 4-financials: Has ui/pages and ui/components (missing docs, domain, hooks)
- 5-settings: Only has ui/pages (missing components, docs, domain, hooks)

### Tasks Features ⚠️ (Need Standardization)
- task-management: Has ui/pages and ui/components (missing docs, domain, hooks)
- deep-work: Only has ui/components (missing pages, docs, domain, hooks)
- light-work: Only has ui/components (missing pages, docs, domain, hooks)
- ai-assistant: Has ui/pages and ui/components (missing docs, domain, hooks)
- calendar: Only has ui/components (missing pages, docs, domain, hooks)
- analytics: Has ui/pages and ui/components (missing docs, domain, hooks)

### XP Store Subfolders ⚠️ (Need Standardization)
- 1-earn: Has hooks (missing ui, docs, domain)
- 2-spend: Has ui/pages and ui/components (missing docs, domain, hooks)
- 3-track: Has ui/pages, ui/components, domain (missing docs, hooks)

### Resources Subfolders ❌ (Poor Structure)
- 1-browse: Has ui/pages and ui/components (missing docs, domain, hooks)
- 2-read: Empty structure created but no files
- 3-save: Empty structure created but no files
- 4-share: Empty structure created but no files

## Standardization Priority

### Phase 1: Quick Wins (Add Missing Folders)
**Goal**: Ensure every subfolder has the minimum required structure
- Create docs/ folder with README.md in every subfolder
- Create domain/types/ folder in every subfolder
- Create hooks/ folder in every subfolder
- Create index.ts barrel exports in every folder

### Phase 2: File Organization
**Goal**: Move files to correct locations
- Ensure all pages are in ui/pages/
- Ensure all components are in ui/components/
- Ensure all types are in domain/types/
- Ensure all hooks are in hooks/

### Phase 3: Feature Sub-Features
**Goal**: Handle nested features properly
- Tasks features should have their own docs, domain, hooks
- Large sections should break down into sub-features

### Phase 4: Documentation
**Goal**: Every section has proper documentation
- Create README.md in every docs/ folder
- Document the purpose and flow of each section
- Add implementation notes where needed

## Execution Order

1. **Start with Projects** (5 subfolders, all simple)
2. **Move to Admin** (5 subfolders, moderate complexity)
3. **Then XP Store** (3 subfolders, small)
4. **Resources** (4 subfolders, mostly empty)
5. **Finally Tasks** (6 features, most complex)

## Success Criteria

Each subfolder should have:
- ✅ docs/README.md
- ✅ domain/types/index.ts
- ✅ hooks/index.ts
- ✅ ui/pages/<Section>Page.tsx
- ✅ ui/components/index.ts
- ✅ index.ts (section-level barrel export)

## Time Estimate

- Phase 1: ~30 minutes (creating folders and READMEs)
- Phase 2: ~1 hour (moving files and updating imports)
- Phase 3: ~30 minutes (handling nested features)
- Phase 4: ~30 minutes (writing documentation)

**Total**: ~2.5 hours for complete standardization
