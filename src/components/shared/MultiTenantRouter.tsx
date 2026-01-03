import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTenant } from '@/lib/hooks/useTenant';
import { PageLoader } from '@/components/ui/PageLoader';

// Import tenant-specific components
const LandingPage = React.lazy(() => 
  import('@/domains/landing/LandingPage').then(module => ({ default: module.LandingPage }))
);
const ClientPortal = React.lazy(() => 
  import('@/domains/client/ClientPortal').then(module => ({ default: module.ClientPortal }))
);
const PartnershipPortal = React.lazy(() => 
  import('@/domains/partners/partnership/PartnershipPortal').then(module => ({ default: module.PartnershipPortal }))
);

interface MultiTenantRouterProps {
  children: React.ReactNode;
}

/**
 * Multi-tenant router wrapper that handles tenant-specific routing
 * SAFE: Does not interfere with existing internal app routes
 * BACKWARD COMPATIBLE: All existing routes continue to work exactly as before
 */
export const MultiTenantRouter: React.FC<MultiTenantRouterProps> = ({ children }) => {
  const { tenant, isLanding } = useTenant();

  // Landing page - only shows on exact root path "/"
  if (isLanding) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    );
  }

  // For internal tenant (default and existing behavior)
  if (tenant === 'internal') {
    // Return the existing app routes unchanged - CRITICAL for backward compatibility
    return <>{children}</>;
  }

  // Handle new tenant-specific routes
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Client Portal Routes */}
        {tenant === 'clients' && (
          <>
            <Route path="/clients" element={<ClientPortal />} />
            <Route path="/clients/*" element={<ClientPortal />} />
          </>
        )}

        {/* Partnership Portal Routes */}
        {tenant === 'partnership' && (
          <>
            <Route path="/partnership" element={<PartnershipPortal />} />
            <Route path="/partnership/*" element={<PartnershipPortal />} />
          </>
        )}

        {/* Fallback for unmatched routes in new tenants */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h1>
              <p className="text-gray-600">This section is under development.</p>
              <a 
                href="/" 
                className="inline-block mt-4 text-indigo-600 hover:text-indigo-800"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Suspense>
  );
};