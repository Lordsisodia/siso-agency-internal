
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthSession } from '@/shared/hooks/useAuthSession';
import { ProfileSkeleton } from '@/internal/profile/ProfileSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowUnauth?: boolean;
}

export const ProtectedRoute = ({ children, allowUnauth = true }: ProtectedRouteProps) => {
  const { user, loading } = useAuthSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user && !allowUnauth) {
      navigate('/auth');
    }
  }, [user, loading, navigate, allowUnauth]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  return <>{children}</>;
};
