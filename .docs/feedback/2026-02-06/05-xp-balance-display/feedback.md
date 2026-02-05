# Feedback Item 5: XP Balance Display at Top of Page

## Current State
No XP balance is visible at the top of the page. Users cannot see their total XP without navigating elsewhere.

## Desired State
Show total XP balance to the **left of the user icon** at the top of the page.

## Visual Design
- Position: Left of user avatar/icon in header
- Format: XP icon + number (e.g., "🔥 2,450 XP" or just "2,450 XP")
- Style: Should match existing header styling

## Data Source
- Use existing gamification service
- Hook: `useTodayXP` or similar
- Service: `GamificationService`

## Affected Components
- AdminLayout or page header
- User profile icon area
- Potentially need new XPBalance component

## Acceptance Criteria
- [ ] XP balance displays in header
- [ ] Positioned to left of user icon
- [ ] Updates in real-time as XP is earned
- [ ] Formatted nicely (comma separators for thousands)
- [ ] Responsive on mobile screens
