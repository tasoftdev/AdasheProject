import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { paystack } from '@/lib/paystack'

// GET /api/payouts - Get payout requests with filters
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
    
    if (startDate || endDate) {
      where.requestDate = {}
      if (startDate) where.requestDate.gte = new Date(startDate)
      if (endDate) where.requestDate.lte = new Date(endDate)
    }

    const [payoutRequests, total] = await Promise.all([
      prisma.payoutRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestDate: 'desc' },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              memberCode: true,
              email: true
            }
          },
          approvals: {
            orderBy: { level: 'asc' }
          }
        }
      }),
      prisma.payoutRequest.count({ where })
    ])

    return NextResponse.json({
      payoutRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching payout requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payout requests' },
      { status: 500 }
    )
  }
}

// POST /api/payouts - Create payout request
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
      reason,
      accountName,
      accountNumber,
      bankCode,
      bankName,
      currency = 'NGN'
    } = body

    // Validation
    if (!amount || !description || !accountName || !accountNumber || !bankCode || !bankName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Find member
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

    if (!targetMemberId || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Check if user can create payout for this member
    if (session.user.role === 'MEMBER' && member.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only request payouts for yourself' },
        { status: 403 }
      )
    }

    // Generate reference
    const reference = `PAYOUT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Verify bank account with Paystack
    let accountVerification = null
    try {
      accountVerification = await paystack.resolveBankAccount(accountNumber, bankCode)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid bank account details' },
        { status: 400 }
      )
    }

    // Create transfer recipient with Paystack
    let recipientCode = null
    try {
      const recipientResponse = await paystack.createTransferRecipient({
        type: 'nuban',
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency,
        email: member.email
      })
      recipientCode = recipientResponse.data.recipient_code
    } catch (error) {
      console.error('Error creating transfer recipient:', error)
      // Continue without recipient code - can be created later
    }

    // Determine approval requirements
    const requiresApproval = parseFloat(amount) > 1000 // Amounts above ₦1,000 require approval
    const approvalLevel = parseFloat(amount) > 100000 ? 2 : 1 // Higher amounts need more approvals

    // Create payout request
    const payoutRequest = await prisma.payoutRequest.create({
      data: {
        memberId: targetMemberId,
        amount: parseFloat(amount),
        currency,
        description,
        reason,
        accountName,
        accountNumber,
        bankCode,
        bankName,
        recipientCode,
        reference,
        requestedBy: session.user.id,
        requiresApproval,
        approvalLevel,
        status: requiresApproval ? 'PENDING' : 'APPROVED'
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

    // Create approval records if required
    if (requiresApproval) {
      for (let level = 1; level <= approvalLevel; level++) {
        await prisma.payoutApproval.create({
          data: {
            payoutRequestId: payoutRequest.id,
            level,
            status: 'PENDING',
            approvedBy: ''
          }
        })
      }
    }

    return NextResponse.json(payoutRequest, { status: 201 })

  } catch (error) {
    console.error('Error creating payout request:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payout request' },
      { status: 500 }
    )
  }
}