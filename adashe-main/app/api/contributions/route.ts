import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const memberId = searchParams.get('memberId')

    const skip = (page - 1) * limit

    let where: any = {}

    // If user is a member, only show their contributions
    if (session.user.role === 'MEMBER') {
      const member = await prisma.member.findUnique({
        where: { userId: session.user.id }
      })
      if (member) {
        where.memberId = member.id
      }
    } else if (memberId) {
      where.memberId = memberId
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { member: { 
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { memberCode: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ]
    }

    if (status) {
      where.status = status
    }

    const [contributions, total] = await Promise.all([
      prisma.contribution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.contribution.count({ where })
    ])

    return NextResponse.json({
      contributions,
      stats: {
        total: contributions.reduce((sum, c) => sum + c.amount, 0),
        count: contributions.length
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching contributions:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch contributions',
      details: error instanceof Error ? error.message : 'Unknown error',
      contributions: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    }, { status: 500 })
  }
}

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
      type,
      method,
      description,
      dueDate
    } = body

    // Validation
    if (!memberId || !amount || !type || !method) {
      return NextResponse.json(
        { error: 'Missing required fields: memberId, amount, type, method' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Generate reference
    const reference = `CONT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create contribution
    const contribution = await prisma.contribution.create({
      data: {
        memberId,
        amount: parseFloat(amount),
        type,
        method,
        description: description || `${type} contribution`,
        reference,
        status: 'COMPLETED',
        paidDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null
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

    return NextResponse.json(contribution, { status: 201 })

  } catch (error) {
    console.error('Error creating contribution:', error)
    return NextResponse.json({ 
      error: 'Failed to create contribution',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}