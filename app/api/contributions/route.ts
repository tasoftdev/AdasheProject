import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/contributions - Get all contributions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const status = searchParams.get('status') as 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED' | null
    const type = searchParams.get('type') as 'MONTHLY' | 'SPECIAL' | 'EMERGENCY' | 'PENALTY' | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (memberId) where.memberId = memberId
    if (status) where.status = status
    if (type) where.type = type

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

    // Calculate summary stats
    const stats = await prisma.contribution.aggregate({
      where,
      _sum: { amount: true },
      _count: { id: true }
    })

    return NextResponse.json({
      contributions,
      stats: {
        total: stats._sum.amount || 0,
        count: stats._count.id || 0
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
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    )
  }
}

// POST /api/contributions - Create new contribution
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      memberId,
      amount,
      type,
      dueDate,
      method,
      description
    } = data

    // Generate unique reference
    const count = await prisma.contribution.count()
    const reference = `CON-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`

    const contribution = await prisma.contribution.create({
      data: {
        memberId,
        amount: parseFloat(amount),
        type,
        dueDate: dueDate ? new Date(dueDate) : null,
        method,
        reference,
        description,
        status: 'PENDING'
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

    return NextResponse.json(contribution, { status: 201 })
  } catch (error) {
    console.error('Error creating contribution:', error)
    return NextResponse.json(
      { error: 'Failed to create contribution' },
      { status: 500 }
    )
  }
}

// PUT /api/contributions - Bulk update contributions
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { contributionIds, status, paidDate } = data

    const updatedContributions = await prisma.contribution.updateMany({
      where: {
        id: { in: contributionIds }
      },
      data: {
        status,
        paidDate: paidDate ? new Date(paidDate) : null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: `Updated ${updatedContributions.count} contributions`,
      count: updatedContributions.count
    })
  } catch (error) {
    console.error('Error updating contributions:', error)
    return NextResponse.json(
      { error: 'Failed to update contributions' },
      { status: 500 }
    )
  }
}