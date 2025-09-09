import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export type TenantType = 'internal' | 'clients' | 'partnership' | 'landing';

export interface TenantContext {
  tenant: TenantType;
  isInternal: boolean;
  isClient: boolean;
  isPartnership: boolean;
  isLanding: boolean;
  tenantPath: string;
  basePath: string;
}

/**
 * Hook to detect current tenant from URL path
 * Safe implementation that defaults to 'internal' for backward compatibility
 * 
 * URL Structure:
 * - www.siso.agency/ → 'landing' (main landing page)
 * - www.siso.agency/internal/* → 'internal' (existing SISO-INTERNAL app)
 * - www.siso.agency/clients/* → 'clients' (client portal)
 * - www.siso.agency/partnership/* → 'partnership' (partner portal)
 */
export const useTenant = (): TenantContext => {
  const location = useLocation();

  const tenantContext = useMemo((): TenantContext => {
    const path = location.pathname;
    
    // Landing page detection
    if (path === '/' || path === '') {
      return {
        tenant: 'landing',
        isInternal: false,
        isClient: false,
        isPartnership: false,
        isLanding: true,
        tenantPath: '/',
        basePath: '/'
      };
    }

    // Extract first path segment
    const segments = path.split('/').filter(Boolean);
    const firstSegment = segments[0]?.toLowerCase();

    // Tenant detection based on first path segment
    switch (firstSegment) {
      case 'internal':
        return {
          tenant: 'internal',
          isInternal: true,
          isClient: false,
          isPartnership: false,
          isLanding: false,
          tenantPath: '/internal',
          basePath: '/internal'
        };

      case 'clients':
        return {
          tenant: 'clients',
          isInternal: false,
          isClient: true,
          isPartnership: false,
          isLanding: false,
          tenantPath: '/clients',
          basePath: '/clients'
        };

      case 'partnership':
        return {
          tenant: 'partnership',
          isInternal: false,
          isClient: false,
          isPartnership: true,
          isLanding: false,
          tenantPath: '/partnership',
          basePath: '/partnership'
        };

      default:
        // CRITICAL: Default to 'internal' for backward compatibility
        // This ensures existing routes like /admin, /tasks, etc. still work
        return {
          tenant: 'internal',
          isInternal: true,
          isClient: false,
          isPartnership: false,
          isLanding: false,
          tenantPath: '/internal',
          basePath: '/'  // Keep existing paths working
        };
    }
  }, [location.pathname]);

  return tenantContext;
};

/**
 * Utility function to build tenant-aware paths
 */
export const buildTenantPath = (tenant: TenantType, path: string): string => {
  if (tenant === 'landing') {
    return path === '/' ? '/' : path;
  }
  
  if (tenant === 'internal') {
    // For backward compatibility, internal routes can be with or without /internal prefix
    return path.startsWith('/internal') ? path : path;
  }

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${tenant}/${cleanPath}`;
};

/**
 * Hook for tenant-aware navigation
 */
export const useTenantNavigation = () => {
  const { tenant } = useTenant();

  const buildPath = (path: string): string => {
    return buildTenantPath(tenant, path);
  };

  return { buildPath };
};