# Feedback Item 7: Flow State Rules & Statistics Enhancement

## Current State
Flow state rules are displayed as a simple bullet list in a tab. Statistics are limited.

## Proposed Enhancements
Revamp the flow state rules/statistics display with richer data visualization:

### New Features
1. **Weekly Graph View**
   - Visual chart showing XP earned each day of the week
   - Bar or line graph

2. **Daily Statistics**
   - XP earned each day so far this week
   - Wake up statistics (average wake time, consistency)
   - Sleep statistics (average hours, quality)
   - Calorie tracking visualization

3. **Flow State Rules Display**
   - Keep existing rules but present them more visually
   - Maybe as cards or checkable items

## Affected Components
- MorningRoutineSection (Flow State Rules tab)
- StatsSection or new Statistics dashboard
- May need new chart/graph components

## Technical Considerations
- Use existing mock data patterns from WeeklyView
- Consider chart library (recharts, chart.js, or custom SVG)
- Data from: gamification service, daily reflections

## Acceptance Criteria
- [ ] Weekly XP graph implemented
- [ ] Wake up statistics displayed
- [ ] Sleep statistics displayed
- [ ] Calorie tracking visualization
- [ ] Visually appealing and readable
- [ ] Works on mobile screens
