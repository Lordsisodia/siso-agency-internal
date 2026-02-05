/**
 * Supabase Keep-Alive API Route
 *
 * Prevents Supabase free tier from pausing after 7 days of inactivity.
 * Call this endpoint every 3-4 days to keep the database awake.
 *
 * Usage:
 * - Vercel Cron: Configured in vercel.json
 * - Manual: GET /api/keep-alive
 * - External ping service: UptimeRobot, Pingdom, etc.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Missing Supabase environment variables',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Simple query to wake up the database
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('light_work_tasks')
      .select('id')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      console.error('Supabase keep-alive error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`✅ Supabase keep-alive successful (${responseTime}ms)`);

    return res.status(200).json({
      success: true,
      message: 'Supabase database is awake',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      nextPingRecommended: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
    });
  } catch (error) {
    console.error('Keep-alive unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
