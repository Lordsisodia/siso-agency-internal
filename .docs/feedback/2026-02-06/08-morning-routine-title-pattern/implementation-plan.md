# Implementation Plan: Morning Routine Title/Subtext Pattern Consistency

## Overview
Update the Morning Routine header to match the Nightly Checkout pattern for visual consistency across the Lifelock domain.

## Exact Differences Between Patterns

### 1. Container Structure
| Aspect | Nightly Checkout | Morning Routine (Current) |
|--------|-----------------|---------------------------|
| **Wrapper** | Plain `<div>` with `border-b border-white/10` | `<Card>` with `<CardHeader>` |
| **Padding** | `px-5 py-5` | `p-3 sm:p-4 md:p-6` via CardHeader |
| **Background** | None (inherits from page) | `bg-slate-950/40` with shadow |

### 2. Icon Container
| Aspect | Nightly Checkout | Morning Routine (Current) |
|--------|-----------------|---------------------------|
| **Size** | `w-14 h-14` (56x56px) | `p-1.5` (~30x30px) |
| **Border radius** | `rounded-2xl` | `rounded-lg` |
| **Background** | `bg-gradient-to-br from-purple-500/20 to-indigo-500/20` | None |
| **Border** | `border-2 border-purple-500/30` | `border border-orange-400/30` |
| **Icon size** | `h-7 w-7` | `h-4 w-4` |

### 3. Typography
| Aspect | Nightly Checkout | Morning Routine (Current) |
|--------|-----------------|---------------------------|
| **Title size** | `text-2xl` | `text-base` |
| **Title weight** | `font-bold` | `font-semibold` |
| **Title color** | `text-white` | `text-orange-100` |
| **Title tracking** | `tracking-tight` | None |
| **Subtext size** | `text-sm` | `text-xs` |
| **Subtext color** | `text-white/60` | `text-slate-400` |
| **Subtext margin** | `mt-0.5` | None (uses `space-y-0.5`) |

### 4. Right Side (XP/Completion Display)
| Aspect | Nightly Checkout | Morning Routine (Current) |
|--------|-----------------|---------------------------|
| **Display** | XP value + completion % | Badge with percentage |
| **XP styling** | `text-2xl font-bold text-purple-400` | N/A |
| **Completion styling** | `text-xs text-purple-400/70` | Badge component |

### 5. Layout Structure
| Aspect | Nightly Checkout | Morning Routine (Current) |
|--------|-----------------|---------------------------|
| **Main flex** | `flex items-center justify-between gap-4` | Same |
| **Left group gap** | `gap-4` | `gap-2` |
| **Text container** | `min-w-0` | `space-y-0.5` |

## Specific Changes Required

### File to Modify
`/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx`

### Change 1: Replace Card/CardHeader with Plain div (lines 815-842)
**Current:**
```tsx
<Card className="bg-slate-950/40 border border-slate-700/30 shadow-lg overflow-hidden">
  <CardHeader className="relative pb-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg border border-orange-400/30">
          <Sun className="h-4 w-4 text-orange-300" />
        </div>
        <div className="space-y-0.5">
          <CardTitle className="text-base font-semibold text-orange-100">Morning Routine</CardTitle>
          <p className="text-xs text-slate-400">Start your day right</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={cn(
          "border",
          morningRoutineProgress >= 100
            ? "bg-green-500/20 text-green-300 border-green-500/30"
            : morningRoutineProgress >= 50
            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
            : "bg-slate-500/20 text-slate-400 border-slate-500/30"
        )}>
          {morningRoutineProgress >= 100 ? 'Complete' : `${Math.round(morningRoutineProgress)}%`}
        </Badge>
      </div>
    </div>
  </CardHeader>
</Card>
```

**New:**
```tsx
{/* Page Header - Title, Icon, Subtext */}
<div className="px-5 py-5 border-b border-white/10">
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-2 border-orange-500/30 flex items-center justify-center flex-shrink-0">
        <Sun className="h-7 w-7 text-orange-400" />
      </div>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-white tracking-tight">Morning Routine</h1>
        <p className="text-sm text-white/60 mt-0.5">Start your day right</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="text-2xl font-bold text-orange-400">{todayXP.total} XP</div>
        <div className="text-xs text-orange-400/70">{morningRoutineProgress}% complete</div>
      </div>
    </div>
  </div>
</div>
```

### Change 2: Update Imports (if needed)
- Remove `CardTitle` from imports if no longer used elsewhere
- Keep `Badge` import (may be used elsewhere in the file)

### Change 3: Verify Data Availability
The new pattern uses `todayXP.total` which is already available in the component (computed via `useMemo` at line 655-673).

## Icon Container Sizing and Styling

### Morning Routine Icon Container (New)
```tsx
<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-2 border-orange-500/30 flex items-center justify-center flex-shrink-0">
  <Sun className="h-7 w-7 text-orange-400" />
</div>
```

**Specifications:**
- **Size:** 56x56px (`w-14 h-14`)
- **Border radius:** 16px (`rounded-2xl`)
- **Background:** Gradient from orange-500/20 to amber-500/20 (warm morning colors)
- **Border:** 2px solid orange-500/30
- **Icon:** Sun icon at 28x28px (`h-7 w-7`)
- **Icon color:** orange-400

## Typography Changes

### Title
- **Current:** `text-base font-semibold text-orange-100`
- **New:** `text-2xl font-bold text-white tracking-tight`

### Subtext
- **Current:** `text-xs text-slate-400`
- **New:** `text-sm text-white/60 mt-0.5`

## Layout Structure Changes

### Before (Nested Card Structure)
```
Card
  └── CardHeader
        └── flex container
              ├── left group (icon + text)
              └── right group (badge)
```

### After (Flat div Structure)
```
div (header wrapper with border-bottom)
  └── flex container (justify-between)
        ├── left group (gap-4)
        │     ├── icon container (56x56)
        │     └── text container (min-w-0)
        │           ├── h1 (title)
        │           └── p (subtext)
        └── right group (XP display)
              └── text-right container
                    ├── XP value
                    └── completion %
```

## Color Theme Mapping

Since Morning Routine uses warm/orange tones instead of purple:

| Element | Nightly Checkout (Purple) | Morning Routine (Orange) |
|---------|--------------------------|--------------------------|
| Gradient start | `purple-500/20` | `orange-500/20` |
| Gradient end | `indigo-500/20` | `amber-500/20` |
| Border | `purple-500/30` | `orange-500/30` |
| Icon color | `purple-400` | `orange-400` |
| XP text | `purple-400` | `orange-400` |
| XP subtext | `purple-400/70` | `orange-400/70` |

## Acceptance Criteria Verification

- [ ] Morning routine header matches nightly checkout pattern structure
- [ ] Icon container is 56x56px (`w-14 h-14`) with gradient background
- [ ] Title uses `text-2xl font-bold text-white tracking-tight`
- [ ] Subtext uses `text-sm text-white/60 mt-0.5`
- [ ] XP display shows on right side with `todayXP.total` value
- [ ] Completion percentage displayed below XP
- [ ] Visual consistency achieved between both sections
- [ ] Orange/amber color theme preserved (not purple)

## Files to Modify

1. **`/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx`**
   - Lines 815-842: Replace Card/CardHeader header with div-based header matching NightlyCheckoutSection pattern
   - Keep all existing data bindings (`todayXP.total`, `morningRoutineProgress`)

## Testing Checklist

1. Visual comparison: Morning Routine header should visually match Nightly Checkout header structure
2. Verify icon size is noticeably larger than before
3. Verify title is larger and bolder
4. Verify XP display appears on the right side
5. Verify completion percentage shows below XP
6. Verify responsive behavior on mobile devices
7. Verify no console errors after changes
