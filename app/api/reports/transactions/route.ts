import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/reports/transactions - Get transaction history for reports
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const type = searchParams.get('type') // contribution, loan, saving
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    // Get contributions
    const contributions = await prisma.contribution.findMany({
      where: {
        ...(status ? { status: status as any } : {})
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit / 3, 20)
    })

    // Get loan transactions (disbursements)
    const loans = await prisma.loan.findMany({
      where: {
        status: { not: 'PENDING' },
        approvedDate: { not: null }
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { approvedDate: 'desc' },
      take: Math.min(limit / 3, 20)
    })

    // Get loan payments
    const loanPayments = await prisma.loanPayment.findMany({
      where: {
        ...(status ? { status: status as any } : {})
      },
      include: {
        loan: {
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { paymentDate: 'desc' },
      take: Math.min(limit / 3, 20)
    })

    // Get savings transactions
    const savingsTransactions = await prisma.savingTransaction.findMany({
      where: {
        ...(status ? { status: status as any } : {})
      },
      include: {
        saving: {
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit / 4, 15)
    })

    // Define transaction interface
    interface Transaction {
      id: string
      date: Date
      type: string
      member: string
      amount: string
      category: string
      status: string
      reference: string | null
    }

    // Format all transactions into a unified structure
    const allTransactions: Transaction[] = []

    // Add contributions
    contributions.forEach(contribution => {
      allTransactions.push({
        id: `CONT-${contribution.id}`,
        date: contribution.paidDate || contribution.createdAt,
        type: "Contribution",
        member: `${contribution.member.firstName} ${contribution.member.lastName}`,
        amount: `₦${contribution.amount.toFixed(2)}`,
        category: contribution.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        status: contribution.status.toLowerCase(),
        reference: contribution.reference
      })
    })

    // Add loan disbursements
    loans.forEach(loan => {
      allTransactions.push({
        id: `LOAN-${loan.id}`,
        date: loan.approvedDate || loan.createdAt,
        type: "Loan Disbursement",
        member: `${loan.member.firstName} ${loan.member.lastName}`,
        amount: `₦${loan.amount.toFixed(2)}`,
        category: loan.purpose || 'General',
        status: loan.status.toLowerCase(),
        reference: `L-${loan.id.slice(-8)}`
      })
    })

    // Add loan payments
    loanPayments.forEach(payment => {
      allTransactions.push({
        id: `PAY-${payment.id}`,
        date: payment.paymentDate,
        type: "Loan Payment",
        member: `${payment.loan.member.firstName} ${payment.loan.member.lastName}`,
        amount: `₦${payment.amount.toFixed(2)}`,
        category: "Repayment",
        status: payment.status.toLowerCase(),
        reference: payment.reference
      })
    })

    // Add savings transactions
    savingsTransactions.forEach(transaction => {
      allTransactions.push({
        id: `SAV-${transaction.id}`,
        date: transaction.createdAt,
        type: `Savings ${transaction.type.charAt(0) + transaction.type.slice(1).toLowerCase()}`,
        member: `${transaction.saving.member.firstName} ${transaction.saving.member.lastName}`,
        amount: `₦${transaction.amount.toFixed(2)}`,
        category: transaction.description || transaction.type,
        status: transaction.status.toLowerCase(),
        reference: transaction.reference
      })
    })

    // Sort all transactions by date (most recent first)
    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Apply pagination
    const paginatedTransactions = allTransactions.slice(skip, skip + limit)

    return NextResponse.json({
      transactions: paginatedTransactions,
      total: allTransactions.length,
      page,
      limit,
      totalPages: Math.ceil(allTransactions.length / limit)
    })
  } catch (error) {
    console.error('Error fetching transaction history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}