// Simple AuthGuard replacement
import { useClerkUser } from '@/components/ClerkProvider';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isSignedIn, isLoaded } = useClerkUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in to continue.</div>;
  }

  return <>{children}</>;
}