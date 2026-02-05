/**
 * Prisma Client for Type-Safe Database Access
 *
 * This provides a "database in code" experience over Supabase.
 * It's READ-ONLY for now - use Supabase client for writes.
 *
 * Benefits:
 * - Full TypeScript types from your schema
 * - Auto-completion in IDEs
 * - Type-safe queries
 * - No manual type definitions needed
 *
 * Usage:
 *   import { prisma } from '@/lib/services/prisma/client';
 *
 *   const tasks = await prisma.lightWorkTask.findMany({
 *     where: { userId: '123' },
 *     include: { subtasks: true }
 *   });
 */

import { PrismaClient } from '@/generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Re-export types for convenience
export type {
  LightWorkTask,
  LightWorkSubtask,
  DeepWorkTask,
  DeepWorkSubtask,
  MorningRoutineTask,
  DailyReflection,
  UserFeedback,
  Priority,
  FeedbackCategory,
  FeedbackType,
  FeedbackStatus,
} from '@/generated/prisma';
