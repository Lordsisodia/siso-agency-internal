// Simple auth service replacement for ai-first imports
// Minimal implementation to unblock build

export class ClerkHybridTaskService {
  static async initialize() {
    // Simple initialization - can be expanded later
    console.log('Auth service initialized');
    return Promise.resolve();
  }
}

export class ClerkUserSync {
  static async getOrCreateUser(userData: any) {
    // Simple user sync - can be expanded with actual Prisma integration
    console.log('User sync:', userData.id);
    return Promise.resolve(userData);
  }
}

export async function signOut() {
  // Simple sign out - can be expanded later
  console.log('Signing out user');
  return Promise.resolve();
}

// Admin checking functionality for useAuthSession hook
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  console.log('Checking admin status for user:', userId);
  
  // Basic admin check - in a real app, this would check against a database
  // For now, return true for demo purposes or add your specific admin logic here
  const adminUsers = [
    'admin',
    'administrator', 
    'user_admin_123'
  ];
  
  // Simple check - you can enhance this based on your auth system
  const isAdminUser = adminUsers.some(adminId => 
    userId?.toLowerCase().includes(adminId.toLowerCase())
  );
  
  return Promise.resolve(isAdminUser);
};