# AI-Executable Cleanup Tasks for SISO

*Detailed task specifications designed for AI agent execution using BMAD methodology and 5-Step AI Process*

## Task Organization Framework

### Epic Structure (BMAD Method)
```
Epic 1: Backup Directory Cleanup (HIGH IMPACT, LOW RISK)
Epic 2: Service Consolidation (MEDIUM IMPACT, MEDIUM RISK)  
Epic 3: Component Deduplication (LOW IMPACT, LOW RISK)
Epic 4: Configuration Cleanup (LOW IMPACT, LOW RISK)
```

### Story Status Progression
```
Draft → Approved → Development → Ready for Review → Done
```

## EPIC 1: BACKUP DIRECTORY CLEANUP

### Story 1.1: Archive backup-original Directory
**Status**: APPROVED  
**Priority**: HIGH  
**Estimated Time**: 30 minutes  
**Risk**: LOW  
**Dependencies**: None  

**Acceptance Criteria:**
- [ ] Verify backup-original/ directory exists and contains old code
- [ ] Create compressed archive: `backup-original-$(date +%Y%m%d).tar.gz`
- [ ] Verify archive integrity
- [ ] Remove original backup-original/ directory
- [ ] Update .gitignore to exclude future backup directories
- [ ] Verify application still functions after removal

**AI Instructions:**
```bash
# 1. Verify directory exists
ls -la SISO-INTERNAL/ | grep backup-original

# 2. Create archive (do NOT execute until verified safe)
cd SISO-INTERNAL
tar -czf backup-original-$(date +%Y%m%d).tar.gz backup-original/

# 3. Verify archive
tar -tzf backup-original-*.tar.gz | head -20

# 4. Remove directory (CAREFUL!)
rm -rf backup-original/

# 5. Update .gitignore
echo "backup-*/" >> .gitignore
echo "*.backup" >> .gitignore
```

**Integration Tests:**
- Application loads without errors
- No broken imports referencing backup-original/
- Archive file created successfully

**Files Modified:**
- `backup-original/` (REMOVED)
- `.gitignore` (UPDATED)

---

### Story 1.2: Remove backup-before-cleanup Directory
**Status**: APPROVED  
**Priority**: HIGH  
**Estimated Time**: 15 minutes  
**Risk**: LOW  
**Dependencies**: Story 1.1 complete  

**Acceptance Criteria:**
- [ ] Verify backup-before-cleanup/ is not referenced in active code
- [ ] Remove backup-before-cleanup/ directory entirely
- [ ] Verify no imports or file references break

**AI Instructions:**
```bash
# 1. Search for any references
grep -r "backup-before-cleanup" SISO-INTERNAL/src/
grep -r "backup-before-cleanup" SISO-INTERNAL/*.json
grep -r "backup-before-cleanup" SISO-INTERNAL/*.md

# 2. If no references found, remove directory
rm -rf SISO-INTERNAL/backup-before-cleanup/
```

**Integration Tests:**
- Application loads without errors
- No broken imports or file references

**Files Modified:**
- `backup-before-cleanup/` (REMOVED)

---

### Story 1.3: Clean Individual Backup Files
**Status**: APPROVED  
**Priority**: MEDIUM  
**Estimated Time**: 45 minutes  
**Risk**: LOW  
**Dependencies**: Story 1.1, 1.2 complete  

**Acceptance Criteria:**
- [ ] Find all `.backup` files in repository
- [ ] Verify they are not referenced in active code
- [ ] Remove `.backup` files safely
- [ ] Remove `server.js.backup` specifically
- [ ] Update package.json to remove legacy server script

**AI Instructions:**
```bash
# 1. Find all backup files
find SISO-INTERNAL/ -name "*.backup" -type f

# 2. Check if any are referenced in active code
grep -r "\.backup" SISO-INTERNAL/src/
grep -r "server\.js\.backup" SISO-INTERNAL/

# 3. Remove backup files
find SISO-INTERNAL/ -name "*.backup" -type f -delete

# 4. Update package.json - remove server:legacy script
# Use text replacement to remove the line containing "server:legacy"
```

**Integration Tests:**
- Application starts without errors
- No broken file references
- Package.json scripts still valid

**Files Modified:**
- All `*.backup` files (REMOVED)
- `package.json` (UPDATED - remove server:legacy script)

---

## EPIC 2: SERVICE CONSOLIDATION

### Story 2.1: Analyze Task Service Dependencies
**Status**: APPROVED  
**Priority**: HIGH  
**Estimated Time**: 60 minutes  
**Risk**: LOW  
**Dependencies**: Epic 1 complete  

**Acceptance Criteria:**
- [ ] Map all task service files and their usage
- [ ] Identify which services are actively imported
- [ ] Document service interface differences
- [ ] Create dependency graph
- [ ] Recommend consolidation strategy

**AI Instructions:**
```bash
# 1. Find all task service files
find SISO-INTERNAL/src/ -name "*[Tt]ask*[Ss]ervice*" -type f

# 2. Search for imports of each service
grep -r "personalTaskService" SISO-INTERNAL/src/
grep -r "prismaTaskService" SISO-INTERNAL/src/
grep -r "neonTaskService" SISO-INTERNAL/src/
grep -r "hybridTaskService" SISO-INTERNAL/src/

# 3. Analyze each service file to understand interfaces
# Create analysis document with findings
```

**Integration Tests:**
- All task services identified correctly
- Usage patterns documented
- No services missed in analysis

**Files Modified:**
- Create `task-service-analysis.md` in cleanup folder

---

### Story 2.2: Consolidate to Single Task Service
**Status**: DRAFT (Needs approval after 2.1)  
**Priority**: HIGH  
**Estimated Time**: 2 hours  
**Risk**: MEDIUM  
**Dependencies**: Story 2.1 complete + manual approval  

**Acceptance Criteria:**
- [ ] Keep ONE primary task service (based on analysis)
- [ ] Archive unused task services to cleanup folder
- [ ] Update all imports to use consolidated service
- [ ] Ensure no functionality loss
- [ ] Run integration tests to verify

**AI Instructions:**
```typescript
// Based on Story 2.1 analysis, implement consolidation
// 1. Identify primary service (likely personalTaskService.ts)
// 2. Move unused services to archive
// 3. Update all imports across codebase
// 4. Test functionality preservation

// Example import updates:
// FROM: import { TaskService } from '../services/prismaTaskService';
// TO:   import { TaskService } from '../services/personalTaskService';
```

**Integration Tests:**
- All task operations work (CRUD)
- No broken imports
- Application functionality preserved
- Performance not degraded

**Files Modified:**
- Move unused services to archive
- Update all importing files

---

### Story 2.3: Consolidate AI Services
**Status**: DRAFT  
**Priority**: HIGH  
**Estimated Time**: 90 minutes  
**Risk**: MEDIUM  
**Dependencies**: Story 2.2 complete  

**Acceptance Criteria:**
- [ ] Identify primary AI service implementation
- [ ] Archive `legacyAIService.ts` and `groqLegacyAI.ts`
- [ ] Update all AI service imports
- [ ] Verify AI functionality still works
- [ ] Test integration with task services

**AI Instructions:**
```typescript
// 1. Analyze AI service usage
grep -r "legacyAIService" SISO-INTERNAL/src/
grep -r "groqLegacyAI" SISO-INTERNAL/src/

// 2. Determine which is actively used
// 3. Move unused services to archive
// 4. Update imports throughout codebase
// 5. Test AI functionality
```

**Integration Tests:**
- AI features work correctly
- Voice processing still functions
- Task creation through AI works
- No AI service errors in console

**Files Modified:**
- Archive unused AI services
- Update all AI service imports

---

### Story 2.4: Consolidate Persistence Services
**Status**: DRAFT  
**Priority**: MEDIUM  
**Estimated Time**: 90 minutes  
**Risk**: MEDIUM  
**Dependencies**: Story 2.3 complete  

**Acceptance Criteria:**
- [ ] Keep `mobileSafePersistence.ts` as primary
- [ ] Archive `taskPersistenceBackup.ts` (redundant)
- [ ] Keep `dataMigration.ts` only for migrations
- [ ] Update all persistence imports
- [ ] Verify data persistence works correctly

**AI Instructions:**
```typescript
// 1. Analyze persistence service usage
grep -r "mobileSafePersistence" SISO-INTERNAL/src/
grep -r "taskPersistenceBackup" SISO-INTERNAL/src/
grep -r "dataMigration" SISO-INTERNAL/src/

// 2. Update imports to use mobileSafePersistence as primary
// 3. Archive redundant backup service
// 4. Test data persistence functionality
```

**Integration Tests:**
- Task data persists correctly
- Mobile-safe features work
- Data recovery functions work
- No data loss during persistence

**Files Modified:**
- Archive `taskPersistenceBackup.ts`
- Update persistence imports

---

## EPIC 3: COMPONENT DEDUPLICATION

### Story 3.1: Remove Duplicate SystemTestingDashboard Components
**Status**: APPROVED  
**Priority**: MEDIUM  
**Estimated Time**: 45 minutes  
**Risk**: LOW  
**Dependencies**: Epic 2 complete  

**Acceptance Criteria:**
- [ ] Find all SystemTestingDashboard.tsx files
- [ ] Identify the authoritative version (likely in ai-first/features/)
- [ ] Remove duplicate copies
- [ ] Update imports to reference single source
- [ ] Verify component still works in all locations

**AI Instructions:**
```bash
# 1. Find all SystemTestingDashboard files
find SISO-INTERNAL/ -name "*SystemTestingDashboard*" -type f

# 2. Compare file contents to identify duplicates
diff file1 file2

# 3. Remove duplicate files
# 4. Update imports in components that use it
grep -r "SystemTestingDashboard" SISO-INTERNAL/src/
```

**Integration Tests:**
- System testing dashboard loads correctly
- All functionality preserved
- No broken component imports

**Files Modified:**
- Remove duplicate SystemTestingDashboard files
- Update import statements

---

### Story 3.2: Remove Duplicate PartnershipTraining Components
**Status**: APPROVED  
**Priority**: LOW  
**Estimated Time**: 30 minutes  
**Risk**: LOW  
**Dependencies**: Story 3.1 complete  

**Acceptance Criteria:**
- [ ] Find all PartnershipTraining.tsx files
- [ ] Keep ai-first/features/partnerships/ version
- [ ] Remove other copies
- [ ] Update imports if needed

**AI Instructions:**
```bash
# 1. Find partnership component files
find SISO-INTERNAL/ -name "*Partnership*Training*" -type f

# 2. Keep the active version in ai-first/features/
# 3. Remove duplicates
# 4. Verify imports still work
```

**Integration Tests:**
- Partnership training component works
- No broken imports

**Files Modified:**
- Remove duplicate partnership components

---

## EPIC 4: CONFIGURATION CLEANUP

### Story 4.1: Clean Package.json Scripts
**Status**: APPROVED  
**Priority**: MEDIUM  
**Estimated Time**: 30 minutes  
**Risk**: LOW  
**Dependencies**: Epic 2 complete  

**Acceptance Criteria:**
- [ ] Remove "server:legacy" script (if not already done)
- [ ] Remove any unused backup-related scripts
- [ ] Verify all remaining scripts work
- [ ] Clean up unused dependencies from old services

**AI Instructions:**
```json
// 1. Review package.json scripts section
// 2. Remove server:legacy and any backup-related scripts
// 3. Test remaining scripts work:
npm run dev
npm run build
npm run test
```

**Integration Tests:**
- All package.json scripts execute successfully
- No missing script errors
- Build process works correctly

**Files Modified:**
- `package.json` (scripts section)

---

### Story 4.2: Archive Database Migration Scripts
**Status**: APPROVED  
**Priority**: LOW  
**Estimated Time**: 20 minutes  
**Risk**: LOW  
**Dependencies**: Epic 2 complete  

**Acceptance Criteria:**
- [ ] Keep `restore-database.js` for emergency recovery
- [ ] Archive `migrate-to-supabase.js` and `migrate-to-neon.js`
- [ ] Move archived scripts to cleanup/archived-scripts/
- [ ] Document what each script was for

**AI Instructions:**
```bash
# 1. Create archive directory
mkdir -p SISO-INTERNAL/architecture-planning/04-cleanup/archived-scripts/

# 2. Move migration scripts
mv SISO-INTERNAL/migrate-to-supabase.js SISO-INTERNAL/architecture-planning/04-cleanup/archived-scripts/
mv SISO-INTERNAL/migrate-to-neon.js SISO-INTERNAL/architecture-planning/04-cleanup/archived-scripts/

# 3. Keep restore-database.js in root (emergency recovery)
# 4. Create README in archived-scripts explaining each script
```

**Integration Tests:**
- Essential database functionality preserved
- Emergency recovery script still accessible

**Files Modified:**
- Move migration scripts to archive
- Create documentation for archived scripts

---

### Story 4.3: Final File Count Verification
**Status**: APPROVED  
**Priority**: HIGH  
**Estimated Time**: 15 minutes  
**Risk**: LOW  
**Dependencies**: All previous stories complete  

**Acceptance Criteria:**
- [ ] Count total files before and after cleanup
- [ ] Verify 60%+ reduction in file count achieved
- [ ] Document cleanup results
- [ ] Verify application still works completely
- [ ] Create cleanup completion report

**AI Instructions:**
```bash
# 1. Count files in SISO-INTERNAL
find SISO-INTERNAL/ -type f | wc -l

# 2. Generate file tree for documentation
tree SISO-INTERNAL/ -I 'node_modules|.git' > cleanup-final-structure.txt

# 3. Test application functionality
# 4. Generate cleanup completion report
```

**Integration Tests:**
- Complete application functionality test
- All features work as expected
- Performance improved (load times, etc.)

**Files Modified:**
- Create cleanup completion report

---

## AI Execution Guidelines

### Before Starting ANY Task:
```bash
# 1. Create safety checkpoint
git add -A && git commit -m "Pre-cleanup checkpoint: Story X.X"

# 2. Verify current application state
npm run dev  # Verify app works
npm run build # Verify build works

# 3. Create task branch
git checkout -b cleanup/story-X-X
```

### During Each Task:
```bash
# 1. Follow BMAD methodology
# - Read story requirements completely
# - Understand acceptance criteria  
# - Execute according to AI Instructions
# - Verify with Integration Tests

# 2. Test frequently
# - After each major change
# - Before committing

# 3. Commit atomically
git add specific-files
git commit -m "Story X.X: Specific change description"
```

### After Each Task:
```bash
# 1. Run integration tests
npm run dev
npm run build
npm run test (if tests exist)

# 2. Update story status to "Ready for Review"
# 3. Create PR for review if needed

# 4. Only proceed to next story after verification
```

### Error Recovery:
```bash
# If anything breaks:
git reset --hard HEAD~1  # Undo last commit
# Or revert to pre-cleanup checkpoint:
git reset --hard pre-cleanup-checkpoint
```

## Success Metrics

### Quantitative Targets:
- **File Reduction**: 100+ files → 40-50 files (60%+ reduction)
- **Service Consolidation**: 15+ services → 5-7 services (65%+ reduction)
- **Duplicate Elimination**: 10+ duplicates → 0 duplicates (100% success)

### Qualitative Verification:
- Application loads without errors
- All features work as before cleanup
- Codebase is easier to navigate
- AI can better understand project structure

This task list is designed for AI execution using the BMAD methodology with clear acceptance criteria, integration tests, and safety checkpoints throughout the process.