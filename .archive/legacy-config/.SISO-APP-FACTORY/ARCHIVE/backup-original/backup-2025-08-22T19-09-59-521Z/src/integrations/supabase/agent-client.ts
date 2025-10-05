// Agent-specific Supabase client with elevated permissions
// This client uses service role key to bypass RLS for agent operations
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://avdgyrepwrvsvwgxrccr.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

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
  
  // Import regular client as fallback
  const { supabase } = require('./client');
  return supabase;
};