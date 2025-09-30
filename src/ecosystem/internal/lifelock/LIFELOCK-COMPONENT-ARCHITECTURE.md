# LifeLock Component Architecture Documentation

## Light Work Page Component Hierarchy

**Route:** `/admin/life-lock?tab=light-work`

### Component Flow (Top to Bottom)

1. **AdminLifeLock** (`src/ecosystem/internal/lifelock/AdminLifeLock.tsx`)
   - Main page component
   - Handles routing to LifeLock tabs

2. **TasksProvider** 
   - Wraps entire content for task state management

3. **TabLayoutWrapper** (`src/ecosystem/internal/lifelock/TabLayoutWrapper.tsx`)
   - Tab system container
   - **MAIN SCROLL CONTAINER** - `overflow-y-auto` with mobile optimizations
   - Fixed bottom navigation
   - Drag gesture handling for tab switching

4. **OfflineIndicator** (`src/shared/components/OfflineIndicator.tsx`)
   - Fixed at top of screen

5. **SafeTabContentRenderer** (`src/components/ui/TabContentRenderer.tsx`)
   - Error boundary wrapper
   - Routes to TabContentRenderer

6. **TabContentRenderer** 
   - Configuration-driven rendering
   - Uses ENHANCED_TAB_CONFIG

7. **StandardTabLayout**
   - Standard layout wrapper for most tabs
   - Contains date nav and content

8. **CleanDateNav** (`src/shared/ui/clean-date-nav.tsx`)
   - Date navigation header

9. **SisoDeepFocusPlan** (`src/components/ui/siso-deep-focus-plan.tsx`)
   - **MAIN CONTENT COMPONENT** for light work
   - Configured with `taskType: 'light-work'`
   - Contains task management interface

10. **SimpleFeedbackButton** (`src/ecosystem/internal/feedback/SimpleFeedbackButton.tsx`)
    - Located at bottom of SisoDeepFocusPlan
    - Current positioning: `relative z-[51]` with `mt-6 mb-20`

11. **ExpandableTabs** 
    - Bottom navigation tabs
    - Fixed positioning with `z-50`

### Sub-Components within SisoDeepFocusPlan

- **Card/CardContent/CardHeader** - Task containers
- **TaskDetailModal** - Opens when task is clicked
- **CustomCalendar** - Calendar popup (has own scroll when open)
- **SubtaskItem** - Individual subtask rendering
- **Motion components** - Framer Motion animations
- **Lucide icons** - UI iconography

### Tab Configuration

From `src/ecosystem/internal/lifelock/admin-lifelock-tabs.ts`:

```typescript
'light-work': {
  ...TAB_CONFIG['light-work'],
  layoutType: 'standard',
  backgroundClass: 'h-full bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24',
  showDateNav: true,
  components: [SisoDeepFocusPlan],
  componentProps: { taskType: 'light-work' },
}
```

### Scroll Architecture

- **Single Scroll Container:** TabLayoutWrapper with `overflow-y-auto`
- **No Competing Scrolls:** SisoDeepFocusPlan uses `overflow-hidden` for task lists
- **Mobile Optimized:** `WebkitOverflowScrolling: 'touch'` and `touchAction: 'pan-y pinch-zoom'`
- **Bottom Padding:** `160px/140px` to account for fixed bottom navigation

### Z-Index Layers

- **Navigation:** `z-50` (ExpandableTabs)
- **Feedback Button:** `z-[51]` (just above nav)
- **Calendar Modal:** `z-50` (when open)
- **Content:** Default z-index

## Editing Guidelines

When making changes to the light work page:

1. **Feedback Button:** Edit `src/components/ui/siso-deep-focus-plan.tsx` around line 819
2. **Tab Configuration:** Edit `src/ecosystem/internal/lifelock/admin-lifelock-tabs.ts`
3. **Main Content:** Edit SisoDeepFocusPlan component
4. **Navigation:** Edit TabLayoutWrapper
5. **Date Header:** Edit CleanDateNav component

## Common Issues

- **Scroll Problems:** Usually z-index conflicts or touch event interference
- **Navigation Overlap:** Fixed bottom nav covers content without proper z-index
- **Touch Events:** High z-index can block scroll gesture recognition
- **Component Loading:** Wrong component configuration in admin-lifelock-tabs.ts

---
*Last Updated: 2025-09-30*
*For: Claude AI Assistant Reference*