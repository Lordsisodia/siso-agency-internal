// Clerk Auth Guard - Replaces Supabase AuthGuard
// Automatic authentication with zero setup

import { SignIn, useUser } from '@clerk/clerk-react';
import { ReactNode } from 'react';
import { PageLoader } from '../ui/PageLoader';

interface ClerkAuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClerkAuthGuard({ children, fallback }: ClerkAuthGuardProps) {
  const { isSignedIn, isLoaded, user } = useUser();

  // Show loading while Clerk initializes
  if (!isLoaded) {
    return <PageLoader />;
  }

  // Show sign-in if not authenticated
  if (!isSignedIn) {
    return fallback || (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to SISO Internal</h1>
            <p className="text-gray-400">Sign in to access your dashboard</p>
          </div>
          <div className="flex justify-center">
            <SignIn 
              routing="hash"
              afterSignInUrl="/admin/life-lock"
              appearance={{
                baseTheme: undefined,
                variables: {
                  colorPrimary: '#ea384c',
                  colorBackground: '#000000',
                  colorText: '#ffffff',
                  colorInputBackground: '#1a1a1a',
                  colorInputText: '#ffffff',
                },
                elements: {
                  rootBox: 'mx-auto w-full flex justify-center',
                  card: 'bg-black border border-gray-800 shadow-2xl w-full max-w-md',
                  socialButtonsBlockButton: 'w-full flex justify-center items-center',
                  socialButtonsBlockButtonText: 'text-center',
                  dividerRow: 'text-center',
                  dividerText: 'text-gray-400',
                  formFieldInput: 'w-full text-center',
                  footerActionText: 'text-center',
                  footerActionLink: 'text-center mx-auto',
                  footer: 'text-center',
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, show protected content
  console.log('✅ [CLERK-AUTH] User authenticated:', user?.emailAddresses[0]?.emailAddress);
  return <>{children}</>;
}