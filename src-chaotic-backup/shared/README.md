# 🔗 Shared - Reusable Components & Utilities

**The foundation layer for consistent, reusable functionality across SISO-INTERNAL**

## 📊 **Overview**

The shared directory contains all reusable components, utilities, and services that can be used across different business domains. This ensures consistency and reduces duplication throughout the application.

---

## 🏗️ **Structure**

```
shared/
├── ui/             # Reusable UI components (buttons, modals, forms)
├── auth/           # Authentication components and guards
├── components/     # Complex reusable components
├── types/          # Shared TypeScript definitions
├── utils/          # Helper functions and utilities
└── ClerkProvider.tsx  # Authentication context provider
```

---

## 🎨 **UI Components**

### **Core UI Primitives (shadcn/ui based)**
```typescript
// Form components
import { Button, Input, Select } from '@/shared/ui/button';
import { Modal, Dialog, Sheet } from '@/shared/ui/modal';
import { Card, Badge, Avatar } from '@/shared/ui/card';

// Layout components
import { Container, Grid, Stack } from '@/shared/ui/layout';
import { Separator, Divider } from '@/shared/ui/separator';

// Data display
import { Table, DataTable } from '@/shared/ui/table';
import { Calendar, DatePicker } from '@/shared/ui/calendar';
import { Chart, Graph } from '@/shared/ui/charts';
```

### **Component Design System**
- **Consistent styling** with Tailwind CSS + shadcn/ui
- **Accessible by default** using Radix UI primitives
- **TypeScript support** with proper prop interfaces
- **Theme integration** with CSS custom properties

---

## 🔐 **Authentication System**

### **Auth Components**
```typescript
// Route protection
import { AuthGuard } from '@/shared/auth/AuthGuard';
import { ClerkAuthGuard } from '@/shared/auth/ClerkAuthGuard';
import { PartnerAuthGuard } from '@/shared/auth/PartnerAuthGuard';

// Auth context
import { ClerkProvider } from '@/shared/ClerkProvider';

// Usage patterns
<AuthGuard requiredRole="admin">
  <AdminComponent />
</AuthGuard>

<ClerkAuthGuard>
  <ProtectedContent />
</ClerkAuthGuard>
```

### **Auth Architecture**
- **Dual authentication**: Clerk (primary) + Supabase (fallback)
- **Role-based access**: Admin, user, partner permissions
- **Route protection**: Multiple guard types for different contexts
- **Session management**: Automatic token refresh and validation

---

## 🧰 **Utilities**

### **Helper Functions**
```typescript
// Date/time utilities
import { formatDate, parseDate, isValidDate } from '@/shared/utils/date';

// String manipulation
import { slugify, capitalize, truncate } from '@/shared/utils/string';

// Validation helpers
import { validateEmail, validatePhone, sanitizeInput } from '@/shared/utils/validation';

// API utilities
import { createApiClient, handleApiError } from '@/shared/utils/api';

// Form helpers
import { createFormSchema, validateForm } from '@/shared/utils/forms';
```

### **Common Patterns**
```typescript
// Error handling
import { ErrorBoundary, withErrorBoundary } from '@/shared/utils/error';

// Loading states
import { LoadingSpinner, LoadingOverlay } from '@/shared/utils/loading';

// Local storage
import { useLocalStorage, usePersistentState } from '@/shared/utils/storage';
```

---

## 📋 **TypeScript Definitions**

### **Shared Types**
```typescript
// User and authentication types
import { User, UserRole, AuthState } from '@/shared/types/auth';

// API response types
import { ApiResponse, PaginatedResponse } from '@/shared/types/api';

// Common data structures
import { Task, Project, Client } from '@/shared/types/entities';

// UI component props
import { ButtonProps, ModalProps, FormProps } from '@/shared/types/components';
```

### **Type Organization**
- **Domain-agnostic types**: Reusable across business domains
- **API integration types**: Standard response formats
- **Component interfaces**: Consistent prop definitions
- **Utility type helpers**: Generic TypeScript utilities

---

## 🧩 **Complex Components**

### **Composite Components**
```typescript
// Data tables with sorting, filtering, pagination
import { DataTable } from '@/shared/components/DataTable';

// Form builders with validation
import { FormBuilder, DynamicForm } from '@/shared/components/Forms';

// File upload with drag & drop
import { FileUploader } from '@/shared/components/FileUploader';

// Rich text editor
import { RichTextEditor } from '@/shared/components/Editor';

// Search with autocomplete
import { SearchBox, AutocompleteSearch } from '@/shared/components/Search';
```

### **Layout Components**
```typescript
// Page layouts
import { PageLayout, DashboardLayout } from '@/shared/components/Layouts';

// Navigation
import { Sidebar, Topbar, Breadcrumbs } from '@/shared/components/Navigation';

// Content containers
import { ContentArea, Section, Panel } from '@/shared/components/Containers';
```

---

## 🎯 **Usage Guidelines**

### **When to Use Shared Components**
- **✅ DO USE** for functionality needed across multiple domains
- **✅ DO USE** for UI consistency (buttons, forms, modals)
- **✅ DO USE** for common business logic (auth, validation)
- **✅ DO USE** for utilities used in 3+ places

### **When NOT to Use Shared Components**
- **❌ DON'T USE** for domain-specific business logic
- **❌ DON'T USE** for one-off, specialized components
- **❌ DON'T USE** for highly customized implementations
- **❌ DON'T USE** for experimental features

### **Import Patterns**
```typescript
// Preferred: Use path alias
import { Button } from '@/shared/ui/button';
import { AuthGuard } from '@/shared/auth/AuthGuard';
import { formatDate } from '@/shared/utils/date';

// Avoid: Relative imports from shared
import { Button } from '../../shared/ui/button'; // ❌
```

---

## 🔧 **Development Patterns**

### **Creating New Shared Components**
1. **Identify reusability**: Used in 2+ domains or likely to be reused
2. **Design interface**: Generic, configurable props
3. **Add TypeScript**: Proper interfaces and prop validation
4. **Include tests**: Unit tests for shared components are critical
5. **Document usage**: Add to this README with examples

### **Component Architecture**
```typescript
// Example shared component structure
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  ...props
}) => {
  // Implementation with consistent styling
};
```

---

## 📊 **Current Status**

### **✅ Well-Established Areas**
- **UI Components**: Comprehensive shadcn/ui integration
- **Authentication**: Dual auth system working smoothly
- **Basic Utilities**: Date, string, validation functions ready

### **🔄 Active Development**
- **Complex Components**: DataTable, FormBuilder enhancements
- **API Utilities**: Standardizing API integration patterns
- **Type Definitions**: Expanding shared type coverage

### **🎯 Improvement Opportunities**
- **Component Documentation**: More usage examples needed
- **Storybook Integration**: Visual component documentation
- **Performance Optimization**: Bundle size analysis
- **Testing Coverage**: Increase unit test coverage

---

## 🎯 **Best Practices**

### **Design Principles**
- **Generic First**: Design for reusability, not specific use cases
- **Composable**: Break complex components into smaller pieces
- **Accessible**: Use semantic HTML and ARIA patterns
- **Performant**: Avoid unnecessary re-renders and heavy computations

### **Maintenance Guidelines**
- **Breaking Changes**: Version shared components carefully
- **Backward Compatibility**: Maintain existing APIs when possible
- **Testing**: Shared components need thorough testing
- **Documentation**: Keep usage examples current

---

*🎯 **Key Insight:** Shared components are the foundation of application consistency. Invest in making them robust, well-tested, and easy to use - the entire application benefits from this foundation.*