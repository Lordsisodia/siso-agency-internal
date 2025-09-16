import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export type TenantType = 'internal' | 'client' | 'partnership';

export interface TenantContext {
  tenant: TenantType;
  isInternal: boolean;
  isClient: boolean;
  isPartnership: boolean;
  isSuperAdmin: boolean; // For your god-mode access
}

/**
 * Safe tenant detection hook - doesn't affect existing internal app routing
 * Defaults to 'internal' to preserve existing behavior
 */
export const useTenant = (): TenantContext => {
  const location = useLocation();
  
  const tenant = useMemo<TenantType>(() => {
    if (location.pathname.startsWith('/clients')) return 'client';
    if (location.pathname.startsWith('/partnership')) return 'partnership';
    return 'internal'; // ✅ Default to existing behavior - no breaking changes
  }, [location.pathname]);
  
  // TODO: Replace with actual super-admin check from Clerk
  // For now, you're always super-admin in development
  const isSuperAdmin = true;
  
  return {
    tenant,
    isInternal: tenant === 'internal',
    isClient: tenant === 'client', 
    isPartnership: tenant === 'partnership',
    isSuperAdmin
  };
};