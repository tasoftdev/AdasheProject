import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/transactions/summary - Get transaction summaries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    
    // Today's date range
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
    
    // This week's date range (Monday to Sunday)
    const startOfWeek = new Date(startOfToday)
    const dayOfWeek = startOfToday.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startOfWeek.setDate(startOfToday.getDate() - daysToMonday)
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    // This month's date range
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // Helper function to calculate summary for a date range
    const calculateSummary = async (startDate: Date, endDate: Date) => {
      const transactions = await prisma.transaction.findMany({
        where: {
          date: {
            gte: startDate,
            lt: endDate
          },
          status: 'COMPLETED'
        },
        select: {
          amount: true,
          type: true
        }
      })

      let inflow = 0
      let outflow = 0
      let count = transactions.length

      transactions.forEach(transaction => {
        if (transaction.type === 'INCOME') {
          inflow += transaction.amount.toNumber()
        } else if (transaction.type === 'EXPENSE') {
          outflow += transaction.amount.toNumber()
        }
      })

      return {
        count,
        inflow,
        outflow,
        netFlow: inflow - outflow
      }
    }

    // Calculate summaries for all periods
    const [todaySummary, weekSummary, monthSummary] = await Promise.all([
      calculateSummary(startOfToday, endOfToday),
      calculateSummary(startOfWeek, endOfWeek),
      calculateSummary(startOfMonth, endOfMonth)
    ])

    return NextResponse.json({
      today: todaySummary,
      week: weekSummary,
      month: monthSummary
    })
    
  } catch (error) {
    console.error('Error fetching transaction summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction summary' },
      { status: 500 }
    )
  }
}