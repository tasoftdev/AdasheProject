import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'

// Schema for creating savings account
const createSavingSchema = z.object({
  memberId: z.string(),
  accountType: z.enum(['REGULAR', 'FIXED_DEPOSIT', 'TARGET', 'EMERGENCY']),
  interestRate: z.number().min(0).max(100),
  initialDeposit: z.number().min(0).optional().default(0),
  monthlyTarget: z.number().min(0).optional().nullable(),
  maturityDate: z.string().optional().nullable()
})

// GET /api/savings/accounts - Get all savings accounts with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const accountType = searchParams.get('accountType') as 'REGULAR' | 'FIXED_DEPOSIT' | 'TARGET' | 'EMERGENCY' | null
    const status = searchParams.get('status') as 'ACTIVE' | 'INACTIVE' | 'MATURED' | 'CLOSED' | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (memberId) where.memberId = memberId
    if (accountType) where.accountType = accountType
    if (status) where.status = status

    const [savings, total] = await Promise.all([
      prisma.saving.findMany({
        where,
        skip,
        take: limit,
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
        orderBy: { createdAt: 'desc' }
      }),
      prisma.saving.count({ where })
    ])

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
        progress: Math.min(Math.round((saving._count.transactions / 4) * 100), 100),
        status: saving.status,
        memberId: saving.member.id,
        savingId: saving.id,
        currentBalance: saving.balance, // Raw balance for calculations
        rawAccountType: saving.accountType // Original enum value
      }
    })

    return NextResponse.json({
      accounts: formattedSavings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching savings accounts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/savings/accounts - Create new savings account
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createSavingSchema.parse(body)

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: validatedData.memberId }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Generate unique account number
    const accountNumber = `SAV${Date.now().toString().slice(-8)}`

    const result = await prisma.$transaction(async (prisma) => {
      // Create savings account
      const saving = await prisma.saving.create({
        data: {
          memberId: validatedData.memberId,
          accountNumber,
          accountType: validatedData.accountType,
          interestRate: validatedData.interestRate,
          balance: validatedData.initialDeposit,
          monthlyTarget: validatedData.monthlyTarget,
          maturityDate: validatedData.maturityDate ? new Date(validatedData.maturityDate) : null,
          status: 'ACTIVE'
        },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              memberCode: true
            }
          }
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
            reference: `INIT-${accountNumber}`,
            description: 'Initial deposit - Account opening'
          }
        })
      }

      return saving
    })

    return NextResponse.json({
      success: true,
      account: result,
      message: 'Savings account created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating savings account:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}