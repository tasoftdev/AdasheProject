import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/reports/financial-summary - Get financial summary
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'current-month'

    // Calculate date ranges based on period
    const now = new Date()
    let startDate: Date
    let endDate = new Date()
    let previousStartDate: Date
    let previousEndDate: Date

    switch (period) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        previousEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        previousStartDate = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
        previousEndDate = new Date(now.getFullYear(), quarter * 3, 0)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0)
    }

    // Get current period data
    const [
      currentContributions,
      currentLoans,
      currentSavings,
      currentLoanPayments,
      previousContributions,
      previousLoans,
      previousSavings,
      previousLoanPayments
    ] = await Promise.all([
      // Current period
      prisma.contribution.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          paidDate: { gte: startDate, lte: endDate }
        }
      }),
      prisma.loan.aggregate({
        _sum: { amount: true },
        where: {
          status: 'ACTIVE',
          approvedDate: { gte: startDate, lte: endDate }
        }
      }),
      prisma.saving.aggregate({
        _sum: { balance: true },
        where: { status: 'ACTIVE' }
      }),
      prisma.loanPayment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          paymentDate: { gte: startDate, lte: endDate }
        }
      }),
      // Previous period for comparison
      prisma.contribution.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          paidDate: { gte: previousStartDate, lte: previousEndDate }
        }
      }),
      prisma.loan.aggregate({
        _sum: { amount: true },
        where: {
          status: 'ACTIVE',
          approvedDate: { gte: previousStartDate, lte: previousEndDate }
        }
      }),
      prisma.saving.aggregate({
        _sum: { balance: true },
        where: { status: 'ACTIVE' }
      }),
      prisma.loanPayment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          paymentDate: { gte: previousStartDate, lte: previousEndDate }
        }
      })
    ])

    // Calculate totals
    const totalContributions = currentContributions._sum.amount?.toNumber() || 0
    const totalLoansOut = currentLoans._sum.amount?.toNumber() || 0
    const totalSavings = currentSavings._sum.balance?.toNumber() || 0
    const totalIncome = totalContributions + (currentLoanPayments._sum.amount?.toNumber() || 0)

    const prevContributions = previousContributions._sum.amount?.toNumber() || 0
    const prevLoansOut = previousLoans._sum.amount?.toNumber() || 0
    const prevSavings = previousSavings._sum.balance?.toNumber() || 0
    const prevIncome = prevContributions + (previousLoanPayments._sum.amount?.toNumber() || 0)

    // Calculate percentage changes
    const contributionsChange = prevContributions > 0 ? ((totalContributions - prevContributions) / prevContributions * 100) : 0
    const loansChange = prevLoansOut > 0 ? ((totalLoansOut - prevLoansOut) / prevLoansOut * 100) : 0
    const savingsChange = prevSavings > 0 ? ((totalSavings - prevSavings) / prevSavings * 100) : 0
    const incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome * 100) : 0

    // Calculate financial metrics
    const totalAssets = totalSavings + totalLoansOut + totalContributions
    const totalLiabilities = totalSavings * 0.9 // Assume 90% of savings are member shares
    const netWorth = totalAssets - totalLiabilities

    const financialSummary = [
      {
        title: "Total Assets",
        value: `₦${totalAssets.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`,
        change: `${savingsChange >= 0 ? '+' : ''}${savingsChange.toFixed(1)}%`,
        trend: savingsChange >= 0 ? "up" : "down",
        description: "Cash + Investments + Outstanding Loans",
      },
      {
        title: "Total Savings",
        value: `₦${totalSavings.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`,
        change: `${savingsChange >= 0 ? '+' : ''}${savingsChange.toFixed(1)}%`,
        trend: savingsChange >= 0 ? "up" : "down",
        description: "Member savings balances",
      },
      {
        title: "Net Worth",
        value: `₦${netWorth.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`,
        change: `${(savingsChange + contributionsChange) / 2 >= 0 ? '+' : ''}${((savingsChange + contributionsChange) / 2).toFixed(1)}%`,
        trend: (savingsChange + contributionsChange) / 2 >= 0 ? "up" : "down",
        description: "Total Assets - Total Liabilities",
      },
      {
        title: "Monthly Income",
        value: `₦${totalIncome.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`,
        change: `${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}%`,
        trend: incomeChange >= 0 ? "up" : "down",
        description: "Contributions + Loan payments + Fees",
      },
    ]

    return NextResponse.json(financialSummary)
  } catch (error) {
    console.error('Error fetching financial summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}