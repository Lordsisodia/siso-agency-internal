/**
 * Minimal auth service for build compatibility
 */

export class ClerkHybridTaskService {
  static async initialize(): Promise<boolean> {
    console.log('🔧 [AUTH] ClerkHybridTaskService initialized');
    return true;
  }
}
