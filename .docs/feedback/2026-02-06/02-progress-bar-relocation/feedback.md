# Feedback Item 2: Day Progress Bar Relocation

## Current Location
Horizontal 100% progress bar is displayed below the day selector dropdown at the top of the page.

## Desired Location
Move the progress bar to the left-hand side of the screen as a **vertical bar** alongside the existing colour-changing vertical line on mobile.

## Visual Reference
- Current: Horizontal bar at top
- Desired: Vertical bar on left edge of screen
- Should align with the existing vertical coloured line that changes per page

## Affected Files
- DayProgressBar component
- DayProgressPill component
- Pages using the progress bar (likely Daily view)

## Technical Considerations
- May need to create a new VerticalProgressBar variant
- Should maintain the same progress calculation logic
- Needs to work on mobile (primary) and desktop
- Should not overlap with other UI elements

## Acceptance Criteria
- [ ] Progress bar displays vertically on left side
- [ ] Progress percentage is still clearly visible
- [ ] Works on mobile screen sizes
- [ ] Maintains existing progress calculation
- [ ] Smooth visual integration with existing vertical line
