# 📸 Photo Nutrition Feature - Status & Analysis
**Date**: 2025-10-13
**Status**: NOT FOUND - Was Planned But Never Built
**User Memory**: "I'm pretty sure we already had this feature built out"

---

## 🔍 SEARCH RESULTS

### What I Found:

**In Planning Docs** ✅:
```
docs/planning/LIFELOCK-TIMELINE-MASTER-INSIGHTS.md:
> "We've got that new functionality where I can take a photo of food
> and then it will track the food—how many calories"

Status in docs: "NEW FEATURE!" and "ALREADY EXISTS"
```

**In Codebase** ❌:
- No photo nutrition code found
- No food tracking components
- No vision API integrations
- No camera components for nutrition
- No food_photos database table

**In Git History** ❌:
- No deleted photo nutrition files
- No commits about food photo feature
- No evidence it was ever built

---

## 💡 WHAT HAPPENED

### Theory: Feature Was Conceptualized, Not Built

**Evidence**:
1. Planning docs say "we've got that new functionality"
2. But it's labeled "NEW FEATURE!" (to be built)
3. It appears in "Discovered Features" section
4. Listed under "Calorie Tracking visualization - existing feature to integrate"

**Interpretation**:
- You PLANNED this feature in discovery session (Oct 2025-10-10)
- Docs captured it as a requirement
- It was never actually implemented
- Your memory conflated "planned" with "built"

**OR**:
- It exists in a different project/repo
- It was in a branch that got deleted
- It's in code you haven't shared with me

---

## 🎯 WHAT EXISTS vs WHAT'S NEEDED

### What Exists ✅:
- FileUpload components (for admin/outreach features)
- Supabase storage (used for avatars)
- useNutritionSupabase hook (for manual nutrition data)
- Manual macro tracking UI (current system)

### What's Needed 🔨:
- Camera component for food photos
- Vision API integration (GPT-4V, Claude Vision, or Nutritionix)
- Photo storage in Supabase
- AI macro estimation
- Photo gallery UI
- Auto-calculated daily totals
- Database schema for food_photos
- Feature folder structure

**Conclusion**: Feature needs to be built from scratch

---

## 🏗️ RECOMMENDED LOCATION

Following the pattern established with `ai-thought-dump`:

```
src/ecosystem/internal/lifelock/features/
└── photo-nutrition/
    ├── components/
    │   ├── CameraUpload.tsx
    │   ├── FoodPhotoGallery.tsx
    │   ├── FoodPhotoCard.tsx
    │   └── DailyMacroSummary.tsx
    │
    ├── services/
    │   ├── visionApi.service.ts (GPT-4V or Claude Vision)
    │   ├── nutritionEstimation.service.ts
    │   └── photoStorage.service.ts
    │
    ├── hooks/
    │   ├── useFoodPhotos.ts
    │   └── usePhotoUpload.ts
    │
    ├── types/
    │   └── index.ts (FoodPhoto, MacroEstimate, etc.)
    │
    ├── config/
    │   ├── visionPrompts.ts
    │   └── nutritionDefaults.ts
    │
    ├── README.md
    └── index.ts (public API)
```

**Then use in**: `views/daily/wellness/health-non-negotiables/HealthNonNegotiablesSection.tsx`

---

## 📋 BUILD PLAN

### Phase 1: Photo Upload (2 hours)

**Create**:
```
features/photo-nutrition/
├── components/CameraUpload.tsx
├── services/photoStorage.service.ts
└── hooks/usePhotoUpload.ts
```

**Features**:
- Mobile camera access
- Photo capture
- Upload to Supabase storage
- Thumbnail generation

---

### Phase 2: AI Nutrition Analysis (2 hours)

**Create**:
```
features/photo-nutrition/
├── services/visionApi.service.ts
└── services/nutritionEstimation.service.ts
```

**Integration Options**:
1. **GPT-4 Vision** (OpenAI)
2. **Claude 3.5 Sonnet with Vision** (Anthropic)
3. **Nutritionix API** (specialized food recognition)

**Prompt Example**:
```
"Analyze this food photo. Estimate:
- Calories (kcal)
- Protein (g)
- Carbs (g)
- Fats (g)
- Food description

Be realistic and conservative in estimates."
```

---

### Phase 3: Photo Gallery & UI (2 hours)

**Create**:
```
features/photo-nutrition/
├── components/FoodPhotoGallery.tsx
├── components/FoodPhotoCard.tsx
└── components/DailyMacroSummary.tsx
```

**Features**:
- Timeline view of food photos
- Tap photo to see macro breakdown
- Daily totals auto-calculated
- Edit/delete photos

---

### Phase 4: Database & Integration (2 hours)

**Create Database Table**:
```sql
CREATE TABLE food_photos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  date date NOT NULL,
  photo_url text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  ai_description text,
  calories integer,
  protein integer,
  carbs integer,
  fats integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_food_photos_user_date ON food_photos(user_id, date);
```

**Integrate**:
- Replace manual meal inputs with photo upload
- Show photo gallery
- Calculate totals from photos

---

## 🎯 RECOMMENDATION

**Build it from scratch** in `features/photo-nutrition/`

**Estimate**: 6-8 hours total
**Value**: Removes all manual logging burden
**Pattern**: Follows ai-thought-dump structure (proven)

---

## 📝 NEXT STEPS

1. **Confirm**: You want this built now? (6-8 hours)
2. **Choose Vision API**: GPT-4V, Claude Vision, or Nutritionix?
3. **Create feature folder**: `features/photo-nutrition/`
4. **Build Phase 1**: Photo upload (2 hours)
5. **Build Phase 2**: AI analysis (2 hours)
6. **Build Phase 3**: Gallery UI (2 hours)
7. **Build Phase 4**: Integration (2 hours)

**Or**: Continue polishing other pages first, build this later?

---

**What's your call?** Build photo nutrition now or continue with other page fixes?
