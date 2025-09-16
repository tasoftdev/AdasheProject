import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/loans - Get all loans with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status && status !== 'ALL') {
      where.status = status
    }
    if (search) {
      where.member = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { memberCode: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              memberCode: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.loan.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      loans,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching loans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    )
  }
}

// POST /api/loans - Create a new loan application
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Received loan data:', data)
    
    // Validate required fields
    if (!data.memberId || !data.amount || !data.purpose) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify member exists
    const memberExists = await prisma.member.findUnique({
      where: { id: data.memberId },
      select: { id: true, firstName: true, lastName: true }
    })

    if (!memberExists) {
      console.error(`Member not found with ID: ${data.memberId}`)
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 400 }
      )
    }

    console.log('Member found:', memberExists)

    // Generate unique reference
    const reference = `LN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const loan = await prisma.loan.create({
      data: {
        memberId: data.memberId,
        amount: parseFloat(data.amount),
        interestRate: parseFloat(data.interestRate || '12'),
        term: parseInt(data.term || '12'),
        purpose: data.purpose,
        collateral: data.collateral || null,
        guarantor: data.guarantor || null,
        balance: parseFloat(data.amount), // Initial balance equals the loan amount
        status: 'PENDING'
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            memberCode: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json(loan, { status: 201 })
  } catch (error) {
    console.error('Error creating loan:', error)
    return NextResponse.json(
      { error: 'Failed to create loan' },
      { status: 500 }
    )
  }
}

// PUT /api/loans/[id] - Update loan status (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: 'Loan ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (data.status) {
      updateData.status = data.status
      
      if (data.status === 'APPROVED') {
        updateData.approvedDate = new Date()
        updateData.startDate = new Date()
        
        // Calculate end date based on term
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + parseInt(data.term || '12'))
        updateData.endDate = endDate

        // Calculate monthly payment (simple interest)
        const principal = parseFloat(data.amount)
        const rate = parseFloat(data.interestRate || '12') / 100 / 12
        const months = parseInt(data.term || '12')
        const monthlyPayment = principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
        updateData.monthlyPayment = monthlyPayment
      }
    }

    const loan = await prisma.loan.update({
      where: { id },
      data: updateData,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            memberCode: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json(loan)
  } catch (error) {
    console.error('Error updating loan:', error)
    return NextResponse.json(
      { error: 'Failed to update loan' },
      { status: 500 }
    )
  }
}