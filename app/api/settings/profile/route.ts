import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import bcrypt from 'bcryptjs'

// GET /api/settings/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user with member data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        member: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            memberCode: true,
            occupation: true,
            joinDate: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profile = {
      id: user.id,
      firstName: user.member?.firstName || '',
      lastName: user.member?.lastName || '',
      email: user.email,
      phone: user.member?.phone || '',
      title: user.member?.occupation || 'Member',
      role: user.role.toLowerCase(),
      avatar: user.member?.avatar,
      joinDate: user.member?.joinDate || user.createdAt,
      memberCode: user.member?.memberCode || '',
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, phone, title } = body

    // Find user first
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, member: { select: { id: true } } }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update member profile if exists
    if (user.member) {
      await prisma.member.update({
        where: { id: user.member.id },
        data: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phone: phone || undefined,
          occupation: title || undefined,
        }
      })
    } else {
      // Create member profile if it doesn't exist
      await prisma.member.create({
        data: {
          userId: user.id,
          firstName: firstName || 'Unknown',
          lastName: lastName || 'User',
          phone: phone || '',
          email: session.user.email,
          occupation: title || 'Member',
          memberCode: `MBR-${Date.now()}` // Generate a simple member code
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// POST /api/settings/profile/password - Change password
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Find user with password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password (if user has password - OAuth users might not)
    if (user.password) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully' 
    })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}