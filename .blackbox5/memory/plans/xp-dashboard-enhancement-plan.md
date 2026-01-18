# XP Dashboard Enhancement Plan
**Created:** 2025-01-17
**Status:** Ready for Implementation

## Overview
Rebuild and enhance the XP Dashboard with 4 main tabs: Dashboard, Store, History, Achievements. This plan outlines all requirements for rebuilding the XP Store functionality and creating a comprehensive History timeline.

---

## TAB 1: DASHBOARD (Today-Focused)

### Current State
- ✅ Today's Progress Card (hero)
- ✅ Quick Stats Row (4 tiles)
- ✅ Category Breakdown
- ✅ Recent Achievements (limited to 3)

### Required Changes
1. **Move "This Week" content from History to Dashboard**
   - Add `WeeklySummaryCard` to Dashboard tab
   - Display current week's XP total and progress
   - Show daily breakdown with completion status
   - Keep the visual weekly chart/graph

2. **Move Streaks from History to Dashboard**
   - Add `StreakCard` to Dashboard tab
   - Display current streak with calendar heatmap
   - Show best streak period
   - Include streak milestone indicators

3. **Dashboard Content After Changes:**
   - Today's Progress Card (hero)
   - Quick Stats Row (4 tiles)
   - **Weekly Summary Card** (moved from History)
   - Category Breakdown
   - **Streak Card** (moved from History)
   - Recent Achievements (limited to 3)

---

## TAB 2: XP STORE (Complete Rebuild)

### Existing Features to Preserve
From `src/domains/xp-store/` and `src/services/xpStoreService.ts`:

#### Core Functionality
1. **Reward Catalog System**
   - Search and filter by category
   - Sort by price, popularity, satisfaction
   - Affordability indicators (Available, Almost, Saving, Locked)
   - Dynamic pricing with trend indicators
   - Milestone unlock progress bars
   - Purchase statistics

2. **XP Balance Management**
   - Total XP earned
   - XP available to spend
   - Reserve XP (10% held back)
   - Debt tracking with interest

3. **Psychology Features**
   - Near-miss notifications (within 200 XP)
   - Variable ratio bonuses (1.5x to 6x multipliers)
   - Spending power calculations
   - Earned indulgence messaging

4. **Purchase Flow**
   - Multi-step confirmation dialog
   - XP loan system (20% interest)
   - Satisfaction prediction
   - Justification notes

#### Pre-Defined Rewards (8 existing)
```typescript
SOCIAL: 
  - 🎲 Risk Night with the Crew (1000 XP)
  - 🍣 Chef-Level Dinner Out (1500 XP)

FOOD:
  - ☕️ Premium Coffee Ritual (750 XP)

ENTERTAINMENT:
  - 🎬 Movie Night Upgrade (2000 XP)

WELLNESS:
  - 🚶‍♂️ Focus Break Walk (600 XP)

RECOVERY:
  - 💆‍♂️ Massage or Spa Reset (10000 XP)

REST:
  - 🌤️ Quarter Day Off (3200 XP)

GROWTH:
  - 🧠 Coaching Session Upgrade (4500 XP)
```

### New Features to Build

#### 1. Store Management (Admin Only)
**Component:** `StoreManagementPanel.tsx`

Features:
- Add new rewards to the catalog
- Edit existing rewards (name, description, price, category)
- Remove rewards from catalog
- Adjust dynamic pricing parameters
- Set milestone unlock thresholds
- Configure availability windows

**Data Structure:**
```typescript
interface StoreReward {
  id: string;
  category: 'SOCIAL' | 'FOOD' | 'ENTERTAINMENT' | 'WELLNESS' | 'RECOVERY' | 'REST' | 'GROWTH' | 'CUSTOM';
  name: string;
  description: string;
  iconEmoji: string;
  basePrice: number;
  currentPrice: number;
  unlockAt?: number;
  maxDailyUse?: number;
  availabilityWindow?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**UI Requirements:**
- Card-based reward editor
- Price adjustment sliders
- Category selector with custom option
- Icon picker (emoji selector)
- Active/inactive toggle
- Bulk edit capabilities

#### 2. Store Tab Layout
```
┌─────────────────────────────────────┐
│  XP BALANCE HEADER                  │
│  45,000 XP Available to Spend      │
│  ↑ This week: +350 XP              │
├─────────────────────────────────────┤
│  REWARD CATALOG                     │
│  [Search] [Filter▼] [Sort▼]        │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ 🎲  │ │ 🍣  │ │ 🎬  │       │
│  │Reward│ │Dinner│ │Movie │       │
│  │1000  │ │1500  │ │2000  │       │
│  └──────┘ └──────┘ └──────┘       │
│  [Load More...]                   │
└─────────────────────────────────────┘
```

#### 3. Integration Points
- Fetch balance from `user_gamification_progress.total_xp`
- Fetch rewards from new `xp_store_rewards` table
- Track purchases in `xp_purchases` table (already exists)
- Update balance on successful purchase

---

## TAB 3: HISTORY (Timeline-Based)

### Current State
- ✅ Trend Chart (30-day graph)
- ✅ Peak Productivity (best hours)
- ✅ Monthly Summary Card
- ✅ Streak Card (moving to Dashboard)

### Required Changes

#### 1. Remove "January 2026" Labels
- Remove month/year headers from all history cards
- Use date ranges instead (e.g., "Jan 1 - Jan 31")
- Keep dates subtle and minimal

#### 2. Add "This Week" Summary to Top
**Component:** `HistoryWeeklySummary.tsx`

Features:
- Current week's total XP
- Week-over-week comparison
- Progress toward weekly goal
- Quick stats: activities completed, best day
- Mini trend indicator (up/down/stable)

#### 3. XP Earning Timeline
**Component:** `XPTimeline.tsx`

**Data Source:** `daily_xp_stats` table
```sql
SELECT 
  date,
  total_xp,
  activities_completed,
  category_breakdown,
  achievements_unlocked
FROM daily_xp_stats
WHERE user_id = $1
ORDER BY date DESC
```

**Timeline Entry Structure:**
```typescript
interface TimelineEntry {
  date: string;
  totalXP: number;
  activities: number;
  categories: {
    task: number;
    focus: number;
    habit: number;
    health: number;
    routine: number;
  };
  achievements: string[];
  trend: 'up' | 'down' | 'same';
}
```

**Timeline Visual Design:**
```
┌─────────────────────────────────────┐
│  TODAY                              │
│  ┌─────────────────────────────┐   │
│  │ Jan 17, 2025               │   │
│  │ 📊 15 XP from 2 activities  │   │
│  │                             │   │
│  │ ✅ Routine Task: +15 XP    │   │
│  │                             │   │
│  │ Streak: 0 days              │   │
│  └─────────────────────────────┘   │
│         │                           │
│         ▼                           │
│  ┌─────────────────────────────┐   │
│  │ Jan 16, 2025               │   │
│  │ 📊 30 XP from 1 activity   │   │
│  │                             │   │
│  │ ✅ Task: +30 XP            │   │
│  │                             │   │
│  │ Streak: 0 days              │   │
│  └─────────────────────────────┘   │
│         │                           │
│         ▼                           │
│  ┌─────────────────────────────┐   │
│  │ Dec 7, 2025                │   │
│  │ 📊 115 XP from 2 activities│   │
│  │                             │   │
│  │ ✅ Task: +115 XP           │   │
│  │                             │   │
│  │ Streak: 0 days              │   │
│  └─────────────────────────────┘   │
│         │                           │
│         ▼                           │
│      [Load More...]                │
└─────────────────────────────────────┘
```

**Features:**
- Expandable/collapsible entries
- Category color coding
- Achievement badges
- XP breakdown by activity type
- Streak indicators
- Date grouping (Today, Yesterday, This Week, etc.)
- Infinite scroll or pagination

#### 4. History Tab Layout After Changes
```
┌─────────────────────────────────────┐
│  THIS WEEK SUMMARY                  │
│  Week of Jan 13-17                  │
│  Total: 45 XP | Best: Wed (30 XP)  │
│  [Mini trend chart]                 │
├─────────────────────────────────────┤
│  TIMELINE                           │
│  [Filter by category ▼]            │
│  [Show all time ▼]                 │
│                                     │
│  Timeline entries...               │
│  (as shown above)                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  MONTHLY SUMMARY (simplified)       │
│  [No month/year header]             │
│  Jan 1-31: 160 XP total           │
│  [Mini chart]                       │
├─────────────────────────────────────┤
│  TREND CHART (30-day)              │
│  [Full width graph]                 │
├─────────────────────────────────────┤
│  PEAK PRODUCTIVITY                  │
│  [Best hours analysis]               │
└─────────────────────────────────────┘
```

---

## TAB 4: ACHIEVEMENTS

### Current State
- ✅ LevelProgressCard (NEW - to be created)
- ✅ PersonalBestsCard
- ✅ AllAchievementsGrid (NEW - to be created)

### No Changes Required
- This tab is already planned correctly
- Components already created

---

## DATABASE SCHEMA CHANGES

### New Table: `xp_store_rewards`
```sql
CREATE TABLE xp_store_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('SOCIAL', 'FOOD', 'ENTERTAINMENT', 'WELLNESS', 'RECOVERY', 'REST', 'GROWTH', 'CUSTOM')),
  name TEXT NOT NULL,
  description TEXT,
  icon_emoji TEXT NOT NULL DEFAULT '🎁',
  base_price INTEGER NOT NULL DEFAULT 100,
  current_price INTEGER NOT NULL DEFAULT 100,
  unlock_at INTEGER,
  max_daily_use INTEGER DEFAULT 1,
  availability_window TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_xp_store_rewards_category ON xp_store_rewards(category);
CREATE INDEX idx_xp_store_rewards_active ON xp_store_rewards(is_active, sort_order);
```

### Update Existing: `xp_purchases`
```sql
-- Ensure purchase tracking exists
ALTER TABLE xp_purchases 
  ADD COLUMN IF NOT EXISTS reward_id UUID REFERENCES xp_store_rewards(id),
  ADD COLUMN IF NOT EXISTS satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS notes TEXT;
```

---

## IMPLEMENTATION PRIORITY

### Phase 1: Dashboard Reorganization (1-2 hours)
1. Move WeeklySummaryCard to Dashboard tab
2. Move StreakCard to Dashboard tab
3. Adjust layout and spacing
4. Remove duplicate components from History tab

### Phase 2: History Timeline (2-3 hours)
1. Remove month/year labels
2. Create HistoryWeeklySummary component
3. Create XPTimeline component
4. Fetch timeline data from daily_xp_stats
5. Implement timeline UI with expandable entries
6. Add category filtering
7. Add date grouping

### Phase 3: XP Store Rebuild (3-4 hours)
1. Create xp_store_rewards table
2. Seed table with existing 8 rewards
3. Create StoreManagementPanel component
4. Implement add/edit/delete functionality
5. Update RewardCatalog to use new table
6. Integrate balance display
7. Test purchase flow

### Phase 4: Polish & Testing (1-2 hours)
1. Consistent styling across all tabs
2. Animations and transitions
3. Error handling
4. Loading states
5. Responsive design
6. Cross-browser testing

---

## SUCCESS CRITERIA

### Dashboard
- ✅ Today's progress visible at a glance
- ✅ Weekly summary prominently displayed
- ✅ Streak information easily accessible
- ✅ Quick stats remain scannable
- ✅ No duplicate information

### Store
- ✅ All 8 existing rewards displayed
- ✅ Admin can add/edit/remove rewards
- ✅ Balance updates correctly
- ✅ Purchase flow works end-to-end
- ✅ Psychology features preserved

### History
- ✅ Timeline shows daily XP breakdown
- ✅ Category breakdown visible per day
- ✅ Achievements highlighted
- ✅ No month/year clutter
- ✅ Week summary at top
- ✅ Infinite scroll/pagination works

### Achievements
- ✅ All achievements visible
- ✅ Level progress clear
- ✅ Personal bests highlighted
- ✅ Filtering works
- ✅ Progress bars accurate

---

## TECHNICAL NOTES

### Data Sources
- **XP Data:** `daily_xp_stats` table
- **Tasks:** `tasks` table (joined with XP data)
- **Achievements:** `user_achievements` table
- **Store:** `xp_store_rewards` table (new)
- **Purchases:** `xp_purchases` table

### API Endpoints Needed
- `GET /api/xp/timeline` - Fetch timeline data
- `GET /api/xp/store/rewards` - Fetch store rewards
- `POST /api/xp/store/rewards` - Add reward (admin)
- `PUT /api/xp/store/rewards/:id` - Update reward (admin)
- `DELETE /api/xp/store/rewards/:id` - Delete reward (admin)
- `POST /api/xp/store/purchase` - Purchase reward

### Component Files to Create
1. `src/domains/admin/dashboard/components/HistoryWeeklySummary.tsx`
2. `src/domains/admin/dashboard/components/XPTimeline.tsx`
3. `src/domains/admin/dashboard/components/StoreManagementPanel.tsx`
4. `src/domains/admin/dashboard/components/TimelineEntry.tsx`

### Component Files to Modify
1. `src/domains/admin/dashboard/components/GamificationDashboard.tsx`
2. `src/domains/lifelock/analytics/ui/components/weekly/WeeklySummaryCard.tsx`
3. `src/domains/lifelock/analytics/ui/components/records/StreakCard.tsx`
4. `src/domains/xp-store/1-storefront/ui/components/RewardCatalog.tsx`

---

## ESTIMATED TIMELINE
- **Total:** 7-11 hours of development
- **Phase 1 (Dashboard):** 1-2 hours
- **Phase 2 (History):** 2-3 hours  
- **Phase 3 (Store):** 3-4 hours
- **Phase 4 (Polish):** 1-2 hours

