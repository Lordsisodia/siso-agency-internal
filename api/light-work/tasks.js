/**
 * Light Work Tasks API Endpoint
 * Handles fetching light work tasks with Clerk user ID mapping
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

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
 */
async function mapClerkToSupabaseId(clerkUserId) {
  if (!clerkUserId) return null;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_id', clerkUserId)
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, date } = req.query;

    if (!userId || !date) {
      res.status(400).json({ error: 'userId and date are required' });
      return;
    }

    // Map Clerk user ID to Supabase UUID
    const supabaseUserId = await mapClerkToSupabaseId(userId);
    if (!supabaseUserId) {
      res.json({ data: [] });
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
      res.status(500).json({ error: 'Failed to fetch tasks' });
      return;
    }

    res.json({ data: data || [] });
  } catch (error) {
    console.error('[Light Work API] Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
