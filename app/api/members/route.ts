import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/members - Get all members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | null
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { memberCode: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { email: true, role: true }
          },
          _count: {
            select: {
              contributions: true,
              loans: true,
              savings: true,
              transactions: true
            }
          }
        }
      }),
      prisma.member.count({ where })
    ])

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

// POST /api/members - Create new member
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Received member data:', data)
    
    const {
      email,
      username,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      address,
      occupation
    } = data

    // Validate required fields
    if (!email || !username || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, username, password, firstName, lastName' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      )
    }

    // Check if member with email already exists
    const existingMember = await prisma.member.findUnique({
      where: { email: email }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'Member with this email already exists' },
        { status: 400 }
      )
    }

    console.log('Creating new member with email:', email, 'username:', username)

    // Generate unique member code
    const memberCount = await prisma.member.count()
    const memberCode = `ADS${String(memberCount + 1).padStart(4, '0')}`

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('Password hashed successfully for user:', username)

    // Create user and member in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create user account
      console.log('Creating user with:', { email, username, role: 'MEMBER' })
      const user = await tx.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role: 'MEMBER'
        }
      })
      console.log('User created with ID:', user.id)

      // Create member profile
      console.log('Creating member profile for user:', user.id)
      const member = await tx.member.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          phone,
          email,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address,
          occupation,
          memberCode,
          status: 'ACTIVE'
        },
        include: {
          user: {
            select: { email: true, role: true }
          }
        }
      })
      console.log('Member created with ID:', member.id, 'memberCode:', member.memberCode)

      return member
    })

    console.log('Transaction completed successfully for member:', result.memberCode)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    )
  }
}