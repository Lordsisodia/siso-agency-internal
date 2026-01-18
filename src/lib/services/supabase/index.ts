/**
 * Supabase Service Module
 *
 * Centralized exports for all Supabase-related functionality.
 */

// Client exports
export { getSupabaseBrowserClient } from './browser-client';
export type { Database } from './client';

// Clerk integration exports
export {
  supabaseAnon,
  useSupabaseUserId,
  useSupabaseClient,
  RLS_POLICIES,
  COMPLETE_RLS_SETUP
} from './clerk-integration';
