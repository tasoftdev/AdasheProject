import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const type = searchParams.get('type');

    // If no memberId provided, get current user's member data
    let targetMemberId = memberId;
    if (!targetMemberId) {
      const currentMember = await prisma.member.findFirst({
        where: { user: { email: session.user.email! } }
      });
      if (!currentMember) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }
      targetMemberId = currentMember.id;
    }

    // Build query filters
    const where: any = { memberId: targetMemberId };
    if (type) {
      where.type = type;
    }

    // Get member streaks
    const streaks = await prisma.memberStreak.findMany({
      where,
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberCode: true,
            avatar: true
          }
        },
        activities: {
          orderBy: { activityDate: 'desc' },
          take: 5 // Latest 5 activities
        },
        achievements: {
          orderBy: { achievedAt: 'desc' },
          take: 3 // Latest 3 achievements
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Get summary statistics
    const stats = {
      totalStreaks: streaks.length,
      activeStreaks: streaks.filter(s => s.isActive).length,
      totalPoints: streaks.reduce((sum, s) => sum + s.totalPoints, 0),
      longestStreak: Math.max(...streaks.map(s => s.longestStreak), 0),
      currentActiveStreaks: streaks.filter(s => s.isActive && s.currentStreak > 0).length
    };

    return NextResponse.json({
      streaks,
      stats,
      success: true
    });
  } catch (error: any) {
    console.error('Error fetching streaks:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { memberId, type, activityData } = body;

    // Get member
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Record streak activity
    const result = await recordStreakActivity(memberId, type, activityData);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error recording streak activity:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to record streak activity
async function recordStreakActivity(
  memberId: string, 
  type: string, 
  activityData: any
) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return await prisma.$transaction(async (tx) => {
    // Find or create streak record
    let streak = await tx.memberStreak.findUnique({
      where: {
        memberId_type: {
          memberId,
          type: type as any
        }
      }
    });

    if (!streak) {
      streak = await tx.memberStreak.create({
        data: {
          memberId,
          type: type as any,
          currentStreak: 0,
          longestStreak: 0,
          isActive: true,
          totalPoints: 0,
          level: 1
        }
      });
    }

    // Check if activity already recorded today
    const existingActivity = await tx.streakActivity.findFirst({
      where: {
        streakId: streak.id,
        activityDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (existingActivity) {
      return { streak, activity: existingActivity, message: 'Activity already recorded today' };
    }

    // Calculate streak continuation
    let newCurrentStreak = 1;
    let streakContinued = false;

    if (streak.lastActivityDate) {
      const lastActivityDate = new Date(streak.lastActivityDate);
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      if (lastActivityDate >= yesterday && lastActivityDate < today) {
        // Streak continues
        newCurrentStreak = streak.currentStreak + 1;
        streakContinued = true;
      } else if (lastActivityDate < yesterday) {
        // Streak broken, start new
        newCurrentStreak = 1;
      }
    }

    // Calculate points based on activity type and streak
    let points = calculateStreakPoints(type, newCurrentStreak, activityData);

    // Record the activity
    const activity = await tx.streakActivity.create({
      data: {
        streakId: streak.id,
        memberId,
        activityType: type as any,
        activityDate: now,
        points,
        description: activityData.description || `${type} activity`,
        amount: activityData.amount || null,
        reference: activityData.reference || null,
        metadata: activityData.metadata || null
      }
    });

    // Update streak record
    const updatedStreak = await tx.memberStreak.update({
      where: { id: streak.id },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: Math.max(streak.longestStreak, newCurrentStreak),
        lastActivityDate: now,
        startDate: streak.startDate || (newCurrentStreak === 1 ? now : streak.startDate),
        isActive: true,
        totalPoints: streak.totalPoints + points,
        level: calculateLevel(streak.totalPoints + points)
      }
    });

    // Check for achievements
    await checkAndAwardAchievements(tx, updatedStreak, activity);

    // Update leaderboard
    await updateLeaderboard(tx, updatedStreak);

    return { streak: updatedStreak, activity, streakContinued };
  });
}

// Helper function to calculate points
function calculateStreakPoints(type: string, streakCount: number, activityData: any): number {
  const basePoints: Record<string, number> = {
    LOGIN: 1,
    CONTRIBUTION: 5,
    SAVINGS: 3,
    LOAN_PAYMENT: 4,
    MEETING_ATTENDANCE: 3,
    PROFILE_UPDATE: 2,
    TRANSACTION: 2,
    COMMUNITY_ENGAGEMENT: 4
  };

  let points = basePoints[type] || 1;
  
  // Bonus points for streak milestones
  if (streakCount >= 30) points *= 3;
  else if (streakCount >= 14) points *= 2.5;
  else if (streakCount >= 7) points *= 2;
  else if (streakCount >= 3) points *= 1.5;

  // Additional points for large contributions/savings amounts
  if (activityData.amount && (type === 'CONTRIBUTION' || type === 'SAVINGS')) {
    const amount = parseFloat(activityData.amount);
    if (amount >= 100000) points += 10;
    else if (amount >= 50000) points += 5;
    else if (amount >= 10000) points += 2;
  }

  return Math.round(points);
}

// Helper function to calculate level
function calculateLevel(totalPoints: number): number {
  if (totalPoints >= 10000) return 10;
  if (totalPoints >= 5000) return 9;
  if (totalPoints >= 2500) return 8;
  if (totalPoints >= 1000) return 7;
  if (totalPoints >= 500) return 6;
  if (totalPoints >= 250) return 5;
  if (totalPoints >= 100) return 4;
  if (totalPoints >= 50) return 3;
  if (totalPoints >= 20) return 2;
  return 1;
}

// Helper function to check and award achievements
async function checkAndAwardAchievements(tx: any, streak: any, activity: any) {
  const achievements = [];

  // Streak milestone achievements
  const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
  if (milestones.includes(streak.currentStreak)) {
    const existingAchievement = await tx.streakAchievement.findFirst({
      where: {
        memberId: streak.memberId,
        achievementType: 'STREAK_MILESTONE',
        streakCount: streak.currentStreak
      }
    });

    if (!existingAchievement) {
      const achievement = await tx.streakAchievement.create({
        data: {
          streakId: streak.id,
          memberId: streak.memberId,
          achievementType: 'STREAK_MILESTONE',
          title: `${streak.currentStreak} Day Streak`,
          description: `Maintained a ${streak.currentStreak}-day ${streak.type} streak!`,
          badgeIcon: getStreakBadgeIcon(streak.currentStreak),
          pointsAwarded: streak.currentStreak * 5,
          streakCount: streak.currentStreak
        }
      });
      achievements.push(achievement);
    }
  }

  // Update total points if achievements were awarded
  if (achievements.length > 0) {
    const totalPointsAwarded = achievements.reduce((sum, a) => sum + a.pointsAwarded, 0);
    await tx.memberStreak.update({
      where: { id: streak.id },
      data: {
        totalPoints: streak.totalPoints + totalPointsAwarded
      }
    });
  }

  return achievements;
}

// Helper function to get badge icon
function getStreakBadgeIcon(streakCount: number): string {
  if (streakCount >= 365) return '🏆';
  if (streakCount >= 180) return '💎';
  if (streakCount >= 90) return '🥇';
  if (streakCount >= 30) return '🥈';
  if (streakCount >= 14) return '🥉';
  if (streakCount >= 7) return '⭐';
  return '🔥';
}

// Helper function to update leaderboard
async function updateLeaderboard(tx: any, streak: any) {
  // Update all-time leaderboard
  await tx.streakLeaderboard.upsert({
    where: {
      memberId_streakType_period: {
        memberId: streak.memberId,
        streakType: streak.type,
        period: 'ALL_TIME'
      }
    },
    update: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalPoints: streak.totalPoints,
      updatedAt: new Date()
    },
    create: {
      memberId: streak.memberId,
      streakType: streak.type,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalPoints: streak.totalPoints,
      period: 'ALL_TIME',
      rank: 0 // Will be calculated separately
    }
  });

  // Update monthly leaderboard
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  await tx.streakLeaderboard.upsert({
    where: {
      memberId_streakType_period: {
        memberId: streak.memberId,
        streakType: streak.type,
        period: 'MONTHLY'
      }
    },
    update: {
      currentStreak: streak.currentStreak,
      totalPoints: streak.totalPoints,
      updatedAt: new Date()
    },
    create: {
      memberId: streak.memberId,
      streakType: streak.type,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalPoints: streak.totalPoints,
      period: 'MONTHLY',
      periodStart: monthStart,
      periodEnd: monthEnd,
      rank: 0
    }
  });
}