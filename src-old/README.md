# SISO-INTERNAL Source Code Guide

**Architecture Status:** 89/100 - Production Ready  
**Build Status:** ✅ Builds in 9.61s with 2,772 TypeScript files  
**Database:** ✅ Supabase PostgreSQL operational with proper RLS  

---

## 📁 **Directory Structure Overview**

Quick navigation for the 28 top-level directories in src/:

### **🎯 Core Application**
- **`App.tsx`** - Main routing (80+ routes) with lazy loading
- **`main.tsx`** - Application entry point with providers

### **🌐 Business Domains** 
- **`ecosystem/`** - Business domain organization (internal/partnership/client)
- **`pages/`** - Route components matching App.tsx routes
- **`components/`** - Feature-specific UI components

### **🔧 Infrastructure**
- **`shared/`** - Reusable utilities, UI components, auth guards
- **`refactored/`** - Modern component implementations with feature flags
- **`integrations/`** - External service connections (Supabase, Clerk)

### **📊 Data & State**
- **`api/`** - API integration functions
- **`types/`** - TypeScript definitions
- **`context/`** - React context providers

---

## 🚀 **Development Quick Start**

### **Adding New Features:**
1. Check `ecosystem/` for domain placement
2. Create page component in `pages/`
3. Add route in `App.tsx`
4. Use shared components from `shared/ui/`

### **Database Operations:**
- **Status:** ✅ Supabase working perfectly
- **Types:** Generated and operational (no manual type generation needed)
- **Auth:** Clerk + Supabase RLS configured

### **Component Usage:**
- **Modern components:** Use from `refactored/` (feature-flagged)
- **Shared UI:** Import from `shared/ui/`
- **Styling:** Tailwind CSS + shadcn/ui components

---

## 📋 **Navigation Tips**

- **Find routes:** Check `App.tsx` route definitions
- **Find components:** Look in `components/[feature]/` 
- **Find business logic:** Look in `ecosystem/[domain]/`
- **Find utilities:** Look in `shared/utils/`

---

*📖 Complete architecture guide: `/CODEBASE.md`*  
*🏗️ Status details: `.SISO-APP-FACTORY/DOCS/REPORTS/ARCHITECTURE-STATUS-MASTER.md`*