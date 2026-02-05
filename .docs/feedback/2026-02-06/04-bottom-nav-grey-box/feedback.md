# Feedback Item 4: Bottom Navigation Grey Box Blocking Content

## Current Issue
There is a grey box at the bottom of the screen behind the AI icon and 4-button bottom navigation. This box is blocking page content from scrolling underneath it, causing content to be cut off.

## Desired Outcome
Fix the scrolling so that page content can scroll **behind/beneath** the bottom navigation bar properly. The navigation should overlay the content rather than pushing it up.

## Affected Components
- ConsolidatedBottomNav
- CircularBottomNav
- TabLayoutWrapper
- Page containers with padding

## Technical Approach
- Check z-index layering
- Ensure proper positioning (fixed vs absolute)
- Add bottom padding to scrollable content area
- Make nav bar semi-transparent or blurred background

## Acceptance Criteria
- [ ] Content scrolls smoothly beneath bottom nav
- [ ] No content is cut off at bottom of page
- [ ] Bottom nav remains visible and accessible
- [ ] Visual polish (blur/opacity) on nav background
- [ ] Works on all screen sizes
