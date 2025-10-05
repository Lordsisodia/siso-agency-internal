-- CreateEnum
CREATE TYPE "public"."TaskDifficulty" AS ENUM ('TRIVIAL', 'EASY', 'MODERATE', 'HARD', 'EXPERT');

-- AlterTable
ALTER TABLE "public"."personal_subtasks" ADD COLUMN     "aiAnalyzed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiReasoning" TEXT,
ADD COLUMN     "analyzedAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "complexity" INTEGER,
ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "contextualBonus" INTEGER,
ADD COLUMN     "difficulty" "public"."TaskDifficulty",
ADD COLUMN     "learningValue" INTEGER,
ADD COLUMN     "priorityRank" INTEGER,
ADD COLUMN     "strategicImportance" INTEGER,
ADD COLUMN     "xpReward" INTEGER;

-- AlterTable
ALTER TABLE "public"."personal_tasks" ADD COLUMN     "aiAnalyzed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiReasoning" TEXT,
ADD COLUMN     "analyzedAt" TIMESTAMP(3),
ADD COLUMN     "complexity" INTEGER,
ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "contextualBonus" INTEGER,
ADD COLUMN     "difficulty" "public"."TaskDifficulty",
ADD COLUMN     "learningValue" INTEGER,
ADD COLUMN     "priorityRank" INTEGER,
ADD COLUMN     "strategicImportance" INTEGER,
ADD COLUMN     "timeEstimate" TEXT,
ADD COLUMN     "xpReward" INTEGER;

-- CreateTable
CREATE TABLE "public"."personal_contexts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentGoals" TEXT,
    "skillPriorities" TEXT,
    "revenueTargets" TEXT,
    "timeConstraints" TEXT,
    "currentProjects" TEXT,
    "hatedTasks" TEXT,
    "valuedTasks" TEXT,
    "learningObjectives" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personal_contexts_userId_key" ON "public"."personal_contexts"("userId");

-- CreateIndex
CREATE INDEX "personal_subtasks_taskId_completed_idx" ON "public"."personal_subtasks"("taskId", "completed");

-- CreateIndex
CREATE INDEX "personal_subtasks_taskId_aiAnalyzed_idx" ON "public"."personal_subtasks"("taskId", "aiAnalyzed");

-- CreateIndex
CREATE INDEX "personal_tasks_userId_aiAnalyzed_idx" ON "public"."personal_tasks"("userId", "aiAnalyzed");

-- AddForeignKey
ALTER TABLE "public"."personal_contexts" ADD CONSTRAINT "personal_contexts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
