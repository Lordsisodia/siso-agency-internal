/**
 * 🧘 Meditation Sessions API Endpoint - Vercel Serverless Function
 *
 * Handles logging and retrieving meditation sessions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://avdgyrepwrvsvwgxrccr.supabase.co';
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_KEY;
const anonKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGd5cmVwd3J2c3Z3Z3hyY2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzgwODIsImV4cCI6MjA1OTIxNDA4Mn0.8MZ2etAhQ1pTJnK84uoqAFfUirv_kaoYcmKHhKgLAWU';

const supabaseKey = serviceRoleKey || anonKey;

if (!serviceRoleKey) {
  console.warn(
    '[meditation-sessions] Service role key missing - falling back to anon key. RLS-protected writes may fail.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Helper function to convert Clerk user ID to Supabase UUID
async function getSupabaseUserId(clerkUserId) {
  // Try current mapping first (supabase_id = Clerk user id)
  let { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('supabase_id', clerkUserId)
    .maybeSingle();

  if (user?.id) return user.id;

  // Backward-compat: try old prefix format
  const { data: legacyUser, error: legacyError } = await supabase
    .from('users')
    .select('id')
    .eq('supabase_id', `prisma-user-${clerkUserId}`)
    .maybeSingle();

  if (legacyError) {
    console.error('Error fetching user ID:', legacyError);
    return null;
  }

  return legacyUser?.id || null;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;
  console.log('🧘 Meditation Sessions API called:', { method, query, body });

  try {
    switch (method) {
      case 'GET': {
        // GET /api/meditation/sessions?userId=xxx&date=2025-10-17
        // or GET /api/meditation/sessions?userId=xxx&limit=10 (for history)
        const { userId, date, limit } = query;

        if (!userId) {
          return res.status(400).json({ error: 'userId is required' });
        }

        console.log('📊 GET meditation sessions for user:', userId);

        // Convert Clerk ID to Supabase UUID
        const supabaseUserId = await getSupabaseUserId(userId);
        console.log('📍 Converted to Supabase ID:', supabaseUserId);

        if (!supabaseUserId) {
          return res.status(200).json({ success: true, data: [] });
        }

        // Build query
        let sessionsQuery = supabase
          .from('meditation_sessions')
          .select('*')
          .eq('user_id', supabaseUserId)
          .order('started_at', { ascending: false });

        // Filter by date if provided
        if (date) {
          sessionsQuery = sessionsQuery.eq('date', date);
        }

        // Limit results if provided
        if (limit) {
          sessionsQuery = sessionsQuery.limit(parseInt(limit));
        }

        const { data: sessions, error } = await sessionsQuery;

        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: 'Database error' });
        }

        console.log('📊 Retrieved sessions:', sessions?.length || 0);

        return res.status(200).json({
          success: true,
          data: sessions || []
        });
      }

      case 'POST': {
        // POST /api/meditation/sessions - Create new meditation session
        const { userId, date, startedAt, completedAt, durationSeconds, completed } = body;

        if (!userId || !date || !startedAt || typeof durationSeconds !== 'number') {
          return res.status(400).json({
            error: 'userId, date, startedAt, and durationSeconds are required'
          });
        }

        console.log('➕ Creating meditation session for user:', userId);

        // Convert Clerk ID to Supabase UUID
        const supabaseUserId = await getSupabaseUserId(userId);
        console.log('📍 Converted to Supabase ID:', supabaseUserId);

        if (!supabaseUserId) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Create meditation session
        const { data: newSession, error: createError } = await supabase
          .from('meditation_sessions')
          .insert({
            user_id: supabaseUserId,
            date: date,
            started_at: startedAt,
            completed_at: completedAt || null,
            duration_seconds: durationSeconds,
            completed: completed !== undefined ? completed : true
          })
          .select()
          .single();

        if (createError) {
          console.error('Supabase create error:', createError);
          if (createError.code === '42501') {
            return res.status(403).json({
              error:
                'Supabase row-level security blocked the insert. Set SUPABASE_SERVICE_ROLE_KEY for serverless functions or update RLS policies.'
            });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        console.log('✅ Successfully created meditation session:', newSession.id);

        return res.status(201).json({
          success: true,
          data: newSession
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Meditation Sessions API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
