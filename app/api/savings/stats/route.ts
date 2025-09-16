import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'

// GET /api/savings/stats - Get savings statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Total savings balance
    const totalSavingsResult = await prisma.saving.aggregate({
      _sum: {
        balance: true
      },
      where: {
        status: 'ACTIVE'
      }
    })

    // Previous month's total for comparison
    const lastMonthSavings = await prisma.savingTransaction.groupBy({
      by: ['savingId'],
      _sum: {
        balance: true
      },
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      }
    })

    // Monthly deposits this month
    const monthlyDepositsResult = await prisma.savingTransaction.aggregate({
      _sum: {
        amount: true
      },
      _count: true,
      where: {
        type: 'DEPOSIT',
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Previous month's deposits for comparison
    const lastMonthDepositsResult = await prisma.savingTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: 'DEPOSIT',
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      }
    })

    // Interest earned this year
    const interestEarnedResult = await prisma.savingTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: 'INTEREST',
        createdAt: {
          gte: startOfYear
        }
      }
    })

    // Last year's interest for comparison
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1)
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31)
    const lastYearInterestResult = await prisma.savingTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: 'INTEREST',
        createdAt: {
          gte: lastYearStart,
          lte: lastYearEnd
        }
      }
    })

    // Savings goals met (members with at least 4 transactions this month)
    const membersWithGoals = await prisma.member.count({
      where: {
        savings: {
          some: {
            status: 'ACTIVE'
          }
        }
      }
    })

    const membersMetGoals = await prisma.member.count({
      where: {
        savings: {
          some: {
            transactions: {
              some: {
                createdAt: {
                  gte: startOfMonth
                }
              }
            }
          }
        }
      }
    })

    // Calculate percentages and changes
    const totalSavings = totalSavingsResult._sum.balance?.toNumber() || 0
    const lastMonthTotal = lastMonthSavings.reduce((sum, item) => sum + (item._sum.balance?.toNumber() || 0), 0)
    const savingsChange = lastMonthTotal > 0 ? ((totalSavings - lastMonthTotal) / lastMonthTotal * 100) : 0

    const monthlyDeposits = monthlyDepositsResult._sum.amount?.toNumber() || 0
    const lastMonthDeposits = lastMonthDepositsResult._sum.amount?.toNumber() || 0
    const depositsChange = lastMonthDeposits > 0 ? ((monthlyDeposits - lastMonthDeposits) / lastMonthDeposits * 100) : 0

    const interestEarned = interestEarnedResult._sum.amount?.toNumber() || 0
    const lastYearInterest = lastYearInterestResult._sum.amount?.toNumber() || 0
    const interestChange = lastYearInterest > 0 ? ((interestEarned - lastYearInterest) / lastYearInterest * 100) : 0

    const goalsMetPercentage = membersWithGoals > 0 ? (membersMetGoals / membersWithGoals * 100) : 0
    const previousGoalsMetPercentage = 73 // This would need historical tracking
    const goalsChange = goalsMetPercentage - previousGoalsMetPercentage

    const stats = [
      {
        title: "Total Savings",
        value: `₦${totalSavings.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`,
        change: `${savingsChange >= 0 ? '+' : ''}${savingsChange.toFixed(1)}%`,
        trend: savingsChange >= 0 ? "up" : "down",
        description: "All member savings combined",
      },
      {
        title: "Monthly Deposits",
        value: `₦${monthlyDeposits.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`,
        change: `${depositsChange >= 0 ? '+' : ''}${depositsChange.toFixed(1)}%`,
        trend: depositsChange >= 0 ? "up" : "down",
        description: "This month's total deposits",
      },
      {
        title: "Interest Earned",
        value: `₦${interestEarned.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`,
        change: `${interestChange >= 0 ? '+' : ''}${interestChange.toFixed(1)}%`,
        trend: interestChange >= 0 ? "up" : "down",
        description: "Interest earned this year",
      },
      {
        title: "Savings Goals Met",
        value: `${goalsMetPercentage.toFixed(0)}%`,
        change: `${goalsChange >= 0 ? '+' : ''}${goalsChange.toFixed(1)}%`,
        trend: goalsChange >= 0 ? "up" : "down",
        description: "Members meeting monthly targets",
      },
    ]

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching savings stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}