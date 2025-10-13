# 💪 Home Workout Page - Issues & Fixes
**Page**: views/daily/wellness/home-workout/
**Status**: Needs Fixes
**From**: User review with screenshot (wellness tab)

---

## 🔴 P0 (BLOCKING) ISSUES

*None* ✅

---

## 🟡 P1 (HIGH PRIORITY) ISSUES

### Issue #1: Workout Cards Using Purple (Should Be Red)

**Status**: 🔴 NEEDS FIX

**Description**:
- Push-up, squats, plank boxes show PURPLE theme
- Should be RED theme (wellness = red)
- Screenshot shows purple: `bg-purple-900/20`, `border-purple-600/40`

**Location**:
- `views/daily/wellness/home-workout/components/WorkoutItemCard.tsx`

**Fix**:
```typescript
// Change ALL purple to red:
bg-purple-900/20 → bg-red-900/20
border-purple-600/40 → border-red-700/30
text-purple-300 → text-red-300
hover:bg-purple-900/30 → hover:bg-red-900/30
border-purple-600 → border-red-600
data-[state=checked]:bg-purple-600 → data-[state=checked]:bg-red-500
```

**Priority**: HIGH (theme inconsistency)

---

### Issue #2: Missing Sit-ups Exercise

**Status**: 🔴 NEEDS FIX

**Description**:
- Current workout items: Push-ups, Squats, Plank (3 exercises)
- Should be: Push-ups, Sit-ups, Squats, Planks (4 exercises)
- Missing: Sit-ups

**Location**:
- Default workout items in `HomeWorkoutSection.tsx` (lines 68-71)
- Or in `supabaseWorkoutService.createDefaultWorkoutItems()`

**Fix**:
Add sit-ups to default items:
```typescript
{
  id: 'temp-' + Date.now() + '-2',
  title: 'Sit-ups',
  completed: false,
  target: '50 reps',
  logged: '0'
}
```

**Priority**: HIGH (missing core exercise)

---

### Issue #3: Blue Box Wrapper Interfering

**Status**: 🔴 NEEDS FIX

**Description**:
- Blue box/wrapper visible in background
- Interferes with clean background aesthetic
- Visible in screenshot

**Location**:
- `HomeWorkoutSection.tsx` - outer container div
- Check for: `bg-blue-*`, `border-blue-*`, or nested wrappers

**Fix**:
- Remove blue wrapper
- Use clean background: `bg-gray-900` or `bg-black`
- Match other pages

**Priority**: HIGH (visual consistency)

---

## 🟢 P2 (MEDIUM PRIORITY) ISSUES

### Issue #4: Background Inconsistency

**Status**: 🟡 NEEDS FIX

**Description**:
- Background "a bit weird" (user quote)
- Should be clean, consistent with app

**Fix**:
- Ensure outer container: `bg-gray-900` or `bg-black`
- Remove conflicting background classes
- Match morning routine page background

**Priority**: MEDIUM (polish)

---

## 🎯 FIX PRIORITY ORDER

1. **Fix workout card colors** (purple → red) - 10 min
2. **Add sit-ups exercise** - 5 min
3. **Remove blue wrapper** - 10 min
4. **Fix background** - 5 min

**Total**: ~30 minutes

---

## ✅ ACCEPTANCE CRITERIA

- [ ] All workout cards RED theme (not purple)
- [ ] 4 exercises: Push-ups, Sit-ups, Squats, Planks
- [ ] No blue wrapper visible
- [ ] Clean background (matches app)
- [ ] Theme consistent with page header (red)
