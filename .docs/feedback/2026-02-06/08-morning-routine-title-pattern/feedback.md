# Feedback Item 8: Morning Routine Title/Subtext Pattern Consistency

## Current Issue
The morning routine title and subtext don't follow the same pattern used in the nightly checkout.

## Nightly Checkout Pattern (Reference)
Located in `NightlyCheckoutSection.tsx` lines 316-335:
- Large icon container (56x56) with gradient background
- Title: Large bold text (text-2xl)
- Subtext: Smaller muted text below
- XP display on right side
- Full-width header card

```tsx
<div className="flex items-center gap-4">
  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-2 border-purple-500/30 flex items-center justify-center flex-shrink-0">
    <Moon className="h-7 w-7 text-purple-400" />
  </div>
  <div className="min-w-0">
    <h1 className="text-2xl font-bold text-white tracking-tight">Nightly Checkout</h1>
    <p className="text-sm text-white/60 mt-0.5">Reflect on your day</p>
  </div>
</div>
```

## Morning Routine Current
Located in `MorningRoutineSection.tsx` lines 815-842:
- Smaller icon container
- Different card styling
- Title inside CardHeader
- Badge showing completion percentage

## Desired Change
Update morning routine header to match nightly checkout pattern:
1. Larger icon with gradient background
2. Title/subtext layout matching nightly checkout
3. Consistent spacing and typography
4. Keep the completion badge but position appropriately

## Acceptance Criteria
- [ ] Morning routine header matches nightly checkout pattern
- [ ] Icon container same size (56x56) with gradient
- [ ] Title uses same text styles (text-2xl, font-bold)
- [ ] Subtext uses same muted style
- [ ] Visual consistency between both sections
