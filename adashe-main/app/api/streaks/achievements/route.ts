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

    // Get member achievements
    const achievements = await prisma.streakAchievement.findMany({
      where: { memberId: targetMemberId },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberCode: true,
            avatar: true
          }
        },
        streak: {
          select: {
            type: true,
            currentStreak: true,
            longestStreak: true,
            totalPoints: true
          }
        }
      },
      orderBy: { achievedAt: 'desc' }
    });

    // Group achievements by type
    const groupedAchievements = achievements.reduce((acc, achievement) => {
      const type = achievement.achievementType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(achievement);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate achievement statistics
    const stats = {
      totalAchievements: achievements.length,
      totalPointsFromAchievements: achievements.reduce((sum, a) => sum + a.pointsAwarded, 0),
      achievementsByType: Object.keys(groupedAchievements).map(type => ({
        type,
        count: groupedAchievements[type].length,
        totalPoints: groupedAchievements[type].reduce((sum, a) => sum + a.pointsAwarded, 0)
      })),
      recentAchievements: achievements.slice(0, 5), // Latest 5 achievements
      milestones: {
        streakMilestones: groupedAchievements.STREAK_MILESTONE?.length || 0,
        totalContributions: groupedAchievements.TOTAL_CONTRIBUTION?.length || 0,
        specialBadges: achievements.filter(a => 
          ['EARLY_ADOPTER', 'COMMUNITY_CHAMPION', 'LOYALTY_BADGE'].includes(a.achievementType)
        ).length
      }
    };

    return NextResponse.json({
      achievements,
      groupedAchievements,
      stats,
      success: true
    });
  } catch (error: any) {
    console.error('Error fetching achievements:', error);
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

    // Only admins can manually award achievements
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { memberId, achievementType, title, description, pointsAwarded, badgeIcon } = body;

    // Validate required fields
    if (!memberId || !achievementType || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get member and their primary streak (or create one)
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Find or create a general streak for achievements
    let streak = await prisma.memberStreak.findFirst({
      where: {
        memberId,
        type: 'COMMUNITY_ENGAGEMENT'
      }
    });

    if (!streak) {
      streak = await prisma.memberStreak.create({
        data: {
          memberId,
          type: 'COMMUNITY_ENGAGEMENT',
          currentStreak: 0,
          longestStreak: 0,
          isActive: true,
          totalPoints: 0,
          level: 1
        }
      });
    }

    // Create the achievement
    const achievement = await prisma.streakAchievement.create({
      data: {
        streakId: streak.id,
        memberId,
        achievementType: achievementType as any,
        title,
        description,
        badgeIcon: badgeIcon || getDefaultBadgeIcon(achievementType),
        pointsAwarded: pointsAwarded || 0
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberCode: true,
            avatar: true
          }
        }
      }
    });

    // Update member's total points
    await prisma.memberStreak.update({
      where: { id: streak.id },
      data: {
        totalPoints: streak.totalPoints + (pointsAwarded || 0),
        level: calculateLevel(streak.totalPoints + (pointsAwarded || 0))
      }
    });

    return NextResponse.json({
      success: true,
      achievement,
      message: 'Achievement awarded successfully'
    });
  } catch (error: any) {
    console.error('Error awarding achievement:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to get default badge icon
function getDefaultBadgeIcon(achievementType: string): string {
  const icons: Record<string, string> = {
    STREAK_MILESTONE: '🔥',
    TOTAL_CONTRIBUTION: '💰',
    PERFECT_ATTENDANCE: '📅',
    EARLY_ADOPTER: '🚀',
    COMMUNITY_CHAMPION: '👑',
    FINANCIAL_DISCIPLINE: '💎',
    LOYALTY_BADGE: '⭐',
    SPECIAL_EVENT: '🎉'
  };
  
  return icons[achievementType] || '🏆';
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