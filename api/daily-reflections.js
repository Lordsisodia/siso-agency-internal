/**
 * 📊 Daily Reflections API Endpoint - Vercel Serverless Function
 * 
 * Handles nightly checkout data persistence with Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://avdgyrepwrvsvwgxrccr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGd5cmVwd3J2c3Z3Z3hyY2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzgwODIsImV4cCI6MjA1OTIxNDA4Mn0.8MZ2etAhQ1pTJnK84uoqAFfUirv_kaoYcmKHhKgLAWU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to convert Clerk user ID to Supabase UUID
async function getSupabaseUserId(clerkUserId) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('supabase_id', `prisma-user-${clerkUserId}`)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching user ID:', error);
    return null;
  }
  
  return user?.id || null;
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
        const { userId, date } = query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        // Convert Clerk ID to Supabase UUID
        const supabaseUserId = await getSupabaseUserId(userId);
        if (!supabaseUserId) {
          return res.status(200).json({ success: true, data: { went_well: [], even_better_if: [], analysis: [], patterns: [], changes: [], overall_rating: null, key_learnings: "", tomorrow_focus: "", date: date } });
        }

        // Get daily reflections from Supabase
        const { data: reflectionData, error } = await supabase
          .from('daily_reflections')
          .select('*')
          .eq('user_id', supabaseUserId)
          .eq('date', date);
        
        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Use first result or default empty data
        const reflections = reflectionData?.[0] || {
          went_well: [],
          even_better_if: [],
          analysis: [],
          patterns: [],
          changes: [],
          overall_rating: null,
          key_learnings: "",
          tomorrow_focus: "",
          date: date
        };
        
        return res.status(200).json({ success: true, data: reflections });

      case 'POST':
        // POST /api/daily-reflections - Save/update daily reflections
        const { 
          userId: postUserId, 
          date: postDate, 
          wentWell, 
          evenBetterIf, 
          analysis, 
          patterns, 
          changes,
          overallRating,
          keyLearnings,
          tomorrowFocus
        } = body;
        
        if (!postUserId || !postDate) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        // Convert Clerk ID to Supabase UUID for POST
        const postSupabaseUserId = await getSupabaseUserId(postUserId);
        if (!postSupabaseUserId) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Save/update daily reflections in Supabase
        const updateReflectionData = {
          user_id: postSupabaseUserId,
          date: postDate,
          went_well: wentWell || [],
          even_better_if: evenBetterIf || [],
          analysis: analysis || [],
          patterns: patterns || [],
          changes: changes || [],
          overall_rating: overallRating,
          key_learnings: keyLearnings || "",
          tomorrow_focus: tomorrowFocus || ""
        };

        const { data: savedReflections, error: saveError } = await supabase
          .from('daily_reflections')
          .upsert(updateReflectionData, { onConflict: 'user_id,date' })
          .select()
          .single();

        if (saveError) {
          console.error('Supabase error:', saveError);
          return res.status(500).json({ error: 'Database error' });
        }
        
        return res.status(200).json({ success: true, data: savedReflections });

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