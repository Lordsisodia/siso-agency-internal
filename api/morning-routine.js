/**
 * 🌅 Morning Routine API Endpoint - Vercel Serverless Function
 * 
 * ES module version with proper Vercel function export
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        // GET /api/morning-routine?userId=xxx&date=2025-08-26
        const { userId, date } = query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        // Convert Clerk ID to Supabase UUID
        const supabaseUserId = await getSupabaseUserId(userId);
        if (!supabaseUserId) {
          return res.status(200).json({ success: true, data: { habits: [], completed: false, date: date } });
        }

        // Get morning routine from Supabase
        const { data: routineData, error } = await supabase
          .from('daily_routines')
          .select('*')
          .eq('user_id', supabaseUserId)
          .eq('date', date)
          .eq('routine_type', 'morning');
        
        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Use first result or default empty data (like task APIs)
        const morningRoutine = routineData?.[0] || {
          habits: [],
          completed: false,
          date: date
        };
        
        return res.status(200).json({ success: true, data: morningRoutine });

      case 'PATCH':
        // PATCH /api/morning-routine - Update morning routine habit completion
        const { userId: patchUserId, date: patchDate, habitName, completed } = body;
        if (!patchUserId || !patchDate || !habitName || typeof completed !== 'boolean') {
          return res.status(400).json({ error: 'userId, date, habitName, and completed are required' });
        }
        
        // Convert Clerk ID to Supabase UUID for PATCH
        const patchSupabaseUserId = await getSupabaseUserId(patchUserId);
        if (!patchSupabaseUserId) {
          return res.status(404).json({ error: 'User not found' });
        }

        // First, get existing routine or create new one
        let { data: existingRoutine, error: fetchError } = await supabase
          .from('daily_routines')
          .select('*')
          .eq('user_id', patchSupabaseUserId)
          .eq('date', patchDate)
          .eq('routine_type', 'morning');

        if (fetchError) {
          console.error('Supabase fetch error:', fetchError);
          return res.status(500).json({ error: 'Database error' });
        }

        // Update or create routine with new habit completion (use first result like other APIs)
        const currentItems = existingRoutine?.[0]?.items || [];
        const updatedItems = currentItems.map(item => 
          item.name === habitName ? { ...item, completed } : item
        );
        
        // If habit doesn't exist, add it
        if (!updatedItems.find(item => item.name === habitName)) {
          updatedItems.push({ name: habitName, completed });
        }

        const completedCount = updatedItems.filter(item => item.completed).length;
        const totalCount = updatedItems.length;

        const updateRoutineData = {
          user_id: patchSupabaseUserId,
          date: patchDate,
          routine_type: 'morning',
          items: updatedItems,
          completed_count: completedCount,
          total_count: totalCount,
          completion_percentage: totalCount > 0 ? (completedCount / totalCount) * 100 : 0
        };

        const { data: updatedRoutine, error: updateError } = await supabase
          .from('daily_routines')
          .upsert(updateRoutineData, { onConflict: 'user_id,date,routine_type' })
          .select()
          .single();

        if (updateError) {
          console.error('Supabase update error:', updateError);
          return res.status(500).json({ error: 'Database error' });
        }
        
        return res.status(200).json({ success: true, data: updatedRoutine });

      default:
        res.setHeader('Allow', ['GET', 'PATCH']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Morning Routine API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
};