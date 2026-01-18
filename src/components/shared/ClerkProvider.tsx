// Clerk Provider Component - PWA Offline-First Architecture
// Auto-sync users to Supabase (NO Prisma - browser can't run Prisma!)

import { ClerkProvider as BaseClerkProvider, useUser } from '@clerk/clerk-react';
import { useEffect, useMemo } from 'react';
import { supabaseAnon } from '@/lib/services/supabase/clerk-integration';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

interface ClerkProviderProps {
  children: React.ReactNode;
}

// Auto-sync component that runs when user signs in
function UserSyncComponent() { return null; }

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <BaseClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <UserSyncComponent />
      {children}
    </BaseClerkProvider>
  );
}

// Helper hook to get current user data for hybrid service
export function useClerkUser() {
  const { user, isSignedIn, isLoaded } = useUser();

  // Memoize user object to prevent infinite re-renders
  const memoizedUser = useMemo(() => {
    return user ? {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl
    } : null;
  }, [
    user?.id,
    user?.emailAddresses,
    user?.firstName,
    user?.lastName,
    user?.imageUrl
  ]);

  return {
    user: memoizedUser,
    isSignedIn,
    isLoaded
  };
}
