# 💖 Health Non-Negotiables Page - Issues & Fixes
**Page**: views/daily/wellness/health-non-negotiables/
**Status**: Major Feature Redesign Needed
**From**: User review with screenshot

---

## 🔴 P0 (BLOCKING) ISSUES

*None* ✅ (Current system works, just not ideal)

---

## 🟡 P1 (HIGH PRIORITY) ISSUES

### Issue #1: REDESIGN - Photo-Based Nutrition Tracking

**Status**: 🔴 MAJOR FEATURE REQUEST

**Current System** (Too Manual):
```
❌ Type breakfast details in textarea
❌ Type lunch details
❌ Type dinner details
❌ Type snacks
❌ Manually adjust calories with +/- buttons
❌ Manually adjust protein with +/- buttons
❌ Manually adjust carbs with +/- buttons
❌ Manually adjust fats with +/- buttons
```

**Problem**: "It's cool in concept but it's too manual"

---

**Desired System** (Photo-Based):
```
✅ Take photo of food 📸
✅ AI guesstimate macros automatically
✅ Show timestamp of photo
✅ Auto-add to daily totals
✅ Photo gallery with macro breakdown per meal
✅ Remove manual logging completely
```

**Features Required**:

**1. Photo Upload Component**:
```typescript
<CameraUpload onCapture={(photo) => handleFoodPhoto(photo)} />
// - Mobile camera access
// - Photo preview
// - Timestamp capture
```

**2. AI Nutrition Analysis**:
```typescript
// Options:
- GPT-4 Vision API (describe food → estimate macros)
- Nutritionix API (food recognition + nutrition database)
- Edamam API (nutrition data)
- Claude Vision (might be cheaper)

// Process:
photo → AI analysis → { calories, protein, carbs, fats, description }
```

**3. Photo Gallery**:
```typescript
<FoodPhotoGallery>
  {photos.map(photo => (
    <FoodPhotoCard
      image={photo.url}
      timestamp={photo.timestamp}
      macros={photo.macros}
      description={photo.aiDescription}
    />
  ))}
</FoodPhotoGallery>
```

**4. Auto-Calculated Totals**:
```typescript
// Sum all photo macros:
dailyTotals = {
  calories: sum(photos.map(p => p.macros.calories)),
  protein: sum(photos.map(p => p.macros.protein)),
  carbs: sum(photos.map(p => p.macros.carbs)),
  fats: sum(photos.map(p => p.macros.fats))
}
```

**Database Schema Needed**:
```sql
food_photos (
  id uuid,
  user_id uuid,
  date date,
  photo_url text,
  timestamp timestamptz,
  ai_description text,
  calories integer,
  protein integer,
  carbs integer,
  fats integer,
  created_at timestamptz
)
```

**Implementation Plan**:

**Phase 1**: Photo upload + storage (2 hours)
- Camera component
- Supabase storage integration
- Photo gallery display

**Phase 2**: AI nutrition estimation (2 hours)
- Integrate vision API
- Process photo → macros
- Handle errors/fallbacks

**Phase 3**: Auto-totals + UI (2 hours)
- Calculate daily totals from photos
- Display photo timeline
- Show macro breakdown per photo
- Replace current manual UI

**Total Estimate**: 6-8 hours

**Priority**: HIGH (major UX improvement, removes tedious manual work)

**Note**: This was "a good idea before" - feature already conceived, just needs implementation

---

### Issue #2: Background Inconsistency

**Status**: 🟡 NEEDS FIX

**Description**:
- Background not clean/consistent
- Should match app background

**Fix**:
- Use: `bg-gray-900` or `bg-black`
- Remove conflicting wrappers

**Priority**: MEDIUM (polish)

---

## 🟢 P2 (MEDIUM PRIORITY) ISSUES

### Issue #3: Infinite Save Loop (From Console)

**Status**: 🟡 NEEDS FIX

**Description**:
- Nutrition saves 14 times on page load
- Console spam: "🔄 [NUTRITION] Meals changed, saving..."

**Location**:
- `HealthNonNegotiablesSection.tsx` line ~70

**Cause**:
```typescript
useEffect(() => {
  if (hasLoadedInitialData.current) {
    saveData(meals, dailyTotals);
  }
}, [meals, dailyTotals, saveData]); // saveData in deps = loop
```

**Fix**:
- Remove `saveData` from dependency array
- Or memoize saveData properly

**Priority**: MEDIUM (performance, but not breaking)

---

## 🎯 FIX PRIORITY ORDER

1. **Fix save loop** (10 min) - Quick fix, stops console spam
2. **Fix background** (5 min) - Visual consistency
3. **REDESIGN: Photo nutrition system** (6-8 hours) - Major feature

**Or**: Skip to photo system redesign (highest value)

---

## ✅ ACCEPTANCE CRITERIA

**For Photo System**:
- [ ] Can take photo of food
- [ ] AI estimates calories, protein, carbs, fats
- [ ] Shows photo with timestamp
- [ ] Daily totals auto-calculated
- [ ] Photo gallery shows all meals
- [ ] Can tap photo to see macro breakdown
- [ ] Data persists to database
- [ ] Mobile camera works
- [ ] No manual logging required

**For Polish**:
- [ ] Save loop fixed
- [ ] Background clean and consistent

---

## 💡 RECOMMENDATION

**Do Photo System First** (highest value, removes manual pain)

Then polish can happen alongside or after.
