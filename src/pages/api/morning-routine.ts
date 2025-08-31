/**
 * 🌅 Morning Routine API Endpoint
 * 
 * HTTP API for morning routine operations with real database persistence
 */

import { PrismaClient } from '@prisma/client';

// Universal Prisma client - works locally and on Vercel
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper function to ensure user exists
async function ensureUserExists(userId: string) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (existingUser) {
      return existingUser;
    }
    
    // Create user with default email if not exists
    console.log(`🔧 Auto-creating user: ${userId}`);
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@clerk.generated`,
        supabaseId: userId
      }
    });
    
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
        
        // Get morning routine data for the specific date using DailyRoutine model
        let routine = await prisma.dailyRoutine.findUnique({
          where: { 
            userId_date_routineType: {
              userId: userId,
              date: date,
              routineType: 'MORNING'
            }
          }
        });

        // If no routine exists, create default one
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

          routine = await prisma.dailyRoutine.create({
            data: {
              userId: userId,
              date: date,
              routineType: 'MORNING',
              items: defaultMorningRoutineItems,
              totalCount: defaultMorningRoutineItems.length,
              completedCount: 0,
              completionPercentage: 0
            }
          });
        }

        return res.status(200).json({ success: true, data: routine });

      case 'PATCH':
        // PATCH /api/morning-routine - Update morning routine habit completion
        const { userId: patchUserId, date: patchDate, habitName, completed } = body;
        if (!patchUserId || !patchDate || !habitName || typeof completed !== 'boolean') {
          return res.status(400).json({ error: 'userId, date, habitName, and completed are required' });
        }
        
        // Get existing routine or create if doesn't exist
        let existingRoutine = await prisma.dailyRoutine.findUnique({
          where: { 
            userId_date_routineType: {
              userId: patchUserId,
              date: patchDate,
              routineType: 'MORNING'
            }
          }
        });
        
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
          
          existingRoutine = await prisma.dailyRoutine.create({
            data: {
              userId: patchUserId,
              date: patchDate,
              routineType: 'MORNING',
              items: defaultItems,
              totalCount: defaultItems.length,
              completedCount: 0,
              completionPercentage: 0
            }
          });
        }
        
        // Update the specific habit in the items array
        const items = existingRoutine.items as Array<{ name: string; completed: boolean }>;
        const habitIndex = items.findIndex(item => item.name === habitName);
        
        if (habitIndex === -1) {
          return res.status(400).json({ error: 'Habit not found' });
        }
        
        // Update the specific habit
        items[habitIndex].completed = completed;
        
        // Recalculate completion stats
        const completedCount = items.filter(item => item.completed).length;
        const completionPercentage = Math.round((completedCount / items.length) * 100);
        
        // Update the routine
        const updatedRoutine = await prisma.dailyRoutine.update({
          where: { id: existingRoutine.id },
          data: {
            items: items,
            completedCount,
            completionPercentage
          }
        });

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