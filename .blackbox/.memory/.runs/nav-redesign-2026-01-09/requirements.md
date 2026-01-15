# Bottom Navigation Redesign - Requirements

## User Requirements

### Primary Goals
1. **Reduce bottom navigation to 4 buttons** (currently 7 tabs)
2. **Add 5th "More" button** with 9-dot grid icon that opens a popup menu
3. **Consolidate pages** into logical groupings:
   - Timebox section
   - Tasks section
   - Wellness section

### Page Consolidations

#### Timebox Section (Button 1)
**Pages to include:**
- Timebox (main)
- Morning Routine (contextual - only shows in morning)
- Checkout (evening routine)

**Rationale:** Morning routine comes from timebox, checkout closes the day

#### Tasks Section (Button 2)
**Pages to include:**
- Light Work
- Deep Work
- Today's Tasks

**Rationale:** All task-related functionality should be grouped together
**UI Pattern:** Sub-navigation bar below top section to switch between these 3 views

#### Wellness Section (Button 3)
**Pages to include:**
- All wellness/health features

#### Remaining Button (Button 4)
**Purpose:** TBD - possibly "Stats" or "Life" view

### "More" Popup Menu
**Icon:** 9-dot grid icon (similar to app drawer patterns)
**Behavior:** Opens popup/menu showing:
- Clients
- Partners
- Daily View
- Weekly View
- Monthly View
- Yearly View
- Life View
- XP Dashboard
- XP Store
- Any other pages not in bottom nav

### Pages to Remove from Navigation
- Industries (from sidebar)
- Morning Routine (from bottom nav - move to Timebox)
- Light Work (from bottom nav - move to Tasks)
- Deep Work (from bottom nav - move to Tasks)
- Today's Tasks (from bottom nav - move to Tasks)

## Design Considerations

### Mobile UX
- Bottom nav should be easily thumb-reachable
- "More" popup should be dismissible with tap outside
- Sub-navigation in Tasks should be intuitive

### Visual Hierarchy
- 4 main buttons get prominent placement
- "More" button should be visually distinct
- Active states clearly indicated

### Navigation Flow
- Current URL routing must be preserved
- Tab state persistence still needed
- Swipe gestures should still work
