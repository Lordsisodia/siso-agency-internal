// Simple AdminAutoLogin replacement
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';

interface AdminAutoLoginProps {
  children: React.ReactNode;
}

export function AdminAutoLogin({ children }: AdminAutoLoginProps) {
  const { isSignedIn, isLoaded } = useClerkUser();

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">
      <div>Loading admin authentication...</div>
    </div>;
  }

  if (!isSignedIn) {
    return <div className="flex items-center justify-center min-h-screen">
      <div>Admin sign in required.</div>
    </div>;
  }

  return <>{children}</>;
}