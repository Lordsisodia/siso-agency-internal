/**
 * 📊 Daily Reflections API Endpoint
 * 
 * HTTP API for nightly checkout data persistence with proper daily reset logic
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
        // GET /api/daily-reflections?userId=xxx&date=2025-08-31
        const { userId, date } = query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        // Get daily reflections for the specific date
        const reflections = await prisma.dailyReflections.findUnique({
          where: {
            userId_date: {
              userId: userId,
              date: date
            }
          }
        });

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
        
        // Ensure user exists first
        await ensureUserExists(postUserId);

        // Save daily reflections using correct model name
        const savedReflections = await prisma.dailyReflections.upsert({
          where: {
            userId_date: {
              userId: postUserId,
              date: postDate
            }
          },
          update: {
            wentWell: wentWell,
            evenBetterIf: evenBetterIf,
            analysis: analysis,
            patterns: patterns,
            changes: changes,
            overallRating: overallRating,
            keyLearnings: keyLearnings,
            tomorrowFocus: tomorrowFocus,
            updatedAt: new Date()
          },
          create: {
            userId: postUserId,
            date: postDate,
            wentWell: wentWell || [],
            evenBetterIf: evenBetterIf || [],
            analysis: analysis || [],
            patterns: patterns || [],
            changes: changes || [],
            overallRating: overallRating,
            keyLearnings: keyLearnings,
            tomorrowFocus: tomorrowFocus
          }
        });
        
        return res.status(200).json({ success: true, data: savedReflections });

      default:
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('❌ Daily Reflections API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}