#!/usr/bin/env python3
"""
Create Sprint Goal document for Sprint 1.
Documents commitment, success criteria, and definition of done.
"""

import sys
import os
from pathlib import Path
import json
from datetime import datetime

os.chdir('/Users/shaansisodia/DEV/client-projects/lumelle')

print("🎯 Creating Sprint 1 Goal Document")
print("=" * 70)
print()

# Load dependency map
dep_map_file = Path(".blackbox/.plans/task-dependencies.json")
with open(dep_map_file, 'r') as f:
    dependency_data = json.load(f)

execution_order = dependency_data['execution_order']
dependencies = dependency_data['dependencies']

# Sprint 1 tasks (top 3 by priority rank)
sprint1_tasks = [
    ("Issue #199: Debug Cleanup", "2-3 hours"),
    ("Issue #196: TypeScript Config", "2-3 days"),
    ("Issue #193: CartContext Refactoring", "8-12 days")
]

# Create sprint goal document
sprint_goal = f"""# Sprint 1 Goal

**Sprint:** 1
**Start Date:** {datetime.now().strftime('%Y-%m-%d')}
**Target Duration:** 2-3 weeks
**Status:** Planning

---

## 🎯 Sprint Goal

> "Establish a solid technical foundation by cleaning up debug code, improving TypeScript configuration, and refactoring the core CartContext for better maintainability and performance."

**Focus Areas:**
- Code quality and cleanliness
- Type safety and developer experience
- Core cart architecture

---

## 📋 Committed Tasks

### 1. Issue #199: Debug Cleanup
**Priority:** P0 (Critical)
**Estimate:** 2-3 hours
**Type:** Chore
**Owner:** TBD

**Description:**
Remove all console.log, debugger statements, and temporary debug code from the codebase. Establish clean logging practices.

**Success Criteria:**
- [ ] All console.log statements removed from production code
- [ ] All debugger statements removed
- [ ] Temporary debug code removed
- [ ] Proper error logging in place where needed
- [ ] Code review approved

**Definition of Done:**
- Code reviewed
- All tests passing
- No ESLint errors
- Documentation updated
- Merged to main branch

**Dependencies:** None
**Blocks:** All other refactoring (clean slate)

---

### 2. Issue #196: TypeScript Config
**Priority:** P0 (Critical)
**Estimate:** 2-3 days
**Type:** Refactor
**Owner:** TBD

**Description:**
Improve TypeScript configuration for better type safety, stricter checking, and improved developer experience. Enable strict mode and fix resulting type errors.

**Success Criteria:**
- [ ] TypeScript strict mode enabled
- [ ] All resulting type errors fixed
- [ ] Path aliases configured (@components, @lib, etc.)
- [ ] Better type inference for cart operations
- [ ] No `any` types in critical paths
- [ ] Build times acceptable
- [ ] IDE experience improved

**Definition of Done:**
- Code reviewed
- All tests passing
- No TypeScript errors
- tsconfig.json documented
- Merged to main branch

**Dependencies:** None
**Blocks:** All other issues (better types help all work)

---

### 3. Issue #193: CartContext Refactoring
**Priority:** P0 (Critical)
**Estimate:** 8-12 days
**Type:** Refactor
**Owner:** TBD

**Description:**
Refactor monolithic CartContext.tsx (562 lines) into focused, maintainable modules. Extract state management, operations, and calculations into separate concerns.

**Success Criteria:**
- [ ] CartContext reduced to <300 lines
- [ ] Cart operations extracted to dedicated module
- [ ] Cart calculations extracted to dedicated module
- [ ] Backward compatibility maintained
- [ ] All existing functionality preserved
- [ ] Type safety improved
- [ ] Unit tests added for new modules
- [ ] Integration tests pass

**Definition of Done:**
- Code reviewed
- All tests passing (unit + integration)
- No TypeScript errors
- No ESLint errors
- Documentation updated
- Migration guide if needed
- Merged to main branch

**Dependencies:** None
**Blocks:** Issue #195 (DrawerProvider), Issue #200 (Volume Discount)

---

## 📊 Sprint Metrics

**Total Commitment:**
- Tasks: 3
- Hours: 80-160 hours (10-20 business days)
- Duration: 2-3 weeks

**Priority Breakdown:**
- P0 (Critical): 3 tasks

**Type Breakdown:**
- Chore: 1 task
- Refactor: 2 tasks

---

## 🎯 Success Criteria

Sprint 1 is successful if:

1. ✅ All 3 committed tasks are completed
2. ✅ Codebase is cleaner (no debug code)
3. ✅ TypeScript strict mode is enabled
4. ✅ CartContext is maintainable (<300 lines)
5. ✅ No regressions in cart functionality
6. ✅ All tests passing
7. ✅ Team velocity established for future sprints

---

## 🚧 Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| CartContext refactor more complex than estimated | High | Break into smaller subtasks, daily progress reviews |
| TypeScript strict mode reveals many type errors | Medium | Fix errors incrementally, focus on critical paths first |
| Cart functionality regression | High | Comprehensive testing, manual QA before merge |
| Unexpected dependencies discovered | Medium | Update dependency map, adjust sprint scope if needed |

---

## 📈 Definition of Done

For **each task** in this sprint:

- [ ] Code reviewed by at least one other person
- [ ] All tests passing (unit, integration, E2E)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No console.log or debugger statements
- [ ] Documentation updated (README, API docs)
- [ ] Migration guide if breaking changes
- [ ] Merged to main branch
- [ ] Deployed to staging
- [ ] Demoed to stakeholders

---

## 🔄 Sprint Process

### Daily Standup Questions:
1. What did you complete yesterday?
2. What will you work on today?
3. Are there any blockers?

### Issue Movement Flow:
```
backlog → sprint_backlog → planning → in_progress → qa → review → done
```

### WIP Limits:
- Sprint Backlog: 3 (max committed tasks)
- Planning: 2 (max in architecture)
- In Progress: 2 (max in parallel)
- QA: 2 (max in testing)
- Review: 2 (max in review)

---

## 📅 Sprint Timeline

**Week 1:**
- Day 1-2: Issue #199 (Debug Cleanup) - Quick win
- Day 3-5: Issue #196 (TypeScript Config) - Foundation

**Week 2-3:**
- Day 6-15: Issue #193 (CartContext Refactoring) - Main effort
  - Planning: 2 days
  - Implementation: 8-10 days
  - Testing & Review: 2-3 days

**Sprint Review:** End of Week 3

---

## 🎯 Next Sprint Preview

Based on dependency graph, Sprint 2 candidates include:
- Issue #194: Analytics Domain Migration (7-12 days)
- Issue #200: Volume Discount Duplication (depends on #193)
- Issue #195: DrawerProvider Split (depends on #193)
- WebhookInbox tasks (sequential, 5 tasks)

Final Sprint 2 commitment will be made based on:
- Sprint 1 velocity
- Remaining technical debt
- Business priorities
- Feature deadlines

---

## 📝 Notes

- This sprint focuses on **technical foundation** over new features
- Quick win first (Issue #199) to build momentum
- CartContext is the highest-risk item - allocate most time here
- Keep stakeholders informed of progress
- Update Kanban board daily
- Document decisions as you go

---

*Generated: {datetime.now().isoformat()}*
*Sprint Board: .blackbox/.plans/kanban/lumelle-refactoring.json*
*Dependency Map: .blackbox/.plans/task-dependencies.json*
"""

# Save sprint goal
goal_file = Path(".blackbox/.plans/sprint-1-goal.md")
with open(goal_file, 'w') as f:
    f.write(sprint_goal)

print(f"✅ Sprint 1 Goal document created")
print(f"   Location: {goal_file}")
print()

print("=" * 70)
print("📊 SPRINT 1 SUMMARY")
print("=" * 70)
print()

print("🎯 Sprint Goal:")
print('   "Establish solid technical foundation by cleaning up debug code,')
print('    improving TypeScript configuration, and refactoring CartContext"')
print()

print("📋 Committed Tasks:")
for i, (task, estimate) in enumerate(sprint1_tasks, 1):
    deps = dependencies.get(task, {})
    print(f"   {i}. {task}")
    print(f"      Estimate: {estimate}")
    if deps:
        print(f"      Priority Rank: {deps.get('priority_rank', 'N/A')}")
        if deps.get('depends_on'):
            print(f"      Depends on: {', '.join(deps['depends_on'])}")
        if deps.get('blocks'):
            print(f"      Blocks: {', '.join(deps['blocks'])}")
    print()

print("📊 Total Estimate: 11-17 days (2-3 weeks)")
print()

print("🎯 Key Success Criteria:")
print("   ✅ All 3 tasks completed")
print("   ✅ Codebase cleaner (no debug code)")
print("   ✅ TypeScript strict mode enabled")
print("   ✅ CartContext < 300 lines")
print("   ✅ No regressions")
print()

print("🚀 NEXT STEPS:")
print()
print("1. Review Sprint 1 Goal:")
print(f"   cat {goal_file}")
print()
print("2. Commit Sprint 1 tasks to sprint backlog:")
print("   python3 .blackbox/.plans/commit-sprint.py")
print()
print("3. Start Issue #199 (Debug Cleanup):")
print("   - Quick win (2-3 hours)")
print("   - Clean slate for other work")
print("   - Builds momentum")
print()

print("📊 Board Status:")
print("   python3 .blackbox/.plans/board-status.py")
print()
