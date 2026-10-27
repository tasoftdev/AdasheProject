import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { paystack } from '@/lib/paystack'

// GET /api/payments - Get payments with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const memberId = searchParams.get('memberId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    const where: any = {}
    
    // Filter by user role
    if (session.user.role === 'MEMBER') {
      const userMember = await prisma.member.findUnique({
        where: { userId: session.user.id }
      })
      if (userMember) {
        where.memberId = userMember.id
      }
    } else {
      if (memberId) where.memberId = memberId
    }
    
    if (status) where.status = status
    if (type) where.type = type
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              memberCode: true,
              email: true
            }
          },
          transactions: true
        }
      }),
      prisma.payment.count({ where })
    ])

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({
      error: 'Failed to fetch payments',
      details: error instanceof Error ? error.message : 'Unknown error',
      payments: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      }
    }, { status: 500 })
  }
}

// POST /api/payments - Initialize payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      memberId,
      amount,
      description,
      type,
      category,
      email,
      currency = 'NGN',
      callback_url,
      metadata
    } = body

    // Validation
    if (!amount || !description || !type || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, description, type, email' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Find member if memberId is provided
    let member = null
    let targetMemberId = memberId

    if (!targetMemberId && session.user.role === 'MEMBER') {
      member = await prisma.member.findUnique({
        where: { userId: session.user.id }
      })
      targetMemberId = member?.id
    } else if (targetMemberId) {
      member = await prisma.member.findUnique({
        where: { id: targetMemberId }
      })
    }

    // Generate payment reference
    const reference = paystack.generateReference()

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        memberId: targetMemberId,
        amount: parseFloat(amount),
        currency,
        description,
        reference,
        email,
        type,
        category,
        status: 'PENDING',
        gateway: 'paystack',
        metadata: metadata ? JSON.stringify(metadata) : null
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberCode: true,
            email: true
          }
        }
      }
    })

    // Initialize payment with Paystack
    const paystackResponse = await paystack.initializePayment({
      email,
      amount: parseFloat(amount),
      currency,
      reference,
      callback_url,
      metadata: {
        ...metadata,
        paymentId: payment.id,
        memberId: targetMemberId,
        type,
        category
      }
    })

    // Update payment with Paystack reference
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paystackReference: paystackResponse.data.reference
      }
    })

    return NextResponse.json({
      payment,
      paystack: paystackResponse.data,
      publicKey: paystack.getPublicKey()
    }, { status: 201 })

  } catch (error) {
    console.error('Error initializing payment:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to initialize payment',
      details: error instanceof Error ? error.stack : 'Unknown error occurred',
      success: false
    }, { status: 500 })
  }
}