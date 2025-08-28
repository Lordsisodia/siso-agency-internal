/**
 * 🌅 Morning Routine Vercel Serverless Function
 * 
 * Works with Vite frontend on Vercel
 */

import { PrismaClient } from '../generated/prisma/index.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const prisma = new PrismaClient();

// Helper function to ensure user exists
async function ensureUserExists(userId) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (existingUser) {
      return existingUser;
    }
    
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@clerk.generated`,
        supabaseId: userId
      }
    });
    
    return newUser;
  } catch (error) {
    console.error('Failed to ensure user exists:', error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        const { userId, date } = req.query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        // Get morning routine data for the specific date
        let routine = await prisma.morningRoutineTracking.findUnique({
          where: { 
            userId_date: {
              userId: userId,
              date: date
            }
          }
        });

        // If no routine exists, create default one
        if (!routine) {
          await ensureUserExists(userId);
          routine = await prisma.morningRoutineTracking.create({
            data: {
              userId: userId,
              date: date,
              wakeUpEarly: false,
              hydration: false,
              meditation: false,
              exercise: false,
              journaling: false,
              planning: false,
              reading: false,
              gratitude: false
            }
          });
        }

        return res.status(200).json({ success: true, data: routine });

      case 'PATCH':
        const { userId: patchUserId, date: patchDate, habitName, completed } = req.body;
        if (!patchUserId || !patchDate || !habitName || typeof completed !== 'boolean') {
          return res.status(400).json({ error: 'userId, date, habitName, and completed are required' });
        }
        
        await ensureUserExists(patchUserId);
        const updateData = { [habitName]: completed };
        
        const updatedRoutine = await prisma.morningRoutineTracking.upsert({
          where: {
            userId_date: {
              userId: patchUserId,
              date: patchDate
            }
          },
          update: updateData,
          create: {
            userId: patchUserId,
            date: patchDate,
            wakeUpEarly: habitName === 'wakeUpEarly' ? completed : false,
            hydration: habitName === 'hydration' ? completed : false,
            meditation: habitName === 'meditation' ? completed : false,
            exercise: habitName === 'exercise' ? completed : false,
            journaling: habitName === 'journaling' ? completed : false,
            planning: habitName === 'planning' ? completed : false,
            reading: habitName === 'reading' ? completed : false,
            gratitude: habitName === 'gratitude' ? completed : false,
            ...updateData
          }
        });

        return res.status(200).json({ success: true, data: updatedRoutine });

      default:
        res.setHeader('Allow', ['GET', 'PATCH']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Morning Routine API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  } finally {
    await prisma.$disconnect();
  }
}