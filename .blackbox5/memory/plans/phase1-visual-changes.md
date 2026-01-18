# Phase 1: Diet Section - Visual Changes Reference

## Before vs After Comparison

### BEFORE: Tab-Based Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ [📷 Photo] [🍽️ Meals] [🎯 Macros]            │ │  ← Tab Navigation
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  📷 Photo Nutrition              [+30 XP]     │ │  ← Dynamic Header
│  │  AI-powered food analysis                    │ │     (changes per tab)
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [PhotoNutritionTracker Component]                  │  ← Only one feature
│                                                     │     visible at a time
│  ┌───────────────────────────────────────────────┐ │
│  │  📸 Take Photo           [Upload]             │ │
│  │                                               │ │
│  │  Daily Macro Summary                          │ │
│  │  • Calories: 0/2000                          │ │
│  │  • Protein: 0/150g                           │ │
│  │  • Carbs: 0/250g                             │ │
│  │  • Fats: 0/65g                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Photo Gallery]                                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Click "Meals" tab →** Page content completely changes to Meals component
**Click "Macros" tab →** Page content completely changes to Macros component

---

### AFTER: Single-Page Accordion Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  🏆 Nutrition Tracking            [+65 XP]     │ │  ← Static Header
│  │  Photo • Meals • Macros                      │ │     (always same)
│  │                                               │ │
│  │  [Expand All] • [Collapse All]               │ │  ← Quick Actions
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  📷 Photo Nutrition               [+30 XP] ▼ │ │  ← Section Header
│  │  AI-powered food analysis                    │ │     (always visible)
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [PhotoNutritionTracker Component]                  │  ← Expanded by default
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  🍽️ Today's Meals                 [+15 XP] ▶ │ │  ← Collapsed Section
│  │  Log and track your meals                    │ │     (click to expand)
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  🎯 Daily Macros                    [+20 XP] ▶ │ │  ← Collapsed Section
│  │  Track your daily macros                      │ │     (click to expand)
│  └───────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Click "Meals" header →** Meals section expands, Photo stays visible (or can be collapsed)
**Click "Macros" header →** Macros section expands, other sections stay as-is

---

## Key Interaction Differences

### Before: Tab Switching
1. User sees only ONE feature at a time
2. Clicking a tab **replaces** all content
3. Must switch back and forth to see different features
4. Header changes dynamically
5. XP shown for active tab only

### After: Accordion Expansion
1. User sees ALL section headers at once
2. Clicking a header **expands** that section
3. Can expand multiple sections simultaneously
4. Header is static
5. Total XP shown (65) + individual XP per section

---

## User Journey Examples

### Scenario 1: Log Breakfast and Take Photo

**Before (Tab-Based):**
1. Navigate to Diet section
2. Click "Photo" tab
3. Take photo of breakfast
4. Wait for AI analysis
5. Click "Meals" tab (Photo disappears)
6. Log breakfast in Meals
7. Want to see macro summary? Click "Macros" tab (Meals disappears)
8. Want to compare photo vs logged meal? Switch back to Photo

**After (Accordion):**
1. Navigate to Diet section
2. Photo section is already expanded
3. Take photo of breakfast
4. Wait for AI analysis
5. Click "Meals" header to expand
6. Log breakfast in Meals
7. Photo section still visible above for comparison
8. Click "Macros" header to see daily totals
9. All three sections visible at once for complete overview

### Scenario 2: Check Daily Progress

**Before (Tab-Based):**
1. Navigate to Diet section
2. Check Photo tab for AI-analyzed macros
3. Click Meals tab to see logged meals
4. Click Macros tab to see manual tracking
5. **Problem**: Must remember values from each tab to compare

**After (Accordion):**
1. Navigate to Diet section
2. Click "Expand All" button
3. See Photo nutrition summary
4. See logged meals below it
5. See manual macro tracking below that
6. **Benefit**: All information visible at once, easy to compare

---

## Visual Design Changes

### Color Coding
- **Photo Section**: Green theme (`from-green-500/20 to-emerald-500/20`)
- **Meals Section**: Blue theme (`from-blue-500/20 to-cyan-500/20`)
- **Macros Section**: Purple theme (`from-purple-500/20 to-pink-500/20`)

### Icons
- **Header**: 🏆 Award icon (represents all nutrition tracking)
- **Photo**: 📷 Camera icon
- **Meals**: 🍽️ Utensils/Crossed icon
- **Macros**: 🎯 Target icon

### Indicators
- **Collapsed**: ▶ (ChevronRight)
- **Expanded**: ▼ (ChevronDown)
- **Animation**: Smooth rotation on toggle

---

## Responsive Behavior

### Desktop (>768px)
- All sections maintain full width
- Meal cards show 2-column grid
- Macro trackers show 2-column grid
- Photo gallery shows 2-column grid

### Mobile (<768px)
- All sections maintain full width
- Meal cards stack vertically
- Macro trackers stack vertically
- Photo gallery stacks vertically
- Touch-friendly expand/collapse areas

---

## Accessibility Features

### Keyboard Navigation
- Tab to section headers
- Enter/Space to toggle sections
- Focus indicators on interactive elements

### Screen Reader Support
- `aria-expanded` indicates section state
- `aria-label` describes content regions
- Semantic HTML structure

### Visual Indicators
- High contrast colors
- Clear expand/collapse icons
- Smooth animations (prefers-reduced-motion respected)

---

## Performance Characteristics

### Before: Tab-Based
- Initial render: One component
- Tab switch: Unmount previous, mount new
- Memory: Only one component in DOM at a time
- Network: Fetch data only when tab is active

### After: Accordion
- Initial render: All section headers
- Expand section: Mount component content
- Memory: Only expanded sections in DOM
- Network: Fetch data when section expands

**Result**: Similar performance, better UX with predictable expansion

---

## Developer Notes

### State Management
```typescript
// Simple Set-based state for expanded sections
const [expandedSections, setExpandedSections] = useState<Set<NutritionSection>>(
  new Set(['photo']) // Photo expanded by default
);
```

### Toggle Logic
```typescript
const toggleSection = (sectionId: NutritionSection) => {
  setExpandedSections((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(sectionId)) {
      newSet.delete(sectionId); // Collapse
    } else {
      newSet.add(sectionId); // Expand
    }
    return newSet;
  });
};
```

### Animation
```typescript
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

**Document Purpose**: Visual reference for Phase 1 changes
**Last Updated**: 2025-01-17
**Status**: Implementation Complete
