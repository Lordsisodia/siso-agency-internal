# Bottom Navigation Redesign - Implementation Plan

## Overview
Redesign the Daily View bottom navigation from 7 tabs to 4 buttons + "More" popup menu with page consolidations.

## Phase 1: Design & Architecture

### 1.1 Define New Navigation Structure
**File:** `src/services/shared/consolidated-nav-config.ts`

```typescript
export interface NavSection {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  subSections?: NavSubSection[];
}

export interface NavSubSection {
  id: string;
  name: string;
  icon: LucideIcon;
  timeRelevance?: number[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'timebox',
    name: 'Timebox',
    icon: Calendar,
    color: 'from-purple-500 to-pink-500',
    subSections: [
      { id: 'timebox', name: 'Timebox', icon: Calendar },
      { id: 'morning', name: 'Morning', icon: Sunrise, timeRelevance: [6,7,8,9] },
      { id: 'checkout', name: 'Checkout', icon: Moon, timeRelevance: [18,19,20,21] }
    ]
  },
  {
    id: 'tasks',
    name: 'Tasks',
    icon: ListChecks,
    color: 'from-amber-400 to-orange-500',
    subSections: [
      { id: 'tasks', name: 'Today', icon: ListChecks },
      { id: 'light-work', name: 'Light Work', icon: Coffee },
      { id: 'deep-work', name: 'Deep Work', icon: Zap }
    ]
  },
  {
    id: 'wellness',
    name: 'Wellness',
    icon: Heart,
    color: 'from-red-400 to-rose-500'
  },
  {
    id: 'xp',
    name: 'Stats',
    icon: Trophy,
    color: 'from-yellow-400 to-amber-500'
  }
];
```

### 1.2 Define More Menu Structure
**File:** `src/services/shared/more-menu-config.ts`

```typescript
export interface MoreMenuItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  category: 'views' | 'business' | 'xp';
}

export const MORE_MENU_ITEMS: MoreMenuItem[] = [
  // LifeLock Views
  { id: 'daily', label: 'Daily View', path: '/admin/lifelock/daily', icon: Calendar, category: 'views' },
  { id: 'weekly', label: 'Weekly View', path: '/admin/lifelock/weekly', icon: CalendarDays, category: 'views' },
  { id: 'monthly', label: 'Monthly View', path: '/admin/lifelock/monthly', icon: CalendarRange, category: 'views' },
  { id: 'yearly', label: 'Yearly View', path: '/admin/lifelock/yearly', icon: CalendarClock, category: 'views' },
  { id: 'life', label: 'Life View', path: '/admin/lifelock', icon: Sparkles, category: 'views' },

  // Business
  { id: 'clients', label: 'Clients', path: '/admin/clients', icon: Users, category: 'business' },
  { id: 'partners', label: 'Partners', path: '/admin/partners', icon: Handshake, category: 'business' },

  // XP & Gamification
  { id: 'xp-dashboard', label: 'XP Dashboard', path: '/xp-dashboard', icon: Trophy, category: 'xp' },
  { id: 'xp-store', label: 'XP Store', path: '/xp-store', icon: ShoppingBag, category: 'xp' }
];
```

## Phase 2: Component Development

### 2.1 Create Consolidated Bottom Nav
**File:** `src/domains/lifelock/1-daily/_shared/components/navigation/ConsolidatedBottomNav.tsx`

```typescript
interface ConsolidatedBottomNavProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  onMoreClick: () => void;
}

// Features:
// - 4 main buttons
// - 5th "More" button with grid2x2 or grid3x3 icon
// - Glassmorphism styling (consistent with current)
// - Active state indicators
```

### 2.2 Create More Menu Popup
**File:** `src/components/navigation/MoreMenuPopup.tsx`

```typescript
interface MoreMenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
  items: MoreMenuItem[];
}

// Features:
// - Modal/Bottom sheet (responsive)
// - Grid layout for desktop, list for mobile
// - Category sections (Views, Business, XP)
// - Search/filter (optional)
// - Navigate on click, close menu
```

### 2.3 Create Sub-Navigation Component
**File:** `src/components/navigation/SectionSubNav.tsx`

```typescript
interface SectionSubNavProps {
  subSections: NavSubSection[];
  activeSubSection: string;
  onSubSectionChange: (subSectionId: string) => void;
}

// Features:
// - Segmented control (horizontal pill buttons)
// - Scrollable if many items
// - Active state styling
// - Consistent with section colors
```

### 2.4 Update Tab Layout Wrapper
**File:** `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx` (modified)

**Changes:**
```typescript
// Add state:
const [activeSection, setActiveSection] = useState<string>('timebox');
const [activeSubSection, setActiveSubSection] = useState<string>('timebox');
const [showMoreMenu, setShowMoreMenu] = useState(false);

// Update URL structure:
// /admin/lifelock/daily?section=timebox&subtab=morning

// Replace DailyBottomNav with ConsolidatedBottomNav
// Add SectionSubNav below header when section has subSections
// Add MoreMenuPopup modal
```

## Phase 3: Routing & State Management

### 3.1 Update URL Structure
**Current:** `/admin/lifelock/daily?tab=morning`
**New:** `/admin/lifelock/daily?section=timebox&subtab=morning`

### 3.2 Backward Compatibility
- Support legacy `?tab=` URLs by mapping to new structure
- Redirect old URLs to new consolidated structure
- Maintain bookmarkability

### 3.3 Smart Defaults
```typescript
const getSmartDefaults = (): { section: string, subtab: string } => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) return { section: 'timebox', subtab: 'morning' };
  if (hour >= 10 && hour < 14) return { section: 'tasks', subtab: 'light-work' };
  if (hour >= 14 && hour < 17) return { section: 'tasks', subtab: 'deep-work' };
  if (hour >= 17 && hour < 19) return { section: 'wellness', subtab: 'wellness' };
  if (hour >= 19 && hour < 22) return { section: 'timebox', subtab: 'checkout' };

  return { section: 'timebox', subtab: 'timebox' };
};
```

## Phase 4: Content Mapping

### 4.1 Map Existing Tabs to New Structure
```typescript
const LEGACY_TAB_MAPPING: Record<string, { section: string, subtab: string }> = {
  'morning': { section: 'timebox', subtab: 'morning' },
  'light-work': { section: 'tasks', subtab: 'light-work' },
  'work': { section: 'tasks', subtab: 'deep-work' },
  'wellness': { section: 'wellness', subtab: 'wellness' },
  'tasks': { section: 'tasks', subtab: 'tasks' },
  'timebox': { section: 'timebox', subtab: 'timebox' },
  'checkout': { section: 'timebox', subtab: 'checkout' }
};
```

### 4.2 Update Component Rendering
- Modify switch statements to use `section` + `subtab`
- Ensure all existing sections render correctly
- Add sub-navigation UI where needed

## Phase 5: Testing & Refinement

### 5.1 Test Cases
1. **Navigation Flow**
   - Click through all 4 main buttons
   - Test sub-section navigation
   - Verify "More" menu opens/closes
   - Test all menu items navigate correctly

2. **URL Persistence**
   - Refresh page maintains section/subtab
   - Back/forward browser buttons work
   - Direct links to sections work

3. **Responsive Design**
   - Bottom nav looks good on mobile
   - "More" menu adapts to screen size
   - Sub-navigation is scrollable if needed

4. **Time-Based Context**
   - Morning routine shows in morning
   - Checkout available in evening
   - All sub-tabs accessible regardless of time

### 5.2 Edge Cases
- What happens when user bookmarks old `?tab=` URL?
- What if user has custom default tab set?
- Swipe gestures with new structure?
- Keyboard navigation?

## Phase 6: Migration Strategy

### 6.1 Feature Flag Approach
```typescript
const USE_CONSOLIDATED_NAV = true; // Feature flag

// In TabLayoutWrapper:
{USE_CONSOLIDATED_NAV ? (
  <ConsolidatedBottomNav {...props} />
) : (
  <DailyBottomNav {...props} />
)}
```

### 6.2 Gradual Rollout
1. Deploy new config system alongside old
2. Test internally with feature flag
3. Enable for small user segment
4. Monitor for issues
5. Full rollout
6. Remove old code after 1-2 weeks

### 6.3 Cleanup
- Remove old `DailyBottomNav` component
- Remove old `TAB_CONFIG` (or keep for reference)
- Update any hardcoded tab references
- Update documentation

## File Changes Summary

### New Files
1. `src/services/shared/consolidated-nav-config.ts`
2. `src/services/shared/more-menu-config.ts`
3. `src/domains/lifelock/1-daily/_shared/components/navigation/ConsolidatedBottomNav.tsx`
4. `src/components/navigation/MoreMenuPopup.tsx`
5. `src/components/navigation/SectionSubNav.tsx`

### Modified Files
1. `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx`
2. `src/services/shared/tab-config.ts` (add mapping, deprecate old)
3. All section components that read from `TAB_CONFIG`

### Deleted Files (Phase 6)
1. `src/domains/lifelock/1-daily/_shared/components/navigation/DailyBottomNav.tsx` (optional)

## Timeline Estimate

- **Phase 1:** 2-3 hours (design, config)
- **Phase 2:** 6-8 hours (components)
- **Phase 3:** 3-4 hours (routing, state)
- **Phase 4:** 2-3 hours (content mapping)
- **Phase 5:** 4-6 hours (testing)
- **Phase 6:** 2-3 hours (migration, cleanup)

**Total:** 19-27 hours

## Open Questions for User

1. **What should the 4th main button be?**
   - [ ] Stats/XP Dashboard
   - [ ] Life View
   - [ ] Weekly View
   - [ ] Other: _______

2. **"More" menu behavior:**
   - [ ] Full-screen modal
   - [ ] Bottom sheet (mobile) / Modal (desktop)
   - [ ] Dropdown/popover

3. **Should Morning/Checkout be time-restricted?**
   - [ ] Yes, only show during relevant hours
   - [ ] No, always available but highlighted when relevant

4. **Tasks sub-navigation default:**
   - [ ] Always show "Today's Tasks" first
   - [ ] Remember last selected
   - [ ] Time-based (Light Work in morning, Deep Work afternoon)
