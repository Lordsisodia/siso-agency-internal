# SISO Internal - Tech Stack & Code Conventions

## Tech Stack
- **Frontend**: React 18.3.1 + TypeScript 5.5.3 + Vite 5.4.1
- **Backend**: Node.js + Express + Supabase (PostgreSQL)
- **Database**: Supabase (PostgreSQL production / SQLite development)
- **Styling**: Tailwind CSS 3.4.11 + shadcn/ui components
- **Forms**: React Hook Form 7.53.0 + Zod 3.23.8 validation
- **Animations**: Framer Motion 12.23.12
- **Icons**: Lucide React 0.474.0
- **Components**: Radix UI primitives
- **State Management**: Jotai 2.12.3
- **Authentication**: Supabase Auth + Clerk
- **Testing**: Vitest (configured)
- **Charts**: Recharts 2.12.7

## Code Conventions & Standards

### TypeScript Standards
- **Strict mode enabled** - NO `any` types allowed
- **Proper type definitions** in src/types/
- **Interface definitions** for all data structures
- **Type safety** prioritized throughout codebase

### Code Style
- **ESLint** configuration with React hooks rules
- **Prettier** formatting (implicit)
- **File naming**: PascalCase for components, camelCase for utilities
- **Import aliases**: @/ for src/, @/internal, @/client, @/shared paths configured

### Component Patterns
- **Compound components pattern** (following Radix UI)
- **Error boundaries** implemented
- **Loading and error states** included
- **Accessibility guidelines** (WCAG 2.1 AA compliance)
- **Lazy loading** for route components to optimize performance

### Security Requirements
- **Input validation** with Zod schemas - NEVER trust user input
- **Parameterized queries** (Prisma handles this)
- **CSRF protection** implemented
- **JWT tokens** with proper expiration
- **Role-based access control**

### File Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Route components  
├── hooks/         # Custom React hooks
├── services/      # API calls and business logic
├── types/         # TypeScript definitions
├── utils/         # Helper functions
├── shared/        # Shared utilities and UI
├── ecosystem/     # Feature-based modules
├── core/          # Core services
└── integrations/  # External service integrations
```

### Testing Requirements
- **Jest + React Testing Library** configured
- **ALWAYS write tests** for new features
- **Test coverage** expected for critical workflows
- **Accessibility compliance** testing required