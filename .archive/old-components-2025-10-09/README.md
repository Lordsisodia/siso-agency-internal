# 🗑️ Archived Components - DO NOT USE

**Date**: October 9, 2025  
**Reason**: Replaced with clean v2 architecture

---

## 📦 Archived Files

### 1. AnimatedDateHeader-v2-WRONG-XP-BAR.tsx (10KB)
**Original location**: `src/shared/ui/animated-date-header-v2.tsx`

❌ **DO NOT USE THIS**

Shows:
- Level 1 circle
- 0 XP today  
- Streak/Badge icons
- XP progress bar
- "X% through the day"

✅ **USE THIS INSTEAD**: `CleanDateNav` (`src/shared/ui/clean-date-nav.tsx`)
- Simple "Day Progress X%"
- No XP clutter
- Color-coded per tab

---

### 2. DeepFocusWorkSection-OLD-421lines.tsx (17KB)
**Original location**: `src/ecosystem/internal/lifelock/sections/DeepFocusWorkSection.tsx`

❌ **DO NOT USE THIS**

Problems:
- 421 lines of mock UI code
- Hardcoded fake tasks
- No Supabase integration
- Uses old components (SharedTaskCard, FlowStateTimer)

✅ **USE THIS INSTEAD**: Current `DeepFocusWorkSection.tsx` (110 lines)
- Uses `UnifiedWorkSection`
- Real Supabase data via `useDeepWorkTasksSupabase`

---

### 3. LightFocusWorkSection-OLD-886lines.tsx (34KB)
**Original location**: `src/ecosystem/internal/lifelock/sections/LightFocusWorkSection.tsx`

❌ **DO NOT USE THIS**  

Problems:
- 886 lines of spaghetti code
- Mock tasks: "Review and respond to emails", etc
- Duplicate AnimatedDateHeader embedded
- No real API calls

✅ **USE THIS INSTEAD**: Current `LightFocusWorkSection.tsx` (118 lines)
- Uses `UnifiedWorkSection`
- Real Supabase data via `useLightWorkTasksSupabase`

---

## ⚠️ WARNING TO AI AGENTS

If you're reading this, these components are **ARCHIVED FOR A REASON**.

**DO NOT**:
- Suggest using these components
- Copy code from these files
- Restore these patterns

**DO**:
- Use CleanDateNav for date headers
- Use UnifiedWorkSection for task management
- Use dedicated Supabase hooks (useDeepWorkTasksSupabase, useLightWorkTasksSupabase)

---

**Total Savings**: 1,307 lines eliminated, 61KB reduced to 10KB
