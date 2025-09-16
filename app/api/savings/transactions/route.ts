import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'

// GET /api/savings/transactions - Get savings transactions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const savingId = searchParams.get('savingId')

    const where = savingId ? { savingId } : {}

    const transactions = await prisma.savingTransaction.findMany({
      where,
      include: {
        saving: {
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit
    })

    const formattedTransactions = transactions.map(transaction => {
      const member = transaction.saving.member
      const fullName = `${member.firstName} ${member.lastName}`
      const initials = `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
      
      return {
        id: transaction.id,
        member: fullName,
        avatar: member.avatar || null,
        initials,
        type: transaction.type.toLowerCase(),
        amount: `₦${transaction.amount.toFixed(2)}`,
        date: transaction.createdAt.toISOString().split('T')[0],
        account: transaction.saving.accountType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        balance: `₦${transaction.balance.toFixed(2)}`,
        description: transaction.description,
        method: transaction.method,
        reference: transaction.reference
      }
    })

    return NextResponse.json(formattedTransactions)
  } catch (error) {
    console.error('Error fetching savings transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/savings/transactions - Create new savings transaction (deposit/withdrawal)
const createTransactionSchema = z.object({
  savingId: z.string(),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'INTEREST']),
  amount: z.number().positive(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CREDIT_CARD', 'DEBIT_CARD', 'CHEQUE']),
  description: z.string().optional(),
  date: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createTransactionSchema.parse(body)

    const result = await prisma.$transaction(async (prisma) => {
      // Get current savings account
      const saving = await prisma.saving.findUnique({
        where: { id: validatedData.savingId }
      })

      if (!saving) {
        throw new Error('Savings account not found')
      }

      // Calculate new balance
      let newBalance = saving.balance.toNumber()
      
      if (validatedData.type === 'DEPOSIT' || validatedData.type === 'INTEREST') {
        newBalance += validatedData.amount
      } else if (validatedData.type === 'WITHDRAWAL') {
        if (newBalance < validatedData.amount) {
          throw new Error('Insufficient balance')
        }
        newBalance -= validatedData.amount
      }

      // Create transaction
      const transaction = await prisma.savingTransaction.create({
        data: {
          savingId: validatedData.savingId,
          type: validatedData.type,
          amount: validatedData.amount,
          balance: newBalance,
          method: validatedData.method,
          reference: `ST${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          description: validatedData.description || `${validatedData.type.toLowerCase()} transaction`,
          createdAt: validatedData.date ? new Date(validatedData.date) : new Date()
        }
      })

      // Update savings account balance
      await prisma.saving.update({
        where: { id: validatedData.savingId },
        data: { balance: newBalance }
      })

      return transaction
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating savings transaction:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    if (error instanceof Error && (error.message === 'Savings account not found' || error.message === 'Insufficient balance')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}