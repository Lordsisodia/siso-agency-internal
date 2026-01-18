# XP Store Domain

Gamification system for tracking and displaying user XP, levels, and achievements.

## Structure

```
xp-store/
├── components/      # XP display components
├── hooks/          # XP calculation hooks
├── services/       # XP business logic
└── types/          # TypeScript definitions
```

## Key Features

- **XP Tracking**: Track XP across different activities
- **Level System**: Calculate and display user levels
- **Achievements**: Badge and achievement system
- **Leaderboards**: Compare XP with other users

## Usage

```tsx
import { XPPill, XPProgress } from '@/domains/xp-store';
```
