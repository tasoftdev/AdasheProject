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
    const type = searchParams.get('type') as string;
    const period = searchParams.get('period') as string || 'ALL_TIME';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query filters
    const where: any = {};
    if (type) {
      where.streakType = type;
    }
    where.period = period;

    // Get leaderboard data
    const leaderboard = await prisma.streakLeaderboard.findMany({
      where,
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberCode: true,
            avatar: true
          }
        }
      },
      orderBy: [
        { totalPoints: 'desc' },
        { longestStreak: 'desc' },
        { currentStreak: 'desc' }
      ],
      take: limit
    });

    // Calculate and update ranks
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    // Update ranks in database (batch update)
    const updatePromises = rankedLeaderboard.map((entry, index) =>
      prisma.streakLeaderboard.update({
        where: { id: entry.id },
        data: { rank: index + 1 }
      })
    );
    
    await Promise.all(updatePromises);

    // Get current user's position if not in top results
    let currentUserPosition = null;
    const currentMember = await prisma.member.findFirst({
      where: { user: { email: session.user.email! } }
    });

    if (currentMember) {
      const userEntry = rankedLeaderboard.find(entry => entry.memberId === currentMember.id);
      if (!userEntry) {
        // Find user's actual position
        const userLeaderboardEntry = await prisma.streakLeaderboard.findFirst({
          where: {
            memberId: currentMember.id,
            ...(type && { streakType: type }),
            period
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

        if (userLeaderboardEntry) {
          // Count how many entries have better scores
          const betterEntries = await prisma.streakLeaderboard.count({
            where: {
              ...(type && { streakType: type }),
              period,
              OR: [
                { totalPoints: { gt: userLeaderboardEntry.totalPoints } },
                {
                  totalPoints: userLeaderboardEntry.totalPoints,
                  longestStreak: { gt: userLeaderboardEntry.longestStreak }
                },
                {
                  totalPoints: userLeaderboardEntry.totalPoints,
                  longestStreak: userLeaderboardEntry.longestStreak,
                  currentStreak: { gt: userLeaderboardEntry.currentStreak }
                }
              ]
            }
          });

          currentUserPosition = {
            ...userLeaderboardEntry,
            rank: betterEntries + 1
          };
        }
      } else {
        currentUserPosition = userEntry;
      }
    }

    // Get summary statistics
    const totalParticipants = await prisma.streakLeaderboard.count({
      where: {
        ...(type && { streakType: type }),
        period
      }
    });

    const topPerformer = rankedLeaderboard[0];
    const averagePoints = rankedLeaderboard.length > 0 
      ? Math.round(rankedLeaderboard.reduce((sum, entry) => sum + entry.totalPoints, 0) / rankedLeaderboard.length)
      : 0;

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      currentUserPosition,
      stats: {
        totalParticipants,
        topPerformer: topPerformer ? {
          name: `${topPerformer.member.firstName} ${topPerformer.member.lastName}`,
          memberCode: topPerformer.member.memberCode,
          points: topPerformer.totalPoints,
          longestStreak: topPerformer.longestStreak
        } : null,
        averagePoints
      },
      success: true
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
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

    // Only admins can manually update leaderboards
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'recalculate') {
      // Recalculate all leaderboard rankings
      await recalculateLeaderboards();
      
      return NextResponse.json({
        success: true,
        message: 'Leaderboards recalculated successfully'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to recalculate all leaderboards
async function recalculateLeaderboards() {
  const streakTypes = ['LOGIN', 'CONTRIBUTION', 'SAVINGS', 'LOAN_PAYMENT', 'MEETING_ATTENDANCE', 'PROFILE_UPDATE', 'TRANSACTION', 'COMMUNITY_ENGAGEMENT'];
  const periods = ['ALL_TIME', 'MONTHLY', 'WEEKLY', 'DAILY'];

  for (const streakType of streakTypes) {
    for (const period of periods) {
      // Get all entries for this combination
      const entries = await prisma.streakLeaderboard.findMany({
        where: {
          streakType: streakType as any,
          period: period as any
        },
        orderBy: [
          { totalPoints: 'desc' },
          { longestStreak: 'desc' },
          { currentStreak: 'desc' }
        ]
      });

      // Update ranks
      const updatePromises = entries.map((entry, index) =>
        prisma.streakLeaderboard.update({
          where: { id: entry.id },
          data: { rank: index + 1 }
        })
      );

      await Promise.all(updatePromises);
    }
  }
}