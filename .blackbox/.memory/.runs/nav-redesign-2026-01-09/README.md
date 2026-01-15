# Bottom Navigation Redesign

**Run ID:** nav-redesign-2026-01-09
**Status:** Ready for Implementation ✅
**Priority:** High

## Quick Summary

Redesign the Daily View bottom navigation from **7 tabs** to **4 buttons + Smart View Navigator + More menu**.

---

## The 5 Buttons

### 1. 📅 Timebox
- **Sub-tabs:** Timebox, Morning Routine, Checkout
- Morning/Checkout **always available** (no time restrictions)
- Sub-navigation bar to switch between them

### 2. ✅ Tasks
- **Sub-tabs:** Today's Tasks, Light Work, Deep Work
- Sub-navigation bar to switch between them

### 3. ❤️ Wellness
- All health/fitness features
- No sub-navigation

### 4. 🔄 Smart View Navigator (Contextual)
- **On Daily** → Shows "Weekly" → goes to Weekly
- **On Weekly** → Shows "Monthly" → goes to Monthly
- **On Monthly** → Shows "Yearly" → goes to Yearly
- **On Yearly** → Shows "Life" → goes to Life
- **On Life** → Shows "Daily" → goes to Daily

Creates a **view hierarchy cycle**!

### 5. ⊞ More (9-dot icon)
Opens popup menu showing:
- Clients, Partners
- XP Dashboard, XP Store

---

## What This Fixes

✅ **Too many tabs** (7 → 4 buttons)
✅ **Scattered navigation** (Light Work, Deep Work, Tasks grouped together)
✅ **Hard to access other views** (Smart Navigator provides quick access)
✅ **Sidebar pages inaccessible** (More menu for Clients/Partners/XP)
✅ **Morning/Checkout hidden** (Always available in Timebox sub-nav)

---

## Key Documents

**Read in this order:**
1. **`SUMMARY.md`** - Complete overview (start here!)
2. **`VISUAL-DIAGRAM.md`** - Visual diagrams of all states
3. **`implementation-plan.md`** - Technical implementation details
4. **`context.md`** - Current state analysis
5. **`analysis.md`** - Detailed technical analysis

---

## Technical Approach

### Reusing Existing Components ✅
- `DailyBottomNav` - Keep as base
- `Sheet` component - Use for More menu
- `Button` component - For menu items
- All section components - No changes needed

### Only Creating 2 New Components
1. **`ConsolidatedBottomNav.tsx`** - Wrapper that manages 5-button layout
2. **`SectionSubNav.tsx`** - Simple horizontal pill buttons for sub-navigation

### Configuration File
**`navigation-config.ts`** contains all mappings and definitions

---

## Implementation Estimate

**Total: 13-19 hours**

- Config structure: 1-2 hours
- New components: 4-6 hours
- TabLayoutWrapper updates: 3-4 hours
- View rendering updates: 2-3 hours
- Testing & fixes: 3-4 hours

---

## All Questions Answered ✅

1. ✅ **4th button:** Smart View Navigator (contextual)
2. ✅ **More menu:** Bottom sheet using existing `Sheet` component
3. ✅ **Morning/Checkout:** Always available, no time restrictions
4. ✅ **Tasks default:** Simple switcher, no complex logic
5. ✅ **Components:** Reuse existing, minimal new code

---

## Ready to Build!

Planning complete. See `implementation-plan.md` for:
- Complete code examples
- Exact file changes
- Testing checklist
- Migration strategy

**Files to modify:**
- New: `navigation-config.ts`, `ConsolidatedBottomNav.tsx`, `SectionSubNav.tsx`
- Modify: `TabLayoutWrapper.tsx`, view switch statements

**Waiting for your go-ahead!** 🚀
