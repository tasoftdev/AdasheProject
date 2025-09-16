import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'

// GET /api/savings/accounts - Get all savings accounts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const savings = await prisma.saving.findMany({
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            memberCode: true,
            avatar: true
          }
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            createdAt: true,
            type: true
          }
        },
        _count: {
          select: {
            transactions: {
              where: {
                createdAt: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
              }
            }
          }
        }
      },
      orderBy: { balance: 'desc' }
    })

    const formattedSavings = savings.map(saving => {
      const fullName = `${saving.member.firstName} ${saving.member.lastName}`
      const initials = `${saving.member.firstName.charAt(0)}${saving.member.lastName.charAt(0)}`
      const lastTransaction = saving.transactions[0]
      
      return {
        id: saving.accountNumber,
        member: fullName,
        avatar: saving.member.avatar || null,
        initials,
        accountType: saving.accountType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        balance: `₦${saving.balance.toFixed(2)}`,
        interestRate: `${saving.interestRate}%`,
        lastDeposit: lastTransaction?.createdAt.toISOString().split('T')[0] || null,
        monthlyTarget: '₦500.00', // This could be configurable per member
        progress: Math.min(Math.round((saving._count.transactions / 4) * 100), 100), // Assuming 4 transactions per month as target
        status: saving.status,
        memberId: saving.member.id,
        savingId: saving.id
      }
    })

    return NextResponse.json(formattedSavings)
  } catch (error) {
    console.error('Error fetching savings accounts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/savings/accounts - Create new savings account
const createSavingSchema = z.object({
  memberId: z.string(),
  accountType: z.enum(['REGULAR', 'FIXED_DEPOSIT', 'TARGET', 'EMERGENCY']),
  interestRate: z.number().min(0).max(100),
  initialDeposit: z.number().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createSavingSchema.parse(body)

    // Generate unique account number
    const accountNumber = `SA${Date.now().toString().slice(-6)}`

    const result = await prisma.$transaction(async (prisma) => {
      // Create savings account
      const saving = await prisma.saving.create({
        data: {
          memberId: validatedData.memberId,
          accountNumber,
          accountType: validatedData.accountType,
          interestRate: validatedData.interestRate,
          balance: validatedData.initialDeposit || 0
        }
      })

      // If there's an initial deposit, create a transaction record
      if (validatedData.initialDeposit && validatedData.initialDeposit > 0) {
        await prisma.savingTransaction.create({
          data: {
            savingId: saving.id,
            type: 'DEPOSIT',
            amount: validatedData.initialDeposit,
            balance: validatedData.initialDeposit,
            method: 'CASH',
            reference: `ST${Date.now()}`,
            description: 'Initial deposit'
          }
        })
      }

      return saving
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating savings account:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}