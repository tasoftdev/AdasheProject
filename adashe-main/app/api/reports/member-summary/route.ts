import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/reports/member-summary - Get member performance summary
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)

    // Get member statistics
    const [
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      newMembersThisQuarter,
      totalContributions,
      expectedContributions,
      averageContribution,
      averageLoanRepaymentTime,
      emergencyFundTarget,
      emergencyFundCurrent
    ] = await Promise.all([
      // Total members ever registered
      prisma.member.count(),
      
      // Active members
      prisma.member.count({
        where: { status: 'ACTIVE' }
      }),
      
      // New members this month
      prisma.member.count({
        where: {
          joinDate: { gte: startOfMonth }
        }
      }),
      
      // New members this quarter
      prisma.member.count({
        where: {
          joinDate: { gte: startOfQuarter }
        }
      }),
      
      // Total contributions this month (completed)
      prisma.contribution.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          status: 'COMPLETED',
          paidDate: { gte: startOfMonth }
        }
      }),
      
      // Expected contributions (all pending/overdue)
      prisma.contribution.aggregate({
        _count: true,
        where: {
          status: { in: ['PENDING', 'OVERDUE'] }
        }
      }),
      
      // Average monthly contribution
      prisma.contribution.aggregate({
        _avg: { amount: true },
        where: {
          status: 'COMPLETED',
          paidDate: { gte: startOfMonth }
        }
      }),
      
      // Average loan repayment time (in days)
      prisma.loan.aggregate({
        _avg: { term: true },
        where: {
          status: 'COMPLETED'
        }
      }),
      
      // Emergency fund target (this would be configurable)
      100000, // ₦100,000 as example target
      
      // Current emergency fund (sum of emergency savings)
      prisma.saving.aggregate({
        _sum: { balance: true },
        where: {
          accountType: 'EMERGENCY',
          status: 'ACTIVE'
        }
      })
    ])

    // Calculate collection rate
    const totalContributionAmount = totalContributions._sum.amount?.toNumber() || 0
    const totalContributionCount = totalContributions._count || 0
    const expectedContributionCount = expectedContributions._count || 0
    const totalExpectedContributions = totalContributionCount + expectedContributionCount
    const collectionRate = totalExpectedContributions > 0 
      ? (totalContributionCount / totalExpectedContributions) * 100 
      : 0

    // Calculate average monthly contribution
    const avgContribution = averageContribution._avg.amount?.toNumber() || 0

    // Calculate emergency fund progress
    const emergencyFundBalance = emergencyFundCurrent._sum.balance?.toNumber() || 0
    const emergencyFundProgress = (emergencyFundBalance / emergencyFundTarget) * 100

    // Calculate average loan repayment time (convert months to a readable format)
    const avgRepaymentMonths = averageLoanRepaymentTime._avg.term || 0

    // Previous month comparison data
    const [lastMonthMembers, lastMonthContributions] = await Promise.all([
      prisma.member.count({
        where: {
          status: 'ACTIVE',
          joinDate: { lte: endOfLastMonth }
        }
      }),
      prisma.contribution.aggregate({
        _count: true,
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          paidDate: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      })
    ])

    const lastMonthCollectionCount = lastMonthContributions._count || 0
    const lastMonthCollectionRate = lastMonthMembers > 0 ? (lastMonthCollectionCount / lastMonthMembers) * 100 : 0
    const collectionRateChange = collectionRate - lastMonthCollectionRate

    // Generate insights
    const insights = [
      `Contribution collection rate ${collectionRateChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(collectionRateChange).toFixed(1)}% this month`,
      `${newMembersThisQuarter} new members joined this quarter`,
      `Average loan repayment time: ${avgRepaymentMonths.toFixed(1)} months`,
      `Emergency fund reached ${emergencyFundProgress.toFixed(0)}% of annual target`
    ]

    const memberSummary = {
      statistics: [
        {
          title: 'Active Members',
          value: activeMembers,
          icon: 'users',
          color: 'blue'
        },
        {
          title: 'Collection Rate',
          value: `${collectionRate.toFixed(1)}%`,
          icon: 'trending-up',
          color: 'green'
        },
        {
          title: 'Avg. Monthly Contribution',
          value: `₦${avgContribution.toFixed(0)}`,
          icon: 'dollar-sign',
          color: 'yellow'
        }
      ],
      insights,
      details: {
        totalMembers,
        activeMembers,
        newMembersThisMonth,
        newMembersThisQuarter,
        collectionRate: collectionRate.toFixed(1),
        averageContribution: avgContribution.toFixed(2),
        emergencyFundProgress: emergencyFundProgress.toFixed(1),
        averageLoanRepaymentMonths: avgRepaymentMonths.toFixed(1)
      }
    }

    return NextResponse.json(memberSummary)
  } catch (error) {
    console.error('Error fetching member summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}