-- CreateEnum
CREATE TYPE "public"."RoutineType" AS ENUM ('MORNING', 'EVENING');

-- CreateEnum
CREATE TYPE "public"."TimeBlockCategory" AS ENUM ('DEEP_WORK', 'LIGHT_WORK', 'MEETING', 'BREAK', 'PERSONAL', 'HEALTH', 'LEARNING', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."daily_routines" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "routineType" "public"."RoutineType" NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_health" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "healthChecklist" JSONB NOT NULL DEFAULT '[]',
    "meals" JSONB NOT NULL DEFAULT '{}',
    "macros" JSONB NOT NULL DEFAULT '{}',
    "waterIntakeMl" INTEGER NOT NULL DEFAULT 0,
    "milkIntakeMl" INTEGER NOT NULL DEFAULT 0,
    "sleepHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "energyLevel" INTEGER,
    "moodLevel" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_workouts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "exercises" JSONB NOT NULL DEFAULT '[]',
    "totalExercises" INTEGER NOT NULL DEFAULT 0,
    "completedExercises" INTEGER NOT NULL DEFAULT 0,
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durationMinutes" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_habits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "screenTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "bullshitContentMinutes" INTEGER NOT NULL DEFAULT 0,
    "noWeed" BOOLEAN NOT NULL DEFAULT false,
    "noScrolling" BOOLEAN NOT NULL DEFAULT false,
    "deepWorkHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lightWorkHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "habitsData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_reflections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "wentWell" TEXT[],
    "evenBetterIf" TEXT[],
    "analysis" TEXT[],
    "patterns" TEXT[],
    "changes" TEXT[],
    "overallRating" INTEGER,
    "keyLearnings" TEXT,
    "tomorrowFocus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_reflections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."time_blocks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."TimeBlockCategory" NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "actualStart" TEXT,
    "actualEnd" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_routines_userId_date_idx" ON "public"."daily_routines"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_routines_userId_date_routineType_key" ON "public"."daily_routines"("userId", "date", "routineType");

-- CreateIndex
CREATE INDEX "daily_health_userId_date_idx" ON "public"."daily_health"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_health_userId_date_key" ON "public"."daily_health"("userId", "date");

-- CreateIndex
CREATE INDEX "daily_workouts_userId_date_idx" ON "public"."daily_workouts"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_workouts_userId_date_key" ON "public"."daily_workouts"("userId", "date");

-- CreateIndex
CREATE INDEX "daily_habits_userId_date_idx" ON "public"."daily_habits"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_habits_userId_date_key" ON "public"."daily_habits"("userId", "date");

-- CreateIndex
CREATE INDEX "daily_reflections_userId_date_idx" ON "public"."daily_reflections"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_reflections_userId_date_key" ON "public"."daily_reflections"("userId", "date");

-- CreateIndex
CREATE INDEX "time_blocks_userId_date_idx" ON "public"."time_blocks"("userId", "date");

-- CreateIndex
CREATE INDEX "time_blocks_userId_date_startTime_idx" ON "public"."time_blocks"("userId", "date", "startTime");

-- AddForeignKey
ALTER TABLE "public"."daily_routines" ADD CONSTRAINT "daily_routines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_health" ADD CONSTRAINT "daily_health_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_workouts" ADD CONSTRAINT "daily_workouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_habits" ADD CONSTRAINT "daily_habits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_reflections" ADD CONSTRAINT "daily_reflections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."time_blocks" ADD CONSTRAINT "time_blocks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
