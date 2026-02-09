# Bottom Navigation Redesign - Context

## Current State

### Bottom Navigation (Daily View)
The current implementation uses `DailyBottomNav` component with expandable tabs:
- Location: `src/domains/lifelock/1-daily/_shared/components/navigation/DailyBottomNav.tsx`
- Used by: `TabLayoutWrapper` (`src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx`)
- Current tabs (7 total):
  1. Morning (Sunrise icon)
  2. Light Work (Coffee icon)
  3. Deep Work (Zap icon)
  4. Wellness (Heart icon)
  5. Tasks (ListChecks icon)
  6. Timebox (Calendar icon)
  7. Checkout (Moon icon)

### Sidebar Navigation
The sidebar contains these main pages:
1. Clients (`/admin/clients`)
2. Partners (`/admin/partners`)
3. Industries (`/admin/industries`) - *User wants to remove*
4. Daily View (`/admin/lifelock/daily`)
5. Weekly View (`/admin/lifelock/weekly`)
6. Monthly View (`/admin/lifelock/monthly`)
7. Yearly View (`/admin/lifelock/yearly`)
8. Life View (`/admin/lifelock`)
9. XP Dashboard (`/xp-dashboard`)
10. XP Store (`/xp-store`)

## Technical Architecture

### Tab Configuration System
- Centralized in: `src/services/shared/tab-config.ts`
- Type: `TAB_CONFIG: Record<TabId, TabConfig>`
- Used by: `TabLayoutWrapper` for routing and rendering
- Color system: Each tab has unique colors (active, background)

### Routing System
- React Router v6 with search params for tab persistence
- Tab state stored in URL: `?tab=morning`
- Swipe gestures enabled for tab navigation
- Date navigation integrated with tab navigation

### UI Components
- `ExpandableTabs` - Base component
- `DailyBottomNav` - Wrapper with glassmorphism effect
- `TabLayoutWrapper` - Layout manager with animations
