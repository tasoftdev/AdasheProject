import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      username,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      address,
      occupation,
      role = 'MEMBER'
    } = body

    // Validation
    if (!email || !username || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      )
    }

    // Check if phone already exists
    const existingPhone = await prisma.member.findUnique({
      where: { phone }
    })

    if (existingPhone) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate unique member code
    const memberCount = await prisma.member.count()
    const memberCode = `ADS${String(memberCount + 1).padStart(4, '0')}`

    // Create user and member in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role
        }
      })

      // Create member profile
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
        }
      })

      return { user, member }
    })

    // Return user data without password
    const { password: _, ...userWithoutPassword } = result.user

    return NextResponse.json({
      user: userWithoutPassword,
      member: result.member,
      message: 'User registered successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}