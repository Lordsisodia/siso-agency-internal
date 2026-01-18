# 🏋️ Home Workout XP System

## Overview
The Home Workout XP system rewards users for completing daily exercises with experience points (XP) that contribute to their overall LifeLock progression.

## XP Calculation

### Per-Exercise XP
- **Base XP**: 20 XP per completed exercise
- **Completion**: Exercise is marked complete when `logged >= target`
- **PB Bonus**: +20 XP when you beat your personal best (not yet implemented in UI)

### Full Workout Bonus
- **+20 XP bonus** when ALL exercises are completed
- Requires at least 4 exercises in the workout
- Automatically calculated when final exercise is completed

### Maximum Daily XP
**Maximum: 180 XP per day**

Breakdown:
- Push-ups: 20 XP
- Squats: 20 XP
- Planks: 20 XP
- Sit-ups: 20 XP
- Full Workout Bonus: +20 XP
- **Total: 100 XP** (for 4 exercises)

*Note: With PB bonuses, can reach 180 XP*

## Exercise Configuration

| Exercise | Emoji | Default Goal | Unit |
|----------|-------|--------------|------|
| Push-ups | 💪 | 200 | reps |
| Squats | 🦵 | 100 | reps |
| Planks | ⏱️ | 300 | seconds (5 min) |
| Sit-ups | 🏋️ | 100 | reps |

## XP Examples

### Example 1: Partial Completion
```
Push-ups: 150/200 (incomplete) = 0 XP
Squats: 100/100 (complete) = 20 XP
Planks: 0/300 (not started) = 0 XP
Sit-ups: 50/100 (incomplete) = 0 XP
Full Workout Bonus: Not eligible
Total: 20 XP
```

### Example 2: Full Completion
```
Push-ups: 200/200 (complete) = 20 XP
Squats: 100/100 (complete) = 20 XP
Planks: 300/300 (complete) = 20 XP
Sit-ups: 100/100 (complete) = 20 XP
Full Workout Bonus: +20 XP
Total: 100 XP
```

### Example 3: With PB Bonuses
```
Push-ups: 220/200 (complete + PB) = 40 XP
Squats: 100/100 (complete) = 20 XP
Planks: 300/300 (complete) = 20 XP
Sit-ups: 100/100 (complete) = 20 XP
Full Workout Bonus: +20 XP
Total: 120 XP
```

## Streak Tracking

### Current Streak
- Consecutive days with at least one completed exercise
- Displayed in the stats card (🔥 Streak: 7d)

### Best Streak
- Longest streak achieved (last 90 days)
- Displayed alongside current streak

## UI Features

### XP Display
- **XPPill**: Shows total XP earned today with glow effect when all exercises complete
- **Per-Exercise Badge**: Shows +20 XP badge next to each completed exercise
- **Stat Card**: Displays today's total XP in the overview

### Progress Visualization
- **Progress Bars**: Visual indication of completion percentage
- **Color Coding**:
  - Green: Complete (100%+)
  - Amber: In progress (66-99%)
  - Rose: Just started (0-65%)
- **Completion Checkmark**: Animated checkmark appears when exercise is complete

### Quick Actions
- **Quick Add Buttons**: +1, +5, +10 for fast logging
- **Expandable Cards**: Tap to reveal detailed logging options
- **Edit Goals Mode**: Customize daily targets for each exercise

## Technical Implementation

### XP Calculation Function
```typescript
// From: src/domains/lifelock/1-daily/5-wellness/domain/xpCalculations.ts

export function calculateTotalWorkoutXP(exercises: Array<{
  completed: boolean;
  logged: number;
  target: number;
  isPB?: boolean;
}>): { total: number; exerciseXP: number; fullWorkoutBonus: number }
```

### Gamification Integration
- XP is automatically awarded via `GamificationService.awardXP('workout', multiplier)`
- Stored in localStorage to prevent duplicate awards
- Synced with Supabase for persistent tracking

## Future Enhancements

### Planned Features
- [ ] Personal Best (PB) tracking and bonuses
- [ ] Weekly XP leaderboards
- [ ] Achievement badges (e.g., "7-day streak", "100 push-ups")
- [ ] Difficulty levels with higher XP multipliers
- [ ] Custom exercise creation

### XP Balancing
Current XP is balanced to match other daily activities:
- Morning Routine: ~355 XP max
- **Home Workout: ~180 XP max**
- Water: 75 XP max
- Nutrition: 100 XP max

## Related Documentation
- [Water Tracker XP](../diet/WATER-XP-SYSTEM.md)
- [Nutrition XP](../diet/NUTRITION-XP-SYSTEM.md)
- [Gamification Service](../../../services/gamification/)
