
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthSession } from '@/hooks/useAuthSession';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';

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
