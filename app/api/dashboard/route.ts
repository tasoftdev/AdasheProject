import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const currentMonth = new Date()
    currentMonth.setDate(1)
    const lastMonth = new Date(currentMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const [
      totalMembers,
      activeMembers,
      totalContributions,
      monthlyContributions,
      totalLoans,
      activeLoans,
      totalSavings,
      recentTransactions
    ] = await Promise.all([
   
      prisma.member.count(),
      
      prisma.member.count({ where: { status: 'ACTIVE' } }),
      
      prisma.contribution.aggregate({
        _sum: { amount: true },
        _count: { id: true }
      }),
      
      prisma.contribution.aggregate({
        where: {
          createdAt: { gte: currentMonth }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
    
      prisma.loan.aggregate({
        _sum: { amount: true },
        _count: { id: true }
      }),
      
      prisma.loan.count({ where: { status: 'ACTIVE' } }),
        
      prisma.saving.aggregate({
        _sum: { balance: true },
        _count: true
      }),
      
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      })
    ])

    console.log('Dashboard query results:')
    console.log('totalSavings:', totalSavings)
    console.log('totalSavings._count:', totalSavings._count, 'type:', typeof totalSavings._count)

    const lastMonthContributions = await prisma.contribution.aggregate({
      where: {
        createdAt: { 
          gte: lastMonth,
          lt: currentMonth
        }
      },
      _sum: { amount: true }
    })

    const contributionGrowth = lastMonthContributions._sum.amount 
      ? ((Number(monthlyContributions._sum.amount) || 0) - (Number(lastMonthContributions._sum.amount) || 0)) / (Number(lastMonthContributions._sum.amount) || 1) * 100
      : 0

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyTrends = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expenses
      FROM transactions 
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month
    ` as any[]

    const contributionBreakdown = await prisma.contribution.groupBy({
      by: ['status'],
      _sum: { amount: true },
      _count: { id: true }
    })

    const loanBreakdown = await prisma.loan.groupBy({
      by: ['status'],
      _sum: { amount: true },
      _count: { id: true }
    })

    const dashboardData = {
      stats: {
        totalMembers,
        activeMembers,
        totalContributions: {
          amount: totalContributions._sum.amount || 0,
          count: totalContributions._count || 0
        },
        monthlyContributions: {
          amount: monthlyContributions._sum.amount || 0,
          count: monthlyContributions._count || 0,
          growth: contributionGrowth
        },
        totalLoans: {
          amount: totalLoans._sum.amount || 0,
          count: totalLoans._count || 0
        },
        activeLoans,
        totalSavings: {
          amount: totalSavings._sum.balance || 0,
          count: typeof totalSavings._count === 'number' ? totalSavings._count : 0
        }
      },
      charts: {
        monthlyTrends: monthlyTrends.map(trend => ({
          month: trend.month,
          income: parseFloat(trend.income || '0'),
          expenses: parseFloat(trend.expenses || '0')
        })),
        contributionBreakdown: contributionBreakdown.map((item: any) => ({
          status: item.status,
          amount: parseFloat(item._sum.amount?.toString() || '0'),
          count: item._count
        })),
        loanBreakdown: loanBreakdown.map((item: any) => ({
          status: item.status,
          amount: parseFloat(item._sum.amount?.toString() || '0'),
          count: item._count
        }))
      },
      recentTransactions: recentTransactions.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        category: tx.category,
        amount: parseFloat(tx.amount.toString()),
        description: tx.description,
        method: tx.method,
        status: tx.status,
        date: tx.date,
        member: tx.member
      }))
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}