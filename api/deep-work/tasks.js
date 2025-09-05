/**
 * 🧠 Deep Work Tasks API Endpoint - Vercel Serverless Function
 * 
 * HTTP API for Deep Work task operations with Supabase persistence
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        // GET /api/deep-work/tasks?userId=xxx&date=2025-08-31
        const { userId, date } = query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        // Convert Clerk ID to Supabase UUID
        const supabaseUserId = await getSupabaseUserId(userId);
        if (!supabaseUserId) {
          return res.status(200).json({ success: true, data: [] });
        }
        
        // Get deep work tasks from Supabase
        const { data: tasks, error } = await supabase
          .from('deep_work_tasks')
          .select('*')
          .eq('user_id', supabaseUserId)
          .eq('task_date', date)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: 'Database error' });
        }
        
        return res.status(200).json({ success: true, data: tasks || [] });

      case 'POST':
        // POST /api/deep-work/tasks - Create new deep work task
        const { 
          userId: postUserId, 
          date: postDate, 
          title, 
          description, 
          priority = 'HIGH',
          estimatedMinutes = 120
        } = body;
        
        if (!postUserId || !postDate || !title) {
          return res.status(400).json({ error: 'userId, date, and title are required' });
        }

        // Convert Clerk ID to Supabase UUID for POST
        const postSupabaseUserId = await getSupabaseUserId(postUserId);
        if (!postSupabaseUserId) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Create deep work task in Supabase
        const taskData = {
          user_id: postSupabaseUserId,
          title,
          description: description || '',
          priority,
          estimated_duration: estimatedMinutes,
          original_date: postDate,
          task_date: postDate,
          completed: false
        };

        const { data: newTask, error: insertError } = await supabase
          .from('deep_work_tasks')
          .insert(taskData)
          .select()
          .single();

        if (insertError) {
          console.error('Supabase error:', insertError);
          return res.status(500).json({ error: 'Database error' });
        }
        
        return res.status(201).json({ success: true, data: newTask });

      case 'PUT':
        // PUT /api/deep-work/tasks - Update deep work task
        const { taskId, completed, title: updateTitle } = body;
        if (!taskId) {
          return res.status(400).json({ error: 'taskId is required' });
        }
        
        const updateData = {};
        if (completed !== undefined) {
          updateData.completed = completed;
          if (completed) {
            updateData.completed_at = new Date().toISOString();
          }
        }
        if (updateTitle !== undefined) {
          updateData.title = updateTitle;
        }

        const { data: updatedTask, error: updateError } = await supabase
          .from('deep_work_tasks')
          .update(updateData)
          .eq('id', taskId)
          .select()
          .single();

        if (updateError) {
          console.error('Supabase error:', updateError);
          return res.status(500).json({ error: 'Database error' });
        }
        
        return res.status(200).json({ success: true, data: updatedTask });

      case 'DELETE':
        // DELETE /api/deep-work/tasks - Delete deep work task
        const { taskId: deleteTaskId } = body;
        if (!deleteTaskId) {
          return res.status(400).json({ error: 'taskId is required' });
        }
        
        const { error: deleteError } = await supabase
          .from('deep_work_tasks')
          .delete()
          .eq('id', deleteTaskId);

        if (deleteError) {
          console.error('Supabase error:', deleteError);
          return res.status(500).json({ error: 'Database error' });
        }
        
        return res.status(200).json({ success: true, message: 'Task deleted successfully' });

      default:
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('❌ Deep Work Tasks API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}