/**
 * 📊 Prisma Database Client
 * 
 * Centralized database client for all database operations
 */

import { prismaClient } from '@/integrations/prisma/client';

// Re-export the singleton instance
export const prisma = prismaClient;

// Re-export types from generated Prisma client
export type {
  User,
  PersonalTask,
  PersonalSubtask,
  PersonalContext,
  WorkType,
  Priority,
  TaskDifficulty,
  EisenhowerQuadrant,
  Prisma
} from '@prisma/client';

export default prisma;