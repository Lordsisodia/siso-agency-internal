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

/**
 * Keep-alive ping to prevent Supabase free tier from pausing.
 * Runs a lightweight query every time the client is initialized.
 */
const pingSupabase = async (client: BrowserClient) => {
  try {
    const { error } = await client.from('light_work_tasks').select('id').limit(1);
    if (!error) {
      console.log('✅ Supabase keep-alive ping successful');
    }
  } catch {
    // Silent fail - don't block app initialization
  }
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

  // Ping to keep database awake
  pingSupabase(client);

  globalScope.__SISO_SUPABASE_CLIENT__ = client;
  return client;
};
