import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

/**
 * Landing Page Router - Handles root "/" route
 * - Authenticated users: Redirect to internal admin dashboard
 * - Unauthenticated users: Show landing page (future)
 * - Preserves existing behavior: redirect to /admin/life-lock
 */
export const LandingPageRouter: React.FC = () => {
  const { isSignedIn, isLoaded } = useUser();
  
  // Show loading while authentication status is being determined
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  // For now, preserve existing behavior - redirect to admin/life-lock
  // TODO: In future, show actual landing page for unauthenticated users
  return <Navigate to="/admin/life-lock" replace />;
};