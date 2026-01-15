# Bottom Navigation Redesign - Analysis

## Current Navigation Structure

### Bottom Navigation Tabs (Daily View)
```
1. Morning Routine     → /admin/lifelock/daily?tab=morning
2. Light Work          → /admin/lifelock/daily?tab=light-work
3. Deep Work           → /admin/lifelock/daily?tab=work
4. Wellness            → /admin/lifelock/daily?tab=wellness
5. Tasks               → /admin/lifelock/daily?tab=tasks
6. Timebox             → /admin/lifelock/daily?tab=timebox
7. Checkout            → /admin/lifelock/daily?tab=checkout
```

### Sidebar Pages
```
/admin/clients
/admin/partners
/admin/industries           ← TO BE REMOVED
/admin/lifelock            → Life View
/admin/lifelock/daily      → Daily View
/admin/lifelock/weekly     → Weekly View
/admin/lifelock/monthly    → Monthly View
/admin/lifelock/yearly     → Yearly View
/xp-dashboard
/xp-store
```

## Proposed New Structure

### Bottom Navigation (4 buttons + More)

**Button 1: Timebox**
```
Primary: Timebox tab
Sub-tabs (always available):
  - Timebox
  - Morning Routine (no time restrictions)
  - Checkout (no time restrictions)
Navigation: Sub-navigation bar within Timebox section
```

**Button 2: Tasks**
```
Primary: Tasks overview
Sub-tabs (persistent sub-navigation):
  - Today's Tasks
  - Light Work
  - Deep Work
Navigation: Segmented control below header
```

**Button 3: Wellness**
```
Primary: Wellness tab
All health/fitness features
```

**Button 4: Smart View Navigator (Contextual)**
```
Shows NEXT view in hierarchy:
- On Daily View → "Weekly" → navigates to /admin/lifelock/weekly
- On Weekly View → "Monthly" → navigates to /admin/lifelock/monthly
- On Monthly View → "Yearly" → navigates to /admin/lifelock/yearly
- On Yearly View → "Life" → navigates to /admin/lifelock
- On Life View → "Daily" → navigates to /admin/lifelock/daily

Creates a view hierarchy cycle!
```

**Button 5: More (9-dot grid2x2 or grid3x3 icon)**
```
Opens popup menu (bottom sheet on mobile, popover on desktop):
┌─────────────────────────┐
│  Clients               │
│  Partners              │
│  XP Dashboard          │
│  XP Store              │
└─────────────────────────┘

Note: Does NOT include Daily/Weekly/Monthly/etc since those are
      accessible via the Smart View Navigator button
```

## Technical Implications

### URL Routing
- Must maintain backward compatibility with existing URLs
- Need to support both old tab system and new consolidated structure
- Consider: `/admin/lifelock/daily?section=timebox&subtab=morning`

### State Management
- Current: `activeTabId` in `TabLayoutWrapper`
- New: `activeSection` + `activeSubTab` (if applicable)
- URL persistence still required

### Component Changes
**New Components Needed:**
1. `ConsolidatedBottomNav` - 4-button layout + More button
2. `MoreMenuPopup` - Grid-based menu for additional pages
3. `TasksSubNavigation` - Segmented control for Tasks section
4. `TimeboxSubNavigation` - Similar control for Timebox

**Modified Components:**
1. `TabLayoutWrapper` - Update to handle consolidated navigation
2. `tab-config.ts` - New structure for sections/sub-tabs

### Migration Strategy
1. Create new navigation system alongside existing
2. Test new 4-button + More layout
3. Implement sub-navigation for Tasks and Timebox
4. Gradually deprecate old 7-tab system
5. Clean up unused tab configurations

## Open Questions

1. **What should the 4th main button be?**
   - XP Dashboard (stats focused)
   - Life View (holistic)
   - Weekly View (planning focused)

2. **How should sub-navigation persist?**
   - URL params: `?section=tasks&subtab=deep-work`
   - Local state only
   - Hybrid approach

3. **More menu behavior:**
   - Full-screen modal or bottom sheet?
   - Grid layout or list layout?
   - Search/filter functionality?

4. **Time-of-day contextual tabs:**
   - Should Morning/Checkout only appear during certain hours?
   - Or always available but highlighted when relevant?
