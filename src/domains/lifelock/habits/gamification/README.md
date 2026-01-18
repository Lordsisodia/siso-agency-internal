# XP Store Domain

Gamification system following the earn-spend-track flow for user XP, levels, and achievements.

## Structure

```
xp-store/
├── 1-earn/           # XP earning mechanics
│   ├── domain/       # XP calculation logic
│   ├── features/     # Earning features (daily bonus, streaks, achievements)
│   ├── hooks/        # useXPStore, usePoints
│   └── ui/           # Earning UI components
├── 2-spend/          # XP spending/storefront
│   ├── features/
│   │   ├── storefront/    # Reward catalog
│   │   └── rewards/       # Individual rewards
│   ├── hooks/
│   └── ui/
│       ├── components/   # PurchaseConfirmationModal
│       └── pages/        # StorefrontPage
├── 3-track/          # XP analytics and history
│   ├── domain/       # XP services and calculations
│   ├── features/
│   │   ├── analytics/    # XP analytics
│   │   └── history/      # Purchase history
│   ├── hooks/
│   └── ui/
│       ├── components/   # XPStoreBalance, charts
│       └── pages/        # AnalyticsDashboard
└── index.ts
```

## User Flow

1. **Earn** (1-earn): Users earn XP through activities, daily bonuses, streaks
2. **Spend** (2-spend): Users browse and purchase rewards with earned XP
3. **Track** (3-track): Users view XP history, analytics, and balance

## Key Features

- **XP Tracking**: Track XP across different activities
- **Storefront**: Browse and redeem rewards
- **Analytics**: View XP history and trends
- **Achievements**: Badge and achievement system
- **Balance Management**: Track current XP balance

## Usage

```tsx
import {
  useXPStore,
  usePoints,
  StorefrontPage,
  AnalyticsDashboard,
  XPStoreBalance
} from '@/domains/xp-store';

function MyComponent() {
  const { points, addPoints } = usePoints();
  const balance = <XPStoreBalance />;
  return <div>{/* ... */}</div>;
}
```
