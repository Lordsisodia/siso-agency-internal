# Tech Stack Analysis: User Profile

## Languages
- **TypeScript 5.5.3** - Primary language with strict type checking enabled
- **JavaScript/ES2022** - Runtime target with esbuild compilation
- **CSS** - Tailwind CSS with custom theme extensions

## Frameworks
- **React 18.3.1** - Core UI library with concurrent features
- **Vite 7.2.4** - Build tool and dev server (port 4249)
- **React Router DOM 6.26.2** - Client-side routing
- **Tauri 2.0.1** - Desktop application wrapper (optional)
- **PWA** - Progressive Web App support with offline capabilities

## Database/Storage
- **Supabase 2.49.4** - Primary backend with PostgreSQL
  - Row Level Security (RLS) policies configured
  - Typed client with custom table definitions
  - Real-time subscriptions available
- **Clerk 5.45.0** - Authentication provider
  - JWT token integration with Supabase
  - User ID mapping between Clerk and internal database
- **IndexedDB (idb 8.0.3)** - Client-side storage for offline support
- **Prisma 6.16.1** - Database ORM with generated types

## API Patterns
- **Next.js API Routes** pattern (though using Vite, not Next.js)
  - Route structure: `api/[resource]/route.ts`
  - Standardized response format: `{ success, data, error, timestamp }`
  - Authentication via `x-user-id` header
- **Express 5.1.0** - Local API server for development
- **Custom Vite API Plugin** - API route handling in development
- **TanStack React Query 5.56.2** - Data fetching and caching
- **Axios 1.12.2** - HTTP client library

## UI Components
- **Radix UI** - Comprehensive component library:
  - Avatar (@radix-ui/react-avatar 1.1.2)
  - Dialog, Dropdown, Select, Tabs, Popover
  - Form components: Label, Checkbox, Switch, Slider
  - Navigation: Navigation Menu, Menubar, Tabs
  - Feedback: Alert, Toast, Progress, Tooltip
  - Complex: Accordion, Collapsible, Scroll Area, Resizable
- **shadcn/ui** - Pre-built Radix components (inferred from patterns)
- **Tailwind CSS 3.4.11** - Utility-first styling
  - Custom theme with SISO brand colors
  - Dark mode support via class strategy
  - Custom animations and keyframes
- **Framer Motion 12.23.12** - Animation library
- **Lucide React 0.542.0** - Icon library
- **Recharts 2.12.7** - Charting library for analytics
- **React Hot Toast 2.5.1** - Toast notifications

## Form Handling
- **React Hook Form 7.53.0** - Form state management
- **Zod 3.23.8** - Schema validation
- **@hookform/resolvers 5.0.1** - Zod integration with React Hook Form
- **Pattern established**: Schema-first approach with validation
  - Example: ExpenseForm uses `z.object()` for type-safe validation
  - Form fields use `<FormField>` components with controlled inputs
  - Calendar integration via `react-day-picker 8.10.1`
  - Select components with custom options
  - Error handling with toast notifications

## State Management
- **Zustand 5.0.8** - Global state management
- **Jotai 2.12.3** - Atomic state management
- **TanStack React Query** - Server state management
- **React Context** - For component-level state

## Key Findings

1. **Comprehensive UI Component Library**: The codebase has a rich set of pre-built Radix UI components (avatar, card, form inputs, dialogs, etc.) that can be directly used for the user profile page, significantly reducing development time.

2. **Authentication Integration**: Clerk + Supabase integration is already established with user ID mapping hooks (`useSupabaseUserId`), making it straightforward to fetch and update user-specific profile data with proper authentication.

3. **Form Pattern Established**: A clear pattern exists for form handling using React Hook Form + Zod validation, with example implementations like `ExpenseForm.tsx` that can be replicated for profile editing forms.

4. **Offline-First Architecture**: The application has PWA capabilities with IndexedDB storage, service worker caching, and offline support - important consideration for profile data sync and accessibility.

5. **API Structure**: While using Vite (not Next.js), the codebase follows Next.js API route patterns with standardized response formats and authentication headers, making it clear how to create profile-related endpoints.

6. **Type Safety**: Strong TypeScript integration with Prisma-generated types and Supabase type definitions ensures type-safe database operations for profile data.

7. **Responsive Design**: Tailwind CSS with custom SISO branding and dark mode support is already configured, ensuring profile pages will match the existing design system.

8. **Data Fetching**: TanStack React Query is available for efficient data fetching, caching, and real-time updates to profile information.
