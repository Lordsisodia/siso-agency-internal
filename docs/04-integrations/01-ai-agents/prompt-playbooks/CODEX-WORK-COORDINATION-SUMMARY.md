# Codex Work Coordination - Quick Start Guide

**Created**: 2025-10-17
**Last Incident**: 11 conflicting PRs
**Prevention**: Use this guide ALWAYS

---

## 📋 3 Documents You Need

1. **`PR-CONFLICT-PREVENTION-GUIDE.md`** - How we got 11 conflicts & how to prevent
2. **`CODEX-PARALLEL-WORK-ZONES.md`** - Where Codex can work without conflicts
3. **`.github/FILE-LOCKS.md`** - Currently locked files (update daily!)

---

## ⚡ Quick Start: Assign Codex Work TODAY

### **Copy This Prompt**:

```
Codex, let's expand admin features in ISOLATED zones (won't conflict).

First, check .github/FILE-LOCKS.md for locked files.

LOCKED FILES (don't touch):
- LightWorkTaskList.tsx (XP system)
- DeepWorkTaskList.tsx (XP system)
- MorningRoutineSection.tsx (XP system)
- All task hooks (recently changed)

SAFE ZONES (work freely):
✅ Admin Financials (src/ecosystem/internal/admin/financials/*)
✅ Admin Projects (src/ecosystem/internal/admin/projects/*)
✅ Admin Outreach (src/ecosystem/internal/admin/outreach/*)
✅ API Routes (api/* - create NEW files only)

CREATE BATCH 1 (5 PRs in Admin Financials):
1. Expense category filter component
2. Revenue forecast widget
3. Payment reminder system
4. Budget tracking dashboard
5. Financial summary card

Requirements:
- Each PR touches DIFFERENT files
- Max 300 lines per PR
- Based on current master
- No dependencies on locked files

After I merge batch 1, we'll do batch 2.

Ready for batch 1?
```

---

## 🎯 The Golden Rules (Print This!)

### **Before Codex Creates PRs:**
```
1. ✅ Update .github/FILE-LOCKS.md
2. ✅ Tell Codex what's locked
3. ✅ Assign to isolated zone
4. ✅ Request batches (max 5 PRs)
5. ✅ Set size limit (max 300 lines)
```

### **During Merge Session:**
```
1. ✅ Merge by dependency tier (docs → fixes → features → refactors)
2. ✅ Rebase queue after EVERY 3-5 merges
3. ✅ Close duplicates immediately
4. ✅ Update FILE-LOCKS.md with newly changed files
```

### **After Merge Session:**
```
1. ✅ Tell Codex what merged
2. ✅ Update FILE-LOCKS.md
3. ✅ Run: bash scripts/check-pr-health.sh
```

---

## 🗺️ Isolated Work Zones (Codex Can Work Here)

### **✅ ZERO CONFLICT ZONES** (50+ PRs possible):

| Zone | Path | Conflict Risk | PRs Possible |
|------|------|---------------|--------------|
| **Admin Financials** | `src/ecosystem/internal/admin/financials/` | 0% | 10+ |
| **Admin Projects** | `src/ecosystem/internal/admin/projects/` | 0% | 10+ |
| **Admin Outreach** | `src/ecosystem/internal/admin/outreach/` | 0% | 10+ |
| **Admin Integrations** | `src/ecosystem/internal/admin/integrations/` | 0% | 10+ |
| **Admin YouTube** | `src/ecosystem/internal/admin/youtube-scraper/` | 0% | 5+ |
| **API Routes** | `api/*` (new files) | 0% | 20+ |
| **Tests** | `tests/*` | 0% | Unlimited |
| **Documentation** | `docs/*` | 0% | Unlimited |

---

### **❌ HIGH CONFLICT ZONES** (Avoid!):

| Zone | Path | Conflict Risk | Why |
|------|------|---------------|-----|
| **Task Hooks** | `src/ecosystem/internal/tasks/hooks/` | 95% | Core infrastructure |
| **Task Lists** | `src/ecosystem/internal/lifelock/views/daily/*/components/` | 90% | Has XP system |
| **Shared Services** | `src/shared/services/` | 90% | Used everywhere |
| **LifeLock Daily** | `src/ecosystem/internal/lifelock/views/daily/` | 85% | Recently modified |

---

## 🚀 Example: Safe 20-PR Session

**Session Plan**:
```
Codex creates PRs in 3 batches:

BATCH 1 (Zone: Admin Financials - 5 PRs):
  1. ExpenseCategoryFilter.tsx
  2. RevenueForecastWidget.tsx
  3. PaymentReminderSystem.tsx
  4. BudgetTrackingDashboard.tsx
  5. FinancialSummaryCard.tsx

  [Merge batch 1 - 10 minutes]

BATCH 2 (Zone: Admin Projects - 5 PRs):
  6. ProjectsList.tsx
  7. ProjectCard.tsx
  8. ProjectDetailView.tsx
  9. MilestoneTracker.tsx
  10. ProjectTimeline.tsx

  [Merge batch 2 - 10 minutes]

BATCH 3 (Zone: API Routes - 10 PRs):
  11. api/financials/expenses.js
  12. api/financials/revenue.js
  13. api/projects/list.js
  14. api/projects/create.js
  15. api/outreach/leads.js
  16. api/analytics/dashboard.js
  17. api/webhooks/stripe.js
  18. api/integrations/slack.js
  19. api/notifications/email.js
  20. api/search/global.js

  [Merge batch 3 - 15 minutes]
```

**Total Time**: 2 hours creation + 35 minutes merging = **Zero conflicts!** ✅

---

## 📊 Merge Success Checklist

**Before merging any PR:**
```
[ ] PR is <300 lines
[ ] PR doesn't touch locked files
[ ] PR doesn't touch recently changed files
[ ] PR is in isolated zone
[ ] PR passed CI checks
[ ] No duplicate PRs exist
```

**If ANY box is unchecked**: Don't merge yet!

---

## 🔧 Scripts Created

**Location**: `scripts/`

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `rebase-all-prs.sh` | Rebase all PRs against master | After every 3-5 merges |
| `close-duplicate-prs.sh` | Close duplicate PRs quickly | When you spot duplicates |
| `check-pr-health.sh` | Check PR queue health | Daily |
| `update-file-locks.sh` | Update FILE-LOCKS.md | After manual changes |

**Create these scripts from templates in PR-CONFLICT-PREVENTION-GUIDE.md**

---

## 📅 Daily Routine

### **Morning (5 minutes)**:
```bash
# 1. Check PR health
bash scripts/check-pr-health.sh

# 2. Rebase all PRs
bash scripts/rebase-all-prs.sh

# 3. Review FILE-LOCKS.md
cat .github/FILE-LOCKS.md

# 4. Plan today's Codex work
# Choose isolated zone from SAFE-PARALLEL-WORK-AREAS-NOW.md
```

---

### **Before Requesting Codex PRs**:
```
1. Check FILE-LOCKS.md (what's locked?)
2. Choose isolated zone
3. Request batch of 5 PRs max
4. Specify file isolation requirement
```

---

### **During Merge Session**:
```
1. Merge tier 1 (docs/tests)
2. Rebase remaining PRs ← DON'T SKIP!
3. Merge tier 2 (infrastructure)
4. Rebase remaining PRs ← DON'T SKIP!
5. Merge tier 3 (features)
6. Close duplicates
7. Update FILE-LOCKS.md
```

---

### **After Merge Session**:
```
1. Tell Codex what merged
2. Update FILE-LOCKS.md
3. Run health check
4. Plan next session
```

---

## 💡 Codex Communication Examples

### **Example 1: Request Isolated PRs**
```
Codex, create 5 PRs in Admin Financials zone:

Zone: src/ecosystem/internal/admin/financials/
Locked files: [paste from FILE-LOCKS.md]

Create:
1. Expense category filter (ExpenseCategoryFilter.tsx)
2. Revenue chart (RevenueChart.tsx)
3. Payment tracker (PaymentTracker.tsx)
4. Budget widget (BudgetWidget.tsx)
5. Summary dashboard (FinancialSummary.tsx)

Each component in SEPARATE file.
Max 300 lines each.

Ready?
```

---

### **Example 2: Notify About Manual Changes**
```
Codex, I just added XP system to:
- LightWorkTaskList.tsx (lines 671-679)
- DeepWorkTaskList.tsx (lines 938-946)

Updated FILE-LOCKS.md - these files are LOCKED.

Alternative safe zones:
- Admin Financials ✅
- Admin Projects ✅
- API Routes ✅

Let's work on Admin Financials instead. Ready?
```

---

### **Example 3: Post-Merge Update**
```
Codex, merge session complete!

✅ Merged: 5 PRs in Admin Financials
📁 Files now locked for 48h:
  - ExpenseCategoryFilter.tsx
  - RevenueChart.tsx
  - PaymentTracker.tsx

Updated FILE-LOCKS.md.

Ready for batch 2? (Admin Projects - 5 PRs)
```

---

## 🎯 Current Priorities (Based on Business Value)

### **High Priority + Zero Conflict** (DO FIRST):
```
1. API Routes expansion (20+ endpoints missing)
2. Admin Financials features (expense tracking, budgets)
3. Admin Projects management (project tracking)
4. Test coverage (many services untested)
```

### **Medium Priority + Zero Conflict**:
```
1. Admin Outreach features
2. Admin Integrations
3. Documentation improvements
4. Utility functions
```

### **High Priority + High Conflict** (DEFER):
```
1. Task list refactors (conflicts with XP)
2. Hook improvements (recently changed)
3. LifeLock optimizations (XP development active)
```

---

## 📈 Success Metrics

**Track these weekly:**

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Open PRs | <10 | 11 | 🔴 |
| Conflicting PRs | <2 | 11 | 🔴 |
| PRs >24h old | <5 | 11 | 🔴 |
| Avg merge time | <1h | 2h+ | 🔴 |
| PRs in isolated zones | >80% | 0% | 🔴 |

**Goal for next week:**
- Open PRs: <10 ✅
- Conflicting: 0 ✅
- Isolated zones: 100% ✅
- Merge time: <30min ✅

---

## 🚨 Emergency Procedures

### **If Queue Exceeds 15 PRs:**
```
1. STOP creating new PRs
2. Run: bash scripts/check-pr-health.sh
3. Close all duplicates
4. Close all PRs in locked zones
5. Merge all PRs in safe zones
6. Rebase remaining PRs
7. Resume when queue <10
```

---

### **If Conflicts Exceed 5:**
```
1. Run: bash scripts/rebase-all-prs.sh
2. If still >5 conflicts:
   - Close conflicting PRs
   - Ask Codex to regenerate with current context
3. Only keep PRs in isolated zones
```

---

## ✅ Today's Action Items

**Immediate (next 10 minutes)**:
```
1. ✅ Read PR-CONFLICT-PREVENTION-GUIDE.md
2. ✅ Review FILE-LOCKS.md
3. ✅ Identify one safe zone for Codex
4. ✅ Request batch 1 (5 PRs)
```

**This Week**:
```
1. Create scripts/rebase-all-prs.sh
2. Create scripts/check-pr-health.sh
3. Assign Codex to Admin Financials (10 PRs)
4. Assign Codex to API Routes (10 PRs)
5. Add test coverage (10 PRs)
```

**This Month**:
```
1. Complete Admin expansion (30 PRs)
2. Build API layer (30 PRs)
3. Achieve 80% test coverage (40 PRs)
4. Zero conflicts achieved ✅
```

---

## 🔗 Quick Links

**Strategy Documents**:
- [PR Conflict Prevention](./PR-CONFLICT-PREVENTION-GUIDE.md)
- [Parallel Work Zones](./CODEX-PARALLEL-WORK-ZONES.md)
- [Safe Work Areas Now](./SAFE-PARALLEL-WORK-AREAS-NOW.md)

**Active Tracking**:
- [File Locks](../.github/FILE-LOCKS.md)
- [Current PR Status](https://github.com/Lordsisodia/siso-agency-internal/pulls)

**Templates**:
- Scripts in PR-CONFLICT-PREVENTION-GUIDE.md
- Codex prompts in CODEX-PARALLEL-WORK-ZONES.md

---

## 🎯 The Formula for Success

```
Safe PRs = Isolated Zone + Different Files + Max 300 Lines + Batched Creation

Merge Success = Dependency Order + Rebase Every 3-5 + Close Duplicates + Update Locks
```

**Follow this formula → Zero conflicts guaranteed!**

---

**Print this page. Reference before EVERY Codex session.**
