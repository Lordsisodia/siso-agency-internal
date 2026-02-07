# Lifelog Daily / Nightly Checkout Issues Analysis

## Issues Identified

### Issue 1: Auto-Collapse on First Character (What Went Well & Even Better If)
**Files:** `WentWellSection.tsx`, `EvenBetterIfSection.tsx`

**Problem:** When typing in the "What went well" or "Even better if" sections, the card immediately collapses after typing the first character. The user has to reopen it to continue typing.

**Root Cause:** Lines 129-141 in both files:
```typescript
// Auto-collapse when section becomes complete
useEffect(() => {
  const hasContent = wentWellItems.some(item => item.trim() !== '');
  const wasComplete = prevCompleteRef.current;

  // If section just got content and was empty before, collapse it
  if (hasContent && !wasComplete && isExpandedRef.current) {
    setIsExpanded(false);
  }

  prevCompleteRef.current = hasContent;
}, [wentWellItems]);
```

The logic triggers on the first keystroke because:
1. `wentWellItems` changes on every keystroke
2. `hasContent` becomes `true` after first character
3. `wasComplete` (prevCompleteRef.current) was `false`
4. Section collapses immediately

**Why it only happens once:** After collapse, `prevCompleteRef.current` is now `true`, so subsequent edits don't trigger the collapse.

---

### Issue 2: Tomorrow's Plan Not Saving / App Freezing
**File:** `TomorrowsPlanSection.tsx`

**Problem:** The "Tomorrow's Plan" section doesn't save data and causes the app to freeze.

**Root Causes:**

1. **Missing fields in save function** - `useDailyReflections.ts` lines 239-254:
   - `nonNegotiables` array is NOT being saved
   - Only `tomorrowTopTasks` and `tomorrowFocus` are saved
   - The hook doesn't include `nonNegotiables` in the save payload

2. **Complex nested state updates** - `TomorrowsPlanSection.tsx`:
   - Three independent subsections (nonNegotiables, mainFocus, topTasks)
   - Each has its own auto-collapse logic (lines 48-72)
   - Each keystroke triggers `onChange` which bubbles up to parent
   - Parent (`NightlyCheckoutSection.tsx`) calls `updateCheckoutData` which triggers the debounced save effect

3. **Potential infinite loop / excessive re-renders:**
   - Every keystroke updates parent state
   - Parent has debounced save (1 second)
   - But the auto-collapse effect runs immediately
   - Rapid state changes could cause React render thrashing

---

### Issue 3: Checkmark Appears Too Early
**All section files**

**Problem:** The green checkmark appears immediately when any content is entered (1/3 items).

**Current behavior:**
- `WentWellSection.tsx` line 181-190: Checkmark shows when `hasContent` (any item has text)
- `EvenBetterIfSection.tsx` line 181-190: Same logic
- `TomorrowsPlanSection.tsx` line 118-127: Checkmark shows when ANY of the three subsections has content

**User expectation:** Wait for minimum threshold (e.g., 3 items or all fields) before showing complete.

---

## File Locations

### Main Components
| File | Purpose |
|------|---------|
| `/src/domains/lifelock/1-daily/7-checkout/ui/pages/NightlyCheckoutSection.tsx` | Main container, manages all state and saving |
| `/src/domains/lifelock/1-daily/7-checkout/ui/components/reflection/WentWellSection.tsx` | "What went well" card |
| `/src/domains/lifelock/1-daily/7-checkout/ui/components/reflection/EvenBetterIfSection.tsx` | "Even better if" card |
| `/src/domains/lifelock/1-daily/7-checkout/ui/components/tomorrow/TomorrowsPlanSection.tsx` | "Tomorrow's plan" card |

### Data Layer
| File | Purpose |
|------|---------|
| `/src/domains/lifelock/1-daily/5-stats/domain/useDailyReflections.ts` | Hook for loading/saving reflection data |
| `/src/services/shared/unified-data.service.ts` | Offline-first data service (IndexedDB + Supabase) |

### XP Calculations
| File | Purpose |
|------|---------|
| `/src/domains/lifelock/1-daily/7-checkout/domain/xpCalculations.ts` | XP calculation functions |

---

## Data Flow

```
User types in input
    ↓
Component calls onChange (immediate)
    ↓
Parent (NightlyCheckoutSection) updates checkoutData state
    ↓
useEffect triggers (debounced 1 second)
    ↓
saveReflection called
    ↓
unifiedDataService.saveDailyReflection()
    ↓
IndexedDB (immediate) + Supabase (async)
```

---

## Fix Recommendations

### Fix 1: Auto-Collapse Timing
**Option A:** Remove auto-collapse entirely (simplest)
**Option B:** Only auto-collapse when user clicks outside or explicitly completes
**Option C:** Add minimum content threshold before auto-collapse (e.g., 2+ items)

### Fix 2: Tomorrow's Plan Saving
1. Add `nonNegotiables` to the save function in `useDailyReflections.ts`
2. Review the unified data service to ensure it handles the array properly
3. Consider debouncing the input at the component level to reduce re-renders

### Fix 3: Completion Checkmark Logic
Change from "any content" to "minimum threshold":
- Went Well: 3+ items
- Even Better If: 3+ items
- Tomorrow's Plan: All 3 subsections have content

---

## Additional Observations

1. **Inconsistent field naming:**
   - Component uses: `nonNegotiables` (array)
   - Database might use: `non_negotiables` or `nonNegotiable` (single string)
   - Need to verify Supabase schema matches

2. **Missing metrics fields in save:**
   - `meditation`, `workout`, `nutrition`, `deep_work`, `research`, `sleep` objects
   - These are in `CheckoutData` type but may not be persisted properly

3. **DailyMetricsSection** likely has same auto-collapse issue (needs verification)
