/**
 * 🌅 Morning Routine API - Simplified for Vercel
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // For now, return mock data to test if the function works
    const mockData = {
      id: '1',
      userId: req.query.userId as string,
      date: req.query.date as string,
      wakeUpEarly: false,
      hydration: false,
      meditation: false,
      exercise: false,
      journaling: false,
      planning: false,
      reading: false,
      gratitude: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    switch (req.method) {
      case 'GET':
        const { userId, date } = req.query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        return res.status(200).json({ 
          success: true, 
          data: mockData,
          message: 'Morning routine API is working! (Using mock data for now)' 
        });

      case 'PATCH':
        const { userId: patchUserId, date: patchDate, habitName, completed } = req.body;
        if (!patchUserId || !patchDate || !habitName || typeof completed !== 'boolean') {
          return res.status(400).json({ error: 'userId, date, habitName, and completed are required' });
        }
        
        const updatedMockData = { 
          ...mockData, 
          [habitName]: completed,
          updatedAt: new Date().toISOString()
        };

        return res.status(200).json({ 
          success: true, 
          data: updatedMockData,
          message: 'Habit updated successfully! (Mock data)' 
        });

      default:
        res.setHeader('Allow', ['GET', 'PATCH']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Morning Routine API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error',
      debug: 'Function is running but caught an error'
    });
  }
}