// Simple ClerkAuthGuard replacement
import { useClerkUser } from '@/components/ClerkProvider';

interface ClerkAuthGuardProps {
  children: React.ReactNode;
}

export function ClerkAuthGuard({ children }: ClerkAuthGuardProps) {
  const { isSignedIn, isLoaded } = useClerkUser();

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">
      <div>Loading authentication...</div>
    </div>;
  }

  if (!isSignedIn) {
    return <div className="flex items-center justify-center min-h-screen">
      <div>Please sign in to continue.</div>
    </div>;
  }

  return <>{children}</>;
}