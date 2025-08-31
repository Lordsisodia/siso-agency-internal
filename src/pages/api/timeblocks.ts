/**
 * 🕐 TimeBlocks API
 * 
 * Complete CRUD API for time block management with conflict detection
 * Handles scheduling, duration validation, and real-time updates
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, TimeBlockCategory } from '../../../generated/prisma/index.js';

const prisma = new PrismaClient();

// Types for time block operations
export interface TimeBlockInput {
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  category: TimeBlockCategory;
  userId: string;
  notes?: string;
}

export interface TimeBlockConflict {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  conflictType: 'overlap' | 'adjacent';
}

// Helper function to validate time format and logic
function validateTimeBlock(data: TimeBlockInput): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Time format validation
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(data.startTime)) {
    errors.push('Invalid start time format. Use HH:MM format.');
  }
  if (!timeRegex.test(data.endTime)) {
    errors.push('Invalid end time format. Use HH:MM format.');
  }
  
  // Date format validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.date)) {
    errors.push('Invalid date format. Use YYYY-MM-DD format.');
  }
  
  // Time logic validation
  if (data.startTime >= data.endTime) {
    errors.push('Start time must be before end time.');
  }
  
  // Duration validation (minimum 5 minutes, maximum 12 hours)
  const [startHour, startMin] = data.startTime.split(':').map(Number);
  const [endHour, endMin] = data.endTime.split(':').map(Number);
  const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  
  if (durationMinutes < 5) {
    errors.push('Time block must be at least 5 minutes long.');
  }
  if (durationMinutes > 12 * 60) {
    errors.push('Time block cannot be longer than 12 hours.');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Helper function to detect conflicts
async function detectConflicts(
  userId: string, 
  date: string, 
  startTime: string, 
  endTime: string, 
  excludeId?: string
): Promise<TimeBlockConflict[]> {
  const existingBlocks = await prisma.timeBlock.findMany({
    where: {
      userId,
      date,
      ...(excludeId ? { id: { not: excludeId } } : {})
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true
    }
  });
  
  const conflicts: TimeBlockConflict[] = [];
  
  for (const block of existingBlocks) {
    // Check for overlaps
    if (
      (startTime < block.endTime && endTime > block.startTime) ||
      (block.startTime < endTime && block.endTime > startTime)
    ) {
      conflicts.push({
        id: block.id,
        title: block.title,
        startTime: block.startTime,
        endTime: block.endTime,
        conflictType: 'overlap'
      });
    }
  }
  
  return conflicts;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('TimeBlocks API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

// GET /api/timeblocks?userId=xxx&date=YYYY-MM-DD
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { userId, date, conflicts } = req.query;
  
  if (!userId || !date) {
    return res.status(400).json({ 
      error: 'Missing required parameters: userId and date' 
    });
  }
  
  // If conflicts check is requested
  if (conflicts === 'true') {
    const { startTime, endTime, excludeId } = req.query;
    if (!startTime || !endTime) {
      return res.status(400).json({ 
        error: 'startTime and endTime required for conflict detection' 
      });
    }
    
    const conflictList = await detectConflicts(
      userId as string,
      date as string,
      startTime as string,
      endTime as string,
      excludeId as string
    );
    
    return res.status(200).json({ conflicts: conflictList });
  }
  
  // Regular fetch
  const timeBlocks = await prisma.timeBlock.findMany({
    where: {
      userId: userId as string,
      date: date as string
    },
    orderBy: {
      startTime: 'asc'
    }
  });
  
  return res.status(200).json({ success: true, data: timeBlocks });
}

// POST /api/timeblocks
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const data: TimeBlockInput = req.body;
  
  // Validation
  const validation = validateTimeBlock(data);
  if (!validation.isValid) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: validation.errors 
    });
  }
  
  // Conflict detection
  const conflicts = await detectConflicts(
    data.userId,
    data.date,
    data.startTime,
    data.endTime
  );
  
  if (conflicts.length > 0) {
    return res.status(409).json({ 
      error: 'Time block conflicts detected', 
      conflicts 
    });
  }
  
  // Create time block
  const timeBlock = await prisma.timeBlock.create({
    data: {
      title: data.title,
      description: data.description,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      category: data.category,
      userId: data.userId,
      notes: data.notes
    }
  });
  
  return res.status(201).json({ success: true, data: timeBlock });
}

// PUT /api/timeblocks?id=xxx
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const data: Partial<TimeBlockInput> & { completed?: boolean; actualStart?: string; actualEnd?: string } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'Missing time block ID' });
  }
  
  // Check if time block exists
  const existingBlock = await prisma.timeBlock.findUnique({
    where: { id: id as string }
  });
  
  if (!existingBlock) {
    return res.status(404).json({ error: 'Time block not found' });
  }
  
  // If updating time-related fields, validate
  if (data.startTime || data.endTime || data.date) {
    const updateData = {
      ...existingBlock,
      ...data
    };
    
    const validation = validateTimeBlock(updateData as TimeBlockInput);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      });
    }
    
    // Check for conflicts (excluding current block)
    const conflicts = await detectConflicts(
      existingBlock.userId,
      updateData.date,
      updateData.startTime,
      updateData.endTime,
      id as string
    );
    
    if (conflicts.length > 0) {
      return res.status(409).json({ 
        error: 'Time block conflicts detected', 
        conflicts 
      });
    }
  }
  
  // Update time block
  const updatedTimeBlock = await prisma.timeBlock.update({
    where: { id: id as string },
    data
  });
  
  return res.status(200).json({ success: true, data: updatedTimeBlock });
}

// DELETE /api/timeblocks?id=xxx
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Missing time block ID' });
  }
  
  // Check if time block exists
  const existingBlock = await prisma.timeBlock.findUnique({
    where: { id: id as string }
  });
  
  if (!existingBlock) {
    return res.status(404).json({ error: 'Time block not found' });
  }
  
  // Delete time block
  await prisma.timeBlock.delete({
    where: { id: id as string }
  });
  
  return res.status(200).json({ 
    success: true,
    data: { 
      message: 'Time block deleted successfully',
      deletedId: id
    }
  });
}