# ESLint Error Report - SISO Internal
**Generated:** 2025-10-16
**Total Errors:** 55
**Total Warnings:** 578

---

## 🔴 CRITICAL - Parsing Errors (Must Fix First - 8 errors)

These errors **break the build** and prevent TypeScript compilation:

### 1. Unterminated Template Literals (2 files)
**File:** `src/migration/admin-lifelock-migration-example.tsx`
- **Line 277:2** - Parsing error: Unterminated template literal
- **Action:** Close the template literal with backtick

**File:** `src/migration/hook-refactoring-migration-example.tsx`
- **Line 318:2** - Parsing error: Unterminated template literal
- **Action:** Close the template literal with backtick

### 2. Missing Parenthesis/Bracket
**File:** `src/ecosystem/internal/lifelock/views/daily/deep-work/components/DeepWorkTaskList.BACKUP.tsx`
- **Line 736:6** - Parsing error: ')' expected
- **Action:** Add missing closing parenthesis

**File:** `src/ecosystem/internal/lifelock/views/daily/light-work/components/LightWorkTaskList.BACKUP.tsx`
- **Line 914:14** - Parsing error: Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
- **Action:** Add missing closing brace

### 3. Property/Signature Errors
**File:** `src/future-features/utils/compression.ts`
- **Line 17:2** - Parsing error: Property or signature expected
- **Action:** Fix TypeScript interface/type definition

**File:** `src/shared/types/ai-chat.types.ts`
- **Line 67:0** - Parsing error: Declaration or statement expected
- **Action:** Fix TypeScript declaration syntax

---

## ⚠️ HIGH PRIORITY - React Hooks Violations (28 errors)

These violate React's Rules of Hooks and can cause runtime bugs:

### Conditional useImplementation Hook Calls

#### File: `src/ecosystem/internal/lifelock/views/daily/_shared/components/task/TaskStatsGrid.tsx`
- **Line 39:27** - useImplementation called conditionally
- **Line 55:27** - useImplementation called conditionally
- **Line 71:27** - useImplementation called conditionally
**Fix:** Move hook calls to top of component, use conditional rendering instead

#### File: `src/ecosystem/internal/tasks/management/TaskStatsGrid.tsx`
- **Line 39:27** - useImplementation called conditionally
- **Line 55:27** - useImplementation called conditionally
- **Line 71:27** - useImplementation called conditionally
**Fix:** Move hook calls to top of component

#### File: `src/ecosystem/internal/tasks/ui/MobileTodayCard.tsx`
- **Line 90:9** - useImplementation called conditionally
- **Line 106:10** - useImplementation called conditionally
- **Line 216:27** - useImplementation called conditionally
**Fix:** Restructure component to call hooks unconditionally

#### File: `src/pages/AppPlan.tsx`
- **Line 238:12** - useImplementation called conditionally
- **Line 299:25** - useImplementation called conditionally
- **Line 313:28** - useImplementation called conditionally
- **Line 339:34** - useImplementation called conditionally
- **Line 355:37** - useImplementation called conditionally
**Fix:** Refactor to call all hooks at component top level

#### File: `src/pages/planning/AppPlan.tsx`
- **Line 238:12** - useImplementation called conditionally
- **Line 299:25** - useImplementation called conditionally
- **Line 313:28** - useImplementation called conditionally
- **Line 339:34** - useImplementation called conditionally
- **Line 355:37** - useImplementation called conditionally
**Fix:** Same as above - refactor hook calls

#### File: `src/ecosystem/internal/projects/features/FeatureDetailsModal.tsx`
- **Line 231:12** - useImplementation called conditionally
- **Line 246:12** - useImplementation called conditionally
**Fix:** Move hooks to top level

### Hooks Called Inside Callbacks

#### File: `src/pages/StatsGrid.tsx`
- **Line 76:24** - useImplementation cannot be called inside a callback
**Fix:** Move hook call outside the callback function

#### File: `src/pages/dashboard/components/StatsGrid.tsx`
- **Line 76:24** - useImplementation cannot be called inside a callback
**Fix:** Move hook call outside the callback function

### Conditional useEffect

#### File: `src/ecosystem/internal/projects/features/FeatureDetailsModal.tsx`
- **Line 32:3** - React Hook "useEffect" is called conditionally
**Fix:** Move useEffect to top of component before any conditional returns

---

## 🟡 MEDIUM PRIORITY - TypeScript Issues (5 errors)

### @ts-ignore → @ts-expect-error Migration

**File:** `src/services/automation/ClaudeCodeIntegration.ts`
- **Line 1:1** - Use "@ts-expect-error" instead of "@ts-ignore"
**Fix:** Replace `// @ts-ignore` with `// @ts-expect-error`

**File:** `src/shared/utils/financial/bulkExpenseSeeder.ts`
- **Line 169:3** - Use "@ts-expect-error" instead of "@ts-ignore"
**Fix:** Replace `// @ts-ignore` with `// @ts-expect-error`

### Function Type Too Broad

**File:** `src/ecosystem/internal/tasks/types/task.types.ts`
- **Line 285:11** - The `Function` type accepts any function-like value
- **Line 286:14** - The `Function` type accepts any function-like value
**Fix:** Use specific function signature instead of `Function` type:
```typescript
// Bad
type Handler = Function;

// Good
type Handler = (arg: string) => void;
```

---

## 🟢 LOW PRIORITY - Code Quality (14 errors)

### require() → import Migration

**File:** `src/services/automation/ClaudeCodeIntegration.ts`
- **Line 6:24** - A `require()` style import is forbidden
**Fix:** Replace `const x = require('module')` with `import x from 'module'`

**File:** `src/shared/services/tab-config-new.ts`
- **Line 174:28** - A `require()` style import is forbidden
**Fix:** Use ES6 import syntax

### Empty Block Statements

**File:** `src/services/mcp/desktop-commander-client.ts`
- **Line 241:48** - Empty block statement
**Fix:** Add TODO comment or remove empty catch block

**File:** `src/services/mcp/mcp-middleware.ts`
- **Line 389:15** - Empty block statement
**Fix:** Add error handling or remove empty block

### Unnecessary Escape Characters in Regex

**File:** `src/services/mcp/mcp-middleware.ts`
- **Line 114:53** - Unnecessary escape character: `\/`
**Fix:** Remove backslash: use `/` instead of `\/` in regex

**File:** `src/services/mcp/unified-mcp-client.ts`
- **Line 100:79** - Unnecessary escape character: `\-`
- **Line 100:106** - Unnecessary escape character: `\-`
- **Line 100:132** - Unnecessary escape character: `\-`
- **Line 100:164** - Unnecessary escape character: `\-`
**Fix:** Remove backslash from hyphens in character classes: `[-]` → `[-]`

**File:** `src/shared/hooks/useTimeBlocks.ts`
- **Line 276:31** - Unnecessary escape character: `\*`
- **Line 276:33** - Unnecessary escape character: `\+`
**Fix:** Remove backslash from `*` and `+` in regex

### Constant Binary Expressions

**File:** `src/services/integrations/voiceService.ts`
- **Line 70:12** - Unexpected constant truthiness on left-hand side of `&&`
**Fix:** Remove always-true condition from && expression

**File:** `src/services/voice/voice.service.ts`
- **Line 83:12** - Unexpected constant truthiness on left-hand side of `&&`
**Fix:** Remove always-true condition

### Object.prototype.hasOwnProperty

**File:** `src/shared/hooks/useTimeBlocks.ts`
- **Line 186:27** - Do not access Object.prototype method 'hasOwnProperty' from target object
- **Line 186:62** - Do not access Object.prototype method 'hasOwnProperty' from target object
**Fix:** Replace `obj.hasOwnProperty(key)` with `Object.prototype.hasOwnProperty.call(obj, key)`

### Unused Expressions

**File:** `src/ecosystem/internal/projects/features/FeatureDetailsModal.tsx`
- **Line 724:31** - Expected assignment or function call instead of expression
**Fix:** Remove unused expression or assign it

**File:** `src/shared/types/ai-chat.types.ts` (likely in React component at end of file)
- **Line 192:5** - Expected assignment or function call
- **Line 198:7** - Expected assignment or function call
**Fix:** Add missing return statement or assignment

### Other Issues

**File:** `src/ecosystem/internal/admin/navigation/adminNavigationData.ts`
- **Line 5:32** - Shadowing of global property 'Infinity'
**Fix:** Rename variable from `Infinity` to `infiniteValue` or similar

**File:** `src/services/mcp/mcp-cache.ts`
- **Line 219:5** - Unnecessary try/catch wrapper
**Fix:** Remove try/catch if it just re-throws the error

**File:** `src/shared/hooks/useFeatures.ts`
- **Line 103:13** - Unexpected constant condition
**Fix:** Remove always-true condition from if statement

---

## 📋 Recommended Fix Order

1. **FIRST:** Fix all parsing errors (8 files) - these prevent compilation
2. **SECOND:** Fix React Hooks violations (10 files) - these cause runtime bugs
3. **THIRD:** Fix TypeScript issues (3 files) - improve type safety
4. **FOURTH:** Fix code quality issues (8 files) - cleanup and best practices

## 🔧 Quick Fixes Available

ESLint reports that **1 warning** can be auto-fixed with `npm run lint -- --fix`

## 📊 Summary by Category

| Category | Count | Priority |
|----------|-------|----------|
| Parsing Errors | 8 | 🔴 Critical |
| React Hooks Violations | 28 | ⚠️ High |
| TypeScript Issues | 5 | 🟡 Medium |
| Code Quality | 14 | 🟢 Low |
| **TOTAL ERRORS** | **55** | |

---

## 🤖 For Codex: Automated Fix Script

To fix these systematically, use this approach:

```bash
# 1. Fix parsing errors first
# Manually review and fix template literals and syntax errors in:
# - src/migration/admin-lifelock-migration-example.tsx:277
# - src/migration/hook-refactoring-migration-example.tsx:318
# - src/ecosystem/internal/lifelock/views/daily/deep-work/components/DeepWorkTaskList.BACKUP.tsx:736
# - src/ecosystem/internal/lifelock/views/daily/light-work/components/LightWorkTaskList.BACKUP.tsx:914
# - src/future-features/utils/compression.ts:17
# - src/shared/types/ai-chat.types.ts:67

# 2. Run auto-fix for simple issues
npm run lint -- --fix

# 3. Fix React Hooks manually (no auto-fix available)
# Pattern: Move all hooks to top of component, before any conditional returns

# 4. Verify all errors resolved
npm run lint
```

---

**End of Report**
