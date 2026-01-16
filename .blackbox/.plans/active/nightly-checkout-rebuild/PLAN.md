# Nightly Checkout Rebuild - Execution Plan

**Plan ID:** nightly-checkout-rebuild-v1
**Created:** 2026-01-16
**Status:** Planning
**Priority:** P0 (High)

---

## 🎯 Executive Summary

Rebuild the Nightly Checkout system to track 6 core metrics (Meditation, Workout, Nutrition, Deep Work, Research, Sleep) with a streamlined 15-minute daily workflow using Blackbox4's agent orchestration framework.

---

## 📊 Success Metrics

- [ ] All 6 metric cards implemented and functional
- [ ] Data persists to Supabase correctly
- [ ] Auto-save working with debouncing
- [ ] Mobile-responsive UI
- [ ] Completion progress tracker working
- [ ] All tests passing
- [ ] Average checkout time < 15 minutes

---

## 🏗️ Architecture

### Current State
- Located at: `src/domains/lifelock/1-daily/7-checkout/ui/pages/NightlyCheckoutSection.tsx`
- 775 lines, monolithic component
- Mixes data fetching, state management, and UI rendering
- Uses `useDailyReflections` hook for persistence
- Basic reflection fields only

### Target State
- Modular component architecture
- 6 metric card components (reusable)
- State management separation
- Enhanced data model
- Clean separation: Metrics → State → Reflection → Planning

---

## 📦 Data Model

### TypeScript Interface

```typescript
interface NightlyCheckoutData {
  date: string;
  userId: string;

  // Core Metrics
  meditation: {
    minutes: number;
    quality: number; // 1-100
  };
  workout: {
    completed: boolean;
    type?: 'strength' | 'cardio' | 'yoga' | 'hiit' | 'other';
    duration?: number;
    intensity?: 'light' | 'moderate' | 'intense';
  };
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    hitGoal: boolean;
  };
  deepWork: {
    hours: number;
    quality: number; // 1-100
  };
  research: {
    hours: number;
    topic?: string;
    notes?: string;
  };
  sleep: {
    hours: number;
    bedTime: string;
    wakeTime: string;
    quality: number; // 1-100
  };

  // State Data
  moodStart: number; // 1-10
  moodEnd: number; // 1-10
  energyLevel: number; // 1-10
  stressLevel: number; // 1-10

  // Reflection
  wentWell: string[];
  evenBetterIf: string[];

  // Tomorrow
  nonNegotiable: string;
  topTasks: string[3];
  tomorrowFocus: string;
}
```

---

## 🎨 UI Components

### Component Structure

```
NightlyCheckoutSection (container)
├── CheckoutHeader (progress, XP, streak)
├── AccountabilityCard (yesterday's focus)
├── MetricsGrid (6 metric cards)
│   ├── MeditationCard
│   ├── WorkoutCard
│   ├── NutritionCard
│   ├── DeepWorkCard
│   ├── ResearchCard
│   └── SleepCard
├── StateSnapshot (mood, energy, stress)
├── ReflectionSection (what went well, even better if)
└── TomorrowPlan (non-negotiable, top 3 tasks, focus)
```

### Metric Card Template

Each metric card will follow a consistent structure:
- Icon + Label
- Input fields (specific to metric)
- Progress indicator (vs daily target)
- Quality rating slider (1-100)
- Quick-save indicator

---

## 🔄 Implementation Phases

### Phase 1: Foundation (1-2 hours)
- [ ] Update Supabase schema for new data model
- [ ] Create TypeScript interfaces
- [ ] Set up base component structure
- [ ] Update `useDailyReflections` hook

### Phase 2: Metric Cards (3-4 hours)
- [ ] MeditationCard component
- [ ] WorkoutCard component
- [ ] NutritionCard component
- [ ] DeepWorkCard component
- [ ] ResearchCard component
- [ ] SleepCard component

### Phase 3: State & Reflection (1-2 hours)
- [ ] StateSnapshot component
- [ ] ReflectionSection component
- [ ] Bullet list management

### Phase 4: Planning (1 hour)
- [ ] TomorrowPlan component
- [ ] AccountabilityCard (yesterday's focus)
- [ ] Top 3 tasks management

### Phase 5: Integration & Polish (1-2 hours)
- [ ] Wire up all components
- [ ] Implement auto-save with debouncing
- [ ] Add progress tracking
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] Error handling

### Phase 6: Testing (1 hour)
- [ ] Unit tests for metric components
- [ ] Integration tests for data flow
- [ ] E2E test for complete checkout flow
- [ ] Performance testing

**Total Estimate:** 8-12 hours

---

## 🛠️ Technical Approach

### Using Blackbox4 Framework

1. **Plan Creation**: This document serves as the structured spec
2. **Agent Coordination**: Use specialized agents for different phases
3. **Memory System**: Track all work in Blackbox memory
4. **Kanban Integration**: Manage tasks via vibe_kanban MCP

### Agent Assignment

| Phase | Agent Type | Role |
|-------|-----------|------|
| Phase 1 | Backend Developer | Supabase schema, TypeScript types |
| Phase 2 | Frontend Developer | React components, UI |
| Phase 3 | Frontend Developer | State management, forms |
| Phase 4 | Frontend Developer | Planning components |
| Phase 5 | Full Stack | Integration, polish |
| Phase 6 | Test Engineer | Testing, QA |

---

## 📁 File Structure

### New Files to Create

```
src/domains/lifelock/1-daily/7-checkout/
├── ui/
│   ├── components/
│   │   ├── metrics/
│   │   │   ├── MeditationCard.tsx
│   │   │   ├── WorkoutCard.tsx
│   │   │   ├── NutritionCard.tsx
│   │   │   ├── DeepWorkCard.tsx
│   │   │   ├── ResearchCard.tsx
│   │   │   └── SleepCard.tsx
│   │   ├── state/
│   │   │   └── StateSnapshot.tsx
│   │   ├── reflection/
│   │   │   └── ReflectionSection.tsx
│   │   └── planning/
│   │       ├── TomorrowPlan.tsx
│   │       └── AccountabilityCard.tsx
│   ├── types/
│   │   └── checkout.types.ts
│   └── pages/
│       └── NightlyCheckoutSection.tsx (refactored)
└── domain/
    └── checkoutCalculations.ts (alignment score, etc.)
```

---

## 🧪 Testing Strategy

### Unit Tests
- Each metric card component
- Calculation functions (alignment score)
- Data validation

### Integration Tests
- Data flow from UI to Supabase
- Auto-save functionality
- Progress tracking accuracy

### E2E Tests
- Complete checkout flow
- All 6 metrics filled
- Save and verify persistence

---

## 🚀 Launch Checklist

- [ ] All components built
- [ ] Data migration script (if needed)
- [ ] Supabase schema updated
- [ ] All tests passing
- [ ] Mobile responsive
- [ ] Accessibility checked
- [ ] Performance acceptable (<3s load)
- [ ] User testing complete
- [ ] Documentation updated

---

## 📈 Post-Launch

### Phase 7: Analytics & Insights (Future)
- Weekly alignment score trends
- Pattern correlation (e.g., meditation vs mood)
- Streak tracking
- Achievement badges

### Phase 8: Optimization (Future)
- Reduce checkout time to <10 minutes
- Smart defaults based on history
- Voice input integration
- Quick-add shortcuts

---

## 🔗 Dependencies

- [x] Existing Supabase integration
- [x] Clerk auth
- [x] UI components (shadcn/ui)
- [x] Framer Motion (animations)
- [x] date-fns (date formatting)

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | High | Backup existing data, test migration thoroughly |
| Performance degradation | Medium | Lazy loading, code splitting |
| User adoption friction | Medium | Progressive rollout, tutorials |
| Mobile UX issues | Medium | Extensive mobile testing |

---

## 📝 Notes

- Keep the checkout flow simple and fast
- Auto-save everything with debouncing
- Show progress clearly
- Make it feel rewarding, not like homework
- Use the existing purple theme consistently

---

**Next Steps:**

1. ✅ Review and approve this plan
2. ⏳ Create Kanban tasks for each phase
3. ⏳ Start Phase 1 execution
4. ⏳ Track progress in Blackbox memory
