import { lazy, ComponentType, LazyExoticComponent } from 'react';

// Lazy load heavy components to improve UI performance
export const LazyComponents = {
  // Admin components (heavy)
  AdminDashboard: lazy(() => import('../pages/AdminDashboard')),
  AdminLifeLockDay: lazy(() => import('../pages/AdminLifeLockDay')),
  AdminTaskBoard: lazy(() => import('../pages/AdminTaskBoard')),
  AdminInstagramLeads: lazy(() => import('../pages/AdminInstagramLeads')),
  AdminFinancialDashboard: lazy(() => import('../pages/AdminFinancialDashboard')),
  AdminProjectManagement: lazy(() => import('../pages/AdminProjectManagement')),
  
  // Client components (heavy)
  ClientDashboard: lazy(() => import('../pages/ClientDashboard')),
  ClientOnboarding: lazy(() => import('../pages/ClientOnboarding')),
  ClientPortfolio: lazy(() => import('../pages/ClientPortfolio')),
  
  // Chart components (very heavy)
  DashboardCharts: lazy(() => import('../components/dashboard/DashboardCharts')),
  FinancialCharts: lazy(() => import('../components/admin/FinancialCharts')),
  TaskAnalytics: lazy(() => import('../components/admin/TaskAnalytics')),
  
  // Feature-heavy components
  VideoChat: lazy(() => import('../components/VideoChat')),
  FileUpload: lazy(() => import('../components/FileUpload')),
  DataTable: lazy(() => import('../components/ui/data-table')),
  
  // Landing page sections (can be lazy loaded)
  LandingHero: lazy(() => import('../components/landing/LandingHero')),
  LandingFeatures: lazy(() => import('../components/landing/LandingFeatures')),
  LandingTestimonials: lazy(() => import('../components/landing/LandingTestimonials')),
  LandingPricing: lazy(() => import('../components/landing/LandingPricing')),
};

// Performance monitoring wrapper
export function withPerformanceMonitoring<T extends {}>(
  Component: ComponentType<T>,
  componentName: string
): LazyExoticComponent<ComponentType<T>> {
  return lazy(async () => {
    const start = performance.now();
    const module = await import(`../components/${componentName}`);
    const end = performance.now();
    
    if (end - start > 100) { // Log slow components
      console.warn(`Slow component load: ${componentName} took ${end - start}ms`);
    }
    
    return module;
  });
}

// Preload critical components
export function preloadCriticalComponents() {
  // Preload components that will likely be used soon
  const criticalComponents = [
    () => import('../pages/AdminDashboard'),
    () => import('../components/ui/button'),
    () => import('../components/ui/dialog'),
  ];
  
  criticalComponents.forEach(importFn => {
    importFn().catch(() => {
      // Silently fail preloading
    });
  });
}

// Dynamic import helper for better performance
export async function importComponent(componentPath: string) {
  const start = performance.now();
  try {
    const module = await import(componentPath);
    const end = performance.now();
    
    if (end - start > 200) {
      console.warn(`Slow dynamic import: ${componentPath} took ${end - start}ms`);
    }
    
    return module;
  } catch (error) {
    console.error(`Failed to import component: ${componentPath}`, error);
    throw error;
  }
}