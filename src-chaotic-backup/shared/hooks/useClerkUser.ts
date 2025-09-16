/**
 * 🔑 Clerk User Hook - Clean Architecture
 * 
 * Wraps Clerk authentication state for consistent usage across app
 * Provides user info and authentication status
 */

import { useUser } from '@clerk/clerk-react';

export function useClerkUser() {
  const { user, isSignedIn, isLoaded } = useUser();

  return {
    user: user ? {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      fullName: user.fullName || '',
      imageUrl: user.imageUrl || ''
    } : null,
    isSignedIn: isSignedIn && isLoaded,
    isLoaded
  };
}