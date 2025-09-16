import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTenant } from './useTenant';

/**
 * Super-Admin Tenant Switcher - Only visible to super-admins
 * Allows instant switching between all tenant portals
 */
export const TenantSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant, isSuperAdmin } = useTenant();
  
  // Only show to super-admins
  if (!isSuperAdmin) return null;
  
  const handleTenantSwitch = (newTenant: string) => {
    navigate(newTenant);
  };
  
  const getCurrentPath = () => {
    if (location.pathname.startsWith('/clients')) return '/clients';
    if (location.pathname.startsWith('/partnership')) return '/partnership';
    if (location.pathname.startsWith('/internal')) return '/internal';
    return '/internal'; // Default fallback
  };
  
  return (
    <div className="fixed top-4 right-4 bg-gray-900 text-white p-2 rounded-lg shadow-lg z-50 border border-gray-700">
      <div className="flex items-center space-x-2">
        <span className="text-xs font-medium text-gray-300">🔧 SUPER-ADMIN:</span>
        <select 
          value={getCurrentPath()}
          onChange={(e) => handleTenantSwitch(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm outline-none hover:bg-gray-700 transition-colors"
        >
          <option value="/internal">🏠 Internal Dashboard</option>
          <option value="/clients">👥 Client Portal</option>
          <option value="/partnership">🤝 Partnership Hub</option>
        </select>
      </div>
      
      {/* Current tenant indicator */}
      <div className="mt-1 text-xs text-gray-400">
        Active: <span className="font-medium capitalize">{tenant}</span>
      </div>
    </div>
  );
};