# Task Progress: Morning Routine Refactoring

**ID:** MR-REFACTOR-001
**Agent:** Claude (main orchestrator)
**Started:** 2025-01-18T06:30:00Z
**Status:** Analysis Complete - Ready for Implementation

---

## Task Description

Refactor the 1,192-line monolithic `MorningRoutineSection.tsx` component into a domain-based architecture following Domain-Driven Design (DDD) principles.

---

## Progress Log

### 2025-01-18 06:30 - Task Initiated
- Created task in blackbox system
- Identified problem: 1,192-line monolith with 21 state variables
- Determined approach: Use subagents for domain analysis

### 2025-01-18 06:45 - Launched 5 Specialized Subagents

**Agent 1: Wake Up Domain Analyzer** (ID: a1861f8)
- Status: ✅ Complete
- Output: `src/domains/lifelock/1-daily/1-morning-routine/docs/domain-analysis/WAKE_UP_DOMAIN_ANALYSIS.md`
- Findings:
  - ~200 lines of wake-up specific code
  - Clear domain boundaries
  - High extraction feasibility
  - Critical: XP multiplier system has 2 different calculations (actual vs UI)

**Agent 2: Freshen Up Domain Analyzer** (ID: ac36349)
- Status: ✅ Complete
- Output: `docs/analysis/freshen-up-domain-analysis.md`
- Findings:
  - 3 boolean subtasks (bathroom, brushTeeth, coldShower)
  - Base XP: 40 (10+10+20)
  - Speed bonus: +25 XP if completed within 25min of wake-up
  - ⚠️ CRITICAL BUG: Speed bonus not working (completionTime undefined)

**Agent 3: Blood Flow Domain Analyzer** (ID: a134c7e)
- Status: ✅ Complete
- Output: `src/domains/lifelock/1-daily/1-morning-routine/docs/DOMAIN-ANALYSIS-BLOOD-FLOW.md`
- Findings:
  - Push-up tracking with personal best system
  - Base XP: 20 + 50 PB bonus + 1.5x speed multiplier (not implemented)
  - Issue: Task completion checkbox disconnected from actual rep tracking

**Agent 4: Cross-Cutting Concerns Analyzer** (ID: a3c2b9d)
- Status: ✅ Complete
- Output: `CROSS-CUTTING-CONCERNS-ANALYSIS.md`
- Findings:
  - 27 pieces of shared state identified
  - 6 major cross-domain dependencies
  - 4 persistence mechanisms (Supabase, IndexedDB, localStorage, sessionStorage)
  - XP system is most complex cross-cutting concern
  - 8-week refactoring timeline proposed

**Agent 5: Implementation Planner** (ID: abb3d64)
- Status: ✅ Complete
- Output: `src/domains/lifelock/1-daily/1-morning-routine/docs/REFACTORING-IMPLEMENTATION-PLAN.md`
- Findings:
  - 1,089-line comprehensive implementation plan
  - Target: 69 modular files (avg 154 lines each)
  - 7-phase refactoring roadmap
  - 40-60 hours effort estimate
  - 3-week timeline with parallel work

### 2025-01-18 07:00 - Analysis Complete

**Deliverables Created:**

1. **Wake Up Domain Analysis** - 1,400+ lines
   - Location: `src/domains/lifelock/1-daily/1-morning-routine/docs/domain-analysis/WAKE_UP_DOMAIN_ANALYSIS.md`
   - Coverage: State, business rules, XP calculations, components, dependencies, tests

2. **Freshen Up Domain Analysis** - 1,200+ lines
   - Location: `docs/analysis/freshen-up-domain-analysis.md`
   - Coverage: Subtasks, XP breakdown, critical bug identification, test requirements

3. **Blood Flow Domain Analysis** - 1,100+ lines
   - Location: `src/domains/lifelock/1-daily/1-morning-routine/docs/DOMAIN-ANALYSIS-BLOOD-FLOW.md`
   - Coverage: Rep tracking, PB system, XP calculations, UI components

4. **Cross-Cutting Concerns Analysis** - 800+ lines
   - Location: `CROSS-CUTTING-CONCERNS-ANALYSIS.md`
   - Coverage: Shared state (27 items), dependencies, infrastructure, orchestration

5. **Implementation Plan** - 1,089 lines
   - Location: `src/domains/lifelock/1-daily/1-morning-routine/docs/REFACTORING-IMPLEMENTATION-PLAN.md`
   - Coverage: File structure, phases, testing, risks, success metrics

6. **Summary Document** - This file
   - Location: `.blackbox/.plans/active/vibe-kanban-work/task-morning-routine-refactor-progress.md`

---

## Key Findings Summary

### Current State Problems
- **Monolithic**: 1,192 lines in single file
- **Complex**: 21 state variables in one component
- **Untestable**: No separation of concerns
- **Risky**: High coupling between domains

### Proposed Solution
- **Modular**: 69 files (avg 154 lines each)
- **Domain-Driven**: 6 domain-based modules
- **Layered**: Domain → Application → Infrastructure → UI
- **Testable**: 70%+ coverage target

### Estimated Effort
- **Time**: 40-60 hours
- **Timeline**: 3 weeks (with parallel work)
- **Risk**: Medium (mitigated by phased approach)

---

## Critical Issues Found

### 1. Speed Bonus Bug (Freshen Up Domain)
- **Severity**: High
- **Issue**: +25 XP speed bonus not working
- **Cause**: `completionTime` parameter is `undefined`
- **Location**: `domain/xpCalculations.ts` - `calculateFreshenUpXP()`

### 2. Disconnected Task Completion (Blood Flow Domain)
- **Severity**: Medium
- **Issue**: Users can checkbox without doing push-ups
- **Recommendation**: Auto-check when reps > 0, or remove checkbox

### 3. XP Calculation Discrepancy (Wake Up Domain)
- **Severity**: Low
- **Issue**: Two different multipliers (actual vs UI display)
- **Actual**: 2.0x before 7am, 1.5x before 8am, etc.
- **UI Display**: 3x before 7am, 2x before 9am, etc.

---

## Proposed Architecture

```
src/domains/lifelock/1-daily/1-morning-routine/
├── domain/                              # Business logic
│   ├── types/                           # Domain types
│   ├── services/                        # XP calculator, etc.
│   └── config/                          # Task definitions
│
├── application/                         # Use cases
│   ├── wake-up/                         # Wake up domain
│   ├── freshen-up/                      # Freshen up domain
│   ├── blood-flow/                      # Blood flow domain
│   ├── brain-power/                     # Brain power domain
│   ├── planning/                        # Planning domain
│   ├── meditation/                      # Meditation domain
│   └── morning-routine/                 # Orchestrator
│
├── infrastructure/                      # Data access
│   ├── repositories/
│   └── external/
│
└── ui/                                  # Presentation
    ├── pages/                           # Main orchestrator (~200 lines)
    ├── task-views/                      # Task-specific UI
    └── components/                      # Shared components
```

---

## Implementation Phases

### Phase 1: Foundation (2 days)
- Create type definitions
- Set up service interfaces
- Extract configuration

### Phase 2: Domain Layer (3 days)
- Implement XP calculation services
- Implement task services
- Implement time services

### Phase 3: Application Layer (3 days)
- Create domain-specific hooks
- Create domain services
- Create orchestrator hook

### Phase 4: UI Layer (2 days)
- Create task view components
- Refactor existing components
- Create shared UI components

### Phase 5: Integration (2 days)
- Implement infrastructure layer
- Create main page component
- Integrate with existing systems

### Phase 6: Migration (2 days)
- Feature flag implementation
- Data migration
- Gradual rollout (10% → 25% → 50% → 100%)

### Phase 7: Cleanup (1 day)
- Remove old code
- Update documentation
- Performance optimization

---

## Testing Strategy

### Unit Tests (70% coverage target)
- XP calculations
- Time parsing
- Task validation
- State management

### Integration Tests (50% coverage target)
- Hook interactions
- Service coordination
- Data flow

### E2E Tests (100% user journeys)
- Complete morning routine
- XP calculation
- Offline mode
- Data sync

---

## Risk Mitigation

### Data Loss Risk (Critical)
- ✅ Full backup before migration
- ✅ Dry-run mode
- ✅ Rollback script
- ✅ Staging environment testing

### Regression Risk (High)
- ✅ Comprehensive test suite
- ✅ Code reviews
- ✅ Feature flags
- ✅ Gradual rollout
- ✅ Monitoring and alerting

### Performance Risk (Medium)
- ✅ Performance benchmarks
- ✅ Bundle size monitoring
- ✅ Code splitting
- ✅ Lazy loading

---

## Success Metrics

### Code Quality
- **80% reduction** in max file size (1,192 → <300 lines)
- **70%+ test coverage** (from 0%)
- **<10 cyclomatic complexity** per function

### Performance
- **No regression** in load times
- **<5% bundle size increase**
- **<100ms initial render**

### Maintainability
- **50% faster** feature development
- **50% faster** bug fixes
- **30% faster** code reviews

---

## Next Steps

### Immediate (This Week)
1. ✅ Review all analysis documents
2. ⏳ Approve refactoring approach
3. ⏳ Set up project tracking
4. ⏳ Schedule work phases

### Short-term (Week 1-2)
1. ⏳ Begin Phase 1: Foundation
2. ⏳ Create comprehensive test suite
3. ⏳ Set up feature flags
4. ⏳ Create staging environment

### Medium-term (Week 3-4)
1. ⏳ Complete Phases 2-4
2. ⏳ Begin integration testing
3. ⏳ Start gradual rollout

### Long-term (Week 5+)
1. ⏳ Complete migration
2. ⏳ Remove old code
3. ⏳ Monitor performance
4. ⏳ Iterate based on feedback

---

## Files Created

1. `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/MORNING-ROUTINE-REFACTORING-PLAN.md`
2. `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/MORNING-ROUTINE-CODE-STRUCTURE.md`
3. `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/1-daily/1-morning-routine/docs/domain-analysis/WAKE_UP_DOMAIN_ANALYSIS.md`
4. `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/docs/analysis/freshen-up-domain-analysis.md`
5. `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/1-daily/1-morning-routine/docs/DOMAIN-ANALYSIS-BLOOD-FLOW.md`
6. `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/CROSS-CUTTING-CONCERNS-ANALYSIS.md`
7. `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/1-daily/1-morning-routine/docs/REFACTORING-IMPLEMENTATION-PLAN.md`
8. `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox/.plans/active/vibe-kanban-work/task-morning-routine-refactor-progress.md` (this file)

---

## Agent IDs (for Resuming)

- **Main Orchestrator**: Current session
- **Wake Up Analyzer**: a1861f8
- **Freshen Up Analyzer**: ac36349
- **Blood Flow Analyzer**: a134c7e
- **Cross-Cutting Analyzer**: a3c2b9d
- **Implementation Planner**: abb3d64

---

## Status: ✅ Analysis Complete

All domain analysis subagents have completed their work. The refactoring is ready to begin implementation pending approval.

---

*Last Updated: 2025-01-18T07:00:00Z*
