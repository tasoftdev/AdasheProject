import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/reports/monthly - Get monthly reports
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '6')

    // Generate monthly reports for the last N months
    const monthlyReports = []
    const now = new Date()

    for (let i = 0; i < months; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const isCurrentMonth = i === 0

      // Get data for this month
      const [contributions, loans, savings, members] = await Promise.all([
        prisma.contribution.aggregate({
          _sum: { amount: true },
          _count: true,
          where: {
            status: 'COMPLETED',
            paidDate: {
              gte: monthDate,
              lt: nextMonthDate
            }
          }
        }),
        prisma.loan.aggregate({
          _sum: { amount: true },
          _count: true,
          where: {
            status: { in: ['ACTIVE', 'COMPLETED'] },
            approvedDate: {
              gte: monthDate,
              lt: nextMonthDate
            }
          }
        }),
        prisma.savingTransaction.aggregate({
          _sum: { amount: true },
          where: {
            type: 'DEPOSIT',
            createdAt: {
              gte: monthDate,
              lt: nextMonthDate
            }
          }
        }),
        prisma.member.count({
          where: {
            status: 'ACTIVE',
            joinDate: {
              lte: nextMonthDate
            }
          }
        })
      ])

      const totalContributions = contributions._sum.amount?.toNumber() || 0
      const totalLoans = loans._sum.amount?.toNumber() || 0
      const totalSavings = savings._sum.amount?.toNumber() || 0
      const activeMembers = members

      monthlyReports.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalContributions: `₦${totalContributions.toLocaleString('en-NG')}`,
        totalLoans: `₦${totalLoans.toLocaleString('en-NG')}`,
        totalSavings: `₦${totalSavings.toLocaleString('en-NG')}`,
        activeMembers,
        status: isCurrentMonth ? 'current' : 'completed',
        contributionsCount: contributions._count,
        loansCount: loans._count,
        date: monthDate.toISOString()
      })
    }

    return NextResponse.json(monthlyReports)
  } catch (error) {
    console.error('Error fetching monthly reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}