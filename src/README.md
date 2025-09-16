# SISO Internal - Intelligent 8-Directory Structure

## 📁 Directory Purpose & Organization

### `/app/` - Core Application Logic
- App.tsx, main.tsx, routing, global providers
- Authentication, core layout components
- Global error boundaries and app shell

### `/pages/` - Route Components Only
- One file per route (no nested directories)
- Clean imports from features and components
- Route-specific logic only

### `/components/` - Reusable UI Components
- `/ui/` - Basic UI primitives (buttons, inputs, modals)
- `/layout/` - Layout components (headers, sidebars, etc.)
- `/forms/` - Form components and patterns

### `/features/` - Business Domain Logic
- `/tasks/` - All task-related functionality
- `/lifelock/` - All lifelock/daily workflow features  
- `/admin/` - Admin dashboard and analytics
- `/auth/` - Authentication features
- Each feature is self-contained with components, hooks, utils

### `/services/` - External Integrations
- API calls, database operations
- Third-party service integrations
- Utilities for external systems

### `/shared/` - Cross-Feature Utilities
- `/hooks/` - Reusable custom hooks
- `/utils/` - Utility functions
- `/constants/` - App constants and configs
- `/providers/` - React providers and contexts

### `/types/` - TypeScript Definitions
- Global type definitions
- Database types
- API response types

### `/assets/` - Static Files
- Images, icons, fonts
- Static configuration files

## 🎯 Design Principles
- **Business Logic in Features**: Domain-specific code stays together
- **Reusable UI in Components**: Shared across features
- **One Route Per Page**: No nested page directories
- **Self-Contained Features**: Each feature has its own components/hooks/utils
- **Clear Dependencies**: Features can import from shared, not each other