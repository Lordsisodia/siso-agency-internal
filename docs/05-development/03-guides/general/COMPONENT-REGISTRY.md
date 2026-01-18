# Component Registry - SISO Internal

> **Generated**: 2025-10-04
> **Total Files**: 3,036 TypeScript files
> **Purpose**: Single source of truth for all components to prevent duplication

## 🎯 Registry Purpose

This registry documents all components in the SISO Internal codebase to:
1. **Prevent Duplication**: Know what exists before creating new components
2. **Enable Discovery**: Find the right component for your use case
3. **Track Canonical Versions**: Identify which file is the source of truth
4. **Guide Consolidation**: Track duplicate removal progress

## 📊 Duplication Status

### Critical Duplicates (6+ instances)
| Component | Count | Status | Canonical Location |
|-----------|-------|--------|-------------------|
| index | 27 | ⚠️ Needs Review | Multiple barrel exports |
| types | 18 | ⚠️ Needs Review | Type definitions scattered |
| AdminTasks | 8 | 🔄 Phase 1 Done | `/ecosystem/internal/admin/dashboard/AdminTasks.tsx` |
| SubtaskItem | 7 | 🔴 Not Started | TBD |
| PartnerLeaderboard | 7 | 🔴 Not Started | TBD |
| AdminDashboard | 7 | 🔴 Not Started | TBD |
| TodosCell | 6 | 🔴 Not Started | TBD |
| TodoList | 6 | 🔴 Not Started | TBD |
| TaskView | 6 | 🔴 Not Started | TBD |
| TaskTable | 6 | 🔴 Not Started | TBD |
| TaskManager | 6 | 🔴 Not Started | TBD |
| TaskHeader | 6 | 🔴 Not Started | TBD |
| TaskFilterSidebar | 6 | 🔴 Not Started | TBD |
| TaskDetailDrawer | 6 | 🔴 Not Started | TBD |
| TaskBank | 6 | 🔴 Not Started | TBD |
| SavedViewsManager | 6 | 🔴 Not Started | TBD |
| QuickActions | 6 | 🔴 Not Started | TBD |
| ProjectTaskBoard | 6 | 🔴 Not Started | TBD |
| ProjectBasedTaskDashboard | 6 | 🔴 Not Started | TBD |
| InteractiveTaskItem | 6 | 🔴 Not Started | TBD |
| IntelligentTaskDashboard | 6 | 🔴 Not Started | TBD |
| ImportProgress | 6 | 🔴 Not Started | TBD |
| FocusSessionTimer | 6 | 🔴 Not Started | TBD |
| ExpensesTableHeader | 6 | 🔴 Not Started | TBD |
| ExpensesTable | 6 | 🔴 Not Started | TBD |
| CustomTaskInput | 6 | 🔴 Not Started | TBD |
| BottomNavigation | 6 | 🔴 Not Started | TBD |
| AdminPartnershipLeaderboard | 6 | 🔴 Not Started | TBD |
| AdminPartnershipDashboard | 6 | 🔴 Not Started | TBD |
| AITaskChat | 6 | 🔴 Not Started | TBD |

## 🗂️ Directory Structure

### `/ecosystem/` - Domain-driven business logic
```
/ecosystem/
├── /internal/          # Internal operations
│   ├── /admin/         # Admin domain
│   ├── /lifelock/      # LifeLock domain (primary)
│   ├── /tasks/         # Tasks domain
│   └── /plan/          # Planning domain
├── /external/          # External integrations
│   └── /partnerships/  # Partnership data views
└── /client/            # Client-facing features
    └── /portfolio/     # Portfolio management
```

### `/features/` - Feature-based organization
```
/features/
├── /admin/             # Admin features
├── /tasks/             # Task features
├── /partnerships/      # Partnership features
└── /lifelock/          # LifeLock features
```

### `/components/` - Shared UI components
```
/components/
├── /layout/            # Layout components
├── /tasks/             # Task-related components
├── /ui/                # Base UI components
└── /data-tables/       # Table components
```

### `/shared/` - Shared utilities and UI
```
/shared/
├── /ui/                # shadcn/ui components
├── /lib/               # Utility functions
└── /hooks/             # Shared React hooks
```

### `/pages/` - Top-level page components
```
/pages/
├── /admin/             # Admin pages
└── /*.tsx              # Route pages
```

## 📋 Component Categories

### Admin Components (Dashboard & Management)

#### AdminTasks (8 instances - CONSOLIDATED)
- ✅ **Canonical**: `/ecosystem/internal/admin/dashboard/AdminTasks.tsx` (137 lines)
  - Dashboard widget showing priority tasks
  - Used by: Admin Dashboard
- ✅ **Canonical**: `/pages/admin/AdminTasks.tsx` (304 lines)
  - Full page view of all tasks
  - Used by: Admin routes
- ✅ **Canonical**: `/ecosystem/internal/admin/dashboard/pages/AdminTasks.tsx` (1,334 lines)
  - Unique comprehensive task view
- ✅ **Canonical**: `/ecosystem/internal/pages/AdminTasks.tsx` (18 lines)
  - App.tsx wrapper component
- 🔄 **Redirect**: `/ecosystem/internal/admin/dashboard/components/AdminTasks.tsx`
- 🔄 **Redirect**: `/features/admin/dashboard/AdminTasks.tsx`
- 🔄 **Redirect**: `/features/admin/dashboard/components/AdminTasks.tsx`
- 🔄 **Redirect**: `/pages/AdminTasks.tsx`

#### AdminDashboard (7 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### AdminPartnershipDashboard (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### AdminPartnershipLeaderboard (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

### Task Components

#### TaskView (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### TaskTable (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### TaskManager (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### TaskHeader (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### TaskFilterSidebar (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### TaskDetailDrawer (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### TaskBank (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### SubtaskItem (7 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### InteractiveTaskItem (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### CustomTaskInput (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

### Dashboard Components

#### ProjectTaskBoard (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### ProjectBasedTaskDashboard (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### IntelligentTaskDashboard (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

### Partnership Components

#### PartnerLeaderboard (7 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

### LifeLock Components

#### FocusSessionTimer (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

### Todo Components

#### TodosCell (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### TodoList (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

### Utility Components

#### SavedViewsManager (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### QuickActions (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### ImportProgress (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### BottomNavigation (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

### Financial Components

#### ExpensesTableHeader (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

#### ExpensesTable (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

### AI Components

#### AITaskChat (6 instances)
- 🔴 **Status**: Not analyzed
- **Locations**: TBD

## 🔍 Usage Guidelines

### Before Creating a Component

1. **Search This Registry**: Check if component already exists
2. **Check Import Analysis**: See COMPREHENSIVE-DUPLICATION-ANALYSIS.md
3. **Verify Canonical Location**: Use the canonical version
4. **Use Barrel Exports**: Import from domain index when available

### When Finding Duplicates

1. **Identify Canonical**: Which version is actively used?
2. **Analyze Differences**: Are they truly identical?
3. **Create Redirect**: Convert duplicates to re-exports
4. **Update Registry**: Mark status as consolidated
5. **Test Thoroughly**: Ensure all imports still work

### Component Location Decision Tree

```
Is it domain-specific business logic?
├── YES → /ecosystem/[domain]/
│   └── Is it a page/route?
│       ├── YES → /ecosystem/[domain]/pages/
│       └── NO → /ecosystem/[domain]/ui/ or /ecosystem/[domain]/components/
└── NO → Is it shared UI?
    ├── YES → /shared/ui/ (if shadcn) or /components/ui/
    └── NO → Is it feature-specific?
        ├── YES → /features/[feature]/
        └── NO → /components/[category]/
```

## 📦 Barrel Exports (Phase 1.3 Complete)

### Domain Exports Available
```typescript
// Admin Domain
import { AdminTasks, AdminDashboard, AdminFocusTimer } from '@/ecosystem/internal/admin';

// LifeLock Domain
import { LifeLockFocusTimer, DeepFocusSection } from '@/ecosystem/internal/lifelock';

// Tasks Domain
import { TaskView, TaskManager, SubtaskItem, TaskFocusTimer } from '@/ecosystem/internal/tasks';

// Master Internal Export (all domains)
import { AdminTasks, LifeLockFocusTimer, TaskView } from '@/ecosystem/internal';
```

### Benefits
- ✅ Single import path per domain
- ✅ Prevents duplicate imports
- ✅ Easier refactoring
- ✅ Clear component ownership

## 📈 Consolidation Progress

### Phase 1: Emergency Triage ✅ (Complete)
- ✅ Phase 1.1: AdminTasks - 4 redirects created
- ✅ Phase 1.2: Component Registry created
- ✅ Phase 1.3: Barrel exports for 3 domains

### Phase 2: Top 20 Consolidation 🔄 (0/29 complete)
- 🔴 SubtaskItem: 7 instances
- 🔴 PartnerLeaderboard: 7 instances
- 🔴 AdminDashboard: 7 instances
- 🔴 29 components with 6 instances each
- **Total**: 0% complete

### Phase 3: Medium Priority 🔜
- Components with 3-5 instances
- Estimated: 150+ components

### Phase 4: Architecture Enforcement 🔜
- Prevent future duplicates
- Component registry integration
- Pre-commit validation

## 🛡️ Prevention System

### Planned Features
1. **Pre-commit Hook**: Check for duplicate component names
2. **Component Generator**: CLI tool using registry
3. **Import Linter**: Warn on non-canonical imports
4. **Auto-redirect**: Convert old imports to new locations

### Registry Maintenance
- **Update on Create**: Every new component must be registered
- **Update on Consolidate**: Mark duplicates as redirects
- **Weekly Audit**: Automated duplicate detection
- **Monthly Review**: Validate canonical locations

## 🔗 Related Documentation

- [COMPREHENSIVE-DUPLICATION-ANALYSIS.md](COMPREHENSIVE-DUPLICATION-ANALYSIS.md) - Full audit results
- [BMAD-CONSOLIDATION-PLAN.md](BMAD-CONSOLIDATION-PLAN.md) - Consolidation strategy
- [PHASE1-EXECUTION-PLAN.md](PHASE1-EXECUTION-PLAN.md) - Execution checklist

---

**Last Updated**: 2025-10-04
**Next Review**: After Phase 2 completion
**Maintained By**: Development Team
