/**
 * Light Work Tasks API Endpoint
 * Handles fetching light work tasks with Clerk user ID mapping
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve('.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase credentials not configured');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Map Clerk user ID to Supabase UUID
 * The incoming userId may be:
 * 1. A Clerk ID (user_...) - needs to be mapped via clerk_id column
 * 2. A Supabase UUID - can be used directly
 */
async function mapClerkToSupabaseId(clerkUserId: string): Promise<string | null> {
  if (!clerkUserId) return null;

  // If it's already a Supabase UUID (doesn't start with "user_"), use as-is
  if (!clerkUserId.startsWith('user_')) {
    return clerkUserId;
  }

  try {
    // Map Clerk ID to Supabase UUID via clerk_id column
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .maybeSingle();

    if (error) {
      console.error('[Light Work API] Error mapping user ID:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('[Light Work API] Error mapping user ID:', error);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const { userId, date } = req.query;

    if (!userId || !date) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'userId and date are required' }));
      return;
    }

    // Map Clerk user ID to Supabase UUID
    const supabaseUserId = await mapClerkToSupabaseId(userId as string);
    if (!supabaseUserId) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: [] }));
      return;
    }

    // Fetch light work tasks
    const { data, error } = await supabase
      .from('light_work_tasks')
      .select('*')
      .eq('user_id', supabaseUserId)
      .neq('completed', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Light Work API] Error fetching tasks:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch tasks' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ data: data || [] }));
  } catch (error: any) {
    console.error('[Light Work API] Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
  }
}
