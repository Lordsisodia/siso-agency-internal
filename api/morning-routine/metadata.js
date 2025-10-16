/**
 * 🌅 Morning Routine Metadata API Endpoint - Vercel Serverless Function
 *
 * Handles time-based data: wake-up time, push-ups, water, meditation, daily priorities
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://avdgyrepwrvsvwgxrccr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGd5cmVwd3J2c3Z3Z3hyY2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzgwODIsImV4cCI6MjA1OTIxNDA4Mn0.8MZ2etAhQ1pTJnK84uoqAFfUirv_kaoYcmKHhKgLAWU';

const supabase = createClient(supabaseUrl, supabaseKey);

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

const PUSHUP_TITLE_MATCHERS = ['push-up', 'pushup'];

function isPushupWorkoutItem(title = '') {
  const normalized = title.toLowerCase();
  return PUSHUP_TITLE_MATCHERS.some(match => normalized.includes(match));
}

function parseLoggedValue(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== 'string') {
    return 0;
  }

  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function ensurePushupWorkoutItem(userId, workoutDate) {
  const { data, error } = await supabase
    .from('workout_items')
    .select('*')
    .eq('user_id', userId)
    .eq('workout_date', workoutDate)
    .order('created_at', { ascending: true })
    .limit(5);

  if (error) {
    console.error('Error fetching workout items for sync:', error);
    throw error;
  }

  const existingPushupItem = (data || []).find(item => isPushupWorkoutItem(item.title));

  if (existingPushupItem) {
    return existingPushupItem;
  }

  const { data: insertedItem, error: insertError } = await supabase
    .from('workout_items')
    .insert({
      user_id: userId,
      workout_date: workoutDate,
      title: 'Push-ups',
      target: '50 reps',
      completed: false,
      logged: '0',
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating push-up workout item:', insertError);
    throw insertError;
  }

  return insertedItem;
}

async function syncPushupsToWorkout({
  userId,
  workoutDate,
  pushupReps,
  previousSynced,
}) {
  if (!Number.isFinite(pushupReps) || pushupReps < 0) {
    return false;
  }

  try {
    const pushupItem = await ensurePushupWorkoutItem(userId, workoutDate);

    const existingLogged = parseLoggedValue(pushupItem?.logged);
    const previousSyncedValue = Number.isFinite(previousSynced) ? previousSynced : 0;
    const manualPortion = Math.max(0, existingLogged - previousSyncedValue);
    const nextTotal = manualPortion + pushupReps;

    const { error: updateError } = await supabase
      .from('workout_items')
      .update({
        logged: String(nextTotal),
        updated_at: new Date().toISOString(),
      })
      .eq('id', pushupItem.id);

    if (updateError) {
      console.error('Error updating push-up workout item during sync:', updateError);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to sync morning push-ups to workout items:', error);
    return false;
  }
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
  console.log('📍 Metadata API called:', { method, query, body });

  try {
    switch (method) {
      case 'GET': {
        // GET /api/morning-routine/metadata?userId=xxx&date=2025-10-15
        const { userId, date } = query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }

        console.log('📍 GET metadata for user:', userId, 'date:', date);

        // Convert Clerk ID to Supabase UUID
        const supabaseUserId = await getSupabaseUserId(userId);
        console.log('📍 Converted to Supabase ID:', supabaseUserId);

        if (!supabaseUserId) {
          return res.status(200).json({ success: true, data: {} });
        }

        // Get morning routine metadata from Supabase
        const { data: routineData, error } = await supabase
          .from('daily_routines')
          .select('metadata')
          .eq('user_id', supabaseUserId)
          .eq('date', date)
          .eq('routine_type', 'morning')
          .maybeSingle();

        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: 'Database error' });
        }

        console.log('📍 Retrieved metadata:', routineData?.metadata);

        return res.status(200).json({
          success: true,
          data: routineData?.metadata || {}
        });
      }
      case 'PATCH': {
        // PATCH /api/morning-routine/metadata - Update metadata fields
        const { userId: patchUserId, date: patchDate, metadata } = body;
        if (!patchUserId || !patchDate || !metadata) {
          return res.status(400).json({ error: 'userId, date, and metadata are required' });
        }

        console.log('📍 PATCH metadata for user:', patchUserId, 'date:', patchDate, 'metadata:', metadata);

        // Convert Clerk ID to Supabase UUID
        const patchSupabaseUserId = await getSupabaseUserId(patchUserId);
        console.log('📍 Converted to Supabase ID:', patchSupabaseUserId);

        if (!patchSupabaseUserId) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Check if routine exists
        const { data: existingRoutine, error: fetchError } = await supabase
          .from('daily_routines')
          .select('*')
          .eq('user_id', patchSupabaseUserId)
          .eq('date', patchDate)
          .eq('routine_type', 'morning')
          .maybeSingle();

        if (fetchError) {
          console.error('Supabase fetch error:', fetchError);
          return res.status(500).json({ error: 'Database error' });
        }

        console.log('📍 Existing routine:', existingRoutine);

        // Merge existing metadata with new metadata
        const currentMetadata = existingRoutine?.metadata || {};
        const updatedMetadata = { ...currentMetadata, ...metadata };

        const incomingPushups = typeof metadata.pushupReps === 'number' ? metadata.pushupReps : undefined;
        if (incomingPushups !== undefined) {
          const sanitizedPushups = Number.isFinite(incomingPushups)
            ? Math.max(0, Math.round(incomingPushups))
            : 0;

          const syncSucceeded = await syncPushupsToWorkout({
            userId: patchSupabaseUserId,
            workoutDate: patchDate,
            pushupReps: sanitizedPushups,
            previousSynced: typeof currentMetadata.syncedMorningPushups === 'number'
              ? currentMetadata.syncedMorningPushups
              : 0,
          });

          updatedMetadata.pushupReps = sanitizedPushups;
          if (syncSucceeded) {
            updatedMetadata.syncedMorningPushups = sanitizedPushups;
          }
        }

        console.log('📍 Upserting with metadata:', updatedMetadata);

        // Upsert routine with updated metadata
        const { data: updatedRoutine, error: updateError } = await supabase
          .from('daily_routines')
          .upsert({
            user_id: patchSupabaseUserId,
            date: patchDate,
            routine_type: 'morning',
            metadata: updatedMetadata,
            items: existingRoutine?.items || [],
            completed_count: existingRoutine?.completed_count || 0,
            total_count: existingRoutine?.total_count || 0,
            completion_percentage: existingRoutine?.completion_percentage || 0
          }, {
            onConflict: 'user_id,date,routine_type',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (updateError) {
          console.error('Supabase update error:', updateError);
          return res.status(500).json({ error: 'Database error' });
        }

        console.log('📍 Successfully updated, returning:', updatedRoutine.metadata);

        return res.status(200).json({
          success: true,
          data: updatedRoutine.metadata
        });
      }
      default:
        res.setHeader('Allow', ['GET', 'PATCH']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Morning Routine Metadata API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
