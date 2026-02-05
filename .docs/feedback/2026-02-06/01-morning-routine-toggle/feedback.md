# Feedback Item 1: Morning Routine & Nightly Checkout Toggle Behavior

## Current Behavior
Toggle sections stay open after completion. The sections remain expanded even after the user has entered all required information.

## Desired Behavior
Once info is entered and section is complete, it should:
1. Auto-close the toggle/collapsible section
2. Show a green completion icon to indicate the section is done
3. Remain toggleable - user can click to expand/collapse to review or edit

## Affected Components
- Morning routine task cards (collapsible sections)
- Nightly checkout sections (WentWell, EvenBetterIf, TomorrowsPlan, DailyMetrics)

## Reference Pattern
Look at how collapsible sections work in other parts of the app or consider using:
- Accordion/Collapsible components from shadcn/ui
- Animation with Framer Motion for smooth collapse
- CheckCircle icon from lucide-react for completion indicator

## Acceptance Criteria
- [ ] Sections auto-collapse when all required fields are filled
- [ ] Green checkmark icon appears when section is complete
- [ ] User can still click to expand/collapse completed sections
- [ ] Smooth animation on collapse/expand
- [ ] Works on both morning routine and nightly checkout
