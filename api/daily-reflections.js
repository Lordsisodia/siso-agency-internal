/**
 * 📊 Daily Reflections API Endpoint - Vercel Serverless Function
 * 
 * Handles nightly checkout data persistence with Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://avdgyrepwrvsvwgxrccr.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_SERVICE_KEY;

if (!serviceRoleKey) {
  console.warn('[daily-reflections] Service role key missing - falling back to anon key. RLS-protected writes may fail.');
}

const supabaseKey = serviceRoleKey
  || process.env.VITE_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGd5cmVwd3J2c3Z3Z3hyY2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzgwODIsImV4cCI6MjA1OTIxNDA4Mn0.8MZ2etAhQ1pTJnK84uoqAFfUirv_kaoYcmKHhKgLAWU';

const supabase = createClient(supabaseUrl, supabaseKey);

const isUuid = (value) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const normalizeStringParam = (param) => {
  if (Array.isArray(param)) {
    return param[0];
  }
  return typeof param === 'string' ? param : undefined;
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string' && value.length > 0) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [value];
    }
  }
  return [];
};

const mapDailyReflectionRecord = (record = {}) => ({
  id: record.id || null,
  userId: record.user_id || record.userId || null,
  date: record.date || null,
  winOfDay: record.win_of_day || record.winOfDay || '',
  mood: record.mood || '',
  bedTime: record.bed_time || record.bedTime || '',
  wentWell: normalizeArray(record.went_well || record.wentWell),
  evenBetterIf: normalizeArray(record.even_better_if || record.evenBetterIf),
  dailyAnalysis: record.daily_analysis || record.dailyAnalysis || '',
  actionItems: record.action_items || record.actionItems || '',
  overallRating: record.overall_rating ?? record.overallRating ?? null,
  energyLevel: record.energy_level ?? record.energyLevel ?? null,
  keyLearnings: record.key_learnings || record.keyLearnings || '',
  tomorrowFocus: record.tomorrow_focus || record.tomorrowFocus || '',
  tomorrowTopTasks: normalizeArray(record.tomorrow_top_tasks || record.tomorrowTopTasks),
  createdAt: record.created_at || record.createdAt || null,
  updatedAt: record.updated_at || record.updatedAt || null
});

const createEmptyReflection = (date) => ({
  id: null,
  userId: null,
  date,
  winOfDay: '',
  mood: '',
  bedTime: '',
  wentWell: [],
  evenBetterIf: [],
  dailyAnalysis: '',
  actionItems: '',
  overallRating: null,
  energyLevel: null,
  keyLearnings: '',
  tomorrowFocus: '',
  tomorrowTopTasks: [],
  createdAt: null,
  updatedAt: null
});

// Helper function to convert Clerk user ID to Supabase UUID
async function getSupabaseUserId(clerkUserId) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('supabase_id', clerkUserId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching user ID:', error);
    return null;
  }
  
  if (user?.id) return user.id;

  // Fallback to legacy prefix mapping
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

async function resolveSupabaseUserId({ clerkUserId, internalUserId }) {
  if (internalUserId && isUuid(internalUserId)) {
    return internalUserId;
  }

  if (clerkUserId) {
    return getSupabaseUserId(clerkUserId);
  }

  return null;
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

  try {
    switch (method) {
      case 'GET':
        // GET /api/daily-reflections?userId=xxx&date=2025-08-31
        const userId = normalizeStringParam(query.userId);
        const internalUserId = normalizeStringParam(query.internalUserId);
        const date = normalizeStringParam(query.date);

        if (!date) {
          return res.status(400).json({ error: 'date is required' });
        }

        const supabaseUserId = await resolveSupabaseUserId({ clerkUserId: userId, internalUserId });
        if (!supabaseUserId) {
          return res.status(200).json({ success: true, data: createEmptyReflection(date) });
        }

        // Get daily reflections from Supabase
        const { data: reflectionData, error } = await supabase
          .from('daily_reflections')
          .select('*')
          .eq('user_id', supabaseUserId)
          .eq('date', date)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: 'Database error' });
        }

        const responsePayload = reflectionData ? mapDailyReflectionRecord(reflectionData) : createEmptyReflection(date);

        return res.status(200).json({ success: true, data: responsePayload });

      case 'POST':
        // POST /api/daily-reflections - Save/update daily reflections
        const {
          userId: postUserId,
          internalUserId: postInternalUserId,
          date: postDate,
          wentWell,
          evenBetterIf,
          dailyAnalysis,
          actionItems,
          overallRating,
          energyLevel,
          keyLearnings,
          tomorrowFocus,
          tomorrowTopTasks,
          winOfDay,
          mood,
          bedTime
        } = body;

        if (!postDate) {
          return res.status(400).json({ error: 'date is required' });
        }

        const postSupabaseUserId = await resolveSupabaseUserId({
          clerkUserId: postUserId,
          internalUserId: postInternalUserId
        });

        if (!postSupabaseUserId) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Save/update daily reflections in Supabase
        const updateReflectionData = {
          user_id: postSupabaseUserId,
          date: postDate,
          win_of_day: winOfDay || '',
          mood: mood || '',
          bed_time: bedTime || null,
          went_well: Array.isArray(wentWell) ? wentWell : [],
          even_better_if: Array.isArray(evenBetterIf) ? evenBetterIf : [],
          daily_analysis: dailyAnalysis || '',
          action_items: actionItems || '',
          overall_rating: overallRating ?? null,
          energy_level: energyLevel ?? null,
          key_learnings: keyLearnings || '',
          tomorrow_focus: tomorrowFocus || '',
          tomorrow_top_tasks: Array.isArray(tomorrowTopTasks) ? tomorrowTopTasks : []
        };

        const { data: savedReflections, error: saveError } = await supabase
          .from('daily_reflections')
          .upsert(updateReflectionData, { onConflict: 'user_id,date' })
          .select()
          .maybeSingle();

        if (saveError) {
          console.error('Supabase error:', saveError);
          return res.status(500).json({ error: 'Database error' });
        }

        return res.status(200).json({ success: true, data: mapDailyReflectionRecord(savedReflections) });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Daily Reflections API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}