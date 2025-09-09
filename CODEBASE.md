# 🗺️ SISO-INTERNAL Codebase Navigation Guide

**Quick Reference:** Where to find things in this React + TypeScript codebase.

## 📁 **Main Directory Structure**

```
src/
├── 🎯 App.tsx                 # Main app entry + routing (80+ routes)
├── 🔧 main.tsx               # Vite app bootstrap
├── 
├── 🏗️ shared/               # Reusable components & utilities
│   ├── ui/                   # UI primitives (buttons, modals, etc)
│   ├── auth/                 # Authentication components
│   ├── types/                # TypeScript definitions
│   └── utils/                # Helper functions
├── 
├── 🎨 components/            # Feature-specific components
│   ├── admin/                # Admin panel components
│   ├── tasks/                # Task management UI
│   └── working-ui/           # Working session interfaces
├── 
├── 🌐 ecosystem/             # Business domain modules
│   ├── internal/             # Internal tools (LifeLock, etc)
│   │   └── lifelock/         # Main productivity dashboard
│   └── partnership/          # Partner program features
├── 
├── 📄 pages/                 # Route components
├── 🔌 api/                   # API integration functions  
├── 🔗 integrations/          # External service connectors
├── 🎨 styles/                # CSS and theme files
└── 📊 types/                 # Global TypeScript types
```

## 🎯 **Key Files & What They Do**

### **🚪 Entry Points**
- `App.tsx` → Main application + all route definitions
- `main.tsx` → App startup + providers setup

### **🔐 Authentication**
- `shared/auth/AuthGuard.tsx` → Route protection
- `shared/auth/ClerkAuthGuard.tsx` → Clerk-based auth
- `shared/ClerkProvider.tsx` → Auth context provider

### **💼 Main Features**
- `ecosystem/internal/lifelock/AdminLifeLock.tsx` → Main productivity dashboard
- `pages/admin/AdminTasks.tsx` → Task management (1,338 lines - complex!)
- `ecosystem/partnership/` → Partner program features

### **🎨 UI Components**
- `shared/ui/` → Reusable UI primitives (buttons, modals, forms)
- `shared/components/` → Complex reusable components
- `components/` → Feature-specific UI components

### **🔌 Integrations**  
- `integrations/supabase/` → Database operations
- `integrations/clerk/` → Authentication service
- `api/` → API endpoint functions

## 🧭 **Navigation Tips**

### **Finding Components:**
1. **Shared/Reusable** → Look in `shared/`
2. **Feature-Specific** → Look in `components/[feature]/`
3. **Business Logic** → Look in `ecosystem/`
4. **Route Pages** → Look in `pages/`

### **Finding Logic:**
1. **API Calls** → `api/` folder
2. **Auth Logic** → `shared/auth/`
3. **Business Rules** → `ecosystem/[domain]/`
4. **Utilities** → `shared/utils/`

### **Common Tasks:**
- **Add new route** → Edit `App.tsx` route definitions
- **Create reusable component** → Add to `shared/ui/` or `shared/components/`
- **Add feature page** → Create in `pages/` + add route in `App.tsx`
- **Database operations** → Use functions in `api/` folder
- **Styling** → Check `styles/` or component-level CSS

## 🔍 **Search Strategies**

### **VS Code Search Patterns:**
- Find components: `*.tsx` in specific folders
- Find API calls: Search for `supabase` or `fetch`
- Find routes: Search in `App.tsx` for path strings
- Find types: Search `*.types.ts` files
- Find auth usage: Search for `AuthGuard` or `useAuth`

### **Large Files to Know:**
- `AdminTasks.tsx` (1,338 lines) - Complex task management
- `App.tsx` (412 lines) - All routing logic
- `AdminLifeLock.tsx` (412 lines) - Main dashboard

## 🎯 **Quick Development Guide**

### **Adding New Features:**
1. Create component in appropriate folder (`shared/` or `components/`)
2. Add API functions in `api/` if needed
3. Create page component in `pages/`
4. Add route in `App.tsx`
5. Add navigation links where needed

### **Common Patterns:**
- **Auth Protection:** Wrap routes with `<AuthGuard>` or `<ClerkAuthGuard>`
- **API Calls:** Use functions from `api/` folder
- **UI Components:** Import from `shared/ui/`
- **Types:** Import from `@/types/` or component-specific files

## 📋 **Architecture Notes**

- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** Supabase PostgreSQL
- **Auth:** Clerk (primary) + custom auth guards
- **Routing:** React Router with lazy loading
- **State:** React hooks + context (no Redux)

---

**🎯 Pro Tip:** When lost, start with `App.tsx` to understand routing, then follow the imports to find the components you need!

**📊 Stats:** 2,772 TypeScript files, 89/100 architecture score, builds in ~10s