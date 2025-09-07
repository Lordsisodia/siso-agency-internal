# LifeLock Tab Routing Guide

## 🚨 CRITICAL: Preventing Tab Routing Breakage

This guide ensures tab routing stays consistent and prevents the bugs we fixed.

## Architecture Overview

```
TabLayoutWrapper.tsx (UI) ← → AdminLifeLock.tsx (Logic)
                ↓
        ai-first/core/tab-config.ts
           (Single Source of Truth)
```

## How to Add/Modify Tabs

### ✅ CORRECT Process:

1. **Update the central configuration** in `ai-first/core/tab-config.ts`
2. **Add the switch case** in `src/pages/AdminLifeLock.tsx` 
3. **Import the required component**
4. **Run tests** to verify everything works
5. **Check the console** for validation messages

### ❌ NEVER Do This:
- Modify tab IDs directly in TabLayoutWrapper.tsx
- Add switch cases without updating tab-config.ts
- Use string literals instead of the TabId type
- Skip the validation checks

## Current Tab Configuration

| Tab ID | Component | Description |
|--------|-----------|-------------|
| `morning` | `MorningRoutineSection` | Morning routine and planning |
| `light-work` | `LightFocusWorkSection` | Light work tasks |
| `work` | `DeepFocusWorkSection` | Deep focus work sessions |
| `wellness` | `HomeWorkoutSection + HealthNonNegotiablesSection` | Health and fitness |
| `timebox` | `TimeboxSection` | Time blocking and scheduling |
| `checkout` | `NightlyCheckoutSection` | Evening review |
| `ai-chat` | `VoiceCommandSection` | AI voice commands |

## Safety Mechanisms

### 1. **TypeScript Enforcement**
```typescript
// This will cause compile error if you miss a case
switch (activeTab as TabId) {
  case 'morning': return <Component />
  // TypeScript will error if you miss any TabId cases
  default: return assertExhaustive(activeTab); 
}
```

### 2. **Runtime Validation**
```typescript
// Development console will show missing tabs
if (process.env.NODE_ENV === 'development') {
  validateTabHandler(handledTabs); // Logs errors for missing cases
}
```

### 3. **Unit Tests**
```bash
npm test tab-config.test.ts
```

### 4. **URL Validation**
```typescript
// Invalid URLs like ?tab=ai will show error instead of crashing
if (!isValidTabId(activeTab)) {
  return <div className="text-red-500">Invalid tab: {activeTab}</div>;
}
```

## Common Mistakes and How to Avoid Them

### ❌ Bug: Tab ID Mismatch
```typescript
// TabLayoutWrapper has 'ai-chat' but switch has 'ai'
case 'ai': // WRONG - doesn't match 'ai-chat'
```

**✅ Solution:** Use centralized config and TypeScript types

### ❌ Bug: Missing Switch Cases
```typescript
// Added new tab to TabLayoutWrapper but forgot switch case
// User clicks tab → falls to default → wrong component
```

**✅ Solution:** Development validation catches this automatically

### ❌ Bug: Component Import Missing
```typescript
case 'wellness': return <WellnessSection />; // Component not imported
```

**✅ Solution:** TypeScript will error on undefined component

## Testing Your Changes

1. **Run the app in development**
2. **Check console for validation messages**
3. **Click every tab to ensure it loads correct component**
4. **Run unit tests**: `npm test tab-config`

## Emergency Recovery

If tabs break in production:

1. **Check browser console** for validation errors
2. **Compare tab-config.ts** with AdminLifeLock.tsx switch cases
3. **Look for typos** in tab IDs (common: 'ai' vs 'ai-chat')
4. **Verify imports** for all components

## Files to Keep in Sync

- `ai-first/core/tab-config.ts` (master configuration)
- `src/pages/AdminLifeLock.tsx` (switch statement)
- `ai-first/features/dashboard/components/TabLayoutWrapper.tsx` (UI)

## Validation Commands

```bash
# Run during development to catch issues early
npm run lint
npm test tab-config.test.ts
```

---

**💡 Remember**: The goal is to make it IMPOSSIBLE to break tab routing accidentally through TypeScript enforcement and runtime validation.