-- CreateEnum
CREATE TYPE "public"."StreakType" AS ENUM ('LOGIN', 'CONTRIBUTION', 'SAVINGS', 'LOAN_PAYMENT', 'MEETING_ATTENDANCE', 'PROFILE_UPDATE', 'TRANSACTION', 'COMMUNITY_ENGAGEMENT');

-- CreateEnum
CREATE TYPE "public"."AchievementType" AS ENUM ('STREAK_MILESTONE', 'TOTAL_CONTRIBUTION', 'PERFECT_ATTENDANCE', 'EARLY_ADOPTER', 'COMMUNITY_CHAMPION', 'FINANCIAL_DISCIPLINE', 'LOYALTY_BADGE', 'SPECIAL_EVENT');

-- CreateEnum
CREATE TYPE "public"."LeaderboardPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ALL_TIME');

-- CreateTable
CREATE TABLE "public"."member_streaks" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "type" "public"."StreakType" NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."streak_activities" (
    "id" TEXT NOT NULL,
    "streakId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "activityType" "public"."StreakType" NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "amount" DECIMAL(10,2),
    "reference" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "streak_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."streak_achievements" (
    "id" TEXT NOT NULL,
    "streakId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "achievementType" "public"."AchievementType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badgeIcon" TEXT,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "streakCount" INTEGER,
    "totalAmount" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "streak_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."streak_leaderboards" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "streakType" "public"."StreakType" NOT NULL,
    "currentStreak" INTEGER NOT NULL,
    "longestStreak" INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "period" "public"."LeaderboardPeriod" NOT NULL DEFAULT 'ALL_TIME',
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "streak_leaderboards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "member_streaks_memberId_type_key" ON "public"."member_streaks"("memberId", "type");

-- CreateIndex
CREATE INDEX "streak_activities_memberId_activityDate_idx" ON "public"."streak_activities"("memberId", "activityDate");

-- CreateIndex
CREATE INDEX "streak_activities_streakId_activityDate_idx" ON "public"."streak_activities"("streakId", "activityDate");

-- CreateIndex
CREATE INDEX "streak_leaderboards_streakType_period_rank_idx" ON "public"."streak_leaderboards"("streakType", "period", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "streak_leaderboards_memberId_streakType_period_key" ON "public"."streak_leaderboards"("memberId", "streakType", "period");

-- AddForeignKey
ALTER TABLE "public"."member_streaks" ADD CONSTRAINT "member_streaks_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."streak_activities" ADD CONSTRAINT "streak_activities_streakId_fkey" FOREIGN KEY ("streakId") REFERENCES "public"."member_streaks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."streak_activities" ADD CONSTRAINT "streak_activities_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."streak_achievements" ADD CONSTRAINT "streak_achievements_streakId_fkey" FOREIGN KEY ("streakId") REFERENCES "public"."member_streaks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."streak_achievements" ADD CONSTRAINT "streak_achievements_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."streak_leaderboards" ADD CONSTRAINT "streak_leaderboards_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
