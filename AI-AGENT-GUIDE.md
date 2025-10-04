# 🤖 AI Agent Guide - SISO Internal Codebase Navigation

> **For AI Assistants (Claude, ChatGPT, etc.) Editing This Codebase**

---

## ⚠️ CRITICAL RULES - READ FIRST

### **Rule #1: ALWAYS Check Component Registry Before Creating Files**
```bash
# Before creating ANY component, check:
cat COMPONENT-REGISTRY.md | grep -i "ComponentName"
```

If the component exists → **Edit the canonical version** (marked ✅ CANONICAL)
If it doesn't exist → **Follow location decision tree below**

### **Rule #2: NEVER Edit Redirect Files**
If you see this pattern:
```typescript
// 🔄 DUPLICATE REDIRECT
export { Component } from '@/canonical/location';
```

**STOP!** This is not the real file. Navigate to the canonical location and edit that instead.

### **Rule #3: Use Barrel Exports for Imports**
✅ **PREFER**: `import { AdminTasks } from '@/ecosystem/internal/admin'`
⚠️ **AVOID**: `import { AdminTasks } from '@/ecosystem/internal/admin/dashboard/AdminTasks'`
❌ **NEVER**: Create your own duplicate with a different name

---

## 📍 Component Location Decision Tree

### **Step 1: What Type of Component?**

```
Is this component business logic specific to a domain?
├── YES → Go to Step 2 (Domain Logic)
└── NO → Go to Step 3 (Shared Components)
```

### **Step 2: Domain Logic - Where in the domain?**

```
/ecosystem/internal/[domain]/
│
├── Is it a full page/route?
│   └── YES → /ecosystem/internal/[domain]/pages/ComponentName.tsx
│
├── Is it a major workflow section?
│   └── YES → /ecosystem/internal/[domain]/sections/ComponentName.tsx
│
├── Is it domain-specific UI?
│   └── YES → /ecosystem/internal/[domain]/ui/ComponentName.tsx
│
├── Is it a reusable domain component?
│   └── YES → /ecosystem/internal/[domain]/components/ComponentName.tsx
│
└── Is it a React hook?
    └── YES → /ecosystem/internal/[domain]/hooks/useComponentName.ts
```

**Available Domains**:
- `admin` - Admin dashboard, client management
- `lifelock` - LifeLock workflows (PRIMARY DOMAIN)
- `tasks` - Task management system
- `partnerships` - Partnership data views

### **Step 3: Shared Components - Is it truly reusable?**

```
Is this a shadcn/ui primitive (button, dialog, card)?
├── YES → /shared/ui/component-name.tsx
└── NO → Is it used across multiple domains?
    ├── YES → /shared/components/ComponentName.tsx
    └── NO → Go back to Step 2 (it's probably domain-specific)
```

---

## 📦 Import Patterns - What to Use

### **✅ Recommended Imports (Use These!)**

```typescript
// Domain barrel exports (BEST)
import { AdminTasks, AdminDashboard } from '@/ecosystem/internal/admin';
import { LifeLockFocusTimer, DeepFocusSection } from '@/ecosystem/internal/lifelock';
import { TaskView, TaskManager, SubtaskItem } from '@/ecosystem/internal/tasks';

// Master internal export (GOOD)
import { AdminTasks, LifeLockFocusTimer } from '@/ecosystem/internal';

// Shared UI (ALWAYS OK)
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
```

### **⚠️ Acceptable Imports (But Check Registry First)**

```typescript
// Direct path imports (OK if barrel export doesn't exist yet)
import { Component } from '@/ecosystem/internal/domain/ui/Component';
```

### **❌ Avoid These Patterns**

```typescript
// DON'T import from /features/ if /ecosystem/ version exists
import { Component } from '@/features/admin/Component'; // ❌

// DON'T import from /components/ if domain version exists
import { Component } from '@/components/admin/Component'; // ❌

// DON'T use relative imports across domains
import { Component } from '../../../ecosystem/internal/admin/Component'; // ❌
```

---

## 🔍 How to Find the Canonical Version

### **Method 1: Component Registry (FASTEST)**
```bash
# Search the registry
grep -i "TaskManager" COMPONENT-REGISTRY.md

# You'll see:
# #### TaskManager (6 instances)
# - 🟢 **Canonical**: /ecosystem/internal/tasks/components/TaskManager.tsx
```

### **Method 2: Check for Redirects**
```bash
# If you're in a file and see this comment:
// 🔄 DUPLICATE REDIRECT
// Canonical: src/ecosystem/internal/tasks/components/TaskManager.tsx

# Navigate to that canonical file instead
```

### **Method 3: Import Analysis**
```bash
# See which version is most imported
grep -r "from.*TaskManager" src --include="*.tsx" --include="*.ts"

# The version with the most imports is likely canonical
```

### **Method 4: Check Barrel Exports**
```bash
# Check if it's exported from a domain barrel
cat src/ecosystem/internal/tasks/index.ts

# If you see:
# export { TaskManager } from './components/TaskManager';
# Then that's the canonical version
```

---

## 🎯 Common Scenarios

### **Scenario 1: User Asks to "Add a Feature to TaskManager"**

❌ **DON'T**:
```typescript
// Create /components/TaskManagerV2.tsx
// Edit /features/tasks/TaskManager.tsx (might be a redirect!)
```

✅ **DO**:
```bash
1. Check registry: grep "TaskManager" COMPONENT-REGISTRY.md
2. Navigate to canonical: src/ecosystem/internal/tasks/components/TaskManager.tsx
3. Edit that file
4. Verify imports still work
```

### **Scenario 2: User Asks to "Create a New LifeLock Component"**

✅ **DO**:
```bash
1. Check registry: grep -i "ComponentName" COMPONENT-REGISTRY.md
2. If not found, determine location:
   - Page? → /ecosystem/internal/lifelock/pages/
   - Section? → /ecosystem/internal/lifelock/sections/
   - UI Component? → /ecosystem/internal/lifelock/ui/
3. Create file in correct location
4. Add export to /ecosystem/internal/lifelock/index.ts (barrel)
5. Update COMPONENT-REGISTRY.md
```

### **Scenario 3: Import Not Found After Edit**

**Debug Steps**:
```bash
1. Check if you edited a redirect file:
   head -5 [filename] # Look for "🔄 DUPLICATE REDIRECT"

2. If redirect, navigate to canonical:
   cat [filename] # See export statement for canonical location

3. Edit canonical file instead

4. Verify barrel export exists:
   cat src/ecosystem/internal/[domain]/index.ts
```

---

## 📝 When Creating New Components

### **Checklist**:
- [ ] Searched COMPONENT-REGISTRY.md (component doesn't exist)
- [ ] Determined correct domain (admin/lifelock/tasks/partnerships)
- [ ] Determined correct category (pages/sections/ui/components/hooks)
- [ ] Created file in correct location
- [ ] Added barrel export to domain index.ts
- [ ] Updated COMPONENT-REGISTRY.md with new entry
- [ ] Verified TypeScript compilation passes

### **Example: Creating New LifeLock Component**

```bash
# 1. Check registry
grep -i "FocusTimer" COMPONENT-REGISTRY.md
# ✅ FocusSessionTimer exists - don't create duplicate!

# If it didn't exist:
# 2. Create in correct location
touch src/ecosystem/internal/lifelock/ui/NewComponent.tsx

# 3. Add barrel export
echo "export { NewComponent } from './ui/NewComponent';" >> src/ecosystem/internal/lifelock/index.ts

# 4. Update registry
# (Add entry to COMPONENT-REGISTRY.md)

# 5. Test import works
# import { NewComponent } from '@/ecosystem/internal/lifelock';
```

---

## 🚫 Anti-Patterns to Avoid

### **❌ Creating Duplicate Files**
```typescript
// Bad: Creating parallel versions
/ecosystem/internal/admin/TaskManager.tsx
/features/admin/TaskManager.tsx  // ❌ DUPLICATE!
/components/tasks/TaskManager.tsx  // ❌ DUPLICATE!
```

### **❌ Editing Without Checking Registry**
```typescript
// Bad: Editing first file you find
// User: "Edit TaskManager"
// AI: *edits /features/admin/TaskManager.tsx*  // ❌ Might be redirect!
```

### **❌ Renaming to Avoid Conflicts**
```typescript
// Bad: Creating variants to avoid duplicates
TaskManager.tsx
TaskManagerV2.tsx  // ❌ BAD!
TaskManager_New.tsx  // ❌ BAD!
ImprovedTaskManager.tsx  // ❌ BAD!
```

**✅ Instead**: Edit the canonical version!

---

## 🎓 Understanding the Redirect Pattern

### **What is a Redirect File?**
A redirect file is a lightweight re-export that points to the canonical location:

```typescript
// 🔄 DUPLICATE REDIRECT
// This file was an exact duplicate (MD5: abc123...)
// Import from canonical location to maintain single source of truth.
//
// Canonical: src/ecosystem/internal/tasks/components/TaskManager.tsx
// Purpose: Main task management component with CRUD operations
// Lines: 456
//
// This redirect maintains backward compatibility while eliminating duplication.
// Phase 2 of consolidation - converting exact binary duplicates to redirects.

export { TaskManager } from '@/ecosystem/internal/tasks/components/TaskManager';
```

### **Why Use Redirects?**
1. **Backward Compatibility**: Old imports still work
2. **Zero Breaking Changes**: No need to update all import statements
3. **Clear Documentation**: Comments tell you where the real file is
4. **Easy Rollback**: Can revert redirect to full file if needed

### **How to Handle Redirects**
- ✅ **DO**: Follow the redirect to canonical location and edit that
- ✅ **DO**: Use the redirect for imports (it works fine)
- ❌ **DON'T**: Edit the redirect file itself
- ❌ **DON'T**: Delete redirects (they maintain backward compatibility)

---

## 📊 Quick Reference Tables

### **Domain → Purpose**
| Domain | Purpose | Example Components |
|--------|---------|-------------------|
| `admin` | Dashboard, client management | AdminDashboard, AdminTasks |
| `lifelock` | Daily workflows (PRIMARY) | FocusSessionTimer, DeepFocusSection |
| `tasks` | Task management | TaskManager, TaskView, SubtaskItem |
| `partnerships` | Partnership data views | PartnerLeaderboard |

### **Directory → Contents**
| Directory | What Goes Here | Example |
|-----------|----------------|---------|
| `/pages/` | Full page components (routes) | AdminLifeLockDay.tsx |
| `/sections/` | Major workflow sections | MorningRoutineSection.tsx |
| `/ui/` | Domain-specific UI components | FocusSessionTimer.tsx |
| `/components/` | Reusable domain components | TaskManager.tsx |
| `/hooks/` | React hooks | useLifeLockData.ts |
| `/config/` | Configuration files | admin-lifelock-tabs.ts |
| `/types/` | TypeScript types | types.ts |

### **Import Preference Order**
1. ✅ **Barrel export**: `from '@/ecosystem/internal/[domain]'`
2. ⚠️ **Direct path**: `from '@/ecosystem/internal/[domain]/ui/Component'`
3. ❌ **Cross-structure**: `from '@/features/...'` (if ecosystem version exists)

---

## 🆘 When in Doubt

### **Golden Rules**:
1. **Check the registry first** - COMPONENT-REGISTRY.md
2. **Follow the redirect** - Don't edit redirect files
3. **Use barrel exports** - `from '@/ecosystem/internal/[domain]'`
4. **Ask before creating** - Is this truly a new component?
5. **Update documentation** - Keep COMPONENT-REGISTRY.md current

### **Questions to Ask**:
- ❓ Does this component already exist? (Check registry)
- ❓ Which domain does this belong to? (admin/lifelock/tasks/partnerships)
- ❓ Is this a page, section, UI component, or hook?
- ❓ Am I editing a redirect file? (Check for 🔄 DUPLICATE REDIRECT)
- ❓ Have I updated the barrel export? (domain index.ts)

---

## 📚 Additional Resources

- [COMPONENT-REGISTRY.md](COMPONENT-REGISTRY.md) - Full component catalog
- [AI-NAVIGATION-IMPROVEMENTS.md](docs/guides/AI-NAVIGATION-IMPROVEMENTS.md) - Status and progress
- [BMAD-CONSOLIDATION-PLAN.md](docs/bmad-outputs/BMAD-CONSOLIDATION-PLAN.md) - Architecture strategy
- [PHASE1-COMPLETE.md](docs/completion-reports/PHASE1-COMPLETE.md) - What's been consolidated

---

**Last Updated**: October 4, 2025
**For**: All AI Assistants working on SISO Internal
**Maintained By**: Development Team
