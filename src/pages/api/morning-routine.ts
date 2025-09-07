/**
 * 🌅 Morning Routine API Endpoint
 * 
 * HTTP API for morning routine operations with Supabase database persistence
 */

import { createClient } from '@supabase/supabase-js';

// Supabase client - works with the existing database
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://avdgyrepwrvsvwgxrccr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGd5cmVwd3J2c3Z3Z3hyY2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzgwODIsImV4cCI6MjA1OTIxNDA4Mn0.8MZ2etAhQ1pTJnK84uoqAFfUirv_kaoYcmKHhKgLAWU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to ensure user exists
async function ensureUserExists(userId: string) {
  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (existingUser) {
      return existingUser;
    }
    
    // Create user with default email if not exists
    console.log(`🔧 Auto-creating user: ${userId}`);
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: `${userId}@clerk.generated`
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
    
    console.log(`✅ Auto-created user: ${userId}`);
    return newUser;
  } catch (error) {
    console.error('Failed to ensure user exists:', error);
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
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
        
        // Get morning routine data for the specific date using Supabase
        const { data: routine } = await supabase
          .from('daily_routines')
          .select('*')
          .eq('user_id', userId)
          .eq('date', date)
          .eq('routine_type', 'MORNING')
          .single();

        // If no routine exists, create default one
        let finalRoutine = routine;
        if (!routine) {
          // Ensure user exists first
          await ensureUserExists(userId);
          
          const defaultMorningRoutineItems = [
            { name: 'wakeUp', completed: false },
            { name: 'getBloodFlowing', completed: false },
            { name: 'freshenUp', completed: false },
            { name: 'powerUpBrain', completed: false },
            { name: 'planDay', completed: false },
            { name: 'meditation', completed: false },
            { name: 'pushups', completed: false },
            { name: 'situps', completed: false },
            { name: 'pullups', completed: false },
            { name: 'bathroom', completed: false },
            { name: 'brushTeeth', completed: false },
            { name: 'coldShower', completed: false },
            { name: 'water', completed: false },
            { name: 'supplements', completed: false },
            { name: 'preworkout', completed: false },
            { name: 'thoughtDump', completed: false },
            { name: 'planDeepWork', completed: false },
            { name: 'planLightWork', completed: false },
            { name: 'setTimebox', completed: false }
          ];

          const { data: newRoutine, error } = await supabase
            .from('daily_routines')
            .insert({
              user_id: userId,
              date: date,
              routine_type: 'MORNING',
              items: defaultMorningRoutineItems,
              total_count: defaultMorningRoutineItems.length,
              completed_count: 0,
              completion_percentage: 0
            })
            .select()
            .single();

          if (error) {
            console.error('Failed to create routine:', error);
            throw error;
          }

          finalRoutine = newRoutine;
        }

        return res.status(200).json({ success: true, data: finalRoutine });

      case 'PATCH':
        // PATCH /api/morning-routine - Update morning routine habit completion
        const { userId: patchUserId, date: patchDate, habitName, completed } = body;
        if (!patchUserId || !patchDate || !habitName || typeof completed !== 'boolean') {
          return res.status(400).json({ error: 'userId, date, habitName, and completed are required' });
        }
        
        // Get existing routine or create if doesn't exist
        const { data: existingRoutine } = await supabase
          .from('daily_routines')
          .select('*')
          .eq('user_id', patchUserId)
          .eq('date', patchDate)
          .eq('routine_type', 'MORNING')
          .single();
        
        let workingRoutine = existingRoutine;
        if (!existingRoutine) {
          // Ensure user exists and create default routine
          await ensureUserExists(patchUserId);
          const defaultItems = [
            { name: 'wakeUp', completed: false }, { name: 'getBloodFlowing', completed: false },
            { name: 'freshenUp', completed: false }, { name: 'powerUpBrain', completed: false },
            { name: 'planDay', completed: false }, { name: 'meditation', completed: false },
            { name: 'pushups', completed: false }, { name: 'situps', completed: false },
            { name: 'pullups', completed: false }, { name: 'bathroom', completed: false },
            { name: 'brushTeeth', completed: false }, { name: 'coldShower', completed: false },
            { name: 'water', completed: false }, { name: 'supplements', completed: false },
            { name: 'preworkout', completed: false }, { name: 'thoughtDump', completed: false },
            { name: 'planDeepWork', completed: false }, { name: 'planLightWork', completed: false },
            { name: 'setTimebox', completed: false }
          ];
          
          const { data: newRoutine, error } = await supabase
            .from('daily_routines')
            .insert({
              user_id: patchUserId,
              date: patchDate,
              routine_type: 'MORNING',
              items: defaultItems,
              total_count: defaultItems.length,
              completed_count: 0,
              completion_percentage: 0
            })
            .select()
            .single();

          if (error) {
            console.error('Failed to create routine:', error);
            throw error;
          }

          workingRoutine = newRoutine;
        }
        
        // Update the specific habit in the items array
        const items = workingRoutine.items as Array<{ name: string; completed: boolean }>;
        const habitIndex = items.findIndex(item => item.name === habitName);
        
        if (habitIndex === -1) {
          return res.status(400).json({ error: 'Habit not found' });
        }
        
        // Update the specific habit
        items[habitIndex].completed = completed;
        
        // Recalculate completion stats
        const completedCount = items.filter(item => item.completed).length;
        const completionPercentage = Math.round((completedCount / items.length) * 100);
        
        // Update the routine using Supabase
        const { data: updatedRoutine, error } = await supabase
          .from('daily_routines')
          .update({
            items: items,
            completed_count: completedCount,
            completion_percentage: completionPercentage
          })
          .eq('id', workingRoutine.id)
          .select()
          .single();

        if (error) {
          console.error('Failed to update routine:', error);
          throw error;
        }

        return res.status(200).json({ success: true, data: updatedRoutine });

      default:
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('❌ Morning Routine API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}