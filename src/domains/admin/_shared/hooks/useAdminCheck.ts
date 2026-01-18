/**
 * useAdminCheck Hook
 *
 * Stub for admin authorization check
 */

import { useState, useEffect } from 'react';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement actual admin check
    // For now, assume user is admin
    setTimeout(() => {
      setIsAdmin(true);
      setIsLoading(false);
    }, 100);
  }, []);

  return { isAdmin, isLoading };
};
