# Standardized Subfolder Internal Structure

## Problem

Current domain subfolders lack consistent internal structure. Some have `ui/components`, some have `ui/pages`, some have both, and organization varies widely.

## Standard Subfolder Structure Template

Every numbered section or feature should follow this consistent pattern:

```
<domain>/
├── <section-or-feature>/           # e.g., 1-morning-routine, 1-discover, features/task-management
│   ├── docs/                      # Section-specific documentation
│   │   ├── README.md              # Overview of this section
│   │   └── IMPLEMENTATION.md      # Implementation notes
│   ├── domain/                    # Business logic and core types
│   │   ├── types/                 # TypeScript types
│   │   │   ├── index.ts
│   │   │   └── <feature>.types.ts
│   │   ├── utils/                 # Utility functions
│   │   │   ├── index.ts
│   │   │   └── helpers.ts
│   │   ├── config/                # Configuration constants
│   │   │   └── constants.ts
│   │   ├── services/              # External service integrations
│   │   │   └── api.service.ts
│   │   └── <business-logic>.ts    # Core business logic
│   ├── hooks/                     # React hooks
│   │   ├── use<Feature>.ts         # Feature-specific hooks
│   │   └── index.ts
│   ├── ui/                        # UI components
│   │   ├── pages/                 # Page-level components
│   │   │   ├── <Section>Page.tsx   # Main page for this section
│   │   │   └── index.ts
│   │   └── components/            # Reusable components
│   │       ├── <Feature>Card.tsx   # Feature cards
│   │       ├── <Feature>List.tsx   # Feature lists
│   │       ├── <Feature>Form.tsx   # Feature forms
│   │       ├── <Feature>Modal.tsx  # Feature modals
│   │       ├── <Feature>Header.tsx # Feature headers
│   │       ├── <Feature>Footer.tsx # Feature footers
│   │       └── index.ts
│   ├── features/                  # Sub-features (if applicable)
│   │   └── <sub-feature>/         # Follows same pattern recursively
│   ├── __tests__/                 # Co-located tests
│   │   ├── <feature>.test.ts
│   │   └── helpers.test.ts
│   └── index.ts                   # Barrel exports for this section
```

## Examples

### Example 1: Morning Routine (Complete Structure)

```
1-morning-routine/
├── docs/
│   ├── README.md
│   └── IMPLEMENTATION.md
├── domain/
│   ├── types/
│   │   ├── index.ts
│   │   └── morning-routine.types.ts
│   ├── utils/
│   │   ├── index.ts
│   │   └── progress.ts
│   ├── config/
│   │   └── constants.ts
│   ├── services/
│   │   └── ai/
│   │       └── gpt5.service.ts
│   └── xp/
│       ├── calculations.ts
│       └── multipliers.ts
├── hooks/
│   ├── useMorningRoutine.ts
│   └── index.ts
├── ui/
│   ├── pages/
│   │   ├── MorningRoutinePage.tsx
│   │   └── index.ts
│   └── components/
│       ├── trackers/
│       │   ├── WakeUpTracker.tsx
│       │   ├── WaterTracker.tsx
│       │   └── index.ts
│       ├── planning/
│       │   ├── PlanDayActions.tsx
│       │   └── index.ts
│       └── index.ts
├── features/
│   └── ai-thought-dump/
│       └── [follows same pattern]
├── __tests__/
│   └── xpCalculations.test.ts
└── index.ts
```

### Example 2: Projects/1-Discover (Minimal Structure)

```
1-discover/
├── docs/
│   └── README.md
├── domain/
│   ├── types/
│   │   └── project.types.ts
│   └── config/
│       └── constants.ts
├── hooks/
│   ├── useProjects.ts
│   └── index.ts
├── ui/
│   ├── pages/
│   │   ├── DiscoverPage.tsx
│   │   └── index.ts
│   └── components/
│       ├── ProjectCard.tsx
│       ├── ProjectDirectoryCard.tsx
│       └── index.ts
└── index.ts
```

### Example 3: Tasks/Features/Task-Management (Feature Structure)

```
task-management/
├── docs/
│   └── README.md
├── domain/
│   ├── types/
│   │   └── task.types.ts
│   ├── api/
│   │   └── taskApi.ts
│   └── validators/
│       └── taskValidator.ts
├── hooks/
│   ├── useTaskCRUD.ts
│   ├── useTaskFiltering.ts
│   └── index.ts
├── ui/
│   ├── pages/
│   │   ├── TaskManagementPage.tsx
│   │   └── index.ts
│   └── components/
│       ├── TaskCard.tsx
│       ├── TaskList.tsx
│       ├── TaskForm.tsx
│       ├── TaskModal.tsx
│       └── index.ts
└── index.ts
```

## Rules

1. **Always have these folders** (even if empty):
   - `docs/` - Documentation
   - `domain/types/` - Type definitions
   - `hooks/` - Custom hooks
   - `ui/pages/` - Page components
   - `ui/components/` - Reusable components
   - `index.ts` - Barrel exports

2. **Add these when needed**:
   - `domain/utils/` - Helper functions
   - `domain/config/` - Configuration
   - `domain/services/` - External services
   - `features/` - Sub-features (recursive pattern)
   - `__tests__/` - Tests

3. **Naming conventions**:
   - Pages: `<Feature>Page.tsx`
   - Components: `<Feature><Type>.tsx` (e.g., TaskCard, UserList)
   - Hooks: `use<Feature>.ts` (e.g., useTasks, useAuth)
   - Types: `<feature>.types.ts` (e.g., task.types.ts)
   - Tests: `<feature>.test.ts`

4. **Barrel exports**:
   - Every folder should have an `index.ts` that exports its contents
   - This enables clean imports like `import { X } from '@/domains/...'`

5. **Minimal structure** for very simple sections:
   - Can omit `domain/utils/`, `domain/config/`, `domain/services/`, `__tests__/`
   - Must keep `docs/`, `domain/types/`, `hooks/`, `ui/pages/`, `ui/components/`

## Migration Strategy

1. Create missing folders
2. Move files to correct locations
3. Create index.ts barrel exports
4. Update imports
5. Create README.md for docs/ folder
6. Remove old empty folders

## Benefits

- **Predictability**: Developers know exactly where to find files
- **Consistency**: Same structure everywhere reduces cognitive load
- **Scalability**: Easy to add new sections or features
- **Clarity**: Clear separation of concerns
- **Testability**: Tests co-located with code
- **Documentation**: Every section has docs folder
