# ❌ OLD BLOATED COMPONENTS - Archived 2025-10-09

## DeepFocusWorkSection (421 lines → 110 lines = 74% reduction)

**File**: `DeepFocusWorkSection-OLD-421lines.tsx`

**Problems**:
- Hardcoded mock tasks: "Complete quarterly review", "Finish client presentation"
- Mock priority tasks array with fake data
- Uses old `SharedTaskCard`, `FlowStateTimer`, `FocusSessionTimer`
- No real Supabase integration
- 421 lines of bloated UI code

**Key imports (OLD)**:
```typescript
import { SharedTaskCard, TaskData } from '@/components/ui/SharedTaskCard';
import { FlowStateTimer } from '@/shared/components/ui/FlowStateTimer';
import { FocusSessionTimer } from '../ui/FocusSessionTimer';
import { DeepFocusSessionCard } from '@/ecosystem/internal/tasks/ui/DeepFocusSessionCard';
```

---

## LightFocusWorkSection (886 lines → 118 lines = 87% reduction)

**File**: `LightFocusWorkSection-OLD-886lines.tsx`

**Problems**:
- 886 lines of UI spaghetti
- Hardcoded mock task blocks
- Duplicate "thought dump" logic
- AnimatedDateHeader embedded (should use top CleanDateNav)
- No real Supabase integration

**Key characteristics (OLD)**:
- Had its own task management state
- Had subtask arrays with mock data
- Custom priority selector
- Task reordering hooks
- All hardcoded, no API calls

---

## ✅ WHAT WE REPLACED THEM WITH

Both now use **v2 architecture**:

```typescript
// DeepFocusWorkSection.tsx (NEW - 110 lines)
import { UnifiedWorkSection } from '@/ecosystem/internal/tasks/components/UnifiedWorkSection';
import { useDeepWorkTasksSupabase } from '@/ecosystem/internal/tasks/hooks/useDeepWorkTasksSupabase';

// LightFocusWorkSection.tsx (NEW - 118 lines)  
import { UnifiedWorkSection } from '@/ecosystem/internal/tasks/components/UnifiedWorkSection';
import { useLightWorkTasksSupabase } from '@/ecosystem/internal/tasks/hooks/useLightWorkTasksSupabase';
```

**Benefits**:
- ✅ Real Supabase data (no mocks)
- ✅ Reusable `UnifiedWorkSection` component
- ✅ Dedicated hooks per work type
- ✅ 74-87% code reduction
- ✅ One CleanDateNav at top (no duplicates)

---

## CONFIRM TO DELETE

Type **"yes"** to permanently delete these old files, or **"restore"** if we got it wrong.

---

## AnimatedDateHeader (v2) - WRONG Component ❌

**File**: `AnimatedDateHeader-v2-WRONG-XP-BAR.tsx`
**Original**: `src/shared/ui/animated-date-header-v2.tsx`

**What it showed**:
- Level circle (colorScheme-based: orange/yellow/green/etc)
- "Today" / "Yesterday" / "Tomorrow"
- Date with navigation arrows
- 🔥 Streak counter
- 🏆 Badge counter  
- **"0 XP today"** text
- **XP progress bar** (gradient colored)
- **"X% through the day"** text below bar

**Why it's WRONG**:
- Too much visual clutter (Level, XP, Streak, Badges)
- Duplicate functionality with CleanDateNav
- User wanted SIMPLE "Day Progress X%" card
- This one had TWO progress metrics (XP + day %)

**Replaced with**: `CleanDateNav` (src/shared/ui/clean-date-nav.tsx)
- Simple "Day Progress X%" 
- Clean minimal design
- Color-coded per tab
- No XP/Level/Streak clutter

**Archived**: 2025-10-09
**Status**: ❌ DO NOT USE - Use CleanDateNav instead

