# Feedback Item 9: Header Icon Consistency

## Current Issue
Icons for headers on morning routine and checkout don't follow the icon style used in smoking tracker, water tracker, and fitness tracker.

## Reference Pattern (Smoking Tracker)
Located in `SmokingTracker.tsx` lines 241-252:
```tsx
<div className={cn(
  "p-1.5 rounded-lg border transition-all duration-300",
  smokingData.cigarettes === 0
    ? "border-purple-400/30"
    : "border-purple-400/30"
)}>
  <Cigarette className={cn(
    "h-4 w-4 transition-colors duration-300",
    smokingData.cigarettes === 0 ? "text-purple-300" : "text-purple-300"
  )} />
</div>
```

The pattern features:
1. Grey/dark background (bg-slate-950/40 or similar)
2. Subtle colored border (border-{color}-400/30)
3. Colored icon (text-{color}-300)
4. Rounded container (rounded-lg)
5. Padding around icon (p-1.5)

## Current Morning Routine Icons
Located in `MorningRoutineSection.tsx` around line 938:
```tsx
<IconComponent className="h-5 w-5 text-orange-400 flex-shrink-0" />
```
- Icons are standalone without background container
- No border or background styling

## Desired Change
Update all header icons in:
1. Morning routine task headers
2. Nightly checkout section headers
3. Any other routine/checkout headers

To match the smoking tracker pattern:
- Grey background container
- Colored border
- Colored icon
- Consistent sizing

## Acceptance Criteria
- [ ] Morning routine task icons have grey background + colored border
- [ ] Nightly checkout section icons match pattern
- [ ] Icons are consistent size (h-4 w-4 or h-5 w-5)
- [ ] Color coding maintained (orange for morning, purple for checkout)
- [ ] Visual consistency across all tracker sections
