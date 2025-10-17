# File Locks - Active Development Tracking

**Purpose**: Prevent Codex from creating PRs that conflict with ongoing work
**Update Frequency**: Daily (or after major changes)
**Last Updated**: 2025-10-17 17:10

---

## 🔒 LOCKED FILES (Don't Touch!)

**XP System Development** (Locked until further notice):

| File | Locked By | Reason | Lines Modified | Unlock Date |
|------|-----------|--------|----------------|-------------|
| `src/ecosystem/internal/lifelock/views/daily/light-work/components/LightWorkTaskList.tsx` | Manual | XP pills added (671-679) | +12 | TBD |
| `src/ecosystem/internal/lifelock/views/daily/deep-work/components/DeepWorkTaskList.tsx` | Manual | XP pills added (938-946) | +12 | TBD |
| `src/ecosystem/internal/lifelock/views/daily/morning-routine/MorningRoutineSection.tsx` | Manual | Complete XP system | +200 | TBD |
| `src/ecosystem/internal/lifelock/views/daily/checkout/NightlyCheckoutSection.tsx` | Manual | XP integration | +50 | TBD |
| `src/ecosystem/internal/lifelock/views/daily/wellness/home-workout/HomeWorkoutSection.tsx` | Manual | XP integration | +30 | TBD |
| `src/ecosystem/internal/lifelock/wellness/WaterTracker.tsx` | PR #25 | Just added | +205 | 2025-10-19 |

---

## ⚠️ RECENTLY CHANGED (48-Hour Cooldown)

**Infrastructure Updates** (Don't refactor, can add features):

| File | Changed By | Date | Cooldown Until |
|------|------------|------|----------------|
| `src/ecosystem/internal/tasks/hooks/useLightWorkTasksSupabase.ts` | PR #35, #38, #42 | 2025-10-17 | 2025-10-19 |
| `src/ecosystem/internal/tasks/hooks/useDeepWorkTasksSupabase.ts` | PR #35, #38, #42 | 2025-10-17 | 2025-10-19 |
| `src/shared/services/unified-data.service.ts` | PR #22, #43 | 2025-10-17 | 2025-10-19 |
| `src/shared/hooks/useDailyReflections.ts` | PR #22, #43 | 2025-10-17 | 2025-10-19 |
| `src/ecosystem/internal/admin/clients/AdminClientsView.tsx` | Direct commit | 2025-10-17 | 2025-10-19 |
| `src/ecosystem/internal/admin/clients/ClientCard.tsx` | Direct commit | 2025-10-17 | 2025-10-19 |
| `src/ecosystem/internal/admin/clients/AirtableClientsTable.tsx` | Direct commit | 2025-10-17 | 2025-10-19 |
| `src/pages/ClientDetailPage.tsx` | Direct commit | 2025-10-17 | 2025-10-19 |

---

## ✅ SAFE TO MODIFY (Green Zones)

**Completely Isolated Areas** (Work freely):

### **Admin Features**:
```
✅ src/ecosystem/internal/admin/financials/* (all files)
✅ src/ecosystem/internal/admin/projects/* (all files)
✅ src/ecosystem/internal/admin/outreach/* (all files)
✅ src/ecosystem/internal/admin/integrations/* (all files)
✅ src/ecosystem/internal/admin/youtube-scraper/* (all files)
✅ src/ecosystem/internal/admin/templates/* (all files)
✅ src/ecosystem/internal/admin/plans/* (all files)
```

### **API Routes**:
```
✅ api/* (create NEW files only)
   - api/financials/* (NEW)
   - api/projects/* (NEW)
   - api/outreach/* (NEW)
   - api/integrations/* (NEW)
   - api/analytics/* (NEW)
   - api/webhooks/* (NEW)
   - api/notifications/* (NEW)
   - api/search/* (NEW)
```

### **Tests**:
```
✅ tests/* (all files - unlimited)
   - tests/services/*
   - tests/hooks/*
   - tests/components/*
   - tests/e2e/*
   - tests/integration/*
```

### **Documentation**:
```
✅ docs/* (all files - unlimited)
   - docs/features/*
   - docs/api/*
   - docs/guides/*
   - docs/architecture/*
```

### **Utilities**:
```
✅ src/shared/utils/* (create new files only)
✅ src/utils/* (create new files only)
```

### **Types**:
```
✅ src/types/* (create new files only)
   ⚠️  DON'T modify existing type files
   ✅ CREATE new type files for new features
```

---

## 🚫 NO-GO ZONES (Never Touch Without Permission)

**Core Infrastructure**:
```
❌ src/shared/services/unified-data.service.ts (used everywhere)
❌ src/shared/services/auth.service.ts (authentication)
❌ src/shared/services/task.service.ts (core tasks)
❌ src/shared/lib/supabase-clerk.ts (Supabase setup)
❌ src/App.tsx (root app)
❌ src/main.tsx (entry point)
```

**Routing**:
```
❌ src/ecosystem/internal/admin/routing/* (routing config)
❌ src/shared/services/tab-config.ts (tab configuration)
```

**Authentication**:
```
❌ src/shared/ClerkProvider.tsx
❌ src/shared/AuthProvider.tsx
```

---

## 📊 File Change Frequency

**Hot Files** (changed in last 7 days):
```
🔥 useLightWorkTasksSupabase.ts (8 PRs modified)
🔥 useDeepWorkTasksSupabase.ts (6 PRs modified)
🔥 LightWorkTaskList.tsx (5 PRs wanted to modify)
🔥 DeepWorkTaskList.tsx (5 PRs wanted to modify)
🔥 NightlyCheckoutSection.tsx (4 PRs wanted to modify)
🔥 unified-data.service.ts (4 PRs modified)
```

**Cool Files** (unchanged for >30 days):
```
❄️ src/ecosystem/internal/admin/financials/* (mostly untouched)
❄️ src/ecosystem/internal/admin/projects/* (minimal changes)
❄️ src/ecosystem/internal/admin/outreach/* (basic only)
❄️ api/* (only 2 files exist)
```

---

## 🎯 Quick Reference for Codex

**Before creating ANY PR, Codex should check:**

1. **Is file in LOCKED section?** → DON'T TOUCH
2. **Is file in RECENTLY CHANGED?** → Wait 48 hours OR ask permission
3. **Is file in SAFE TO MODIFY?** → GO AHEAD
4. **Is file in NO-GO ZONES?** → NEVER TOUCH

---

## 🔄 Update Protocol

**When to update this file:**

**Daily**:
- Remove files from "Recently Changed" after 48 hours
- Add newly merged PR files to "Recently Changed"
- Update locked files status

**After big changes**:
- Add affected files to "Locked"
- Set unlock dates
- Notify Codex

**After merge sessions**:
- Move merged PR files to "Recently Changed"
- Add timestamp and cooldown date

---

## 📝 Template for Manual Updates

**When you manually change files:**
```markdown
# 2025-10-17: Added XP System
🔒 LOCKED:
- LightWorkTaskList.tsx (lines 671-679)
- DeepWorkTaskList.tsx (lines 938-946)
- MorningRoutineSection.tsx (lines 44-61, 726-745, 885-889)

Reason: XP gamification integration
Unlock: TBD (notify Codex when ready)
```

---

## 🎯 Auto-Update Script

**TODO**: Create `scripts/update-file-locks.sh`:
```bash
#!/bin/bash
# Auto-update FILE-LOCKS.md based on recent commits

echo "Updating FILE-LOCKS.md..."

# Get files changed in last 5 commits
git diff HEAD~5 --name-only > /tmp/recently-changed.txt

# Get date 48 hours from now
UNLOCK_DATE=$(date -v+2d +%Y-%m-%d 2>/dev/null || date -d '+2 days' +%Y-%m-%d)

# TODO: Auto-generate RECENTLY CHANGED section
echo "Files to add to RECENTLY CHANGED:"
cat /tmp/recently-changed.txt

echo ""
echo "Cooldown until: $UNLOCK_DATE"
echo ""
echo "⚠️ Update .github/FILE-LOCKS.md manually for now"
```

---

## 💡 Communication Templates

### **For Codex (Before PR Creation)**:
```
"Codex, before creating PRs, check .github/FILE-LOCKS.md

Locked files (don't touch):
- [list from LOCKED section]

Safe zones (work freely):
- Admin Financials
- Admin Projects
- API Routes (new files)
- Tests

Ready?"
```

### **For Codex (After Manual Changes)**:
```
"Codex, I just added XP to task lists.

Updated FILE-LOCKS.md:
- LightWorkTaskList.tsx (LOCKED)
- DeepWorkTaskList.tsx (LOCKED)

Don't create PRs touching these files.

Safe alternative zones:
- Admin Financials
- Admin Projects

Ready to work on safe zones?"
```

---

**Keep this file updated daily to prevent conflicts!**

**Last audit**: 2025-10-17 17:10
**Next audit due**: 2025-10-18 09:00
