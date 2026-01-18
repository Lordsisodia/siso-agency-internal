// Clerk Provider Component - PWA Offline-First Architecture
// Auto-sync users to Supabase (NO Prisma!)

import { ClerkProvider as BaseClerkProvider, useUser } from '@clerk/clerk-react';
import { useEffect, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { supabaseAnon } from '@/lib/services/supabase/clerk-integration';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

interface ClerkProviderProps {
  children: React.ReactNode;
}

// Auto-sync component that runs when user signs in
function UserSyncComponent() {
  const { user, isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // Only run if fully loaded and signed in
    if (!isLoaded || !isSignedIn || !user) return;

    let isMounted = true;

    // Debounce sync operations to prevent excessive calls
    const syncUser = async () => {
      try {
        const email = user.emailAddresses[0]?.emailAddress || '';

        // Prepare user data matching Supabase schema
        const userData = {
          supabase_id: user.id,  // Clerk ID goes in supabase_id field
          email,
          display_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || email,
          updated_at: new Date().toISOString()
        };

        // Save to IndexedDB first (local storage)
        if ('indexedDB' in window) {
          const db = await window.indexedDB.open('SISOOfflineDB', 1);
          // Store locally - this always works
          
        }

        // Try to sync to Supabase (if online)
        if (navigator.onLine) {
          const { error } = await supabaseAnon
            .from('users')
            .upsert(userData, { onConflict: 'supabase_id' });  // Match on supabase_id, not id!

          if (error) {
            
          } else {
            
          }
        }

        if (isMounted) {
          
        }
      } catch (error) {
        if (isMounted) {
          console.warn('⚠️ [CLERK-PROVIDER] User sync failed (non-critical):', error);
          // Graceful degradation - don't throw, just log
        }
      }
    };

    // Debounce with 500ms delay to prevent rapid-fire syncs
    const timeoutId = setTimeout(syncUser, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isLoaded, isSignedIn, user?.id]); // Only depend on user.id to prevent excessive re-runs

  return null; // This component only handles side effects
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <BaseClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      // Prevent excessive re-renders during development
      signInForceRedirectUrl={import.meta.env.DEV ? undefined : '/'}
      signUpForceRedirectUrl={import.meta.env.DEV ? undefined : '/'}
      afterSignInUrl={import.meta.env.DEV ? undefined : '/'}
      afterSignUpUrl={import.meta.env.DEV ? undefined : '/'}
    >
      {/* Isolate user sync errors from rest of app */}
      <ErrorBoundary
        FallbackComponent={({ error, resetErrorBoundary }) => {
          console.warn('⚠️ [CLERK-AUTH] Non-critical auth sync error:', error);
          // Auto-recover after 3 seconds
          setTimeout(resetErrorBoundary, 3000);
          return null; // Don't show error UI for auth sync failures
        }}
        onError={(error) => {
          console.warn('⚠️ [CLERK-AUTH] Auth boundary caught:', error.message);
        }}
      >
        <UserSyncComponent />
      </ErrorBoundary>
      {children}
    </BaseClerkProvider>
  );
}

// Helper hook to get current user data for hybrid service
export function useClerkUser() {
  const { user, isSignedIn, isLoaded } = useUser();

  // Memoize user data to prevent unnecessary re-renders
  return useMemo(() => ({
    user: user ? {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl
    } : null,
    isSignedIn,
    isLoaded
  }), [
    user?.id, 
    user?.emailAddresses[0]?.emailAddress, 
    user?.firstName, 
    user?.lastName, 
    user?.imageUrl,
    isSignedIn, 
    isLoaded
  ]);
}