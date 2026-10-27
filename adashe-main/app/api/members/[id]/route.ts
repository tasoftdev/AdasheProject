import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/members/[id] - Get specific member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { email: true, role: true, createdAt: true }
        },
        contributions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            type: true,
            status: true,
            createdAt: true
          }
        },
        loans: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            status: true,
            balance: true,
            createdAt: true
          }
        },
        savings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            accountNumber: true,
            accountType: true,
            balance: true,
            status: true
          }
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
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    )
  }
}

// PUT /api/members/[id] - Update member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const {
      firstName,
      lastName,
      phone,
      email,
      dateOfBirth,
      address,
      occupation,
      status
    } = data

    const member = await prisma.member.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        phone,
        email,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
        occupation,
        status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { email: true, role: true }
        }
      }
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

// DELETE /api/members/[id] - Delete member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.$transaction(async (tx: any) => {
      // Delete member (will cascade delete user due to onDelete: Cascade)
      await tx.member.delete({
        where: { id: params.id }
      })
    })

    return NextResponse.json({ message: 'Member deleted successfully' })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    )
  }
}