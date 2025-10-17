import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

type BrowserClient = SupabaseClient<Database>;

const getGlobalScope = (): typeof globalThis & { __SISO_SUPABASE_CLIENT__?: BrowserClient } => {
  return globalThis as typeof globalThis & { __SISO_SUPABASE_CLIENT__?: BrowserClient };
};

export const getSupabaseBrowserClient = (): BrowserClient => {
  const globalScope = getGlobalScope();

  if (globalScope.__SISO_SUPABASE_CLIENT__) {
    return globalScope.__SISO_SUPABASE_CLIENT__;
  }

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  globalScope.__SISO_SUPABASE_CLIENT__ = client;
  return client;
};
