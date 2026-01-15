# Bottom Navigation Redesign - Implementation Plan (Revised)

## Overview
Redesign Daily View bottom navigation from 7 tabs to 4 buttons + "More" popup menu using **existing components**.

---

## Phase 1: Configuration Structure

### 1.1 Create Navigation Config
**New File:** `src/services/shared/navigation-config.ts`

```typescript
import { LucideIcon } from 'lucide-react';

export interface NavSection {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  hasSubNav?: boolean;
  subSections?: NavSubSection[];
}

export interface NavSubSection {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface MoreMenuItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}
```

### 1.2 Define Navigation Sections
**File:** `src/services/shared/navigation-config.ts` (continued)

```typescript
import {
  Calendar,
  ListChecks,
  Heart,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Sparkles,
  Grid2x2,
  Users,
  Handshake,
  Trophy,
  ShoppingBag,
  Sunrise,
  Moon,
  Coffee,
  Zap
} from 'lucide-react';

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'timebox',
    name: 'Timebox',
    icon: Calendar,
    color: 'text-purple-400',
    bgActive: 'bg-purple-400/20',
    hasSubNav: true,
    subSections: [
      { id: 'timebox', name: 'Timebox', icon: Calendar },
      { id: 'morning', name: 'Morning', icon: Sunrise },
      { id: 'checkout', name: 'Checkout', icon: Moon }
    ]
  },
  {
    id: 'tasks',
    name: 'Tasks',
    icon: ListChecks,
    color: 'text-amber-400',
    bgActive: 'bg-amber-400/20',
    hasSubNav: true,
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
    color: 'text-red-400',
    bgActive: 'bg-red-400/20'
  }
];

// Smart View Navigator - Contextual based on current view
export const VIEW_NAVIGATOR_MAP: Record<string, { label: string; path: string; icon: LucideIcon }> = {
  'daily': { label: 'Weekly', path: '/admin/lifelock/weekly', icon: CalendarDays },
  'weekly': { label: 'Monthly', path: '/admin/lifelock/monthly', icon: CalendarRange },
  'monthly': { label: 'Yearly', path: '/admin/lifelock/yearly', icon: CalendarClock },
  'yearly': { label: 'Life', path: '/admin/lifelock', icon: Sparkles },
  'life': { label: 'Daily', path: '/admin/lifelock/daily', icon: Calendar }
};

// More Menu Items (pages NOT in bottom nav)
export const MORE_MENU_ITEMS: MoreMenuItem[] = [
  { id: 'clients', label: 'Clients', path: '/admin/clients', icon: Users },
  { id: 'partners', label: 'Partners', path: '/admin/partners', icon: Handshake },
  { id: 'xp-dashboard', label: 'XP Dashboard', path: '/xp-dashboard', icon: Trophy },
  { id: 'xp-store', label: 'XP Store', path: '/xp-store', icon: ShoppingBag }
];
```

### 1.3 Legacy Tab Mapping
**File:** `src/services/shared/navigation-config.ts` (continued)

```typescript
// Map old tabs to new structure for backward compatibility
export const LEGACY_TAB_MAPPING: Record<string, { section: string; subtab?: string }> = {
  'morning': { section: 'timebox', subtab: 'morning' },
  'light-work': { section: 'tasks', subtab: 'light-work' },
  'work': { section: 'tasks', subtab: 'deep-work' },
  'wellness': { section: 'wellness' },
  'tasks': { section: 'tasks', subtab: 'tasks' },
  'timebox': { section: 'timebox', subtab: 'timebox' },
  'checkout': { section: 'timebox', subtab: 'checkout' }
};
```

---

## Phase 2: Component Integration (Using Existing Components)

### 2.1 Create Consolidated Bottom Nav Component
**New File:** `src/domains/lifelock/1-daily/_shared/components/navigation/ConsolidatedBottomNav.tsx`

```typescript
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Grid2x2 } from 'lucide-react';
import { NAV_SECTIONS, VIEW_NAVIGATOR_MAP, MORE_MENU_ITEMS } from '@/services/shared/navigation-config';
import { DailyBottomNav, DailyBottomNavTab } from './DailyBottomNav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConsolidatedBottomNavProps {
  activeSection: string;
  activeSubTab?: string;
  onSectionChange: (section: string, subtab?: string) => void;
}

export const ConsolidatedBottomNav: React.FC<ConsolidatedBottomNavProps> = ({
  activeSection,
  activeSubTab,
  onSectionChange
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current view type for smart navigator
  const getCurrentView = (): string => {
    const path = location.pathname;
    if (path.includes('/daily')) return 'daily';
    if (path.includes('/weekly')) return 'weekly';
    if (path.includes('/monthly')) return 'monthly';
    if (path.includes('/yearly')) return 'yearly';
    if (path.endsWith('/lifelock') || path.endsWith('/life-lock')) return 'life';
    return 'daily';
  };

  const currentView = getCurrentView();
  const viewNavigator = VIEW_NAVIGATOR_MAP[currentView];

  // Build 4-button tabs array
  const buildTabs = (): DailyBottomNavTab[] => {
    const baseTabs = NAV_SECTIONS.map(section => ({
      title: section.name,
      icon: section.icon
    }));

    // Add Smart View Navigator as 4th button
    baseTabs.push({
      title: viewNavigator.label,
      icon: viewNavigator.icon
    });

    // Add More button (always last)
    baseTabs.push({
      title: 'More',
      icon: Grid2x2
    });

    return baseTabs;
  };

  const tabs = buildTabs();
  const activeIndex = NAV_SECTIONS.findIndex(s => s.id === activeSection);

  const handleTabChange = (index: number | null) => {
    if (index === null) return;

    // Check if it's the More button (last index)
    if (index === tabs.length - 1) {
      // More menu is handled by Sheet component
      return;
    }

    // Check if it's the View Navigator (second to last)
    if (index === tabs.length - 2) {
      navigate(viewNavigator.path);
      return;
    }

    // Regular section navigation
    const section = NAV_SECTIONS[index];
    if (section?.hasSubNav && section.subSections) {
      onSectionChange(section.id, section.subSections[0].id);
    } else {
      onSectionChange(section.id);
    }
  };

  return (
    <>
      <DailyBottomNav
        tabs={tabs}
        activeIndex={activeIndex}
        onChange={handleTabChange}
      />

      {/* More Menu - Using existing Sheet component */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="hidden">
            More
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[60vh]">
          <div className="py-6">
            <h3 className="text-lg font-semibold mb-4">More</h3>
            <div className="grid grid-cols-2 gap-4">
              {MORE_MENU_ITEMS.map(item => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="h-24 flex flex-col gap-2"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
```

### 2.2 Create Sub-Navigation Component
**New File:** `src/components/navigation/SectionSubNav.tsx`

```typescript
import React from 'react';
import { NavSubSection } from '@/services/shared/navigation-config';
import { cn } from '@/lib/utils';

interface SectionSubNavProps {
  subSections: NavSubSection[];
  activeSubTab: string;
  onSubTabChange: (subTab: string) => void;
  activeColor?: string;
  activeBgColor?: string;
}

export const SectionSubNav: React.FC<SectionSubNavProps> = ({
  subSections,
  activeSubTab,
  onSubTabChange,
  activeColor = 'text-amber-400',
  activeBgColor = 'bg-amber-400/20'
}) => {
  if (!subSections || subSections.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
      {subSections.map(sub => (
        <button
          key={sub.id}
          onClick={() => onSubTabChange(sub.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
            activeSubTab === sub.id
              ? `${activeColor} ${activeBgColor} border border-current`
              : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
          )}
        >
          <sub.icon className="h-4 w-4" />
          <span>{sub.name}</span>
        </button>
      ))}
    </div>
  );
};
```

---

## Phase 3: Update Tab Layout Wrapper

### 3.1 Modify TabLayoutWrapper
**File:** `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx`

**Key Changes:**

1. **Import new components:**
```typescript
import { ConsolidatedBottomNav } from '@/domains/lifelock/1-daily/_shared/components/navigation/ConsolidatedBottomNav';
import { SectionSubNav } from '@/components/navigation/SectionSubNav';
import { NAV_SECTIONS, LEGACY_TAB_MAPPING } from '@/services/shared/navigation-config';
```

2. **Update state management:**
```typescript
// NEW: Section and subtab state
const [activeSection, setActiveSection] = useState<string>('timebox');
const [activeSubTab, setActiveSubTab] = useState<string>('timebox');

// Handle legacy tab URLs
useEffect(() => {
  const legacyTab = searchParams.get('tab');
  if (legacyTab && LEGACY_TAB_MAPPING[legacyTab]) {
    const { section, subtab } = LEGACY_TAB_MAPPING[legacyTab];
    setActiveSection(section);
    if (subtab) setActiveSubTab(subtab);
    searchParams.delete('tab');
    setSearchParams(searchParams);
  }
}, []);
```

3. **Update URL structure:**
```typescript
// Update URL when section/subtab changes
useEffect(() => {
  const params = new URLSearchParams();
  if (activeSection) params.set('section', activeSection);
  if (activeSubTab) params.set('subtab', activeSubTab);
  setSearchParams(params);
}, [activeSection, activeSubTab]);
```

4. **Get current section config:**
```typescript
const currentSection = NAV_SECTIONS.find(s => s.id === activeSection);
```

5. **Replace DailyBottomNav with ConsolidatedBottomNav:**
```typescript
{/* Bottom Tab Navigation - Hidden when AI chat is open */}
{!hideBottomNav && (
  <ConsolidatedBottomNav
    activeSection={activeSection}
    activeSubTab={activeSubTab}
    onSectionChange={(section, subtab) => {
      setActiveSection(section);
      if (subtab) setActiveSubTab(subtab);
    }}
  />
)}
```

6. **Add sub-navigation below header:**
```typescript
{/* Header with Back button - Scrollable */}
<div className="flex items-center justify-between px-4 py-2">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => navigate('/admin/lifelock/weekly')}
    className="text-siso-text-muted hover:text-siso-text hover:bg-transparent -ml-2"
  >
    <ArrowLeft className="h-4 w-4 mr-2" />
    Weekly View
  </Button>
</div>

{/* NEW: Sub-navigation for sections that have it */}
{currentSection?.hasSubNav && (
  <SectionSubNav
    subSections={currentSection.subSections || []}
    activeSubTab={activeSubTab}
    onSubTabChange={setActiveSubTab}
    activeColor={currentSection.color}
    activeBgColor={currentSection.bgActive}
  />
)}
```

7. **Update content rendering:**
```typescript
{/* Render tab content via children function */}
{children(activeSubTab || activeSection, navigateDay)}
```

---

## Phase 4: Update View Rendering

### 4.1 Update Section Switch Logic
**File:** All files that render based on `activeTabId`

**Current Pattern:**
```typescript
switch (activeTabId) {
  case 'morning': return <MorningRoutineSection />;
  case 'light-work': return <LightFocusWorkSection />;
  // ...
}
```

**New Pattern:**
```typescript
switch (activeTabId) {
  // Timebox section
  case 'timebox': return <TimeboxSection />;
  case 'morning': return <MorningRoutineSection />;
  case 'checkout': return <NightlyCheckoutSection />;

  // Tasks section
  case 'tasks': return <TasksSection />;
  case 'light-work': return <LightFocusWorkSection />;
  case 'deep-work': return <DeepFocusWorkSection />;

  // Wellness section
  case 'wellness': return <WellnessSection />;

  default: return <TimeboxSection />;
}
```

**Note:** The switch logic remains mostly the same since we're just mapping
`section + subtab` to the existing component IDs!

---

## Phase 5: Testing & Migration

### 5.1 Feature Flag (Optional)
```typescript
// In TabLayoutWrapper.tsx
const USE_CONSOLIDATED_NAV = true;

{USE_CONSOLIDATED_NAV ? (
  <ConsolidatedBottomNav {...props} />
) : (
  <DailyBottomNav {...oldProps} />
)}
```

### 5.2 Testing Checklist

**Navigation Flow:**
- [ ] Click all 4 main buttons
- [ ] Test sub-navigation in Timebox section (3 tabs)
- [ ] Test sub-navigation in Tasks section (3 tabs)
- [ ] Click Smart View Navigator button (shows correct next view)
- [ ] Navigate through all views (Daily → Weekly → Monthly → Yearly → Life → Daily)
- [ ] Open More menu (Sheet from bottom on mobile)
- [ ] Click all More menu items

**URL Persistence:**
- [ ] Refresh page maintains section/subtab
- [ ] Back/forward browser buttons work
- [ ] Legacy `?tab=` URLs redirect correctly

**Responsive:**
- [ ] Bottom nav looks good on mobile
- [ ] Sub-navigation is scrollable if needed
- [ ] More menu sheet works on mobile

**Edge Cases:**
- [ ] Swipe gestures still work
- [ ] Keyboard navigation works
- [ ] AI chat open hides bottom nav

---

## Summary of Changes

### New Files (2)
1. `src/services/shared/navigation-config.ts` - Configuration for sections/items
2. `src/components/navigation/SectionSubNav.tsx` - Sub-navigation component

### Modified Files (2)
1. `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx` - Use consolidated nav
2. `src/domains/lifelock/1-daily/_shared/components/navigation/ConsolidatedBottomNav.tsx` - New wrapper

### Reused Existing Components
- `DailyBottomNav` - Base bottom navigation (keep as-is)
- `Sheet` from `@/components/ui/sheet` - For More menu
- `Button` from `@/components/ui/button` - For menu items
- All section components (MorningRoutineSection, TasksSection, etc.)

---

## Questions Resolved

✅ **4th button:** Smart View Navigator (contextual)
✅ **More menu:** Bottom sheet using existing `Sheet` component
✅ **Morning/Checkout:** Always available (no time restrictions)
✅ **Tasks default:** Doesn't matter - easy to switch via sub-nav
✅ **Components:** All existing, no new component creation needed

---

## Timeline Estimate

- **Phase 1:** 1-2 hours (config structure)
- **Phase 2:** 4-6 hours (ConsolidatedBottomNav + SectionSubNav)
- **Phase 3:** 3-4 hours (TabLayoutWrapper updates)
- **Phase 4:** 2-3 hours (update view rendering)
- **Phase 5:** 3-4 hours (testing, fixes)

**Total:** 13-19 hours
