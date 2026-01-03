// Agent-specific Supabase client with elevated permissions
// This client uses service role key to bypass RLS for agent operations
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { supabase } from './client';

// Robust environment variable handling
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const SUPABASE_URL = (envUrl && envUrl.trim() && envUrl !== 'undefined') 
  ? envUrl.trim() 
  : "https://avdgyrepwrvsvwgxrccr.supabase.co";

const SUPABASE_SERVICE_ROLE_KEY = (envServiceKey && envServiceKey.trim() && envServiceKey !== 'undefined') 
  ? envServiceKey.trim() 
  : null;

// Create a service role client that bypasses RLS for agent operations
export const agentSupabase = SUPABASE_SERVICE_ROLE_KEY 
  ? createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Fallback to regular client if service role key is not available
export const getAgentClient = () => {
  if (agentSupabase) {
    return agentSupabase;
  }
  
  // Use regular client as fallback
  return supabase;
};