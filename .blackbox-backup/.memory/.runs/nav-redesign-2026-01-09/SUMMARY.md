# Bottom Navigation Redesign - Plan Summary

## What We're Building

Transform the Daily View bottom navigation from **7 tabs** → **4 buttons + Smart View Navigator + More menu**

---

## The 5 Buttons

### 1. Timebox 📅
- **Sub-tabs:** Timebox, Morning Routine, Checkout
- **Morning/Checkout always available** (no time restrictions)
- Sub-navigation bar to switch between them

### 2. Tasks ✅
- **Sub-tabs:** Today's Tasks, Light Work, Deep Work
- Sub-navigation bar to switch between them
- Simple switcher, no complex logic

### 3. Wellness ❤️
- All health/fitness features
- No sub-navigation

### 4. Smart View Navigator 🔄 (Contextual)
- **On Daily View** → shows "Weekly" → goes to Weekly
- **On Weekly View** → shows "Monthly" → goes to Monthly
- **On Monthly View** → shows "Yearly" → goes to Yearly
- **On Yearly View** → shows "Life" → goes to Life View
- **On Life View** → shows "Daily" → goes back to Daily

Creates a **view hierarchy cycle**!

### 5. More (9-dot icon) 🔲
Opens popup menu showing:
- Clients
- Partners
- XP Dashboard
- XP Store

Note: Daily/Weekly/Monthly/etc are NOT in More menu since they're accessible via Smart View Navigator

---

## Technical Approach

### Using Existing Components
✅ `DailyBottomNav` - Keep as base (reusable)
✅ `Sheet` component - Use for More menu (bottom sheet on mobile)
✅ `Button` component - For menu items
✅ All section components - Keep as-is

### Only 2 New Components Needed
1. **`ConsolidatedBottomNav.tsx`** - Wrapper that:
   - Builds 4-button layout using existing `DailyBottomNav`
   - Handles Smart View Navigator logic
   - Manages More menu Sheet

2. **`SectionSubNav.tsx`** - Simple sub-navigation:
   - Horizontal pill buttons
   - Used by Timebox and Tasks sections
   - Scrollable if needed

### Configuration File
**`navigation-config.ts`** contains:
- Section definitions
- Smart View Navigator mapping
- More menu items
- Legacy tab mapping (backward compatibility)

---

## Key Technical Decisions

### URL Structure
**Old:** `/admin/lifelock/daily?tab=morning`
**New:** `/admin/lifelock/daily?section=timebox&subtab=morning`

### State Management
- `activeSection`: Which of the 3 main sections (timebox/tasks/wellness)
- `activeSubTab`: Which sub-tab within the section

### Backward Compatibility
- Legacy `?tab=` URLs automatically redirect to new structure
- All existing components work as-is
- No breaking changes to existing code

---

## Files to Change

### New Files (3)
1. `src/services/shared/navigation-config.ts` - Config definitions
2. `src/domains/lifelock/1-daily/_shared/components/navigation/ConsolidatedBottomNav.tsx` - New wrapper
3. `src/components/navigation/SectionSubNav.tsx` - Sub-navigation component

### Modified Files (2)
1. `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx` - Use consolidated nav
2. Update view switch statements to use `activeSubTab || activeSection`

### Reused Components
- `DailyBottomNav` (keep as-is)
- `Sheet` from `@/components/ui/sheet`
- All section components (MorningRoutineSection, TasksSection, etc.)

---

## Implementation Estimate

**Total: 13-19 hours**

- Phase 1: Config structure (1-2 hours)
- Phase 2: ConsolidatedBottomNav + SectionSubNav (4-6 hours)
- Phase 3: TabLayoutWrapper updates (3-4 hours)
- Phase 4: View rendering updates (2-3 hours)
- Phase 5: Testing & fixes (3-4 hours)

---

## What Makes This Better

1. **Cleaner UI** - 4 buttons vs 7 tabs
2. **Logical Grouping** - Related features grouped together
3. **Smart Navigation** - View Navigator provides quick access to all time horizons
4. **Accessible Menu** - More menu for pages not in daily flow
5. **No Time Restrictions** - Morning/Checkout always available
6. **Easy Switching** - Sub-navigation makes switching between Light Work/Deep Work trivial

---

## Questions Answered

✅ **4th button:** Smart View Navigator (contextual based on current view)
✅ **More menu style:** Bottom sheet using existing `Sheet` component
✅ **Morning/Checkout:** Always available, no time restrictions
✅ **Tasks sub-nav:** Simple segmented control, no complex default logic
✅ **Components:** Reuse existing, only create 2 new components

---

## Ready to Implement?

All planning is complete. The implementation plan (`implementation-plan.md`) contains:
- Complete code examples
- Exact file changes needed
- Testing checklist
- Migration strategy

**Waiting for your approval to proceed!**
