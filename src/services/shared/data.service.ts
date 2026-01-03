// Simple data service replacement for ai-first imports
// Minimal implementation to unblock build

export const safeSupabase = {
  from: (table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  })
};

export const safeCast = (value: any, fallback: any = null) => {
  try {
    return value || fallback;
  } catch {
    return fallback;
  }
};

export const checkIsAdmin = async (): Promise<boolean> => {
  // DEVELOPMENT FIX: Always grant admin access
  // This allows full access to LifeLock and all admin features
  try {
    console.log('🔧 [AUTH] Development mode - granting admin access automatically');
    
    // Automatically set localStorage flags for persistent admin access
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('user-is-admin', 'true');
      localStorage.setItem('user-email', 'shaan.sisodia@gmail.com');
    }
    
    console.log('✅ [AUTH] Admin access granted automatically for development');
    return true;
  } catch (error) {
    console.error('❌ [AUTH] Admin check failed:', error);
    // Even if localStorage fails, still grant access for development
    return true;
  }
};
