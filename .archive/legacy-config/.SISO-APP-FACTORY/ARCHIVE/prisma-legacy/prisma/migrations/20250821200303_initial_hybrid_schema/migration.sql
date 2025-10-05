-- CreateEnum
CREATE TYPE "public"."WorkType" AS ENUM ('DEEP', 'LIGHT');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('CRITICAL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "public"."EisenhowerQuadrant" AS ENUM ('DO_FIRST', 'SCHEDULE', 'DELEGATE', 'ELIMINATE');

-- CreateEnum
CREATE TYPE "public"."AchievementCategory" AS ENUM ('STREAK', 'POINTS', 'COMPLETION', 'CONSISTENCY');

-- CreateEnum
CREATE TYPE "public"."AutomationCategory" AS ENUM ('DEVELOPMENT', 'TESTING', 'DEPLOYMENT', 'ANALYSIS', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."AutomationStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."personal_tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "workType" "public"."WorkType" NOT NULL,
    "priority" "public"."Priority" NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "originalDate" TEXT NOT NULL,
    "currentDate" TEXT NOT NULL,
    "estimatedDuration" INTEGER,
    "rollovers" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "personal_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."personal_subtasks" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "workType" "public"."WorkType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_subtasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."eisenhower_analysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "quadrant" "public"."EisenhowerQuadrant" NOT NULL,
    "urgentScore" INTEGER NOT NULL,
    "importanceScore" INTEGER NOT NULL,
    "reasoning" TEXT NOT NULL,
    "recommendations" TEXT[],
    "originalPosition" INTEGER,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eisenhower_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."voice_processing_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "deepTasks" INTEGER NOT NULL DEFAULT 0,
    "lightTasks" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "processingTimeMs" INTEGER,

    CONSTRAINT "voice_processing_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "dailyXP" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."achievements" (
    "id" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "category" "public"."AchievementCategory" NOT NULL,
    "requirement" INTEGER NOT NULL,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "maxProgress" INTEGER NOT NULL,
    "unlockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_stats" (
    "id" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "activitiesCompleted" INTEGER NOT NULL DEFAULT 0,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "routineXP" INTEGER NOT NULL DEFAULT 0,
    "taskXP" INTEGER NOT NULL DEFAULT 0,
    "healthXP" INTEGER NOT NULL DEFAULT 0,
    "focusXP" INTEGER NOT NULL DEFAULT 0,
    "habitXP" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."automation_tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."AutomationCategory" NOT NULL,
    "priority" "public"."Priority" NOT NULL,
    "status" "public"."AutomationStatus" NOT NULL DEFAULT 'PENDING',
    "prompt" TEXT NOT NULL,
    "allowedTools" JSONB NOT NULL DEFAULT '[]',
    "estimatedTokens" INTEGER NOT NULL DEFAULT 0,
    "actualTokens" INTEGER,
    "executionTimeMs" INTEGER,
    "result" TEXT,
    "error" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "automation_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_supabaseId_key" ON "public"."users"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "personal_tasks_userId_currentDate_idx" ON "public"."personal_tasks"("userId", "currentDate");

-- CreateIndex
CREATE INDEX "personal_tasks_userId_completed_idx" ON "public"."personal_tasks"("userId", "completed");

-- CreateIndex
CREATE INDEX "personal_tasks_userId_workType_idx" ON "public"."personal_tasks"("userId", "workType");

-- CreateIndex
CREATE UNIQUE INDEX "eisenhower_analysis_taskId_key" ON "public"."eisenhower_analysis"("taskId");

-- CreateIndex
CREATE INDEX "eisenhower_analysis_userId_quadrant_idx" ON "public"."eisenhower_analysis"("userId", "quadrant");

-- CreateIndex
CREATE INDEX "voice_processing_history_userId_processedAt_idx" ON "public"."voice_processing_history"("userId", "processedAt");

-- CreateIndex
CREATE INDEX "voice_processing_history_userId_success_idx" ON "public"."voice_processing_history"("userId", "success");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_key" ON "public"."user_progress"("userId");

-- CreateIndex
CREATE INDEX "achievements_progressId_unlocked_idx" ON "public"."achievements"("progressId", "unlocked");

-- CreateIndex
CREATE INDEX "daily_stats_progressId_date_idx" ON "public"."daily_stats"("progressId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_stats_progressId_date_key" ON "public"."daily_stats"("progressId", "date");

-- CreateIndex
CREATE INDEX "automation_tasks_userId_status_idx" ON "public"."automation_tasks"("userId", "status");

-- CreateIndex
CREATE INDEX "automation_tasks_userId_category_idx" ON "public"."automation_tasks"("userId", "category");

-- AddForeignKey
ALTER TABLE "public"."personal_tasks" ADD CONSTRAINT "personal_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."personal_subtasks" ADD CONSTRAINT "personal_subtasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."personal_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."eisenhower_analysis" ADD CONSTRAINT "eisenhower_analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."eisenhower_analysis" ADD CONSTRAINT "eisenhower_analysis_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."personal_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."voice_processing_history" ADD CONSTRAINT "voice_processing_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."achievements" ADD CONSTRAINT "achievements_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "public"."user_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_stats" ADD CONSTRAINT "daily_stats_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "public"."user_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."automation_tasks" ADD CONSTRAINT "automation_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
