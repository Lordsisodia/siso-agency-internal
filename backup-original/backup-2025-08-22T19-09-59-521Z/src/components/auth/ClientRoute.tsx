
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Protect routes for authenticated client portal users (client role)
 * If not authenticated, redirects to /client-portal
 */
export function ClientRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        if (isMounted) setIsLoggedIn(true);
      } else {
        navigate("/client-portal", { replace: true });
      }
      if (isMounted) setLoading(false);
    };
    checkAuth();
    return () => { isMounted = false };
  }, [navigate]);

  if (loading) return <Skeleton className="h-8 w-40 mx-auto mt-32" />;
  if (!isLoggedIn) return null;
  return <>{children}</>;
}
