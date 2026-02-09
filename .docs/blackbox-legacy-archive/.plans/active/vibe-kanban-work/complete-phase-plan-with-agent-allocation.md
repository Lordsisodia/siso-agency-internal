# Complete Phase Plan: Morning Routine Refactoring

**Project:** SISO-INTERNAL Morning Routine Feature
**Total Duration:** 3 weeks (15 working days)
**Total Phases:** 7
**Agent Strategy:** Parallel execution with specialist teams

---

## 🎯 Overview

This document outlines the complete agent allocation plan for all 7 phases of the Morning Routine refactoring. Each phase builds on the previous one, with clear handoff points and success criteria.

---

## 📊 Phase Summary

| Phase | Duration | Purpose | Team Size | Files Created |
|-------|----------|---------|-----------|---------------|
| 1. Foundation | 2 days | Types, config, interfaces | 5 agents | 12 files |
| 2. Domain Layer | 3 days | Business logic services | 6 agents | 15 files |
| 3. Application Layer | 3 days | Hooks and orchestrators | 7 agents | 14 files |
| 4. UI Layer | 2 days | Task views and components | 6 agents | 16 files |
| 5. Integration | 2 days | Infrastructure and assembly | 5 agents | 8 files |
| 6. Migration | 2 days | Feature flags and rollout | 4 agents | 6 files |
| 7. Cleanup | 1 day | Finalization and optimization | 3 agents | Documentation |

**Total:** 38 agent-assignments, 71 new files, 15 days

---

## 🚀 Phase 1: Foundation (2 Days)

**Status:** 🚀 Starting Now
**Files:** 12
**Team:** 5 Agents

### Agent Allocation

| Role | Agent Type | Focus | Deliverables |
|------|------------|-------|--------------|
| **Team Lead** | Architect | Coordination, review | Sign-off |
| **Type Specialist** | backend-developer-mcp-enhanced | Domain types | 3 type files |
| **Config Extractor** | general-purpose | Constants extraction | 3 config files |
| **Interface Designer** | Plan | Service contracts | 3 interface files |
| **Test Setup** | test-runner | Test infrastructure | 3 test files |

### Execution Plan

**Detailed plan:** `.blackbox/.plans/active/vibe-kanban-work/phase-1-foundation-execution-plan.md`

**Launch Command:**
```bash
# Team Lead kicks off, then 4 parallel specialists
```

### Success Criteria
- ✅ All type definitions compile
- ✅ Configuration extracted
- ✅ Test suite runs
- ✅ Zero breaking changes

---

## 🔧 Phase 2: Domain Layer (3 Days)

**Status:** ⏳ Blocked on Phase 1
**Files:** 15
**Team:** 6 Agents

### Agent Allocation

| Role | Agent Type | Focus | Deliverables |
|------|------------|-------|--------------|
| **Team Lead** | Architect | Coordination | Sign-off |
| **XP Calculator** | backend-developer-mcp-enhanced | XP calculations | 5 service files |
| **XP Multiplier** | general-purpose | Multiplier logic | 3 service files |
| **Validator** | Plan | Validation logic | 2 service files |
| **Time Parser** | general-purpose | Time utilities | 2 service files |
| **Test Writer** | test-runner | Unit tests | 3 test files |

### Deliverables

```
domain/services/
├── xp/
│   ├── XPCalculator.service.ts        (XP Calculator)
│   ├── XPMultiplier.service.ts        (XP Multiplier)
│   ├── WakeUpXPService.ts             (XP Calculator)
│   ├── FreshenUpXPService.ts          (XP Calculator)
│   └── index.ts
├── validators/
│   ├── TaskValidator.service.ts       (Validator)
│   ├── WakeUpValidator.service.ts     (Validator)
│   └── index.ts
├── parsers/
│   ├── TimeParser.service.ts          (Time Parser)
│   ├── DateParser.service.ts          (Time Parser)
│   └── index.ts
└── index.ts
```

### Test Files
```
test/unit/domain/services/
├── xp/
│   ├── XPCalculator.service.test.ts
│   └── XPMultiplier.service.test.ts
└── parsers/
    └── TimeParser.service.test.ts
```

### Success Criteria
- ✅ All services implement Phase 1 interfaces
- ✅ 70%+ unit test coverage
- ✅ All tests pass
- ✅ Zero dependencies on UI layer

---

## 🪝 Phase 3: Application Layer (3 Days)

**Status:** ⏳ Blocked on Phase 2
**Files:** 14
**Team:** 7 Agents

### Agent Allocation

| Role | Agent Type | Focus | Deliverables |
|------|------------|-------|--------------|
| **Team Lead** | Architect | Coordination | Sign-off |
| **Wake Up Hook** | backend-developer-mcp-enhanced | useWakeUp | 2 files |
| **Freshen Up Hook** | general-purpose | useFreshenUp | 2 files |
| **Blood Flow Hook** | general-purpose | useBloodFlow | 2 files |
| **Brain Power Hook** | general-purpose | useBrainPower | 2 files |
| **Planning Hook** | Plan | usePlanning | 2 files |
| **Meditation Hook** | general-purpose | useMeditation | 2 files |
| **Orchestrator** | Architect | useMorningRoutine | 2 files |

### Deliverables

```
application/
├── wake-up/
│   ├── use-wake-up.ts                 (Wake Up Hook)
│   ├── wake-up.usecase.ts
│   └── index.ts
├── freshen-up/
│   ├── use-freshen-up.ts              (Freshen Up Hook)
│   ├── freshen-up.usecase.ts
│   └── index.ts
├── blood-flow/
│   ├── use-blood-flow.ts              (Blood Flow Hook)
│   └── index.ts
├── brain-power/
│   ├── use-brain-power.ts             (Brain Power Hook)
│   └── index.ts
├── planning/
│   ├── use-planning.ts                (Planning Hook)
│   └── index.ts
├── meditation/
│   ├── use-meditation.ts              (Meditation Hook)
│   └── index.ts
└── morning-routine/
    ├── use-morning-routine.ts         (Orchestrator)
    └── index.ts
```

### Success Criteria
- ✅ All hooks use Phase 2 services
- ✅ No UI code in hooks
- ✅ All hooks have TypeScript types
- ✅ Integration tests pass

---

## 🎨 Phase 4: UI Layer (2 Days)

**Status:** ⏳ Blocked on Phase 3
**Files:** 16
**Team:** 6 Agents

### Agent Allocation

| Role | Agent Type | Focus | Deliverables |
|------|------------|-------|--------------|
| **Team Lead** | Architect | Coordination | Sign-off |
| **Wake Up View** | general-purpose | WakeUpTaskView | 1 file |
| **Freshen Up View** | general-purpose | FreshenUpTaskView | 1 file |
| **Blood Flow View** | general-purpose | BloodFlowTaskView | 1 file |
| **Brain Power View** | general-purpose | BrainPowerTaskView | 1 file |
| **Planning View** | Plan | PlanningTaskView | 1 file |
| **Meditation View** | general-purpose | MeditationTaskView | 1 file |
| **Shared Components** | general-purpose | Card, Progress, etc. | 3 files |
| **Component Tests** | test-runner | Component tests | 7 files |

### Deliverables

```
ui/
├── task-views/
│   ├── WakeUpTaskView.tsx             (Wake Up View)
│   ├── FreshenUpTaskView.tsx          (Freshen Up View)
│   ├── BloodFlowTaskView.tsx          (Blood Flow View)
│   ├── BrainPowerTaskView.tsx         (Brain Power View)
│   ├── PlanningTaskView.tsx           (Planning View)
│   ├── MeditationTaskView.tsx         (Meditation View)
│   └── index.ts
└── components/
    ├── MorningRoutineCard.tsx         (Card wrapper)
    ├── TaskProgress.tsx               (Progress bar)
    ├── CompletionBar.tsx              (Completion status)
    └── index.ts
```

### Success Criteria
- ✅ All views use Phase 3 hooks
- ✅ No business logic in views
- ✅ Component tests pass
- ✅ Visual regression tests pass

---

## 🔗 Phase 5: Integration (2 Days)

**Status:** ⏳ Blocked on Phase 4
**Files:** 8
**Team:** 5 Agents

### Agent Allocation

| Role | Agent Type | Focus | Deliverables |
|------|------------|-------|--------------|
| **Team Lead** | Architect | Coordination | Sign-off |
| **Repository** | backend-developer-mcp-enhanced | Data access | 3 files |
| **Main Page** | general-purpose | Page refactor | 1 file |
| **Integration Tests** | test-runner | E2E tests | 3 files |
| **Performance** | general-purpose | Optimization | 1 file |

### Deliverables

```
infrastructure/
└── repositories/
    ├── MorningRoutineRepository.ts    (Repository)
    ├── OfflineCache.ts                (Cache)
    └── SupabaseSync.ts                (Sync)

ui/
└── pages/
    └── MorningRoutineSection.tsx      (Refactored - ~200 lines)

test/integration/
├── morning-routine.integration.test.ts
├── offline-sync.integration.test.ts
└── xp-calculation.integration.test.ts
```

### Success Criteria
- ✅ Main page reduced to <300 lines
- ✅ All integration tests pass
- ✅ Performance benchmarks met
- ✅ No data loss

---

## 🚦 Phase 6: Migration (2 Days)

**Status:** ⏳ Blocked on Phase 5
**Files:** 6
**Team:** 4 Agents

### Agent Allocation

| Role | Agent Type | Focus | Deliverables |
|------|------------|-------|--------------|
| **Team Lead** | Architect | Coordination | Sign-off |
| **Feature Flags** | general-purpose | Flag system | 2 files |
| **Data Migration** | backend-developer-mcp-enhanced | Migration scripts | 2 files |
| **Rollout Plan** | Plan | Rollout strategy | 2 files |

### Deliverables

```
lib/feature-flags/
└── morning-routine-refactor.ts

infrastructure/
└── migrations/
    ├── migrate-to-new-arch.ts
    └── rollback-migration.ts

docs/
├── MIGRATION-GUIDE.md
└── ROLLOUT-PLAN.md
```

### Rollout Strategy
- Day 1: 10% of users
- Day 2: 25% of users
- Day 3: 50% of users
- Day 4: 100% of users

### Success Criteria
- ✅ Feature flags work
- ✅ Zero data loss
- ✅ Smooth rollout
- ✅ Rollback plan tested

---

## 🧹 Phase 7: Cleanup (1 Day)

**Status:** ⏳ Blocked on Phase 6
**Files:** Documentation
**Team:** 3 Agents

### Agent Allocation

| Role | Agent Type | Focus | Deliverables |
|------|------------|-------|--------------|
| **Team Lead** | Architect | Final review | Sign-off |
| **Code Cleanup** | general-purpose | Remove old code | Clean repo |
| **Documentation** | general-purpose | Update docs | Complete docs |

### Deliverables

```
docs/
├── MORNING-ROUTINE-ARCHITECTURE.md
├── API-REFERENCE.md
└── MIGRATION-COMPLETE.md

src/domains/lifelock/1-daily/1-morning-routine/
└── [OLD CODE REMOVED]
```

### Success Criteria
- ✅ Old code removed
- ✅ Documentation complete
- ✅ All tests pass
- ✅ Performance optimized

---

## 📊 Agent Utilization Matrix

### By Phase

| Phase | Total Agents | Specialist | General | Architect | Test |
|-------|--------------|------------|---------|-----------|------|
| Phase 1 | 5 | 1 | 3 | 1 | 0 |
| Phase 2 | 6 | 1 | 3 | 1 | 1 |
| Phase 3 | 7 | 1 | 5 | 1 | 0 |
| Phase 4 | 6 | 0 | 5 | 1 | 1 |
| Phase 5 | 5 | 1 | 2 | 1 | 1 |
| Phase 6 | 4 | 0 | 2 | 1 | 1 |
| Phase 7 | 3 | 0 | 2 | 1 | 0 |
| **Total** | **40** | **4** | **24** | **7** | **4** |

### By Agent Type

| Agent Type | Phases | Count | Role |
|------------|--------|-------|------|
| Architect (Team Lead) | All 7 | 7 | Coordination, review, sign-off |
| backend-developer-mcp-enhanced | 1, 2, 5 | 3 | Database, services, integration |
| Plan | 2, 3, 4, 6 | 4 | Complex design, interfaces |
| general-purpose | 1, 2, 3, 4, 5, 6, 7 | 24 | Standard implementation |
| test-runner | 2, 4, 5, 6 | 4 | Testing infrastructure |

---

## 🔄 Handoff Protocol

### Phase N → Phase N+1

**Before Phase N completes:**
1. Team Lead reviews all deliverables
2. All tests pass
3. Documentation updated
4. Blackbox updated with artifacts

**At Phase N completion:**
1. Team Lead creates sign-off document
2. Artifacts moved to `.blackbox/9-brain/incoming/`
3. Next phase team reviews previous phase
4. Next phase kicks off with clear dependencies

### Dependencies

```
Phase 1 (Foundation)
    ↓ Types, interfaces, test infra
Phase 2 (Domain Layer)
    ↓ Services, calculations
Phase 3 (Application Layer)
    ↓ Hooks, orchestrators
Phase 4 (UI Layer)
    ↓ Views, components
Phase 5 (Integration)
    ↓ Infrastructure, assembly
Phase 6 (Migration)
    ↓ Feature flags, rollout
Phase 7 (Cleanup)
    ↓ Finalization
```

---

## 📈 Tracking & Reporting

### Daily Updates

Each team lead updates:
1. `.blackbox/.plans/active/vibe-kanban-work/phase-N-progress.md`
2. Completed files count
3. Blocking issues
4. Test results

### Weekly Reviews

At end of each week:
1. Review all completed phases
2. Assess timeline
3. Adjust agent allocation if needed
4. Update risk register

### Final Report

When all 7 phases complete:
1. Complete refactoring summary
2. Metrics comparison (before/after)
3. Lessons learned
4. Next steps

---

## 🎯 Success Metrics

### Phase Completion
- ✅ All deliverables created
- ✅ All tests passing
- ✅ Team lead sign-off
- ✅ Documentation complete

### Overall Project
- ✅ 80% reduction in max file size
- ✅ 70%+ test coverage
- ✅ Zero breaking changes
- ✅ Performance maintained

---

**Last Updated:** 2025-01-18T07:20:00Z
**Status:** Phase 1 launching now
**Next Update:** End of Phase 1
