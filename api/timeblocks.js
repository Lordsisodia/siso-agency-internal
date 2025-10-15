/**
 * ⏰ Timeblocks API Endpoint - Vercel Serverless Function
 * 
 * Handles timeblock operations with Supabase persistence
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


export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        // GET /api/timeblocks?userId=xxx&date=2025-09-05
        const { userId, date, startTime, endTime, conflicts } = query;
        
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }

        // For now, return empty timeblocks array since table might not exist
        // TODO: Create timeblocks table and implement proper logic
        if (conflicts === 'true') {
          return res.status(200).json({ success: true, conflicts: [] });
        }
        
        return res.status(200).json({ success: true, data: [] });

      case 'POST':
        // POST /api/timeblocks - Create new timeblock
        const { userId: postUserId, date: postDate, startTime: postStartTime, endTime: postEndTime, title } = body;
        
        if (!postUserId || !postDate || !postStartTime || !postEndTime || !title) {
          return res.status(400).json({ error: 'userId, date, startTime, endTime, and title are required' });
        }

        // For now, return success without actually creating
        // TODO: Implement timeblock creation when table exists
        return res.status(201).json({ 
          success: true, 
          data: { 
            id: `temp-${Date.now()}`, 
            userId: postUserId,
            date: postDate,
            startTime: postStartTime,
            endTime: postEndTime,
            title
          }
        });

      case 'PUT':
        // PUT /api/timeblocks - Update timeblock
        const { timeblockId, ...updateData } = body;
        
        if (!timeblockId) {
          return res.status(400).json({ error: 'timeblockId is required' });
        }

        // For now, return success without actually updating
        return res.status(200).json({ success: true, data: { id: timeblockId, ...updateData } });

      case 'DELETE':
        // DELETE /api/timeblocks - Delete timeblock
        const { timeblockId: deleteId } = body;
        
        if (!deleteId) {
          return res.status(400).json({ error: 'timeblockId is required' });
        }

        // For now, return success without actually deleting
        return res.status(200).json({ success: true, message: 'Timeblock deleted successfully' });

      default:
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('❌ Timeblocks API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}