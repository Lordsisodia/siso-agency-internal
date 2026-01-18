# BMAD Brownfield Integration - Expert Guide

**Specialized workflows for integrating with existing codebases safely**

---

## What is Brownfield Development?

**Brownfield** = Working with existing codebases that have:
- Existing architecture and patterns
- Technical debt
- Duplicate components
- Established workflows
- Production users

**vs. Greenfield** = Starting from scratch with blank canvas

Most real-world development is **brownfield**.

---

## The Brownfield Challenge

### Common Problems

1. **Unclear Current State** - What components exist? Where are they?
2. **Hidden Dependencies** - What breaks if I change this?
3. **Duplicate Code** - 8 versions of the same component
4. **No Tests** - Changes are risky
5. **Unknown Unknowns** - Surprises around every corner

### The BMAD Advantage

BMAD treats brownfield development as a **first-class use case** with:
- Specialized analysis workflows
- Incremental migration strategies
- Risk assessment tools
- Rollback safety nets

---

## Brownfield Workflow

### Phase 1: Analysis (Before You Touch Anything)

#### Workflow: Brownfield Project Analysis

```yaml
id: "brownfield-analysis"
name: "Brownfield Project Analysis"
phase: "elicitation"
agent: "mary"
estimated_time: "4-6 hours"

inputs: ["existing-codebase"]
outputs: [
  "project-inventory.md",
  "gap-analysis.md",
  "integration-strategy.md"
]

steps:
  - step: 1
    name: "Document Existing Project"
    actions:
      - "Analyze current file structure"
      - "Identify component inventory"
      - "Map dependencies"
      - "Document tech debt"
    outputs: ["project-inventory.md"]

  - step: 2
    name: "Analyze Gaps"
    actions:
      - "Identify missing features"
      - "Assess technical debt"
      - "Find duplicate components"
      - "Map integration points"
    outputs: ["gap-analysis.md"]

  - step: 3
    name: "Create Integration Strategy"
    actions:
      - "Plan migration approach"
      - "Identify quick wins"
      - "Assess risks"
      - "Create rollback plan"
    outputs: ["integration-strategy.md"]
```

#### Output 1: Project Inventory

```markdown
# Brownfield Project Inventory: SISO Partnership Portal

**Analyzed:** 2025-01-18
**Author:** Mary (Business Analyst)
**Total Files:** 2,439
**Total Components:** 600+

## Existing Structure

```
src/
├── components/           # 150 components (scattered)
├── features/             # 75 feature folders
├── lib/                  # 200 utilities
├── hooks/                # 80 custom hooks
└── pages/                # 45 pages
```

## Component Inventory

| Category | Count | Locations |
|----------|-------|-----------|
| Admin Tasks | 8 versions | components/, features/, lib/ |
| Forms | 45 | components/, features/, lib/ |
| Tables | 32 | components/, features/ |
| Modals | 28 | components/, features/ |
| Charts | 18 | components/, lib/ |

## Dependencies

**External:**
- React 18.2.0
- TypeScript 5.0.0
- Supabase 2.0.0
- React Query 4.0.0

**Internal:**
- Heavy coupling between features/
- Shared utilities in lib/
- Cross-imports between features/

## Technical Debt

| Issue | Severity | Count |
|-------|----------|-------|
| Duplicate Components | High | 600+ |
| Cross-Feature Imports | High | 150+ |
| Missing Tests | Medium | 80% |
| Outdated Dependencies | Low | 12 |

## Duplicate Components (Top 10)

| Component | Copies | Locations |
|-----------|--------|----------|
| AdminTasks | 8 | components/, features/admin/, lib/components/ |
| DataTable | 6 | components/, lib/, features/*/components/ |
| Modal | 5 | components/, lib/, features/*/components/ |
| Form | 12 | components/, lib/, features/*/components/ |
```

#### Output 2: Gap Analysis

```markdown
# Gap Analysis: SISO Partnership Portal

**Analyzed:** 2025-01-18
**Author:** Mary (Business Analyst)
**Completeness:** 80%

## What's Working Well ✅

- Comprehensive UI components (80% complete)
- Solid type definitions (partnership.ts: 400+ lines)
- Clean React patterns (hooks, functional components)
- Good foundation for scalability

## Missing Features (Priority Order)

### Critical (Must Have)
1. **Commission Calculation Engine**
   - Status: UI only, no backend logic
   - Impact: Partners can't see earnings
   - Effort: 2 weeks

2. **Tier Advancement Automation**
   - Status: Manual process
   - Impact: High support overhead
   - Effort: 2 weeks

3. **Client Lead Scoring**
   - Status: Not implemented
   - Impact: Low conversion rates
   - Effort: 3 weeks

### High (Should Have)
4. **Partner Training Backend Integration**
   - Status: Frontend only
   - Impact: Can't track progress
   - Effort: 1 week

5. **Partner Communication Hub**
   - Status: Not implemented
   - Impact: Poor engagement
   - Effort: 2 weeks

### Medium (Nice to Have)
6. **Real-time Analytics Dashboard**
   - Status: Basic version exists
   - Impact: Limited insights
   - Effort: 2 weeks

7. **Partner Onboarding Automation**
   - Status: Manual process
   - Impact: Slow activation
   - Effort: 2 weeks

## Technical Debt by Priority

### High Risk, High Effort
- **Consolidate 600 duplicate files**
  - Impact: 24.6% of codebase
  - Risk: High (breaking changes)
  - Effort: 4 weeks

### High Risk, Low Effort (Quick Wins)
- **Fix cross-feature imports**
  - Impact: 150+ violations
  - Risk: Medium
  - Effort: 1 week

### Low Risk, High Effort
- **Add comprehensive tests**
  - Impact: 80% untested
  - Risk: Low
  - Effort: 6 weeks

### Low Risk, Low Effort
- **Update outdated dependencies**
  - Impact: 12 packages
  - Risk: Low
  - Effort: 2 days

## Quick Wins (Low Risk, High Value)

1. **Enable pre-commit hooks** (2 hours)
   - Prevents new duplicates
   - Zero breaking changes

2. **Add component registry** (4 hours)
   - Documents all 600 components
   - Enables better search

3. **Consolidate AdminTasks** (1 day)
   - 8 copies → 1 canonical version
   - Clear quick win

## Long-Term Investments (High Risk, High Value)

1. **Domain consolidation** (4 weeks)
   - Migrate to domain-driven architecture
   - Enables 95% AI accuracy

2. **State management migration** (2 weeks)
   - Context API → Zustand
   - 40% performance improvement

3. **Test suite** (6 weeks)
   - Comprehensive coverage
   - Enables confident refactoring
```

#### Output 3: Integration Strategy

```markdown
# Integration Strategy: SISO Partnership Portal

**Created:** 2025-01-18
**Author:** Mary (Business Analyst)
**Approach:** Incremental Migration

## Migration Approach: Incremental

**Why Incremental?**
- Lower risk (changes isolated)
- Continuous value (each phase adds value)
- Easy rollback (can revert any phase)
- Team can learn incrementally

**Alternatives Considered:**
- ❌ Big Bang: Too risky, everything breaks at once
- ❌ Parallel: Too expensive, double maintenance
- ✅ Incremental: Best balance of risk and value

## Phase Plan

### Phase 1: Emergency Triage (Week 1)
**Risk:** ZERO | **Value:** IMMEDIATE

Goals:
- Delete exact binary duplicates (6 files)
- Create component registry (document 600 components)
- Add barrel exports (top 20 components)

Success Criteria:
- ✅ 0 exact binary duplicates
- ✅ 100% components documented
- ✅ Improved imports for top components

Rollback: `git revert` (trivial)

### Phase 2: Domain Consolidation (Weeks 2-4)
**Risk:** LOW | **Value:** HIGH

Goals:
- Create domain structure (lifelock, tasks, admin, partnerships)
- Migrate components to domains
- Set up infrastructure layer
- Create integration layer for external backends

Success Criteria:
- ✅ All components in domain ownership
- ✅ Zero cross-domain imports
- ✅ Clear integration boundaries

Rollback: Git revert commit batch (safe)

### Phase 3: Architecture Enforcement (Week 5)
**Risk:** MEDIUM | **Value:** HIGH

Goals:
- Enable pre-commit hooks
- Add automated validation
- Implement duplicate prevention

Success Criteria:
- ✅ Pre-commit hooks block violations
- ✅ CI/CD runs architecture checks
- ✅ Zero new duplicates introduced

Rollback: Disable hooks (instant)

### Phase 4: Feature Integration (Weeks 6-8)
**Risk:** MEDIUM | **Value:** VERY HIGH

Goals:
- Implement missing features (commission calc, tier automation, lead scoring)
- Integrate with external backends
- Add comprehensive tests

Success Criteria:
- ✅ All critical features implemented
- ✅ 80% test coverage
- ✅ Integration tests passing

Rollback: Feature flags (can disable)

### Phase 5: Optimization (Weeks 9-10)
**Risk:** LOW | **Value:** MEDIUM

Goals:
- Migrate to Zustand (state management)
- Performance optimization
- Bundle size reduction

Success Criteria:
- ✅ 40% performance improvement
- ✅ 50% bundle size reduction
- ✅ No Context providers

Rollback: Keep old code (can switch back)

## Risk Assessment

### High Risks (Mitigation Required)

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking changes during consolidation | Medium | High | Incremental phases + thorough testing |
| Team resistance to new architecture | Low | High | Training + quick wins first |
| Performance regression | Low | Medium | Benchmarks + monitoring |
| Lost productivity during migration | Medium | Medium | Parallel work + phase isolation |

### Medium Risks (Monitor)

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Integration issues with external backends | Medium | Medium | Staging environment first |
| Test suite takes too long to build | Medium | Low | Prioritize critical paths |
| New architecture doesn't fit all cases | Low | Medium | Allow exceptions with approval |

## Rollback Plans

### Phase 1 Rollback (Emergency Triage)
```bash
# Trivial rollback
git revert <commit-hash>
# All files restored, no side effects
```

### Phase 2 Rollback (Domain Consolidation)
```bash
# Rollback by batch
git revert <batch-1-commits>
git revert <batch-2-commits>
# Each batch is independently revertible
```

### Phase 3 Rollback (Architecture Enforcement)
```bash
# Instant rollback
# .husky/pre-commit
#!/bin/bash
# echo "Disabled"  # Just comment out
exit 0
```

### Phase 4 Rollback (Feature Integration)
```bash
# Feature flags
if (featureFlags.commissionCalculation) {
  // new code
} else {
  // old code
}
```

## Success Criteria

### Quantitative Metrics
- ✅ **600 duplicate files → 0** (100% elimination)
- ✅ **50% AI accuracy → 95%** (90% improvement)
- ✅ **25% productivity boost** (measured by task completion time)
- ✅ **80% test coverage** (from 20%)

### Qualitative Metrics
- ✅ **Clear ownership** (every component has one home)
- ✅ **Confident refactoring** (tests prevent regressions)
- ✅ **Easy onboarding** (new devs understand structure)
- ✅ **Zero tech debt accumulation** (architecture enforcement)

## Timeline

```
Week 1:  Emergency Triage         ████████████ 100%
Week 2:  Domain Consolidation 1   ██████░░░░░░ 50%
Week 3:  Domain Consolidation 2   ████████████ 100%
Week 4:  Domain Consolidation 3   ████████░░░░ 80%
Week 5:  Architecture Enforcement  █████████░░░ 90%
Week 6:  Feature Integration 1    ████████░░░░ 80%
Week 7:  Feature Integration 2    ██████░░░░░░ 50%
Week 8:  Feature Integration 3    ████░░░░░░░░░ 40%
Week 9:  Optimization 1           ████░░░░░░░░░ 40%
Week 10: Optimization 2           ██░░░░░░░░░░░ 20%
```

**Total:** 10 weeks to complete transformation

---

*This strategy ensures we add value every week while maintaining the ability to rollback any phase.*
```

---

## BMAD Brownfield Patterns

### Pattern 1: Inventory First

**Before you change anything, understand what you have.**

```yaml
workflow: brownfield-inventory
agent: mary
steps:
  - Scan all files
  - Categorize by type
  - Identify duplicates
  - Map dependencies
  - Document everything
```

### Pattern 2: Quick Wins First

**Build momentum with low-risk, high-value changes.**

```yaml
workflow: quick-wins
agent: arthur
steps:
  - Identify single-use shared components
  - Move to owning domain
  - Update imports
  - Verify tests still pass
  - Commit atomic changes
```

### Pattern 3: Incremental Migration

**Never do big bang migrations.**

```yaml
workflow: incremental-migration
agent: winston
phases:
  - phase: 1
    name: "Create structure"
    risk: "ZERO"
    value: "IMMEDIATE"
  - phase: 2
    name: "Migrate one domain"
    risk: "LOW"
    value: "HIGH"
  - phase: 3
    name: "Enable enforcement"
    risk: "MEDIUM"
    value: "HIGH"
```

### Pattern 4: Rollback Safety

**Every change must be easily reversible.**

```yaml
workflow: rollback-safe-change
agent: arthur
steps:
  - Create feature branch
  - Implement change
  - Add rollback mechanism
  - Test rollback works
  - Merge to main
```

---

## Real Example: SISO Partnership Portal

### Before BMAD Analysis

```
Status: Unknown
Knowledge: "We have a partnership portal somewhere"
Risk: HIGH (could break anything)
Confidence: LOW
```

### After BMAD Brownfield Analysis

```
Status: 80% complete
Knowledge:
  - 600 components catalogued
  - 8 duplicate AdminTasks identified
  - Missing features documented
  - Technical debt prioritized

Risk: LOW (incremental phases)
Confidence: HIGH (validated approach)

Plan: 10-week migration with rollback safety
Value: Each phase adds independent value
```

### Results

- **Week 1**: Eliminated 6 exact duplicates (zero risk)
- **Week 2-4**: Consolidated domains (low risk, high value)
- **Week 5**: Enabled enforcement (medium risk, high value)
- **Week 6-8**: Implemented missing features (medium risk, very high value)
- **Week 9-10**: Optimized performance (low risk, medium value)

**Total Transformation:**
- 600 duplicates → 0
- 50% AI accuracy → 95%
- 20% test coverage → 80%
- Ad-hoc structure → Domain-driven architecture

---

## Tools and Scripts

### Duplicate Finder

```typescript
// scripts/find-duplicates.ts
import { glob } from 'glob';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

const files = glob.sync('src/**/*.{tsx,ts}');
const seen = new Map<string, string[]>();

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const hash = createHash('sha256').update(content).digest('hex');

  if (!seen.has(hash)) {
    seen.set(hash, []);
  }
  seen.get(hash)!.push(file);
}

for (const [hash, paths] of seen) {
  if (paths.length > 1) {
    console.log(`DUPLICATE: ${paths.length} copies`);
    paths.forEach(p => console.log(`  ${p}`));
  }
}
```

### Dependency Mapper

```typescript
// scripts/map-dependencies.ts
import { glob } from 'glob';
import { readFileSync } from 'fs';

const files = glob.sync('src/**/*.{tsx,ts}');
const imports = new Map<string, string[]>();

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const matches = content.matchAll(/import.*from\s+['"]([^'"]+)['"]/g);

  for (const match of matches) {
    const importPath = match[1];
    if (!imports.has(file)) {
      imports.set(file, []);
    }
    imports.get(file)!.push(importPath);
  }
}

for (const [file, paths] of imports) {
  console.log(`${file}:`);
  paths.forEach(p => console.log(`  → ${p}`));
}
```

### Component Registry Generator

```typescript
// scripts/generate-component-registry.ts
import { glob } from 'glob';
import { readFileSync } from 'fs';
import * as fs from 'fs';

const components = glob.sync('src/**/*.{tsx,ts}');
const registry: any[] = [];

for (const component of components) {
  const content = readFileSync(component, 'utf-8');

  // Extract component name
  const nameMatch = content.match(/export\s+(?:const|function)\s+(\w+)/);
  const name = nameMatch ? nameMatch[1] : component.split('/').pop();

  // Count imports
  const imports = (content.match(/import/g) || []).length;

  // Count lines
  const lines = content.split('\n').length;

  registry.push({
    path: component,
    name: name || 'Unknown',
    imports,
    lines,
    size: Buffer.byteLength(content, 'utf-8')
  });
}

fs.writeFileSync(
  'COMPONENT-REGISTRY.json',
  JSON.stringify(registry, null, 2)
);
console.log(`Registered ${registry.length} components`);
```

---

## Next Steps

1. **BMAD vs GSD Integration** → `05-bmad-vs-gsd.md`

---

*Brownfield development is where most real work happens. BMAD treats it as a first-class use case.*
