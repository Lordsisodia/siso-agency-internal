// Clerk Provider Component - Replaces Supabase Auth
// Zero setup, automatic user sync to Prisma

import { ClerkProvider as BaseClerkProvider, useUser } from '@clerk/clerk-react';
import { useEffect, useMemo } from 'react';
import { ClerkUserSync } from '@/ai-first/core/auth.service';
import { logger } from '@/shared/utils/logger';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

interface ClerkProviderProps {
  children: React.ReactNode;
}

// Auto-sync component that runs when user signs in
function UserSyncComponent() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      // Automatically sync user to Prisma when they sign in
      ClerkUserSync.getOrCreateUser({
        id: user.id,
        emailAddresses: user.emailAddresses,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl
      }).then(() => {
        logger.debug('[CLERK-PROVIDER] User auto-synced to Prisma');
      }).catch((error) => {
        logger.error('[CLERK-PROVIDER] User sync failed:', error);
      });
    }
  }, [isSignedIn, user]);

  return null; // This component only handles side effects
}

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