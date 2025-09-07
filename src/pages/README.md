# Pages Directory

**112+ route components across 8+ application sections**

## 🏗️ Directory Overview

This directory contains all page-level components that serve as route handlers for the SISO Internal application. Each page represents a distinct view or section within the app.

### 📊 Page Statistics  
- **Total Pages**: 112+ page components
- **Route Sections**: 8+ major application areas
- **Organization**: Feature-based routing structure
- **TypeScript Coverage**: 100% (strict mode)

## 📁 Page Structure

### Core Application Sections

#### Admin Dashboard
```
admin/              # 15+ admin management pages
├── AdminDashboard.tsx          # Main admin overview
├── AdminUsers.tsx              # User management interface
├── AdminClients.tsx            # Client management system  
├── AdminTasks.tsx              # Task oversight and management
├── AdminSettings.tsx           # System configuration
├── AdminFeedback.tsx           # Feedback management
├── AdminLifeLock.tsx           # LifeLock integration management
├── AdminPlans.tsx              # Plan and pricing management
├── AdminWireframes.tsx         # Wireframe and mockup management
└── AdminPartnershipLeaderboard.tsx  # Partner performance tracking
```

#### Partnership Portal
```
partnership/        # 8+ partner management pages  
├── PartnerDashboard.tsx        # Main partner overview
├── PartnerLeaderboard.tsx      # Partner ranking system
├── PartnershipPage.tsx         # Partnership program details
├── ReferralsManagement.tsx     # Referral tracking and management
├── TrainingHub.tsx             # Partner training materials
├── Communication.tsx           # Partner-admin communication
└── PartnerAuthGuard.tsx        # Authentication wrapper
```

#### Client Portal
```
client/             # 12+ client-facing pages
├── ClientDashboard.tsx         # Main client dashboard
├── ClientAppDetailsPage.tsx    # Application details view
├── ClientDetailPage.tsx        # Client profile and settings
├── ClientDocumentsPage.tsx     # Document management
├── ClientStatusPage.tsx        # Project status tracking
├── ClientSupportPage.tsx       # Support and help desk
├── ClientTasksPage.tsx         # Task assignments and progress
└── ProjectDetailsPage.tsx      # Detailed project views
```

#### Main Dashboard
```
dashboard/          # 10+ main dashboard pages
├── AffiliateLeaderboard.tsx    # Affiliate ranking system  
├── ProjectBasedTaskDashboard.tsx  # Project-based task management
├── UserFlowNavigation.tsx      # User journey tracking
├── UserFlowNodesPage.tsx       # Flow node configuration
├── UserFlowCodePage.tsx        # Code generation workflows
└── UserFlowFeedbackPage.tsx    # User feedback collection
```

#### Authentication & Onboarding
```
auth/               # 5+ authentication pages
├── PartnerLogin.tsx            # Partner authentication
├── PartnerRegister.tsx         # Partner registration
├── PartnerPasswordReset.tsx    # Password recovery
└── BusinessOnboarding.tsx      # Business account setup

onboarding/         # 3+ onboarding flows
├── OnboardingChat.tsx          # Interactive onboarding
├── ProjectOnboardingPage.tsx   # Project setup wizard
└── ThankYou.tsx               # Completion confirmation
```

#### Resources & Support
```
resources/          # 6+ resource pages
├── ResourcesPage.tsx           # Main resources hub
├── DocumentLibraryPage.tsx     # Document repository
├── EducationHub.tsx           # Learning materials
├── Support.tsx                # Help and support center
├── Portfolio.tsx              # Portfolio showcase
└── PublicPortfolio.tsx        # Public portfolio view
```

#### Project Management
```
projects/           # 8+ project pages
├── Plan.tsx                   # Project planning interface
├── AppPlan.tsx               # Application development plans
├── AppPlanGenerator.tsx      # AI-powered plan generation
├── AppPlanTestingDashboard.tsx  # Testing and QA dashboard
├── AppPlanFeaturesOutput.tsx # Feature specification output
├── ProjectsAndTasksPage.tsx  # Project and task overview
└── PublicPlanView.tsx        # Public project views
```

#### Financial & E-commerce
```
financial/          # 4+ financial pages
├── XPStorePage.tsx            # XP/points store interface
├── CryptoExchange.tsx         # Cryptocurrency trading
├── NightlyCheckoutSection.tsx # Payment processing
└── DecoraPlan.tsx            # Premium plan management
```

## 🎯 Route Structure & Navigation

### URL Patterns
```typescript
// Admin Routes
/admin/dashboard              → AdminDashboard.tsx
/admin/users                  → AdminUsers.tsx  
/admin/clients                → AdminClients.tsx
/admin/partnership/leaderboard → AdminPartnershipLeaderboard.tsx

// Partnership Routes
/partner/dashboard            → PartnerDashboard.tsx
/partner/leaderboard          → PartnerLeaderboard.tsx
/partnership                  → PartnershipPage.tsx
/referrals                    → ReferralsManagement.tsx

// Client Routes  
/client/dashboard             → ClientDashboard.tsx
/client/details/:id           → ClientDetailPage.tsx
/client/app/:appId            → ClientAppDetailsPage.tsx
/client/documents             → ClientDocumentsPage.tsx

// Main Dashboard Routes
/dashboard/affiliate          → AffiliateLeaderboard.tsx
/dashboard/projects           → ProjectBasedTaskDashboard.tsx
/dashboard/userflow           → UserFlowNavigation.tsx
```

### Layout Hierarchy
```typescript
// Layout Components (from src/components/)
MainLayout                    // Global app wrapper
├── AdminLayout              // Admin section wrapper
├── ClientDashboardLayout    // Client portal wrapper
├── PartnershipLayout        // Partner portal wrapper (recently moved from ai-first)
└── AppLayout               // General app wrapper
```

## 🔧 Page Component Patterns

### Standard Page Structure
```typescript
// PageName.tsx
import React from 'react';
import { LayoutComponent } from '@/components/layout/LayoutComponent';
import { PageHeader } from '@/components/common/PageHeader';

interface PageNameProps {
  // Define page-specific props if any
}

const PageName: React.FC<PageNameProps> = () => {
  return (
    <LayoutComponent>
      <PageHeader 
        title="Page Title"
        subtitle="Page description"
      />
      
      <div className="space-y-6">
        {/* Page content */}
      </div>
    </LayoutComponent>
  );
};

export default PageName;
```

### Authentication Guards
```typescript  
// Protected route example
import { PartnerAuthGuard } from '@/pages/partnership/PartnerAuthGuard';

const ProtectedPartnerPage = () => {
  return (
    <PartnerAuthGuard>
      <PartnerDashboard />
    </PartnerAuthGuard>
  );
};
```

### Data Loading Patterns
```typescript
// Page with data fetching
import { useEffect, useState } from 'react';
import { useClientDetails } from '@/hooks/client/useClientDetails';

const ClientDetailPage = ({ clientId }: { clientId: string }) => {
  const { client, loading, error } = useClientDetails(clientId);

  if (loading) return <LoadingState />;
  if (error) return <ErrorBoundary error={error} />;
  
  return (
    <ClientLayout>
      {/* Render client details */}
    </ClientLayout>
  );
};
```

## 🚨 Common Patterns & Best Practices

### Page Naming Convention
- **PascalCase**: All page components use PascalCase naming
- **Descriptive**: Names clearly indicate page purpose (e.g., `AdminPartnershipLeaderboard`)
- **Suffix**: Always end with appropriate suffix (Page, Dashboard, etc.)

### Import Organization
```typescript
// Standard import order:
import React from 'react';                    // React imports first
import { motion } from 'framer-motion';       // External libraries
import { Button } from '@/components/ui/button';  // UI components
import { LayoutComponent } from '@/components/layout/LayoutComponent';  // Layout components  
import { useCustomHook } from '@/hooks/useCustomHook';  // Custom hooks
import { apiService } from '@/services/api.service';    // Services
import type { PageProps } from '@/types/pages';         // Types
```

### Error Handling
```typescript
// Error boundary pattern for pages
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const PageComponent = () => {
  return (
    <ErrorBoundary fallback={<PageErrorFallback />}>
      <PageContent />
    </ErrorBoundary>
  );
};
```

### Loading States  
```typescript
// Consistent loading patterns
const PageWithData = () => {
  const { data, loading, error } = usePageData();
  
  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState />;
  
  return <PageContent data={data} />;
};
```

## 🔄 Recent Changes & Migration Notes

### Partnership Layout Migration (January 2025)
- **Changed**: `@/ai-first/features/partnerships/components/PartnershipLayout` 
- **To**: `@/components/partnership/PartnershipLayout`
- **Affected Pages**: `AffiliateLeaderboard.tsx`
- **Status**: ✅ Complete, imports updated, functionality preserved

### Routing Improvements
- **Consolidated**: Removed duplicate route handlers
- **Standardized**: Consistent layout component usage
- **Enhanced**: Better error boundaries and loading states
- **Optimized**: Improved page-level performance

## 🧭 Navigation & Discovery

### Finding Pages
```bash
# Search by feature
find src/pages -name "*Admin*" -type f
find src/pages -name "*Client*" -type f  
find src/pages -name "*Partner*" -type f

# Browse by section
ls src/pages/admin/
ls src/pages/client/
ls src/pages/partnership/
```

### Route Debugging
```bash
# Check route configuration
npm run dev
# Navigate to http://localhost:5173
# Use browser dev tools to inspect routing
```

### Page Performance Analysis
```typescript
// Add performance monitoring to pages
import { Profiler } from 'react';

const PageWithProfiling = () => {
  const onRenderCallback = (id, phase, actualDuration) => {
    console.log('Page render time:', { id, phase, actualDuration });
  };

  return (
    <Profiler id="PageName" onRender={onRenderCallback}>
      <PageContent />
    </Profiler>
  );
};
```

## 📈 Performance & Optimization

### Page Loading Performance
- **Code Splitting**: Each page is lazy-loaded where appropriate
- **Bundle Analysis**: Pages optimized for minimal bundle size
- **Prefetching**: Critical routes prefetched on hover/interaction
- **Caching**: API responses cached at page level

### SEO & Meta Tags
```typescript
// Page with proper meta tags
import { Helmet } from 'react-helmet-async';

const SEOOptimizedPage = () => {
  return (
    <>
      <Helmet>
        <title>Page Title - SISO Internal</title>
        <meta name="description" content="Page description for SEO" />
        <meta property="og:title" content="Page Title" />
        <meta property="og:description" content="Page description" />
      </Helmet>
      <PageContent />
    </>
  );
};
```

### Mobile Responsiveness
- **Mobile-First**: All pages designed for mobile-first experience
- **Breakpoints**: Consistent Tailwind CSS breakpoint usage
- **Touch-Friendly**: Proper touch targets and gestures
- **Performance**: Optimized for mobile network conditions

---

**Last Updated**: January 29, 2025  
**Total Pages**: 112+ across 8+ sections  
**Recent Changes**: Partnership layout migration complete  
**Performance**: Optimized for mobile and desktop experiences

> Need help with a specific page? Check the import patterns above or refer to the component documentation in `/src/components/README.md`.